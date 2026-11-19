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

class ConsultationRequestAdminNotification extends Mailable
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
            subject: 'New Consultation Request: '.($this->requestData->subject ?? 'General Inquiry'),
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        $customTemplate = SiteSetting::where('key', 'email_template_admin')->first();

        if ($customTemplate && ! empty($customTemplate->value)) {
            // Check if it already has layout stuff, if not we use dynamic view
            if (! str_contains($customTemplate->value, '@extends')) {
                return new Content(
                    view: 'emails.dynamic',
                    with: [
                        'dynamicContent' => Blade::render($customTemplate->value, $this->templateData()),
                    ]
                );
            } else {
                // If it has extends, we still need a way to render it as a view
                // For simplicity, we'll assume most won't add extends in the simple editor
                return new Content(
                    htmlString: Blade::render($customTemplate->value, $this->templateData())
                );
            }
        }

        return new Content(
            view: 'emails.consultation-admin-notification',
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
