import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { auth } from '@/auth'

// GET - Get user settings
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      )
    }

    let settings = await db.userSettings.findUnique({
      where: {
        userId: session.user.id,
      },
    })

    // Create default settings if not exist
    if (!settings) {
      settings = await db.userSettings.create({
        data: {
          userId: session.user.id,
          bibleVersionId: 'nvi',
          fontSize: 16,
          darkMode: false,
        },
      })
    }

    return NextResponse.json({ settings })
  } catch (error) {
    console.error('Error fetching settings:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar configurações' },
      { status: 500 }
    )
  }
}

// POST - Update user settings
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
    const { bibleVersionId, fontSize, darkMode } = body

    let settings = await db.userSettings.findUnique({
      where: {
        userId: session.user.id,
      },
    })

    if (settings) {
      // Update existing settings
      settings = await db.userSettings.update({
        where: {
          userId: session.user.id,
        },
        data: {
          ...(bibleVersionId !== undefined && { bibleVersionId }),
          ...(fontSize !== undefined && { fontSize }),
          ...(darkMode !== undefined && { darkMode }),
        },
      })
    } else {
      // Create new settings
      settings = await db.userSettings.create({
        data: {
          userId: session.user.id,
          bibleVersionId: bibleVersionId || 'nvi',
          fontSize: fontSize || 16,
          darkMode: darkMode || false,
        },
      })
    }

    return NextResponse.json({ settings })
  } catch (error) {
    console.error('Error updating settings:', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar configurações' },
      { status: 500 }
    )
  }
}
