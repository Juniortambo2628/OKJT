<?php

namespace Okjt\Kit\Tests\Feature;

use Okjt\Kit\Content\Faq;
use Okjt\Kit\Http\Controllers\FaqController;
use Okjt\Kit\Http\Middleware\EnsureSuperadmin;
use Okjt\Kit\Revisions\Revision;
use Okjt\Kit\Tests\Fixtures\Project;
use Okjt\Kit\Tests\TestCase;
use Okjt\Kit\Workspace\CurrentWorkspace;

/** FAQs (S6, step 4), lifted from Naoa's FaqTest. */
class FaqTest extends TestCase
{
    protected function defineRoutes($router): void
    {
        $router->get('/api/faqs', [FaqController::class, 'index']);
        $router->middleware(EnsureSuperadmin::class)->group(function () use ($router) {
            $router->post('/api/faqs', [FaqController::class, 'store']);
            $router->put('/api/faqs/reorder', [FaqController::class, 'reorder']);
            $router->put('/api/faqs/{id}', [FaqController::class, 'update']);
            $router->delete('/api/faqs/{id}', [FaqController::class, 'destroy']);
        });
    }

    private function admin()
    {
        $user = $this->person('admin@example.com');
        $user->forceFill(['is_superadmin' => true])->save();

        return $user;
    }

    public function test_the_public_list_is_in_order_and_narrows_to_a_group(): void
    {
        Faq::create(['question' => 'Third', 'answer' => 'c', 'order' => 3]);
        Faq::create(['question' => 'First', 'answer' => 'a', 'order' => 1]);
        Faq::create(['question' => 'Pricing one', 'answer' => 'p', 'order' => 1, 'group' => 'pricing']);

        $this->getJson('/api/faqs')->assertOk()->assertJsonPath('data.0.question', 'First')->assertJsonCount(3, 'data');
        $this->getJson('/api/faqs?group=pricing')->assertOk()->assertJsonCount(1, 'data')->assertJsonPath('data.0.question', 'Pricing one');
    }

    public function test_admins_add_edit_and_delete_and_a_new_question_goes_last_in_its_group(): void
    {
        $this->actingAs($this->admin());
        Faq::create(['question' => 'Existing', 'answer' => 'a', 'order' => 4, 'group' => 'home']);

        $id = $this->postJson('/api/faqs', ['question' => 'What is the dress code?', 'answer' => 'Semi-formal.', 'group' => 'home'])
            ->assertCreated()->assertJsonPath('data.order', 5)->json('data.id');
        $this->postJson('/api/faqs', ['question' => 'Other page', 'answer' => 'x', 'group' => 'pricing'])->assertJsonPath('data.order', 1);

        $this->putJson("/api/faqs/{$id}", ['question' => 'Dress code?', 'answer' => 'Smart casual.', 'group' => 'home'])->assertOk()
            ->assertJsonPath('data.answer', 'Smart casual.');
        $this->deleteJson("/api/faqs/{$id}")->assertOk();
        $this->assertNull(Faq::find($id));

        $this->postJson('/api/faqs', ['question' => '', 'answer' => 'x'])->assertUnprocessable();
        $this->postJson('/api/faqs', ['question' => 'q', 'answer' => 'a', 'group' => 'has space'])->assertUnprocessable();
    }

    public function test_reorder_sets_the_order_first_to_last(): void
    {
        $this->actingAs($this->admin());
        $a = Faq::create(['question' => 'A', 'answer' => 'a', 'order' => 1]);
        $b = Faq::create(['question' => 'B', 'answer' => 'b', 'order' => 2]);
        $c = Faq::create(['question' => 'C', 'answer' => 'c', 'order' => 3]);

        $this->putJson('/api/faqs/reorder', ['ids' => [$c->id, $a->id, $b->id]])->assertOk();

        $this->getJson('/api/faqs')->assertJsonPath('data.0.question', 'C')->assertJsonPath('data.2.question', 'B');
        $this->putJson('/api/faqs/reorder', ['ids' => [$a->id, 999]])->assertStatus(422);
    }

    public function test_changes_are_in_the_version_history(): void
    {
        $this->actingAs($this->admin());
        $id = $this->postJson('/api/faqs', ['question' => 'Parking?', 'answer' => 'Yes.'])->json('data.id');
        $this->putJson("/api/faqs/{$id}", ['question' => 'Parking?', 'answer' => 'Yes, free.']);

        $revisions = Revision::where('module', 'faqs')->orderBy('id')->get();
        $this->assertSame(['created', 'updated'], $revisions->pluck('action')->all());
        $this->assertSame('Parking?', $revisions[0]->subject_label);
    }

    public function test_others_cannot_change_the_list(): void
    {
        $this->actingAs($this->person('owner@example.com'));
        $this->postJson('/api/faqs', ['question' => 'q', 'answer' => 'a'])->assertForbidden();
    }

    public function test_each_workspace_has_its_own_list_and_cannot_touch_another_ones(): void
    {
        config()->set('okjt.faqs.per_workspace', true);
        $garden = Project::create(['name' => 'Garden', 'slug' => 'garden']);
        $shop = Project::create(['name' => 'Shop', 'slug' => 'shop']);
        $gardenFaq = CurrentWorkspace::run($garden, fn () => Faq::create(['question' => 'Garden?', 'answer' => 'yes', 'order' => 1]));
        CurrentWorkspace::run($shop, fn () => Faq::create(['question' => 'Shop?', 'answer' => 'yes', 'order' => 1]));

        $this->assertSame(['Garden?'], CurrentWorkspace::run($garden, fn () => Faq::pluck('question')->all()));
        $this->assertNull(CurrentWorkspace::run($shop, fn () => Faq::find($gardenFaq->id)));
    }
}
