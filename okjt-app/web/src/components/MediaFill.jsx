import { useState } from 'react';
import { useReducedMotion } from 'framer-motion';
import { Photo } from '@okjt/site';
import { isVideo, mediaUrl } from '../lib/media';

/**
 * A photo or a looping clip filling its (positioned) parent: the CMS's
 * hero and section backgrounds are either. Clips don't play for people who
 * prefer reduced motion, and phones get the still poster when there is one.
 * A clip fades in once its first frame is ready, instead of popping in.
 */
export default function MediaFill({ src, poster, eager = false, className = '' }) {
  const reduceMotion = useReducedMotion();
  const [shown, setShown] = useState(null);
  if (!src) return <div className={`absolute inset-0 bg-[url(/brand/placeholder.svg)] bg-cover bg-center ${className}`} />;
  if (isVideo(src)) {
    return (
      <div className={`absolute inset-0 overflow-hidden bg-ink-deep ${className}`}>
        <video
          key={src}
          className={`h-full w-full object-cover transition-opacity duration-1000 ${shown === src || poster ? 'opacity-100' : 'opacity-0'}`}
          onLoadedData={() => setShown(src)}
          src={mediaUrl(src)}
          poster={poster ? mediaUrl(poster) : undefined}
          autoPlay={!reduceMotion}
          muted
          loop
          playsInline
          preload={eager ? 'auto' : 'metadata'}
          aria-hidden="true"
        />
      </div>
    );
  }
  return <Photo image={src} width={2000} eager={eager} className={className} />;
}
