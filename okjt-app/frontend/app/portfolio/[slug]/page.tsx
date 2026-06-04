"use client"

import React from 'react'
import { useParams } from 'next/navigation'
import { useApi } from '@/hooks/use-api'
import DetailLayout from '@/components/DetailLayout'

export default function CaseStudyDetailPage() {
    const params = useParams()
    const slug = params?.slug as string
    const { data: caseStudy, isLoading, isError } = useApi(slug ? `/case-studies/${slug}` : null)
    const { data: allCaseStudies } = useApi('/case-studies')

    const relatedStudies = React.useMemo(() => {
        return allCaseStudies?.filter((cs: any) => cs.slug !== slug && cs.category === caseStudy?.category).slice(0, 2) || []
    }, [allCaseStudies, slug, caseStudy?.category])

    return (
        <DetailLayout
            isLoading={isLoading}
            isError={isError || (!isLoading && !caseStudy)}
            notFoundTitle="Case Study Not Found"
            backLink="/portfolio"
            backLinkLabel="Back to Case Studies"
            loadingLabel="Retrieving case study..."
            
            // Hero
            tagline={caseStudy?.client_name || ''}
            title={caseStudy?.title || ''}
            breadcrumbs={[
                { label: 'Portfolio', href: '/portfolio' },
                { label: caseStudy?.title || '' }
            ]}
            socialShareType="case-studies"
            slug={slug}
            
            // Metrics
            significantFigure={caseStudy?.significant_figure}
            significantFigureLabel="Impact Result"
            category={caseStudy?.category}
            categoryLabel="Sector"
            
            // Content
            description={caseStudy?.description}
            challengeTitle="The Challenge"
            challengeHtml={caseStudy?.problem}
            approachTitle="Strategic Approach"
            approachHtml={caseStudy?.methodology}
            impactTitle="Tangible Impact"
            impactHtml={caseStudy?.outcome}
            
            // Sidebar
            sidebarStackTitle="Architecture"
            technologies={caseStudy?.technologies}
            fallbackStackText="Proprietary Architecture"
            
            primaryActionUrl={caseStudy?.website_url}
            primaryActionLabel="Visit Website"
            secondaryActionLabel="Request Similar Work"
            
            focusAreasTitle="Focus Areas"
            focusAreas={['Digital Transformation', 'Workflow Automation', 'UI/UX Optimization']}
            
            // Testimonial
            testimonialQuote={caseStudy?.testimonial_quote}
            testimonialAuthor={caseStudy?.testimonial_author || 'Client Representative'}
            testimonialLabel="Verified Client Impact"
            
            // Gallery
            galleryTitle="Project Gallery"
            galleryTagline="Visual Showcase"
            gallery={caseStudy?.gallery}
            
            // Related
            relatedTitle="Explore Related Projects"
            relatedAllLabel="All Projects"
            relatedAllLink="/portfolio"
            relatedItems={relatedStudies}
            relatedLinkPrefix="/portfolio"
        />
    )
}
