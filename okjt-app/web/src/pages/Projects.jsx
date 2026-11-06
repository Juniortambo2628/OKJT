import { ImageCard, SectionNav, SiteLayout, PillLink } from '@okjt/site';
import PageHero from '../components/PageHero';
import Section from '../components/Section';
import { CardGridSkeleton, Empty, LoadError } from '../components/States';
import { live, useProjects, useSettings } from '../lib/content';
import { DEFAULT_HERO } from '../lib/defaults';

const strip = (html) => String(html ?? '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

export function ProjectCard({ project }) {
  return (
    <ImageCard
      image={project.bg_image || project.image}
      title={project.title}
      text={project.tagline || strip(project.description).slice(0, 120)}
      tags={[project.type === 'flagship' ? 'Flagship' : project.client_name, project.category].filter(Boolean).slice(0, 2)}
      to={`/projects/${project.slug}`}
    />
  );
}

/** The work: flagship products, then client platforms. `flagship` shows only the products. */
export default function Projects({ flagship = false }) {
  const { setting } = useSettings();
  const { data, isLoading, isError } = useProjects();
  const all = live(data);
  const products = all.filter((p) => p.type === 'flagship');
  const clients = all.filter((p) => p.type !== 'flagship');

  return (
    <SiteLayout overlay>
      <PageHero
        media={setting('hero_projects_media') || DEFAULT_HERO}
        eyebrow={flagship ? 'Flagship work' : 'Portfolio'}
        title={flagship ? 'Products built <br />from the ground up.' : 'Real platforms, <br />built end to end.'}
        text={flagship
          ? 'Flagship products developed by OKJTechnologies, each designed around a whole ecosystem of users and partners.'
          : 'Web platforms for health, law, construction, events, commerce and nonprofits. Each project shows the opportunity it responds to and what was built.'}
        breadcrumbs={flagship ? [{ to: '/', label: 'Home' }, { to: '/projects', label: 'Projects' }, { label: 'Flagship' }] : [{ to: '/', label: 'Home' }, { label: 'Projects' }]}
      />
      {!flagship && <SectionNav sections={[{ id: 'flagship', label: 'Flagship' }, { id: 'clients', label: 'Client work' }]} label="Projects" />}
      {isError && <Section><LoadError what="the projects" /></Section>}
      <Section id="flagship" eyebrow="Flagship" title="Flagship projects" text="Products developed and owned by OKJTechnologies." align="left">
        {isLoading ? <CardGridSkeleton count={3} /> : products.length ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{products.map((p) => <ProjectCard key={p.id} project={p} />)}</div>
        ) : <Empty>Flagship products will be listed here.</Empty>}
        {!flagship && products.length > 0 && <div className="mt-8"><PillLink to="/projects/flagship" variant="outline" arrow>About the flagship products</PillLink></div>}
      </Section>
      {flagship ? (
        <Section id="stages" eyebrow="Method" title="How flagship products are built" text="Three stages that keep each product tied to the people it serves.">
          <ol className="grid gap-5 md:grid-cols-3">
            {[
              ['Map the ecosystem', 'Everyone the product touches is mapped first, with what each needs from it.'],
              ['Design for each group', 'Every group gets a clear reason to take part and a clear benefit.'],
              ['Build, launch, grow', 'The product ships in stages and keeps growing with the people using it.'],
            ].map(([title, text], i) => (
              <li key={title} className="rounded-[1.75rem] glass p-7">
                <div className="font-display text-sm text-accent">{String(i + 1).padStart(2, '0')}</div>
                <h3 className="mt-3 !font-display text-xl !font-normal !text-ink">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-soft">{text}</p>
              </li>
            ))}
          </ol>
        </Section>
      ) : (
        <Section id="clients" eyebrow="Client work" title="Client projects" text="Platforms designed and built for client organisations." align="left">
          {isLoading ? <CardGridSkeleton /> : clients.length ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{clients.map((p) => <ProjectCard key={p.id} project={p} />)}</div>
          ) : <Empty>Client projects will be listed here.</Empty>}
        </Section>
      )}
    </SiteLayout>
  );
}
