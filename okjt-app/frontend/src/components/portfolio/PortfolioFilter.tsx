import { motion } from 'framer-motion';

interface PortfolioFilterProps {
  categories: string[];
  activeFilter: string;
  onFilterChange: (filter: string) => void;
}

export default function PortfolioFilter({
  categories,
  activeFilter,
  onFilterChange,
}: PortfolioFilterProps) {
  const allFilters = ['all', ...categories];

  return (
    <div className="filter-tabs">
      {allFilters.map((filter) => (
        <motion.button
          key={filter}
          className={`filter-tab ${activeFilter === filter ? 'active' : ''}`}
          onClick={() => onFilterChange(filter)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {filter === 'all' ? 'All Projects' : filter}
        </motion.button>
      ))}
    </div>
  );
}

