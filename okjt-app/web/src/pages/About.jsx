import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Linkedin } from 'lucide-react';
import { SectionNav, SiteLayout } from '@okjt/site';
import PageHero from '../components/PageHero';
import Section from '../components/Section';
import MediaFill from '../components/MediaFill';
import { live, useSettings, useTeam, useValues } from '../lib/content';
import { DEFAULT_HERO } from '../lib/defaults';

const SECTIONS = [
  { id: 'approach', label: 'Approach' },
  { id: 'experience', label: 'Experience' },
  { id: 'values', label: 'Values' },
  { id: 'studio', label: 'Studio' },
];

const defaultCategories = [
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

export default function About() {
  const { setting, json } = useSettings();
  const { data: team } = useTeam();
  const { data: values } = useValues();
  const categories = (() => {
    const configured = json('about_experience_categories', null);
    return Array.isArray(configured) && configured.length ? configured : defaultCategories;
  })();
  const [active, setActive] = useState(null);
  const current = categories.find((c) => c.key === active) ?? categories[0];

  return (
    <SiteLayout overlay>
      <PageHero
        media={setting('hero_about_media') || DEFAULT_HERO}
        eyebrow={setting('about_tagline', 'How the work gets done')}
        title={setting('about_title', 'Design-led web engineering,\nbuilt around the people it serves.')}
        text={setting('about_story', 'OKJTechnologies is a web engineering studio in Nairobi. It takes projects from first idea to a live, supported platform: planning, interface design, engineering, launch and ongoing administration. The work spans hospitals, law firms, construction teams, event companies, nonprofits and online stores.')}
        breadcrumbs={[{ to: '/', label: 'Home' }, { label: 'About' }]}
      />
      <SectionNav sections={SECTIONS} label="On this page" />

      <Section id="approach" media={setting('bg_about_mission')}>
        <div className="grid gap-10 lg:grid-cols-12 lg:items-start">
          <div className="lg:col-span-5">
            <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-accent">Approach</div>
            <h2 className="mt-3 !font-display text-4xl !font-light leading-tight tracking-tight !text-ink sm:text-5xl">{setting('about_mission_title', 'Every stakeholder is mapped before anything is built.')}</h2>
          </div>
          <div className="space-y-5 text-lg leading-relaxed text-body lg:col-span-7">
            <p>{setting('about_mission_text1', 'Each project starts by mapping everyone the platform will touch: the client, the people who will use it every day, regulators, partners and the wider community.')}</p>
            <p className="text-soft">{setting('about_mission_text2', 'The platform is then designed so each of those groups has a clear reason to use it and a clear benefit from it.')}</p>
          </div>
        </div>
      </Section>

      <Section id="experience" eyebrow="Experience" title={setting('about_experience_title', 'Where the experience comes from')} text={setting('about_experience_subtitle', 'Selected work across the disciplines behind every OKJTechnologies project, each linked to the platform it shaped.')}>
        <div role="tablist" aria-label="Disciplines" className="mb-8 flex flex-wrap justify-center gap-2">
          {categories.map((c) => (
            <button key={c.key} type="button" role="tab" aria-selected={current?.key === c.key} onClick={() => setActive(c.key)}
              className={`rounded-full px-4 py-2 text-xs font-semibold transition-colors ${current?.key === c.key ? 'bg-ink text-on-ink' : 'bg-surface text-soft hover:text-ink'}`}>{c.label}</button>
          ))}
        </div>
        <div role="tabpanel" className="grid gap-5 md:grid-cols-2">
          {(current?.items ?? []).map((item) => (
            <Link key={item.title} to={item.href || '/projects'} className="group rounded-[1.75rem] border border-line bg-surface p-7 transition-colors hover:border-accent/50">
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-tone-100 px-3 py-1 text-[11px] font-semibold text-accent">{item.tag}</span>
                <ArrowUpRight className="h-4 w-4 text-accent" aria-hidden="true" />
              </div>
              <h3 className="mt-5 !font-display text-2xl !font-normal !text-ink">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-soft">{item.summary}</p>
            </Link>
          ))}
        </div>
      </Section>

      {live(values).length > 0 && (
        <Section id="values" media={setting('bg_about_values')} eyebrow="Values" title="Working principles">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {live(values).map((v, i) => (
              <div key={v.id} className="rounded-[1.75rem] border border-line bg-surface/90 p-7 backdrop-blur">
                <div className="font-display text-sm text-accent">{String(i + 1).padStart(2, '0')}</div>
                <h3 className="mt-3 !font-display text-xl !font-normal !text-ink">{v.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-soft">{v.description}</p>
              </div>
            ))}
          </div>
        </Section>
      )}

      <Section id="studio" media={setting('bg_about_team')} eyebrow="Studio" title={setting('about_team_title', 'One continuous thread, from concept to live platform')} text={setting('about_team_subtitle', 'Every project is designed, built, launched and supported as one continuous piece of work.')}>
        {live(team).length > 0 && (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {live(team).map((m) => (
              <div key={m.id} className="overflow-hidden rounded-[1.75rem] border border-line bg-surface">
                <div className="relative aspect-[4/3]"><MediaFill src={m.image} /></div>
                <div className="p-6">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="!font-display text-xl !font-normal !text-ink">{m.name}</h3>
                      <div className="mt-1 text-xs font-semibold uppercase tracking-[0.15em] text-accent">{m.role}</div>
                    </div>
                    {m.linkedin && <a href={m.linkedin} target="_blank" rel="noopener noreferrer" aria-label={`${m.name} on LinkedIn`} className="rounded-full p-2 text-soft hover:bg-tone-100 hover:text-accent"><Linkedin className="h-4 w-4" /></a>}
                  </div>
                  {m.bio && <p className="mt-3 text-sm leading-relaxed text-soft">{m.bio}</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </Section>
    </SiteLayout>
  );
}

