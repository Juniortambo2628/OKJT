import { useEffect, useRef } from 'react';
import { ArrowUpRight } from 'lucide-react';

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
 */
export default function BookingEmbed({ url }) {
  const target = useRef(null);
  const link = calLink(url);

  useEffect(() => {
    if (!link || !target.current) return;
    const Cal = loadCal();
    target.current.innerHTML = '';
    Cal('inline', { elementOrSelector: target.current, calLink: link, layout: 'month_view' });
    Cal('ui', { theme: 'light', hideEventTypeDetails: false, layout: 'month_view' });
  }, [link]);

  return (
    <div id="booking" className="glass-strong rounded-[2rem] p-3 sm:p-5">
      {link && <div ref={target} className="min-h-[34rem] w-full overflow-hidden rounded-[1.5rem]" />}
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
