"use client"

import { useSettings } from './use-settings'

interface UsePageHeroMediaOptions {
    /** The settings key to look up (e.g. 'hero_projects_media') */
    settingsKey: string
    /** Optional fallback URL if the page has an approved local brand asset */
    fallback?: string
}

interface PageHeroMedia {
    /** Pass this to PageHero's videoSrc prop */
    videoSrc?: string
    /** Pass this to PageHero's bgImage prop */
    bgImage?: string
    /** Pass this to PageHero's mediaLoading prop */
    mediaLoading: boolean
}

/**
 * Unified hook for resolving page hero media from site settings.
 * 
 * Automatically determines whether the resolved URL is a video (.mp4)
 * or an image and returns the appropriate prop for PageHero.
 * 
 * @example
 * const { videoSrc, bgImage, mediaLoading } = usePageHeroMedia({
 *   settingsKey: 'hero_projects_media'
 * })
 * <PageHero videoSrc={videoSrc} bgImage={bgImage} ... />
 */
export function usePageHeroMedia({ settingsKey, fallback }: UsePageHeroMediaOptions): PageHeroMedia {
    const { getSetting, isLoading } = useSettings()
    if (isLoading) {
        return { mediaLoading: true }
    }

    const heroMedia = getSetting(settingsKey, fallback)
    if (!heroMedia) {
        return { mediaLoading: false }
    }
    
    const isVideo = heroMedia.endsWith('.mp4') || heroMedia.endsWith('.webm')

    return {
        videoSrc: isVideo ? heroMedia : undefined,
        bgImage: !isVideo ? heroMedia : undefined,
        mediaLoading: false,
    }
}
