<?php

namespace Database\Seeders;

use App\Models\Insight;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class InsightSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::where('email', 'admin@okjtech.com')->first();
        $adminId = $admin ? $admin->id : 1;

        $insights = [
            [
                'title' => 'The Power of Design-Led Engineering in Modern Web Development',
                'category' => 'UI/UX Design',
                'excerpt' => 'Why separating design from engineering is a mistake, and how a unified design-led engineering process yields faster load times and higher conversions.',
                'content' => '<h2>Bridging the Gap</h2><p>In traditional product development, designers create flat layouts in Figma and throw them over the wall to engineers. This siloed approach leads to styling mismatch, missed interaction details, and bloated codebases.</p><h3>The Unified Approach</h3><p>At OKJTech, design-led engineering means design tokens translate directly into CSS utility definitions, animations are prototyped alongside UI structures, and components are reusable from day one. This yields extreme visual polish without compromising on application performance.</p>',
                'image' => '/assets/images/insights/design-led.png',
                'user_id' => $adminId,
                'is_published' => true,
                'published_at' => now(),
            ],
            [
                'title' => 'Scaling Laravel APIs: Database Indexing and Caching Strategies',
                'category' => 'Web Development',
                'excerpt' => 'A practical guide to database optimizations, selective Eager Loading, and Redis caching layers for high-traffic Laravel applications.',
                'content' => '<h2>Why Database Performance Matters</h2><p>As applications scale, database queries are almost always the primary bottleneck. Unindexed fields and N+1 query problems will quickly degrade API responsiveness.</p><h3>Key Optimization Checklist</h3><ul><li><strong>Composite Indexing:</strong> Index fields frequently filtered or joined together.</li><li><strong>Redis Caching:</strong> Cache heavy read operations that don\'t change frequently.</li><li><strong>Eager Loading:</strong> Always load related models when querying collections using Laravel\'s <code>with()</code> method.</li></ul>',
                'image' => '/assets/images/insights/laravel-scaling.png',
                'user_id' => $adminId,
                'is_published' => true,
                'published_at' => now()->subDays(2),
            ],
            [
                'title' => 'Next.js App Router: Maximizing Page Load and Core Web Vitals',
                'category' => 'Web Development',
                'excerpt' => 'How to leverage Server Components, streaming metadata, and image optimization tools inside Next.js to achieve perfect Lighthouse scores.',
                'content' => '<h2>Next-Gen Frontend Engineering</h2><p>With Next.js, building interactive web apps that load instantly has never been easier. By shifting components to Server Components by default, we significantly reduce client-side JavaScript packages.</p><h3>Optimizing Web Vitals</h3><p>Use Next.js built-in Image component for automated WebP formatting and layout-shift prevention, alongside dynamic streaming for slow-loading data modules.</p>',
                'image' => '/assets/images/insights/nextjs-vitals.png',
                'user_id' => $adminId,
                'is_published' => true,
                'published_at' => now()->subDays(5),
            ],
        ];

        Insight::truncate();

        foreach ($insights as $insight) {
            $insight['slug'] = Str::slug($insight['title']);
            Insight::create($insight);
        }
    }
}
