import SWRProvider from '@/components/SWRProvider'
import { getSettings, getProjects, getTestimonials, getClients } from '@/lib/server/api'
import ClientImpactContent from './ClientImpactContent'

export const revalidate = 60

export default async function ClientImpactPage() {
    const [settings, projects, testimonials, clients] = await Promise.all([
        getSettings(),
        getProjects(),
        getTestimonials(),
        getClients(),
    ])

    return (
        <SWRProvider fallback={{
            '/settings': settings,
            '/projects': projects,
            '/testimonials': testimonials,
            '/clients': clients,
        }}>
            <ClientImpactContent />
        </SWRProvider>
    )
}
