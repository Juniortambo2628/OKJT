import { Fragment } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Mail } from 'lucide-react';
import SiteLayout from './SiteLayout.js';
import { Container, Eyebrow } from './ui.js';
import useScrollSpy from './useScrollSpy.js';
import SectionNav, { SECTION_OFFSET } from './SectionNav.js';
import { useSite } from './SiteProvider.js';

/** The sidebar: the documents, then this one's sections with "you are here". */
function Sidebar({ sections, active }) {
  const { legal } = useSite();
  return (
    <nav aria-label="Legal" className="space-y-8 lg:sticky lg:top-28">
      <div className="flex flex-wrap gap-2 lg:flex-col">
        {legal.documents.map((doc) => {
          const Icon = doc.icon;
          return (
            <NavLink
              key={doc.to}
              to={doc.to}
              className={({ isActive }) => `flex min-w-[10rem] flex-1 items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-colors ${isActive ? 'bg-ink text-white' : 'bg-white text-body hover:bg-tint'}`}
            >
              <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />{doc.label}
            </NavLink>
          );
        })}
      </div>
      <div className="hidden lg:block">
        <Eyebrow>Contents</Eyebrow>
        <ol className="mt-4 space-y-0.5 border-l border-line-strong">
          {sections.map((s, i) => (
            <li key={s.id}>
              <a
                href={`#${s.id}`}
                aria-current={active === s.id ? 'location' : undefined}
                className={`-ml-px flex gap-3 border-l-2 py-1.5 pl-4 text-sm transition-colors ${active === s.id ? 'border-ink font-medium text-ink' : 'border-transparent text-muted hover:text-body'}`}
              >
                <span className="w-5 shrink-0 tabular-nums text-accent-soft">{i + 1}.</span>{s.title}
              </a>
            </li>
          ))}
        </ol>
      </div>
      <div className="hidden rounded-2xl bg-tint p-5 text-sm text-body lg:block">
        <Mail className="h-4 w-4 text-accent" aria-hidden="true" />
        <div className="mt-2 font-medium text-ink">Questions?</div>
        <div className="mt-1 text-soft">{legal.contact}</div>
      </div>
    </nav>
  );
}

/**
 * Shared layout of the legal documents: a sidebar of contents beside a readable
 * column. `site.legal` lists the documents (`{ to, label, icon }`), the contact
 * line, the date they were last updated (YYYY-MM-DD) and the "see also" links.
 */
export default function LegalPage({ title, intro, sections }) {
  const { legal } = useSite();
  const updated = new Date(`${legal.lastUpdated}T00:00:00`).toLocaleDateString(undefined, { dateStyle: 'long' });
  const active = useScrollSpy(sections.map((s) => s.id));
  return (
    <SiteLayout cta={false}>
      <Container className="pt-10 lg:pt-16">
        <header className="max-w-3xl">
          <Eyebrow>Legal</Eyebrow>
          <h1 className="mt-3 !font-display text-4xl !font-light tracking-tight !text-ink sm:text-6xl">{title}</h1>
          <div className="mt-3 text-sm text-muted">Last updated {updated}</div>
        </header>
      </Container>

      <SectionNav label="Contents" numbered className="lg:hidden" sections={sections.map((s) => ({ id: s.id, label: s.title }))} />

      <Container className="pb-16 pt-8 lg:pt-0">
        <div className="mt-4 grid gap-10 lg:mt-12 lg:grid-cols-12">
          <aside className="lg:col-span-4 xl:col-span-3"><Sidebar sections={sections} active={active} /></aside>

          <article className="rounded-[2rem] bg-white p-6 sm:p-10 lg:col-span-8 xl:col-span-9 xl:p-14">
            <div className="text-lg leading-relaxed text-body">{intro}</div>
            {sections.map((s, i) => (
              <section key={s.id} id={s.id} className={`${SECTION_OFFSET} lg:scroll-mt-28 border-t border-tint pt-10 mt-10 first-of-type:mt-10`}>
                <h2 className="!font-display text-2xl !font-normal tracking-tight !text-ink">
                  <span className="mr-2 text-accent-soft">{i + 1}.</span>{s.title}
                </h2>
                <div className="mt-4 max-w-3xl space-y-3 leading-relaxed text-body [&_a]:text-accent-strong [&_li]:ml-5 [&_li]:list-disc [&_ul]:space-y-1.5">{s.body}</div>
              </section>
            ))}
            <div className="mt-12 border-t border-tint pt-6 text-sm text-muted">
              See also: {legal.seeAlso.map((link, i) => (
                <Fragment key={link.to}>{i > 0 && ' · '}<Link to={link.to} className="hover:text-body">{link.label}</Link></Fragment>
              ))}
            </div>
          </article>
        </div>
      </Container>
    </SiteLayout>
  );
}
