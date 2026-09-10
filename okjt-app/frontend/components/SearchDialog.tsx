"use client"

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Loader2, FileText, Briefcase, FolderKanban, ArrowRight, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import api from '@/lib/api'
import type { SearchResult } from '@/types/api'

export default function SearchDialog() {
    const [open, setOpen] = useState(false)
    const [query, setQuery] = useState('')
    const [results, setResults] = useState<SearchResult | null>(null)
    const [loading, setLoading] = useState(false)
    const inputRef = useRef<HTMLInputElement>(null)
    const router = useRouter()

    const fetchResults = useCallback(async (q: string) => {
        if (q.trim().length < 2) {
            setResults(null)
            return
        }
        setLoading(true)
        try {
            const res = await api.get(`/search?q=${encodeURIComponent(q)}`)
            setResults(res.data)
        } catch {
            setResults(null)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        const timer = setTimeout(() => fetchResults(query), 300)
        return () => clearTimeout(timer)
    }, [query, fetchResults])

    // Clear the query/results as the dialog closes — adjust during render.
    const [prevOpen, setPrevOpen] = useState(open)
    if (open !== prevOpen) {
        setPrevOpen(open)
        if (!open) {
            setQuery('')
            setResults(null)
        }
    }

    useEffect(() => {
        if (!open) return
        const t = setTimeout(() => inputRef.current?.focus(), 100)
        return () => clearTimeout(t)
    }, [open])

    const totalResults = results
        ? results.services.length + results.insights.length + results.projects.length
        : 0

    const navigateTo = (path: string) => {
        router.push(path)
        setOpen(false)
    }

    const sections: { key: keyof SearchResult; label: string; icon: React.ReactNode; basePath: string }[] = [
        { key: 'services', label: 'Services', icon: <Briefcase className="w-4 h-4" />, basePath: '/services' },
        { key: 'insights', label: 'Insights', icon: <FileText className="w-4 h-4" />, basePath: '/insights' },
        { key: 'projects', label: 'Projects', icon: <FolderKanban className="w-4 h-4" />, basePath: '/projects' },
    ]

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9">
                    <Search className="h-4 w-4" />
                    <span className="sr-only">Search</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg p-0 gap-0 overflow-hidden">
                <div className="flex items-center border-b border-border px-4">
                    <Search className="h-4 w-4 text-muted-foreground shrink-0" />
                    <input
                        ref={inputRef}
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search services, insights, projects..."
                        className="flex-1 bg-transparent px-3 py-4 text-sm outline-none placeholder:text-muted-foreground"
                    />
                    {query && (
                        <button
                            onClick={() => { setQuery(''); setResults(null) }}
                            className="text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    )}
                </div>

                <div className="max-h-[60vh] overflow-y-auto">
                    {loading && (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                        </div>
                    )}

                    {!loading && query.length >= 2 && results && totalResults === 0 && (
                        <div className="py-12 text-center">
                            <p className="text-muted-foreground text-sm">No results found for &ldquo;{query}&rdquo;</p>
                        </div>
                    )}

                    {!loading && query.length < 2 && (
                        <div className="py-12 text-center">
                            <p className="text-muted-foreground text-sm">Type at least 2 characters to search</p>
                        </div>
                    )}

                    {!loading && results && totalResults > 0 && (
                        <div className="py-2">
                            {sections.map(({ key, label, icon, basePath }) => {
                                const items = results[key]
                                if (items.length === 0) return null
                                return (
                                    <div key={key}>
                                        <div className="px-4 py-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                            {icon}
                                            {label}
                                            <span className="text-muted-foreground/50">({items.length})</span>
                                        </div>
                                        {items.map((item: any) => (
                                            <button
                                                key={item.id}
                                                onClick={() => navigateTo(`${basePath}/${item.slug}`)}
                                                className="w-full px-4 py-3 flex items-start gap-3 hover:bg-accent/50 transition-colors text-left group"
                                            >
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                                                        {item.title}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground truncate mt-0.5">
                                                        {item.category}
                                                        {item.client_name && ` · ${item.client_name}`}
                                                        {item.description && ` · ${item.description.slice(0, 80)}`}
                                                        {item.excerpt && ` · ${item.excerpt.slice(0, 80)}`}
                                                    </p>
                                                </div>
                                                <ArrowRight className="w-3 h-3 text-muted-foreground/40 group-hover:text-primary transition-colors mt-1 shrink-0" />
                                            </button>
                                        ))}
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>

                {results && totalResults > 0 && (
                    <div className="border-t border-border px-4 py-2.5 text-xs text-muted-foreground">
                        {totalResults} result{totalResults !== 1 ? 's' : ''} found
                    </div>
                )}
            </DialogContent>
        </Dialog>
    )
}
