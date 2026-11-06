import { useEffect } from 'react';
import { Container, PillLink, SiteLayout } from '@okjt/site';

export default function NotFound() {
  useEffect(() => {
    document.title = 'Page not found | OKJTech';
    document.querySelector('meta[name="robots"]')?.setAttribute('content', 'noindex, nofollow');
  }, []);
  return (
    <SiteLayout cta={false}>
      <Container className="py-32 text-center">
        <div className="font-display text-[8rem] font-extralight leading-none text-accent/40 sm:text-[12rem]">404</div>
        <h1 className="mt-4 !font-display text-4xl !font-light !text-ink">This page isn’t here.</h1>
        <p className="mx-auto mt-4 max-w-md text-soft">It may have moved, or the address may have a typo.</p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <PillLink to="/">Go home</PillLink>
          <PillLink to="/projects" variant="outline">See the work</PillLink>
        </div>
      </Container>
    </SiteLayout>
  );
}
