import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import Photo from './Photo.js';
import { Chip } from './ui.js';

/**
 * A large rounded card with a photo behind its words — the marketing pages'
 * main building block. Becomes a link when given `to`.
 */
export default function ImageCard({
  image, title, text, tags = [], to, position, className = 'min-h-[22rem]', titleClass = 'text-2xl sm:text-3xl', children,
}) {
  const Wrapper = to ? Link : 'div';
  return (
    <Wrapper
      to={to}
      className={`group relative isolate flex flex-col justify-end overflow-hidden rounded-[1.75rem] p-6 text-white shadow-[0_30px_60px_-35px_color-mix(in_srgb,var(--color-ink)_70%,transparent)] sm:p-8 ${className}`}
    >
      <Photo image={image} position={position} className="-z-10" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-ink-deep/85 via-ink-deep/25 to-transparent" />
      {to && (
        <span className="absolute right-5 top-5 grid h-10 w-10 place-items-center rounded-full bg-white/15 backdrop-blur transition-colors group-hover:bg-white group-hover:text-ink" aria-hidden="true">
          <ArrowUpRight className="h-4 w-4" />
        </span>
      )}
      {tags.length > 0 && <div className="mb-3 flex flex-wrap gap-2">{tags.map((tag) => <Chip key={tag}>{tag}</Chip>)}</div>}
      {title && <h3 className={`!font-display !font-normal leading-tight tracking-tight !text-white ${titleClass}`}>{title}</h3>}
      {text && <div className="mt-2 max-w-md text-sm leading-relaxed text-white/80">{text}</div>}
      {children}
    </Wrapper>
  );
}
