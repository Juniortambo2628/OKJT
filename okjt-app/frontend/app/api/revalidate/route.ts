import { revalidatePath } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { secret, paths } = body

    // Validate secret token (set NEXT_REVALIDATION_SECRET in .env)
    if (secret !== process.env.NEXT_REVALIDATION_SECRET) {
      return NextResponse.json({ message: 'Invalid secret' }, { status: 401 })
    }

    if (!Array.isArray(paths)) {
      return NextResponse.json({ message: 'paths must be an array' }, { status: 400 })
    }

    for (const path of paths) {
      revalidatePath(path)
    }

    return NextResponse.json({
      revalidated: true,
      paths,
      now: Date.now(),
    })
  } catch (err) {
    return NextResponse.json({ message: 'Error revalidating' }, { status: 500 })
  }
}