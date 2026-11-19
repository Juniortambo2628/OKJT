<?php

namespace App\Mail;

use App\Models\SiteSetting;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Attachment;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Blade;

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
            subject: 'We Received Your Request: '.($this->requestData->subject ?? 'Consultation Inquiry'),
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        $customTemplate = SiteSetting::where('key', 'email_template_user')->first();

        if ($customTemplate && ! empty($customTemplate->value)) {
            if (! str_contains($customTemplate->value, '@extends')) {
                return new Content(
                    view: 'emails.dynamic',
                    with: [
                        'dynamicContent' => Blade::render($customTemplate->value, $this->templateData()),
                    ]
                );
            } else {
                return new Content(
                    htmlString: Blade::render($customTemplate->value, $this->templateData())
                );
            }
        }

        return new Content(
            view: 'emails.consultation-user-receipt',
            with: $this->templateData(),
        );
    }

    /**
     * What the templates can use: the brief, and the booking page's address
     * (empty while none is set in Contact details).
     *
     * @return array{requestData: mixed, bookingUrl: string}
     */
    private function templateData(): array
    {
        return [
            'requestData' => $this->requestData,
            'bookingUrl' => (string) SiteSetting::where('key', 'booking_url')->value('value'),
        ];
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
