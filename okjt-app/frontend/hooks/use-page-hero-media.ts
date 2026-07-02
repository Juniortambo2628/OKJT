"use client"

import { useSettings } from './use-settings'
import { DEFAULT_HERO_VIDEO } from '@/lib/config'

interface UsePageHeroMediaOptions {
    /** The settings key to look up (e.g. 'hero_projects_media') */
    settingsKey: string
    /** Optional fallback URL if the page has an approved local brand asset. Defaults to the brand placeholder video. */
    fallback?: string
}

interface PageHeroMedia {
    /** Pass this to Hero's videos prop (as a single-item array) */
    videoSrc?: string
    /** Pass this to Hero's bgImage prop */
    bgImage?: string
    /** Pass this to Hero's loading prop */
    mediaLoading: boolean
}

/**
 * Unified hook for resolving page hero media from site settings.
 *
 * Automatically determines whether the resolved URL is a video (.mp4)
 * or an image and returns the appropriate prop for the reusable Hero.
 *
 * @example
 * const { videoSrc, bgImage, mediaLoading } = usePageHeroMedia({
 *   settingsKey: 'hero_projects_media'
 * })
 * <Hero videos={videoSrc ? [videoSrc] : undefined} bgImage={bgImage} loading={mediaLoading} ... />
 */
export function usePageHeroMedia({ settingsKey, fallback }: UsePageHeroMediaOptions): PageHeroMedia {
    const { getSetting, isLoading } = useSettings()
    if (isLoading) {
        return { mediaLoading: true }
    }

    const heroMedia = getSetting(settingsKey, fallback ?? DEFAULT_HERO_VIDEO)
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
