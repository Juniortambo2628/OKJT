# @okjt/dashboard

The pages of an OKJTech dashboard, as Naoa builds them: every page has the
same shape — a hero with breadcrumbs, optional summary cards that double as
filters, the page's content with a side panel beside it, and one floating
toolbar for search, filters, views and actions. Lists fit the screen and only
their rows scroll. Saving works one way everywhere (`useAdminAction`):
confirm, pending state, toast, refresh, and hidden for people who may only
view.

Colours and fonts come from `@okjt/ui`'s theme.

## Install

```bash
npm i @okjt/dashboard @okjt/ui
```

Peer dependencies: `react`, `react-dom`, `react-router-dom`,
`@tanstack/react-query`, `framer-motion`, `lucide-react`, `react-hot-toast`.

```css
@import "tailwindcss";
@import "./okjt-theme.css";
@source "../node_modules/@okjt/ui/dist";
@source "../node_modules/@okjt/dashboard/dist";
```

## Set it up

```jsx
import { PermissionsProvider, ConfirmHost } from '@okjt/ui';
import { DashboardProvider, SearchProvider, AdminChromeProvider } from '@okjt/dashboard';

const dashboard = {
  home: { label: 'Dashboard', path: '/dashboard' },  // first breadcrumb on every page
  useDefaultPanel: () => null,                       // side panel for pages without one
  useAfterChange: () => undefined,                   // called after every successful save
};

function Providers({ children }) {
  const permissions = useMyPermissions(); // { role, isOwner, canEdit }
  return (
    <PermissionsProvider value={permissions}>
      <DashboardProvider dashboard={dashboard}>
        <SearchProvider>
          <AdminChromeProvider>
            {children}
            <ConfirmHost />
          </AdminChromeProvider>
        </SearchProvider>
      </DashboardProvider>
    </PermissionsProvider>
  );
}
```

Outside a `PermissionsProvider` everything is allowed; outside a
`DashboardProvider` the defaults above apply.

## A page

```jsx
import { Plus } from 'lucide-react';
import { AdminPageLayout, AdminPageHero, AdminSummaryCards, AdminListPanel, useAdminAction, useFilteredItems, useSearch } from '@okjt/dashboard';

export default function Expenses() {
  const { data: expenses = [] } = useQuery({ queryKey: ['expenses'], queryFn: api.expenses });
  const { searchQuery } = useSearch();
  const shown = useFilteredItems(expenses, searchQuery);
  const remove = useAdminAction((id) => api.deleteExpense(id), {
    confirm: 'Delete this expense?', success: 'Expense deleted', invalidate: [['expenses']],
  });

  return (
    <AdminPageLayout
      fill
      hero={<AdminPageHero title="Expenses" breadcrumb="Expenses" />}
      summary={<AdminSummaryCards cards={[{ label: 'This month', value: total(expenses) }]} />}
      search="Search expenses"
      actions={[{ id: 'add', label: 'Add expense', icon: Plus, onClick: openForm }]}
    >
      <AdminListPanel>{shown.map((e) => <Row key={e.id} expense={e} onDelete={() => remove.run(e.id)} />)}</AdminListPanel>
    </AdminPageLayout>
  );
}
```

## Building blocks

| Export | What it is |
|---|---|
| `AdminPageLayout` | The page: `hero`, `summary`, content, `panel`, and the toolbar's `actions`, `search`, `filters`; `fill` fits the viewport |
| `AdminPageHero` | Title, breadcrumbs, description; a compact copy appears in the header once it scrolls away |
| `AdminSummaryCards`, `StatCard` | Summary numbers; a card can apply a filter |
| `AdminFloatingToolbar`, `AdminToolbarSearch`, `AdminToolbarFilters`, `countActiveFilters` | The toolbar and its parts |
| `SidePanelAside`, `SidePanelMobileBar`, `SidePanelNav` | The side panel: sections, tools, lists; chips and a sheet on phones |
| `AdminListPanel`, `AdminPagination`, `pageWindow`, `AdminBulkActions` | Lists, paging, actions on a selection |
| `AdminCard`, `AdminInput`, `AdminTextarea`, `AdminSelect`, `AdminModal` | Cards, fields, dialogs |
| `EditableFieldset`, `DeleteButton`, `ToggleButton` | Controls that disable or hide themselves for viewers |
| `EmptyState`, `QueryError` | Nothing to show; something failed to load |
| `UnsavedChangesStatus`, `useUnsavedChangesGuard`, `useUnsavedChanges` | Warn before leaving with unsaved edits |
| `AdminTutorial` | A guided tour; pass `steps` |
| `useAdminAction`, `useBulkAdminAction`, `useCrudHandlers` | One way to save |
| `useFilteredItems`, `useSavedViews` | Search across a list; remembered views |
| `SearchProvider`/`useSearch`, `AdminChromeProvider`/`useAdminChrome`, `AdminHeaderStatus` | The shared search box and the header's slots |
| `DashboardProvider`, `useDashboard` | The settings above |

## Working together

With `okjt/laravel-kit`'s collaboration routes on the server, add to the
dashboard settings:

```js
const dashboard = {
  // …
  api,                                   // axios-like, sends the workspace header, resolves to the body
  modules: [{ key: 'expenses', path: '/dashboard/expenses', label: 'Expenses' }],
  roles: [{ value: 'owner', label: 'Owner', description: '…' }, /* editor, viewer */],
  anonymousName: 'Someone',              // changes nobody signed in made
  useDefaultPanel: useActivityPanel,      // who's here and what changed, on pages without a panel
  useAfterChange: () => useCollaboration().refresh,
};
```

and wrap the dashboard in `<CollaborationProvider>` (inside the router). Then
`ShareModal`, `VersionHistoryDrawer`, `ActivityPanel` and
`CollaboratorAvatars` work as in Naoa.

Still in the projects for now, moving next: the shell (header, sidebar,
account menu), then sign-in pages and the Console.
