import { useDashboard } from './DashboardProvider.js';

/**
 * An icon given as a component (lucide's, or the project's own) or as a name
 * the project resolves (DashboardProvider `iconFor`). Where the kit itself
 * needs one (e.g. 'search'), it asks by name and passes its own `fallback`.
 */
export default function DashboardIcon({ icon, fallback = null, className = '', ...rest }) {
  const { iconFor } = useDashboard();
  const Icon = (typeof icon === 'string' ? iconFor(icon) : icon) || fallback;
  return Icon ? <Icon className={className} aria-hidden="true" {...rest} /> : null;
}

/** A component for `icon`: itself, or the project's icon of that name (or null). */
export function toIcon(icon, iconFor) {
  if (!icon) return null;
  return typeof icon === 'string' ? iconFor?.(icon) || null : icon;
}
