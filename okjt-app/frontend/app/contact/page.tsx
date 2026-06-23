import SWRProvider from '@/components/SWRProvider'
import { getSettings, getServices } from '@/lib/server/api'
import ContactContent from './ContactContent'

export const revalidate = 60

export default async function ContactPage() {
    const [settings, services] = await Promise.all([
        getSettings(),
        getServices(),
    ])

    return (
        <SWRProvider fallback={{
            '/settings': settings,
            '/services': services,
        }}>
            <ContactContent />
        </SWRProvider>
    )
}
