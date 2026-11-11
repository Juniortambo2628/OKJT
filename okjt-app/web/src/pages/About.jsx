import JourneyPage from '../components/Journey';
import { live, screenOf, useClients, useProjects, useSettings, useStats, useTeam, useTestimonials } from '../lib/content';
import { DEFAULT_HERO } from '../lib/defaults';
import { bySector, sectorPhoto } from '../lib/sectors';
import { address, clip } from '../lib/text';

/**
 * About OKJTech, told for a client deciding whether to get in touch: what
 * gets built, who it's for, how working together goes, why clients choose
 * the studio, and who they'll work with. Plain words, no method jargon.
 */
export default function About() {
  const { setting } = useSettings();
  const { data: projects } = useProjects();
  const { data: clients } = useClients();
  const { data: stats } = useStats();
  const { data: team } = useTeam();
  const { data: testimonials } = useTestimonials();

  const work = live(projects);
  const clientWork = work.filter((p) => p.type !== 'flagship');
  const sectors = bySector(clientWork);
  const pictured = [...work.filter((p) => p.is_featured), ...work].filter((p) => screenOf(p));
  const pic = (n) => (pictured[n] ? { src: screenOf(pictured[n]), url: address(`/projects/${pictured[n].slug}`) } : undefined);
  const quote = live(testimonials).find((t) => t.is_featured) || live(testimonials)[0];
  const people = live(team);
  // Example clients for a sector, leaving out unnamed ones ("Private Client").
  const names = (g) => [...new Set(g.projects.map((p) => p.client_name).filter((n) => n && !/private/i.test(n)))].slice(0, 3).join(', ');

  const chapters = [
    {
      id: 'what',
      navLabel: 'What gets built',
      when: 'What you get',
      title: 'Platforms your clients and your staff use every day',
      intro: 'From the website people find you on to the system your staff log in to each morning, OKJTechnologies designs it, builds it and keeps it running.',
      media: pic(0),
      steps: [
        { title: 'Websites that bring in enquiries', text: 'Clear, fast sites that explain what you do and turn visits into conversations.' },
        { title: 'Portals and dashboards', text: 'Places for your clients, staff or members to sign in, book, track and manage their work.' },
        { title: 'Online stores and payments', text: 'Selling and ordering online, with M-Pesa, card and Paystack payments built in.' },
        { title: 'Care after launch', text: 'Hosting, updates and fixes taken care of, so the platform keeps working as you grow.' },
      ],
    },
    sectors.length > 0 && {
      id: 'who',
      navLabel: 'Who it’s for',
      when: `${sectors.length} sectors`,
      title: 'Organisations that need their platform to work, every day',
      intro: 'Clinics, law firms, builders, event companies, shops and nonprofits already run on platforms built here.',
      media: { src: sectorPhoto(sectors[0]), url: address('/projects') },
      steps: sectors.slice(0, 6).map((g) => ({
        title: g.label,
        text: names(g) ? `${names(g)}${g.projects.length > 3 ? ' and more' : ''}` : `${g.projects.length} ${g.projects.length === 1 ? 'platform' : 'platforms'}`,
        to: `/projects#sector-${g.id}`,
      })),
    },
    {
      id: 'how',
      navLabel: 'Working together',
      when: 'Four steps',
      title: 'How working together goes',
      intro: 'Simple from the first message to launch day, with one point of contact throughout.',
      media: pic(1),
      steps: [
        { title: 'Share what you need', text: 'A short brief or a call is enough to start.' },
        { title: 'Get a clear proposal', text: 'Scope, timeline and cost in writing, usually within two business days.' },
        { title: 'See it take shape', text: 'Review working screens as they are built, not only at the end.' },
        { title: 'Launch, then keep improving', text: 'Your platform goes live, your staff learn to use it, and support carries on.' },
      ],
      tip: 'The person you brief on day one is the person you speak to on launch day.',
      tipLabel: 'Good to know',
    },
    {
      id: 'why',
      navLabel: 'Why OKJTech',
      when: 'Why clients choose OKJTech',
      title: 'Built well, explained plainly, looked after',
      media: pic(2),
      steps: [
        { title: 'Design and engineering in one place', text: 'No hand-offs between agencies, so nothing is lost between the look and the build.' },
        { title: 'Made for how people here use the web', text: 'Quick on mobile data, easy on a phone, with local payments ready.' },
        { title: 'Proven across sectors', text: `${work.length} platforms for ${live(clients).length || sectors.length} organisations, from clinics to law firms.` },
        { title: 'Still here after launch', text: 'The studio that built your platform keeps looking after it.' },
      ],
      tip: quote ? `“${clip(quote.quote, 220)}” — ${[quote.name, quote.company].filter(Boolean).join(', ')}` : undefined,
      tipLabel: 'In a client’s words',
    },
    people.length > 0 && {
      id: 'people',
      navLabel: 'Who you’ll work with',
      when: 'People',
      title: 'Who you’ll work with',
      media: people.find((m) => m.image) ? { src: people.find((m) => m.image).image, url: address('/about#people') } : undefined,
      steps: people.map((m) => ({ title: m.name, text: m.role })),
    },
  ].filter(Boolean);

  return (
    <JourneyPage
      hero={{
        media: setting('hero_about_media') || DEFAULT_HERO,
        eyebrow: 'About OKJTech',
        title: 'Web platforms your\norganisation can run on.',
        text: 'OKJTechnologies is a Nairobi studio that designs, builds and looks after websites, portals and online stores, so you can get on with your work.',
        breadcrumbs: [{ to: '/', label: 'Home' }, { label: 'About' }],
        cta: { to: '/contact', label: 'Start a Project' },
        secondary: { to: '/projects', label: 'See the Work' },
      }}
      glance={live(stats).slice(0, 4).map((s) => [s.value, s.label])}
      label="About"
      chapters={chapters}
      toolkit={{
        eyebrow: 'The work',
        navLabel: 'The work',
        title: 'See what has been built',
        text: 'A few of the platforms in daily use. Each case study shows the problem, what was built and what changed.',
        cards: pictured.slice(0, 4).map((p) => ({ to: `/projects/${p.slug}`, image: screenOf(p), tags: [p.type === 'flagship' ? 'Flagship' : p.client_name], title: p.title, text: p.tagline })),
      }}
      onward={{ to: '/contact', tags: ['Next step'], title: 'Start with a short brief', text: 'A few lines about your project is enough. You’ll get a reply with next steps.' }}
    />
  );
}
