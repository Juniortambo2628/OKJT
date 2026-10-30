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
 * The header's notifications bell (for DashboardProvider `shell.Notifications`):
 * the workspace's latest notifications from okjt/laravel-kit's
 * NotificationController (GET /notifications), refreshed every 30 seconds,
 * with "Mark all read". A notification with a `link` opens that page.
 */
export default function NotificationsBell() {
  const navigate = useNavigate();
  const { api } = useDashboard();
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const fetchedRef = useRef(false);
  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      const payload = res.data;
      const items = Array.isArray(payload) ? payload : (Array.isArray(payload?.data) ? payload.data : []);
      setNotifications(items);
      setUnreadCount(items.filter(n => !n.read_at).length);
    } catch (e) {
      console.error("Failed to fetch notifications", e);
    }
  };

  useEffect(() => {
    let cancelled = false;
    const init = async () => {
      if (!fetchedRef.current) {
        fetchedRef.current = true;
        try {
          const res = await api.get('/notifications');
          if (cancelled) return;
          const payload = res.data;
          const items = Array.isArray(payload) ? payload : (Array.isArray(payload?.data) ? payload.data : []);
          setNotifications(items);
          setUnreadCount(items.filter(n => !n.read_at).length);
        } catch (e) {
          console.error("Failed to fetch notifications", e);
        }
      }
    };
    init();
    const interval = setInterval(fetchNotifications, 30000);
    return () => { cancelled = true; clearInterval(interval); };
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await api.post('/notifications/mark-read');
      fetchNotifications();
    } catch (e) {
      console.error("Failed to mark read", e);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowNotifications(!showNotifications)}
        aria-label={unreadCount > 0 ? `Notifications, ${unreadCount} unread` : 'Notifications'}
        aria-haspopup="true"
        aria-expanded={showNotifications}
        className="relative p-2 rounded-xl hover:bg-black/5"
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
            className="absolute top-full right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-tone-100 py-2 z-50 overflow-hidden"
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
