import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { auth } from '@/auth'

// GET - List all bookmarks for the current user
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      )
    }

    const bookmarks = await db.bookmark.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        verse: {
          include: {
            chapter: {
              include: {
                book: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json({ bookmarks })
  } catch (error) {
    console.error('Error fetching bookmarks:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar marcações' },
      { status: 500 }
    )
  }
}

// POST - Create a new bookmark
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { verseId, color, note } = body

    if (!verseId) {
      return NextResponse.json(
        { error: 'verseId é obrigatório' },
        { status: 400 }
      )
    }

    // Check if verse exists
    const verse = await db.verse.findUnique({
      where: { id: verseId },
    })

    if (!verse) {
      return NextResponse.json(
        { error: 'Versículo não encontrado' },
        { status: 404 }
      )
    }

    const bookmark = await db.bookmark.create({
      data: {
        userId: session.user.id,
        verseId,
        color: color || 'yellow',
        note,
      },
      include: {
        verse: {
          include: {
            chapter: {
              include: {
                book: true,
              },
            },
          },
        },
      },
    })

    return NextResponse.json({ bookmark })
  } catch (error) {
    console.error('Error creating bookmark:', error)
    return NextResponse.json(
      { error: 'Erro ao criar marcação' },
      { status: 500 }
    )
  }
}

// DELETE - Remove a bookmark
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      )
    }

    const bookmarkId = params.id

    // Verify bookmark belongs to user
    const bookmark = await db.bookmark.findFirst({
      where: {
        id: bookmarkId,
        userId: session.user.id,
      },
    })

    if (!bookmark) {
      return NextResponse.json(
        { error: 'Marcação não encontrada' },
        { status: 404 }
      )
    }

    await db.bookmark.delete({
      where: { id: bookmarkId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting bookmark:', error)
    return NextResponse.json(
      { error: 'Erro ao remover marcação' },
      { status: 500 }
    )
  }
}
