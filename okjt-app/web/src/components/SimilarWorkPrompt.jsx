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
          className="glass-strong fixed inset-x-3 bottom-3 z-40 mx-auto flex max-w-2xl items-center gap-4 rounded-3xl p-4 pr-3 sm:bottom-5 sm:p-5"
        >
          <span className="hidden h-11 w-11 shrink-0 place-items-center rounded-full bg-fill text-on-ink sm:grid"><Sparkles className="h-5 w-5" aria-hidden="true" /></span>
          <div className="min-w-0 flex-1">
            <div className="font-display text-lg font-normal leading-tight text-ink">Want something like {project.title.split(':')[0]}?</div>
            <div className="mt-0.5 text-sm text-soft">Share a short brief and get a reply with next steps.</div>
          </div>
          <Link to={`/contact?project=${encodeURIComponent(project.title)}`} className="okjt-pill okjt-pill-dark shrink-0 rounded-full px-5 py-2.5 text-sm font-semibold">Request Similar Work</Link>
          <button type="button" onClick={dismiss} aria-label="Dismiss" className="shrink-0 rounded-full p-2 text-muted hover:bg-tint hover:text-ink"><X className="h-4 w-4" /></button>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
