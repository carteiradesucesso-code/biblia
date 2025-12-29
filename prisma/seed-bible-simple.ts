import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function seedBibleData() {
  console.log('🌱 Iniciando seed da Bíblia...')

  // Criar versões da Bíblia
  const bibleVersions = [
    { id: 'nvi', name: 'Nova Versão Internacional', abbreviation: 'NVI', language: 'pt-BR' },
    { id: 'acf', name: 'Almeida Revista e Corrigida', abbreviation: 'ARC', language: 'pt-BR' },
    { id: 'ara', name: 'Almeida Revista e Atualizada', abbreviation: 'ARA', language: 'pt-BR' },
  ]

  console.log('Criando versões da Bíblia...')
  for (const version of bibleVersions) {
    await prisma.bibleVersion.upsert({
      where: { id: version.id },
      update: {},
      create: version,
    })
  }

  // Criar livros da Bíblia (primeiros 10 para teste)
  const books = [
    { id: 'gen', name: 'Gênesis', testament: 'AT', chapters: 50, order: 1 },
    { id: 'exo', name: 'Êxodo', testament: 'AT', chapters: 40, order: 2 },
    { id: 'lev', name: 'Levítico', testament: 'AT', chapters: 27, order: 3 },
    { id: 'num', name: 'Números', testament: 'AT', chapters: 36, order: 4 },
    { id: 'deu', name: 'Deuteronômio', testament: 'AT', chapters: 34, order: 5 },
    { id: 'mt', name: 'Mateus', testament: 'NT', chapters: 28, order: 40 },
    { id: 'mc', name: 'Marcos', testament: 'NT', chapters: 16, order: 41 },
    { id: 'lc', name: 'Lucas', testament: 'NT', chapters: 24, order: 42 },
    { id: 'jo', name: 'João', testament: 'NT', chapters: 21, order: 43 },
    { id: 'at', name: 'Atos', testament: 'NT', chapters: 28, order: 44 },
  ]

  console.log('Criando livros da Bíblia...')
  for (const book of books) {
    await prisma.book.upsert({
      where: { id: book.id },
      update: {},
      create: book,
    })
  }

  // Criar capítulos para cada livro
  console.log('Criando capítulos...')
  for (const book of books) {
    for (let i = 1; i <= Math.min(book.chapters, 3); i++) {
      await prisma.chapter.upsert({
        where: {
          bookId_number: {
            bookId: book.id,
            number: i,
          },
        },
        update: {},
        create: {
          bookId: book.id,
          number: i,
        },
      })
    }
  }

  // Criar versículos de Gênesis 1
  console.log('Criando versículos de Gênesis 1...')
  const genBook = await prisma.book.findUnique({
    where: { id: 'gen' },
  })

  const gen1Chapter = await prisma.chapter.findFirst({
    where: {
      bookId: genBook?.id || 'gen',
      number: 1,
    },
  })

  if (gen1Chapter) {
    const genesis1Verses = [
      'No princípio Deus criou os céus e a terra.',
      'A terra era sem forma e vazia; e havia trevas sobre a face do abismo, mas o Espírito de Deus pairava sobre a face das águas.',
      'E disse Deus: Haja luz. E houve luz.',
      'E viu Deus que a luz era boa; e fez Deus separação entre a luz e as trevas.',
      'E chamou Deus à luz Dia, e às trevas chamou Noite. E foi a tarde e a manhã, o dia primeiro.',
      'E disse Deus: Haja uma expansão no meio das águas, e haja separação entre águas e águas.',
    ]

    for (let i = 0; i < genesis1Verses.length; i++) {
      await prisma.verse.create({
        data: {
          chapterId: gen1Chapter.id,
          number: i + 1,
          text: genesis1Verses[i],
          bibleVersionId: 'nvi',
        },
      })
    }
  }

  // Criar versículos de João 3
  console.log('Criando versículos de João 3...')
  const joBook = await prisma.book.findUnique({
    where: { id: 'jo' },
  })

  const jo3Chapter = await prisma.chapter.findFirst({
    where: {
      bookId: joBook?.id || 'jo',
      number: 3,
    },
  })

  if (jo3Chapter) {
    const joao3Verses = [
      'Havia um fariseu chamado Nicodemos, uma autoridade entre os judeus.',
      'Ele veio a Jesus, à noite, e disse: "Mestre, sabemos que ensinas da parte de Deus, pois ninguém pode realizar os sinais miraculosos que estás fazendo, se Deus não estiver com ele".',
      'Em resposta, Jesus declarou: "Digo-lhe a verdade: Ninguém pode ver o Reino de Deus, se não nascer de novo".',
      'Perguntou Nicodemos: "Como pode alguém nascer, sendo já velho? É claro que pode entrar outra vez no ventre materno e renascer!"',
      'Respondeu Jesus: "Digo-lhe a verdade: Ninguém pode entrar no Reino de Deus, se não nascer da água e do Espírito.',
      'Porque Deus amou o mundo de tal maneira que deu o seu Filho unigênito, para que todo aquele que nele crê não pereça, mas tenha a vida eterna.',
      'Pois Deus enviou o seu Filho ao mundo, não para condenar o mundo, mas para que este fosse salvo por meio dele.',
    ]

    for (let i = 0; i < joao3Verses.length; i++) {
      await prisma.verse.create({
        data: {
          chapterId: jo3Chapter.id,
          number: i + 1,
          text: joao3Verses[i],
          bibleVersionId: 'nvi',
        },
      })
    }
  }

  console.log('✅ Seed concluído com sucesso!')
}

seedBibleData()
  .then(() => {
    console.log('🎉 Processo de seed finalizado!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Erro no seed:', error)
    process.exit(1)
  })
