<?php

namespace Okjt\Kit\Tests;

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Okjt\Kit\KitServiceProvider;
use Okjt\Kit\Tests\Fixtures\Project;
use Okjt\Kit\Tests\Fixtures\User;
use Okjt\Kit\Workspace\CurrentWorkspace;
use Orchestra\Testbench\TestCase as Orchestra;

abstract class TestCase extends Orchestra
{
    protected function getPackageProviders($app): array
    {
        return [KitServiceProvider::class];
    }

    protected function defineEnvironment($app): void
    {
        $app['config']->set('database.default', 'testing');
        $app['config']->set('okjt.user_model', User::class);
        $app['config']->set('okjt.workspace.model', Project::class);
        // Tests sign in with actingAs() on the default guard; apps use Sanctum.
        $app['config']->set('auth.guards.sanctum', ['driver' => 'session', 'provider' => 'users']);
        $app['config']->set('auth.defaults.guard', 'sanctum');
        $app['config']->set('auth.providers.users.model', User::class);
    }

    protected function defineDatabaseMigrations(): void
    {
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('email')->unique();
            $table->string('password')->default('');
            $table->string('role')->nullable();
            $table->rememberToken();
            $table->timestamps();
        });
        Schema::create('projects', function (Blueprint $table) {
            $table->id();
            $table->string('slug')->unique();
            $table->string('status')->default('active');
            $table->boolean('published')->default(true);
            $table->timestamps();
        });
        Schema::create('notes', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('project_id')->nullable();
            $table->string('title');
            $table->text('body')->nullable();
            $table->timestamps();
        });
        $this->loadMigrationsFrom(__DIR__.'/../database/migrations');
    }

    protected function tearDown(): void
    {
        CurrentWorkspace::set(null);
        parent::tearDown();
    }

    protected function person(string $email, ?Project $project = null, ?string $role = null): User
    {
        $user = User::create(['name' => ucfirst(strtok($email, '@')), 'email' => $email]);
        if ($project && $role) {
            $user->setRoleIn($project, $role);
        }

        return $user;
    }
}
