import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAdminChrome } from './AdminChromeContext.js';
import { useDashboard } from './DashboardProvider.js';

// Height of the sticky admin header; the hero counts as hidden once it is
// fully behind it.
const HEADER_OFFSET = 64;

/** Tracks whether `ref` is visible below the sticky header. */
function useVisibleBelowHeader(ref) {
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') return undefined;
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { rootMargin: `-${HEADER_OFFSET}px 0px 0px 0px`, threshold: 0 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref]);
  return visible;
}

/**
 * AdminPageHero — consistent page header for all admin dashboard pages.
 *
 * @param {string}   title        - Page title (required)
 * @param {string}   [description] - Optional subtitle / summary text
 * @param {string|Array} [breadcrumb] - Either just the current page label (string), or full array of { label, path? } objects. The dashboard's home (DashboardProvider) is auto-prepended.
 * @param {ReactNode} [actions]    - Optional action buttons rendered on the right
 * @param {ReactNode} [icon]       - Optional icon element rendered before the title
 *
 * Once the hero scrolls behind the sticky header, a compact copy (icon,
 * parent crumb and title) appears in the header so the page context stays
 * visible.
 */
export default function AdminPageHero({ title, description, breadcrumb, icon }) {
  const { home } = useDashboard();
  const crumbs = Array.isArray(breadcrumb)
    ? breadcrumb
    : [home, { label: breadcrumb || title }];
  const heroRef = useRef(null);
  const heroVisible = useVisibleBelowHeader(heroRef);
  const { titleSlot } = useAdminChrome();
  const parent = crumbs.length > 1 ? crumbs[crumbs.length - 2] : null;

  const compactTitle = titleSlot && !heroVisible && createPortal(
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.15 }}
      className="flex items-center gap-2 min-w-0"
    >
      {icon && (
        <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'rgba(166, 123, 91, 0.1)' }}>
          {icon}
        </div>
      )}
      <div className="min-w-0 leading-tight">
        {parent && (
          <p className="hidden sm:block text-[11px] text-tone-400 truncate">
            {parent.path ? <Link to={parent.path} className="hover:text-accent">{parent.label}</Link> : parent.label}
          </p>
        )}
        <p className="text-base font-semibold text-body truncate">{title}</p>
      </div>
      <button
        type="button"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="hidden md:inline text-xs text-tone-400 hover:text-accent whitespace-nowrap"
        title="Back to top"
      >
        ↑ Top
      </button>
    </motion.div>,
    titleSlot
  );

  return (
    <div className="admin-page-hero pt-2" ref={heroRef}>
      {compactTitle}
      {/* Breadcrumb */}
      {crumbs && crumbs.length > 0 && (
        <nav className="flex items-center gap-1.5 text-sm mb-2">
          {crumbs.map((crumb, idx) => {
            const isLast = idx === crumbs.length - 1;
            return (
              <span key={idx} className="flex items-center gap-1.5">
                {idx > 0 && <ChevronRight className="w-3.5 h-3.5 text-tone-300" />}
                {crumb.path && !isLast ? (
                  <Link
                    to={crumb.path}
                    className="text-tone-400 hover:text-accent transition-colors"
                  >
                    {crumb.label}
                  </Link>
                ) : (
                  <span className={isLast ? 'text-tone-700 font-medium' : 'text-tone-400'}>
                    {crumb.label}
                  </span>
                )}
              </span>
            );
          })}
        </nav>
      )}

      {/* Title Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {icon && (
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(166, 123, 91, 0.1)' }}
            >
              {icon}
            </div>
          )}
          <div>
            <h1
              className="text-2xl md:text-3xl font-semibold"
              style={{ color: '#4A3F35' }}
            >
              {title}
            </h1>
            {description && (
              <p className="text-sm mt-0.5" style={{ color: '#8B7B6B' }}>
                {description}
              </p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
