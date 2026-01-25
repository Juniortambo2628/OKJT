import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { ContactForm, ContactInfo } from '../components/contact';
import { analyticsApi } from '../api/client';

// Ease curve constant
const smoothEase: [number, number, number, number] = [0.25, 0.46, 0.45, 0.94];

// Animation variants
const pageVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
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

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: smoothEase },
  },
};

export default function ContactPage() {

  useEffect(() => {
    analyticsApi.trackPageVisit('/contact');
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
            Get In Touch
          </motion.h1>
          <motion.p 
            className="page-subtitle"
            variants={subtitleVariants}
          >
            Ready to start your next project? Let's discuss how we can help bring your vision to life.
          </motion.p>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className="page-section">
        <div className="page-content page-content-narrow">
          <motion.div
            className="contact-card"
            variants={cardVariants}
          >
            <div className="contact-card-accent" />
            <div className="contact-card-header">
              <h2 className="contact-card-title">Send us a Message</h2>
              <p className="contact-card-subtitle">
                Fill out the form below and we'll get back to you as soon as possible.
              </p>
            </div>
            <ContactForm />
          </motion.div>
        </div>
      </section>

      {/* Contact Info Section */}
      <section className="page-section">
        <div className="page-content">
          <ContactInfo />
        </div>
      </section>
    </motion.div>
  );
}
