<?php

namespace App\Mail;

use App\Models\Rsvp;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Attachment;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class RsvpConfirmation extends Mailable
{
    use Queueable, SerializesModels;

    public $rsvp;

    /**
     * Create a new message instance.
     */
    public function __construct(Rsvp $rsvp)
    {
        $this->rsvp = $rsvp;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        $subject = 'Receipt of Your Request - OKJTech';

        if ($this->rsvp->type === 'early_access') {
            $subject = 'Hold tight, your access is requested! - OKJTech';
        } elseif ($this->rsvp->type === 'rsvp') {
            if ($this->rsvp->attendance === 'accepted') {
                $subject = 'Seat Reserved: See you at the OKJTech Launch! - OKJTech';
            } else {
                $subject = 'RSVP Received: We\'ll miss you - OKJTech';
            }
        }

        return new Envelope(
            subject: $subject,
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            markdown: 'emails.rsvp.confirmation',
            with: [
                'rsvp' => $this->rsvp,
                'logoUrl' => config('app.frontend_url', 'http://localhost:3000').'/logos/OKJT-Logos/OKJTechLogo-Black_Transparent.png',
            ],
        );
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, Attachment>
     */
    public function attachments(): array
    {
        return [];
    }
}
