import { useState, useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Briefcase, 
  MessageSquare, 
  BarChart3, 
  Bell, 
  LogOut,
  Settings,
  CalendarDays,
  Mail,
  Home,
  ChevronRight,
  Menu,
  X,
  Clock,
  Moon,
  Sun,
  Activity,
  Image as ImageIcon,
  Users
} from 'lucide-react';
import { authApi, notificationsApi } from '../../../api/client';
import type { Notification } from '../../../types';
import { useTheme } from '../../../contexts/ThemeContext';

interface AdminLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
}

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/admin/dashboard' },
  { icon: ImageIcon, label: 'Hero Slides', href: '/admin/hero-slides' },
  { icon: Users, label: 'Trusted Clients', href: '/admin/trusted-clients' },
  { icon: CalendarDays, label: 'Calendar', href: '/admin/calendar' },
  { icon: MessageSquare, label: 'Submissions', href: '/admin/submissions', badge: 7 },
  { icon: Mail, label: 'Consultations', href: '/admin/consultations' },
  { icon: BarChart3, label: 'Analytics', href: '/admin/analytics' },
  { icon: Briefcase, label: 'Portfolio', href: '/admin/portfolio' },
  { icon: Activity, label: 'Activity Log', href: '/admin/activity-log' },
  { icon: Settings, label: 'Settings', href: '/admin/settings' },
];

export default function AdminLayout({ children, title, subtitle }: AdminLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const notificationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadNotifications();
    // Refresh notifications every 30 seconds
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Close dropdown when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setIsNotificationOpen(false);
      }
    };

    if (isNotificationOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isNotificationOpen]);

  const loadNotifications = async () => {
    try {
      const [allNotifications, count] = await Promise.all([
        notificationsApi.getAll(),
        notificationsApi.getUnreadCount(),
      ]);
      setNotifications(allNotifications.slice(0, 5)); // Show only 5 most recent
      setUnreadCount(count);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    }
  };

  const handleMarkAsRead = async (id: number) => {
    try {
      await notificationsApi.markAsRead(id);
      setNotifications(notifications.map(n => 
        n.id === id ? { ...n, is_read: true } : n
      ));
      setUnreadCount(Math.max(0, unreadCount - 1));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  const handleLogout = async () => {
    await authApi.logout();
    navigate('/admin/login');
  };

  // Get breadcrumb from current path
  const getBreadcrumb = () => {
    const path = location.pathname.split('/').filter(Boolean);
    return path.slice(1).map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' / ');
  };

  return (
    <div className="admin-dashboard">
      {/* Sidebar */}
      <aside className={`admin-sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="admin-sidebar-header">
          <img src="/images/logo.png" alt="OKJTech" className="admin-sidebar-logo" />
          <span className="admin-sidebar-title">OKJTech Admin</span>
        </div>

        <nav className="admin-sidebar-nav">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href || 
                           (item.href !== '/admin/dashboard' && location.pathname.startsWith(item.href));
            
            return (
              <Link
                key={item.href}
                to={item.href}
                onClick={() => setIsSidebarOpen(false)}
                className={`admin-nav-item ${isActive ? 'active' : ''}`}
              >
                <Icon size={20} />
                <span>{item.label}</span>
                {item.badge && (
                  <span className="admin-nav-badge">{item.badge}</span>
                )}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        {/* Top Header */}
        <header className="admin-header">
          <div className="admin-header-left">
            <button
              className="admin-mobile-menu-btn"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
              {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <h1 className="admin-page-title">{title}</h1>
          </div>
          
          <div className="admin-header-right">
            <button
              onClick={toggleTheme}
              className="admin-theme-toggle"
              title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
              {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </button>
            
            <div className="admin-notification-wrapper" ref={notificationRef}>
              <button 
                className="admin-notification-btn"
                onClick={() => setIsNotificationOpen(!isNotificationOpen)}
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="admin-notification-badge">{unreadCount}</span>
                )}
              </button>
              
              {isNotificationOpen && (
                <div className="admin-notification-dropdown">
                  <div className="admin-notification-dropdown-header">
                    <h3>Notifications</h3>
                    {unreadCount > 0 && (
                      <button
                        onClick={async () => {
                          try {
                            await notificationsApi.markAllAsRead();
                            setNotifications(notifications.map(n => ({ ...n, is_read: true })));
                            setUnreadCount(0);
                          } catch (error) {
                            console.error('Failed to mark all as read:', error);
                          }
                        }}
                        className="admin-notification-mark-all"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>
                  
                  <div className="admin-notification-dropdown-list">
                    {notifications.length === 0 ? (
                      <div className="admin-notification-empty">
                        <Bell size={24} />
                        <p>No notifications</p>
                      </div>
                    ) : (
                      notifications.map((notification) => (
                        <Link
                          key={notification.id}
                          to={notification.link || '#'}
                          onClick={() => {
                            if (!notification.is_read) {
                              handleMarkAsRead(notification.id);
                            }
                            setIsNotificationOpen(false);
                          }}
                          className={`admin-notification-dropdown-item ${!notification.is_read ? 'unread' : ''}`}
                        >
                          <div className="admin-notification-dropdown-content">
                            <h4>{notification.title}</h4>
                            <p>{notification.message}</p>
                            <span className="admin-notification-dropdown-time">
                              <Clock size={12} />
                              {formatTimeAgo(notification.created_at)}
                            </span>
                          </div>
                          {!notification.is_read && (
                            <div className="admin-notification-dropdown-dot" />
                          )}
                        </Link>
                      ))
                    )}
                  </div>
                  
                  <div className="admin-notification-dropdown-footer">
                    <Link to="/admin/notifications" onClick={() => setIsNotificationOpen(false)}>
                      View all notifications
                    </Link>
                  </div>
                </div>
              )}
            </div>
            
            <span className="admin-user-name">OKJTech Admin</span>
            <button onClick={handleLogout} className="admin-logout-btn">
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </header>

        {/* Breadcrumb */}
        <div className="admin-breadcrumb">
          <Link to="/" className="admin-breadcrumb-item">
            <Home size={14} />
            Home
          </Link>
          <ChevronRight size={14} />
          <span className="admin-breadcrumb-current">{getBreadcrumb() || 'Dashboard'}</span>
        </div>

        {/* Content */}
        <div className="admin-content">
          {subtitle && (
            <p className="admin-page-subtitle">{subtitle}</p>
          )}
          {children}
        </div>
      </main>

      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="admin-overlay"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
}
