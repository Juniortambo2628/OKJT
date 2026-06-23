import { getInsightBySlug, getInsights } from '@/lib/server/api'
import SWRProvider from '@/components/SWRProvider'
import InsightDetailContent from './InsightDetailContent'

export const revalidate = 60

export default async function InsightDetailPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params
    const [insight, allInsights] = await Promise.all([
        getInsightBySlug(slug),
        getInsights(),
    ])

    return (
        <SWRProvider fallback={{
            [`/insights/${slug}`]: insight,
            '/insights': allInsights,
        }}>
            <InsightDetailContent slug={slug} />
        </SWRProvider>
    )
}
