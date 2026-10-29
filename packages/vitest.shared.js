// Shared by each package's vitest.config.js: component tests run in jsdom
// against the built dist/ (what gets published).
import { fileURLToPath } from 'node:url';

export default {
  esbuild: { jsx: 'automatic' },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: [fileURLToPath(new URL('./test-setup.js', import.meta.url))],
    include: ['test/**/*.test.jsx'],
  },
};
