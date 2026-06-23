import { getPillarBySlug } from '@/lib/server/api'
import SWRProvider from '@/components/SWRProvider'
import PillarDetailContent from './PillarDetailContent'

export const revalidate = 60

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params
    const pillar = await getPillarBySlug(slug)

    return (
        <SWRProvider fallback={{
            [`/pillars/${slug}`]: pillar,
        }}>
            <PillarDetailContent slug={slug} />
        </SWRProvider>
    )
}
