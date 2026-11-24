import { useEffect, useMemo, useState } from 'react';
import { Router } from 'react-router-dom';
import { router, usePage } from '@inertiajs/react';
import { locationFromUrl, planNavigation, toHref } from './navigation.js';

/** The current address as react-router expects it, following #section changes too. */
function useInertiaLocation(url) {
  const [hash, setHash] = useState(() => (typeof window === 'undefined' ? '' : window.location.hash));
  useEffect(() => {
    const sync = () => setHash(window.location.hash);
    sync();
    window.addEventListener('hashchange', sync);
    window.addEventListener('popstate', sync);
    return () => {
      window.removeEventListener('hashchange', sync);
      window.removeEventListener('popstate', sync);
    };
  }, [url]);
  return useMemo(() => locationFromUrl(url, hash), [url, hash]);
}

/**
 * Follow a kit link: another site loads; a #section on this page changes the
 * hash and stays (the kit's layout scrolls to it); another page is an
 * Inertia visit (`visitOptions` are passed to it, e.g. { preserveScroll }).
 */
export function inertiaNavigate(to, { replace = false, visitOptions } = {}) {
  const plan = planNavigation(to, window.location.href);
  if (plan.kind === 'external') {
    window.location.assign(plan.href);
    return;
  }
  if (plan.kind === 'hash') {
    window.history[replace ? 'replaceState' : 'pushState'](window.history.state, '', plan.href);
    window.dispatchEvent(new HashChangeEvent('hashchange'));
    return;
  }
  router.visit(plan.href, { ...visitOptions, replace });
}

/**
 * InertiaRouter: wrap the kit (SiteProvider / DashboardProvider and the pages
 * inside them) in an Inertia app, and the kit's Link, NavLink, useNavigate,
 * useLocation and useSearchParams work as they do under react-router:
 *
 *   <InertiaRouter>
 *     <DashboardProvider dashboard={…}><DashboardShell>{page}</DashboardShell></DashboardProvider>
 *   </InertiaRouter>
 *
 * It is a react-router <Router> whose location is Inertia's current page and
 * whose navigator makes Inertia visits, so nothing in the kit changes. Links
 * to other sites stay plain links (react-router renders those itself), and a
 * #section on the same page stays on the page.
 *
 * Generalised from Tena-host's bridge (V2Site.jsx), where the kit's public
 * pages ran in its Inertia app. Put it inside the Inertia page (a persistent
 * layout is the usual place), since it reads usePage().
 *
 * There are no <Routes> here: Inertia picks the page, so useParams() is
 * empty. Read route parameters from the page's props.
 *
 * @param {object} [visitOptions]  passed to every visit, e.g. { preserveScroll: true }
 */
export default function InertiaRouter({ children, visitOptions }) {
  const { url } = usePage();
  const location = useInertiaLocation(url);
  const navigator = useMemo(() => ({
    createHref: (to) => toHref(to),
    encodeLocation: (to) => to,
    go: (delta) => window.history.go(delta),
    push: (to) => inertiaNavigate(to, { visitOptions }),
    replace: (to) => inertiaNavigate(to, { replace: true, visitOptions }),
  }), [visitOptions]);

  return (
    <Router location={location} navigator={navigator}>
      {children}
    </Router>
  );
}
