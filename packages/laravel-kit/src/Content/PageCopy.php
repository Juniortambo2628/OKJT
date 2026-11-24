<?php

namespace Okjt\Kit\Content;

use Illuminate\Database\QueryException;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use InvalidArgumentException;
use Okjt\Kit\Workspace\CurrentWorkspace;

/**
 * Page copy: the words on a site's pages, written as defaults in the
 * project's config and edited in the admin (AdminPageCopy). From TFE's
 * LandingContent (config + overrides; only text can change, never wiring)
 * and Naoa's PageContent (one record per section, with a visible switch,
 * per wedding).
 *
 * The defaults are the config tree named by okjt.page_copy.config (e.g.
 * 'landing_v2'); each top-level key is a section:
 *
 *   'hero' => ['title' => 'Plan the trip', 'cta' => ['label' => 'Start', 'action' => 'planner']],
 *
 * Only string leaves can be overridden, and never one under a structural key
 * (okjt.page_copy.structural: id, icon, action, image, …): an edit changes
 * what a page says, not how it is wired. An empty override means the default.
 *
 *   PageCopy::all();              // the merged tree, hidden sections left out
 *   PageCopy::section('hero');    // one section, merged
 */
final class PageCopy
{
    public const TABLE = 'okjt_page_copy';

    /** The merged copy: defaults with saved overrides, without hidden sections. */
    public static function all(): array
    {
        $rows = self::rows();
        $out = [];
        foreach (self::defaults() as $section => $default) {
            $row = $rows[$section] ?? null;
            if ($row && ! $row['visible']) {
                continue;
            }
            $out[$section] = self::merge($section, $default, $row['overrides'] ?? []);
        }

        return $out;
    }

    /** One section, merged (null when hidden or unknown). */
    public static function section(string $section): mixed
    {
        return self::all()[$section] ?? null;
    }

    /**
     * Every section for the admin: key, label, visible, and its editable
     * fields (path, label, default, saved value, multiline).
     */
    public static function editable(): array
    {
        $rows = self::rows();

        return collect(self::defaults())->map(function ($default, $section) use ($rows) {
            $overrides = $rows[$section]['overrides'] ?? [];
            $fields = [];
            foreach (self::textLeaves(is_array($default) ? $default : [], '') as $path => $text) {
                $fields[] = [
                    'path' => $path,
                    'label' => self::label($path),
                    'default' => $text,
                    'value' => $overrides[$path] ?? null,
                    'multiline' => mb_strlen($text) > 70 || str_contains($text, "\n"),
                ];
            }

            return [
                'key' => $section,
                'label' => self::label((string) $section),
                'visible' => $rows[$section]['visible'] ?? true,
                'fields' => $fields,
            ];
        })->values()->all();
    }

    /**
     * Save a section: overrides is path => text (an empty text clears that
     * override); visible switches the section. Paths that aren't text in
     * the defaults are refused.
     */
    public static function save(string $section, array $overrides = [], ?bool $visible = null, ?int $userId = null): void
    {
        $default = self::defaults()[$section] ?? null;
        if ($default === null) {
            throw new InvalidArgumentException("'{$section}' is not a section of the page copy.");
        }
        $allowed = self::textLeaves(is_array($default) ? $default : [], '');
        $unknown = array_diff(array_keys($overrides), array_keys($allowed));
        if ($unknown) {
            throw new InvalidArgumentException('Not editable text: '.implode(', ', $unknown));
        }

        $row = self::rows()[$section] ?? null;
        $merged = array_filter(
            array_merge($row['overrides'] ?? [], $overrides),
            fn ($text) => is_string($text) && trim($text) !== '',
        );
        $values = [
            'overrides' => $merged ? json_encode($merged) : null,
            'visible' => $visible ?? ($row['visible'] ?? true),
            'updated_by' => $userId,
            'updated_at' => now(),
        ];
        $where = ['workspace_id' => self::workspaceId(), 'section' => $section];

        if ($row) {
            self::query()->where('section', $section)->update($values);
        } else {
            DB::table(self::TABLE)->insert($where + $values + ['created_at' => now()]);
        }
    }

    /** Back to the defaults: overrides cleared, the section shown. */
    public static function reset(string $section): void
    {
        self::query()->where('section', $section)->delete();
    }

    /** The default copy, from the config tree okjt.page_copy.config names. */
    public static function defaults(): array
    {
        $key = config('okjt.page_copy.config');

        return $key ? (array) config($key, []) : [];
    }

    /** String leaves of a tree by dot path, skipping structural keys and what's under them. */
    public static function textLeaves(array $tree, string $prefix): array
    {
        $structural = (array) config('okjt.page_copy.structural', []);
        $leaves = [];
        foreach ($tree as $key => $value) {
            if (in_array((string) $key, $structural, true)) {
                continue;
            }
            $path = $prefix === '' ? (string) $key : "{$prefix}.{$key}";
            if (is_array($value)) {
                $leaves += self::textLeaves($value, $path);
            } elseif (is_string($value)) {
                $leaves[$path] = $value;
            }
        }

        return $leaves;
    }

    private static function merge(string $section, mixed $default, array $overrides): mixed
    {
        if (! is_array($default)) {
            return $default;
        }
        foreach (self::textLeaves($default, '') as $path => $text) {
            $value = $overrides[$path] ?? null;
            if (is_string($value) && trim($value) !== '') {
                Arr::set($default, $path, $value);
            }
        }

        return $default;
    }

    /** "faq.items.2.q" → "Faq › items › #3 › question". */
    private static function label(string $path): string
    {
        $words = array_map(fn ($segment) => ctype_digit($segment)
            ? '#'.((int) $segment + 1)
            : match ($segment) { 'q' => 'question', 'a' => 'answer', 'cta' => 'call to action', default => str_replace(['_', '-'], ' ', $segment) },
            explode('.', $path));

        return Str::ucfirst(implode(' › ', $words));
    }

    private static function workspaceId(): ?int
    {
        return config('okjt.page_copy.per_workspace') ? CurrentWorkspace::id() : null;
    }

    private static function query()
    {
        $id = self::workspaceId();

        return DB::table(self::TABLE)->when($id === null, fn ($q) => $q->whereNull('workspace_id'), fn ($q) => $q->where('workspace_id', $id));
    }

    /** section => [overrides, visible]. Before the migration has run, none. */
    private static function rows(): array
    {
        try {
            return self::query()->get(['section', 'overrides', 'visible'])->mapWithKeys(fn ($row) => [$row->section => [
                'overrides' => $row->overrides ? (array) json_decode($row->overrides, true) : [],
                'visible' => (bool) $row->visible,
            ]])->all();
        } catch (QueryException) {
            return [];
        }
    }
}
