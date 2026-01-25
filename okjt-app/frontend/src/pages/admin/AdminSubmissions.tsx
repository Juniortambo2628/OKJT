import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  Eye,
  Check,
  X,
  Clock,
  Calendar,
  Mail,
  Trash2,
  RefreshCw,
  MessageCircle,
  Send
} from 'lucide-react';
import AdminLayout from './components/AdminLayout';
import { submissionsApi, commentsApi } from '../../api/client';
import type { ContactSubmission, Comment } from '../../types';

// Mock data for fallback
const mockSubmissions: ContactSubmission[] = [
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
    message: 'Portfolio redesign project',
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
];

const statusColors: Record<string, string> = {
  pending: 'admin-badge-warning',
  accepted: 'admin-badge-success',
  postponed: 'admin-badge-info',
  cancelled: 'admin-badge-danger',
  completed: 'admin-badge-purple',
};

const contactMethodColors: Record<string, string> = {
  email: 'admin-badge-purple',
  whatsapp: 'admin-badge-green',
};

export default function AdminSubmissions() {
  const [submissions, setSubmissions] = useState<ContactSubmission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedSubmission, setSelectedSubmission] = useState<ContactSubmission | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isCommentLoading, setIsCommentLoading] = useState(false);

  useEffect(() => {
    loadSubmissions();
  }, []);

  const loadSubmissions = async () => {
    setIsLoading(true);
    try {
      const data = await submissionsApi.getAll();
      setSubmissions(data.length > 0 ? data : mockSubmissions);
    } catch (error) {
      // Use mock data on error
      setSubmissions(mockSubmissions);
    } finally {
      setIsLoading(false);
    }
  };

  const loadComments = async (submissionId: number) => {
    setIsCommentLoading(true);
    try {
      const data = await commentsApi.getForSubmission(submissionId);
      setComments(data);
    } catch (error) {
      console.error('Failed to load comments', error);
      setComments([]);
    } finally {
      setIsCommentLoading(false);
    }
  };

  const filteredSubmissions = submissions.filter((sub) => {
    const matchesSearch = 
      sub.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.message.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || sub.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleStatusChange = async (id: number, newStatus: string) => {
    try {
      await submissionsApi.updateStatus(id, newStatus);
      setSubmissions(submissions.map((s) => 
        s.id === id ? { ...s, status: newStatus as ContactSubmission['status'] } : s
      ));
      // Close modal if open
      if (selectedSubmission?.id === id) {
        setSelectedSubmission({ ...selectedSubmission, status: newStatus as ContactSubmission['status'] });
      }
    } catch (error) {
      // Optimistically update UI even on error
      setSubmissions(submissions.map((s) => 
        s.id === id ? { ...s, status: newStatus as ContactSubmission['status'] } : s
      ));
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this submission?')) return;
    
    try {
      await submissionsApi.delete(id);
      setSubmissions(submissions.filter(s => s.id !== id));
      if (selectedSubmission?.id === id) {
        setSelectedSubmission(null);
      }
    } catch (error) {
      // Optimistically update UI
      setSubmissions(submissions.filter(s => s.id !== id));
    }
  };

  const handleOpenSubmission = (submission: ContactSubmission) => {
    setSelectedSubmission(submission);
    if (submission.id) {
      loadComments(submission.id);
    }
  };

  const handleAddComment = async () => {
    if (!selectedSubmission?.id || !newComment.trim()) return;
    try {
      const created = await commentsApi.addToSubmission(selectedSubmission.id, newComment.trim());
      setComments((prev) => [created, ...prev]);
      setNewComment('');
    } catch (error) {
      console.error('Failed to add comment', error);
    }
  };

  const handleDeleteComment = async (id: number) => {
    try {
      await commentsApi.delete(id);
      setComments((prev) => prev.filter((c) => c.id !== id));
    } catch (error) {
      console.error('Failed to delete comment', error);
    }
  };

  return (
    <AdminLayout title="Submissions" subtitle="Manage contact form submissions">
      {/* Actions Bar */}
      <div className="admin-actions-bar">
        <div className="admin-search-wrapper">
          <Search size={20} className="admin-search-icon" />
          <input
            type="text"
            placeholder="Search submissions..."
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
            <option value="accepted">Accepted</option>
            <option value="postponed">Postponed</option>
            <option value="cancelled">Cancelled</option>
            <option value="completed">Completed</option>
          </select>

          <button
            onClick={loadSubmissions}
            className="admin-icon-btn"
            title="Refresh"
          >
            <RefreshCw size={20} />
          </button>
        </div>
      </div>

      {/* Submissions Table */}
      {isLoading ? (
        <div className="admin-loading">
          <div className="admin-loading-spinner" />
          <p>Loading submissions...</p>
        </div>
      ) : filteredSubmissions.length === 0 ? (
        <div className="admin-empty-state">
          <Mail size={48} />
          <h3>No submissions found</h3>
          <p>
            {searchQuery || filterStatus !== 'all' 
              ? 'Try adjusting your search or filter criteria.'
              : 'Contact submissions will appear here.'
            }
          </p>
        </div>
      ) : (
        <div className="admin-card">
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th className="hide-mobile">Contact Method</th>
                  <th className="hide-tablet">Date</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSubmissions.map((submission, index) => (
                  <motion.tr
                    key={submission.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <td>
                      <div className="admin-user-cell">
                        <span className="admin-avatar">
                          {submission.name.charAt(0).toUpperCase()}
                        </span>
                        {submission.name}
                      </div>
                    </td>
                    <td>{submission.email}</td>
                    <td className="hide-mobile">
                      <span className={`admin-badge ${contactMethodColors[submission.contact_method]}`}>
                        {submission.contact_method.toUpperCase()}
                      </span>
                    </td>
                    <td className="hide-tablet">Dec 22, 2025</td>
                    <td>
                      <span className={`admin-badge ${statusColors[submission.status || 'pending']}`}>
                        {(submission.status || 'pending').toUpperCase()}
                      </span>
                    </td>
                    <td>
                      <div className="admin-actions-cell">
                        {submission.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleStatusChange(submission.id!, 'accepted')}
                              className="admin-icon-btn success"
                              title="Accept"
                            >
                              <Check size={16} />
                            </button>
                            <button
                              onClick={() => handleStatusChange(submission.id!, 'cancelled')}
                              className="admin-icon-btn danger"
                              title="Cancel"
                            >
                              <X size={16} />
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => handleOpenSubmission(submission)}
                          className="admin-icon-btn"
                          title="View Details"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(submission.id!)}
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
      {selectedSubmission && (
        <div className="admin-modal-overlay">
          <div 
            className="admin-modal-backdrop"
            onClick={() => setSelectedSubmission(null)}
          />
          <motion.div
            className="admin-modal"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="admin-modal-header">
              <div>
                <h2>Submission Details</h2>
                <span className={`admin-badge ${statusColors[selectedSubmission.status || 'pending']}`}>
                  {selectedSubmission.status}
                </span>
              </div>
              <button
                onClick={() => setSelectedSubmission(null)}
                className="admin-modal-close"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="admin-modal-content">
              {/* Contact Info */}
              <div className="admin-modal-grid">
                <div className="admin-modal-field">
                  <label>Name</label>
                  <p>{selectedSubmission.name}</p>
                </div>
                <div className="admin-modal-field">
                  <label>Email</label>
                  <p>{selectedSubmission.email}</p>
                </div>
                {selectedSubmission.phone_number && (
                  <div className="admin-modal-field">
                    <label>Phone</label>
                    <p>{selectedSubmission.country_code} {selectedSubmission.phone_number}</p>
                  </div>
                )}
                <div className="admin-modal-field">
                  <label>Preferred Contact</label>
                  <p className="capitalize">{selectedSubmission.contact_method}</p>
                </div>
              </div>
              
              {/* Consultation */}
              {selectedSubmission.online_consultation && (
                <div className="admin-modal-consultation">
                  <div className="admin-modal-consultation-header">
                    <Calendar size={18} />
                    <span>Consultation Requested</span>
                  </div>
                  <p>{selectedSubmission.consultation_date} at {selectedSubmission.consultation_time}</p>
                </div>
              )}
              
              {/* Message */}
              <div className="admin-modal-field">
                <label>Message</label>
                <p className="admin-modal-message">{selectedSubmission.message}</p>
              </div>

              {/* Comments */}
              <div className="admin-modal-comments">
                <div className="admin-modal-comments-header">
                  <h3>
                    <MessageCircle size={18} />
                    Internal Notes
                  </h3>
                  {isCommentLoading && (
                    <span className="admin-modal-comments-loading">Loading...</span>
                  )}
                </div>

                <div className="admin-modal-comments-input">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add an internal note about this submission..."
                    className="admin-settings-input"
                    rows={3}
                  />
                  <button
                    type="button"
                    className="admin-btn-primary"
                    onClick={handleAddComment}
                    disabled={!newComment.trim()}
                  >
                    <Send size={18} />
                    Add Note
                  </button>
                </div>

                <div className="admin-modal-comments-list">
                  {comments.length === 0 ? (
                    <p className="admin-modal-comments-empty">No internal notes yet.</p>
                  ) : (
                    comments.map((comment) => (
                      <div key={comment.id} className="admin-modal-comment">
                        <div className="admin-modal-comment-header">
                          <div>
                            <span className="author">
                              {comment.author_name || 'Admin'}
                            </span>
                            <span className="timestamp">
                              {new Date(comment.created_at).toLocaleString()}
                            </span>
                          </div>
                          <button
                            type="button"
                            className="admin-icon-btn"
                            onClick={() => handleDeleteComment(comment.id)}
                            title="Delete note"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                        <p className="body">{comment.body}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="admin-modal-actions">
                <button
                  onClick={() => handleStatusChange(selectedSubmission.id!, 'accepted')}
                  className="admin-btn-primary"
                >
                  <Check size={18} />
                  Accept
                </button>
                <button
                  onClick={() => handleStatusChange(selectedSubmission.id!, 'postponed')}
                  className="admin-btn-secondary"
                >
                  <Clock size={18} />
                  Postpone
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AdminLayout>
  );
}
