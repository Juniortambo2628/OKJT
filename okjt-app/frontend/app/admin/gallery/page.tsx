"use client"

import React, { useState, useEffect, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import imageCompression from 'browser-image-compression'
import { AxiosError, AxiosProgressEvent } from 'axios'
import AdminLayout from '@/components/admin/AdminLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Loader2, Search, Image as ImageIcon, Film, File, Download, Trash2, Grid3X3, List, Eye, Upload, X } from 'lucide-react'
import api from '@/lib/api'
import { useToast } from '@/hooks/use-toast'

interface UploadJob {
    id: string
    name: string
    size: number
    progress: number
    status: 'pending' | 'uploading' | 'done' | 'error'
    error?: string
}

const MAX_SIZE_MB = 20
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024

interface MediaFile {
    path: string
    url: string
    filename: string
    mime: string
    size: number
    size_formatted: string
    type: 'image' | 'video' | 'file'
    last_modified: string
}

export default function AdminGalleryPage() {
    const [files, setFiles] = useState<MediaFile[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
    const [previewFile, setPreviewFile] = useState<MediaFile | null>(null)
    const [deleting, setDeleting] = useState<string | null>(null)
    const [uploads, setUploads] = useState<UploadJob[]>([])
    const { toast } = useToast()

    const fetchFiles = useCallback(async () => {
        setLoading(true)
        try {
            const res = await api.get('/media')
            setFiles(res.data)
        } catch {
            setFiles([])
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- data fetch on mount
        fetchFiles()
    }, [fetchFiles])

    const uploadOne = useCallback(async (file: File, jobId: string): Promise<boolean> => {
        const updateJob = (patch: Partial<UploadJob>) => {
            setUploads((prev) => prev.map((j) => (j.id === jobId ? { ...j, ...patch } : j)))
        }

        try {
            let fileToUpload: File = file
            const isImage = file.type.startsWith('image/') && !file.type.includes('svg')

            if (isImage) {
                updateJob({ status: 'uploading', progress: 10 })
                fileToUpload = await imageCompression(file, {
                    maxSizeMB: MAX_SIZE_MB,
                    maxWidthOrHeight: 1920,
                    useWebWorker: true,
                    fileType: file.type,
                })
                updateJob({ progress: 40 })
            } else if (file.size > MAX_SIZE_BYTES) {
                throw new Error(`File exceeds ${MAX_SIZE_MB} MB`)
            }

            if (fileToUpload.size > MAX_SIZE_BYTES) {
                throw new Error(`File exceeds ${MAX_SIZE_MB} MB after compression`)
            }

            const formData = new FormData()
            formData.append('file', fileToUpload, file.name)

            await api.post('/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                onUploadProgress: (e: AxiosProgressEvent) => {
                    const pct = Math.round((e.loaded * 50) / (e.total || 1)) + 50
                    updateJob({ status: 'uploading', progress: pct })
                },
            })

            updateJob({ status: 'done', progress: 100 })
            return true
        } catch (err: unknown) {
            const apiError = err as AxiosError<{ message?: string }>
            const message =
                apiError.response?.data?.message ||
                (err instanceof Error ? err.message : 'Upload failed')
            updateJob({ status: 'error', error: message })
            return false
        }
    }, [])

    const onDrop = useCallback(async (accepted: File[]) => {
        if (accepted.length === 0) return

        const jobs: UploadJob[] = accepted.map((f) => ({
            id: `${Date.now()}-${f.name}-${Math.random().toString(36).slice(2, 8)}`,
            name: f.name,
            size: f.size,
            progress: 0,
            status: 'pending',
        }))

        setUploads((prev) => [...prev, ...jobs])

        const outcomes = await Promise.all(accepted.map((f, i) => uploadOne(f, jobs[i].id)))
        const succeeded = outcomes.filter(Boolean).length
        const failed = outcomes.length - succeeded

        if (succeeded > 0) {
            toast({
                title: `Uploaded ${succeeded} file${succeeded === 1 ? '' : 's'}`,
                description: failed > 0 ? `${failed} failed — see list.` : undefined,
            })
            fetchFiles()
        } else if (failed > 0) {
            toast({ variant: 'destructive', title: `${failed} upload${failed === 1 ? '' : 's'} failed` })
        }

        if (succeeded > 0 && failed === 0) {
            setTimeout(() => {
                setUploads((prev) => prev.filter((j) => !jobs.some((n) => n.id === j.id)))
            }, 2000)
        }
    }, [uploadOne, toast, fetchFiles])

    const { getRootProps, getInputProps, isDragActive, open: openFilePicker } = useDropzone({
        onDrop,
        noClick: true,
        noKeyboard: true,
        accept: {
            'image/*': ['.jpg', '.jpeg', '.png', '.webp', '.svg', '.gif'],
            'video/mp4': ['.mp4'],
        },
    })

    const dismissJob = (id: string) => {
        setUploads((prev) => prev.filter((j) => j.id !== id))
    }

    const filteredFiles = files.filter((f) => {
        if (search && !f.filename.toLowerCase().includes(search.toLowerCase())) return false
        return true
    })

    const handleDownload = async (file: MediaFile) => {
        try {
            const res = await fetch(file.url)
            const blob = await res.blob()
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = file.filename
            document.body.appendChild(a)
            a.click()
            window.URL.revokeObjectURL(url)
            document.body.removeChild(a)
        } catch {
            toast({ variant: 'destructive', title: 'Download failed' })
        }
    }

    const handleDelete = async (file: MediaFile) => {
        if (!confirm(`Delete "${file.filename}"? This cannot be undone.`)) return
        setDeleting(file.path)
        try {
            await api.delete('/upload', { data: { path: file.path } })
            setFiles((prev) => prev.filter((f) => f.path !== file.path))
            toast({ title: 'Deleted', description: `${file.filename} has been removed.` })
            if (previewFile?.path === file.path) setPreviewFile(null)
        } catch {
            toast({ variant: 'destructive', title: 'Delete failed' })
        } finally {
            setDeleting(null)
        }
    }

    const images = filteredFiles.filter((f) => f.type === 'image')
    const videos = filteredFiles.filter((f) => f.type === 'video')
    const otherFiles = filteredFiles.filter((f) => f.type === 'file')

    return (
        <AdminLayout>
            <div className="space-y-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Media Gallery</h1>
                        <p className="text-muted-foreground">Browse, preview, and download all uploaded digital assets.</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button onClick={openFilePicker} className="gap-2">
                            <Upload className="h-4 w-4" />
                            Upload
                        </Button>
                        <Button
                            variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                            size="icon"
                            onClick={() => setViewMode('grid')}
                        >
                            <Grid3X3 className="h-4 w-4" />
                        </Button>
                        <Button
                            variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                            size="icon"
                            onClick={() => setViewMode('list')}
                        >
                            <List className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                <div
                    {...getRootProps()}
                    className={`border-2 border-dashed rounded-xl transition-colors ${
                        isDragActive
                            ? 'border-primary bg-primary/5'
                            : 'border-border/50 bg-secondary/5'
                    } px-6 py-8 text-center cursor-pointer`}
                    onClick={openFilePicker}
                >
                    <input {...getInputProps()} />
                    <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
                    <p className="text-sm">
                        <span className="font-semibold text-foreground">Click to upload</span>{' '}
                        <span className="text-muted-foreground">or drag & drop images and videos here</span>
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                        JPG, PNG, WebP, SVG, GIF, MP4 — up to {MAX_SIZE_MB} MB each. Multiple files supported.
                    </p>
                </div>

                {uploads.length > 0 && (
                    <div className="space-y-2 border border-border rounded-xl p-3 bg-background">
                        <div className="flex items-center justify-between mb-1">
                            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                Uploads ({uploads.length})
                            </p>
                            <button
                                onClick={() => setUploads((prev) => prev.filter((j) => j.status === 'uploading' || j.status === 'pending'))}
                                className="text-xs text-muted-foreground hover:text-foreground"
                            >
                                Clear finished
                            </button>
                        </div>
                        {uploads.map((job) => (
                            <div key={job.id} className="flex items-center gap-3 text-sm">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-2 mb-1">
                                        <p className="truncate text-xs font-medium">{job.name}</p>
                                        <span className={`text-[10px] shrink-0 ${
                                            job.status === 'error' ? 'text-destructive'
                                                : job.status === 'done' ? 'text-emerald-600 dark:text-emerald-400'
                                                : 'text-muted-foreground'
                                        }`}>
                                            {job.status === 'error' ? (job.error || 'Failed')
                                                : job.status === 'done' ? 'Done'
                                                : `${job.progress}%`}
                                        </span>
                                    </div>
                                    <div className="h-1 bg-secondary rounded-full overflow-hidden">
                                        <div
                                            className={`h-full transition-all ${
                                                job.status === 'error' ? 'bg-destructive'
                                                    : job.status === 'done' ? 'bg-emerald-500'
                                                    : 'bg-primary'
                                            }`}
                                            style={{ width: `${job.status === 'done' ? 100 : job.progress}%` }}
                                        />
                                    </div>
                                </div>
                                <button
                                    onClick={() => dismissJob(job.id)}
                                    className="text-muted-foreground hover:text-foreground shrink-0"
                                    aria-label="Dismiss"
                                >
                                    <X className="h-3.5 w-3.5" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                <div className="relative max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search files..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9 bg-background border-border"
                    />
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-32">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                ) : filteredFiles.length === 0 ? (
                    <div className="text-center py-32 border-2 border-dashed rounded-xl">
                        <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
                        <p className="text-muted-foreground">No files uploaded yet</p>
                    </div>
                ) : viewMode === 'grid' ? (
                    <div className="space-y-10">
                        {images.length > 0 && (
                            <div>
                                <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">
                                    Images ({images.length})
                                </h3>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                    {images.map((file) => (
                                        <div key={file.path} className="group relative aspect-square rounded-xl overflow-hidden border border-border bg-secondary/5">
                                            <img src={file.url} alt={file.filename} className="w-full h-full object-cover" />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all flex flex-col justify-end p-3">
                                                <p className="text-white text-xs font-medium truncate mb-1">{file.filename}</p>
                                                <p className="text-white/50 text-[10px] mb-2">{file.size_formatted}</p>
                                                <div className="flex gap-1.5">
                                                    <Button size="icon" className="h-7 w-7 bg-white/20 hover:bg-white/30 text-white" onClick={() => setPreviewFile(file)}>
                                                        <Eye className="h-3.5 w-3.5" />
                                                    </Button>
                                                    <Button size="icon" className="h-7 w-7 bg-white/20 hover:bg-white/30 text-white" onClick={() => handleDownload(file)}>
                                                        <Download className="h-3.5 w-3.5" />
                                                    </Button>
                                                    <Button size="icon" className="h-7 w-7 bg-destructive/60 hover:bg-destructive text-white" onClick={() => handleDelete(file)} disabled={deleting === file.path}>
                                                        {deleting === file.path ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {videos.length > 0 && (
                            <div>
                                <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">
                                    Videos ({videos.length})
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                    {videos.map((file) => (
                                        <div key={file.path} className="group relative rounded-xl overflow-hidden border border-border bg-secondary/5">
                                            <div className="aspect-video bg-black/10 flex items-center justify-center">
                                                <Film className="h-12 w-12 text-muted-foreground/30" aria-hidden="true" />
                                            </div>
                                            <div className="p-3 flex items-center justify-between">
                                                <div className="min-w-0">
                                                    <p className="text-sm font-medium truncate">{file.filename}</p>
                                                    <p className="text-xs text-muted-foreground">{file.size_formatted}</p>
                                                </div>
                                                <div className="flex gap-1.5 shrink-0">
                                                    <Button size="icon" className="h-8 w-8" variant="ghost" onClick={() => handleDownload(file)}>
                                                        <Download className="h-4 w-4" />
                                                    </Button>
                                                    <Button size="icon" className="h-8 w-8" variant="ghost" onClick={() => handleDelete(file)} disabled={deleting === file.path}>
                                                        {deleting === file.path ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4 text-destructive" />}
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {otherFiles.length > 0 && (
                            <div>
                                <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">
                                    Other Files ({otherFiles.length})
                                </h3>
                                <div className="space-y-2">
                                    {otherFiles.map((file) => (
                                        <div key={file.path} className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-secondary/50 transition-colors">
                                            <div className="p-2 bg-secondary rounded-lg"><File className="h-5 w-5 text-muted-foreground" /></div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium truncate">{file.filename}</p>
                                                <p className="text-xs text-muted-foreground">{file.size_formatted} &middot; {file.last_modified}</p>
                                            </div>
                                            <Button size="icon" variant="ghost" onClick={() => handleDownload(file)}><Download className="h-4 w-4" /></Button>
                                            <Button size="icon" variant="ghost" onClick={() => handleDelete(file)} disabled={deleting === file.path}>
                                                {deleting === file.path ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4 text-destructive" />}
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="space-y-1 border border-border rounded-xl overflow-hidden">
                        {filteredFiles.map((file) => (
                            <div key={file.path} className="flex items-center gap-3 p-3 hover:bg-secondary/50 transition-colors border-b border-border last:border-b-0">
                                {file.type === 'image' ? (
                                    <img src={file.url} alt={file.filename} className="h-10 w-10 rounded object-cover shrink-0" />
                                ) : (
                                    <div className="h-10 w-10 rounded bg-secondary flex items-center justify-center shrink-0">
                                        {file.type === 'video' ? <Film className="h-5 w-5 text-muted-foreground" /> : <File className="h-5 w-5 text-muted-foreground" />}
                                    </div>
                                )}
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate">{file.filename}</p>
                                    <p className="text-xs text-muted-foreground">{file.size_formatted} &middot; {file.last_modified}</p>
                                </div>
                                <div className="flex gap-1 shrink-0">
                                    {file.type === 'image' && (
                                        <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setPreviewFile(file)}>
                                            <Eye className="h-4 w-4" />
                                        </Button>
                                    )}
                                    <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleDownload(file)}>
                                        <Download className="h-4 w-4" />
                                    </Button>
                                    <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleDelete(file)} disabled={deleting === file.path}>
                                        {deleting === file.path ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4 text-destructive" />}
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {previewFile && (
                    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-8" onClick={() => setPreviewFile(null)}>
                        <div className="relative max-w-4xl max-h-full" onClick={(e) => e.stopPropagation()}>
                            <img src={previewFile.url} alt={previewFile.filename} className="max-w-full max-h-[80vh] rounded-lg shadow-2xl" />
                            <p className="text-white/70 text-xs text-center mt-3">{previewFile.filename} &middot; {previewFile.size_formatted}</p>
                            <button onClick={() => setPreviewFile(null)} className="absolute -top-3 -right-3 bg-background rounded-full p-2 shadow-lg">
                                <span className="sr-only">Close</span>
                                <span className="text-foreground text-lg leading-none">&times;</span>
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    )
}