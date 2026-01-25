import { motion } from 'framer-motion';
import { Heart, Tag, Star, ExternalLink } from 'lucide-react';
import type { PortfolioProject } from '../../types';

interface PortfolioCardProps {
  project: PortfolioProject;
  index: number;
  liked?: boolean;
  onToggleLike?: () => void;
  onClick?: () => void;
  listView?: boolean;
}

const fallbackImage = '/images/logo.png';

export default function PortfolioCard({ project, index, liked = false, onToggleLike, onClick, listView = false }: PortfolioCardProps) {
  const imageUrl = project.image_url || fallbackImage;

  return (
    <motion.div
      className={`portfolio-card ${listView ? 'list' : ''}`}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      layout
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      {/* Background Image Container */}
      <div className="absolute inset-0 z-0">
        <img
          src={imageUrl}
          alt={project.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          loading="lazy"
          onError={(e) => {
            (e.target as HTMLImageElement).src = fallbackImage;
          }}
        />
        <div className="portfolio-overlay" />
      </div>

      {/* Floating Actions */}
      <div className="portfolio-floating-actions">
        <button
          type="button"
          className={`portfolio-like-btn ${liked ? 'liked' : ''}`}
          onClick={(e) => {
            e.stopPropagation();
            onToggleLike && onToggleLike();
          }}
          title={liked ? 'Unlike' : 'Like this project'}
        >
          <Heart size={16} fill={liked ? "currentColor" : "none"} />
        </button>
        {project.project_url && (
          <a
            href={project.project_url}
            target="_blank"
            rel="noopener noreferrer"
            className="portfolio-icon-btn"
            title="Visit project"
            onClick={(e) => e.stopPropagation()}
          >
            <ExternalLink size={14} />
          </a>
        )}
      </div>

      {/* Featured Client Logo */}
      {project.client_logo && (
        <div className="portfolio-card-client-logo">
          <img src={project.client_logo} alt={project.client_name || 'Client'} />
        </div>
      )}

      {/* Content Area */}
      <div className="portfolio-content z-10">
        <h3 className="portfolio-title line-clamp-2">
          {project.title}
        </h3>
        
        <p className="portfolio-description line-clamp-2">
          {project.description}
        </p>

        {/* Badges / Meta */}
        <div className="portfolio-meta">
          {project.category && (
            <span className="portfolio-badge">
              <Tag size={12} className="mr-1.5 opacity-70" />
              {project.category}
            </span>
          )}
          {project.featured && (
            <span className="portfolio-badge">
              <Star size={12} className="mr-1.5 text-yellow-400" />
              Featured
            </span>
          )}
        </div>

        {/* Main Action Button */}
        <button 
          className="portfolio-main-btn"
          onClick={(e) => {
            e.stopPropagation();
            onClick && onClick();
          }}
        >
          View Details
        </button>
      </div>
    </motion.div>
  );
}

