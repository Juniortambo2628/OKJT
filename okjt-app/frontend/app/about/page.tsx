import SWRProvider from '@/components/SWRProvider'
import { getSettings, getTeamMembers, getValues } from '@/lib/server/api'
import AboutContent from './AboutContent'

export const revalidate = 60

export default async function AboutPage() {
    const [settings, teamMembers, values] = await Promise.all([
        getSettings(),
        getTeamMembers(),
        getValues(),
    ])

    return (
        <SWRProvider fallback={{
            '/settings': settings,
            '/team-members': teamMembers,
            '/values': values,
        }}>
            <AboutContent />
        </SWRProvider>
    )
}
