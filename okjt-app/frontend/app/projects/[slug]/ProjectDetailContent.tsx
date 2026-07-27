"use client"

import DetailLayout from '@/components/DetailLayout'
import { Rocket } from 'lucide-react'
import { getMediaUrl } from '@/lib/utils'

export default function ProjectDetailContent({
    project,
    relatedProjects,
    slug
}: {
    project: any
    relatedProjects: any[]
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
            significantFigure={project?.significant_figure}
            significantFigureLabel={isClient ? 'Impact Result' : 'Key Impact'}
            category={project?.category}
            categoryLabel={isClient ? 'Sector' : 'Ecosystem'}

            // Content
            description={project?.description}
            challengeTitle={isClient ? 'the challenge' : 'the problem'}
            challengeHtml={project?.problem}
            approachTitle={isClient ? 'strategic approach' : 'our approach'}
            approachHtml={project?.methodology}
            impactTitle={isClient ? 'tangible impact' : 'objective'}
            impactHtml={project?.outcome}

            // Sidebar
            sidebarStackTitle={isClient ? 'Architecture' : 'Integrated Stack'}
            technologies={project?.technologies}
            fallbackStackText={isClient ? 'Proprietary Architecture' : 'Proprietary IP'}

            primaryActionUrl={project?.url}
            primaryActionLabel={isClient ? 'Visit Website' : 'Launch Product'}
            primaryActionIcon={isClient ? undefined : Rocket}
            secondaryActionLabel={isClient ? 'Request Similar Work' : 'Inquire for Bespoke Ops'}

            focusAreasTitle={isClient ? 'Focus Areas' : 'Product DNA'}
            focusAreas={isClient
                ? ['Digital Transformation', 'Workflow Automation', 'UI/UX Optimization']
                : ['Architectural Scalability', 'Enterprise-Grade Security', 'User-Centric Engineering']
            }

            // Testimonial
            testimonialQuote={project?.testimonial_quote}
            testimonialAuthor={project?.testimonial_author || (isClient ? 'Client Representative' : 'Product Lead')}
            testimonialLabel={isClient ? 'Verified Client Impact' : 'Innovation Highlight'}

            // Gallery
            galleryTitle={isClient ? 'Project Gallery' : 'Interface Showcase'}
            galleryTagline={isClient ? 'Visual Showcase' : 'Design System View'}
            gallery={project?.gallery}

            // Related
            relatedTitle={isClient ? 'Explore Related Projects' : 'Other Flagship Engineering'}
            relatedAllLabel="All Projects"
            relatedAllLink="/projects"
            relatedItems={relatedProjects}
            relatedLinkPrefix="/projects"
            getRelatedImage={(item) => getMediaUrl(item.image)}
            getRelatedTagline={(item) => item.tagline}
        />
    )
}
