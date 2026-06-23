import Hero from "@/components/Hero";
import ServicesSection from "@/components/sections/ServicesSection";
import InsightsSection from "@/components/sections/InsightsSection";
import StatsSection from "@/components/sections/StatsSection";
import ValueProposition from "@/components/sections/ValueProposition";
import CTABanner from "@/components/sections/CTABanner";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SWRProvider from '@/components/SWRProvider';
import { getSettings, getServices, getInsights, getProjects, getStats, getTestimonials, getClients, getValues, getTeamMembers, getPillars } from '@/lib/server/api';

export const revalidate = 60;

export default async function Home() {
  const [
    settings,
    services,
    insights,
    projects,
    stats,
    testimonials,
    clients,
    values,
    teamMembers,
    pillars,
  ] = await Promise.all([
    getSettings(),
    getServices(),
    getInsights(),
    getProjects(),
    getStats(),
    getTestimonials(),
    getClients(),
    getValues(),
    getTeamMembers(),
    getPillars(),
  ]);

  return (
    <SWRProvider fallback={{
      '/settings': settings,
      '/services': services,
      '/insights': insights,
      '/projects': projects,
      '/stats': stats,
      '/testimonials': testimonials,
      '/clients': clients,
      '/values': values,
      '/team-members': teamMembers,
      '/pillars': pillars,
    }}>
      <main className="flex min-h-screen flex-col relative bg-background">
        <Navbar />
        <Hero />
        <ValueProposition />
        <StatsSection />
        <ServicesSection />
        <InsightsSection />
        <CTABanner />
        <Footer />
      </main>
    </SWRProvider>
  );
}
