<?php

namespace Okjt\Kit\Backups;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Attachment;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;

/**
 * Off-site copy of a scheduled backup. Sent synchronously (not queued) so the
 * zip is attached while it still exists; oversized backups are only announced.
 */
class BackupCreated extends Mailable
{
    use Queueable;

    /** The email's view; a project with its own email layout points this at its copy. */
    protected string $template = 'okjt::backup-created';

    /**
     * @param  array{name: string, size: int, created_at: string, label: ?string, tables: int, rows: int}  $backup
     * @param  string|null  $attachmentPath  absolute path of the zip, or null when it is too large to attach
     */
    public function __construct(
        public array $backup,
        public ?string $attachmentPath,
        public float $maxMegabytes,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Backup '.$this->backup['name'].' ('.config('app.name').')',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: $this->template,
            with: [
                'attached' => $this->attachmentPath !== null,
                'sizeMb' => round($this->backup['size'] / 1048576, 2),
            ],
        );
    }

    /** @return array<int, Attachment> */
    public function attachments(): array
    {
        if ($this->attachmentPath === null) {
            return [];
        }

        return [
            Attachment::fromPath($this->attachmentPath)
                ->as($this->backup['name'])
                ->withMime('application/zip'),
        ];
    }
}
