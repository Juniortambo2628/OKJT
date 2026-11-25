<?php

namespace Okjt\Kit\Privacy;

use Okjt\Kit\Content\ContactMessage;

/** Contact messages older than okjt.contact.keep_days (null keeps them). */
class ContactMessagesRetention implements RetentionRule
{
    public function label(): string
    {
        return 'Contact messages';
    }

    public function period(): ?string
    {
        $days = config('okjt.contact.keep_days');

        return $days ? (int) $days.' '.((int) $days === 1 ? 'day' : 'days').' after they were sent' : null;
    }

    public function due(): int
    {
        return (new ContactMessage)->prunable()->count();
    }

    public function purge(): int
    {
        return (new ContactMessage)->prunable()->delete();
    }
}
