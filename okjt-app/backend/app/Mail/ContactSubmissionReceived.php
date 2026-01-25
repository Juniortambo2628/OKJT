<?php

namespace App\Mail;

use App\Models\ContactSubmission;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class ContactSubmissionReceived extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public ContactSubmission $submission)
    {
    }

    public function build(): self
    {
        return $this->subject('We received your message')
            ->markdown('emails.contact.received', [
                'submission' => $this->submission,
            ]);
    }
}


