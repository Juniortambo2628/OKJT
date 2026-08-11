<?php

namespace App\Providers;

use App\Models\Client;
use App\Models\Insight;
use App\Models\Pillar;
use App\Models\Project;
use App\Models\Service;
use App\Models\SiteSetting;
use App\Models\Stat;
use App\Models\TeamMember;
use App\Models\Testimonial;
use App\Models\Value;
use App\Observers\CmsModelObserver;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        JsonResource::withoutWrapping();
        Schema::defaultStringLength(191);

        // Register CMS model observers for ISR cache revalidation
        $cmsModels = [
            Service::class,
            Insight::class,
            Project::class,
            Stat::class,
            SiteSetting::class,
            Testimonial::class,
            Client::class,
            TeamMember::class,
            Value::class,
            Pillar::class,
        ];

        foreach ($cmsModels as $model) {
            $model::observe(CmsModelObserver::class);
        }
    }
}
