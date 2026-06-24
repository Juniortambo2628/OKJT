"use client"

import React from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import PageHero from '@/components/PageHero'
import { useSettings } from '@/hooks/use-settings'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { useApi } from '@/hooks/use-api'
import { ArrowRight, Linkedin, Zap, Landmark, Globe, Shield, Star, Award, Heart, Info } from 'lucide-react'
import Link from 'next/link'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { TeamMember, Value } from '@/types/api'
import ParallaxSection from '@/components/ParallaxSection'
import ParallaxNav from '@/components/ParallaxNav'

const availableIcons: Record<string, any> = {
    Shield, Globe, Zap, Landmark, Star, Award, Heart
}

export default function AboutContent() {
    const { getSetting } = useSettings()
    const { data: team } = useApi<TeamMember[]>('/team-members')
    const { data: values } = useApi<Value[]>('/values')
    
    const title = getSetting('about_title', 'Design-led Web Engineering\nfor impact.')
    const tagline = getSetting('about_tagline', 'The OKJTech Story')
    const story = getSetting('about_story', 'OKJTech is a premier design-led web engineering firm dedicated to building high-performance software, intuitive interfaces, and scalable digital platforms for visionary global brands.')
    const heroImage = getSetting('hero_about_media', '')
    const missionTitle = getSetting('about_mission_title', 'Bridging the gap between imagination and implementation.')
    const missionText1 = getSetting('about_mission_text1', 'We believe that great technology is invisible. It should empower, solve, and scale without friction. At OKJTech, we blend aesthetic excellence with functional precision to build digital products that move the needle.')
    const missionText2 = getSetting('about_mission_text2', 'Our engineering team brings together deep technical expertise, innovative design thinking, and a commitment to delivery to ensure your digital infrastructure is ready for the future.')

    const teamTitle = getSetting('about_team_title', 'Led by hands-on engineers.')
    const teamSubtitle = getSetting('about_team_subtitle', 'Our team combines deep technical expertise with creative design thinking to deliver exceptional digital products.')
    const ctaTitle = getSetting('about_cta_title', "Let's build the future together.")
    const ctaSubtitle = getSetting('about_cta_subtitle', 'Whether you need a custom web application, a design overhaul, or a technical strategy — our team is ready to scale your impact.')

    const navSections = [
        { id: 'hero', label: 'Intro' },
        { id: 'about-mission', label: 'Mission' },
        { id: 'about-values', label: 'Values' },
        { id: 'about-team', label: 'Team' },
        { id: 'about-cta', label: 'Contact' }
    ]

    return (
        <main className="flex min-h-screen flex-col bg-background font-inter w-full overflow-x-hidden">
            <Navbar />

            <PageHero
                id="hero"
                centered
                tagline={tagline}
                title={title.replace(/\n/g, '<br />')}
                subtitle={story}
                videoSrc={heroImage?.endsWith('.mp4') ? heroImage : undefined}
                bgImage={heroImage && !heroImage.endsWith('.mp4') ? heroImage : undefined}
            />

            <div className="bg-black w-full overflow-visible">
                {/* Mission */}
                <ParallaxSection
                    id="about-mission"
                    bgMedia="/assets/videos/services/energy-advisory.mp4"
                    heightClass="min-h-[200vh]"
                    contentMaxWidth="max-w-[1400px]"
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-20 items-center border border-white/5 bg-black/40 backdrop-blur-md rounded-2xl p-10 md:p-12 w-full">
                        <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }}>
                            <span className="text-primary font-bold text-sm uppercase tracking-[0.2em] mb-4 block">Our Mission</span>
                            <h2 className="text-3xl md:text-5xl font-bold text-white mb-8 leading-tight">{missionTitle}</h2>
                            <p className="text-white/70 text-base md:text-lg leading-relaxed mb-6">{missionText1}</p>
                            <p className="text-white/70 text-base md:text-lg leading-relaxed">{missionText2}</p>
                        </motion.div>
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} className="relative aspect-[4/3] overflow-hidden border border-border/50 shadow-2xl">
                            <img src="/NI-Digital-Assets/strategic-advisory.jpg" alt="OKJTech Team in session" className="w-full h-full object-cover grayscale opacity-85" />
                            <div className="absolute inset-0 bg-primary/10 mix-blend-color" />
                        </motion.div>
                    </div>
                </ParallaxSection>

                {/* Values */}
                <ParallaxSection
                    id="about-values"
                    bgMedia="/assets/videos/services/fintech-video.mp4"
                    heightClass="min-h-[220vh]"
                    badgeText="HOW WE WORK"
                    title="Our Core Values"
                    contentMaxWidth="max-w-[1400px]"
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full mt-8">
                        {values?.map((val, idx) => {
                            const IconComponent = availableIcons[val.icon || 'Shield'] || Shield
                            return (
                                <motion.div key={val.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }} className="bg-black/40 backdrop-blur-md border border-white/5 p-8 hover:border-primary/30 transition-all group rounded-2xl">
                                    <div className="w-12 h-12 bg-primary/5 border border-primary/10 flex items-center justify-center mb-8 group-hover:bg-primary group-hover:text-black transition-all duration-300">
                                        <IconComponent className="h-6 w-6 text-primary group-hover:text-black transition-colors" />
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-4">{val.title}</h3>
                                    <p className="text-white/70 leading-relaxed text-sm">{val.description}</p>
                                </motion.div>
                            )
                        })}
                    </div>
                </ParallaxSection>

                {/* Team */}
                <ParallaxSection
                    id="about-team"
                    bgMedia="/assets/videos/services/all-services-video.mp4"
                    heightClass="min-h-[220vh]"
                    badgeText="OUR TEAM"
                    title={teamTitle}
                    subtitle={teamSubtitle}
                    contentMaxWidth="max-w-[1400px]"
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full mt-8">
                        {team?.map((member, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="bg-black/40 backdrop-blur-md border border-white/5 p-8 text-center flex flex-col group relative rounded-2xl"
                            >
                                <div className="w-28 h-28 rounded-full bg-gradient-to-br from-primary/10 via-background to-background mx-auto mb-6 flex items-center justify-center overflow-hidden border border-primary/20">
                                    {member.image ? (
                                        <img src={member.image} alt={member.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-2xl font-bold text-primary">
                                            {member.name.split(' ').map((n) => n[0]).join('')}
                                        </span>
                                    )}
                                </div>

                                <h3 className="text-lg font-bold text-white mb-1">{member.name}</h3>
                                <span className="text-primary font-bold text-xs uppercase tracking-wider block mb-3">{member.role}</span>
                                
                                <p className="text-white/60 text-xs sm:text-sm leading-relaxed mb-6 line-clamp-3 flex-1 px-4">
                                    {member.bio}
                                </p>

                                <div className="flex flex-col gap-4 mt-auto">
                                    <Dialog>
                                        <DialogTrigger asChild>
                                            <button className="text-primary font-bold text-xs uppercase tracking-widest hover:underline flex items-center justify-center gap-2">
                                                <Info size={14} /> Read Full Bio
                                            </button>
                                        </DialogTrigger>
                                        <DialogContent className="sm:max-w-[600px] bg-background p-0 overflow-hidden border border-white/5 shadow-2xl">
                                            <div className="bg-primary/5 p-8 border-b border-white/5">
                                                <div className="flex items-center gap-6">
                                                    <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-primary/20 shrink-0">
                                                        {member.image ? (
                                                            <img src={member.image} alt={member.name} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full bg-primary/10 flex items-center justify-center text-2xl font-bold text-primary">
                                                                {member.name.split(' ').map((n) => n[0]).join('')}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <h2 className="text-2xl font-bold text-foreground">{member.name}</h2>
                                                        <p className="text-primary font-bold uppercase tracking-widest text-sm">{member.role}</p>
                                                        {member.linkedin && (
                                                            <a href={member.linkedin} target="_blank" className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-700 text-xs font-bold mt-2">
                                                                <Linkedin size={14} /> View LinkedIn Profile
                                                            </a>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="p-8 space-y-6">
                                                <div>
                                                    <h4 className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] mb-3">About</h4>
                                                    <p className="text-muted-foreground leading-relaxed text-sm whitespace-pre-line">
                                                        {member.bio}
                                                    </p>
                                                </div>
                                                
                                                {member.qualifications && (
                                                    <div>
                                                        <h4 className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] mb-3">Professional Credentials</h4>
                                                        <p className="text-muted-foreground text-sm italic">{member.qualifications}</p>
                                                    </div>
                                                )}
                                            </div>
                                        </DialogContent>
                                    </Dialog>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </ParallaxSection>

                {/* CTA */}
                <ParallaxSection
                    id="about-cta"
                    bgMedia="/assets/videos/services/international-diplomacy-video.mp4"
                    heightClass="min-h-[170vh]"
                    contentMaxWidth="max-w-[1400px]"
                >
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">{ctaTitle}</h2>
                    <p className="text-white/60 mb-12 max-w-xl mx-auto text-lg">
                        {ctaSubtitle}
                    </p>
                    <Button size="lg" className="h-16 px-12 text-lg font-bold rounded-none bg-primary hover:bg-primary/90 text-primary-foreground shadow-2xl shadow-primary/20 transition-all hover:scale-105" asChild>
                        <Link href="/contact">
                            Request a Quote <ArrowRight className="ml-2 h-5 w-5" />
                        </Link>
                    </Button>
                </ParallaxSection>
            </div>

            <ParallaxNav sections={navSections} />
            <Footer />
        </main>
    )
}
