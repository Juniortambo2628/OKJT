"use client"

import React from 'react'
import { useParams } from 'next/navigation'
import { useApi } from '@/hooks/use-api'
import DetailLayout from '@/components/DetailLayout'
import { Rocket } from 'lucide-react'
import { getMediaUrl } from '@/lib/utils'

export default function FlagshipProjectDetailPage() {
    const params = useParams()
    const slug = params?.slug as string
    const { data: project, isLoading, isError } = useApi(slug ? `/innovations/${slug}` : null)
    const { data: allProjects } = useApi('/innovations')

    const relatedProjects = React.useMemo(() => {
        return allProjects?.filter((p: any) => p.slug !== slug && p.id !== project?.id).slice(0, 2) || []
    }, [allProjects, slug, project?.id])

    return (
        <DetailLayout
            isLoading={isLoading}
            isError={isError || (!isLoading && !project)}
            notFoundTitle="Innovation Not Found"
            backLink="/projects"
            backLinkLabel="Back to Innovations"
            loadingLabel="Launching innovation..."
            
            // Hero
            tagline={project?.tagline || 'OKJTech Flagship Innovation'}
            title={project?.title || ''}
            breadcrumbs={[
                { label: 'Innovations', href: '/projects' },
                { label: project?.title || '' }
            ]}
            socialShareType="projects"
            slug={slug}
            
            // Metrics
            significantFigure={project?.significant_figure}
            significantFigureLabel="Key Impact"
            category={project?.category}
            categoryLabel="Ecosystem"
            
            // Content
            description={project?.description}
            challengeTitle="The Gap in the Market"
            challengeHtml={project?.problem}
            approachTitle="Engineering Excellence"
            approachHtml={project?.methodology}
            impactTitle="Commercial Success"
            impactHtml={project?.outcome}
            
            // Sidebar
            sidebarStackTitle="Integrated Stack"
            technologies={project?.technologies}
            fallbackStackText="Proprietary IP"
            
            primaryActionUrl={project?.url}
            primaryActionLabel="Launch Product"
            primaryActionIcon={Rocket}
            secondaryActionLabel="Inquire for Bespoke Ops"
            
            focusAreasTitle="Product DNA"
            focusAreas={['Architectural Scalability', 'Enterprise-Grade Security', 'User-Centric Engineering']}
            
            // Testimonial
            testimonialQuote={project?.testimonial_quote}
            testimonialAuthor={project?.testimonial_author || 'Product Lead'}
            testimonialLabel="Innovation Highlight"
            
            // Gallery
            galleryTitle="Interface Showcase"
            galleryTagline="Design System View"
            gallery={project?.gallery}
            
            // Related
            relatedTitle="Other Flagship Engineering"
            relatedAllLabel="All Innovations"
            relatedAllLink="/projects"
            relatedItems={relatedProjects}
            relatedLinkPrefix="/projects"
            getRelatedImage={(item) => getMediaUrl(item.image)}
            getRelatedTagline={(item) => item.tagline}
        />
    )
}
