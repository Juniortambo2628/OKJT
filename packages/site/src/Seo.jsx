import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useSite } from './SiteProvider.js';

/**
 * The title and description for a path, from `site.seo`:
 * `resolve(path)` first (pages made from data), then `pages[path]`.
 * Anything else, including `privatePaths`, gets the defaults and noindex.
 */
function getMetadata(seo, pathname) {
  const path = pathname.replace(/\/$/, '') || '/';
  const fallback = { title: seo.defaultTitle, description: seo.defaultDescription, indexable: false };
  const resolved = seo.resolve?.(path);
  if (resolved) return { ...fallback, indexable: true, ...resolved };
  const metadata = seo.pages?.[path];
  if (metadata) return { ...metadata, indexable: true };
  return fallback;
}

function upsertMeta(attribute, key, value) {
  let node = document.head.querySelector(`meta[${attribute}="${key}"]`);
  if (!node) {
    node = document.createElement('meta');
    node.setAttribute(attribute, key);
    document.head.appendChild(node);
  }
  node.setAttribute('content', value);
}

function upsertLink(rel, href) {
  let node = document.head.querySelector(`link[rel="${rel}"]`);
  if (!node) {
    node = document.createElement('link');
    node.setAttribute('rel', rel);
    document.head.appendChild(node);
  }
  node.setAttribute('href', href);
}

/** Route-aware metadata for the public pages: title, description, canonical, Open Graph. */
export default function Seo() {
  const { seo } = useSite();
  const { pathname } = useLocation();

  useEffect(() => {
    const metadata = getMetadata(seo, pathname);
    const canonical = `${seo.origin}${pathname === '/' ? '/' : pathname.replace(/\/$/, '')}`;
    document.title = metadata.title;
    upsertMeta('name', 'description', metadata.description);
    upsertMeta('name', 'robots', metadata.indexable ? 'index, follow' : 'noindex, nofollow');
    upsertLink('canonical', canonical);
    upsertMeta('property', 'og:type', 'website');
    upsertMeta('property', 'og:site_name', seo.siteName);
    upsertMeta('property', 'og:title', metadata.title);
    upsertMeta('property', 'og:description', metadata.description);
    upsertMeta('property', 'og:url', canonical);
    upsertMeta('property', 'og:locale', seo.locale);
    upsertMeta('name', 'twitter:card', 'summary');
    upsertMeta('name', 'twitter:title', metadata.title);
    upsertMeta('name', 'twitter:description', metadata.description);
  }, [seo, pathname]);

  return null;
}
