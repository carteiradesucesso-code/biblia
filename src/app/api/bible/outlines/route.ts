import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { auth } from '@/auth'

// GET - List all outlines for the current user
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      )
    }

    const outlines = await db.outline.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json({ outlines })
  } catch (error) {
    console.error('Error fetching outlines:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar esboços' },
      { status: 500 }
    )
  }
}

// POST - Create a new outline
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
    const { title, content, verses } = body

    if (!title || !content) {
      return NextResponse.json(
        { error: 'Título e conteúdo são obrigatórios' },
        { status: 400 }
      )
    }

    const outline = await db.outline.create({
      data: {
        userId: session.user.id,
        title,
        content,
        verses: verses ? JSON.stringify(verses) : null,
      },
    })

    return NextResponse.json({ outline })
  } catch (error) {
    console.error('Error creating outline:', error)
    return NextResponse.json(
      { error: 'Erro ao criar esboço' },
      { status: 500 }
    )
  }
}

// DELETE - Remove an outline
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

    const outlineId = params.id

    // Verify outline belongs to user
    const outline = await db.outline.findFirst({
      where: {
        id: outlineId,
        userId: session.user.id,
      },
    })

    if (!outline) {
      return NextResponse.json(
        { error: 'Esboço não encontrado' },
        { status: 404 }
      )
    }

    await db.outline.delete({
      where: { id: outlineId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting outline:', error)
    return NextResponse.json(
      { error: 'Erro ao remover esboço' },
      { status: 500 }
    )
  }
}
