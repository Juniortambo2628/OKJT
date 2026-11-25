<?php

namespace Okjt\Kit\Console;

use Illuminate\Console\Command;
use Okjt\Kit\Privacy\Privacy;

/**
 * The daily privacy run, from Naoa's naoa:retention: purge what each
 * retention rule says is past its time, then deal with requests to delete
 * data that are past their date: erased automatically when the project has
 * chosen that (okjt.privacy.auto_complete), otherwise listed so a person can.
 *
 *   Schedule::command('okjt:retention')->daily();
 */
class ApplyRetention extends Command
{
    protected $signature = 'okjt:retention {--dry-run : Say what would be done without doing it}';

    protected $description = 'Delete data past its retention period and deal with overdue erasure requests';

    public function handle(Privacy $privacy): int
    {
        $dry = (bool) $this->option('dry-run');

        foreach ($privacy->applyRetention($dry) as $label => $count) {
            $this->line(($dry ? 'Would delete ' : 'Deleted ')."{$count}: {$label}");
        }

        $auto = (bool) config('okjt.privacy.auto_complete');
        foreach ($privacy->overdue() as $request) {
            if ($auto && ! $dry) {
                $privacy->erase($request, null, 'Completed automatically at the deadline.');
                $this->line("Erased (overdue): request #{$request->id}");
            } else {
                $this->warn(($auto ? 'Would erase' : 'Overdue, needs a person').": request #{$request->id}, due {$request->due_at->toDateString()}");
            }
        }

        return self::SUCCESS;
    }
}
