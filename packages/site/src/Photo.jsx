import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { usePhotos } from './SiteProvider.js';

const ROTATE_EVERY = 7000;
const asList = (image) => (Array.isArray(image) ? image : [image]);

/**
 * A photo filling its (positioned) parent. `image` is a photo key (resolved by
 * `site.usePhotos()`) or a path, or a list of them to cross-fade through. `phoneImage` (one or a list) takes
 * over on portrait phones. If it can't load, a warm gradient shows instead so
 * the card still reads.
 */
export default function Photo({ image, phoneImage, width = 1600, alt, position = 'center', className = '', eager = false }) {
  const images = asList(image);
  const phones = phoneImage ? asList(phoneImage) : null;
  const [index, setIndex] = useState(0);
  const [failedSrc, setFailedSrc] = useState(null);
  const reduceMotion = useReducedMotion();
  const photos = usePhotos();
  const url = (key, w) => photos.url(key, w);
  const current = images[index % images.length];
  const src = url(current, width);
  const failed = failedSrc === src;
  const label = alt ?? photos.alt(current) ?? '';
  const rotating = images.length > 1 && !reduceMotion;
  const nextSrc = rotating ? url(images[(index + 1) % images.length], width) : null;

  useEffect(() => {
    if (!rotating) return undefined;
    // Fetch the next picture ahead of time so the fade never shows a blank.
    new Image().src = nextSrc;
    const id = setTimeout(() => setIndex((i) => i + 1), ROTATE_EVERY);
    return () => clearTimeout(id);
  }, [rotating, nextSrc, index]);

  return (
    <div className={`absolute inset-0 overflow-hidden bg-gradient-to-br from-accent-soft via-accent to-body ${className}`}>
      <AnimatePresence initial={false}>
        {!failed && (
          <motion.picture
            key={index}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.4, ease: 'easeInOut' }}
            className="absolute inset-0"
          >
            {phones && <source media="(max-width: 640px) and (orientation: portrait)" srcSet={url(phones[index % phones.length], 900)} />}
            <img
              src={src}
              alt={label}
              loading={eager ? 'eager' : 'lazy'}
              decoding="async"
              onError={() => setFailedSrc(src)}
              style={{ objectPosition: position }}
              className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
            />
          </motion.picture>
        )}
      </AnimatePresence>
    </div>
  );
}
