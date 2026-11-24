import { createContext, useContext } from 'react';

const SiteContext = createContext(null);

/**
 * The project's settings for its public pages: brand, navigation, footer,
 * photos, product screens, SEO, and how to tell whether someone is signed in.
 * See the README for every setting.
 */
export function SiteProvider({ site, children }) {
  return <SiteContext.Provider value={site}>{children}</SiteContext.Provider>;
}

/** The `site` settings. Throws outside a SiteProvider, naming the component that needed it. */
export function useSite() {
  const site = useContext(SiteContext);
  if (!site) throw new Error('@okjt/site: wrap the app in <SiteProvider site={…}>');
  return site;
}

/** Whether someone is signed in, from `site.useAccount()`. */
export function useSignedIn() {
  const { useAccount } = useSite();
  return Boolean(useAccount?.().signedIn);
}

/** `{ url(key, width), alt(key) }` for photo keys, from `site.usePhotos()`. */
export function usePhotos() {
  return useSite().usePhotos();
}

/** `place(key)`: the photo(s) for a named place on the pages, from `site.usePlaces()`. */
export function usePlaces() {
  return useSite().usePlaces();
}

/** A product screen or clip: a key of `site.media`, or the item itself. */
export function useMedia(media) {
  const { media: catalogue = {} } = useSite();
  return typeof media === 'string' ? catalogue[media] : media;
}
