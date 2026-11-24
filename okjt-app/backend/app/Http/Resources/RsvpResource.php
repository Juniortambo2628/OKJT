<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class RsvpResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'company' => $this->company,
            'job_title' => $this->job_title,
            'sector' => $this->sector,
            'interest' => $this->interest,
            'consent' => (bool) $this->consent,
            'newsletter' => (bool) $this->newsletter,
            'type' => $this->type,
            'attendance' => $this->attendance,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
