import { useCallback, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, LogOut } from 'lucide-react';
import { useDismiss } from '@okjt/ui';
import { useAuth } from './AuthContext.js';

/**
 * The avatar menu in the dashboard header (shell.AccountMenu): who is signed
 * in and their role, the project's own entries (`extra`, e.g. switching
 * workspaces, billing; given the item class and `close`), on small screens
 * the header's quick links that don't fit (`compactLinks`), account pages
 * (`links`: { path, icon, label, id }), and logging out.
 */
export default function AccountMenu({ compactLinks = [], links = [], roleText, extra, fallbackName = 'Admin' }) {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const close = useCallback(() => setOpen(false), []);
  useDismiss(ref, open, close);

  const handleLogout = async () => {
    close();
    await logout();
  };

  const initial = user?.name?.charAt(0)?.toUpperCase() || fallbackName.charAt(0).toUpperCase();
  const itemClass = 'flex items-center gap-3 px-4 py-2.5 text-sm text-tone-700 hover:bg-paper-warm focus:bg-paper-warm focus:outline-none';

  return (
    <div className="relative" ref={ref}>
      <button
        id="header-account"
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Account menu for ${user?.name || fallbackName.toLowerCase()}`}
        className="flex items-center gap-2 p-1 pr-2 rounded-full hover:bg-black/5 transition-colors"
      >
        <span className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium bg-accent">
          {initial}
        </span>
        <span className="hidden xl:block max-w-[8rem] truncate text-sm font-medium text-body">{user?.name || fallbackName}</span>
        <ChevronDown className={`w-4 h-4 text-tone-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            role="menu"
            initial={{ opacity: 0, y: 8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-xl border border-tone-100 py-2 z-50"
          >
            <div className="px-4 py-2 border-b border-tone-100 mb-1">
              <p className="text-sm font-semibold text-tone-800 truncate">{user?.name || fallbackName}</p>
              {user?.email && <p className="text-xs text-tone-500 truncate">{user.email}</p>}
              {roleText && <p className="text-[11px] text-accent font-medium mt-0.5">{roleText}</p>}
            </div>

            {extra?.({ itemClass, close })}

            {compactLinks.length > 0 && (
              <div className="md:hidden border-b border-tone-100 pb-1 mb-1">
                {compactLinks.map((link) => (
                  <Link key={link.path} to={link.path} role="menuitem" onClick={close} className={itemClass}>
                    <link.icon className="w-4 h-4 text-accent" />
                    {link.label}
                  </Link>
                ))}
              </div>
            )}

            {links.map((link) => (
              <Link key={link.path} id={link.id} to={link.path} role="menuitem" onClick={close} className={itemClass}>
                <link.icon className="w-4 h-4 text-accent" />
                {link.label}
              </Link>
            ))}

            <div className="border-t border-tone-100 mt-1 pt-1">
              <button type="button" role="menuitem" onClick={handleLogout} className={`${itemClass} w-full text-red-600`}>
                <LogOut className="w-4 h-4" />
                Log out
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
