<?php

namespace Okjt\Kit\Tests\Feature;

use InvalidArgumentException;
use Okjt\Kit\Console\AuditLog;
use Okjt\Kit\Content\PageCopy;
use Okjt\Kit\Http\Controllers\PageCopyController;
use Okjt\Kit\Http\Middleware\EnsureSuperadmin;
use Okjt\Kit\Tests\Fixtures\Project;
use Okjt\Kit\Tests\TestCase;
use Okjt\Kit\Workspace\CurrentWorkspace;

/** Page copy (S6, step 2), from TFE's LandingContent and Naoa's PageContent. */
class PageCopyTest extends TestCase
{
    protected function defineEnvironment($app): void
    {
        parent::defineEnvironment($app);
        $app['config']->set('okjt.page_copy.config', 'site_copy');
        $app['config']->set('site_copy', [
            'hero' => [
                'title' => 'Plan the trip',
                'subtitle' => 'Matches, stays and flights in one place.',
                'cta' => ['label' => 'Start planning', 'action' => 'planner'],
                'image' => '/img/hero.webp',
            ],
            'faq' => ['items' => [['q' => 'Is it free?', 'a' => 'Yes, to plan.']]],
        ]);
    }

    protected function defineRoutes($router): void
    {
        $router->get('/api/page-copy', [PageCopyController::class, 'publicIndex']);
        $router->middleware(EnsureSuperadmin::class)->group(function () use ($router) {
            $router->get('/api/admin/page-copy', [PageCopyController::class, 'index']);
            $router->put('/api/admin/page-copy/{section}', [PageCopyController::class, 'update']);
            $router->delete('/api/admin/page-copy/{section}', [PageCopyController::class, 'reset']);
        });
    }

    private function admin()
    {
        $user = $this->person('admin@example.com');
        $user->forceFill(['is_superadmin' => true])->save();

        return $user;
    }

    public function test_the_defaults_show_until_edited_and_an_edit_changes_only_its_text(): void
    {
        $this->assertSame('Plan the trip', PageCopy::section('hero')['title']);

        PageCopy::save('hero', ['title' => 'Your trip, sorted', 'cta.label' => 'Begin']);

        $hero = PageCopy::section('hero');
        $this->assertSame('Your trip, sorted', $hero['title']);
        $this->assertSame('Begin', $hero['cta']['label']);
        $this->assertSame('planner', $hero['cta']['action']);
        $this->assertSame('Matches, stays and flights in one place.', $hero['subtitle']);
    }

    public function test_wiring_can_never_be_edited(): void
    {
        $this->expectException(InvalidArgumentException::class);
        PageCopy::save('hero', ['cta.action' => 'https://evil.example']);
    }

    public function test_an_image_path_is_not_editable_text_either(): void
    {
        $paths = array_column(collect(PageCopy::editable())->firstWhere('key', 'hero')['fields'], 'path');
        $this->assertSame(['title', 'subtitle', 'cta.label'], $paths);
    }

    public function test_an_empty_edit_means_the_default_and_reset_clears_everything(): void
    {
        PageCopy::save('hero', ['title' => 'New', 'subtitle' => 'Also new']);
        PageCopy::save('hero', ['title' => '']);
        $this->assertSame('Plan the trip', PageCopy::section('hero')['title']);
        $this->assertSame('Also new', PageCopy::section('hero')['subtitle']);

        PageCopy::reset('hero');
        $this->assertSame('Matches, stays and flights in one place.', PageCopy::section('hero')['subtitle']);
    }

    public function test_a_hidden_section_is_left_out_of_the_pages(): void
    {
        PageCopy::save('faq', [], false);
        $this->assertArrayNotHasKey('faq', PageCopy::all());
        $this->assertFalse(collect(PageCopy::editable())->firstWhere('key', 'faq')['visible']);
    }

    public function test_lists_are_editable_item_by_item_with_readable_labels(): void
    {
        $faq = collect(PageCopy::editable())->firstWhere('key', 'faq');
        $this->assertSame([['items.0.q', 'Items › #1 › question'], ['items.0.a', 'Items › #1 › answer']], array_map(fn ($f) => [$f['path'], $f['label']], $faq['fields']));

        PageCopy::save('faq', ['items.0.a' => 'Yes, always.']);
        $this->assertSame('Yes, always.', PageCopy::section('faq')['items'][0]['a']);
    }

    public function test_each_workspace_has_its_own_copy_when_asked(): void
    {
        config()->set('okjt.page_copy.per_workspace', true);
        $garden = Project::create(['name' => 'Garden', 'slug' => 'garden']);
        $shop = Project::create(['name' => 'Shop', 'slug' => 'shop']);

        CurrentWorkspace::run($garden, fn () => PageCopy::save('hero', ['title' => 'Garden wedding']));

        $this->assertSame('Garden wedding', CurrentWorkspace::run($garden, fn () => PageCopy::section('hero')['title']));
        $this->assertSame('Plan the trip', CurrentWorkspace::run($shop, fn () => PageCopy::section('hero')['title']));
    }

    public function test_the_admin_api_saves_resets_and_audits_without_the_words(): void
    {
        $this->actingAs($this->admin());

        $this->getJson('/api/admin/page-copy')->assertOk()
            ->assertJsonPath('data.0.key', 'hero')
            ->assertJsonPath('data.0.fields.0.default', 'Plan the trip');

        $this->putJson('/api/admin/page-copy/hero', ['fields' => ['title' => 'Hello'], 'visible' => true])->assertOk()
            ->assertJsonPath('data.fields.0.value', 'Hello');
        $this->putJson('/api/admin/page-copy/hero', ['fields' => ['image' => '/x.png']])->assertUnprocessable();
        $this->putJson('/api/admin/page-copy/nope', ['fields' => []])->assertNotFound();

        $this->getJson('/api/page-copy')->assertOk()->assertJsonPath('data.hero.title', 'Hello');

        $this->deleteJson('/api/admin/page-copy/hero')->assertOk()->assertJsonPath('data.fields.0.value', null);

        $actions = AuditLog::orderBy('id')->pluck('action')->all();
        $this->assertSame(['page_copy.updated', 'page_copy.reset'], $actions);
        $this->assertSame(['fields' => ['title'], 'visible' => true], AuditLog::first()->details);
    }

    public function test_others_cannot_edit(): void
    {
        $this->actingAs($this->person('owner@example.com'));
        $this->putJson('/api/admin/page-copy/hero', ['fields' => ['title' => 'x']])->assertForbidden();
    }
}
