import { usePageLoading } from '../lib/pageLoading';

/** A thin bar along the top of the screen while the next page's code downloads; it appears only after 200 ms. */
export default function RouteProgress() {
  const loading = usePageLoading();
  if (!loading) return null;
  return (
    <div role="progressbar" aria-label="Loading the page" className="okjt-route-progress pointer-events-none fixed inset-x-0 top-0 z-[60] h-[3px] overflow-hidden">
      <div className="h-full w-1/3 rounded-full bg-accent" />
    </div>
  );
}
