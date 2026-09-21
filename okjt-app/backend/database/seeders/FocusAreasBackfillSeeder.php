<?php

namespace Database\Seeders;

use App\Models\Project;
use Illuminate\Database\Seeder;

class FocusAreasBackfillSeeder extends Seeder
{
    public function run(): void
    {
        $projects = [
            'lawyers-hub-digital-policy' => ['Content management', 'Digital policy publishing', 'Event platform integration'],
            'africa-law-tech-festival' => ['Online ticketing', 'Live event notifications', 'Event mapping'],
            'ai-policy-lab' => ['Virtual learning UI/UX', 'Cross-continental accessibility', 'Policy capacity building'],
            'adpi-courses' => ['Course management', 'Participant tracking', 'Data protection training'],
            'digital-trade-hackathon' => ['Event landing page', 'Interactive Africa map', 'Hackathon coordination'],
            'boda-boda-law' => ['Legal advisory intake', 'Field research coordination', 'Capacity-building training'],
            'dickson-gongona-advocates' => ['Client dashboard', 'Case management', 'Document uploads'],
            'tamcon-consulting-engineers' => ['Project showcase', 'CMS content management', 'Scroll animations'],
            'south-ring-autos' => ['Booking system', 'Vehicle service tracking', 'Loyalty rewards'],
            'nyalife-womens-clinic' => ['Service showcase', 'Doctor profiles', 'Appointment intake'],
            'nyalife-hms' => ['Patient records', 'Clinical workflows', 'Role-based access control'],
            'hucaa' => ['Alumni directory', 'Event coordination', 'M-Pesa donations'],
            'global-harmony-initiative' => ['Programme content', 'Stripe donations', 'WebAuthn admin login'],
            'wisdom-capital' => ['Product catalog', 'Order management', 'Regional distribution tracking'],
            'reytati-communications' => ['Lead capture', 'Service catalog', 'Testimonial management'],
            'mizizi-sugarcane-juice' => ['Product showcase', 'Map-based delivery picker', 'Order tracking'],
            'okjtech-portfolio' => ['Project showcase', 'Insights publishing', 'Admin CMS'],
            'the-football-experience' => ['Budget calculator', 'Social feed', 'Tournament travel planning'],
            'tena' => ['Property management', 'PMS integration', 'Campaign dispatcher'],
            'najenga' => ['Drawing annotation', 'Project timelines', 'Document OCR'],
            'naoa' => ['Live photo gallery', 'QR guest check-in', 'Digital scrapbook export'],
            'kuba-home-services' => ['Service marketplace', 'Real-time chat', 'Multi-gateway payments'],
            'silversky-events' => ['Multi-service ordering', 'Passkey authentication', 'Delivery tracking'],
            'omnishop-omnispace3d' => ['Exhibitor catalog', 'PDF invoicing', 'Stock management'],
            'nissi-insights' => ['Content publishing', 'Event management', 'Knowledge base'],
            'gm-coaching' => ['MBA admissions coaching', 'Calendly booking', 'Stripe payments'],
            'tibu' => ['Hospital management', 'Cross-facility interoperability', 'Health infrastructure'],
        ];

        foreach ($projects as $slug => $areas) {
            Project::where('slug', $slug)->update(['focus_areas' => $areas]);
        }

        $this->command->info('Updated '.count($projects).' projects with focus_areas.');
    }
}
