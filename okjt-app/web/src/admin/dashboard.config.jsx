import {
  BarChart3, BookOpen, Briefcase, CalendarCheck, Compass, FolderOpen, Gem, Image, Inbox, LayoutDashboard,
  Mail, MessageSquareQuote, Settings, Sparkles, UserCog, Users, UsersRound,
} from 'lucide-react';
import AccountMenu from './AccountMenu';

/** The sidebar: content the site shows, then what visitors send, then setup. */
export const NAV = [
  { items: [{ id: 'overview', path: '/admin', label: 'Overview', icon: LayoutDashboard }] },
  {
    title: 'Content',
    items: [
      { id: 'projects', path: '/admin/projects', label: 'Projects', icon: Briefcase },
      { id: 'services', path: '/admin/services', label: 'Services', icon: Sparkles },
      { id: 'pillars', path: '/admin/pillars', label: 'Approach', icon: Compass },
      { id: 'insights', path: '/admin/insights', label: 'Insights', icon: BookOpen },
      { id: 'testimonials', path: '/admin/testimonials', label: 'Testimonials', icon: MessageSquareQuote },
      { id: 'clients', path: '/admin/clients', label: 'Clients', icon: Gem },
      { id: 'team', path: '/admin/team', label: 'Team', icon: UsersRound },
      { id: 'values', path: '/admin/values', label: 'Values', icon: FolderOpen },
      { id: 'stats', path: '/admin/stats', label: 'Stats', icon: BarChart3 },
    ],
  },
  {
    title: 'Visitors',
    items: [
      { id: 'requests', path: '/admin/requests', label: 'Enquiries', icon: Inbox },
      { id: 'subscribers', path: '/admin/subscribers', label: 'Subscribers', icon: Mail },
      { id: 'rsvps', path: '/admin/rsvps', label: 'RSVPs', icon: CalendarCheck },
    ],
  },
  {
    title: 'Setup',
    items: [
      { id: 'media', path: '/admin/media', label: 'Media library', icon: Image },
      { id: 'settings', path: '/admin/settings', label: 'Site settings', icon: Settings },
      { id: 'users', path: '/admin/users', label: 'People', icon: UserCog },
    ],
  },
];

/**
 * The kit's dashboard (DashboardProvider), dressed in the site's deep brown:
 * a near-black sidebar with gold for the page you're on. No presence,
 * sharing or version history (they need okjt/laravel-kit's API), so the
 * header shows only the account menu.
 */
export const dashboard = {
  home: { label: 'Overview', path: '/admin' },
  useDefaultPanel: () => null,
  useAfterChange: () => undefined,
  api: null,
  shell: {
    logo: { src: '/logos/OKJT-Logos/OKJTechLogo-White_Transparent.png', alt: 'OKJTech', to: '/admin' },
    nav: NAV,
    quickLinks: [],
    background: 'radial-gradient(circle at 70% 0%, color-mix(in srgb, var(--color-accent) 6%, transparent), transparent 55%), var(--color-paper)',
    sidebarBackground: 'linear-gradient(180deg, #0f0d08 0%, #0b0906 100%)',
    sidebarScrollbar: 'var(--color-line-strong) transparent',
    headerBackground: 'color-mix(in srgb, var(--color-paper) 88%, transparent)',
    headerBorder: '1px solid var(--color-line)',
    sidebarClass: 'border-r border-line',
    logoClass: 'h-9 w-auto',
    navTitleClass: 'px-3 mb-1 text-[10px] font-bold uppercase tracking-[0.18em] text-tone-400',
    navActiveClass: 'text-accent bg-fill',
    navIdleClass: 'text-tone-600 hover:text-ink hover:bg-tone-100',
    headerButtonClass: 'text-soft hover:bg-accent/10 hover:text-accent',
    headerActions: [],
    menuNewsDot: false,
    collapsible: true,
    AccountMenu,
  },
};
