import { Link } from 'react-router-dom';
import { useReducedMotion } from 'framer-motion';
import { live, useProjects } from '../lib/content';
import { mediaUrl } from '../lib/media';

/** One product: its logo in white, or its name as a white wordmark until a logo is uploaded. */
function Mark({ project }) {
  return (
    <Link to={`/projects/${project.slug}`} title={project.title} className="flex h-14 shrink-0 items-center px-8 opacity-75 transition-opacity hover:opacity-100 sm:px-10">
      {project.logo
        ? <img src={mediaUrl(project.logo)} alt={project.title} className="h-9 w-auto max-w-[10rem] object-contain brightness-0 invert sm:h-11" loading="lazy" />
        : <span className="whitespace-nowrap font-display text-2xl font-light tracking-tight text-white sm:text-3xl">{project.title.split(':')[0]}</span>}
    </Link>
  );
}

/**
 * The flagship products' logos, white, sliding past under the hero's
 * headline. Hovering pauses it; people who prefer less motion see them still.
 */
export default function LogoCarousel({ label = 'Flagship products' }) {
  const { data } = useProjects();
  const still = useReducedMotion();
  const products = live(data).filter((p) => p.type === 'flagship');
  if (!products.length) return null;
  const loop = still ? products : [...products, ...products];
  return (
    <div className="mx-auto mt-8 max-w-4xl">
      <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/50">{label}</div>
      <div className="relative mt-4 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]">
        <div className={`flex w-max ${still ? 'flex-wrap justify-center' : 'logo-marquee'}`} aria-label={label}>
          {loop.map((p, i) => <Mark key={`${p.id}-${i}`} project={p} />)}
        </div>
      </div>
    </div>
  );
}
