import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Star, 
  StarOff,
  ExternalLink,
  Search,
  Briefcase,
  Grid3X3,
  List,
  Download,
  FileSpreadsheet,
  CheckSquare,
  Square,
  X
} from 'lucide-react';
import { portfolioApi, exportApi } from '../../api/client';
import type { PortfolioProject } from '../../types';
import AdminLayout from './components/AdminLayout';
import SortablePortfolioCard from '../../components/admin/SortablePortfolioCard';

const statusColors: Record<string, string> = {
  completed: 'admin-badge-success',
  in_progress: 'admin-badge-warning',
  pending: 'admin-badge-info',
};

export default function AdminPortfolio() {
  const [projects, setProjects] = useState<PortfolioProject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [isSelectMode, setIsSelectMode] = useState(false);
  
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [projectsData, categoriesData] = await Promise.all([
        portfolioApi.getAll(),
        portfolioApi.getCategories(),
      ]);
      setProjects(projectsData);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Failed to load portfolio:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredProjects = projects.filter((project) => {
    const matchesSearch = 
      project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'all' || project.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this project?')) return;
    
    try {
      await portfolioApi.delete(id);
      setProjects(projects.filter((p) => p.id !== id));
    } catch (error) {
      console.error('Failed to delete project:', error);
    }
  };

  const handleToggleFeatured = async (id: number) => {
    try {
      await portfolioApi.toggleFeatured(id);
      setProjects(projects.map((p) => 
        p.id === id ? { ...p, featured: !p.featured } : p
      ));
    } catch (error) {
      console.error('Failed to toggle featured:', error);
    }
  };

  const toggleSelectMode = () => {
    setIsSelectMode(!isSelectMode);
    setSelectedIds(new Set());
  };

  const toggleSelect = (id: number) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const selectAll = () => {
    if (selectedIds.size === filteredProjects.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredProjects.map(p => p.id)));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    if (!confirm(`Are you sure you want to delete ${selectedIds.size} project(s)?`)) return;

    try {
      await Promise.all(Array.from(selectedIds).map(id => portfolioApi.delete(id)));
      setProjects(projects.filter(p => !selectedIds.has(p.id)));
      setSelectedIds(new Set());
      setIsSelectMode(false);
    } catch (error) {
      console.error('Failed to delete projects:', error);
      alert('Failed to delete some projects. Please try again.');
    }
  };

  const handleBulkToggleFeatured = async () => {
    if (selectedIds.size === 0) return;

    try {
      await Promise.all(Array.from(selectedIds).map(id => portfolioApi.toggleFeatured(id)));
      setProjects(projects.map(p => 
        selectedIds.has(p.id) ? { ...p, featured: !p.featured } : p
      ));
      setSelectedIds(new Set());
      setIsSelectMode(false);
    } catch (error) {
      console.error('Failed to toggle featured:', error);
      alert('Failed to update featured status. Please try again.');
    }
  };

  const handleExport = async (format: 'csv' | 'pdf') => {
    try {
      if (format === 'csv') {
        const blob = await exportApi.exportPortfolioCsv({ category: filterCategory !== 'all' ? filterCategory : undefined });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `portfolio-projects-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else if (format === 'pdf') {
        // PDF export - for now, we'll use CSV as fallback until PDF is implemented
        alert('PDF export will be available soon. Using CSV for now.');
        const blob = await exportApi.exportPortfolioCsv({ category: filterCategory !== 'all' ? filterCategory : undefined });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `portfolio-projects-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Failed to export:', error);
      alert('Failed to export portfolio. Please try again.');
    }
  };

  const handleDragEnd = async (event: { active: { id: number | string }; over: { id: number | string } | null }) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const activeId = typeof active.id === 'string' ? parseInt(active.id) : active.id;
      const overId = typeof over.id === 'string' ? parseInt(over.id) : over.id;
      
      const oldIndex = projects.findIndex(p => p.id === activeId);
      const newIndex = projects.findIndex(p => p.id === overId);

      if (oldIndex !== -1 && newIndex !== -1) {
        const newProjects = arrayMove(projects, oldIndex, newIndex);
        setProjects(newProjects);

        // Update sort_order in backend
        try {
          const ids = newProjects.map(p => p.id);
          await portfolioApi.reorder(ids);
        } catch (error) {
          console.error('Failed to reorder projects:', error);
          // Revert on error
          setProjects(projects);
        }
      }
    }
  };

  return (
    <AdminLayout title="Portfolio" subtitle="Manage your portfolio projects">
      {/* Bulk Actions Bar */}
      {isSelectMode && selectedIds.size > 0 && (
        <div className="admin-bulk-actions-bar">
          <div className="admin-bulk-actions-info">
            <span>{selectedIds.size} project(s) selected</span>
          </div>
          <div className="admin-bulk-actions-buttons">
            <button
              onClick={handleBulkToggleFeatured}
              className="admin-btn-secondary"
            >
              <Star size={18} />
              Toggle Featured
            </button>
            <button
              onClick={handleBulkDelete}
              className="admin-btn-danger"
            >
              <Trash2 size={18} />
              Delete Selected
            </button>
            <button
              onClick={toggleSelectMode}
              className="admin-icon-btn"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      )}

      {/* Actions Bar */}
      <div className="admin-actions-bar">
        <div className="admin-search-wrapper">
          <Search size={20} className="admin-search-icon" />
          <input
            type="text"
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="admin-search-input"
          />
        </div>
        
        <div className="admin-actions-right">
          {!isSelectMode && (
            <button
              onClick={toggleSelectMode}
              className="admin-btn-secondary"
              title="Select multiple items"
            >
              <CheckSquare size={18} />
              Select
            </button>
          )}
          
          {isSelectMode && (
            <button
              onClick={selectAll}
              className="admin-btn-secondary"
            >
              {selectedIds.size === filteredProjects.length ? (
                <>
                  <Square size={18} />
                  Deselect All
                </>
              ) : (
                <>
                  <CheckSquare size={18} />
                  Select All
                </>
              )}
            </button>
          )}
          <div className="admin-dropdown-wrapper">
            <button className="admin-btn-secondary admin-export-btn">
              <Download size={18} />
              Export
            </button>
            <div className="admin-dropdown admin-export-dropdown">
              <button onClick={() => handleExport('csv')} className="admin-dropdown-item">
                <FileSpreadsheet size={16} />
                Export to CSV
              </button>
              <button onClick={() => handleExport('pdf')} className="admin-dropdown-item">
                <FileSpreadsheet size={16} />
                Export to PDF
              </button>
            </div>
          </div>
          
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="admin-select"
          >
            <option value="all">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
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
          
          <Link to="/admin/portfolio/new" className="admin-btn-primary">
            <Plus size={18} />
            Add Project
          </Link>
        </div>
      </div>

      {/* Projects */}
      {isLoading ? (
        <div className="admin-loading">
          <div className="admin-loading-spinner" />
          <p>Loading projects...</p>
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="admin-empty-state">
          <Briefcase size={48} />
          <h3>No projects found</h3>
          <p>
            {searchQuery || filterCategory !== 'all' 
              ? 'Try adjusting your search or filter criteria.'
              : 'Add your first project to get started.'
            }
          </p>
        </div>
      ) : viewMode === 'grid' ? (
        /* Grid View with Drag & Drop */
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={filteredProjects.map(p => p.id)}
            strategy={rectSortingStrategy}
          >
            <div className="admin-portfolio-grid">
              <AnimatePresence mode="popLayout">
                {filteredProjects.map((project, index) => (
                  <SortablePortfolioCard
                    key={project.id}
                    project={project}
                    index={index}
                    isSelectMode={isSelectMode}
                    isSelected={selectedIds.has(project.id)}
                    onToggleSelect={toggleSelect}
                    onDelete={handleDelete}
                    onToggleFeatured={handleToggleFeatured}
                    statusColors={statusColors}
                  />
                ))}
              </AnimatePresence>
            </div>
          </SortableContext>
        </DndContext>
      ) : (
        /* List View */
        <div className="admin-card">
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Project</th>
                  <th className="hide-mobile">Category</th>
                  <th className="hide-tablet">Status</th>
                  <th style={{ textAlign: 'center' }}>Featured</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProjects.map((project, index) => (
                  <motion.tr
                    key={project.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <td>
                      <div className="admin-user-cell">
                        <img
                          src={project.image_url || '/images/logo.png'}
                          alt={project.title}
                          className="admin-project-image"
                        />
                        <div>
                          <p className="admin-cell-primary">{project.title}</p>
                          <p className="admin-cell-secondary">{project.client_name || 'No client'}</p>
                          {project.tags && project.tags.length > 0 && (
                            <div className="admin-cell-tags">
                              {project.tags.slice(0, 2).map((tag) => (
                                <span key={tag} className="admin-tag-small">
                                  {tag}
                                </span>
                              ))}
                              {project.tags.length > 2 && (
                                <span className="admin-tag-small admin-tag-more">
                                  +{project.tags.length - 2}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="hide-mobile">
                      <span className="admin-badge admin-badge-info">
                        {project.category}
                      </span>
                    </td>
                    <td className="hide-tablet">
                      <span className={`admin-badge ${statusColors[project.status || 'pending']}`}>
                        {(project.status || 'pending').replace('_', ' ')}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <button
                        onClick={() => handleToggleFeatured(project.id)}
                        className={`admin-icon-btn ${project.featured ? 'featured' : ''}`}
                      >
                        {project.featured ? <Star size={18} /> : <StarOff size={18} />}
                      </button>
                    </td>
                    <td>
                      <div className="admin-actions-cell">
                        {project.project_url && (
                          <a
                            href={project.project_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="admin-icon-btn"
                          >
                            <ExternalLink size={18} />
                          </a>
                        )}
                        <Link
                          to={`/admin/portfolio/${project.id}/edit`}
                          className="admin-icon-btn"
                        >
                          <Edit2 size={18} />
                        </Link>
                        <button
                          onClick={() => handleDelete(project.id)}
                          className="admin-icon-btn danger"
                        >
                          <Trash2 size={18} />
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
    </AdminLayout>
  );
}
