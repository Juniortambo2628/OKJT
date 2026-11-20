import { Suspense } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { SiteProvider } from '@okjt/site';
import { useSiteConfig } from './site.config';
import { Assistant, CookieConsent, MaintenancePage, PageViews, WhatsAppButton, useMaintenance } from './components/Visitor';
import { getToken } from './lib/api';
import { PageLoading } from './components/States';
import RouteProgress from './components/RouteProgress';
import { lazyPage } from './lib/pageLoading';
import Home from './pages/Home';

const About = lazyPage(() => import('./pages/About'));
const Services = lazyPage(() => import('./pages/Services'));
const ServiceDetail = lazyPage(() => import('./pages/ServiceDetail'));
const Insights = lazyPage(() => import('./pages/Insights'));
const InsightDetail = lazyPage(() => import('./pages/InsightDetail'));
const Projects = lazyPage(() => import('./pages/Projects'));
const ProjectDetail = lazyPage(() => import('./pages/ProjectDetail'));
const Approach = lazyPage(() => import('./pages/Approach'));
const PillarDetail = lazyPage(() => import('./pages/PillarDetail'));
const ClientImpact = lazyPage(() => import('./pages/ClientImpact'));
const Contact = lazyPage(() => import('./pages/Contact'));
const Book = lazyPage(() => import('./pages/Book'));
const SiteCheckTool = lazyPage(() => import('./pages/SiteCheck').then((m) => ({ default: m.SiteCheckTool })));
const SiteCheckReport = lazyPage(() => import('./pages/SiteCheck').then((m) => ({ default: m.SiteCheckReport })));
const Legal = lazyPage(() => import('./pages/Legal'));
const NotFound = lazyPage(() => import('./pages/NotFound'));
// The dashboard is its own bundle: visitors never download it.
const Admin = lazyPage(() => import('./admin/AdminApp'));

const queryClient = new QueryClient({ defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: false } } });

function PublicSite() {
  const site = useSiteConfig();
  const { pathname } = useLocation();
  const maintenance = useMaintenance();
  if (maintenance.data?.isActive && !getToken()) return <MaintenancePage {...maintenance.data} />;
  return (
    <SiteProvider site={site}>
      <Suspense fallback={<PageLoading />}>
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
          <Route path="/book" element={<Book />} />
          <Route path="/tools/site-check" element={<SiteCheckTool />} />
          <Route path="/tools/site-check/:id" element={<SiteCheckReport />} />
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
        <RouteProgress />
        <Toaster position="top-right" toastOptions={{ style: { background: '#211c12', color: '#faf5e8', border: '1px solid #3a3221' } }} />
        <Routes>
          <Route path="/admin/*" element={<Suspense fallback={<PageLoading />}><Admin /></Suspense>} />
          <Route path="/*" element={<PublicSite />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
