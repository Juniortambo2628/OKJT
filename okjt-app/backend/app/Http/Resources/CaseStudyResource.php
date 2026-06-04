<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CaseStudyResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'slug' => $this->slug,
            'client_name' => $this->client_name,
            'category' => $this->category,
            'technologies' => $this->technologies,
            'description' => $this->description,
            'significant_figure' => $this->significant_figure,
            'problem' => $this->problem,
            'methodology' => $this->methodology,
            'outcome' => $this->outcome,
            'testimonial_quote' => $this->testimonial_quote,
            'testimonial_author' => $this->testimonial_author,
            'image' => $this->image,
            'gallery' => $this->gallery,
            'website_url' => $this->website_url,
            'is_featured' => (bool) $this->is_featured,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
