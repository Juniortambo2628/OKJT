import { Link } from 'react-router-dom';
import { useReducedMotion } from 'framer-motion';
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

/** One product's logo, in white. */
function Mark({ project, logo }) {
  return (
    <Link to={`/projects/${project.slug}`} title={project.title} className="flex h-16 shrink-0 items-center px-8 opacity-80 transition-opacity hover:opacity-100 sm:px-12">
      <img src={mediaUrl(logo)} alt={project.title} className="h-10 w-auto max-w-[11rem] object-contain brightness-0 invert sm:h-12" loading="lazy" />
    </Link>
  );
}

/**
 * The flagship products' logos, white, sliding past under the hero's
 * headline. Only products with a logo appear. Hovering pauses it; people who
 * prefer less motion see them still.
 */
export default function LogoCarousel() {
  const { data } = useProjects();
  const still = useReducedMotion();
  const marks = live(data)
    .filter((p) => p.type === 'flagship')
    .map((project) => ({ project, logo: logoFor(project) }))
    // One mark per product name (a product may be listed twice).
    .filter((m, i, all) => m.logo && all.findIndex((o) => o.logo === m.logo) === i);
  if (!marks.length) return null;
  // Enough copies to fill the row, then doubled so the loop has no seam.
  const row = [];
  while (row.length < 8) row.push(...marks);
  const loop = still ? marks : [...row, ...row];
  return (
    <div className="mx-auto mt-10 max-w-4xl">
      <div className="relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]">
        <div className={`flex w-max ${still ? 'mx-auto flex-wrap justify-center' : 'logo-marquee'}`} role="list" aria-label="Flagship products">
          {loop.map((m, i) => <div role="listitem" key={`${m.project.id}-${i}`} aria-hidden={i >= marks.length || undefined}><Mark {...m} /></div>)}
        </div>
      </div>
    </div>
  );
}
