import SWRProvider from '@/components/SWRProvider'
import { getSettings, getInsights } from '@/lib/server/api'
import InsightsContent from './InsightsContent'

export const revalidate = 60

export default async function InsightsPage() {
    const [settings, insights] = await Promise.all([
        getSettings(),
        getInsights(),
    ])

    return (
        <SWRProvider fallback={{
            '/settings': settings,
            '/insights': insights,
        }}>
            <InsightsContent />
        </SWRProvider>
    )
}
