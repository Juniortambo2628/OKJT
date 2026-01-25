import type { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import SocialSidebar from './SocialSidebar';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const isHomePage = location.pathname === '/';
  const isAdminPage = location.pathname.startsWith('/admin');

  if (isAdminPage) {
    return <>{children}</>;
  }

  // Home page has its own layout without footer
  if (isHomePage) {
    return (
      <div className="home-layout">
        <Header />
        <SocialSidebar />
        <main className="home-main">
          {children}
        </main>
      </div>
    );
  }

  return (
    <div className="site-layout">
      <Header />
      <SocialSidebar />
      <main className="site-main">
        {children}
      </main>
      <Footer />
    </div>
  );
}

