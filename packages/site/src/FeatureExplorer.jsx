import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import Photo from './Photo.js';
import MediaFrame from './MediaFrame.js';
import { usePlaces, useSite } from './SiteProvider.js';

/**
 * A list of feature groups on the left; the chosen one as a large photo card
 * on the right, with a glass summary, its key numbers and a product screen.
 * Each group's photo is the place `group-<id>`; its link goes to `href(group)`.
 */
export default function FeatureExplorer({
  groups, href = (group) => `/features#${group.id}`, linkLabel = 'See every detail', countLabel = 'tools', label = 'Feature areas',
}) {
  const place = usePlaces();
  const { media: MEDIA = {} } = useSite();
  const [activeId, setActiveId] = useState(groups[0].id);
  const active = groups.find((g) => g.id === activeId) || groups[0];

  return (
    <div className="grid gap-8 lg:grid-cols-12 lg:gap-12">
      <div role="tablist" aria-label={label} aria-orientation="vertical" className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-2 lg:mx-0 lg:block lg:space-y-1 lg:overflow-visible lg:border-l lg:border-line-strong lg:px-0 lg:pb-0 lg:col-span-3">
        {groups.map((group) => {
          const selected = group.id === active.id;
          return (
            <button
              key={group.id}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => setActiveId(group.id)}
              className={`relative shrink-0 rounded-full px-4 py-2 text-left transition-colors lg:block lg:w-full lg:rounded-none lg:px-6 lg:py-3 ${selected ? 'bg-ink text-white lg:bg-transparent lg:text-ink' : 'bg-white/60 text-muted hover:text-ink lg:bg-transparent'}`}
            >
              {selected && <motion.span layoutId="explorer-bar" className="absolute -left-px top-0 hidden h-full w-0.5 bg-ink lg:block" />}
              <span className="block whitespace-nowrap text-sm font-semibold lg:text-base lg:font-medium">{group.eyebrow}</span>
              <span className="hidden text-xs text-faint lg:block">{group.features.length} {countLabel}</span>
            </button>
          );
        })}
      </div>

      <div className="lg:col-span-9">
        <AnimatePresence mode="wait">
          <motion.div
            key={active.id}
            role="tabpanel"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.35 }}
            className="group relative isolate flex min-h-[34rem] flex-col justify-between overflow-hidden rounded-[2rem] p-4 sm:p-6 lg:min-h-[38rem]"
          >
            <Photo image={place(`group-${active.id}`)} className="-z-10" />
            <div className="absolute inset-0 -z-10 bg-gradient-to-t from-ink-deep/85 via-ink-deep/10 to-ink-deep/10" />

            <div className="max-w-sm rounded-3xl border border-white/50 bg-white/75 p-6 shadow-xl backdrop-blur-xl">
              <h3 className="!font-display text-2xl !font-normal tracking-tight !text-ink">{active.title}</h3>
              <div className="mt-3 text-sm leading-relaxed text-body">{active.summary}</div>
              <Link to={href(active)} className="mt-5 inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-[0.15em] text-ink hover:text-accent">
                {linkLabel} <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            </div>

            <div className={`pointer-events-none absolute hidden rotate-[-2deg] lg:block ${MEDIA[active.media]?.phone ? 'bottom-8 right-10 w-52' : 'bottom-24 right-6 w-[46%]'}`}>
              <MediaFrame media={active.media} />
            </div>

            <dl className="mt-10 grid grid-cols-3 gap-4 px-2 text-white sm:max-w-xl">
              {active.stats.map(([value, label]) => (
                <div key={label}>
                  <dt className="text-xs text-white/70">{label}</dt>
                  <dd className="mt-1 font-display text-xl font-light sm:text-3xl">{value}</dd>
                </div>
              ))}
            </dl>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
