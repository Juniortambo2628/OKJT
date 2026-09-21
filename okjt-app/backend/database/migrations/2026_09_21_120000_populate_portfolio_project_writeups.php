<?php

use App\Models\Project;
use App\Services\RevalidationService;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Schema;

/**
 * Populate portfolio projects with the reviewed write-ups
 * (source: "OKJTech Project Portfolio Write-ups", 2026-09-21).
 *
 * Field mapping used by the single-project page:
 *   description  -> summary card
 *   problem      -> Scope / Challenge
 *   methodology  -> Scope / Solution
 *   outcome      -> Ecosystem narrative (who it serves + intended impact)
 *   category     -> Sector / Ecosystem chips (comma-separated)
 *   technologies -> stack tags, focus_areas -> hero meta strip
 *
 * Existing rows are matched by slug and only their copy fields are updated:
 * images, gallery, url, type, order, featured/active flags and testimonials
 * set through the CMS are left untouched. Rows that do not exist yet are
 * created with the defaults given per project. Projects not listed here
 * (e.g. Tibu, Lawyers Hub platforms, Wisdom Capital) are not modified.
 */
return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('projects')) {
            return;
        }

        $paths = ['/', '/projects', '/projects/flagship'];

        Model::withoutEvents(function () use (&$paths) {
            foreach ($this->projects() as $data) {
                $defaults = $data['defaults'];
                unset($data['defaults']);

                $project = Project::withTrashed()->where('slug', $data['slug'])->first();

                if ($project) {
                    $project->fill($data)->save();
                } else {
                    Project::create(array_merge($defaults, $data, [
                        'is_active' => true,
                        'is_featured' => false,
                    ]));
                }

                $paths[] = '/projects/'.$data['slug'];
            }
        });

        // The API caches project lists forever; clear them so the new copy is served.
        foreach (['projects_all', 'projects_client', 'projects_flagship'] as $key) {
            Cache::forget($key);
        }

        // One cache refresh for the Next.js front end instead of one per row.
        // Best-effort: the service swallows network failures.
        if (! app()->runningUnitTests()) {
            app(RevalidationService::class)->revalidatePaths($paths);
        }
    }

    public function down(): void
    {
        // Copy updates are not reversed; earlier copy remains in the CMS history
        // of PortfolioContentSeeder if it ever needs restoring.
    }

    private function projects(): array
    {
        return [
            [
                'slug' => 'nyalife-hms',
                'title' => 'Nyalife Hospital Management System',
                'tagline' => 'Clinical administration for a women\'s health clinic, from front desk to final receipt.',
                'category' => 'HealthTech, Clinic operations, Health infrastructure',
                'technologies' => ['Laravel', 'React', 'Inertia.js', 'MySQL', 'Laravel Reverb', 'Laravel Sanctum', 'Laravel Socialite (Google sign-in)', 'Spatie Permission', 'Spatie Activitylog', 'Spatie Database Mail Templates', 'FullCalendar', 'TanStack Table', 'dnd-kit', 'Bootstrap', 'FilePond', 'DomPDF', 'PhpSpreadsheet', 'Playwright', 'Vitest', 'PHPUnit', 'Rector', 'GitHub Actions', 'cPanel'],
                'focus_areas' => ['Patient journey management', 'Clinical and diagnostic workflows', 'Billing, insurance and pharmacy'],
                'description' => 'The Nyalife Hospital Management System runs the daily operations of a women\'s health clinic in one place. It covers every step of a visit, from arrival to discharge, and gives each member of staff a dashboard designed for their role.',
                'problem' => '<p>A busy clinic generates information at every step of a visit: registration, triage, consultation, laboratory tests, scans, prescriptions and payment. Bringing all of it into one connected record creates an opportunity for faster service, better clinical decisions and reliable billing. It also lets management see how the clinic is actually performing. A single system that every department shares turns each visit into a smooth, traceable journey.</p>',
                'methodology' => '<p>A complete clinical administration platform that follows the patient from the front desk to the final receipt:</p><ul><li><strong>Front desk.</strong> Registration, a live patient queue, and emergency triage.</li><li><strong>Appointments.</strong> Scheduling on a shared calendar, with doctors able to block out unavailable time.</li><li><strong>Clinical care.</strong> Nurses record vital signs, and doctors write consultation notes, order laboratory tests and scans, and issue prescriptions.</li><li><strong>Laboratory.</strong> Staff track each sample and use ready-made result templates.</li><li><strong>Pharmacy.</strong> Medicine stock is managed by batch, with purchase orders for restocking.</li><li><strong>Billing.</strong> Invoices, insurance details, payments and a record of every cancelled charge keep the accounts accurate.</li></ul><p>Patients can also book remote telehealth consultations, with consent and payment handled online. Follow-up reminders, internal messaging and an editable public website with a blog complete the system. Every action is logged, and access is limited by role, so sensitive health information stays protected. Automated end-to-end tests check the key journeys before each release.</p>',
                'outcome' => '<p>Built for Nyalife Women\'s Health Clinic in Nairobi. It serves receptionists, nurses, doctors, laboratory technicians, pharmacists, billing staff and administrators, each through a workspace matched to their role. Patients benefit from shorter waits, complete records and clearer bills. As the first live instance of Tibu, the system is also the starting point for a network of connected facilities.</p>',
                'defaults' => ['type' => 'client'],
            ],
            [
                'slug' => 'najenga',
                'title' => 'Najenga',
                'tagline' => 'Construction collaboration: drawings, budgets, timelines and conversations in one workspace.',
                'category' => 'PropTech, Construction, Project collaboration',
                'technologies' => ['Laravel', 'React', 'Inertia.js', 'MySQL', 'Laravel Sanctum', 'Laravel Scout', 'Meilisearch', 'Spatie Media Library', 'Annotorious', 'React-PDF', 'Tesseract OCR', 'AG Grid', 'SheetJS', 'Telegram Bot API', 'WhatsApp Business API', 'React Mentions', 'Framer Motion', 'Swiper', 'Tailwind CSS', 'Vitest', 'PHPUnit', 'GitHub Actions', 'cPanel'],
                'focus_areas' => ['Drawing annotation and site coordination', 'Expense and receipt tracking', 'Project timelines and team communication'],
                'description' => 'Najenga is a construction collaboration platform where teams mark up architectural drawings, track spending and receipts, follow progress on a visual timeline and keep every conversation tied to the project it concerns.',
                'problem' => '<p>A construction project brings together many specialists who need the same information at the same moment: the latest drawing, the agreed change, what has been spent and why. Putting drawings, decisions, photos and money in one shared space creates an opportunity to cut rework and speed up approvals. It also builds trust between owners and the teams building for them. It lets a project that spans office and site move as one coordinated effort.</p>',
                'methodology' => '<p>A single project workspace that brings the drawing board, the site and the budget together:</p><ul><li><strong>Drawings.</strong> Team members place comments and markers directly on specific points of a drawing or PDF, then discuss them in threaded replies with @mentions.</li><li><strong>Spending.</strong> Receipts are photographed and read automatically, then checked against recorded expenses, so every shilling is traceable.</li><li><strong>Records.</strong> Site photos, documents organised in folders and a visual project timeline build a complete history of the build.</li></ul><p>Messaging inside the platform keeps conversations with the project. Updates can also reach people through WhatsApp and Telegram, the tools site teams already use. Projects can be shared securely with owners and consultants. Fast search, an activity log and analytics dashboards let managers find anything and see how each project is progressing.</p>',
                'outcome' => '<p>Najenga serves everyone involved in a building project: site engineers, architects, project managers, contractors and the property owner. It gives all of them one shared, up-to-date view of the project. The aim is fewer costly mistakes on site, clearer accountability for spending, and owners who can follow their investment from anywhere.</p>',
                'defaults' => ['type' => 'flagship'],
            ],
            [
                'slug' => 'kuba-home-services',
                'title' => 'Kuba Home Services',
                'tagline' => 'A trusted marketplace for home and business services across 13 categories.',
                'category' => 'Marketplace, Home and business services, Gig economy',
                'technologies' => ['Next.js', 'React', 'TypeScript', 'Laravel', 'MySQL', 'Laravel Sanctum', 'Laravel Fortify', 'Laravel Passkeys', 'Laravel Socialite', 'Laravel Reverb', 'Pusher', 'Laravel Scout', 'Meilisearch', 'Spatie Permission', 'Spatie Media Library', 'Spatie Opening Hours', 'Stripe', 'Paystack', 'M-Pesa', 'Tiptap', 'Uppy', 'FilePond', 'Leaflet', 'FullCalendar', 'TanStack Table', 'Recharts', 'Radix UI', 'Tailwind CSS', 'Framer Motion', 'Capacitor (Android)', 'Progressive Web App', 'DomPDF', 'Pest', 'Jest', 'Playwright', 'axe-core', 'Lighthouse CI', 'GitHub Actions', 'cPanel'],
                'focus_areas' => ['Trusted service discovery and booking', 'Provider growth and payouts', 'Secure payments and customer loyalty'],
                'description' => 'Kuba is a services marketplace where clients find verified professionals, request quotes, book appointments, chat and pay in one place. Providers use it to manage their listings, schedules and earnings.',
                'problem' => '<p>Demand for reliable home and business services is large and growing, and many skilled professionals are ready to meet it. Connecting the two through verified profiles, transparent pricing, reviews and secure payment creates an opportunity to build trust on both sides. That trust lets good providers grow their businesses. A dedicated marketplace can turn word-of-mouth referrals into a dependable, repeatable way to hire and to earn.</p>',
                'methodology' => '<p>A two-sided marketplace with dedicated journeys for clients, providers and administrators:</p><ul><li><strong>Clients</strong> search by category and location on a map, compare profiles and reviews, save favourites, request custom quotes and book available time slots.</li><li><strong>Providers</strong> submit verification documents and set their services, prices, working hours and exceptions, then track bookings and payouts from their own dashboard.</li><li><strong>Payments</strong> run by card, Paystack or M-Pesa, with invoices, promo codes and loyalty tiers that reward repeat customers.</li></ul><p>Real-time chat keeps clients and providers in touch before and after a job, and every booking keeps a full activity history. Administrators oversee quality, finances, content and reports. The platform is also packaged as an installable mobile app. Automated accessibility and performance checks run with each release.</p>',
                'outcome' => '<p>Kuba connects households and businesses with vetted service professionals across 13 categories: cleaning, electrical, wellness, grooming, training, hospitality, professional, legal, IT, HR, financial, commercial real estate and logistics. Clients get a trusted place to find, book and pay for help. Providers get a steady flow of work, a professional profile and a reliable way to be paid. The intended impact is a more trusted, better organised services economy.</p>',
                'defaults' => ['type' => 'flagship'],
            ],
            [
                'slug' => 'the-football-experience',
                'title' => 'The Football Experience',
                'tagline' => 'Planning, financing and sharing the journey to global football tournaments.',
                'category' => 'Travel, Sports, FinTech, Fan community',
                'technologies' => ['Laravel', 'React', 'Inertia.js', 'MySQL', 'Laravel Reverb', 'Pusher', 'Laravel Sanctum', 'Laravel Socialite', 'WebAuthn passkeys', 'Two-factor authentication', 'Paystack', 'shadcn/ui', 'Radix UI', 'Tremor', 'Recharts', 'TanStack Table', 'Ready Player Me', 'React SVG World Map', 'FilePond', 'Framer Motion', 'Tailwind CSS', 'Wikipedia API', 'Open-Meteo', 'SerpApi', 'PHPUnit', 'Playwright', 'GitHub Actions'],
                'focus_areas' => ['Tournament trip planning and budgeting', 'Travel and finance partner marketplace', 'Fan community and engagement'],
                'description' => 'The Football Experience helps fans plan, finance and share the journey to international football tournaments. It brings matches, flights, hotels, visas and costs into one budget, alongside packages from trusted travel and finance partners.',
                'problem' => '<p>Africa has one of the most passionate football followings in the world, and more fans than ever want to be in the stadium for the biggest matches. Giving them clear costs, trusted packages and flexible ways to save or finance a trip creates an opportunity to turn that passion into real journeys. Partners gain a new, dedicated audience. A single planning platform can open global tournaments to many more African supporters.</p>',
                'methodology' => '<p>A multi-tournament platform with a complete planning journey for each fan:</p><ul><li><strong>Planning.</strong> Fans pick a tournament, browse fixtures and build a personal budget. Flight and hotel prices, visa requirements, local costs of living, exchange rates and match-day weather are brought in automatically from live sources.</li><li><strong>Booking and finance.</strong> Fans book packages or custom itineraries from verified travel partners, set savings goals and apply to finance partners for support, with payments handled by Paystack.</li><li><strong>Community.</strong> Fan "tribes", a social feed, stories, match predictions with prizes, a fan store and event listings keep supporters engaged before and during the tournament.</li></ul><p>Partners manage their inventory and applications from their own dashboards, and administrators oversee listings, payments, content and analytics. Accounts are protected with passkeys and two-factor sign-in, and more than 160 automated tests guard each release.</p>',
                'outcome' => '<p>Built in partnership with Terik Tours for African football fans who dream of attending major tournaments such as the World Cup, AFCON and the Euros. It also serves the partners who make those trips possible: travel agents, hotels, airlines, finance providers, clubs, federations and event organisers. The intended impact is to make attending a global tournament an achievable, well-planned goal rather than a once-in-a-lifetime gamble.</p>',
                'defaults' => ['type' => 'flagship'],
            ],
            [
                'slug' => 'tena',
                'title' => 'Tena',
                'tagline' => 'Africa\'s hospitality guest relationship platform.',
                'category' => 'Hospitality, Guest experience, Marketing technology',
                'technologies' => ['Laravel', 'React', 'TypeScript', 'Inertia.js', 'MySQL', 'Laravel Sanctum', 'Laravel Passkeys', 'Laravel Cashier', 'Two-factor authentication', 'M-Pesa (Daraja)', 'SMS one-time passcodes', 'React Email', 'TanStack Table', 'Recharts', 'React Quill', 'FilePond', 'Framer Motion', 'Tailwind CSS', 'Pest', 'PHPStan', 'GitHub Actions'],
                'focus_areas' => ['Digital guest portal and stay services', 'Guest relationship marketing', 'Host operations and payments'],
                'description' => 'Tena is a guest relationship platform for hospitality businesses. It gives each guest a personal digital portal for their stay and gives hosts the tools to serve, understand and re-engage those guests long after checkout.',
                'problem' => '<p>Every stay produces a relationship that can last well beyond checkout. Capturing it through a welcoming digital experience, easy in-stay ordering and thoughtful follow-up creates an opportunity to win repeat bookings and referrals directly. It also builds loyalty that belongs to the host rather than to a booking site. A platform built for African hosts, with local payments, can turn one-off visits into long-term guest relationships.</p>',
                'methodology' => '<p>A platform with a guest side and a host side:</p><ul><li><strong>For guests.</strong> A mobile portal opened with a one-time passcode, holding a digital guidebook, property amenities and house policies. Guests can place in-stay orders and pay with M-Pesa.</li><li><strong>For hosts.</strong> A dashboard to manage properties, guests, access points, amenities and orders. Guest details can sync with the host\'s existing property management system.</li><li><strong>Marketing.</strong> Hosts build campaigns, choose an audience, schedule them and track results with analytics.</li></ul><p>Hosts subscribe through built-in billing. Administrators manage hosts, payments, policies, the public landing page and system health. Branded transactional emails, passkey sign-in and two-factor authentication keep communication professional and accounts secure.</p>',
                'outcome' => '<p>Tena serves hospitality hosts across Africa, from short-stay apartments and guesthouses to hotels, and the guests who stay with them. Hosts gain a direct, lasting relationship with every guest. Guests get a smooth, personal stay from arrival to checkout. The intended impact is stronger repeat business for African hospitality providers and better experiences for travellers.</p>',
                'defaults' => ['type' => 'flagship'],
            ],
            [
                'slug' => 'naoa',
                'title' => 'Naoa',
                'tagline' => 'A digital home for the whole wedding: before, during and after the day.',
                'category' => 'Events, Weddings, Guest experience',
                'technologies' => ['React', 'Vite', 'Laravel', 'MySQL', 'Laravel Sanctum', 'Laravel Reverb', 'Pusher', 'Spatie Permission', 'Spatie Backup', 'Laravel Excel', 'DomPDF', 'Simple QrCode', 'html5-qrcode', 'Google Translate', 'i18next', 'Two-factor authentication', 'TanStack Query', 'React Hook Form', 'Leaflet', 'jsPDF', 'JSZip', 'html-to-image', 'React Moveable', 'React Quill', 'Recharts', 'FilePond', 'Framer Motion', 'Tailwind CSS', 'Spotify API', 'Playwright', 'Vitest', 'Vercel', 'GitHub Actions'],
                'focus_areas' => ['Guest management and RSVPs', 'Live wedding-day experience', 'Shared memories and keepsakes'],
                'description' => 'Naoa is a digital wedding platform that handles invitations, RSVPs, seating, gifts and guest travel before the day. On the day, it brings guests together with live updates, QR check-in, song requests and a shared photo gallery.',
                'problem' => '<p>A wedding brings together dozens or hundreds of guests, often from different cities, countries and languages, each needing the right information at the right time. A single digital home for the celebration creates an opportunity to take pressure off the couple and make every guest feel included. It also captures memories that would otherwise be scattered across phones. It turns a stressful coordination task into part of the celebration.</p>',
                'methodology' => '<p>A complete wedding website with a planner\'s control room behind it:</p><ul><li><strong>Before the day.</strong> Couples design digital invitations, manage the guest list, and track RSVPs, plus-ones and dietary needs. They plan seating on a visual chart and run a gift registry that guests can claim from. Travelling guests store their flight, accommodation and ticket details.</li><li><strong>On the day.</strong> QR codes check guests in at the door, and guests follow the programme, live announcements and a live seating tracker. They can request songs from the playlist, sign the guestbook, see the weather, and find the venue and emergency contacts on a map.</li><li><strong>After the day.</strong> Guests upload photos to a shared gallery and instant-camera wall. The couple can download everything as a digital scrapbook.</li></ul><p>The site can be read in several languages, and guest lists and reports export to spreadsheets and PDFs. Planners get analytics, content management, two-factor sign-in and automatic backups.</p>',
                'outcome' => '<p>Naoa serves couples planning a wedding and the guests celebrating with them, including family and friends travelling from abroad. It also serves the planners who coordinate the day. The intended impact is a calmer planning process for couples, a richer and more inclusive experience for guests, and a lasting shared memory of the day. The first instance was built for the DnT wedding, and a self-service version for any couple is planned.</p>',
                'defaults' => ['type' => 'flagship'],
            ],
            [
                'slug' => 'silversky-events',
                'title' => 'Silversky Events Ordering Platform',
                'tagline' => 'Everything an event needs, ordered in one cart.',
                'category' => 'E-commerce, Events, Logistics',
                'technologies' => ['Laravel', 'React', 'Inertia.js', 'MySQL', 'Laravel Fortify', 'Laravel Sanctum', 'Laravel Socialite (Google sign-in)', 'WebAuthn passkeys', 'Two-factor authentication', 'Leaflet', 'DomPDF', 'PHPMailer', 'Intervention Image', 'Headless UI', 'Tailwind CSS', 'PHPUnit', 'GitHub Actions', 'cPanel'],
                'focus_areas' => ['One-stop event services ordering', 'Order fulfilment and delivery tracking', 'Guided event planning'],
                'description' => 'The Silversky ordering platform lets customers order everything an event needs, from catering to toilets, sound systems and furniture, in one cart and at one checkout. The team fulfils each order from a single admin panel.',
                'problem' => '<p>Most events need several services at once, and customers value a single trusted provider who can deliver them together. Offering all four service lines online, with clear pricing and live order tracking, creates an opportunity to serve more customers. It also shortens the path from enquiry to confirmed booking. The platform turns Silversky\'s end-to-end promise into a seamless digital experience.</p>',
                'methodology' => '<p>An online storefront with four service catalogues and one shared cart:</p><ul><li><strong>Ordering.</strong> Catalogues cover catering, mobile sanitation, audiovisual and technical production, and furniture and accessories. Catering items show serving details, and customers set the delivery site on a map.</li><li><strong>Planning and help.</strong> A planning tool and a smart assistant recommend the right mix of services for the event and answer questions.</li><li><strong>Checkout and tracking.</strong> Customers create an account at checkout and pay by invoice, bank transfer or M-Pesa. They then follow their order through to delivery.</li></ul><p>Behind the storefront, the team manages orders, stock levels and packing lists, and assigns deliveries to drivers who update status from the road. Product images, recommendations and settings are all editable without code. The platform reuses the proven OmniShop foundation, rebranded and extended for Silversky. Customers can sign in with Google or a passkey.</p>',
                'outcome' => '<p>Built for Silversky Events, a Kenyan end-to-end events services company. It serves event organisers, corporate clients and families who need catering, mobile sanitation, audiovisual production, or furniture and décor for an event of any size. It also serves the Silversky operations team and delivery drivers. The intended impact is to make booking a complete event as simple as a single online order.</p>',
                'defaults' => ['type' => 'client'],
            ],
            [
                'slug' => 'omnishop-omnispace3d',
                'title' => 'OmniShop',
                'tagline' => 'Exhibitor ordering for Solar and Storage Live Kenya 2026.',
                'category' => 'E-commerce, Events, Trade shows',
                'technologies' => ['Laravel', 'PHP', 'MySQL', 'Blade', 'DomPDF', 'PHPMailer', 'Intervention Image', 'Respect Validation', 'Monolog', 'Guzzle', 'PHPUnit', 'GitHub Actions', 'cPanel'],
                'focus_areas' => ['Exhibitor self-service ordering', 'Order approval and fulfilment', 'Stock and packing management'],
                'description' => 'OmniShop is the exhibitor ordering site for Solar and Storage Live Kenya 2026. Exhibitors choose from about 190 rental items and services, place an order and receive a receipt. The organiser\'s team manages fulfilment from a simple admin panel.',
                'problem' => '<p>Before a trade show opens, dozens of exhibitors need furniture, equipment, catering and flowers delivered to precise booth locations, all within a tight build-up window. Collecting these orders online in one structured place creates an opportunity to plan stock and schedule deliveries in advance. The team can then serve every exhibitor accurately. A self-service catalogue also lets a small team handle a large event with confidence.</p>',
                'methodology' => '<p>An online catalogue and ordering system designed around the exhibitor\'s booth:</p><ul><li><strong>Ordering.</strong> Exhibitors browse rental furniture, equipment, services, catering and flowers, add items to a cart, submit an order for their stand and receive a receipt.</li><li><strong>Fulfilment.</strong> The admin panel moves each order through clear stages: pending, approved, invoiced and fulfilled. It tracks stock levels and prints packing lists grouped by category for the delivery crew.</li><li><strong>Records.</strong> Orders export to spreadsheets for accounting and reporting.</li></ul><p>The system was packaged for a non-technical client, with a plain-English operating guide and simple deployment. Its foundation later became the base for the Silversky Events ordering platform.</p>',
                'outcome' => '<p>Built for OmniSpace 3D Events Ltd, the stand-building contractor at Solar and Storage Live Kenya 2026. It serves exhibitors who need to furnish and equip their booths, and the OmniSpace team who prepare and deliver every order. The intended impact is a faster, more organised build-up to the show, with fewer last-minute requests and errors.</p>',
                'defaults' => ['type' => 'client'],
            ],
            [
                'slug' => 'global-harmony-initiative',
                'title' => 'Global Harmony Initiative',
                'tagline' => 'A nonprofit platform for causes, initiatives and impact stories.',
                'category' => 'NGO, Social impact, Community engagement',
                'technologies' => ['Laravel', 'React', 'Inertia.js', 'MySQL', 'Laravel Breeze', 'WebAuthn passkeys', 'Intervention Image', 'DomPDF', 'jsPDF', 'SheetJS', 'Chart.js', 'Tabulator', 'Quill', 'FilePond', 'GSAP', 'Locomotive Scroll', 'Framer Motion', 'Zustand', 'Zod', 'Tailwind CSS', 'Sentry', 'Vitest', 'PHPUnit', 'GitHub Actions', 'cPanel'],
                'focus_areas' => ['Causes, initiatives and impact storytelling', 'Volunteer and partner engagement', 'Self-managed content and reporting'],
                'description' => 'The Global Harmony Initiative website presents the organisation\'s causes, initiatives, events and impact stories. Behind it, a full management suite lets the team publish content, respond to volunteers and partners, and report on reach.',
                'problem' => '<p>A nonprofit\'s work creates stories, results and invitations to act every week. Sharing them in one clear, well-organised home creates an opportunity to draw in new volunteers, partners and supporters. It also lets the organisation show the difference its programmes make. When the team can publish directly, the website becomes a live, growing record of impact.</p>',
                'methodology' => '<p>A public website and a secure management suite:</p><ul><li><strong>Public site.</strong> Causes and the initiatives under each one, upcoming and past events with photo galleries, impact activities and stories.</li><li><strong>Taking part.</strong> Clear routes to get involved or volunteer, get in touch, or subscribe to the newsletter.</li><li><strong>Management suite.</strong> Staff create and edit every page, story and event with a rich editor, draw on a shared media library and review incoming forms, which are saved as drafts so nothing is lost.</li></ul><p>The team can also export reports and track visitor analytics. Administrators sign in with passkeys, and a system-status page and error monitoring keep the site dependable. Updates reach the live site automatically through a deployment pipeline.</p>',
                'outcome' => '<p>Built for the Global Harmony Initiative, a nonprofit organisation. It serves the communities its programmes reach, the volunteers and partners who want to help, and the supporters who follow its work. The small team running it can publish and manage everything themselves. The intended impact is wider visibility for the organisation\'s work and a steady stream of people ready to take part.</p>',
                'defaults' => ['type' => 'client'],
            ],
            [
                'slug' => 'good-kenyan-foundation',
                'title' => 'The Good Kenyan Foundation',
                'tagline' => 'Pathways from school to dignified work through the creative economy.',
                'category' => 'NGO, Youth development, Creative economy, Education',
                'technologies' => ['Laravel', 'React', 'Inertia.js', 'MySQL', 'Filament', 'Spatie Sitemap', 'Ziggy', 'Framer Motion', 'Tailwind CSS', 'GD image optimisation (WebP)', 'PHPUnit'],
                'focus_areas' => ['Youth programmes and pathways', 'Mentorship and scholarship applications', 'Partner and supporter engagement'],
                'description' => 'The Good Kenyan Foundation website tells the story of the foundation\'s model and programmes. It opens clear routes for young people to register, for mentors to volunteer and for students to apply for scholarships. The team manages all of it from an easy content dashboard.',
                'problem' => '<p>Every year, a new cohort of school leavers brings energy, creativity and ambition into Kenya\'s economy. Linking them with skills, mentors and opportunities in the growing creative sector creates a chance to turn that talent into careers and businesses. A clear, inspiring online home lets the foundation reach more young people and bring more mentors and partners into its network.</p>',
                'methodology' => '<p>A modern foundation website with a built-in management system:</p><ul><li><strong>Public site.</strong> Pages explain the foundation\'s model, programmes such as Stawi, and inspiring stories from the community. A partners section recognises the organisations behind the work.</li><li><strong>Applications.</strong> Dedicated forms let young people register for programmes, mentors apply to volunteer and students apply for scholarships. Every submission arrives organised in the admin dashboard.</li><li><strong>Content management.</strong> The team edits every section of every page, publishes stories and manages partners and newsletter subscribers without technical help. Images are automatically resized and compressed for fast loading.</li></ul><p>The site is built to be found easily by search engines, so programmes reach young people searching online. It replaces the foundation\'s earlier website with a faster, easier-to-manage platform.</p>',
                'outcome' => '<p>The Good Kenyan Foundation equips high-school leavers with 21st-century job and life skills, mentorship and economic pathways into dignified work or entrepreneurship through the creative economy. The website serves those young people and their families. It also serves the mentors, partners and funders who want to back them. The intended impact is more young Kenyans making a confident, supported transition from school to a livelihood.</p>',
                'defaults' => ['type' => 'client', 'client_name' => 'The Good Kenyan Foundation', 'url' => 'https://goodkenyan.org', 'order' => 28],
            ],
            [
                'slug' => 'south-ring-autos',
                'title' => 'South Ring Autos',
                'tagline' => 'Workshop management with online booking, live repair progress and loyalty rewards.',
                'category' => 'Automotive, Workshop management, Customer loyalty',
                'technologies' => ['Next.js', 'React', 'TypeScript', 'Laravel', 'MySQL', 'Laravel Sanctum', 'Laravel Socialite', 'Laravel Reverb', 'Pusher', 'Radix UI', 'Tailwind CSS', 'Framer Motion', 'React Quill', 'FilePond', 'SweetAlert2', 'Vercel', 'GitHub Actions', 'cPanel'],
                'focus_areas' => ['Online booking and vehicle records', 'Live repair progress', 'Customer loyalty and rewards'],
                'description' => 'South Ring Autos runs its workshop on a platform where customers book services online, follow repairs as they happen and keep a complete history of their vehicles. The workshop team manages bookings, clients and payments from one dashboard.',
                'problem' => '<p>Every service visit is a chance to build a long-term relationship with a car owner. Giving customers clear booking, live updates on their repair and a complete record of their vehicle\'s care creates an opportunity to earn lasting trust. Adding rewards for loyalty and referrals turns satisfied customers into regulars. A connected workshop platform lets a local garage offer a modern, dealership-quality experience.</p>',
                'methodology' => '<p>A customer portal and workshop dashboard working together:</p><ul><li><strong>For customers.</strong> They register their vehicles with photos, book services online, and request vehicle pick-up and delivery. They follow each repair stage by stage and view mileage history and digital service journals. Payments are viewed in one place.</li><li><strong>Loyalty.</strong> A points and rewards programme, with referrals, gives customers reasons to return and recommend the workshop.</li><li><strong>For the workshop.</strong> Staff manage bookings, clients and vehicles, update repair progress, and publish blog posts and testimonials. Branded email templates keep customers informed.</li></ul><p>Real-time notifications keep both sides up to date as work progresses. Customers can sign in with their existing social accounts.</p>',
                'outcome' => '<p>Built for South Ring Autos, a vehicle repair workshop in Nairobi. It serves car owners who want reliable, transparent servicing, and the workshop team who manage bookings, repairs and customer relationships. The intended impact is greater customer trust through visibility into every repair, and more loyal, returning clients for the workshop.</p>',
                'defaults' => ['type' => 'client'],
            ],
            [
                'slug' => 'tamcon-consulting-engineers',
                'title' => 'TAMCON Consulting Engineers',
                'tagline' => 'A visual portfolio and self-managed CMS for an engineering consultancy.',
                'category' => 'Engineering, Infrastructure, Corporate portfolio',
                'technologies' => ['Laravel', 'React', 'React Router', 'MySQL', 'Laravel Sanctum', 'Tailwind CSS', 'Framer Motion', 'Swiper', 'Recharts', 'React CountUp', 'FilePond', 'React Icons', 'Vite'],
                'focus_areas' => ['Engineering project showcase', 'Client trust and credentials', 'Self-managed content'],
                'description' => 'The TAMCON website showcases the consultancy\'s engineering disciplines and completed projects through rich photo galleries. A built-in dashboard lets the firm add new projects, clients and testimonials whenever work is completed.',
                'problem' => '<p>An engineering firm\'s strongest argument is the work it has already delivered. Presenting that work visually, organised by discipline and location, creates an opportunity to show capability at a glance and build confidence with new clients. When the firm can update its own portfolio, every completed project becomes fresh proof of expertise.</p>',
                'methodology' => '<p>A visual portfolio website paired with a content dashboard:</p><ul><li><strong>Public site.</strong> Engineering services by discipline, a filterable project portfolio with image galleries and locations, animated key figures, client logos, testimonials and a contact form.</li><li><strong>Content dashboard.</strong> The TAMCON team adds and edits projects with photos, chooses which projects to feature or hide, and manages clients, testimonials, page text and enquiries.</li><li><strong>Insight.</strong> A visitor analytics view shows which projects and pages attract the most interest.</li></ul><p>Smooth animations and fast image galleries give the site a polished, professional feel that matches the quality of the firm\'s work.</p>',
                'outcome' => '<p>Built for TAMCON Consulting Engineers, a civil and infrastructure engineering consultancy. It serves prospective clients, from government agencies and developers to private owners, who need to judge the firm\'s expertise. It also serves the TAMCON team who keep the portfolio current. The intended impact is a stronger professional presence that wins new commissions on the strength of real, completed work.</p>',
                'defaults' => ['type' => 'client'],
            ],
            [
                'slug' => 'dickson-gongona-advocates',
                'title' => 'Dickson, Gitonga Advocates LLP',
                'tagline' => 'A law firm website with secure client and staff portals.',
                'category' => 'LegalTech, Professional services, Client portals',
                'technologies' => ['PHP', 'MySQL', 'Twig', 'Bootstrap', 'Vite', 'Symfony components', 'Doctrine DBAL', 'Phinx', 'Delight Auth', 'PHPMailer', 'TCPDF', 'PhpSpreadsheet', 'PhpWord', 'PDF Parser', 'Mammoth', 'PDF.js', 'Eyecite', 'Fuse.js', 'Tabulator', 'Quill', 'FilePond', 'PHPStan', 'PHPMD', 'PHP-CS-Fixer', 'Rector', 'ESLint', 'cPanel'],
                'focus_areas' => ['Client case portal', 'Consultation requests and intake', 'Legal publications and firm profile'],
                'description' => 'The DGLegal platform combines the firm\'s public website with two secure portals. Clients follow their cases and exchange documents, and staff manage consultations, cases, publications and the firm\'s profile.',
                'problem' => '<p>Clients want to know how their matter is progressing, and law firms want to share updates efficiently and securely. A private online space for each client\'s cases, documents and correspondence creates an opportunity to improve transparency and cut time spent on routine updates. Publishing the firm\'s legal insights online also shows its expertise to new clients.</p>',
                'methodology' => '<p>A public website with a client portal and a staff dashboard:</p><ul><li><strong>Public site.</strong> Presents the firm\'s practice areas and team. A searchable publications library with filters shares the firm\'s legal writing, and a consultation request form captures new enquiries.</li><li><strong>Client portal.</strong> Clients view their cases and correspondence, upload files and receive notifications as matters progress.</li><li><strong>Staff dashboard.</strong> Advocates and staff manage consultation requests, cases, case files, publications, blog posts and team profiles. Built-in tools read uploaded Word and PDF documents to speed up publishing, and reports export to spreadsheets and PDFs.</li></ul><p>Protection against forged requests and strict security settings keep client information confidential. Automated code-quality checks keep the platform maintainable.</p>',
                'outcome' => '<p>Built for Dickson, Gitonga Advocates LLP, a Nairobi law firm. It serves prospective clients looking for legal help, existing clients who want to follow their matters, and the firm\'s advocates and staff who manage cases, publications and consultations. The intended impact is a more responsive, transparent relationship between the firm and its clients.</p>',
                'defaults' => ['type' => 'client'],
            ],
            [
                'slug' => 'mizizi-sugarcane-juice',
                'title' => 'Mizizi Sugarcane Juice',
                'tagline' => 'Fresh juice ordering with map-based delivery.',
                'category' => 'Food and beverage, E-commerce, Local delivery',
                'technologies' => ['PHP', 'MySQL', 'JavaScript', 'jQuery', 'Bootstrap', 'Leaflet', 'OpenStreetMap', 'Nominatim', 'PHPMailer', 'Two-factor authentication', 'cPanel'],
                'focus_areas' => ['Online ordering and checkout', 'Map-based delivery', 'Order tracking and customer feedback'],
                'description' => 'The Mizizi website lets customers order fresh sugarcane juice online and pin their exact delivery spot on a map. The Mizizi team manages orders, payments, deliveries and customer feedback from an admin dashboard.',
                'problem' => '<p>Fresh, natural drinks have a growing and loyal following, and customers increasingly expect to order from their phones. Taking orders online, with precise delivery locations, creates an opportunity for a local brand to serve more customers reliably and plan its deliveries efficiently. Direct feedback from customers helps the brand keep improving its product and service.</p>',
                'methodology' => '<p>An ordering website with a delivery-focused admin dashboard:</p><ul><li><strong>For customers.</strong> A product showcase, checkout as a guest or with an account, personal profiles and order tracking. An interactive map lets buyers pin exactly where the order should arrive, and they can leave ratings and reviews.</li><li><strong>For the Mizizi team.</strong> The dashboard shows each order\'s delivery point on a map and tracks payments and order status. It also manages customers, feedback, notifications and email templates, with analytics on sales and activity.</li></ul><p>Administrator accounts are protected with two-factor sign-in, and automated emails keep customers updated at every stage of their order.</p>',
                'outcome' => '<p>Built for Mizizi, a Kenyan fresh sugarcane juice brand. It serves customers who want fresh juice delivered to their door, and the Mizizi team who prepare, deliver and track every order. The intended impact is a direct sales channel that lets a local food brand grow beyond walk-in customers and reach buyers across its delivery area.</p>',
                'defaults' => ['type' => 'client'],
            ],
            [
                'slug' => 'nissi-insights',
                'title' => 'Nissi Insights',
                'tagline' => 'Publishing and client engagement for a market intelligence firm.',
                'category' => 'Consulting, Market intelligence, Content publishing',
                'technologies' => ['Next.js', 'React', 'TypeScript', 'Laravel', 'MySQL', 'Laravel Sanctum', 'Tiptap', 'SWR', 'Radix UI', 'Tailwind CSS', 'Framer Motion', 'Recharts', 'React Dropzone', 'Browser image compression', 'Jest', 'Pest', 'Vercel', 'GitHub Actions'],
                'focus_areas' => ['Insight and research publishing', 'Events and client engagement', 'Consultation and lead management'],
                'description' => 'Nissi Insights is a publishing and client engagement platform for a market intelligence firm. It presents the firm\'s services, research, case studies and events, and gives the team a full editorial and client-management dashboard.',
                'problem' => '<p>Organisations want dependable market intelligence to guide their decisions, and advisory firms earn trust by sharing what they know. Publishing insights, case studies and resources regularly creates an opportunity to show expertise and draw in the right clients. Pairing that with events and simple consultation booking turns readers into relationships and relationships into engagements.</p>',
                'methodology' => '<p>A content-led website backed by an editorial and client dashboard:</p><ul><li><strong>Public site.</strong> Services grouped under the firm\'s strategic pillars, published insights and downloadable resources, case studies with headline figures, a client list, the team and its values. Upcoming events accept registrations and RSVPs, and a search feature helps readers find content.</li><li><strong>Engagement.</strong> Visitors can request a consultation or subscribe for updates. Event registrants receive documents and email confirmations automatically.</li><li><strong>Editorial dashboard.</strong> The team writes and formats articles in a rich editor, uploads compressed images, and manages events, clients, testimonials and email templates.</li></ul><p>Built-in tools for page redirects, missing-page logs and search-friendly page settings keep the site easy to find. Visitor analytics show which content performs best.</p>',
                'outcome' => '<p>Built for Nissi Insights, a strategic advisory and market intelligence firm. It serves business leaders, investors and organisations looking for clear, practical insight into their markets. It also serves the Nissi team who publish research, run events and manage client enquiries. The intended impact is better-informed decisions for clients and a stronger reputation for the firm as a trusted source of insight.</p>',
                'defaults' => ['type' => 'client'],
            ],
            [
                'slug' => 'gm-coaching',
                'title' => 'GM Coaching',
                'tagline' => 'MBA admissions and consulting interview coaching for African candidates.',
                'category' => 'EdTech, Career coaching, Higher education admissions',
                'technologies' => ['Next.js', 'React', 'TypeScript', 'Laravel', 'MySQL', 'Laravel Sanctum', 'Laravel Reverb', 'Pusher', 'Stripe', 'Calendly', 'shadcn/ui', 'Radix UI', 'Base UI', 'Tailwind CSS', 'Framer Motion', 'Recharts', 'FilePond', 'Intervention Image', 'Vitest', 'Mock Service Worker', 'GitHub Actions', 'Vercel'],
                'focus_areas' => ['MBA admissions coaching', 'Consulting interview preparation', 'Online booking and payments'],
                'description' => 'GM Coaching is a coaching platform that helps African candidates position their strengths for MBA admissions and consulting interviews. Clients book sessions, pay securely and follow their orders online, and the team runs the whole practice from one dashboard.',
                'problem' => '<p>African candidates bring sharp analytical thinking, experience in complex markets and stories that stand out in any applicant pool. Helping them frame those strengths for admissions committees and interviewers creates an opportunity to open doors to leading schools and firms. A dedicated online platform makes expert coaching easy to find, book and pay for from anywhere in the world.</p>',
                'methodology' => '<p>A coaching website with booking, payment and management built in:</p><ul><li><strong>For clients.</strong> Clear service pages for MBA admissions and consulting interview coaching, plus a guide for African applicants, testimonials, a blog and FAQs. Clients book sessions through an integrated calendar, pay by card, and track orders and messages in a personal account.</li><li><strong>For the team.</strong> An admin dashboard manages services, bookings, enquiries, blog posts, testimonials and site content. Email templates come with delivery logs, and built-in health checks confirm that payments, calendar and email connections are working.</li></ul><p>Live notifications keep clients and coaches up to date. Automated tests check each release before it goes live.</p>',
                'outcome' => '<p>GM Coaching serves African students and professionals applying to top MBA programmes and preparing for consulting interviews. It also serves the coaching team who deliver sessions and manage clients. The intended impact is more African candidates presenting their experience with confidence and winning places at leading business schools and firms.</p>',
                'defaults' => ['type' => 'client'],
            ],
            [
                'slug' => 'culture-monitor',
                'title' => 'Culture Monitor',
                'tagline' => 'Measuring organisational culture through structured surveys and analytics.',
                'category' => 'HR, Organisational development, Advisory',
                'technologies' => ['Next.js', 'React', 'TypeScript', 'Laravel', 'MySQL', 'Laravel Sanctum', 'Laravel Reverb', 'Pusher', 'shadcn/ui', 'Base UI', 'Recharts', 'Tailwind CSS', 'Next Themes'],
                'focus_areas' => ['Culture assessment surveys', 'Organisational profiles and benchmarks', 'Culture analytics and insight'],
                'description' => 'Culture Monitor is a culture assessment platform. Organisations define their preferred operating style, survey their people against a set of culture factors, and see the results as clear analytics.',
                'problem' => '<p>Culture shapes how every organisation performs, hires and grows, and leaders increasingly want to understand it with the same clarity as their finances. Measuring culture through structured, repeatable surveys creates an opportunity to see where an organisation stands, where it wants to be and how to close the gap. A dedicated platform makes that insight continuous rather than a one-off exercise.</p>',
                'methodology' => '<p>A survey and analytics platform organised around each client organisation:</p><ul><li><strong>Setting up.</strong> Advisers register organisations, define the culture factors that matter to them and build surveys from a library of standard questions or custom ones.</li><li><strong>Taking part.</strong> Participants receive invitations, complete surveys in a simple web interface, update responses where allowed and review their own history.</li><li><strong>Understanding.</strong> Leaders and advisers see results through interactive charts and profiles that compare actual and preferred culture. Live notifications signal when new responses arrive.</li></ul><p>A built-in guide walks new users through the process. The platform is in development, with the core survey and analytics journey in place.</p>',
                'outcome' => '<p>Culture Monitor serves organisations and the advisers who help them understand and shape their workplace culture. Leaders define the culture they want, employees share how they experience it, and advisers turn the gap into practical recommendations. The intended impact is healthier, better-aligned organisations where culture is measured and managed as deliberately as performance.</p>',
                'defaults' => ['type' => 'client', 'client_name' => 'Culture Monitor', 'url' => null, 'order' => 29],
            ],
            [
                'slug' => 'okjtech-portfolio',
                'title' => 'OKJTechnologies Studio Platform',
                'tagline' => 'The studio\'s own home: services, projects and insights on a fast, self-managed platform.',
                'category' => 'Studio, Portfolio, Web engineering',
                'technologies' => ['Next.js', 'React', 'TypeScript', 'Laravel', 'MySQL', 'Laravel Sanctum', 'Intervention Image', 'Incremental static regeneration', 'SWR', 'Tiptap', 'Radix UI', 'Tailwind CSS', 'Framer Motion', 'Recharts', 'React Dropzone', 'Vercel Analytics', 'Vercel Speed Insights', 'GitHub Actions'],
                'focus_areas' => ['Project portfolio and case studies', 'Services and insights', 'Enquiries and consultations'],
                'description' => 'The OKJTechnologies studio platform presents the studio\'s services, project portfolio and insights through a fast public website. A private dashboard lets every piece of content be updated without touching code.',
                'problem' => '<p>For a design-led studio, the website is both the shop window and the first example of its craft. Presenting real projects in depth, with the problem, the approach and the result, creates an opportunity to show capability honestly and attract clients whose needs match the studio\'s strengths. A site that is fast, searchable and easy to update keeps that story current as new work ships.</p>',
                'methodology' => '<p>A two-part platform with a public website and a content dashboard:</p><ul><li><strong>Public website.</strong> Loads quickly and presents services grouped into strategic pillars, a filterable project portfolio with detailed case studies, insights articles, and the studio\'s values and approach.</li><li><strong>Engagement.</strong> Visitors can search the site, subscribe to updates, RSVP to events or request a consultation.</li><li><strong>Content dashboard.</strong> Every content type (projects, services, insights, clients and site settings) is managed from the dashboard. Pages refresh automatically whenever content changes.</li></ul><p>Visitor and performance analytics show how the site is used. A deployment pipeline publishes updates automatically.</p>',
                'outcome' => '<p>okjtech.co.ke serves organisations and founders looking for a design-led web engineering partner. It also serves the studio itself, as the home for its services, projects and thinking. The intended impact is a clear, honest picture of the work delivered, so that prospective clients can judge capability from real projects and start a conversation easily.</p>',
                'defaults' => ['type' => 'flagship'],
            ],
            [
                'slug' => 'digital-trade-hackathon',
                'title' => 'Digital Trade Hackathon (ALTF 2023)',
                'tagline' => 'Event site for the ALTF 2023 hackathon on digital trade and the AfCFTA.',
                'category' => 'LegalTech, Trade policy, Events, Innovation',
                'technologies' => ['HTML', 'CSS', 'JavaScript', 'Bootstrap', 'jQuery', 'CSS Africa Map', 'Owl Carousel'],
                'focus_areas' => ['Digital trade policy innovation', 'Pan-African participation', 'Hackathon information and registration'],
                'description' => 'The Digital Trade Hackathon site was the online home of the ALTF 2023 hackathon on digital trade and the AfCFTA. An interactive map of Africa showed the participating countries. The hackathon produced 11 shortlisted innovations.',
                'problem' => '<p>The AfCFTA and Africa\'s growing digital economy open a major opportunity for trade across borders. Realising it depends on practical solutions to policy, legal and technical questions. Bringing innovators and policy experts together around a focused challenge creates a chance to turn big ideas into workable tools. A clear, engaging event site helps draw the right participants from across the continent.</p>',
                'methodology' => '<p>A focused event website that explains the hackathon\'s theme, format and timeline, and guides teams through taking part. An interactive map of Africa highlights the countries represented, reinforcing the continental scope of the challenge. The site was built quickly on a responsive template so it worked well on the phones most participants used. It supported a hackathon chaired by the justice-innovation team. The event site is now archived.</p>',
                'outcome' => '<p>Created during employment with the Lawyers Hub for the Digital Trade tech-policy hackathon at the Africa Law Tech Festival 2023 in Nairobi. It served innovators, policy experts, legal professionals and teams from across the continent working on solutions for the African Continental Free Trade Area (AfCFTA) and a single digital market. The intended impact was to turn policy discussion into practical innovations for cross-border digital trade in Africa.</p>',
                'defaults' => ['type' => 'client'],
            ],
            [
                'slug' => 'boda-boda-law',
                'title' => 'Boda-Boda Law Project',
                'tagline' => 'Legal advice and education for boda-boda riders and cross-border traders.',
                'category' => 'LegalTech, Access to justice, Advocacy, Transport',
                'technologies' => ['HTML', 'CSS', 'JavaScript', 'Bootstrap', 'jQuery', 'Typeform', 'Owl Carousel', 'Font Awesome'],
                'focus_areas' => ['Legal advice for riders and traders', 'Legal education and awareness', 'Research and advocacy'],
                'description' => 'The Boda-Boda Law Project website gave boda-boda riders and cross-border traders a direct route to legal advice through a simple "Get Advice Now" request form. It also presented the project\'s education work and research findings.',
                'problem' => '<p>Boda-boda riders and cross-border traders are central to East Africa\'s economy, and clear legal knowledge helps them work safely and confidently. Making legal advice easy to request, and legal information easy to understand, creates an opportunity to widen access to justice for a large and essential workforce. Pairing that access with field research gives policymakers the evidence to improve regulation.</p>',
                'methodology' => '<p>A mobile-friendly advocacy website at the centre of a wider programme:</p><ul><li><strong>Advice.</strong> Riders and traders submit legal questions through a simple embedded form and receive responses from the advisory team.</li><li><strong>Education.</strong> The site presents the project\'s advisory, education, litigation and campaign work, supported by in-person training.</li><li><strong>Research.</strong> It linked the online presence to field research in Kisumu and Namanga. That research led to the published Boda-Boda Law Project report, now held in the Lawyers Hub reports library.</li></ul><p>The website is now archived, and the report remains available online.</p>',
                'outcome' => '<p>Created during employment with the Lawyers Hub for the Boda-Boda Law Project, a legal advisory and education initiative. It served boda-boda (motorcycle taxi) riders and cross-border traders in Kenya and East Africa, who keep people and goods moving every day. It also connected them with the lawyers, researchers and partners supporting the initiative. The intended impact was better legal awareness and easier access to legal advice for workers at the heart of the region\'s informal economy.</p>',
                'defaults' => ['type' => 'client'],
            ],
        ];
    }
};
