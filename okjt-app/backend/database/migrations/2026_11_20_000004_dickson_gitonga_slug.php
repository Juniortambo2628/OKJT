<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

/**
 * Dickson Gitonga Advocates' case study was at /projects/dickson-gongona-
 * advocates, a misspelling. It moves to /projects/dickson-gitonga-advocates;
 * SpaController sends the old address there with a 301, so links and
 * Google's index follow. Its screenshots keep their folder
 * (/assets/images/work/dickson-gongona-advocates/), which no visitor sees.
 */
return new class extends Migration
{
    public const OLD = 'dickson-gongona-advocates';

    public const NEW = 'dickson-gitonga-advocates';

    public function up(): void
    {
        if (DB::table('projects')->where('slug', self::NEW)->exists()) {
            return;
        }
        DB::table('projects')->where('slug', self::OLD)->update(['slug' => self::NEW, 'updated_at' => now()]);
        foreach (['projects_all', 'projects_client', 'projects_flagship', 'sitemap.xml'] as $key) {
            Cache::forget($key);
        }
    }

    public function down(): void
    {
        DB::table('projects')->where('slug', self::NEW)->update(['slug' => self::OLD]);
    }
};
