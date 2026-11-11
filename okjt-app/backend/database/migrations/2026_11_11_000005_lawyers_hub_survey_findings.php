<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Three Insights from 2023 Lawyers Hub surveys whose data collection
 * OKJTechnologies' founder helped facilitate (2026-11-11): digital public
 * infrastructure, everyday apps and privacy, and the ALTF 2023 startup
 * roundtable. Written about the work, not the writer. Figures are read
 * straight from the result charts; respondents' names are never used. See
 * documentation/PROFESSIONAL_RECORD.md.
 *
 * Same rules as the other article migrations: matched by slug; inserted as
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
                'slug' => 'digital-public-infrastructure-what-civil-society-told-us',
                'title' => 'Digital public infrastructure: what civil society across Africa said',
                'category' => 'Research',
                'published_at' => '2026-10-10 09:00:00',
                'image' => '/assets/images/insights/dpi-survey-concerns.webp',
                'excerpt' => 'A 2023 Lawyers Hub survey asked civil society from across Africa what they hope for from digital public infrastructure, and what worries them. The biggest barrier they named was not money or technology. It was people not working together.',
                'content' => <<<'HTML'
<p>Digital public infrastructure (the shared rails of digital ID, payments and data sharing that public and private services run on) is being built across Africa right now. In 2023 the Lawyers Hub surveyed civil society organisations from across the continent on how it is going. OKJTechnologies' founder helped collect the responses as part of the Hub's team. Around fifty people answered most questions, from East, Southern, West and Central Africa.</p>
<h2>Where countries are</h2>
<p>Most respondents rated their own understanding of digital public infrastructure as partial: the largest groups placed themselves at two or four out of five, and only three called themselves experts. Asked what their country had in place, most pointed to e-government services (28) and instant payments (18). Very few named digital ID (2) or safe ways to share data (2).</p>
<h2>The hope</h2>
<p>The expected benefits were broad and practical: the growth of e-commerce and digital entrepreneurship (40 of 53), better delivery of public services and subsidies (31), more transparency (28), the inclusion of people working in the informal sector (27), and improvements in healthcare, education and agriculture (19).</p>
<h2>The worry</h2>
<p>The concerns were about people's data. Misuse of personal information topped the list (37 of 49), then poor protection of personal data (29), surveillance (25), and the exclusion of certain groups (22).</p>
<h2>The real barrier</h2>
<p>When asked what holds digital public infrastructure back, the most common answer was a lack of understanding among government officials (35 of 46), followed by bureaucratic complexity (28). And asked for the single biggest challenge in putting policy into practice, most chose one thing above all others: <strong>a lack of coordination and collaboration among the people involved</strong> (27 of 46). Funding (7), capacity (8) and fragmented rules (4) came far behind.</p>
<p>The measures people wanted followed from that: policies that make systems work together (38 of 50), policies for digital inclusion, cybersecurity and data protection (30), coordination among African Union members (26), and dedicated teams in government (24).</p>
<h2>Civil society wants a seat, and evidence</h2>
<p>Most respondents described civil society's involvement so far as moderate (24 of 41). What would help them most is understanding the key elements of privacy laws (33 of 42), followed by regulatory frameworks (21) and privacy-by-design principles (20). The way they most wanted to work together was research and evidence (30 of 41), then sharing what works (23). Forty of forty-three asked to stay involved.</p>
<h2>What it means for the work</h2>
<ul>
<li><strong>Coordination is the product.</strong> The technology is rarely the hardest part. Every OKJTechnologies build starts by mapping the people a system touches and giving each one a reason to take part, because that is where systems succeed or fail.</li>
<li><strong>Privacy is the price of trust.</strong> People want connected systems, but only ones that protect them. Consent, minimal data and clear access rules are part of the design from the first day.</li>
<li><strong>Evidence beats opinion.</strong> Surveys like this one are how good policy and good products both begin.</li>
</ul>
HTML,
            ],
            [
                'slug' => 'everyday-apps-and-the-privacy-policies-nobody-reads',
                'title' => 'Everyday apps and the privacy policies nobody reads',
                'category' => 'Data protection',
                'published_at' => '2026-10-03 09:00:00',
                'image' => '/assets/images/insights/privacy-polls.webp',
                'excerpt' => 'Two 2023 Lawyers Hub polls asked people about the apps they use every day. Almost nobody had read a privacy policy, most were uneasy about their data, and some ride-hailing passengers had been contacted by drivers for reasons that had nothing to do with the trip.',
                'content' => <<<'HTML'
<p>In 2023 the Lawyers Hub ran two live polls during sessions on technology and the law: one on ride-hailing apps, and one on TikTok for a session on responsible content and regulation. OKJTechnologies' founder supported the data collection. Each drew around forty to fifty people. The samples are small, but the patterns are hard to ignore.</p>
<h2>Nobody reads the policy</h2>
<p>Of the ride-hailing users, 3 out of 38 said they were familiar with their app's privacy policy. Among TikTok users, 6% had ever read TikTok's privacy policy, 21% remembered the permissions they granted when installing it, and 2% knew its copyright policy.</p>
<h2>And people are uneasy</h2>
<ul>
<li>57% of ride-hailing users said they did not understand what personal data their app collects, and 79% said they were not comfortable sharing it.</li>
<li>Twice as many thought their ride-hailing platform was not privacy compliant as thought it was.</li>
<li>Three in four TikTok users were very or somewhat concerned about the privacy and security of their data.</li>
</ul>
<h2>When data leaves the app</h2>
<p>The ride-hailing poll asked whether a driver had ever contacted the passenger after a trip. Sixteen of forty-one said yes. Some reasons were reasonable: returning a forgotten item, a missed payment. Others were not: drivers asking passengers out, commenting on their WhatsApp status, asking for money, or simply wanting to meet again. A phone number shared for one journey had become a way into someone's private life.</p>
<p>That is what a data protection failure looks like in real life. Not a headline breach, but a person feeling unsafe because a system shared more than it needed to.</p>
<h2>Content, time and trust</h2>
<p>The TikTok poll showed how much these apps hold: 89% had seen content they felt was inappropriate, 81% wanted more moderation, nearly half spent three hours or more a day on the app, mostly at night, and four in ten had bought something because of it. Yet 93% did not want the app banned in Kenya. People don't want to lose these tools. They want them to be safer.</p>
<h2>What it means for the work</h2>
<ul>
<li><strong>Don't rely on the policy.</strong> If almost nobody reads it, protection has to be built into how the product works, not written into a page.</li>
<li><strong>Share only what a task needs.</strong> A delivery can reach the right door without the driver keeping the customer's number. Mizizi shows each order's delivery point to the team on a map, and The Football Experience is designed so it never needs to hold children's details at all.</li>
<li><strong>Ask plainly.</strong> Consent people actually understand, at the moment it matters, is worth more than any number of ticked boxes.</li>
</ul>
HTML,
            ],
            [
                'slug' => 'what-founders-said-at-the-altf-2023-startup-roundtable',
                'title' => 'What founders said at the ALTF 2023 startup roundtable',
                'category' => 'Events',
                'published_at' => '2026-09-26 09:00:00',
                'image' => '/assets/images/insights/altf-2023-startup-roundtable.webp',
                'excerpt' => 'At the 2023 Africa Law Tech Festival, startup founders were asked how hard it is to register, raise money and compete in Kenya. Not one said it was easy. Most were still optimistic about what the AfCFTA could do for them.',
                'content' => <<<'HTML'
<p>The 2023 Africa Law Tech Festival hosted a startup roundtable alongside its hackathon, and a short live poll asked the founders in the room how it really is to build a company. OKJTechnologies' founder helped run the data collection with the Lawyers Hub team. The group was small, between ten and sixteen people per question, mostly building in Kenya, across AI consulting, food, mobility, security and more.</p>
<h2>Starting is hard</h2>
<p>Asked how easy it is to register a startup, nine of sixteen said extremely or very difficult, with numerous bureaucratic hurdles. Six said moderately difficult but manageable. One said relatively easy. Nobody chose "very easy".</p>
<h2>Funding is harder</h2>
<p>Raising capital was harder still. Eleven of thirteen described it as extremely or very challenging, whether from venture capital, angel investors or government support. Nobody described it as easy.</p>
<h2>The rules are uncertain</h2>
<p>Only one of ten said the laws and policies governing startups in their country were favourable. Four said no, and five said maybe, which may be the most telling answer of all.</p>
<h2>And yet, optimism</h2>
<p>Most founders saw little or moderate competition from big multinationals in their own field (ten of eleven). Eight of eleven knew about the African Continental Free Trade Area, and eight of ten expected it to have a good or great effect on startups and fair competition in digital trade. The obstacles are real. So is the belief that a bigger, open market is worth building for.</p>
<h2>What it means for the work</h2>
<ul>
<li><strong>Founders need partners who reduce the load.</strong> When registering and raising money take this much energy, the technology should take as little as possible.</li>
<li><strong>Build in stages.</strong> A first version that is useful on day one, and grows as the business does, respects a founder's scarce time and money.</li>
<li><strong>Build for the bigger market.</strong> Multiple currencies, local payments and room to grow across borders belong in the plan from the start.</li>
</ul>
HTML,
            ],
        ];
    }
};
