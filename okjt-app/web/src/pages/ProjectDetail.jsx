import { useParams } from 'react-router-dom';
import { ExternalLink } from 'lucide-react';
import JourneyPage from '../components/Journey';
import usePageMeta from '../components/usePageMeta';
import { live, useItem, useProjects } from '../lib/content';
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
  const pictures = [...new Set([project?.bg_image || project?.image, ...gallery, project?.image].filter(Boolean))];
  // One picture: on the first chapter only; more: one per chapter, in turn.
  const picture = (n) => (pictures.length && (n === 0 || new Set(pictures).size > 1) ? { src: pictures[n % pictures.length], url: project?.url?.replace(/^https?:\/\//, '') || address(`/projects/${slug}`) } : undefined);
  const sector = project ? sectorOf(project) : null;
  const related = live(all).filter((p) => p.id !== project?.id && (project?.type === 'flagship' ? p.type === 'flagship' : sectorOf(p).id === sector?.id));
  const fill = live(all).filter((p) => p.id !== project?.id && !related.includes(p) && p.type === project?.type);

  const story = project ? [
    { key: 'description', title: 'The project', when: project.type === 'flagship' ? 'Flagship product' : project.client_name || 'Client project' },
    { key: 'problem', title: 'The opportunity', when: 'Why' },
    { key: 'methodology', title: 'What was built', when: 'How' },
    { key: 'outcome', title: 'The outcome', when: 'What changed' },
  ].filter((s) => strip(project[s.key])) : [];

  const chapters = story.map((s, n) => ({
    id: s.key === 'description' ? 'overview' : s.key,
    when: s.when,
    title: s.title,
    body: listItems(project[s.key]).length ? project[s.key].replace(/<ul[\s\S]*?<\/ul>/gi, '') : project[s.key],
    steps: listItems(project[s.key]).map((item) => ({ title: item })),
    media: picture(n),
    details: s.key === 'methodology' && project.technologies?.length ? project.technologies : undefined,
    detailsLabel: 'Built with',
    tip: s.key === 'outcome' && project.testimonial_quote ? `“${strip(project.testimonial_quote)}”${project.testimonial_author ? ` — ${project.testimonial_author}` : ''}` : undefined,
    tipLabel: 'In their words',
  }));
  if (project && !chapters.length) chapters.push({ id: 'overview', when: 'The project', title: project.title, intro: project.tagline, media: picture(0) });

  return (
    <JourneyPage
      loading={isLoading}
      hero={{
        media: project?.bg_image || project?.image,
        eyebrow: project ? (project.type === 'flagship' ? 'Flagship product' : project.client_name || 'Client project') : '',
        title: project?.title || '',
        text: project?.tagline,
        breadcrumbs: [{ to: '/', label: 'Home' }, { to: '/projects', label: 'Projects' }, { label: project?.title || '…' }],
        cta: { to: '/contact', label: 'Start a similar project' },
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
      toolkit={{
        eyebrow: 'More work',
        title: project?.type === 'flagship' ? 'Other flagship products' : `More in ${sector?.label?.toLowerCase() || 'this sector'}`,
        cards: [...related, ...fill].slice(0, 4).map((p) => ({ to: `/projects/${p.slug}`, image: p.bg_image || p.image, tags: [p.type === 'flagship' ? 'Flagship' : p.client_name, sectorOf(p).label], title: p.title, text: clip(p.tagline || p.description, 140) })),
      }}
      onward={{ to: '/contact', tags: ['Next step'], title: 'Something like this, for you?', text: 'Share a short brief. Every brief receives a reply with next steps within two business days.' }}
      faqs={false}
    />
  );
}
