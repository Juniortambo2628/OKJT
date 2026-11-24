<?php

namespace Okjt\Kit\Tests\Fixtures;

use Illuminate\Database\Eloquent\Model;
use Okjt\Kit\Revisions\RecordsRevisions;
use Okjt\Kit\Workspace\BelongsToWorkspace;

class Note extends Model
{
    use BelongsToWorkspace, RecordsRevisions;

    protected $guarded = [];

    protected string $revisionModule = 'notes';
}
