export { defineConfig, compileTheme, COLOR_TOKENS, FONT_TOKENS, TONE_STEPS } from './theme.js';
export { RAMPS } from './ramps.js';

// React components (peer dependencies: react, react-dom, framer-motion, lucide-react, react-hot-toast)
export { PermissionsProvider, usePermissions, useVisibleActions } from './permissions.js';
export { default as Button } from './Button.js';
export { buttonClass, BUTTON_BASE, BUTTON_VARIANTS, BUTTON_SIZES, BUTTON_FONTS } from './buttonStyles.js';
export { default as Overlay, PortalWhen } from './Overlay.js';
export { default as Modal } from './Modal.js';
export { default as SegmentedControl } from './SegmentedControl.js';
export { Skeleton, CardSkeleton, TimelineSkeleton, MessageSkeleton } from './Skeleton.js';
export { default as Loader } from './Loader.js';
export { default as Spinner } from './Spinner.js';
export { default as ContextMenu } from './ContextMenu.js';
export { default as useDismiss } from './useDismiss.js';
export { default as ConfirmHost } from './ConfirmHost.js';
export {
  registerConfirmHost, confirmOptions, confirmAction, promptAction, notifyError, notifySuccess, notifyUndo,
} from './feedback.js';
