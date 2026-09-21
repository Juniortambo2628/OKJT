import React from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, Globe, Quote, CheckCircle2, ChevronRight, LayoutGrid } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import SocialShare from '@/components/SocialShare'
import FadeIn from '@/components/animations/FadeIn'
import { StaggerContainer, StaggerItem } from '@/components/animations/Stagger'
import ParallaxSection from '@/components/ParallaxSection'
import BaseLayout from '@/components/BaseLayout'
import PrimaryButton from '@/components/PrimaryButton'
import HorizontalCarousel from '@/components/ui/HorizontalCarousel'

/**
 * Compact action strip pinned to the top of the snapshot card. Keeps the two
 * project CTAs (visit + get in touch) within reach without stealing image
 * space, and never expands the card past 75vh.
 */
function CardActionRow({
    primaryActionUrl,
    primaryActionLabel,
    PrimaryActionIcon,
    secondaryActionLabel,
}: {
    primaryActionUrl?: string
    primaryActionLabel?: string
    PrimaryActionIcon: React.ComponentType<{ size?: number }>
    secondaryActionLabel?: string
}) {
    if (!primaryActionUrl && !secondaryActionLabel) return null
    return (
        <div className="absolute top-3 left-3 right-3 z-20 flex items-center justify-between gap-2 pointer-events-none">
            <div className="flex gap-2 pointer-events-auto">
                {primaryActionUrl && primaryActionLabel && (
                    <PrimaryButton
                        href={primaryActionUrl}
                        showArrow={false}
                        size="sm"
                        className="h-9 gap-1.5 px-3 font-bold uppercase tracking-widest text-[10px] bg-primary text-[#14110b] hover:bg-primary/90"
                    >
                        <PrimaryActionIcon size={12} /> {primaryActionLabel}
                    </PrimaryButton>
                )}
                {secondaryActionLabel && (
                    <PrimaryButton
                        href="/contact"
                        variant="outline"
                        showArrow={false}
                        size="sm"
                        className="h-9 gap-1.5 px-3 font-bold uppercase tracking-widest text-[10px] border-white/20 bg-black/40 text-white/85 hover:text-white hover:border-primary"
                    >
                        {secondaryActionLabel} <ArrowRight size={12} />
                    </PrimaryButton>
                )}
            </div>
        </div>
    )
}

interface DetailLayoutProps {
    isLoading: boolean
    isError: boolean
    notFoundTitle: string
    backLink: string
    backLinkLabel: string
    loadingLabel: string
    
    // Page Hero
    heroMedia?: string
    projectImage?: string
    tagline: string
    title: string
    breadcrumbs: { label: string; href?: string }[]
    socialShareType: "projects" | "insights"
    slug: string
    
    // Overview metrics
    significantFigure?: string
    significantFigureLabel?: string
    category?: string
    categoryLabel?: string
    
    // Content body
    description?: string
    challengeTitle: string
    challengeHtml?: string
    approachTitle: string
    approachHtml?: string
    impactTitle: string
    impactHtml?: string
    
    // Sidebar stack
    sidebarStackTitle: string
    technologies?: string[] | null
    fallbackStackText?: string
    
    // Sidebar actions
    primaryActionUrl?: string
    primaryActionLabel?: string
    primaryActionIcon?: React.ComponentType<{ size?: number }>
    secondaryActionLabel?: string
    
    // Sidebar Focus
    focusAreasTitle: string
    focusAreas: string[]
    
    // Testimonial
    testimonialQuote?: string
    testimonialAuthor?: string
    testimonialLabel?: string
    
    // Gallery
    galleryTitle?: string
    galleryTagline?: string
    gallery?: string[]
    
    // Related items
    relatedTitle: string
    relatedAllLabel: string
    relatedAllLink: string
    relatedItems?: { id: number; image?: string; client_name?: string; tagline?: string; slug?: string }[]
    relatedLinkPrefix: string
    getRelatedImage?: (item: { id: number; image?: string }) => string
    getRelatedTagline?: (item: { id: number; client_name?: string; tagline?: string }) => string
}

export default function DetailLayout({
    isLoading,
    isError,
    notFoundTitle,
    backLink,
    backLinkLabel,
    loadingLabel,
    heroMedia,
    projectImage,
    tagline,
    title,
    breadcrumbs,
    socialShareType,
    slug,
    significantFigure,
    significantFigureLabel = 'Impact Result',
    category,
    categoryLabel = 'Sector',
    description,
    challengeTitle,
    challengeHtml,
    _approachTitle,
    _approachHtml,
    impactTitle,
    impactHtml,
    _sidebarStackTitle,
    technologies,
    _fallbackStackText = 'Proprietary Architecture',
    primaryActionUrl,
    primaryActionLabel,
    primaryActionIcon: PrimaryActionIcon = Globe,
    secondaryActionLabel = 'Request Similar Work',
    focusAreasTitle,
    focusAreas,
    testimonialQuote,
    testimonialAuthor = 'Client Representative',
    testimonialLabel = 'Verified Client Impact',
    galleryTitle = 'Project Gallery',
    galleryTagline = 'Visual Showcase',
    gallery,
    relatedTitle,
    relatedAllLabel,
    relatedAllLink,
    relatedItems,
    relatedLinkPrefix,
    getRelatedImage,
    getRelatedTagline,
}: DetailLayoutProps) {

    const navSections = React.useMemo(() => {
        const sections = [
            { id: 'hero', label: 'Intro' },
            { id: 'details-overview', label: 'Overview' }
        ]
        if (testimonialQuote) {
            sections.push({ id: 'details-testimonial', label: 'Testimonial' })
        }
        if (gallery && gallery.length > 0) {
            sections.push({ id: 'details-gallery', label: 'Showcase' })
        }
        if (relatedItems && relatedItems.length > 0) {
            sections.push({ id: 'details-related', label: 'Related' })
        }
        return sections
    }, [testimonialQuote, gallery, relatedItems])

    const heroChildren = (
        <div className="flex flex-col gap-6 pt-8 border-t border-white/10">
            <div className="flex flex-wrap items-center gap-8">
                {significantFigure && (
                    <div className="flex flex-col">
                        <span className="text-[10px] text-white/50 uppercase tracking-widest mb-1">{significantFigureLabel}</span>
                        <span className="text-2xl font-mono text-primary font-bold">{significantFigure}</span>
                    </div>
                )}
                {category && (
                    <div className="flex flex-col">
                        <span className="text-[10px] text-white/50 uppercase tracking-widest mb-1">{categoryLabel}</span>
                        <span className="text-white font-bold">{category}</span>
                    </div>
                )}
                {focusAreas && focusAreas.length > 0 && (
                    <div className="flex flex-col gap-2">
                        <span className="text-[10px] text-white/50 uppercase tracking-widest">{focusAreasTitle}</span>
                        <ul className="flex flex-wrap gap-x-5 gap-y-1.5">
                            {focusAreas.map((item, i) => (
                                <li key={i} className="flex items-center gap-2 text-sm text-white/80">
                                    <CheckCircle2 size={14} className="text-primary flex-shrink-0" />
                                    <span>{item}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
                <div className="ml-auto">
                    <SocialShare title={title} slug={slug} type={socialShareType} />
                </div>
            </div>
        </div>
    )

    if (isLoading) {
        return (
            <BaseLayout>
                <div className="flex-1 flex items-center justify-center pt-32">
                    <div className="text-muted-foreground/50 text-lg animate-pulse">{loadingLabel}</div>
                </div>
            </BaseLayout>
        )
    }

    if (isError || !title) {
        return (
            <BaseLayout>
                <div className="flex-1 flex items-center justify-center pt-32">
                    <div className="text-center">
                        <h1 className="text-4xl font-bold text-foreground mb-4">{notFoundTitle}</h1>
                        <PrimaryButton href={backLink} variant="outline">{backLinkLabel}</PrimaryButton>
                    </div>
                </div>
            </BaseLayout>
        )
    }

    return (
        <BaseLayout
            navSections={navSections}
            heroMedia={heroMedia}
            tagline={tagline}
            title={title}
            subtitle={description}
            breadcrumbs={breadcrumbs}
            heroChildren={heroChildren}
        >
            {/* Overview / Content sections — three horizontal cards, each with
                the primary and secondary actions in its own header. */}
            <ParallaxSection
                id="details-overview"
                bgMedia={heroMedia}
                heightClass="min-h-[140vh]"
                contentMaxWidth="max-w-[1400px]"
            >
                <HorizontalCarousel
                    className="h-full"
                    slotClassName={(index) => index === 0
                        ? 'w-[calc(38%-0.5rem)]'
                        : 'w-[calc(62%-0.5rem)]'
                    }
                >
                    {/* Card 1 — Overview: image + stack badges above title +
                        description, all pulled up so long text stays inside. */}
                    <div className="h-full w-full rounded-2xl overflow-hidden border border-white/10 bg-black/40 shadow-lg relative flex flex-col">
                        <CardActionRow
                            primaryActionUrl={primaryActionUrl}
                            primaryActionLabel={primaryActionLabel}
                            PrimaryActionIcon={PrimaryActionIcon}
                            secondaryActionLabel={secondaryActionLabel}
                        />
                        <div className="relative flex-1 min-h-0">
                            {projectImage ? (
                                <Image src={projectImage} alt={title} fill className="object-cover" />
                            ) : (
                                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-black/40 to-black/60" />
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/75 to-black/25" />
                            <div className="absolute inset-x-0 bottom-0 top-16 p-5 flex flex-col justify-end gap-3">
                                {technologies && Array.isArray(technologies) && technologies.length > 0 && (
                                    <div className="flex flex-wrap gap-1.5">
                                        {technologies.map((tech: string, i: number) => (
                                            <span
                                                key={i}
                                                className="px-2 py-0.5 bg-white/5 text-primary text-[9px] font-bold uppercase tracking-widest border border-white/10 rounded"
                                            >
                                                {tech}
                                            </span>
                                        ))}
                                    </div>
                                )}
                                <div>
                                    <h3 className="text-white text-lg font-bold mb-2 line-clamp-2">{title}</h3>
                                    {description && (
                                        <div
                                            className="text-[13px] text-white/80 leading-relaxed prose prose-invert max-w-none prose-p:text-white/80 prose-p:text-[13px] prose-p:my-1 line-clamp-[7]"
                                            dangerouslySetInnerHTML={{ __html: description }}
                                        />
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Card 2 — Scope: challenge + solution. Wider slot so the
                        content rarely needs to scroll. */}
                    <div className="h-full w-full rounded-2xl bg-black/30 border border-white/10 p-6 md:p-8 flex flex-col">
                        <div className="flex items-center gap-2 mb-4 flex-shrink-0">
                            <span className="text-primary text-[10px] font-bold uppercase tracking-widest">Scope</span>
                        </div>
                        <div className="overflow-y-auto custom-scrollbar pr-2 flex-1 min-h-0 grid grid-cols-1 md:grid-cols-2 gap-6">
                            {challengeHtml && (
                                <div>
                                    <div className="inline-block px-3 py-1 bg-white/10 border border-white/15 text-primary text-xs font-semibold rounded-full mb-3 uppercase tracking-widest">
                                        {challengeTitle}
                                    </div>
                                    <div
                                        className="text-white/75 leading-relaxed text-sm md:text-[15px] font-light prose dark:prose-invert max-w-none prose-p:text-white/75 prose-strong:text-white"
                                        dangerouslySetInnerHTML={{ __html: challengeHtml }}
                                    />
                                </div>
                            )}
                            {impactHtml && (
                                <div>
                                    <div className="inline-block px-3 py-1 bg-white/10 border border-white/15 text-primary text-xs font-semibold rounded-full mb-3 uppercase tracking-widest">
                                        {impactTitle}
                                    </div>
                                    <div
                                        className="text-white/75 leading-relaxed text-sm md:text-[15px] font-light prose dark:prose-invert max-w-none prose-p:text-white/75 prose-strong:text-white"
                                        dangerouslySetInnerHTML={{ __html: impactHtml }}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </HorizontalCarousel>
            </ParallaxSection>

            {/* Testimonial Section */}
            {testimonialQuote && (
                <ParallaxSection
                    id="details-testimonial"
                    heightClass="min-h-[120vh]"
                >
                    <div className="max-w-[800px] mx-auto text-center">
                        <Quote className="h-12 w-12 text-primary/25 mx-auto mb-8" />
                        <div 
                            className="text-xl md:text-2xl font-light text-white leading-relaxed italic mb-8 prose prose-invert max-w-none prose-p:italic prose-p:text-white"
                            dangerouslySetInnerHTML={{ __html: testimonialQuote }}
                        />
                        <div>
                            <div className="text-white font-bold">{testimonialAuthor}</div>
                            <div className="text-primary text-[10px] font-bold uppercase tracking-widest mt-1">{testimonialLabel}</div>
                        </div>
                    </div>
                </ParallaxSection>
            )}

            {/* Gallery Section */}
            {gallery && gallery.length > 0 && (
                <ParallaxSection
                    id="details-gallery"
                    heightClass="min-h-[120vh]"
                    badgeText={galleryTagline}
                    title={galleryTitle}
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
                        {gallery.map((img: string, i: number) => (
                            <motion.div 
                                key={i}
                                initial={{ opacity: 0, scale: 0.95 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className={`relative aspect-video overflow-hidden border border-white/5 group h-full rounded-2xl ${i === 0 ? 'md:col-span-2' : ''}`}
                            >
                                <Image 
                                    src={img} 
                                    alt={`Gallery Image ${i + 1}`} 
                                    fill 
                                    className="object-cover transition-transform duration-700 group-hover:scale-105 opacity-80 group-hover:opacity-95" 
                                />
                                <div className="absolute inset-0 bg-background/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <div className="w-12 h-12 bg-primary text-background flex items-center justify-center rounded-full">
                                        <LayoutGrid size={20} />
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </ParallaxSection>
            )}

            {/* Related Content */}
            {relatedItems && relatedItems.length > 0 && (
                <ParallaxSection
                    id="details-related"
                    heightClass="min-h-[120vh]"
                >
                    <div className="max-w-[1200px] mx-auto w-full">
                        <FadeIn direction="up" distance={20} className="flex items-center justify-between mb-12">
                            <h2 className="text-2xl md:text-3xl font-bold text-white">{relatedTitle}</h2>
                            <Link href={relatedAllLink} className="text-primary text-xs font-bold uppercase tracking-widest hover:underline flex items-center gap-2">
                                {relatedAllLabel} <ChevronRight size={14} />
                            </Link>
                        </FadeIn>
                        <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 gap-10" staggerDelay={0.1}>
                            {relatedItems.map((item: { id: number; image?: string; client_name?: string; tagline?: string; slug?: string }) => {
                                const imgSrc = getRelatedImage ? getRelatedImage(item) : item.image;
                                const taglineText = getRelatedTagline ? getRelatedTagline(item) : (item.client_name || item.tagline);
                                return (
                                    <StaggerItem key={item.id}>
                                        <Link href={`${relatedLinkPrefix}/${item.slug}`} className="group block relative aspect-[21/9] overflow-hidden border border-white/5 rounded-2xl bg-black/20">
                                        {imgSrc && (
                                            <Image src={imgSrc} alt={item.title} fill className="object-cover opacity-60 group-hover:opacity-20 transition-all duration-700" />
                                        )}
                                        <div className="absolute inset-0 p-8 flex flex-col justify-end bg-gradient-to-t from-black via-black/40 to-transparent">
                                            <span className="text-primary font-bold text-[9px] uppercase tracking-widest mb-2">{taglineText}</span>
                                            <h3 className="text-xl md:text-2xl font-bold text-white group-hover:text-primary transition-colors">{item.title}</h3>
                                            <div className="flex items-center gap-2 text-primary opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0 transition-all duration-300 mt-2">
                                                <span className="text-[10px] font-bold uppercase">View Details</span>
                                                <ArrowRight size={14} />
                                            </div>
                                            </div>
                                        </Link>
                                    </StaggerItem>
                                );
                            })}
                        </StaggerContainer>
                    </div>
                </ParallaxSection>
            )}
        </BaseLayout>
    )
}
