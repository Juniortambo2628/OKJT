"use client"

import React, { useRef, useState, useEffect } from 'react'
import { Film } from 'lucide-react'

interface VideoThumbnailProps {
    src: string
    className?: string
    fallbackClassName?: string
}

export default function VideoThumbnail({ src, className = 'w-full h-full object-cover', fallbackClassName }: VideoThumbnailProps) {
    const videoRef = useRef<HTMLVideoElement>(null)
    const [thumbSrc, setThumbSrc] = useState<string | null>(null)
    const [failed, setFailed] = useState(false)

    useEffect(() => {
        if (!src) return

        const video = document.createElement('video')
        video.preload = 'metadata'
        video.muted = true
        video.playsInline = true
        video.crossOrigin = 'anonymous'
        video.src = src

        const handleLoaded = () => {
            // Seek to 0.5s or whichever is smaller
            video.currentTime = Math.min(0.5, video.duration || 0)
        }

        const handleSeeked = () => {
            try {
                const canvas = document.createElement('canvas')
                canvas.width = video.videoWidth || 320
                canvas.height = video.videoHeight || 180
                const ctx = canvas.getContext('2d')
                if (ctx) {
                    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
                    setThumbSrc(canvas.toDataURL('image/jpeg', 0.6))
                } else {
                    setFailed(true)
                }
            } catch {
                setFailed(true)
            }
        }

        video.addEventListener('loadedmetadata', handleLoaded)
        video.addEventListener('seeked', handleSeeked)
        video.addEventListener('error', () => setFailed(true))

        return () => {
            video.removeEventListener('loadedmetadata', handleLoaded)
            video.removeEventListener('seeked', handleSeeked)
            video.removeEventListener('error', () => setFailed(true))
        }
    }, [src])

    if (failed || !thumbSrc) {
        return (
            <div className={`flex flex-col items-center justify-center bg-black/5 ${fallbackClassName || className?.replace('object-cover', '')}`}>
                <Film className="h-10 w-10 text-muted-foreground" />
                <span className="mt-2 text-sm text-muted-foreground font-medium">Video</span>
            </div>
        )
    }

    return <img src={thumbSrc} alt="Video thumbnail" className={className} />
}
