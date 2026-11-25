<?php

namespace Okjt\Kit\Content;

use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

/**
 * The email to the team about a new contact message
 * (okjt.contact.notify_email). A project can send its own
 * (okjt.contact.received_notification). Reply-To is the sender, so
 * answering from the inbox works too.
 */
class ContactMessageReceived extends Notification
{
    public function __construct(public ContactMessage $contact) {}

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $c = $this->contact;

        return (new MailMessage)
            ->subject('New message: '.($c->subject ?: 'from the contact form'))
            ->replyTo($c->email, $c->name)
            ->line("From {$c->name} <{$c->email}>".($c->topic ? " about {$c->topic}" : ''))
            ->line($c->message);
    }
}
