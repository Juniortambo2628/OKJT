import { Quote, Star } from 'lucide-react';
import { SectionNav, SiteLayout } from '@okjt/site';
import PageHero from '../components/PageHero';
import Section from '../components/Section';
import { CardGridSkeleton, Empty } from '../components/States';
import { live, useClients, useProjects, useSettings, useTestimonials } from '../lib/content';
import { mediaUrl } from '../lib/media';
import { DEFAULT_HERO } from '../lib/defaults';
import { ProjectCard } from './Projects';

const SECTIONS = [
  { id: 'projects', label: 'Projects' },
  { id: 'testimonials', label: 'Testimonials' },
  { id: 'clients', label: 'Clients' },
];

export default function ClientImpact() {
  const { setting } = useSettings();
  const projects = useProjects();
  const { data: testimonials } = useTestimonials();
  const { data: clients } = useClients();
  const clientWork = live(projects.data).filter((p) => p.type !== 'flagship');
  const featured = clientWork.filter((p) => p.is_featured);
  const shown = (featured.length ? featured : clientWork).slice(0, 6);

  return (
    <SiteLayout overlay>
      <PageHero
        media={setting('hero_client_impact_media') || DEFAULT_HERO}
        eyebrow="Client impact"
        title="Work that clients rely on."
        text="Platforms in daily use by clinics, law firms, workshops, event companies and nonprofits, with clients’ own words where they have shared them."
        breadcrumbs={[{ to: '/', label: 'Home' }, { label: 'Client impact' }]}
      />
      <SectionNav sections={SECTIONS} label="On this page" />
      <Section id="projects" media={setting('bg_projects_featured')} eyebrow="Projects" title="Platforms in daily use">
        {projects.isLoading ? <CardGridSkeleton /> : shown.length ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{shown.map((p) => <ProjectCard key={p.id} project={p} />)}</div>
        ) : <Empty>Client projects will be listed here.</Empty>}
      </Section>
      <Section id="testimonials" media={setting('bg_client_impact_testimonials')} eyebrow="Testimonials" title="In their words">
        {live(testimonials).length ? (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {live(testimonials).map((t) => (
              <figure key={t.id} className="flex flex-col rounded-[1.75rem] glass p-7">
                <Quote className="h-6 w-6 text-accent" aria-hidden="true" />
                {t.rating > 0 && <div className="mt-3 flex gap-0.5" aria-label={`${t.rating} out of 5`}>{Array.from({ length: t.rating }).map((_, i) => <Star key={i} className="h-3.5 w-3.5 fill-accent text-accent" aria-hidden="true" />)}</div>}
                <blockquote className="mt-4 flex-1 leading-relaxed text-body">“{t.quote}”</blockquote>
                <figcaption className="mt-6 flex items-center gap-3">
                  {t.avatar && <img src={mediaUrl(t.avatar)} alt="" className="h-10 w-10 rounded-full object-cover" loading="lazy" />}
                  <div><div className="text-sm font-semibold text-ink">{t.name}</div><div className="text-xs text-muted">{[t.role, t.company].filter(Boolean).join(', ')}</div></div>
                </figcaption>
              </figure>
            ))}
          </div>
        ) : <Empty>Client testimonials will appear here.</Empty>}
      </Section>
      <Section id="clients" media={setting('bg_client_impact_clients')} eyebrow="Clients" title="Organisations served">
        {live(clients).length ? (
          <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {live(clients).map((c) => {
              const inner = c.logo
                ? <img src={mediaUrl(c.logo)} alt={c.name} className="max-h-12 w-auto object-contain opacity-80 transition-opacity group-hover:opacity-100" loading="lazy" />
                : <span className="text-center text-sm font-semibold text-body">{c.name}</span>;
              return (
                <li key={c.id}>
                  {c.website
                    ? <a href={c.website} target="_blank" rel="noopener noreferrer" className="group grid h-28 place-items-center rounded-2xl glass p-5">{inner}</a>
                    : <div className="group grid h-28 place-items-center rounded-2xl glass p-5">{inner}</div>}
                </li>
              );
            })}
          </ul>
        ) : <Empty>Client logos will appear here.</Empty>}
      </Section>
    </SiteLayout>
  );
}
