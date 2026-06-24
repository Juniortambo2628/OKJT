import React from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import { ArrowRight, Globe, Code2, Quote, CheckCircle2, ChevronRight, LayoutGrid } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import SocialShare from '@/components/SocialShare'
import PageHero from '@/components/PageHero'
import ParallaxSection from '@/components/ParallaxSection'
import ParallaxNav from '@/components/ParallaxNav'

interface DetailLayoutProps {
    isLoading: boolean
    isError: boolean
    notFoundTitle: string
    backLink: string
    backLinkLabel: string
    loadingLabel: string
    
    // Page Hero
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
    primaryActionIcon?: React.ComponentType<any>
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
    relatedItems?: any[]
    relatedLinkPrefix: string
    getRelatedImage?: (item: any) => string
    getRelatedTagline?: (item: any) => string
}

export default function DetailLayout({
    isLoading,
    isError,
    notFoundTitle,
    backLink,
    backLinkLabel,
    loadingLabel,
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
    approachTitle,
    approachHtml,
    impactTitle,
    impactHtml,
    sidebarStackTitle,
    technologies,
    fallbackStackText = 'Proprietary Architecture',
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

    if (isLoading) {
        return (
            <main className="flex min-h-screen flex-col bg-[#050a1a]">
                <Navbar />
                <div className="flex-1 flex items-center justify-center pt-32">
                    <div className="text-muted-foreground/50 text-lg animate-pulse">{loadingLabel}</div>
                </div>
                <Footer />
            </main>
        )
    }

    if (isError || !title) {
        return (
            <main className="flex min-h-screen flex-col bg-background">
                <Navbar />
                <div className="flex-1 flex items-center justify-center pt-32">
                    <div className="text-center">
                        <h1 className="text-4xl font-bold text-foreground mb-4">{notFoundTitle}</h1>
                        <Button asChild variant="outline">
                            <Link href={backLink}>{backLinkLabel}</Link>
                        </Button>
                    </div>
                </div>
                <Footer />
            </main>
        )
    }

    return (
        <main className="flex min-h-screen flex-col bg-background w-full overflow-x-hidden">
            <Navbar />

            <PageHero 
                id="hero"
                tagline={tagline}
                title={title}
                breadcrumbs={breadcrumbs}
            >
                <div className="flex flex-wrap items-center gap-8 pt-8 border-t border-white/10 mt-8">
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
                    <div className="ml-auto">
                        <SocialShare title={title} slug={slug} type={socialShareType} />
                    </div>
                </div>
            </PageHero>

            {/* Overview / Content sections */}
            <ParallaxSection
                id="details-overview"
                bgMedia="/assets/videos/services/all-services-video.mp4"
                heightClass="min-h-[220vh]"
            >
                <div className="max-w-[1200px] mx-auto px-6 w-full">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                        <div className="lg:col-span-8 space-y-12">
                            {/* Short Description Highlight */}
                            {description && (
                                <motion.div 
                                    initial={{ opacity: 0, y: 20 }} 
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    className="p-8 border-l-2 border-primary bg-black/40 backdrop-blur-md rounded-r-xl"
                                >
                                    <div 
                                        className="text-lg md:text-xl font-light text-white/90 leading-relaxed italic prose prose-invert max-w-none prose-p:italic prose-p:text-white/90"
                                        dangerouslySetInnerHTML={{ __html: description }}
                                    />
                                </motion.div>
                            )}

                            {/* Narrative Blocks */}
                            <div className="space-y-12 border border-white/5 bg-black/40 backdrop-blur-md rounded-2xl p-8 md:p-12">
                                {challengeHtml && (
                                    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                                        <h2 className="text-[10px] font-bold text-primary uppercase tracking-[0.3em] mb-6 flex items-center gap-3">
                                            <span className="w-8 h-[1px] bg-primary/30" /> {challengeTitle}
                                        </h2>
                                        <div 
                                            className="text-white/70 leading-relaxed text-sm md:text-base font-light prose dark:prose-invert max-w-none prose-p:leading-relaxed prose-p:text-white/70 prose-strong:text-white"
                                            dangerouslySetInnerHTML={{ __html: challengeHtml }} 
                                        />
                                    </motion.div>
                                )}

                                {approachHtml && (
                                    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="pt-8 border-t border-white/5">
                                        <h2 className="text-[10px] font-bold text-primary uppercase tracking-[0.3em] mb-6 flex items-center gap-3">
                                            <span className="w-8 h-[1px] bg-primary/30" /> {approachTitle}
                                        </h2>
                                        <div 
                                            className="text-white/70 leading-relaxed text-sm md:text-base font-light prose dark:prose-invert max-w-none prose-p:leading-relaxed prose-p:text-white/70 prose-strong:text-white"
                                            dangerouslySetInnerHTML={{ __html: approachHtml }} 
                                        />
                                    </motion.div>
                                )}

                                {impactHtml && (
                                    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="pt-8 border-t border-white/5">
                                        <h2 className="text-[10px] font-bold text-primary uppercase tracking-[0.3em] mb-6 flex items-center gap-3">
                                            <span className="w-8 h-[1px] bg-primary/30" /> {impactTitle}
                                        </h2>
                                        <div 
                                            className="text-white/70 leading-relaxed text-sm md:text-base font-light prose dark:prose-invert max-w-none prose-p:leading-relaxed prose-p:text-white/70 prose-strong:text-white"
                                            dangerouslySetInnerHTML={{ __html: impactHtml }} 
                                        />
                                    </motion.div>
                                )}
                            </div>
                        </div>

                        {/* Sidebar Info */}
                        <div className="lg:col-span-4">
                            <div className="sticky top-32 space-y-8">
                                <div className="p-8 bg-black/40 backdrop-blur-md border border-white/5 rounded-2xl shadow-sm">
                                    <h3 className="text-white font-bold mb-6 flex items-center gap-2">
                                        <Code2 size={18} className="text-primary" /> {sidebarStackTitle}
                                    </h3>
                                    <div className="flex flex-wrap gap-2 mb-8">
                                        {technologies && Array.isArray(technologies) ? (
                                            technologies.map((tech: string, i: number) => (
                                                <span key={i} className="px-3 py-1 bg-white/5 text-primary text-[10px] font-bold uppercase tracking-widest border border-white/5 rounded">
                                                    {tech}
                                                </span>
                                            ))
                                        ) : (
                                            <span className="text-white/50 text-xs italic">{fallbackStackText}</span>
                                        )}
                                    </div>

                                    <div className="space-y-4 pt-6 border-t border-white/5">
                                        {primaryActionUrl && primaryActionLabel && (
                                            <Button asChild className="w-full h-12 gap-2 font-bold uppercase tracking-widest text-[10px] bg-primary text-[#14110b] hover:bg-primary/90">
                                                <a href={primaryActionUrl} target="_blank">
                                                    <PrimaryActionIcon size={14} /> {primaryActionLabel}
                                                </a>
                                            </Button>
                                        )}
                                        <Button asChild variant="outline" className="w-full h-12 gap-2 font-bold uppercase tracking-widest text-[10px] rounded-none border-white/10 bg-transparent text-white/80 hover:text-white hover:border-primary">
                                            <Link href="/contact">{secondaryActionLabel} <ArrowRight size={14} /></Link>
                                        </Button>
                                    </div>
                                </div>

                                {/* Focus / DNA List */}
                                <div className="p-8 bg-black/30 border border-white/5 rounded-2xl">
                                    <h4 className="text-xs font-bold text-white/50 uppercase tracking-widest mb-4">{focusAreasTitle}</h4>
                                    <ul className="space-y-3">
                                        {focusAreas.map((item, i) => (
                                            <li key={i} className="flex items-center gap-3 text-sm text-white/70">
                                                <CheckCircle2 size={14} className="text-primary" />
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </ParallaxSection>

            {/* Testimonial Section */}
            {testimonialQuote && (
                <ParallaxSection
                    id="details-testimonial"
                    bgMedia="/assets/videos/services/fintech-video.mp4"
                    heightClass="min-h-[170vh]"
                >
                    <div className="max-w-[800px] mx-auto px-6 text-center w-full border border-white/5 bg-black/40 backdrop-blur-md rounded-2xl p-10 md:p-12">
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
                    bgMedia="/assets/videos/services/energy-advisory.mp4"
                    heightClass="min-h-[170vh]"
                    badgeText={galleryTagline}
                    title={galleryTitle}
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full mt-8">
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
                    bgMedia="/assets/videos/services/international-diplomacy-video.mp4"
                    heightClass="min-h-[170vh]"
                >
                    <div className="max-w-[1200px] mx-auto px-6 w-full">
                        <div className="flex items-center justify-between mb-12">
                            <h2 className="text-2xl md:text-3xl font-bold text-white">{relatedTitle}</h2>
                            <Link href={relatedAllLink} className="text-primary text-xs font-bold uppercase tracking-widest hover:underline flex items-center gap-2">
                                {relatedAllLabel} <ChevronRight size={14} />
                            </Link>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            {relatedItems.map((item: any) => {
                                const imgSrc = getRelatedImage ? getRelatedImage(item) : item.image;
                                const taglineText = getRelatedTagline ? getRelatedTagline(item) : (item.client_name || item.tagline);
                                return (
                                    <Link key={item.id} href={`${relatedLinkPrefix}/${item.slug}`} className="group block relative aspect-[21/9] overflow-hidden border border-white/5 rounded-2xl bg-black/40 backdrop-blur-md">
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
                                );
                            })}
                        </div>
                    </div>
                </ParallaxSection>
            )}

            <ParallaxNav sections={navSections} />
            <Footer />
        </main>
    )
}
