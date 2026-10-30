import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useCollaboration } from './CollaborationContext.js';
import CollaboratorAvatars from './CollaboratorAvatars.js';
import { useDashboard } from './DashboardProvider.js';
import { useModules } from './modules.js';

/**
 * The dashboard's sidebar: the logo, then the pages in groups
 * (DashboardProvider `shell.nav`: [{ title?, items: [{ path, icon, label, id }] }]).
 * Each page shows who else is on it and how many changes others made since
 * you last opened it. Below lg it slides in over the page.
 */
export default function DashboardSidebar({ isOpen, onClose }) {
  const location = useLocation();
  const { home, shell } = useDashboard();
  const { moduleForPath } = useModules();
  // "New" badges: changes by others since you last opened a module; avatars:
  // who else is on that page right now.
  const { badges, presence } = useCollaboration();

  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        className={`admin-sidebar fixed left-0 top-0 h-full z-50 lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } transition-transform lg:transition-none`}
        style={{ 
          width: 280,
          background: shell.sidebarBackground,
        }}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-4 flex items-center justify-center relative">
            <Link to={shell.logo.to} className="flex items-center justify-center">
              <img 
                src={shell.logo.src}
                alt={shell.logo.alt}
                className="h-10 w-auto"
              />
            </Link>
            <button
              aria-label="Close menu"
              onClick={onClose}
              className="lg:hidden absolute right-4 top-1/2 -translate-y-1/2 text-white/60 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav aria-label="Main" className="flex-1 py-2 px-3 overflow-y-auto" style={{ scrollbarWidth: 'thin', scrollbarColor: shell.sidebarScrollbar }}>
            {shell.nav.map((section, sectionIndex) => (
              <div key={section.title || sectionIndex} className={sectionIndex > 0 ? 'mt-4' : ''}>
                {section.title && (
                  <p className="px-3 mb-1 text-[10px] font-bold uppercase tracking-[0.18em] text-white/50">{section.title}</p>
                )}
                <ul className="space-y-0.5">
                  {section.items.map((item) => {
                    const isActive = location.pathname === item.path ||
                      (item.path !== home.path && location.pathname.startsWith(item.path));
                    const moduleKey = moduleForPath(item.path)?.key;
                    const newCount = isActive ? 0 : badges[moduleKey] || 0;
                    const here = presence.filter(p => p.current_module === moduleKey);
                    const label = [item.label, newCount && `${newCount} new`, here.length && `${here.map(p => p.name).join(', ')} here`]
                      .filter(Boolean).join(', ');
                    return (
                      <li key={item.path}>
                        <Link
                          id={item.id}
                          to={item.path}
                          onClick={() => onClose()}
                          aria-current={isActive ? 'page' : undefined}
                          aria-label={label !== item.label ? label : undefined}
                          className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-sm focus-visible:outline-2 focus-visible:outline-white ${
                            isActive
                              ? 'text-accent-dark bg-white shadow-sm'
                              : 'text-white/75 hover:text-accent-dark hover:bg-white'
                          }`}
                        >
                          <item.icon className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
                          <span className="font-medium truncate">{item.label}</span>
                          {(here.length > 0 || newCount > 0) && (
                            <span className="ml-auto flex items-center gap-1.5 shrink-0" aria-hidden="true">
                              <CollaboratorAvatars people={here} size="xs" max={2} />
                              {newCount > 0 && (
                                <span className={`min-w-[1.25rem] h-5 px-1.5 rounded-full ${shell.badgeClass} text-[10px] font-bold flex items-center justify-center`}>
                                  {newCount > 99 ? '99+' : newCount}
                                </span>
                              )}
                            </span>
                          )}
                          {isActive && (
                            <motion.div
                              layoutId="sidebar-indicator"
                              className={`${here.length ? '' : 'ml-auto'} w-1.5 h-1.5 rounded-full flex-shrink-0`}
                              style={{ background: 'var(--color-accent)' }}
                            />
                          )}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </nav>

        </div>
      </motion.aside>
    </>
  );
}
