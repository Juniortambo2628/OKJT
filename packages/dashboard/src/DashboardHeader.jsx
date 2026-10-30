import { Link, useLocation } from 'react-router-dom';
import { Menu, Info, History, Share2 } from 'lucide-react';
import { usePermissions } from '@okjt/ui';
import { useCollaboration } from './CollaborationContext.js';
import CollaboratorAvatars from './CollaboratorAvatars.js';
import { useDashboard } from './DashboardProvider.js';

/**
 * The dashboard's top bar: the menu button (phones), the page's compact title
 * once its hero scrolls away, who else is on this page, a "View only" badge
 * for viewers, the page's status, quick links (DashboardProvider
 * `shell.quickLinks`), who's online, Share, Version history, the tour, and the
 * project's notifications and account menu (`shell.Notifications`,
 * `shell.AccountMenu`).
 */
export default function DashboardHeader({ onMenuClick, onRestartTutorial, titleSlotRef, statusSlotRef }) {
  const { pathname } = useLocation();
  const { presence, othersHere, openHistory, setShareOpen, badges } = useCollaboration();
  const hasNews = Object.values(badges).some(Boolean);
  const { canEdit } = usePermissions();
  const { shell } = useDashboard();
  const quickLinks = shell.quickLinks;

  return (
    <header 
      id="header"
      className="sticky top-0 z-30 h-16 px-3 sm:px-6 flex items-center justify-between gap-3"
      style={{ 
        background: shell.headerBackground,
        backdropFilter: 'blur(10px)',
        borderBottom: shell.headerBorder,
      }}
    >
      <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
        <button
          onClick={onMenuClick}
          aria-label={hasNews ? 'Open sidebar menu (new changes)' : 'Open sidebar menu'}
          className="lg:hidden relative p-2 rounded-lg hover:bg-black/5 shrink-0"
        >
          <Menu className="w-6 h-6 text-body" />
          {hasNews && <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-accent ring-2 ring-paper" aria-hidden="true" />}
        </button>
        {/* Compact page title, filled by AdminPageHero once it scrolls away */}
        <div ref={titleSlotRef} className="min-w-0 flex-1" />
        {/* Someone else is on this page: say so, to avoid overwriting each other */}
        {othersHere.length > 0 && (
          <button
            type="button"
            onClick={() => setShareOpen(true)}
            className="hidden sm:flex items-center gap-2 shrink-0 pl-1 pr-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-xs text-amber-800"
            title="Others editing here may overwrite each other's unsaved changes"
          >
            <CollaboratorAvatars people={othersHere} size="xs" max={2} />
            <span className="max-w-[14rem] truncate">
              {othersHere.length === 1 ? `${othersHere[0].name} is here too` : `${othersHere.length} others are here too`}
            </span>
          </button>
        )}
      </div>

      <div className="flex items-center gap-1 sm:gap-2 shrink-0">
        {!canEdit && (
          <span className="px-2.5 py-1 rounded-full bg-tone-100 border border-tone-200 text-xs font-medium text-tone-600 whitespace-nowrap"
            title="You can look around, but changes won't be saved. Ask an owner for edit access.">
            View only
          </span>
        )}
        {/* Page status (e.g. the designer's save indicator) */}
        <div ref={statusSlotRef} className="flex items-center empty:hidden mr-1" />

        <nav aria-label="Quick links" className="hidden md:flex items-center gap-1 pr-2 mr-1 border-r border-tone-200/70">
          {quickLinks.map((link) => {
            const active = pathname.startsWith(link.path);
            return (
              <Link
                key={link.path}
                id={link.id}
                to={link.path}
                title={link.label}
                aria-label={link.label}
                aria-current={active ? 'page' : undefined}
                className={`flex items-center gap-2 p-2 2xl:px-3 rounded-xl text-sm font-medium transition-colors ${
                  active ? 'bg-accent text-white' : 'text-soft hover:bg-accent/10 hover:text-accent'
                }`}
              >
                <link.icon className="w-5 h-5" />
                <span className="hidden 2xl:inline">{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Who's online (click for the share panel) */}
        {presence.length > 0 && (
          <button type="button" onClick={() => setShareOpen(true)} className="hidden md:flex p-1 rounded-full hover:bg-black/5"
            aria-label={`${presence.length} collaborator${presence.length === 1 ? '' : 's'} online`}>
            <CollaboratorAvatars people={presence} max={3} />
          </button>
        )}

        <button
          id="header-share"
          type="button"
          onClick={() => setShareOpen(true)}
          aria-label="Share dashboard"
          title="Share — invite collaborators"
          className="flex items-center gap-2 p-2 xl:px-3 rounded-xl text-sm font-medium text-soft hover:bg-accent/10 hover:text-accent transition-colors"
        >
          <Share2 className="w-5 h-5" />
          <span className="hidden xl:inline">Share</span>
        </button>

        <button
          id="header-history"
          type="button"
          onClick={openHistory}
          aria-label="Version history"
          title="Version history"
          className="p-2 rounded-xl text-soft hover:bg-accent/10 hover:text-accent transition-colors"
        >
          <History className="w-5 h-5" />
        </button>

        <button aria-label="Restart Dashboard Tour"
          id="header-restart"
          onClick={onRestartTutorial}
          className="hidden sm:block p-2 rounded-xl text-muted hover:bg-black/5 transition-colors"
          title="Restart Dashboard Tour"
        >
          <Info className="w-5 h-5" />
        </button>

        {shell.Notifications && <shell.Notifications />}

        {shell.AccountMenu && <shell.AccountMenu compactLinks={quickLinks} />}
      </div>
    </header>
  );
}
