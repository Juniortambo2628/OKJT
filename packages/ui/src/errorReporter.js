/**
 * Report uncaught browser errors to the server, lifted from TFE
 * (resources/js/lib/errorReporter.js, Sprint 69). The server half is
 * laravel-kit's ClientErrorController. Before it, a console error reached
 * the team only when a tester pasted their devtools output.
 *
 *   import { installErrorReporter } from '@okjt/ui/helpers';
 *   installErrorReporter({ skipPages: [/^\/fan\/bank-savings/] });
 *
 * Kept quiet on purpose:
 *  - extension and third-party noise is dropped (a "Receiving end does not
 *    exist" line is an extension; a script from another origin isn't ours);
 *  - the same error is sent once per page load, and at most maxPerPage in
 *    total, so a render loop cannot flood the endpoint;
 *  - nothing is sent from skipPages (pages whose errors must not leave the
 *    browser; the server drops its own list too);
 *  - the reporter swallows its own failures: it must never be the reason a
 *    page breaks.
 */
export const MAX_PER_PAGE = 10;
export const ENDPOINT = '/client-errors';

const NOISE = [
  /Receiving end does not exist/i,
  /ResizeObserver loop/i,
  /^Script error\.?$/i, // cross-origin script, no detail to act on
  /Non-Error promise rejection captured/i,
];

const FOREIGN_SOURCE = /^(chrome|moz|safari)(-web)?-extension:|^webkit-masked-url:/i;

/**
 * Whether one error is worth sending. `seen` collects what this page has
 * sent already. `skipPages` (RegExps on the path) and `maxPerPage` as in
 * installErrorReporter.
 */
export function shouldReport({ message, source, page, origin }, seen = new Set(), { skipPages = [], maxPerPage = MAX_PER_PAGE } = {}) {
  if (!message) return false;
  if (seen.size >= maxPerPage) return false;
  if (NOISE.some((re) => re.test(message))) return false;
  if (source && FOREIGN_SOURCE.test(source)) return false;
  if (source && origin && /^https?:/i.test(source) && !source.startsWith(origin)) return false;
  if (page && skipPages.some((re) => re.test(page))) return false;

  const key = `${message}|${source || ''}`;
  if (seen.has(key)) return false;
  seen.add(key);
  return true;
}

/**
 * Listen for uncaught errors, unhandled promise rejections and failed
 * resource loads (an <img> 404), and send each worth sending.
 *
 * @param {object} [options]
 * @param {string}   [options.endpoint='/client-errors']
 * @param {RegExp[]} [options.skipPages]   Paths whose errors are never sent
 * @param {number}   [options.maxPerPage=10]
 * @param {Window}   [options.win]         For tests
 */
export function installErrorReporter({ endpoint = ENDPOINT, skipPages = [], maxPerPage = MAX_PER_PAGE, win = typeof window !== 'undefined' ? window : null } = {}) {
  if (!win || win.__okjtErrorReporter) return;
  win.__okjtErrorReporter = true;

  const seen = new Set();

  const send = (report) => {
    try {
      const page = win.location.pathname;
      if (!shouldReport({ ...report, page, origin: win.location.origin }, seen, { skipPages, maxPerPage })) return;
      const body = JSON.stringify({ ...report, page: win.location.href });
      const blob = new Blob([body], { type: 'application/json' });
      if (!(win.navigator.sendBeacon && win.navigator.sendBeacon(endpoint, blob))) {
        win.fetch(endpoint, { method: 'POST', body, headers: { 'Content-Type': 'application/json' }, keepalive: true }).catch(() => {});
      }
    } catch {
      /* never let the reporter throw */
    }
  };

  win.addEventListener('error', (e) => {
    const target = e.target;
    if (target && target !== win && (target.src || target.href)) {
      send({ kind: 'error', message: `Failed to load ${target.tagName?.toLowerCase()}: ${target.src || target.href}`, source: target.src || target.href });
      return;
    }
    send({
      kind: 'error',
      message: String(e.message || ''),
      source: e.filename || null,
      line: e.lineno || null,
      column: e.colno || null,
      stack: e.error && e.error.stack ? String(e.error.stack) : null,
    });
  }, true);

  win.addEventListener('unhandledrejection', (e) => {
    const r = e.reason;
    send({
      kind: 'unhandledrejection',
      message: String((r && r.message) || r || 'Unhandled rejection'),
      stack: r && r.stack ? String(r.stack) : null,
    });
  });
}
