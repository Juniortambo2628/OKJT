export { DashboardProvider, useDashboard } from './DashboardProvider.js';
export { AdminChromeProvider, useAdminChrome, AdminHeaderStatus } from './AdminChromeContext.js';
export { SearchProvider, useSearch } from './SearchContext.js';

export { default as AdminPageLayout } from './AdminPageLayout.js';
export { default as AdminPageHero } from './AdminPageHero.js';
export { default as AdminSummaryCards } from './AdminSummaryCards.js';
export { default as StatCard } from './StatCard.js';
export { default as AdminFloatingToolbar } from './AdminFloatingToolbar.js';
export { default as AdminToolbarSearch } from './AdminToolbarSearch.js';
export { default as AdminToolbarFilters, countActiveFilters } from './AdminToolbarFilters.js';
export { SidePanelNav, SidePanelAside, SidePanelMobileBar } from './AdminSidePanel.js';
export { default as AdminListPanel } from './AdminListPanel.js';
export { default as AdminPagination, pageWindow } from './AdminPagination.js';
export { default as AdminBulkActions } from './AdminBulkActions.js';
export { default as AdminCard } from './AdminCard.js';
export { AdminInput, AdminTextarea, AdminSelect } from './AdminInput.js';
export { default as AdminModal } from './AdminModal.js';
export { default as EditableFieldset } from './EditableFieldset.js';
export { default as DeleteButton } from './DeleteButton.js';
export { default as ToggleButton } from './ToggleButton.js';
export { default as EmptyState } from './EmptyState.js';
export { default as QueryError } from './QueryError.js';
export { default as UnsavedChangesStatus } from './UnsavedChangesStatus.js';
export { default as AdminTutorial } from './AdminTutorial.js';

export { default as useAdminAction, useBulkAdminAction } from './useAdminAction.js';
export { default as useCrudHandlers } from './useCrudHandlers.js';
export { default as useUnsavedChangesGuard, useUnsavedChanges } from './useUnsavedChangesGuard.js';
export { default as useFilteredItems } from './useFilteredItems.js';
export { default as useSavedViews } from './useSavedViews.js';

// Working together (with okjt/laravel-kit's collaboration API)
export { useModules, moduleForPathIn, initials, collaboratorColor } from './modules.js';
export { CollaborationProvider, useCollaboration, HEARTBEAT_MS } from './CollaborationContext.js';
export { default as CollaboratorAvatars, CollaboratorAvatar } from './CollaboratorAvatars.js';
export { default as ActivityPanel } from './ActivityPanel.js';
export { default as useActivityPanel } from './useActivityPanel.js';
export { default as VersionHistoryDrawer } from './VersionHistoryDrawer.js';
export { default as ShareModal } from './ShareModal.js';

// The shell
export { default as DashboardShell } from './DashboardShell.js';
export { default as DashboardSidebar } from './DashboardSidebar.js';
export { default as DashboardHeader } from './DashboardHeader.js';

// Signing in
export { AuthProvider, useAuth, default as AuthContext } from './AuthContext.js';
export { default as GoogleButton } from './GoogleButton.js';
export { default as NotificationsBell } from './NotificationsBell.js';
export { loginWithPasskey, registerPasskey, passkeysSupported } from './passkeys.js';
