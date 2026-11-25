<?php

namespace Okjt\Kit\Console;

use Illuminate\Console\Command;
use Okjt\Kit\Payments\Mpesa\Mpesa;
use Okjt\Kit\Payments\Mpesa\MpesaSettings;

/**
 * The safety net for M-Pesa prompts whose answer never came (from naoa-dt's
 * mpesa:reconcile). The kit schedules it every minute while
 * okjt.mpesa.reconcile is on (the default); it does nothing while M-Pesa is
 * switched off and nothing is pending.
 */
class ReconcileMpesa extends Command
{
    protected $signature = 'okjt:mpesa-reconcile {--limit=50 : Most prompts to check in one run}';

    protected $description = 'Ask M-Pesa about prompts whose answer never came, and time out unanswered ones';

    public function handle(Mpesa $mpesa, MpesaSettings $settings): int
    {
        if (! $settings->isOn()) {
            return self::SUCCESS;
        }
        $done = $mpesa->reconcile(max(1, (int) $this->option('limit')));
        if ($done['checked']) {
            $this->line("Checked {$done['checked']}, resolved {$done['resolved']}.");
        }

        return self::SUCCESS;
    }
}
