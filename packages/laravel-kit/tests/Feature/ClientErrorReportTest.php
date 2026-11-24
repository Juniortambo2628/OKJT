<?php

namespace Okjt\Kit\Tests\Feature;

use Illuminate\Support\Facades\Log;
use Mockery;
use Okjt\Kit\Http\Controllers\ClientErrorController;
use Okjt\Kit\Tests\TestCase;

/**
 * Lifted from TFE (tests/Feature/ClientErrorReportTest.php): browser error
 * reports are stored stripped, never from the pages a project names, and
 * throttled.
 */
class ClientErrorReportTest extends TestCase
{
    protected function defineEnvironment($app): void
    {
        parent::defineEnvironment($app);
        $app['config']->set('okjt.client_errors.skip_paths', ['fan/bank-savings', 'sandbox-bank']);
    }

    protected function defineRoutes($router): void
    {
        $router->post('/client-errors', [ClientErrorController::class, 'store'])->middleware('throttle:30,1');
    }

    public function test_a_report_is_logged_with_paths_only(): void
    {
        $channel = Mockery::mock();
        $channel->shouldReceive('warning')->once()->withArgs(function ($message, $context) {
            return $message === 'x is undefined'
                && $context['page'] === '/fan/bookings/9'
                && $context['source'] === '/build/assets/app.js'
                && ! str_contains(json_encode($context), 'secret-token');
        });
        Log::shouldReceive('channel')->with('okjt_client')->andReturn($channel);

        $this->postJson('/client-errors', [
            'message' => 'x is undefined',
            'page' => 'https://tfe.test/fan/bookings/9?token=secret-token#pay',
            'source' => 'https://tfe.test/build/assets/app.js?v=secret-token',
            'kind' => 'error',
        ])->assertNoContent();
    }

    public function test_the_user_is_an_id_never_a_name_or_email(): void
    {
        $user = $this->person('dee@example.com');
        $channel = Mockery::mock();
        $channel->shouldReceive('warning')->once()->withArgs(fn ($m, $context) => $context['user_id'] === $user->id
            && ! str_contains(json_encode($context), 'dee@example.com'));
        Log::shouldReceive('channel')->andReturn($channel);

        $this->actingAs($user)->postJson('/client-errors', ['message' => 'boom'])->assertNoContent();
    }

    public function test_nothing_from_the_skipped_pages_is_kept(): void
    {
        Log::shouldReceive('channel')->never();

        $this->postJson('/client-errors', [
            'message' => 'boom',
            'page' => 'https://tfe.test/fan/bank-savings/3',
        ])->assertNoContent();
    }

    public function test_reports_are_throttled_per_client(): void
    {
        Log::shouldReceive('channel')->andReturn(Mockery::mock(['warning' => null]));

        for ($i = 0; $i < 30; $i++) {
            $this->post('/client-errors', ['message' => "e{$i}"], ['Accept' => 'application/json'])->assertNoContent();
        }

        $this->post('/client-errors', ['message' => 'one more'], ['Accept' => 'application/json'])->assertStatus(429);
    }

    public function test_the_kit_adds_a_seven_day_log_file_unless_the_project_has_one(): void
    {
        $this->assertSame('daily', config('logging.channels.okjt_client.driver'));
        $this->assertSame(7, config('logging.channels.okjt_client.days'));
        $this->assertStringEndsWith('client-errors.log', config('logging.channels.okjt_client.path'));
    }
}
