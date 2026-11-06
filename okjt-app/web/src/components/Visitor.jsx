import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Bot, MessageCircle, Send, X } from 'lucide-react';
import api from '../lib/api';
import { useSettings } from '../lib/content';

/* ---------- Cookie consent (same storage as the old site, so answers carry over) ---------- */

const CONSENT_KEY = 'okjt_cookie_consent';
const readConsent = () => { try { return JSON.parse(localStorage.getItem(CONSENT_KEY)); } catch { return null; } };
const saveConsent = (analytics) => {
  try { localStorage.setItem(CONSENT_KEY, JSON.stringify({ essential: true, analytics, marketing: false })); } catch { /* this visit only */ }
};

export function CookieConsent() {
  const [answered, setAnswered] = useState(() => readConsent() !== null);
  if (answered) return null;
  const answer = (analytics) => { saveConsent(analytics); setAnswered(true); };
  return (
    <div role="dialog" aria-label="Cookies" className="fixed inset-x-3 bottom-3 z-50 mx-auto max-w-xl rounded-3xl border border-line bg-surface/95 p-5 shadow-2xl backdrop-blur-xl sm:bottom-5">
      <p className="text-sm leading-relaxed text-body">
        This site keeps a few essentials in your browser. With your permission it also counts page visits, anonymously, to see which pages help. <Link to="/cookies" className="text-accent underline">Cookie policy</Link>
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <button type="button" onClick={() => answer(true)} className="rounded-full bg-ink px-5 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-on-ink hover:bg-body">Allow</button>
        <button type="button" onClick={() => answer(false)} className="rounded-full border border-line-strong px-5 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-body hover:border-accent">Essentials only</button>
      </div>
    </div>
  );
}

/** One anonymous page view per page, only with consent. */
export function PageViews() {
  const { pathname } = useLocation();
  useEffect(() => {
    if (pathname.startsWith('/admin') || !readConsent()?.analytics) return;
    api.post('/track', { path: pathname }).catch(() => {});
  }, [pathname]);
  return null;
}

/* ---------- WhatsApp ---------- */

export function WhatsAppButton() {
  const { enabled, setting } = useSettings();
  const number = setting('whatsapp_number').replace(/[^\d]/g, '');
  if (!enabled('whatsapp_enabled') || !number) return null;
  const url = `https://wa.me/${number}?text=${encodeURIComponent(setting('whatsapp_message', 'Hello OKJTech, I would like to discuss a project.'))}`;
  return (
    <a href={url} target="_blank" rel="noopener noreferrer" aria-label="Chat on WhatsApp" className="fixed bottom-5 left-5 z-40 grid h-12 w-12 place-items-center rounded-full bg-[#25D366] text-white shadow-lg transition-transform hover:scale-105">
      <svg viewBox="0 0 24 24" className="h-6 w-6 fill-current" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2c-1.5 0-3-.4-4.3-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.2-.4.7-1.4.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2c0 1.3.9 2.5 1 2.7.1.2 1.8 2.8 4.4 3.9 1.6.7 2.3.8 3.1.6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.1-1.2l-.6-.3Z" /></svg>
    </a>
  );
}

/* ---------- The FAQ assistant: answers from the dashboard's FAQ list, in the browser ---------- */

const DEFAULT_FAQ = [
  { keywords: ['web', 'development', 'app', 'build', 'laravel', 'react', 'platform'], answer: 'OKJTechnologies designs and builds web applications end to end: customer-facing platforms, admin dashboards, online stores and the systems behind them, mostly with Laravel and React.' },
  { keywords: ['sector', 'industry', 'clients', 'worked', 'experience', 'portfolio', 'projects'], answer: 'Past projects cover healthcare, legal services, construction, events, hospitality, e-commerce, automotive, education and nonprofits. The Projects page has a write-up of each one.' },
  { keywords: ['start', 'process', 'how', 'begin', 'brief', 'scope', 'approach'], answer: 'A project starts with a short brief. The people the platform needs to serve are mapped first, then the work is scoped into clear stages with a proposal and timeline.' },
  { keywords: ['contact', 'reach', 'email', 'phone', 'office', 'talk', 'call'], answer: 'Use the Contact page, or email hello@okjtech.co.ke. Every brief receives a reply with next steps.' },
  { keywords: ['service', 'offer', 'provide', 'do', 'help', 'what'], answer: 'Services cover web application engineering, e-commerce, admin dashboards and content management, interface design, and technical strategy.' },
  { keywords: ['cost', 'price', 'budget', 'quote', 'how much'], answer: 'Costs depend on scope. Share a brief on the Contact page to receive a tailored proposal.' },
];
const DEFAULT_REPLIES = ['What does OKJTechnologies build?', 'Which sectors have you worked in?', 'How does a project start?', 'How much does it cost?'];

function answerFor(text, faq) {
  const words = text.toLowerCase();
  let best = null;
  let score = 0;
  for (const entry of faq) {
    const hits = (entry.keywords || []).filter((k) => words.includes(String(k).toLowerCase())).length;
    if (hits > score) { score = hits; best = entry; }
  }
  return best?.answer || 'That one is best answered in person. Share a few lines on the Contact page and you will get a reply with next steps.';
}

export function Assistant() {
  const { enabled, json } = useSettings();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const end = useRef(null);
  const faq = useMemo(() => { const v = json('chatbot_faq_data', null); return Array.isArray(v) && v.length ? v : DEFAULT_FAQ; }, [json]);
  const replies = useMemo(() => { const v = json('chatbot_quick_replies', null); return Array.isArray(v) && v.length ? v : DEFAULT_REPLIES; }, [json]);
  useEffect(() => { end.current?.scrollIntoView({ block: 'end' }); }, [messages]);
  if (!enabled('okjt_assistant_enabled')) return null;

  const ask = (text) => {
    if (!text.trim()) return;
    setMessages((m) => [...m, { role: 'user', text }, { role: 'bot', text: answerFor(text, faq) }]);
    setInput('');
  };

  return (
    <div className="fixed bottom-5 right-5 z-40">
      {open && (
        <div role="dialog" aria-label="OKJTech assistant" className="mb-3 flex h-[28rem] w-[min(22rem,calc(100vw-2.5rem))] flex-col overflow-hidden rounded-3xl border border-line bg-surface shadow-2xl">
          <div className="flex items-center justify-between border-b border-line px-5 py-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-ink"><Bot className="h-4 w-4 text-accent" aria-hidden="true" /> OKJTech assistant</div>
            <button type="button" onClick={() => setOpen(false)} aria-label="Close the assistant" className="rounded-full p-1 text-soft hover:text-ink"><X className="h-4 w-4" /></button>
          </div>
          <div className="flex-1 space-y-3 overflow-y-auto p-4 text-sm" aria-live="polite">
            <p className="rounded-2xl bg-tone-100 px-4 py-3 text-body">Hello. Ask about the work, the process or how to start a project.</p>
            {messages.map((m, i) => (
              <p key={i} className={`rounded-2xl px-4 py-3 ${m.role === 'user' ? 'ml-8 bg-ink text-on-ink' : 'mr-8 bg-tone-100 text-body'}`}>{m.text}</p>
            ))}
            {messages.length === 0 && (
              <div className="flex flex-wrap gap-2">
                {replies.map((r) => <button key={r} type="button" onClick={() => ask(r)} className="rounded-full border border-line px-3 py-1.5 text-xs text-soft hover:border-accent hover:text-ink">{r}</button>)}
              </div>
            )}
            <div ref={end} />
          </div>
          <form onSubmit={(e) => { e.preventDefault(); ask(input); }} className="flex gap-2 border-t border-line p-3">
            <label htmlFor="assistant-input" className="sr-only">Your question</label>
            <input id="assistant-input" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Type a question…" className="min-w-0 flex-1 rounded-full border border-line bg-paper px-4 py-2 text-sm text-ink placeholder:text-faint focus:border-accent focus:outline-none" />
            <button type="submit" aria-label="Send" className="grid h-9 w-9 place-items-center rounded-full bg-ink text-on-ink"><Send className="h-4 w-4" /></button>
          </form>
        </div>
      )}
      <button type="button" onClick={() => setOpen((v) => !v)} aria-expanded={open} aria-label={open ? 'Close the assistant' : 'Ask the assistant'} className="ml-auto grid h-12 w-12 place-items-center rounded-full bg-ink text-on-ink shadow-lg transition-transform hover:scale-105">
        {open ? <X className="h-5 w-5" /> : <MessageCircle className="h-5 w-5" />}
      </button>
    </div>
  );
}

/* ---------- Maintenance: asked once per visit, not polled ---------- */

export function useMaintenance() {
  return useQuery({
    queryKey: ['/site-settings/maintenance'],
    queryFn: () => api.get('/site-settings/maintenance').then((res) => res.data),
    staleTime: 10 * 60 * 1000,
    retry: false,
  });
}

export function MaintenancePage({ title, description, estimatedBack }) {
  return (
    <main className="grid min-h-dvh place-items-center bg-paper px-6 text-center">
      <div className="max-w-lg">
        <img src="/logos/OKJT-Logos/OKJTechLogo-White_Transparent.png" alt="OKJTech" className="mx-auto h-10 w-auto" />
        <h1 className="mt-10 !font-display text-4xl !font-light !text-ink">{title || 'System maintenance'}</h1>
        <p className="mt-4 leading-relaxed text-soft">{description}</p>
        {estimatedBack && <p className="mt-6 text-sm text-accent">Back {estimatedBack}</p>}
      </div>
    </main>
  );
}
