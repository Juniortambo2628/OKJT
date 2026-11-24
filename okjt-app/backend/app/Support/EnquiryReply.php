<?php

namespace App\Support;

use App\Models\SiteSetting;

/**
 * The reply a visitor gets after sending a brief: its subject line and
 * opening message come from Settings › Email templates, as plain words with
 * {first name} and {subject} where the brief's own details go. Nothing in
 * them runs as code; the details are inserted as text.
 */
class EnquiryReply
{
    public const DEFAULT_SUBJECT = 'Your brief reached OKJTechnologies';

    public const DEFAULT_MESSAGE = '<p>Thanks for your brief about <strong>{subject}</strong>. It has arrived safely, and every brief receives a reply with next steps.</p>';

    public static function subject(object $brief): string
    {
        $text = trim((string) SiteSetting::where('key', 'enquiry_reply_subject')->value('value')) ?: self::DEFAULT_SUBJECT;

        return trim(strip_tags(self::fill($text, $brief, false)));
    }

    /** The opening message as HTML: the dashboard's formatted text, with the brief's details inserted safely. */
    public static function message(object $brief): string
    {
        $html = trim((string) SiteSetting::where('key', 'enquiry_reply_message')->value('value')) ?: self::DEFAULT_MESSAGE;

        return self::fill($html, $brief, true);
    }

    private static function fill(string $text, object $brief, bool $html): string
    {
        $values = [
            'first name' => trim((string) ($brief->first_name ?? '')) ?: 'there',
            'subject' => trim((string) ($brief->subject ?? '')) ?: 'your project',
        ];

        return preg_replace_callback('/\{\s*(first[ _]?name|subject)\s*\}/i', function ($m) use ($values, $html) {
            $value = $values[str_contains(strtolower($m[1]), 'first') ? 'first name' : 'subject'];

            return $html ? e($value) : $value;
        }, $text);
    }
}
