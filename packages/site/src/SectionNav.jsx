import { useEffect, useRef } from 'react';
import useScrollSpy from './useScrollSpy.js';
import { Container } from './ui.js';

/** Sections linked from a SectionNav need this much room above them when jumped to. */
export const SECTION_OFFSET = 'scroll-mt-36';

/**
 * The sticky bar of chips under the main nav, one per section of the page,
 * the one being read highlighted. Sections: [{ id, label }]; each section on
 * the page carries that id and SECTION_OFFSET.
 */
export default function SectionNav({ sections, label, numbered = false, className = '' }) {
  const active = useScrollSpy(sections.map((s) => s.id));
  const bar = useRef(null);

  // Keep the current chip in view as the reader moves down the page.
  useEffect(() => {
    const nav = bar.current;
    const chip = nav?.querySelector('[aria-current]');
    if (!nav || !chip) return;
    const left = chip.offsetLeft - nav.clientWidth / 2 + chip.clientWidth / 2;
    nav.scrollTo?.({ left, behavior: 'smooth' });
  }, [active]);

  return (
    <div className={`sticky top-[4.25rem] z-30 border-y border-line/70 bg-tint/90 backdrop-blur-xl ${className}`}>
      <Container>
        <nav ref={bar} aria-label={label} className="-mx-4 flex gap-2 overflow-x-auto px-4 py-3 [scrollbar-width:none] [mask-image:linear-gradient(to_right,black_calc(100%-2.5rem),transparent)]">
          {sections.map((section, i) => {
            const current = active === section.id;
            return (
              <a
                key={section.id}
                href={`#${section.id}`}
                aria-current={current ? 'location' : undefined}
                className={`shrink-0 rounded-full px-4 py-2 text-xs font-semibold transition-colors ${current ? 'bg-ink text-white' : 'bg-white text-soft hover:text-ink'}`}
              >
                {numbered && <span className={`mr-1.5 tabular-nums ${current ? 'text-accent-soft' : 'text-faint'}`}>{String(i + 1).padStart(2, '0')}</span>}
                {section.label}
              </a>
            );
          })}
        </nav>
      </Container>
    </div>
  );
}
