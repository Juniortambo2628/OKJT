"use client"

import React from 'react'
import Link from 'next/link'
import { Sparkles, Mail, Phone, MessageSquare, ArrowRight } from 'lucide-react'
import { useSettings } from '@/hooks/use-settings'
import ParallaxSection from '@/components/ParallaxSection'
import HorizontalCarousel from '@/components/ui/HorizontalCarousel'
import PrimaryButton from '@/components/PrimaryButton'

interface ContactCardProps {
    label: string
    title: string
    href: string
    icon: React.ElementType
    external?: boolean
}

const ContactCard = ({ label, title, href, icon: Icon, external }: ContactCardProps) => (
    <Link
        href={href}
        {...(external ? { target: '_blank', rel: 'noreferrer' } : {})}
        className="group h-full w-full block rounded-2xl bg-black/30 border border-white/10 p-6 hover:border-primary/40 transition-all flex flex-col justify-between"
    >
        <div>
            <span className="inline-flex w-10 h-10 rounded-full bg-primary/10 border border-primary/20 items-center justify-center mb-4">
                <Icon className="h-4 w-4 text-primary" />
            </span>
            <div className="text-[10px] uppercase tracking-widest text-white/50 font-bold mb-1">{label}</div>
            <div className="text-white text-lg font-bold truncate" title={title}>{title}</div>
        </div>
        <div className="mt-6 inline-flex items-center gap-1.5 text-primary text-xs font-bold uppercase tracking-widest">
            Open <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
        </div>
    </Link>
)

const CTABanner = () => {
    const { getSetting } = useSettings()

    const badgeText = getSetting('cta_badge') || 'GET IN TOUCH'
    const title = getSetting('cta_title') || 'Let\'s build the next one together.'
    const subtitle = getSetting('cta_subtitle') || 'Bring the brief — we\'ll map the ecosystem, scope the build and give you a realistic path to production.'

    const bgMedia = getSetting('bg_home_cta')
    const email = getSetting('contact_email', 'hello@okjtech.co.ke')
    const phone = getSetting('contact_phone', '+254 700 000 000')

    return (
        <ParallaxSection
            id="cta"
            bgMedia={bgMedia}
            heightClass="min-h-[170vh]"
            contentMaxWidth="max-w-[1400px]"
            badgeText={badgeText}
            title={title}
            subtitle={subtitle}
        >
            <HorizontalCarousel className="h-full">
                {/* Primary CTA card */}
                <div className="h-full w-full rounded-2xl bg-primary/90 text-[#14110b] p-6 md:p-8 flex flex-col justify-between relative overflow-hidden">
                    <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-white/20 blur-3xl" />
                    <div className="relative z-10 min-h-0 flex-1">
                        <div className="inline-flex items-center gap-2 bg-black/10 rounded-full px-3 py-1 mb-4">
                            <Sparkles className="w-3 h-3" />
                            <span className="text-[10px] font-bold uppercase tracking-widest">Ready to begin?</span>
                        </div>
                        <h3 className="text-xl md:text-2xl font-bold leading-tight mb-3">Start a project.</h3>
                        <p className="text-[#14110b]/70 text-sm leading-relaxed line-clamp-4">Answer a few questions about scope and timeline. Expect a technical and financial proposal within two business days.</p>
                    </div>
                    <div className="relative z-10 mt-6 flex flex-col gap-2">
                        <PrimaryButton href="/contact" size="md" className="bg-[#14110b] text-primary hover:bg-[#14110b]/90 shadow-lg w-full justify-center">
                            Start a Project
                        </PrimaryButton>
                        <PrimaryButton href="/projects" variant="outline" size="md" className="border-[#14110b]/30 text-[#14110b] hover:bg-[#14110b]/10 w-full justify-center">
                            View Our Work
                        </PrimaryButton>
                    </div>
                </div>

                <ContactCard label="Email" title={email} href={`mailto:${email}`} icon={Mail} />
                <ContactCard label="Phone" title={phone} href={`tel:${phone.replace(/\s/g, '')}`} icon={Phone} />
                <ContactCard label="Message" title="Send a brief" href="/contact" icon={MessageSquare} />
            </HorizontalCarousel>
        </ParallaxSection>
    )
}

export default CTABanner
