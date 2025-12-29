import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const versions = await db.bibleVersion.findMany({
      orderBy: {
        name: 'asc',
      },
    })

    return NextResponse.json({ versions })
  } catch (error) {
    console.error('Error fetching versions:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar versões' },
      { status: 500 }
    )
  }
}
