import { revalidatePath, revalidateTag } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { secret, paths, tags } = body

    // Validate the request: either the secret must match, or the request must
    // be same-origin (admin panel).  Same-origin requests carry no Origin header
    // and the Host header matches the server.
    const host = request.headers.get('host') ?? ''
    const origin = request.headers.get('origin')
    const hasValidSecret = process.env.NEXT_REVALIDATION_SECRET
      ? secret === process.env.NEXT_REVALIDATION_SECRET
      : true
    const isSameOrigin = !origin || origin.includes(host)

    if (!hasValidSecret && !isSameOrigin) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    if (paths && Array.isArray(paths)) {
      for (const path of paths) {
        revalidatePath(path)
      }
    }

    if (tags && Array.isArray(tags)) {
      for (const tag of tags) {
        // @ts-expect-error - Next.js 16 types incorrectly require 2 args for revalidateTag
        revalidateTag(tag)
      }
    }

    // Default tag for our general site content
    if (!tags && !paths) {
        // @ts-expect-error - Next.js 16 types incorrectly require 2 args for revalidateTag
        revalidateTag('okjt-content')
    }

    return NextResponse.json({
      revalidated: true,
      paths,
      tags: tags || ['okjt-content'],
      now: Date.now(),
    })
  } catch {
    return NextResponse.json({ message: 'Error revalidating' }, { status: 500 })
  }
}
