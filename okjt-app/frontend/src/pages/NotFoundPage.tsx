import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <motion.div
        className="text-center px-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-[10rem] md:text-[15rem] font-display font-bold text-gray-900 leading-none">
          404
        </h1>
        <h2 className="text-2xl md:text-3xl font-display font-semibold text-white mb-4 -mt-8">
          Page Not Found
        </h2>
        <p className="text-gray-400 mb-8 max-w-md mx-auto">
          The page you're looking for doesn't exist or has been moved.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/" className="cta-button">
            <Home size={20} />
            Go Home
          </Link>
          <button 
            onClick={() => window.history.back()}
            className="cta-button-outline"
          >
            <ArrowLeft size={20} />
            Go Back
          </button>
        </div>
      </motion.div>
    </div>
  );
}

