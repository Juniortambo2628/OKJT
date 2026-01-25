import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, 
  Check, 
  CheckCheck,
  Trash2,
  MessageSquare,
  Briefcase,
  UserPlus,
  AlertCircle,
  Clock
} from 'lucide-react';
import AdminLayout from './components/AdminLayout';
import { notificationsApi } from '../../api/client';
import type { Notification } from '../../types';

// Mock notifications for demo
const mockNotifications: Notification[] = [
  {
    id: 1,
    type: 'submission',
    title: 'New Contact Submission',
    message: 'John Doe submitted a contact form requesting a website quote.',
    link: '/admin/submissions',
    is_read: false,
    created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
  },
  {
    id: 2,
    type: 'submission',
    title: 'Consultation Request',
    message: 'Jane Smith requested an online consultation for January 5th at 10:00 AM.',
    link: '/admin/submissions',
    is_read: false,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
  },
  {
    id: 3,
    type: 'portfolio',
    title: 'Project Update Required',
    message: 'Healthcare Dashboard project is marked as in progress for over 30 days.',
    link: '/admin/portfolio',
    is_read: true,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  },
  {
    id: 4,
    type: 'system',
    title: 'Weekly Analytics Report',
    message: 'Your site had 1,247 page views this week, up 18% from last week.',
    link: '/admin/analytics',
    is_read: true,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
  },
  {
    id: 5,
    type: 'submission',
    title: 'Follow-up Reminder',
    message: 'Mike Johnson\'s submission has been pending for 5 days.',
    link: '/admin/submissions',
    is_read: true,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
  },
];

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'submission':
      return MessageSquare;
    case 'portfolio':
      return Briefcase;
    case 'user':
      return UserPlus;
    case 'system':
      return AlertCircle;
    default:
      return Bell;
  }
};

const getNotificationColor = (type: string): string => {
  switch (type) {
    case 'submission':
      return 'notification-icon-green';
    case 'portfolio':
      return 'notification-icon-blue';
    case 'user':
      return 'notification-icon-purple';
    case 'system':
      return 'notification-icon-amber';
    default:
      return 'notification-icon-gray';
  }
};

const formatTimeAgo = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;
  return date.toLocaleDateString();
};

export default function AdminNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    setIsLoading(true);
    try {
      const data = await notificationsApi.getAll();
      if (data.length > 0) {
        setNotifications(data);
      }
    } catch (error) {
      // Use mock data on error
      console.log('Using mock notifications');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkAsRead = async (id: number) => {
    try {
      await notificationsApi.markAsRead(id);
      setNotifications(notifications.map(n => 
        n.id === id ? { ...n, is_read: true } : n
      ));
    } catch (error) {
      // Optimistically update UI
      setNotifications(notifications.map(n => 
        n.id === id ? { ...n, is_read: true } : n
      ));
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationsApi.markAllAsRead();
      setNotifications(notifications.map(n => ({ ...n, is_read: true })));
    } catch (error) {
      // Optimistically update UI
      setNotifications(notifications.map(n => ({ ...n, is_read: true })));
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await notificationsApi.delete(id);
      setNotifications(notifications.filter(n => n.id !== id));
    } catch (error) {
      // Optimistically update UI
      setNotifications(notifications.filter(n => n.id !== id));
    }
  };

  const filteredNotifications = filter === 'unread' 
    ? notifications.filter(n => !n.is_read)
    : notifications;

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <AdminLayout title="Notifications" subtitle="Stay updated with your site activity">
      {/* Actions Bar */}
      <div className="admin-actions-bar">
        <div className="admin-filter-tabs">
          <button
            onClick={() => setFilter('all')}
            className={`admin-filter-tab ${filter === 'all' ? 'active' : ''}`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`admin-filter-tab ${filter === 'unread' ? 'active' : ''}`}
          >
            Unread
            {unreadCount > 0 && (
              <span className="admin-filter-badge">{unreadCount}</span>
            )}
          </button>
        </div>

        {unreadCount > 0 && (
          <button onClick={handleMarkAllAsRead} className="admin-btn-secondary">
            <CheckCheck size={16} />
            Mark all as read
          </button>
        )}
      </div>

      {/* Notifications List */}
      {isLoading ? (
        <div className="admin-loading">
          <div className="admin-loading-spinner" />
          <p>Loading notifications...</p>
        </div>
      ) : filteredNotifications.length === 0 ? (
        <motion.div
          className="admin-empty-state"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <Bell size={48} />
          <h3>{filter === 'unread' ? 'No unread notifications' : 'No notifications'}</h3>
          <p>
            {filter === 'unread' 
              ? "You're all caught up!"
              : "You'll see notifications here when there's activity on your site."
            }
          </p>
        </motion.div>
      ) : (
        <div className="admin-notifications-list">
          <AnimatePresence>
            {filteredNotifications.map((notification, index) => {
              const Icon = getNotificationIcon(notification.type);
              const colorClass = getNotificationColor(notification.type);
              
              return (
                <motion.div
                  key={notification.id}
                  className={`admin-notification-card ${!notification.is_read ? 'unread' : ''}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <div className="admin-notification-content">
                    {/* Icon */}
                    <div className={`admin-notification-icon ${colorClass}`}>
                      <Icon size={20} />
                    </div>

                    {/* Content */}
                    <div className="admin-notification-body">
                      <div className="admin-notification-header">
                        <div>
                          <h3 className={notification.is_read ? 'read' : ''}>
                            {notification.title}
                          </h3>
                          <p>{notification.message}</p>
                        </div>

                        {/* Actions */}
                        <div className="admin-notification-actions">
                          {!notification.is_read && (
                            <button
                              onClick={() => handleMarkAsRead(notification.id)}
                              className="admin-icon-btn success"
                              title="Mark as read"
                            >
                              <Check size={16} />
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(notification.id)}
                            className="admin-icon-btn danger"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>

                      {/* Time */}
                      <div className="admin-notification-time">
                        <Clock size={12} />
                        {formatTimeAgo(notification.created_at)}
                      </div>
                    </div>
                  </div>

                  {/* Unread indicator */}
                  {!notification.is_read && (
                    <div className="admin-notification-dot" />
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </AdminLayout>
  );
}
