<?php

namespace Okjt\Kit\Privacy;

/**
 * How long one kind of data is kept, from Naoa (Retention). A project lists
 * its own in okjt.privacy.retention; `php artisan okjt:retention` (daily)
 * purges what is past its time, and the admin's privacy page shows each rule.
 * Rules run across every workspace.
 */
interface RetentionRule
{
    /** What is kept: "Contact messages". */
    public function label(): string;

    /** For how long, in words: "1 year after it was sent"; null when it is kept. */
    public function period(): ?string;

    /** How many records are past their time now. */
    public function due(): int;

    /** Delete or anonymise them; returns how many. */
    public function purge(): int;
}
