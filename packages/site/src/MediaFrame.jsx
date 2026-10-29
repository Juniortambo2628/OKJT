import { useEffect, useRef, useState } from 'react';
import { useMedia } from './SiteProvider.js';

/** Plays a looping clip only while it's on screen (and never for reduced motion). */
function useInViewPlayback() {
  const ref = useRef(null);
  useEffect(() => {
    const video = ref.current;
    if (!video || typeof IntersectionObserver === 'undefined') return undefined;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return undefined;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) video.play?.()?.catch?.(() => {});
      else video.pause?.();
    }, { threshold: 0.25 });
    observer.observe(video);
    return () => observer.disconnect();
  }, []);
  return ref;
}

/** A product screenshot or clip (a key of `site.media`, or the item), bare (fills its box). */
export function MediaFill({ media, className = '', position = 'top' }) {
  const item = useMedia(media);
  const videoRef = useInViewPlayback();
  const [failed, setFailed] = useState(false);
  if (!item) return null;
  const fit = `h-full w-full object-cover ${position === 'top' ? 'object-top' : 'object-center'} ${className}`;
  if (failed) return <div className={`grid place-items-center bg-tint p-6 text-center text-sm text-muted ${fit}`}>{item.alt}</div>;
  if (item.video) {
    return (
      <video ref={videoRef} className={fit} poster={item.src} muted loop playsInline preload="none" aria-label={item.alt} onError={() => setFailed(true)}>
        <source src={item.video} type="video/mp4" />
      </video>
    );
  }
  return <img src={item.src} alt={item.alt} loading="lazy" decoding="async" className={fit} onError={() => setFailed(true)} />;
}

/**
 * A screenshot or clip in a device frame: a browser window by default, or a
 * phone for media marked `phone`. The bar shows the media's own address.
 */
export default function MediaFrame({ media, className = '', variant }) {
  const item = useMedia(media);
  if (!item) return null;
  const kind = variant || (item.phone ? 'phone' : 'browser');

  if (kind === 'phone') {
    return (
      <div className={`relative mx-auto aspect-[9/19] w-full max-w-[17rem] overflow-hidden rounded-[2.4rem] border-[7px] border-ink bg-ink shadow-[0_40px_80px_-30px_color-mix(in_srgb,var(--color-ink)_70%,transparent)] ${className}`}>
        <div className="absolute left-1/2 top-2 z-10 h-5 w-20 -translate-x-1/2 rounded-full bg-ink" aria-hidden="true" />
        <div className="h-full overflow-hidden rounded-[1.9rem] bg-white"><MediaFill media={item} /></div>
      </div>
    );
  }

  return (
    <div className={`overflow-hidden rounded-2xl border border-white/60 bg-white shadow-[0_40px_80px_-35px_color-mix(in_srgb,var(--color-ink)_55%,transparent)] ${className}`}>
      <div className="flex items-center gap-2 border-b border-line bg-paper px-4 py-2.5" aria-hidden="true">
        <span className="h-2.5 w-2.5 rounded-full bg-[#E8C4B8]" />
        <span className="h-2.5 w-2.5 rounded-full bg-line" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#C5D4B9]" />
        <span className="ml-3 truncate rounded-full bg-white px-3 py-0.5 text-[11px] text-muted">{item.url}</span>
      </div>
      <div className="aspect-[16/10] bg-paper"><MediaFill media={item} /></div>
    </div>
  );
}
