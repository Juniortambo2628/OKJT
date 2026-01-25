import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PortfolioGrid } from '../components/portfolio';
import { portfolioApi, analyticsApi } from '../api/client';
import type { PortfolioProject } from '../types';

// Ease curve constant
const smoothEase: [number, number, number, number] = [0.25, 0.46, 0.45, 0.94];

// Animation variants
const pageVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.1,
    },
  },
};

const headerVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: smoothEase },
  },
};

const subtitleVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: 0.15, ease: smoothEase },
  },
};

const gridContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.4, staggerChildren: 0.08 },
  },
};

const loaderVariants = {
  initial: { rotate: 0 },
  animate: { 
    rotate: 360,
    transition: { duration: 1, ease: 'linear' as const, repeat: Infinity },
  },
};

export default function PortfolioPage() {
  const [projects, setProjects] = useState<PortfolioProject[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    analyticsApi.trackPageVisit('/portfolio');
    
    const fetchData = async () => {
      try {
        const [projectsData, categoriesData] = await Promise.all([
          portfolioApi.getAll(),
          portfolioApi.getCategories(),
        ]);
        setProjects(projectsData);
        setCategories(categoriesData);
      } catch (error) {
        console.error('Failed to fetch portfolio data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <motion.div 
      className="page-container"
      variants={pageVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header Section */}
      <section className="page-header">
        <div className="page-header-content">
          <motion.h1 
            className="page-title"
            variants={headerVariants}
          >
            Our Portfolio
          </motion.h1>
          <motion.p 
            className="page-subtitle"
            variants={subtitleVariants}
          >
            Explore our diverse range of web development projects and digital solutions
          </motion.p>
          <motion.div 
            className="page-title-accent"
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          />
        </div>
      </section>

      {/* Portfolio Grid Section */}
      <section className="page-section">
        <div className="page-content">
          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div 
                key="loader"
                className="loading-container"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <motion.div 
                  className="loading-spinner"
                  variants={loaderVariants}
                  initial="initial"
                  animate="animate"
                />
                <p className="loading-text">Loading projects...</p>
              </motion.div>
            ) : (
              <motion.div
                key="content"
                variants={gridContainerVariants}
                initial="hidden"
                animate="visible"
              >
                <PortfolioGrid projects={projects} categories={categories} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>
    </motion.div>
  );
}
