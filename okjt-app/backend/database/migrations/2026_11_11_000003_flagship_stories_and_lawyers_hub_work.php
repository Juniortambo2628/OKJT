<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Six more Insights in Kevin's voice (2026-11-11): what inspires each
 * flagship (Tibu, Naoa, Najenga, The Football Experience), and two pieces of
 * Lawyers Hub work (the ALIW 2022 coding class for lawyers, and the digital
 * identity survey). Sources: Kevin's own write-ups, the Naoa companion, the
 * product docs, and the original slides and survey results; see
 * documentation/FLAGSHIPS.md and documentation/PROFESSIONAL_RECORD.md.
 *
 * Same rules as the previous migration: matched by slug, an existing article
 * is updated (its cover kept if it has one), a missing one is inserted as
 * published by the account that wrote the others.
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
                if (empty($row->image)) {
                    $fields['image'] = $a['image'];
                }
                DB::table('insights')->where('id', $row->id)->update($fields);
            } elseif ($author) {
                DB::table('insights')->insert($fields + [
                    'slug' => $a['slug'],
                    'image' => $a['image'],
                    'user_id' => $author,
                    'is_published' => true,
                    'published_at' => $a['published_at'],
                    'created_at' => $now,
                ]);
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
        return [
            [
                'slug' => 'tibu-the-same-care-in-nairobi-and-kakamega',
                'title' => 'Tibu: the same care in Nairobi and in Kakamega',
                'category' => 'HealthTech',
                'published_at' => '2026-11-08 09:00:00',
                'image' => '/assets/images/work/tibu/03.webp',
                'excerpt' => 'Healthcare in Kenya leans towards privilege. Tibu can\'t make it free, but it can make sure a patient\'s records, and the quality of what is written down about them, don\'t depend on which door they walked through.',
                'content' => <<<'HTML'
<p>Healthcare in Kenya leans towards privilege. Where you live, what you earn and which facility you can reach still decide a great deal about the care you get. Free healthcare is beyond what any one platform can deliver. But there is real work to be done on everything around the care itself: how a service is delivered, how carefully it is written down, and whether the patient, the doctor and the hospital can reach the information they need.</p>
<p>Tibu exists to close that gap for all three at once.</p>
<h2>Two patients</h2>
<p>Picture one patient walking into a private hospital in Nairobi, and another walking into a small public facility in rural Kakamega. Today their records will almost certainly look different: different systems, different levels of detail, often paper on one side. If either of them moves, is referred, or arrives somewhere unconscious, their history may not follow them at all.</p>
<p>Tibu is built so those two patients get the same thing: the same quality of documentation, and a history that is theirs wherever they go. It would serve people with the least the most, and that matters. But it is deliberately built for everyone. The person in Kakamega deserves exactly what the person in Nairobi already expects.</p>
<h2>The size of the gap</h2>
<p>This is the shape of the system, not an edge case. A survey of electronic records in Kenyan public hospitals found that even digitised facilities run fragmented systems, bought mainly for billing, with laboratory and radiology records on separate tools that don't talk to each other (University of Oxford, NDM). The country has about 2.6 doctors for every 10,000 people, against a WHO benchmark closer to 10, and households still pay 24.2% of all health spending out of their own pockets (WHO Kenya Health Profile, 2025). Scarce expertise, scattered records and costs that land on patients make each other worse.</p>
<h2>Three words</h2>
<p>Ask what Tibu is for and the answer comes back to three words: <strong>access</strong>, <strong>documentation</strong> and <strong>equal quality</strong>. Every facility gets a complete system on day one: records, appointments, lab, pharmacy, billing. As facilities join, they form an ecosystem, so that with the patient's consent their history can follow them from a village dispensary to a national referral hospital and back.</p>
<h2>Who it is for</h2>
<ul>
<li><strong>The patient.</strong> Access to their own health information, and the same standard of record wherever they are treated. For people who have always had the least, that is a kind of power they haven't had before.</li>
<li><strong>The practitioner and the facility.</strong> Less time rebuilding a history from scratch, more time treating. Smaller facilities become more self-sufficient, because the tools that used to belong only to big hospitals are theirs too.</li>
<li><strong>The health sector.</strong> A connected network for sharing information, collaborating and delivering services better, instead of hundreds of islands.</li>
<li><strong>NGOs and national organisations.</strong> Consolidated, anonymised insights from across the country, so the annual statistics behind health reports and programmes rest on real data rather than estimates.</li>
</ul>
<h2>How it grows</h2>
<p>Nobody is asked to join a national system on faith. Each facility joins because Tibu genuinely helps it run, and the network grows from there. It began with OKJTechnologies' work on the system for Nyalife Women's Health Clinic, and it is the problem the studio has chosen to keep solving. It is unfinished. It is also the most meaningful work in the portfolio, and it can be done, one honest step at a time.</p>
HTML,
            ],
            [
                'slug' => 'naoa-i-am-marrying',
                'title' => 'Naoa means "I am marrying"',
                'category' => 'Events',
                'published_at' => '2026-11-05 09:00:00',
                'image' => '/assets/images/work/naoa/04.webp',
                'excerpt' => 'Kenyan marriage traditions live mostly in people\'s memories. As more couples marry across communities, Naoa gathers that knowledge, honours it, and turns it into a plan two families can follow together.',
                'content' => <<<'HTML'
<p><em>Naoa</em> is Swahili for "I am marrying". It is a wedding planning companion that knows the marriage processes of more than eighteen Kenyan traditions, in their own languages, and turns them into a plan.</p>
<h2>Why traditions needed a home</h2>
<p>In Kenya the steps between asking for someone's hand and the final celebration matter deeply, and families follow them. But they differ across more than thirty communities, and many of them took shape in a time when communities rarely married each other. So the knowledge is scattered: held in elders' memories, passed on by word of mouth, written down in a few places that don't agree.</p>
<p>Today more and more couples are marrying across communities. That is a beautiful thing, and it leaves many of them asking the same anxious question: <em>what does my partner's family expect of us, and how do we get it right?</em></p>
<h2>What Naoa does with that knowledge</h2>
<p>Naoa holds a growing knowledge base of these traditions, reviewed with community advisers, and builds a customisable plan from it, so every step is accounted for and the couple can focus on each other. Practices vary between clans and families, so Naoa says plainly: confirm the details with your elders. Software should never claim to know a family's tradition better than the family does.</p>
<h2>A wedding is many events</h2>
<p>A Kenyan wedding is usually a series of occasions: introductions, dowry negotiations, the legal registration, the church or civil ceremony, the reception. Naoa plans each one with its own guests, budget, timeline and the people responsible. Around that, it handles invitations, guest lists, travel and accommodation, scheduling and support on the day. Guests can share their photos straight into the couple's gallery, so nobody has to chase pictures months later.</p>
<h2>Bringing people together, not replacing them</h2>
<p>Naoa isn't built to replace wedding planners or the people who make a wedding happen. It brings them together. Venues, caterers, décor and tent hire, photographers, makeup artists, MCs, DJs and transport providers can show their work, packages and terms in one place, and couples can compare and book them. Couples who plan on their own get the organisation a planner would bring, at a fraction of the cost. Planners get tools that save them hours, so they can serve more couples.</p>
<p>The bridal party, the committee, family contacts and day-of roles all live in one wedding team, each person tagged to their tasks, with one programme everyone can share on WhatsApp or print.</p>
<h2>Paperwork that reads itself, and money it never touches</h2>
<p>Couples and planners can forward quotations, invoices, contracts and M-Pesa or bank messages. Naoa reads them and, after a quick review, updates the budget, records payments and sets reminders, and it notices when an invoice is revised, a bill arrives twice, or a DJ is booked later than the venue allows music. Couples pay providers directly. Naoa never holds anyone's money.</p>
<h2>Care with people's details</h2>
<p>Naoa is built to Kenya's data protection law. Guest details are used only for planning and are deleted 30 days after the couple's last event. Booking and payment records are kept for the six years the law requires, and the couple's gallery stays until they choose to delete it.</p>
<h2>Where it came from</h2>
<p>Naoa started with one couple's wedding site. Building it showed how much love and quiet labour goes into a wedding, and how often that labour falls on a few people who end up too tired to enjoy the day. Naoa exists to carry some of it for them.</p>
HTML,
            ],
            [
                'slug' => 'najenga-a-home-built-over-whatsapp',
                'title' => 'Najenga: a home built over WhatsApp',
                'category' => 'PropTech',
                'published_at' => '2026-11-02 09:00:00',
                'image' => '/assets/images/work/najenga/04.webp',
                'excerpt' => 'Najenga is shaped by a real build where every update arrived as a WhatsApp message. Instead of asking people to change how they work, the platform was built around the way they already do.',
                'content' => <<<'HTML'
<p>Najenga is shaped by a real home being built in western Kenya, with its owner following along from far away. That build changed the product, and it holds a lesson for every project.</p>
<h2>How a build really talks</h2>
<p>Nobody on that project opened an app. Every evening the updates arrived on WhatsApp: photos of a roof going on, a video of a delivery, a bank debit message, an M-Pesa confirmation, a supplier's invoice as a PDF, a typed note saying five loads of murram had arrived and needed paying for.</p>
<p>All of it mattered. None of it was organised. And there was a running spreadsheet trying to keep up, which, as these things do, slowly drifted away from what had really been paid.</p>
<h2>Meet people where they already are</h2>
<p>The obvious answer was to ask everyone to log in and fill in forms. That would not have lasted a week. The people on a building site are busy, and the owner is short of time. Every extra tap costs a little trust.</p>
<p>So Najenga learnt to read WhatsApp instead. Send anything to the project's number and Najenga works out what it is: a site photo goes to the gallery, a video to the video track, a payment message becomes a confirmed expense, an invoice becomes a bill waiting to be paid, a typed request becomes something to approve, and ordinary chat is simply logged. The sender gets a reply saying where it was filed, with a chance to say it was wrong.</p>
<h2>Never count a payment twice</h2>
<p>One payment can arrive as up to four messages: the bank's debit, the M-Pesa transfer, the supplier's invoice, and sometimes a request sent before any of them. Najenga matches them on the payment reference first, then on amount, date and recipient, in whatever order they arrive. Each expense keeps a trail of every message that was merged into it, so anyone can check the reasoning.</p>
<h2>What it means for the people in it</h2>
<ul>
<li><strong>The owner</strong> sees every shilling and every stage without logging in to anything.</li>
<li><strong>The people on site</strong> keep doing what they already do. The record keeps itself.</li>
<li><strong>Everyone</strong> argues less about money, because the record and the receipts agree.</li>
</ul>
<h2>Where it is</h2>
<p>The WhatsApp intake, the sorting and the duplicate matching are built and in use on that project, and are still being tuned on real messages. A weekly spending summary sent back on WhatsApp, one-tap confirmations and signing in with WhatsApp are next.</p>
<p>The lesson OKJTechnologies carries into every project from this one: if a system asks people to change how they work before it has helped them, it has already lost them. Start where they are.</p>
HTML,
            ],
            [
                'slug' => 'the-football-experience-a-place-for-everyone-around-the-game',
                'title' => 'The Football Experience: a place for everyone around the game',
                'category' => 'Travel',
                'published_at' => '2026-10-31 09:00:00',
                'image' => '/assets/images/work/the-football-experience/03.webp',
                'excerpt' => 'Football travel is never one person\'s trip. Fans, schools, academies, parents, airlines and clubs all have a part, and The Football Experience is being built so each of them has a place.',
                'content' => <<<'HTML'
<p>The Football Experience started with fans: helping people in Africa follow their team to the tournaments they have dreamt of, with matches, flights, stays and tickets planned in one place. OKJTechnologies is building it with Terik Tours, whose travel expertise makes the whole thing possible.</p>
<p>The more we worked on it, the clearer it became that a football trip is never one person's trip.</p>
<h2>Everyone around the game</h2>
<p>Around every match there is a whole community: fans and supporter groups, airlines and travel partners, clubs, schools and universities, academies, and the parents and families who make it possible for young players to go at all. Each of them needs something different from the platform, and each has something to give.</p>
<h2>Schools and young players</h2>
<p>Some of the most meaningful trips are the ones that take young players to see the game at its highest level. So schools and sports programmes now have their own place on TFE, with a simple journey: register, discover programmes, join and take part, develop and learn, compete and grow. Programmes show when and where they run, and a Learning Hub offers coaching and safeguarding resources.</p>
<p>The Learning Hub is open to everyone rather than locked behind a login. A safeguarding policy is worth more the more widely it is read.</p>
<h2>Protecting children by not holding their data</h2>
<p>This is the decision in the project most worth sharing. The first plan had TFE collecting children's names, dates of birth and consent forms, rebuilding a process every school already runs, and doing it worse. That plan was thrown away.</p>
<p>The new design keeps the school in charge of its pupils. An appointed official at the school confirms that every travelling child has the permissions the school's own process requires, and TFE records that declaration and passes a clear "minors travelling" flag to every partner involved. A teacher never consents on a parent's behalf. And because TFE never holds the children's details, there is nothing about them to lose, misuse or leak.</p>
<h2>Where it stands</h2>
<p>The Football Experience is in development, with the platform live for exploring. The schools journey and the Learning Hub are built. The school declaration and the parents and families side are designed but not yet built, and will be described that way until they are.</p>
<p>What inspires this one is simple. Football brings people together like almost nothing else. The platform around it should do the same.</p>
HTML,
            ],
            [
                'slug' => 'teaching-lawyers-to-code-at-aliw-2022',
                'title' => 'Teaching lawyers to write code',
                'category' => 'LegalTech',
                'published_at' => '2026-10-24 09:00:00',
                'image' => '/assets/images/insights/aliw-2022-presenting.webp',
                'excerpt' => 'At Africa Legal Innovation Week 2022, OKJTechnologies\' founder designed and taught a coding class for lawyers. The aim: leave with a landing page for your own law firm, and understand why the code you write is yours.',
                'content' => <<<'HTML'
<p>At Africa Legal Innovation Week 2022, hosted by the Lawyers Hub, OKJTechnologies' founder designed and presented a coding class for lawyers. The brief was simple: by the end of the session, every person in the room would have built a landing page for their own law firm.</p>
<h2>Why lawyers should understand code</h2>
<p>Lawyers are increasingly asked to argue about software: who owns it, who copied it, what a licence allows, what went wrong behind the screen. Understanding how code is actually made makes those disputes easier to handle, including your own, and helps you prepare a defence when you understand what happens in the back end.</p>
<p>There is also value in taking the mystery out of things. Code can look like a closed world. It isn't, and an afternoon is enough to prove it.</p>
<figure><img src="/assets/images/insights/aliw-2022-class.webp" alt="Lawyers at laptops during the coding class at the Lawyers Hub" loading="lazy"><figcaption>The coding class at the Lawyers Hub, Africa Legal Innovation Week 2022.</figcaption></figure>
<h2>Building something you own</h2>
<p>The first exercise was a page of headings and a paragraph in HTML. Then the room was asked two questions: what legal implications do you accept by claiming you wrote this, and what risks?</p>
<p>That is where the class came alive, because it is the lawyers' home ground. The discussion covered the difference between proprietary, personal and open-source programs; that copyright in code is automatic from the moment the work is recorded in a tangible form, because the law protects the expression of an idea rather than the idea itself; that registering software with the Kenya Copyright Board isn't required but adds real protection; and what rights copyright gives a programmer, from reproducing and modifying the code to licensing and selling it.</p>
<figure><img src="/assets/images/insights/aliw-2022-practical.webp" alt="A participant working through the HTML practical" loading="lazy"><figcaption>Working through the first practical.</figcaption></figure>
<h2>A landing page for your firm</h2>
<p>Then the class built the real thing. Starting from a template, everyone worked through the structure of a web page, the head with its metadata, the header with the navigation and hero, the footer with contact details, and then applied the style sheets. The moment a plain page transforms as the styles load is the best moment in any class: something you typed becomes something you can show.</p>
<h2>What it showed</h2>
<ul>
<li>People learn fastest when the lesson connects to what they already know. For lawyers, that was ownership and rights.</li>
<li>A finished thing, however small, changes what someone believes they can do.</li>
<li>Technology and law need translators. OKJTechnologies intends to keep being one.</li>
</ul>
HTML,
            ],
            [
                'slug' => 'what-a-small-survey-taught-me-about-digital-identity',
                'title' => 'What a small survey revealed about digital identity',
                'category' => 'Research',
                'published_at' => '2026-10-17 09:00:00',
                'image' => '/assets/images/insights/digital-id-survey.webp',
                'excerpt' => 'In 2023 a Lawyers Hub survey sprint asked about digital identity and AI in Africa. The sample was small, but what people said about trust and inclusion still shapes how OKJTechnologies builds.',
                'content' => <<<'HTML'
<p>In 2023 the Lawyers Hub ran a survey sprint on <em>the State of Digital Identification and Artificial Intelligence in Africa</em>, with OKJTechnologies' founder helping to facilitate the data collection. It was a small survey, with around fifteen people answering most questions, so it doesn't speak for a continent. But what those people said has lasted, and it shapes the systems OKJTechnologies builds today.</p>
<h2>Belief in the idea is strong</h2>
<p>Fourteen of the fifteen people who answered believed digital identity at a continental level could improve access to services and bring Africa closer together. Almost everyone (95%) saw regional initiatives like the African Continental Free Trade Area as very important to making it work, and every respondent said the bodies overseeing digital ID need their own money and independence.</p>
<h2>Confidence in the frameworks is weak</h2>
<p>Nobody said the Malabo Convention had been effective in creating uniform data protection rules across Africa. Most were unsure, and the rest said it hadn't. Almost half described their own country's move to digital ID as still in the planning phase. The challenges people named were spread almost evenly: systems that don't work together, gaps in connectivity, privacy concerns about sharing data across borders, and limited cooperation between countries. Many simply answered "all of them".</p>
<h2>AI raised more questions than answers</h2>
<p>Asked whether large language models had improved identity verification, half said somewhat and half didn't know. Nine in ten had never seen an example of it working. The biggest fear about using AI in digital ID, chosen by over half, was data breaches.</p>
<p>And the hope people did have was a human one: the most common benefit they saw was easier access for people with limited literacy or language barriers.</p>
<h2>Inclusion first</h2>
<p>When asked which law reforms matter most for digital ID, the most common answer wasn't security or cybercrime. It was inclusion and accessibility for marginalised people, followed by data protection and privacy.</p>
<h2>What it means for the work</h2>
<ul>
<li><strong>Trust is the real infrastructure.</strong> People want connected systems, but only ones that protect them. That is why Tibu shares a patient's records only with their consent.</li>
<li><strong>Interoperability is a people problem first.</strong> Systems don't fail to connect because of code alone. They fail because nobody gave each side a reason to connect.</li>
<li><strong>Inclusion is the measure.</strong> If a system works for the person with the least access, it works for everyone.</li>
</ul>
HTML,
            ],
        ];
    }
};
