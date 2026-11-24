<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Screens of the real systems (2026-11-11).
 *
 * Project galleries held only logos (or nothing), so the case studies showed
 * a logo where the work should be. Screenshots of each live system, or of the
 * code run locally where a site is archived or offline, now ship with the app
 * under /assets/images/work/<project slug>/NN.webp.
 *
 * - Projects: the screenshots are added to the gallery after any pictures
 *   already uploaded there; empty entries are dropped. Projects not listed
 *   (or not found by slug) are left alone.
 * - Services, approach pillars and insights: given a screenshot of the work
 *   that shows them, only where they have no image yet.
 */
return new class extends Migration
{
    private const BASE = '/assets/images/work';

    public function up(): void
    {
        $now = now();

        if (Schema::hasTable('projects')) {
            foreach ($this->galleries() as $slug => $count) {
                $row = DB::table('projects')->where('slug', $slug)->first(['id', 'gallery']);
                if (! $row) {
                    continue;
                }
                $existing = array_values(array_filter((array) json_decode($row->gallery ?? '[]', true), fn ($v) => is_string($v) && trim($v) !== ''));
                $shots = array_map(fn ($n) => sprintf('%s/%s/%02d.webp', self::BASE, $slug, $n), range(1, $count));
                $gallery = array_values(array_unique([...$existing, ...$shots]));
                DB::table('projects')->where('id', $row->id)->update(['gallery' => json_encode($gallery), 'updated_at' => $now]);
            }
        }

        foreach (['services' => $this->services(), 'pillars' => $this->pillars(), 'insights' => $this->insights()] as $table => $images) {
            if (! Schema::hasTable($table)) {
                continue;
            }
            foreach ($images as $slug => $shot) {
                DB::table($table)->where('slug', $slug)
                    ->where(fn ($q) => $q->whereNull('image')->orWhere('image', ''))
                    ->update(['image' => self::BASE.'/'.$shot.'.webp', 'updated_at' => $now]);
            }
        }

        Cache::flush();
    }

    public function down(): void
    {
        // Pictures added to content are not removed.
    }

    /** Project slug => number of screenshots shipped for it. */
    private function galleries(): array
    {
        return [
            'lawyers-hub-digital-policy' => 5,
            'africa-law-tech-festival' => 3,
            'ai-policy-lab' => 5,
            'adpi-courses' => 3,
            'boda-boda-law' => 3,
            'digital-trade-hackathon' => 9, // 01-06 event photos, 07-09 the site
            'dickson-gongona-advocates' => 5,
            'tamcon-consulting-engineers' => 5,
            'south-ring-autos' => 5,
            'nyalife-womens-clinic' => 4,
            'nyalife-hms' => 6,
            'hucaa' => 4,
            'wisdom-capital' => 5,
            'reytati-communications' => 4,
            'okjtech-portfolio' => 5,
            'the-football-experience' => 5,
            'najenga' => 5,
            'naoa' => 6,
            'kuba-home-services' => 5,
            'nissi-insights' => 5,
            'gm-coaching' => 5,
            'tibu' => 4,
            'omnishop-omnispace3d' => 5,
        ];
    }

    /** Service slug => the screen that shows that kind of work. */
    private function services(): array
    {
        return [
            'custom-web-applications' => 'najenga/01',
            'ecommerce-platforms' => 'wisdom-capital/02',
            'admin-dashboards' => 'omnishop-omnispace3d/04',
            'api-development' => 'the-football-experience/02',
            'cms-development' => 'nissi-insights/03',
            'wireframing-prototyping' => 'tibu/02',
            'design-systems' => 'naoa/02',
            'ux-audits' => 'kuba-home-services/01',
            'technical-architecture' => 'ai-policy-lab/02',
            'performance-seo' => 'okjtech-portfolio/01',
            'digital-transformation' => 'nyalife-womens-clinic/01',
        ];
    }

    /** Approach pillar slug => screen. */
    private function pillars(): array
    {
        return [
            'design' => 'naoa/01',
            'style' => 'gm-coaching/01',
            'human-centered-ux' => 'najenga/04',
            'speed' => 'okjtech-portfolio/02',
            'deploy' => 'tibu/01',
            'scale' => 'kuba-home-services/02',
        ];
    }

    /** Insight slug => cover screen (the articles are in the next migration). */
    private function insights(): array
    {
        return [
            'ecosystem-mapping-before-you-write-a-line-of-code' => 'tibu/02',
            'two-years-inside-africas-legaltech-engine-room' => 'lawyers-hub-digital-policy/01',
            'solo-founder-stack-laravel-nextjs-ai-accelerated' => 'okjtech-portfolio/01',
            'building-nyalife-hms-first-instance-of-tibu' => 'tibu/01',
            'najengas-spatial-annotation-architecture' => 'najenga/01',
        ];
    }
};
