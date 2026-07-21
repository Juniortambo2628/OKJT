<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ContentUpdateNotification extends Mailable
{
    use Queueable, SerializesModels;

    public $typeLabel; // Insight or Project

    public $categoryLabel;

    public $title;

    public $excerpt;

    public $url;

    public $imageUrl;

    /**
     * Create a new message instance.
     */
    public function __construct($typeLabel, $categoryLabel, $title, $excerpt, $url, $imageUrl = null)
    {
        $this->typeLabel = $typeLabel;
        $this->categoryLabel = $categoryLabel;
        $this->title = $title;
        $this->excerpt = $excerpt;
        $this->url = $url;
        $this->imageUrl = $imageUrl;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "New {$this->typeLabel}: {$this->title} - OKJTech",
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.content-update',
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
