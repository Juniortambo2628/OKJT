import { useCallback, useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { Container, SECTION_OFFSET, SectionHeading } from '@okjt/site';
import MediaFill from './MediaFill';
import { mediaUrl, isVideo } from '../lib/media';

/**
 * A project's pictures as a grid; one opens full screen, with arrows,
 * the arrow keys and Escape.
 */
export default function Gallery({ id = 'gallery', title, eyebrow = 'Gallery', images }) {
  const [open, setOpen] = useState(null);
  const close = useCallback(() => setOpen(null), []);
  const step = useCallback((by) => setOpen((i) => (i === null ? i : (i + by + images.length) % images.length)), [images.length]);

  useEffect(() => {
    if (open === null) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowRight') step(1);
      if (e.key === 'ArrowLeft') step(-1);
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
  }, [open, close, step]);

  if (!images.length) return null;
  return (
    <section id={id} className={`${SECTION_OFFSET} py-20`}>
      <Container>
        <SectionHeading eyebrow={eyebrow} title={title} />
        <ul className="mt-12 grid auto-rows-[14rem] gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {images.map((src, i) => (
            <li key={src} className={i % 5 === 0 ? 'sm:col-span-2 sm:row-span-2' : ''}>
              <button type="button" onClick={() => setOpen(i)} aria-label={`Open picture ${i + 1} of ${images.length}`} className="group relative block h-full w-full overflow-hidden rounded-[1.5rem] ring-1 ring-white/10 focus-visible:outline-2 focus-visible:outline-accent">
                <MediaFill src={src} />
                <span className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/15" aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      </Container>

      {open !== null && (
        <div role="dialog" aria-modal="true" aria-label={`Picture ${open + 1} of ${images.length}`} className="fixed inset-0 z-[80] flex items-center justify-center bg-black/90 p-4 backdrop-blur" onClick={close}>
          <figure className="relative max-h-full max-w-6xl" onClick={(e) => e.stopPropagation()}>
            {isVideo(images[open])
              ? <video src={mediaUrl(images[open])} className="max-h-[85vh] w-auto rounded-2xl" controls autoPlay />
              : <img src={mediaUrl(images[open])} alt="" className="max-h-[85vh] w-auto rounded-2xl object-contain" />}
            <figcaption className="mt-3 text-center text-sm text-white/70">{open + 1} / {images.length}</figcaption>
          </figure>
          <button type="button" onClick={close} aria-label="Close" className="absolute right-4 top-4 grid h-11 w-11 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20"><X className="h-5 w-5" /></button>
          {images.length > 1 && (
            <>
              <button type="button" onClick={(e) => { e.stopPropagation(); step(-1); }} aria-label="Previous picture" className="absolute left-4 top-1/2 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20"><ChevronLeft className="h-6 w-6" /></button>
              <button type="button" onClick={(e) => { e.stopPropagation(); step(1); }} aria-label="Next picture" className="absolute right-4 top-1/2 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20"><ChevronRight className="h-6 w-6" /></button>
            </>
          )}
        </div>
      )}
    </section>
  );
}
