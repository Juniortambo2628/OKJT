<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Insight;
use App\Models\CaseStudy;
use App\Models\TeamMember;
use App\Models\Innovation;

class ContentSeeder extends Seeder
{
    public function run(): void
    {
        $insights = [
            [
                'title' => 'Building High-Performance Next.js Applications in 2026',
                'slug' => 'building-high-performance-nextjs',
                'category' => 'Web Engineering',
                'excerpt' => 'A deep dive into server components, static generation, and advanced caching strategies for lightning-fast web applications.',
                'content' => '<p>In modern web development, speed is critical. Our engineering team explores the architecture behind high-performance React and Next.js applications...</p>',
                'image' => '/assets/images/custom-webdev.png',
                'is_published' => true,
                'published_at' => '2026-03-15',
            ],
            [
                'title' => 'The Future of UI/UX: Beyond Flat Design',
                'slug' => 'future-ui-ux-design',
                'category' => 'UI/UX Design',
                'excerpt' => 'Exploring immersive glassmorphism, dynamic animations, and user-centric flows that drive 3x more conversions.',
                'content' => '<p>Modern users demand more than just functional interfaces. They demand interactive, breathing designs. Our UI/UX team breaks down the components of an award-winning design system...</p>',
                'image' => '/assets/images/uiux-design.png',
                'is_published' => true,
                'published_at' => '2026-03-10',
            ]
        ];
        foreach ($insights as $data) {
            $data['user_id'] = 1;
            Insight::updateOrCreate(['slug' => $data['slug']], $data);
        }

        $innovations = [
            [
                'title' => 'Tibu: Market Intelligence & Policy Sandbox',
                'slug' => 'tibu-policy-sandbox',
                'tagline' => 'Bridging the gap between tech and policy.',
                'category' => 'LegalTech & Policy',
                'technologies' => ['Next.js', 'PostgreSQL', 'DeepSeek AI', 'Tailwind'],
                'description' => '<p>Tibu is OKJTech\'s proprietary market intelligence platform designed for the African digital ecosystem. It facilitates real-time policy analysis and stakeholder engagement.</p>',
                'significant_figure' => '100% Policy Visibility',
                'problem' => '<p>Digital entrepreneurs and policymakers often work in silos, leading to regulatory friction. There was no centralized repository for real-time digital policy tracking across varied jurisdictions.</p>',
                'methodology' => '<p>We architected Tibu using a vector-database approach to index regulatory documents. We implemented a clean, dashboard-first UI/UX to make complex legal data digestible for non-technical stakeholders.</p>',
                'outcome' => '<p>Tibu has become a go-to resource for Lawyers Hub and other regional stakeholders, reducing policy feedback cycles from months to days through automated reporting and alert systems.</p>',
                'testimonial_quote' => 'Tibu represents the future of how policy should be managed in the digital age. It provides a level of clarity that was previously impossible to achieve.',
                'testimonial_author' => 'Linda Bonyo, CEO Lawyers Hub',
                'image' => 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80',
                'gallery' => [
                    'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80',
                    'https://images.unsplash.com/photo-1558494949-ef010cbdcc51?auto=format&fit=crop&q=80'
                ],
                'url' => 'https://okjtech.io/tibu',
                'is_featured' => true,
            ],
            [
                'title' => 'Naoa: Living Wedding Memories',
                'slug' => 'naoa-weddings',
                'tagline' => 'Documenting love as it happens.',
                'category' => 'Events & Lifestyle',
                'technologies' => ['React', 'Laravel', 'AWS S3', 'Pusher'],
                'description' => '<p>A comprehensive digital ecosystem for modern weddings, featuring live gallery updates, guest onboarding, and immersive digital scrapbooks.</p>',
                'significant_figure' => '5k+ Active Moments',
                'problem' => '<p>Wedding memories are often fragmented across multiple devices and social media platforms. Couples lack a central, high-quality "living" record of their celebration as it unfolds.</p>',
                'methodology' => '<p>We built Naoa with a mobile-first philosophy, focusing on high-concurrency photo uploads and real-time push notifications. The architecture ensures that every guest interaction is recorded and displayed instantly.</p>',
                'outcome' => '<p>Naoa has transformed dozens of events into searchable, interactive digital experiences, with an average guest engagement rate of over 85% during the event window.</p>',
                'testimonial_quote' => 'Our wedding felt so much more connected because of Naoa. Seeing the photos stream in real-time was a highlight for everyone.',
                'testimonial_author' => 'David & Tania, Verified Users',
                'image' => 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80',
                'gallery' => [
                    'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&q=80',
                    'https://images.unsplash.com/photo-1465495910483-0d674575603d?auto=format&fit=crop&q=80'
                ],
                'url' => 'https://dntwed.okjtech.co.ke',
                'is_featured' => true,
            ]
        ];

        foreach ($innovations as $data) {
            Innovation::updateOrCreate(['slug' => $data['slug']], $data);
        }

        $caseStudies = [
            [
                'title' => 'SouthRing Autos: Integrated Garage Management System',
                'slug' => 'southring-autos-garage-system',
                'client_name' => 'SouthRing Autos',
                'category' => 'Automotive & Logistics',
                'technologies' => ['React', 'Laravel', 'MySQL', 'Node.js'],
                'description' => 'A comprehensive garage management ecosystem that digitizes bookings, service tracking, and client communications.',
                'significant_figure' => '100% Digital Booking',
                'problem' => 'SouthRing Autos needed to transition from offline garage management to a fully integrated digital ecosystem incorporating online bookings, automated reminders, and car history.',
                'methodology' => 'We engineered a full-stack digital platform featuring a public-facing informative website and a robust internal Admin/User dashboard. The architecture streamlined client onboarding and digitized service documentation.',
                'outcome' => 'Transformed the client-garage relationship resulting in unified online payments, accurate automated service tracking, and a seamless zero-paper workflow.',
                'image' => '/assets/images/custom-webdev.png',
                'is_featured' => true,
            ],
            [
                'title' => 'Nyalife Women\'s Health Clinic HMS',
                'slug' => 'nyalife-clinic-hms',
                'client_name' => 'Nyalife Clinic',
                'category' => 'Health & Medical',
                'technologies' => ['React', 'Laravel', 'PostgreSQL', 'Tailwind CSS', 'Redux'],
                'description' => 'A comprehensive digital ecosystem designed to revolutionize patient care and hospital administration for specialized women\'s health facilities.',
                'significant_figure' => '65% Efficiency Increase',
                'problem' => '<p>The clinic struggled with inefficient manual file management and disconnected patient records. They needed a secure, HIPAA-compliant system to handle bookings, medical records, and doctor-patient interactions seamlessly.</p>',
                'methodology' => '<p>Our approach involved architecting a multi-layered HMS. We developed a high-performance React frontend for administrative staff, a secure Laravel API backend, and an integrated patient portal. Security was paramount, implementing end-to-end encryption for medical history data.</p>',
                'outcome' => '<p>The resulting system transformed clinic operations. Patient wait times dropped by 40%, and administrative errors were virtually eliminated through automated data validation and centralized record keeping.</p>',
                'testimonial_quote' => 'OKJTech delivered a system that exceeded our expectations. The HMS has not only streamlined our workflow but also significantly improved the patient experience through its intuitive booking and record access portals.',
                'testimonial_author' => 'Dr. Sarah Nyawira, Lead Consultant',
                'image' => '/assets/images/uiux-design.png',
                'gallery' => [
                    '/assets/images/portfolio/nyalife-dashboard.png',
                    '/assets/images/portfolio/nyalife-patient.png',
                    '/assets/images/portfolio/nyalife-mobile.png'
                ],
                'website_url' => 'https://nyalife-demo.okjtech.io',
                'is_featured' => true,
            ],
            [
                'title' => 'Africa Law Tech & Lawyers Hub Registration Systems',
                'slug' => 'africa-law-tech-festival',
                'client_name' => 'Lawyers Hub',
                'category' => 'Events & Legal',
                'technologies' => ['Next.js', 'Firebase', 'Real-time Push', 'Tailwind'],
                'description' => 'Scalable event management platform capable of handling thousands of real-time registrations and live festival updates.',
                'significant_figure' => 'Real-time Push Notifications',
                'problem' => 'Managing massive registrations and providing live updates during the Africa Law Tech festival required a highly scalable and resilient web application.',
                'methodology' => 'We launched a dynamic events web application optimized for heavy traffic, built-in custom push notification services, and created a digital policy knowledgebase.',
                'outcome' => 'Successfully facilitated the ongoing festival with zero downtime, seamless knowledge distribution, and live real-time updates for thousands of participants.',
                'image' => '/assets/images/digital-strategy.png',
                'is_featured' => true,
            ]
        ];
        foreach ($caseStudies as $data) {
            CaseStudy::updateOrCreate(['slug' => $data['slug']], $data);
        }
        
        TeamMember::truncate();
        TeamMember::create([
           'name' => 'Kenneth',
           'role' => 'Lead Engineer',
           'bio' => 'Full-stack developer architecting OKJTech web solutions.',
           'image' => 'https://ui-avatars.com/api/?name=Kenneth',
           'order' => 1
        ]);
        
        \App\Models\Stat::truncate();
        \App\Models\Stat::insert([
            ['label' => 'Digital Products Launched', 'value' => '50+', 'icon' => 'Code2', 'order' => 1],
            ['label' => 'Lines of Code Written', 'value' => '1M+', 'icon' => 'Terminal', 'order' => 2],
            ['label' => 'Client Retention', 'value' => '98%', 'icon' => 'Users', 'order' => 3],
        ]);
    }
}
