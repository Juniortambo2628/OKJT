import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { AnimatePresence, motion, MotionConfig } from 'framer-motion';
import { ConfirmHost } from '@okjt/ui';
import { SearchProvider, useSearch } from './SearchContext.js';
import { AdminChromeProvider } from './AdminChromeContext.js';
import AdminTutorial from './AdminTutorial.js';
import { CollaborationProvider, useCollaboration } from './CollaborationContext.js';
import ShareModal from './ShareModal.js';
import VersionHistoryDrawer from './VersionHistoryDrawer.js';
import DashboardSidebar from './DashboardSidebar.js';
import DashboardHeader from './DashboardHeader.js';
import { useDashboard } from './DashboardProvider.js';

// Each page starts with an empty search so a query typed on one list never
// silently filters the next page.
function ResetSearchOnNavigate({ pathname }) {
  const { setSearchQuery } = useSearch();
  useEffect(() => { setSearchQuery(''); }, [pathname, setSearchQuery]);
  return null;
}

// Share and Version history are opened from the header, rendered once here.
// A project may bring its own (shell.ShareModal, shell.HistoryDrawer).
function CollaborationPanels() {
  const { shell } = useDashboard();
  const { shareOpen, setShareOpen, historyOpen, closeHistory, module, notifyDataRestored } = useCollaboration();
  return (
    <>
      {shell.ShareModal
        ? <shell.ShareModal open={shareOpen} onClose={() => setShareOpen(false)} />
        : <ShareModal isOpen={shareOpen} onClose={() => setShareOpen(false)} />}
      {shell.HistoryDrawer
        ? <shell.HistoryDrawer open={historyOpen} onClose={closeHistory} module={module} onRestored={notifyDataRestored} />
        : (
          <AnimatePresence>
            {historyOpen && <VersionHistoryDrawer module={module} onClose={closeHistory} onRestored={notifyDataRestored} />}
          </AnimatePresence>
        )}
    </>
  );
}

const COLLAPSED_KEY = 'okjt.sidebar.collapsed';
const readCollapsed = () => { try { return localStorage.getItem(COLLAPSED_KEY) === '1'; } catch { return false; } };
const isWide = () => typeof window !== 'undefined' && window.matchMedia?.('(min-width: 1024px)').matches;

// Remounts the page after a version is restored, so pages that keep their
// own copy of the data (not just React Query) reload it too.
function PageContent({ pathname, children }) {
  const { dataVersion } = useCollaboration();
  return (
    <motion.div
      key={`${pathname}#${dataVersion}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  );
}

/**
 * DashboardShell — the frame of every dashboard page: sidebar, header,
 * confirm dialogs, the share and version-history panels, the project's banner
 * (`shell.Banner`), the guided tour (`tutorialSteps`) and the content area.
 * Inside it: search, header slots and presence are provided.
 *
 * Sets `admin-theme` on <html> while mounted, for styles that apply to the
 * dashboard only (and to its portalled menus and dialogs).
 *
 * @param {ReactNode} children - Page content to render in the main area
 */
export default function DashboardShell({ children }) {
  const { shell, tutorialSteps } = useDashboard();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  // shell.collapsible: the rail of icons on wide screens, remembered.
  const [collapsed, setCollapsed] = useState(() => shell.collapsible && readCollapsed());
  const onMenuClick = () => {
    if (!shell.collapsible || !isWide()) return setSidebarOpen(true);
    setCollapsed((was) => {
      try { localStorage.setItem(COLLAPSED_KEY, was ? '0' : '1'); } catch { /* not remembered */ }
      return !was;
    });
  };
  const sidebarWidth = collapsed ? shell.railWidth : shell.sidebarWidth;
  const [restartTutorial, setRestartTutorial] = useState(false);
  const location = useLocation();
  // Header slots pages portal into (compact title, status) — see AdminChromeContext.
  const [titleSlot, setTitleSlot] = useState(null);
  const [statusSlot, setStatusSlot] = useState(null);

  // Admin-only accessibility styles (contrast, focus rings, reduced motion) —
  // on <html> so portalled toolbars, menus and dialogs get them too.
  useEffect(() => {
    document.documentElement.classList.add('admin-theme');
    return () => document.documentElement.classList.remove('admin-theme');
  }, []);

  // The sidebar's width, for the page and for fixed pieces portalled outside it.
  useEffect(() => {
    document.documentElement.style.setProperty('--okjt-sidebar-w', `${sidebarWidth}px`);
    return () => document.documentElement.style.removeProperty('--okjt-sidebar-w');
  }, [sidebarWidth]);

  return (
    <MotionConfig reducedMotion="user">
    <SearchProvider>
    <AdminChromeProvider value={{ titleSlot, statusSlot }}>
    <CollaborationProvider>
      <ResetSearchOnNavigate pathname={location.pathname} />
      <div 
        className="min-h-screen"
        style={{ background: shell.background }}
      >
        <DashboardSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} collapsed={collapsed} />

        <div className="lg:ml-[var(--okjt-sidebar-w,280px)]">
          <DashboardHeader
            onMenuClick={onMenuClick}
            menuExpanded={!collapsed}
            onRestartTutorial={() => setRestartTutorial(prev => !prev)}
            titleSlotRef={setTitleSlot}
            statusSlotRef={setStatusSlot}
          />
          
          <ConfirmHost />
          <CollaborationPanels />
          {shell.Banner && <shell.Banner />}

          <AdminTutorial 
            key={restartTutorial ? 'restarted' : 'initial'} 
            isRestarted={restartTutorial}
            onComplete={() => setRestartTutorial(false)}
            steps={tutorialSteps}
          />
         
          <main className="p-4 sm:p-6">
            <PageContent pathname={location.pathname}>{children}</PageContent>
          </main>
        </div>
      </div>
    </CollaborationProvider>
    </AdminChromeProvider>
    </SearchProvider>
    </MotionConfig>
  );
}
