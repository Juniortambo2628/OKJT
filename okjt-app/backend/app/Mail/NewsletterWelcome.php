<?php

namespace App\Mail;

use App\Models\Subscriber;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Mail\Mailables\Headers;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\URL;

/** Sent once on signing up to the newsletter: what to expect, and a one-click way out. */
class NewsletterWelcome extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public Subscriber $subscriber) {}

    public function envelope(): Envelope
    {
        return new Envelope(subject: 'You’re on the OKJTechnologies list');
    }

    /** Lets mail apps show their own "Unsubscribe" button. */
    public function headers(): Headers
    {
        return new Headers(text: [
            'List-Unsubscribe' => '<'.$this->unsubscribeUrl().'>',
            'List-Unsubscribe-Post' => 'List-Unsubscribe=One-Click',
        ]);
    }

    public function content(): Content
    {
        $origin = rtrim(config('app.frontend_url') ?: config('app.url'), '/');

        return new Content(view: 'emails.newsletter-welcome', with: [
            'insightsUrl' => $origin.'/insights',
            'toolsUrl' => $origin.'/tools/site-check',
            'privacyUrl' => $origin.'/privacy',
            'unsubscribeUrl' => $this->unsubscribeUrl(),
        ]);
    }

    /**
     * The signature covers the path only, so the link still checks out if a
     * proxy in front of the server changes the scheme or host it sees.
     */
    public function unsubscribeUrl(): string
    {
        return rtrim(config('app.url'), '/').URL::signedRoute('newsletter.unsubscribe', ['subscriber' => $this->subscriber->id], absolute: false);
    }
}
