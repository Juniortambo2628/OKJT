<?php

namespace Database\Seeders;

use App\Models\Pillar;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class PillarSeeder extends Seeder
{
    public function run(): void
    {
        $pillars = [
            [
                'title' => 'Design',
                'overview' => 'Design first. Function always.',
                'content' => '<p>Simple, purposeful interfaces. Absolutely breathtaking interfaces. Unique and not bound by templates.</p>',
                'icon' => 'Palette',
                'is_active' => true,
            ],
            [
                'title' => 'Style',
                'overview' => 'Smart, stylish, purposeful.',
                'content' => '<p>Aesthetic clarity that supports goals. Every pixel has a purpose.</p>',
                'icon' => 'Sparkles',
                'is_active' => true,
            ],
            [
                'title' => 'Human-centered UX',
                'overview' => 'Interactive systems Guided by empathy and behavior.',
                'content' => '<p>User experience (UX) rooted in human behavior, ensuring digital products are intuitive and accessible.</p>',
                'icon' => 'Users',
                'is_active' => true,
            ],
            [
                'title' => 'Speed',
                'overview' => 'Fast, responsive, accessible.',
                'content' => '<p>Performance and accessibility first. We build for speed because time is weight.</p>',
                'icon' => 'Zap',
                'is_active' => true,
            ],
            [
                'title' => 'Deploy',
                'overview' => 'From idea to launch.',
                'content' => '<p>From code to production with confidence. Streamlined workflows and reliable infrastructure.</p>',
                'icon' => 'Rocket',
                'is_active' => true,
            ],
            [
                'title' => 'Scale',
                'overview' => 'Built to scale.',
                'content' => '<p>Architecture designed for growth. Future-proof solutions that expand with your vision.</p>',
                'icon' => 'TrendingUp',
                'is_active' => true,
            ],
        ];

        // Truncate existing pillars
        Pillar::truncate();

        foreach ($pillars as $pillar) {
            Pillar::create([
                'title' => $pillar['title'],
                'slug' => Str::slug($pillar['title']),
                'overview' => $pillar['overview'],
                'content' => $pillar['content'],
                'icon' => $pillar['icon'],
                'is_active' => $pillar['is_active'],
            ]);
        }
    }
}
