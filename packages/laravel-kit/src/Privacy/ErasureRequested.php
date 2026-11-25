<?php

namespace Okjt\Kit\Privacy;

use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

/**
 * The email to the team about a new request to delete someone's data
 * (okjt.privacy.notify_email, else the contact_email site setting). A
 * project can send its own (okjt.privacy.received_notification).
 */
class ErasureRequested extends Notification
{
    public function __construct(public ErasureRequest $request) {}

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $r = $this->request;
        $mail = (new MailMessage)
            ->subject('Request to delete personal data')
            ->line("{$r->name} has asked for their data to be deleted.")
            ->line('Contact: '.implode(', ', array_filter([$r->email, $r->phone])))
            ->line('It must be dealt with by '.$r->due_at->toFormattedDateString().'.');
        if ($r->details) {
            $mail->line($r->details);
        }

        return $mail;
    }
}
