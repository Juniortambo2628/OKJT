"use client"

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Menu, X, ChevronDown, Briefcase, BookOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'
import PrimaryButton from '@/components/PrimaryButton'
import { cn } from '@/lib/utils'
import SearchDialog from './SearchDialog'
import { ThemeToggle } from './ThemeToggle'
import { useApi } from '@/hooks/use-api'
import { useSettings } from '@/hooks/use-settings'
import { useTheme } from 'next-themes'

const Navbar = () => {
    const { theme } = useTheme()
    const { branding, getSetting, isLoading: isSettingsLoading } = useSettings()
    const { data: services } = useApi('/services')
    const { data: projects } = useApi('/projects')
    const [isScrolled, setIsScrolled] = useState(false)
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const [activeMegaMenu, setActiveMegaMenu] = useState<'services' | 'work' | null>(null)
    const [mounted, setMounted] = useState(false)

    const logoWhiteBg = branding.logo_light
    const logoBlackBg = branding.logo_dark
    
    // Stabilize logo for hydration
    const [logo, setLogo] = useState(logoWhiteBg)
    
    useEffect(() => {
        setMounted(true)
    }, [])

    useEffect(() => {
        if (mounted) {
            setLogo(theme === 'light' ? logoWhiteBg : logoBlackBg)
        }
    }, [theme, mounted, logoWhiteBg, logoBlackBg])
    
    const navLinksJson = getSetting('main_nav_links', '[]')

    const navLinks = React.useMemo<{name: string, href: string}[]>(() => {
        try {
            if (navLinksJson) {
                if (typeof navLinksJson === 'string') {
                    const parsed = JSON.parse(navLinksJson)
                    if (Array.isArray(parsed) && parsed.length > 0) return parsed
                } else if (Array.isArray(navLinksJson)) {
                    return navLinksJson as any[]
                }
            }
        } catch (e) {
            console.error("Failed to parse nav links", e)
        }
        return [
            { name: 'About', href: '/about' },
            { name: 'Contact', href: '/contact' },
        ]
    }, [navLinksJson])

    // Core public routes exposed in the navbar (mega menus handle Services/Work dropdowns)
    const coreNavLinks = React.useMemo(() => {
        const defaults = [
            { name: 'About', href: '/about' },
            { name: 'Contact', href: '/contact' },
        ]
        // Merge user-defined links while avoiding duplicates on core routes
        const merged = [...defaults]
        navLinks.forEach((link) => {
            if (!merged.some((m) => m.href === link.href)) {
                merged.push(link)
            }
        })
        return merged
    }, [navLinks])

    // Group services by Pillar for mega menu
    const dynamicServiceCategories = React.useMemo(() => {
        if (!services || !Array.isArray(services)) return []
        
        const pillarGroups: Record<number, { title: string, href: string, items: any[] }> = {}
        const legacyCategories: Record<string, any[]> = {}

        services.forEach((s: any) => {
            if (s.pillar) {
                const p = s.pillar
                if (!pillarGroups[p.id]) {
                    pillarGroups[p.id] = {
                        title: p.title,
                        href: `/our-approach/${p.slug}`,
                        items: []
                    }
                }
                pillarGroups[p.id].items.push({ name: s.title, href: `/services/${s.slug}` })
            } else {
                if (!legacyCategories[s.category]) {
                    legacyCategories[s.category] = []
                }
                legacyCategories[s.category].push({ name: s.title, href: `/services/${s.slug}` })
            }
        })

        const result = Object.values(pillarGroups)
        
        // Add legacy categories as backfills if any
        Object.entries(legacyCategories).forEach(([title, items]) => {
            result.push({
                title,
                href: `/services?category=${encodeURIComponent(title)}`,
                items
            })
        })

        return result
    }, [services])

    // Flagship projects for Our Work mega menu
    const flagshipProjects = React.useMemo(() => {
        if (!projects || !Array.isArray(projects)) return []
        return projects.filter((p: any) => p.type === 'flagship' && p.is_active).slice(0, 5).map((p: any) => ({
            name: p.title,
            href: `/projects/${p.slug}`
        }))
    }, [projects])

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 20)
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    return (
        <nav
            className={cn(
                "fixed top-0 left-0 right-0 z-50 transition-all duration-700 px-6",
                isScrolled 
                    ? "bg-background/40 backdrop-blur-xl border-b-[0.5px] border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.1)] py-3" 
                    : "bg-transparent py-5"
            )}
            onMouseLeave={() => setActiveMegaMenu(null)}
        >
            <div className="max-w-[1400px] mx-auto flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2 relative z-50 shrink-0">
                    {mounted ? (
                        <Image
                            src={logo}
                            alt="OKJTech Logo"
                            width={180}
                            height={45}
                            className="h-10 md:h-12 w-auto object-contain"
                            priority
                        />
                    ) : (
                        <div className="h-10 md:h-12 w-40 animate-pulse bg-muted/20 rounded" />
                    )}
                </Link>

                <a href="#content" className="skip-to-content">
                    Skip to content
                </a>

                {/* Desktop Menu */}
                <div className="hidden lg:flex items-center gap-4 xl:gap-6">
                    {/* Services Dropdown Trigger */}
                    <button
                        className="text-[12px] font-bold uppercase tracking-widest hover:text-primary transition-colors text-foreground/90 flex items-center gap-1"
                        onMouseEnter={() => setActiveMegaMenu('services')}
                        aria-label="Services Menu"
                        aria-haspopup="true"
                        aria-expanded={activeMegaMenu === 'services'}
                    >
                        Services <ChevronDown className="h-3 w-3" />
                    </button>
                    
                    {/* Our Work Dropdown Trigger */}
                    <button
                        className="text-[12px] font-bold uppercase tracking-widest hover:text-primary transition-colors text-foreground/90 flex items-center gap-1"
                        onMouseEnter={() => setActiveMegaMenu('work')}
                        aria-label="Our Work Menu"
                        aria-haspopup="true"
                        aria-expanded={activeMegaMenu === 'work'}
                    >
                        Our Work <ChevronDown className="h-3 w-3" />
                    </button>

                    {coreNavLinks.map((link) => (
                        <Link
                            key={link.name}
                            href={link.href}
                            className="text-[12px] font-bold uppercase tracking-widest hover:text-primary transition-colors text-foreground/90"
                        >
                            {link.name}
                        </Link>
                    ))}

                    <div className="h-6 w-[1px] bg-border/50" />
                    <SearchDialog />
                    <ThemeToggle />
                    <div className="h-6 w-[1px] bg-border/50" />
                    <PrimaryButton href="/contact" size="sm" showArrow>
                        Start a Project
                    </PrimaryButton>
                </div>

                {/* Mobile Toggle */}
                <button
                    className="lg:hidden p-2 text-foreground"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    aria-label="Toggle menu"
                >
                    {isMobileMenuOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
                </button>
            </div>

            {/* Services Mega Menu */}
            {activeMegaMenu === 'services' && dynamicServiceCategories.length > 0 && (
                <div
                    className="hidden lg:block absolute top-[100%] left-1/2 -translate-x-1/2 w-full max-w-[820px] bg-background rounded-2xl border border-border shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] transition-all overflow-hidden mt-4"
                    onMouseEnter={() => setActiveMegaMenu('services')}
                    onMouseLeave={() => setActiveMegaMenu(null)}
                >
                    <div className="flex">
                        {/* Left Column (Featured) */}
                        <div className="w-[28%] bg-secondary/20 p-6 border-r border-border flex flex-col justify-between">
                            <div>
                                <Briefcase className="h-5 w-5 text-primary mb-4" />
                                <h3 className="text-lg font-bold tracking-tight text-foreground mb-2">Need engineering advice?</h3>
                                <p className="text-muted-foreground text-xs mb-6 leading-relaxed">Speak directly with an experienced engineer.</p>
                            </div>
                            <div className="space-y-2">
                                <Button className="w-full bg-[#14110b] text-white hover:bg-[#14110b]/90 rounded-xl py-4 flex items-center justify-start gap-2" asChild>
                                    <Link href="/services">
                                        <div className="h-7 w-7 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                                            <Briefcase className="h-3.5 w-3.5 text-primary" />
                                        </div>
                                        <span className="font-semibold text-xs">View All Services</span>
                                    </Link>
                                </Button>
                                <Button className="w-full bg-white/5 text-foreground hover:bg-white/10 rounded-xl py-4 flex items-center justify-start gap-2" asChild>
                                    <Link href="/contact">
                                        <span className="font-semibold text-xs pl-9">Speak with an Expert</span>
                                    </Link>
                                </Button>
                            </div>
                        </div>
                        
                        {/* Right Columns (Links) — 3-col grid for compactness */}
                        <div className="w-[72%] p-6 grid grid-cols-3 gap-x-6 gap-y-6">
                            {dynamicServiceCategories.map((cat) => (
                                <div key={cat.title}>
                                    <h4 className="text-[9px] font-bold text-primary uppercase tracking-widest mb-2">{cat.title}</h4>
                                    <ul className="space-y-0.5">
                                        {cat.items.map((item) => (
                                            <li key={item.name}>
                                                <Link href={item.href} className="block group p-2 -mx-2 rounded-md hover:bg-secondary/50 transition-colors">
                                                    <div className="font-semibold text-foreground text-xs">{item.name}</div>
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Our Work Mega Menu */}
            {activeMegaMenu === 'work' && (
                <div
                    className="hidden lg:block absolute top-[100%] left-1/2 -translate-x-1/2 w-full max-w-[820px] bg-background rounded-2xl border border-border shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] transition-all overflow-hidden mt-4"
                    onMouseEnter={() => setActiveMegaMenu('work')}
                    onMouseLeave={() => setActiveMegaMenu(null)}
                >
                    <div className="flex">
                        {/* Left Column (Featured) */}
                        <div className="w-[28%] bg-secondary/20 p-6 border-r border-border flex flex-col justify-between">
                            <div>
                                <BookOpen className="h-5 w-5 text-primary mb-4" />
                                <h3 className="text-lg font-bold tracking-tight text-foreground mb-2">Ready to start?</h3>
                                <p className="text-muted-foreground text-xs mb-6 leading-relaxed">View our projects and see how we help businesses scale.</p>
                            </div>
                            <Button className="w-full bg-[#14110b] text-white hover:bg-[#14110b]/90 rounded-xl py-4 flex items-center justify-start gap-2" asChild>
                                <Link href="/projects">
                                    <div className="h-7 w-7 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                                        <BookOpen className="h-3.5 w-3.5 text-primary" />
                                    </div>
                                    <span className="font-semibold text-xs">View All Projects</span>
                                </Link>
                            </Button>
                        </div>
                        
                        {/* Right Columns (Links) */}
                        <div className="w-[72%] p-6 grid grid-cols-3 gap-x-6 gap-y-6">
                            {/* Flagship Projects */}
                            <div>
                                <h4 className="text-[9px] font-bold text-primary uppercase tracking-widest mb-2">Flagship</h4>
                                <ul className="space-y-0.5">
                                    <li>
                                        <Link href="/projects/flagship" className="block group p-2 -mx-2 rounded-md hover:bg-secondary/50 transition-colors">
                                            <div className="font-semibold text-foreground text-xs">All Flagship</div>
                                        </Link>
                                    </li>
                                    {flagshipProjects.map((item) => (
                                        <li key={item.name}>
                                            <Link href={item.href} className="block group p-2 -mx-2 rounded-md hover:bg-secondary/50 transition-colors">
                                                <div className="font-semibold text-foreground text-xs">{item.name}</div>
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Client Projects */}
                            <div>
                                <h4 className="text-[9px] font-bold text-primary uppercase tracking-widest mb-2">Client Work</h4>
                                <ul className="space-y-0.5">
                                    <li>
                                        <Link href="/projects" className="block group p-2 -mx-2 rounded-md hover:bg-secondary/50 transition-colors">
                                            <div className="font-semibold text-foreground text-xs">All Projects</div>
                                        </Link>
                                    </li>
                                </ul>
                            </div>

                            {/* Knowledge Base */}
                            <div>
                                <h4 className="text-[9px] font-bold text-primary uppercase tracking-widest mb-2">Knowledge</h4>
                                <ul className="space-y-0.5">
                                    <li>
                                        <Link href="/insights" className="block group p-2 -mx-2 rounded-md hover:bg-secondary/50 transition-colors">
                                            <div className="font-semibold text-foreground text-xs">Insights & News</div>
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href="/our-approach" className="block group p-2 -mx-2 rounded-md hover:bg-secondary/50 transition-colors">
                                            <div className="font-semibold text-foreground text-xs">Our Approach</div>
                                        </Link>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
                <div className="lg:hidden absolute top-full left-0 right-0 bg-background/98 backdrop-blur-xl border-b border-border p-6 flex flex-col gap-4 max-h-[80vh] overflow-y-auto">
                    {/* Services Sections */}
                    <div className="pb-2 border-b border-border/50">
                        <h3 className="text-primary font-bold text-[13px] uppercase tracking-wider mb-3">Services</h3>
                        <Link href="/services" className="block text-foreground text-sm py-1.5 hover:text-primary pl-2 font-semibold mb-2" onClick={() => setIsMobileMenuOpen(false)}>View All Services</Link>
                        {dynamicServiceCategories.map((cat) => (
                            <div key={cat.title} className="mb-4 pl-2 border-l-2 border-border/50">
                                <h4 className="text-foreground font-medium text-sm mb-2">{cat.title}</h4>
                                {cat.items.map((item) => (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        className="block text-muted-foreground text-sm py-1.5 hover:text-foreground pl-2"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        {item.name}
                                    </Link>
                                ))}
                            </div>
                        ))}
                    </div>

                    {/* Our Work Section */}
                    <div className="pb-2 border-b border-border/50">
                        <h3 className="text-primary font-bold text-[13px] uppercase tracking-wider mb-3">Our Work</h3>
                        <div className="pl-2 border-l-2 border-border/50 flex flex-col gap-2">
                            <Link href="/projects/flagship" className="block text-muted-foreground text-sm py-1 hover:text-foreground pl-2" onClick={() => setIsMobileMenuOpen(false)}>Flagship Projects</Link>
                            <Link href="/projects" className="block text-muted-foreground text-sm py-1 hover:text-foreground pl-2" onClick={() => setIsMobileMenuOpen(false)}>All Projects</Link>
                            <Link href="/insights" className="block text-muted-foreground text-sm py-1 hover:text-foreground pl-2" onClick={() => setIsMobileMenuOpen(false)}>Insights</Link>
                            <Link href="/our-approach" className="block text-muted-foreground text-sm py-1 hover:text-foreground pl-2" onClick={() => setIsMobileMenuOpen(false)}>Our Approach</Link>
                        </div>
                    </div>

                    {coreNavLinks.map((link) => (
                        <Link
                            key={link.name}
                            href={link.href}
                            className="text-primary font-bold text-[13px] uppercase tracking-wider py-2 block hover:text-foreground"
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            {link.name}
                        </Link>
                    ))}
                    <div className="w-full mt-4" onClick={() => setIsMobileMenuOpen(false)}>
                        <PrimaryButton href="/contact" size="md" className="w-full" showArrow>
                            Start a Project
                        </PrimaryButton>
                    </div>
                </div>
            )}
        </nav>
    )
}

export default Navbar
