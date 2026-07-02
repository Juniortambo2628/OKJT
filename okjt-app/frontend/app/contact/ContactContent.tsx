"use client"

import React from 'react'
import Hero from '@/components/Hero'
import { useSettings } from '@/hooks/use-settings'
import { usePageHeroMedia } from '@/hooks/use-page-hero-media'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { motion } from 'framer-motion'
import { Calendar, Clock, Globe, Briefcase, CheckCircle2 } from 'lucide-react'

import { useApi } from '@/hooks/use-api'
import { Service } from '@/types/api'

import { useToast } from '@/hooks/use-toast'
import api from '@/lib/api'
import ParallaxSection from '@/components/ParallaxSection'
import FadeIn from '@/components/animations/FadeIn'
import { StaggerContainer, StaggerItem } from '@/components/animations/Stagger'
import { SectionCard } from '@/components/ui/SectionCard'
import { PageShell } from '@/components/PageShell'
import { CONTACT_NAV_SECTIONS } from '@/lib/nav-sections'

export default function ContactContent() {
    const { getSetting, isLoading: settingsLoading } = useSettings()
    const { videoSrc, bgImage, mediaLoading } = usePageHeroMedia({ settingsKey: 'hero_contact_media' })
    const { toast } = useToast()
    const [isSubmitting, setIsSubmitting] = React.useState(false)

    const bgForm = getSetting('bg_contact_form')
    const bgInfo = getSetting('bg_contact_info')

    const { data: services } = useApi<Service[]>('/services')
    const sectors = React.useMemo(() => {
        if (!services) return ['Software Development', 'Electronics & IoT', 'E-Commerce Solutions', 'Technical Audit']
        const uniqueSectors = new Set(services.map(s => s.category).filter(Boolean))
        return Array.from(uniqueSectors) as string[]
    }, [services])

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const form = e.currentTarget
        const formData = new FormData(form)
        
        const fullName = formData.get('full_name') as string
        const [firstName = '', ...lastNameParts] = fullName.split(' ')
        const lastName = lastNameParts.join(' ') || '-'

        const data = {
            first_name: firstName,
            last_name: lastName,
            email: formData.get('email'),
            subject: formData.get('sector'),
            message: `Organisation: ${formData.get('company')}\nObjective: ${formData.get('objective')}\nTimeframe: ${formData.get('timeframe')}`,
        }

        try {
            setIsSubmitting(true)
            await api.post('/consultation-requests', data)
            toast({
                title: "Submission Received",
                description: "Your submission has been received. You will be contacted concerning your submission shortly. An email has been sent to the address indicated on the form confirming the same.",
            })
            form.reset()
        } catch (err: any) {
            toast({
                variant: "destructive",
                title: "Submission Failed",
                description: err.response?.data?.message || "Something went wrong. Please try again.",
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <PageShell navSections={CONTACT_NAV_SECTIONS}>
            <Hero
                id="contact-hero"
                tagline="Request a Quote"
                title="Bring your vision <br />to life."
                subtitle="Discuss your next digital project with our engineering team. From custom software to innovative hardware, we build the future."
                videos={videoSrc ? [videoSrc] : undefined}
                bgImage={bgImage}
                loading={settingsLoading || mediaLoading}
            />

            <div className="relative bg-black w-full overflow-visible">
            {/* Form Section */}
            <ParallaxSection
                id="contact-form"
                bgMedia={bgForm}
                heightClass="min-h-[300vh]"
                overlayOpacity={0.8}
                contentMaxWidth="max-w-[1400px]"
            >
                <SectionCard>
                    <div className="w-full max-w-4xl mx-auto">
                        {/* Value Props */}
                        <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-16" staggerDelay={0.1}>
                            <StaggerItem className="text-center">
                                <div className="w-16 h-16 bg-white/5 backdrop-blur-md flex items-center justify-center rounded-none border border-white/10 mx-auto mb-6">
                                    <Globe className="h-6 w-6 text-primary" />
                                </div>
                                <h4 className="font-bold text-white mb-2">Global Expertise</h4>
                                <p className="text-xs text-white/60 leading-relaxed">Advisors with deep experience across 40+ markets.</p>
                            </StaggerItem>
                            <StaggerItem className="text-center">
                                <div className="w-16 h-16 bg-white/5 backdrop-blur-md flex items-center justify-center rounded-none border border-white/10 mx-auto mb-6">
                                    <Clock className="h-6 w-6 text-primary" />
                                </div>
                                <h4 className="font-bold text-white mb-2">Confidentiality</h4>
                                <p className="text-xs text-white/60 leading-relaxed">Secure, high-stakes dialogue focused on your objectives.</p>
                            </StaggerItem>
                            <StaggerItem className="text-center">
                                <div className="w-16 h-16 bg-white/5 backdrop-blur-md flex items-center justify-center rounded-none border border-white/10 mx-auto mb-6">
                                    <Briefcase className="h-6 w-6 text-primary" />
                                </div>
                                <h4 className="font-bold text-white mb-2">Technical Focus</h4>
                                <p className="text-xs text-white/60 leading-relaxed">Specialists in Software Engineering, Electronics & Digital Transformation.</p>
                            </StaggerItem>
                        </StaggerContainer>

                        {/* Form Card */}
                        <div className="bg-black/20 border border-white/10 p-8 md:p-12 shadow-xl rounded-2xl">
                            <div className="mb-12">
                                <h2 className="text-3xl font-bold text-white mb-4">Request a Proposal</h2>
                                <p className="text-white/60 max-w-2xl">Please provide some details about your project requirements so we can prepare a tailored technical and financial proposal.</p>
                            </div>

                            <form className="space-y-10" onSubmit={handleSubmit}>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
                                    <div className="space-y-3">
                                        <Label htmlFor="full-name" className="text-sm font-bold text-white/80 uppercase tracking-tight">Full Name</Label>
                                        <Input 
                                            id="full-name" 
                                            name="full_name"
                                            required
                                            placeholder="Your full name" 
                                            className="rounded-xl border-white/10 bg-white/5 h-14 focus:bg-white/10 focus:ring-primary/20 transition-all text-white placeholder:text-white/30" 
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <Label htmlFor="email" className="text-sm font-bold text-white/80 uppercase tracking-tight">Work Email</Label>
                                        <Input 
                                            id="email" 
                                            name="email"
                                            type="email" 
                                            required
                                            placeholder="you@company.com" 
                                            className="rounded-xl border-white/10 bg-white/5 h-14 focus:bg-white/10 focus:ring-primary/20 transition-all text-white placeholder:text-white/30" 
                                        />
                                    </div>

                                    <div className="space-y-3">
                                        <Label htmlFor="company" className="text-sm font-bold text-white/80 uppercase tracking-tight">Organisation</Label>
                                        <Input 
                                            id="company" 
                                            name="company"
                                            required
                                            placeholder="Company or organisation" 
                                            className="rounded-xl border-white/10 bg-white/5 h-14 focus:bg-white/10 focus:ring-primary/20 transition-all text-white placeholder:text-white/30" 
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <Label htmlFor="sector" className="text-sm font-bold text-white/80 uppercase tracking-tight">Sector of interest</Label>
                                        <select 
                                            id="sector" 
                                            name="sector"
                                            required
                                            className="w-full h-14 px-4 py-2 text-sm bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-white"
                                        >
                                            <option value="" className="text-white bg-[#0a0a0a]">Select a sector</option>
                                            {sectors.map((sector) => (
                                                <option key={sector} value={sector} className="text-white bg-[#0a0a0a]">{sector}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <Label htmlFor="objective" className="text-sm font-bold text-white/80 uppercase tracking-tight">Primary Consultation Objective</Label>
                                    <textarea 
                                        id="objective" 
                                        name="objective"
                                        required
                                        placeholder="Briefly describe what you would like to achieve in this session..." 
                                        className="w-full min-h-[160px] px-4 py-3 text-sm bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white/10 transition-all resize-none text-white placeholder:text-white/30"
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8 items-end">
                                    <div className="space-y-3">
                                        <Label htmlFor="timeframe" className="text-sm font-bold text-white/80 uppercase tracking-tight">Preferred Timeframe</Label>
                                        <select 
                                            id="timeframe" 
                                            name="timeframe"
                                            required
                                            className="w-full h-14 px-4 py-2 text-sm bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-white"
                                        >
                                            <option className="text-white bg-[#0a0a0a]">Urgent (Within 48 hours)</option>
                                            <option className="text-white bg-[#0a0a0a]">Strategic Planning (Next 2 weeks)</option>
                                            <option className="text-white bg-[#0a0a0a]">General Exploratory</option>
                                        </select>
                                    </div>
                                    <div>
                                        <Button 
                                            size="lg" 
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="w-full h-14 rounded-xl font-bold text-sm uppercase tracking-[0.1em] bg-primary hover:bg-primary/90 text-primary-foreground shadow-xl shadow-primary/30 transition-all group"
                                        >
                                            {isSubmitting ? 'Submitting...' : 'Send Quote Request'}
                                            {!isSubmitting && <Calendar className="ml-2 h-5 w-5 transition-transform group-hover:scale-110" />}
                                        </Button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </SectionCard>
            </ParallaxSection>

            {/* Info Section */}
            <ParallaxSection
                id="contact-info"
                bgMedia={bgInfo}
                heightClass="min-h-[200vh]"
                overlayOpacity={0.75}
                contentMaxWidth="max-w-[1400px]"
            >
                <SectionCard>
                    <div className="w-full max-w-4xl mx-auto">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                            <FadeIn direction="left" distance={24}>
                                <h5 className="font-bold text-primary text-[10px] uppercase tracking-[0.3em] mb-6">What to expect</h5>
                                <StaggerContainer className="space-y-4" staggerDelay={0.08}>
                                    {[
                                        'Specialist matching based on your sector and geography.',
                                        'Initial 30-minute discovery session.',
                                        'Confidential needs assessment and capability overview.',
                                        'Strategic proposal for high-impact engagement.'
                                    ].map((item, idx) => (
                                        <StaggerItem key={idx} className="flex items-start gap-3 text-sm text-white/70">
                                            <CheckCircle2 className="h-4 w-4 text-emerald-400 mt-0.5 shrink-0" />
                                            <span>{item}</span>
                                        </StaggerItem>
                                    ))}
                                </StaggerContainer>
                            </FadeIn>
                            <FadeIn direction="right" distance={24} delay={0.15} className="p-8 border border-white/10 bg-black/20 flex flex-col justify-center rounded-2xl">
                                <h4 className="font-bold text-white mb-2 italic">Prefer a direct line?</h4>
                                <p className="text-sm text-white/60 mb-6 leading-relaxed">Our partners are available for priority discussions via our local regional office.</p>
                                <a href={`tel:${getSetting('contact_phone', '+254 700 000 000').replace(/\s/g, '')}`} className="text-xl font-bold text-primary hover:underline transition-all">
                                    {getSetting('contact_phone', '+254 700 000 000')}
                                </a>
                            </FadeIn>
                        </div>
                    </div>
                </SectionCard>
            </ParallaxSection>
            </div>
        </PageShell>
    )
}
