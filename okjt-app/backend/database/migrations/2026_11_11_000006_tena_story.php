<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Tena, told from its own story (2026-11-11): the case study rewritten from
 * the founders' pitch deck and the product as it is now, and an Insights
 * article on what inspires it. Written about the work; no fundraising
 * figures, projections or personal details. See documentation/FLAGSHIPS.md.
 */
return new class extends Migration
{
    public function up(): void
    {
        $now = now();

        if (Schema::hasTable('projects')) {
            DB::table('projects')->where('slug', 'tena')->update([
                'tagline' => 'Guest WiFi that turns every stay or visit into a relationship the host owns.',
                'description' => 'Tena ("again" in Swahili) gives hotels, short-stay homes and businesses a branded guest WiFi that welcomes each guest, keeps in touch after they leave and brings them back to book directly. Co-founded by OKJTechnologies\' founder, who leads the technology.',
                'problem' => '<p>Millions of guests stay in African hotels, short-stay homes and serviced apartments every year, yet the host rarely owns the relationship. The booking platform holds the guest\'s details, takes a commission on every stay, and the people travelling with the booker are never known at all. Hosts are left with low repeat bookings and rising costs to win each guest again. Tena was born inside a real Nairobi hospitality business that felt this every day, and it is the tool its founders wished they had.</p>',
                'methodology' => '<p>A guest relationship platform, with the hardware to match:</p><ul><li><strong>Branded WiFi.</strong> A TenaFi access point plugs into the host\'s existing router. Guests connect through the host\'s own welcome page, and every guest, not just the booker, can become a contact.</li><li><strong>A home for the stay.</strong> The welcome page carries the guidebook, property information, local experiences and links to book directly next time.</li><li><strong>Staying in touch.</strong> Welcome messages, review requests and campaigns by email and SMS, sent automatically.</li><li><strong>One relationship.</strong> Tena supplies the device and the software together, with one point of contact. Hosts can buy the device or pay for it monthly, and a demo comes first.</li></ul><p>Rentals, events and businesses such as cafés each get their own journey, and the host dashboard brings guests, properties, campaigns and analytics together.</p>',
                'outcome' => '<p>Tena is live at tena.host and growing with its first hosts and businesses. The roadmap runs from guest data and marketing to direct booking and, later, a marketplace of local experiences. The aim is simple: African hosts who own their guest relationships, and guests who come back again.</p>',
                'updated_at' => $now,
            ]);
        }

        if (Schema::hasTable('insights')) {
            $author = DB::table('insights')->whereNotNull('user_id')->value('user_id')
                ?? DB::table('users')->value('id');
            $article = [
                'title' => 'Tena means "again"',
                'category' => 'Hospitality',
                'excerpt' => 'Hosts in Africa welcome guests every day and rarely get to keep in touch with them. Tena, born inside a Nairobi short-stay business, turns the guest WiFi into the start of a lasting relationship.',
                'content' => trim(<<<'HTML'
<p><em>Tena</em> is Swahili for "again". It is the word every host hopes a guest will say about their stay, and it is the whole idea behind the platform.</p>
<h2>Where it came from</h2>
<p>Tena was born inside a real hospitality business: short-stay homes in Nairobi, run with care, with hundreds of happy reviews. And still, almost every guest arrived through a booking platform and left the same way. The platform kept the guest's details, took its commission and stood between the host and the person they had looked after. The friends and family travelling with the booker were never known at all.</p>
<p>That is a quiet unfairness hosts across Africa live with. The care is theirs; the relationship isn't. Tena is the tool its founders wished they had.</p>
<h2>The simplest moment to say hello</h2>
<p>Nearly every guest asks for the WiFi within minutes of arriving. Tena makes that moment count. A TenaFi access point plugs into the host's existing router, and guests connect through the host's own welcome page, which carries the guidebook, the house information, local recommendations and a way to book directly next time.</p>
<p>From there, Tena keeps in touch on the host's behalf: a welcome message, a gentle request for a review after the stay, and, later, an invitation to come back.</p>
<h2>Built for Africa</h2>
<ul>
<li><strong>Hardware and software together.</strong> Tena supplies the device and the platform, with one point of contact and one bill. Hosts can buy the device or spread its cost monthly, so the price of hardware never decides who gets to take part.</li>
<li><strong>Email and SMS.</strong> Messages reach guests the way they actually read them.</li>
<li><strong>Beyond rentals.</strong> Cafés, venues and events have their own journeys too. A café can thank everyone who connected and ask them for a review, all at once.</li>
<li><strong>A demo first.</strong> Every new host starts with a conversation, by call, video or a visit, so the setup fits their place.</li>
</ul>
<h2>Where it is going</h2>
<p>Tena grows in stages: first knowing and reaching guests, then direct bookings that keep more of each stay's value with the host, and later a marketplace of local experiences, from restaurants and tours to transfers, so guests discover more of the places they visit and local businesses share in it.</p>
<h2>Who builds it</h2>
<p>Tena is built by hosts and technologists together. It was co-founded by a Nairobi host and OKJTechnologies' founder, who leads the technology. It is live and growing with its first hosts and businesses.</p>
<p>Every guest who comes back is proof of something hosts already know: the relationship was always theirs to keep. Tena just hands it back.</p>
HTML),
                'updated_at' => $now,
            ];
            $existing = DB::table('insights')->where('slug', 'tena-means-again')->first(['id']);
            if ($existing) {
                DB::table('insights')->where('id', $existing->id)->update($article);
            } elseif ($author) {
                DB::table('insights')->insert($article + [
                    'slug' => 'tena-means-again',
                    'image' => null,
                    'user_id' => $author,
                    'is_published' => true,
                    'published_at' => '2026-11-11 09:00:00',
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
};
