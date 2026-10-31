<?php

namespace Okjt\Kit\Auth;

use Illuminate\Auth\Notifications\VerifyEmail as LaravelVerifyEmail;

/**
 * The verification email: Laravel's, with a signed link to the app's
 * /verify-email page (VerificationLink), which sends its parts to
 * EmailVerificationController. In the user model:
 *
 *   public function sendEmailVerificationNotification(): void
 *   {
 *       $this->notify(new \Okjt\Kit\Auth\VerifyEmail);
 *   }
 */
class VerifyEmail extends LaravelVerifyEmail
{
    protected function verificationUrl($notifiable): string
    {
        return VerificationLink::for($notifiable);
    }
}
