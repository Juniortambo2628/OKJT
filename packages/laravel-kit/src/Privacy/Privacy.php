<?php

namespace Okjt\Kit\Privacy;

use Illuminate\Support\Facades\DB;
use Okjt\Kit\Workspace\CurrentWorkspace;

/**
 * The privacy schedule and erasure, from Naoa (Retention, GuestEraser,
 * ApplyRetention) with the wedding-specific parts left there: the project
 * says what it holds through its retention rules and erasers
 * (okjt.privacy.retention, okjt.privacy.erasers), and this runs them.
 */
class Privacy
{
    /** @return RetentionRule[] */
    public function rules(): array
    {
        return array_map(fn ($class) => app($class), (array) config('okjt.privacy.retention', []));
    }

    /** @return Eraser[] */
    public function erasers(): array
    {
        return array_map(fn ($class) => app($class), (array) config('okjt.privacy.erasers', []));
    }

    /** Each rule as the admin's privacy page shows it. */
    public function schedule(): array
    {
        return array_map(fn (RetentionRule $rule) => [
            'label' => $rule->label(),
            'period' => $rule->period(),
            'due' => $rule->due(),
        ], $this->rules());
    }

    /**
     * Purge what is past its time. Returns [label => how many] for each rule
     * with something due; a dry run counts without deleting.
     */
    public function applyRetention(bool $dryRun = false): array
    {
        $done = [];
        foreach ($this->rules() as $rule) {
            $count = $dryRun ? $rule->due() : $rule->purge();
            if ($count) {
                $done[$rule->label()] = $count;
            }
        }

        return $done;
    }

    /**
     * Run every eraser for this request, in one transaction (and in its
     * workspace), and mark it done. Returns the outcome lines.
     *
     * @return string[]
     */
    public function erase(ErasureRequest $request, ?int $handledBy = null, ?string $note = null): array
    {
        $run = fn () => DB::transaction(function () use ($request, $handledBy, $note) {
            $lines = array_values(array_filter(array_map(fn (Eraser $eraser) => $eraser->erase($request), $this->erasers())));
            $outcome = array_filter([$note, $lines ? implode('; ', $lines).'.' : 'Nothing else was held about them.']);
            $request->forceFill([
                'status' => ErasureRequest::DONE,
                'completed_at' => now(),
                'handled_by' => $handledBy,
                'outcome' => implode(' ', $outcome),
            ])->save();

            return $lines;
        });

        if (config('okjt.privacy.per_workspace') && $request->workspace_id && CurrentWorkspace::id() !== (int) $request->workspace_id) {
            $model = config('okjt.workspace.model');
            if ($model && ($workspace = $model::query()->withoutGlobalScopes()->find($request->workspace_id))) {
                return CurrentWorkspace::run($workspace, $run);
            }
        }

        return $run();
    }

    public function decline(ErasureRequest $request, string $reason, ?int $handledBy = null): void
    {
        $request->forceFill([
            'status' => ErasureRequest::DECLINED,
            'completed_at' => now(),
            'handled_by' => $handledBy,
            'outcome' => $reason,
        ])->save();
    }

    /** Open requests past their date, across every workspace. */
    public function overdue()
    {
        return ErasureRequest::query()->withoutGlobalScopes()
            ->where('status', ErasureRequest::RECEIVED)
            ->where('due_at', '<', now())
            ->orderBy('due_at')
            ->get();
    }
}
