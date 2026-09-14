"use client"

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Menu, X, ChevronDown, Briefcase, BookOpen, MessageSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'
import PrimaryButton from '@/components/PrimaryButton'
import { cn, getMediaUrl } from '@/lib/utils'
import SearchDialog from './SearchDialog'
import { ThemeToggle } from './ThemeToggle'
import { useApi } from '@/hooks/use-api'
import { useSettings } from '@/hooks/use-settings'
import { useMounted } from '@/hooks/use-mounted'
import { useTheme } from 'next-themes'

/**
 * Collapsible header used by the mobile menu so the top-level groups
 * (Services / Our Work) don't force the visitor to scroll a wall of links.
 */
function MobileGroup({ label, isOpen, onToggle, children }: {
    label: string
    isOpen: boolean
    onToggle: () => void
    children: React.ReactNode
}) {
    return (
        <div className="border-t border-border/40 first:border-t-0">
            <button
                type="button"
                onClick={onToggle}
                className="w-full flex items-center justify-between py-3 text-[13px] font-bold uppercase tracking-wider text-primary"
                aria-expanded={isOpen}
            >
                <span>{label}</span>
                <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOpen && (
                <div className="pb-3 pl-1 flex flex-col">
                    {children}
                </div>
            )}
        </div>
    )
}

const Navbar = () => {
    const { theme } = useTheme()
    const { branding, getSetting } = useSettings()
    const { data: services } = useApi('/services')
    const { data: projects } = useApi('/projects')
    const [isScrolled, setIsScrolled] = useState(false)
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const [activeMegaMenu, setActiveMegaMenu] = useState<'services' | 'work' | null>(null)
    // Mobile menu: at most one category expanded at a time; the parent "Services"
    // or "Our Work" group is expanded via these top-level keys.
    const [mobileOpenGroup, setMobileOpenGroup] = useState<'services' | 'work' | null>(null)
    const [mobileOpenCategory, setMobileOpenCategory] = useState<string | null>(null)
    const mounted = useMounted()

    // Mega-menu hover intent: keep the panel open briefly after the cursor
    // leaves so it doesn't vanish while the user is travelling to an item.
    const megaMenuCloseTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
    const openMegaMenu = (menu: 'services' | 'work') => {
        if (megaMenuCloseTimer.current) clearTimeout(megaMenuCloseTimer.current)
        setActiveMegaMenu(menu)
    }
    const scheduleMegaMenuClose = () => {
        if (megaMenuCloseTimer.current) clearTimeout(megaMenuCloseTimer.current)
        megaMenuCloseTimer.current = setTimeout(() => setActiveMegaMenu(null), 400)
    }
    useEffect(() => () => {
        if (megaMenuCloseTimer.current) clearTimeout(megaMenuCloseTimer.current)
    }, [])

    const logoWhiteBg = branding.logo_light
    const logoBlackBg = branding.logo_dark

    // Render the light-bg logo on the server / first paint (stable for hydration),
    // then the theme-appropriate one once mounted.
    const logo = mounted ? (theme === 'light' ? logoWhiteBg : logoBlackBg) : logoWhiteBg

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
        return projects.filter((p: any) => p.type === 'flagship' && p.is_active).slice(0, 4).map((p: any) => ({
            name: p.title,
            href: `/projects/${p.slug}`,
            image: p.image ? getMediaUrl(p.image) : null,
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
                "fixed top-0 left-0 right-0 z-[90] transition-all duration-500 px-4 md:px-6",
                // Solid glass background across the board — a transparent bar
                // over the hero image was invisible on mobile.
                isScrolled
                    ? "bg-background/85 backdrop-blur-xl border-b border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.25)] py-2"
                    : "bg-background/60 backdrop-blur-md py-3 md:py-4"
            )}
            onMouseLeave={scheduleMegaMenuClose}
        >
            <div className="max-w-[1400px] mx-auto flex items-center justify-between gap-2">
                <Link href="/" className="flex items-center gap-2 relative z-50 shrink-0">
                    {mounted ? (
                        <Image
                            src={logo}
                            alt="OKJTech Logo"
                            width={180}
                            height={45}
                            className="h-8 md:h-12 w-auto object-contain"
                            priority
                        />
                    ) : (
                        <div className="h-8 md:h-12 w-32 md:w-40 animate-pulse bg-muted/20 rounded" />
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
                        onMouseEnter={() => openMegaMenu('services')}
                        aria-label="Services Menu"
                        aria-haspopup="true"
                        aria-expanded={activeMegaMenu === 'services'}
                    >
                        Services <ChevronDown className="h-3 w-3" />
                    </button>
                    
                    {/* Our Work Dropdown Trigger */}
                    <button
                        className="text-[12px] font-bold uppercase tracking-widest hover:text-primary transition-colors text-foreground/90 flex items-center gap-1"
                        onMouseEnter={() => openMegaMenu('work')}
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
                    className="hidden lg:block absolute top-[100%] left-1/2 -translate-x-1/2 w-full max-w-[1120px] bg-background rounded-2xl border border-border shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] transition-all overflow-hidden mt-1"
                    onMouseEnter={() => openMegaMenu('services')}
                    onMouseLeave={scheduleMegaMenuClose}
                >
                    <div className="flex">
                        {/* Left Column (Featured) */}
                        <div className="w-[24%] bg-secondary/20 p-6 border-r border-border flex flex-col justify-between">
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
                                        <div className="h-7 w-7 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                                            <MessageSquare className="h-3.5 w-3.5 text-primary" />
                                        </div>
                                        <span className="font-semibold text-xs">Contact Us</span>
                                    </Link>
                                </Button>
                            </div>
                        </div>
                        
                        {/* Right Columns (Links) — 3-col grid for compactness */}
                        <div className="w-[76%] p-6 grid grid-cols-3 gap-x-6 gap-y-6">
                            {dynamicServiceCategories.map((cat) => (
                                <div key={cat.title} className="min-w-0">
                                    <h4 className="text-[9px] font-bold text-primary uppercase tracking-widest mb-2 truncate">{cat.title}</h4>
                                    <ul className="space-y-0.5">
                                        {cat.items.map((item) => (
                                            <li key={item.name} className="min-w-0">
                                                <Link href={item.href} className="block group p-2 -mx-2 rounded-md hover:bg-secondary/50 transition-colors">
                                                    <div className="font-semibold text-foreground text-xs truncate whitespace-nowrap" title={item.name}>{item.name}</div>
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
                    className="hidden lg:block absolute top-[100%] left-1/2 -translate-x-1/2 w-full max-w-[1120px] bg-background rounded-2xl border border-border shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] transition-all overflow-hidden mt-1"
                    onMouseEnter={() => openMegaMenu('work')}
                    onMouseLeave={scheduleMegaMenuClose}
                >
                    <div className="flex">
                        {/* Left Column (Featured) */}
                        <div className="w-[24%] bg-secondary/20 p-6 border-r border-border flex flex-col justify-between">
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
                        <div className="w-[76%] p-6 grid grid-cols-3 gap-x-6 gap-y-6">
                            {/* Flagship Projects — with square thumbnails, single column */}
                            <div className="col-span-2 min-w-0">
                                <h4 className="text-[9px] font-bold text-primary uppercase tracking-widest mb-2">Flagship</h4>
                                <ul className="flex flex-col gap-1">
                                    {flagshipProjects.map((item) => (
                                        <li key={item.name} className="min-w-0">
                                            <Link href={item.href} className="flex items-center gap-3 group p-1.5 -mx-1.5 rounded-md hover:bg-secondary/50 transition-colors">
                                                {item.image ? (
                                                    <img src={item.image} alt="" className="h-11 w-11 rounded object-cover shrink-0 border border-border/50" />
                                                ) : (
                                                    <div className="h-11 w-11 rounded bg-secondary/40 shrink-0 border border-border/50" />
                                                )}
                                                <div className="font-semibold text-foreground text-xs leading-tight truncate whitespace-nowrap min-w-0 flex-1" title={item.name}>{item.name}</div>
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                                <Link href="/projects/flagship" className="inline-block mt-2 text-[10px] font-bold text-primary uppercase tracking-widest hover:underline">
                                    All flagship projects →
                                </Link>
                            </div>

                            {/* Client Work + Knowledge */}
                            <div>
                                <h4 className="text-[9px] font-bold text-primary uppercase tracking-widest mb-2">More</h4>
                                <ul className="space-y-0.5">
                                    <li>
                                        <Link href="/projects" className="block group p-2 -mx-2 rounded-md hover:bg-secondary/50 transition-colors">
                                            <div className="font-semibold text-foreground text-xs">All Projects</div>
                                        </Link>
                                    </li>
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

            {/* Mobile Menu — collapsible group headers so the menu stays short */}
            {isMobileMenuOpen && (
                <div className="lg:hidden fixed top-[56px] inset-x-0 bg-background border-b border-border shadow-2xl px-4 py-4 flex flex-col max-h-[calc(100vh-56px)] overflow-y-auto z-[90]">
                    <MobileGroup
                        label="Services"
                        isOpen={mobileOpenGroup === 'services'}
                        onToggle={() => setMobileOpenGroup(mobileOpenGroup === 'services' ? null : 'services')}
                    >
                        <Link
                            href="/services"
                            className="flex items-center justify-between text-foreground text-sm py-2 hover:text-primary font-semibold"
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            View All Services
                        </Link>
                        <div className="flex flex-col">
                            {dynamicServiceCategories.map((cat) => {
                                const isOpen = mobileOpenCategory === cat.title
                                return (
                                    <div key={cat.title} className="border-t border-border/40">
                                        <button
                                            type="button"
                                            onClick={() => setMobileOpenCategory(isOpen ? null : cat.title)}
                                            className="w-full flex items-center justify-between py-2.5 text-sm font-semibold text-foreground/90 hover:text-primary"
                                            aria-expanded={isOpen}
                                        >
                                            <span>{cat.title}</span>
                                            <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180 text-primary' : 'text-muted-foreground'}`} />
                                        </button>
                                        {isOpen && (
                                            <div className="pb-2 pl-3 border-l-2 border-primary/30 ml-1 flex flex-col">
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
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    </MobileGroup>

                    <MobileGroup
                        label="Our Work"
                        isOpen={mobileOpenGroup === 'work'}
                        onToggle={() => setMobileOpenGroup(mobileOpenGroup === 'work' ? null : 'work')}
                    >
                        <Link href="/projects/flagship" className="block text-muted-foreground text-sm py-2 hover:text-foreground" onClick={() => setIsMobileMenuOpen(false)}>Flagship Projects</Link>
                        <Link href="/projects" className="block text-muted-foreground text-sm py-2 hover:text-foreground" onClick={() => setIsMobileMenuOpen(false)}>All Projects</Link>
                        <Link href="/insights" className="block text-muted-foreground text-sm py-2 hover:text-foreground" onClick={() => setIsMobileMenuOpen(false)}>Insights</Link>
                        <Link href="/our-approach" className="block text-muted-foreground text-sm py-2 hover:text-foreground" onClick={() => setIsMobileMenuOpen(false)}>Our Approach</Link>
                    </MobileGroup>

                    <div className="border-t border-border/40 pt-2">
                        {coreNavLinks.map((link) => (
                            <Link
                                key={link.name}
                                href={link.href}
                                className="text-foreground font-bold text-[12px] uppercase tracking-wider py-3 flex items-center justify-between hover:text-primary"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                {link.name}
                            </Link>
                        ))}
                    </div>

                    <div className="w-full mt-3" onClick={() => setIsMobileMenuOpen(false)}>
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
