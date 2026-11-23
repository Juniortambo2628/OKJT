/**
 * The file types the media library accepts: the browser's copy of
 * laravel-kit's Okjt\Kit\Media\MediaLibrary IMAGE_MIMES / VIDEO_MIMES, so a
 * file input never offers a type the server will refuse (lifted from TFE's
 * lib/media.js). A test checks the two lists match. SVG is absent on
 * purpose: on a same-origin storage URL it is a stored-XSS vector.
 *
 *   <input type="file" accept={MEDIA_ACCEPT.image} />
 */
export const IMAGE_MIMES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'];
export const VIDEO_MIMES = ['video/mp4', 'video/webm'];

export const MEDIA_ACCEPT = {
  image: IMAGE_MIMES.join(','),
  media: [...IMAGE_MIMES, ...VIDEO_MIMES].join(','),
};
