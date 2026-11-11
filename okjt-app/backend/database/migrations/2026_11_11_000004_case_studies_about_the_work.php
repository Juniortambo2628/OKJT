<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Case studies rewritten around the work (2026-11-11).
 *
 * Every project's overview, opportunity, build and outcome, in the studio's
 * voice: people first, the work as the subject, OKJTechnologies (never "I")
 * where someone has to act, honest about status and about whose project it
 * was. Facts are unchanged from the earlier write-ups and the catalog; see
 * documentation/VOICE_AND_TONE.md.
 *
 * Also: both Nyalife projects lose their "Visit the platform" link, because
 * the clinic's current systems are another developer's work; and Tibu and
 * Nyalife HMS no longer call Nyalife Tibu's live instance.
 *
 * Rows are matched by slug; fields not listed are left alone.
 */
return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('projects')) {
            return;
        }

        $now = now();
        foreach ($this->projects() as $slug => $fields) {
            $fields = array_map(fn ($v) => is_string($v) ? trim($v) : $v, $fields);
            DB::table('projects')->where('slug', $slug)->update($fields + ['updated_at' => $now]);
        }

        Cache::flush();
    }

    public function down(): void
    {
        // Copy is not reversed.
    }

    private function projects(): array
    {
        return [
            'okjtech-portfolio' => [
                'description' => 'The studio\'s own home: its services, its projects told in depth, and its notes from the work, kept current from a dashboard anyone on the team can use.',
                'problem' => '<p>People choosing a partner to build something important want to see real work, explained honestly: who it was for, what they needed and what changed. A studio\'s website is also the first example of its craft. That makes it the place to show, not tell.</p>',
                'methodology' => '<p>A public website and the dashboard behind it:</p><ul><li><strong>The work, in depth.</strong> Every project has its own case study, with screens of the real system, the opportunity it answered and what was built.</li><li><strong>Services and approach.</strong> Services grouped under the principles that guide every build, and articles drawn from real projects.</li><li><strong>Easy to reach.</strong> Visitors can search, subscribe, or share a brief and get a reply.</li><li><strong>Self-managed.</strong> Projects, services, articles, clients and site settings are all edited from the dashboard, and changes go live straight away.</li></ul><p>Pages load fast, each one is described properly for search engines and link previews, and every update is tested and deployed automatically.</p>',
                'outcome' => '<p>okjtech.co.ke is where organisations, founders and partners meet the work. It lets them judge capability from real projects rather than promises, and start a conversation in a couple of clicks.</p>',
            ],
            'lawyers-hub-digital-policy' => [
                'description' => 'The Lawyers Hub\'s digital policy website: a home for Africa\'s conversation on AI, data protection and digital trade. Developed as part of the Hub\'s justice innovation team.',
                'problem' => '<p>Policymakers, researchers, lawyers and students across Africa need reliable, timely information about fast-moving digital policy. Before the site, the Hub\'s research, bulletins, maps and events lived in many places. Bringing them together makes that knowledge easier to find, trust and use.</p>',
                'methodology' => '<p>A content-managed website built around the Hub\'s publishing rhythm:</p><ul><li><strong>Daily bulletins.</strong> The Africa Law and Tech Bulletin, published issue by issue and browsable by month.</li><li><strong>Policy maps.</strong> Africa\'s digital policy landscape on maps covering data protection, AI strategies and more.</li><li><strong>Research and reports.</strong> A library of publications, including the Boda-Boda Law Project report.</li><li><strong>Programmes and events.</strong> The festival, the AI projects and the Africa Digital Policy Institute\'s courses, each with its own section.</li></ul><p>Non-technical staff publish and update everything themselves. The team behind it also contributed to the bulletins and policy maps the site carries.</p>',
                'outcome' => '<p>The site gives the Lawyers Hub\'s work a single, credible home, and gives the people who shape Africa\'s digital future a place to keep up with it. It is live at lawyershub.org.</p>',
            ],
            'naoa' => [
                'description' => 'Naoa ("I am marrying" in Swahili) is a wedding planning companion built around Kenya\'s marriage traditions, with everything a wedding needs before, during and after the day.',
                'problem' => '<p>Kenyan marriage customs differ across more than thirty communities and mostly live in people\'s memories. As more couples marry across communities, many are unsure what a partner\'s family expects. Meanwhile one wedding is really several events, and the planning often falls on a few tired people. Bringing the traditions, the plan and the people into one place lets the couple focus on each other.</p>',
                'methodology' => '<p>A planning companion and a wedding website in one:</p><ul><li><strong>Traditions to plan.</strong> Marriage processes for more than eighteen Kenyan traditions, reviewed with community advisers, become a customisable plan. Naoa always reminds couples to confirm details with their elders.</li><li><strong>Every event.</strong> Introductions, dowry, registration, ceremony and reception each get their own guests, budget, timeline and owners.</li><li><strong>Guests.</strong> Invitations, RSVPs, travel and accommodation, seating, QR check-in, live updates on the day, and a shared photo gallery that becomes a digital scrapbook.</li><li><strong>Planners and providers.</strong> Planners collaborate with the couple, and venues, caterers, photographers and other providers can show their work and terms.</li></ul><p>Naoa never holds anyone\'s money, and guest details are deleted 30 days after the couple\'s last event.</p>',
                'outcome' => '<p>Naoa began as the website for one couple\'s wedding, which is still live, and is being developed into a product any couple or planner can use. The aim is a calmer journey to the day, guests who feel included, and traditions that are honoured rather than guessed at.</p>',
            ],
            'africa-law-tech-festival' => [
                'description' => 'The web platform for the Africa Law Tech Festival, the Lawyers Hub\'s annual gathering on law, technology and policy, with ticketing, live updates and event mapping.',
                'problem' => '<p>The festival brings together thousands of people across its editions, from judges and regulators to founders and students. They need to register, find the right session and stay in step as a busy programme changes. A dedicated platform, built for local payments and reused each year, makes that easy for attendees and organisers alike.</p>',
                'methodology' => '<p>A festival platform refreshed for each edition:</p><ul><li><strong>Ticketing.</strong> Online registration across ticket types, with local payment support.</li><li><strong>Live notifications.</strong> Announcements and session changes reach attendees as they happen.</li><li><strong>Event mapping.</strong> Venues and sessions on a map across a multi-day schedule.</li><li><strong>Each edition.</strong> Themes, speakers and programmes updated year on year without starting over.</li></ul><p>Built as part of the Lawyers Hub team, which also ran the festival floor, including the 2023 AI and digital trade hackathon.</p>',
                'outcome' => '<p>The festival has a home that grows with it, edition after edition. The platform is live at africalawtech.com.</p>',
            ],
            'najenga' => [
                'description' => 'Najenga keeps a building project\'s drawings, money, photos and conversations in one place, so homeowners, contractors and site teams are all looking at the same truth.',
                'problem' => '<p>Building a home is one of the biggest things a family will ever do, and it is often done from a distance. Money goes out every week and the only window onto the site is a phone call. That gap is where trust gets lost, even when everyone wants the same thing. Putting every drawing, receipt and decision where everyone can see it lets people get back to building together.</p>',
                'methodology' => '<p>One workspace for the drawing board, the site and the budget:</p><ul><li><strong>Drawings.</strong> Notes pinned to exact spots on plans and photos, with the conversation attached to the spot.</li><li><strong>Spending.</strong> Receipts read automatically and matched to expenses, so every shilling has a record.</li><li><strong>Records.</strong> Dated site photos, documents in folders and a timeline of the whole build.</li><li><strong>WhatsApp.</strong> Photos, payment messages, invoices and requests sent to the project\'s number are sorted and filed automatically, and one payment arriving as several messages is only ever counted once.</li></ul><p>Owners and consultants can be given a safe view of exactly their project.</p>',
                'outcome' => '<p>Najenga is in development, with a live staging site and its WhatsApp intake already in use on a real home build. It is designed for homeowners building from afar, contractors running several sites and the people on site, so that a build moves with confidence instead of worry.</p>',
            ],
            'ai-policy-lab' => [
                'description' => 'The AI Policy Lab is a virtual learning and research space for AI policy across Africa and Europe, launched at the 2024 Africa Law Tech Festival. The Lawyers Hub team\'s contribution included its interface design.',
                'problem' => '<p>Africa\'s AI future is being decided now, in strategies, bills and summits, and the people shaping it need shared, evidence-based tools. A learning facility that works across very different connections and levels of technical comfort lets policy professionals take part fully.</p>',
                'methodology' => '<p>Interface design for a policy learning platform:</p><ul><li><strong>Clear paths.</strong> Navigation built around policy modules, working groups and publications, for people who are not used to learning platforms.</li><li><strong>Light and responsive.</strong> Layouts that hold up on slow connections and small screens.</li><li><strong>Progress.</strong> Onboarding, progress indicators and routes to completion for course participants.</li></ul><p>The lab has since grown into a home for research such as the Africa AI Governance Index and country profiles on AI readiness.</p>',
                'outcome' => '<p>A contribution to a larger effort by the Lawyers Hub to build Africa\'s capacity in AI governance. The lab is live at aipolicy.africa.</p>',
            ],
            'the-football-experience' => [
                'description' => 'The Football Experience helps African fans, schools and supporter groups get to the tournaments they dream of, with the whole trip planned, priced and shared in one place. Built with Terik Tours.',
                'problem' => '<p>Africa has some of the most passionate football fans in the world, and for many of them a trip to a major tournament feels out of reach. Matches, flights, visas, hotels and tickets live in different places and currencies. Bringing them together with trusted partners turns a once-in-a-lifetime gamble into a plan.</p>',
                'methodology' => '<p>A platform for everyone around the game:</p><ul><li><strong>Fans.</strong> Pick matches, get a whole-trip estimate in several currencies including Kenyan shillings, compare saved plans and book with verified travel partners.</li><li><strong>Tribes.</strong> Supporter groups and travel crews for each tournament, so people travel with their people.</li><li><strong>Schools and academies.</strong> Programmes with dates and locations, a five-step journey from registering to competing, and an open Learning Hub of coaching and safeguarding resources.</li><li><strong>Partners.</strong> Travel partners publish trips and manage their requests from their own dashboards.</li></ul><p>Children\'s privacy is designed in: schools stay in charge of their pupils\' details, and the platform is built so it never needs to hold them.</p>',
                'outcome' => '<p>Built in partnership with Terik Tours and in development, with the platform live for exploring. The aim is simple: more African fans, and more young players, in the stadium for the games that matter to them.</p>',
            ],
            'adpi-courses' => [
                'description' => 'The course platform of the Africa Digital Policy Institute, the Lawyers Hub\'s training arm, which began life as the Africa Law Tech University. The Hub team also supported delivery of its data protection and CIPP/E training.',
                'problem' => '<p>Africa needs more people who understand data protection, AI and digital policy, and professionals across the continent want recognised training they can fit around their work. One place for every course, in every format, makes that learning easier to find and to finish.</p>',
                'methodology' => '<p>A training platform for many programmes at once:</p><ul><li><strong>Courses.</strong> Self-paced and instructor-led programmes, including the Africa Data Protection Course and CIPP/E certification training.</li><li><strong>Participants.</strong> Registration, enrolment and progress across programmes running side by side.</li><li><strong>Certification.</strong> Clear routes from enrolment to completion.</li></ul><p>Beyond the platform, the team helped deliver the training itself, working with the course material on Kenya\'s Data Protection Act.</p>',
                'outcome' => '<p>A contribution to the Institute\'s work of building digital policy capacity across Africa. The courses are live at lawyershub.org/adpi-courses.</p>',
            ],
            'tibu' => [
                'tagline' => 'Hospital management for every facility, and a path to records that follow the patient.',
                'description' => 'Tibu gives every health facility, from a community clinic to a county referral hospital, a complete management system, and connects them so that, with the patient\'s consent, a medical history can follow the patient.',
                'problem' => '<p>Healthcare in Kenya leans towards privilege, and access is a real struggle for many. A patient at a private hospital in Nairobi and a patient at a remote facility in Kakamega should get the same quality of documentation and the same access to their own records, but today they rarely do. Records are fragmented, often on paper, and a history is lost the moment a patient moves. Free healthcare is beyond any one platform, but delivery of service, documentation and access to information are not.</p>',
                'methodology' => '<p>Built on three words: access, documentation and equal quality.</p><ul><li><strong>Useful on day one.</strong> Each facility gets records, appointments, laboratory, pharmacy, billing and insurance, telehealth and follow-ups in one system, at a price a small clinic can afford.</li><li><strong>Consent first.</strong> Another facility sees a patient\'s summary only after the patient approves it.</li><li><strong>Ecosystem by adoption.</strong> Facilities join because the system helps them, and the network grows from there.</li></ul><p>As the network grows, consolidated and anonymised insights can support research, NGOs and national health reporting.</p>',
                'outcome' => '<p>Tibu is in development, with its product site live. It began with work on a clinical system for Nyalife Women\'s Health Clinic. It is built for everyone: the patient, who gains access to their own health information; the practitioner and the facility, who become more self-sufficient; the health sector, which gains a connected network; and the organisations that rely on sound national health data.</p>',
            ],
            'digital-trade-hackathon' => [
                'description' => 'The AI & Digital Trade Policy Hackathon at the 2023 Africa Law Tech Festival, run by the Lawyers Hub\'s justice innovation team, and the site that brought it together.',
                'problem' => '<p>The African Continental Free Trade Area could transform how Africa trades with itself, but only if policy, law and technology move together. Putting lawyers, policy experts, developers, designers and entrepreneurs in the same room around real problems turns big ideas into workable tools.</p>',
                'methodology' => '<p>A hackathon in two tracks, and its online home:</p><ul><li><strong>Policy track.</strong> Closing the data gap on digital trade, outlining an AI governance framework and identifying what a single digital market needs.</li><li><strong>Tech track.</strong> An AI-driven observatory of the challenges and opportunities in putting the AfCFTA into practice.</li><li><strong>The format.</strong> Up to ten mixed teams of five, drawn at random, working in English and French, in person and online, from a virtual briefing on 7 July to pre-recorded pitches and awards at the festival on 12–13 July 2023.</li><li><strong>The site.</strong> The theme, format and timeline, with an interactive map of Africa showing where participants came from.</li></ul>',
                'outcome' => '<p>Eleven innovations were shortlisted, and SemaPDF, AfriSoko and AfriTrade were among the winners, sharing prizes of KSh 50,000, 30,000 and 20,000. The event site is archived; the ideas, and the habit of putting policy and technology at one table, carry on.</p>',
            ],
            'boda-boda-law' => [
                'description' => 'The Boda-Boda Law Project brought legal advice and education to boda-boda riders and cross-border traders. Its website, field research and trainings were delivered by the Lawyers Hub team.',
                'problem' => '<p>Boda-boda riders keep East Africa moving, yet many meet the law mostly at the roadside, with no one to explain their rights. The problem is not a lack of law but distance from it. Bringing legal knowledge closer, in plain words and at the moment it is needed, is one of the most practical forms of justice there is.</p>',
                'methodology' => '<p>A website at the centre of a wider programme:</p><ul><li><strong>Advice.</strong> A "Get Advice Now" form, so a rider with a problem today could ask for help today.</li><li><strong>Education.</strong> The project\'s advisory, education, litigation and campaign work in plain language, alongside in-person trainings for riders on traffic rules and their rights.</li><li><strong>Research.</strong> Field data collection in Kisumu and Namanga, which became the published Boda-Boda Law Project report.</li></ul>',
                'outcome' => '<p>The project connected riders and traders with the lawyers, researchers and partners behind it. The website is archived, and the report remains available in the Lawyers Hub reports library.</p>',
            ],
            'dickson-gongona-advocates' => [
                'description' => 'A website for a Nairobi law firm, with a private space for every client and a working dashboard for the advocates.',
                'problem' => '<p>Waiting on a legal matter is stressful, and most clients just want to know where things stand. Every "any update?" call also takes an advocate away from the work that moves a matter forward. A calm, private place for each client to follow their case eases both sides at once.</p>',
                'methodology' => '<p>A public website, a client portal and a staff dashboard:</p><ul><li><strong>Public site.</strong> The firm\'s practice areas and people, a searchable library of its legal writing, and a simple way to request a consultation.</li><li><strong>Client portal.</strong> Each client sees their own cases and correspondence, uploads documents and is notified when something changes.</li><li><strong>Staff dashboard.</strong> Consultations, cases, files and publications in one place, with tools that read uploaded Word and PDF documents and reports that export to spreadsheets and PDFs.</li></ul><p>Client information is protected by strict security settings, and automated code checks keep the platform healthy as it grows.</p>',
                'outcome' => '<p>Built for Dickson, Gitonga Advocates LLP. New clients can find help, existing clients can find reassurance, and advocates get time back for the work only they can do. Live at dglegal.co.ke.</p>',
            ],
            'tamcon-consulting-engineers' => [
                'description' => 'A visual portfolio for a civil and infrastructure engineering consultancy, which the firm keeps current itself as each project is completed.',
                'problem' => '<p>An engineering firm\'s strongest argument is the work it has already delivered. Showing that work clearly, by discipline and by place, builds confidence with every new client, and when the firm can update it themselves, every finished project becomes fresh proof of what they can do.</p>',
                'methodology' => '<p>A portfolio website and the dashboard behind it:</p><ul><li><strong>Public site.</strong> Engineering services by discipline, a filterable project portfolio with galleries and locations, key figures, clients, testimonials and a contact form.</li><li><strong>Content dashboard.</strong> The TAMCON team adds projects with photos, chooses what to feature and manages clients, testimonials, page text and enquiries.</li><li><strong>Insight.</strong> Visitor analytics show which projects attract the most interest.</li></ul>',
                'outcome' => '<p>Built for TAMCON Consulting Engineers, for the government agencies, developers and owners who need to judge the firm\'s expertise. The intended impact is new commissions won on the strength of real, completed work. Live at tamconconsult.com.</p>',
            ],
            'south-ring-autos' => [
                'description' => 'A workshop platform where car owners book services online, follow their repair as it happens and keep their vehicle\'s full history, while the workshop runs everything from one dashboard.',
                'problem' => '<p>Leaving your car at a garage means trusting someone with something you depend on every day. Clear booking, live updates on the repair and a complete record of the car\'s care turn that worry into trust, and trust turns customers into regulars.</p>',
                'methodology' => '<p>A customer portal and a workshop dashboard working together:</p><ul><li><strong>For car owners.</strong> Register vehicles, book services or pick-up and delivery, follow each repair stage by stage, and keep mileage history and service journals.</li><li><strong>Loyalty.</strong> Points, rewards and referrals that give customers reasons to come back.</li><li><strong>For the workshop.</strong> Bookings, clients, vehicles and repair progress in one place, with branded emails and live notifications keeping customers informed.</li></ul>',
                'outcome' => '<p>Built for South Ring Autos in Karen, Nairobi. Car owners get transparency at every step, and the workshop gets loyal, returning clients. Live at southringautos.com.</p>',
            ],
            'nyalife-womens-clinic' => [
                'url' => null,
                'description' => 'A website for a women\'s health clinic, introducing its services and departments and making it easy to book an appointment.',
                'problem' => '<p>Women looking for care, often at an anxious moment, need to find a clinic they can trust: what it offers, who will see them and how to book. A warm, clear website gives a clinic that first conversation before anyone walks through the door.</p>',
                'methodology' => '<p>A clinic website built around the patient\'s questions:</p><ul><li><strong>Services.</strong> Obstetric and gynaecological care, laboratory, pharmacy, ultrasound and paediatric services, each explained plainly.</li><li><strong>Booking.</strong> Appointment requests and telehealth consultations from any page.</li><li><strong>Health information.</strong> A blog of practical guides for patients.</li></ul>',
                'outcome' => '<p>Built for Nyalife Women\'s Health Clinic. The clinic\'s current website is maintained by another developer; the screens shown here are from OKJTechnologies\' own build.</p>',
            ],
            'nyalife-hms' => [
                'url' => null,
                'description' => 'A hospital management system for a women\'s health clinic, following every visit from the front desk to the final receipt, with a workspace for each member of staff.',
                'problem' => '<p>A busy clinic creates information at every step of a visit, and when it is scattered, patients wait longer and staff rebuild the same picture again and again. One connected record, shared by every department, makes each visit smoother and each decision better informed.</p>',
                'methodology' => '<p>A complete clinical administration system:</p><ul><li><strong>Front desk.</strong> Registration, a live patient queue and emergency triage.</li><li><strong>Appointments.</strong> A shared calendar, with doctors able to block out time.</li><li><strong>Clinical care.</strong> Vital signs, consultation notes, laboratory and imaging requests, and prescriptions.</li><li><strong>Laboratory and pharmacy.</strong> Sample tracking with result templates, and medicine stock managed by batch with purchase orders.</li><li><strong>Billing.</strong> Invoices, insurance, payments and an audit of every cancelled charge.</li></ul><p>Telehealth with online consent and payment, follow-up reminders, internal messaging and role-based access complete it, with every action logged so sensitive health information stays protected.</p>',
                'outcome' => '<p>Built for Nyalife Women\'s Health Clinic, for its receptionists, nurses, doctors, laboratory technicians, pharmacists, billing staff and administrators. The work became the starting point for Tibu. Another developer has since taken the clinic\'s system forward; the screens shown here are from OKJTechnologies\' own build, with demonstration data.</p>',
            ],
            'hucaa' => [
                'description' => 'An online home for the Hekima University College Alumni Association, where graduates reconnect, share opportunities and give back.',
                'problem' => '<p>Graduates leave with friendships, mentors and a shared formation, and then life scatters them across countries and careers. Without a common place, those connections fade and opportunities pass by on the wrong group chat. An alumni platform helps people keep belonging.</p>',
                'methodology' => '<p>A members\' platform for the association:</p><ul><li><strong>Directory.</strong> Find classmates and grow a professional network.</li><li><strong>Groups and messaging.</strong> Interest groups and private messages, kept within the community.</li><li><strong>Events and activities.</strong> Gatherings and opportunities that reach every member.</li><li><strong>Giving back.</strong> Simple routes to support scholarships, mentoring and campus initiatives.</li></ul><p>Members register and sign in, so the community is open to its members and not to everyone.</p>',
                'outcome' => '<p>Built for the Hekima University College Alumni Association and live at alumni.hekima.ac.ke, where it continues to grow with its members.</p>',
            ],
            'global-harmony-initiative' => [
                'description' => 'A home for a nonprofit\'s causes, initiatives and stories, with the tools its small team needs to publish, respond and report.',
                'problem' => '<p>A nonprofit\'s work produces stories, results and invitations to help every week. Sharing them in one clear place draws in volunteers, partners and supporters, and shows the difference the programmes make.</p>',
                'methodology' => '<p>A public website and a management suite:</p><ul><li><strong>Public site.</strong> Causes and their initiatives, events with photo galleries, and impact stories.</li><li><strong>Taking part.</strong> Clear routes to volunteer, get in touch or subscribe.</li><li><strong>Management suite.</strong> The team edits every page, story and event, draws on a shared media library and reviews incoming forms, saved as drafts so nothing is lost.</li></ul><p>Administrators sign in with passkeys, reports export easily, and updates reach the live site automatically.</p>',
                'outcome' => '<p>Built for the Global Harmony Initiative, for the communities it serves and the people who want to help. The small team runs everything themselves.</p>',
            ],
            'wisdom-capital' => [
                'description' => 'An online shop for an agricultural producer, built for farmers ordering chicks, feeds, seedlings and honey from their phones.',
                'problem' => '<p>A farmer buying chicks is investing in their livelihood, and needs to trust the product and the delivery before paying. Clear information, simple ordering and a way to check on an order respect the buyer\'s time and the weight of their decision.</p>',
                'methodology' => '<p>A storefront and the dashboard behind it:</p><ul><li><strong>Trust first.</strong> Each brand (Wisdom Chicken, Wisdom Feeds, Wisdom Nursery and Uki Honey) with its credentials: KEBS-certified feeds, a licensed hatchery and delivery across East Africa.</li><li><strong>Ordering.</strong> Products by brand and category, search, a simple cart and checkout, and email confirmations.</li><li><strong>Track Order.</strong> Customers check their delivery with their order number, without having to call.</li><li><strong>Dashboard.</strong> Sales, payment status and distribution by region, for planning stock and routes.</li></ul>',
                'outcome' => '<p>Built for Wisdom Capital, which supports farmers across East Africa. Live at wisdomcapital.co.ke.</p>',
            ],
            'reytati-communications' => [
                'description' => 'A bold, single-page website for a Nairobi communications agency, with a dashboard for keeping its services and testimonials current.',
                'problem' => '<p>A creative agency is judged on first impressions. Its own site has to show the confidence it promises clients, and it has to be easy for the team to keep fresh without calling a developer.</p>',
                'methodology' => '<p>A single-page site and an admin panel:</p><ul><li><strong>The story.</strong> The agency\'s approach and services, from consumer engagement and media to events and creative design, in one flowing page.</li><li><strong>Leads.</strong> A contact form that captures the details the team needs to follow up.</li><li><strong>Admin.</strong> The team updates services, testimonials and contact details themselves.</li></ul>',
                'outcome' => '<p>Built for Reytati Communications. Live at reytaticomms.com.</p>',
            ],
            'mizizi-sugarcane-juice' => [
                'description' => 'Fresh sugarcane juice ordered online, delivered to the exact spot the customer pins on a map.',
                'problem' => '<p>Customers love fresh, natural drinks and increasingly expect to order from their phones. Knowing exactly where each order is going lets a local brand serve more people reliably, and hearing from them directly helps it keep improving.</p>',
                'methodology' => '<p>An ordering site with a delivery-focused dashboard:</p><ul><li><strong>For customers.</strong> Browse, check out as a guest or with an account, pin the delivery spot on a map, track the order and leave a review.</li><li><strong>For the team.</strong> Each order\'s delivery point on a map, payments and status, customers and feedback, with sales analytics.</li></ul><p>Administrator accounts use two-factor sign-in, and customers get an email at every stage of their order.</p>',
                'outcome' => '<p>Built for Mizizi, so a local brand can grow beyond walk-in customers and reach buyers across its delivery area.</p>',
            ],
            'tena' => [
                'description' => 'Tena gives every hotel or short-stay guest a personal digital portal for their stay, and gives hosts the tools to serve them well and welcome them back.',
                'problem' => '<p>Every stay is the start of a relationship that can last well beyond checkout. A welcoming digital experience, easy ordering during the stay and thoughtful follow-up win repeat bookings, and build loyalty that belongs to the host rather than to a booking site.</p>',
                'methodology' => '<p>A guest side and a host side:</p><ul><li><strong>For guests.</strong> A mobile portal opened with a one-time code, with a guidebook, amenities, house policies and in-stay orders paid by M-Pesa.</li><li><strong>For hosts.</strong> Properties, guests, access points, amenities and orders in one dashboard, syncing with existing property systems.</li><li><strong>Marketing.</strong> Campaigns to past guests, scheduled and measured.</li></ul><p>Hosts subscribe through built-in billing, and accounts are protected with passkeys and two-factor sign-in.</p>',
                'outcome' => '<p>Tena is built for hospitality hosts across Africa, from guesthouses and short-stay apartments to hotels, and for the guests who stay with them.</p>',
            ],
            'kuba-home-services' => [
                'description' => 'Kuba connects households and businesses with verified professionals: find, compare, book, chat and pay in one place.',
                'problem' => '<p>Finding someone you can trust to come into your home or business is hard, and good professionals struggle to be found beyond word of mouth. Verified profiles, honest reviews, clear prices and secure payment build trust on both sides, so good work leads to more work.</p>',
                'methodology' => '<p>A two-sided marketplace:</p><ul><li><strong>Clients.</strong> Search by category and location, compare profiles and reviews, request quotes and book available times.</li><li><strong>Providers.</strong> Get verified, set services, prices and hours, and follow bookings and payouts.</li><li><strong>Payments.</strong> Card, Paystack or M-Pesa, with invoices and rewards for returning customers.</li></ul><p>Real-time chat keeps both sides in touch, and every booking keeps its full history.</p>',
                'outcome' => '<p>Kuba serves thirteen categories, from cleaning and electrical work to legal, financial and logistics services, and the professionals who build their livelihoods on them. Live at kuba.co.ke.</p>',
            ],
            'silversky-events' => [
                'description' => 'Everything an event needs, from catering to sound, sanitation and furniture, ordered in one cart and delivered by one team.',
                'problem' => '<p>Most events need several services at once, and organisers would rather trust one provider to deliver them together. Putting every service line online with clear prices and live tracking shortens the path from enquiry to a confirmed, worry-free event.</p>',
                'methodology' => '<p>One storefront for four service lines:</p><ul><li><strong>Ordering.</strong> Catering, mobile sanitation, audiovisual production, and furniture and accessories, with the delivery site set on a map.</li><li><strong>Planning help.</strong> A planning tool and assistant recommend the right mix for the event.</li><li><strong>Checkout and tracking.</strong> Pay by invoice, bank transfer or M-Pesa, and follow the order to delivery.</li><li><strong>Operations.</strong> Orders, stock, packing lists and driver assignments in one panel.</li></ul><p>It builds on the OmniShop foundation, extended for Silversky.</p>',
                'outcome' => '<p>Built for Silversky Events, for organisers, companies and families planning events of any size, and for the team that delivers them. In development.</p>',
            ],
            'omnishop-omnispace3d' => [
                'description' => 'OmniShop is the exhibitor ordering site for Solar & Storage Live Kenya 2026: around two hundred items and services, ordered online and delivered to each stand.',
                'problem' => '<p>Before a trade show opens, dozens of exhibitors need furniture, equipment and services at precise stands within a tight window, and the event team is stretched in every direction. Collecting orders in one structured place lets a small team plan ahead and serve everyone accurately, without waiting on a developer.</p>',
                'methodology' => '<p>A catalogue and ordering system built to be handed over:</p><ul><li><strong>Ordering.</strong> Exhibitors sign in with their invitation, browse by category, order for their stand and receive a confirmation.</li><li><strong>Fulfilment.</strong> Each order moves through clear stages, from pending to approved, invoiced and fulfilled, with stock limits and packing lists by category or by stand.</li><li><strong>Records.</strong> Orders export to spreadsheets for finance.</li></ul><p>It shipped with a plain-English guide and a one-click launcher, so the team could run it on their own.</p>',
                'outcome' => '<p>Built for OmniSpace 3D Events Ltd, the stand-building contractor at the show. The intended impact was a calmer, better organised build-up, and a team confident running its own system.</p>',
            ],
            'nissi-insights' => [
                'description' => 'A publishing and client platform for a strategic advisory and market intelligence firm working across energy, fintech and international diplomacy.',
                'problem' => '<p>Advisory firms earn trust by sharing what they know. Publishing research, case studies and events regularly shows expertise and draws in the right clients, and simple booking turns readers into conversations.</p>',
                'methodology' => '<p>A content-led website and an editorial dashboard:</p><ul><li><strong>Public site.</strong> Services under the firm\'s pillars, insights and resources, case studies, the team, and events with registration.</li><li><strong>Engagement.</strong> Consultation requests and subscriptions, with automatic confirmations.</li><li><strong>Editorial dashboard.</strong> A rich editor for articles, image uploads, and management of events, clients, testimonials and email templates.</li></ul><p>Redirects, missing-page logs and search-friendly settings keep the work easy to find.</p>',
                'outcome' => '<p>Built for Nissi Insights and its clients: leaders, investors and organisations looking for clear insight into their markets. Live at nissi-insights.com.</p>',
            ],
            'gm-coaching' => [
                'description' => 'A coaching platform helping African candidates present their strengths for MBA admissions and consulting interviews, with booking and payment built in.',
                'problem' => '<p>African candidates bring sharp thinking, experience in complex markets and stories that stand out, yet the global stage was not built with them in mind. Expert coaching that is easy to find, book and pay for from anywhere helps them walk in with confidence.</p>',
                'methodology' => '<p>A coaching website with the practice behind it:</p><ul><li><strong>For candidates.</strong> MBA admissions and consulting interview coaching, a guide for African applicants, testimonials and a blog, with sessions booked through an integrated calendar and paid by card.</li><li><strong>For the coach.</strong> Services, bookings, enquiries and content in one dashboard, with health checks confirming payments, calendar and email are working.</li></ul>',
                'outcome' => '<p>Built for GM Coaching, so more African candidates can win places at leading business schools and firms. Live at gm-coaching.com.</p>',
            ],
            'good-kenyan-foundation' => [
                'description' => 'A home for a foundation opening pathways from school to dignified work, with clear routes for young people, mentors and scholarship applicants.',
                'problem' => '<p>Every year, school leavers bring energy and ambition into Kenya\'s economy, and too many are left without a next step. Linking them with skills, mentors and opportunities in the creative economy turns talent into livelihoods, and a clear online home lets the foundation reach more of them.</p>',
                'methodology' => '<p>A foundation website with its own management system:</p><ul><li><strong>Public site.</strong> The foundation\'s model, programmes such as Stawi, community stories and partners.</li><li><strong>Applications.</strong> Forms for young people to register, mentors to volunteer and students to apply for scholarships, arriving organised in the dashboard.</li><li><strong>Content.</strong> The team edits every page, story and partner without help, with images resized automatically for speed.</li></ul>',
                'outcome' => '<p>Built for The Good Kenyan Foundation, for young Kenyans and the mentors, partners and funders who back them. Live at goodkenyan.org.</p>',
            ],
        ];
    }
};
