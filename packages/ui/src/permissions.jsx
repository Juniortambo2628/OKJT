import { createContext, useContext } from 'react';

/** What everyone may do outside a PermissionsProvider (e.g. a component rendered on its own in a test). */
const EVERYTHING = { role: 'owner', isOwner: true, canEdit: true };

const PermissionsContext = createContext(null);

/**
 * What the signed-in person may do here: `{ role, isOwner, canEdit }`. The
 * project works it out (from its user and the current workspace) and passes
 * it in; the kit's controls hide or disable themselves from it. The server
 * enforces the same rules: this only keeps the screen honest.
 */
export function PermissionsProvider({ value, children }) {
  return <PermissionsContext.Provider value={value}>{children}</PermissionsContext.Provider>;
}

/** `{ role, isOwner, canEdit }`; everything allowed outside a provider. */
export function usePermissions() {
  return useContext(PermissionsContext) ?? EVERYTHING;
}

/**
 * Hide/keep page actions by permission: viewers keep only actions marked `readOnly`
 * (view, export, refresh, print…). Everything else is treated as an edit.
 * An entry may carry a useAdminAction as `action` (+ `args`) instead of onClick.
 */
export function useVisibleActions(actions = []) {
  const { canEdit } = usePermissions();
  return actions
    .filter((entry) => entry && (entry.action ? entry.action.allowed : canEdit || entry.readOnly))
    .map((entry) => (entry.action ? {
      ...entry,
      onClick: entry.onClick || (() => entry.action.run(...(entry.args || []))),
      disabled: entry.disabled || entry.action.pending,
    } : entry));
}
