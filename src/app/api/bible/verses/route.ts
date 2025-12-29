import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const bookId = searchParams.get('bookId')
    const chapter = searchParams.get('chapter')
    const versionId = searchParams.get('versionId') || 'nvi'
    const query = searchParams.get('query') // for text search

    if (query) {
      // Text search
      const verses = await db.verse.findMany({
        where: {
          bibleVersionId: versionId,
          text: {
            contains: query,
          },
        },
        include: {
          chapter: {
            include: {
              book: true,
            },
          },
        },
        take: 50,
      })

      return NextResponse.json({ verses })
    }

    if (!bookId || !chapter) {
      return NextResponse.json(
        { error: 'bookId e chapter são obrigatórios' },
        { status: 400 }
      )
    }

    // Find the chapter
    const chapterData = await db.chapter.findFirst({
      where: {
        bookId,
        number: parseInt(chapter),
      },
      include: {
        verses: {
          where: {
            bibleVersionId: versionId,
          },
          orderBy: {
            number: 'asc',
          },
        },
      },
    })

    if (!chapterData) {
      return NextResponse.json(
        { error: 'Capítulo não encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      chapter: chapterData,
      verses: chapterData.verses,
    })
  } catch (error) {
    console.error('Error fetching verses:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar versículos' },
      { status: 500 }
    )
  }
}
