import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Mapeamento de abreviações do JSON para os IDs do frontend
const BOOK_MAPPING: Record<string, string> = {
    // Antigo Testamento
    'gn': 'gen',  // Gênesis
    'ex': 'exo',  // Êxodo
    'lv': 'lev',  // Levítico
    'nm': 'num',  // Números
    'dt': 'deu',  // Deuteronômio
    'js': 'jos',  // Josué
    'jz': 'jui',  // Juízes
    'rt': 'rut',  // Rute
    '1sm': '1sa', // 1 Samuel
    '2sm': '2sa', // 2 Samuel
    '1rs': '1rs', // 1 Reis
    '2rs': '2rs', // 2 Reis
    '1cr': '1cr', // 1 Crônicas
    '2cr': '2cr', // 2 Crônicas
    'ed': 'edr',  // Esdras
    'ne': 'nee',  // Neemias
    'et': 'est',  // Ester
    'jó': 'job',  // Jó
    'sl': 'sl',   // Salmos
    'pv': 'pv',   // Provérbios
    'ec': 'ec',   // Eclesiastes
    'ct': 'ct',   // Cantares
    'is': 'is',   // Isaías
    'jr': 'jr',   // Jeremias
    'lm': 'lm',   // Lamentações
    'ez': 'ez',   // Ezequiel
    'dn': 'dn',   // Daniel
    'os': 'os',   // Oséias
    'jl': 'jl',   // Joel
    'am': 'am',   // Amós
    'ob': 'ob',   // Obadias
    'jn': 'jn',   // Jonas
    'mq': 'mq',   // Miquéias
    'na': 'na',   // Naum
    'hc': 'hc',   // Habacuque
    'sf': 'sf',   // Sofonias
    'ag': 'ag',   // Ageu
    'zc': 'zc',   // Zacarias
    'ml': 'ml',   // Malaquias
    // Novo Testamento
    'mt': 'mt',   // Mateus
    'mc': 'mc',   // Marcos
    'lc': 'lc',   // Lucas
    'jo': 'jo',   // João
    'at': 'at',   // Atos
    'atos': 'at', // Atos (nome completo em alguns JSONs)
    'rm': 'rm',   // Romanos
    '1co': '1co', // 1 Coríntios
    '2co': '2co', // 2 Coríntios
    'gl': 'gl',   // Gálatas
    'ef': 'ef',   // Efésios
    'fp': 'fp',   // Filipenses
    'cl': 'cl',   // Colossenses
    '1ts': '1ts', // 1 Tessalonicenses
    '2ts': '2ts', // 2 Tessalonicenses
    '1tm': '1tm', // 1 Timóteo
    '2tm': '2tm', // 2 Timóteo
    'tt': 'tt',   // Tito
    'fm': 'fm',   // Filemom
    'hb': 'hb',   // Hebreus
    'tg': 'tg',   // Tiago
    '1pe': '1pe', // 1 Pedro
    '2pe': '2pe', // 2 Pedro
    '1jo': '1jo', // 1 João
    '2jo': '2jo', // 2 João
    '3jo': '3jo', // 3 João
    'jd': 'jd',   // Judas
    'ap': 'ap',   // Apocalipse
}

interface BibleBook {
    abbrev: string
    chapters: string[][]
}

async function importBibleFromUrl() {
    console.log('🌱 Iniciando importação da Bíblia Almeida...')

    // Baixar dados da Bíblia
    console.log('📥 Baixando dados do GitHub...')
    const response = await fetch('https://raw.githubusercontent.com/thiagobodruk/biblia/master/json/aa.json')
    const bibleData: BibleBook[] = await response.json()

    console.log(`📖 Encontrados ${bibleData.length} livros`)

    // Garantir que a versão 'acf' existe (Almeida Corrigida Fiel / ARC)
    console.log('🔧 Criando/atualizando versão ACF...')
    await prisma.bibleVersion.upsert({
        where: { id: 'acf' },
        update: {},
        create: {
            id: 'acf',
            name: 'Almeida Corrigida Fiel',
            abbreviation: 'ACF',
            language: 'pt-BR',
            description: 'Tradução tradicional usada pela Assembleia de Deus'
        },
    })

    // Limpar versículos existentes da versão ACF para evitar duplicatas
    console.log('🗑️ Removendo versículos ACF existentes...')
    await prisma.verse.deleteMany({
        where: { bibleVersionId: 'acf' }
    })

    let totalVerses = 0
    let processedBooks = 0

    for (const book of bibleData) {
        const bookId = BOOK_MAPPING[book.abbrev]

        if (!bookId) {
            console.log(`⚠️ Livro não mapeado: ${book.abbrev}`)
            continue
        }

        console.log(`📖 Processando ${book.abbrev} -> ${bookId} (${book.chapters.length} capítulos)`)

        for (let chapterNum = 0; chapterNum < book.chapters.length; chapterNum++) {
            const chapterNumber = chapterNum + 1
            const verses = book.chapters[chapterNum]

            // Encontrar ou criar o capítulo
            let chapter = await prisma.chapter.findFirst({
                where: {
                    bookId: bookId,
                    number: chapterNumber,
                },
            })

            if (!chapter) {
                // Criar capítulo se não existir
                chapter = await prisma.chapter.create({
                    data: {
                        bookId: bookId,
                        number: chapterNumber,
                    },
                })
            }

            // Inserir versículos em lote
            const verseData = verses.map((text, index) => ({
                chapterId: chapter!.id,
                number: index + 1,
                text: text,
                bibleVersionId: 'acf',
            }))

            if (verseData.length > 0) {
                await prisma.verse.createMany({
                    data: verseData,
                })
                totalVerses += verseData.length
            }
        }

        processedBooks++
        if (processedBooks % 10 === 0) {
            console.log(`📊 Progresso: ${processedBooks}/${bibleData.length} livros, ${totalVerses} versículos`)
        }
    }

    console.log('')
    console.log('✅ Importação concluída!')
    console.log(`📖 Total de livros processados: ${processedBooks}`)
    console.log(`📝 Total de versículos importados: ${totalVerses}`)
}

importBibleFromUrl()
    .then(() => {
        console.log('🎉 Processo finalizado com sucesso!')
        process.exit(0)
    })
    .catch((error) => {
        console.error('❌ Erro na importação:', error)
        process.exit(1)
    })
