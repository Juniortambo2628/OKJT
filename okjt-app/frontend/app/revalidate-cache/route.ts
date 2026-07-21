import { revalidatePath, revalidateTag } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { secret, paths, tags } = body

    // Validate secret token if configured
    if (process.env.NEXT_REVALIDATION_SECRET && secret !== process.env.NEXT_REVALIDATION_SECRET) {
      return NextResponse.json({ message: 'Invalid secret' }, { status: 401 })
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
  } catch (err) {
    return NextResponse.json({ message: 'Error revalidating' }, { status: 500 })
  }
}