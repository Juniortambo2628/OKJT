import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { Container, Eyebrow } from '@okjt/site';
import MediaFill from './MediaFill';

/** "Title<br />more" from the CMS and the old pages: line breaks, no markup. */
export const lines = (text) => String(text ?? '').split(/<br\s*\/?>|\n/i).map((line, i, all) => (
  <span key={i}>{line.trim()}{i < all.length - 1 && <br />}</span>
));

/**
 * The top of every public page: a full-bleed photo or clip from the CMS
 * under a large light headline, with breadcrumbs and buttons. `after`
 * overlaps the bottom edge. Until `ready` (the CMS's words have arrived) the
 * headline keeps its place but stays hidden, so the fallback words never
 * flash before the real ones.
 */
export default function PageHero({ media, eyebrow, title, text, breadcrumbs, children, after, tall = false, ready = true }) {
  return (
    <section className="relative" id="hero">
      <div className={`relative isolate flex flex-col justify-center overflow-hidden pt-32 text-white ${tall ? 'min-h-[100svh] pb-40' : 'min-h-[70svh] pb-20'} ${after ? 'pb-48 sm:pb-56' : ''}`}>
        {ready && <MediaFill src={media} eager className="-z-20" />}
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-ink-deep/80 via-ink-deep/50 to-paper" />
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_40%,color-mix(in_srgb,var(--color-accent)_14%,transparent),transparent_65%)]" />
        <Container>
          <motion.div initial={{ opacity: 0, y: 24 }} animate={ready ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }} transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }} aria-busy={!ready || undefined} className="mx-auto max-w-5xl text-center">
            {breadcrumbs && (
              <nav aria-label="Breadcrumb" className="mb-6 flex flex-wrap items-center justify-center gap-1 text-xs text-white/60">
                {breadcrumbs.map((crumb, i) => (
                  <span key={crumb.label} className="flex items-center gap-1">
                    {i > 0 && <ChevronRight className="h-3 w-3" aria-hidden="true" />}
                    {crumb.to ? <Link to={crumb.to} className="hover:text-accent">{crumb.label}</Link> : <span aria-current="page" className="text-white/85">{crumb.label}</span>}
                  </span>
                ))}
              </nav>
            )}
            {eyebrow && <Eyebrow className="!text-accent">{eyebrow}</Eyebrow>}
            <h1 className="mt-5 !font-display text-[2.6rem] !font-extralight leading-[1.04] tracking-tight !text-ink sm:text-6xl lg:text-[5.25rem]">{typeof title === 'string' ? lines(title) : title}</h1>
            {text && <div className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-body sm:text-lg">{text}</div>}
            {children && <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">{children}</div>}
          </motion.div>
        </Container>
      </div>
      {after && <Container className="relative z-10 -mt-40 sm:-mt-48">{after}</Container>}
    </section>
  );
}
