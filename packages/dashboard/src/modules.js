import { useMemo } from 'react';
import { useDashboard } from './DashboardProvider.js';

/** The module (page) a dashboard path belongs to: the longest matching path wins. */
export function moduleForPathIn(modules, pathname = '') {
  const path = pathname.replace(/\/+$/, '') || '/';
  let best = null;
  for (const m of modules) {
    if ((path === m.path || path.startsWith(`${m.path}/`)) && (!best || m.path.length > best.path.length)) best = m;
  }
  return best;
}

/**
 * The dashboard's modules (DashboardProvider `modules`: [{ key, path, label }])
 * and lookups by key and by path. Keys match the server's revision modules and
 * what presence reports.
 */
export function useModules() {
  const { modules } = useDashboard();
  return useMemo(() => {
    const byKey = Object.fromEntries(modules.map((m) => [m.key, m]));
    return {
      modules,
      moduleByKey: (key) => byKey[key] || null,
      moduleForPath: (pathname) => moduleForPathIn(modules, pathname),
    };
  }, [modules]);
}

/** "Amina Odhiambo" -> "AO" */
export function initials(name = '') {
  return name.trim().split(/\s+/).slice(0, 2).map((p) => p[0]?.toUpperCase() || '').join('') || '?';
}

/** A stable soft colour per collaborator, so the same person always looks the same. */
const COLLABORATOR_COLORS = ['#A67B5B', '#6B8E7F', '#8B6FA6', '#C27C5A', '#5B7FA6', '#A65B7B', '#7F8E5B'];
export const collaboratorColor = (id = 0) => COLLABORATOR_COLORS[Math.abs(Number(id) || 0) % COLLABORATOR_COLORS.length];
