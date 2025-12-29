import { NextRequest, NextResponse } from 'next/server'
import { asr } from 'z-ai-web-dev-sdk'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const audioFile = formData.get('audio') as File

    if (!audioFile) {
      return NextResponse.json(
        { error: 'Arquivo de áudio não fornecido' },
        { status: 400 }
      )
    }

    // Convert file to buffer
    const arrayBuffer = await audioFile.arrayBuffer()
    const base64Audio = Buffer.from(arrayBuffer).toString('base64')

    // Use ASR SDK for transcription
    const result = await asr({
      audio: base64Audio,
      language: 'pt-BR',
    })

    return NextResponse.json({
      success: true,
      text: result.text,
    })
  } catch (error) {
    console.error('Error in voice search:', error)
    return NextResponse.json(
      { error: 'Erro ao processar áudio', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
