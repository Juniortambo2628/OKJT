export function readingTime(content: string): string {
    if (!content) return '1 min read'
    // Strip HTML tags
    const text = content.replace(/<[^>]*>/g, '')
    const words = text.trim().split(/\s+/).length
    const minutes = Math.max(1, Math.ceil(words / 200))
    return `${minutes} min read`
}
