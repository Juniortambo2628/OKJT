import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { live, useProjects } from '../lib/content';
import { mediaUrl } from '../lib/media';

/**
 * Logos this app already has, for products whose Logo isn't uploaded yet
 * (Dashboard → Projects → Logo replaces them).
 */
const KNOWN = [
  { match: /\bnaoa\b/i, src: '/brand/products/naoa.png' },
  { match: /okj ?tech(nologies)?\b.*(studio|platform|portfolio)/i, src: '/logos/OKJT-Logos/OKJTechLogo-White_Transparent.png' },
];

export const logoFor = (project) => project.logo || KNOWN.find((k) => k.match.test(project.title))?.src || null;

/**
 * A logo with its empty transparent margins cut away, and its shape
 * (width ÷ height): { src, ratio }. Logos come from this site, so they can be
 * read on a canvas; if that fails the original is used as it is. Each logo is
 * read once and shared by every copy in the marquee, across visits to the page.
 */
const trimmed = new Map();
function trim(url) {
  if (trimmed.has(url)) return trimmed.get(url);
  const job = new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      try {
        const w = img.naturalWidth;
        const h = img.naturalHeight;
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        ctx.drawImage(img, 0, 0);
        const { data } = ctx.getImageData(0, 0, w, h);
        let top = h; let left = w; let right = -1; let bottom = -1;
        for (let y = 0; y < h; y += 1) {
          for (let x = 0; x < w; x += 1) {
            if (data[(y * w + x) * 4 + 3] > 16) {
              if (x < left) left = x;
              if (x > right) right = x;
              if (y < top) top = y;
              if (y > bottom) bottom = y;
            }
          }
        }
        if (right < 0) throw new Error('empty');
        const cw = right - left + 1;
        const ch = bottom - top + 1;
        const out = document.createElement('canvas');
        out.width = cw;
        out.height = ch;
        out.getContext('2d').drawImage(canvas, left, top, cw, ch, 0, 0, cw, ch);
        resolve({ src: out.toDataURL('image/png'), ratio: cw / ch });
      } catch {
        resolve({ src: url, ratio: img.naturalWidth / img.naturalHeight || 2 });
      }
    };
    img.onerror = () => resolve({ src: url, ratio: 2 });
    img.src = url;
  });
  trimmed.set(url, job);
  return job;
}

/** Every logo trimmed ({ url: { src, ratio } }), or null until all of them are. */
function useTrimmedAll(urls) {
  const key = urls.join('\n');
  const [state, setState] = useState({ key: null, logos: null });
  useEffect(() => {
    if (!urls.length) return undefined;
    let alive = true;
    Promise.all(urls.map(trim)).then((results) => {
      if (alive) setState({ key, logos: Object.fromEntries(urls.map((u, i) => [u, results[i]])) });
    });
    return () => { alive = false; };
    // `key` stands for `urls`.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  return state.key === key ? state.logos : null;
}

/**
 * Every logo gets the same visual area, so a wide wordmark and a square
 * mark look equally weighty; heights stay within sensible bounds.
 */
const AREA = 9000;
const sizeFor = (ratio) => {
  let height = Math.sqrt(AREA / ratio);
  height = Math.min(84, Math.max(40, height));
  let width = height * ratio;
  if (width > 220) { width = 220; height = width / ratio; }
  return { width: Math.round(width), height: Math.round(height) };
};

/** One product's logo, in white (own colours on hover), already trimmed. */
function Mark({ project, trimmed: { src, ratio } }) {
  const size = sizeFor(ratio);
  return (
    <Link to={`/projects/${project.slug}`} title={project.title} className="flex h-28 shrink-0 items-center px-8 opacity-85 transition-opacity hover:opacity-100 sm:px-12">
      <img src={src} alt={project.title} style={size} className="logo-light max-w-none origin-center scale-75 object-contain sm:scale-100" />
    </Link>
  );
}

/**
 * The flagship products' logos, white, sliding past under the hero's
 * headline. Only products with a logo appear. Hovering pauses it; people who
 * prefer less motion see them still. Its row is held open while the logos are
 * fetched and trimmed, then they fade in together at their final size, so
 * nothing below it moves and no logo changes size in view.
 */
export default function LogoCarousel() {
  const { data, isPending } = useProjects();
  const still = useReducedMotion();
  const marks = live(data)
    .filter((p) => p.type === 'flagship')
    .map((project) => ({ project, logo: logoFor(project) }))
    // One mark per product name (a product may be listed twice).
    .filter((m, i, all) => m.logo && all.findIndex((o) => o.logo === m.logo) === i)
    .map((m) => ({ ...m, url: mediaUrl(m.logo) }));
  const logos = useTrimmedAll(marks.map((m) => m.url));
  if (!isPending && !marks.length) return null;
  if (!logos) return <div className="mx-auto mt-10 h-28 max-w-4xl" aria-hidden="true" />;
  // Enough copies to fill the row, then doubled so the loop has no seam.
  const row = [];
  while (row.length < 8) row.push(...marks);
  const loop = still ? marks : [...row, ...row];
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }} className="mx-auto mt-10 max-w-4xl">
      <div className="relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]">
        <div className={`flex w-max ${still ? 'mx-auto flex-wrap justify-center' : 'logo-marquee'}`} role="list" aria-label="Flagship products">
          {loop.map((m, i) => <div role="listitem" key={`${m.project.id}-${i}`} aria-hidden={i >= marks.length || undefined}><Mark project={m.project} trimmed={logos[m.url]} /></div>)}
        </div>
      </div>
    </motion.div>
  );
}
