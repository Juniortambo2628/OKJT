<?php

use App\Models\Project;
use Illuminate\Database\Migrations\Migration;

/**
 * Rewrite project documentation into a third-person, project-centric voice.
 *
 * The public "Scope" card renders `problem` as the Challenge and `outcome` as
 * the Solution. Both stay grounded in what the project does, not who built it.
 * We ship the exact copy the studio owner supplied for Najenga; other flagship
 * projects get a lighter first-person → third-person sweep so nothing on the
 * live site still says "We built…" until it's re-authored properly.
 */
return new class extends Migration
{
    public function up(): void
    {
        // Full rewrite the owner supplied for Najenga.
        $najenga = [
            'description' => 'Najenga is a construction-project coordination platform used by site engineers, architects, project managers and clients to centralise drawings, budgets, timelines and conversations in one place.',
            'problem' => '<p>The project addresses challenges in construction management such as decentralised documentation, unstructured accounting and limited collaboration opportunities during construction projects, leading to mismanagement of funds or timeline delays among other challenges.</p>',
            'methodology' => '<p>Najenga is engineered as a single collaboration surface for construction teams: an annotated drawings workspace, a shared expense ledger, a project timeline and a chat with @mentions — all tied back to the same project record.</p>',
            'outcome' => '<p>Najenga features a project gallery, expense ledger matched directly with digital receipts for reference and accountability, as well as project collaboration capabilities such as image / document annotation to support comments on progress for engineers, architects, clients and project managers. The consolidated information informs decisions and continuous data will then be used to manage time and propose adjusted timelines, as well as give future cost predictions of other construction projects taking into consideration the materials, scope / size of the project and transport costs based on the location of the project using historical information as an informed datapoint.</p>',
        ];

        Project::where('slug', 'like', 'najenga%')->update($najenga);

        // Sweep all remaining projects into third-person voice. Patterns are
        // applied on the raw HTML strings — order matters (longer matches first)
        // so "We designed" flips before "We".
        $swaps = [
            'We architected' => 'The project is architected',
            'We engineered' => 'The project is engineered',
            'We implemented' => 'The project implements',
            'We designed' => 'The project is designed',
            'We built' => 'The project was built',
            'We formulated' => 'The project formulates',
            'We managed' => 'The project manages',
            'We optimized' => 'The project optimises',
            'We wrote' => 'The project ships',
            'I architected' => 'The project is architected',
            'I engineered' => 'The project is engineered',
            'I implemented' => 'The project implements',
            'I designed' => 'The project is designed',
            'I built' => 'The project was built',
            'I centralized' => 'The project centralises',
            'we ' => 'the project ',
            ' I ' => ' the project ',
        ];

        $columns = ['description', 'problem', 'methodology', 'outcome'];
        Project::query()
            ->where('slug', 'not like', 'najenga%')
            ->chunkById(100, function ($projects) use ($columns, $swaps) {
                foreach ($projects as $project) {
                    $dirty = false;
                    foreach ($columns as $col) {
                        $value = $project->{$col};
                        if (! is_string($value) || $value === '') {
                            continue;
                        }
                        $updated = strtr($value, $swaps);
                        if ($updated !== $value) {
                            $project->{$col} = $updated;
                            $dirty = true;
                        }
                    }
                    if ($dirty) {
                        $project->save();
                    }
                }
            });
    }

    public function down(): void
    {
        // Copy rewrites are not reversible — leave the improved copy in place
        // rather than reintroducing the first-person drafts.
    }
};
