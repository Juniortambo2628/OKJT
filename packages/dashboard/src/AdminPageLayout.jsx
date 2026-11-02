import { motion } from 'framer-motion';
import AdminFloatingToolbar from './AdminFloatingToolbar.js';
import { SidePanelAside, SidePanelMobileBar } from './AdminSidePanel.js';
import { useComponentDefaults, useDashboard } from './DashboardProvider.js';

/**
 * AdminPageLayout — standardized layout shared by every admin dashboard page.
 *
 * Order:
 *   1. Hero section (title, breadcrumb, description)
 *   2. Summary / overview cards (optional)
 *   3. Page content, with the shared side panel on its right (optional)
 *   + the shared floating toolbar (search, filters, page actions)
 *
 * The side panel (see AdminSidePanel) is where pages put their section
 * switcher, tools or secondary lists, so every page has the same shape. On
 * mobile it becomes a sticky chip bar / bottom sheet under the header.
 *
 * Listing pages pass `fill`: on desktop-sized viewports the page then fits the
 * viewport exactly — hero, summary cards and the list's pagination stay put
 * and only the rows inside an AdminListPanel scroll. Smaller screens keep
 * normal page scrolling.
 *
 * @param {ReactNode} hero     - AdminPageHero element
 * @param {ReactNode} summary  - AdminSummaryCards element (optional)
 * @param {ReactNode} children - Main page content
 * @param {Array}     [actions]        - Page actions for the shared toolbar
 * @param {boolean|string|object} [search] - Show the shared search box (see AdminFloatingToolbar)
 * @param {object}    [filters]        - Filter/sort/view config (see AdminToolbarFilters)
 * @param {ReactNode} [toolbarContent] - Custom controls rendered inside the toolbar
 * @param {boolean}   [toolbarHidden]  - Hide the toolbar (e.g. while a bulk-selection bar is shown)
 * @param {boolean}   [fill]           - Fit the viewport; content scrolls inside AdminListPanel
 * @param {object}    [panel]          - Side panel config (see AdminSidePanel);
 *                                      pages without one get the dashboard's
 *                                      default panel (DashboardProvider), if any.
 *                                      A page panel makes the page fit the viewport
 *                                      like `fill` (the left column scrolls).
 *
 * variant="bold" (or componentDefaults.PageLayout): for dark dashboards. The
 * toolbar is the bold one, given whole as `toolbar` (its props: search,
 * filters, view, actions, selection); a panel with `desktopOnly` has no phone
 * bar; `onClick`, `className` and `bodyClassName` go on the page, and the
 * content column scrolls itself on tall-enough desktops (`fill`: an
 * AdminListPanel scrolls its rows instead).
 */
export default function AdminPageLayout(ownProps) {
  const { variant = 'plain', ...props } = useComponentDefaults('PageLayout', ownProps);
  return variant === 'bold' ? <BoldPageLayout {...props} /> : <PlainPageLayout {...props} />;
}

function PlainPageLayout({
  hero,
  summary,
  children,
  actions,
  search,
  filters,
  toolbarContent,
  toolbarHidden = false,
  fill = false,
  panel: pagePanel,
}) {
  const defaultPanel = useDashboard().useDefaultPanel();
  const panel = pagePanel || defaultPanel;
  const showToolbar = !toolbarHidden
    && ((actions && actions.length > 0) || search || filters || toolbarContent);

  const fillBody = 'space-y-6 fit:space-y-0 fit:flex fit:flex-col fit:gap-4 fit:flex-1 fit:min-h-0';
  // A page with its own side panel fits the viewport too, so the panel never
  // makes the page longer; its left column then scrolls on its own.
  const fitPage = fill || !!pagePanel;
  const bodyClass = fill
    ? fillBody
    : pagePanel
      ? 'space-y-6 fit:overflow-y-auto fit:overscroll-contain fit:min-h-0 fit:pr-1 fit:pb-2'
      : 'space-y-6';

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        /* Extra bottom padding so content never hides behind the fixed
           floating toolbar (bottom-center), especially on mobile. */
        className={`admin-page-layout space-y-5 pb-28 lg:pb-24 ${
          fitPage
            ? 'fit:h-[calc(100dvh-7rem)] fit:flex fit:flex-col fit:overflow-hidden fit:space-y-0 fit:gap-5'
            : ''
        }`}
        data-layout={fitPage ? 'fill' : 'flow'}
      >
        {fitPage ? <div className="fit:shrink-0 space-y-5">{hero}{summary}</div> : <>{hero}{summary}</>}

        {panel && panel.mobile !== false && <SidePanelMobileBar panel={panel} />}

        <div className={`lg:flex lg:gap-5 ${fitPage ? 'fit:flex-1 fit:min-h-0' : ''}`}>
          {/* A size container: card grids inside use @-breakpoints (e.g. @3xl:grid-cols-3),
              so they fit the column left beside the side panel, not the whole screen. */}
          <div className={`@container lg:flex-1 min-w-0 ${bodyClass}`}>{children}</div>
          {panel && <SidePanelAside key={panel.id || panel.title} panel={panel} />}
        </div>
      </motion.div>

      {showToolbar && (
        <AdminFloatingToolbar actions={actions} search={search} filters={filters}>
          {toolbarContent}
        </AdminFloatingToolbar>
      )}
    </>
  );
}

function BoldPageLayout({ hero, summary = null, toolbar = null, panel: pagePanel, fill = false, onClick, className = '', bodyClassName = '', children }) {
  const defaultPanel = useDashboard().useDefaultPanel();
  const panel = pagePanel === false ? null : pagePanel || defaultPanel;
  // Header 4rem + the content area's padding (2rem top, 6rem bottom for the toolbar).
  const classes = `fit:h-[calc(100dvh-12rem)] fit:flex fit:flex-col ${className}`.trim();
  // Without an AdminListPanel to scroll, the content column scrolls itself.
  const body = fill
    ? 'fit:h-full fit:flex fit:flex-col'
    : 'fit:h-full fit:overflow-y-auto fit:overscroll-contain fit:-mx-1 fit:px-1 fit:pb-2';

  return (
    <div onClick={onClick} className={classes} data-layout={fill ? 'fill' : 'fit'}>
      <div className="fit:shrink-0">
        {hero}
        {summary && <div className="mb-6">{summary}</div>}
      </div>

      {toolbar && <AdminFloatingToolbar variant="bold" {...toolbar} />}

      {panel && !panel.desktopOnly && panel.mobile !== false && <SidePanelMobileBar panel={panel} />}

      <div className={`fit:flex-1 fit:min-h-0 ${panel ? 'lg:flex lg:gap-5' : ''}`}>
        <div data-scroll-region={fill ? undefined : true} className={`min-w-0 ${panel ? 'lg:flex-1' : ''} ${body} ${bodyClassName}`}>
          {children}
        </div>
        {panel && <SidePanelAside key={panel.id || panel.title} panel={panel} />}
      </div>
    </div>
  );
}
