import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const openRouterKey = process.env.OPENROUTER_API_KEY
    const deepSeekKey = process.env.DEEPSEEK_API_KEY
    const geminiKey = process.env.GEMINI_API_KEY
    
    // Prioridade: DeepSeek > OpenRouter > Gemini
    const useDeepSeek = !!deepSeekKey && deepSeekKey !== 'PLACEHOLDER_PLEASE_REPLACE'
    const useOpenRouter = !useDeepSeek && !!openRouterKey && openRouterKey.startsWith('sk-or-')

    if (!useDeepSeek && !useOpenRouter && (!geminiKey || geminiKey === 'PLACEHOLDER_PLEASE_REPLACE')) {
      return NextResponse.json(
        { error: 'Nenhuma chave de API configurada. Configure DEEPSEEK_API_KEY, OPENROUTER_API_KEY ou GEMINI_API_KEY no .env.local' },
        { status: 500 }
      )
    }

    const { messages, context } = await req.json()

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Histórico de mensagens é obrigatório' },
        { status: 400 }
      )
    }

    const systemPrompt = `
      Você é um assistente sábio e didático de estudo bíblico.
      Você está conversando sobre o seguinte texto bíblico:
      "${context}"
      
      DIRETRIZES:
      1. Seja direto, amável e teologicamente profundo.
      2. Responda à dúvida do usuário com clareza.
      3. Use formatação HTML simples (<p>, <strong>, <em>) se necessário para clareza.
      4. Mantenha as respostas concisas (máximo 1-2 parágrafos), a menos que o usuário peça detalhes.
    `

    const apiMessages = [
        { role: 'system', content: systemPrompt },
        ...messages
    ]

    let reply = ''

    if (useDeepSeek) {
      try {
        console.log('Usando DeepSeek Chat API...')
        const response = await fetch('https://api.deepseek.com/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${deepSeekKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            "model": "deepseek-chat",
            "messages": apiMessages,
            "temperature": 0.7
          })
        })

        if (!response.ok) throw new Error(`DeepSeek Error: ${response.status}`)
        const data = await response.json()
        reply = data.choices[0].message.content
      } catch (error) {
        console.error('Falha no DeepSeek, tentando fallback...', error)
        // Fallback logic could go here
        throw error
      }
    } else if (useOpenRouter) {
      // OpenRouter Implementation
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openRouterKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://bible-study-app.com', 
          'X-Title': 'Bible Study App'
        },
        body: JSON.stringify({
          "model": "openai/gpt-3.5-turbo", // Or any default cheap model
          "messages": apiMessages
        })
      })
      
      if (!response.ok) throw new Error(`OpenRouter Error: ${response.status}`)
      const data = await response.json()
      reply = data.choices[0].message.content
    } else {
      // Gemini Implementation
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${geminiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `${systemPrompt}\n\n${messages.map((m: any) => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`).join('\n')}`
            }]
          }]
        })
      })

      if (!response.ok) throw new Error(`Gemini Error: ${response.status}`)
      const data = await response.json()
      reply = data.candidates[0].content.parts[0].text
    }

    return NextResponse.json({ reply })

  } catch (error) {
    console.error('Erro na API de Chat:', error)
    return NextResponse.json(
      { error: 'Falha ao processar chat' },
      { status: 500 }
    )
  }
}
