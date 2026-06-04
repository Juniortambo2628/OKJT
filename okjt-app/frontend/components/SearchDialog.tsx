"use client"

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { Search, X, ArrowRight, FileText, Briefcase, FolderOpen } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'
import { cn } from '@/lib/utils'

interface SearchResult {
    id: number
    title: string
    slug: string
    category?: string
    description?: string
    excerpt?: string
    client_name?: string
}

const SearchDialog = () => {
    const [isOpen, setIsOpen] = useState(false)
    const [query, setQuery] = useState('')
    const [results, setResults] = useState<{ services: SearchResult[], insights: SearchResult[], case_studies: SearchResult[] }>({ services: [], insights: [], case_studies: [] })
    const [isSearching, setIsSearching] = useState(false)
    const [selectedIndex, setSelectedIndex] = useState(0)
    const [searchType, setSearchType] = useState<'all' | 'services' | 'insights' | 'case_studies'>('all')
    const inputRef = useRef<HTMLInputElement>(null)
    const debounceRef = useRef<NodeJS.Timeout | undefined>(undefined)
    const router = useRouter()

    // Cmd+K listener
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault()
                setIsOpen(true)
            }
            if (e.key === 'Escape') setIsOpen(false)
        }
        window.addEventListener('keydown', handler)
        return () => window.removeEventListener('keydown', handler)
    }, [])

    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 100)
        } else {
            setQuery('')
            setResults({ services: [], insights: [], case_studies: [] })
            setSelectedIndex(0)
        }
    }, [isOpen])

    const search = useCallback(async (q: string, type: string) => {
        if (q.length < 2) {
            setResults({ services: [], insights: [], case_studies: [] })
            return
        }
        setIsSearching(true)
        try {
            const { data } = await api.get(`/search?q=${encodeURIComponent(q)}&type=${type}`)
            setResults(data)
            setSelectedIndex(0)
        } catch { }
        setIsSearching(false)
    }, [])

    useEffect(() => {
        if (query.length >= 2) {
            search(query, searchType)
        }
    }, [searchType])

    const handleInput = (val: string) => {
        setQuery(val)
        if (debounceRef.current) clearTimeout(debounceRef.current)
        debounceRef.current = setTimeout(() => search(val, searchType), 250)
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (!allResults.length) return

        if (e.key === 'ArrowDown') {
            e.preventDefault()
            setSelectedIndex(prev => (prev + 1) % allResults.length)
        } else if (e.key === 'ArrowUp') {
            e.preventDefault()
            setSelectedIndex(prev => (prev - 1 + allResults.length) % allResults.length)
        } else if (e.key === 'Enter') {
            e.preventDefault()
            const selected = allResults[selectedIndex]
            if (selected) {
                router.push(selected.href)
                setIsOpen(false)
            }
        }
    }

    const allResults = [
        ...results.services.map(r => ({ ...r, type: 'service' as const, href: `/services/${r.slug}` })),
        ...results.insights.map(r => ({ ...r, type: 'insight' as const, href: `/insights/${r.slug}` })),
        ...results.case_studies.map(r => ({ ...r, type: 'case_study' as const, href: `/case-studies/${r.slug}` })),
    ]

    const typeIcons = { service: Briefcase, insight: FileText, case_study: FolderOpen }
    const typeLabels = { service: 'Service', insight: 'Insight', case_study: 'Case Study' }

    return (
        <>
            {/* Trigger button (for Navbar) */}
            <button
                onClick={() => setIsOpen(true)}
                className="flex items-center gap-2 text-foreground/90 hover:text-primary transition-colors text-sm"
                aria-label="Search"
            >
                <Search size={18} />
                <span className="hidden md:inline text-[10px] font-medium text-muted-foreground border border-border rounded px-1.5 py-0.5">⌘K</span>
            </button>

            {/* Dialog overlay */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4"
                        onClick={() => setIsOpen(false)}
                    >
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
                        <motion.div
                            initial={{ opacity: 0, y: -20, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -20, scale: 0.95 }}
                            transition={{ duration: 0.2 }}
                            className={cn(
                                "relative w-full max-w-2xl border rounded-xl shadow-2xl overflow-hidden",
                                "bg-background border-border"
                            )}
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Search input */}
                            <div className="flex items-center gap-3 px-5 py-4 border-b border-border">
                                <Search size={20} className="text-primary shrink-0" />
                                <input
                                    ref={inputRef}
                                    type="text"
                                    placeholder="Search services, insights, case studies..."
                                    value={query}
                                    onChange={(e) => handleInput(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    aria-autocomplete="list"
                                    aria-controls="search-results"
                                    aria-activedescendant={allResults.length > 0 ? `result-${selectedIndex}` : undefined}
                                    className="flex-1 bg-transparent text-foreground text-lg outline-none placeholder:text-muted-foreground"
                                />
                                <button onClick={() => setIsOpen(false)} className="text-muted-foreground hover:text-foreground">
                                    <X size={18} />
                                </button>
                            </div>

                            {/* Filters */}
                            <div className="flex items-center gap-2 px-5 py-2 border-b border-border bg-secondary/5">
                                {[
                                    { id: 'all', label: 'All' },
                                    { id: 'services', label: 'Services' },
                                    { id: 'insights', label: 'Insights' },
                                    { id: 'case_studies', label: 'Case Studies' }
                                ].map(f => (
                                    <button
                                        key={f.id}
                                        onClick={() => setSearchType(f.id as any)}
                                        className={cn(
                                            "text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border transition-all",
                                            searchType === f.id 
                                                ? 'bg-primary border-primary text-white' 
                                                : 'border-border text-muted-foreground hover:border-border/50 hover:text-foreground'
                                        )}
                                    >
                                        {f.label}
                                    </button>
                                ))}
                            </div>

                            {/* Results */}
                            <div className="max-h-[400px] overflow-y-auto">
                                {query.length < 2 ? (
                                    <div className="px-5 py-10 text-center text-muted-foreground text-sm">
                                        Start typing to search across all content...
                                    </div>
                                ) : isSearching ? (
                                    <div className="px-5 py-10 text-center text-muted-foreground text-sm">
                                        <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-3" />
                                        Searching...
                                    </div>
                                ) : allResults.length === 0 ? (
                                    <div className="px-5 py-10 text-center text-muted-foreground text-sm">
                                        No results found for &ldquo;{query}&rdquo;
                                    </div>
                                ) : (
                                    <div className="py-2" id="search-results" role="listbox">
                                        {allResults.map((item, idx) => {
                                            const Icon = typeIcons[item.type]
                                            return (
                                                <Link
                                                    id={`result-${idx}`}
                                                    key={`${item.type}-${item.id}`}
                                                    href={item.href}
                                                    role="option"
                                                    aria-selected={idx === selectedIndex}
                                                    onClick={() => setIsOpen(false)}
                                                    className={cn(
                                                        "flex items-center gap-4 px-5 py-3 transition-colors rounded-lg mx-2",
                                                        idx === selectedIndex ? 'bg-primary/10' : 'hover:bg-secondary'
                                                    )}
                                                >
                                                    <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
                                                        <Icon size={16} />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-foreground font-medium text-sm truncate">{item.title}</p>
                                                        <p className="text-muted-foreground text-xs truncate">
                                                            {item.category || item.client_name}
                                                        </p>
                                                    </div>
                                                    <span className="text-[10px] bg-secondary text-muted-foreground px-2 py-0.5 rounded-full font-bold uppercase shrink-0">
                                                        {typeLabels[item.type]}
                                                    </span>
                                                    <ArrowRight size={14} className="text-muted-foreground shrink-0" />
                                                </Link>
                                            )
                                        })}
                                    </div>
                                )}
                            </div>

                            {/* Footer */}
                            <div className="px-5 py-3 border-t border-border flex items-center justify-between text-[10px] text-muted-foreground">
                                <span>↑↓ Navigate · ↵ Open · ESC Close</span>
                                <span>OKJTech Search</span>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    )
}

export default SearchDialog
