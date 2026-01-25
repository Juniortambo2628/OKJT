// API Configuration
// Use /api for production (mapped via .htaccess), localhost:8000 for dev
const isProduction = import.meta.env.PROD || window.location.hostname !== 'localhost';
export const API_BASE_URL = import.meta.env.VITE_API_URL || (isProduction ? '/api' : 'http://localhost:8000/api');

// Hero Configuration
export const heroConfig = {
  slides: [
    {
      text: 'Design first. Function always.',
      image: '/images/hero/1.jpg',
      label: 'Design',
      subtitle: 'Simple, purposeful interfaces.',
    },
    {
      text: 'Smart, stylish, purposeful.',
      image: '/images/hero/2.jpg',
      label: 'Style',
      subtitle: 'Aesthetic clarity that supports goals.',
    },
    {
      text: 'Human‑centered UX.',
      image: '/images/hero/3.jpg',
      label: 'Interactive',
      subtitle: 'Guided by empathy and behavior.',
    },
    {
      text: 'Fast, responsive, accessible.',
      image: '/images/hero/4.jpg',
      label: 'Speed',
      subtitle: 'Performance and accessibility first.',
    },
    {
      text: 'From idea to launch.',
      image: '/images/hero/5.jpg',
      label: 'Deploy',
      subtitle: 'From code to production with confidence.',
    },
    {
      text: 'Built to scale.',
      image: '/images/hero/6.jpg',
      label: 'Scale',
      subtitle: 'Built for growth and maintainability.',
    },
    {
      text: 'Meet the Developer.',
      image: '/images/hero/7.jpg',
      label: 'Bookings',
    },
  ],
  scrollSensitivity: 500,
  typingSpeed: 30,
  maxStopVW: 90,
  numberMaxScale: 4,
  numberMinOpacity: 0.1,
  numberMaxOpacity: 0.3,
};

// Social Links
export const socialLinks = {
  facebook: 'https://www.facebook.com/Kevintambo97',
  twitter: 'http://www.twitter.com/kevintambo_',
  instagram: 'http://www.instagram.com/kevintambo',
  email: 'mailto:juniortambo2628@gmail.com',
  linkedin: 'https://www.linkedin.com/in/kevintambo',
};

// SEO Configuration
export const seoConfig = {
  siteName: 'OKJTech',
  defaultTitle: 'OKJTech — Design‑led web engineering for impact',
  defaultDescription: 'Design‑centered, user‑first web experiences that are fast, responsive, and built to drive results.',
  siteUrl: 'https://okjtech.co.ke',
  ogImage: '/images/og-image.png',
};

// Navigation
export const navigation = [
  { label: 'Home', href: '/' },
  { label: 'Portfolio', href: '/portfolio' },
  { label: 'Contact', href: '/contact' },
];

// Contact Information
export const contactInfo = {
  email: 'dev@okjtech.co.ke',
  location: 'Nairobi, Kenya',
  responseTime: 'Within 24 hours',
};

// Animation Configuration
export const animationConfig = {
  duration: {
    fast: 0.15,
    base: 0.3,
    slow: 0.5,
    expo: 0.8,
  },
  ease: {
    default: [0.43, 0.13, 0.23, 0.96],
    expo: [0.19, 1, 0.22, 1],
    bounce: [0.68, -0.6, 0.32, 1.6],
  },
};

