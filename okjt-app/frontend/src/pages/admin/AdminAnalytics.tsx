import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown,
  Eye, 
  Users, 
  MousePointer,
  Clock,
  Globe,
  FileText
} from 'lucide-react';
import AdminLayout from './components/AdminLayout';
import { analyticsApi } from '../../api/client';
import type { DashboardStats } from '../../types';

// Mock data for charts (in production, would use real data from API)
const mockPageViews = [
  { date: 'Mon', views: 145 },
  { date: 'Tue', views: 232 },
  { date: 'Wed', views: 189 },
  { date: 'Thu', views: 278 },
  { date: 'Fri', views: 312 },
  { date: 'Sat', views: 198 },
  { date: 'Sun', views: 165 },
];

const mockPopularPages = [
  { page: '/', views: 1247, name: 'Home' },
  { page: '/portfolio', views: 892, name: 'Portfolio' },
  { page: '/contact', views: 543, name: 'Contact' },
];

const mockVisitorSources = [
  { source: 'Direct', visitors: 45 },
  { source: 'Google', visitors: 32 },
  { source: 'Social Media', visitors: 18 },
  { source: 'Referral', visitors: 5 },
];

export default function AdminAnalytics() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('7d');

  const [pageViews, setPageViews] = useState<{ date: string; views: number }[]>([]);
  const [popularPages, setPopularPages] = useState<{ page: string; views: number; name?: string }[]>([]);
  const [_visitorStats, setVisitorStats] = useState<{ date: string; visitors: number; unique: number }[]>([]);

  useEffect(() => {
    loadStats();
    loadAnalyticsData();
  }, [selectedPeriod]);

  const loadStats = async () => {
    setIsLoading(true);
    try {
      const data = await analyticsApi.getDashboardStats();
      setStats(data);
    } catch (error) {
      // Use mock data on error
      setStats({
        total_projects: 12,
        total_submissions: 48,
        pending_submissions: 5,
        page_visits: 2682,
        unique_visitors: 1519,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadAnalyticsData = async () => {
    try {
      const [pageViewsData, popularPagesData, visitorStatsData] = await Promise.all([
        analyticsApi.getPageViews(selectedPeriod),
        analyticsApi.getPopularPages(10),
        analyticsApi.getVisitorStats(selectedPeriod),
      ]);
      setPageViews(pageViewsData);
      setPopularPages(popularPagesData);
      setVisitorStats(visitorStatsData);
    } catch (error) {
      console.error('Failed to load analytics data:', error);
      // Keep mock data as fallback
    }
  };

  const statCards = [
    { 
      label: 'Page Views', 
      value: stats?.page_visits?.toLocaleString() || '0', 
      icon: Eye, 
      color: 'admin-stat-purple',
      change: '+18%',
      trending: 'up'
    },
    { 
      label: 'Unique Visitors', 
      value: stats?.unique_visitors?.toLocaleString() || '0', 
      icon: Users, 
      color: 'admin-stat-green',
      change: '+24%',
      trending: 'up'
    },
    { 
      label: 'Avg. Session', 
      value: '2m 34s', 
      icon: Clock, 
      color: 'admin-stat-teal',
      change: '+12%',
      trending: 'up'
    },
    { 
      label: 'Bounce Rate', 
      value: '42%', 
      icon: MousePointer, 
      color: 'admin-stat-pink',
      change: '-5%',
      trending: 'down'
    },
  ];

  // Simple bar chart component
  const BarChart = ({ data, maxValue }: { data: { date: string; views: number }[], maxValue: number }) => (
    <div className="admin-chart-bars">
      {data.map((item, index) => (
        <div key={item.date} className="admin-chart-bar-item">
          <motion.div 
            className="admin-chart-bar"
            initial={{ height: 0 }}
            animate={{ height: `${(item.views / maxValue) * 100}%` }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
          />
          <span className="admin-chart-label">{item.date}</span>
        </div>
      ))}
    </div>
  );

  return (
    <AdminLayout title="Analytics" subtitle="Track your website performance">
      {/* Period Selector */}
      <div className="admin-period-selector">
        {['24h', '7d', '30d', '90d'].map((period) => (
          <button
            key={period}
            onClick={() => setSelectedPeriod(period)}
            className={`admin-period-btn ${selectedPeriod === period ? 'active' : ''}`}
          >
            {period === '24h' ? 'Today' : period === '7d' ? '7 Days' : period === '30d' ? '30 Days' : '90 Days'}
          </button>
        ))}
      </div>

      {/* Stats Grid */}
      {isLoading ? (
        <div className="admin-loading">
          <div className="admin-loading-spinner" />
          <p>Loading analytics...</p>
        </div>
      ) : (
        <>
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
                    <span className={`admin-stat-subtext ${stat.trending === 'down' ? 'down' : ''}`}>
                      {stat.trending === 'up' ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                      {stat.change} vs last period
                    </span>
                  </div>
                  <div className="admin-stat-icon">
                    <Icon size={28} />
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Charts Row */}
          <div className="admin-analytics-grid">
            {/* Page Views Chart */}
            <motion.div
              className="admin-card admin-chart-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="admin-card-header">
                <h2>
                  <Eye size={18} />
                  Page Views
                </h2>
                <span className="admin-chart-subtitle">Last 7 days</span>
              </div>
              <div className="admin-chart-content">
                <BarChart data={pageViews.length > 0 ? pageViews : mockPageViews} maxValue={Math.max(...(pageViews.length > 0 ? pageViews.map(p => p.views) : mockPageViews.map(p => p.views)), 350)} />
              </div>
            </motion.div>

            {/* Visitor Sources */}
            <motion.div
              className="admin-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div className="admin-card-header">
                <h2>
                  <Globe size={18} />
                  Traffic Sources
                </h2>
              </div>
              <div className="admin-sources-list">
                {mockVisitorSources.map((source, index) => {
                  const total = mockVisitorSources.reduce((sum, s) => sum + s.visitors, 0);
                  // Note: Visitor sources API endpoint not yet implemented, using mock data
                  const percent = Math.round((source.visitors / total) * 100);
                  
                  return (
                    <div key={source.source} className="admin-source-item">
                      <div className="admin-source-header">
                        <span className="admin-source-name">{source.source}</span>
                        <span className="admin-source-percent">{percent}%</span>
                      </div>
                      <div className="admin-source-bar-bg">
                        <motion.div
                          className="admin-source-bar"
                          initial={{ width: 0 }}
                          animate={{ width: `${percent}%` }}
                          transition={{ delay: 0.5 + index * 0.1, duration: 0.5 }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </div>

          {/* Popular Pages */}
          <motion.div
            className="admin-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div className="admin-card-header">
              <h2>
                <FileText size={18} />
                Popular Pages
              </h2>
            </div>
            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Page</th>
                    <th>URL</th>
                    <th style={{ textAlign: 'right' }}>Views</th>
                    <th style={{ textAlign: 'right' }}>% of Total</th>
                  </tr>
                </thead>
                <tbody>
                  {(popularPages.length > 0 ? popularPages : mockPopularPages).map((page, index) => {
                    const pagesList = popularPages.length > 0 ? popularPages : mockPopularPages;
                    const total = pagesList.reduce((sum, p) => sum + p.views, 0);
                    const percent = Math.round((page.views / total) * 100);
                    
                    return (
                      <motion.tr
                        key={page.page}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.6 + index * 0.1 }}
                      >
                        <td className="admin-cell-primary">{page.name}</td>
                        <td className="admin-cell-secondary">{page.page}</td>
                        <td style={{ textAlign: 'right' }}>{page.views.toLocaleString()}</td>
                        <td style={{ textAlign: 'right' }}>
                          <span className="admin-badge admin-badge-warning">
                            {percent}%
                          </span>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </motion.div>
        </>
      )}
    </AdminLayout>
  );
}
