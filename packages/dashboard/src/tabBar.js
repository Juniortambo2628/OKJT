/**
 * The pure half of the phone tab bar (F5, `shell.tabBar`): which sidebar items
 * become tabs and which one is current. No React, so it is easy to test.
 *
 * Lifted from TFE (`resources/js/lib/dashboardTabs.js`). Tabs are PICKED from
 * the sidebar (`shell.nav`) by path, never written out a second time, so a
 * tab's label and icon can't drift from the sidebar item it stands for.
 * Changed on the way: items are found by `path` (the kit's nav has no route
 * names), and nav is the kit's grouped shape.
 */

/**
 * Where a floating toolbar sits: today's place without a tab bar; above the
 * bar on phones and tablets when `shell.tabBar` is on.
 */
export function toolbarBottomClass(tabBarOn) {
  return tabBarOn
    ? 'bottom-[calc(var(--okjt-tabbar-h,0px)+0.75rem)] lg:bottom-6'
    : 'bottom-[max(0.75rem,env(safe-area-inset-bottom))] sm:bottom-6';
}

/** Every item in `shell.nav` ([{ title?, items }]), in order. */
export function navItems(nav = []) {
  return nav.flatMap((section) => section?.items || []);
}

/**
 * The nav item for a path: the longest matching item path wins, so
 * `/app/tickets/purchases` beats `/app/tickets`. A shared prefix that isn't a
 * path segment (`/app/ticketsx`) is not a match.
 */
export function activeNavItem(nav = [], pathname = '') {
  const path = String(pathname).split(/[?#]/)[0];
  return navItems(nav)
    .filter((it) => it.path && (path === it.path || path.startsWith(`${it.path.replace(/\/$/, '')}/`)))
    .sort((a, b) => b.path.length - a.path.length)[0] || null;
}

/**
 * The sidebar's current item: the path of the longest item that matches,
 * so a nested page marks one item (Sales, not Tickets and Sales). Which
 * items can match is unchanged: the page itself, or a path it starts with;
 * the home item only on its own page.
 */
export function sidebarActivePath(nav = [], pathname = '', homePath = '/') {
  return navItems(nav)
    .filter((it) => it.path && (pathname === it.path || (it.path !== homePath && pathname.startsWith(it.path))))
    .sort((a, b) => b.path.length - a.path.length)[0]?.path ?? null;
}

/**
 * The tabs: `tabs` is a list of nav paths, or `{ path, label?, primary? }`,
 * in tab order. A path that isn't in this person's nav is left out rather
 * than drawn as a dead tab (a role without that page).
 */
export function tabBarItems(nav = [], tabs = [], pathname = '') {
  const items = navItems(nav);
  const current = activeNavItem(nav, pathname);
  return tabs
    .map((t) => (typeof t === 'string' ? { path: t } : t))
    .map((t) => {
      const item = items.find((it) => it.path === t?.path);
      if (!item) return null;
      return {
        path: item.path,
        id: item.id,
        label: t.label || item.label,
        icon: item.icon,
        primary: Boolean(t.primary),
        current: current?.path === item.path,
      };
    })
    .filter(Boolean);
}
