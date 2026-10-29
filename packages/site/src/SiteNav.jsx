import { useEffect, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { ChevronDown, Menu, X } from 'lucide-react';
import { useSignedIn, useSite } from './SiteProvider.js';
import { Container, Logo, PillLink } from './ui.js';

/**
 * The marketing pages' top bar: logo, a pill of page links, and the account
 * links. `overlay` = transparent over a hero photo until the page scrolls.
 *
 * Items come from `site.nav`. One item may open a large menu: give it
 * `mega: { Menu, MobileList, id, buttonLabel }` (Menu renders under the bar,
 * MobileList in the phone menu; both get `onNavigate` to close).
 */
export default function SiteNav({ overlay = false }) {
  const { nav, accountLinks: links } = useSite();
  const isAuthenticated = useSignedIn();
  const megaItem = nav.find((item) => item.mega);
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mega, setMega] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!mega) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') setMega(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [mega]);

  const light = overlay && !scrolled && !open && !mega;
  const closeAll = () => { setMega(false); setOpen(false); };
  const pillLink = ({ isActive }) => `rounded-full px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] transition-colors ${
    isActive
      ? 'bg-white text-ink shadow-sm'
      : light ? 'text-white/85 hover:text-white' : 'text-soft hover:text-ink'
  }`;
  // "/#pricing" is a place on the home page, not a page of its own.
  const isPage = (to) => !to.includes('#');

  return (
    <header onMouseLeave={() => setMega(false)} className={`fixed inset-x-0 top-0 z-40 transition-all duration-300 ${light ? 'py-5' : 'border-b border-line/70 bg-tint/85 py-3 backdrop-blur-xl'}`}>
      <Container className="flex items-center justify-between gap-4">
        <Logo light={light} />

        <nav aria-label="Main" className={`hidden items-center gap-1 rounded-full p-1 lg:flex ${light ? 'border border-white/30 bg-white/10 backdrop-blur-md' : 'border border-line bg-tint/70'}`}>
          {nav.map((item) => {
            if (item.mega) {
              return (
                <span key={item.to} className="flex items-center" onMouseEnter={() => setMega(true)}>
                  <NavLink to={item.to} onClick={closeAll} className={(state) => `${pillLink({ isActive: state.isActive || mega })} pr-2`}>{item.label}</NavLink>
                  <button
                    type="button"
                    aria-label={`${item.label}: ${item.mega.buttonLabel}`}
                    aria-expanded={mega}
                    aria-controls={item.mega.id}
                    // Hovering already opens it, so a mouse click keeps it open; keyboards toggle.
                    onClick={(e) => setMega((v) => (e.detail === 0 ? !v : true))}
                    className={`-ml-1 rounded-full p-1.5 ${light ? 'text-white/85 hover:text-white' : 'text-soft hover:text-ink'}`}
                  >
                    <ChevronDown className={`h-3.5 w-3.5 transition-transform ${mega ? 'rotate-180' : ''}`} aria-hidden="true" />
                  </button>
                </span>
              );
            }
            return isPage(item.to)
              ? <NavLink key={item.to} to={item.to} end className={pillLink} onMouseEnter={() => setMega(false)}>{item.label}</NavLink>
              : <Link key={item.to} to={item.to} className={pillLink({ isActive: false })} onMouseEnter={() => setMega(false)}>{item.label}</Link>;
          })}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          {isAuthenticated ? (
            <PillLink to={links.home.to} variant={light ? 'light' : 'dark'} size="sm">{links.home.label}</PillLink>
          ) : (
            <>
              <Link to={links.signIn.to} className={`text-xs font-semibold uppercase tracking-[0.12em] ${light ? 'text-white hover:text-white/80' : 'text-body hover:text-ink'}`}>{links.signIn.label}</Link>
              <PillLink to={links.signUp.to} variant={light ? 'light' : 'dark'} size="sm">{links.signUp.label}</PillLink>
            </>
          )}
        </div>

        <button
          type="button"
          className={`rounded-full p-2 lg:hidden ${light ? 'text-white' : 'text-body'}`}
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </Container>

      {mega && megaItem && <megaItem.mega.Menu id={megaItem.mega.id} onNavigate={closeAll} />}

      {open && (
        <Container className="lg:hidden">
          <nav aria-label="Main" className="mt-3 max-h-[calc(100svh-6rem)] overflow-y-auto rounded-3xl border border-line bg-white p-3 shadow-xl">
            {nav.map((item) => (item.mega
              ? <item.mega.MobileList key={item.to} onNavigate={closeAll} />
              : <Link key={item.to} to={item.to} onClick={() => setOpen(false)} className="block rounded-2xl px-4 py-3 text-body hover:bg-tint">{item.label}</Link>))}
            <div className="mt-2 flex gap-3 border-t border-line pt-3">
              <PillLink to={isAuthenticated ? links.home.to : links.signIn.to} variant="outline" size="sm" className="flex-1">
                {isAuthenticated ? links.home.label : links.signIn.label}
              </PillLink>
              {!isAuthenticated && <PillLink to={links.signUp.to} size="sm" className="flex-1">{links.signUp.label}</PillLink>}
            </div>
          </nav>
        </Container>
      )}
    </header>
  );
}
