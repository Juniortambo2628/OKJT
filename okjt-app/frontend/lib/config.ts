export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'

export const DEFAULT_HERO_VIDEO = '/assets/videos/okjt-bg-videos/3129977-uhd_3840_2160_30fps - Trim.mp4' as const

export const PARALLAX_DEFAULTS = {
  heightClass: 'min-h-[230vh]',
  contentMaxWidth: 'max-w-[1400px]',
  fallbackBgMedia: DEFAULT_HERO_VIDEO,
} as const

export const ADMIN_CARD_CLASSES = 'bg-secondary/5 border-border shadow-sm' as const

export const ADMIN_INPUT_CLASSES = 'bg-background border-border text-foreground' as const
