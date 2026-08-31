import ServicesSection from "@/components/sections/ServicesSection";
import InsightsSection from "@/components/sections/InsightsSection";
import StatsSection from "@/components/sections/StatsSection";
import ValueProposition from "@/components/sections/ValueProposition";
import CTABanner from "@/components/sections/CTABanner";
import HomeBottomBar from "@/components/HomeBottomBar";
import FlagshipHeroCarousel from "@/components/FlagshipHeroCarousel";

import SWRProvider from '@/components/SWRProvider';
import BaseLayout from '@/components/BaseLayout';
import { getSettings, getServices, getInsights, getProjects, getStats, getTestimonials, getClients, getValues, getTeamMembers, getPillars } from '@/lib/server/api';
import { HOME_NAV_SECTIONS } from '@/lib/nav-sections';

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
      <BaseLayout navSections={HOME_NAV_SECTIONS} bottomBar={<HomeBottomBar />} heroChildren={<FlagshipHeroCarousel />}>
        <ValueProposition />
        <StatsSection />
        <ServicesSection />
        <InsightsSection />
        <CTABanner />
      </BaseLayout>
    </SWRProvider>
  );
}
