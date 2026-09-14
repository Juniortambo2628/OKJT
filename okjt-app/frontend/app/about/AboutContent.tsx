"use client"

import React from 'react'
import { useSettings } from '@/hooks/use-settings'
import { useApi } from '@/hooks/use-api'
import Link from 'next/link'
import { Linkedin, Check, ArrowRight } from 'lucide-react'
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

    const expTitle = getSetting('about_experience_title', 'Where the capability was built')
    const expSubtitle = getSetting('about_experience_subtitle', 'Selected work across the disciplines that shape every OKJTech engagement — each linked to the project it powers.')

    // Categories: sub-areas of demonstrated capability. Each item links to a project or insight.
    // Kept as a static shape here so the fallback holds when the CMS is briefly unreachable;
    // CMS drives the values via `about_experience_categories` (JSON) once configured.
    type ExpCategory = { key: string, label: string, items: { title: string, summary: string, href: string, tag?: string }[] }
    const defaultCategories: ExpCategory[] = [
        {
            key: 'digital-policy',
            label: 'Digital Policy',
            items: [
                { title: 'Lawyers Hub Digital Policy site', summary: 'Cornerstone Kenya digital-policy resource — architecture, engineering, ongoing administration.', href: '/projects', tag: 'Platform' },
                { title: 'Africa Law Tech Festival platform', summary: 'Online ticketing, live notifications, event mapping — annual festival, continental audience.', href: '/projects', tag: 'Event tech' },
                { title: 'ADPI training delivery', summary: 'Delivered the Africa Data Protection Course and the CIPP/E certification programme.', href: '/projects', tag: 'Training' },
            ],
        },
        {
            key: 'ui-ux',
            label: 'UI / UX',
            items: [
                { title: 'Najenga — construction coordination', summary: 'Annotate architectural drawings, run project timelines, OCR PDFs, export to Excel, chat with @mentions.', href: '/projects/najenga-construction-collaboration-platform', tag: 'Product' },
                { title: 'Naoa — digital wedding platform', summary: 'End-to-end experience: invitations, RSVPs, gifting, live guest updates.', href: '/projects', tag: 'Product' },
                { title: 'Tibu — HealthTech interface', summary: 'Interface design for clinical workflows across desktop and mobile touchpoints.', href: '/projects', tag: 'Interface' },
            ],
        },
        {
            key: 'engineering',
            label: 'Web Engineering',
            items: [
                { title: 'Laravel + Next.js flagship stack', summary: 'Schema-first backends, typed APIs, App Router frontends — auth, admin, background jobs, deploys.', href: '/services', tag: 'Stack' },
                { title: 'Deployment & administration', summary: 'cPanel + domain admin, CI to production, monitoring and ongoing maintenance.', href: '/services', tag: 'Ops' },
            ],
        },
        {
            key: 'ecosystem',
            label: 'Ecosystem Strategy',
            items: [
                { title: 'Ecosystem mapping practice', summary: 'Stakeholder mapping before scoping — client, user, regulator, partner, community — each with an aligned reason to participate.', href: '/our-approach', tag: 'Method' },
                { title: 'Boda-Boda Law Project', summary: 'Co-organised field research in Kisumu and Namanga; contributed to the published report.', href: '/projects', tag: 'Research' },
            ],
        },
    ]

    const configuredCategoriesRaw = getSetting('about_experience_categories', '')
    const categories = React.useMemo<ExpCategory[]>(() => {
        try {
            if (configuredCategoriesRaw && typeof configuredCategoriesRaw === 'string') {
                const parsed = JSON.parse(configuredCategoriesRaw)
                if (Array.isArray(parsed) && parsed.length > 0) return parsed as ExpCategory[]
            } else if (Array.isArray(configuredCategoriesRaw)) {
                return configuredCategoriesRaw as any
            }
        } catch { /* fall through to default */ }
        return defaultCategories
    }, [configuredCategoriesRaw])

    const [activeCategory, setActiveCategory] = React.useState<string>(categories[0]?.key ?? '')
    React.useEffect(() => {
        if (!categories.find((c) => c.key === activeCategory) && categories[0]) {
            setActiveCategory(categories[0].key)
        }
    }, [categories, activeCategory])
    const activeItems = categories.find((c) => c.key === activeCategory)?.items ?? []

    const teamTitle = getSetting('about_team_title', 'One continuous thread, concept to production')
    const teamSubtitle = getSetting('about_team_subtitle', 'Every project is designed, built, deployed and administered as one continuous piece of work — no hand-offs between teams, no context dropped between phases, one point of accountability. OKJTechnologies is deliberately a one-person studio.')

    const bgMission = getSetting('bg_about_mission')
    // Kept for CMS backwards-compat: existing key drives the experience section background
    const bgExperience = getSetting('bg_about_experience', getSetting('bg_about_lawyers_hub'))
    const bgValues = getSetting('bg_about_values')
    const bgTeam = getSetting('bg_about_team')

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

            {/* Experience — categorized capability with links back to projects */}
            <ParallaxSection
                id="about-experience"
                bgMedia={bgExperience}
                heightClass="min-h-[220vh]"
                badgeText="EXPERIENCE"
                title={expTitle}
                subtitle={expSubtitle}
                contentMaxWidth="max-w-[1400px]"
            >
                <div className="w-full h-full flex flex-col min-h-0">
                    <div className="flex flex-wrap gap-2 mb-6 flex-shrink-0">
                        {categories.map((cat) => (
                            <button
                                key={cat.key}
                                onClick={() => setActiveCategory(cat.key)}
                                className={`px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest transition-all ${
                                    activeCategory === cat.key
                                        ? 'bg-primary text-[#14110b]'
                                        : 'bg-white/5 text-white/70 border border-white/10 hover:bg-white/10'
                                }`}
                            >
                                {cat.label}
                            </button>
                        ))}
                    </div>
                    <StaggerContainer key={activeCategory} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 flex-1 min-h-0 overflow-hidden" staggerDelay={0.06}>
                        {activeItems.map((it, i) => (
                            <StaggerItem
                                key={i}
                                className="group bg-black/20 border border-white/5 p-6 rounded-2xl hover:border-primary/30 transition-all flex flex-col"
                            >
                                {it.tag && (
                                    <span className="text-primary text-[10px] font-bold uppercase tracking-widest mb-3">{it.tag}</span>
                                )}
                                <h3 className="text-white font-bold text-base mb-2 leading-tight">{it.title}</h3>
                                <p className="text-white/70 text-sm leading-relaxed mb-4 flex-1">{it.summary}</p>
                                <Link href={it.href} className="text-primary text-xs font-bold uppercase tracking-widest inline-flex items-center gap-1 mt-auto group-hover:underline">
                                    View <Check className="h-3 w-3 opacity-0 transition-opacity" />
                                    <ArrowRight className="h-3 w-3" />
                                </Link>
                            </StaggerItem>
                        ))}
                    </StaggerContainer>
                </div>
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
                <HorizontalCarousel className="h-full">
                    {values?.map((val) => {
                        const IconComponent = (iconMap as any)[val.icon || 'Shield'] || (iconMap as any).Shield
                        return (
                            <div key={val.id} className="h-full w-full bg-black/20 border border-white/5 p-8 hover:border-primary/30 transition-all group rounded-2xl flex flex-col">
                                <div className="w-12 h-12 bg-primary/5 border border-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-black transition-all duration-300 rounded-xl shrink-0">
                                    <IconComponent className="h-6 w-6 text-primary group-hover:text-black transition-colors" />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-3">{val.title}</h3>
                                <p className="text-white/70 leading-relaxed text-sm">{val.description}</p>
                            </div>
                        )
                    })}
                </HorizontalCarousel>
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

        </BaseLayout>
    )
}
