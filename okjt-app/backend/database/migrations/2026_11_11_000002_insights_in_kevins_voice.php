<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Insights rewritten around the work (2026-11-11).
 *
 * The five existing articles are rewritten (same slugs, so links keep
 * working; their publish dates stay) and nine new ones are added, each told
 * from the work itself. Voice: documentation/VOICE_AND_TONE.md. Facts:
 * documentation/PROJECT_CATALOG_ACCURATE.md and the live systems; nothing
 * here is invented.
 *
 * Articles are matched by slug: an existing one is updated, a missing one
 * inserted (published, written by the account that wrote the others). New
 * articles bring a cover screenshot; an existing cover is never replaced.
 * The Insights page's intro is rewritten in the same voice.
 */
return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('insights')) {
            return;
        }

        $now = now();
        $author = DB::table('insights')->whereNotNull('user_id')->value('user_id')
            ?? (Schema::hasColumn('users', 'is_admin') ? DB::table('users')->where('is_admin', true)->value('id') : null)
            ?? DB::table('users')->value('id');

        foreach ($this->articles() as $a) {
            $fields = [
                'title' => $a['title'],
                'category' => $a['category'],
                'excerpt' => $a['excerpt'],
                'content' => trim($a['content']),
                'updated_at' => $now,
            ];
            $row = DB::table('insights')->where('slug', $a['slug'])->first(['id', 'image']);
            if ($row) {
                if (empty($row->image) && ! empty($a['image'])) {
                    $fields['image'] = $a['image'];
                }
                DB::table('insights')->where('id', $row->id)->update($fields);
            } elseif ($author) {
                DB::table('insights')->insert($fields + [
                    'slug' => $a['slug'],
                    'image' => $a['image'] ?? null,
                    'user_id' => $author,
                    'is_published' => true,
                    'published_at' => $a['published_at'],
                    'created_at' => $now,
                ]);
            }
        }

        if (Schema::hasTable('site_settings')) {
            foreach ([
                ['insights_title', 'Notes from the work', 'text', 'homepage'],
                ['insights_subtitle', 'What building for clinics, law firms, builders, farmers, couples and fans has taught OKJTechnologies about people, problems and the quiet work that holds a system together. Written for anyone carrying a problem they have been told is too big.', 'textarea', 'insights'],
            ] as [$key, $value, $type, $group]) {
                if (DB::table('site_settings')->where('key', $key)->exists()) {
                    DB::table('site_settings')->where('key', $key)->update(['value' => $value, 'updated_at' => $now]);
                } else {
                    DB::table('site_settings')->insert(['key' => $key, 'value' => $value, 'type' => $type, 'group' => $group, 'created_at' => $now, 'updated_at' => $now]);
                }
            }
        }

        Cache::flush();
    }

    public function down(): void
    {
        // Copy is not reversed.
    }

    private function articles(): array
    {
        $img = fn (string $shot) => "/assets/images/work/{$shot}.webp";

        return [
            [
                'slug' => 'there-is-no-impossible-problem',
                'title' => 'There is no impossible problem',
                'category' => 'Practice',
                'published_at' => '2026-11-10 09:00:00',
                'image' => $img('najenga/03'),
                'excerpt' => 'Almost every problem OKJTechnologies has taken on was first called impossible by someone. Here is what the work has shown about the ones that only look that way.',
                'content' => <<<'HTML'
<p>Almost every project OKJTechnologies has taken on arrived with a sentence attached to it. <em>This is just how it is here.</em> Paper records are just how clinics work. Riders will always be harassed at the roadside. Building from abroad means you will be cheated. Nobody plans a wedding across two families' traditions without a fight.</p>
<p>It is easy to understand why people say it. When you have carried a problem for long enough, calling it impossible is a way of putting it down for a minute. Nobody should be judged for that. But in project after project, it has not turned out to be true.</p>
<h2>Impossible usually means unmapped</h2>
<p>Look closely at a problem everyone has given up on and the same thing is nearly always underneath it: nobody has drawn the whole picture. The clinic's problem was never only the clinic's. It belonged to the receptionist re-typing a history, the patient retelling it in a new waiting room, the doctor guessing at what was prescribed last month. Once you can see every person the problem touches, and what each of them stands to gain, a way through starts to appear.</p>
<p>That is why every OKJTechnologies project maps the ecosystem before any code is written. Not because it is a clever framework, but because it is the most respectful place to start. It says: your problem is real, and so are the people around it.</p>
<h2>Scarcity is a story, not a fact</h2>
<p>There is a mindset that says there is only so much to go round: so much budget, so much patience, so much goodwill. The work says otherwise. When a system is designed so that every person in it is better off for taking part, the goodwill grows. People bring their friends. Facilities tell other facilities. Riders tell other riders.</p>
<p>Good work is often discounted. The people holding things together rarely get thanked for it. But the answer is not to do less good work. The answer is to build systems that notice those people, and make their load lighter.</p>
<h2>What to do when something looks impossible</h2>
<ul>
<li>Find the person carrying it. Usually it is one person, quietly, at their own cost. Start there.</li>
<li>Draw everyone it touches. Client, end user, regulator, neighbour, the person who will run it after launch.</li>
<li>Make the first step small and useful on its own. A clinic gets a working records system on day one, long before any national network exists.</li>
<li>Be honest about what isn't done yet. Hope is not a substitute for facts. It is a reason to keep going until the facts change.</li>
</ul>
<h2>An invitation</h2>
<p>If you are carrying something you have been told is too big, OKJTechnologies would like to hear about it. It may not be easy. It won't be called impossible, and the first step can be found together.</p>
HTML,
            ],
            [
                'slug' => 'ecosystem-mapping-before-you-write-a-line-of-code',
                'published_at' => '2026-09-15 09:00:00', // used only if the article is missing
                'title' => 'Ecosystem mapping before you write a line of code',
                'category' => 'Strategy',
                'image' => $img('tibu/02'),
                'excerpt' => 'Before anything is scoped, every person the system will touch gets mapped. It is the most respectful place to start, and it changes what gets built.',
                'content' => <<<'HTML'
<p>The first deliverable on every OKJTechnologies project is not a design or a database. It is a map of people.</p>
<p>Everyone who could be affected by the thing we are about to build, or who could make it better: the client who is paying, the person who will use it every day, the regulator who will one day ask questions of it, the business next door whose work it touches, the people who hold the data before and after it, and the wider community it lives in.</p>
<h2>Where the practice comes from</h2>
<p>The practice comes from the Afrilabs capacity-building programme <em>Leveraging Stakeholder Relationships through Ecosystem Mapping and Building</em> in Addis Ababa, attended during the founder's time at the Lawyers Hub. It looked like a business workshop. It turned into a different way of seeing every brief since.</p>
<h2>Why it matters so much</h2>
<p>Most software fails quietly, not because the code is bad but because someone in the picture had no reason to take part. The receptionist who was never asked. The partner organisation that was expected to change its whole process for nothing in return. The client who was left to run something they were never shown how to run.</p>
<p>A map makes those people visible. Once you can see them, you can ask a better question than <em>what should this system do?</em> You can ask <em>how does each of these people come out of this better off?</em></p>
<h2>What it changes in practice</h2>
<ul>
<li>Tibu, the health product that grew out of the work on Nyalife's hospital system, gives each facility a fully useful system on day one. The national picture comes later, because every facility already has its own reason to join.</li>
<li>Najenga treats the homeowner, the contractor, the site manager and the family back home as equals, with each one seeing exactly what they need and nothing that isn't theirs.</li>
<li>OmniShop was designed around the person who would have to run it alone at a trade show, not around the developer.</li>
</ul>
<h2>The map keeps paying</h2>
<p>The map shapes everything that follows: the database, the admin screens, who gets notified about what. It is also the single biggest reason clients stay. When everyone in a system has an aligned reason to be there, the system keeps growing long after launch day.</p>
<p>If you are about to commission something, start with the people. The code will be better for it, and so will the relationships around it.</p>
HTML,
            ],
            [
                'slug' => 'two-years-inside-africas-legaltech-engine-room',
                'published_at' => '2026-09-08 09:00:00', // used only if the article is missing
                'title' => "Two years inside Africa's LegalTech engine room",
                'category' => 'LegalTech',
                'image' => $img('lawyers-hub-digital-policy/01'),
                'excerpt' => 'Bulletins, policy maps, festival platforms, data-protection trainings and a field study with boda-boda riders: what two years of work at the Lawyers Hub revealed about justice and technology.',
                'content' => <<<'HTML'
<p>From February 2023 to December 2024, OKJTechnologies' founder worked at the Lawyers Hub in Nairobi, first as a trainee and then as Software Developer, Justice Innovation. Those two years shaped how the studio builds, and who it builds for.</p>
<h2>The work, all of it</h2>
<p>The work included leading development of the Lawyers Hub Digital Policy website and building the Africa Law Tech Festival platform, with ticketing, live notifications and event mapping for a festival that has gathered thousands of people across its editions. It also included UI and UX for the AI Policy Lab and the design of the platform that became the Africa Digital Policy Institute's course site.</p>
<p>But some of the most important work had nothing to do with code: contributions to every Daily Bulletin of that period and to the Africa digital-policy maps the Hub published, support for the Africa Data Protection Course and the CIPP/E training, and leading the hackathon at the 2023 festival.</p>
<h2>What it showed about justice</h2>
<p>LegalTech in Africa is not mainly about clever legal databases. It is about reach. Getting the right information to the person who needs it, through a channel they already use, in a form they can act on today.</p>
<p>Nothing showed that more clearly than the Boda-Boda Law Project, with field data collection in Kisumu and Namanga and in-person trainings for riders on traffic rules and their rights under Kenyan law. Sitting with riders, you understand quickly that the problem is not a lack of law. It is a lack of access to it, and a lot of fear in the gap.</p>
<h2>What it showed about building</h2>
<ul>
<li>Trust is a feature. Role-based access, careful permissions and strong sign-in are table stakes for anything that holds people's information.</li>
<li>Small teams can carry enormous programmes when the tools respect their time.</li>
<li>The people doing the quiet, daily work, the bulletins, the logistics, the follow-ups, are what make the big moments possible. They deserve systems built for them.</li>
</ul>
<h2>Thank you</h2>
<p>To the team at the Hub: thank you for trusting a trainee with real work, and for showing what it looks like to serve a whole continent's conversation with care. Every LegalTech platform OKJTechnologies builds carries a piece of that.</p>
HTML,
            ],
            [
                'slug' => 'solo-founder-stack-laravel-nextjs-ai-accelerated',
                'published_at' => '2026-08-31 09:00:00', // used only if the article is missing
                'title' => 'One person, one thread: how a solo studio ships like a team',
                'category' => 'Engineering',
                'image' => $img('okjtech-portfolio/01'),
                'excerpt' => 'OKJTechnologies is a deliberately small studio. The stack, the habits and the AI tooling that carry a project from first conversation to a supported, live system.',
                'content' => <<<'HTML'
<p>OKJTechnologies is deliberately small. People are sometimes surprised by that when they see the size of the systems. It is a choice, and it is worth being open about how it works, because the honesty is part of the promise.</p>
<h2>Why one thread matters to clients</h2>
<p>When a project passes between a designer, a developer, a deployer and a support desk, something gets dropped at every hand-off. Usually it is the thing the client said in the very first meeting that mattered most to them. Carrying a project end to end means that thing never gets lost. The person who listened is the person who builds, launches and looks after it.</p>
<h2>The stack</h2>
<ul>
<li>Laravel for the back end: data, sign-in, permissions, email and the admin side.</li>
<li>React, often with Inertia or Next.js, for the parts people see, styled with Tailwind.</li>
<li>MySQL in production, with GitHub Actions testing and deploying every change.</li>
<li>Playwright and PHPUnit tests, so a fix today doesn't quietly break something from last month.</li>
</ul>
<p>Nothing exotic. Proven tools mean the client is never stuck with something only its original builder can understand.</p>
<h2>The habits</h2>
<p>People first, then the data, then the screens, then the launch. The ecosystem map sits at the start and connects every step after it. If a feature doesn't make someone on that map better off, it waits.</p>
<h2>Where AI fits</h2>
<p>AI tooling takes the mechanical weight off: scaffolding, repetitive code, first drafts of documentation, checking the work. It does not decide what to build or who to build it for. That judgement, the listening and the care, stays human. What it gives back is time, and that time goes to the people the work is for.</p>
<h2>What it adds up to</h2>
<p>A one-person studio that can carry a hospital system, a marketplace or a wedding platform from first conversation to a supported, live product. Not by working longer hours, but by choosing good tools, keeping one clear thread, and never losing sight of the person at the other end.</p>
HTML,
            ],
            [
                'slug' => 'building-nyalife-hms-first-instance-of-tibu',
                'published_at' => '2026-08-21 09:00:00', // used only if the article is missing
                'title' => 'Building Nyalife HMS, where Tibu began',
                'category' => 'HealthTech',
                'image' => $img('tibu/01'),
                'excerpt' => 'A records system for one women\'s clinic, and the first step towards a patient\'s history following them to any facility in the country.',
                'content' => <<<'HTML'
<p>It started as a clear, modest request: a clinical administration system for Nyalife Women's Health Clinic. Patient records, appointments, clinical files, and the right people seeing the right things.</p>
<p>But the real brief was the women in that waiting room.</p>
<h2>The person carrying the problem</h2>
<p>In much of Kenya, a patient's medical history lives on paper, in the facility where it was written. Move house, get referred, travel, and you start again. You retell everything, often at the worst possible moment. The quality of what gets written down can depend on which facility you could afford to walk into.</p>
<p>That is a heavy thing to ask a patient to carry. It is heavy for the nurses and doctors too, rebuilding a picture they should already have.</p>
<h2>Useful on day one</h2>
<p>So Nyalife's system is built to be fully useful to the clinic on its own, from the first day: records, scheduling, clinical files and role-based access, with end-to-end tests and a deployment pipeline behind it. Another developer has since taken the project forward, and the system the clinic runs today is their work. Laying the first stone was a privilege.</p>
<p>Building it revealed the foundation for something bigger.</p>
<h2>Tibu: ecosystem by adoption</h2>
<p>Tibu is the product that grew from that work. The idea is simple and patient. Facilities join one at a time, each because the system genuinely helps them. As the network grows, the shared foundation makes it possible, with the patient's consent, for their history to follow them from a community clinic to a county referral hospital and back.</p>
<p>Nobody is asked to join a national system on faith. Each person in the picture, patient, practitioner, facility, referral partner and, later, researchers and health authorities, has their own reason to take part before anyone asks them to.</p>
<h2>Where it stands</h2>
<p>Nyalife was where Tibu began. Tibu's wider goals, connected referrals, equal quality of records across income levels and better data for research, are still ahead, and it is important to say so. They are also completely reachable: the first step has already shown what it can do for a real clinic.</p>
HTML,
            ],
            [
                'slug' => 'najengas-spatial-annotation-architecture',
                'published_at' => '2026-08-11 09:00:00', // used only if the article is missing
                'title' => 'Najenga: building a home without losing sight of it',
                'category' => 'PropTech',
                'image' => $img('najenga/01'),
                'excerpt' => 'Notes pinned to drawings, receipts sent by WhatsApp, every shilling on record: how Najenga helps families, contractors and site managers build with confidence.',
                'content' => <<<'HTML'
<p>Building a house is one of the biggest things a family will ever do, and in Kenya it is often done from a distance. A parent in Nairobi building in Kisumu. A daughter abroad building for her mother. Money goes out every week, and the only window onto the site is a phone call and a blurry photo.</p>
<p>There are too many stories of trust lost in that gap. Najenga exists so that nobody has to build in the dark.</p>
<h2>Everyone on the same page, literally</h2>
<p>The heart of Najenga is the drawing. Engineers, architects, project managers and clients all work from the same plans, but they rarely have a shared way to talk about them. In Najenga you can pin a note directly onto a drawing or photo, circle the problem, and tag the person who needs to see it. The conversation stays attached to the exact spot it is about.</p>
<p>Under the hood that means annotation over PDFs and images, OCR to read scanned documents, timelines tied to milestones, and exports to Excel for the people who live in spreadsheets.</p>
<h2>Every shilling in sight</h2>
<p>Each payment is logged with its receipt. Photos from site go onto a dated timeline. Plans, permits and quotes are filed by project. And because people already live on WhatsApp, you can send a receipt or a site photo to Najenga's number and it files it for you. No new app to learn.</p>
<h2>Built for each person in the picture</h2>
<ul>
<li>Homeowners follow the build from anywhere, with the budget and records in one place.</li>
<li>Contractors run every site from one sign-in and show each client exactly their own project.</li>
<li>Site managers and family get the right view for their role, and nothing that isn't theirs.</li>
</ul>
<h2>What is still ahead</h2>
<p>Najenga is in development with a live staging site. The next challenges are real-time collaboration when several people annotate at once, OCR accuracy on old scanned drawings, and speed on very large plans. These are good problems. They are the difference between a promising tool and one a family can lean on completely, and that is where Najenga is headed.</p>
HTML,
            ],
            [
                'slug' => 'chairing-a-digital-trade-hackathon-at-altf-2023',
                'title' => 'Leading the AI and digital trade hackathon at ALTF 2023',
                'category' => 'Events',
                'published_at' => '2026-10-28 09:00:00',
                'image' => '/assets/images/insights/altf-2023-coordinating.webp',
                'excerpt' => 'At the 2023 Africa Law Tech Festival, a hackathon asked how AI could help Africa trade with itself. Eleven innovations were shortlisted. Here is how it worked, and what it showed.',
                'content' => <<<'HTML'
<p>In July 2023 the Africa Law Tech Festival in Nairobi took on a big theme: <em>Digital Trade in Africa: The AfCFTA and the Single Digital Market</em>. The Lawyers Hub's justice innovation team, with OKJTechnologies' founder leading, ran the festival's <strong>AI &amp; Digital Trade Policy Hackathon</strong> and built the site that brought it together, with an interactive map of the continent showing where participants came from.</p>
<p>Eleven innovations were shortlisted, and the teams behind them are worth remembering.</p>
<figure><img src="/assets/images/insights/altf-2023-coordinating.webp" alt="Hackathon teams at work with coordinators at the Africa Law Tech Festival 2023" loading="lazy"><figcaption>Coordinating teams on the hackathon floor, Africa Law Tech Festival 2023.</figcaption></figure>
<h2>The question we asked</h2>
<p>How could artificial intelligence help Africa trade with itself under the African Continental Free Trade Area? Teams were given four themes to work on:</p>
<ul>
<li><strong>Trade facilitation.</strong> Faster customs, automated paperwork, smoother logistics and supply chains.</li>
<li><strong>Market intelligence.</strong> Reading market trends and turning them into opportunities a business can act on.</li>
<li><strong>Digital platforms.</strong> Connecting buyers and sellers across borders and making the transaction itself easier.</li>
<li><strong>Policy and regulation.</strong> Using AI to monitor compliance, uphold standards and keep competition fair.</li>
</ul>
<h2>Two tracks, one table</h2>
<p>It ran as two hackathons side by side. The policy track worked on the data gap around digital trade in Africa, the shape of an AI governance framework for it, and what policymakers need to consider for a single digital market. The tech track worked on an AI-driven observatory: a living database of the challenges and opportunities in putting the AfCFTA into practice.</p>
<p>Each track had concrete problem statements: what an AI governance framework for digital trade in Africa should look like; what data an online observatory of digital trade would need; how AI could check the credibility of what is shared on it; and how to keep it current in real time as new AI and trade laws are passed.</p>
<p>That pairing mattered more than anything else we did. Lawyers, policy people, developers, designers and entrepreneurs were in the same rooms, building one answer instead of handing problems over a wall. The method was user-driven, deliberative, inclusive and participatory: co-creation, not a pitch contest.</p>
<h2>How it ran</h2>
<p>Up to fifty participants took part, in at most ten teams of five. Teams were drawn at random from the registrations, on purpose, so that every team mixed backgrounds rather than friends. It ran in English and French, in person at the festival and online, with a shared whiteboard for each team.</p>
<ul>
<li><strong>Briefing, 7 July.</strong> A virtual session to share the objectives and documentation and form the teams.</li>
<li><strong>Launch, 11 July.</strong> After the festival's opening addresses, teams broke into their own rooms and got to work.</li>
<li><strong>Pitches and awards, 12 July.</strong> Submissions and pitch videos were due at noon. Pitches were pre-recorded so the main stage could play them without stealing time from the afternoon's speakers, and the judges deliberated before announcing three winners, with prizes of KSh 50,000, 30,000 and 20,000.</li>
</ul>
<figure><img src="/assets/images/insights/altf-2023-winners.webp" alt="The SemaPDF team on stage at the Africa Law Tech Festival 2023" loading="lazy"><figcaption>SemaPDF, one of the three winning teams, alongside AfriSoko and AfriTrade.</figcaption></figure>
<h2>Courage is the first requirement</h2>
<p>It takes real courage to offer an unfinished idea about something as large as trade across a continent. Every team did that. Some ideas were rough. All of them were brave. A hackathon is one of the few places where we celebrate people for trying before they are sure, and there should be more of that everywhere else.</p>
<h2>Policy problems are people problems</h2>
<p>The strongest teams didn't start with the treaty. They started with a person: the small trader at a border, the young developer who wants to sell software to a neighbouring country, the woman whose goods sit waiting while paperwork moves. When you start there, the policy becomes something you can actually design for.</p>
<h2>What carries forward</h2>
<ul>
<li>Put the people who write the rules and the people who build the tools at the same table, from the first hour.</li>
<li>A day and a half is enough to find a good idea, but rarely enough to know whether the people it is for want it. Build in the support that comes after.</li>
<li>Make room for unfinished ideas, and thank the people brave enough to share them.</li>
</ul>
<p>The event site is archived now, but the lesson isn't. Every OKJTechnologies workshop with a client is a little hackathon: a safe room to think out loud, with real people at the centre of it.</p>
HTML,
            ],
            [
                'slug' => 'boda-boda-law-access-to-justice-starts-at-the-roadside',
                'title' => 'Access to justice starts at the roadside',
                'category' => 'LegalTech',
                'published_at' => '2026-10-21 09:00:00',
                'image' => $img('boda-boda-law/01'),
                'excerpt' => 'Field research in Kisumu and Namanga, trainings with riders and a site with a real-time advice form: what the Boda-Boda Law Project showed about the law and the people it is for.',
                'content' => <<<'HTML'
<p>Boda-boda riders keep this country moving. They carry children to school, patients to clinics and goods across borders. And many of them meet the law mostly as something that happens to them, at a roadside, with no one to explain their rights.</p>
<p>The Boda-Boda Law Project, at the Lawyers Hub, set out to change that, and OKJTechnologies' founder was part of the team.</p>
<h2>Listening first</h2>
<p>The team organised field data collection in Kisumu and Namanga. Before anything was built, the team listened: to riders, and to cross-border traders who depend on them. What came through again and again was not ignorance of the law. It was distance from it. Information that was hard to find, written for lawyers, and nowhere near the moment it was needed.</p>
<p>That research went into a published report, which you can still find in the Lawyers Hub reports library.</p>
<h2>Bringing the law closer</h2>
<p>We coordinated in-person trainings for riders on traffic regulations and their rights under Kenyan law. Those sessions mattered more than any website could, because people could ask their own questions, in their own words, and be taken seriously.</p>
<p>The project website carried that spirit online. Plain language. Riders' stories. And a <em>Get Advice Now</em> form, so a rider with a problem today could ask for help today, instead of waiting until it was too late.</p>
<h2>What it changed</h2>
<ul>
<li>Justice is a design problem as much as a legal one. If people can't reach it, it isn't really there for them.</li>
<li>The best channel is the one people already use. Meet them there.</li>
<li>Dignity is part of the service. A rider asking for help is owed the same respect as any other client.</li>
</ul>
<p>The project site is archived now, but every LegalTech platform OKJTechnologies builds starts with a question learnt on those roadsides: who needs this most, and how close can we bring it to them?</p>
HTML,
            ],
            [
                'slug' => 'building-for-data-protection-what-cippe-taught-me',
                'title' => 'Privacy is a form of respect',
                'category' => 'Data protection',
                'published_at' => '2026-10-14 09:00:00',
                'image' => '/assets/images/insights/data-protection-act.webp',
                'excerpt' => 'Supporting the Africa Data Protection Course and CIPP/E training changed how OKJTechnologies builds. Here is how privacy shows up in small systems that hold people\'s lives.',
                'content' => <<<'HTML'
<p>At the Lawyers Hub, OKJTechnologies' founder supported the delivery of the Africa Digital Policy Institute's Africa Data Protection Course and its Certified Information Privacy Professional (CIPP/E) training. It is easy to think of data protection as compliance: a checklist to satisfy. Up close, it is something closer to respect.</p>
<h2>Every row is a person</h2>
<p>A patient's history. A client's case file. A donor's card details. An alumnus's phone number. In a database they all look the same, a row with columns. But each one is a person who trusted someone with something, often at a vulnerable moment. Building a system that holds that information is a promise to look after it.</p>
<h2>What the Act actually asks</h2>
<p>The training covered Kenya's Data Protection Act in depth, and a few things in it shape every system OKJTechnologies builds:</p>
<ul>
<li><strong>Consent has to be real.</strong> The Act defines it as express, unequivocal, free, specific and informed. A pre-ticked box is none of those things.</li>
<li><strong>Health data is sensitive data.</strong> So are details about family, ethnicity, beliefs and biometrics. Clinics, alumni networks and wedding guest lists all hold some of it.</li>
<li><strong>Someone is accountable.</strong> Data controllers and processors register with the Data Commissioner, and the Commissioner can investigate complaints and issue fines. Every system needs a clear answer to who is responsible for what.</li>
<li><strong>The point is people.</strong> The Act exists to give effect to the right to privacy in Kenya's Constitution, and to give people rights and remedies when their data is mishandled.</li>
</ul>
<h2>How it shows up in the work</h2>
<ul>
<li><strong>Only what is needed.</strong> If the system doesn't need a piece of information to help someone, it doesn't ask for it.</li>
<li><strong>The right eyes only.</strong> Role-based access means a receptionist, a doctor and an administrator each see what their work needs. The Nyalife records system and the client portal at Dickson, Gitonga Advocates both work this way.</li>
<li><strong>Stronger sign-in.</strong> Passkeys on platforms like Global Harmony Initiative and Silversky mean no password to steal or forget.</li>
<li><strong>Consent that means something.</strong> In Tibu, another facility sees a patient's summary only after the patient approves it.</li>
</ul>
<h2>Small teams can do this well</h2>
<p>People sometimes assume serious data protection is only for big companies with big compliance departments. It isn't. Most of it comes down to careful decisions made early: what to collect, who can see it, how people sign in, and what gets recorded when something changes. Those decisions cost very little at the start and a great deal if they are left until later.</p>
<h2>The promise</h2>
<p>Any system OKJTechnologies builds to hold people's information is treated the way you would want your own family's to be treated. That is not a feature added at the end. It is where the work starts.</p>
HTML,
            ],
            [
                'slug' => 'omnishop-software-a-client-can-run-on-their-own',
                'title' => 'OmniShop: software a client can run on their own',
                'category' => 'Commerce',
                'published_at' => '2026-10-07 09:00:00',
                'image' => $img('omnishop-omnispace3d/01'),
                'excerpt' => 'An exhibitor ordering site for Solar & Storage Live Kenya 2026, built so the people running a busy trade show never had to call a developer.',
                'content' => <<<'HTML'
<p>OmniSpace 3D Events delivers some of the most complex events in Kenya. For Solar &amp; Storage Live Kenya 2026, they needed a way for exhibitors to order everything for their stands, furniture, lighting, flooring, staffing, from a catalogue of around two hundred items.</p>
<p>The brief was about ordering. The real need was about people.</p>
<h2>Who would be holding it</h2>
<p>In the week of a trade show, the event team is stretched in every direction. Nobody has time to wait for a developer. Whatever was built had to be something they could run, fix and trust on their own, under pressure, with no developer in the room.</p>
<p>That changed everything about the design.</p>
<h2>What it does</h2>
<ul>
<li>Exhibitors sign in with their invitation, browse the catalogue by category, build a cart and receive a confirmation.</li>
<li>The team moves each order through clear stages, from pending to approved, invoiced and fulfilled.</li>
<li>Packing lists print grouped by category or by stand, so the warehouse knows exactly what goes where.</li>
<li>Orders export to a spreadsheet for finance, and stock limits warn the team before anything is oversold.</li>
</ul>
<h2>Built to be handed over</h2>
<p>OmniShop shipped with a plain-English guide and a one-click launcher, so starting it is a double-click rather than a command line. The admin screens use words the team already uses. When something needs changing, they can change it.</p>
<h2>The lesson</h2>
<p>The kindest thing you can do for a client is make yourself less necessary. Good software should leave people more capable and more confident, not more dependent. A good handover is measured by how rarely the phone rings afterwards, and by how proud the team is of running it themselves.</p>
HTML,
            ],
            [
                'slug' => 'wisdom-capital-ecommerce-for-farmers',
                'title' => 'Selling chicks, feeds and honey online, the farmer\'s way',
                'category' => 'Agritech',
                'published_at' => '2026-09-30 09:00:00',
                'image' => $img('wisdom-capital/02'),
                'excerpt' => 'Wisdom Capital supports farmers across East Africa. Its online shop had to work for a farmer with a phone and a question, not just for a shopping cart.',
                'content' => <<<'HTML'
<p>Wisdom Capital produces pre-vaccinated chicks, animal feeds, nursery seedlings and Uki honey, and supports farmers across East Africa. Their online shop was designed with one person in mind: a farmer with a phone, a little time between chores, and a lot riding on getting the order right.</p>
<h2>Trust before checkout</h2>
<p>A farmer buying chicks is investing in their livelihood. Before they buy, they need to know the product is sound. So the site leads with what earns that trust: KEBS-certified feeds, a licensed hatchery, delivery across East Africa, and clear pages for each brand, Wisdom Chicken, Wisdom Feeds, Wisdom Nursery and Uki Honey.</p>
<h2>Simple to order, easy to follow</h2>
<ul>
<li>Products by brand and category, with search and a choice of grid or list view.</li>
<li>A straightforward cart and checkout.</li>
<li>An order number in the confirmation email, and a <em>Track Order</em> page so nobody has to call to ask where their delivery is.</li>
</ul>
<h2>The other side of the counter</h2>
<p>Behind the shop, an admin dashboard follows sales, payment status and distribution by region. For a producer serving farmers across several areas, seeing where orders are going is how they plan stock, routes and support.</p>
<h2>What it showed</h2>
<p>E-commerce for agriculture is not about flashy storefronts. It is about respect for the buyer's time and the weight of their decision. Clear information, honest promises and a way to check on your order are what make a farmer come back, and tell their neighbour.</p>
HTML,
            ],
            [
                'slug' => 'naoa-one-wedding-two-families-many-traditions',
                'title' => 'One wedding, two families, many traditions',
                'category' => 'Events',
                'published_at' => '2026-09-23 09:00:00',
                'image' => $img('naoa/02'),
                'excerpt' => 'Naoa began as a website for one couple\'s wedding and is growing into a planner that honours how Kenyan families actually marry.',
                'content' => <<<'HTML'
<p>Naoa started with one couple. For Dinah and Tze Ren's wedding, OKJTechnologies built a site with their story, a live gallery, an RSVP flow and guest information, so that family and friends in different countries could share in it. It is still live, and still a joy to visit.</p>
<p>Building it showed how much love and how much quiet labour goes into a wedding, and how little of it any app had been designed around.</p>
<h2>Kenyan weddings are many ceremonies</h2>
<p>In many Kenyan communities a marriage is not one day. It is a series of visits and ceremonies between two families, each with its own people, customs and timing. Most planning tools assume a single event with a single guest list. That misses almost everything that matters.</p>
<h2>What Naoa does differently</h2>
<ul>
<li>Look up your community's marriage customs and Naoa turns them into a plan, with each ceremony getting its own date, guests and invitation.</li>
<li>Couples and planners share one place for guests, budgets, vendors and the wedding website.</li>
<li>Guests can check in by QR code, share photos into a live gallery, and the couple can download a digital scrapbook afterwards.</li>
</ul>
<h2>Humble about tradition</h2>
<p>Naoa draws on published sources and families' own notes, and it says plainly: always confirm with your elders. Software should never pretend to know a family's tradition better than the family does. Its job is to hold the details so the people can hold each other.</p>
<h2>Where it is going</h2>
<p>Naoa is in development, with the public product site live. The aim is for any couple to sign up and get their own wedding space. If you are planning a wedding that joins two families' ways of doing things, OKJTechnologies would love to hear what would make it lighter for you.</p>
HTML,
            ],
            [
                'slug' => 'the-football-experience-travelling-with-your-tribe',
                'title' => 'Follow your team. Travel with your tribe.',
                'category' => 'Travel',
                'published_at' => '2026-09-16 09:00:00',
                'image' => $img('the-football-experience/01'),
                'excerpt' => 'The Football Experience, built with Terik Tours, helps African fans get to the matches they love, priced, booked and shared with the people they travel with.',
                'content' => <<<'HTML'
<p>For a lot of African football fans, watching their team play abroad is a lifelong dream that feels just out of reach. Matches, flights, visas, hotels and tickets all live in different places, often priced in different currencies, and the planning alone can make people give up.</p>
<p>The Football Experience exists to close that gap. OKJTechnologies is building it in partnership with Terik Tours, whose travel expertise makes it possible.</p>
<h2>A whole trip in one place</h2>
<ul>
<li>Pick the matches you care about and get a trip estimate, matches, flights, stays and tickets together, in minutes.</li>
<li>Prices in several currencies, including Kenyan shillings, so the number means something to you.</li>
<li>Save more than one plan and compare them before you commit.</li>
<li>Book with verified travel partners who publish their trips on the platform.</li>
</ul>
<h2>Tribes</h2>
<p>Football is never really about one person. It is about the people next to you. Tribes are supporter groups, watch-alongs and travel crews for each tournament. You can find people from home going to the same match, plan together and share the journey.</p>
<h2>For schools and academies too</h2>
<p>Some of the most meaningful trips are the ones that take young players to see the game at its highest level. The platform has a path for schools and academies to plan group travel with the care those trips need.</p>
<h2>Where it stands</h2>
<p>The Football Experience is still in development, with the platform live for exploring, and it will be described as exactly that until it's finished. The core is real, and the dream it serves is worth every bit of the work.</p>
HTML,
            ],
            [
                'slug' => 'hucaa-an-alumni-network-built-on-belonging',
                'title' => 'An alumni network built on belonging',
                'category' => 'Education',
                'published_at' => '2026-09-09 09:00:00',
                'image' => $img('hucaa/01'),
                'excerpt' => 'Designing a home for Hekima University College\'s alumni: reconnecting people, sharing opportunities and making giving back simple.',
                'content' => <<<'HTML'
<p>Graduates leave with more than a degree. They leave with friendships, mentors and a shared formation that shaped who they became. Then life scatters them across countries and careers, and those connections quietly fade.</p>
<p>The Hekima University College Alumni Association asked OKJTechnologies to help them hold on to that.</p>
<h2>Starting with belonging</h2>
<p>Before deciding any features, the first question was what an alumnus actually wants from their association. The answers were human ones: to find old classmates, to know what is happening, to help the next generation, and to feel that they still belong somewhere.</p>
<h2>What the platform offers</h2>
<ul>
<li>An alumni directory to reconnect with classmates and grow a professional network.</li>
<li>Interest groups for people who share a field, a cause or a hobby.</li>
<li>Events and activities, so gatherings and opportunities reach everyone, not just whoever is on the right group chat.</li>
<li>Messaging between members, kept inside the community.</li>
<li>A simple way to give back, through scholarships, mentoring and campus initiatives.</li>
</ul>
<h2>Care with people's details</h2>
<p>An alumni network holds personal information about a lot of people. Members register and sign in, and the directory and messaging sit behind that, so the community is open to its members and not to everyone.</p>
<h2>Growing with the community</h2>
<p>The platform is live and still growing, and is described here as it is today, not as a promise. The best parts of an alumni network are not built by a developer anyway. They are built by members who show up for each other. The platform's job is to make that as easy as possible.</p>
HTML,
            ],
        ];
    }
};
