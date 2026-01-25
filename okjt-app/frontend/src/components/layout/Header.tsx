import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Sun, Moon } from 'lucide-react';
import { navigation } from '../../config';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../contexts/ThemeContext';

export default function Header() {
  const { t, i18n } = useTranslation();
  const { theme, toggleTheme } = useTheme();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Header classes based on page and scroll state
  const headerClasses = isHomePage 
    ? 'header header-transparent' 
    : `header ${isScrolled ? 'scrolled' : ''}`;

  return (
    <header className={headerClasses}>
      <div className="container-wide">
        <nav className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link 
            to="/" 
            className="flex items-center gap-2 z-50"
          >
            <img 
              src="/images/logo.png" 
              alt="OKJTech" 
              className="h-12 w-auto"
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navigation.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className={`nav-link ${location.pathname === item.href ? 'active' : ''} pt-2`}
              >
                {t(`nav.${item.label.toLowerCase()}`)}
              </Link>
            ))}
            
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? <Moon size={20} /> : <Sun size={20} className="text-white" />}
            </button>

            <Link to="/contact" className="cta-button">
              {t('nav.getInTouch')}
            </Link>

            {/* Language Switcher */}
            <select
              className="admin-select"
              value={i18n.language.substring(0, 2)}
              onChange={(e) => i18n.changeLanguage(e.target.value)}
              style={{ width: 'auto' }}
            >
              <option value="en">EN</option>
              <option value="sw">SW</option>
              <option value="fr">FR</option>
              <option value="de">DE</option>
              <option value="es">ES</option>
            </select>
          </div>

          {/* Mobile Menu Button */}
          {/* Mobile Controls & Menu Button */}
          <div className="flex items-center gap-3 md:hidden z-50">
            <button
              onClick={toggleTheme}
              className="p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? <Moon size={18} /> : <Sun size={18} className="text-white" />}
            </button>

            <select
              className="admin-select py-1 px-2 text-sm text-gray-800 dark:text-white"
              value={i18n.language.substring(0, 2)}
              onChange={(e) => i18n.changeLanguage(e.target.value)}
              style={{ width: 'auto', border: 'none', background: 'transparent' }}
            >
              <option value="en">EN</option>
              <option value="sw">SW</option>
              <option value="fr">FR</option>
              <option value="de">DE</option>
              <option value="es">ES</option>
            </select>

            {!['/contact', '/portfolio'].includes(location.pathname) && (
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-gray-800 dark:text-white"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            )}
          </div>
        </nav>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-white md:hidden"
          >
            <div className="flex flex-col items-center justify-center h-full gap-8">
              {navigation.map((item, index) => (
                <motion.div
                  key={item.href}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link
                    to={item.href}
                    className={`text-2xl font-medium ${
                      location.pathname === item.href ? 'text-black' : 'text-gray-500'
                    } hover:text-black transition-colors`}
                  >
                    {t(`nav.${item.label.toLowerCase()}`)}
                  </Link>
                </motion.div>
              ))}
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: navigation.length * 0.1 }}
              >
                <Link to="/contact" className="cta-button mt-4">
                  Get In Touch
                </Link>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
