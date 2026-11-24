<?php

namespace Okjt\Kit\Revisions;

/**
 * Keeps a version history of the model in `revisions` (see Revision, or the
 * subclass named in okjt.revisions.model), which powers the dashboard's
 * "Version history" panel and the sidebar "new" badges.
 *
 * Models set `protected string $revisionModule` to the dashboard module
 * (sidebar key) they belong to, and may override revisionModule() /
 * revisionLabel() / revisionIgnored().
 */
trait RecordsRevisions
{
    public static function bootRecordsRevisions(): void
    {
        $revision = config('okjt.revisions.model', Revision::class);
        static::created(fn ($model) => $revision::record($model, 'created'));
        static::updated(fn ($model) => $revision::record($model, 'updated'));
        static::deleted(fn ($model) => $revision::record($model, 'deleted'));
        // Soft-deletable models: undeleting (e.g. "Undo" after a delete) is a version too.
        if (method_exists(static::class, 'restored')) {
            static::restored(fn ($model) => $revision::isRestoring() ? null : $revision::record($model, 'restored'));
        }
    }

    /** @param  array<int, string>  $changed  attributes changed by this update */
    public function revisionModule(array $changed = []): string
    {
        return property_exists($this, 'revisionModule') ? $this->revisionModule : 'general';
    }

    /** Human name of the record for the history list. */
    public function revisionLabel(): string
    {
        foreach (['name', 'title', 'question', 'section_key', 'key', 'caption', 'subject'] as $attribute) {
            if (filled($this->getAttribute($attribute))) {
                return (string) $this->getAttribute($attribute);
            }
        }

        return class_basename($this).' #'.$this->getKey();
    }

    /** Attributes whose changes alone don't warrant a new version. */
    public function revisionIgnored(): array
    {
        return [];
    }
}
