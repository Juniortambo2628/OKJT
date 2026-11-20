import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { AlertTriangle, CheckCircle2, Info, XCircle } from 'lucide-react';
import { Container, Eyebrow, PillLink, SectionHeading } from '@okjt/site';
import { Spinner } from '@okjt/ui';
import JourneyPage from '../components/Journey';
import { Busy, LoadError, useElapsed } from '../components/States';
import api, { errorMessage } from '../lib/api';
import { useContact, useSettings } from '../lib/content';
import { DEFAULT_HERO } from '../lib/defaults';

const field = 'w-full rounded-2xl border border-line bg-paper px-4 py-3 text-sm text-ink placeholder:text-faint focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30';
const submitClass = 'inline-flex w-full items-center justify-center rounded-full bg-fill px-7 py-3.5 text-sm font-semibold uppercase tracking-[0.08em] text-on-ink transition-colors hover:bg-fill-hover disabled:opacity-60 sm:w-auto';

/** How each result shows: its icon, colour and the word read out for it. */
const STATUS = {
  pass: { icon: CheckCircle2, className: 'text-positive', label: 'Passed' },
  warn: { icon: AlertTriangle, className: 'text-accent', label: 'Look at this' },
  fail: { icon: XCircle, className: 'text-red-400', label: 'Failed' },
  info: { icon: Info, className: 'text-muted', label: 'Note' },
};

const GROUPS = ['Indexing', 'Content', 'Sharing', 'Setup'];

const TOOL_FAQS = [
  { q: 'Is it free?', a: 'Yes. Check as many pages as you like; there is a short limit per minute so the tool stays fast for everyone.' },
  { q: 'What does it check?', a: 'What a search engine meets first: robots.txt and the sitemap, redirects, whether the page may be indexed, its canonical address, title, description and headings, how much of the page is there before JavaScript runs, link previews, and Google’s own speed scores.' },
  { q: 'What is kept?', a: 'The report, at its own address for 30 days, so you can share it. Your email address only if you ask for the report by email.' },
  { q: 'Why might Search Console say something different?', a: 'This checks one page as it is right now. Search Console reports what Google found across the whole site the last time it crawled, which can be days or weeks behind.' },
];

/** The form: a web address in, a report out. */
function CheckForm() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const [failure, setFailure] = useState('');
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({ defaultValues: { url: params.get('url') || '' } });
  const seconds = useElapsed(isSubmitting);
  const started = useRef(false);

  const submit = handleSubmit(async ({ url }) => {
    setFailure('');
    try {
      const res = await api.post('/tools/site-check', { url });
      navigate(`/tools/site-check/${res.data.data.id}`);
    } catch (error) {
      setFailure(errorMessage(error, 'The check could not run. Please try again in a minute.'));
    }
  });

  // Sent here from the home page's form (/tools/site-check?url=…): run the check straight away, once.
  useEffect(() => {
    if (!params.get('url') || started.current) return;
    started.current = true;
    setParams({}, { replace: true });
    submit();
    document.getElementById('check-form')?.scrollIntoView({ block: 'center' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div id="check-form" className="glass-strong rounded-[2rem] p-6 sm:p-10">
      <form onSubmit={submit} noValidate className="space-y-5">
        <label className="block">
          <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.15em] text-soft">Web address</span>
          <input type="text" inputMode="url" autoComplete="url" placeholder="example.com" readOnly={isSubmitting} className={`${field} read-only:opacity-70`} {...register('url', { required: 'The address of the page to check.' })} />
          {errors.url && <span role="alert" className="mt-1 block text-xs text-red-400">{errors.url.message}</span>}
        </label>
        {failure && <p role="alert" className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">{failure}</p>}
        <button type="submit" disabled={isSubmitting} className={submitClass}>{isSubmitting ? <Busy>Checking…</Busy> : 'Check the Site'}</button>
        {isSubmitting ? (
          <div role="status" aria-live="polite" className="space-y-2">
            <div className="h-1.5 overflow-hidden rounded-full bg-line" aria-hidden="true">
              <div className="h-full rounded-full bg-accent transition-[width] duration-1000 ease-out motion-reduce:transition-none" style={{ width: `${Math.min(92, Math.round((1 - Math.exp(-seconds / 9)) * 100))}%` }} />
            </div>
            <p className="text-sm text-soft">
              {seconds < 4 ? 'Fetching the page…' : seconds < 9 ? 'Reading robots.txt and the sitemap…' : seconds < 14 ? 'Checking redirects, tags and content…' : 'Almost there…'}
              <span className="tabular-nums text-muted"> {seconds} s, usually about 15</span>
            </p>
          </div>
        ) : (
          <p className="text-sm text-soft">It takes about fifteen seconds. Any public page works: a home page, a product, an article.</p>
        )}
      </form>
    </div>
  );
}

/** /tools/site-check: the tool. */
export function SiteCheckTool() {
  const { setting } = useSettings();
  return (
    <JourneyPage
      hero={{
        media: setting('hero_contact_media') || DEFAULT_HERO,
        eyebrow: 'Free Tool',
        title: 'Can Google <br />read your site?',
        text: 'A free check of any web page: whether search engines can crawl and index it, how it looks when shared, and how fast it loads, with a plain fix for each problem.',
        breadcrumbs: [{ to: '/', label: 'Home' }, { label: 'Website health check' }],
      }}
      label="The site check"
      chapters={[
        {
          id: 'check',
          navLabel: 'Check a page',
          when: 'Fifteen seconds',
          title: 'Check a page',
          intro: 'Enter the address of any public page. The report has its own link, so you can share it with whoever looks after the site.',
          aside: <CheckForm />,
          steps: [
            { title: 'Crawling', text: 'robots.txt, the sitemap, redirects, and whether Google can load the files the page needs.' },
            { title: 'Indexing', text: 'Whether the page may appear in search, and which address is its main one.' },
            { title: 'Content', text: 'Title, description, headings, and how much of the page is there before JavaScript runs.' },
            { title: 'Sharing and speed', text: 'Link previews for WhatsApp and LinkedIn, and Google’s own speed scores on a phone.' },
          ],
          tip: 'Built from the checks used to fix okjtech.co.ke’s own indexing problems in Google Search Console.',
        },
      ]}
      faqs={TOOL_FAQS}
    />
  );
}

/** One result row, styled like the Journey's steps. */
function Result({ check }) {
  const status = STATUS[check.status] ?? STATUS.info;
  const Icon = status.icon;
  return (
    <li className="flex gap-3 p-4 sm:gap-4 sm:p-5">
      <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${status.className}`} aria-hidden="true" />
      <div className="min-w-0 flex-1">
        <h3 className="!font-sans text-base !font-semibold !text-ink"><span className="sr-only">{status.label}: </span>{check.title}</h3>
        <p className="mt-1 text-sm leading-relaxed text-soft [overflow-wrap:anywhere]">{check.detail}</p>
        {check.fix && <p className="mt-2 text-sm leading-relaxed text-body"><span className="font-semibold text-ink">Fix: </span>{check.fix}</p>}
      </div>
    </li>
  );
}

/** Google PageSpeed Insights, asked for from the browser (it can take half a minute), then kept with the report. */
function useSpeed(check) {
  const queryClient = useQueryClient();
  const { setting } = useSettings();
  const [state, setState] = useState('idle');

  useEffect(() => {
    if (!check || check.speed || state !== 'idle') return;
    setState('loading');
    const params = new URLSearchParams({ url: check.url, strategy: 'mobile' });
    ['PERFORMANCE', 'ACCESSIBILITY', 'BEST_PRACTICES', 'SEO'].forEach((c) => params.append('category', c));
    const key = setting('pagespeed_api_key');
    if (key) params.set('key', key);
    fetch(`https://www.googleapis.com/pagespeedonline/v5/runPagespeed?${params}`)
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(String(res.status)))))
      .then((data) => {
        const cats = data.lighthouseResult?.categories ?? {};
        const audits = data.lighthouseResult?.audits ?? {};
        const score = (c) => (cats[c]?.score == null ? null : Math.round(cats[c].score * 100));
        return api.post(`/tools/site-check/${check.id}/speed`, {
          performance: score('performance'),
          accessibility: score('accessibility'),
          best_practices: score('best-practices'),
          seo: score('seo'),
          lcp_ms: audits['largest-contentful-paint']?.numericValue == null ? null : Math.round(audits['largest-contentful-paint'].numericValue),
          cls: audits['cumulative-layout-shift']?.numericValue ?? null,
        });
      })
      .then((res) => { queryClient.setQueryData(['site-check', check.id], res.data.data); setState('done'); })
      .catch(() => setState('failed'));
  }, [check, state, setting, queryClient]);

  return state;
}

function SpeedScores({ check, state }) {
  const speed = check.speed;
  const waiting = !speed && state !== 'failed';
  const seconds = useElapsed(waiting);
  const rows = speed ? [['Performance', speed.performance], ['Accessibility', speed.accessibility], ['Best practices', speed.best_practices], ['SEO', speed.seo]] : [];
  return (
    <div className="glass mt-6 rounded-3xl p-5 sm:p-6">
      <Eyebrow>Google PageSpeed, on a phone</Eyebrow>
      {speed ? (
        <>
          <dl className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {rows.map(([label, value]) => (
              <div key={label}>
                <dt className="text-xs font-semibold uppercase tracking-[0.15em] text-soft">{label}</dt>
                <dd className={`mt-1 !font-display text-4xl !font-light ${value == null ? 'text-muted' : value >= 90 ? 'text-positive' : value >= 50 ? 'text-accent' : 'text-red-400'}`}>{value ?? '–'}</dd>
              </div>
            ))}
          </dl>
          {speed.lcp_ms != null && <p className="mt-4 text-sm text-soft">The main content appears after {(speed.lcp_ms / 1000).toFixed(1)} s on a mid-range phone (under 2.5 s is good).</p>}
        </>
      ) : waiting ? (
        <div role="status" aria-live="polite">
          <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4" aria-hidden="true">
            {['Performance', 'Accessibility', 'Best practices', 'SEO'].map((label) => (
              <div key={label}>
                <div className="text-xs font-semibold uppercase tracking-[0.15em] text-soft">{label}</div>
                <div className="mt-2 h-10 w-16 animate-pulse rounded-xl bg-line-strong/50 motion-reduce:animate-none" />
              </div>
            ))}
          </div>
          <p className="mt-4 flex items-start gap-2 text-sm text-soft">
            <Spinner size="sm" className="mt-0.5 shrink-0 motion-reduce:animate-none" />
            <span>Google is loading the page on a test phone. <span className="tabular-nums text-muted">{seconds} s, can take up to 40</span></span>
          </p>
        </div>
      ) : (
        <p className="mt-3 text-sm text-soft" role="status">
          <>Google’s speed test isn’t answering right now. <a href={`https://pagespeed.web.dev/analysis?url=${encodeURIComponent(check.url)}`} target="_blank" rel="noopener noreferrer" className="font-semibold text-accent hover:text-accent-strong">Run it on PageSpeed Insights</a>.</>
        </p>
      )}
    </div>
  );
}

function EmailReport({ id }) {
  const [sent, setSent] = useState(false);
  const [failure, setFailure] = useState('');
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({ defaultValues: { subscribe: false } });
  const submit = handleSubmit(async (values) => {
    setFailure('');
    try {
      await api.post(`/tools/site-check/${id}/email`, values);
      setSent(true);
    } catch (error) {
      setFailure(errorMessage(error, 'The email could not be sent. Copy the report’s address instead.'));
    }
  });
  if (sent) return <p role="status" className="text-sm text-soft">Sent. Check your inbox for the report’s link.</p>;
  return (
    <form onSubmit={submit} noValidate className="space-y-4">
      <label className="block">
        <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.15em] text-soft">Email me this report</span>
        <input type="email" autoComplete="email" className={field} {...register('email', { required: 'An email address to send it to.', pattern: { value: /^\S+@\S+\.\S+$/, message: 'That email address doesn’t look right.' } })} />
        {errors.email && <span role="alert" className="mt-1 block text-xs text-red-400">{errors.email.message}</span>}
      </label>
      <label className="flex items-start gap-3 text-sm text-soft">
        <input type="checkbox" className="mt-1 h-4 w-4 accent-[var(--color-accent)] [color-scheme:light]" {...register('subscribe')} />
        <span>Also send me OKJTech’s occasional notes on building web platforms. Unsubscribe any time.</span>
      </label>
      {failure && <p role="alert" className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">{failure}</p>}
      <button type="submit" disabled={isSubmitting} className={submitClass}>{isSubmitting ? <Busy>Sending…</Busy> : 'Send the Report'}</button>
    </form>
  );
}

/** /tools/site-check/:id: a report. */
export function SiteCheckReport() {
  const { id } = useParams();
  const { setting } = useSettings();
  const contact = useContact();
  const query = useQuery({ queryKey: ['site-check', id], queryFn: () => api.get(`/tools/site-check/${id}`).then((res) => res.data.data), retry: false });
  const check = query.data;
  const speedState = useSpeed(check);
  const groups = useMemo(() => GROUPS.map((g) => [g, (check?.report.checks ?? []).filter((c) => c.group === g)]).filter(([, items]) => items.length), [check]);
  const host = check ? new URL(check.url).hostname : '';
  const summary = check?.report.summary ?? {};

  if (query.isError) {
    return (
      <JourneyPage hero={{ media: setting('hero_contact_media') || DEFAULT_HERO, eyebrow: 'Site check', title: 'Report not found', text: 'Reports are kept for 30 days. Run the check again to get a fresh one.', breadcrumbs: [{ to: '/', label: 'Home' }, { to: '/tools/site-check', label: 'Website health check' }, { label: 'Report' }], cta: { to: '/tools/site-check', label: 'Check a Site' } }} faqs={false}>
        <Container className="py-16"><LoadError what="this report" /></Container>
      </JourneyPage>
    );
  }

  return (
    <JourneyPage
      loading={query.isLoading}
      hero={{
        media: setting('hero_contact_media') || DEFAULT_HERO,
        eyebrow: 'Site check',
        title: host || 'Your report',
        text: check ? `Checked ${new Date(check.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}. This report stays at its address for 30 days.` : 'Loading the report…',
        breadcrumbs: [{ to: '/', label: 'Home' }, { to: '/tools/site-check', label: 'Website health check' }, { label: host || 'Report' }],
        cta: contact.booking ? { to: '/book', label: 'Book a Call' } : { to: '/contact', label: 'Start a Project' },
        secondary: { to: '/tools/site-check', label: 'Check Another Site' },
      }}
      glance={check ? [[String(summary.pass ?? 0), 'checks passed'], [String(summary.warn ?? 0), 'to look at'], [String(summary.fail ?? 0), 'failed'], [check.speed?.performance != null ? String(check.speed.performance) : speedState === 'failed' ? '–' : <Spinner key="speed" size="lg" className="mt-1 motion-reduce:animate-none" />, 'speed on a phone']] : undefined}
      faqs={TOOL_FAQS}
    >
      {check && (
        <Container className="py-20">
          <SectionHeading eyebrow="The results" title={<span className="[overflow-wrap:anywhere]">{check.url.replace(/^https?:\/\//, '').replace(/\/$/, '')}</span>} text="Fix what failed first, then what to look at. Each fix is written so you can hand it to whoever looks after the site." />
          <SpeedScores check={check} state={speedState} />
          {groups.map(([group, items]) => (
            <section key={group} className="mt-10" aria-labelledby={`group-${group}`}>
              <h2 id={`group-${group}`} className="!font-display text-2xl !font-light !text-ink">{group}</h2>
              <ol className="glass mt-4 divide-y divide-line/60 rounded-3xl">
                {items.map((c) => <Result key={c.id} check={c} />)}
              </ol>
            </section>
          ))}
          <div className="mt-12 grid gap-6 lg:grid-cols-2">
            <div className="glass-strong rounded-[2rem] p-6 sm:p-10">
              <h2 className="!font-display text-3xl !font-light !text-ink">Want these fixed?</h2>
              <p className="mt-3 text-soft">OKJTech fixes indexing, speed and structure on sites like this one.</p>
              <div className="mt-6 flex flex-wrap gap-3">
                {contact.booking && <PillLink to="/book" variant="dark">Book a Call</PillLink>}
                <PillLink to="/contact" variant={contact.booking ? 'outline' : 'dark'}>Send a Brief</PillLink>
              </div>
              <p className="mt-6 text-sm text-soft">Or <Link to="/tools/site-check" className="font-semibold text-accent hover:text-accent-strong">check another page</Link>.</p>
            </div>
            <div className="glass-strong rounded-[2rem] p-6 sm:p-10"><EmailReport id={check.id} /></div>
          </div>
        </Container>
      )}
    </JourneyPage>
  );
}
