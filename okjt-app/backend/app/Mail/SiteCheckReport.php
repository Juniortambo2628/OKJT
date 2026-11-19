<?php

namespace App\Mail;

use App\Models\SiteCheck;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

/** A website health check's results and the link to its report. */
class SiteCheckReport extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public SiteCheck $check) {}

    public function envelope(): Envelope
    {
        return new Envelope(subject: 'Your site check for '.$this->check->host);
    }

    public function content(): Content
    {
        $origin = rtrim(config('app.frontend_url') ?: config('app.url'), '/');
        $checks = collect($this->check->report['checks'] ?? []);

        return new Content(view: 'emails.site-check-report', with: [
            'check' => $this->check,
            'reportUrl' => $origin.'/tools/site-check/'.$this->check->id,
            'bookUrl' => $origin.'/book',
            'summary' => $this->check->report['summary'] ?? ['pass' => 0, 'warn' => 0, 'fail' => 0],
            'problems' => $checks->whereIn('status', ['fail', 'warn'])->sortBy(fn ($c) => $c['status'] === 'fail' ? 0 : 1)->take(5)->values(),
        ]);
    }
}
