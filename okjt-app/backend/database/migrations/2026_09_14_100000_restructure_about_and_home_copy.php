<?php

use Illuminate\Database\Migrations\Migration;
use App\Models\SiteSetting;

/**
 * Content restructure that pairs with the front-end refactor on branch
 * claude/website-content-layout-fixes-n8tz96.
 *
 * - Introduces the About page "experience" section (title, subtitle, and a
 *   JSON list of capability categories) that replaces the "Lawyers Hub"
 *   contribution block.
 * - Introduces `bg_about_experience` as the background key for that section,
 *   falling forward from the old `bg_about_lawyers_hub` value when present.
 * - Refreshes the CTA banner copy so the redesigned two-card layout has
 *   sensible defaults.
 *
 * Values are applied with updateOrCreate so existing customisations from the
 * CMS are preserved wherever the key already carries a non-empty string.
 */
return new class extends Migration
{
    public function up(): void
    {
        $categoriesJson = json_encode([
            [
                'key' => 'digital-policy',
                'label' => 'Digital Policy',
                'items' => [
                    [
                        'title' => 'Lawyers Hub Digital Policy site',
                        'summary' => 'Cornerstone Kenya digital-policy resource — architecture, engineering, ongoing administration.',
                        'href' => '/projects',
                        'tag' => 'Platform',
                    ],
                    [
                        'title' => 'Africa Law Tech Festival platform',
                        'summary' => 'Online ticketing, live notifications, event mapping — annual festival, continental audience.',
                        'href' => '/projects',
                        'tag' => 'Event tech',
                    ],
                    [
                        'title' => 'ADPI training delivery',
                        'summary' => 'Delivered the Africa Data Protection Course and the CIPP/E certification programme.',
                        'href' => '/projects',
                        'tag' => 'Training',
                    ],
                ],
            ],
            [
                'key' => 'ui-ux',
                'label' => 'UI / UX',
                'items' => [
                    [
                        'title' => 'Najenga — construction coordination',
                        'summary' => 'Annotate architectural drawings, run project timelines, OCR PDFs, export to Excel, chat with @mentions.',
                        'href' => '/projects/najenga-construction-collaboration-platform',
                        'tag' => 'Product',
                    ],
                    [
                        'title' => 'Naoa — digital wedding platform',
                        'summary' => 'End-to-end experience: invitations, RSVPs, gifting, live guest updates.',
                        'href' => '/projects',
                        'tag' => 'Product',
                    ],
                    [
                        'title' => 'Tibu — HealthTech interface',
                        'summary' => 'Interface design for clinical workflows across desktop and mobile touchpoints.',
                        'href' => '/projects',
                        'tag' => 'Interface',
                    ],
                ],
            ],
            [
                'key' => 'engineering',
                'label' => 'Web Engineering',
                'items' => [
                    [
                        'title' => 'Laravel + Next.js flagship stack',
                        'summary' => 'Schema-first backends, typed APIs, App Router frontends — auth, admin, background jobs, deploys.',
                        'href' => '/services',
                        'tag' => 'Stack',
                    ],
                    [
                        'title' => 'Deployment & administration',
                        'summary' => 'cPanel + domain admin, CI to production, monitoring and ongoing maintenance.',
                        'href' => '/services',
                        'tag' => 'Ops',
                    ],
                ],
            ],
            [
                'key' => 'ecosystem',
                'label' => 'Ecosystem Strategy',
                'items' => [
                    [
                        'title' => 'Ecosystem mapping practice',
                        'summary' => 'Stakeholder mapping before scoping — client, user, regulator, partner, community — each with an aligned reason to participate.',
                        'href' => '/our-approach',
                        'tag' => 'Method',
                    ],
                    [
                        'title' => 'Boda-Boda Law Project',
                        'summary' => 'Co-organised field research in Kisumu and Namanga; contributed to the published report.',
                        'href' => '/projects',
                        'tag' => 'Research',
                    ],
                ],
            ],
        ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

        $upserts = [
            // About: experience section replaces the Lawyers Hub contribution block.
            [
                'key' => 'about_experience_title',
                'value' => 'Where the capability was built',
                'type' => 'text',
                'group' => 'about',
            ],
            [
                'key' => 'about_experience_subtitle',
                'value' => 'Selected work across the disciplines that shape every OKJTech engagement — each linked to the project it powers.',
                'type' => 'textarea',
                'group' => 'about',
            ],
            [
                'key' => 'about_experience_categories',
                'value' => $categoriesJson,
                'type' => 'textarea',
                'group' => 'about',
            ],

            // Home CTA — refresh defaults for the redesigned two-card layout.
            [
                'key' => 'cta_badge',
                'value' => 'GET IN TOUCH',
                'type' => 'text',
                'group' => 'homepage',
            ],
            [
                'key' => 'cta_title',
                'value' => "Let's build the next one together.",
                'type' => 'text',
                'group' => 'homepage',
            ],
            [
                'key' => 'cta_subtitle',
                'value' => "Bring the brief — we'll map the ecosystem, scope the build and give you a realistic path to production.",
                'type' => 'textarea',
                'group' => 'homepage',
            ],

            // Home approach band — reuse the same heading vocabulary as /our-approach.
            [
                'key' => 'vp_section_tagline',
                'value' => 'THE APPROACH',
                'type' => 'text',
                'group' => 'homepage',
            ],
        ];

        foreach ($upserts as $row) {
            $existing = SiteSetting::where('key', $row['key'])->first();
            if ($existing && !empty($existing->value)) {
                // Preserve any prior CMS customisation, only backfill type/group when missing.
                $existing->fill([
                    'type' => $existing->type ?: $row['type'],
                    'group' => $existing->group ?: $row['group'],
                ])->save();
                continue;
            }
            SiteSetting::updateOrCreate(
                ['key' => $row['key']],
                ['value' => $row['value'], 'type' => $row['type'], 'group' => $row['group']],
            );
        }

        // Roll the experience background forward from the legacy Lawyers Hub key
        // if the new key hasn't been set explicitly.
        $legacyBg = SiteSetting::where('key', 'bg_about_lawyers_hub')->first();
        if ($legacyBg && !empty($legacyBg->value)) {
            SiteSetting::updateOrCreate(
                ['key' => 'bg_about_experience'],
                [
                    'value' => $legacyBg->value,
                    'type' => 'image',
                    'group' => 'about',
                ],
            );
        }
    }

    public function down(): void
    {
        SiteSetting::whereIn('key', [
            'about_experience_title',
            'about_experience_subtitle',
            'about_experience_categories',
            'bg_about_experience',
        ])->delete();
        // CTA / vp_section fields are intentionally left in place on rollback —
        // their previous values may have been customised through the CMS.
    }
};
