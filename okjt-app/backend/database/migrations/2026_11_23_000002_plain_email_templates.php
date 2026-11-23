<?php

use App\Support\EnquiryReply;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

/**
 * The two email templates in Settings were Blade code copied from another
 * project (a London address, "advisory team", "24-48 business hours"), and
 * whatever was typed there ran on the server. They are replaced by the
 * reply's subject line and opening message, as plain words with
 * {first name} and {subject}; the emails' design lives in the code.
 */
return new class extends Migration
{
    public function up(): void
    {
        DB::table('site_settings')->whereIn('key', ['email_template_admin', 'email_template_user'])->delete();
        foreach ([
            ['enquiry_reply_subject', EnquiryReply::DEFAULT_SUBJECT, 'text'],
            ['enquiry_reply_message', EnquiryReply::DEFAULT_MESSAGE, 'rich'],
        ] as [$key, $value, $type]) {
            if (! DB::table('site_settings')->where('key', $key)->exists()) {
                DB::table('site_settings')->insert(['key' => $key, 'value' => $value, 'type' => $type, 'group' => 'email', 'created_at' => now(), 'updated_at' => now()]);
            }
        }
        Cache::forget('site_settings_grouped');
    }

    public function down(): void
    {
        DB::table('site_settings')->whereIn('key', ['enquiry_reply_subject', 'enquiry_reply_message'])->delete();
        Cache::forget('site_settings_grouped');
    }
};
