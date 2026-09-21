"use client"

import React, { useState, useEffect, useCallback } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Loader2, Search, Image as ImageIcon, Film, File, Check, Grid3X3, List } from 'lucide-react'
import api from '@/lib/api'
import VideoThumbnail from './VideoThumbnail'

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

interface MediaBrowserProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSelect: (url: string) => void
    accept?: string[]
}

export default function MediaBrowser({ open, onOpenChange, onSelect, accept }: MediaBrowserProps) {
    const [files, setFiles] = useState<MediaFile[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [selectedUrl, setSelectedUrl] = useState<string | null>(null)
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

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
        if (open) {
            // eslint-disable-next-line react-hooks/set-state-in-effect -- data fetch on dialog open
            fetchFiles()
            setSelectedUrl(null)
            setSearch('')
        }
    }, [open, fetchFiles])

    const filteredFiles = files.filter((f) => {
        if (search && !f.filename.toLowerCase().includes(search.toLowerCase())) return false
        if (accept && accept.length > 0) {
            const ext = '.' + f.filename.split('.').pop()?.toLowerCase()
            const mimeMatch = accept.some((a) => {
                if (a.startsWith('.')) return ext === a.toLowerCase()
                if (a.endsWith('/*')) return f.mime.startsWith(a.replace('/*', '/'))
                return f.mime === a
            })
            if (!mimeMatch) return false
        }
        return true
    })

    const handleSelect = () => {
        if (selectedUrl) {
            onSelect(selectedUrl)
            onOpenChange(false)
        }
    }

    const TypeIcon = ({ type }: { type: MediaFile['type'] }) => {
        switch (type) {
            case 'image': return <ImageIcon className="h-4 w-4" />
            case 'video': return <Film className="h-4 w-4" />
            default: return <File className="h-4 w-4" />
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[900px] max-h-[85vh] flex flex-col p-0">
                <DialogHeader className="px-6 pt-6 pb-4 border-b border-border">
                    <div className="flex items-center justify-between">
                        <DialogTitle>Media Library</DialogTitle>
                        <div className="flex items-center gap-2">
                            <Button
                                variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => setViewMode('grid')}
                            >
                                <Grid3X3 className="h-4 w-4" />
                            </Button>
                            <Button
                                variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => setViewMode('list')}
                            >
                                <List className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                    <div className="relative mt-3">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search files..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-9 bg-background border-border"
                        />
                    </div>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto p-6">
                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                        </div>
                    ) : filteredFiles.length === 0 ? (
                        <div className="text-center py-20 text-muted-foreground">
                            <p className="text-sm">No files found</p>
                        </div>
                    ) : viewMode === 'grid' ? (
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                            {filteredFiles.map((file) => (
                                <button
                                    key={file.path}
                                    type="button"
                                    onClick={() => setSelectedUrl(file.url)}
                                    className={`relative group aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                                        selectedUrl === file.url
                                            ? 'border-primary ring-2 ring-primary/20'
                                            : 'border-border hover:border-primary/50'
                                    }`}
                                >
                                    {file.type === 'image' ? (
                                        <img
                                            src={file.url}
                                            alt={file.filename}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : file.type === 'video' ? (
                                        <VideoThumbnail
                                            src={file.url}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-black/10 flex flex-col items-center justify-center gap-1">
                                            <File className="h-8 w-8 text-muted-foreground" />
                                            <span className="text-[9px] text-muted-foreground uppercase tracking-wider">File</span>
                                        </div>
                                    )}
                                    {selectedUrl === file.url && (
                                        <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                                            <div className="bg-primary rounded-full p-1">
                                                <Check className="h-4 w-4 text-primary-foreground" />
                                            </div>
                                        </div>
                                    )}
                                    <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <p className="text-white text-[10px] truncate">{file.filename}</p>
                                        <p className="text-white/60 text-[9px]">{file.size_formatted}</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div className="space-y-1">
                            {filteredFiles.map((file) => (
                                <button
                                    key={file.path}
                                    type="button"
                                    onClick={() => setSelectedUrl(file.url)}
                                    className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all text-left ${
                                        selectedUrl === file.url
                                            ? 'bg-primary/10 border border-primary/30'
                                            : 'hover:bg-secondary/50 border border-transparent'
                                    }`}
                                >
                                    {file.type === 'image' ? (
                                        <img
                                            src={file.url}
                                            alt={file.filename}
                                            className="h-10 w-10 rounded object-cover shrink-0"
                                        />
                                    ) : (
                                        <div className="h-10 w-10 rounded bg-secondary flex items-center justify-center shrink-0">
                                            <TypeIcon type={file.type} />
                                        </div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate">{file.filename}</p>
                                        <p className="text-xs text-muted-foreground">{file.size_formatted} &middot; {file.last_modified}</p>
                                    </div>
                                    {selectedUrl === file.url && (
                                        <Check className="h-4 w-4 text-primary shrink-0" />
                                    )}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <div className="px-6 py-4 border-t border-border flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">
                        {filteredFiles.length} file{filteredFiles.length !== 1 ? 's' : ''}
                        {search && ` matching "${search}"`}
                    </p>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={() => onOpenChange(false)} className="border-border">
                            Cancel
                        </Button>
                        <Button onClick={handleSelect} disabled={!selectedUrl} className="bg-primary text-[#14110b]">
                            Select
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
