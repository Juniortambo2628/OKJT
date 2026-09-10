"use client"

import React from 'react'
import { useSettings } from '@/hooks/use-settings'
import { useApi } from '@/hooks/use-api'
import { Linkedin, Check } from 'lucide-react'
import FadeIn from '@/components/animations/FadeIn'
import { StaggerContainer, StaggerItem } from '@/components/animations/Stagger'
import {
    Dialog,
    DialogContent,
    DialogTrigger,
} from "@/components/ui/dialog"
import { TeamMember, Value } from '@/types/api'
import ParallaxSection from '@/components/ParallaxSection'
import BaseLayout from '@/components/BaseLayout'
import { usePageHeroMedia } from '@/hooks/use-page-hero-media'
import HorizontalCarousel from '@/components/ui/HorizontalCarousel'
import CarouselCard from '@/components/ui/CarouselCard'
import { iconMap } from '@/components/admin/constants'
import { ABOUT_NAV_SECTIONS } from '@/lib/nav-sections'

export default function AboutContent() {
    const { getSetting } = useSettings()
    const { data: team } = useApi<TeamMember[]>('/team-members')
    const { data: values } = useApi<Value[]>('/values')
    const { videoSrc, bgImage, mediaLoading } = usePageHeroMedia({ settingsKey: 'hero_about_media' })
    const heroMedia = videoSrc ?? bgImage
    
    // Fallback defaults match the AccurateContentSeeder — a one-person studio,
    // ecosystem-mapping framing, no fabricated "team" / "we" language.
    // Keeping them honest here means the page still reads right even if the
    // admin CMS is briefly unreachable at request time.
    const title = getSetting('about_title', 'Design-led web engineering,\nbuilt around ecosystems.')
    const tagline = getSetting('about_tagline', 'How the work gets done')
    const story = getSetting('about_story', 'OKJTechnologies is a Nairobi web-application practice. The work is full-stack and end to end — concept, interface, engineering, deployment and ongoing administration — mostly in Laravel, Next.js / React and the classic LAMP stack. Every build starts by mapping the ecosystem the software has to live in, so each stakeholder has an aligned reason to participate. It is a one-person studio, run by Kevin Tambo.')
    const missionTitle = getSetting('about_mission_title', 'Ecosystem mapping before a line of code.')
    const missionText1 = getSetting('about_mission_text1', 'Every engagement is shaped by an ecosystem-mapping practice from the Afrilabs capacity-building programme in Addis Ababa. Before scoping, the map covers every stakeholder — client, end user, regulator, partner, community — who could be affected by or beneficial to the proposition.')
    const missionText2 = getSetting('about_mission_text2', 'The solution is then designed so each of those stakeholders has a clearly aligned way to benefit from it. Combined with AI-accelerated development, it is how a one-person studio ships the same class of application a small team would take on.')

    const lhTitle = getSetting('about_lawyers_hub_title', "Two years in Africa's LegalTech engine room")
    const lhBody = getSetting('about_lawyers_hub_body', "Between February 2023 and December 2024, the studio’s founder held the role of Software Developer, Justice Innovation at the Lawyers Hub in Nairobi. It is the largest single body of work behind OKJTechnologies, and where the ecosystem-mapping habit went from workshop idea to standard practice.")
    const lhPoints = getSetting('about_lawyers_hub_points', [
        'Spearheaded development of the Lawyers Hub Digital Policy website (lawyershub.org), the cornerstone resource for Kenya\'s digital-policy community.',
        'Designed and shipped the Africa Law Tech Festival platform — online ticketing, live notifications and event mapping for the annual festival.',
        'Contributed to every issue of the Daily Bulletin and to all of the Africa digital-policy maps published during my tenure.',
        'Supported delivery of ADPI trainings — the Africa Data Protection Course and the CIPP/E certification.',
        'Chaired the ALTF 2023 hackathon on digital trade under the AfCFTA, which produced 11 shortlisted innovations.',
        'Co-organised the Boda-Boda Law Project field research in Kisumu and Namanga and contributed to the published report.',
    ].join('|')).split('|').map((p) => p.trim()).filter(Boolean)

    const teamTitle = getSetting('about_team_title', 'One continuous thread, concept to production')
    const teamSubtitle = getSetting('about_team_subtitle', 'Every project is designed, built, deployed and administered as one continuous piece of work — no hand-offs between teams, no context dropped between phases, one point of accountability. OKJTechnologies is deliberately a one-person studio.')
    const ctaTitle = getSetting('about_cta_title', 'Have a system you want built end to end?')
    const ctaSubtitle = getSetting('about_cta_subtitle', "Whether it's a customer-facing application, an internal dashboard, or a national-scale concept still at problem-statement stage, I'd like to hear about it. Start with a short brief and we'll map the ecosystem together.")

    const bgMission = getSetting('bg_about_mission')
    const bgLawyersHub = getSetting('bg_about_lawyers_hub')
    const bgValues = getSetting('bg_about_values')
    const bgTeam = getSetting('bg_about_team')
    const bgCta = getSetting('bg_about_cta')

    return (
        <BaseLayout
            navSections={ABOUT_NAV_SECTIONS}
            heroMedia={heroMedia}
            tagline={tagline}
            title={title.replace(/\n/g, '<br />')}
            subtitle={story}
            loading={mediaLoading}
        >
            {/* Mission */}
            <ParallaxSection
                id="about-mission"
                bgMedia={bgMission}
                heightClass="min-h-[200vh]"
                contentMaxWidth="max-w-[1400px]"
            >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-20 items-center w-full">
                    <FadeIn direction="left" distance={30}>
                        <span className="text-primary font-bold text-sm uppercase tracking-[0.2em] mb-4 block">Our Mission</span>
                        <h2 className="text-3xl md:text-5xl font-bold text-white mb-8 leading-tight">{missionTitle}</h2>
                        <p className="text-white/70 text-base md:text-lg leading-relaxed mb-6">{missionText1}</p>
                        <p className="text-white/70 text-base md:text-lg leading-relaxed">{missionText2}</p>
                    </FadeIn>
                    <FadeIn direction="right" distance={30} delay={0.15} className="relative aspect-[4/3] overflow-hidden border border-border/50 shadow-2xl rounded-2xl">
                        <img src="/NI-Digital-Assets/strategic-advisory.jpg" alt="OKJTech Team in session" className="w-full h-full object-cover grayscale opacity-85" />
                        <div className="absolute inset-0 bg-primary/10 mix-blend-color" />
                    </FadeIn>
                </div>
            </ParallaxSection>

            {/* Lawyers Hub — LegalTech contribution record (Feb 2023 – Dec 2024) */}
            <ParallaxSection
                id="about-lawyers-hub"
                bgMedia={bgLawyersHub}
                heightClass="min-h-[220vh]"
                badgeText="EXPERIENCE"
                title={lhTitle}
                subtitle={lhBody}
                contentMaxWidth="max-w-[1100px]"
            >
                <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 gap-5 w-full" staggerDelay={0.08}>
                    {lhPoints.map((point, i) => (
                        <StaggerItem
                            key={i}
                            className="flex items-start gap-4 bg-black/20 border border-white/5 p-6 rounded-2xl hover:border-primary/30 transition-all"
                        >
                            <span className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                                <Check className="h-4 w-4 text-primary" />
                            </span>
                            <p className="text-white/75 leading-relaxed text-sm">{point}</p>
                        </StaggerItem>
                    ))}
                </StaggerContainer>
            </ParallaxSection>

            {/* Values */}
            <ParallaxSection
                id="about-values"
                bgMedia={bgValues}
                heightClass="min-h-[220vh]"
                badgeText="HOW WE WORK"
                title="Our Core Values"
                contentMaxWidth="max-w-[1400px]"
            >
                <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full" staggerDelay={0.08}>
                        {values?.map((val) => {
                            const IconComponent = (iconMap as any)[val.icon || 'Shield'] || (iconMap as any).Shield
                            return (
                                <StaggerItem key={val.id} className="bg-black/20 border border-white/5 p-8 hover:border-primary/30 transition-all group rounded-2xl">
                                    <div className="w-12 h-12 bg-primary/5 border border-primary/10 flex items-center justify-center mb-8 group-hover:bg-primary group-hover:text-black transition-all duration-300 rounded-xl">
                                        <IconComponent className="h-6 w-6 text-primary group-hover:text-black transition-colors" />
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-4">{val.title}</h3>
                                    <p className="text-white/70 leading-relaxed text-sm">{val.description}</p>
                                </StaggerItem>
                            )
                        })}
                </StaggerContainer>
            </ParallaxSection>

            {/* Team */}
            <ParallaxSection
                id="about-team"
                bgMedia={bgTeam}
                heightClass="min-h-[220vh]"
                badgeText="OUR TEAM"
                title={teamTitle}
                subtitle={teamSubtitle}
                contentMaxWidth="max-w-[1400px]"
            >
                <HorizontalCarousel className="h-full">
                    {team?.map((member) => (
                        <Dialog key={member.id}>
                            <DialogTrigger asChild>
                                <div className="h-full w-full cursor-pointer">
                                    <CarouselCard
                                        title={member.name}
                                        description={member.role}
                                        image={member.image}
                                    />
                                </div>
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
                                </div>
                            </DialogContent>
                        </Dialog>
                    ))}
                </HorizontalCarousel>
            </ParallaxSection>

            {/* CTA */}
            <ParallaxSection
                id="about-cta"
                bgMedia={bgCta}
                heightClass="min-h-[170vh]"
                contentMaxWidth="max-w-[1400px]"
                title={ctaTitle}
                subtitle={ctaSubtitle}
                cta={{ label: 'Request a Quote', href: '/contact' }}
            />
        </BaseLayout>
    )
}
