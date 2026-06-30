<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProjectResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'type' => $this->type,
            'title' => $this->title,
            'slug' => $this->slug,
            'client_name' => $this->client_name,
            'tagline' => $this->tagline,
            'category' => $this->category,
            'technologies' => $this->technologies,
            'significant_figure' => $this->significant_figure,
            'description' => $this->description,
            'problem' => $this->problem,
            'methodology' => $this->methodology,
            'outcome' => $this->outcome,
            'testimonial_quote' => $this->testimonial_quote,
            'testimonial_author' => $this->testimonial_author,
            'image' => $this->image,
            'gallery' => $this->gallery,
            'url' => $this->url,
            'is_active' => (bool) $this->is_active,
            'is_featured' => (bool) $this->is_featured,
            'order' => $this->order,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
