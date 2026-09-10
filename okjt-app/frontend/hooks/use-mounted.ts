"use client"

import { useSyncExternalStore } from 'react'

const subscribe = () => () => {}

/**
 * `true` once the component has hydrated on the client, `false` during SSR and
 * the first client render. Use to gate rendering of client-only / theme-dependent
 * markup without a hydration mismatch.
 *
 * Replaces the `const [mounted, setMounted] = useState(false); useEffect(() =>
 * setMounted(true), [])` idiom — same behaviour, no effect, no
 * `react-hooks/set-state-in-effect` warning.
 */
export function useMounted(): boolean {
    return useSyncExternalStore(
        subscribe,
        () => true,
        () => false,
    )
}
