/**
 * The pure half of @okjt/inertia: where a kit link should take you. No React
 * and no Inertia, so `node --test` loads it.
 *
 * From Tena-host's bridge (resources/js/Components/V2/V2Site.jsx), which ran
 * the kit's public pages inside its Inertia app.
 */

/** A react-router `To` (a string or { pathname, search, hash }) as a string. */
export function toHref(to) {
  if (typeof to === 'string') return to;
  if (!to) return '';
  const { pathname = '', search = '', hash = '' } = to;
  const q = search && !search.startsWith('?') ? `?${search}` : search;
  const h = hash && !hash.startsWith('#') ? `#${hash}` : hash;
  return `${pathname}${q}${h}`;
}

/**
 * What following `to` from `current` (a URL or a URL string) means:
 *   { kind: 'external', href }  another site: load it
 *   { kind: 'hash', href }      this page, another #section: stay, change the hash
 *   { kind: 'visit', href }     another page here: an Inertia visit
 */
export function planNavigation(to, current) {
  const here = new URL(String(current));
  const next = new URL(toHref(to) || here.href, here.href);
  if (next.origin !== here.origin) return { kind: 'external', href: next.href };
  if (next.pathname === here.pathname && next.search === here.search) {
    return { kind: 'hash', href: next.hash || next.pathname + next.search };
  }
  return { kind: 'visit', href: next.pathname + next.search + next.hash };
}

/**
 * Inertia's page url ("/path?x=1") and the browser's hash as react-router's
 * location. Inertia leaves the hash out of `url`, so it is passed in.
 */
export function locationFromUrl(url = '/', hash = '') {
  const [pathAndSearch] = String(url).split('#');
  const [pathname, search = ''] = pathAndSearch.split('?');
  return { pathname: pathname || '/', search: search ? `?${search}` : '', hash, state: null, key: hash || 'default' };
}
