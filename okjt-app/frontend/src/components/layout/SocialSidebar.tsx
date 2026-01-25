import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Facebook, Twitter, Instagram, Mail, Linkedin, FileText, Download } from 'lucide-react';
import { siteSettingsApi } from '../../api/client';

const socialIcons = {
  social_facebook: Facebook,
  social_twitter: Twitter,
  social_instagram: Instagram,
  contact_email: Mail,
  social_linkedin: Linkedin,
  portfolio_file_url: FileText,
};

const socialLabels = {
  social_facebook: 'Facebook',
  social_twitter: 'Twitter',
  social_instagram: 'Instagram',
  contact_email: 'Email',
  social_linkedin: 'LinkedIn',
  portfolio_file_url: 'Portfolio',
};

// Default static links as fallback
const defaultLinks = {
  social_twitter: 'https://twitter.com/okjtech',
  social_linkedin: 'https://linkedin.com/company/okjtech',
  contact_email: 'mailto:hello@okjtech.co.ke',
  // facebook/instagram not in default settings but can be supported if added
};

export default function SocialSidebar() {
  const [links, setLinks] = useState<Record<string, string>>(defaultLinks);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const settings = await siteSettingsApi.getPublic();
        const newLinks: Record<string, string> = {};
        
        if (settings.social_twitter) newLinks.social_twitter = settings.social_twitter;
        if (settings.social_linkedin) newLinks.social_linkedin = settings.social_linkedin;
        if (settings.contact_email) newLinks.contact_email = `mailto:${settings.contact_email}`;
        if (settings.portfolio_file_url) newLinks.portfolio_file_url = settings.portfolio_file_url;
        
        setLinks(prev => ({ ...prev, ...newLinks }));
      } catch (err) {
        console.error('Failed to load social links', err);
      }
    };
    fetchSettings();
  }, []);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 1,
      },
    },
  };

  const item = {
    hidden: { x: -20, opacity: 0 },
    show: { x: 0, opacity: 1 },
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="social-sidebar hidden lg:block"
    >
      <div className="social-sidebar-inner">
        {Object.entries(links).map(([key, url]) => {
          if (!url) return null;
          
          // Map key to icon
          const Icon = socialIcons[key as keyof typeof socialIcons];
          const label = socialLabels[key as keyof typeof socialLabels];
          
          if (!Icon) return null;

          return (
            <motion.a
              key={key}
              variants={item}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="social-sidebar-link"
              title={label}
              download={key === 'portfolio_file_url'} // Add download attribute if it's the portfolio
            >
              <span className="icon-wrapper">
                <Icon size={18} />
              </span>
              <span className="label">
                {label}
                {key === 'portfolio_file_url' && <Download size={12} className="ml-2 inline" />}
              </span>
            </motion.a>
          );
        })}
      </div>
    </motion.div>
  );
}

