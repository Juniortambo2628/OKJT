import { motion } from 'framer-motion';

interface TestimonialBubbleProps {
  text: string;
  author: string;
  company?: string;
}

export default function TestimonialBubble({ text, author, company }: TestimonialBubbleProps) {
  if (!text) return null;

  return (
    <motion.div 
      className="testimonial-bubble"
      initial={{ opacity: 0, x: 50, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 50, scale: 0.9 }}
      transition={{ duration: 0.6, ease: [0.19, 1, 0.22, 1] }}
    >
      <div className="testimonial-bubble-content">
        <div className="testimonial-quote-mark">"</div>
        <p className="testimonial-text">{text}</p>
        <div className="testimonial-author">
          <span className="testimonial-author-name">— {author}</span>
          {company && (
            <span className="testimonial-author-company">{company}</span>
          )}
        </div>
      </div>

    </motion.div>
  );
}
