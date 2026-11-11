import { useParams } from 'react-router-dom';
import { ExternalLink, Quote } from 'lucide-react';
import { Eyebrow } from '@okjt/site';
import JourneyPage from '../components/Journey';
import usePageMeta from '../components/usePageMeta';
import Stack from '../components/Stack';
import Gallery from '../components/Gallery';
import SimilarWorkPrompt from '../components/SimilarWorkPrompt';
import { live, screenOf, useItem, useProjects } from '../lib/content';
import { sectorOf } from '../lib/sectors';
import { address, clip, listItems, strip } from '../lib/text';
import NotFound from './NotFound';

/** A case study: overview, opportunity, what was built, outcome. */
export default function ProjectDetail() {
  const { slug } = useParams();
  const { data: project, isLoading, error } = useItem(`/projects/${slug}`);
  const { data: all } = useProjects();
  usePageMeta(project?.title, project?.tagline || project?.description);
  if (error?.response?.status === 404) return <NotFound />;

  const gallery = (project?.gallery ?? []).filter(Boolean);
  // Screens of the system itself once there are any; a logo is only a stand-in until then.
  const pictures = [...new Set((gallery.length ? gallery : [project?.bg_image || project?.image, project?.image]).filter(Boolean))];
  const frameUrl = project?.url?.replace(/^https?:\/\//, '') || address(`/projects/${slug}`);
  // Each picture once, in turn; sections past them get a card instead.
  const picture = (n) => (pictures[n] ? { src: pictures[n], url: frameUrl } : undefined);
  const sector = project ? sectorOf(project) : null;
  const related = live(all).filter((p) => p.id !== project?.id && (project?.type === 'flagship' ? p.type === 'flagship' : sectorOf(p).id === sector?.id));
  const fill = live(all).filter((p) => p.id !== project?.id && !related.includes(p) && p.type === project?.type);

  const story = project ? [
    { key: 'description', title: 'The project', when: project.type === 'flagship' ? 'Flagship product' : project.client_name || 'Client project' },
    { key: 'problem', title: 'The opportunity', when: 'Why' },
    { key: 'methodology', title: 'What was built', when: 'How' },
    { key: 'outcome', title: 'The outcome', when: 'What changed' },
  ].filter((s) => strip(project[s.key])) : [];

  /* Left-column cards for sections without a picture of their own. */
  const card = (children) => <div className="glass rounded-[2rem] p-6 sm:p-8">{children}</div>;
  const facts = project && card(
    <>
      <Eyebrow>At a glance</Eyebrow>
      <dl className="mt-5 grid gap-5 sm:grid-cols-2">
        {[
          [project.type === 'flagship' ? 'Built and run by' : 'Client', project.client_name || 'OKJTechnologies'],
          ['Sector', sector?.label],
          ['Impact', project.significant_figure],
          ['Focus', (project.focus_areas ?? []).slice(0, 3).join(', ')],
        ].filter(([, v]) => v).map(([label, value]) => (
          <div key={label}><dt className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">{label}</dt><dd className="mt-1 font-display text-xl font-light text-ink">{value}</dd></div>
        ))}
      </dl>
      {project.url && <a href={project.url} target="_blank" rel="noopener noreferrer" className="okjt-pill okjt-pill-dark mt-6 inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold">Visit the Platform <ExternalLink className="h-4 w-4" aria-hidden="true" /></a>}
    </>,
  );
  const impact = project?.significant_figure && card(
    <>
      <Eyebrow>Impact</Eyebrow>
      <div className="mt-4 font-display text-5xl font-extralight leading-tight tracking-tight text-ink sm:text-6xl">{project.significant_figure}</div>
      {project.tagline && <p className="mt-4 text-soft">{project.tagline}</p>}
    </>,
  );
  const quote = project?.testimonial_quote && card(
    <figure>
      <Quote className="h-7 w-7 text-accent" aria-hidden="true" />
      <blockquote className="mt-4 font-display text-2xl font-light leading-snug text-ink">“{strip(project.testimonial_quote)}”</blockquote>
      {project.testimonial_author && <figcaption className="mt-5 text-sm font-semibold text-soft">{project.testimonial_author}</figcaption>}
    </figure>,
  );
  const stackCard = project?.technologies?.length > 0 && <Stack names={project.technologies} />;
  const asideFor = (key) => ({
    description: facts,
    problem: impact || facts,
    methodology: stackCard || facts,
    outcome: quote || impact || facts,
  }[key] || facts);

  const chapters = story.map((s, n) => ({
    id: s.key === 'description' ? 'overview' : s.key,
    when: s.when,
    title: s.title,
    body: listItems(project[s.key]).length ? project[s.key].replace(/<ul[\s\S]*?<\/ul>/gi, '') : project[s.key],
    // "Public website. Loads quickly…": the first sentence as the step's title.
    steps: listItems(project[s.key]).map((item) => {
      const [, head, rest] = item.match(/^(.{3,60}?[.:])\s+(.+)$/) || [];
      return head ? { title: head.replace(/[.:]$/, ''), text: rest } : { title: item };
    }),
    media: picture(n),
    aside: picture(n) ? undefined : asideFor(s.key),
    // The stack sits beside the words when the left column holds a picture.
    stack: s.key === 'methodology' && (picture(n) || !stackCard) ? project.technologies : undefined,
    tip: s.key === 'outcome' && project.testimonial_quote && (picture(n) || asideFor('outcome') !== quote) ? `“${strip(project.testimonial_quote)}”${project.testimonial_author ? ` — ${project.testimonial_author}` : ''}` : undefined,
    tipLabel: 'In their words',
  }));
  if (project && !chapters.length) chapters.push({ id: 'overview', when: 'The project', title: project.title, intro: project.tagline, media: picture(0) });

  return (
    <JourneyPage
      loading={isLoading}
      hero={{
        media: project?.bg_image || gallery[0] || project?.image,
        eyebrow: project ? (project.type === 'flagship' ? 'Flagship product' : project.client_name || 'Client project') : '',
        title: project?.title || '',
        breadcrumbs: [{ to: '/', label: 'Home' }, { to: '/projects', label: 'Projects' }, { label: project?.title || '…' }],
        cta: { to: '/contact', label: 'Start a Similar Project' },
        actions: project?.url && (
          <a href={project.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 rounded-full border border-white/40 bg-white/10 px-7 py-3.5 text-sm font-semibold uppercase tracking-[0.08em] text-white backdrop-blur hover:bg-white/20">
            Visit the platform <ExternalLink className="h-4 w-4" aria-hidden="true" />
          </a>
        ),
      }}
      glance={project ? [
        [project.significant_figure || (project.type === 'flagship' ? 'Flagship' : 'Live'), project.significant_figure ? 'impact' : 'status'],
        [project.client_name || 'OKJTechnologies', project.type === 'flagship' ? 'built and run by' : 'client'],
        [sector?.label || 'Web platform', 'sector'],
        [String(project.technologies?.length || 0), 'technologies'],
      ] : []}
      label="The case study"
      chapters={chapters}
      navExtra={pictures.length ? [{ id: 'gallery', label: 'Gallery' }] : []}
      toolkit={{
        eyebrow: 'More work',
        title: project?.type === 'flagship' ? 'Other flagship products' : `More in ${sector?.label?.toLowerCase() || 'this sector'}`,
        cards: [...related, ...fill].slice(0, 4).map((p) => ({ to: `/projects/${p.slug}`, image: screenOf(p), tags: [p.type === 'flagship' ? 'Flagship' : p.client_name, sectorOf(p).label], title: p.title, text: clip(p.tagline || p.description, 140) })),
      }}
      onward={{ to: '/contact', tags: ['Next step'], title: 'Something like this, for you?', text: 'Share a short brief. Every brief receives a reply with next steps within two business days.' }}
      faqs={false}
    >
      <Gallery title={project ? `${project.title.split(':')[0]}, in pictures` : ''} images={pictures} />
      <SimilarWorkPrompt project={project} />
    </JourneyPage>
  );
}
