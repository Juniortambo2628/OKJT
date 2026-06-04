<?php

namespace Database\Seeders;

use App\Models\CaseStudy;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class CaseStudySeeder extends Seeder
{
    public function run(): void
    {
        $projects = [
            [
                'title' => 'Reytati Communications Agency Website',
                'client_name' => 'Reytati Communications',
                'problem' => 'Needed a one-page interactive information website to showcase agency services. The design included a dynamic work profile appended on the landing page for clients.',
                'image' => '/assets/images/uiux-design.png',
                'is_featured' => true,
            ],
            [
                'title' => 'Mizizi Juices E-Commerce ecosystem',
                'client_name' => 'Mizizi Juices',
                'problem' => 'Streamlining the ordering and payment process of juice bottles. Co-created with an admin panel equipped with tools to track orders, payments, feedback, analytics, and popular locations.',
                'image' => '/assets/images/custom-webdev.png',
                'is_featured' => true,
            ],
            [
                'title' => 'The Football Experience',
                'client_name' => 'TFE',
                'problem' => 'A comprehensive platform providing avenues through which Africans can attend global sporting events more accessibly through interactive dashboards, social feeds, virtual wallets, and financing.',
                'image' => '/assets/images/digital-strategy.png',
                'is_featured' => false,
            ],
            [
                'title' => 'Wisdom Capital E-Commerce',
                'client_name' => 'Wisdom Capital',
                'problem' => 'An E-Commerce platform that connects customers to Wisdom Capital products through online orders and bookings for deliveries featuring automated emails for confirmations and order updates.',
                'image' => '/assets/images/custom-webdev.png',
                'is_featured' => true,
            ],
            [
                'title' => 'Global Harmony Initiative NGO',
                'client_name' => 'Global Harmony Initiative',
                'problem' => 'A dynamic NGO website that details the work and impactfulness of their mission managed by an interconnected real-time admin dashboard using AJAX for continuous smooth user experience.',
                'image' => '/assets/images/uiux-design.png',
                'is_featured' => false,
            ],
            [
                'title' => 'Tena Platform Architecture',
                'client_name' => 'Tena',
                'problem' => 'An information website detailing the Tena product, complemented by a dynamic PHP application dashboard tracking user registrations, insights and analytics using real-time JS graphs.',
                'image' => '/assets/images/digital-strategy.png',
                'is_featured' => false,
            ],
        ];

        foreach ($projects as $project) {
            CaseStudy::updateOrCreate([
                'slug' => Str::slug($project['title'])
            ], [
                'title' => $project['title'],
                'client_name' => $project['client_name'],
                'problem' => $project['problem'],
                'image' => $project['image'],
                'is_featured' => $project['is_featured'],
            ]);
        }
    }
}
