<?php

namespace Okjt\Kit\Tests\Feature;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Okjt\Kit\Http\Controllers\MediaController;
use Okjt\Kit\Http\Middleware\EnsureSuperadmin;
use Okjt\Kit\Media\MediaAsset;
use Okjt\Kit\Media\MediaLibrary;
use Okjt\Kit\Tests\TestCase;

/** Lifted from TFE (tests/Feature/Admin/MediaLibraryTest.php), on the kit's JSON API (S5). */
class MediaLibraryTest extends TestCase
{
    protected function defineRoutes($router): void
    {
        $router->middleware(EnsureSuperadmin::class)->group(function () use ($router) {
            $router->get('/api/media', [MediaController::class, 'index']);
            $router->post('/api/media', [MediaController::class, 'store']);
            $router->delete('/api/media/{id}', [MediaController::class, 'destroy']);
        });
    }

    protected function setUp(): void
    {
        parent::setUp();
        Storage::fake('public');
    }

    private function admin()
    {
        $user = $this->person('admin@example.com');
        $user->forceFill(['is_superadmin' => true])->save();

        return $user;
    }

    public function test_others_cannot_see_or_change_the_library(): void
    {
        $this->actingAs($this->person('owner@example.com'));
        $this->getJson('/api/media')->assertForbidden();
        $this->postJson('/api/media', ['files' => [UploadedFile::fake()->image('a.jpg')]])->assertForbidden();
        $this->assertSame(0, MediaAsset::count());
    }

    public function test_an_uploaded_image_is_scaled_down_and_recorded(): void
    {
        // 4000×3000 is larger than max_edge (1920) on its long side.
        $this->actingAs($this->admin())
            ->post('/api/media', ['files' => [UploadedFile::fake()->image('huge.jpg', 4000, 3000)]], ['Accept' => 'application/json'])
            ->assertCreated()
            ->assertJsonPath('data.0.name', 'huge.jpg')
            ->assertJsonPath('data.0.kind', 'image')
            ->assertJsonPath('data.0.width', 1920)
            ->assertJsonPath('data.0.height', 1440);

        $asset = MediaAsset::sole();
        Storage::disk('public')->assertExists($asset->path);
        $this->assertStringStartsWith('assets/library/', $asset->path);
    }

    public function test_video_uploads_are_accepted_and_stored_as_they_are(): void
    {
        $this->actingAs($this->admin())
            ->post('/api/media', ['files' => [UploadedFile::fake()->create('clip.mp4', 200, 'video/mp4')]], ['Accept' => 'application/json'])
            ->assertCreated()
            ->assertJsonPath('message', 'Uploaded');

        $this->assertSame('video', MediaAsset::sole()->kind);
    }

    public function test_svg_is_rejected(): void
    {
        $this->actingAs($this->admin())
            ->postJson('/api/media', ['files' => [UploadedFile::fake()->create('x.svg', 5, 'image/svg+xml')]])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('files.0');

        $this->assertSame(0, MediaAsset::count());
    }

    public function test_the_list_filters_by_kind_and_gives_totals(): void
    {
        MediaAsset::create(['path' => 'assets/library/a.webp', 'url' => '/storage/assets/library/a.webp', 'name' => 'a.webp', 'mime' => 'image/webp', 'kind' => 'image', 'size' => 1234]);
        MediaAsset::create(['path' => 'assets/library/b.mp4', 'url' => '/storage/assets/library/b.mp4', 'name' => 'b.mp4', 'mime' => 'video/mp4', 'kind' => 'video', 'size' => 100]);

        $this->actingAs($this->admin())->getJson('/api/media?kind=image')->assertOk()
            ->assertJsonCount(1, 'data.assets')
            ->assertJsonPath('data.assets.0.name', 'a.webp')
            ->assertJsonPath('data.stats.total', 2)
            ->assertJsonPath('data.stats.videos', 1)
            ->assertJsonPath('data.stats.bytes', 1334);
    }

    public function test_deleting_removes_the_file_and_the_row(): void
    {
        $this->actingAs($this->admin())->post('/api/media', ['files' => [UploadedFile::fake()->image('del.png', 800, 600)]], ['Accept' => 'application/json']);
        $asset = MediaAsset::sole();

        $this->deleteJson("/api/media/{$asset->id}")->assertOk();

        $this->assertSame(0, MediaAsset::count());
        Storage::disk('public')->assertMissing($asset->path);
        $this->deleteJson('/api/media/999')->assertNotFound();
    }

    public function test_an_animated_gif_is_kept_as_it_is(): void
    {
        $gif = UploadedFile::fake()->createWithContent('spin.gif', base64_decode('R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw=='));
        $asset = app(MediaLibrary::class)->store($gif);

        $this->assertSame(base64_decode('R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw=='), Storage::disk('public')->get($asset->path));
    }

    public function test_an_image_that_cannot_be_read_is_stored_as_uploaded(): void
    {
        $broken = UploadedFile::fake()->createWithContent('broken.jpg', 'not really a jpeg');
        $asset = app(MediaLibrary::class)->store($broken);

        $this->assertSame('not really a jpeg', Storage::disk('public')->get($asset->path));
        $this->assertNull($asset->width);
    }

    public function test_the_table_name_and_limits_come_from_config(): void
    {
        $this->assertSame('media_assets', (new MediaAsset)->getTable());
        config()->set('okjt.media.max_edge', 500);
        $asset = app(MediaLibrary::class)->store(UploadedFile::fake()->image('wide.png', 1000, 400));
        $this->assertSame(500, $asset->width);
        $this->assertSame(200, $asset->height);
    }
}
