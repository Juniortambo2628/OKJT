<?php

namespace App\Observers;

use App\Services\RevalidationService;

class CmsModelObserver
{
    protected RevalidationService $revalidation;

    public function __construct(RevalidationService $revalidation)
    {
        $this->revalidation = $revalidation;
    }

    public function created(): void
    {
        $this->revalidation->revalidateAll();
    }

    public function updated(): void
    {
        $this->revalidation->revalidateAll();
    }

    public function deleted(): void
    {
        $this->revalidation->revalidateAll();
    }
}
