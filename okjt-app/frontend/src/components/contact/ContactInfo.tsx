import { motion } from 'framer-motion';
import { Mail, MapPin, Clock } from 'lucide-react';
import { contactInfo } from '../../config';

const infoItems = [
  {
    icon: Mail,
    title: 'Email Us',
    value: contactInfo.email,
    href: `mailto:${contactInfo.email}`,
  },
  {
    icon: MapPin,
    title: 'Location',
    value: contactInfo.location,
  },
  {
    icon: Clock,
    title: 'Response Time',
    value: contactInfo.responseTime,
  },
];

// Ease curve constant
const smoothEase: [number, number, number, number] = [0.25, 0.46, 0.45, 0.94];

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.2,
    },
  },
};

const cardVariants = {
  hidden: { 
    opacity: 0, 
    y: 40,
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: smoothEase,
    },
  },
};

const iconVariants = {
  hidden: { scale: 0, rotate: -180 },
  visible: { 
    scale: 1, 
    rotate: 0,
    transition: {
      type: 'spring' as const,
      stiffness: 200,
      damping: 15,
      delay: 0.1,
    },
  },
};

export default function ContactInfo() {
  return (
    <motion.div 
      className="grid grid-cols-1 md:grid-cols-3 gap-6"
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-50px' }}
    >
      {infoItems.map((item) => {
        const Icon = item.icon;
        
        return (
          <motion.div
            key={item.title}
            className="contact-info-card group"
            variants={cardVariants}
            whileHover={{ 
              y: -8, 
              boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.1)',
              transition: { duration: 0.3 }
            }}
          >
            <motion.div 
              className="icon mb-4 text-gray-500 group-hover:text-gray-900 transition-colors duration-300"
              variants={iconVariants}
            >
              <Icon size={32} strokeWidth={1.5} />
            </motion.div>
            <h3 className="text-lg font-display font-semibold text-gray-900 mb-2">
              {item.title}
            </h3>
            {item.href ? (
              <motion.a 
                href={item.href}
                className="text-gray-600 hover:text-gray-900 transition-colors inline-block"
                whileHover={{ x: 4 }}
                transition={{ duration: 0.2 }}
              >
                {item.value}
              </motion.a>
            ) : (
              <p className="text-gray-600">{item.value}</p>
            )}
          </motion.div>
        );
      })}
    </motion.div>
  );
}
