import '@testing-library/jest-dom/vitest';

// jsdom doesn't implement scrolling; components that scroll into view call it.
window.scrollTo = () => {};
