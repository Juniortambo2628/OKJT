<?php

use App\Services\RevalidationService;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Site-wide copy refresh (2026-09-21).
 *
 * Rewrites the CMS-held copy in the same voice as the project write-ups:
 * objective and work-focused (no "we" / "our team"), plain language for a
 * non-technical reader, opportunity framing, short sentences for readability.
 *
 * Covers site settings (home, about, contact, widgets), values, approach
 * pillars, services, stat descriptions and the founder bio. Rows are updated
 * in place by key / slug / order / label; images, icons,
 * ordering and anything not listed here are left as they are. Missing site
 * setting keys are created. Frontend fallbacks carry the same copy.
 */
return new class extends Migration
{
    public function up(): void
    {
        $now = now();

        if (Schema::hasTable('site_settings')) {
            foreach ($this->settings() as [$key, $value, $type, $group]) {
                $exists = DB::table('site_settings')->where('key', $key)->exists();
                if ($exists) {
                    DB::table('site_settings')->where('key', $key)->update(['value' => $value, 'updated_at' => $now]);
                } else {
                    DB::table('site_settings')->insert([
                        'key' => $key, 'value' => $value, 'type' => $type, 'group' => $group,
                        'created_at' => $now, 'updated_at' => $now,
                    ]);
                }
            }
        }

        if (Schema::hasTable('values')) {
            $hasRows = DB::table('values')->whereNull('deleted_at')->exists();
            foreach ($this->values() as [$order, $icon, $title, $description]) {
                $row = ['title' => $title, 'description' => $description, 'updated_at' => $now];
                if ($hasRows) {
                    DB::table('values')->where('order', $order)->update($row);
                } else {
                    DB::table('values')->insert($row + ['icon' => $icon, 'order' => $order, 'created_at' => $now]);
                }
            }
        }

        if (Schema::hasTable('pillars')) {
            foreach ($this->pillars() as [$slug, $title, $overview, $content]) {
                DB::table('pillars')->where('slug', $slug)->update([
                    'title' => $title, 'overview' => $overview, 'content' => $content, 'updated_at' => $now,
                ]);
            }
        }

        if (Schema::hasTable('services')) {
            foreach ($this->services() as [$slug, $description, $content]) {
                DB::table('services')->where('slug', $slug)->update([
                    'description' => $description, 'content' => $content, 'updated_at' => $now,
                ]);
            }
        }

        if (Schema::hasTable('stats')) {
            foreach ($this->stats() as [$label, $description]) {
                DB::table('stats')->where('label', $label)->update(['description' => $description, 'updated_at' => $now]);
            }
        }

        if (Schema::hasTable('team_members')) {
            DB::table('team_members')->where('name', 'Kevin Tambo')->update(['bio' => 'Kevin Tambo founded OKJTechnologies in 2021 to design and build complete web platforms for organisations in Kenya and across Africa. Projects run from first idea to live, supported platform: planning, interface design, engineering, launch and ongoing administration, mostly with Laravel, Next.js and React.

Every project begins with ecosystem mapping, a method from the Afrilabs programme "Leveraging Stakeholder Relationships through Ecosystem Mapping and Building" in Addis Ababa. Everyone the platform will touch is mapped first, and the solution is designed so each of them has a clear reason to use it. Alongside the studio, Kevin worked as Software Developer, Justice Innovation at the Lawyers Hub from 2023 to 2024.', 'updated_at' => $now]);
        }

        foreach ([
            'site_settings_grouped', 'site_settings_maintenance', 'site_settings_email',
            'all_values', 'all_pillars', 'all_pillars_admin', 'all_services', 'all_stats', 'all_team_members',
        ] as $cacheKey) {
            Cache::forget($cacheKey);
        }

        if (! app()->runningUnitTests()) {
            app(RevalidationService::class)->revalidateAll();
        }
    }

    public function down(): void
    {
        // Copy refresh is not reversed.
    }

    private function settings(): array
    {
        return [
            ['hero_tagline', 'Design-led web engineering from Nairobi', 'text', 'homepage'],
            ['hero_title_line1', 'Web platforms for', 'text', 'homepage'],
            ['hero_rotating_words', 'clinics.,law firms.,marketplaces.,nonprofits.,event teams.', 'text', 'homepage'],
            ['hero_title_line2', 'Designed and built end to end.', 'text', 'homepage'],
            ['hero_subtitle', 'OKJTechnologies designs, builds and runs web applications for organisations across Kenya and Africa: hospital systems, service marketplaces, online stores, legal portals and nonprofit platforms.', 'textarea', 'homepage'],
            ['vp_section_tagline', 'THE APPROACH', 'text', 'homepage'],
            ['vp_section_title', 'One continuous build, from first idea to live platform', 'text', 'homepage'],
            ['vp_section_subtitle', 'Planning, design, engineering, launch and ongoing support run as a single piece of work. Nothing is lost between stages, and one point of contact stays accountable throughout.', 'textarea', 'homepage'],
            ['stats_tagline', 'AT A GLANCE', 'text', 'homepage'],
            ['stats_title', 'The work so far', 'text', 'homepage'],
            ['services_tagline', 'SERVICES', 'text', 'homepage'],
            ['services_title', 'Web applications, designed and built end to end.', 'text', 'homepage'],
            ['services_subtitle', 'Each service covers a part of the same journey: shaping the idea, designing the experience, building the platform and keeping it running well.', 'textarea', 'services'],
            ['projects_tagline', 'PORTFOLIO', 'text', 'homepage'],
            ['projects_title', 'Selected work', 'text', 'homepage'],
            ['insights_tagline', 'INSIGHTS', 'text', 'homepage'],
            ['insights_title', 'Notes from the work', 'text', 'homepage'],
            ['insights_subtitle', 'Practical lessons from real projects in health, law, construction, events and commerce, written for the people who commission and use digital platforms.', 'textarea', 'insights'],
            ['testimonials_tagline', 'CLIENT IMPACT', 'text', 'homepage'],
            ['testimonials_title', 'In clients’ words', 'text', 'homepage'],
            ['cta_badge', 'GET IN TOUCH', 'text', 'homepage'],
            ['cta_title', 'Have a platform in mind?', 'text', 'homepage'],
            ['cta_subtitle', 'Share a short brief. It will be mapped against the people the platform needs to serve, scoped into clear stages and returned with a realistic path to launch.', 'textarea', 'homepage'],
            ['company_tagline', 'Design-led web engineering from Nairobi. Web applications for health, legal, commerce, events and nonprofit organisations, designed and built end to end.', 'textarea', 'general'],
            ['about_tagline', 'HOW THE WORK GETS DONE', 'text', 'about'],
            ['about_title', 'Design-led web engineering,
built around the people it serves.', 'textarea', 'about'],
            ['about_story', 'OKJTechnologies is a web engineering studio in Nairobi. It takes projects from first idea to a live, supported platform: planning, interface design, engineering, launch and ongoing administration. The work spans hospitals, law firms, construction teams, event companies, nonprofits and online stores.', 'textarea', 'about'],
            ['about_mission_title', 'Every stakeholder is mapped before anything is built.', 'text', 'about'],
            ['about_mission_text1', 'Each project starts by mapping everyone the platform will touch: the client, the people who will use it every day, regulators, partners and the wider community. The method comes from the Afrilabs programme “Leveraging Stakeholder Relationships through Ecosystem Mapping and Building” in Addis Ababa.', 'textarea', 'about'],
            ['about_mission_text2', 'The platform is then designed so each of those groups has a clear reason to use it and a clear benefit from it. That is what turns a website into a working system inside its real context. Modern AI-assisted tools keep delivery fast without cutting corners.', 'textarea', 'about'],
            ['about_experience_title', 'Where the experience comes from', 'text', 'about'],
            ['about_experience_subtitle', 'Selected work across the disciplines behind every OKJTechnologies project, each linked to the platform it shaped.', 'textarea', 'about'],
            ['about_team_title', 'One continuous thread, from concept to live platform', 'text', 'about'],
            ['about_team_subtitle', 'Every project is designed, built, launched and supported as one continuous piece of work. There are no hand-offs between teams and no context lost between stages, with a single point of accountability from start to finish.', 'textarea', 'about'],
            ['about_credentials_title', 'Credentials and background', 'text', 'about'],
            ['about_sectors_title', 'Sectors', 'text', 'about'],
            ['about_cta_title', 'Have a system that needs building end to end?', 'text', 'about'],
            ['about_cta_subtitle', 'It might be a platform for customers, an internal tool for staff, or a national-scale idea still at the problem-statement stage. Start with a short brief, and the ecosystem around it will be mapped together.', 'textarea', 'about'],
            ['contact_title', 'Start a project', 'text', 'contact'],
            ['contact_subtitle', 'Share what the platform needs to achieve and who it will serve. Every brief receives a reply with next steps, usually within two business days.', 'textarea', 'contact'],
            ['whatsapp_message', 'Hello, I would like to discuss a web project with OKJTechnologies.', 'text', 'widgets'],
            ['chatbot_quick_replies', '["What does OKJTechnologies build?", "Which sectors have you worked in?", "How does a project start?", "How can I get in touch?"]', 'textarea', 'widgets'],
            ['chatbot_faq_data', '[{"keywords": ["web", "development", "app", "build", "nextjs", "laravel", "react", "platform"], "answer": "OKJTechnologies designs and builds web applications end to end: customer-facing platforms, admin dashboards, online stores and the systems behind them, mostly with Laravel, Next.js and React."}, {"keywords": ["sector", "industry", "clients", "worked", "experience", "portfolio", "projects"], "answer": "Past projects cover healthcare, legal services, construction, events, hospitality, e-commerce, automotive, education and nonprofits. The Projects page has a full write-up of each one."}, {"keywords": ["start", "process", "how", "begin", "brief", "scope", "approach"], "answer": "A project starts with a short brief. The people the platform needs to serve are mapped first, then the work is scoped into clear stages with a proposal and timeline."}, {"keywords": ["contact", "reach", "email", "phone", "office", "talk", "call"], "answer": "Use the Contact page at /contact, or email hello@okjtech.co.ke. Every brief receives a reply with next steps."}, {"keywords": ["service", "offer", "provide", "do", "help", "what"], "answer": "Services cover web application engineering, e-commerce, admin dashboards and content management, interface design, and technical strategy. See the Services page for details."}, {"keywords": ["cost", "price", "budget", "quote", "how much"], "answer": "Costs depend on scope. Share a brief on the Contact page to receive a tailored proposal."}]', 'textarea', 'widgets'],
            ['about_experience_categories', '[{"key": "digital-policy", "label": "Digital Policy", "items": [{"title": "Lawyers Hub Digital Policy website", "summary": "A leading Kenyan resource on digital policy, from its structure and build to its ongoing care.", "href": "/projects/lawyers-hub-digital-policy", "tag": "Platform"}, {"title": "Africa Law Tech Festival platform", "summary": "Online ticketing, live updates and event maps for an annual festival with a continental audience.", "href": "/projects/africa-law-tech-festival", "tag": "Event platform"}, {"title": "ADPI training delivery", "summary": "Support for the Africa Data Protection Course and the CIPP/E certification programme.", "href": "/projects/adpi-courses", "tag": "Training"}]}, {"key": "ui-ux", "label": "Interface Design", "items": [{"title": "Najenga: construction coordination", "summary": "Drawings, budgets, timelines and team conversations brought into one shared workspace.", "href": "/projects/najenga", "tag": "Product"}, {"title": "Naoa: digital wedding platform", "summary": "Invitations, RSVPs, gifts and live guest updates in one experience.", "href": "/projects/naoa", "tag": "Product"}, {"title": "Tibu: healthcare interface", "summary": "Clinical workflows designed for the doctors, nurses and staff who use them on desktop and mobile.", "href": "/projects/tibu", "tag": "Interface"}]}, {"key": "engineering", "label": "Web Engineering", "items": [{"title": "Laravel and Next.js platforms", "summary": "Complete web applications with secure sign-in, admin dashboards, automated tasks and reliable launches.", "href": "/services", "tag": "Engineering"}, {"title": "Launch and ongoing care", "summary": "Hosting, domains, automatic deployments, monitoring and maintenance after launch.", "href": "/services", "tag": "Operations"}]}, {"key": "ecosystem", "label": "Ecosystem Strategy", "items": [{"title": "Ecosystem mapping practice", "summary": "Everyone a platform touches is mapped before scoping, so each has a clear reason to take part.", "href": "/our-approach", "tag": "Method"}, {"title": "Boda-Boda Law Project", "summary": "Field research in Kisumu and Namanga that informed a published legal report.", "href": "/projects/boda-boda-law", "tag": "Research"}]}]', 'textarea', 'about'],
        ];
    }

    private function values(): array
    {
        return [
            [1, 'map', 'Ecosystem mapping', 'Everyone the platform touches is mapped before scoping: the client, everyday users, regulators, partners and the community. Each has a clear reason to take part.'],
            [2, 'shield', 'Honest scope', 'Every feature, figure and timeline is one that can be delivered. What is promised is what ships, and what ships is what the people using it need.'],
            [3, 'zap', 'Fast, careful delivery', 'Modern AI-assisted tools shorten the build without shortcuts on quality, so ambitious platforms reach launch sooner.'],
            [4, 'layers', 'Design and function together', 'Design and engineering are done as one piece of work, so the finished platform looks the way it was designed and works the way it was meant to.'],
            [5, 'handshake', 'Partnership', 'Each project is treated as a working partnership. The platform is built to serve the client and everyone around them.'],
            [6, 'arrow-up-right', 'Continuous delivery', 'Idea, design, build, launch and ongoing support run as one continuous thread, with one point of accountability.'],
        ];
    }

    private function pillars(): array
    {
        return [
            ['design', 'Design', 'Design first, with function built in.', '<p>Every interface starts from the people who will use it and the job they need to get done. Layouts are designed from scratch for each project, so the result fits the organisation rather than a template.</p>'],
            ['style', 'Style', 'Visual clarity with a purpose.', '<p>Colour, type and motion are chosen to guide attention and reflect the brand. Every visual element supports the goal of the page it sits on.</p>'],
            ['human-centered-ux', 'Human-centred experience', 'Journeys shaped around real behaviour.', '<p>Each journey is shaped around how people actually behave: what they look for first, where they hesitate and what helps them finish. The result is a platform that feels intuitive and works for people of all abilities.</p>'],
            ['speed', 'Speed', 'Fast, responsive and accessible.', '<p>Pages are built to load quickly on everyday phones and networks, and to work well with assistive technology. Speed and accessibility are treated as core features, not extras.</p>'],
            ['deploy', 'Launch', 'From idea to live platform.', '<p>Automated pipelines test and publish every update, so new features reach users safely and consistently. Hosting, domains and monitoring are set up and cared for as part of the work.</p>'],
            ['scale', 'Scale', 'Ready to grow.', '<p>Platforms are structured so new users, features and locations can be added without starting over. The foundation laid at launch supports the next stage of growth.</p>'],
        ];
    }

    private function services(): array
    {
        return [
            ['custom-web-applications', 'Complete web applications, from a first working version to a full production platform, with secure sign-in, admin dashboards and real-time features.', '<p>Complete web applications built with Laravel, Next.js and React. Work runs from a first working version through to a full production platform, with secure sign-in, admin dashboards, integrations and real-time updates. Each application is shaped around the people and organisations it serves.</p>'],
            ['ecommerce-platforms', 'Online stores and ordering platforms with catalogues, carts, local and international payments, order tracking and admin dashboards.', '<p>Online stores and ordering platforms with product catalogues, carts and checkout, and payments through M-Pesa, Paystack or Stripe. Order tracking, stock and fulfilment dashboards are included. Past work ranges from trade-show exhibitor catalogues to direct-to-customer food delivery.</p>'],
            ['admin-dashboards', 'Management dashboards that give each team member the right tools and access, with content management, reporting and records.', '<p>Management dashboards that give each member of a team the tools and access their role needs, from records and content to reports and analytics. Past dashboards run hospital operations, construction projects, law firm case files and event logistics.</p>'],
            ['api-development', 'Secure connections that let websites, mobile apps and partner systems share data reliably.', '<p>Secure, well-documented connections (APIs) that let websites, mobile apps and partner systems exchange data reliably. Each connection is protected, validated and built to handle growth.</p>'],
            ['cms-development', 'Content management that lets non-technical teams update pages, posts, images and media without touching code.', '<p>Content management systems that let non-technical teams update pages, articles, images and media on their own. Options range from ready-made admin panels to fully custom editors built around the site.</p>'],
            ['wireframing-prototyping', 'Early sketches and clickable prototypes that test structure and flow before development begins.', '<p>Early sketches and clickable prototypes that test page structure, navigation and user flow before development begins. Design stays closely tied to engineering throughout the build, so what is approved is what gets built.</p>'],
            ['design-systems', 'Reusable components and visual rules that keep every page consistent as a product grows.', '<p>Reusable components, colours, type and motion rules that keep every page consistent as a product grows. A shared system speeds up future work and keeps the brand coherent.</p>'],
            ['ux-audits', 'A structured review of an existing website or app to find friction, accessibility gaps and quick wins.', '<p>A structured review of an existing website or app that finds where users get stuck, where accessibility falls short, and which changes will make the biggest difference. Findings come with clear, prioritised recommendations.</p>'],
            ['technical-architecture', 'Planning the data, structure and infrastructure of a platform so it stays reliable as it grows.', '<p>Planning how a platform stores its data, connects its parts and runs in production, so it stays reliable, secure and affordable as it grows. Every decision is guided by the stakeholder map.</p>'],
            ['performance-seo', 'Faster pages and better search visibility, so more people find the site and stay on it.', '<p>Faster loading, smarter caching and search-friendly page structure help more people find a site and stay on it. Speed is treated as a core feature rather than an afterthought.</p>'],
            ['digital-transformation', 'Moving paper-based and manual processes onto connected web platforms.', '<p>Moving paper records and manual processes onto connected web platforms, and modernising older systems. Past work includes taking a clinic from paper files to a full hospital management system.</p>'],
        ];
    }

    private function stats(): array
    {
        return [
            ['Years building for the web', 'Building web platforms professionally since April 2021.'],
            ['Studio + client projects', 'Across health, legal, construction, events, hospitality, e-commerce and nonprofit work.'],
            ['Primary stack', 'Web applications built end to end with Laravel, Next.js and React.'],
            ['Sectors covered', 'LegalTech · HealthTech · PropTech · FinTech · E-commerce · Events · NGO · Agritech · Automotive · EdTech · Marketplace'],
        ];
    }
};
