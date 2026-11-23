<?php

namespace App\Mail;

use App\Support\SiteUrl;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Address;
use Illuminate\Mail\Mailables\Attachment;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

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
            // Replying answers the visitor, not the site's own address.
            replyTo: [new Address($this->requestData->email, trim($this->requestData->first_name.' '.$this->requestData->last_name))],
            subject: 'New brief from '.trim($this->requestData->first_name.' '.$this->requestData->last_name).($this->requestData->subject ? ': '.$this->requestData->subject : ''),
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.consultation-admin-notification',
            with: $this->templateData(),
        );
    }

    /** What the email shows: the brief, and where to find it in the dashboard. */
    private function templateData(): array
    {
        return [
            'requestData' => $this->requestData,
            'dashboardUrl' => SiteUrl::page('/admin/requests'),
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
