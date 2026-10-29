import { createContext, useContext } from 'react';

const DashboardContext = createContext(null);

/** What a dashboard gets without settings: no default side panel, nothing to refresh. */
const DEFAULT_ROLES = [
  { value: 'owner', label: 'Owner', description: 'Everything, including people and roles' },
  { value: 'editor', label: 'Editor', description: 'Changes what is in the dashboard' },
  { value: 'viewer', label: 'Viewer', description: 'Can look around but not change anything' },
];

const DEFAULTS = {
  home: { label: 'Dashboard', path: '/' },
  useDefaultPanel: () => null,
  useAfterChange: () => undefined,
  api: null,
  modules: [],
  roles: DEFAULT_ROLES,
  roleLabel: (role) => DEFAULT_ROLES.find((r) => r.value === role)?.label || role,
  anonymousName: 'Someone',
  removeCollaborator: null,
};

/**
 * The project's dashboard settings:
 *
 *   home              the first breadcrumb on every page: { label, path }
 *   useDefaultPanel() the side panel for pages without their own (a panel
 *                     config, see AdminSidePanel), or null for none
 *   useAfterChange()  a function to call after any successful save (e.g. to
 *                     refresh who-changed-what), or undefined
 *
 * For working together (presence, history, sharing — the okjt/laravel-kit API):
 *
 *   api               the app's API client (axios-like: get, post, patch,
 *                     delete), already sending the workspace header; its calls
 *                     resolve to the response body ({ success, data, message })
 *   modules           the dashboard's pages: [{ key, path, label }]
 *   roles, roleLabel  the roles people can be given: [{ value, label, description }]
 *   anonymousName     who made a change nobody signed in made ("Someone")
 *   removeCollaborator(person)  takes someone's access away; defaults to
 *                     DELETE /collaborators/{id}
 */
export function DashboardProvider({ dashboard, children }) {
  return <DashboardContext.Provider value={dashboard}>{children}</DashboardContext.Provider>;
}

/** The dashboard settings, with the defaults filled in. */
export function useDashboard() {
  return { ...DEFAULTS, ...useContext(DashboardContext) };
}
