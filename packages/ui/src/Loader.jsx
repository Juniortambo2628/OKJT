import { motion } from 'framer-motion';

export default function Loader() {
  return (
    <div className="fixed inset-0 bg-paper-warm z-[100] flex items-center justify-center">
      <motion.img
        src="/brand/naoa-logo-dark.png"
        alt="Loading..."
        className="w-40 h-auto"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      />
    </div>
  );
}
