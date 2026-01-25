<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\HeroSlide;

class HeroSlideSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $slides = [
            [
                'label' => 'Design',
                'text' => 'Design first. Function always.',
                'image_url' => '/images/hero/1.jpg',
                'subtitle' => 'Simple, purposeful interfaces.',
                'testimonial_text' => 'Absolutely breathtaking interfaces. Unique and not like anything that exists',
                'testimonial_author' => 'Luigi Sewe',
                'testimonial_company' => 'Obam & Sewe Advocates',
                'sort_order' => 1,
            ],
            [
                'label' => 'Style',
                'text' => 'Smart, stylish, purposeful.',
                'image_url' => '/images/hero/2.jpg',
                'subtitle' => 'Aesthetic clarity that supports goals.',
                'testimonial_text' => 'Aesthetic clarity is their hallmark. They don\'t just build sites; they craft visual identities that resonate deeply.',
                'testimonial_author' => 'Sarah Jenkins',
                'testimonial_company' => 'Creative Director at Nexus',
                'sort_order' => 2,
            ],
            [
                'label' => 'Interactive',
                'text' => 'Human‑centered UX.',
                'image_url' => '/images/hero/3.jpg',
                'subtitle' => 'Guided by empathy and behavior.',
                'testimonial_text' => 'Our user engagement went up by 40% thanks to the intuitive flow designed by the team. Truly human-centered.',
                'testimonial_author' => 'Michael Chen',
                'testimonial_company' => 'CTO at FinStream',
                'sort_order' => 3,
            ],
            [
                'label' => 'Speed',
                'text' => 'Fast, responsive, accessible.',
                'image_url' => '/images/hero/4.jpg',
                'subtitle' => 'Performance and accessibility first.',
                'testimonial_text' => 'We needed lightning-fast load times for our global audience, and they delivered. The performance is seamless.',
                'testimonial_author' => 'James Klovsky',
                'testimonial_company' => 'Lead Developer at Velocita',
                'sort_order' => 4,
            ],
            [
                'label' => 'Deploy',
                'text' => 'From idea to launch.',
                'image_url' => '/images/hero/5.jpg',
                'subtitle' => 'From code to production with confidence.',
                'testimonial_text' => 'The transition from concept to live production was flawless. Exceptional confidence in their deployment pipelines.',
                'testimonial_author' => 'Elena Rodriguez',
                'testimonial_company' => 'Founder of StartupX',
                'sort_order' => 5,
            ],
            [
                'label' => 'Scale',
                'text' => 'Built to scale.',
                'image_url' => '/images/hero/6.jpg',
                'subtitle' => 'Built for growth and maintainability.',
                'testimonial_text' => 'Our platform grew from 1k to 100k users without a hitch. The architecture implemented is rock solid.',
                'testimonial_author' => 'David Okafor',
                'testimonial_company' => 'CEO at Scalable Systems',
                'sort_order' => 6,
            ],
            [
                'label' => 'Bookings',
                'text' => 'Meet the Developer.',
                'image_url' => '/images/hero/7.jpg',
                'subtitle' => '',
                'testimonial_text' => 'Working with him was a breeze. Professional, punctual, and highly skilled. Highly recommend for any serious project.',
                'testimonial_author' => 'Amanda Lee',
                'testimonial_company' => 'Project Manager',
                'sort_order' => 7,
            ],
        ];

        foreach ($slides as $slide) {
            HeroSlide::updateOrCreate(
                ['label' => $slide['label']],
                $slide
            );
        }
    }
}
