import { useEffect } from 'react';
import { Container, PillLink, SiteLayout } from '@okjt/site';
import PageHero from '../components/PageHero';
import { DEFAULT_HERO } from '../lib/defaults';

export default function NotFound() {
  useEffect(() => {
    document.title = 'Page not found | OKJTech';
    document.querySelector('meta[name="robots"]')?.setAttribute('content', 'noindex, nofollow');
  }, []);
  return (
    <SiteLayout overlay cta={false}>
      <PageHero
        media={DEFAULT_HERO}
        eyebrow="404"
        title="This page isn’t here."
        text="It may have moved, or the address may have a typo."
        after={(
          <div className="glass-strong grid gap-4 rounded-[2rem] p-4 sm:p-5 md:grid-cols-3">
            {[
              ['/', 'Home', 'The studio, the approach and the work.'],
              ['/projects', 'Projects', 'Platforms built for clients, by sector.'],
              ['/contact', 'Contact', 'Share a brief and get a reply with next steps.'],
            ].map(([to, label, text]) => (
              <a key={to} href={to} className="rounded-3xl bg-paper/60 p-6 transition-colors hover:bg-tint">
                <div className="!font-display text-2xl !font-normal text-ink">{label}</div>
                <div className="mt-2 text-sm text-soft">{text}</div>
              </a>
            ))}
          </div>
        )}
      >
        <PillLink to="/" variant="dark" size="lg">Go Home</PillLink>
      </PageHero>
      <Container className="py-16" />
    </SiteLayout>
  );
}
