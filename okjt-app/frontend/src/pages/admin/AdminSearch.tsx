import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Briefcase, MessageSquare, ExternalLink } from 'lucide-react';
import AdminLayout from './components/AdminLayout';
import { searchApi } from '../../api/client';
import type { SearchResultItem } from '../../types';
import { Link } from 'react-router-dom';

export default function AdminSearch() {
  const [query, setQuery] = useState('');
  const [type, setType] = useState<'all' | 'portfolio' | 'submissions'>('all');
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsSearching(true);
    setHasSearched(true);
    try {
      const data = await searchApi.search(query.trim(), type);
      setResults(data);
    } catch (error) {
      console.error('Search failed', error);
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const grouped = {
    portfolio: results.filter((r) => r.type === 'portfolio'),
    submissions: results.filter((r) => r.type === 'submission'),
  };

  return (
    <AdminLayout title="Search" subtitle="Advanced search across portfolio and submissions">
      <div className="admin-card">
        <form className="admin-search-page-form" onSubmit={handleSearch}>
          <div className="admin-search-page-input-wrapper">
            <Search size={20} className="admin-search-icon" />
            <input
              type="text"
              placeholder="Search projects, clients, or submissions..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="admin-search-input"
            />
          </div>
          <div className="admin-search-page-filters">
            <select
              value={type}
              onChange={(e) => setType(e.target.value as 'all' | 'portfolio' | 'submissions')}
              className="admin-select"
            >
              <option value="all">All Content</option>
              <option value="portfolio">Portfolio Only</option>
              <option value="submissions">Submissions Only</option>
            </select>
            <button type="submit" className="admin-btn-primary" disabled={isSearching}>
              {isSearching ? 'Searching...' : 'Search'}
            </button>
          </div>
        </form>
      </div>

      {!hasSearched ? (
        <div className="admin-empty-state">
          <Search size={48} />
          <h3>Start typing to search</h3>
          <p>Search across portfolio projects and contact submissions from a single place.</p>
        </div>
      ) : results.length === 0 ? (
        <div className="admin-empty-state">
          <Search size={48} />
          <h3>No results found</h3>
          <p>Try adjusting your search terms or filters.</p>
        </div>
      ) : (
        <div className="admin-search-results-grid">
          {grouped.portfolio.length > 0 && (
            <div className="admin-search-results-column">
              <h2 className="admin-search-results-title">
                <Briefcase size={18} />
                Portfolio
              </h2>
              <AnimatePresence mode="popLayout">
                {grouped.portfolio.map((item, index) => (
                  <motion.div
                    key={`portfolio-${item.id}`}
                    className="admin-search-result-card"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ delay: index * 0.03 }}
                  >
                    <div className="admin-search-result-main">
                      <h3>{item.title}</h3>
                      {item.subtitle && <p>{item.subtitle}</p>}
                    </div>
                    <div className="admin-search-result-meta">
                      {item.category && (
                        <span className="admin-badge admin-badge-info">{item.category}</span>
                      )}
                      {item.status && (
                        <span className="admin-badge admin-badge-success">
                          {item.status.toUpperCase()}
                        </span>
                      )}
                      {item.featured && (
                        <span className="admin-badge admin-badge-warning">Featured</span>
                      )}
                    </div>
                    <div className="admin-search-result-actions">
                      <Link
                        to={`/admin/portfolio/${item.id}/edit`}
                        className="admin-icon-btn"
                        title="Open project"
                      >
                        <ExternalLink size={16} />
                      </Link>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}

          {grouped.submissions.length > 0 && (
            <div className="admin-search-results-column">
              <h2 className="admin-search-results-title">
                <MessageSquare size={18} />
                Submissions
              </h2>
              <AnimatePresence mode="popLayout">
                {grouped.submissions.map((item, index) => (
                  <motion.div
                    key={`submission-${item.id}`}
                    className="admin-search-result-card"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ delay: index * 0.03 }}
                  >
                    <div className="admin-search-result-main">
                      <h3>{item.title}</h3>
                      {item.subtitle && <p>{item.subtitle}</p>}
                    </div>
                    <div className="admin-search-result-meta">
                      {item.status && (
                        <span className="admin-badge admin-badge-success">
                          {item.status.toUpperCase()}
                        </span>
                      )}
                      {item.contact_method && (
                        <span className="admin-badge admin-badge-purple">
                          {item.contact_method.toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div className="admin-search-result-actions">
                      <Link
                        to="/admin/submissions"
                        className="admin-icon-btn"
                        title="View in submissions"
                      >
                        <ExternalLink size={16} />
                      </Link>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      )}
    </AdminLayout>
  );
}


