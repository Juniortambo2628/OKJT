import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Grid3X3, List, ArrowDownUp, X, ExternalLink, ArrowLeft, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import PortfolioCard from './PortfolioCard';
import PortfolioFilter from './PortfolioFilter';
import type { PortfolioProject } from '../../types';

interface PortfolioGridProps {
  projects: PortfolioProject[];
  categories: string[];
}

export default function PortfolioGrid({ projects, categories }: PortfolioGridProps) {
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'title' | 'category'>('title');
  const [likes, setLikes] = useState<Set<number>>(new Set());
  const [selectedProject, setSelectedProject] = useState<PortfolioProject | null>(null);

  const filteredProjects = useMemo(() => {
    const filtered = projects.filter((project) => {
      const matchesFilter = activeFilter === 'all' || project.category === activeFilter;
      const matchesSearch = searchQuery === '' || 
        project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (project.client_name?.toLowerCase().includes(searchQuery.toLowerCase()));
      
      return matchesFilter && matchesSearch;
    });

    const sorted = [...filtered].sort((a, b) => {
      if (sortBy === 'title') return a.title.localeCompare(b.title);
      return a.category.localeCompare(b.category);
    });

    return sorted;
  }, [projects, activeFilter, searchQuery, sortBy]);

  const toggleLike = (id: number) => {
    setLikes(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div>
      {/* Search & Filter */}
      <div className="mb-12 space-y-4">
        {/* Search + controls */}
        <div className="flex flex-col gap-3 items-stretch md:flex-row md:items-center md:justify-between">
          <div className="flex-1 max-w-xl">
            <div className="relative search-pill">
              <Search size={18} className="search-pill-icon" />
              <input
                type="text"
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-pill-input"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <div className="pill-select">
              <ArrowDownUp size={14} />
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value as 'title' | 'category')}>
                <option value="title">Sort by Title</option>
                <option value="category">Sort by Category</option>
              </select>
            </div>

            <div className="pill-toggle">
              <button
                className={`admin-view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                onClick={() => setViewMode('grid')}
                title="Grid view"
              >
                <Grid3X3 size={16} />
              </button>
              <button
                className={`admin-view-btn ${viewMode === 'list' ? 'active' : ''}`}
                onClick={() => setViewMode('list')}
                title="List view"
              >
                <List size={16} />
              </button>
            </div>
          </div>
        </div>
        
        {/* Filter Tabs */}
        <div className="pt-2">
          <PortfolioFilter
            categories={categories}
            activeFilter={activeFilter}
            onFilterChange={setActiveFilter}
          />
        </div>
      </div>

      {/* Grid/List */}
      <AnimatePresence mode="popLayout">
        {filteredProjects.length > 0 ? (
          viewMode === 'grid' ? (
            <motion.div
              className="portfolio-grid"
              layout
            >
              {filteredProjects.map((project, index) => (
                <PortfolioCard
                  key={project.id}
                  project={project}
                  index={index}
                  liked={likes.has(project.id)}
                  onToggleLike={() => toggleLike(project.id)}
                  onClick={() => setSelectedProject(project)}
                />
              ))}
            </motion.div>
          ) : (
            <motion.div className="portfolio-list" layout>
              {filteredProjects.map((project, index) => (
                <PortfolioCard
                  key={project.id}
                  project={project}
                  index={index}
                  liked={likes.has(project.id)}
                  onToggleLike={() => toggleLike(project.id)}
                  onClick={() => setSelectedProject(project)}
                  listView
                />
              ))}
            </motion.div>
          )
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="empty-state"
          >
            <Search size={48} className="empty-state-icon" />
            <h3 className="empty-state-title">No projects found</h3>
            <p className="empty-state-text">
              Try adjusting your search or filter criteria.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Project Details Modal */}
      <AnimatePresence>
        {selectedProject && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="portfolio-modal-overlay"
            onClick={() => setSelectedProject(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="portfolio-modal-content"
            >
              {/* Left Column: Details */}
              <div className="portfolio-modal-left">
                {/* Back Button */}
                <button 
                  onClick={() => setSelectedProject(null)}
                  className="portfolio-modal-back-btn"
                >
                  <ArrowLeft size={24} />
                </button>

                <div className="portfolio-modal-info-wrap">
                  <h2 className="portfolio-modal-title">
                    {selectedProject.title}
                  </h2>
                  <p className="portfolio-modal-description">
                    {selectedProject.description}
                  </p>

                  {/* Project Specs Grid */}
                  <div className="portfolio-modal-grid">
                    {selectedProject.client_name && (
                      <div className="portfolio-modal-item">
                        <div className="portfolio-modal-icon bg-blue-50 dark:bg-blue-900/30 text-blue-600">
                          <User size={24} />
                        </div>
                        <div>
                          <p className="portfolio-modal-label">Client</p>
                          <p className="portfolio-modal-value">{selectedProject.client_name}</p>
                        </div>
                      </div>
                    )}
                    {selectedProject.category && (
                      <div className="portfolio-modal-item">
                        <div className="portfolio-modal-icon bg-purple-50 dark:bg-purple-900/30 text-purple-600">
                          <Grid3X3 size={24} />
                        </div>
                        <div>
                          <p className="portfolio-modal-label">Category</p>
                          <p className="portfolio-modal-value">{selectedProject.category}</p>
                        </div>
                      </div>
                    )}
                    <div className="portfolio-modal-item">
                      <div className="portfolio-modal-icon bg-green-50 dark:bg-green-900/30 text-green-600">
                        <ArrowDownUp size={24} />
                      </div>
                      <div>
                        <p className="portfolio-modal-label">Status</p>
                        <p className="portfolio-modal-value capitalize">{selectedProject.status?.replace('_', ' ') || 'Completed'}</p>
                      </div>
                    </div>
                    {selectedProject.project_url && (
                      <div className="portfolio-modal-item">
                        <div className="portfolio-modal-icon bg-orange-50 dark:bg-orange-900/30 text-orange-600">
                          <ExternalLink size={24} />
                        </div>
                        <div>
                          <p className="portfolio-modal-label">Live Preview</p>
                          <a href={selectedProject.project_url} target="_blank" rel="noopener noreferrer" className="portfolio-modal-value hover:text-accent transition-colors underline decoration-accent/30 underline-offset-4">View Site</a>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Modal Actions */}
                  <div className="portfolio-modal-actions">
                    <Link
                      to={`/contact?project=${encodeURIComponent(selectedProject.title)}&interest=quote`}
                      className="portfolio-modal-btn-primary"
                    >
                      Start a project like this
                    </Link>
                    <button
                      onClick={() => setSelectedProject(null)}
                      className="portfolio-modal-btn-secondary"
                    >
                      Maybe later
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Column: Image */}
              <div className="portfolio-modal-right">
                <img
                  src={selectedProject.image_url || '/images/logo.png'}
                  alt={selectedProject.title}
                  className="portfolio-modal-image"
                />
                
                {/* Close Button Integrated */}
                <button
                  onClick={() => setSelectedProject(null)}
                  className="portfolio-modal-close-btn"
                  title="Close"
                >
                  <X size={24} />
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

