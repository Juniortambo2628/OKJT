"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'

export default function SearchDialog() {
    const [open, setOpen] = useState(false)
    const [query, setQuery] = useState('')
    const router = useRouter()

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        if (query.trim().length >= 2) {
            router.push(`/search?q=${encodeURIComponent(query.trim())}`)
            setOpen(false)
            setQuery('')
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9">
                    <Search className="h-4 w-4" />
                    <span className="sr-only">Search</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <form onSubmit={handleSearch} className="flex gap-2">
                    <input
                        autoFocus
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search services, insights, projects..."
                        className="flex-1 bg-background border border-border rounded-md px-3 py-2 text-sm"
                    />
                    <Button type="submit" size="sm">Search</Button>
                </form>
            </DialogContent>
        </Dialog>
    )
}
