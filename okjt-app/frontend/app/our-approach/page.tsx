import SWRProvider from '@/components/SWRProvider'
import { getSettings, getPillars } from '@/lib/server/api'
import OurApproachContent from './OurApproachContent'

export const revalidate = 60

export default async function PillarsPage() {
    const [settings, pillars] = await Promise.all([
        getSettings(),
        getPillars(),
    ])

    return (
        <SWRProvider fallback={{
            '/settings': settings,
            '/pillars': pillars,
        }}>
            <OurApproachContent />
        </SWRProvider>
    )
}
