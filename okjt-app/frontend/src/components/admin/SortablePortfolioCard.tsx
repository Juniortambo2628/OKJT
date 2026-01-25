import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Edit2, Trash2, Star, StarOff, CheckSquare, Square } from 'lucide-react';
import type { PortfolioProject } from '../../types';

interface SortablePortfolioCardProps {
  project: PortfolioProject;
  index: number;
  isSelectMode: boolean;
  isSelected: boolean;
  onToggleSelect: (id: number) => void;
  onDelete: (id: number) => void;
  onToggleFeatured: (id: number) => void;
  statusColors: Record<string, string>;
}

export default function SortablePortfolioCard({
  project,
  index,
  isSelectMode,
  isSelected,
  onToggleSelect,
  onDelete,
  onToggleFeatured,
  statusColors,
}: SortablePortfolioCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: project.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      className={`admin-portfolio-card ${isSelectMode ? 'select-mode' : ''} ${isSelected ? 'selected' : ''} ${isDragging ? 'dragging' : ''}`}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ delay: index * 0.05 }}
      layoutId={`project-${project.id}`}
      onClick={() => isSelectMode && onToggleSelect(project.id)}
      {...(!isSelectMode ? { ...attributes, ...listeners } : {})}
    >
      {isSelectMode && (
        <div className="admin-portfolio-card-checkbox">
          {isSelected ? (
            <CheckSquare size={20} />
          ) : (
            <Square size={20} />
          )}
        </div>
      )}
      
      {!isSelectMode && (
        <div className="admin-portfolio-card-drag-handle">
          <div className="admin-drag-handle-icon">⋮⋮</div>
        </div>
      )}

      <div className="admin-portfolio-card-image">
        <img
          src={project.image_url || '/images/logo.png'}
          alt={project.title}
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/images/logo.png';
          }}
        />
        <div className="admin-portfolio-card-overlay">
          <Link
            to={`/admin/portfolio/${project.id}/edit`}
            className="admin-icon-btn"
            title="Edit"
            onClick={(e) => e.stopPropagation()}
          >
            <Edit2 size={18} />
          </Link>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(project.id);
            }}
            className="admin-icon-btn danger"
            title="Delete"
          >
            <Trash2 size={18} />
          </button>
        </div>
        {project.featured && (
          <div className="admin-portfolio-card-featured">
            <Star size={14} />
            Featured
          </div>
        )}
      </div>
      <div className="admin-portfolio-card-content">
        <div className="admin-portfolio-card-header">
          <span className={`admin-badge ${statusColors[project.status || 'pending']}`}>
            {(project.status || 'pending').replace('_', ' ')}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFeatured(project.id);
            }}
            className={`admin-icon-btn small ${project.featured ? 'featured' : ''}`}
            title={project.featured ? 'Remove from featured' : 'Add to featured'}
          >
            {project.featured ? <Star size={14} /> : <StarOff size={14} />}
          </button>
        </div>
        <h3 className="admin-portfolio-card-title">{project.title}</h3>
        <p className="admin-portfolio-card-category">{project.category}</p>
        {project.tags && project.tags.length > 0 && (
          <div className="admin-portfolio-card-tags">
            {project.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="admin-tag-small">
                {tag}
              </span>
            ))}
            {project.tags.length > 3 && (
              <span className="admin-tag-small admin-tag-more">
                +{project.tags.length - 3}
              </span>
            )}
          </div>
        )}
        {project.client_name && (
          <p className="admin-portfolio-card-client">Client: {project.client_name}</p>
        )}
      </div>
    </motion.div>
  );
}

