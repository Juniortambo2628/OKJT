<?php

namespace Database\Seeders;

use App\Models\Value;
use Illuminate\Database\Seeder;

class ValueSeeder extends Seeder
{
    public function run(): void
    {
        $values = [
            [
                'icon' => 'Palette',
                'title' => 'Design First',
                'description' => 'We believe aesthetics and utility are inseparable. Stunning designs elevate brand value and drive user adoption.',
                'order' => 1,
            ],
            [
                'icon' => 'Cpu',
                'title' => 'Rigorously Engineered',
                'description' => 'Code quality and architectural integrity are our foundations. We build performant, maintainable, and secure platforms.',
                'order' => 2,
            ],
            [
                'icon' => 'Users',
                'title' => 'Human-Centered',
                'description' => 'Every flow and interaction is designed with user empathy, aligning business goals with intuitive user behaviors.',
                'order' => 3,
            ],
            [
                'icon' => 'TrendingUp',
                'title' => 'Value Driven',
                'description' => 'We align technology investments directly with business growth, ensuring clear KPIs and high return on investment.',
                'order' => 4,
            ],
        ];

        Value::truncate();

        foreach ($values as $val) {
            Value::create($val);
        }
    }
}
