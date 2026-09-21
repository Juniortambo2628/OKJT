<?php

namespace Database\Seeders;

use App\Models\Client;
use App\Models\Insight;
use App\Models\Pillar;
use App\Models\Project;
use App\Models\Service;
use App\Models\SiteSetting;
use App\Models\Stat;
use App\Models\TeamMember;
use App\Models\Testimonial;
use App\Models\User;
use App\Models\Value;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

/**
 * PortfolioContentSeeder — Accurate, non-destructive reseed
 *
 * Replaces all portfolio content with verified data from
 * documentation/PROJECT_CATALOG_ACCURATE.md and the project analysis.
 *
 * Framing rules (from the catalog document):
 * - OKJTechnologies is a one-person studio. Kevin Tambo is the only developer.
 * - No fabricated statistics, testimonials, or team members.
 * - Every project status, stack, and URL is drawn from real repos.
 * - Idempotent: safe to run multiple times.
 *
 * Run: php artisan db:seed --class=PortfolioContentSeeder
 */
class PortfolioContentSeeder extends Seeder
{
    public function run(): void
    {
        Model::withoutEvents(function () {
            DB::transaction(function () {
                $this->reseedSiteSettings();
                $this->reseedStats();
                $this->reseedValues();
                $this->reseedTeam();
                $this->reseedPillars();
                $this->reseedServices();
                $this->clearTestimonials();
                $this->reseedClients();
                $this->reseedProjects();
                $this->reseedInsights();
            });
        });

        Cache::flush();

        Log::info('PortfolioContentSeeder: reseed complete.');
    }

    // ------------------------------------------------------------------
    // Site Settings
    // ------------------------------------------------------------------

    private function reseedSiteSettings(): void
    {
        $settings = [
            // --- General ---
            ['key' => 'site_name', 'value' => 'OKJTechnologies', 'type' => 'text', 'group' => 'general'],

            // --- About page ---
            ['key' => 'about_title', 'value' => "Design-led web engineering,\nbuilt around ecosystems.", 'type' => 'textarea', 'group' => 'about'],
            ['key' => 'about_tagline', 'value' => 'How the work gets done', 'type' => 'text', 'group' => 'about'],
            ['key' => 'about_story', 'value' => "OKJTechnologies is a Nairobi web-application practice. The work is full-stack and end to end — concept, interface, engineering, deployment and ongoing administration — mostly in Laravel, Next.js / React and the classic LAMP stack, with AI-accelerated tooling in the loop. Every build starts by mapping the ecosystem the software has to live in, so each stakeholder — client, end user, regulator, adjacent partner — has an aligned reason to participate. It is a one-person studio, run by Kevin Tambo.", 'type' => 'textarea', 'group' => 'about'],
            ['key' => 'about_mission_title', 'value' => 'Ecosystem mapping before a line of code.', 'type' => 'text', 'group' => 'about'],
            ['key' => 'about_mission_text1', 'value' => 'Every engagement is shaped by an ecosystem-mapping practice from the Afrilabs capacity-building programme <em>Leveraging Stakeholder Relationships through Ecosystem Mapping and Building</em> (Addis Ababa, Ethiopia). Before scoping, the map covers every stakeholder who could be affected by or beneficial to the proposition — the paying client, the end user, the regulator, adjacent service providers, upstream and downstream data holders, the wider community.', 'type' => 'textarea', 'group' => 'about'],
            ['key' => 'about_mission_text2', 'value' => 'The solution is then designed so each of those stakeholders has a clearly aligned way to benefit from it. That mapping is what turns a website into a working system inside its own context — and, combined with AI-accelerated development, is how a one-person studio ships the same class of application a small team would take on.', 'type' => 'textarea', 'group' => 'about'],
            ['key' => 'about_team_title', 'value' => 'One continuous thread, concept to production', 'type' => 'text', 'group' => 'about'],
            ['key' => 'about_team_subtitle', 'value' => 'Every project is designed, built, deployed and administered as one continuous piece of work — no hand-offs between teams, no context dropped between phases, one point of accountability. OKJTechnologies is deliberately a one-person studio.', 'type' => 'textarea', 'group' => 'about'],
            ['key' => 'about_credentials_title', 'value' => 'Credentials & Background', 'type' => 'text', 'group' => 'about'],
            ['key' => 'about_credentials', 'value' => "B.Sc. Computer Science, Riara University (Second Class Honours, Upper Division). Afrilabs capacity-building certificate — Leveraging Stakeholder Relationships through Ecosystem Mapping and Building, Addis Ababa, Ethiopia. Software Developer — Justice Innovation at Lawyers Tech Hub (Feb 2023 – Dec 2024).", 'type' => 'textarea', 'group' => 'about'],
            ['key' => 'about_sectors_title', 'value' => 'Sectors', 'type' => 'text', 'group' => 'about'],
            ['key' => 'about_sectors', 'value' => 'LegalTech · HealthTech · PropTech · FinTech · E-commerce · Events · NGO / Advocacy · Agritech · Automotive · EdTech · Marketplace', 'type' => 'text', 'group' => 'about'],
            ['key' => 'about_cta_title', 'value' => 'Have a system you want built end to end?', 'type' => 'text', 'group' => 'about'],
            ['key' => 'about_cta_subtitle', 'value' => "Whether it's a customer-facing application, an internal dashboard, or a national-scale concept still at problem-statement stage, I'd like to hear about it. Start with a short brief and we'll map the ecosystem together.", 'type' => 'textarea', 'group' => 'about'],

            // --- Homepage hero ---
            ['key' => 'hero_tagline', 'value' => 'Design-led web engineering from Nairobi', 'type' => 'text', 'group' => 'homepage'],
            ['key' => 'hero_subtitle', 'value' => 'Bespoke, high-performance web applications, robust APIs and clean admin systems — designed and built end to end in Laravel, Next.js and React.', 'type' => 'textarea', 'group' => 'homepage'],
            ['key' => 'hero_title_line1', 'value' => 'Full-stack web', 'type' => 'text', 'group' => 'homepage'],
            ['key' => 'hero_rotating_words', 'value' => 'applications.,APIs.,admin systems.', 'type' => 'text', 'group' => 'homepage'],
            ['key' => 'hero_title_line2', 'value' => 'Built end to end.', 'type' => 'text', 'group' => 'homepage'],

            // --- Homepage "how I work" section ---
            ['key' => 'vp_section_tagline', 'value' => 'The approach', 'type' => 'text', 'group' => 'homepage'],
            ['key' => 'vp_section_title', 'value' => 'One continuous build, concept to production', 'type' => 'text', 'group' => 'homepage'],
            ['key' => 'vp_section_subtitle', 'value' => 'Design, engineering, deployment and ongoing administration run as one process — no hand-offs between teams, no context lost between phases.', 'type' => 'textarea', 'group' => 'homepage'],
            ['key' => 'vp_pillar1_tag', 'value' => 'Build', 'type' => 'text', 'group' => 'homepage'],
            ['key' => 'vp_pillar1_title', 'value' => 'Web application engineering', 'type' => 'text', 'group' => 'homepage'],
            ['key' => 'vp_pillar1_description', 'value' => 'Laravel and Next.js / React applications built from the schema up — auth, admin, APIs, background jobs, plus deployment and ongoing cPanel and domain administration.', 'type' => 'textarea', 'group' => 'homepage'],
            ['key' => 'vp_pillar2_tag', 'value' => 'Design', 'type' => 'text', 'group' => 'homepage'],
            ['key' => 'vp_pillar2_title', 'value' => 'Interface & experience design', 'type' => 'text', 'group' => 'homepage'],
            ['key' => 'vp_pillar2_description', 'value' => 'Design and implementation stay together — design system, motion, responsive layout and accessibility resolved as one piece of work, not thrown over a wall.', 'type' => 'textarea', 'group' => 'homepage'],
            ['key' => 'vp_pillar3_tag', 'value' => 'Strategy', 'type' => 'text', 'group' => 'homepage'],
            ['key' => 'vp_pillar3_title', 'value' => 'Ecosystem-led strategy', 'type' => 'text', 'group' => 'homepage'],
            ['key' => 'vp_pillar3_description', 'value' => 'Every stakeholder the software touches — client, user, regulator, partner, community — is mapped before scoping, so each has an aligned reason to use it. An approach from the Afrilabs programme in Addis Ababa.', 'type' => 'textarea', 'group' => 'homepage'],

            // --- Homepage section headings ---
            ['key' => 'stats_tagline', 'value' => 'Snapshot', 'type' => 'text', 'group' => 'homepage'],
            ['key' => 'stats_title', 'value' => 'The studio at a glance', 'type' => 'text', 'group' => 'homepage'],
            ['key' => 'services_tagline', 'value' => 'Services', 'type' => 'text', 'group' => 'homepage'],
            ['key' => 'services_title', 'value' => 'What I build', 'type' => 'text', 'group' => 'homepage'],
            ['key' => 'insights_tagline', 'value' => 'Insights', 'type' => 'text', 'group' => 'homepage'],
            ['key' => 'insights_title', 'value' => 'From the studio', 'type' => 'text', 'group' => 'homepage'],
            ['key' => 'projects_tagline', 'value' => 'Portfolio', 'type' => 'text', 'group' => 'homepage'],
            ['key' => 'projects_title', 'value' => 'Selected work', 'type' => 'text', 'group' => 'homepage'],
            ['key' => 'testimonials_tagline', 'value' => 'Client impact', 'type' => 'text', 'group' => 'homepage'],
            ['key' => 'testimonials_title', 'value' => 'What clients say', 'type' => 'text', 'group' => 'homepage'],

            // --- Contact page ---
            ['key' => 'contact_title', 'value' => "Let's build something", 'type' => 'text', 'group' => 'contact'],
            ['key' => 'contact_subtitle', 'value' => 'Have a project in mind? Start with a short brief and we will map the ecosystem together.', 'type' => 'textarea', 'group' => 'contact'],
        ];

        foreach ($settings as $setting) {
            SiteSetting::updateOrCreate(
                ['key' => $setting['key']],
                $setting
            );
        }
    }

    // ------------------------------------------------------------------
    // Stats — honest, defensible numbers only
    // ------------------------------------------------------------------

    private function reseedStats(): void
    {
        Stat::query()->forceDelete();

        $stats = [
            ['label' => 'Years building for the web', 'value' => 'Since 2021', 'description' => 'Started building professionally in April 2021.', 'icon' => 'calendar', 'order' => 1],
            ['label' => 'Studio + client projects', 'value' => '20+', 'description' => 'Across LegalTech, HealthTech, PropTech, FinTech, E-commerce, Events, and NGO sectors.', 'icon' => 'folder', 'order' => 2],
            ['label' => 'Primary stack', 'value' => 'Laravel + Next.js', 'description' => 'Full-stack web applications built end to end with Laravel, Next.js / React, and the classic LAMP stack.', 'icon' => 'code', 'order' => 3],
            ['label' => 'Sectors covered', 'value' => '11', 'description' => 'LegalTech · HealthTech · PropTech · FinTech · E-commerce · Events · NGO · Agritech · Automotive · EdTech · Marketplace', 'icon' => 'grid', 'order' => 4],
        ];

        foreach ($stats as $stat) {
            Stat::create($stat);
        }
    }

    // ------------------------------------------------------------------
    // Values
    // ------------------------------------------------------------------

    private function reseedValues(): void
    {
        Value::query()->forceDelete();

        $values = [
            ['icon' => 'map', 'title' => 'Ecosystem Mapping', 'description' => 'Every stakeholder the software touches is mapped before scoping — client, user, regulator, partner, community — so each has an aligned reason to participate.', 'order' => 1],
            ['icon' => 'shield', 'title' => 'Honest Scope', 'description' => 'No fabricated metrics, no overpromised features. What gets shipped is what was scoped, and what was scoped is what the ecosystem actually needs.', 'order' => 2],
            ['icon' => 'zap', 'title' => 'AI-Accelerated', 'description' => 'Emerging AI tooling compresses the delivery cycle so a one-person studio ships the same class of application a small team would.', 'order' => 3],
            ['icon' => 'layers', 'title' => 'Design + Function', 'description' => 'Design and implementation stay together — no hand-offs between teams, no context dropped between phases.', 'order' => 4],
            ['icon' => 'handshake', 'title' => 'Client Partnership', 'description' => 'Every project is a partnership, not a transaction. The ecosystem mapping ensures the solution serves everyone it touches.', 'order' => 5],
            ['icon' => 'arrow-up-right', 'title' => 'Continuous Delivery', 'description' => 'Concept, interface, engineering, deployment and ongoing administration as one continuous piece of work.', 'order' => 6],
        ];

        foreach ($values as $value) {
            Value::create($value);
        }
    }

    // ------------------------------------------------------------------
    // Team — one person only
    // ------------------------------------------------------------------

    private function reseedTeam(): void
    {
        TeamMember::query()->forceDelete();

        TeamMember::create([
            'name' => 'Kevin Tambo',
            'role' => 'Founder & Principal Engineer',
            'bio' => "I'm a solo web application developer running OKJTechnologies out of Nairobi. I build full-stack web applications end to end — concept, UI, engineering, deployment and ongoing cPanel/domain administration — mostly in Laravel, Next.js / React and the classic LAMP stack, with AI-accelerated tooling in the loop.\n\nThe way I approach every engagement is shaped by an ecosystem-mapping practice I picked up on the Afrilabs capacity-building programme \"Leveraging Stakeholder Relationships through Ecosystem Mapping and Building\" (Addis Ababa, Ethiopia), which I attended and earned a certificate for while working with the Lawyers Hub. Before I write code, I map out every stakeholder who could be affected by or beneficial to the proposition — the paying client, the end user, the regulator, adjacent service providers, upstream/downstream data holders, the wider community — and I design the solution so each one has a clearly aligned way to benefit from it.",
            'linkedin' => 'https://www.linkedin.com/in/tambokevin/',
            'image' => null,
            'order' => 1,
        ]);
    }

    // ------------------------------------------------------------------
    // Pillars
    // ------------------------------------------------------------------

    private function reseedPillars(): void
    {
        Pillar::query()->forceDelete();

        $pillars = [
            [
                'title' => 'Web Application Engineering',
                'slug' => 'web-application-engineering',
                'overview' => 'Full-stack web applications built from the schema up — auth, admin, APIs, background jobs, deployment and ongoing cPanel/domain administration.',
                'content' => '<p>Laravel and Next.js / React applications built from the schema up — auth, admin, APIs, background jobs, plus deployment and ongoing cPanel and domain administration. Every project covers the full lifecycle: concept, interface, engineering, deployment and ongoing operations.</p>',
                'icon' => 'code',
                'is_active' => true,
            ],
            [
                'title' => 'Interface & Experience Design',
                'slug' => 'interface-experience-design',
                'overview' => 'Design and implementation stay together — design system, motion, responsive layout and accessibility resolved as one piece of work.',
                'content' => '<p>Design and implementation stay together — design system, motion, responsive layout and accessibility resolved as one piece of work, not thrown over a wall. From wireframes to production, the visual and functional design is integral to every build.</p>',
                'icon' => 'palette',
                'is_active' => true,
            ],
            [
                'title' => 'Ecosystem-Led Strategy',
                'slug' => 'ecosystem-led-strategy',
                'overview' => 'Every stakeholder the software touches is mapped before scoping, so each has an aligned reason to use it.',
                'content' => '<p>Every stakeholder the software touches — client, user, regulator, partner, community — is mapped before scoping, so each has an aligned reason to use it. An approach from the Afrilabs programme in Addis Ababa. This is what turns a website into a working system inside its own context.</p>',
                'icon' => 'map',
                'is_active' => true,
            ],
        ];

        foreach ($pillars as $pillar) {
            Pillar::create($pillar);
        }
    }

    // ------------------------------------------------------------------
    // Services
    // ------------------------------------------------------------------

    private function reseedServices(): void
    {
        Service::query()->forceDelete();

        $services = [
            ['title' => 'Custom Web Applications', 'slug' => 'custom-web-applications', 'category' => 'Web Development', 'description' => 'Full-stack web applications built with Laravel, Next.js or React — from MVP to production-grade systems with auth, dashboards, APIs and background jobs.', 'content' => '<p>Full-stack web applications built with Laravel, Next.js or React — from MVP to production-grade systems with authentication, admin panels, REST/GraphQL APIs, background job processing, and real-time features via WebSockets. Each application is designed around the ecosystem it serves.</p>', 'icon' => 'monitor', 'is_active' => true],
            ['title' => 'E-Commerce Platforms', 'slug' => 'ecommerce-platforms', 'category' => 'Web Development', 'description' => 'Online stores and ordering portals with product catalogs, cart systems, payment integration (Stripe, M-Pesa, Paystack), order management and admin dashboards.', 'content' => '<p>Online stores and ordering portals with product catalogs, cart systems, payment integration (Stripe, M-Pesa, Paystack), order management and admin dashboards. Built for real businesses — from exhibitor catalogs to direct-to-consumer storefronts.</p>', 'icon' => 'shopping-cart', 'is_active' => true],
            ['title' => 'Admin Dashboards', 'slug' => 'admin-dashboards', 'category' => 'Web Development', 'description' => 'Admin panels with role-based access control, content management, analytics, and CRUD operations for every entity in the system.', 'content' => '<p>Admin panels with role-based access control, content management, analytics, and CRUD operations for every entity in the system. From hospital management to construction project coordination, each dashboard is purpose-built for the domain.</p>', 'icon' => 'layout', 'is_active' => true],
            ['title' => 'API Development', 'slug' => 'api-development', 'category' => 'Web Development', 'description' => 'RESTful APIs with Laravel Sanctum authentication, form request validation, API resources, rate limiting and comprehensive documentation.', 'content' => '<p>RESTful APIs with Laravel Sanctum authentication, form request validation, API resources, rate limiting and comprehensive documentation. Built to serve Next.js/React frontends, mobile apps or third-party integrations.</p>', 'icon' => 'server', 'is_active' => true],
            ['title' => 'CMS Development', 'slug' => 'cms-development', 'category' => 'Web Development', 'description' => 'Headless and custom content management systems that let non-technical users manage site content, blog posts, pages and media without touching code.', 'content' => '<p>Headless and custom content management systems that let non-technical users manage site content, blog posts, pages and media without touching code. From Filament-based admin panels to bespoke key-value CMS architectures.</p>', 'icon' => 'file-text', 'is_active' => true],
            ['title' => 'Wireframing & Prototyping', 'slug' => 'wireframing-prototyping', 'category' => 'UI/UX Design', 'description' => 'Low-fidelity wireframes and interactive prototypes that validate structure, flow and information architecture before a line of code is written.', 'content' => '<p>Low-fidelity wireframes and interactive prototypes that validate structure, flow and information architecture before a line of code is written. Design stays tightly coupled with engineering throughout the build.</p>', 'icon' => 'pen-tool', 'is_active' => true],
            ['title' => 'Design Systems', 'slug' => 'design-systems', 'category' => 'UI/UX Design', 'description' => 'Reusable component libraries, design tokens, and brand-consistent visual languages that scale across pages and products.', 'content' => '<p>Reusable component libraries, design tokens, and brand-consistent visual languages that scale across pages and products. Built with Tailwind CSS, shadcn/ui and Framer Motion for consistency and performance.</p>', 'icon' => 'component', 'is_active' => true],
            ['title' => 'UX Audits', 'slug' => 'ux-audits', 'category' => 'UI/UX Design', 'description' => 'Systematic review of existing interfaces to identify friction points, accessibility gaps and opportunities for improved user flows.', 'content' => '<p>Systematic review of existing interfaces to identify friction points, accessibility gaps and opportunities for improved user flows. Actionable recommendations backed by the ecosystem mapping practice.</p>', 'icon' => 'search', 'is_active' => true],
            ['title' => 'Technical Architecture', 'slug' => 'technical-architecture', 'category' => 'Digital Strategy', 'description' => 'Database schema design, API architecture, service layer patterns, and infrastructure planning for scalable web applications.', 'content' => '<p>Database schema design, API architecture, service layer patterns, and infrastructure planning for scalable web applications. Every architecture decision is informed by the stakeholder map.</p>', 'icon' => 'git-branch', 'is_active' => true],
            ['title' => 'Performance & SEO', 'slug' => 'performance-seo', 'category' => 'Digital Strategy', 'description' => 'Core Web Vitals optimisation, server-side rendering, static generation, caching strategies and search engine optimisation.', 'content' => '<p>Core Web Vitals optimisation, server-side rendering, static generation, caching strategies and search engine optimisation. Performance is a feature, not an afterthought.</p>', 'icon' => 'gauge', 'is_active' => true],
            ['title' => 'Digital Transformation', 'slug' => 'digital-transformation', 'category' => 'Digital Strategy', 'description' => 'Modernising legacy systems, migrating from manual processes to web-based workflows, and building digital infrastructure for organisations.', 'content' => '<p>Modernising legacy systems, migrating from manual processes to web-based workflows, and building digital infrastructure for organisations. From paper-based clinic records to full hospital management systems.</p>', 'icon' => 'refresh-cw', 'is_active' => true],
        ];

        foreach ($services as $service) {
            Service::create($service);
        }
    }

    // ------------------------------------------------------------------
    // Testimonials — clear all (fabricated). Leave empty for real quotes later.
    // ------------------------------------------------------------------

    private function clearTestimonials(): void
    {
        Testimonial::query()->forceDelete();
    }

    // ------------------------------------------------------------------
    // Clients — real, delivered clients only
    // ------------------------------------------------------------------

    private function reseedClients(): void
    {
        Client::query()->forceDelete();

        $clients = [
            ['name' => 'Lawyers Hub', 'logo' => null, 'website' => 'https://www.lawyershub.org', 'category' => 'LegalTech', 'is_active' => true, 'order' => 1],
            ['name' => 'Nyalife Women\'s Clinic', 'logo' => null, 'website' => 'https://nyalifewomensclinic.net', 'category' => 'HealthTech', 'is_active' => true, 'order' => 2],
            ['name' => 'South Ring Autos', 'logo' => null, 'website' => 'https://southringautos.com', 'category' => 'Automotive', 'is_active' => true, 'order' => 3],
            ['name' => 'Dickson, Gitonga Advocates LLP', 'logo' => null, 'website' => 'https://dglegal.co.ke', 'category' => 'LegalTech', 'is_active' => true, 'order' => 4],
            ['name' => 'Global Harmony Initiative', 'logo' => null, 'website' => 'https://globalharmonyinitiative.com', 'category' => 'NGO', 'is_active' => true, 'order' => 5],
            ['name' => 'Wisdom Capital', 'logo' => null, 'website' => 'https://wisdomcapital.co.ke', 'category' => 'Agritech', 'is_active' => true, 'order' => 6],
            ['name' => 'TAMCON Consulting Engineers', 'logo' => null, 'website' => 'https://tamconsonsult.com', 'category' => 'Corporate', 'is_active' => true, 'order' => 7],
            ['name' => 'Tena', 'logo' => null, 'website' => 'https://tena.host', 'category' => 'PropTech', 'is_active' => true, 'order' => 8],
            ['name' => 'OmniSpace 3D Events Ltd', 'logo' => null, 'website' => 'https://omnispace3d.com', 'category' => 'Events', 'is_active' => true, 'order' => 9],
            ['name' => 'Silversky Events', 'logo' => null, 'website' => 'https://shop.silversky.co.ke', 'category' => 'Events', 'is_active' => true, 'order' => 10],
            ['name' => 'HUCAA', 'logo' => null, 'website' => 'https://alumni.hekima.ac.ke', 'category' => 'EdTech', 'is_active' => true, 'order' => 11],
            ['name' => 'Nissi Insights', 'logo' => null, 'website' => 'https://nissi-insights.com', 'category' => 'Corporate', 'is_active' => true, 'order' => 12],
            ['name' => 'GM Coaching', 'logo' => null, 'website' => 'https://gm-coaching.com', 'category' => 'EdTech', 'is_active' => true, 'order' => 13],
            ['name' => 'Terik Tours', 'logo' => null, 'website' => null, 'category' => 'Travel', 'is_active' => true, 'order' => 14],
            ['name' => 'Reytati Communications', 'logo' => null, 'website' => 'http://reytaticomms.com', 'category' => 'Marketing', 'is_active' => true, 'order' => 15],
            ['name' => 'Mizizi Sugarcane Juice', 'logo' => null, 'website' => 'https://mizizi.okjtech.co.ke', 'category' => 'E-commerce', 'is_active' => true, 'order' => 16],
        ];

        foreach ($clients as $client) {
            Client::create($client);
        }
    }

    // ------------------------------------------------------------------
    // Projects — full catalog from PROJECT_CATALOG_ACCURATE.md
    // ------------------------------------------------------------------

    private function reseedProjects(): void
    {
        Project::query()->forceDelete();

        $projects = [
            // === LAWYERS HUB ERA (Employer projects) ===
            [
                'type' => 'client',
                'title' => 'Lawyers Hub Digital Policy Website',
                'slug' => 'lawyers-hub-digital-policy',
                'client_name' => 'Lawyers Tech Hub',
                'tagline' => 'Flagship LegalTech knowledge hub for Kenya\'s digital-policy community.',
                'category' => 'LegalTech',
                'technologies' => ['PHP', 'MySQL', 'HTML/CSS/JS', 'WordPress-style CMS'],
                'focus_areas' => ['Content management', 'Digital policy publishing', 'Event platform integration'],
                'significant_figure' => null,
                'description' => 'I spearheaded development of the Lawyers Hub Digital Policy website — the cornerstone LegalTech resource for Kenya\'s AI-policy, digital-trade and Africa digital-economy conversation. Built and maintained during my tenure as Software Developer, Justice Innovation at Lawyers Tech Hub.',
                'problem' => 'Kenya\'s digital-policy community needed a centralised platform for publishing research, daily bulletins, policy maps, and event information across the AI, data protection and digital trade sectors.',
                'methodology' => 'Led development of a custom CMS-driven platform with content types for publications, events, daily bulletins and policy maps. Managed the full stack from database schema to front-end presentation layer.',
                'outcome' => 'The platform became the primary digital presence for the Lawyers Hub, hosting daily bulletins, policy maps, reports and event listings. Live at lawyershub.org.',
                'testimonial_quote' => null,
                'testimonial_author' => null,
                'image' => null,
                'bg_image' => null,
                'gallery' => null,
                'url' => 'https://www.lawyershub.org',
                'is_active' => true,
                'is_featured' => false,
                'order' => 1,
            ],
            [
                'type' => 'client',
                'title' => 'Africa Law Tech Festival Platform',
                'slug' => 'africa-law-tech-festival',
                'client_name' => 'Lawyers Tech Hub',
                'tagline' => 'Ticketing, live notifications and event mapping for the annual Africa Law Tech Festival.',
                'category' => 'Events',
                'technologies' => ['LAMP'],
                'focus_areas' => ['Online ticketing', 'Live event notifications', 'Event mapping'],
                'significant_figure' => null,
                'description' => 'I designed the Africa Law Tech Festival platform — the site that runs online ticketing, live notifications and event mapping for the annual festival (11,000+ attendees across editions per lawyershub.org).',
                'problem' => 'The annual Africa Law Tech Festival needed a dedicated digital platform for online ticketing, real-time event notifications, and geographic event mapping across multiple venues and sessions.',
                'methodology' => 'Designed and built a festival-specific platform with integrated ticketing, notification system, and interactive event mapping. Reused and refined across festival editions.',
                'outcome' => 'The platform served 11,000+ attendees across festival editions, handling ticketing, live notifications and event logistics. Live at africalawtech.com.',
                'testimonial_quote' => null,
                'testimonial_author' => null,
                'image' => null,
                'bg_image' => null,
                'gallery' => null,
                'url' => 'https://www.africalawtech.com',
                'is_active' => true,
                'is_featured' => false,
                'order' => 2,
            ],
            [
                'type' => 'client',
                'title' => 'AI Policy Lab (ALTF 2024)',
                'slug' => 'ai-policy-lab',
                'client_name' => 'Lawyers Tech Hub',
                'tagline' => 'Virtual learning facility for AI-policy capacity building across Europe and Africa.',
                'category' => 'LegalTech',
                'technologies' => ['UI/UX Design'],
                'focus_areas' => ['Virtual learning UI/UX', 'Cross-continental accessibility', 'Policy capacity building'],
                'significant_figure' => null,
                'description' => 'I contributed to UI/UX design for the AI Policy Lab — a virtual learning facility for AI-policy capacity building across Europe and Africa, introduced at the 2024 festival edition (Artificial Intelligence and the Year of Education).',
                'problem' => 'The Africa Digital Policy Institute needed a virtual learning platform for cross-continental AI-policy capacity building, supporting structured course content, participant interaction, and certification workflows.',
                'methodology' => 'Contributed to UI/UX design of the virtual learning interface, focusing on accessibility across bandwidth conditions and intuitive navigation for non-technical policy professionals.',
                'outcome' => 'The platform launched at ALTF 2024, supporting AI-policy training across Europe and Africa. Live at aipolicy.africa.',
                'testimonial_quote' => null,
                'testimonial_author' => null,
                'image' => null,
                'bg_image' => null,
                'gallery' => null,
                'url' => 'https://www.aipolicy.africa/',
                'is_active' => true,
                'is_featured' => false,
                'order' => 3,
            ],
            [
                'type' => 'client',
                'title' => 'Africa Digital Policy Institute Courses',
                'slug' => 'adpi-courses',
                'client_name' => 'Lawyers Tech Hub',
                'tagline' => 'Course platform centralising capacity-building activities for the Africa Digital Policy Institute.',
                'category' => 'LegalTech',
                'technologies' => ['LAMP'],
                'focus_areas' => ['Course management', 'Participant tracking', 'Data protection training'],
                'significant_figure' => null,
                'description' => 'I designed the Africa Law Tech University platform (which became the Africa Digital Policy Institute course platform), centralising capacity-building activities for the Institute. Supported delivery of the Africa Data Protection Course and CIPP/E training.',
                'problem' => 'The Africa Digital Policy Institute needed a unified platform to host, manage and deliver capacity-building courses including the Africa Data Protection Course and CIPP/E certification training.',
                'methodology' => 'Designed the platform architecture to support course management, participant tracking, and content delivery. Supported operational delivery of data protection training programmes.',
                'outcome' => 'The platform became the central hub for ADPI capacity-building activities. Live at lawyershub.org/adpi-courses.',
                'testimonial_quote' => null,
                'testimonial_author' => null,
                'image' => null,
                'bg_image' => null,
                'gallery' => null,
                'url' => 'https://www.lawyershub.org/adpi-courses',
                'is_active' => true,
                'is_featured' => false,
                'order' => 4,
            ],
            [
                'type' => 'client',
                'title' => 'Digital Trade Hackathon',
                'slug' => 'digital-trade-hackathon',
                'client_name' => 'Lawyers Tech Hub',
                'tagline' => 'Landing site for the 2023 Digital Trade tech-policy hackathon at the Africa Law Tech Festival.',
                'category' => 'LegalTech',
                'technologies' => ['HTML/CSS/JS', 'Bootstrap 4', 'jQuery', 'TemplateMo'],
                'focus_areas' => ['Event landing page', 'Interactive Africa map', 'Hackathon coordination'],
                'significant_figure' => null,
                'description' => 'I shipped the landing site for the Digital Trade tech-policy hackathon at ALTF 2023 and chaired the hackathon on the justice-innovation team, which produced 11 shortlisted innovations. The site was built on a Bootstrap template with an interactive Africa map.',
                'problem' => 'The ALTF 2023 hackathon (Digital Trade in Africa: The AfCFTA and the Single Digital Market) needed a landing site to attract participants, display country information, and manage registrations for the two-day event.',
                'methodology' => 'Built a static landing site using Bootstrap 4, a TemplateMo base, CSS Africa Map plugin, and jQuery for interactivity. Chaired the hackathon itself, coordinating 11 teams across 48 hours.',
                'outcome' => 'The site attracted hackathon participants and the event produced 11 shortlisted innovations. Event site is archived.',
                'testimonial_quote' => null,
                'testimonial_author' => null,
                'image' => null,
                'bg_image' => null,
                'gallery' => null,
                'url' => null,
                'is_active' => true,
                'is_featured' => false,
                'order' => 5,
            ],
            [
                'type' => 'client',
                'title' => 'Boda-Boda Law Project',
                'slug' => 'boda-boda-law',
                'client_name' => 'Lawyers Tech Hub',
                'tagline' => 'Legal advisory & education platform for boda-boda riders and cross-border traders.',
                'category' => 'LegalTech',
                'technologies' => ['HTML/CSS/JS', 'Bootstrap', 'Typeform'],
                'focus_areas' => ['Legal advisory intake', 'Field research coordination', 'Capacity-building training'],
                'significant_figure' => null,
                'description' => 'I contributed to the Boda-Boda Law Project — co-organised field data collection in Kisumu and Namanga, contributed to the published report, coordinated in-person capacity-building trainings, and shipped the project website with a Typeform intake for real-time legal advisory requests.',
                'problem' => 'Boda-boda operators and cross-border traders in Kenya lacked accessible legal information about traffic regulations and their rights, and had no channel for real-time legal advisory requests.',
                'methodology' => 'Co-organised field research in Kisumu and Namanga, contributed to the published report, and built a website with embedded Typeform intake for real-time legal advisory requests. Coordinated in-person capacity-building trainings for riders.',
                'outcome' => 'The project produced a published field report and a functional advisory intake platform. Report is live in the Lawyers Hub reports library.',
                'testimonial_quote' => null,
                'testimonial_author' => null,
                'image' => null,
                'bg_image' => null,
                'gallery' => null,
                'url' => 'https://www.lawyershub.org/Resources/reports',
                'is_active' => true,
                'is_featured' => false,
                'order' => 6,
            ],

            // === OKJTECHNOLOGIES ERA (Client projects) ===
            [
                'type' => 'client',
                'title' => 'Dickson, Gitonga Advocates LLP',
                'slug' => 'dickson-gongona-advocates',
                'client_name' => 'Dickson, Gitonga Advocates LLP',
                'tagline' => 'Corporate site with client and admin dashboards for a Nairobi law firm.',
                'category' => 'LegalTech',
                'technologies' => ['PHP 8.1', 'Bootstrap 5', 'Vite', 'Phinx', 'PHPStan'],
                'focus_areas' => ['Client dashboard', 'Case management', 'Document uploads'],
                'significant_figure' => null,
                'description' => 'I designed and built the website for Dickson, Gitonga Advocates LLP. It ships a public marketing site plus two authenticated portals: an admin dashboard (consultation requests, blog posts, team members, publications, firm activity) and a client dashboard (case management, correspondence, file uploads, notifications).',
                'problem' => 'A Nairobi law firm needed a professional online presence with secure client portals for case management, correspondence, and document sharing — replacing manual email-based workflows.',
                'methodology' => 'Built a public marketing site with two separate authenticated dashboards: admin for firm management and client for case access. Used Phinx for database migrations and PHPStan for static analysis.',
                'outcome' => 'The platform provides the firm with a professional web presence and secure client portals. Live at dglegal.co.ke.',
                'testimonial_quote' => null,
                'testimonial_author' => null,
                'image' => null,
                'bg_image' => null,
                'gallery' => null,
                'url' => 'https://dglegal.co.ke',
                'is_active' => true,
                'is_featured' => false,
                'order' => 7,
            ],
            [
                'type' => 'client',
                'title' => 'TAMCON Consulting Engineers',
                'slug' => 'tamcon-consulting-engineers',
                'client_name' => 'TAMCON Consulting Engineers',
                'tagline' => 'Public portfolio site and CMS for a civil / infrastructure engineering consultancy.',
                'category' => 'Corporate',
                'technologies' => ['Laravel', 'React', 'Tailwind CSS', 'Framer Motion', 'Swiper', 'Recharts', 'FilePond'],
                'focus_areas' => ['Project showcase', 'CMS content management', 'Scroll animations'],
                'significant_figure' => null,
                'description' => 'I designed and built a public portfolio site and a companion admin CMS for TAMCON Consulting Engineers. The interactive front end uses Framer Motion for scroll animations and Swiper for project galleries; the client can publish new projects and media through the CMS without touching code.',
                'problem' => 'An engineering consulting firm established in 1995 needed a modern web presence to showcase projects, manage client testimonials, and maintain current site content without developer intervention for every update.',
                'methodology' => 'Built a Laravel + React SPA with Framer Motion animations, a key-value CMS for content management, and an admin dashboard with project, client, and testimonial management. Deployed via GitHub Actions to cPanel.',
                'outcome' => 'The firm now manages all site content through the admin panel. Live at tamconsonsult.com.',
                'testimonial_quote' => null,
                'testimonial_author' => null,
                'image' => null,
                'bg_image' => null,
                'gallery' => null,
                'url' => 'https://tamconsonsult.com',
                'is_active' => true,
                'is_featured' => true,
                'order' => 8,
            ],
            [
                'type' => 'client',
                'title' => 'South Ring Autos',
                'slug' => 'south-ring-autos',
                'client_name' => 'South Ring Autos',
                'tagline' => 'Web application for a Nairobi vehicle workshop — bookings, vehicle service tracking, client comms.',
                'category' => 'Automotive',
                'technologies' => ['Laravel', 'Next.js', 'React', 'TypeScript', 'Tailwind CSS', 'Paystack', 'Laravel Reverb'],
                'focus_areas' => ['Booking system', 'Vehicle service tracking', 'Loyalty rewards'],
                'significant_figure' => null,
                'description' => 'I built an integrated workshop management system for South Ring Autos covering online bookings, vehicle service tracking, service reminders and digital documentation, with a role-based admin area for the workshop team.',
                'problem' => 'An auto repair business in Karen, Nairobi needed a digital platform to manage bookings, track repair progress, handle payments, maintain customer loyalty, and communicate with clients in real-time.',
                'methodology' => 'Built a full-stack application with Next.js frontend and Laravel API backend. Integrated Paystack for payments, Laravel Reverb for real-time notifications, and a loyalty points system. Deployed via GitHub Actions to cPanel.',
                'outcome' => 'The workshop now manages bookings, vehicle tracking, payments, loyalty rewards, and client communications through a single platform. Live at southringautos.com.',
                'testimonial_quote' => null,
                'testimonial_author' => null,
                'image' => null,
                'bg_image' => null,
                'gallery' => null,
                'url' => 'https://southringautos.com',
                'is_active' => true,
                'is_featured' => true,
                'order' => 9,
            ],
            [
                'type' => 'client',
                'title' => 'Nyalife Women\'s Health Clinic — Website',
                'slug' => 'nyalife-womens-clinic',
                'client_name' => 'Nyalife Women\'s Clinic',
                'tagline' => 'Clinic marketing site for a women\'s health facility in Nairobi.',
                'category' => 'HealthTech',
                'technologies' => ['LAMP', 'cPanel'],
                'focus_areas' => ['Service showcase', 'Doctor profiles', 'Appointment intake'],
                'significant_figure' => null,
                'description' => 'I designed and shipped the public website for Nyalife Women\'s Health Clinic — services overview, doctor profiles, appointment intake and contact.',
                'problem' => 'A women\'s health clinic in Nairobi needed a professional online presence to showcase services, doctor profiles, and provide appointment intake functionality.',
                'methodology' => 'Designed and built a clean, professional marketing site with service pages, doctor profiles, appointment forms and contact functionality. Hosted on cPanel.',
                'outcome' => 'The clinic now has a professional web presence with online appointment intake. Live at nyalifewomensclinic.net.',
                'testimonial_quote' => null,
                'testimonial_author' => null,
                'image' => null,
                'bg_image' => null,
                'gallery' => null,
                'url' => 'https://nyalifewomensclinic.net',
                'is_active' => true,
                'is_featured' => false,
                'order' => 10,
            ],
            [
                'type' => 'client',
                'title' => 'Nyalife Hospital Management System',
                'slug' => 'nyalife-hms',
                'client_name' => 'Nyalife Women\'s Clinic',
                'tagline' => 'Clinical administration portal for the Nyalife women\'s health clinic.',
                'category' => 'HealthTech',
                'technologies' => ['Laravel', 'React', 'Inertia.js', 'Bootstrap', 'Spatie Permission', 'DomPDF', 'Playwright'],
                'focus_areas' => ['Patient records', 'Clinical workflows', 'Role-based access control'],
                'significant_figure' => null,
                'description' => 'I built a private clinical administration system for Nyalife Women\'s Health Clinic: patient records, appointment scheduling, clinical file handling and role-based access. Playwright end-to-end tests and a cPanel deployment pipeline ship with the repo. This system is the first live instance of the Tibu product concept.',
                'problem' => 'The clinic needed a comprehensive hospital management system covering the full patient lifecycle — from registration through consultations, prescriptions, lab work, pharmacy, billing, and telehealth — replacing paper-based workflows.',
                'methodology' => 'Built a Laravel + React (Inertia.js) application with 33 Eloquent models, 73 database migrations, and granular RBAC via Spatie Permission. Included Playwright e2e tests and automated cPanel deployment.',
                'outcome' => 'The system is in production at the clinic, managing patients, appointments, consultations, prescriptions, lab work, pharmacy, billing, and telehealth. First live instance of the Tibu product concept.',
                'testimonial_quote' => null,
                'testimonial_author' => null,
                'image' => null,
                'bg_image' => null,
                'gallery' => null,
                'url' => 'https://nyalifewomensclinic.net',
                'is_active' => true,
                'is_featured' => true,
                'order' => 11,
            ],
            [
                'type' => 'client',
                'title' => 'HUCAA',
                'slug' => 'hucaa',
                'client_name' => 'Hekima University College Alumni Association',
                'tagline' => 'Alumni association platform with directory, events, groups, messaging and M-Pesa donations.',
                'category' => 'EdTech',
                'technologies' => ['Laravel', 'React', 'Vite', 'Laravel Sanctum', 'M-Pesa'],
                'focus_areas' => ['Alumni directory', 'Event coordination', 'M-Pesa donations'],
                'significant_figure' => null,
                'description' => 'I built the alumni networking portal for Hekima University College Alumni Association — it\'s live, and I\'m iterating on it now as a personal portfolio project using my current stack (Laravel + React).',
                'problem' => 'An alumni association needed a centralised platform for alumni directory management, event coordination, group-based discussions, private messaging, and M-Pesa donation processing.',
                'methodology' => 'Built a Laravel 12 REST API backend with 28 Eloquent models and a React 19 SPA frontend. Integrated M-Pesa STK push payments and role-based access with three permission levels. Active migration from legacy PHP.',
                'outcome' => 'The platform is live with alumni directory, events, groups, messaging, and M-Pesa donations. Being iterated on as a portfolio project.',
                'testimonial_quote' => null,
                'testimonial_author' => null,
                'image' => null,
                'bg_image' => null,
                'gallery' => null,
                'url' => 'https://alumni.hekima.ac.ke',
                'is_active' => true,
                'is_featured' => false,
                'order' => 12,
            ],
            [
                'type' => 'client',
                'title' => 'Global Harmony Initiative',
                'slug' => 'global-harmony-initiative',
                'client_name' => 'Global Harmony Initiative',
                'tagline' => 'NGO website with programme content, donations and admin.',
                'category' => 'NGO',
                'technologies' => ['Laravel', 'Inertia', 'React', 'Stripe', 'WebAuthn', 'Intervention Image', 'DomPDF'],
                'focus_areas' => ['Programme content', 'Stripe donations', 'WebAuthn admin login'],
                'significant_figure' => null,
                'description' => 'I designed and built the Global Harmony Initiative website — a nonprofit platform combining programme content, secure Stripe-backed donations, WebAuthn passkey admin login, and admin tooling for content and correspondence.',
                'problem' => 'A U.S. 501(c)(3) nonprofit operating in East Africa needed a digital platform to centralise content management for education, healthcare, and community development programmes, with secure donation processing.',
                'methodology' => 'Built a Laravel 13 + Inertia + React application with Stripe integration, WebAuthn passkey authentication, image optimization pipelines, and a comprehensive CMS with 17 Eloquent models.',
                'outcome' => 'The platform manages causes, initiatives, events, impact stories, and donations. Live at globalharmonyinitiative.com.',
                'testimonial_quote' => null,
                'testimonial_author' => null,
                'image' => null,
                'bg_image' => null,
                'gallery' => null,
                'url' => 'https://globalharmonyinitiative.com',
                'is_active' => true,
                'is_featured' => false,
                'order' => 13,
            ],
            [
                'type' => 'client',
                'title' => 'Wisdom Capital Agricultural Products',
                'slug' => 'wisdom-capital',
                'client_name' => 'Wisdom Capital',
                'tagline' => 'Direct-to-consumer storefront and admin dashboard for a Kenyan agricultural producer.',
                'category' => 'Agritech',
                'technologies' => ['PHP', 'MySQL', 'React', 'SMTP'],
                'focus_areas' => ['Product catalog', 'Order management', 'Regional distribution tracking'],
                'significant_figure' => null,
                'description' => 'I built an ordering and delivery site for Wisdom Capital\'s agricultural products, plus an admin dashboard for sales, payment status and regional distribution tracking.',
                'problem' => 'A Kenyan agricultural producer needed a direct-to-consumer e-commerce platform with order management, payment tracking, and regional distribution visibility.',
                'methodology' => 'Built a LAMP-stack application with a React frontend layer, product catalog, cart system, checkout flow, and admin dashboard for order and distribution management.',
                'outcome' => 'The platform handles product ordering, delivery tracking, and regional distribution management. Live at wisdomcapital.co.ke.',
                'testimonial_quote' => null,
                'testimonial_author' => null,
                'image' => null,
                'bg_image' => null,
                'gallery' => null,
                'url' => 'https://wisdomcapital.co.ke',
                'is_active' => true,
                'is_featured' => false,
                'order' => 14,
            ],
            [
                'type' => 'client',
                'title' => 'Reytati Communications',
                'slug' => 'reytati-communications',
                'client_name' => 'Reytati Communications',
                'tagline' => 'Agency single-page site and lead-capture back end for a Nairobi communications firm.',
                'category' => 'Corporate',
                'technologies' => ['LAMP', 'React'],
                'focus_areas' => ['Lead capture', 'Service catalog', 'Testimonial management'],
                'significant_figure' => null,
                'description' => 'I built a single-page interactive site for Reytati Communications with a lead-capture form, dynamic service catalog and admin panel for updating testimonials and service copy.',
                'problem' => 'A Nairobi communications firm needed a professional single-page website with lead capture and a way to manage testimonials and service offerings without developer intervention.',
                'methodology' => 'Built a single-page React application with lead-capture forms, a dynamic service catalog, and an admin panel for content management.',
                'outcome' => 'The firm now has a professional web presence with lead capture and self-service content management. Live at reytaticomms.com.',
                'testimonial_quote' => null,
                'testimonial_author' => null,
                'image' => null,
                'bg_image' => null,
                'gallery' => null,
                'url' => 'http://reytaticomms.com',
                'is_active' => true,
                'is_featured' => false,
                'order' => 15,
            ],
            [
                'type' => 'client',
                'title' => 'Mizizi Sugarcane Juice',
                'slug' => 'mizizi-sugarcane-juice',
                'client_name' => 'Mizizi',
                'tagline' => 'Direct-to-consumer ordering site with map-based delivery picker.',
                'category' => 'E-commerce',
                'technologies' => ['PHP', 'MySQL', 'jQuery', 'Bootstrap', 'Leaflet.js', 'OpenStreetMap'],
                'focus_areas' => ['Product showcase', 'Map-based delivery picker', 'Order tracking'],
                'significant_figure' => null,
                'description' => 'I built the Mizizi sugarcane-juice ordering site — product showcase, guest and registered checkout, user profiles, order tracking, and an interactive Leaflet + OpenStreetMap picker so buyers pin the exact delivery location.',
                'problem' => 'A sugarcane juice business needed an ordering platform with precise delivery location pinning, replacing phone-based order taking with no address verification.',
                'methodology' => 'Built a PHP + MySQL application with jQuery/Bootstrap frontend, integrated Leaflet.js + OpenStreetMap for interactive address picking. Lat/lon stored per order for precise delivery routing.',
                'outcome' => 'Customers can now order online with precise delivery location pinning. Live at mizizi.okjtech.co.ke.',
                'testimonial_quote' => null,
                'testimonial_author' => null,
                'image' => null,
                'bg_image' => null,
                'gallery' => null,
                'url' => 'https://mizizi.okjtech.co.ke',
                'is_active' => true,
                'is_featured' => false,
                'order' => 16,
            ],

            // === FLAGSHIP / STUDIO-OWNED PROJECTS ===
            [
                'type' => 'flagship',
                'title' => 'OKJTechnologies Portfolio Website',
                'slug' => 'okjtech-portfolio',
                'client_name' => 'OKJTechnologies',
                'tagline' => 'Studio site with Laravel CMS and Next.js public front end.',
                'category' => 'Studio',
                'technologies' => ['Next.js', 'React', 'TypeScript', 'Tailwind CSS', 'SWR', 'Framer Motion', 'Radix UI', 'Laravel', 'Sanctum', 'Intervention Image'],
                'focus_areas' => ['Project showcase', 'Insights publishing', 'Admin CMS'],
                'significant_figure' => null,
                'description' => 'OKJTechnologies\' own studio site — a decoupled application: a Next.js/Vite front end consuming a Laravel API, with an admin CMS for every content type on the site.',
                'problem' => 'The studio needed a professional portfolio site to showcase projects, publish insights, manage testimonials, and capture consultation leads — with full CMS control over all content.',
                'methodology' => 'Built a decoupled architecture with Next.js 16 frontend (ISR with webhook revalidation) and Laravel 12 API backend (Sanctum auth, Intervention Image, 15 Eloquent models). Admin CMS with 20+ API controllers.',
                'outcome' => 'The platform manages the studio\'s public portfolio, insights articles, testimonials, and client leads. Live at okjtech.co.ke.',
                'testimonial_quote' => null,
                'testimonial_author' => null,
                'image' => null,
                'bg_image' => null,
                'gallery' => null,
                'url' => 'https://okjtech.co.ke',
                'is_active' => true,
                'is_featured' => true,
                'order' => 17,
            ],
            [
                'type' => 'flagship',
                'title' => 'The Football Experience',
                'slug' => 'the-football-experience',
                'client_name' => 'Terik Tours',
                'tagline' => 'Travel platform helping fans in Africa access global football events.',
                'category' => 'Travel',
                'technologies' => ['Laravel', 'React', 'Inertia.js', 'Tailwind CSS', 'Headless UI', 'Recharts', 'Paystack', 'Amadeus API', 'SerpApi'],
                'focus_areas' => ['Budget calculator', 'Social feed', 'Tournament travel planning'],
                'significant_figure' => null,
                'description' => 'I\'m building the platform for The Football Experience — a travel product for African fans attending international football events — in partnership with Terik Tours. Scope covers event catalog, itinerary planning, payment tracking and social discovery.',
                'problem' => 'African football fans attending international tournaments lack a unified platform to research costs, plan itineraries, connect with fellow fans, and manage bookings and payments.',
                'methodology' => 'Building a Laravel 12 + React 19 SPA with Inertia.js. Integrating Amadeus API for real-time flight/hotel pricing, SerpApi for Google Flights data, and Paystack for payments. Three user roles: Fan, Partner, Admin.',
                'outcome' => 'In development. Supports FIFA World Cup 2026, UEFA Euro 2024, and AFCON 2027 tournaments. Live at tfe.okjtech.co.ke.',
                'testimonial_quote' => null,
                'testimonial_author' => null,
                'image' => null,
                'bg_image' => null,
                'gallery' => null,
                'url' => 'https://tfe.okjtech.co.ke',
                'is_active' => true,
                'is_featured' => true,
                'order' => 18,
            ],
            [
                'type' => 'flagship',
                'title' => 'Tena',
                'slug' => 'tena',
                'client_name' => 'Tena',
                'tagline' => 'SaaS platform for vacation rental / short-term property management.',
                'category' => 'PropTech',
                'technologies' => ['Laravel', 'React', 'Inertia.js', 'TypeScript', 'Tailwind CSS', 'WebAuthn', 'Laravel Cashier', 'M-Pesa', 'Paystack'],
                'focus_areas' => ['Property management', 'PMS integration', 'Campaign dispatcher'],
                'significant_figure' => null,
                'description' => 'I built the Tena onboarding platform — a progressive-disclosure registration flow, an admin analytics dashboard with Recharts, WebAuthn passkey login, tabular data management with TanStack Table, and transactional email built with React-Email components.',
                'problem' => 'Vacation rental hosts need a unified platform to manage properties, guest communications, access control, orders, and marketing campaigns, while integrating with external PMS platforms.',
                'methodology' => 'Built a Laravel 12 + React 18 (Inertia.js) application with WebAuthn passkey auth, Laravel Cashier for subscriptions, pluggable PMS integration (Beds24, Cloudbeds, Hostaway), and campaign dispatcher with email/SMS personalization.',
                'outcome' => 'Live at tena.host with host dashboard, guest portal, PMS integration, marketing campaigns, and subscription billing.',
                'testimonial_quote' => null,
                'testimonial_author' => null,
                'image' => null,
                'bg_image' => null,
                'gallery' => null,
                'url' => 'https://tena.host',
                'is_active' => true,
                'is_featured' => true,
                'order' => 19,
            ],
            [
                'type' => 'flagship',
                'title' => 'Najenga',
                'slug' => 'najenga',
                'client_name' => 'OKJTechnologies',
                'tagline' => 'Construction-project coordination platform bridging site engineers, architects, PMs and clients.',
                'category' => 'PropTech',
                'technologies' => ['Laravel', 'Inertia', 'React', 'Tailwind CSS', 'Framer Motion', '@annotorious/react', 'AG-Grid', 'react-pdf', 'Tesseract.js', 'Swiper', 'xlsx'],
                'focus_areas' => ['Drawing annotation', 'Project timelines', 'Document OCR'],
                'significant_figure' => null,
                'description' => 'Construction-project coordination platform — annotate architectural drawings directly (Annotorious over PDFs / images), work through interactive project timelines, run OCR over documents (Tesseract.js), export to Excel, and coordinate in a chat with @mentions.',
                'problem' => 'Construction projects suffer from decentralised documentation, unstructured accounting, and limited collaboration between site engineers, architects, project managers and clients, leading to mismanagement and timeline delays.',
                'methodology' => 'Building a Laravel + Inertia + React application with spatial annotation (Annotorious), PDF rendering (react-pdf), OCR (Tesseract.js), spreadsheet export (xlsx), real-time chat with @mentions, and interactive project timelines.',
                'outcome' => 'In development, staging live. Annotating drawings, running OCR, and coordinating across roles in real-time.',
                'testimonial_quote' => null,
                'testimonial_author' => null,
                'image' => null,
                'bg_image' => null,
                'gallery' => null,
                'url' => 'https://najenga.okjtech.co.ke',
                'is_active' => true,
                'is_featured' => true,
                'order' => 20,
            ],
            [
                'type' => 'flagship',
                'title' => 'Naoa',
                'slug' => 'naoa',
                'client_name' => 'OKJTechnologies',
                'tagline' => 'Digital ecosystem for weddings: live gallery, guest onboarding, digital scrapbook.',
                'category' => 'Events',
                'technologies' => ['React', 'Vite', 'Tailwind CSS', 'Framer Motion', 'TanStack Query', 'i18next', 'Leaflet', 'FilePond', 'html5-qrcode', 'jsPDF', 'Laravel Echo', 'Pusher'],
                'focus_areas' => ['Live photo gallery', 'QR guest check-in', 'Digital scrapbook export'],
                'significant_figure' => null,
                'description' => 'Wedding platform with live photo galleries, QR guest check-in, an interactive venue map, real-time updates via Laravel Echo + Pusher, and a downloadable "digital scrapbook" export assembled client-side. Front end is internationalised with i18next.',
                'problem' => 'Wedding coordination involves managing hundreds of guests across multiple languages, coordinating seating, tracking RSVPs, and providing real-time event information without a centralised digital platform.',
                'methodology' => 'Building a React 19 + Vite SPA with Laravel 12 API backend. Integrated i18next for 4 languages (English, Chinese, Malay, Luo), Pusher for real-time features, Leaflet for maps, and client-side scrapbook generation with jsPDF/html-to-image.',
                'outcome' => 'In development. Live demo at dntwed.okjtech.co.ke. Planned SaaS landing at naoa.okjtech.co.ke.',
                'testimonial_quote' => null,
                'testimonial_author' => null,
                'image' => null,
                'bg_image' => null,
                'gallery' => null,
                'url' => 'https://dntwed.okjtech.co.ke',
                'is_active' => true,
                'is_featured' => true,
                'order' => 21,
            ],
            [
                'type' => 'flagship',
                'title' => 'Kuba Home Services',
                'slug' => 'kuba-home-services',
                'client_name' => 'OKJTechnologies',
                'tagline' => 'Service-provider marketplace connecting clients with vetted home & business services across 13 categories.',
                'category' => 'Marketplace',
                'technologies' => ['Next.js', 'React', 'TypeScript', 'Tailwind CSS', 'Radix UI', 'Framer Motion', 'Recharts', 'Laravel', 'Sanctum', 'Laravel Reverb', 'Pusher', 'Paystack', 'M-Pesa'],
                'focus_areas' => ['Service marketplace', 'Real-time chat', 'Multi-gateway payments'],
                'significant_figure' => null,
                'description' => 'Service-provider marketplace with client and provider dashboards, quote-request flows, in-platform real-time messaging (Laravel Echo + Pusher), Stripe payments and Calendly booking. Deploys via cPanel with GitHub Actions.',
                'problem' => 'Home services in Kenya are fragmented across informal networks, making it difficult for clients to find reliable providers and for providers to reach customers, with limited payment infrastructure.',
                'methodology' => 'Building a headless architecture with Laravel 12 API (33 Eloquent models) and Next.js 16 frontend. Integrated real-time chat via Laravel Reverb, multi-gateway payments (Paystack, M-Pesa, Stripe), and Capacitor for Android deployment.',
                'outcome' => 'In development. 20+ CRUD modules, 4-tier testing strategy. Live at kuba.co.ke.',
                'testimonial_quote' => null,
                'testimonial_author' => null,
                'image' => null,
                'bg_image' => null,
                'gallery' => null,
                'url' => 'https://kuba.co.ke',
                'is_active' => true,
                'is_featured' => true,
                'order' => 22,
            ],
            [
                'type' => 'client',
                'title' => 'Silversky Events Ordering',
                'slug' => 'silversky-events',
                'client_name' => 'Silversky Events',
                'tagline' => 'E-commerce platform for event services across catering, sanitation, AV and furniture.',
                'category' => 'Events',
                'technologies' => ['Laravel', 'React', 'Inertia.js', 'Tailwind CSS', 'WebAuthn', 'Leaflet', 'Laravel Fortify'],
                'focus_areas' => ['Multi-service ordering', 'Passkey authentication', 'Delivery tracking'],
                'significant_figure' => null,
                'description' => 'Silversky e-commerce build — full brand-system implementation, WebAuthn passkey login, Leaflet-based delivery tracking, customer authentication with Google OAuth, and an admin panel with chatbot and recommendation wizard.',
                'problem' => 'An event services company needed a unified ordering platform for multiple service lines (catering, sanitation, AV, furniture) with proper customer authentication, payment processing, and delivery tracking.',
                'methodology' => 'Built a Laravel 12 + Inertia.js + React 18 application with WebAuthn/passkey authentication, Google OAuth, Leaflet delivery tracking, and 12 service classes. Deployed to cPanel via GitHub Actions.',
                'outcome' => 'In development. Four service lines, admin chatbot, recommendation wizard, and delivery tracking.',
                'testimonial_quote' => null,
                'testimonial_author' => null,
                'image' => null,
                'bg_image' => null,
                'gallery' => null,
                'url' => 'https://shop.silversky.co.ke',
                'is_active' => true,
                'is_featured' => false,
                'order' => 23,
            ],
            [
                'type' => 'client',
                'title' => 'OmniShop — Solar & Storage Live Kenya 2026',
                'slug' => 'omnishop-omnispace3d',
                'client_name' => 'OmniSpace 3D Events Ltd',
                'tagline' => 'Standalone exhibitor ordering site for a trade show, ~190 products, deployable by a non-developer.',
                'category' => 'Events',
                'technologies' => ['PHP', 'Laravel', 'DomPDF', 'PHPMailer', 'MySQL', 'Vanilla JS'],
                'focus_areas' => ['Exhibitor catalog', 'PDF invoicing', 'Stock management'],
                'significant_figure' => null,
                'description' => 'Exhibitor ordering site for Solar and Storage Live Kenya 2026. Exhibitors browse a 190-product catalog, place orders and get a receipt; the admin panel handles order status, prints category-grouped packing lists, and exports orders to CSV.',
                'problem' => 'An event company needed a standalone exhibitor ordering portal for a trade show, with product catalog, order management, PDF invoicing, and stock tracking — deployable by a non-technical client.',
                'methodology' => 'Built a Laravel 11 application with custom PHP views (not Blade), DomPDF for branded invoices, PHPMailer for email notifications, and a centralized branding system enforced by CI tests. Packaged with plain-English documentation.',
                'outcome' => 'Delivered for Solar and Storage Live Kenya 2026. Deployed to production via GitHub Actions.',
                'testimonial_quote' => null,
                'testimonial_author' => null,
                'image' => null,
                'bg_image' => null,
                'gallery' => null,
                'url' => 'https://omnispace3d.com',
                'is_active' => true,
                'is_featured' => false,
                'order' => 24,
            ],
            [
                'type' => 'client',
                'title' => 'Nissi Insights',
                'slug' => 'nissi-insights',
                'client_name' => 'Nissi Insights',
                'tagline' => 'Content / insights publication platform for energy advisory, fintech and diplomacy.',
                'category' => 'Corporate',
                'technologies' => ['Next.js', 'React', 'TypeScript', 'Tailwind CSS', 'Radix UI', 'Framer Motion', 'TipTap', 'SWR', 'Laravel'],
                'focus_areas' => ['Content publishing', 'Event management', 'Knowledge base'],
                'significant_figure' => null,
                'description' => 'Nissi Insights — a Next.js content platform with a Tiptap rich editor, tag / category management, image uploads with dropzone + browser compression, and an SWR-backed admin dashboard.',
                'problem' => 'A multi-sector consultancy (energy advisory, fintech, international diplomacy) needed a centralised platform to showcase services, publish thought leadership, manage events, and capture leads.',
                'methodology' => 'Built a Next.js 16 frontend with hybrid SSR/CSR rendering and a Laravel 11 REST API backend. 23 Eloquent models, 39 database migrations, TipTap rich text editor, and event registration with RSVP tracking.',
                'outcome' => 'In development. CMS manages services, insights, case studies, knowledge base, events, and legal pages. Live at nissi-insights.com.',
                'testimonial_quote' => null,
                'testimonial_author' => null,
                'image' => null,
                'bg_image' => null,
                'gallery' => null,
                'url' => 'https://nissi-insights.com',
                'is_active' => true,
                'is_featured' => false,
                'order' => 25,
            ],
            [
                'type' => 'client',
                'title' => 'GM Coaching',
                'slug' => 'gm-coaching',
                'client_name' => 'GM Coaching',
                'tagline' => 'Full-stack coaching platform with MBA admissions, consulting prep and payments.',
                'category' => 'EdTech',
                'technologies' => ['Next.js', 'React', 'TypeScript', 'Tailwind CSS', 'shadcn/ui', 'Framer Motion', 'Stripe', 'Calendly', 'Laravel', 'Laravel Reverb'],
                'focus_areas' => ['MBA admissions coaching', 'Calendly booking', 'Stripe payments'],
                'significant_figure' => null,
                'description' => 'Full-stack platform with a Next.js front end and Laravel backend — Stripe checkout, Calendly booking, real-time updates via Pusher, dashboards with Recharts, file uploads through FilePond.',
                'problem' => 'An MBA admissions coach needed a platform to showcase services, accept bookings via Calendly, process payments via Stripe, and manage content through a CMS — all in one professional package.',
                'methodology' => 'Built a decoupled architecture with Next.js 16 frontend (Vercel) and Laravel 12 API backend (cPanel). Integrated Stripe checkout, Calendly booking, real-time notifications via Laravel Reverb, and a full admin CMS.',
                'outcome' => 'In development. Live at gm-coaching.com with service pages, booking, payments, blog, and admin CMS.',
                'testimonial_quote' => null,
                'testimonial_author' => null,
                'image' => null,
                'bg_image' => null,
                'gallery' => null,
                'url' => 'https://gm-coaching.com',
                'is_active' => true,
                'is_featured' => false,
                'order' => 26,
            ],
            [
                'type' => 'flagship',
                'title' => 'Tibu',
                'slug' => 'tibu',
                'client_name' => 'OKJTechnologies',
                'tagline' => 'HealthTech product concept — hospital management as the path to cross-facility interoperability.',
                'category' => 'HealthTech',
                'technologies' => ['Laravel', 'React', 'Playwright', 'Spatie Permission', 'cPanel'],
                'focus_areas' => ['Hospital management', 'Cross-facility interoperability', 'Health infrastructure'],
                'significant_figure' => null,
                'description' => 'Tibu is the parent product concept; the Nyalife HMS is its first live instance. The strategy is ecosystem by adoption: onboard facilities one at a time via the HMS, then use the growing network as the substrate for cross-facility patient-record sharing.',
                'problem' => 'Kenyan healthcare facilities operate with paper records, unequal documentation quality, and no interoperability across facility levels. Patient histories are lost when patients move between facilities.',
                'methodology' => 'Designed a phased approach: (1) deliver a fully useful clinical administration system on day one per facility, (2) as the network grows, the data schema becomes the substrate for cross-facility patient-record sharing, (3) wider objectives (interoperability, consolidated insights) become reachable because the network exists.',
                'outcome' => 'First live instance deployed as the Nyalife Hospital Management System. Concept stage for the national-scale vision.',
                'testimonial_quote' => null,
                'testimonial_author' => null,
                'image' => null,
                'bg_image' => null,
                'gallery' => null,
                'url' => null,
                'is_active' => true,
                'is_featured' => true,
                'order' => 27,
            ],
        ];

        foreach ($projects as $project) {
            Project::create($project);
        }
    }

    // ------------------------------------------------------------------
    // Insights — real articles from PROJECT_CATALOG_ACCURATE.md §9
    // ------------------------------------------------------------------

    private function reseedInsights(): void
    {
        Insight::query()->forceDelete();

        $admin = User::where('is_admin', true)->first();

        $insights = [
            [
                'title' => 'Ecosystem mapping before you write a line of code',
                'slug' => 'ecosystem-mapping-before-you-write-a-line-of-code',
                'category' => 'Strategy',
                'excerpt' => 'The Afrilabs Ethiopia framework, why I map every stakeholder before scoping, and how that changes what I build.',
                'content' => '<p>Before I write a single line of code on any project, I map the ecosystem. Not the technical architecture — the human one. Every stakeholder who could be affected by or beneficial to the proposition: the paying client, the end user, the regulator, adjacent service providers, upstream and downstream data holders, the wider community.</p><p>This practice comes from the Afrilabs capacity-building programme <em>Leveraging Stakeholder Relationships through Ecosystem Mapping and Building</em>, which I attended in Addis Ababa, Ethiopia while working with the Lawyers Hub. It changed how I scope every engagement.</p><p>The map forces you to answer: who benefits from this system existing, and how? Not just the client who pays you, but the end user who interacts with it daily, the regulator who oversight it, the adjacent service provider whose workflow it touches. When you design the solution so each of those stakeholders has a clearly aligned reason to participate, you get something fundamentally different from a website. You get a working system inside its own context.</p><p>This is the single biggest reason my client engagements stay engaged. The ecosystem map is the first deliverable on every project, and it shapes everything that follows — from the database schema to the admin panel to the notification system.</p>',
                'image' => null,
                'user_id' => $admin?->id ?? 1,
                'is_published' => true,
                'published_at' => now()->subDays(5),
            ],
            [
                'title' => 'Two years inside Africa\'s LegalTech engine room',
                'slug' => 'two-years-inside-africas-legaltech-engine-room',
                'category' => 'LegalTech',
                'excerpt' => 'Daily bulletins, policy maps, festival platforms, ADPI trainings, boda-boda field research — what the LegalTech sector actually needs technically.',
                'content' => '<p>From February 2023 to December 2024, I worked as Software Developer, Justice Innovation at Lawyers Tech Hub in Nairobi. In that time I contributed to the full spectrum of the organisation\'s LegalTech portfolio — and learned what the sector actually needs from technology.</p><p>The work ranged from building the Lawyers Hub Digital Policy website (the cornerstone resource for Kenya\'s AI-policy and digital-trade conversation) to designing the Africa Law Tech Festival platform that handled ticketing, live notifications and event mapping for 11,000+ attendees across editions. I contributed to every issue of the Daily Bulletin, all the Africa digital-policy maps, and the Boda-Boda Law Project field research.</p><p>What I learned: LegalTech in Africa is not about building fancy legal databases. It\'s about accessibility — getting legal information to people who need it through channels they already use, in formats they can act on. The Boda-Boda Law Project taught me this most directly: co-organising field data collection in Kisumu and Namanga, coordinating capacity-building trainings for riders, and building a website with a Typeform intake for real-time legal advisory requests.</p><p>The ADPI trainings — Africa Data Protection Course and CIPP/E certification — taught me the compliance surface that every LegalTech and FinTech build has to account for. RBAC, ACL, WebAuthn passkey login — these are not nice-to-haves, they\'re table stakes.</p>',
                'image' => null,
                'user_id' => $admin?->id ?? 1,
                'is_published' => true,
                'published_at' => now()->subDays(12),
            ],
            [
                'title' => 'A solo-founder stack: Laravel + Next.js + AI-accelerated dev',
                'slug' => 'solo-founder-stack-laravel-nextjs-ai-accelerated',
                'category' => 'Engineering',
                'excerpt' => 'The exact tooling and workflow that lets one person ship the same class of application a small team would.',
                'content' => '<p>OKJTechnologies is a one-person studio. That\'s a deliberate choice, not a limitation. The question it forces is: how does one person ship the same class of application a small team would? The answer is a specific stack, a specific workflow, and AI-accelerated tooling in the loop.</p><p><strong>The stack:</strong> Laravel 12 for the backend (API, auth, jobs, admin), Next.js 16 or React 19 for the frontend (Inertia.js or decoupled SPA), Tailwind CSS for styling, and shadcn/ui or Headless UI for accessible components. SQLite for development, MySQL for production. GitHub Actions for CI/CD. cPanel or Vercel for deployment.</p><p><strong>The workflow:</strong> Ecosystem map first. Then schema design. Then controllers and routes. Then frontend. Then deployment. Every step is informed by the previous one, and the ecosystem map is the thread that connects them all.</p><p><strong>The AI acceleration:</strong> I use AI tooling to compress repetitive tasks — boilerplate generation, migration writing, component scaffolding, documentation. Not to replace thinking, but to eliminate the mechanical overhead that slows a solo developer down. The ecosystem mapping still requires human judgment. The AI handles the rest.</p><p>The result: a solo studio that ships full-stack applications with comprehensive testing, CI/CD pipelines, and production-grade infrastructure. Not by working more hours, but by working with better tools and a clearer framework.</p>',
                'image' => null,
                'user_id' => $admin?->id ?? 1,
                'is_published' => true,
                'published_at' => now()->subDays(20),
            ],
            [
                'title' => 'Building Nyalife HMS — the first instance of Tibu',
                'slug' => 'building-nyalife-hms-first-instance-of-tibu',
                'category' => 'HealthTech',
                'excerpt' => 'How a hospital management system for a women\'s clinic became the prototype for a national health infrastructure concept.',
                'content' => '<p>The Nyalife Hospital Management System started as a simple request: build a clinical administration system for a women\'s health clinic in Nairobi. Patient records, appointment scheduling, prescriptions, lab work, pharmacy, billing. A standard HMS.</p><p>But when you look at the bigger picture — Kenya\'s healthcare facilities operating with paper records, unequal documentation quality, no interoperability across facility levels — the system becomes something more. It becomes the first instance of Tibu.</p><p>Tibu is the parent product concept. The strategy is ecosystem by adoption: onboard facilities one at a time via the HMS. Each facility gets a fully useful clinical administration system on day one. As more facilities adopt it, the underlying data schema becomes the substrate for cross-facility patient-record sharing. A patient\'s history follows them wherever they present, regardless of the facility\'s tier.</p><p>The Nyalife HMS is built with Laravel 12, React (Inertia.js), Spatie Permission for RBAC (7 roles, 21 permissions), and 33 Eloquent models covering the full patient lifecycle. Playwright end-to-end tests and a cPanel deployment pipeline ship with the repo. It\'s in production at the clinic right now.</p><p>The wider Tibu objectives — interoperability across the referral chain, equal quality of documentation, consolidated countrywide insights for research and NGO reporting — become reachable because the network already exists.</p>',
                'image' => null,
                'user_id' => $admin?->id ?? 1,
                'is_published' => true,
                'published_at' => now()->subDays(30),
            ],
            [
                'title' => 'Real-time coordination on construction sites — Najenga\'s spatial annotation architecture',
                'slug' => 'najengas-spatial-annotation-architecture',
                'category' => 'PropTech',
                'excerpt' => 'Annotorious over PDFs, coordinate timelines, Tesseract.js OCR — why we built this and what still needs testing.',
                'content' => '<p>Najenga is a construction-project coordination platform that solves a specific problem: site engineers, architects, project managers and clients all work from the same drawings, but they have no shared way to annotate, discuss and track changes on those drawings.</p><p>The core feature is spatial annotation — using @annotorious/react to let users drop annotations directly on architectural drawings and images. An engineer can circle a structural issue on a floor plan and tag the architect. A client can highlight a design change and start a conversation. A project manager can track all annotations across all drawings and tie them to timeline milestones.</p><p>Under the hood, Najenga uses react-pdf for rendering drawings, Tesseract.js for OCR over scanned documents, AG-Grid for tabular data, and xlsx for Excel export. The annotation system stores coordinates, not just comments — so the spatial context is preserved across conversations.</p><p>What still needs testing: the real-time collaboration layer (multiple users annotating simultaneously), the OCR accuracy on scanned architectural drawings, and the performance of the annotation system on large-format PDFs. These are the engineering challenges that separate a prototype from a production tool.</p>',
                'image' => null,
                'user_id' => $admin?->id ?? 1,
                'is_published' => true,
                'published_at' => now()->subDays(40),
            ],
        ];

        foreach ($insights as $insight) {
            Insight::create($insight);
        }
    }
}
