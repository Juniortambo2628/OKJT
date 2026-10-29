import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import SiteNav from './SiteNav.js';
import SiteFooter from './SiteFooter.js';
import Seo from './Seo.js';

/** Scroll to "#section" links (also across pages), otherwise to the top on page change. */
function useScrollToHash() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (!hash) {
      window.scrollTo(0, 0);
      return undefined;
    }
    // The target may render a moment later (lazy page, data): retry briefly.
    let tries = 0;
    const timer = setInterval(() => {
      const el = document.getElementById(decodeURIComponent(hash.slice(1)));
      if (el || ++tries > 20) {
        clearInterval(timer);
        el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 50);
    return () => clearInterval(timer);
  }, [pathname, hash]);
}

/**
 * The frame of every public page: nav, page, footer. `overlay` lets the
 * nav sit over a full-bleed hero photo; `cta={false}` drops the footer's call to action.
 */
export default function SiteLayout({ overlay = false, cta = true, children }) {
  useScrollToHash();
  return (
    <div className="min-h-dvh bg-tint font-sans text-ink antialiased">
      <Seo />
      <SiteNav overlay={overlay} />
      <main className={overlay ? '' : 'pt-24'}>{children}</main>
      <SiteFooter cta={cta} />
    </div>
  );
}
