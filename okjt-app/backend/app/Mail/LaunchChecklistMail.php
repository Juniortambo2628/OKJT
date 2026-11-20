<?php

namespace App\Mail;

use App\Support\LaunchChecklist;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

/** The launch checklist, in full, by email. */
class LaunchChecklistMail extends Mailable
{
    use Queueable, SerializesModels;

    public function envelope(): Envelope
    {
        return new Envelope(subject: 'Your launch checklist for African markets');
    }

    public function content(): Content
    {
        $origin = rtrim(config('app.frontend_url') ?: config('app.url'), '/');

        return new Content(view: 'emails.launch-checklist', with: [
            'sections' => LaunchChecklist::sections(),
            'pageUrl' => $origin.'/tools/launch-checklist',
            'bookUrl' => $origin.'/book',
        ]);
    }
}
