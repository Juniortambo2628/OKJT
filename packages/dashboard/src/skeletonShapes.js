/**
 * skeletonShapes — the pure half of the page skeleton (F9, `shell.pageSkeleton`): which shape
 * stands in for a page while it loads. No React, so it is easy to test.
 *
 * Lifted from TFE (`resources/js/lib/pageSkeleton.js`). A page that is still
 * loading is known only by its path, so the shape is matched on the path. The
 * point is that the placeholder has the same SHAPE as the page that lands (a
 * heading, then tiles, cards, a table or a form beside a preview), so content
 * doesn't jump into place. Roughly right is enough; an unmatched path gets
 * the dashboard shape, which reads fine anywhere.
 *
 * Changed on the way: the patterns are TFE's minus its football pages, and a
 * project passes its own (`shell.pageSkeleton.patterns`).
 */

/** Ordered: the first pattern that matches the path wins. */
export const DEFAULT_SKELETON_PATTERNS = [
  // Account and edit pages: a form beside a preview.
  [/\/(profile|security|settings|account)(\/|$)/, 'split'],
  [/\/(edit|create|new)(\/|$)/, 'split'],
  // Lists and queues: a table.
  [/\/(users|members|team|messages|inbox|approvals|requests|orders|invoices|payments|bookings)(\/|$)/, 'table'],
  // Browse pages: a grid of cards.
  [/\/(listings|projects|media|gallery|photos|documents|files|events|news|posts|stories)(\/|$)/, 'cards'],
  // Number-led pages.
  [/\/(dashboard|overview|analytics|reports)(\/|$)/, 'dashboard'],
];

export const SKELETON_VARIANTS = ['dashboard', 'cards', 'table', 'split'];
export const DEFAULT_SKELETON_VARIANT = 'dashboard';

/**
 * The shape for a URL (a full href, a bare path or a URL object). `patterns`
 * are [regex, variant] pairs, tried in order.
 */
export function skeletonVariantFor(url, patterns = DEFAULT_SKELETON_PATTERNS, fallback = DEFAULT_SKELETON_VARIANT) {
  if (!url) return fallback;
  let path = typeof url === 'string' ? url : (url.pathname || String(url));
  try {
    // The base only lets a bare path parse; it is never read.
    path = new URL(path, 'http://localhost').pathname;
  } catch {
    path = path.split('?')[0];
  }
  for (const [pattern, variant] of patterns) {
    if (pattern.test(path)) return variant;
  }
  return fallback;
}
