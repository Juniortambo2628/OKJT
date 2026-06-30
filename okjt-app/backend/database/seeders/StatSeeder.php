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
                'icon' => 'Rocket',
                'order' => 1,
            ],
            [
                'label' => 'Team Experience',
                'value' => '8+ Years',
                'icon' => 'Briefcase',
                'order' => 2,
            ],
            [
                'label' => 'System Uptime',
                'value' => '99.99%',
                'icon' => 'Cpu',
                'order' => 3,
            ],
            [
                'label' => 'Client Satisfaction',
                'value' => '100%',
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
