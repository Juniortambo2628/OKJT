import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import Photo from './Photo.js';
import { Container, Eyebrow, Logo, PillLink } from './ui.js';
import { usePlaces, useSignedIn, useSite } from './SiteProvider.js';

/** The closing call to action above the footer (`site.footer.cta`). */
function FooterCta({ cta }) {
  const place = usePlaces();
  return (
    <Container className="pb-6">
      <div className="group relative isolate overflow-hidden rounded-[2rem] bg-tint px-6 py-16 text-center sm:px-12 lg:py-24">
        <Photo image={place(cta.place)} width={1800} className="-z-20" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-tint via-tint/90 to-tint/30" />
        <Eyebrow>{cta.eyebrow}</Eyebrow>
        <h2 className="mx-auto mt-4 max-w-3xl !font-display text-4xl !font-light leading-tight tracking-tight !text-ink sm:text-5xl lg:text-6xl">
          {cta.title}
        </h2>
        <div className="mx-auto mt-4 max-w-xl text-soft">
          {cta.text}
        </div>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <PillLink to={cta.primary.to} size="lg">{cta.primary.label}</PillLink>
          <PillLink to={cta.secondary.to} variant="light" size="lg" arrow>{cta.secondary.label}</PillLink>
        </div>
      </div>
    </Container>
  );
}

/**
 * The marketing footer: a closing call to action, then a dark panel with the
 * brand, link columns, promises and the small print. `cta={false}` hides the
 * call to action (e.g. on the legal pages). Everything it says comes from
 * `site.footer`; link columns may mark a link `signedIn: true/false`.
 */
export default function SiteFooter({ cta = true }) {
  const { footer, accountLinks: links } = useSite();
  const isAuthenticated = useSignedIn();
  const year = new Date().getFullYear();
  const shown = (link) => link.signedIn === undefined || link.signedIn === Boolean(isAuthenticated);
  return (
    <footer className="pt-10">
      {cta && footer.cta && <FooterCta cta={footer.cta} />}
      <div className="px-2 pb-2 sm:px-4 sm:pb-4">
        <div className="relative overflow-hidden rounded-[2rem] bg-ink text-white">
          <div className="pointer-events-none absolute -bottom-10 right-0 select-none font-display text-[9rem] font-semibold leading-none tracking-tighter text-white/[0.04] sm:text-[16rem] lg:text-[22rem]" aria-hidden="true">
            {footer.watermark}
          </div>
          <Container className="relative py-14 lg:py-20">
            <div className="grid gap-12 lg:grid-cols-12">
              <div className="lg:col-span-4">
                <Logo light />
                <div className="mt-5 max-w-sm text-sm leading-relaxed text-white/65">
                  {footer.about}
                </div>
                <div className="mt-6 flex flex-wrap gap-3">
                  {isAuthenticated ? (
                    <PillLink to={links.home.to} variant="light" size="sm">{links.home.label}</PillLink>
                  ) : (
                    <>
                      <PillLink to={links.signUp.to} variant="light" size="sm">{links.signUp.label}</PillLink>
                      <PillLink to={links.signIn.to} variant="glass" size="sm">{links.signIn.label}</PillLink>
                    </>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:col-span-8">
                {footer.columns.map((column) => (
                  <div key={column.title}>
                    <div className="text-xs font-semibold uppercase tracking-[0.2em] text-accent-soft">{column.title}</div>
                    <ul className="mt-4 space-y-3 text-sm">
                      {column.links.filter(shown).map((link) => (
                        <li key={link.to}><Link to={link.to} className="text-white/70 transition-colors hover:text-white">{link.label}</Link></li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-14 grid gap-3 sm:grid-cols-3">
              {footer.promises.map((promise) => {
                const Icon = promise.icon;
                return (
                  <div key={promise.text} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white/75">
                    <Icon className="h-4 w-4 shrink-0 text-accent-soft" aria-hidden="true" />{promise.text}
                  </div>
                );
              })}
            </div>

            <div className="mt-10 flex flex-col gap-4 border-t border-white/10 pt-6 text-xs text-white/50 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <span>© {year} {footer.copyright}. All rights reserved.</span>
                <span aria-hidden="true">·</span>
                <span>{footer.madeBy.label}</span>
                <a href={footer.madeBy.href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-white/70 hover:text-white">
                  <img src={footer.madeBy.logo} alt="" className="h-6 w-6 brightness-0 invert" />
                  {footer.madeBy.name}
                  <ArrowUpRight className="h-3 w-3" aria-hidden="true" />
                </a>
              </div>
            </div>
          </Container>
        </div>
      </div>
    </footer>
  );
}
