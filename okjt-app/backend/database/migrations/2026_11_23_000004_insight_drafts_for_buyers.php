<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Four draft insights (not published) for people commissioning a platform
 * in Kenya: the growth plan's "insight topics for buyers". Kevin reads, edits
 * and publishes them from the dashboard. Voice: documentation/VOICE_AND_TONE.md.
 * No prices or statistics beyond what the site already states; legal points
 * follow the Data Protection Act 2019, its 2021 regulations and the ODPC's
 * guidance (checked November 2026), and say they are not legal advice.
 */
return new class extends Migration
{
    public const TOPIC = 'Building for African markets';

    public function up(): void
    {
        if (! Schema::hasTable('insights')) {
            return;
        }
        $author = DB::table('insights')->whereNotNull('user_id')->value('user_id') ?? DB::table('users')->value('id');
        if (! $author) {
            return;
        }

        foreach (self::drafts() as $draft) {
            if (DB::table('insights')->where('slug', $draft['slug'])->exists()) {
                continue;
            }
            DB::table('insights')->insert($draft + [
                'category' => self::TOPIC,
                'user_id' => $author,
                'is_published' => false,
                'published_at' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
        Cache::forget('published_insights');
        Cache::forget('all_insights_admin');
    }

    public function down(): void
    {
        DB::table('insights')->whereIn('slug', array_column(self::drafts(), 'slug'))->where('is_published', false)->delete();
    }

    /** @return list<array{title: string, slug: string, excerpt: string, content: string}> */
    public static function drafts(): array
    {
        return [
            [
                'title' => 'What it really costs to launch a fintech app in Kenya',
                'slug' => 'what-it-costs-to-launch-a-fintech-app-in-kenya',
                'excerpt' => 'The build is only one line of the budget. Licences, payment fees, data protection and the months after launch decide whether a fintech product survives its first year.',
                'content' => trim(<<<'HTML'
<p>Behind every fintech idea in Kenya there is someone who will trust it with money they cannot afford to lose: a trader paying suppliers by M-Pesa, a family saving for school fees, a small business waiting on a payout. Budgeting for their trust is the real cost of launching, and it is wider than the cost of the app.</p>
<p>Founders and foreign teams entering the market often price the build and nothing else. Here is the whole picture, so the budget holds when the product meets real people.</p>
<h2>The build</h2>
<p>This is the part everyone expects: the app or web platform, the dashboard your team runs it from, and the connections to payment providers. What moves the price is less the number of screens than the number of ways money moves: taking payments, paying out, splitting between parties, refunding, and reconciling every one of them.</p>
<p>A payments product also needs things a brochure site never does: an audit trail of who did what, roles and permissions for your staff, and careful handling of failures, so a dropped connection never charges anyone twice.</p>
<p>For a first range, the <a href="/tools/estimate">cost estimator</a> asks eight questions and returns a figure in US dollars with a timeline and an outline of the work. Every project then gets one fixed price in its proposal.</p>
<h2>Licences and the regulator</h2>
<p>Whether you need a licence from the Central Bank of Kenya depends on what your product does with money, and it is the first thing to settle, before design starts:</p>
<ul>
<li><strong>Collecting payments for your own business</strong> through M-Pesa or a card provider usually needs no licence of your own; the provider holds it.</li>
<li><strong>Holding or moving other people’s money</strong>, as a wallet, a remittance service or a marketplace that keeps sellers’ funds, can make you a payment service provider under the National Payment System Act, which needs the Central Bank’s authorisation. A draft National Payment System Bill, 2026 proposes to replace that Act, so check where it stands.</li>
<li><strong>Lending</strong>, including small digital loans, needs a licence as a digital credit provider from the Central Bank.</li>
</ul>
<p>Licensing takes time and has capital requirements of its own. Often the better first version is designed so the platform never holds funds at all: money goes straight from customer to seller through the provider’s split payouts.</p>
<h2>Payment and running costs</h2>
<ul>
<li><strong>Transaction fees.</strong> M-Pesa and card providers charge per transaction. Model them against your expected volumes and your pricing; they can decide whether a low-value product makes money.</li>
<li><strong>SMS and WhatsApp messages.</strong> Receipts, sign-in codes and reminders cost a little each, and add up.</li>
<li><strong>Hosting and backups.</strong> Modest at launch, but plan for growth and for backups kept away from the main server.</li>
</ul>
<h2>Data protection</h2>
<p>A fintech product handles some of the most sensitive data people have. Kenya’s Data Protection Act, 2019 applies, and providing financial services is one of the purposes that must register with the Office of the Data Protection Commissioner whatever the size of the business. Budget for registration, a privacy notice written in plain language, and the time to build consent and data requests into the product from the start. <a href="/insights/is-your-app-compliant-with-kenyas-data-protection-act">A separate note covers the Act in more detail.</a></p>
<h2>After launch</h2>
<p>The months after launch are when the product learns what people actually do with it. Keep part of the budget for fixes, small changes the first users ask for, and someone to answer their questions. A fintech product that goes quiet after launch loses trust quickly; one that answers and improves earns it.</p>
<h2>Where to start</h2>
<p>Work through the <a href="/tools/launch-checklist">launch checklist for African markets</a> to see what applies to your product, then get a first range from the <a href="/tools/estimate">cost estimator</a>. When you are ready, <a href="/contact">share a short brief</a> or <a href="/book">book a call</a>: OKJTechnologies will map the people your product serves and return a fixed-price proposal within two business days.</p>
<p><em>This is a practical guide, not legal or financial advice. Confirm licensing questions with the Central Bank of Kenya or a lawyer.</em></p>
HTML),
            ],
            [
                'title' => 'Six M-Pesa integration mistakes foreign teams make',
                'slug' => 'mpesa-integration-mistakes-foreign-teams-make',
                'excerpt' => 'A payment that worked in the sandbox can still leave a customer charged and an order unpaid. Six mistakes that catch teams new to M-Pesa, and how to avoid each one.',
                'content' => trim(<<<'HTML'
<p>For most customers in Kenya, paying means M-Pesa: a prompt on their phone, a PIN, a confirmation message they keep. When it works they barely notice it. When it fails, someone has paid and has nothing to show for it, and they will remember that far longer than any feature.</p>
<p>Teams arriving from card-first markets often build an M-Pesa integration that passes every test and still fails people in production. These are the six mistakes that come up most, all of them avoidable.</p>
<h2>1. Treating the request as the payment</h2>
<p>With Safaricom’s Daraja API, your server asks M-Pesa to send a payment prompt to the customer’s phone (an STK Push). The reply that the request was accepted only means the prompt was sent. The customer may cancel, mistype their PIN, lack the funds, or never look at their phone.</p>
<p><strong>Instead:</strong> mark an order paid only when the result arrives with a success code and an M-Pesa receipt number, and keep that receipt number with the order.</p>
<h2>2. Trusting the callback to always arrive</h2>
<p>M-Pesa sends the result to a callback address on your server. Most of the time it arrives in seconds. Sometimes it is late, and sometimes it never comes, often because the address was unreachable at that moment.</p>
<p><strong>Instead:</strong> store the request’s CheckoutRequestID when you start the payment. If no result has arrived after a short wait, ask Daraja for the payment’s status and settle the order from the answer. Treat a received callback as final, and use the status query only for payments still pending.</p>
<h2>3. A callback address M-Pesa can’t reach</h2>
<p>The callback must be a public HTTPS address. Localhost tunnels that expire, firewalls, self-signed certificates and redirects all quietly swallow results.</p>
<p><strong>Instead:</strong> use a stable HTTPS address on your own domain that answers quickly, logs every call it receives, and does the slow work after replying.</p>
<h2>4. Processing the same result twice</h2>
<p>Results can be delivered more than once, and a status query can race a late callback. Without care, an order is fulfilled twice or a wallet credited twice.</p>
<p><strong>Instead:</strong> make processing idempotent: one payment, one receipt number, one effect, however many times the result arrives.</p>
<h2>5. Phone numbers and amounts in the wrong shape</h2>
<p>People write their number as 07…, 01…, +254… or with spaces. Daraja expects one format (2547… or 2541…). Amounts are whole shillings.</p>
<p><strong>Instead:</strong> accept every way people write their number, store one consistent format, and validate before you send the request, with a clear message if something is wrong.</p>
<h2>6. Going live without a plan for reconciliation</h2>
<p>Moving from the sandbox to production means real credentials for a Paybill or Till number registered to the business. It is also when someone in finance first asks how payments will be matched to orders and refunds handled. The sandbox does not always behave like production either, so a result that looks odd there is worth checking against the live system.</p>
<p><strong>Instead:</strong> match every payment to its order automatically, show unmatched ones in the dashboard, and send the customer a receipt by SMS, email or WhatsApp. Nobody should be copying codes from statements by hand.</p>
<h2>Building it right the first time</h2>
<p>None of these fixes is complicated. Each is a small decision made with the customer in mind: the person standing at a counter waiting for a confirmation. Get them right and M-Pesa becomes the part of your product nobody has to think about.</p>
<p>The <a href="/tools/launch-checklist">launch checklist for African markets</a> covers payments alongside data protection, networks and going live. If you are adding M-Pesa to a platform, or entering Kenya with an existing one, <a href="/book">book a call</a> with OKJTechnologies.</p>
HTML),
            ],
            [
                'title' => 'Is your app compliant with Kenya’s Data Protection Act?',
                'slug' => 'is-your-app-compliant-with-kenyas-data-protection-act',
                'excerpt' => 'If people in Kenya use your product, the Data Protection Act, 2019 applies, wherever your company is based. What it asks of a digital product, in plain language, and what to build in from the start.',
                'content' => trim(<<<'HTML'
<p>Every form in your product is a person handing you something about themselves: a phone number, an ID number, a health condition, where they live. Kenya’s Data Protection Act, 2019 exists so that what they hand over is used for the reason they gave it, kept safe, and returned or deleted when they ask.</p>
<p>The Act applies to anyone processing the personal data of people in Kenya, wherever the company is based. For a foreign team entering the market, and for a Kenyan startup on its first platform, compliance is easiest when it is designed in rather than added later. Here is what it asks of a digital product.</p>
<h2>Register with the Data Commissioner</h2>
<p>Organisations that collect or process personal data generally register with the Office of the Data Protection Commissioner (ODPC) as a data controller, a data processor, or both. There is an exemption for small organisations with an annual turnover under KSh 5 million and fewer than ten employees, but some kinds of work must register whatever their size. The registration regulations list them, and they include areas such as health, education, financial services and direct marketing. Check the ODPC’s guidance for your case; certificates are renewed every two years.</p>
<h2>Ask for consent properly, and keep the proof</h2>
<p>Where you rely on consent, the Act expects it to be express, unequivocal, free, specific and informed. In a product that means a clear choice the person makes (not a box ticked for them), separate choices for separate purposes (an account is not consent to marketing), and a record of when and how each person agreed.</p>
<h2>Collect less, and protect what is sensitive</h2>
<p>Ask only for what the service needs, and keep it only as long as you need it. Health information and other sensitive personal data come with stricter conditions: limit who on your team can see them, and log who did.</p>
<h2>Let people see, correct and delete their data</h2>
<p>People have the right to know what you hold about them, to correct it and, in many cases, to have it deleted. Build these as features: a page where someone can download or correct their details, and a way to ask for deletion that reaches a person who acts on it.</p>
<h2>Know where your data travels</h2>
<p>Cloud hosting, email services and analytics often store data outside Kenya. The Act sets conditions for transfers abroad, so list every service that receives personal data and where it keeps it. Some data, and some sectors, carry stricter rules on where it may be held.</p>
<h2>Plan for a breach before one happens</h2>
<p>If personal data is exposed, the controller must notify the Data Commissioner within 72 hours of becoming aware of it, and in some cases tell the people affected. A processor must tell the controller even sooner. Decide now who would make that call, and make sure your systems log enough to know what happened.</p>
<h2>What is at stake</h2>
<p>The Commissioner can issue enforcement and penalty notices, with fines of up to KSh 5 million or 1% of annual turnover. More important than the fine is the trust of the people whose data it is.</p>
<h2>Building it in</h2>
<p>Done early, most of this is ordinary product work: a consent screen, a settings page, a data inventory, sensible access rules. OKJTechnologies’ founder was trained on the Act with Lawyers Hub and the Africa Digital Policy Institute, and supported the delivery of their Africa Data Protection Course and CIPP/E training. Every platform the studio builds starts from the people whose data it holds.</p>
<p>Start with the data protection section of the <a href="/tools/launch-checklist">launch checklist</a>. To build a product with this designed in, <a href="/contact">share a short brief</a>.</p>
<p><em>This is a practical guide for product teams, not legal advice. For your specific situation, consult the ODPC’s guidance or a data protection lawyer.</em></p>
HTML),
            ],
            [
                'title' => 'Building for 3G: web apps that work on the networks people actually have',
                'slug' => 'building-for-3g-and-slow-networks',
                'excerpt' => 'Many people will meet your product on a mid-range Android phone, on data they pay for by the megabyte, with a signal that comes and goes. How to build a web app that respects that.',
                'content' => trim(<<<'HTML'
<p>Picture the person your product is for, opening it for the first time. Often they are on a mid-range Android phone, on mobile data bought in small bundles, in a matatu or at a market where the signal comes and goes. Every megabyte your app downloads is money from their pocket, and every second it spends loading is a chance for them to give up.</p>
<p>Building for that person is not building something lesser. A product that works on a slow connection is fast everywhere, and it reaches the people who would otherwise be left out.</p>
<h2>Test the way your users live</h2>
<p>Most products are built on fast laptops over office Wi-Fi, and they feel fine there. Test on a real mid-range phone, with the browser’s network throttling set to a slow mobile connection. Aim for the main content to appear within about 2.5 seconds; Google’s own measure of loading uses the same mark. The free <a href="/tools/site-check">site check</a> reports it for any page, from Google’s test on a mobile connection.</p>
<h2>Make every byte earn its place</h2>
<ul>
<li><strong>Images:</strong> serve modern formats such as WebP at the size they are shown, and load them only when they scroll into view.</li>
<li><strong>Video:</strong> don’t play it on its own. Let people choose to start it.</li>
<li><strong>JavaScript:</strong> send only the code a page needs, and split the rest so it loads when it is used.</li>
<li><strong>Fonts:</strong> one or two weights, served from your own domain, with text visible while they load.</li>
</ul>
<h2>Send the words with the page</h2>
<p>An app that arrives as an empty shell and then asks the server for its content makes people wait twice. Send the page’s main text with the first response, so people can start reading while the rest loads. Search engines read it better too.</p>
<h2>Expect the connection to drop</h2>
<ul>
<li>Save long forms as people type, so a dropped connection doesn’t erase ten minutes of work.</li>
<li>Retry quietly when the network returns, and tell people plainly when something is waiting to send.</li>
<li>Never charge twice: a payment page that is reloaded or resubmitted must recognise the payment already made.</li>
<li>Where it helps, keep a copy of what people last saw, so the app opens even without a signal.</li>
</ul>
<h2>Reach people beyond the browser</h2>
<p>Some things matter too much to depend on data. Send sign-in codes, receipts and reminders by SMS as well as email, and meet people on WhatsApp, which many already use every day, with their permission.</p>
<h2>A product for everyone it is meant for</h2>
<p>Each of these choices is small. Together they decide whether the person in the matatu gets to use your product at all. OKJTechnologies builds with that person in mind from the first screen.</p>
<p>Run your own pages through the <a href="/tools/site-check">site check</a>, and see the phones and networks section of the <a href="/tools/launch-checklist">launch checklist</a>. If your product needs to reach people on the networks they actually have, <a href="/book">book a call</a>.</p>
HTML),
            ],
        ];
    }
};
