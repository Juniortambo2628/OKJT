import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getMediaUrl(path: string | undefined | null) {
  if (!path) return ''
  if (path.startsWith('http') || path.startsWith('data:')) return path
  
  // Prefix with API base URL and storage endpoint
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'
  let cleanPath = path.startsWith('/') ? path.substring(1) : path
  
  // If use specifically points to 'assets/', it's a frontend local asset
  if (cleanPath.startsWith('assets/')) {
    return path // Return as is for local Next.js public assets
  }

  // If the path already includes 'storage/', remove it as we add it back via the API endpoint
  if (cleanPath.startsWith('storage/')) {
    cleanPath = cleanPath.replace('storage/', '')
  }
  
  // Only prefix if it's meant for the backend storage (uploads or files)
  if (cleanPath.startsWith('uploads/') || cleanPath.startsWith('files/')) {
    return `${baseUrl}/storage/${cleanPath}`
  }

  // Fallback: if it's not starting with storage, uploads, or files, but it's not a local asset, 
  // we might still want to prefix it if it's a relative path from the DB
  return path.startsWith('/') ? path : `${baseUrl}/storage/${cleanPath}`
}
