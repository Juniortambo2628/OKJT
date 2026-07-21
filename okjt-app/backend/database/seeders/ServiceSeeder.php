<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class ServiceSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $services = [
            // === WEB DEVELOPMENT ===
            [
                'title' => 'Custom Web Applications',
                'category' => 'Web Development',
                'slug' => 'custom-web-applications',
                'description' => 'Scalable, performant, and secure full-stack web applications built with Next.js, React, and Laravel.',
                'icon' => 'Code2',
            ],
            [
                'title' => 'E-Commerce Solutions',
                'category' => 'Web Development',
                'slug' => 'e-commerce-solutions',
                'description' => 'End-to-end e-commerce platforms with integrated payment gateways, custom dashboards, and inventory management.',
                'icon' => 'ShoppingCart',
            ],
            [
                'title' => 'Admin Dashboards',
                'category' => 'Web Development',
                'slug' => 'admin-dashboards',
                'description' => 'Dynamic internal tools and admin portals with real-time analytics, user management, and automated reporting.',
                'icon' => 'LayoutDashboard',
            ],
            [
                'title' => 'API Development & Architectures',
                'category' => 'Web Development',
                'slug' => 'api-development',
                'description' => 'RESTful and GraphQL API development for seamless third-party integrations, mobile apps, and microservices.',
                'icon' => 'Server',
            ],
            [
                'title' => 'CMS Development',
                'category' => 'Web Development',
                'slug' => 'cms-development',
                'description' => 'Custom content management systems providing complete control over website content without touching code.',
                'icon' => 'Database',
            ],

            // === UI/UX DESIGN ===
            [
                'title' => 'Wireframing & Prototyping',
                'category' => 'UI/UX Design',
                'slug' => 'wireframing-prototyping',
                'description' => 'High-fidelity interactive prototypes linking complex interactions before a single line of code is written.',
                'icon' => 'Figma',
            ],
            [
                'title' => 'Design Systems',
                'category' => 'UI/UX Design',
                'slug' => 'design-systems',
                'description' => 'Comprehensive component libraries ensuring visual consistency and code reusability across digital products.',
                'icon' => 'Palette',
            ],
            [
                'title' => 'User Experience (UX) Audit',
                'category' => 'UI/UX Design',
                'slug' => 'ux-audit',
                'description' => 'Identifying friction points in existing applications and reconstructing user flows for maximum conversion.',
                'icon' => 'Users',
            ],

            // === DIGITAL STRATEGY ===
            [
                'title' => 'Technical Architecture Strategy',
                'category' => 'Digital Strategy',
                'slug' => 'technical-architecture',
                'description' => 'Advising on cloud infrastructure, continuous deployment pipelines, and scalable database architectures.',
                'icon' => 'Cpu',
            ],
            [
                'title' => 'Performance & SEO Optimization',
                'category' => 'Digital Strategy',
                'slug' => 'performance-seo',
                'description' => 'Enhancing Core Web Vitals, server response times, and semantic HTML for superior search engine rankings.',
                'icon' => 'TrendingUp',
            ],
            [
                'title' => 'Digital Transformation Advisory',
                'category' => 'Digital Strategy',
                'slug' => 'digital-transformation',
                'description' => 'Guiding businesses through transferring legacy systems into modern, cloud-based environments.',
                'icon' => 'Workflow',
            ],
        ];

        // Truncate and re-seed for fresh data
        \App\Models\Service::truncate();

        foreach ($services as $service) {
            \App\Models\Service::create($service);
        }
    }
}
