import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link, useLocation } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { useCollaboration } from './CollaborationContext.js';
import { useDashboard } from './DashboardProvider.js';
import { useModules } from './modules.js';
import { tabBarItems } from './tabBar.js';

/** The space the bar takes below `lg`: its height, the gap under it, the home-bar inset. */
export const TAB_BAR_SPACE = 'calc(76px + env(safe-area-inset-bottom, 0px))';

/**
 * True while the page scrolls down past the first screenful, false as soon as
 * it scrolls up or nears the top (the iOS tab bar's behaviour). A small dead
 * zone stops it flickering on a slow drag. Off with reduced motion.
 */
function useCompactOnScroll() {
  const [compact, setCompact] = useState(false);
  useEffect(() => {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches) return undefined;
    let last = window.scrollY;
    let frame = 0;
    const update = () => {
      frame = 0;
      const y = window.scrollY;
      const delta = y - last;
      if (y < 120) setCompact(false);
      else if (delta > 12) setCompact(true);
      else if (delta < -12) setCompact(false);
      if (Math.abs(delta) > 12 || y < 120) last = y;
    };
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(update); };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);
  return compact;
}

const ITEM = 'relative z-[1] flex w-full flex-col items-center justify-center gap-0.5 rounded-full px-0.5 text-[length:max(10px,var(--okjt-min-text,0px))] font-semibold leading-tight transition-[height,color] duration-300 focus-visible:outline-2 focus-visible:outline-accent';

/**
 * The bottom tab bar on phones (F5, from TFE's TabBar): a floating glass pill
 * below `lg`, with a lens behind the current tab that slides when it changes,
 * labels that fold away while the page scrolls down, and a Menu tab that
 * opens the sidebar. DashboardShell renders it when `shell.tabBar` is set:
 *
 *   shell.tabBar = {
 *     tabs: ['/app', { path: '/app/plan', primary: true, label: 'Plan' }, '/app/inbox'],
 *     menu: true,          // a last "Menu" tab that opens the sidebar
 *     label: 'Tabs',     // its accessible name (the header's own links are "Quick links")
 *     className: '',       // the bar's look, replacing the default glass
 *   }
 *
 * A tab is a sidebar item (shell.nav) picked by path; a path that isn't in the
 * nav is left out. A tab shows a dot when its page has changes by others, as
 * the sidebar does. Portalled to <body>, so a transformed ancestor can't move it.
 */
export default function DashboardTabBar({ onMenu, menuOpen = false }) {
  const { shell } = useDashboard();
  const { pathname } = useLocation();
  const { moduleForPath } = useModules();
  const { badges } = useCollaboration();
  const compact = useCompactOnScroll();
  const settings = shell.tabBar || {};

  useEffect(() => {
    document.documentElement.style.setProperty('--okjt-tabbar-h', TAB_BAR_SPACE);
    return () => document.documentElement.style.removeProperty('--okjt-tabbar-h');
  }, []);

  if (typeof document === 'undefined') return null;
  const tabs = tabBarItems(shell.nav, settings.tabs || [], pathname);
  const withMenu = settings.menu !== false;
  const count = tabs.length + (withMenu ? 1 : 0);
  if (!count) return null;
  const currentIndex = tabs.findIndex((t) => t.current);
  const height = compact ? 'h-11' : 'h-[3.5rem]';

  const bar = (
    <nav
      aria-label={settings.label || 'Tabs'}
      className={`fixed inset-x-3 bottom-[calc(10px+env(safe-area-inset-bottom,0px))] z-30 mx-auto max-w-[520px] lg:hidden ${
        settings.className ?? 'rounded-full border border-tone-200/70 bg-surface/80 shadow-lg backdrop-blur-xl backdrop-saturate-150'
      }`}
    >
      <ul className="relative flex p-1.5">
        {currentIndex >= 0 && (
          <li
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-1.5 left-1.5 rounded-full bg-accent/10 transition-transform duration-300"
            style={{ width: `calc((100% - 0.75rem) / ${count})`, transform: `translateX(${currentIndex * 100}%)` }}
          />
        )}
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const moduleKey = moduleForPath(tab.path)?.key;
          const newCount = tab.current ? 0 : badges[moduleKey] || 0;
          return (
            <li key={tab.path} className="min-w-0 flex-1">
              <Link
                to={tab.path}
                aria-current={tab.current ? 'page' : undefined}
                aria-label={newCount ? `${tab.label}, ${newCount} new` : undefined}
                className={`${ITEM} ${height} ${tab.current ? 'text-accent-dark' : 'text-tone-500 hover:text-tone-700'} ${
                  tab.primary ? 'ring-1 ring-inset ring-accent/40' : ''
                }`}
              >
                <span className="relative flex">
                  {Icon && <Icon className="h-5 w-5" aria-hidden="true" />}
                  {newCount > 0 && <span aria-hidden="true" className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-accent" />}
                </span>
                <span className={compact ? 'sr-only' : 'max-w-full truncate'}>{tab.label}</span>
              </Link>
            </li>
          );
        })}
        {withMenu && (
          <li className="min-w-0 flex-1">
            <button
              type="button"
              onClick={onMenu}
              aria-expanded={menuOpen}
              className={`${ITEM} ${height} text-tone-500 hover:text-tone-700`}
            >
              <Menu className="h-5 w-5" aria-hidden="true" />
              <span className={compact ? 'sr-only' : ''}>Menu</span>
            </button>
          </li>
        )}
      </ul>
    </nav>
  );

  return createPortal(bar, document.body);
}
