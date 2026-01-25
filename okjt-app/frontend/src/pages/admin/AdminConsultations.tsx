import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Grid3X3,
  List,
  Calendar,
  Clock,
  User,
  Video,
  MapPin,
  Check,
  X,
  Eye,
  Edit2,
  Trash2,
  Plus
} from 'lucide-react';
import AdminLayout from './components/AdminLayout';
import { submissionsApi } from '../../api/client';
import type { ContactSubmission } from '../../types';

interface Consultation {
  id: number;
  client_name: string;
  email: string;
  phone?: string;
  date: string;
  time: string;
  duration: number;
  type: 'online' | 'in_person';
  topic: string;
  notes?: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  created_at: string;
}

// Helper function to convert ContactSubmission to Consultation
const mapSubmissionToConsultation = (submission: ContactSubmission): Consultation => {
  return {
    id: submission.id!,
    client_name: submission.name,
    email: submission.email,
    phone: submission.phone_number || submission.phone,
    date: submission.consultation_date || (submission.created_at ? submission.created_at.split('T')[0] : new Date().toISOString().split('T')[0]),
    time: submission.consultation_time || '10:00',
    duration: 60, // Default duration
    type: submission.online_consultation ? 'online' : 'in_person',
    topic: submission.message.substring(0, 50) + (submission.message.length > 50 ? '...' : ''),
    notes: submission.message,
    status: submission.status === 'accepted' ? 'confirmed' : 
            submission.status === 'completed' ? 'completed' :
            submission.status === 'cancelled' ? 'cancelled' : 'pending',
    created_at: submission.created_at || new Date().toISOString(),
  };
};

const statusColors: Record<string, string> = {
  pending: 'admin-badge-warning',
  confirmed: 'admin-badge-success',
  completed: 'admin-badge-info',
  cancelled: 'admin-badge-danger',
};

const typeColors: Record<string, string> = {
  online: 'admin-badge-purple',
  in_person: 'admin-badge-green',
};

export default function AdminConsultations() {
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedConsultation, setSelectedConsultation] = useState<Consultation | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadConsultations();
  }, []);

  const loadConsultations = async () => {
    setIsLoading(true);
    try {
      const submissions = await submissionsApi.getAll();
      // Ensure submissions is an array
      const submissionsArray = Array.isArray(submissions) ? submissions : [];
      // Filter only submissions with consultation dates
      const consultationSubmissions = submissionsArray.filter(
        sub => sub && sub.consultation_date && sub.consultation_time
      );
      const mappedConsultations = consultationSubmissions.map(mapSubmissionToConsultation);
      setConsultations(mappedConsultations);
    } catch (error) {
      console.error('Failed to load consultations:', error);
      setConsultations([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredConsultations = consultations.filter((c) => {
    const matchesSearch = 
      c.client_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.topic.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || c.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleStatusChange = async (id: number, newStatus: string) => {
    try {
      // Map consultation status to submission status
      const submissionStatus = newStatus === 'confirmed' ? 'accepted' : 
                              newStatus === 'completed' ? 'completed' :
                              newStatus === 'cancelled' ? 'cancelled' : 'pending';
      
      await submissionsApi.updateStatus(id, submissionStatus);
      
      setConsultations(consultations.map(c =>
        c.id === id ? { ...c, status: newStatus as Consultation['status'] } : c
      ));
      if (selectedConsultation?.id === id) {
        setSelectedConsultation({ ...selectedConsultation, status: newStatus as Consultation['status'] });
      }
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this consultation?')) return;
    
    try {
      await submissionsApi.delete(id);
      setConsultations(consultations.filter(c => c.id !== id));
      if (selectedConsultation?.id === id) {
        setSelectedConsultation(null);
      }
    } catch (error) {
      console.error('Failed to delete consultation:', error);
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'No Date';
    try {
      // Split YYYY-MM-DD
      const parts = dateStr.includes('T') ? dateStr.split('T')[0].split('-') : dateStr.split('-');
      if (parts.length !== 3) return dateStr;
      
      const year = parseInt(parts[0]);
      const month = parseInt(parts[1]) - 1; // JS months are 0-indexed
      const day = parseInt(parts[2]);
      
      const date = new Date(year, month, day);
      if (isNaN(date.getTime())) return 'Invalid Date';

      return date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch (e) {
      console.error('Date formatting error:', e);
      return 'Invalid Date';
    }
  };

  return (
    <AdminLayout title="Consultations" subtitle="Manage consultation bookings and appointments">
      {/* Actions Bar */}
      <div className="admin-actions-bar">
        <div className="admin-search-wrapper">
          <Search size={20} className="admin-search-icon" />
          <input
            type="text"
            placeholder="Search consultations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="admin-search-input"
          />
        </div>

        <div className="admin-actions-right">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="admin-select"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <div className="admin-view-toggle">
            <button
              onClick={() => setViewMode('grid')}
              className={`admin-view-btn ${viewMode === 'grid' ? 'active' : ''}`}
              title="Grid View"
            >
              <Grid3X3 size={18} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`admin-view-btn ${viewMode === 'list' ? 'active' : ''}`}
              title="List View"
            >
              <List size={18} />
            </button>
          </div>

          <button className="admin-btn-primary">
            <Plus size={18} />
            New Consultation
          </button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="admin-quick-stats-row">
        <div className="admin-quick-stat-box">
          <span className="value">{consultations.filter(c => c.status === 'pending').length}</span>
          <span className="label">Pending</span>
        </div>
        <div className="admin-quick-stat-box">
          <span className="value">{consultations.filter(c => c.status === 'confirmed').length}</span>
          <span className="label">Confirmed</span>
        </div>
        <div className="admin-quick-stat-box">
          <span className="value">{consultations.filter(c => c.status === 'completed').length}</span>
          <span className="label">Completed</span>
        </div>
        <div className="admin-quick-stat-box">
          <span className="value">{consultations.length}</span>
          <span className="label">Total</span>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="admin-loading">
          <div className="admin-loading-spinner" />
          <p>Loading consultations...</p>
        </div>
      ) : filteredConsultations.length === 0 ? (
        <div className="admin-empty-state">
          <Calendar size={48} />
          <h3>No consultations found</h3>
          <p>
            {searchQuery || filterStatus !== 'all'
              ? 'Try adjusting your search or filter criteria.'
              : 'Consultation bookings will appear here.'}
          </p>
        </div>
      ) : viewMode === 'grid' ? (
        /* Grid View */
        <div className="admin-consultations-grid">
          <AnimatePresence mode="popLayout">
            {filteredConsultations.map((consultation, index) => (
              <motion.div
                key={consultation.id}
                className="admin-consultation-card"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: index * 0.05 }}
                layoutId={`consultation-${consultation.id}`}
              >
                <div className="admin-consultation-card-header">
                  <span className={`admin-badge ${statusColors[consultation.status]}`}>
                    {consultation.status.toUpperCase()}
                  </span>
                  <span className={`admin-badge ${typeColors[consultation.type]}`}>
                    {consultation.type === 'online' ? <Video size={12} /> : <MapPin size={12} />}
                    {consultation.type === 'online' ? 'Online' : 'In Person'}
                  </span>
                </div>

                <h3 className="admin-consultation-card-title">{consultation.topic}</h3>

                <div className="admin-consultation-card-client">
                  <User size={14} />
                  <span>{consultation.client_name}</span>
                </div>

                <div className="admin-consultation-card-details">
                  <div className="detail">
                    <Calendar size={14} />
                    <span>{formatDate(consultation.date)}</span>
                  </div>
                  <div className="detail">
                    <Clock size={14} />
                    <span>{consultation.time} ({consultation.duration}min)</span>
                  </div>
                </div>

                <div className="admin-consultation-card-actions">
                  <button
                    onClick={() => setSelectedConsultation(consultation)}
                    className="admin-icon-btn"
                    title="View Details"
                  >
                    <Eye size={16} />
                  </button>
                  {consultation.status === 'pending' && (
                    <button
                      onClick={() => handleStatusChange(consultation.id, 'confirmed')}
                      className="admin-icon-btn success"
                      title="Confirm"
                    >
                      <Check size={16} />
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(consultation.id)}
                    className="admin-icon-btn danger"
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        /* List View */
        <div className="admin-card">
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Client</th>
                  <th>Topic</th>
                  <th>Date & Time</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredConsultations.map((consultation, index) => (
                  <motion.tr
                    key={consultation.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <td>
                      <div className="admin-user-cell">
                        <span className="admin-avatar">
                          {consultation.client_name.charAt(0).toUpperCase()}
                        </span>
                        <div>
                          <p className="admin-cell-primary">{consultation.client_name}</p>
                          <p className="admin-cell-secondary">{consultation.email}</p>
                        </div>
                      </div>
                    </td>
                    <td>{consultation.topic}</td>
                    <td>
                      <div className="admin-cell-stack">
                        <span className="admin-cell-primary">{formatDate(consultation.date)}</span>
                        <span className="admin-cell-secondary">{consultation.time} ({consultation.duration}min)</span>
                      </div>
                    </td>
                    <td>
                      <span className={`admin-badge ${typeColors[consultation.type]}`}>
                        {consultation.type === 'online' ? 'ONLINE' : 'IN PERSON'}
                      </span>
                    </td>
                    <td>
                      <span className={`admin-badge ${statusColors[consultation.status]}`}>
                        {consultation.status.toUpperCase()}
                      </span>
                    </td>
                    <td>
                      <div className="admin-actions-cell">
                        <button
                          onClick={() => setSelectedConsultation(consultation)}
                          className="admin-icon-btn"
                          title="View Details"
                        >
                          <Eye size={16} />
                        </button>
                        {consultation.status === 'pending' && (
                          <button
                            onClick={() => handleStatusChange(consultation.id, 'confirmed')}
                            className="admin-icon-btn success"
                            title="Confirm"
                          >
                            <Check size={16} />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(consultation.id)}
                          className="admin-icon-btn danger"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {selectedConsultation && (
        <div className="admin-modal-overlay">
          <div
            className="admin-modal-backdrop"
            onClick={() => setSelectedConsultation(null)}
          />
          <motion.div
            className="admin-modal"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="admin-modal-header">
              <div>
                <h2>Consultation Details</h2>
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                  <span className={`admin-badge ${statusColors[selectedConsultation.status]}`}>
                    {selectedConsultation.status}
                  </span>
                  <span className={`admin-badge ${typeColors[selectedConsultation.type]}`}>
                    {selectedConsultation.type === 'online' ? 'Online' : 'In Person'}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedConsultation(null)}
                className="admin-modal-close"
              >
                <X size={24} />
              </button>
            </div>

            <div className="admin-modal-content">
              <div className="admin-modal-grid">
                <div className="admin-modal-field">
                  <label>Client Name</label>
                  <p>{selectedConsultation.client_name}</p>
                </div>
                <div className="admin-modal-field">
                  <label>Email</label>
                  <p>{selectedConsultation.email}</p>
                </div>
                {selectedConsultation.phone && (
                  <div className="admin-modal-field">
                    <label>Phone</label>
                    <p>{selectedConsultation.phone}</p>
                  </div>
                )}
                <div className="admin-modal-field">
                  <label>Topic</label>
                  <p>{selectedConsultation.topic}</p>
                </div>
                <div className="admin-modal-field">
                  <label>Date</label>
                  <p>{formatDate(selectedConsultation.date)}</p>
                </div>
                <div className="admin-modal-field">
                  <label>Time</label>
                  <p>{selectedConsultation.time} ({selectedConsultation.duration} minutes)</p>
                </div>
              </div>

              {selectedConsultation.notes && (
                <div className="admin-modal-field" style={{ marginTop: '1rem' }}>
                  <label>Notes</label>
                  <p className="admin-modal-message">{selectedConsultation.notes}</p>
                </div>
              )}

              <div className="admin-modal-actions">
                {selectedConsultation.status === 'pending' && (
                  <button
                    onClick={() => handleStatusChange(selectedConsultation.id, 'confirmed')}
                    className="admin-btn-primary"
                  >
                    <Check size={18} />
                    Confirm
                  </button>
                )}
                {selectedConsultation.status === 'confirmed' && (
                  <button
                    onClick={() => handleStatusChange(selectedConsultation.id, 'completed')}
                    className="admin-btn-primary"
                  >
                    <Check size={18} />
                    Mark Complete
                  </button>
                )}
                <button className="admin-btn-secondary">
                  <Edit2 size={18} />
                  Edit
                </button>
                {selectedConsultation.status !== 'cancelled' && (
                  <button
                    onClick={() => handleStatusChange(selectedConsultation.id, 'cancelled')}
                    className="admin-btn-secondary"
                    style={{ color: '#dc2626' }}
                  >
                    <X size={18} />
                    Cancel
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AdminLayout>
  );
}

