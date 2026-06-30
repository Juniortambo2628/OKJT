<?php

namespace Database\Seeders;

use App\Models\TeamMember;
use Illuminate\Database\Seeder;

class TeamMemberSeeder extends Seeder
{
    public function run(): void
    {
        $members = [
            [
                'name' => 'Kevin Tambo',
                'role' => 'Founder & Principal Engineer',
                'bio' => 'Full-stack software architect specializing in Laravel, Next.js, and high-performance cloud applications. Leads engineering and strategy.',
                'qualifications' => 'BSc. Computer Science',
                'linkedin' => 'https://linkedin.com/in/kevintambo',
                'image' => '/assets/images/team/kevin.png',
                'order' => 1,
            ],
            [
                'name' => 'Eluid Kibet',
                'role' => 'Lead UI/UX Designer',
                'bio' => 'Digital product designer with a passion for minimal, functional interfaces and interactive design systems.',
                'qualifications' => 'BA. Interaction Design',
                'linkedin' => 'https://linkedin.com/in/eluidkibet',
                'image' => '/assets/images/team/eluid.png',
                'order' => 2,
            ],
            [
                'name' => 'Brenda Wanjiku',
                'role' => 'Senior Frontend Developer',
                'bio' => 'Next.js and Tailwind CSS expert focused on accessibility, semantic web standards, and flawless animations.',
                'qualifications' => 'BSc. Software Engineering',
                'linkedin' => 'https://linkedin.com/in/brendawanjiku',
                'image' => '/assets/images/team/brenda.png',
                'order' => 3,
            ],
        ];

        TeamMember::truncate();

        foreach ($members as $member) {
            TeamMember::create($member);
        }
    }
}
