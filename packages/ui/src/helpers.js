/**
 * @okjt/ui/helpers: the kit's helpers that need neither React nor toasts, so
 * an app without react-hot-toast (an Inertia app such as TenaFi) can import
 * them without pulling in the rest of @okjt/ui:
 *
 *   import { installChunkReload } from '@okjt/ui/helpers';
 *
 * Keep this file free of imports from modules that use React or toasts.
 */
export { installChunkReload, shouldReloadForChunks, isChunkLoadError } from './chunkReload.js';
