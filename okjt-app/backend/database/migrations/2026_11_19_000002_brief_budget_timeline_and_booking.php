<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * The brief asks for a budget and a timeline, and visitors can book a call.
 *
 * - consultation_requests gains budget and timeline.
 * - booking_url (Contact details) holds the booking page's address, e.g. a
 *   Cal.com link. While it is empty, nothing about booking shows.
 * - The two email templates kept in Site settings learn the new values: the
 *   reply to the visitor offers the booking link, and the studio's copy shows
 *   the budget and timeline. A template is only changed where it still has
 *   the sentence or row the addition goes beside; one rewritten in the
 *   dashboard is left as it is.
 */
return new class extends Migration
{
    public const USER_ANCHOR = '<p>In the meantime, feel free to explore our latest market intelligence and insights:</p>';

    public const USER_BOOKING = <<<'BLADE'
@if (! empty($bookingUrl))
<p>Prefer to talk it through? Pick a time for a short call. The booking page shows times in your own time zone.</p>

<a href="{{ $bookingUrl }}" class="button">Book a Call</a>
@endif

BLADE;

    public const ADMIN_ANCHOR = <<<'BLADE'
        <tr>
            <td style="padding: 8px 0; color: #64748b; vertical-align: top;">Message:</td>
BLADE;

    public const ADMIN_ROWS = <<<'BLADE'
        @if (! empty($requestData->budget))
        <tr>
            <td style="padding: 8px 0; color: #64748b;">Budget:</td>
            <td style="padding: 8px 0; color: #ffffff;">{{ $requestData->budget }}</td>
        </tr>
        @endif
        @if (! empty($requestData->timeline))
        <tr>
            <td style="padding: 8px 0; color: #64748b;">Timeline:</td>
            <td style="padding: 8px 0; color: #ffffff;">{{ $requestData->timeline }}</td>
        </tr>
        @endif

BLADE;

    public function up(): void
    {
        Schema::table('consultation_requests', function (Blueprint $table) {
            $table->string('budget')->nullable()->after('subject');
            $table->string('timeline')->nullable()->after('budget');
        });

        if (! DB::table('site_settings')->where('key', 'booking_url')->exists()) {
            DB::table('site_settings')->insert([
                'key' => 'booking_url', 'value' => '', 'type' => 'text', 'group' => 'contact',
                'created_at' => now(), 'updated_at' => now(),
            ]);
        }

        $this->addBeside('email_template_user', self::USER_ANCHOR, self::USER_BOOKING, '$bookingUrl');
        $this->addBeside('email_template_admin', self::ADMIN_ANCHOR, self::ADMIN_ROWS, '->budget');

        Cache::forget('site_settings_grouped');
    }

    /** Puts $addition before $anchor in a template, once, if the anchor is still there. */
    private function addBeside(string $key, string $anchor, string $addition, string $marker): void
    {
        $template = DB::table('site_settings')->where('key', $key)->value('value');
        $normalised = str_replace("\r\n", "\n", (string) $template);
        if (! str_contains($normalised, $anchor) || str_contains($normalised, $marker)) {
            return;
        }
        DB::table('site_settings')->where('key', $key)->update([
            'value' => str_replace($anchor, $addition.$anchor, $normalised),
            'updated_at' => now(),
        ]);
    }

    public function down(): void
    {
        Schema::table('consultation_requests', function (Blueprint $table) {
            $table->dropColumn(['budget', 'timeline']);
        });
    }
};
