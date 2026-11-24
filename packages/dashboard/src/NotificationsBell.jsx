import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, BellRing, UserPlus, Gift, Mail, Calendar, CheckCircle, Settings } from 'lucide-react';
import { useDashboard } from './DashboardProvider.js';

const ICON_MAP = {
  bell: BellRing,
  user_plus: UserPlus,
  gift: Gift,
  mail: Mail,
  calendar: Calendar,
  check: CheckCircle,
  settings: Settings,
};

function timeAgo(dateStr) {
  if (!dateStr) return '';
  const now = new Date();
  const then = new Date(dateStr);
  const seconds = Math.floor((now - then) / 1000);
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return then.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function NotificationIcon({ icon }) {
  const IconComp = ICON_MAP[icon] || BellRing;
  return <IconComp className="w-4 h-4 text-accent" />;
}

/**
 * The notifications behind the bell, for a bell drawn by the project:
 * fetched on mount and every 30 seconds, with marking one or all as read.
 *
 * @param {string} [listPath='/notifications']
 * @param {string} [markAllPath='/notifications/mark-read'] - POSTed to mark all read
 * @param {string | ((id) => string)} [markOnePath] - POSTed to mark one read;
 *   a string with ':id' in it, or a function of the id
 * @param {(item) => object} [map] - Turns one of the API's items into what the bell shows
 * @returns {{ notifications, unreadCount, refresh, markRead(id), markAllRead() }}
 *   markRead and markAllRead resolve when done and reject on failure, so the
 *   caller can say so.
 */
export function useNotifications({ listPath = '/notifications', markAllPath = '/notifications/mark-read', markOnePath, map } = {}) {
  const { api } = useDashboard();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const latest = useRef({ listPath, map });
  latest.current = { listPath, map };

  const fetchNotifications = async (isCancelled = () => false) => {
    try {
      const res = await api.get(latest.current.listPath);
      if (isCancelled()) return;
      const payload = res.data;
      const raw = Array.isArray(payload) ? payload : (Array.isArray(payload?.data) ? payload.data : []);
      const items = latest.current.map ? raw.map(latest.current.map) : raw;
      setNotifications(items);
      setUnreadCount(items.filter(n => !n.read_at).length);
    } catch (e) {
      console.error("Failed to fetch notifications", e);
    }
  };

  useEffect(() => {
    let cancelled = false;
    fetchNotifications(() => cancelled);
    const interval = setInterval(() => fetchNotifications(() => cancelled), 30000);
    return () => { cancelled = true; clearInterval(interval); };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- fetch on mount, then every 30 seconds
  }, []);

  const markAllRead = async () => {
    await api.post(markAllPath);
    setNotifications((list) => list.map((n) => ({ ...n, read_at: n.read_at || new Date().toISOString() })));
    setUnreadCount(0);
    fetchNotifications();
  };

  const markRead = async (id) => {
    if (!markOnePath) throw new Error('useNotifications: markOnePath is needed to mark one notification read');
    const path = typeof markOnePath === 'function' ? markOnePath(id) : markOnePath.replace(':id', encodeURIComponent(id));
    await api.post(path);
    setNotifications((list) => list.map((n) => (n.id === id ? { ...n, read_at: n.read_at || new Date().toISOString() } : n)));
    setUnreadCount((c) => Math.max(0, c - 1));
    fetchNotifications();
  };

  return { notifications, unreadCount, refresh: fetchNotifications, markRead, markAllRead };
}

/**
 * The header's notifications bell (for DashboardProvider `shell.Notifications`):
 * the workspace's latest notifications from okjt/laravel-kit's
 * NotificationController (GET /notifications), refreshed every 30 seconds,
 * with "Mark all read". A notification with a `link` opens that page. It
 * closes on a click outside it and on Escape.
 *
 * An app with its own notifications API says where they are and how each
 * one reads:
 *
 * @param {string} [listPath='/notifications']
 * @param {string} [markAllPath='/notifications/mark-read'] - POSTed by "Mark all read"
 * @param {string | ((id) => string)} [markOnePath] - for marking one read (see useNotifications)
 * @param {(item) => { id, title, message, link, icon, read_at, created_at }} [map]
 *   - Turns one of the API's items into what the bell shows
 *
 * An app whose bell looks different draws it, keeping the kit's behaviour
 * (fetching, polling, marking read, opening and closing):
 * @param {(bell) => node} [renderButton] - bell: { open, toggle, unreadCount }
 * @param {(bell) => node} [renderPanel]  - bell: { notifications, unreadCount,
 *   markRead, markAllRead, close, refresh }; shown while open
 */
export default function NotificationsBell({ listPath = '/notifications', markAllPath = '/notifications/mark-read', markOnePath, map, renderButton, renderPanel }) {
  const navigate = useNavigate();
  const { notifications, unreadCount, refresh, markRead, markAllRead } = useNotifications({ listPath, markAllPath, markOnePath, map });
  const [showNotifications, setShowNotifications] = useState(false);
  const rootRef = useRef(null);
  const toggle = () => setShowNotifications((v) => !v);
  const close = () => setShowNotifications(false);

  // Close on a click outside the bell, and on Escape.
  useEffect(() => {
    if (!showNotifications) return undefined;
    const onPointerDown = (e) => { if (rootRef.current && !rootRef.current.contains(e.target)) setShowNotifications(false); };
    const onKey = (e) => { if (e.key === 'Escape') setShowNotifications(false); };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [showNotifications]);

  const handleMarkAllRead = async () => {
    try {
      await markAllRead();
    } catch (e) {
      console.error("Failed to mark read", e);
    }
  };

  if (renderButton || renderPanel) {
    const bell = { open: showNotifications, toggle, close, unreadCount, notifications, markRead, markAllRead, refresh };
    return (
      <div className="relative" ref={rootRef}>
        {renderButton ? renderButton(bell) : null}
        {showNotifications && renderPanel ? renderPanel(bell) : null}
      </div>
    );
  }

  return (
    <div className="relative" ref={rootRef}>
      <button
        onClick={toggle}
        aria-label={unreadCount > 0 ? `Notifications, ${unreadCount} unread` : 'Notifications'}
        aria-haspopup="true"
        aria-expanded={showNotifications}
        className="relative p-2 rounded-xl hover:bg-contrast/5"
      >
        <Bell className="w-5 h-5 text-soft" />
        <span 
          className="absolute top-1 right-1 w-2 h-2 rounded-full"
          style={{ background: 'var(--color-accent)', display: unreadCount > 0 ? 'block' : 'none' }}
        />
      </button>

      <AnimatePresence>
        {showNotifications && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute top-full right-0 mt-2 w-80 bg-surface rounded-2xl shadow-xl border border-tone-100 py-2 z-50 overflow-hidden"
          >
             <div className="px-4 py-2 border-b border-tone-50 flex justify-between items-center">
                <span className="text-tone-800 font-medium">Notifications</span>
                <button onClick={handleMarkAllRead} className="text-xs text-accent hover:text-accent-dark">Mark all read</button>
             </div>
             <div className="max-h-[300px] overflow-y-auto">
                {notifications.length > 0 ? notifications.map(n => {
                  const title = n.title || 'Notification';
                  const message = n.message || '';
                  return (
                    <button
                      type="button"
                      key={n.id}
                      className="w-full text-left px-4 py-3 hover:bg-paper-warm focus:bg-paper-warm focus:outline-none border-b border-tone-50 last:border-0 transition-colors"
                      onClick={() => { setShowNotifications(false); if (n.link) navigate(n.link); }}
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 p-1.5 rounded-lg bg-accent/10 shrink-0">
                          <NotificationIcon icon={n.icon} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm ${!n.read_at ? 'font-bold text-tone-900' : 'font-medium text-tone-700'}`}>{title}</p>
                          {message && <p className="text-xs text-tone-600 mt-0.5 truncate">{message}</p>}
                          <p className="text-xs text-tone-500 mt-1">{timeAgo(n.created_at)}</p>
                        </div>
                        {!n.read_at && <span className="w-2 h-2 rounded-full bg-accent shrink-0 mt-1.5" aria-label="Unread" />}
                      </div>
                    </button>
                  );
                }) : (
                  <div className="px-4 py-8 text-center text-xs text-tone-400 italic">No notifications yet</div>
                )}
             </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
