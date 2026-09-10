<?php

namespace Database\Seeders;

use App\Models\Client;
use App\Models\Insight;
use App\Models\Project;
use App\Models\SiteSetting;
use App\Models\Stat;
use App\Models\TeamMember;
use App\Models\Testimonial;
use App\Models\User;
use App\Models\Value;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

/**
 * AccurateContentSeeder
 *
 * Replaces the AI-generated placeholder content that shipped with the initial
 * seed pass with facts drawn from documentation/PROJECT_CATALOG_ACCURATE.md.
 *
 * Rules (see the catalog document for the full framing):
 * - OKJTechnologies is a one-person studio. Kevin Tambo is the only team member.
 * - No fabricated stats, testimonials, or feature claims. Live URLs and stacks
 *   are drawn from the real repos and confirmed by the user.
 * - Idempotent: safe to run more than once (site_settings and clients use
 *   updateOrCreate; everything else is fully rewritten each run).
 *
 * Run: `php artisan db:seed --class=AccurateContentSeeder`
 */
class AccurateContentSeeder extends Seeder
{
    public function run(): void
    {
        DB::transaction(function () {
            $this->reseedSiteSettings();
            $this->reseedStats();
            $this->reseedValues();
            $this->reseedTeam();
            $this->clearTestimonials();
            $this->reseedClients();
            $this->reseedProjects();
            $this->reseedInsights();
        });

        Log::info('AccurateContentSeeder: reseed complete.');
    }

    // ------------------------------------------------------------------
    // Site settings — About page copy, ecosystem-mapping framing
    // ------------------------------------------------------------------

    private function reseedSiteSettings(): void
    {
        $settings = [
            // --- About page ---------------------------------------------------
            [
                'key' => 'about_title',
                'value' => "Design-led web engineering,\nbuilt around ecosystems.",
                'type' => 'textarea',
                'group' => 'about',
            ],
            [
                'key' => 'about_tagline',
                'value' => 'The OKJTechnologies Story',
                'type' => 'text',
                'group' => 'about',
            ],
            [
                'key' => 'about_story',
                'value' => 'OKJTechnologies is a one-person studio out of Nairobi, run by Kevin Tambo. I build full-stack web applications end to end — concept, UI, engineering, deployment and ongoing administration — mostly in Laravel, Next.js / React and the classic LAMP stack, with AI-accelerated tooling in the loop. Before I write code I map the ecosystem the software has to live in, so every stakeholder — client, end user, regulator, adjacent partner — has an aligned reason to participate.',
                'type' => 'textarea',
                'group' => 'about',
            ],
            [
                'key' => 'about_mission_title',
                'value' => 'Ecosystem mapping before a line of code.',
                'type' => 'text',
                'group' => 'about',
            ],
            [
                'key' => 'about_mission_text1',
                'value' => 'The way I approach every engagement is shaped by an ecosystem-mapping practice I picked up on the Afrilabs capacity-building programme <em>Leveraging Stakeholder Relationships through Ecosystem Mapping and Building</em> (Addis Ababa, Ethiopia), which I attended and earned a certificate for while working with the Lawyers Hub. Before scoping, I map out every stakeholder who could be affected by or beneficial to the proposition — the paying client, the end user, the regulator, adjacent service providers, upstream and downstream data holders, the wider community.',
                'type' => 'textarea',
                'group' => 'about',
            ],
            [
                'key' => 'about_mission_text2',
                'value' => "I then design the solution so each of those stakeholders has a clearly aligned way to benefit from it. That mapping is what turns a website into a working system inside its own context. Combined with AI-accelerated development, it's how a one-person studio ships the same class of application a small team would take on.",
                'type' => 'textarea',
                'group' => 'about',
            ],
            [
                'key' => 'about_team_title',
                'value' => 'One founder. One practitioner. All the accountability.',
                'type' => 'text',
                'group' => 'about',
            ],
            [
                'key' => 'about_team_subtitle',
                'value' => 'OKJTechnologies is deliberately a one-person studio. Every project is designed, built, deployed and administered by the same person — no hand-offs, no dropped context, one point of accountability from concept to production.',
                'type' => 'textarea',
                'group' => 'about',
            ],
            [
                'key' => 'about_cta_title',
                'value' => 'Have a system you want built end to end?',
                'type' => 'text',
                'group' => 'about',
            ],
            [
                'key' => 'about_cta_subtitle',
                'value' => "Whether it's a customer-facing application, an internal dashboard, or a national-scale concept still at problem-statement stage, I'd like to hear about it. Start with a short brief and we'll map the ecosystem together.",
                'type' => 'textarea',
                'group' => 'about',
            ],

            // --- Homepage hero — remove the "we"/plural framing ---------------
            [
                'key' => 'hero_tagline',
                'value' => 'Design-led web engineering from Nairobi',
                'type' => 'text',
                'group' => 'homepage',
            ],
            [
                'key' => 'hero_subtitle',
                'value' => 'I design and build bespoke, high-performance web applications, robust APIs and clean admin systems — solo, end to end, in Laravel, Next.js and React.',
                'type' => 'textarea',
                'group' => 'homepage',
            ],
            [
                'key' => 'vp_section_subtitle',
                'value' => 'Architectural discipline and aesthetic mastery, delivered as one system by one person.',
                'type' => 'textarea',
                'group' => 'homepage',
            ],
        ];

        foreach ($settings as $row) {
            SiteSetting::updateOrCreate(
                ['key' => $row['key']],
                ['value' => $row['value'], 'type' => $row['type'], 'group' => $row['group']],
            );
        }
    }

    // ------------------------------------------------------------------
    // Stats — replace the fabricated four with honest, defensible ones
    // ------------------------------------------------------------------

    private function reseedStats(): void
    {
        Stat::query()->forceDelete();

        $stats = [
            [
                'label' => 'Building for the web',
                'value' => 'Since 2021',
                'description' => 'Full-time web application development from Nairobi.',
                'icon' => 'Calendar',
                'order' => 1,
            ],
            [
                'label' => 'Studio + client projects',
                'value' => '20+',
                'description' => 'Shipped across LegalTech, HealthTech, PropTech, FinTech, e-commerce, events and NGO work.',
                'icon' => 'Layers',
                'order' => 2,
            ],
            [
                'label' => 'Primary stack',
                'value' => 'Laravel · Next.js · React',
                'description' => 'Plus LAMP for classic client work, and AI-accelerated tooling in the loop.',
                'icon' => 'Code2',
                'order' => 3,
            ],
            [
                'label' => 'Studio headcount',
                'value' => 'One founder',
                'description' => 'A deliberate one-person studio. Same person from concept to production.',
                'icon' => 'User',
                'order' => 4,
            ],
        ];

        foreach ($stats as $row) {
            Stat::create($row);
        }
    }

    // ------------------------------------------------------------------
    // Values — add "Ecosystem mapping" and drop team-plural language
    // ------------------------------------------------------------------

    private function reseedValues(): void
    {
        Value::query()->forceDelete();

        $values = [
            [
                'icon' => 'Network',
                'title' => 'Ecosystem mapping first',
                'description' => 'Before I write code I map every stakeholder — client, end user, regulator, partner, community — and design the solution so each has an aligned way to benefit. This is the Afrilabs stakeholder-mapping approach applied to software.',
                'order' => 1,
            ],
            [
                'icon' => 'User',
                'title' => 'Solo accountability',
                'description' => 'One person owns the work end to end — concept, UI, engineering, deployment, ongoing administration. No hand-offs, no dropped context, one point of contact.',
                'order' => 2,
            ],
            [
                'icon' => 'Zap',
                'title' => 'AI-accelerated delivery',
                'description' => 'Emerging AI tooling in the loop lets a one-person studio ship the same class of application a small team would take on, without cutting corners on architecture or design.',
                'order' => 3,
            ],
            [
                'icon' => 'Palette',
                'title' => 'Design and function together',
                'description' => 'Aesthetic clarity that supports the goal, not decoration. Every element earns its place.',
                'order' => 4,
            ],
            [
                'icon' => 'Shield',
                'title' => 'Honest about scope',
                'description' => "Every project is described by what has actually shipped — never by roadmap features or invented metrics. If it's a concept, it's labelled a concept.",
                'order' => 5,
            ],
            [
                'icon' => 'TrendingUp',
                'title' => 'Built to be handed over',
                'description' => 'Cleanly documented, deployed on infrastructure the client can operate, with admin surfaces that non-technical owners can drive themselves.',
                'order' => 6,
            ],
        ];

        foreach ($values as $row) {
            Value::create($row);
        }
    }

    // ------------------------------------------------------------------
    // Team — Kevin only. Delete the two fabricated members.
    // ------------------------------------------------------------------

    private function reseedTeam(): void
    {
        // Remove every existing team member (including soft-deleted fake ones
        // "Eluid Kibet" and "Brenda Wanjiku") to make the reseed idempotent.
        TeamMember::query()->forceDelete();

        TeamMember::create([
            'name' => 'Kevin Tambo',
            'role' => 'Founder · Web Application Developer',
            'bio' => "Founder of OKJTechnologies. I design, build, deploy and administer full-stack web applications for clients across LegalTech, HealthTech, PropTech, FinTech, e-commerce, events and non-profit sectors, working solo in Laravel, Next.js / React and the classic LAMP stack.\n\nMy approach is shaped by an ecosystem-mapping practice I picked up on the Afrilabs capacity-building programme in Addis Ababa: before writing code I map every stakeholder the software touches — client, end user, regulator, partner, community — and design the system so each has an aligned reason to participate.\n\nBefore OKJTechnologies I was Software Developer, Justice Innovation at the Lawyers Hub, where I spearheaded the Digital Policy site, designed the Africa Law Tech Festival and AI Policy Lab platforms, chaired a hackathon at ALTF 2023, and supported delivery of the Africa Digital Policy Institute's data-protection trainings (Africa Data Protection Course and CIPP/E).",
            'linkedin' => 'https://www.linkedin.com/in/kevin-tambo',
            'image' => 'https://api.okjtech.co.ke/api/storage/uploads/kt-img-okjt-2_6a551f2fe55bc.webp',
            'order' => 1,
        ]);
    }

    // ------------------------------------------------------------------
    // Testimonials — clear all. Every current row is fabricated.
    // Real testimonials should only ever be inserted with the client's
    // consent, in their own words, ideally with a link to them.
    // ------------------------------------------------------------------

    private function clearTestimonials(): void
    {
        Testimonial::query()->forceDelete();
    }

    // ------------------------------------------------------------------
    // Clients — trimmed to real, delivered clients (upsert by name).
    // ------------------------------------------------------------------

    private function reseedClients(): void
    {
        $clients = [
            ['name' => 'Lawyers Hub',                                  'website' => 'https://www.lawyershub.org',       'order' => 1],
            ['name' => "Nyalife Women's Clinic",                       'website' => 'https://nyalifewomensclinic.net',  'order' => 2],
            ['name' => 'South Ring Autos',                             'website' => 'https://southringautos.com',       'order' => 3],
            ['name' => 'Dickson, Gitonga Advocates LLP',               'website' => 'https://dglegal.co.ke',            'order' => 4],
            ['name' => 'Global Harmony Initiative',                    'website' => 'https://globalharmonyinitiative.com', 'order' => 5],
            ['name' => 'Wisdom Capital',                               'website' => 'https://wisdomcapital.co.ke',      'order' => 6],
            ['name' => 'Reytati Communications',                       'website' => 'http://reytaticomms.com',          'order' => 7],
            ['name' => 'TAMCON Consulting Engineers',                  'website' => 'https://tamconsonsult.com',        'order' => 8],
            ['name' => 'Mizizi Sugarcane Juice',                       'website' => 'https://mizizi.okjtech.co.ke',     'order' => 9],
            ['name' => 'Tena',                                         'website' => 'https://tena.host',                'order' => 10],
            ['name' => 'OmniSpace 3D Events',                          'website' => 'https://omnispace3d.com',          'order' => 11],
            ['name' => 'Terik Tours',                                  'website' => 'https://tfe.okjtech.co.ke',        'order' => 12],
            ['name' => 'Hekima University College Alumni Association', 'website' => 'https://alumni.hekima.ac.ke',      'order' => 13],
            ['name' => 'Najenga',                                      'website' => 'https://najenga.okjtech.co.ke',    'order' => 14],
            ['name' => 'Nissi Insights',                               'website' => 'https://nissi-insights.com',       'order' => 15],
            ['name' => 'Silversky',                                    'website' => 'https://shop.silversky.co.ke',     'order' => 16],
            ['name' => 'GM Coaching',                                  'website' => 'https://gm-coaching.com',          'order' => 17],
        ];

        foreach ($clients as $row) {
            Client::updateOrCreate(
                ['name' => $row['name']],
                [
                    'website' => $row['website'],
                    'category' => null,
                    'is_active' => true,
                    'order' => $row['order'],
                ],
            );
        }
    }

    // ------------------------------------------------------------------
    // Projects — full reseed from the accurate catalog.
    // ------------------------------------------------------------------

    private function reseedProjects(): void
    {
        Project::query()->forceDelete();

        foreach ($this->projectRows() as $order => $row) {
            Project::create(array_merge($row, [
                'slug' => Str::slug($row['title']),
                'order' => $order,
                'is_active' => true,
                'is_featured' => $row['is_featured'] ?? false,
                'significant_figure' => null, // No fabricated hero metrics.
                'testimonial_quote' => null,
                'testimonial_author' => null,
                'gallery' => null,
                'bg_image' => $row['bg_image'] ?? null,
            ]));
        }
    }

    private function projectRows(): array
    {
        return [
            // ---- Lawyers Hub era (employer projects) --------------------
            [
                'type' => 'client',
                'title' => 'Lawyers Hub Digital Policy Website',
                'client_name' => 'Lawyers Tech Hub',
                'tagline' => 'Kenya\'s flagship LegalTech knowledge hub.',
                'category' => 'LegalTech',
                'technologies' => ['PHP', 'MySQL', 'LAMP', 'CMS'],
                'description' => 'I spearheaded development of the Lawyers Hub Digital Policy website — the cornerstone LegalTech resource for Kenya\'s AI-policy, digital-trade and Africa digital-economy conversation. Built and maintained during my tenure as Software Developer, Justice Innovation at Lawyers Tech Hub.',
                'problem' => 'Kenya\'s digital-policy community needed a single institutional home for policy briefs, festival programming, capacity-building resources, and daily bulletins covering LegalTech developments across the continent.',
                'methodology' => 'Built on a LAMP stack with a WordPress-style CMS layer so the Hub\'s editorial team could publish daily bulletins, policy maps, festival material and reports directly.',
                'outcome' => 'The site is the primary distribution channel for the Lawyers Hub\'s daily bulletins, policy maps, festival programming and downloadable reports (including the Boda-Boda Law report I co-authored).',
                'image' => null,
                'url' => 'https://www.lawyershub.org',
                'is_featured' => true,
            ],
            [
                'type' => 'client',
                'title' => 'Africa Law Tech Festival — Event Platform',
                'client_name' => 'Lawyers Tech Hub',
                'tagline' => 'Ticketing, live notifications, and event mapping for the annual festival.',
                'category' => 'LegalTech · Events',
                'technologies' => ['PHP', 'MySQL', 'LAMP'],
                'description' => 'I designed the Africa Law Tech Festival platform — the site that runs online ticketing, live notifications and event mapping for the annual festival, which has hosted more than 11,000 attendees across editions per lawyershub.org.',
                'problem' => 'The festival needed a single web platform to run ticketing, session mapping and attendee notifications reliably across successive annual editions.',
                'methodology' => 'LAMP application designed to be re-themed and re-programmed each year without rebuilding the underlying ticketing and mapping engine.',
                'outcome' => 'The same platform has powered the 2022, 2023, 2024 and 2025 festival editions.',
                'image' => null,
                'url' => 'https://www.africalawtech.com',
                'is_featured' => true,
            ],
            [
                'type' => 'client',
                'title' => 'AI Policy Lab',
                'client_name' => 'Lawyers Tech Hub / Africa Digital Policy Institute',
                'tagline' => 'Virtual learning facility for AI-policy capacity building across Europe and Africa.',
                'category' => 'LegalTech · EdTech',
                'technologies' => ['UI/UX'],
                'description' => 'I contributed to UI/UX design for the AI Policy Lab — a virtual learning facility for AI-policy capacity building across Europe and Africa, introduced at the 2024 festival edition (Artificial Intelligence and the Year of Education, Aug 26–27 2024).',
                'problem' => 'AI-policy training for legal professionals had no dedicated online home that worked across European and African cohorts.',
                'methodology' => 'UI/UX design work in close collaboration with the Hub\'s policy team.',
                'outcome' => 'Live at aipolicy.africa, hosting the Institute\'s AI-policy programming.',
                'image' => null,
                'url' => 'https://www.aipolicy.africa/',
                'is_featured' => false,
            ],
            [
                'type' => 'client',
                'title' => 'Africa Digital Policy Institute — Course Platform',
                'client_name' => 'Lawyers Tech Hub / ADPI',
                'tagline' => 'Course home for the Africa Digital Policy Institute (originally Africa Law Tech University).',
                'category' => 'LegalTech · EdTech',
                'technologies' => ['LAMP'],
                'description' => 'I designed what began as the Africa Law Tech University platform. The direction was folded into the Africa Digital Policy Institute course platform, which centralises the Institute\'s capacity-building programmes — including the Africa Data Protection Course and CIPP/E training I helped support.',
                'problem' => 'ADPI\'s trainings needed a single course home for the Data Protection Course, CIPP/E, and related programmes.',
                'methodology' => 'Course catalog + registration site within the Lawyers Hub property.',
                'outcome' => 'Live at lawyershub.org/adpi-courses, running the Institute\'s course catalogue.',
                'image' => null,
                'url' => 'https://www.lawyershub.org/adpi-courses',
                'is_featured' => false,
            ],
            [
                'type' => 'client',
                'title' => 'Digital Trade Hackathon Site',
                'client_name' => 'Lawyers Tech Hub · ALTF 2023',
                'tagline' => 'Landing site for the AfCFTA-focused hackathon I chaired.',
                'category' => 'LegalTech · Events',
                'technologies' => ['HTML', 'CSS', 'JavaScript', 'Bootstrap', 'jQuery'],
                'description' => 'I shipped the landing site for the Digital Trade tech-policy hackathon at ALTF 2023 (I also chaired the hackathon on the justice-innovation team). Built on a Bootstrap template with an interactive Africa map to surface participating countries. Event brief: Digital Trade in Africa: The AfCFTA and the Single Digital Market, Nairobi, Jul 12–13 2023.',
                'problem' => 'The hackathon needed a public site to announce the brief, surface participating countries and route registrations.',
                'methodology' => 'Static site on a themed Bootstrap base with the CSS Africa Map plugin for the interactive continental view.',
                'outcome' => 'Delivered — event ran with 11 shortlisted innovations. Site now archived; hackathon coverage lives on the Lawyers Hub festival page.',
                'image' => null,
                'url' => null, // archived
                'is_featured' => false,
            ],
            [
                'type' => 'client',
                'title' => 'Boda-Boda Law Project — Website & Report',
                'client_name' => 'Lawyers Tech Hub',
                'tagline' => 'Legal advisory and education platform for boda-boda operators and cross-border traders.',
                'category' => 'LegalTech · Advocacy',
                'technologies' => ['HTML', 'CSS', 'JavaScript', 'Bootstrap', 'Typeform'],
                'description' => 'I contributed to the Boda-Boda Law Project — a legal advisory initiative for boda-boda operators and cross-border traders. I co-organised the field data collection in Kisumu and Namanga, contributed to the published report, coordinated in-person capacity-building trainings, and shipped the project website with a Typeform intake for real-time legal advisory requests.',
                'problem' => 'Boda-boda operators faced police harassment and had no accessible legal advisory channel; there was no consolidated field research documenting the pattern.',
                'methodology' => 'Combined field data collection (Kisumu, Namanga), in-person capacity-building training, and a web platform with an embedded Typeform intake for advisory requests.',
                'outcome' => 'Published report lives in the Lawyers Hub reports library. Website is archived; the report continues to inform advocacy work.',
                'image' => null,
                'url' => 'https://www.lawyershub.org/Resources/reports',
                'is_featured' => false,
            ],

            // ---- OKJTechnologies era -----------------------------------
            [
                'type' => 'client',
                'title' => 'Dickson, Gitonga Advocates LLP',
                'client_name' => 'Dickson, Gitonga Advocates LLP',
                'tagline' => 'Corporate site with admin and client dashboards for a Nairobi law firm.',
                'category' => 'LegalTech',
                'technologies' => ['PHP 8.1', 'Bootstrap 5', 'Vite', 'MySQL', 'Phinx', 'PHPStan'],
                'description' => 'I designed and built the website for Dickson, Gitonga Advocates LLP. It ships a public marketing site plus two authenticated portals: an admin dashboard (consultation requests, blog posts, team members, publications, firm activity) and a client dashboard (case management, correspondence, file uploads, notifications). The publications page has search, filter and pagination over the firm\'s legal PDFs.',
                'problem' => 'The firm needed a professional public presence plus a private workspace for handling consultations, client correspondence and publications.',
                'methodology' => 'Custom PHP application with reusable components, Bootstrap 5 UI, Vite tooling, and a dedicated admin/client split with role-based auth.',
                'outcome' => 'Live production site with admin and client portals in daily use by the firm.',
                'image' => 'https://api.okjtech.co.ke/api/storage/uploads/Ogugu-Gitonga-Advocates_6a5527fd853d2.webp',
                'url' => 'https://dglegal.co.ke',
                'is_featured' => true,
            ],
            [
                'type' => 'client',
                'title' => 'TAMCON Consulting Engineers',
                'client_name' => 'TAMCON Consulting Engineers',
                'tagline' => 'Public portfolio site and CMS for a civil / infrastructure engineering consultancy.',
                'category' => 'Engineering · Corporate',
                'technologies' => ['Laravel', 'React 19', 'Vite', 'Tailwind CSS 4', 'Framer Motion', 'Recharts', 'FilePond', 'Swiper'],
                'description' => 'I designed and built a public portfolio site and a companion admin CMS for TAMCON Consulting Engineers. The interactive front end uses Framer Motion for scroll animations and Swiper for project galleries; the client can publish new projects and media through the CMS without touching code.',
                'problem' => 'The firm\'s civil-engineering portfolio needed a fluid public presentation and a lightweight admin the team could operate themselves.',
                'methodology' => 'Laravel API + React SPA with scroll-linked animations and a media-optimised admin dashboard.',
                'outcome' => 'Live site with the firm managing project publications directly.',
                'image' => 'https://api.okjtech.co.ke/api/storage/uploads/TAMCON-logo_6a55291ab869b.webp',
                'url' => 'https://tamconsonsult.com',
                'is_featured' => true,
            ],
            [
                'type' => 'client',
                'title' => 'South Ring Autos Workshop Management',
                'client_name' => 'South Ring Autos',
                'tagline' => 'Bookings, vehicle service tracking, and client comms for a Nairobi workshop.',
                'category' => 'Automotive',
                'technologies' => ['Laravel', 'Vite', 'MySQL', 'Blade'],
                'description' => 'I built an integrated workshop management system for South Ring Autos covering online bookings, vehicle service tracking, service reminders and digital documentation, with a role-based admin area for the workshop team.',
                'problem' => 'The workshop needed a single system for bookings, vehicle status tracking and client notifications, without depending on off-the-shelf SaaS.',
                'methodology' => 'Laravel application with role-based dashboards and automated notification queues.',
                'outcome' => 'Live production system in daily use.',
                'image' => 'https://api.okjtech.co.ke/api/storage/uploads/SR-Logo-White-BG_6a55297424582.webp',
                'url' => 'https://southringautos.com',
                'is_featured' => true,
            ],
            [
                'type' => 'client',
                'title' => "Nyalife Women's Health Clinic — Website",
                'client_name' => "Nyalife Women's Health Clinic",
                'tagline' => 'Clinic marketing site for a women\'s health facility in Nairobi.',
                'category' => 'HealthTech',
                'technologies' => ['PHP', 'MySQL', 'LAMP'],
                'description' => 'I designed and shipped the public website for Nyalife Women\'s Health Clinic — services overview, doctor profiles, appointment intake and contact.',
                'problem' => 'The clinic needed a professional public presence with an appointment intake channel.',
                'methodology' => 'LAMP site with cPanel deployment.',
                'outcome' => 'Live at nyalifewomensclinic.net.',
                'image' => 'https://api.okjtech.co.ke/api/storage/uploads/Nyalife-Logo_6a4e8b573d303.webp',
                'url' => 'https://nyalifewomensclinic.net',
                'is_featured' => false,
            ],
            [
                'type' => 'flagship',
                'title' => 'Nyalife Hospital Management System — first live instance of Tibu',
                'client_name' => "Nyalife Women's Health Clinic",
                'tagline' => 'Clinical administration portal, running as the first live instance of the Tibu product.',
                'category' => 'HealthTech',
                'technologies' => ['Laravel', 'Vite', 'MySQL', 'Playwright', 'PHPUnit', 'Rector'],
                'description' => 'I built a private clinical administration system for Nyalife Women\'s Health Clinic — patient records, appointment scheduling, clinical file handling, role-based access — with Playwright end-to-end tests and a cPanel deployment pipeline. This system is the first live instance of the Tibu product concept: the strategy is to onboard facilities one at a time through this HMS and use the growing network as the substrate for cross-facility patient-record sharing across all tiers of the Kenyan health system.',
                'problem' => 'Clinical operations needed to move off physical files to a secure, searchable system with role-based access — while remaining operable by clinic staff, not developers.',
                'methodology' => 'Laravel application with a domain-specific patient/appointment/clinical-file schema, RBAC, and end-to-end tests to protect the flows the clinic depends on daily.',
                'outcome' => 'In production at Nyalife. First working instance of the Tibu ecosystem strategy — the same product will be adapted for each new facility that joins.',
                'image' => 'https://api.okjtech.co.ke/api/storage/uploads/Nyalife-Logo_6a4e8b573d303.webp',
                'url' => 'https://nyalifewomensclinic.net',
                'is_featured' => true,
            ],
            [
                'type' => 'client',
                'title' => 'HUCAA — Hekima University College Alumni Association',
                'client_name' => 'Hekima University College Alumni Association',
                'tagline' => 'Alumni networking portal for Hekima University College.',
                'category' => 'EdTech · Community',
                'technologies' => ['Laravel', 'React', 'MySQL'],
                'description' => 'I built the alumni networking portal for the Hekima University College Alumni Association. It\'s live at alumni.hekima.ac.ke and I\'m iterating on it as a personal portfolio project using my current stack (Laravel + React).',
                'problem' => 'The alumni association needed a dedicated network home separate from the university\'s public site.',
                'methodology' => 'Laravel + React application with directory, events and communications surfaces, deployed on the alumni subdomain.',
                'outcome' => 'Live at alumni.hekima.ac.ke. Iteration ongoing.',
                'image' => 'https://api.okjtech.co.ke/api/storage/uploads/Hekima-University-College_6a552abd784d6.webp',
                'url' => 'https://alumni.hekima.ac.ke',
                'is_featured' => false,
            ],
            [
                'type' => 'client',
                'title' => 'Global Harmony Initiative',
                'client_name' => 'Global Harmony Initiative',
                'tagline' => 'NGO website with programme content, secure donations and admin.',
                'category' => 'NGO · Non-profit',
                'technologies' => ['Laravel 13', 'Inertia', 'React', 'Stripe', 'WebAuthn Passkeys', 'DomPDF', 'Intervention Image'],
                'description' => 'I designed and built the Global Harmony Initiative website — a nonprofit platform combining programme content, secure Stripe-backed donations, WebAuthn passkey admin login, and admin tooling for content and correspondence.',
                'problem' => 'The initiative needed a public presence with a trustworthy donation channel and a secure admin the team could log into from anywhere.',
                'methodology' => 'Laravel 13 + Inertia + React with Stripe checkout for donations, DomPDF receipts, Intervention Image for uploads, and WebAuthn passkeys for phishing-resistant admin login.',
                'outcome' => 'Live at globalharmonyinitiative.com.',
                'image' => 'https://api.okjtech.co.ke/api/storage/uploads/Square-White-GHIBG_6a5f39db0c010.webp',
                'url' => 'https://globalharmonyinitiative.com',
                'is_featured' => true,
            ],
            [
                'type' => 'client',
                'title' => 'Wisdom Capital Agricultural Products — E-commerce',
                'client_name' => 'Wisdom Capital',
                'tagline' => 'D2C storefront and admin dashboard for a Kenyan agricultural producer.',
                'category' => 'Agritech · E-commerce',
                'technologies' => ['PHP', 'MySQL', 'React', 'LAMP', 'SMTP'],
                'description' => 'I built an ordering and delivery site for Wisdom Capital\'s agricultural products, plus an admin dashboard for sales, payment status and regional distribution tracking.',
                'problem' => 'The producer needed direct-to-consumer sales channels with clear tracking of orders, payments and regional distribution.',
                'methodology' => 'LAMP application with a React front-end layer for the storefront and a PHP admin dashboard for operations.',
                'outcome' => 'Live at wisdomcapital.co.ke.',
                'image' => 'https://api.okjtech.co.ke/api/storage/uploads/wisdom-capital-logo_6a5f38c09ed8e.webp',
                'url' => 'https://wisdomcapital.co.ke',
                'is_featured' => false,
            ],
            [
                'type' => 'client',
                'title' => 'Reytati Communications',
                'client_name' => 'Reytati Communications',
                'tagline' => 'Single-page agency site with lead-capture and admin.',
                'category' => 'Marketing · Corporate',
                'technologies' => ['PHP', 'MySQL', 'React', 'LAMP'],
                'description' => 'I built a single-page interactive site for Reytati Communications with a lead-capture form, dynamic service catalog and admin panel for updating testimonials and service copy.',
                'problem' => 'The agency needed a polished single-page presence with a lead-capture channel and a manageable content back-end.',
                'methodology' => 'LAMP application with a React front end and a PHP admin panel.',
                'outcome' => 'Live at reytaticomms.com.',
                'image' => 'https://api.okjtech.co.ke/api/storage/uploads/Reytati Communications_6a5527ec68946.webp',
                'url' => 'http://reytaticomms.com',
                'is_featured' => false,
            ],
            [
                'type' => 'client',
                'title' => 'Mizizi Sugarcane Juice — D2C',
                'client_name' => 'Mizizi Sugarcane Juice',
                'tagline' => 'D2C ordering with a Leaflet + OpenStreetMap delivery picker.',
                'category' => 'Food & Beverage · E-commerce',
                'technologies' => ['PHP', 'MySQL', 'jQuery', 'Bootstrap', 'Leaflet', 'OpenStreetMap'],
                'description' => 'I built the Mizizi sugarcane-juice ordering site — product showcase, guest and registered checkout, user profiles, order tracking, and an interactive Leaflet + OpenStreetMap picker so buyers pin the exact delivery location. Precise lat/lon is stored per order and shown on the admin\'s tracking view.',
                'problem' => 'Delivery-address accuracy is the largest source of D2C failure in Nairobi. The client needed something better than a free-text address field.',
                'methodology' => 'Leaflet + Nominatim map picker with reverse-geocoded pre-fill; lat/lon stored alongside the order for the delivery team.',
                'outcome' => 'Live at mizizi.okjtech.co.ke with the map-picker flow in daily use.',
                'image' => 'https://api.okjtech.co.ke/api/storage/uploads/Mizizi-Logo_6a4e892fc2032.webp',
                'url' => 'https://mizizi.okjtech.co.ke',
                'is_featured' => false,
            ],
            [
                'type' => 'flagship',
                'title' => 'OKJTechnologies — Studio Site (okjtech.co.ke)',
                'client_name' => 'OKJTechnologies',
                'tagline' => 'This site. Next.js 16 + Laravel 12, ISR with webhook-based revalidation.',
                'category' => 'Studio · Portfolio',
                'technologies' => ['Next.js 16', 'React 19', 'TypeScript', 'Tailwind CSS', 'SWR', 'Framer Motion', 'Radix UI', 'Laravel 12', 'Sanctum', 'MySQL'],
                'description' => 'OKJTechnologies\' own studio site — a decoupled application: a Next.js 16 App Router front end that consumes a Laravel 12 API, with an admin CMS for every content type on the site. ISR (60s revalidate) plus a webhook so CMS edits trigger cache invalidation on the front end. Automatic WebP conversion for uploaded images.',
                'problem' => 'I needed a studio site I could maintain and reseed myself without redeploying, with public content that stays fresh via ISR.',
                'methodology' => 'Decoupled Next.js + Laravel with a unified AdminResourceTemplate across every CRUD surface and a revalidation webhook from the backend.',
                'outcome' => 'Live at okjtech.co.ke.',
                'image' => 'https://api.okjtech.co.ke/api/storage/uploads/OKJTechLogo-Black_BG-favicon_6a5528621499c.webp',
                'url' => 'https://okjtech.co.ke',
                'is_featured' => true,
            ],
            [
                'type' => 'client',
                'title' => 'The Football Experience (in partnership with Terik Tours)',
                'client_name' => 'The Football Experience · Terik Tours',
                'tagline' => 'Travel platform helping fans in Africa access global football events.',
                'category' => 'Travel · Sports',
                'technologies' => ['Laravel', 'Vite'],
                'description' => 'I\'m building the platform for The Football Experience — a travel product for African fans attending international football events — in partnership with Terik Tours. Scope covers event catalog, itinerary planning, payment tracking and social discovery.',
                'problem' => 'African fans wanting to travel to international matches have no dedicated planning + payment platform, and the operator needs one place to run inventory, bookings and payment tracking.',
                'methodology' => 'Laravel backend with a Vite/React front end; scope built out incrementally with Terik Tours as the domain partner.',
                'outcome' => 'In development. Staging live at tfe.okjtech.co.ke.',
                'image' => 'https://api.okjtech.co.ke/api/storage/uploads/TFE-logo-1_6a552777b4c46.webp',
                'url' => 'https://tfe.okjtech.co.ke',
                'is_featured' => false,
            ],
            [
                'type' => 'client',
                'title' => 'Tena — Digital Onboarding Platform',
                'client_name' => 'Tena',
                'tagline' => 'Progressive-disclosure onboarding with admin analytics and passkey login.',
                'category' => 'FinTech · KYC',
                'technologies' => ['Laravel', 'Inertia', 'React 18', 'TypeScript', 'Tailwind CSS 4', 'WebAuthn Passkeys', 'TanStack Table', 'Recharts', 'FilePond', 'React-Email'],
                'description' => 'I built the Tena onboarding platform — a progressive-disclosure registration flow, an admin analytics dashboard with Recharts, WebAuthn passkey login, tabular data management with TanStack Table, and transactional email built with React-Email components.',
                'problem' => 'A long single-page KYC form was killing completion rates and the operator needed real visibility into where drop-off was happening.',
                'methodology' => 'Progressive-disclosure form architecture, WebAuthn passkeys for phishing-resistant admin login, and Recharts dashboards showing per-step completion metrics.',
                'outcome' => 'Live at tena.host.',
                'image' => 'https://api.okjtech.co.ke/api/storage/uploads/Tena-logo-square_6a5f38e6c199c.webp',
                'url' => 'https://tena.host',
                'is_featured' => true,
            ],
            [
                'type' => 'flagship',
                'title' => 'Najenga — Construction Collaboration Platform',
                'client_name' => 'Najenga',
                'tagline' => 'Blueprint annotation and coordination bridging site engineers, architects, PMs and clients.',
                'category' => 'PropTech · Construction',
                'technologies' => ['Laravel', 'Inertia', 'React 18', 'Tailwind', 'Framer Motion', '@annotorious/react', 'AG-Grid', 'react-pdf', 'Tesseract.js', 'Swiper', 'xlsx'],
                'description' => 'Construction-project coordination platform — annotate architectural drawings directly (Annotorious over PDFs and images), work through interactive project timelines, run OCR over documents (Tesseract.js), export to Excel, and coordinate in a chat with @mentions.',
                'problem' => 'Site engineers, architects, PMs and clients kept losing context between them because drawings, schedules and chat lived in different tools.',
                'methodology' => 'One workspace with spatial annotation on drawings, an interactive timeline, OCR-indexed documents, and an @mentions chat, all bound to the same project record.',
                'outcome' => 'In development. Staging live at najenga.okjtech.co.ke.',
                'image' => 'https://api.okjtech.co.ke/api/storage/uploads/Najenga-Logo-md-redbg_6a5527c52d180.webp',
                'bg_image' => 'https://api.okjtech.co.ke/api/storage/uploads/Screenshot 2026-09-01 095339_6a9676b62fd15.webp',
                'url' => 'https://najenga.okjtech.co.ke',
                'is_featured' => true,
            ],
            [
                'type' => 'flagship',
                'title' => 'Naoa — Digital Wedding Platform (evolved from DnT Wedding)',
                'client_name' => 'Naoa',
                'tagline' => 'Live gallery, QR guest check-in, and a downloadable digital scrapbook.',
                'category' => 'Events · Weddings',
                'technologies' => ['React 19', 'Vite', 'Tailwind CSS 4', 'TanStack Query', 'i18next', 'Leaflet', 'FilePond', 'html5-qrcode', 'jsPDF', 'html-to-image', 'Laravel Echo', 'Pusher', 'Playwright'],
                'description' => 'Wedding platform with live photo galleries, QR guest check-in, an interactive venue map, real-time updates via Laravel Echo + Pusher, and a downloadable "digital scrapbook" export assembled client-side (html-to-image / jsPDF / jszip). Front end is internationalised with i18next.',
                'problem' => 'Wedding memory-keeping today is scattered across guests\' phones and social platforms. Couples need one live, ownable record of the day.',
                'methodology' => 'Real-time gallery + guest check-in on the couple\'s subdomain, with a client-side export path so the couple owns their own memory book afterwards.',
                'outcome' => 'In development. Current demo instance live at dntwed.okjtech.co.ke. Public SaaS landing planned at naoa.okjtech.co.ke.',
                'image' => 'https://api.okjtech.co.ke/api/storage/uploads/Naoa-logo_6a5f3a1aa2cd7.webp',
                'url' => 'https://dntwed.okjtech.co.ke',
                'is_featured' => true,
            ],
            [
                'type' => 'flagship',
                'title' => 'Kuba Home Services — Marketplace',
                'client_name' => 'Kuba',
                'tagline' => 'Vetted home & business services marketplace across 13 categories.',
                'category' => 'Marketplace',
                'technologies' => ['Next.js 16', 'React 19', 'TypeScript', 'Tailwind CSS 4', 'Radix UI', 'Stripe', 'Laravel Echo', 'Pusher', 'FilePond', 'React Calendly', 'Laravel', 'Sanctum'],
                'description' => 'Service-provider marketplace with client and provider dashboards, quote-request flows, in-platform real-time messaging (Laravel Echo + Pusher), Stripe payments and Calendly booking. Deploys via cPanel with GitHub Actions.',
                'problem' => 'Finding vetted service providers in Nairobi is fragmented across WhatsApp groups and referrals; providers have no shared quoting or booking surface.',
                'methodology' => 'One platform with matched client / provider dashboards, real-time chat, Stripe checkout and Calendly for scheduling — bookings and payments settled inside the platform.',
                'outcome' => 'In development. Preparing live launch at kuba.co.ke.',
                'image' => null,
                'url' => 'https://kuba.co.ke',
                'is_featured' => true,
            ],
            [
                'type' => 'client',
                'title' => 'Silversky — E-commerce',
                'client_name' => 'Silversky',
                'tagline' => 'Custom e-commerce build with WebAuthn passkey login.',
                'category' => 'E-commerce',
                'technologies' => ['Laravel', 'Inertia', 'React 18', 'Tailwind', 'WebAuthn Passkeys', 'Leaflet'],
                'description' => 'Silversky e-commerce build — full brand-system implementation (8 vector logo variants documented and matched to the brand guide), WebAuthn passkey login, Leaflet-based location features.',
                'problem' => 'Silversky needed an on-brand storefront with a modern, phishing-resistant authentication path.',
                'methodology' => 'Laravel + Inertia + React with WebAuthn passkeys and a rigorously implemented brand system.',
                'outcome' => 'In development at shop.silversky.co.ke.',
                'image' => null,
                'url' => 'https://shop.silversky.co.ke',
                'is_featured' => false,
            ],
            [
                'type' => 'client',
                'title' => 'OmniShop — Solar & Storage Live Kenya 2026 Exhibitor Catalog',
                'client_name' => 'OmniSpace 3D Events Ltd',
                'tagline' => 'Standalone ordering site for a trade show, deployable by a non-developer.',
                'category' => 'Events · E-commerce',
                'technologies' => ['Python', 'PayPal', 'CSV'],
                'description' => 'OmniShop is the exhibitor ordering site for Solar and Storage Live Kenya 2026. Exhibitors browse a 190-product catalog, place orders and get a receipt; the admin panel handles order status (Pending → Approved → Invoiced → Fulfilled), prints category-grouped packing lists, and exports orders to CSV. Packaged for a non-technical client with a plain-English guide and a one-click .bat launcher.',
                'problem' => 'The event needed a purpose-built ordering site, but the client had to be able to operate and (later) redeploy it without a developer.',
                'methodology' => 'Standalone Python server bundled with everything the client needs — a plain-English README and a one-click launcher — plus an admin panel simple enough for the events team to run themselves.',
                'outcome' => 'Delivered — running under the client\'s own domain (omnispace3d.com) for the event.',
                'image' => null,
                'url' => 'https://omnispace3d.com',
                'is_featured' => false,
            ],
            [
                'type' => 'client',
                'title' => 'Nissi Insights — Content Platform',
                'client_name' => 'Nissi Insights',
                'tagline' => 'Content publication platform with a Tiptap editor and SWR admin.',
                'category' => 'Content · Publishing',
                'technologies' => ['Next.js 16', 'React 19', 'TypeScript', 'Tailwind', 'Radix UI', 'Framer Motion', 'Tiptap', 'SWR'],
                'description' => 'Nissi Insights — a Next.js content platform with a Tiptap rich editor, tag / category management, image uploads with dropzone + browser compression, and an SWR-backed admin dashboard.',
                'problem' => 'Nissi needed a modern content platform with a proper rich editor and a fast, live admin — not another WordPress install.',
                'methodology' => 'Next.js + Tiptap for editing, SWR for live admin data, and image dropzone with client-side compression before upload.',
                'outcome' => 'In development at nissi-insights.com.',
                'image' => null,
                'url' => 'https://nissi-insights.com',
                'is_featured' => false,
            ],
            [
                'type' => 'client',
                'title' => 'GM Coaching — Full-stack Platform',
                'client_name' => 'GM Coaching',
                'tagline' => 'Coaching / consulting platform with payments and scheduling.',
                'category' => 'SaaS · Consulting',
                'technologies' => ['Next.js 16', 'React 19', 'TypeScript', 'Tailwind', 'Radix UI', 'Recharts', 'Stripe', 'React Calendly', 'Laravel Echo', 'Pusher', 'FilePond'],
                'description' => 'Full-stack platform with a Next.js front end and Laravel backend — Stripe checkout, Calendly booking, real-time updates via Pusher, dashboards with Recharts, file uploads through FilePond.',
                'problem' => 'The coaching practice needed one integrated surface for bookings, payments, real-time updates and client materials.',
                'methodology' => 'Next.js + Laravel with Stripe, Calendly and Pusher wired directly into the client and admin dashboards.',
                'outcome' => 'In development at gm-coaching.com.',
                'image' => null,
                'url' => 'https://gm-coaching.com',
                'is_featured' => false,
            ],
            [
                'type' => 'flagship',
                'title' => 'Tibu — HealthTech Product (parent of Nyalife HMS)',
                'client_name' => 'OKJTechnologies',
                'tagline' => 'The product Nyalife HMS is running on. Ecosystem-by-adoption at national scale.',
                'category' => 'HealthTech · Interoperability',
                'technologies' => ['Laravel', 'MySQL', 'React'],
                'description' => 'Tibu is the parent product concept; the Nyalife HMS is its first live instance. The strategy is ecosystem-by-adoption: onboard facilities one at a time via the HMS — each facility gets a fully useful clinical administration system on day one — and as more facilities adopt it, the underlying data schema becomes the substrate for cross-facility patient-record sharing across all tiers of the Kenyan health system.',
                'problem' => 'Kenyan hospitals still rely heavily on paper records; there\'s no shared awareness of bed availability, specialists or patient history across facilities, and referrals slow down as a result. Underprivileged patients suffer the most from this gap.',
                'methodology' => 'Ecosystem-mapping approach: build one facility\'s HMS so well that adoption is self-motivating, then use the growing network as the substrate for cross-facility record sharing, referrals and consolidated national health insights.',
                'outcome' => 'First live instance in production as the Nyalife HMS. Additional facility rollouts and the cross-facility layer are the next milestones.',
                'image' => 'https://api.okjtech.co.ke/api/storage/uploads/tibu-logo_6a5f3a770ea74.webp',
                'url' => null,
                'is_featured' => true,
            ],
        ];
    }

    // ------------------------------------------------------------------
    // Insights — 10 real article topics; first two drafted in full.
    // ------------------------------------------------------------------

    private function reseedInsights(): void
    {
        Insight::query()->forceDelete();

        $adminId = User::query()->orderBy('id')->value('id') ?? 1;
        $now = now();

        foreach ($this->insightRows() as $order => $row) {
            Insight::create([
                'title' => $row['title'],
                'slug' => Str::slug($row['title']),
                'category' => $row['category'],
                'excerpt' => $row['excerpt'],
                'content' => $row['content'],
                'image' => null,
                'user_id' => $adminId,
                'is_published' => $row['is_published'] ?? true,
                'published_at' => $now->copy()->subDays($order),
            ]);
        }
    }

    private function insightRows(): array
    {
        return [
            [
                'title' => 'Ecosystem mapping before you write a line of code',
                'category' => 'Strategy',
                'excerpt' => 'The Afrilabs stakeholder-mapping framework, why I run it before scoping any build, and how it changes what I build.',
                'content' => <<<'HTML'
<h2>Why mapping the ecosystem is the first commit</h2>
<p>The single most useful thing I ever learned about building software wasn't taught in a Computer Science lecture. It came from the <em>Leveraging Stakeholder Relationships through Ecosystem Mapping and Building</em> programme run by Afrilabs in Addis Ababa, which I attended while working with the Lawyers Hub. The premise is simple: before you build anything, map every stakeholder who could be affected by or beneficial to the proposition, and design the solution so each one has a clearly aligned way to benefit from it.</p>

<h3>The five kinds of stakeholder I always map</h3>
<ol>
    <li><strong>The paying client.</strong> Who signed the contract. Their reason to say yes is usually the loudest — but often the shallowest.</li>
    <li><strong>The end user.</strong> Frequently a different person from the client. If their interaction is annoying, adoption dies quietly.</li>
    <li><strong>The regulator and the standards body.</strong> On LegalTech and HealthTech work in Kenya especially, ignoring this stakeholder is how "innovation" ends up illegal.</li>
    <li><strong>Adjacent partners and data holders.</strong> Anyone the system reads from or writes to. Their willingness to share is a design constraint, not a technical afterthought.</li>
    <li><strong>The wider community.</strong> Even a small internal tool has a wider community — the receptionist who fields the phone calls, the accountant who has to reconcile it, the compliance officer who has to sign off.</li>
</ol>

<h3>What the mapping gives you</h3>
<p>Once each stakeholder has a name on the whiteboard, the next question is <strong>"what does this system have to give each of them, to make participating a rational choice?"</strong> If the answer is "nothing" for anyone on the list, you have a design flaw that no amount of code will fix. Fix it in the map, not in the sprint.</p>

<h3>Applied: Tibu and the Nyalife HMS</h3>
<p>Tibu — the HealthTech product I'm building — is the clearest example of this in my own portfolio. The vision is a national system where a patient's history follows them across every facility they present at. On paper that's a top-down interoperability project. Ecosystem mapping says otherwise: no hospital adopts a system whose main sales pitch is "you will one day be interoperable with everyone else." So the first live instance is a fully useful Hospital Management System for a single clinic (Nyalife) that pays for itself on day one — and the interoperability substrate is what emerges as more facilities adopt the same system for their own local reasons. Every stakeholder gets a reason to participate before we ask any of them to.</p>

<h3>The 30-minute version</h3>
<p>If you're building anything and want to try the Afrilabs approach compressed into 30 minutes: draw six columns on a page — Client, User, Regulator, Partners, Community, Yourself — write every named entity in each column, and for each write one sentence answering <em>"what do they get by participating?"</em> If you cannot answer for one of them, that is the work.</p>
HTML,
            ],
            [
                'title' => "Two years inside Africa's LegalTech engine room — what I learned at the Lawyers Hub",
                'category' => 'LegalTech',
                'excerpt' => 'Daily bulletins, policy maps, festival platforms, ADPI trainings, boda-boda field research. What the LegalTech sector actually needs technically — from someone who was in the engine room.',
                'content' => <<<'HTML'
<h2>What "LegalTech" actually looks like in practice</h2>
<p>From February 2023 to December 2024 I was Software Developer, Justice Innovation at the Lawyers Hub in Nairobi. Two years in the engine room of what is, quietly, the busiest LegalTech shop on the continent. Here's what that job actually involved and what I learned.</p>

<h3>The Digital Policy website — everything anchors to it</h3>
<p>I spearheaded development of the <a href="https://www.lawyershub.org">Lawyers Hub Digital Policy website</a>, which is the primary distribution channel for the Hub's daily bulletins, policy maps, festival programming and reports. LegalTech infrastructure is boring on the inside: it's a good CMS, an editorial team that publishes every day, and URLs that are still there five years later. That's the whole game.</p>

<h3>Africa Law Tech Festival — the platform outlasts the year</h3>
<p>I designed the platform for the <a href="https://www.africalawtech.com">Africa Law Tech Festival</a>: ticketing, live notifications, event mapping. The important lesson wasn't technical — it was that a festival platform has to be re-programmable each year without being rebuilt. The 2022, 2023, 2024 and 2025 editions all ran on the same substrate. That's what platform actually means.</p>

<h3>AI Policy Lab & Africa Digital Policy Institute</h3>
<p>At ALTF 2024 I contributed to UI/UX design for the <a href="https://www.aipolicy.africa/">AI Policy Lab</a> and to the Africa Digital Policy Institute's <a href="https://www.lawyershub.org/adpi-courses">course platform</a>, which grew out of the earlier Africa Law Tech University direction. ADPI runs the flagship data-protection trainings on the continent — the Africa Data Protection Course and the CIPP/E. I supported delivery of both. Sitting in on those trainings while also building the platforms they run on is where I got most of my practical data-protection literacy — which shows up now in the way I build authentication, access control and audit logging on every client project.</p>

<h3>Chairing a hackathon at ALTF 2023</h3>
<p>Under the justice-innovation team I chaired the digital-trade hackathon at ALTF 2023 (<em>Digital Trade in Africa: The AfCFTA and the Single Digital Market</em>, Nairobi, 12–13 July 2023). Eleven teams shortlisted. What I learned watching them: policy hackathons succeed when the problem statement is narrow enough that a working prototype is possible in 48 hours, and they fail when it's a "boil the ocean" AfCFTA framing. That lesson has since shaped how I scope client projects — the first shipped version has to be a real thing, not a step toward a real thing.</p>

<h3>Boda-Boda Law Project — field research, not just a website</h3>
<p>The Boda-Boda Law Project is the LegalTech engagement I'm proudest of. I co-organised field data collection in Kisumu and Namanga, contributed to writing the report (published in the Lawyers Hub <a href="https://www.lawyershub.org/Resources/reports">reports library</a>), coordinated in-person capacity-building trainings for riders on traffic regulations and their rights, and shipped the <em>Boda-Boda Law</em> project website with a Typeform intake for real-time legal advisory requests. The website was the smallest part. The people work was the point.</p>

<h3>ALTF 2022 — media team delegate</h3>
<p>The year before as a software-developer trainee I was on the media team at ALTF 2022 (<em>Africa-Europe Artificial Intelligence Policy Dialogue</em>, 2–18 June 2022). Delegate and event support. That was where I saw firsthand that the Hub's community is genuinely continental — the policy conversations aren't Nairobi-centric, and the tools that support them can't be either.</p>

<h3>Three technical takeaways I still apply</h3>
<ol>
    <li><strong>Editorial cadence is a first-class requirement.</strong> If the CMS can't support publishing every weekday, it's the wrong CMS. Everything else negotiates around that.</li>
    <li><strong>Data-protection literacy has to be in the developer, not the checklist.</strong> RBAC, ACL, WebAuthn passkeys, careful logging — these are habits, not features to add later.</li>
    <li><strong>Interoperability is a distribution problem, not a technical one.</strong> The technical layer is the easy half. The stakeholder-mapping half — who benefits from sharing, who loses control by sharing — is where LegalTech projects live or die.</li>
</ol>
HTML,
            ],
            [
                'title' => 'Chairing a hackathon on digital trade at ALTF 2023',
                'category' => 'LegalTech · Events',
                'excerpt' => 'What I saw watching 11 teams try to solve AfCFTA problems in 48 hours; where policy hackathons succeed and where they don\'t.',
                'content' => '<p><em>Full write-up to follow.</em> Draft outline: setting the brief (Digital Trade in Africa under the AfCFTA), what the 11 shortlisted teams actually built, the pattern of what worked in 48 hours vs what needed longer, and the lasting learnings I now apply when scoping client projects.</p>',
                'is_published' => false,
            ],
            [
                'title' => 'CIPP/E, ADPI and building for data protection in Kenyan LegalTech',
                'category' => 'LegalTech · Data Protection',
                'excerpt' => 'Supporting delivery of the Africa Data Protection Course and CIPP/E training taught me the compliance surface. Here\'s how I bake it into small-team builds.',
                'content' => '<p><em>Full write-up to follow.</em> Draft outline: what ADPI\'s data-protection trainings cover, how it maps to Kenya\'s Data Protection Act, and the practical patterns I use on client work (RBAC, ACL, WebAuthn passkey login as in GHI and Tena, careful audit logging).</p>',
                'is_published' => false,
            ],
            [
                'title' => 'A solo-founder stack: Laravel + Next.js + AI-accelerated development',
                'category' => 'Engineering Practice',
                'excerpt' => 'The exact tooling and workflow that lets one person ship the same class of application a small team would take on.',
                'content' => '<p><em>Full write-up to follow.</em> Draft outline: the stack itself, where AI accelerates and where it doesn\'t, the code-review discipline that keeps quality honest without a second engineer, and the operational habits (cPanel deploys, backup routines) that keep the studio running solo.</p>',
                'is_published' => false,
            ],
            [
                'title' => 'Designing for HealthTech in Kenya — Tibu, and the problem statement behind it',
                'category' => 'HealthTech',
                'excerpt' => 'Why the Nyalife HMS is not a client site but the first live instance of a national-scale product concept.',
                'content' => '<p><em>Full write-up to follow.</em> Draft outline: the Tibu problem statement (paper records, unequal access, no interoperability across facility levels 3–6), why ecosystem-by-adoption beats top-down interoperability, and how the Nyalife HMS is architected to be the first substrate node in that network.</p>',
                'is_published' => false,
            ],
            [
                'title' => 'Building an alumni network from scratch — HUCAA design decisions in the wireframe stage',
                'category' => 'EdTech · Process',
                'excerpt' => 'Behind-the-scenes of how I scope a system I have not yet built — the questions I ask before writing a migration.',
                'content' => '<p><em>Full write-up to follow.</em> Draft outline: the specific ecosystem-mapping questions I ran through with HUCAA (alumni, current students, faculty, administration), and how the resulting wireframes shaped the live version now at alumni.hekima.ac.ke.</p>',
                'is_published' => false,
            ],
            [
                'title' => 'OmniShop: a plain-English e-commerce site you can run from a .bat file',
                'category' => 'E-commerce · Delivery Practice',
                'excerpt' => 'Building software for a non-technical client who has to operate it themselves.',
                'content' => '<p><em>Full write-up to follow.</em> Draft outline: what changes when the person running the software cannot open a terminal, why the plain-English README + one-click launcher matters, and the trade-offs of choosing a Python-standalone architecture for a 190-product event catalog with a 6-week timeline.</p>',
                'is_published' => false,
            ],
            [
                'title' => 'Real-time coordination on construction sites — Najenga\'s spatial annotation architecture',
                'category' => 'PropTech',
                'excerpt' => 'Annotorious over PDFs, coordinate timelines, Tesseract OCR — why we chose each piece and what still needs testing.',
                'content' => '<p><em>Full write-up to follow.</em> Draft outline: the four-role coordination problem (site engineer, architect, PM, client), why spatial annotation on the drawing beats comment threads, and what OCR-indexed documents unlock for referring back to old revisions.</p>',
                'is_published' => false,
            ],
            [
                'title' => 'Booking with Kenyan farmers — the Wisdom Capital delivery stack',
                'category' => 'Agritech · E-commerce',
                'excerpt' => 'Order lifecycle, payment reconciliation, regional distribution tracking for an agricultural producer.',
                'content' => '<p><em>Full write-up to follow.</em> Draft outline: what a D2C agricultural stack has to handle that a normal e-commerce stack doesn\'t (harvest schedules, regional distribution windows, payment reconciliation across mobile-money channels), and how the admin dashboard is shaped by those constraints.</p>',
                'is_published' => false,
            ],
        ];
    }
}
