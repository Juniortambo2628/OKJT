import { Suspense } from 'react'
import SWRProvider from '@/components/SWRProvider'
import { getProjects } from '@/lib/server/api'
import FlagshipProjectsContent from './FlagshipProjectsContent'

export const revalidate = 60

export default async function FlagshipProjectsPage() {
    const projects = await getProjects('flagship')

    return (
        <SWRProvider fallback={{
            '/projects?type=flagship': projects,
        }}>
            <Suspense>
                <FlagshipProjectsContent />
            </Suspense>
        </SWRProvider>
    )
}
