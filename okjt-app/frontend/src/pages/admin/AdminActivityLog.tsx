import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Activity, 
  Search, 
  Filter, 
  RefreshCw, 
  Calendar,
  User,
  FileText,
  Clock
} from 'lucide-react';
import { activityLogApi } from '../../api/client';
import type { ActivityLog, ActivityLogStats } from '../../types';
import AdminLayout from './components/AdminLayout';
import AdvancedFilter from '../../components/admin/AdvancedFilter';

export default function AdminActivityLog() {
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [stats, setStats] = useState<ActivityLogStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<Record<string, any>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadData();
  }, [currentPage, filters]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [activitiesData, statsData] = await Promise.all([
        activityLogApi.getAll({
          ...filters,
          search: searchQuery || undefined,
          page: currentPage,
          per_page: 20,
        }),
        activityLogApi.getStats(),
      ]);
      setActivities(activitiesData.data || []);
      setStats(statsData);
    } catch (error) {
      console.error('Failed to load activity log:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilter = (newFilters: Record<string, any>) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  const getEventIcon = (event: string) => {
    switch (event) {
      case 'created':
        return <FileText size={16} />;
      case 'updated':
        return <RefreshCw size={16} />;
      case 'deleted':
        return <FileText size={16} />;
      default:
        return <Activity size={16} />;
    }
  };

  const getEventColor = (event: string) => {
    switch (event) {
      case 'created':
        return 'admin-badge-success';
      case 'updated':
        return 'admin-badge-warning';
      case 'deleted':
        return 'admin-badge-danger';
      default:
        return 'admin-badge-info';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <AdminLayout title="Activity Log" subtitle="View all system activities and changes">
      {/* Stats Cards */}
      {stats && (
        <div className="admin-quick-stats-row">
          <div className="admin-stat-card">
            <div className="admin-stat-icon admin-stat-icon-blue">
              <Activity size={20} />
            </div>
            <div>
              <div className="admin-stat-value">{stats.total}</div>
              <div className="admin-stat-label">Total Activities</div>
            </div>
          </div>
          <div className="admin-stat-card">
            <div className="admin-stat-icon admin-stat-icon-green">
              <Calendar size={20} />
            </div>
            <div>
              <div className="admin-stat-value">{stats.today}</div>
              <div className="admin-stat-label">Today</div>
            </div>
          </div>
          <div className="admin-stat-card">
            <div className="admin-stat-icon admin-stat-icon-purple">
              <Clock size={20} />
            </div>
            <div>
              <div className="admin-stat-value">{stats.this_week}</div>
              <div className="admin-stat-label">This Week</div>
            </div>
          </div>
          <div className="admin-stat-card">
            <div className="admin-stat-icon admin-stat-icon-orange">
              <Calendar size={20} />
            </div>
            <div>
              <div className="admin-stat-value">{stats.this_month}</div>
              <div className="admin-stat-label">This Month</div>
            </div>
          </div>
        </div>
      )}

      {/* Actions Bar */}
      <div className="admin-actions-bar">
        <div className="admin-search-wrapper">
          <Search size={20} className="admin-search-icon" />
          <input
            type="text"
            placeholder="Search activities..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                loadData();
              }
            }}
            className="admin-search-input"
          />
        </div>
        
        <div className="admin-actions-right">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`admin-icon-btn ${showFilters ? 'active' : ''}`}
            title="Toggle Filters"
          >
            <Filter size={20} />
          </button>
          <button
            onClick={loadData}
            className="admin-icon-btn"
            title="Refresh"
          >
            <RefreshCw size={20} />
          </button>
        </div>
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="admin-filter-panel"
        >
          <AdvancedFilter
            fields={[
              {
                name: 'subject_type',
                label: 'Subject Type',
                type: 'select',
                options: [
                  { value: 'App\\Models\\PortfolioProject', label: 'Portfolio Project' },
                  { value: 'App\\Models\\ContactSubmission', label: 'Contact Submission' },
                ],
              },
              {
                name: 'event',
                label: 'Event',
                type: 'select',
                options: [
                  { value: 'created', label: 'Created' },
                  { value: 'updated', label: 'Updated' },
                  { value: 'deleted', label: 'Deleted' },
                ],
              },
              {
                name: 'created_at',
                label: 'Date Range',
                type: 'dateRange',
              },
            ]}
            onFilter={handleFilter}
            onReset={() => {
              setFilters({});
              setCurrentPage(1);
            }}
          />
        </motion.div>
      )}

      {/* Activity Log Table */}
      {isLoading ? (
        <div className="admin-loading">
          <RefreshCw size={24} className="animate-spin" />
          <span>Loading activities...</span>
        </div>
      ) : activities.length === 0 ? (
        <div className="admin-empty-state">
          <Activity size={48} />
          <h3>No activities found</h3>
          <p>There are no activities matching your filters.</p>
        </div>
      ) : (
        <div className="admin-card">
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Event</th>
                  <th>Description</th>
                  <th>Subject</th>
                  <th>User</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {activities.map((activity) => (
                  <tr key={activity.id}>
                    <td>
                      <span className={`admin-badge ${getEventColor(activity.event)}`}>
                        {getEventIcon(activity.event)}
                        <span className="ml-1">{activity.event}</span>
                      </span>
                    </td>
                    <td>
                      <div className="admin-text-primary">{activity.description}</div>
                    </td>
                    <td>
                      <div className="admin-text-secondary">
                        {activity.subject_type?.split('\\').pop() || 'N/A'}
                      </div>
                    </td>
                    <td>
                      {activity.causer ? (
                        <div className="flex items-center gap-2">
                          <User size={16} />
                          <span>{activity.causer.name || activity.causer.email}</span>
                        </div>
                      ) : (
                        <span className="admin-text-muted">System</span>
                      )}
                    </td>
                    <td>
                      <div className="admin-text-secondary">
                        {formatDate(activity.created_at)}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

