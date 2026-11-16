import { useEffect } from 'react';

const PHONE = '(max-width: 639.98px)';


/** How many frames the glass probe samples, and the average frame time that counts as dropping frames. */
const PROBE_FRAMES = 45;
const SLOW_FRAME_MS = 22; // below ~45 fps

/**
 * The phone toolbar (lifted from Naoa): the floating toolbar becomes a glass
 * bar at the bottom that tucks away while the page scrolls down and comes
 * back on scroll up. The look is CSS (import '@okjt/dashboard/toolbar-glass.css');
 * this hook only sets two classes on <html>:
 *
 * - `toolbar-tucked` while scrolling down (phones only);
 * - `toolbar-solid` when the device can't blur smoothly: the first scroll on
 *   a phone samples frame times with the glass on, and if frames drop the
 *   bar switches to a solid background (remembered on this device).
 *
 * Reduced transparency and reduced motion are handled in CSS and by the
 * kit's MotionConfig.
 */
export default function useGlassToolbar({ storageKey = 'okjt-toolbar-solid' } = {}) {
  useEffect(() => {
    const root = document.documentElement;
    const phone = window.matchMedia?.(PHONE);
    let solid = false;
    try { solid = localStorage.getItem(storageKey) === '1'; } catch { /* private mode */ }
    root.classList.toggle('toolbar-solid', solid);

    let last = new Map();
    let probing = false;
    let probed = solid;

    const probe = () => {
      if (probed || probing || !phone?.matches || !CSS.supports?.('backdrop-filter', 'blur(1px)')) return;
      probing = true;
      const times = [];
      let prev = performance.now();
      const tick = (now) => {
        times.push(now - prev);
        prev = now;
        if (times.length < PROBE_FRAMES) { requestAnimationFrame(tick); return; }
        const avg = times.slice(5).reduce((a, b) => a + b, 0) / (times.length - 5);
        probed = true;
        probing = false;
        if (avg > SLOW_FRAME_MS) {
          root.classList.add('toolbar-solid');
          try { localStorage.setItem(storageKey, '1'); } catch { /* ignore */ }
        }
      };
      requestAnimationFrame(tick);
    };

    // Scroll events don't bubble, so listen in the capture phase: the page may scroll the window or the shell's main area.
    const onScroll = (e) => {
      if (!phone?.matches) {
        root.classList.remove('toolbar-tucked');
        return;
      }
      const el = e.target === document ? document.scrollingElement : e.target;
      if (!el || typeof el.scrollTop !== 'number' || el.closest?.('.admin-floating-toolbar, [role="dialog"]')) return;
      const top = el.scrollTop;
      const delta = top - (last.get(el) ?? top);
      last.set(el, top);
      if (delta > 6 && top > 80) root.classList.add('toolbar-tucked');
      else if (delta < -6 || top <= 80) root.classList.remove('toolbar-tucked');
      probe();
    };

    document.addEventListener('scroll', onScroll, { capture: true, passive: true });
    return () => {
      document.removeEventListener('scroll', onScroll, { capture: true });
      root.classList.remove('toolbar-tucked', 'toolbar-solid');
      last = new Map();
    };
  }, [storageKey]);
}
