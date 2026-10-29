import { createContext, useContext } from 'react';

const DashboardContext = createContext(null);

/** What a dashboard gets without settings: no default side panel, nothing to refresh. */
const DEFAULTS = {
  home: { label: 'Dashboard', path: '/' },
  useDefaultPanel: () => null,
  useAfterChange: () => undefined,
};

/**
 * The project's dashboard settings:
 *
 *   home              the first breadcrumb on every page: { label, path }
 *   useDefaultPanel() the side panel for pages without their own (a panel
 *                     config, see AdminSidePanel), or null for none
 *   useAfterChange()  a function to call after any successful save (e.g. to
 *                     refresh who-changed-what), or undefined
 */
export function DashboardProvider({ dashboard, children }) {
  return <DashboardContext.Provider value={dashboard}>{children}</DashboardContext.Provider>;
}

/** The dashboard settings, with the defaults filled in. */
export function useDashboard() {
  return { ...DEFAULTS, ...useContext(DashboardContext) };
}
