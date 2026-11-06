import { SectionHeading, SECTION_OFFSET, Container } from '@okjt/site';
import MediaFill from './MediaFill';

/**
 * One section of a public page: an id for the section bar and links, an
 * optional heading, and optionally a dimmed photo or clip behind it.
 */
export default function Section({ id, eyebrow, title, text, align = 'center', media, className = '', children }) {
  return (
    <section id={id} className={`relative isolate ${SECTION_OFFSET} ${media ? 'overflow-hidden py-24 sm:py-32' : 'py-20 sm:py-28'} ${className}`}>
      {media && (
        <>
          <MediaFill src={media} className="-z-20 opacity-40" />
          <div className="absolute inset-0 -z-10 bg-gradient-to-b from-paper via-paper/70 to-paper" />
        </>
      )}
      {/* Warm glows behind the section, so its glass cards have something to frost. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-40 top-10 h-[28rem] w-[28rem] rounded-full bg-accent/[0.07] blur-3xl" />
        <div className="absolute -right-32 bottom-0 h-[24rem] w-[24rem] rounded-full bg-accent-dark/[0.08] blur-3xl" />
      </div>
      <Container>
        {title && <SectionHeading eyebrow={eyebrow} title={title} text={text} align={align} className="mb-12 sm:mb-16" />}
        {children}
      </Container>
    </section>
  );
}
