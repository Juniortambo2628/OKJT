<?php

namespace Database\Seeders;

use App\Models\ConsultationRequest;
use App\Models\PageView;
use App\Models\Rsvp;
use App\Models\Subscriber;
use Illuminate\Database\Seeder;

class AnalyticsDataSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Seed Consultation Requests
        ConsultationRequest::truncate();
        $requests = [
            [
                'first_name' => 'Alice',
                'last_name' => 'Mwangi',
                'email' => 'alice@lawyershub.org',
                'subject' => 'Legal Tech Platform Refactor',
                'message' => 'We want to migrate our existing registration flow to a modern, robust Next.js frontend with Laravel API integration.',
                'status' => 'pending',
                'created_at' => now()->subDays(1),
            ],
            [
                'first_name' => 'John',
                'last_name' => 'Kiprop',
                'email' => 'john.k@wisdomcapital.co.ke',
                'subject' => 'Investment Portal Design Systems',
                'message' => 'Looking to build a unified design system and high-fidelity wireframes for our upcoming portal redesign.',
                'status' => 'contacted',
                'created_at' => now()->subDays(3),
            ],
            [
                'first_name' => 'Mercy',
                'last_name' => 'Ochieng',
                'email' => 'mercy@southringautos.com',
                'subject' => 'Integrated Garage App Support',
                'message' => 'Need additional integration support for M-Pesa automated billing within the client dashboard.',
                'status' => 'resolved',
                'created_at' => now()->subDays(7),
            ],
        ];
        foreach ($requests as $r) {
            ConsultationRequest::create($r);
        }

        // 2. Seed RSVPs
        Rsvp::truncate();
        $rsvps = [
            [
                'name' => 'James Kamau',
                'email' => 'james.kamau@reytati.com',
                'company' => 'Reytati Communications',
                'job_title' => 'CTO',
                'sector' => 'Telecom',
                'interest' => 'Custom Web Apps',
                'consent' => true,
                'newsletter' => true,
                'attendance' => 'virtual',
                'type' => 'early_access',
                'created_at' => now()->subDays(2),
            ],
            [
                'name' => 'Fatima Ibrahim',
                'email' => 'fatima@tamcon.com',
                'company' => 'TAMCON Consulting',
                'job_title' => 'Managing Director',
                'sector' => 'Advisory',
                'interest' => 'UI/UX Audits',
                'consent' => true,
                'newsletter' => false,
                'attendance' => 'in_person',
                'type' => 'rsvp',
                'created_at' => now()->subDays(4),
            ],
        ];
        foreach ($rsvps as $rsvp) {
            Rsvp::create($rsvp);
        }

        // 3. Seed Subscribers
        Subscriber::truncate();
        $subscribers = [
            ['email' => 'tech-updates@gmail.com', 'name' => 'Martin G.', 'source' => 'footer', 'is_active' => true],
            ['email' => 'newsletter@firm.com', 'name' => 'Sarah L.', 'source' => 'insights-page', 'is_active' => true],
        ];
        foreach ($subscribers as $s) {
            Subscriber::create($s);
        }

        // 4. Seed Page Views for Analytics graph
        PageView::truncate();
        for ($i = 30; $i >= 0; $i--) {
            PageView::create([
                'path' => '/',
                'ip' => '127.0.0.1',
                'user_agent' => 'Mozilla/5.0',
                'created_at' => now()->subDays($i)->setHour(rand(8, 20)),
            ]);
            PageView::create([
                'path' => '/services',
                'ip' => '127.0.0.1',
                'user_agent' => 'Mozilla/5.0',
                'created_at' => now()->subDays($i)->setHour(rand(8, 20)),
            ]);
            PageView::create([
                'path' => '/projects',
                'ip' => '127.0.0.1',
                'user_agent' => 'Mozilla/5.0',
                'created_at' => now()->subDays($i)->setHour(rand(8, 20)),
            ]);
        }
    }
}
