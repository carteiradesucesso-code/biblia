import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const books = await db.book.findMany({
      orderBy: {
        order: 'asc',
      },
    })

    return NextResponse.json({ books })
  } catch (error) {
    console.error('Error fetching books:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar livros' },
      { status: 500 }
    )
  }
}
