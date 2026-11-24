<?php

namespace Okjt\Kit\Tests\Feature;

use Illuminate\Support\Facades\Storage;
use Okjt\Kit\Console\AuditLog;
use Okjt\Kit\Content\PagePhotos;
use Okjt\Kit\Http\Controllers\MediaController;
use Okjt\Kit\Http\Controllers\PagePhotoController;
use Okjt\Kit\Http\Middleware\EnsureSuperadmin;
use Okjt\Kit\Media\MediaAsset;
use Okjt\Kit\Tests\Fixtures\Project;
use Okjt\Kit\Tests\TestCase;
use Okjt\Kit\Workspace\CurrentWorkspace;

/** Page photos (S6, step 3), lifted from Naoa's SitePhotosController. */
class PagePhotosTest extends TestCase
{
    protected function defineRoutes($router): void
    {
        $router->get('/api/page-photos', [PagePhotoController::class, 'index']);
        $router->middleware(EnsureSuperadmin::class)->group(function () use ($router) {
            $router->put('/api/admin/page-photos/{key}', [PagePhotoController::class, 'update']);
            $router->delete('/api/admin/page-photos/{key}', [PagePhotoController::class, 'reset']);
            $router->delete('/api/media/{id}', [MediaController::class, 'destroy']);
        });
    }

    private function admin()
    {
        $user = $this->person('admin@example.com');
        $user->forceFill(['is_superadmin' => true])->save();

        return $user;
    }

    private function asset(string $name = 'garden.webp'): MediaAsset
    {
        return MediaAsset::create(['path' => "assets/library/{$name}", 'url' => "/storage/assets/library/{$name}", 'name' => $name, 'mime' => 'image/webp', 'kind' => 'image', 'size' => 10]);
    }

    public function test_a_place_shows_built_in_photos_or_library_ones_in_order_and_the_pages_get_the_files(): void
    {
        $garden = $this->asset();
        $this->actingAs($this->admin());

        $this->putJson('/api/admin/page-photos/homeHero', ['images' => ['couple-2', "media-{$garden->id}"]])->assertOk()
            ->assertJsonPath('data.images', ['couple-2', "media-{$garden->id}"]);

        $this->getJson('/api/page-photos')->assertOk()
            ->assertHeader('Cache-Control', 'max-age=60, public')
            ->assertJsonPath('data.placements.homeHero', ['couple-2', "media-{$garden->id}"])
            ->assertJsonPath("data.media.media-{$garden->id}.url", '/storage/assets/library/garden.webp');
    }

    public function test_a_missing_library_picture_bad_refs_and_too_many_are_refused(): void
    {
        $this->actingAs($this->admin());
        $this->putJson('/api/admin/page-photos/homeHero', ['images' => ['media-999']])->assertUnprocessable()->assertJsonValidationErrors('images');
        $this->putJson('/api/admin/page-photos/homeHero', ['images' => ['../etc/passwd']])->assertUnprocessable();
        $this->putJson('/api/admin/page-photos/homeHero', ['images' => array_map(fn ($i) => "photo-{$i}", range(1, 9))])->assertUnprocessable();
        $this->putJson('/api/admin/page-photos/homeHero', ['images' => ['a', 'a']])->assertUnprocessable();
        $this->putJson('/api/admin/page-photos/bad%20key', ['images' => ['a']])->assertNotFound();
    }

    public function test_reset_puts_the_default_back_and_each_change_is_audited_with_before_and_after(): void
    {
        $this->actingAs($this->admin());
        $this->putJson('/api/admin/page-photos/homeHero', ['images' => ['couple-2']]);
        $this->putJson('/api/admin/page-photos/homeHero', ['images' => ['couple-3']]);
        $this->deleteJson('/api/admin/page-photos/homeHero')->assertOk()->assertJsonPath('data.images', null);

        $this->assertSame([], PagePhotos::placements());
        $logs = AuditLog::orderBy('id')->get();
        $this->assertSame(['page_photo.changed', 'page_photo.changed', 'page_photo.reset'], $logs->pluck('action')->all());
        $this->assertSame(['before' => ['couple-2'], 'after' => ['couple-3']], $logs[1]->details);
        $this->assertSame(['before' => ['couple-3']], $logs[2]->details);
    }

    public function test_a_library_file_a_place_still_shows_cannot_be_deleted(): void
    {
        Storage::fake('public');
        $garden = $this->asset();
        $this->actingAs($this->admin());
        $this->putJson('/api/admin/page-photos/homeHero', ['images' => ["media-{$garden->id}"]]);

        $this->deleteJson("/api/media/{$garden->id}")->assertUnprocessable()->assertJsonPath('message', 'This picture is still on the site: homeHero. Swap it out first.');
        $this->assertTrue(MediaAsset::whereKey($garden->id)->exists());

        $this->deleteJson('/api/admin/page-photos/homeHero');
        $this->deleteJson("/api/media/{$garden->id}")->assertOk();
    }

    public function test_others_cannot_change_pictures(): void
    {
        $this->actingAs($this->person('owner@example.com'));
        $this->putJson('/api/admin/page-photos/homeHero', ['images' => ['couple-2']])->assertForbidden();
    }

    public function test_each_workspace_chooses_its_own_when_asked(): void
    {
        config()->set('okjt.page_photos.per_workspace', true);
        $garden = Project::create(['name' => 'Garden', 'slug' => 'garden']);
        $shop = Project::create(['name' => 'Shop', 'slug' => 'shop']);

        CurrentWorkspace::run($garden, fn () => PagePhotos::set('homeHero', ['couple-2']));

        $this->assertSame(['homeHero' => ['couple-2']], CurrentWorkspace::run($garden, fn () => PagePhotos::placements()));
        $this->assertSame([], CurrentWorkspace::run($shop, fn () => PagePhotos::placements()));
    }
}
