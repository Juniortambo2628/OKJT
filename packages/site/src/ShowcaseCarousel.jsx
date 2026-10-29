import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { MediaFill } from './MediaFrame.js';
import { useSite } from './SiteProvider.js';
import { Chip, SectionHeading } from './ui.js';

/**
 * Heading and arrows on the left; a stack of media cards on the right,
 * the next one peeking out behind. Items: { media, tags, title, text }.
 */
export default function ShowcaseCarousel({ eyebrow, title, text, items }) {
  const { media: MEDIA = {} } = useSite();
  const [index, setIndex] = useState(0);
  const go = (step) => setIndex((i) => (i + step + items.length) % items.length);
  const item = items[index];
  const next = items[(index + 1) % items.length];
  // Cards take the shape of their media: tall for phone screens, wide for the dashboard.
  const shape = MEDIA[item.media]?.phone ? 'mx-auto aspect-[9/16] max-w-xs' : 'aspect-[4/3]';

  return (
    <div className="grid items-center gap-12 lg:grid-cols-2">
      <div>
        <SectionHeading eyebrow={eyebrow} title={title} text={text} align="left" />
        <div className="mt-8 flex items-center gap-3">
          <button type="button" onClick={() => go(-1)} aria-label="Previous" className="grid h-12 w-12 place-items-center rounded-full bg-white text-ink shadow-[0_10px_30px_-12px_color-mix(in_srgb,var(--color-ink)_35%,transparent)] transition-transform hover:-translate-x-0.5">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button type="button" onClick={() => go(1)} aria-label="Next" className="grid h-12 w-12 place-items-center rounded-full bg-white text-ink shadow-[0_10px_30px_-12px_color-mix(in_srgb,var(--color-ink)_35%,transparent)] transition-transform hover:translate-x-0.5">
            <ChevronRight className="h-5 w-5" />
          </button>
          <span className="ml-3 text-sm tabular-nums text-muted" aria-live="polite">{index + 1} / {items.length}</span>
        </div>
        <ol className="mt-8 hidden space-y-2 text-sm lg:block">
          {items.map((it, i) => (
            <li key={it.title}>
              <button type="button" onClick={() => setIndex(i)} className={`text-left transition-colors ${i === index ? 'font-semibold text-ink' : 'text-muted hover:text-body'}`}>
                {String(i + 1).padStart(2, '0')} · {it.title}
              </button>
            </li>
          ))}
        </ol>
      </div>

      <div className="relative mx-auto w-full max-w-xl pr-4 sm:pr-8">
        <div className="absolute inset-y-6 right-0 w-full overflow-hidden rounded-[2rem] opacity-60" aria-hidden="true">
          <MediaFill media={next.media} />
        </div>
        <AnimatePresence mode="wait">
          <motion.div
            key={item.title}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.4 }}
            className={`relative overflow-hidden rounded-[2rem] border-[6px] border-white bg-white shadow-[0_40px_80px_-30px_color-mix(in_srgb,var(--color-ink)_60%,transparent)] ${shape}`}
          >
            <MediaFill media={item.media} />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink-deep/90 via-ink-deep/60 to-transparent p-4 pt-12 text-white sm:p-6 sm:pt-24">
              <div className="hidden flex-wrap gap-2 sm:flex">{item.tags.map((tag) => <Chip key={tag}>{tag}</Chip>)}</div>
              <h3 className="!font-display text-lg !font-normal tracking-tight !text-white sm:mt-3 sm:text-3xl">{item.title}</h3>
              <div className="mt-2 hidden text-sm leading-relaxed text-white/80 sm:block">{item.text}</div>
            </div>
          </motion.div>
        </AnimatePresence>
        <div className="mt-4 text-sm leading-relaxed text-soft sm:hidden">{item.text}</div>
      </div>
    </div>
  );
}
