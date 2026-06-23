"use client"

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Linkedin, Twitter, Github, Facebook } from 'lucide-react'
import { useApi } from '@/hooks/use-api'
import { useSettings } from '@/hooks/use-settings'
import { useTheme } from 'next-themes'

const Footer = () => {
    const { theme } = useTheme()
    const [mounted, setMounted] = React.useState(false)
    const [email, setEmail] = React.useState('')
    const [subscribed, setSubscribed] = React.useState(false)
    const [subscribing, setSubscribing] = React.useState(false)
    const { branding, contact, getSetting, socials: socialLinks } = useSettings()
    const { data: services } = useApi('/services')
 
    const logoWhiteBg = branding.logo_light
    const logoBlackBg = branding.logo_dark
    const contactEmail = contact.email
    const contactAddress = contact.address

    React.useEffect(() => {
        setMounted(true)
    }, [])

    const logo = theme === 'light' ? logoWhiteBg : logoBlackBg

    // Dynamic service links from the API
    const dynamicServiceLinks = React.useMemo(() => {
        if (!services) return []
        // Just take the first 6 active services
        return services.slice(0, 6).map((s: any) => ({
            name: s.title,
            href: `/services/${s.slug}`
        }))
    }, [services])

    const companyLinks = [
        { name: 'About Us', href: '/about' },
        { name: 'Projects', href: '/projects' },
        { name: 'Our Approach', href: '/our-approach' },
        { name: 'Contact', href: '/contact' },
    ]

    const legalLinks = [
        { name: 'Privacy Policy', href: '/privacy' },
        { name: 'Terms of Service', href: '/terms' },
        { name: 'Cookie Policy', href: '/cookies' },
    ]

    return (
        <footer className="w-full bg-background border-t border-border/50">
            {/* Main Footer */}
            <div className="max-w-[1400px] mx-auto px-6 py-20">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-16">
                    {/* Column 1: Brand + Newsletter */}
                    <div className="lg:col-span-1">
                        <div className="relative h-14 w-60 mb-6">
                            {mounted ? (
                                <Image
                                    src={logo}
                                    alt="OKJTech"
                                    fill
                                    sizes="240px"
                                    className="object-contain"
                                    priority
                                />
                            ) : (
                                <div className="h-full w-full animate-pulse bg-muted/20 rounded" />
                            )}
                        </div>
                        <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                            {getSetting('company_tagline', 'Design-led web engineering — crafting fast, responsive, and visually stunning digital experiences that drive results for ambitious brands.')}
                        </p>

                        {subscribed ? (
                            <p className="text-primary text-sm font-medium">Thanks for subscribing!</p>
                        ) : (
                            <form onSubmit={async (e) => {
                                e.preventDefault()
                                if (!email) return
                                setSubscribing(true)
                                try {
                                    await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/subscribe`, {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({ email, source: 'footer' }),
                                    })
                                    setSubscribed(true)
                                    setEmail('')
                                } catch {}
                                setSubscribing(false)
                            }} className="flex gap-2">
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Your email"
                                    required
                                    className="flex-1 bg-muted/50 border border-border/50 rounded px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary"
                                />
                                <button
                                    type="submit"
                                    disabled={subscribing}
                                    className="bg-primary text-primary-foreground px-4 py-2 rounded text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
                                >
                                    {subscribing ? '...' : 'Subscribe'}
                                </button>
                            </form>
                        )}
                    </div>

                    {/* Column 2: Services */}
                    <div>
                        <h4 className="text-foreground font-bold text-sm uppercase tracking-widest mb-6">Services</h4>
                        <ul className="space-y-3">
                            {(dynamicServiceLinks.length > 0 ? dynamicServiceLinks : []).map((link: any) => (
                                <li key={link.name}>
                                    <Link href={link.href} className="text-muted-foreground hover:text-foreground text-sm transition-colors">
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Column 3: Company */}
                    <div>
                        <h4 className="text-foreground font-bold text-sm uppercase tracking-widest mb-6">Company</h4>
                        <ul className="space-y-3">
                            {companyLinks.map((link) => (
                                <li key={link.name}>
                                    <Link href={link.href} className="text-muted-foreground hover:text-foreground text-sm transition-colors">
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Column 4: Contact */}
                    <div>
                        <h4 className="text-foreground font-bold text-sm uppercase tracking-widest mb-6">Contact</h4>
                        <ul className="space-y-4 text-sm">
                            <li className="text-muted-foreground">
                                <span className="text-foreground font-semibold block mb-1">Email</span>
                                <a href={`mailto:${contactEmail}`} className="hover:text-primary transition-colors">
                                    {contactEmail}
                                </a>
                            </li>
                            <li className="text-muted-foreground">
                                <span className="text-foreground font-semibold block mb-1">Location</span>
                                {contactAddress}
                            </li>
                        </ul>

                        <div className="mt-8">
                            <Link
                                href="/contact"
                                className="text-primary font-bold text-sm uppercase tracking-wider flex items-center gap-2 hover:underline group"
                            >
                                Request a Quote
                                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-border/50">
                <div className="max-w-[1400px] mx-auto px-6 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-muted-foreground/60 text-xs" suppressHydrationWarning>
                        © {new Date().getFullYear()} OKJTech. All rights reserved.
                    </p>
                    <div className="flex items-center gap-6">
                        {/* Social Links */}
                        <div className="flex items-center gap-4 mr-6 border-r border-border/50 pr-6">
                            {[
                                { url: socialLinks.linkedin, icon: Linkedin },
                                { url: socialLinks.twitter, icon: Twitter },
                                { url: socialLinks.github, icon: Github },
                                { url: socialLinks.facebook, icon: Facebook },
                            ].map((social, idx) => {
                                if (!social.url) return null
                                const Icon = social.icon
                                return (
                                    <a
                                        key={idx}
                                        href={social.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-muted-foreground/60 hover:text-primary transition-all hover:scale-110"
                                    >
                                        <Icon size={18} />
                                    </a>
                                )
                            })}
                        </div>
                        {legalLinks.map((link) => (
                            <Link
                                key={link.name}
                                href={link.href}
                                className="text-muted-foreground/60 hover:text-foreground text-xs transition-colors"
                            >
                                {link.name}
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </footer>
    )
}


export default Footer
