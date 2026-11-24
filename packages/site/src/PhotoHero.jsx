import { motion } from 'framer-motion';
import Photo from './Photo.js';
import { Container, Eyebrow } from './ui.js';

/** Outlined pill and diagonal hatching: the decorative marks set into hero headlines. */
export function HeroOrnament({ kind = 'pill', className = '' }) {
  if (kind === 'hatch') {
    return (
      <span
        aria-hidden="true"
        className={`inline-block h-[0.55em] w-[2.2em] rounded-sm align-middle opacity-70 ${className}`}
        style={{ backgroundImage: 'repeating-linear-gradient(-55deg, currentColor 0 1.5px, transparent 1.5px 9px)' }}
      />
    );
  }
  return (
    <span aria-hidden="true" className={`relative inline-block h-[0.55em] w-[2.6em] align-middle ${className}`}>
      {[0, 1, 2, 3].map((i) => (
        <span key={i} className="absolute rounded-full border border-current opacity-60" style={{ inset: `${i * 0.06}em ${i * 0.12}em` }} />
      ))}
    </span>
  );
}

/**
 * A full-bleed photo hero with a large light headline. `children` sit under
 * the text (buttons), `feature` between the two (e.g. a search); `after`
 * overlaps the bottom edge (e.g. a panel of cards).
 */
export default function PhotoHero({ image, phoneImage, eyebrow, title, text, children, feature, after, position = 'center', tall = false }) {
  return (
    <section className="relative">
      <div className={`relative isolate overflow-hidden ${tall ? 'min-h-[100svh] pb-56 sm:pb-64' : 'min-h-[78svh] pb-24'} flex flex-col justify-center pt-32 text-white`}>
        <Photo image={image} phoneImage={phoneImage} width={2400} position={position} eager className="-z-20" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-ink-deep/70 via-ink-deep/35 to-ink-deep/60" />
        <Container>
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="mx-auto max-w-5xl text-center">
            {eyebrow && <Eyebrow light>{eyebrow}</Eyebrow>}
            <h1 className="mt-5 !font-display text-[2.75rem] !font-extralight leading-[1.02] tracking-tight !text-white sm:text-7xl lg:text-[6.25rem]">{title}</h1>
            {text && <div className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-white/85 sm:text-lg">{text}</div>}
            {feature}
            {children && <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">{children}</div>}
          </motion.div>
        </Container>
      </div>
      {after && <Container className="relative z-10 -mt-44 sm:-mt-52">{after}</Container>}
    </section>
  );
}
