import Hero from "@/components/Hero";
import ServicesSection from "@/components/sections/ServicesSection";
import InsightsSection from "@/components/sections/InsightsSection";
import StatsSection from "@/components/sections/StatsSection";
import ValueProposition from "@/components/sections/ValueProposition";
import CaseStudiesPreview from "@/components/sections/CaseStudiesPreview";
import CTABanner from "@/components/sections/CTABanner";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";


export default function Home() {
  return (
    <main className="flex min-h-screen flex-col relative bg-background">
      <Navbar />
      <Hero />
      <ValueProposition />
      <StatsSection />
      <ServicesSection />
      <CaseStudiesPreview />
      <InsightsSection />
      <CTABanner />

      <Footer />
    </main>
  );
}
