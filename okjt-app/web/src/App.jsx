import { lazy, Suspense } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { SiteProvider } from '@okjt/site';
import { useSiteConfig } from './site.config';
import { Assistant, CookieConsent, MaintenancePage, PageViews, WhatsAppButton, useMaintenance } from './components/Visitor';
import { getToken } from './lib/api';
import Home from './pages/Home';

const About = lazy(() => import('./pages/About'));
const Services = lazy(() => import('./pages/Services'));
const ServiceDetail = lazy(() => import('./pages/ServiceDetail'));
const Insights = lazy(() => import('./pages/Insights'));
const InsightDetail = lazy(() => import('./pages/InsightDetail'));
const Projects = lazy(() => import('./pages/Projects'));
const ProjectDetail = lazy(() => import('./pages/ProjectDetail'));
const Approach = lazy(() => import('./pages/Approach'));
const PillarDetail = lazy(() => import('./pages/PillarDetail'));
const ClientImpact = lazy(() => import('./pages/ClientImpact'));
const Contact = lazy(() => import('./pages/Contact'));
const Legal = lazy(() => import('./pages/Legal'));
const NotFound = lazy(() => import('./pages/NotFound'));
// The dashboard is its own bundle: visitors never download it.
const Admin = lazy(() => import('./admin/AdminApp'));

const queryClient = new QueryClient({ defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: false } } });

function PublicSite() {
  const site = useSiteConfig();
  const { pathname } = useLocation();
  const maintenance = useMaintenance();
  if (maintenance.data?.isActive && !getToken()) return <MaintenancePage {...maintenance.data} />;
  return (
    <SiteProvider site={site}>
      <Suspense fallback={<div className="min-h-dvh bg-paper" />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/services" element={<Services />} />
          <Route path="/services/:slug" element={<ServiceDetail />} />
          <Route path="/insights" element={<Insights />} />
          <Route path="/insights/:slug" element={<InsightDetail />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/projects/flagship" element={<Projects flagship />} />
          <Route path="/projects/:slug" element={<ProjectDetail />} />
          <Route path="/portfolio" element={<Navigate to="/projects" replace />} />
          <Route path="/our-approach" element={<Approach />} />
          <Route path="/our-approach/:slug" element={<PillarDetail />} />
          <Route path="/client-impact" element={<ClientImpact />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/privacy" element={<Legal key="privacy" title="Privacy policy" settingKey="privacy_policy" />} />
          <Route path="/terms" element={<Legal key="terms" title="Terms of service" settingKey="terms_of_service" />} />
          <Route path="/cookies" element={<Legal key="cookies" title="Cookie policy" settingKey="cookie_policy" />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
      <PageViews />
      {!pathname.startsWith('/admin') && (
        <>
          <CookieConsent />
          <WhatsAppButton />
          <Assistant />
        </>
      )}
    </SiteProvider>
  );
}

/** OKJTech: the public site, and the dashboard under /admin. */
export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Toaster position="top-right" toastOptions={{ style: { background: '#211c12', color: '#faf5e8', border: '1px solid #3a3221' } }} />
        <Routes>
          <Route path="/admin/*" element={<Suspense fallback={<div className="min-h-dvh bg-paper" />}><Admin /></Suspense>} />
          <Route path="/*" element={<PublicSite />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
