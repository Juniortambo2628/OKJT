import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from './components/layout';
import { Preloader } from './components/common';
import { HomePage, PortfolioPage, ContactPage, NotFoundPage } from './pages';
import { 
  AdminLogin, 
  AdminDashboard, 
  AdminPortfolio, 
  AdminPortfolioEditor,
  AdminSubmissions,
  AdminAnalytics,
  AdminNotifications,
  AdminCalendar,
  AdminConsultations,
  AdminSettings,
  AdminActivityLog,
  AdminSearch,
  AdminHeroSlides,
  AdminTrustedClients,
} from './pages/admin';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';

function AppRoutes() {
  useKeyboardShortcuts();
  
  return (
    <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Layout><HomePage /></Layout>} />
        <Route path="/portfolio" element={<Layout><PortfolioPage /></Layout>} />
        <Route path="/contact" element={<Layout><ContactPage /></Layout>} />
        
        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/portfolio" element={<AdminPortfolio />} />
        <Route path="/admin/portfolio/new" element={<AdminPortfolioEditor />} />
        <Route path="/admin/portfolio/:id/edit" element={<AdminPortfolioEditor />} />
        <Route path="/admin/submissions" element={<AdminSubmissions />} />
        <Route path="/admin/analytics" element={<AdminAnalytics />} />
        <Route path="/admin/notifications" element={<AdminNotifications />} />
        <Route path="/admin/calendar" element={<AdminCalendar />} />
        <Route path="/admin/consultations" element={<AdminConsultations />} />
        <Route path="/admin/settings" element={<AdminSettings />} />
        <Route path="/admin/activity-log" element={<AdminActivityLog />} />
        <Route path="/admin/search" element={<AdminSearch />} />
        <Route path="/admin/hero-slides" element={<AdminHeroSlides />} />
        <Route path="/admin/trusted-clients" element={<AdminTrustedClients />} />
        
        {/* 404 */}
        <Route path="*" element={<Layout><NotFoundPage /></Layout>} />
    </Routes>
  );
}

export default function App() {
  const [showPreloader, setShowPreloader] = useState(true);

  useEffect(() => {
    // Hide preloader after initial load
    const timer = setTimeout(() => setShowPreloader(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Router>
      {showPreloader && <Preloader />}
      <AppRoutes />
    </Router>
  );
}
