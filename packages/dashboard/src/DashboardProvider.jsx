import { createContext, useContext } from 'react';

const DashboardContext = createContext(null);

/** What a dashboard gets without settings: no default side panel, nothing to refresh. */
const DEFAULT_ROLES = [
  { value: 'owner', label: 'Owner', description: 'Everything, including people and roles' },
  { value: 'editor', label: 'Editor', description: 'Changes what is in the dashboard' },
  { value: 'viewer', label: 'Viewer', description: 'Can look around but not change anything' },
];

const DEFAULTS = {
  home: { label: 'Dashboard', path: '/' },
  useDefaultPanel: () => null,
  useAfterChange: () => undefined,
  api: null,
  modules: [],
  roles: DEFAULT_ROLES,
  roleLabel: (role) => DEFAULT_ROLES.find((r) => r.value === role)?.label || role,
  anonymousName: 'Someone',
  removeCollaborator: null,
  tutorialSteps: [],
};

/** The shell's defaults: drawn from the theme, nothing project-specific. */
const DEFAULT_SHELL = {
  logo: { src: '', alt: '', to: '/' },
  nav: [],
  quickLinks: [],
  background: 'linear-gradient(180deg, var(--color-paper) 0%, var(--color-tint) 100%)',
  sidebarBackground: 'linear-gradient(180deg, var(--color-body) 0%, var(--color-ink) 100%)',
  sidebarScrollbar: 'var(--color-soft) var(--color-body)',
  headerBackground: 'color-mix(in srgb, var(--color-paper) 95%, transparent)',
  headerBorder: '1px solid color-mix(in srgb, var(--color-accent) 10%, transparent)',
  badgeClass: 'bg-accent-soft text-body',
  Banner: null,
  Notifications: null,
  AccountMenu: null,
  // The frame's shape and look (defaults: Naoa's).
  sidebarWidth: 280,
  collapsible: false,
  railWidth: 80,
  logoClass: 'h-10 w-auto',
  railLogoClass: 'h-9 w-12 object-contain',
  navTitleClass: 'px-3 mb-1 text-[10px] font-bold uppercase tracking-[0.18em] text-white/50',
  navItemClass: 'px-3 py-2 rounded-lg',
  navActiveClass: 'text-accent-dark bg-white shadow-sm',
  navIdleClass: 'text-white/75 hover:text-accent-dark hover:bg-white',
  headerButtonClass: 'text-soft hover:bg-accent/10 hover:text-accent',
  headerActions: ['share', 'history', 'tour'],
  HeaderStart: null,
  Search: null,
  HistoryDrawer: null,
  ShareModal: null,
};

/**
 * The project's dashboard settings:
 *
 *   home              the first breadcrumb on every page: { label, path }
 *   useDefaultPanel() the side panel for pages without their own (a panel
 *                     config, see AdminSidePanel), or null for none
 *   useAfterChange()  a function to call after any successful save (e.g. to
 *                     refresh who-changed-what), or undefined
 *
 * For working together (presence, history, sharing — the okjt/laravel-kit API):
 *
 *   api               the app's API client (axios-like: get, post, patch,
 *                     delete), already sending the workspace header; its calls
 *                     resolve to the response body ({ success, data, message })
 *   modules           the dashboard's pages: [{ key, path, label }]
 *   roles, roleLabel  the roles people can be given: [{ value, label, description }]
 *   anonymousName     who made a change nobody signed in made ("Someone")
 *   removeCollaborator(person)  takes someone's access away; defaults to
 *                     DELETE /collaborators/{id}
 *
 * For the shell (DashboardShell):
 *
 *   shell.logo        { src, alt, to } at the top of the sidebar
 *   shell.nav         sidebar groups: [{ title?, items: [{ path, icon, label, id }] }]
 *   shell.quickLinks  header shortcuts: [{ path, icon, label, id }]
 *   shell.Banner, shell.Notifications, shell.AccountMenu   the project's own
 *                     components for the strip under the header, the bell,
 *                     and the account menu (it gets `compactLinks`)
 *   shell.background, sidebarBackground, sidebarScrollbar, headerBackground,
 *   headerBorder, badgeClass   CSS for the frame (theme-based by default)
 *   shell.sidebarWidth  the sidebar's width in px (280)
 *   shell.collapsible   on wide screens the menu button folds the sidebar to a
 *                     rail of icons (shell.railWidth px, 80); remembered
 *   shell.logoClass, railLogoClass, navTitleClass, navItemClass, navActiveClass,
 *   navIdleClass, headerButtonClass   classes for the logo, the sidebar's
 *                     group titles and pages, and the header's buttons
 *   shell.headerActions  the header's own buttons, in order: 'share',
 *                     'history', 'tour' (leave one out to hide it)
 *   shell.HeaderStart  the project's own pieces after the page title (e.g. a
 *                     workspace switcher)
 *   shell.Search      the project's search, before who's online
 *   shell.HistoryDrawer, shell.ShareModal   the project's own version history
 *                     and share panels ({ open, onClose }) in place of the
 *                     kit's (which need okjt/laravel-kit's API)
 *   tutorialSteps     the guided tour (see AdminTutorial)
 */
export function DashboardProvider({ dashboard, children }) {
  return <DashboardContext.Provider value={dashboard}>{children}</DashboardContext.Provider>;
}

/** The dashboard settings, with the defaults filled in. */
export function useDashboard() {
  const settings = useContext(DashboardContext);
  return { ...DEFAULTS, ...settings, shell: { ...DEFAULT_SHELL, ...settings?.shell, logo: { ...DEFAULT_SHELL.logo, ...settings?.shell?.logo } } };
}
