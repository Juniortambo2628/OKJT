import { getProjectBySlug, getProjects } from '@/lib/server/api'
import ProjectDetailContent from './ProjectDetailContent'

export const revalidate = 60

export default async function FlagshipProjectDetailPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params
    const [project, allProjects] = await Promise.all([
        getProjectBySlug(slug),
        getProjects(),
    ])

    const relatedProjects = allProjects?.filter((p: any) => p.slug !== slug && p.id !== project?.id).slice(0, 2) || []

    return (
        <ProjectDetailContent
            project={project}
            relatedProjects={relatedProjects}
            slug={slug}
        />
    )
}
