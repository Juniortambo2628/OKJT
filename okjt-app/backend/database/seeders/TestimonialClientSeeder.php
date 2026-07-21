<?php

namespace Database\Seeders;

use App\Models\Client;
use App\Models\Testimonial;
use Illuminate\Database\Seeder;

class TestimonialClientSeeder extends Seeder
{
    public function run(): void
    {
        // Testimonials
        $testimonials = [
            [
                'name' => 'Dr. Jane M.',
                'role' => 'Medical Director',
                'company' => 'Nyalife Women\'s Health Clinic',
                'quote' => 'OKJTech transformed our patient onboarding process. The custom Hospital Management System and clinic website have streamlined our file management and improved doctor-patient interactions significantly.',
                'rating' => 5,
                'is_featured' => true,
                'order' => 1,
            ],
            [
                'name' => 'Michael Gitonga',
                'role' => 'Managing Partner',
                'company' => 'Dickson Gitonga Advocates',
                'quote' => 'The Admin Dashboard featuring Kenya Law integration and automated cause lists is exactly what our law firm needed. An incredibly intuitive and responsive platform.',
                'rating' => 5,
                'is_featured' => true,
                'order' => 2,
            ],
            [
                'name' => 'Linda K.',
                'role' => 'Director',
                'company' => 'Africa Law Tech Festival',
                'quote' => 'The events web application was flawless. Live updates and push notifications kept all our attendees informed. They executed our complex registration flow perfectly.',
                'rating' => 5,
                'is_featured' => true,
                'order' => 3,
            ],
            [
                'name' => 'Ahmed R.',
                'role' => 'Operations Manager',
                'company' => 'SouthRing Autos',
                'quote' => 'An integrated garage system that transformed our client relationships. From online bookings to automated service reminders and digital documentation, OKJTech delivered beyond our expectations.',
                'rating' => 5,
                'is_featured' => true,
                'order' => 4,
            ],
            [
                'name' => 'Sarah O.',
                'role' => 'Founder',
                'company' => 'Mizizi Juices',
                'quote' => 'The E-Commerce dashboard has made order tracking and analytical insights seamless. We precisely track popular locations and customer preferences now.',
                'rating' => 5,
                'is_featured' => true,
                'order' => 5,
            ],
        ];

        foreach ($testimonials as $t) {
            Testimonial::updateOrCreate(['name' => $t['name']], $t);
        }

        // Client logos (Text placeholders for frontend logic, but using actual portfolio names)
        $clients = [
            ['name' => 'Lawyers Hub', 'order' => 1],
            ['name' => 'Nyalife Clinic', 'order' => 2],
            ['name' => 'SouthRing Autos', 'order' => 3],
            ['name' => 'Dickson Gitonga Advocates', 'order' => 4],
            ['name' => 'Global Harmony Initiative', 'order' => 5],
            ['name' => 'Wisdom Capital', 'order' => 6],
            ['name' => 'Reytati Communications', 'order' => 7],
            ['name' => 'TAMCON Consulting', 'order' => 8],
            ['name' => 'Mizizi Juices', 'order' => 9],
            ['name' => 'Tena Platform', 'order' => 10],
        ];

        foreach ($clients as $c) {
            $c['is_active'] = true;
            Client::updateOrCreate(['name' => $c['name']], $c);
        }
    }
}
