<?php

namespace App\Support;

use App\Models\SiteSetting;

/**
 * What every email's frame shows: the logo, the studio's name and its real
 * contact details (from Settings › Contact details), and the site's links.
 * Shared with emails/layout.blade.php by a view composer.
 */
class EmailBrand
{
    public const NAME = 'OKJTechnologies';

    public const LINE = 'Product engineering for African markets';

    public const PLACE = 'Nairobi, Kenya';

    /** @return array<string, string> */
    public static function data(): array
    {
        $contact = SiteSetting::whereIn('key', ['contact_email', 'contact_phone', 'site_name'])->pluck('value', 'key');

        return [
            'name' => self::NAME,
            'line' => self::LINE,
            'place' => self::PLACE,
            'logo' => SiteUrl::page('/logos/OKJT-Logos/OKJTechLogo-White_Transparent.png'),
            'email' => trim((string) ($contact['contact_email'] ?? '')),
            'phone' => trim((string) ($contact['contact_phone'] ?? '')),
            'website' => SiteUrl::page('/'),
            'howWeWork' => SiteUrl::page('/how-we-work'),
            'privacy' => SiteUrl::page('/privacy'),
        ];
    }
}
