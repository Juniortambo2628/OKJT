<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\PortfolioProject;
use App\Models\ContactSubmission;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Create admin user
        User::create([
            'name' => 'Admin',
            'email' => 'admin@okjtech.co.ke',
            'password' => Hash::make('okjtech2025'),
        ]);

        // Create sample portfolio projects
        $projects = [
            [
                'title' => 'E-Commerce Platform',
                'description' => 'A full-featured e-commerce platform with inventory management, payment processing, and order tracking.',
                'category' => 'Web Development',
                'client_name' => 'Retail Solutions Ltd',
                'image_url' => 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800',
                'project_url' => 'https://example.com',
                'status' => 'completed',
                'featured' => true,
                'sort_order' => 1,
            ],
            [
                'title' => 'Corporate Website Redesign',
                'description' => 'Complete redesign of a corporate website with modern UI/UX, responsive design, and CMS integration.',
                'category' => 'Web Design',
                'client_name' => 'Tech Corp International',
                'image_url' => 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800',
                'project_url' => 'https://example.com',
                'status' => 'completed',
                'featured' => true,
                'sort_order' => 2,
            ],
            [
                'title' => 'Real Estate Portal',
                'description' => 'Property listing platform with advanced search, virtual tours, and agent management system.',
                'category' => 'Web Application',
                'client_name' => 'Prime Properties Kenya',
                'image_url' => 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800',
                'project_url' => 'https://example.com',
                'status' => 'completed',
                'featured' => false,
                'sort_order' => 3,
            ],
            [
                'title' => 'Restaurant Booking System',
                'description' => 'Online reservation system with table management, menu display, and customer notifications.',
                'category' => 'Web Application',
                'client_name' => 'Savannah Grill',
                'image_url' => 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800',
                'project_url' => 'https://example.com',
                'status' => 'completed',
                'featured' => true,
                'sort_order' => 4,
            ],
            [
                'title' => 'Healthcare Dashboard',
                'description' => 'Admin dashboard for healthcare facility with patient management and appointment scheduling.',
                'category' => 'Dashboard',
                'client_name' => 'MediCare Clinics',
                'image_url' => 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800',
                'status' => 'in_progress',
                'featured' => false,
                'sort_order' => 5,
            ],
            [
                'title' => 'Event Management Platform',
                'description' => 'Comprehensive event planning and ticketing platform with attendee management.',
                'category' => 'Web Application',
                'client_name' => 'Events Kenya',
                'image_url' => 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800',
                'status' => 'completed',
                'featured' => false,
                'sort_order' => 6,
            ],
        ];

        foreach ($projects as $project) {
            PortfolioProject::create($project);
        }

        // Create sample contact submissions
        $submissions = [
            [
                'name' => 'John Doe',
                'email' => 'john@example.com',
                'contact_method' => 'email',
                'message' => 'I need a website for my new startup. Looking for modern design with e-commerce functionality.',
                'consent' => true,
                'status' => 'pending',
                'online_consultation' => true,
                'consultation_date' => now()->addDays(3)->format('Y-m-d'),
                'consultation_time' => '10:00',
            ],
            [
                'name' => 'Jane Smith',
                'email' => 'jane@company.com',
                'phone_number' => '0712345678',
                'country_code' => '+254',
                'contact_method' => 'whatsapp',
                'message' => 'Interested in a portfolio website redesign. Current site needs a refresh.',
                'consent' => true,
                'status' => 'accepted',
            ],
            [
                'name' => 'Mike Johnson',
                'email' => 'mike@startup.io',
                'contact_method' => 'email',
                'message' => 'Looking for a full-stack developer for a 3-month project. Budget is flexible.',
                'consent' => true,
                'status' => 'completed',
            ],
        ];

        foreach ($submissions as $submission) {
            ContactSubmission::create($submission);
        }

        $this->call(HeroSlideSeeder::class);

        $this->command->info('Database seeded successfully!');
        $this->command->info('Admin login: admin@okjtech.co.ke / okjtech2025');
    }
}
