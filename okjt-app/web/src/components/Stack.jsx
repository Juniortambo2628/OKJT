import { useState } from 'react';
import { Eyebrow } from '@okjt/site';
import { logoUrl, splitStack } from '../lib/stack';

/** One logo; if it can't load, its name instead. */
function Logo({ slug, names }) {
  const [failed, setFailed] = useState(false);
  const label = names.join(', ');
  if (failed) return <li className="self-center rounded-full bg-paper px-3 py-1.5 text-xs font-medium text-body ring-1 ring-line">{label}</li>;
  return (
    <li title={label} className="grid h-14 w-14 place-items-center rounded-2xl bg-white shadow-[0_6px_16px_-10px_rgb(0_0_0/0.5)] ring-1 ring-line">
      <img src={logoUrl(slug)} alt={label} width="28" height="28" loading="lazy" onError={() => setFailed(true)} className="logo-dark h-7 w-7" />
    </li>
  );
}

/** "Built with": the technologies' logos, then any without one in words. */
export default function Stack({ names, label = 'Built with', max = 18 }) {
  const { logos, words } = splitStack(names);
  if (!logos.length && !words.length) return null;
  const extra = words.slice(0, max);
  return (
    <div className="glass mt-4 rounded-3xl p-5">
      <Eyebrow>{label}</Eyebrow>
      {logos.length > 0 && <ul className="mt-4 flex flex-wrap gap-2.5" aria-label="Technologies">{logos.map((logo) => <Logo key={logo.slug} {...logo} />)}</ul>}
      {extra.length > 0 && (
        <ul className={`flex flex-wrap gap-1.5 ${logos.length ? 'mt-4' : 'mt-3'}`} aria-label="Other tools">
          {extra.map((name) => <li key={name} className="rounded-full bg-paper px-2.5 py-1 text-[11px] text-soft ring-1 ring-line">{name}</li>)}
          {words.length > max && <li className="px-1 py-1 text-[11px] text-muted">and {words.length - max} more</li>}
        </ul>
      )}
    </div>
  );
}
