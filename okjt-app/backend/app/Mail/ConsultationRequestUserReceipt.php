<?php

namespace App\Mail;

use App\Models\SiteSetting;
use App\Support\EnquiryReply;
use App\Support\SiteUrl;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Attachment;
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
            subject: EnquiryReply::subject($this->requestData),
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.consultation-user-receipt',
            with: $this->templateData(),
        );
    }

    /**
     * What the email shows: the brief, the opening message from Settings ›
     * Email templates, and the booking page (empty while none is set).
     */
    private function templateData(): array
    {
        return [
            'requestData' => $this->requestData,
            'opening' => EnquiryReply::message($this->requestData),
            'bookingUrl' => (string) SiteSetting::where('key', 'booking_url')->value('value'),
            'howWeWorkUrl' => SiteUrl::page('/how-we-work'),
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
