"use client"

import DetailLayout from '@/components/DetailLayout'
import { Rocket } from 'lucide-react'
import { getMediaUrl } from '@/lib/utils'
import { Project } from '@/types/api'

export default function ProjectDetailContent({
    project,
    relatedProjects,
    slug
}: {
    project: Project | null
    relatedProjects: Project[]
    slug: string
}) {
    const isClient = project?.type === 'client'

    return (
        <DetailLayout
            isLoading={false}
            isError={!project}
            notFoundTitle={isClient ? 'Project Not Found' : 'Innovation Not Found'}
            backLink="/projects"
            backLinkLabel="Back to Projects"
            loadingLabel={isClient ? 'Retrieving project...' : 'Launching innovation...'}

            // Hero & Background
            heroMedia={project?.bg_image ? getMediaUrl(project.bg_image) : undefined}
            projectImage={project?.image ? getMediaUrl(project.image) : undefined}
            tagline={isClient ? (project?.client_name || '') : (project?.tagline || 'OKJTech Flagship Innovation')}
            title={project?.title || ''}
            breadcrumbs={[
                { label: 'Projects', href: '/projects' },
                { label: project?.title || '' }
            ]}
            socialShareType="projects"
            slug={slug}

            // Metrics
            significantFigure={project?.significant_figure ?? undefined}
            significantFigureLabel={isClient ? 'Impact Result' : 'Key Impact'}
            category={project?.category ?? undefined}
            categoryLabel="Sector"
            ecosystemTitle="Ecosystem"
            ecosystemHtml={project?.outcome || undefined}

            // Content
            description={project?.description ?? undefined}
            challengeTitle="Challenge"
            challengeHtml={project?.problem ?? undefined}
            impactTitle="Solution"
            impactHtml={project?.methodology ?? undefined}

            // Sidebar
            sidebarStackTitle={isClient ? 'Architecture' : 'Integrated Stack'}
            technologies={project?.technologies ?? undefined}
            fallbackStackText={isClient ? 'Proprietary Architecture' : 'Proprietary IP'}

            primaryActionUrl={project?.url ?? undefined}
            primaryActionLabel="Visit"
            primaryActionIcon={isClient ? undefined : Rocket}
            secondaryActionLabel="Get in Touch"

            focusAreasTitle="Focus Areas"
            focusAreas={(Array.isArray(project?.focus_areas) && project.focus_areas.length > 0)
                ? project.focus_areas
                : undefined
            }

            // Testimonial
            testimonialQuote={project?.testimonial_quote ?? undefined}
            testimonialAuthor={project?.testimonial_author || (isClient ? 'Client Representative' : 'Product Lead')}
            testimonialLabel={isClient ? 'Verified Client Impact' : 'Innovation Highlight'}

            // Gallery
            galleryTitle={isClient ? 'Project Gallery' : 'Interface Showcase'}
            galleryTagline={isClient ? 'Visual Showcase' : 'Design System View'}
            gallery={project?.gallery ?? undefined}

            // Related
            relatedTitle={isClient ? 'Explore Related Projects' : 'Other Flagship Engineering'}
            relatedAllLabel="All Projects"
            relatedAllLink="/projects"
            relatedItems={relatedProjects}
            relatedLinkPrefix="/projects"
            getRelatedImage={(item) => item.image ? getMediaUrl(item.image) : undefined}
            getRelatedTagline={(item) => item.tagline ?? undefined}
        />
    )
}
