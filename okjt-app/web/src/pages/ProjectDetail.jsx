import { useParams } from 'react-router-dom';
import { ExternalLink, Quote } from 'lucide-react';
import { Container, SectionNav, SiteLayout, PillLink } from '@okjt/site';
import PageHero from '../components/PageHero';
import Section from '../components/Section';
import Html from '../components/Html';
import MediaFill from '../components/MediaFill';
import usePageMeta from '../components/usePageMeta';
import { LoadError } from '../components/States';
import { live, useItem, useProjects } from '../lib/content';
import { ProjectCard } from './Projects';
import NotFound from './NotFound';

const STORY = [
  ['problem', 'The opportunity'],
  ['methodology', 'What was built'],
  ['outcome', 'The outcome'],
];

export default function ProjectDetail() {
  const { slug } = useParams();
  const { data: project, isLoading, isError, error } = useItem(`/projects/${slug}`);
  const { data: all } = useProjects();
  usePageMeta(project?.title, project?.tagline || project?.description);
  if (error?.response?.status === 404) return <NotFound />;

  const story = project ? STORY.filter(([key]) => project[key]) : [];
  const gallery = (project?.gallery ?? []).filter(Boolean);
  const related = live(all).filter((p) => p.id !== project?.id && p.type === project?.type).slice(0, 3);
  const sections = [
    { id: 'overview', label: 'Overview' },
    ...story.map(([id, label]) => ({ id, label })),
    ...(gallery.length ? [{ id: 'gallery', label: 'Gallery' }] : []),
    ...(project?.testimonial_quote ? [{ id: 'testimonial', label: 'In their words' }] : []),
  ];

  return (
    <SiteLayout overlay>
      <PageHero
        media={project?.bg_image || project?.image}
        eyebrow={project ? (project.type === 'flagship' ? 'Flagship product' : project.client_name || 'Client project') : ''}
        title={project?.title || ''}
        text={project?.tagline}
        breadcrumbs={[{ to: '/', label: 'Home' }, { to: '/projects', label: 'Projects' }, { label: project?.title || '…' }]}
      >
        {project?.url && <a href={project.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 rounded-full bg-ink px-7 py-3.5 text-sm font-semibold uppercase tracking-[0.08em] text-on-ink hover:bg-body">Visit the platform <ExternalLink className="h-4 w-4" aria-hidden="true" /></a>}
        <PillLink to="/contact" variant="glass" size="lg">Start a similar project</PillLink>
      </PageHero>
      {project && sections.length > 1 && <SectionNav sections={sections} label="Project" />}
      {isError && <Section><LoadError what="this project" /></Section>}
      {isLoading && <Section><div className="h-64 animate-pulse rounded-[2rem] bg-surface" /></Section>}
      {project && (
        <>
          <Section id="overview">
            <div className="grid gap-10 lg:grid-cols-12">
              <div className="lg:col-span-8"><Html html={project.description} className="text-lg" /></div>
              <aside className="space-y-6 rounded-[2rem] border border-line bg-surface p-7 lg:col-span-4">
                {project.significant_figure && (
                  <div>
                    <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted">Impact</div>
                    <div className="mt-2 font-display text-4xl font-extralight text-accent">{project.significant_figure}</div>
                  </div>
                )}
                {[['Client', project.client_name], ['Sector', project.category]].filter(([, v]) => v).map(([label, value]) => (
                  <div key={label}><div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted">{label}</div><div className="mt-1 text-ink">{value}</div></div>
                ))}
                {[['Technologies', project.technologies], ['Focus areas', project.focus_areas]].filter(([, v]) => v?.length).map(([label, list]) => (
                  <div key={label}>
                    <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted">{label}</div>
                    <div className="mt-2 flex flex-wrap gap-2">{list.map((t) => <span key={t} className="rounded-full bg-tone-100 px-3 py-1 text-xs text-body">{t}</span>)}</div>
                  </div>
                ))}
              </aside>
            </div>
          </Section>
          {story.map(([key, label], i) => (
            <Section key={key} id={key} className={i % 2 ? '' : 'bg-paper-warm'}>
              <div className="grid gap-8 lg:grid-cols-12">
                <div className="lg:col-span-4">
                  <div className="font-display text-sm text-accent">{String(i + 1).padStart(2, '0')}</div>
                  <h2 className="mt-2 !font-display text-3xl !font-light !text-ink sm:text-4xl">{label}</h2>
                </div>
                <div className="lg:col-span-8"><Html html={project[key]} className="text-lg" /></div>
              </div>
            </Section>
          ))}
          {gallery.length > 0 && (
            <Section id="gallery" eyebrow="Visual showcase" title="Gallery">
              <div className="grid gap-4 sm:grid-cols-2">
                {gallery.map((src) => <div key={src} className="relative aspect-[16/10] overflow-hidden rounded-[1.5rem] border border-line"><MediaFill src={src} /></div>)}
              </div>
            </Section>
          )}
          {project.testimonial_quote && (
            <Container className="py-16" >
              <figure id="testimonial" className="mx-auto max-w-4xl rounded-[2rem] bg-ink p-8 text-on-ink sm:p-14">
                <Quote className="h-8 w-8 opacity-50" aria-hidden="true" />
                <blockquote className="mt-4 font-display text-2xl font-light leading-snug sm:text-3xl">{project.testimonial_quote}</blockquote>
                {project.testimonial_author && <figcaption className="mt-6 text-sm font-semibold uppercase tracking-[0.15em] opacity-70">{project.testimonial_author}</figcaption>}
              </figure>
            </Container>
          )}
        </>
      )}
      {related.length > 0 && (
        <Section id="related" eyebrow="More work" title="Related projects">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{related.map((p) => <ProjectCard key={p.id} project={p} />)}</div>
        </Section>
      )}
    </SiteLayout>
  );
}
