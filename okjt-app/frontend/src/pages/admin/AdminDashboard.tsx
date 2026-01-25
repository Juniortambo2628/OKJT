import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Mail,
  CalendarDays,
  Clock,
  TrendingUp,
  RefreshCw,
  BarChart3
} from 'lucide-react';
import AdminLayout from './components/AdminLayout';
import { submissionsApi, analyticsApi } from '../../api/client';
import type { DashboardStats, ContactSubmission } from '../../types';

const statusColors: Record<string, string> = {
  pending: 'admin-badge-warning',
  accepted: 'admin-badge-success',
  completed: 'admin-badge-info',
  cancelled: 'admin-badge-danger',
};

const contactMethodColors: Record<string, string> = {
  email: 'admin-badge-purple',
  whatsapp: 'admin-badge-green',
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentSubmissions, setRecentSubmissions] = useState<ContactSubmission[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const [statsData, submissionsData] = await Promise.all([
        analyticsApi.getDashboardStats(),
        submissionsApi.getRecent(5),
      ]);
      setStats(statsData);
      setRecentSubmissions(submissionsData);
    } catch (error) {
      // Use mock data on error
      setStats({
        total_projects: 6,
        total_submissions: 7,
        pending_submissions: 7,
        page_visits: 892,
        unique_visitors: 892,
      });
      setRecentSubmissions([
        {
          id: 1,
          name: 'Kevin Junior',
          email: 'kevin097@live.com',
          contact_method: 'whatsapp',
          message: 'Web development inquiry',
          consent: true,
          status: 'pending',
        },
        {
          id: 2,
          name: 'Alice Johnson',
          email: 'alice.johnson@example.com',
          contact_method: 'email',
          message: 'Portfolio redesign',
          consent: true,
          status: 'pending',
        },
        {
          id: 3,
          name: 'John Doe',
          email: 'john@example.com',
          contact_method: 'email',
          message: 'E-commerce project',
          consent: true,
          status: 'accepted',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };


  const statCards = [
    { 
      label: 'TOTAL SUBMISSIONS', 
      value: stats?.total_submissions || 0, 
      subtext: 'All time contacts',
      icon: Mail, 
      color: 'admin-stat-purple',
      trend: 'up'
    },
    { 
      label: 'CONSULTATION REQUESTS', 
      value: 0, 
      subtext: 'Active bookings',
      icon: CalendarDays, 
      color: 'admin-stat-teal',
      trend: 'up'
    },
    { 
      label: 'RECENT ACTIVITY', 
      value: stats?.pending_submissions || 0, 
      subtext: 'Last 50 submissions',
      icon: Clock, 
      color: 'admin-stat-pink',
      trend: 'up'
    },
    { 
      label: 'RESPONSE RATE', 
      value: '98%', 
      subtext: 'Within 24 hours',
      icon: TrendingUp, 
      color: 'admin-stat-green',
      trend: 'up'
    },
  ];

  return (
    <AdminLayout title="Dashboard Overview" subtitle="Welcome back! Here's what's happening with your site">
          {isLoading ? (
            <div className="admin-loading">
              <div className="admin-loading-spinner" />
              <p>Loading dashboard...</p>
            </div>
          ) : (
            <>
              {/* Stats Grid */}
              <div className="admin-stats-grid">
                {statCards.map((stat, index) => {
                  const Icon = stat.icon;
                  
                  return (
                    <motion.div
                      key={stat.label}
                      className={`admin-stat-card ${stat.color}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <div className="admin-stat-content">
                        <span className="admin-stat-label">{stat.label}</span>
                        <span className="admin-stat-value">{stat.value}</span>
                        <span className="admin-stat-subtext">
                          <TrendingUp size={12} />
                          {stat.subtext}
                        </span>
                      </div>
                      <div className="admin-stat-icon">
                        <Icon size={28} />
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Main Grid */}
              <div className="admin-dashboard-grid">
                {/* Recent Submissions Table */}
                <motion.div
                  className="admin-card admin-submissions-card"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <div className="admin-card-header">
                    <h2>
                      <Mail size={18} />
                      Recent Contact Submissions
                    </h2>
                    <button onClick={loadDashboardData} className="admin-refresh-btn">
                      <RefreshCw size={14} />
                      Refresh
                    </button>
                  </div>
                  
                  <div className="admin-table-wrapper">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Email</th>
                          <th>Contact Method</th>
                          <th>Date</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentSubmissions.map((submission) => (
                          <tr key={submission.id}>
                            <td>
                              <div className="admin-user-cell">
                                <span className="admin-avatar">
                                  {submission.name.charAt(0).toUpperCase()}
                                </span>
                                {submission.name}
                              </div>
                            </td>
                            <td>{submission.email}</td>
                            <td>
                              <span className={`admin-badge ${contactMethodColors[submission.contact_method]}`}>
                                {submission.contact_method.toUpperCase()}
                              </span>
                            </td>
                            <td>Dec 22, 2025</td>
                            <td>
                              <span className={`admin-badge ${statusColors[submission.status || 'pending']}`}>
                                {(submission.status || 'pending').toUpperCase()}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  <div className="admin-card-footer">
                    <Link to="/admin/submissions" className="admin-view-all-link">
                      View all submissions →
                    </Link>
                  </div>
                </motion.div>

                {/* Quick Stats Sidebar */}
                <motion.div
                  className="admin-card admin-quick-stats"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <div className="admin-card-header">
                    <h2>
                      <BarChart3 size={18} />
                      Quick Stats
                    </h2>
                  </div>
                  
                  <div className="admin-quick-stats-list">
                    <div className="admin-quick-stat-item">
                      <div className="admin-quick-stat-info">
                        <span className="admin-quick-stat-value">{stats?.total_submissions || 0}</span>
                        <span className="admin-quick-stat-label">Total Submissions</span>
                      </div>
                      <div className="admin-quick-stat-icon purple">
                        <Mail size={20} />
                      </div>
                    </div>
                    
                    <div className="admin-quick-stat-item">
                      <div className="admin-quick-stat-info">
                        <span className="admin-quick-stat-value">0</span>
                        <span className="admin-quick-stat-label">Consultation Requests</span>
                      </div>
                      <div className="admin-quick-stat-icon teal">
                        <CalendarDays size={20} />
                      </div>
                    </div>
                    
                    <div className="admin-quick-stat-item">
                      <div className="admin-quick-stat-info">
                        <span className="admin-quick-stat-value">98%</span>
                        <span className="admin-quick-stat-label">Response Rate</span>
                      </div>
                      <div className="admin-quick-stat-icon pink">
                        <TrendingUp size={20} />
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </>
          )}
    </AdminLayout>
  );
}
