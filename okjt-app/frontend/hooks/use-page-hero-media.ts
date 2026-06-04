"use client"

import { useSettings } from './use-settings'

interface UsePageHeroMediaOptions {
    /** The settings key to look up (e.g. 'hero_case_studies_media') */
    settingsKey: string
    /** Fallback URL if no setting is found */
    fallback: string
}

interface PageHeroMedia {
    /** Pass this to PageHero's videoSrc prop */
    videoSrc?: string
    /** Pass this to PageHero's bgImage prop */
    bgImage?: string
}

/**
 * Unified hook for resolving page hero media from site settings.
 * 
 * Automatically determines whether the resolved URL is a video (.mp4)
 * or an image and returns the appropriate prop for PageHero.
 * 
 * @example
 * const { videoSrc, bgImage } = usePageHeroMedia({
 *   settingsKey: 'hero_case_studies_media',
 *   fallback: 'https://cdn.pixabay.com/video/...'
 * })
 * <PageHero videoSrc={videoSrc} bgImage={bgImage} ... />
 */
export function usePageHeroMedia({ settingsKey, fallback }: UsePageHeroMediaOptions): PageHeroMedia {
    const { getSetting } = useSettings()
    const heroMedia = getSetting(settingsKey, fallback)
    
    const isVideo = heroMedia.endsWith('.mp4') || heroMedia.endsWith('.webm')

    return {
        videoSrc: isVideo ? heroMedia : undefined,
        bgImage: !isVideo ? heroMedia : undefined,
    }
}
