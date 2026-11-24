# @okjt/inertia

Use the OKJT kit (`@okjt/site`, `@okjt/dashboard`) in an Inertia app.

The kit's links and navigation are react-router's (`Link`, `NavLink`,
`useNavigate`, `useLocation`, `useSearchParams`). `InertiaRouter` is a
react-router `<Router>` whose location is Inertia's current page and whose
navigator makes Inertia visits, so all of them work in an Inertia app with
nothing in the kit changed:

- a link to another page here is an Inertia visit (`router.visit`);
- a link to a `#section` on the same page stays on the page and changes the
  hash (the kit's layouts scroll to it);
- a link to another site stays a plain link.

```bash
npm i @okjt/inertia react-router-dom
```

```jsx
import { InertiaRouter } from '@okjt/inertia';

export default function DashboardLayout({ children }) {
  return (
    <InertiaRouter visitOptions={{ preserveScroll: false }}>
      <DashboardProvider dashboard={dashboard}>
        <DashboardShell>{children}</DashboardShell>
      </DashboardProvider>
    </InertiaRouter>
  );
}
```

Put it inside the Inertia page (a persistent layout is the usual place): it
reads `usePage()`. `visitOptions` are passed to every visit.

- There are no `<Routes>`: Inertia picks the page, so `useParams()` is empty.
  Read route parameters from the page's props.
- As in react-router, `<Link to="#x">` resolves against the path alone, so
  on `/hosts?tab=a` it means `/hosts#x` (a visit). Write the query in the
  link if the section is on a page with one.
- `inertiaNavigate(to, { replace, visitOptions })` follows a link the same
  way from your own code; `planNavigation(to, currentUrl)` says what it would
  do (`external`, `hash` or `visit`).

Generalised from Tena-host's bridge, where the kit's public pages ran in its
Inertia app. Works with React 18 and 19.
