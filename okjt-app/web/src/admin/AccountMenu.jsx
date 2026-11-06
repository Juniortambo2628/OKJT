import { useCallback, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, ExternalLink, LogOut, Users } from 'lucide-react';
import { useDismiss } from '@okjt/ui';
import { useAdminUser, useSignOut } from './auth';

/** The header's avatar menu: who is signed in, the website, people, sign out. */
export default function AccountMenu() {
  const { data: user } = useAdminUser();
  const signOut = useSignOut();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const close = useCallback(() => setOpen(false), []);
  useDismiss(ref, open, close);
  const item = 'flex items-center gap-3 px-4 py-2.5 text-sm text-tone-700 hover:bg-tone-100 focus:bg-tone-100 focus:outline-none';
  return (
    <div className="relative" ref={ref}>
      <button type="button" onClick={() => setOpen((v) => !v)} aria-haspopup="menu" aria-expanded={open} aria-label={`Account menu for ${user?.name || 'you'}`}
        className="flex items-center gap-2 rounded-full p-1 pr-2 transition-colors hover:bg-contrast/5">
        <span className="grid h-8 w-8 place-items-center rounded-full bg-accent text-sm font-semibold text-paper">{user?.name?.charAt(0)?.toUpperCase() || 'A'}</span>
        <span className="hidden max-w-[8rem] truncate text-sm font-medium text-body xl:block">{user?.name || 'Admin'}</span>
        <ChevronDown className={`h-4 w-4 text-tone-400 transition-transform ${open ? 'rotate-180' : ''}`} aria-hidden="true" />
      </button>
      {open && (
        <div role="menu" className="absolute right-0 top-full z-50 mt-2 w-64 overflow-hidden rounded-2xl border border-tone-200 bg-surface py-1 shadow-2xl">
          <div className="border-b border-tone-100 px-4 py-3">
            <div className="truncate text-sm font-semibold text-ink">{user?.name}</div>
            <div className="truncate text-xs text-tone-500">{user?.email}</div>
          </div>
          <a role="menuitem" href="/" target="_blank" rel="noopener noreferrer" className={item} onClick={close}><ExternalLink className="h-4 w-4" aria-hidden="true" /> Open the website</a>
          <Link role="menuitem" to="/admin/users" className={item} onClick={close}><Users className="h-4 w-4" aria-hidden="true" /> People with access</Link>
          <button role="menuitem" type="button" onClick={signOut} className={`${item} w-full border-t border-tone-100 text-left`}><LogOut className="h-4 w-4" aria-hidden="true" /> Sign out</button>
        </div>
      )}
    </div>
  );
}
