import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { useSite } from './SiteProvider.js';

/** Page-width wrapper shared by every marketing section. */
export function Container({ className = '', children }) {
  return <div className={`mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 ${className}`}>{children}</div>;
}

/** The project's mark and wordmark (`site.brand.logo`). `light` for use over photos and dark panels. */
export function Logo({ light = false, className = '' }) {
  const { brand } = useSite();
  return (
    <Link to="/" className={`flex items-center gap-2.5 ${className}`} aria-label={`${brand.name} home`}>
      <img src={light ? brand.logo.light : brand.logo.dark} alt="" className="h-8 w-auto" />
    </Link>
  );
}

const PILL_VARIANTS = {
  dark: 'bg-ink text-white hover:bg-body shadow-[0_10px_30px_-12px_color-mix(in_srgb,var(--color-ink)_60%,transparent)]',
  light: 'bg-white text-ink hover:bg-tint shadow-[0_10px_30px_-12px_color-mix(in_srgb,var(--color-ink)_35%,transparent)]',
  outline: 'border border-line-strong text-body hover:border-accent hover:text-ink',
  glass: 'border border-white/40 bg-white/10 text-white backdrop-blur hover:bg-white/20',
};

/** The rounded call-to-action link used across the marketing pages. */
export function PillLink({ to, variant = 'dark', size = 'md', arrow = false, className = '', children, ...rest }) {
  const sizes = { sm: 'px-4 py-2 text-xs', md: 'px-6 py-3 text-sm', lg: 'px-7 py-3.5 text-sm sm:text-base' };
  return (
    <Link
      to={to}
      className={`inline-flex items-center justify-center gap-2 rounded-full font-semibold uppercase tracking-[0.08em] transition-colors ${sizes[size]} ${PILL_VARIANTS[variant]} ${className}`}
      {...rest}
    >
      {children}
      {arrow && <ArrowUpRight className="h-4 w-4" aria-hidden="true" />}
    </Link>
  );
}

/** Small uppercase label above a heading. */
export function Eyebrow({ light = false, className = '', children }) {
  return (
    <div className={`text-[11px] font-semibold uppercase tracking-[0.22em] ${light ? 'text-white/75' : 'text-accent'} ${className}`}>
      {children}
    </div>
  );
}

/** Rounded tag chip, as on photo cards ("Article", "Design"). */
export function Chip({ light = true, children }) {
  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-[11px] font-semibold ${light ? 'bg-white text-ink' : 'bg-ink/5 text-body'}`}>
      {children}
    </span>
  );
}

/** Eyebrow, large light headline and an optional paragraph. */
export function SectionHeading({ eyebrow, title, text, align = 'center', light = false, as = 'h2', className = '' }) {
  const Tag = as;
  const centered = align === 'center';
  return (
    <div className={`${centered ? 'mx-auto max-w-3xl text-center' : 'max-w-2xl'} ${className}`}>
      {eyebrow && <Eyebrow light={light}>{eyebrow}</Eyebrow>}
      <Tag className={`mt-3 !font-display text-4xl !font-light leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl ${light ? '!text-white' : '!text-ink'}`}>
        {title}
      </Tag>
      {text && <div className={`mt-5 text-base leading-relaxed sm:text-lg ${centered ? 'mx-auto max-w-2xl' : ''} ${light ? 'text-white/80' : 'text-soft'}`}>{text}</div>}
    </div>
  );
}
