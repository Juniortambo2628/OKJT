<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('projects', function (Blueprint $table) {
            $table->id();
            $table->string('type')->default('client');
            $table->string('title');
            $table->string('slug')->unique();
            $table->string('client_name')->nullable();
            $table->string('tagline')->nullable();
            $table->string('category')->nullable();
            $table->json('technologies')->nullable();
            $table->string('significant_figure')->nullable();
            $table->text('description')->nullable();
            $table->text('problem')->nullable();
            $table->text('methodology')->nullable();
            $table->text('outcome')->nullable();
            $table->text('testimonial_quote')->nullable();
            $table->string('testimonial_author')->nullable();
            $table->string('image')->nullable();
            $table->json('gallery')->nullable();
            $table->string('website_url')->nullable();
            $table->string('url')->nullable();
            $table->boolean('is_active')->default(true);
            $table->boolean('is_featured')->default(false);
            $table->integer('order')->default(0);
            $table->timestamps();

            $table->index('type');
            $table->index('is_active');
            $table->index('is_featured');
            $table->index('category');
        });

        // Migrate case_studies data
        $caseStudies = DB::table('case_studies')->get();
        foreach ($caseStudies as $cs) {
            DB::table('projects')->insert([
                'type' => 'client',
                'title' => $cs->title,
                'slug' => $cs->slug,
                'client_name' => $cs->client_name,
                'category' => $cs->category ?? null,
                'technologies' => $cs->technologies ? ($cs->technologies) : null,
                'significant_figure' => $cs->significant_figure ?? null,
                'description' => $cs->description ?? null,
                'problem' => $cs->problem ?? null,
                'methodology' => $cs->methodology ?? null,
                'outcome' => $cs->outcome ?? null,
                'testimonial_quote' => $cs->testimonial_quote ?? null,
                'testimonial_author' => $cs->testimonial_author ?? null,
                'image' => $cs->image ?? null,
                'gallery' => $cs->gallery ? ($cs->gallery) : null,
                'website_url' => $cs->website_url ?? null,
                'is_active' => true,
                'is_featured' => $cs->is_featured ?? false,
                'order' => 0,
                'created_at' => $cs->created_at,
                'updated_at' => $cs->updated_at,
            ]);
        }

        // Migrate innovations data
        $innovations = DB::table('innovations')->get();
        foreach ($innovations as $inn) {
            DB::table('projects')->insert([
                'type' => 'flagship',
                'title' => $inn->title,
                'slug' => $inn->slug,
                'tagline' => $inn->tagline ?? null,
                'category' => $inn->category ?? null,
                'technologies' => $inn->technologies ? ($inn->technologies) : null,
                'significant_figure' => $inn->significant_figure ?? null,
                'description' => $inn->description ?? null,
                'problem' => $inn->problem ?? null,
                'methodology' => $inn->methodology ?? null,
                'outcome' => $inn->outcome ?? null,
                'testimonial_quote' => $inn->testimonial_quote ?? null,
                'testimonial_author' => $inn->testimonial_author ?? null,
                'image' => $inn->image ?? null,
                'gallery' => $inn->gallery ? ($inn->gallery) : null,
                'url' => $inn->url ?? null,
                'is_active' => $inn->is_active ?? true,
                'is_featured' => $inn->is_featured ?? false,
                'order' => $inn->order ?? 0,
                'created_at' => $inn->created_at,
                'updated_at' => $inn->updated_at,
            ]);
        }

        Schema::dropIfExists('case_studies');
        Schema::dropIfExists('innovations');
    }

    public function down(): void
    {
        Schema::create('case_studies', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('slug')->unique();
            $table->string('client_name')->nullable();
            $table->string('category')->nullable();
            $table->json('technologies')->nullable();
            $table->text('description')->nullable();
            $table->string('significant_figure')->nullable();
            $table->text('problem')->nullable();
            $table->text('methodology')->nullable();
            $table->text('outcome')->nullable();
            $table->text('testimonial_quote')->nullable();
            $table->string('testimonial_author')->nullable();
            $table->string('image')->nullable();
            $table->json('gallery')->nullable();
            $table->string('website_url')->nullable();
            $table->boolean('is_featured')->default(false);
            $table->timestamps();
        });

        Schema::create('innovations', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('slug')->unique();
            $table->string('tagline')->nullable();
            $table->text('description')->nullable();
            $table->string('image')->nullable();
            $table->string('url')->nullable();
            $table->string('category')->nullable();
            $table->json('technologies')->nullable();
            $table->string('significant_figure')->nullable();
            $table->text('problem')->nullable();
            $table->text('methodology')->nullable();
            $table->text('outcome')->nullable();
            $table->text('testimonial_quote')->nullable();
            $table->string('testimonial_author')->nullable();
            $table->json('gallery')->nullable();
            $table->boolean('is_active')->default(true);
            $table->boolean('is_featured')->default(false);
            $table->integer('order')->default(0);
            $table->timestamps();
        });

        // Migrate data back
        $caseStudies = DB::table('projects')->where('type', 'client')->get();
        foreach ($caseStudies as $cs) {
            DB::table('case_studies')->insert([
                'id' => $cs->id,
                'title' => $cs->title,
                'slug' => $cs->slug,
                'client_name' => $cs->client_name,
                'significant_figure' => $cs->significant_figure,
                'category' => $cs->category,
                'technologies' => $cs->technologies,
                'description' => $cs->description,
                'problem' => $cs->problem,
                'methodology' => $cs->methodology,
                'outcome' => $cs->outcome,
                'testimonial_quote' => $cs->testimonial_quote,
                'testimonial_author' => $cs->testimonial_author,
                'image' => $cs->image,
                'gallery' => $cs->gallery,
                'website_url' => $cs->website_url,
                'is_featured' => $cs->is_featured,
                'created_at' => $cs->created_at,
                'updated_at' => $cs->updated_at,
            ]);
        }

        $innovations = DB::table('projects')->where('type', 'flagship')->get();
        foreach ($innovations as $inn) {
            DB::table('innovations')->insert([
                'id' => $inn->id,
                'title' => $inn->title,
                'slug' => $inn->slug,
                'tagline' => $inn->tagline,
                'description' => $inn->description,
                'image' => $inn->image,
                'url' => $inn->url,
                'is_active' => $inn->is_active,
                'is_featured' => $inn->is_featured,
                'order' => $inn->order,
                'category' => $inn->category,
                'technologies' => $inn->technologies,
                'significant_figure' => $inn->significant_figure,
                'problem' => $inn->problem,
                'methodology' => $inn->methodology,
                'outcome' => $inn->outcome,
                'testimonial_quote' => $inn->testimonial_quote,
                'testimonial_author' => $inn->testimonial_author,
                'gallery' => $inn->gallery,
                'created_at' => $inn->created_at,
                'updated_at' => $inn->updated_at,
            ]);
        }

        Schema::dropIfExists('projects');
    }
};
