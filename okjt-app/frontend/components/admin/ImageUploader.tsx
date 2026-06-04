"use client"

import React, { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import imageCompression from 'browser-image-compression'
import { Upload, X, Loader2, Image as ImageIcon, Film, File } from 'lucide-react'
import api from '@/lib/api'

interface ImageUploaderProps {
    value?: string
    onChange: (url: string) => void
    accept?: string[]
    maxSizeMB?: number
    label?: string
    className?: string
}

const ImageUploader = ({ value, onChange, accept, maxSizeMB = 2, label = 'Upload File', className }: ImageUploaderProps) => {
    const [preview, setPreview] = useState<string | null>(value || null)
    const [isUploading, setIsUploading] = useState(false)
    const [uploadProgress, setUploadProgress] = useState(0)
    const [error, setError] = useState<string | null>(null)

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        const file = acceptedFiles[0]
        if (!file) return

        setError(null)
        setIsUploading(true)
        setUploadProgress(0)

        try {
            let fileToUpload = file

            // Compress images (skip videos and SVGs)
            const isImage = file.type.startsWith('image/') && !file.type.includes('svg')
            if (isImage) {
                setUploadProgress(10)
                fileToUpload = await imageCompression(file, {
                    maxSizeMB,
                    maxWidthOrHeight: 1920,
                    useWebWorker: true,
                    fileType: file.type as string,
                })
                setUploadProgress(40)
            }

            // Create preview
            const reader = new FileReader()
            reader.onload = () => setPreview(reader.result as string)
            reader.readAsDataURL(fileToUpload)

            // Upload to backend
            setUploadProgress(50)
            const formData = new FormData()
            formData.append('file', fileToUpload, file.name)

            const response = await api.post('/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                onUploadProgress: (progressEvent: any) => {
                    const pct = Math.round((progressEvent.loaded * 50) / (progressEvent.total || 1)) + 50
                    setUploadProgress(pct)
                },
            })

            setUploadProgress(100)
            onChange(response.data.path)
        } catch (err: any) {
            setError(err?.response?.data?.message || 'Upload failed. Please try again.')
            setPreview(value || null)
        } finally {
            setIsUploading(false)
        }
    }, [maxSizeMB, onChange, value])

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: accept
            ? accept.reduce((acc: any, type: string) => {
                if (type.startsWith('.')) {
                    const mimeMap: Record<string, string> = {
                        '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png',
                        '.webp': 'image/webp', '.svg': 'image/svg+xml', '.gif': 'image/gif',
                        '.mp4': 'video/mp4', '.pdf': 'application/pdf',
                    }
                    const mime = mimeMap[type]
                    if (mime) acc[mime] = [type]
                }
                return acc
            }, {})
            : { 'image/*': ['.jpg', '.jpeg', '.png', '.webp', '.svg', '.gif'], 'video/mp4': ['.mp4'] },
        maxFiles: 1,
        disabled: isUploading,
    })

    const handleClear = (e: React.MouseEvent) => {
        e.stopPropagation()
        setPreview(null)
        onChange('')
    }

    const isVideo = preview?.startsWith('data:video') || value?.toLowerCase().endsWith('.mp4') || value?.toLowerCase().endsWith('.webm')
    const isImage = preview?.startsWith('data:image') || value?.toLowerCase().match(/\.(jpg|jpeg|png|webp|gif|svg)$/i)
    const isFile = preview?.startsWith('data:application') || value?.toLowerCase().endsWith('.pdf')

    return (
        <div className={className}>
            {label && <label className="text-sm font-semibold text-foreground/80 mb-2 block">{label}</label>}

            <div
                {...getRootProps()}
                className={`relative border-2 border-dashed rounded-lg transition-all cursor-pointer overflow-hidden ${
                    isDragActive
                        ? 'border-primary bg-primary/5'
                        : error
                            ? 'border-destructive/50 bg-destructive/5'
                            : 'border-border/50 hover:border-primary/50 bg-secondary/5'
                }`}
            >
                <input {...getInputProps()} />

                {preview || value ? (
                    <div className="relative group">
                        {isVideo ? (
                            <div className="h-40 flex flex-col items-center justify-center bg-black/5">
                                <Film className="h-10 w-10 text-muted-foreground" />
                                <span className="mt-2 text-sm text-muted-foreground font-medium">Video File</span>
                            </div>
                        ) : isFile ? (
                            <div className="h-40 flex flex-col items-center justify-center bg-black/5">
                                <File className="h-10 w-10 text-muted-foreground" />
                                <span className="mt-2 text-sm text-muted-foreground font-medium">Document File</span>
                                <span className="text-[10px] text-muted-foreground/60 max-w-[200px] truncate px-4">{value?.split('/').pop()}</span>
                            </div>
                        ) : (
                            <img
                                src={preview || value}
                                alt="Preview"
                                className="w-full h-40 object-cover"
                            />
                        )}
                        {/* Hover overlay */}
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-3">
                            <span className="text-white text-sm font-medium">Click or drop to replace</span>
                            <button
                                onClick={handleClear}
                                className="p-1.5 bg-destructive rounded-full text-white hover:bg-destructive/80"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-8 px-4">
                        {isUploading ? (
                            <>
                                <Loader2 className="h-8 w-8 text-primary animate-spin mb-3" />
                                <div className="w-full max-w-[200px] h-1.5 bg-secondary rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-primary rounded-full transition-all duration-300"
                                        style={{ width: `${uploadProgress}%` }}
                                    />
                                </div>
                                <span className="text-xs text-muted-foreground mt-2">{uploadProgress}%</span>
                            </>
                        ) : (
                            <>
                                <Upload className="h-8 w-8 text-muted-foreground mb-3" />
                                <p className="text-sm text-muted-foreground text-center">
                                    <span className="font-semibold text-foreground">Click to upload</span> or drag and drop
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    JPG, PNG, WebP, SVG, GIF, MP4 (max {maxSizeMB}MB)
                                </p>
                            </>
                        )}
                    </div>
                )}
            </div>

            {error && <p className="text-xs text-destructive mt-1.5">{error}</p>}
        </div>
    )
}

export default ImageUploader
