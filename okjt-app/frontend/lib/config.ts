export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'

export const PARALLAX_DEFAULTS = {
  heightClass: 'min-h-[230vh]',
  contentMaxWidth: 'max-w-[1400px]',
  fallbackBgMedia: '/assets/videos/services/all-services-video.mp4',
} as const

export const ADMIN_CARD_CLASSES = 'bg-secondary/5 border-border shadow-sm' as const

export const ADMIN_INPUT_CLASSES = 'bg-background border-border text-foreground' as const
