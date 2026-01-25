import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from 'lucide-react';
import { socialLinks } from '../../config';

const socialIcons = {
  facebook: Facebook,
  twitter: Twitter,
  instagram: Instagram,
  linkedin: Linkedin,
  email: Mail,
};

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number],
    },
  },
};

const socialVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: 'easeOut' as const,
    },
  },
};

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-container">
        <motion.div 
          className="footer-grid"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
        >
          {/* Company Info */}
          <motion.div className="footer-company" variants={itemVariants}>
            <Link to="/" className="footer-logo-link">
              <img 
                src="/images/logo.png" 
                alt="OKJTech" 
                className="footer-logo"
              />
            </Link>
            <p className="footer-description">
              We create innovative digital solutions that transform businesses and enhance user experiences. 
              Let us help you bring your vision to life.
            </p>
          </motion.div>

          {/* Quick Links */}
          <motion.div className="footer-links" variants={itemVariants}>
            <h3 className="footer-title">Quick Links</h3>
            <ul className="footer-list">
              <li><Link to="/">Home</Link></li>
              <li><Link to="/portfolio">Portfolio</Link></li>
              <li><Link to="/contact">Contact</Link></li>
            </ul>
          </motion.div>

          {/* Contact Info */}
          <motion.div className="footer-contact-section" variants={itemVariants}>
            <h3 className="footer-title">Contact</h3>
            <div className="footer-contact-list">
              <div className="footer-contact-item">
                <Mail size={16} />
                <span>info@okjtech.co.ke</span>
              </div>
              <div className="footer-contact-item">
                <Phone size={16} />
                <span>+254 700 000 000</span>
              </div>
              <div className="footer-contact-item">
                <MapPin size={16} />
                <span>Nairobi, Kenya</span>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Bottom Section */}
        <motion.div 
          className="footer-bottom"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <div className="footer-bottom-content">
            <p className="footer-copyright">
              © {currentYear} OKJTech. All rights reserved.
            </p>

            {/* Social Links */}
            <motion.div 
              className="footer-social"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {Object.entries(socialLinks).map(([key, url]) => {
                if (!url) return null;
                const Icon = socialIcons[key as keyof typeof socialIcons];
                if (!Icon) return null;
                
                return (
                  <motion.a
                    key={key}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={key}
                    variants={socialVariants}
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Icon size={18} />
                  </motion.a>
                );
              })}
            </motion.div>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}
