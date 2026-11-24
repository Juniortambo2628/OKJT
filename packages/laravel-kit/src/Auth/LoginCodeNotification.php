<?php

namespace Okjt\Kit\Auth;

use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

/** The email with a sign-in code. A project can send its own (okjt.auth.login_codes.notification). */
class LoginCodeNotification extends Notification
{
    public function __construct(public string $code)
    {
    }

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $minutes = (int) config('okjt.auth.login_codes.minutes', 10);

        return (new MailMessage)
            ->subject('Your sign-in code for '.config('app.name'))
            ->line('Use this code to sign in:')
            ->line("**{$this->code}**")
            ->line("It works once, for {$minutes} minutes. If you didn't ask for it, you can ignore this email.");
    }
}
