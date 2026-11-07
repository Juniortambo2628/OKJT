import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Sparkles, X } from 'lucide-react';

const KEY = 'okjt_similar_prompt_dismissed';

/**
 * A prompt at the bottom of a case study, once the reader is a third of the
 * way down: request something similar. Dismissed, it stays away for the visit.
 */
export default function SimilarWorkPrompt({ project }) {
  const [shown, setShown] = useState(false);
  const [dismissed, setDismissed] = useState(() => { try { return sessionStorage.getItem(KEY) === '1'; } catch { return false; } });

  useEffect(() => {
    if (dismissed) return undefined;
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (max > 0 && window.scrollY / max > 0.33) setShown(true);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [dismissed]);

  const dismiss = () => {
    setDismissed(true);
    try { sessionStorage.setItem(KEY, '1'); } catch { /* this page only */ }
  };

  return (
    <AnimatePresence>
      {shown && !dismissed && project && (
        <motion.aside
          role="complementary"
          aria-label="Request similar work"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 40 }}
          transition={{ duration: 0.35 }}
          className="glass-strong fixed inset-x-3 bottom-[5.25rem] z-40 mx-auto max-w-2xl rounded-3xl p-4 sm:bottom-5 sm:flex sm:items-center sm:gap-4 sm:p-5 sm:pr-3"
        >
          <span className="hidden h-11 w-11 shrink-0 place-items-center rounded-full bg-fill text-on-ink sm:grid"><Sparkles className="h-5 w-5" aria-hidden="true" /></span>
          <div className="flex min-w-0 flex-1 items-start gap-3">
            <div className="min-w-0 flex-1">
              <div className="font-display text-lg font-normal leading-snug text-ink"><span className="sm:hidden">Want something similar?</span><span className="hidden sm:inline">Want something like {project.title.split(':')[0]}?</span></div>
              <div className="mt-0.5 text-sm leading-snug text-soft">Share a short brief and get a reply with next steps.</div>
            </div>
            <button type="button" onClick={dismiss} aria-label="Dismiss" className="-mr-1 -mt-1 shrink-0 rounded-full p-2 text-muted hover:bg-tint hover:text-ink sm:hidden"><X className="h-4 w-4" /></button>
          </div>
          <Link to={`/contact?project=${encodeURIComponent(project.title)}`} className="okjt-pill okjt-pill-dark mt-3 flex w-full items-center justify-center rounded-full px-5 py-3 text-sm font-semibold sm:mt-0 sm:inline-flex sm:w-auto sm:shrink-0 sm:py-2.5">Request Similar Work</Link>
          <button type="button" onClick={dismiss} aria-label="Dismiss" className="hidden shrink-0 rounded-full p-2 text-muted hover:bg-tint hover:text-ink sm:block"><X className="h-4 w-4" /></button>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
