import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, ChevronDown, Gauge } from 'lucide-react';
import { Container } from '@okjt/site';
import { live, useServices } from '../lib/content';

/** The free tools, offered at the foot of the menu. */
const TOOLS = [
  { to: '/tools/site-check', label: 'Site check' },
  { to: '/tools/estimate', label: 'Cost estimator' },
  { to: '/tools/launch-checklist', label: 'Launch checklist' },
];

/** Services grouped under the approach pillar they belong to (or their category). */
function useGroups() {
  const { data } = useServices();
  return useMemo(() => {
    const groups = new Map();
    for (const service of live(data)) {
      const key = service.pillar ? `p${service.pillar.id}` : `c${service.category || 'Other'}`;
      if (!groups.has(key)) {
        groups.set(key, {
          key,
          title: service.pillar?.title || service.category || 'Services',
          to: service.pillar ? `/our-approach/${service.pillar.slug}` : '/services',
          items: [],
        });
      }
      groups.get(key).items.push({ to: `/services/${service.slug}`, label: service.title });
    }
    return [...groups.values()];
  }, [data]);
}

/** The large menu under the bar when "Services" is hovered or opened. */
export default function ServicesMega({ id, onNavigate }) {
  const groups = useGroups();
  return (
    <div id={id} className="absolute inset-x-0 top-full pt-2">
      <Container>
        <div className="rounded-3xl glass p-6 shadow-2xl backdrop-blur-xl lg:p-8">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {groups.map((group) => (
              <div key={group.key}>
                <Link to={group.to} onClick={onNavigate} className="text-[11px] font-semibold uppercase tracking-[0.2em] text-accent hover:text-accent-strong">{group.title}</Link>
                <ul className="mt-3 space-y-2">
                  {group.items.map((item) => (
                    <li key={item.to}><Link to={item.to} onClick={onNavigate} className="text-sm text-body transition-colors hover:text-ink">{item.label}</Link></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-5 text-sm">
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
              <span className="inline-flex items-center gap-2 font-semibold text-body"><Gauge className="h-4 w-4 text-accent" aria-hidden="true" /> Free tools:</span>
              {TOOLS.map((tool) => <Link key={tool.to} to={tool.to} onClick={onNavigate} className="text-body underline-offset-4 hover:text-ink hover:underline">{tool.label}</Link>)}
            </div>
            <Link to="/services" onClick={onNavigate} className="inline-flex items-center gap-1 font-semibold text-accent hover:text-accent-strong">All services <ArrowUpRight className="h-4 w-4" aria-hidden="true" /></Link>
          </div>
        </div>
      </Container>
    </div>
  );
}

/** The same, folded into the phone menu. */
function MobileList({ onNavigate }) {
  const groups = useGroups();
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-line pb-2">
      <button type="button" onClick={() => setOpen((v) => !v)} aria-expanded={open} className="flex w-full items-center justify-between rounded-2xl px-4 py-3 text-body hover:bg-tint">
        Services <ChevronDown className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`} aria-hidden="true" />
      </button>
      {open && (
        <div className="space-y-4 px-4 pb-2">
          {groups.map((group) => (
            <div key={group.key}>
              <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-accent">{group.title}</div>
              {group.items.map((item) => <Link key={item.to} to={item.to} onClick={onNavigate} className="block py-1.5 text-sm text-soft hover:text-ink">{item.label}</Link>)}
            </div>
          ))}
          <Link to="/services" onClick={onNavigate} className="block text-sm font-semibold text-accent">All Services</Link>
          <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-accent">Free tools</div>
          {TOOLS.map((tool) => <Link key={tool.to} to={tool.to} onClick={onNavigate} className="flex items-center gap-2 py-1.5 text-sm text-soft hover:text-ink"><Gauge className="h-4 w-4 text-accent" aria-hidden="true" /> {tool.label}</Link>)}
        </div>
      )}
    </div>
  );
}

ServicesMega.MobileList = MobileList;
