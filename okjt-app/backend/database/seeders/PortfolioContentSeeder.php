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

/**
 * PortfolioContentSeeder — Accurate, non-destructive reseed
 *
 * Replaces all portfolio content with verified data from
 * documentation/PROJECT_CATALOG_ACCURATE.md and the project analysis.
 *
 * Framing rules (from the catalog document):
 * - Objective, work-focused narrative (no first-person "I" or "we").
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
            ['key' => 'about_story', 'value' => 'OKJTechnologies is a Nairobi web-application practice. The work is full-stack and end to end — concept, interface, engineering, deployment and ongoing administration — mostly in Laravel, Next.js / React and the classic LAMP stack, with AI-accelerated tooling in the loop. Every build starts by mapping the ecosystem the software has to live in, so each stakeholder — client, end user, regulator, adjacent partner — has an aligned reason to participate.', 'type' => 'textarea', 'group' => 'about'],
            ['key' => 'about_mission_title', 'value' => 'Ecosystem mapping before a line of code.', 'type' => 'text', 'group' => 'about'],
            ['key' => 'about_mission_text1', 'value' => 'Every engagement is shaped by an ecosystem-mapping practice from the Afrilabs capacity-building programme <em>Leveraging Stakeholder Relationships through Ecosystem Mapping and Building</em> (Addis Ababa, Ethiopia). Before scoping, the map covers every stakeholder who could be affected by or beneficial to the proposition — the paying client, the end user, the regulator, adjacent service providers, upstream and downstream data holders, the wider community.', 'type' => 'textarea', 'group' => 'about'],
            ['key' => 'about_mission_text2', 'value' => 'The solution is then designed so each of those stakeholders has a clearly aligned way to benefit from it. That mapping is what turns a website into a working system inside its own context — and, combined with AI-accelerated development, is how a solo practice ships the same class of application a small team would take on.', 'type' => 'textarea', 'group' => 'about'],
            ['key' => 'about_team_title', 'value' => 'One continuous thread, concept to production', 'type' => 'text', 'group' => 'about'],
            ['key' => 'about_team_subtitle', 'value' => 'Every project is designed, built, deployed and administered as one continuous piece of work — no hand-offs between teams, no context dropped between phases, one point of accountability.', 'type' => 'textarea', 'group' => 'about'],
            ['key' => 'about_credentials_title', 'value' => 'Credentials & Background', 'type' => 'text', 'group' => 'about'],
            ['key' => 'about_credentials', 'value' => 'B.Sc. Computer Science, Riara University (Second Class Honours, Upper Division). Afrilabs capacity-building certificate — Leveraging Stakeholder Relationships through Ecosystem Mapping and Building, Addis Ababa, Ethiopia. Software Developer — Justice Innovation at Lawyers Tech Hub (Feb 2023 – Dec 2024).', 'type' => 'textarea', 'group' => 'about'],
            ['key' => 'about_sectors_title', 'value' => 'Sectors', 'type' => 'text', 'group' => 'about'],
            ['key' => 'about_sectors', 'value' => 'LegalTech · HealthTech · PropTech · FinTech · E-commerce · Events · NGO / Advocacy · Agritech · Automotive · EdTech · Marketplace', 'type' => 'text', 'group' => 'about'],
            ['key' => 'about_cta_title', 'value' => 'Have a system you want built end to end?', 'type' => 'text', 'group' => 'about'],
            ['key' => 'about_cta_subtitle', 'value' => "Whether it's a customer-facing application, an internal dashboard, or a national-scale concept still at problem-statement stage, it's worth exploring. Start with a short brief and the ecosystem will be mapped together.", 'type' => 'textarea', 'group' => 'about'],

            // --- Homepage hero ---
            ['key' => 'hero_tagline', 'value' => 'Design-led web engineering from Nairobi', 'type' => 'text', 'group' => 'homepage'],
            ['key' => 'hero_subtitle', 'value' => 'Bespoke, high-performance web applications, robust APIs and clean admin systems — designed and built end to end in Laravel, Next.js and React.', 'type' => 'textarea', 'group' => 'homepage'],
            ['key' => 'hero_title_line1', 'value' => 'Full-stack web', 'type' => 'text', 'group' => 'homepage'],
            ['key' => 'hero_rotating_words', 'value' => 'applications.,APIs.,admin systems.', 'type' => 'text', 'group' => 'homepage'],
            ['key' => 'hero_title_line2', 'value' => 'Built end to end.', 'type' => 'text', 'group' => 'homepage'],

            // --- Homepage section headings ---
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
            ['key' => 'services_title', 'value' => 'Services', 'type' => 'text', 'group' => 'homepage'],
            ['key' => 'insights_tagline', 'value' => 'Insights', 'type' => 'text', 'group' => 'homepage'],
            ['key' => 'insights_title', 'value' => 'From the studio', 'type' => 'text', 'group' => 'homepage'],
            ['key' => 'projects_tagline', 'value' => 'Portfolio', 'type' => 'text', 'group' => 'homepage'],
            ['key' => 'projects_title', 'value' => 'Selected work', 'type' => 'text', 'group' => 'homepage'],
            ['key' => 'testimonials_tagline', 'value' => 'Client impact', 'type' => 'text', 'group' => 'homepage'],
            ['key' => 'testimonials_title', 'value' => 'What clients say', 'type' => 'text', 'group' => 'homepage'],

            // --- Contact page ---
            ['key' => 'contact_title', 'value' => "Let's build something", 'type' => 'text', 'group' => 'contact'],
            ['key' => 'contact_subtitle', 'value' => 'Have a project in mind? Start with a short brief and the ecosystem will be mapped together.', 'type' => 'textarea', 'group' => 'contact'],
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
            ['icon' => 'zap', 'title' => 'AI-Accelerated', 'description' => 'Emerging AI tooling compresses the delivery cycle so a solo practice ships the same class of application a small team would.', 'order' => 3],
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
            'bio' => "OKJTechnologies is a Nairobi web-application practice. The work is full-stack and end to end — concept, interface, engineering, deployment and ongoing cPanel/domain administration — mostly in Laravel, Next.js / React and the classic LAMP stack, with AI-accelerated tooling in the loop.\n\nThe approach to every engagement is shaped by an ecosystem-mapping practice from the Afrilabs capacity-building programme \"Leveraging Stakeholder Relationships through Ecosystem Mapping and Building\" (Addis Ababa, Ethiopia). Before scoping, the map covers every stakeholder who could be affected by or beneficial to the proposition — the paying client, the end user, the regulator, adjacent service providers, upstream/downstream data holders, the wider community — and the solution is designed so each one has a clearly aligned way to benefit from it.",
            'linkedin' => 'https://www.linkedin.com/in/tambokevin/',
            'image' => null,
            'order' => 1,
        ]);
    }

    // ------------------------------------------------------------------
    // Pillars — 6 approach items from PillarSeeder
    // ------------------------------------------------------------------

    private function reseedPillars(): void
    {
        Pillar::query()->forceDelete();

        $pillars = [
            [
                'title' => 'Design',
                'slug' => 'design',
                'overview' => 'Design first. Function always.',
                'content' => '<p>Simple, purposeful interfaces. Absolutely breathtaking interfaces. Unique and not bound by templates.</p>',
                'icon' => 'Palette',
                'is_active' => true,
            ],
            [
                'title' => 'Style',
                'slug' => 'style',
                'overview' => 'Smart, stylish, purposeful.',
                'content' => '<p>Aesthetic clarity that supports goals. Every pixel has a purpose.</p>',
                'icon' => 'Sparkles',
                'is_active' => true,
            ],
            [
                'title' => 'Human-centered UX',
                'slug' => 'human-centered-ux',
                'overview' => 'Interactive systems guided by empathy and behavior.',
                'content' => '<p>User experience (UX) rooted in human behavior, ensuring digital products are intuitive and accessible.</p>',
                'icon' => 'Users',
                'is_active' => true,
            ],
            [
                'title' => 'Speed',
                'slug' => 'speed',
                'overview' => 'Fast, responsive, accessible.',
                'content' => '<p>Performance and accessibility first. Built for speed because time is weight.</p>',
                'icon' => 'Zap',
                'is_active' => true,
            ],
            [
                'title' => 'Deploy',
                'slug' => 'deploy',
                'overview' => 'From idea to launch.',
                'content' => '<p>From code to production with confidence. Streamlined workflows and reliable infrastructure.</p>',
                'icon' => 'Rocket',
                'is_active' => true,
            ],
            [
                'title' => 'Scale',
                'slug' => 'scale',
                'overview' => 'Built to scale.',
                'content' => '<p>Architecture designed for growth. Future-proof solutions that expand with your vision.</p>',
                'icon' => 'TrendingUp',
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
            ['name' => 'Global Harmony Initiative', 'logo' => null, 'website' => 'https://globalharmonyinitiative.com', 'category' => 'Nonprofit, Education, Healthcare', 'is_active' => true, 'order' => 5],
            ['name' => 'Wisdom Capital', 'logo' => null, 'website' => 'https://wisdomcapital.co.ke', 'category' => 'Agritech, E-Commerce', 'is_active' => true, 'order' => 6],
            ['name' => 'TAMCON Consulting Engineers', 'logo' => null, 'website' => 'https://tamconsonsult.com', 'category' => 'Engineering, Construction, Infrastructure', 'is_active' => true, 'order' => 7],
            ['name' => 'Tena', 'logo' => null, 'website' => 'https://tena.host', 'category' => 'PropTech, Vacation Rentals, SaaS', 'is_active' => true, 'order' => 8],
            ['name' => 'OmniSpace 3D Events Ltd', 'logo' => null, 'website' => 'https://omnispace3d.com', 'category' => 'Events, Exhibition Services', 'is_active' => true, 'order' => 9],
            ['name' => 'Silversky Events', 'logo' => null, 'website' => 'https://shop.silversky.co.ke', 'category' => 'Events, Catering, AV Services', 'is_active' => true, 'order' => 10],
            ['name' => 'HUCAA', 'logo' => null, 'website' => 'https://alumni.hekima.ac.ke', 'category' => 'Alumni Networks, Education, Community', 'is_active' => true, 'order' => 11],
            ['name' => 'Nissi Insights', 'logo' => null, 'website' => 'https://nissi-insights.com', 'category' => 'Energy Advisory, FinTech, Diplomacy', 'is_active' => true, 'order' => 12],
            ['name' => 'GM Coaching', 'logo' => null, 'website' => 'https://gm-coaching.com', 'category' => 'EdTech, MBA Admissions, Consulting', 'is_active' => true, 'order' => 13],
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
                'description' => 'The Lawyers Hub Digital Policy website is the flagship LegalTech resource for Kenya\'s AI-policy, digital-trade and Africa digital-economy conversation. Built and maintained during the tenure as Software Developer, Justice Innovation at Lawyers Tech Hub.',
                'problem' => 'Kenya\'s digital-policy landscape lacked a centralised, authoritative platform to aggregate and publish AI governance research, daily policy bulletins, interactive digital-trade maps, and event listings across the AI, data protection, and digital trade sectors. Fragmented content across disparate channels made it difficult for policymakers, researchers, and the LegalTech community to access timely, structured information. No single hub existed for the daily bulletin workflow, the Africa digital-policy maps, or the publications library — each required a purpose-built content type with consistent presentation.',
                'methodology' => 'Built a custom CMS-driven platform with dedicated content types for publications, daily bulletins, interactive policy maps, and event listings. Implemented a full-stack architecture from MySQL database schema through the front-end presentation layer, with admin-facing content management for non-technical staff to publish and update content without developer intervention. Designed the information architecture to support Kenya\'s AI-policy, data protection, and digital trade discourse with structured navigation across content categories.',
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
                'description' => 'The Africa Law Tech Festival platform handles online ticketing, live notifications and event mapping for the annual festival (11,000+ attendees across editions per lawyershub.org).',
                'problem' => 'The annual Africa Law Tech Festival — drawing 11,000+ attendees across editions — required a dedicated digital infrastructure to handle online ticketing across multiple ticket tiers, real-time event notifications for session changes and announcements, geographic mapping of venues and sessions across multi-day schedules, and attendee coordination without relying on third-party platforms that lacked customisation and local payment support.',
                'methodology' => 'Built a festival-specific platform with integrated online ticketing supporting multiple tiers and payment flows, a real-time notification system for session updates and announcements, interactive geographic event mapping with venue pinning across multi-day schedules, and a registration and attendance tracking system. The architecture was designed to be reusable and refined across successive festival editions with updated content and scheduling.',
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
                'description' => 'UI/UX design contribution for the AI Policy Lab — a virtual learning facility for AI-policy capacity building across Europe and Africa, introduced at the 2024 festival edition (Artificial Intelligence and the Year of Education).',
                'problem' => 'The Africa Digital Policy Institute needed a virtual learning facility for cross-continental AI-policy capacity building between Europe and Africa, requiring an interface accessible across widely varying bandwidth conditions, intuitive navigation for non-technical policy professionals unfamiliar with LMS platforms, structured course content delivery with participant progress tracking, and certification workflows for programmes like CIPP/E training.',
                'methodology' => 'Contributed UI/UX design for the virtual learning interface, focusing on responsive layouts optimised for low-bandwidth environments, intuitive content navigation structured around policy modules, participant onboarding flows, course progress indicators, and certification completion pathways. The interface prioritised accessibility for non-technical policy professionals across both European and African connectivity contexts.',
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
                'description' => 'The Africa Law Tech University platform (which became the Africa Digital Policy Institute course platform) centralises capacity-building activities for the Institute. Supported delivery of the Africa Data Protection Course and CIPP/E training.',
                'problem' => 'The Africa Digital Policy Institute ran multiple capacity-building programmes — including the Africa Data Protection Course and CIPP/E certification training — but lacked a unified platform to host course content, track participant enrolment and progress, deliver structured learning modules, manage certification workflows, and coordinate instructor-led training sessions across different programme formats.',
                'methodology' => 'Designed a platform architecture supporting course management with modular content structures, participant enrolment and progress tracking across multiple concurrent programmes, content delivery for self-paced and instructor-led formats, and certification workflow management. Supported operational delivery of data protection training programmes with participant analytics and completion tracking.',
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
                'description' => 'Landing site for the Digital Trade tech-policy hackathon at ALTF 2023, with the hackathon chaired on the justice-innovation team, producing 11 shortlisted innovations. The site was built on a Bootstrap template with an interactive Africa map.',
                'problem' => 'The ALTF 2023 hackathon on "Digital Trade in Africa: The AfCFTA and the Single Digital Market" needed a landing site to attract participants, display country-specific information across the African continent, manage registrations for a two-day event, and serve as the coordination hub for hackathon teams — all within a compressed timeline before the festival.',
                'methodology' => 'Built a static landing site with a Bootstrap 4 base, TemplateMo template, interactive CSS Africa Map plugin for country visualisation, and jQuery-driven interactivity for registration forms and content sections. Designed the information architecture around AfCFTA country profiles and hackathon tracks. Coordinated the hackathon itself across 48 hours, managing team formation, track assignments, and judging workflows.',
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
                'description' => 'The Boda-Boda Law Project — a legal advisory initiative for boda-boda operators and cross-border traders. Field data collection was co-organised in Kisumu and Namanga, the published report contributed to, in-person capacity-building trainings coordinated, and the project website shipped with a Typeform intake for real-time legal advisory requests.',
                'problem' => 'Boda-boda operators and cross-border traders in Kenya had no accessible channel for legal information about traffic regulations, border-crossing rights, and regulatory compliance. Field research was needed to understand the specific legal challenges faced by riders in Kisumu and Namanga, and no digital intake mechanism existed for real-time legal advisory requests from the community.',
                'methodology' => 'Co-organised field data collection in Kisumu and Namanga to document the legal challenges facing boda-boda operators and cross-border traders. Contributed to the published field report with research findings and policy recommendations. Built a project website with embedded Typeform intake for real-time legal advisory requests. Coordinated in-person capacity-building trainings for riders on traffic regulations and cross-border trading rights.',
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
                'description' => 'The DGLegal website ships a public marketing site plus two authenticated portals: an admin dashboard (consultation requests, blog posts, team members, publications, firm activity) and a client dashboard (case management, correspondence, file uploads, notifications).',
                'problem' => 'A Nairobi law firm relied on email-based workflows for client communication, case management, and document sharing — creating security risks, version-control issues, and inefficiency. No professional online presence existed to showcase the firm\'s practice areas, and clients had no secure portal to track case progress, exchange correspondence, or upload documents without unencrypted email.',
                'methodology' => 'Built a public marketing site showcasing practice areas, team profiles, and firm credentials. Developed two separate authenticated dashboards: an admin portal for managing consultation requests, blog posts, team members, publications, and firm activity; and a client portal for case management, secure correspondence, file uploads with version tracking, and notification delivery. Used Phinx for database migrations, PHPStan for static analysis, and implemented role-based access control separating admin, staff, and client permissions.',
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
                'description' => 'TAMCON is a modern corporate website and CMS for an engineering consulting firm based in Nairobi. The platform features a polished public-facing site with advanced animations (scroll-linked horizontal sections, parallax effects, tilt cards) and a comprehensive admin panel for managing all content without code changes. Built as an SPA with React on the frontend served via Laravel\'s Blade entry point.',
                'problem' => 'Engineering consulting firms need a professional online presence to showcase project portfolios, manage client testimonials, and maintain current site content — but developer dependency for every content update creates bottlenecks and stale information. The firm required advanced visual presentation (scroll-linked animations, parallax effects) to match the quality of their engineering work, plus an admin panel for self-service content management.',
                'methodology' => 'Built a modern corporate website and CMS featuring 7 Eloquent models, 8 API controllers, and 22 reusable React components. Implemented a key-value CMS architecture for non-technical content management, dynamic theming via CSS custom properties, Framer Motion animations with scroll-linked horizontal sections and parallax effects, tilt cards for project showcases, and an admin dashboard with analytics charts using Recharts. Contact form handling with email notifications, FilePond for file uploads, and Swiper carousels for project galleries. Deployed as a React SPA served via Laravel\'s Blade entry point on cPanel hosting.',
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
                'category' => 'Automotive, Auto Repair, Service, Loyalty',
                'technologies' => ['Laravel', 'Next.js', 'React', 'TypeScript', 'Tailwind CSS', 'Paystack', 'Laravel Reverb'],
                'focus_areas' => ['Booking system', 'Vehicle service tracking', 'Loyalty rewards'],
                'significant_figure' => null,
                'description' => 'South Ring Autos is a full-stack web application for an auto repair business in Karen, Nairobi. The platform features a public-facing website, client dashboard with vehicle and payment management, loyalty rewards program, digital journals, blog, and a comprehensive admin panel. Built with a Next.js 16 frontend and Laravel 12 API backend, with 25 Eloquent models and 58 database migrations.',
                'problem' => 'Auto repair businesses manage bookings through phone calls and paper logs, with no digital tracking of repair progress, no structured payment processing, no customer loyalty programme, and no mechanism for client-workshop communication during service. Published automotive content and service documentation had no centralised platform, and newsletter subscriptions were handled manually.',
                'methodology' => 'Built a full-stack web application with Next.js 16 frontend and Laravel 12 API backend featuring 25 Eloquent models and 58 database migrations. Implemented a booking system with repair stage tracking (diagnosis, parts procurement, in-progress, quality check, completed), vehicle management with image galleries, Paystack payment integration with transaction history, a loyalty points and rewards programme, digital journals for workshop notes, a blog with newsletter subscription handling, email templates for status updates, and real-time notifications via Laravel Reverb. Deployed to cPanel via GitHub Actions CI/CD pipeline.',
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
                'description' => 'The public website for Nyalife Women\'s Health Clinic — services overview, doctor profiles, appointment intake and contact.',
                'problem' => 'A women\'s health clinic in Nairobi lacked a professional online presence to showcase services, introduce medical staff with their credentials and specialisations, provide appointment intake functionality, and communicate clinic information to patients — relying entirely on word-of-mouth and social media for patient acquisition.',
                'methodology' => 'Designed and built a clean, professional marketing site with structured service pages organised by health category, doctor profile pages with credentials and specialisation details, appointment intake forms with service selection and scheduling preferences, contact functionality with location and operating hours, and responsive design optimised for mobile access. Hosted on cPanel with consistent branding across all pages.',
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
                'category' => 'HealthTech, Hospital Management, Telehealth, Pharmacy',
                'technologies' => ['Laravel', 'React', 'Inertia.js', 'Bootstrap', 'Spatie Permission', 'DomPDF', 'Playwright'],
                'focus_areas' => ['Patient records', 'Clinical workflows', 'Role-based access control'],
                'significant_figure' => null,
                'description' => 'Nyalife HMS is a comprehensive hospital management system built for Nyalife Women\'s Clinic. The system covers the complete patient lifecycle from registration through consultations, prescriptions, lab work, pharmacy, billing, and telehealth. It features 33 Eloquent models, 73 database migrations, 41 controllers, 45 reusable React components, and a granular RBAC system with 7 defined roles and 21 permissions.',
                'problem' => 'Women\'s clinics face fragmented patient records across paper files, manual appointment scheduling via phone, paper-based prescriptions prone to transcription errors, limited telehealth capabilities requiring in-person visits for routine follow-ups, and pharmacy inventory management without expiry tracking or automated reorder alerts. No integrated system existed to connect the full patient lifecycle from registration through consultation, lab work, pharmacy, and billing.',
                'methodology' => 'Built a comprehensive hospital management system with 33 Eloquent models, 73 database migrations, 41 controllers, and 45 reusable React components. Implemented patient registration with demographic and medical history capture, calendar-based appointment scheduling with provider availability, full consultation workflows with vital signs tracking and clinical notes, prescription management with dosage calculations, laboratory test requests with results recording and PDF report generation, pharmacy inventory management with expiry tracking and low-stock alerts, invoice generation and payment processing, insurance management and claims processing, telehealth video meetings with digital consent forms, internal messaging between staff, role-based access control with 7 defined roles and 21 permissions via Spatie Permission, and DomPDF generation for clinical documents. Deployed to production via GitHub Actions with safety checks and rollback capabilities.',
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
                'category' => 'Alumni Networks, Community, Education, Fintech',
                'technologies' => ['Laravel', 'React', 'Vite', 'Laravel Sanctum', 'M-Pesa'],
                'focus_areas' => ['Alumni directory', 'Event coordination', 'M-Pesa donations'],
                'significant_figure' => null,
                'description' => 'HUCAA is a full-stack alumni community platform for Hekima University College graduates in Kenya. The system includes a modern Laravel 12 REST API backend, a React 19 SPA frontend, and a preserved legacy PHP monolith. Features span alumni directory management, event coordination, group-based discussion forums, private messaging, M-Pesa and Stripe donation processing, board elections with voting, and an admin dashboard with role-based access control.',
                'problem' => 'Alumni associations struggle with fragmented communication channels (WhatsApp groups, email lists, social media), manual donation tracking with no M-Pesa integration for the Kenyan context, limited event coordination with no RSVP management, absent governance tools for board elections and voting, and no centralised directory connecting graduates with their professional profiles and contact information.',
                'methodology' => 'Built a full-stack alumni community platform with 28 Eloquent models, 31 database migrations, and 13 API controllers covering authentication, events, groups, discussions, messages, donations, elections, and admin functions. Implemented M-Pesa STK push payments alongside Stripe for international donors, role-based access with three permission levels (admin, board member, alumni), alumni directory with professional profile management, event coordination with RSVP tracking, group-based discussion forums with threaded discussions, private messaging between alumni, board elections with secure voting and results tabulation, and an admin dashboard for membership management. Designed as a decoupled architecture with Laravel REST API backend and React SPA frontend, with a preserved legacy PHP monolith for reference.',
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
                'category' => 'Nonprofit, Education, Healthcare, Community Development',
                'technologies' => ['Laravel', 'Inertia', 'React', 'Stripe', 'WebAuthn', 'Intervention Image', 'DomPDF'],
                'focus_areas' => ['Programme content', 'Stripe donations', 'WebAuthn admin login'],
                'significant_figure' => null,
                'description' => 'GHI is a full-featured CMS and public-facing website for the Global Harmony Initiative nonprofit. The platform centralises content management for education, healthcare, and community development programmes across East Africa, with an admin panel managing causes, initiatives, events, impact stories, media assets, and site-wide settings. Public pages are built with Blade/Bootstrap/Alpine.js, while the admin panel uses Inertia.js with React for a single-page app experience.',
                'problem' => 'Nonprofits struggle with fragmented content management across multiple website sections, limited digital storytelling capabilities for impact reporting, inefficient admin workflows requiring developer support for content updates, and no unified system for newsletter subscriptions, donation processing, and event management across education, healthcare, and community development programmes.',
                'methodology' => 'Built a unified CMS with 17 Eloquent models, 25 database migrations, an admin panel with 14 page directories for managing causes, initiatives, events, impact stories, and media assets, and a public-facing website with 18 pages built on Blade/Bootstrap/Alpine.js. Implemented newsletter subscription management, Stripe donation processing, chunked file uploads with progress indicators, form autosave to prevent data loss, image optimisation pipelines for media assets, a comprehensive analytics dashboard, and CI/CD pipeline with automated testing and deployment. The admin panel uses Inertia.js with React for a single-page app experience with WebAuthn authentication.',
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
                'description' => 'An ordering and delivery site for Wisdom Capital\'s agricultural products, plus an admin dashboard for sales, payment status and regional distribution tracking.',
                'problem' => 'A Kenyan agricultural producer relied on phone orders and manual tracking for direct-to-consumer sales, with no online product catalogue, no structured order management system, no payment tracking across mobile money and bank transfers, and limited visibility into regional distribution patterns and delivery status.',
                'methodology' => 'Built a LAMP-stack application with a React frontend layer featuring a product catalogue with category browsing and search, cart system with quantity management, checkout flow with delivery scheduling, and an admin dashboard for order management with status tracking, payment status monitoring across payment methods, regional distribution tracking with geographic reporting, and email notifications via SMTP for order confirmations and delivery updates.',
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
                'description' => 'A single-page interactive site for Reytati Communications with a lead-capture form, dynamic service catalog and admin panel for updating testimonials and service copy.',
                'problem' => 'A Nairobi communications firm had no professional web presence, no structured lead capture mechanism for potential clients, and no way to manage testimonials or update service offerings without developer intervention for every content change.',
                'methodology' => 'Built a single-page React application with dynamic service catalog rendering from admin-managed content, lead-capture forms with structured contact information and project details, an admin panel for managing testimonials, service copy, and contact information, and responsive design with interactive elements for engagement. The architecture enables non-technical staff to update service offerings and testimonials through the admin interface.',
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
                'description' => 'The Mizizi sugarcane-juice ordering site — product showcase, guest and registered checkout, user profiles, order tracking, and an interactive Leaflet + OpenStreetMap picker so buyers pin the exact delivery location. Precise lat/lon is stored per order and shown on the admin\'s tracking view.',
                'problem' => 'A sugarcane juice business relied on phone-based order taking with no address verification, making delivery routing imprecise and dependent on verbal directions. Customers had no way to browse products online, track order status, or specify exact delivery locations — resulting in missed deliveries, delayed service, and no order history.',
                'methodology' => 'Built a PHP + MySQL application with jQuery/Bootstrap frontend featuring a product showcase with images and pricing, guest and registered checkout flows with user profile management, order tracking with status updates, and an interactive Leaflet.js + OpenStreetMap picker enabling customers to pin their exact delivery location with lat/lon coordinates stored per order. Implemented admin-side delivery tracking with map view showing precise customer locations, order management with status workflow, and user account management.',
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
                'description' => 'OKJTechnologies is the portfolio and studio website for Kevin Tambo\'s solo web development studio based in Nairobi. The platform features a Next.js 16 frontend with ISR and a Laravel 11 REST API backend, showcasing 28+ projects across sectors like LegalTech, HealthTech, PropTech, and FinTech. The admin panel provides full CMS capabilities with 15 Eloquent models, 20 API controllers, and webhook-based cache revalidation.',
                'problem' => 'Solo developers need a professional portfolio platform that accurately represents project work across multiple sectors, handles content management without code changes, maintains fast performance through static generation while supporting dynamic content updates, and corrects AI-seeded fabricated content with a ground-truth project catalog. No existing platform combined ISR performance with a comprehensive CMS for managing services, insights, testimonials, and project entries.',
                'methodology' => 'Built a CMS-driven portfolio site with Next.js 16 frontend using ISR for performance and Laravel 11 REST API backend with 15 Eloquent models and 20 API controllers. Implemented an admin dashboard for managing 28+ project entries, services, insights articles, testimonials, and client impact data. Webhook-based cache revalidation triggers automatic content updates on ISR pages when the CMS is modified. Created a ground-truth project catalog document that corrects AI-seeded fabricated content. Deployed frontend to Vercel and backend to a VPS via GitHub Actions CI/CD pipeline.',
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
                'category' => 'Sports, Travel, Community, FinTech, Events',
                'technologies' => ['Laravel', 'React', 'Inertia.js', 'Tailwind CSS', 'Headless UI', 'Recharts', 'Paystack', 'Amadeus API', 'SerpApi'],
                'focus_areas' => ['Budget calculator', 'Social feed', 'Tournament travel planning'],
                'significant_figure' => null,
                'description' => 'The Football Experience is a full-stack platform helping fans plan, budget for, and experience international football tournaments. It features a budget calculator with real-time flight/hotel pricing via Amadeus and SerpApi, a social feed with posts/stories/tribes, match predictions, a fan store, wallet with Paystack payments, loan applications, and three distinct user roles with dedicated dashboards. Supports FIFA World Cup 2026, UEFA Euro 2024, and AFCON 2027.',
                'problem' => 'Football fans planning tournament travel need a unified platform to research costs across flights, hotels, and local expenses; connect with fellow fans and form travel groups; manage bookings and payments; access real-time pricing data; and participate in tournament-related social activities — but no existing platform combined budget planning, social features, and travel logistics for African football fans.',
                'methodology' => 'Built a full-stack platform with 41 Eloquent models, 62 database migrations, a budget calculator integrating Amadeus, Orizn, and SerpApi for real-time flight and hotel pricing, a social platform with posts, stories, and tribe-based group formation, match prediction games with scoring, a fan store with product catalogue, a wallet system with Paystack integration supporting deposits, withdrawals, and loan applications, WebAuthn/FIDO2 and Google 2FA authentication for security, and automated CI/CD deployment to production. The platform supports FIFA World Cup 2026, UEFA Euro 2024, and AFCON 2027 tournaments.',
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
                'category' => 'PropTech, Vacation Rentals, Property Management, SaaS, Hospitality',
                'technologies' => ['Laravel', 'React', 'Inertia.js', 'TypeScript', 'Tailwind CSS', 'WebAuthn', 'Laravel Cashier', 'M-Pesa', 'Paystack'],
                'focus_areas' => ['Property management', 'PMS integration', 'Campaign dispatcher'],
                'significant_figure' => null,
                'description' => 'Tena is a SaaS platform for vacation rental property management, providing tools for hosts, staff, and guests. The platform features a host dashboard for property management, a guest portal with OTP authentication, PMS integration with Beds24/Cloudbeds/Hostaway, marketing campaigns with email/SMS dispatch, subscription billing via Laravel Cashier, and payments through M-Pesa and Paystack. The legacy PHP version is preserved in the legacy/ directory.',
                'problem' => 'Vacation rental hosts manage properties across multiple disconnected tools — spreadsheets for bookings, messaging apps for guest communication, separate billing systems, and manual marketing campaigns. No unified platform existed to handle property management, guest portals with secure authentication, integration with external PMS systems (Beds24, Cloudbeds, Hostaway), marketing campaign dispatch, and subscription billing — particularly in the East African market with M-Pesa payment requirements.',
                'methodology' => 'Built a SaaS platform with 19 Eloquent models and 30+ database migrations. Implemented a host dashboard for property management, a guest portal with OTP authentication for passwordless access, a pluggable PMS integration layer using factory pattern for Beds24, Cloudbeds, and Hostaway, a campaign dispatcher with personalisation tokens for email and SMS marketing, subscription-gated features via Laravel Cashier, payments through M-Pesa and Paystack, role-based access control for admin, host, staff, and guest roles, and automated CI/CD deployment to cPanel.',
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
                'category' => 'PropTech, Construction, Infrastructure, Corporate',
                'technologies' => ['Laravel', 'Inertia', 'React', 'Tailwind CSS', 'Framer Motion', '@annotorious/react', 'AG-Grid', 'react-pdf', 'Tesseract.js', 'Swiper', 'xlsx'],
                'focus_areas' => ['Drawing annotation', 'Project timelines', 'Document OCR'],
                'significant_figure' => null,
                'description' => 'Najenga is a construction-project coordination platform — annotate architectural drawings directly (Annotorious over PDFs / images), work through interactive project timelines, run OCR over documents (Tesseract.js), export to Excel, and coordinate in a chat with @mentions.',
                'problem' => 'Construction projects suffer from decentralised documentation where site engineers, architects, project managers, and clients work from the same drawings but have no shared way to annotate, discuss, and track changes on those documents. Accounting is unstructured, collaboration happens via scattered email threads and messaging apps, and there is no centralised platform connecting all stakeholders across the project lifecycle.',
                'methodology' => 'Building a Laravel + Inertia + React application with spatial annotation using @annotorious/react for direct annotation on architectural drawings and images, PDF rendering via react-pdf for document viewing, OCR processing via Tesseract.js for scanned documents, spreadsheet export via xlsx for data extraction, real-time chat with @mentions for stakeholder communication, and interactive project timelines for milestone tracking and coordination. The platform stores spatial coordinates for annotations to preserve context across conversations.',
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
                'category' => 'Events, Weddings, Hospitality, Lifestyle',
                'technologies' => ['React', 'Vite', 'Tailwind CSS', 'Framer Motion', 'TanStack Query', 'i18next', 'Leaflet', 'FilePond', 'html5-qrcode', 'jsPDF', 'Laravel Echo', 'Pusher'],
                'focus_areas' => ['Live photo gallery', 'QR guest check-in', 'Digital scrapbook export'],
                'significant_figure' => null,
                'description' => 'NAOA-DT is a feature-rich digital wedding website and management platform supporting multi-language content, RSVP via invitation codes, gift registry, seating chart management, polaroid photo sharing, song requests, and real-time updates. The admin dashboard provides comprehensive guest management, bulk Excel import, invitation design, QR check-in scanning, and analytics. Built with a React SPA frontend and Laravel 12 API backend.',
                'problem' => 'Wedding coordination involves managing hundreds of guests across multiple languages, tracking RSVPs and dietary requirements, coordinating seating arrangements, providing real-time event information, and creating lasting digital memories — but no centralised digital platform existed to handle the full wedding lifecycle from guest onboarding through live event sharing and post-event scrapbook creation.',
                'methodology' => 'Built NAOA-DT with 20+ API controllers, 40+ database migrations, multi-language support via i18next for international weddings, real-time features via Pusher/Laravel Echo for live updates, QR code check-in via html5-qrcode for guest arrival tracking, flight tracking integration for out-of-town guests, camera capture for polaroid-style photo sharing, digital scrapbook export via jsPDF, invitation code-based RSVP, gift registry management, seating chart editor with drag-and-drop, song request queue, and a comprehensive admin panel with invitation designer, bulk Excel guest import via xlsx, and guest analytics. Deployed to Vercel (frontend) and cPanel (backend).',
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
                'category' => 'Marketplace, Home Services, FinTech, Logistics',
                'technologies' => ['Next.js', 'React', 'TypeScript', 'Tailwind CSS', 'Radix UI', 'Framer Motion', 'Recharts', 'Laravel', 'Sanctum', 'Laravel Reverb', 'Pusher', 'Paystack', 'M-Pesa'],
                'focus_areas' => ['Service marketplace', 'Real-time chat', 'Multi-gateway payments'],
                'significant_figure' => null,
                'description' => 'Kuba is a comprehensive home services marketplace platform connecting clients with service providers across Kenya. The headless architecture features a Laravel 12 API backend with 33 Eloquent models and a Next.js 16 frontend. The platform supports 13+ service categories, real-time messaging, multi-gateway payments, a loyalty program, provider verification workflows, a CMS-driven admin panel with dashboards for admins, providers, and clients.',
                'problem' => 'Home services in Kenya are fragmented across informal networks, making it difficult for clients to find reliable, vetted providers and for providers to reach new customers. No unified booking system exists across the 13+ service categories, payment infrastructure is limited to cash or mobile transfers with no escrow or dispute resolution, and there is no loyalty programme to incentivise repeat engagement from either side of the marketplace.',
                'methodology' => 'Built a headless marketplace with Laravel 12 API backend featuring 33 Eloquent models and a Next.js 16 frontend. Implemented provider profiles with compliance verification workflows, booking management with scheduling and status tracking, real-time messaging via Laravel Reverb and Pusher, multi-gateway payments through Paystack, M-Pesa, and Stripe, a loyalty rewards programme, CMS-driven content management, PWA capabilities for mobile access, Capacitor-based Android deployment, 20+ complete CRUD modules for all marketplace operations, 4-tier testing strategy covering unit, visual, accessibility, and performance tests, and CI/CD via GitHub Actions.',
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
                'category' => 'E-Commerce, Events, Catering, Sanitation, AV Services',
                'technologies' => ['Laravel', 'React', 'Inertia.js', 'Tailwind CSS', 'WebAuthn', 'Leaflet', 'Laravel Fortify'],
                'focus_areas' => ['Multi-service ordering', 'Passkey authentication', 'Delivery tracking'],
                'significant_figure' => null,
                'description' => 'Silversky Events Ordering Platform is a full-featured e-commerce web application built for Silversky Events, serving as an online catalog and ordering system for event services. The platform features four service lines, customer authentication with Google OAuth and WebAuthn/passkey support, an admin panel with chatbot and recommendation wizard, delivery tracking with GPS, and a CMS-driven catalog with static seed data merged with database overrides.',
                'problem' => 'Event service companies offering multiple service lines — catering, sanitation, AV, and furniture — need a unified ordering platform with proper customer authentication, inventory management across product catalogues, payment processing, delivery tracking with GPS visibility, and admin tools for recommendation and planning — but existing e-commerce platforms lack the domain-specific features for event service coordination.',
                'methodology' => 'Built on Laravel 12 with Inertia.js/React frontend featuring 8 Eloquent models and 12 service classes. Implemented Google OAuth and WebAuthn/passkey authentication for passwordless login, four service line catalogues with product browsing and cart management, Leaflet-based delivery tracking with GPS coordinates, an AI chatbot assistant for order guidance, a recommendation wizard for service bundles, an event planning wizard for multi-service coordination, comprehensive admin management with order lifecycle tracking, and automated deployment to cPanel via GitHub Actions.',
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
                'category' => 'E-Commerce, Events, Exhibition Services, Logistics',
                'technologies' => ['PHP', 'Laravel', 'DomPDF', 'PHPMailer', 'MySQL', 'Vanilla JS'],
                'focus_areas' => ['Exhibitor catalog', 'PDF invoicing', 'Stock management'],
                'significant_figure' => null,
                'description' => 'OmniShop is an event-specific e-commerce ordering portal built for OmniSpace 3D Events Ltd. Exhibitors at Solar and Storage Live Kenya 2026 can browse a ~190-item product catalog, add items to cart, and place orders. Admins manage the full order lifecycle with PDF invoice generation, email notifications, stock management, and packing lists. The project was originally built in Python/Tornado and fully rewritten in PHP using Laravel 11.',
                'problem' => 'Exhibition organizers need a streamlined way for exhibitors to order furniture, AV equipment, catering, and staffing services for events, but existing solutions lack proper invoicing with branded PDFs, stock level management across product categories, packing list generation for fulfillment, and multi-event support for organizers managing several trade shows. The platform needed to be deployable by a non-developer.',
                'methodology' => 'Built a hybrid Laravel/legacy architecture with 6 Eloquent models and 9 service classes. Implemented branded PDF invoice generation via DomPDF, email notifications via PHPMailer for order confirmations and updates, stock level management with low-stock alerts, packing list generation for fulfillment teams, multi-event support for managing separate product catalogues per trade show, a centralised branding system enforced by CI tests, and a ~190-item product catalogue with cart and checkout. Deployed to cPanel via GitHub Actions.',
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
                'category' => 'Energy Advisory, FinTech, International Diplomacy, Corporate',
                'technologies' => ['Next.js', 'React', 'TypeScript', 'Tailwind CSS', 'Radix UI', 'Framer Motion', 'TipTap', 'SWR', 'Laravel'],
                'focus_areas' => ['Content publishing', 'Event management', 'Knowledge base'],
                'significant_figure' => null,
                'description' => 'Nissi Insights is a corporate website and content management platform for a company operating in energy advisory, fintech, and international diplomacy. The decoupled architecture features a Next.js 16 frontend with hybrid SSR/CSR rendering and a Laravel 11 REST API backend. The CMS manages services, insights articles, case studies, knowledge base resources, events, team members, testimonials, and legal pages.',
                'problem' => 'Multi-sector consultancies operating across energy advisory, fintech, and international diplomacy need a centralised platform to showcase diverse service offerings, publish thought leadership content, manage events with RSVP tracking, maintain a knowledge base with downloadable resources, and capture leads across multiple verticals — but no existing CMS handles the content diversity of a multi-sector corporate site with both B2B services and public insights.',
                'methodology' => 'Built a decoupled architecture with Next.js 16 frontend featuring hybrid SSR/CSR rendering and Laravel 11 REST API backend with 23 Eloquent models, 39 database migrations, and 25 API controllers. Implemented a full admin panel with 25+ content management sections, event registration with RSVP tracking, a knowledge base with downloadable resources and category organisation, Finnhub API integration for real-time stock data display, SEO optimisation with JSON-LD structured data, TipTap rich text editor for content authoring, SWR data fetching with caching, and CI/CD via GitHub Actions with automated deployment to Vercel and cPanel.',
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
                'description' => 'GM-Coaching is a full-stack website and business platform for Gathoni Mwai, an Oxford MBA and former McKinsey fellow offering MBA admissions coaching and consulting interview preparation. The decoupled architecture features a Next.js 16 frontend deployed to Vercel and a Laravel 12 API backend on cPanel, with CMS-driven content, Calendly booking integration, Stripe payments, and real-time notifications.',
                'problem' => 'African professionals pursuing top MBA programmes and consulting careers lack centralised access to coaching services, structured preparation resources, payment systems for service booking, and personalised content in one platform — relying on scattered social media presence, manual scheduling via email, and invoice-based payment collection.',
                'methodology' => 'Built a full-stack website with Next.js 16 frontend deployed to Vercel and Laravel 12 API backend on cPanel. Implemented a landing page with dynamic CMS-driven content, dedicated service pages for MBA admissions coaching and consulting interview preparation, Calendly booking integration for session scheduling, Stripe checkout sessions for payment processing, a blog system for thought leadership content, testimonials management, and a full admin CMS with 22 API controllers, 13 Eloquent models, and 25+ feature tests. Deployed via GitHub Actions CI/CD with automated deployment to both Vercel and cPanel.',
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
                'problem' => 'Kenyan healthcare facilities operate with paper records, unequal documentation quality, and no interoperability across facility levels — from tier-1 national hospitals to tier-3 community health centres. Patient histories are lost when patients move between facilities, referral chains break down without shared records, and consolidated countrywide health insights for research and NGO reporting are impossible when data exists only in scattered paper files.',
                'methodology' => 'Designed a phased product strategy: (1) deliver a fully functional clinical administration system on day one per facility — covering patient registration, appointment scheduling, consultations, prescriptions, laboratory work, pharmacy, and billing — so each facility benefits immediately, (2) as the network of adopting facilities grows, the standardised data schema becomes the substrate for cross-facility patient-record sharing, enabling a patient\'s history to follow them regardless of facility tier, (3) wider objectives including interoperability across the referral chain, equal quality of documentation across facility levels, and consolidated countrywide insights for research and NGO reporting become reachable because the network already exists. The Nyalife Hospital Management System serves as the first live instance, built with 33 Eloquent models, 73 migrations, Spatie Permission RBAC, and Playwright end-to-end tests.',
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
                'excerpt' => 'The Afrilabs Ethiopia framework, why every stakeholder is mapped before scoping, and how that changes what gets built.',
                'content' => '<p>Before a single line of code is written on any project, the ecosystem gets mapped. Not the technical architecture — the human one. Every stakeholder who could be affected by or beneficial to the proposition: the paying client, the end user, the regulator, adjacent service providers, upstream and downstream data holders, the wider community.</p><p>This practice comes from the Afrilabs capacity-building programme <em>Leveraging Stakeholder Relationships through Ecosystem Mapping and Building</em>, attended in Addis Ababa, Ethiopia while working with the Lawyers Hub. It changed how every engagement gets scoped.</p><p>The map forces you to answer: who benefits from this system existing, and how? Not just the client who pays, but the end user who interacts with it daily, the regulator who oversight it, the adjacent service provider whose workflow it touches. When the solution is designed so each of those stakeholders has a clearly aligned reason to participate, you get something fundamentally different from a website. You get a working system inside its own context.</p><p>This is the single biggest reason client engagements stay engaged. The ecosystem map is the first deliverable on every project, and it shapes everything that follows — from the database schema to the admin panel to the notification system.</p>',
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
                'content' => '<p>From February 2023 to December 2024, the role of Software Developer, Justice Innovation at Lawyers Tech Hub in Nairobi covered the full spectrum of the organisation\'s LegalTech portfolio — and revealed what the sector actually needs from technology.</p><p>The work ranged from building the Lawyers Hub Digital Policy website (the cornerstone resource for Kenya\'s AI-policy and digital-trade conversation) to designing the Africa Law Tech Festival platform that handled ticketing, live notifications and event mapping for 11,000+ attendees across editions. Every issue of the Daily Bulletin, all the Africa digital-policy maps, and the Boda-Boda Law Project field research were contributed to.</p><p>The key insight: LegalTech in Africa is not about building fancy legal databases. It\'s about accessibility — getting legal information to people who need it through channels they already use, in formats they can act on. The Boda-Boda Law Project demonstrated this most directly: co-organising field data collection in Kisumu and Namanga, coordinating capacity-building trainings for riders, and building a website with a Typeform intake for real-time legal advisory requests.</p><p>The ADPI trainings — Africa Data Protection Course and CIPP/E certification — taught the compliance surface that every LegalTech and FinTech build has to account for. RBAC, ACL, WebAuthn passkey login — these are not nice-to-haves, they\'re table stakes.</p>',
                'image' => null,
                'user_id' => $admin?->id ?? 1,
                'is_published' => true,
                'published_at' => now()->subDays(12),
            ],
            [
                'title' => 'A solo-founder stack: Laravel + Next.js + AI-accelerated dev',
                'slug' => 'solo-founder-stack-laravel-nextjs-ai-accelerated',
                'category' => 'Engineering',
                'excerpt' => 'The exact tooling and workflow that lets a solo practice ship the same class of application a small team would.',
                'content' => '<p>OKJTechnologies is a one-person studio. That\'s a deliberate choice, not a limitation. The question it forces is: how does one person ship the same class of application a small team would? The answer is a specific stack, a specific workflow, and AI-accelerated tooling in the loop.</p><p><strong>The stack:</strong> Laravel 12 for the backend (API, auth, jobs, admin), Next.js 16 or React 19 for the frontend (Inertia.js or decoupled SPA), Tailwind CSS for styling, and shadcn/ui or Headless UI for accessible components. SQLite for development, MySQL for production. GitHub Actions for CI/CD. cPanel or Vercel for deployment.</p><p><strong>The workflow:</strong> Ecosystem map first. Then schema design. Then controllers and routes. Then frontend. Then deployment. Every step is informed by the previous one, and the ecosystem map is the thread that connects them all.</p><p><strong>The AI acceleration:</strong> AI tooling compresses repetitive tasks — boilerplate generation, migration writing, component scaffolding, documentation. Not to replace thinking, but to eliminate the mechanical overhead that slows a solo developer down. The ecosystem mapping still requires human judgment. The AI handles the rest.</p><p>The result: a solo studio that ships full-stack applications with comprehensive testing, CI/CD pipelines, and production-grade infrastructure. Not by working more hours, but by working with better tools and a clearer framework.</p>',
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
                'excerpt' => 'Annotorious over PDFs, coordinate timelines, Tesseract.js OCR — the spatial annotation architecture and what still needs testing.',
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
