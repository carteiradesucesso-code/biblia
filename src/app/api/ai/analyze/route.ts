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

    const { text, level, context } = await req.json()

    if (!text || !level) {
      return NextResponse.json(
        { error: 'Texto e nível são obrigatórios' },
        { status: 400 }
      )
    }

    let prompt = ''
    const basePrompt = `
      Você é um assistente sábio e didático de estudo bíblico.
      Sua missão é explicar o SENTIDO PROFUNDO do texto de forma EXTREMAMENTE RESUMIDA e DIRETA.
      
      DIRETRIZES:
      1. SEJA EXTREMAMENTE BREVE. MÁXIMO 3-4 LINHAS TOTAIS.
      2. Foque APENAS no essencial: O que Deus está comunicando?
      3. Use linguagem técnica (grego/hebraico) APENAS se for CRUCIAL.
      4. Use Português do Brasil claro.
      5. Formate usando HTML simples (tags <p>, <strong>, <em>). SEM LISTAS <ul>.
    `

    if (level === 'word') {
      prompt = `
        ${basePrompt}
        
        EXPLIQUE A PALAVRA: "${text}"
        NO CONTEXTO DO VERSÍCULO: "${context}"
        
        Responda em UM PARÁGRAFO ÚNICO e CURTO:
        Diga a palavra original, seu significado literal e o impacto dela neste versículo. Tudo em no máximo 3 frases.
      `
    } else if (level === 'phrase') {
      prompt = `
        ${basePrompt}
        
        EXPLIQUE A EXPRESSÃO: "${text}"
        CONTEXTO: "${context}"
        
        Responda em UM PARÁGRAFO ÚNICO e CURTO:
        Explique a ideia central e qualquer nuance importante de forma direta e inspiradora. Máximo 3 frases.
      `
    } else if (level === 'verse') {
      prompt = `
        ${basePrompt}
        
        EXPLIQUE O VERSÍCULO: "${text}"
        
        Responda em UM PARÁGRAFO ÚNICO:
        Qual a mensagem central de Deus aqui? Vá direto ao ponto. Máximo 4 frases.
      `
    }

    let analysis = ''

    if (useDeepSeek) {
      // Implementação via DeepSeek
      try {
        console.log('Usando DeepSeek API...')
        const response = await fetch('https://api.deepseek.com/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${deepSeekKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            "model": "deepseek-chat",
            "messages": [
              {
                "role": "user",
                "content": prompt
              }
            ],
            "temperature": 0.7
          })
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          console.error('Erro DeepSeek:', errorData)
          throw new Error(`DeepSeek Error: ${response.status}`)
        }

        const data = await response.json()
        analysis = data.choices?.[0]?.message?.content || ''

      } catch (error) {
        console.error('Falha na DeepSeek:', error)
        throw error // Deixa cair no catch geral ou implementa fallback se desejar
      }

    } else if (useOpenRouter) {
      // Implementação via OpenRouter (Fetch)
      try {
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openRouterKey}`,
            'HTTP-Referer': 'https://bible-study-app.com',
            'X-Title': 'Bible Study App',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            "model": "google/gemini-2.0-flash-lite-preview-02-05:free",
            "messages": [{"role": "user", "content": prompt}],
            "temperature": 0.7
          })
        })

        if (!response.ok) {
           throw new Error(`OpenRouter Error: ${response.status}`)
        }

        const data = await response.json()
        analysis = data.choices?.[0]?.message?.content || ''

      } catch (orError) {
        console.error('Falha na OpenRouter, tentando fallback...', orError)
         const responseFallback = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openRouterKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            "model": "google/gemini-flash-1.5",
            "messages": [{"role": "user", "content": prompt}]
          })
        })
        
        if (!responseFallback.ok) throw new Error('Falha em ambos os modelos OpenRouter')
        const data = await responseFallback.json()
        analysis = data.choices?.[0]?.message?.content || ''
      }

    } else {
      // Fallback para Google Gemini direto
      const { GoogleGenerativeAI } = await import('@google/generative-ai')
      const genAI = new GoogleGenerativeAI(geminiKey!)
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
      const result = await model.generateContent(prompt)
      analysis = result.response.text()
    }

    return NextResponse.json({ analysis })
    
  } catch (error) {
    console.error('Erro na API AI:', error)
    return NextResponse.json(
      { error: 'Falha ao processar análise' },
      { status: 500 }
    )
  }
}
