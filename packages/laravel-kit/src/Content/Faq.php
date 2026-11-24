<?php

namespace Okjt\Kit\Content;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Okjt\Kit\Revisions\RecordsRevisions;
use Okjt\Kit\Workspace\CurrentWorkspace;

/**
 * A question and its answer, lifted from Naoa (App\Models\Faq): ordered, in
 * the version history (module 'faqs'), and per workspace when
 * okjt.faqs.per_workspace is on (Naoa's weddings). `group` keeps several
 * lists apart, one per page (Tena-host's pricing and home FAQs).
 */
class Faq extends Model
{
    use RecordsRevisions;

    protected string $revisionModule = 'faqs';

    protected $fillable = ['question', 'answer', 'order', 'group'];

    protected $casts = ['order' => 'integer'];

    public function getTable(): string
    {
        return config('okjt.faqs.table', 'faqs');
    }

    protected static function booted(): void
    {
        static::addGlobalScope('workspace', function (Builder $query) {
            if (config('okjt.faqs.per_workspace') && ($id = CurrentWorkspace::id())) {
                $query->where($query->getModel()->qualifyColumn(CurrentWorkspace::column()), $id);
            }
        });
        static::creating(function (Faq $faq) {
            $column = CurrentWorkspace::column();
            if (config('okjt.faqs.per_workspace') && empty($faq->{$column}) && ($id = CurrentWorkspace::id())) {
                $faq->{$column} = $id;
            }
        });
    }

    public function scopeInGroup(Builder $query, ?string $group): Builder
    {
        return $group === null ? $query : $query->where('group', $group);
    }

    public function present(): array
    {
        return ['id' => $this->id, 'question' => $this->question, 'answer' => $this->answer, 'order' => $this->order, 'group' => $this->group];
    }
}
