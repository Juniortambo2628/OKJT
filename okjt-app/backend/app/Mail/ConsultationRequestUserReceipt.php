<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ConsultationRequestUserReceipt extends Mailable
{
    use Queueable, SerializesModels;

    public $requestData;

    /**
     * Create a new message instance.
     */
    public function __construct($requestData)
    {
        $this->requestData = $requestData;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'We Received Your Request: ' . ($this->requestData->subject ?? 'Consultation Inquiry'),
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        $customTemplate = \App\Models\SiteSetting::where('key', 'email_template_user')->first();
        
        if ($customTemplate && !empty($customTemplate->value)) {
            if (!str_contains($customTemplate->value, '@extends')) {
                return new Content(
                    view: 'emails.dynamic',
                    with: [
                        'dynamicContent' => \Illuminate\Support\Facades\Blade::render($customTemplate->value, ['requestData' => $this->requestData])
                    ]
                );
            } else {
                return new Content(
                    htmlString: \Illuminate\Support\Facades\Blade::render($customTemplate->value, ['requestData' => $this->requestData])
                );
            }
        }

        return new Content(
            view: 'emails.consultation-user-receipt',
        );
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, \Illuminate\Mail\Mailables\Attachment>
     */
    public function attachments(): array
    {
        return [];
    }
}
