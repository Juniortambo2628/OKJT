import JourneyPage from '../components/Journey';
import { live, usePillars, useProjects, useSettings, useStats, useTeam, useValues } from '../lib/content';
import { DEFAULT_HERO } from '../lib/defaults';
import { address, clip } from '../lib/text';

const DEFAULT_CATEGORIES = [
    {
        key: 'digital-policy',
        label: 'Digital Policy',
        items: [
            { title: 'Lawyers Hub Digital Policy website', summary: 'A leading Kenyan resource on digital policy, from its structure and build to its ongoing care.', href: '/projects/lawyers-hub-digital-policy', tag: 'Platform' },
            { title: 'Africa Law Tech Festival platform', summary: 'Online ticketing, live updates and event maps for an annual festival with a continental audience.', href: '/projects/africa-law-tech-festival', tag: 'Event platform' },
            { title: 'ADPI training delivery', summary: 'Support for the Africa Data Protection Course and the CIPP/E certification programme.', href: '/projects/adpi-courses', tag: 'Training' },
        ],
    },
    {
        key: 'ui-ux',
        label: 'Interface Design',
        items: [
            { title: 'Najenga: construction coordination', summary: 'Drawings, budgets, timelines and team conversations brought into one shared workspace.', href: '/projects/najenga', tag: 'Product' },
            { title: 'Naoa: digital wedding platform', summary: 'Invitations, RSVPs, gifts and live guest updates in one experience.', href: '/projects/naoa', tag: 'Product' },
            { title: 'Tibu: healthcare interface', summary: 'Clinical workflows designed for the doctors, nurses and staff who use them on desktop and mobile.', href: '/projects/tibu', tag: 'Interface' },
        ],
    },
    {
        key: 'engineering',
        label: 'Web Engineering',
        items: [
            { title: 'Laravel and Next.js platforms', summary: 'Complete web applications with secure sign-in, admin dashboards, automated tasks and reliable launches.', href: '/services', tag: 'Engineering' },
            { title: 'Launch and ongoing care', summary: 'Hosting, domains, automatic deployments, monitoring and maintenance after launch.', href: '/services', tag: 'Operations' },
        ],
    },
    {
        key: 'ecosystem',
        label: 'Ecosystem Strategy',
        items: [
            { title: 'Ecosystem mapping practice', summary: 'Everyone a platform touches is mapped before scoping, so each has a clear reason to take part.', href: '/our-approach', tag: 'Method' },
            { title: 'Boda-Boda Law Project', summary: 'Field research in Kisumu and Namanga that informed a published legal report.', href: '/projects/boda-boda-law', tag: 'Research' },
        ],
    },
]

/** The studio's story, as a journey: approach, experience, principles, the team. */
export default function About() {
  const { setting, json } = useSettings();
  const { data: team } = useTeam();
  const { data: values } = useValues();
  const { data: stats } = useStats();
  const { data: pillars } = usePillars();
  const { data: projects } = useProjects();
  const configured = json('about_experience_categories', null);
  const categories = Array.isArray(configured) && configured.length ? configured : DEFAULT_CATEGORIES;
  const flagship = live(projects).find((p) => p.type === 'flagship' && (p.bg_image || p.image));

  const chapters = [
    {
      id: 'approach',
      when: 'Before anything is built',
      title: setting('about_mission_title', 'Every stakeholder is mapped before anything is built.'),
      intro: setting('about_mission_text1', 'Each project starts by mapping everyone the platform will touch: the client, the people who will use it every day, regulators, partners and the wider community.'),
      media: { src: setting('bg_about_mission') || setting('hero_about_media') || DEFAULT_HERO, url: address('/about') },
      steps: [
        { title: 'Map everyone it touches', text: 'The client, the people who use it every day, regulators, partners and the community around it.' },
        { title: 'Give each a reason to use it', text: setting('about_mission_text2', 'The platform is designed so each of those groups has a clear reason to use it and a clear benefit from it.') },
        { title: 'Build in clear stages', text: 'Planning, interface design, engineering, launch and ongoing care, as one piece of work.' },
      ],
      tip: 'The method comes from the Afrilabs programme on ecosystem mapping in Addis Ababa.',
    },
    ...categories.map((category) => ({
      id: `experience-${category.key}`,
      navLabel: category.label,
      when: 'Experience',
      title: category.label,
      intro: setting('about_experience_subtitle', 'Selected work across the disciplines behind every OKJTechnologies project, each linked to the platform it shaped.'),
      steps: (category.items ?? []).map((item) => ({ title: item.title, text: item.summary, to: item.href })),
    })),
    live(values).length > 0 && {
      id: 'principles',
      when: 'Every day',
      title: 'Working principles',
      intro: 'What every project is held to, from the first sketch to the platform in daily use.',
      steps: live(values).map((v) => ({ title: v.title, text: v.description })),
    },
    {
      id: 'studio',
      when: 'Who you work with',
      title: setting('about_team_title', 'One continuous thread, from concept to live platform'),
      intro: setting('about_team_subtitle', 'Every project is designed, built, launched and supported as one continuous piece of work, with a single point of accountability from start to finish.'),
      media: live(team).find((m) => m.image) ? { src: live(team).find((m) => m.image).image, url: address('/about#studio') } : { src: setting('bg_about_team'), url: address('/about#studio') },
      steps: live(team).map((m) => ({ title: `${m.name} · ${m.role}`, text: clip(m.bio, 180) })),
      tip: 'There are no hand-offs between teams, so no context is lost between stages.',
    },
  ].filter(Boolean);

  return (
    <JourneyPage
      hero={{
        media: setting('hero_about_media') || DEFAULT_HERO,
        eyebrow: setting('about_tagline', 'How the work gets done'),
        title: setting('about_title', 'Design-led web engineering,\nbuilt around the people it serves.'),
        text: setting('about_story', 'OKJTechnologies is a web engineering studio in Nairobi. It takes projects from first idea to a live, supported platform.'),
        breadcrumbs: [{ to: '/', label: 'Home' }, { label: 'About' }],
        cta: { to: '/contact', label: 'Start a project' },
        secondary: { to: '/projects', label: 'See the work' },
      }}
      glance={live(stats).slice(0, 4).map((s) => [s.value, s.label])}
      label="The studio"
      chapters={chapters}
      toolkit={{
        eyebrow: 'The approach',
        title: 'The principles behind every build',
        text: 'Each is a part of how the work is done. Open one to see what it means in practice.',
        cards: live(pillars).slice(0, 4).map((p) => ({ to: `/our-approach/${p.slug}`, image: p.image, tags: ['Principle'], title: p.title, text: clip(p.overview, 140) })),
      }}
      onward={{ to: '/projects', image: flagship?.bg_image || flagship?.image, tags: ['The work'], title: 'Platforms people rely on every day', text: 'Case studies of the platforms designed, built and run for clients and as flagship products.' }}
    />
  );
}
