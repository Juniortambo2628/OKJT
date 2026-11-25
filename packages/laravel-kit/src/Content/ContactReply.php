<?php

namespace Okjt\Kit\Content;

use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

/** The team's reply to a contact message, sent to its sender. A project can send its own (okjt.contact.reply_notification). */
class ContactReply extends Notification
{
    public function __construct(public ContactMessage $contact, public string $reply) {}

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Re: '.($this->contact->subject ?: 'your message to '.config('app.name')))
            ->greeting('Hello '.$this->contact->name.',')
            ->line($this->reply)
            ->line('— '.config('app.name'));
    }
}
