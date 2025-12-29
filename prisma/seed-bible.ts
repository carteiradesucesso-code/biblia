import { db } from '../src/lib/db'

async function seedBibleData() {
  console.log('🌱 Iniciando seed da Bíblia...')

  // Criar versões da Bíblia
  const bibleVersions = [
    { id: 'nvi', name: 'Nova Versão Internacional', abbreviation: 'NVI', language: 'pt-BR' },
    { id: 'acf', name: 'Almeida Revista e Corrigida', abbreviation: 'ARC', language: 'pt-BR' },
    { id: 'ara', name: 'Almeida Revista e Atualizada', abbreviation: 'ARA', language: 'pt-BR' },
    { id: 'nvt', name: 'Nova Versão Transformadora', abbreviation: 'NVT', language: 'pt-BR' },
  ]

  console.log('Criando versões da Bíblia...')
  for (const version of bibleVersions) {
    await db.bibleVersion.upsert({
      where: { id: version.id },
      update: {},
      create: version,
    })
  }

  // Criar livros da Bíblia
  const books = [
    // Antigo Testamento
    { id: 'gen', name: 'Gênesis', testament: 'AT', chapters: 50, order: 1 },
    { id: 'exo', name: 'Êxodo', testament: 'AT', chapters: 40, order: 2 },
    { id: 'lev', name: 'Levítico', testament: 'AT', chapters: 27, order: 3 },
    { id: 'num', name: 'Números', testament: 'AT', chapters: 36, order: 4 },
    { id: 'deu', name: 'Deuteronômio', testament: 'AT', chapters: 34, order: 5 },
    { id: 'jos', name: 'Josué', testament: 'AT', chapters: 24, order: 6 },
    { id: 'jui', name: 'Juízes', testament: 'AT', chapters: 21, order: 7 },
    { id: 'rut', name: 'Rute', testament: 'AT', chapters: 4, order: 8 },
    { id: '1sa', name: '1 Samuel', testament: 'AT', chapters: 31, order: 9 },
    { id: '2sa', name: '2 Samuel', testament: 'AT', chapters: 24, order: 10 },
    { id: '1rs', name: '1 Reis', testament: 'AT', chapters: 22, order: 11 },
    { id: '2rs', name: '2 Reis', testament: 'AT', chapters: 25, order: 12 },
    { id: '1cr', name: '1 Crônicas', testament: 'AT', chapters: 29, order: 13 },
    { id: '2cr', name: '2 Crônicas', testament: 'AT', chapters: 36, order: 14 },
    { id: 'edr', name: 'Esdras', testament: 'AT', chapters: 10, order: 15 },
    { id: 'nee', name: 'Neemias', testament: 'AT', chapters: 13, order: 16 },
    { id: 'est', name: 'Ester', testament: 'AT', chapters: 10, order: 17 },
    { id: 'job', name: 'Jó', testament: 'AT', chapters: 42, order: 18 },
    { id: 'sl', name: 'Salmos', testament: 'AT', chapters: 150, order: 19 },
    { id: 'pv', name: 'Provérbios', testament: 'AT', chapters: 31, order: 20 },
    { id: 'ec', name: 'Eclesiastes', testament: 'AT', chapters: 12, order: 21 },
    { id: 'ct', name: 'Cantares', testament: 'AT', chapters: 8, order: 22 },
    { id: 'is', name: 'Isaías', testament: 'AT', chapters: 66, order: 23 },
    { id: 'jr', name: 'Jeremias', testament: 'AT', chapters: 52, order: 24 },
    { id: 'lm', name: 'Lamentações', testament: 'AT', chapters: 5, order: 25 },
    { id: 'ez', name: 'Ezequiel', testament: 'AT', chapters: 48, order: 26 },
    { id: 'dn', name: 'Daniel', testament: 'AT', chapters: 12, order: 27 },
    { id: 'os', name: 'Oséias', testament: 'AT', chapters: 14, order: 28 },
    { id: 'jl', name: 'Joel', testament: 'AT', chapters: 3, order: 29 },
    { id: 'am', name: 'Amós', testament: 'AT', chapters: 9, order: 30 },
    { id: 'ob', name: 'Obadias', testament: 'AT', chapters: 1, order: 31 },
    { id: 'jn', name: 'Jonas', testament: 'AT', chapters: 4, order: 32 },
    { id: 'mq', name: 'Miquéias', testament: 'AT', chapters: 7, order: 33 },
    { id: 'na', name: 'Naum', testament: 'AT', chapters: 3, order: 34 },
    { id: 'hc', name: 'Habacuque', testament: 'AT', chapters: 3, order: 35 },
    { id: 'sf', name: 'Sofonias', testament: 'AT', chapters: 3, order: 36 },
    { id: 'ag', name: 'Ageu', testament: 'AT', chapters: 2, order: 37 },
    { id: 'zc', name: 'Zacarias', testament: 'AT', chapters: 14, order: 38 },
    { id: 'ml', name: 'Malaquias', testament: 'AT', chapters: 4, order: 39 },
    // Novo Testamento
    { id: 'mt', name: 'Mateus', testament: 'NT', chapters: 28, order: 40 },
    { id: 'mc', name: 'Marcos', testament: 'NT', chapters: 16, order: 41 },
    { id: 'lc', name: 'Lucas', testament: 'NT', chapters: 24, order: 42 },
    { id: 'jo', name: 'João', testament: 'NT', chapters: 21, order: 43 },
    { id: 'at', name: 'Atos', testament: 'NT', chapters: 28, order: 44 },
    { id: 'rm', name: 'Romanos', testament: 'NT', chapters: 16, order: 45 },
    { id: '1co', name: '1 Coríntios', testament: 'NT', chapters: 16, order: 46 },
    { id: '2co', name: '2 Coríntios', testament: 'NT', chapters: 13, order: 47 },
    { id: 'gl', name: 'Gálatas', testament: 'NT', chapters: 6, order: 48 },
    { id: 'ef', name: 'Efésios', testament: 'NT', chapters: 6, order: 49 },
    { id: 'fp', name: 'Filipenses', testament: 'NT', chapters: 4, order: 50 },
    { id: 'cl', name: 'Colossenses', testament: 'NT', chapters: 4, order: 51 },
    { id: '1ts', name: '1 Tessalonicenses', testament: 'NT', chapters: 5, order: 52 },
    { id: '2ts', name: '2 Tessalonicenses', testament: 'NT', chapters: 3, order: 53 },
    { id: '1tm', name: '1 Timóteo', testament: 'NT', chapters: 6, order: 54 },
    { id: '2tm', name: '2 Timóteo', testament: 'NT', chapters: 4, order: 55 },
    { id: 'tt', name: 'Tito', testament: 'NT', chapters: 3, order: 56 },
    { id: 'fm', name: 'Filemom', testament: 'NT', chapters: 1, order: 57 },
    { id: 'hb', name: 'Hebreus', testament: 'NT', chapters: 13, order: 58 },
    { id: 'tg', name: 'Tiago', testament: 'NT', chapters: 5, order: 59 },
    { id: '1pe', name: '1 Pedro', testament: 'NT', chapters: 5, order: 60 },
    { id: '2pe', name: '2 Pedro', testament: 'NT', chapters: 3, order: 61 },
    { id: '1jo', name: '1 João', testament: 'NT', chapters: 5, order: 62 },
    { id: '2jo', name: '2 João', testament: 'NT', chapters: 1, order: 63 },
    { id: '3jo', name: '3 João', testament: 'NT', chapters: 1, order: 64 },
    { id: 'jd', name: 'Judas', testament: 'NT', chapters: 1, order: 65 },
    { id: 'ap', name: 'Apocalipse', testament: 'NT', chapters: 22, order: 66 },
  ]

  console.log('Criando livros da Bíblia...')
  for (const book of books) {
    await db.book.upsert({
      where: { id: book.id },
      update: {},
      create: book,
    })
  }

  // Criar capítulos para cada livro
  console.log('Criando capítulos...')
  for (const book of books) {
    for (let i = 1; i <= book.chapters; i++) {
      await db.chapter.upsert({
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

  // Criar alguns versículos de exemplo (Gênesis 1 - NVI)
  console.log('Criando versículos de exemplo...')
  const gen1Chapter = await db.chapter.findFirst({
    where: {
      book: { id: 'gen' },
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
      'E fez Deus a expansão, e fez separação entre as águas que estavam debaixo da expansão e as águas que estavam sobre a expansão; e assim foi.',
      'E chamou Deus à expansão Céus; e foi a tarde e a manhã, o dia segundo.',
      'E disse Deus: Ajuntem-se as águas debaixo dos céus num lugar; e apareça a porção seca; e assim foi.',
      'E chamou Deus à porção seca Terra; e ao ajuntamento das águas chamou Mares; e viu Deus que era bom.',
    ]

    for (let i = 0; i < genesis1Verses.length; i++) {
      await db.verse.create({
        data: {
          chapterId: gen1Chapter.id,
          number: i + 1,
          text: genesis1Verses[i],
          bibleVersionId: 'nvi',
        },
      })
    }
  }

  // Criar alguns versículos de João 3 - NVI
  const jo3Chapter = await db.chapter.findFirst({
    where: {
      book: { id: 'jo' },
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
      'O que nasce da carne é carne, mas o que nasce do Espírito é espírito.',
      'Não se surpreenda pelo fato de eu ter dito: É necessário que vocês nasçam de novo.',
      'O vento sopra onde quer. Você o ouve, consegue perceber sua procedência, mas não sabe de onde ele vem nem para onde vai. Assim acontece com todo aquele que é nascido do Espírito".',
      'Perguntou Nicodemos: "Como pode ser isso?"',
      'Disse Jesus: "Você é mestre em Israel e não entende essas coisas?',
      'Digo-lhe a verdade: Nós falamos daquilo que conhecemos e testemunhamos daquilo que vimos, mas vocês não aceitam o nosso testemunho.',
      'Eu lhes falei de coisas terrenas, e vocês não creem; como crerão se lhes falar de coisas celestiais?',
      'Ninguém jamais subiu ao céu, a não ser aquele que veio do céu: o Filho do homem.',
      'Assim como Moisés ergueu a serpente no deserto, da mesma forma o Filho do homem precisa ser erguido,',
      'para que todo aquele que nele crer tenha a vida eterna.',
      'Porque Deus amou o mundo de tal maneira que deu o seu Filho unigênito, para que todo aquele que nele crê não pereça, mas tenha a vida eterna.',
      'Pois Deus enviou o seu Filho ao mundo, não para condenar o mundo, mas para que este fosse salvo por meio dele.',
      'Quem nele crê não é condenado, mas quem não crê já está condenado, por não crer no nome do Filho unigênito de Deus.',
      'Este é o julgamento: a luz veio ao mundo, mas os homens amaram as trevas, e não a luz, porque as suas obras eram más.',
      'Quem pratica o mal odeia a luz e não se aproxima da luz, temendo que as suas obras sejam manifestas.',
      'Mas quem pratica a verdade aproxima-se da luz, para que se veja claramente que as suas obras são realizadas por intermédio de Deus".',
    ]

    for (let i = 0; i < joao3Verses.length; i++) {
      await db.verse.create({
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
