"use client"

import React from 'react'
import { Linkedin, Twitter, Link2, Check } from 'lucide-react'
import { useState } from 'react'

interface SocialShareProps {
    title: string
    slug: string
    type: 'insights' | 'projects'
}

const SocialShare = ({ title, slug, type }: SocialShareProps) => {
    const [copied, setCopied] = useState(false)
    const url = typeof window !== 'undefined' ? `${window.location.origin}/${type}/${slug}` : ''

    const shareLinkedIn = () => {
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank', 'width=600,height=400')
    }

    const shareTwitter = () => {
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`, '_blank', 'width=600,height=400')
    }

    const copyLink = async () => {
        await navigator.clipboard.writeText(url)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <div className="flex items-center gap-2">
            <span className="text-xs text-white/40 font-bold uppercase tracking-wider mr-1">Share</span>
            <button onClick={shareLinkedIn} className="p-2 rounded-lg bg-white/5 border border-white/10 text-white/60 hover:text-[#0077B5] hover:bg-[#0077B5]/10 hover:border-[#0077B5]/30 transition-all" title="Share on LinkedIn">
                <Linkedin size={16} />
            </button>
            <button onClick={shareTwitter} className="p-2 rounded-lg bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 hover:border-white/30 transition-all" title="Share on X">
                <Twitter size={16} />
            </button>
            <button onClick={copyLink} className="p-2 rounded-lg bg-white/5 border border-white/10 text-white/60 hover:text-primary hover:bg-primary/10 hover:border-primary/30 transition-all" title="Copy link">
                {copied ? <Check size={16} className="text-emerald-400" /> : <Link2 size={16} />}
            </button>
        </div>
    )
}

export default SocialShare
