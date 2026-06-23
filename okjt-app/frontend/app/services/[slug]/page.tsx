import { getServiceBySlug, getServices } from '@/lib/server/api'
import SWRProvider from '@/components/SWRProvider'
import ServiceDetailContent from './ServiceDetailContent'

export const revalidate = 60

export default async function ServiceDetailPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params
    const [service, allServices] = await Promise.all([
        getServiceBySlug(slug),
        getServices(),
    ])

    return (
        <SWRProvider fallback={{
            [`/services/${slug}`]: service,
            '/services': allServices,
        }}>
            <ServiceDetailContent slug={slug} />
        </SWRProvider>
    )
}
