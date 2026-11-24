import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { Spinner } from '@okjt/ui';

const CAL_SCRIPT = 'https://app.cal.com/embed/embed.js';

/** "user/event" from a Cal.com address, or null for any other booking page. */
export function calLink(url) {
  try {
    const { hostname, pathname } = new URL(url);
    if (!/(^|\.)cal\.com$/.test(hostname)) return null;
    const path = pathname.replace(/^\/+|\/+$/g, '');
    return path || null;
  } catch {
    return null;
  }
}

/** Cal.com's own loader: queues calls until embed.js has loaded. */
function loadCal() {
  const w = window;
  if (w.Cal) return w.Cal;
  const Cal = function cal(...args) {
    if (!Cal.loaded) {
      Cal.ns = {};
      Cal.q = Cal.q || [];
      document.head.appendChild(document.createElement('script')).src = CAL_SCRIPT;
      Cal.loaded = true;
    }
    (Cal.q = Cal.q || []).push(args);
  };
  w.Cal = Cal;
  Cal('init', { origin: 'https://cal.com' });
  return Cal;
}

/**
 * The booking calendar. A Cal.com address shows its calendar here, on the
 * site's cream card; any other booking page (Calendly, Google) opens in a new
 * tab. The plain link stays below the calendar in case it can't load.
 * Until the calendar is ready a spinner says so; after 15 s it points to the
 * plain link.
 */
export default function BookingEmbed({ url }) {
  const target = useRef(null);
  const link = calLink(url);
  const [state, setState] = useState('loading'); // loading → slow → ready

  useEffect(() => {
    if (!link || !target.current) return undefined;
    setState('loading');
    const ready = () => setState('ready');
    const Cal = loadCal();
    target.current.innerHTML = '';
    Cal('inline', { elementOrSelector: target.current, calLink: link, layout: 'month_view' });
    Cal('ui', { theme: 'light', hideEventTypeDetails: false, layout: 'month_view' });
    Cal('on', { action: 'linkReady', callback: ready });
    // In case that event never comes: the calendar's frame having loaded is enough.
    const observer = new MutationObserver(() => {
      const frame = target.current?.querySelector('iframe');
      if (frame) { frame.addEventListener('load', () => setTimeout(ready, 600), { once: true }); observer.disconnect(); }
    });
    observer.observe(target.current, { childList: true, subtree: true });
    const slow = setTimeout(() => setState((s) => (s === 'loading' ? 'slow' : s)), 15000);
    return () => { observer.disconnect(); clearTimeout(slow); };
  }, [link]);

  return (
    <div id="booking" className="glass-strong rounded-[2rem] p-3 sm:p-5">
      {link && (
        <div className="relative">
          <div ref={target} className="min-h-[34rem] w-full overflow-hidden rounded-[1.5rem]" />
          {state !== 'ready' && (
            <div role="status" aria-live="polite" className="absolute inset-0 grid place-items-center rounded-[1.5rem] bg-paper">
              <div className="flex flex-col items-center gap-3 px-6 text-center text-sm text-soft">
                <Spinner size="lg" className="motion-reduce:animate-none" />
                {state === 'slow' ? 'The calendar is taking a while. You can also open the booking page below.' : 'Loading the calendar…'}
              </div>
            </div>
          )}
        </div>
      )}
      <div className={link ? 'px-3 pb-2 pt-4 text-center' : 'py-12 text-center'}>
        {!link && <p className="mx-auto mb-6 max-w-md text-soft">Pick a time that suits you on the booking page. It shows times in your own time zone.</p>}
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className={link
            ? 'inline-flex items-center gap-1.5 text-sm font-semibold text-accent hover:text-accent-strong'
            : 'inline-flex items-center justify-center gap-2 rounded-full bg-fill px-7 py-3.5 text-sm font-semibold uppercase tracking-[0.08em] text-on-ink transition-colors hover:bg-fill-hover'}
        >
          {link ? 'Open the booking page' : 'Choose a Time'}
          <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
        </a>
      </div>
    </div>
  );
}
