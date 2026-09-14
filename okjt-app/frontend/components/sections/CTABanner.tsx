"use client"

import React from 'react'
import { Sparkles, Mail, Phone, MessageSquare, ArrowRight } from 'lucide-react'
import { useSettings } from '@/hooks/use-settings'
import ParallaxSection from '@/components/ParallaxSection'
import PrimaryButton from '@/components/PrimaryButton'
import FadeIn from '@/components/animations/FadeIn'

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
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 h-full">
                {/* Primary CTA card */}
                <FadeIn direction="up" distance={20} className="lg:col-span-3">
                    <div className="h-full bg-primary/90 text-[#14110b] rounded-2xl p-8 md:p-10 flex flex-col justify-between relative overflow-hidden">
                        <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-white/20 blur-3xl" />
                        <div className="relative z-10">
                            <div className="inline-flex items-center gap-2 bg-black/10 rounded-full px-4 py-1.5 mb-6">
                                <Sparkles className="w-3.5 h-3.5" />
                                <span className="text-xs font-bold uppercase tracking-widest">Ready to begin?</span>
                            </div>
                            <h3 className="text-2xl md:text-3xl font-bold leading-tight mb-4">Start a project — request a tailored proposal.</h3>
                            <p className="text-[#14110b]/70 text-sm md:text-base leading-relaxed max-w-md">Answer a few questions about scope and timeline. You'll get a technical and financial proposal within two business days.</p>
                        </div>
                        <div className="relative z-10 mt-8 flex flex-wrap gap-3">
                            <PrimaryButton href="/contact" size="lg" className="bg-[#14110b] text-primary hover:bg-[#14110b]/90 shadow-lg">
                                Start a Project
                            </PrimaryButton>
                            <PrimaryButton href="/projects" variant="outline" size="lg" className="border-[#14110b]/30 text-[#14110b] hover:bg-[#14110b]/10">
                                View Our Work
                            </PrimaryButton>
                        </div>
                    </div>
                </FadeIn>

                {/* Direct contact card */}
                <FadeIn direction="up" distance={20} delay={0.12} className="lg:col-span-2">
                    <div className="h-full bg-black/30 border border-white/10 rounded-2xl p-8 flex flex-col gap-4">
                        <div>
                            <span className="text-primary text-[10px] font-bold uppercase tracking-widest">Direct lines</span>
                            <h4 className="text-white font-bold text-lg mt-1">Skip the form.</h4>
                        </div>

                        <a href={`mailto:${email}`} className="group flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/5 hover:border-primary/40 transition-all">
                            <span className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                                <Mail className="h-4 w-4 text-primary" />
                            </span>
                            <div className="min-w-0 flex-1">
                                <div className="text-[10px] uppercase tracking-widest text-white/50 font-bold">Email</div>
                                <div className="text-white text-sm truncate">{email}</div>
                            </div>
                            <ArrowRight className="h-4 w-4 text-white/40 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                        </a>

                        <a href={`tel:${phone.replace(/\s/g, '')}`} className="group flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/5 hover:border-primary/40 transition-all">
                            <span className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                                <Phone className="h-4 w-4 text-primary" />
                            </span>
                            <div className="min-w-0 flex-1">
                                <div className="text-[10px] uppercase tracking-widest text-white/50 font-bold">Phone</div>
                                <div className="text-white text-sm">{phone}</div>
                            </div>
                            <ArrowRight className="h-4 w-4 text-white/40 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                        </a>

                        <a href="/contact" className="group flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/5 hover:border-primary/40 transition-all mt-auto">
                            <span className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                                <MessageSquare className="h-4 w-4 text-primary" />
                            </span>
                            <div className="min-w-0 flex-1">
                                <div className="text-[10px] uppercase tracking-widest text-white/50 font-bold">Message</div>
                                <div className="text-white text-sm">Send a brief</div>
                            </div>
                            <ArrowRight className="h-4 w-4 text-white/40 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                        </a>
                    </div>
                </FadeIn>
            </div>
        </ParallaxSection>
    )
}

export default CTABanner
