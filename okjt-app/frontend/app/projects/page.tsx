import SWRProvider from '@/components/SWRProvider'
import { getProjects } from '@/lib/server/api'
import ProjectsContent from './ProjectsContent'

export const revalidate = 60

export default async function FlagshipProjectsPage() {
    const projects = await getProjects()

    return (
        <SWRProvider fallback={{
            '/projects': projects,
        }}>
            <ProjectsContent />
        </SWRProvider>
    )
}
