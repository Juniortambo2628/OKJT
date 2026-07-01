<?php

namespace Database\Seeders;

use App\Models\Stat;
use Illuminate\Database\Seeder;

class StatSeeder extends Seeder
{
    public function run(): void
    {
        $stats = [
            [
                'label' => 'Successful Launches',
                'value' => '40+',
                'description' => 'Projects delivered across web, mobile, and digital strategy',
                'icon' => 'Rocket',
                'order' => 1,
            ],
            [
                'label' => 'Team Experience',
                'value' => '8+ Years',
                'description' => 'Combined expertise in engineering, design, and consulting',
                'icon' => 'Briefcase',
                'order' => 2,
            ],
            [
                'label' => 'System Uptime',
                'value' => '99.99%',
                'description' => 'Infrastructure reliability across all client deployments',
                'icon' => 'Cpu',
                'order' => 3,
            ],
            [
                'label' => 'Client Satisfaction',
                'value' => '100%',
                'description' => 'Positive feedback from every engagement',
                'icon' => 'Heart',
                'order' => 4,
            ],
        ];

        Stat::truncate();

        foreach ($stats as $stat) {
            Stat::create($stat);
        }
    }
}
