import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Mapeamento de abreviações do JSON para os IDs do frontend
const BOOK_MAPPING: Record<string, string> = {
    // Antigo Testamento
    'gn': 'gen', 'ex': 'exo', 'lv': 'lev', 'nm': 'num', 'dt': 'deu',
    'js': 'jos', 'jz': 'jui', 'rt': 'rut', '1sm': '1sa', '2sm': '2sa',
    '1rs': '1rs', '2rs': '2rs', '1cr': '1cr', '2cr': '2cr', 'ed': 'edr',
    'ne': 'nee', 'et': 'est', 'jó': 'job', 'sl': 'sl', 'pv': 'pv',
    'ec': 'ec', 'ct': 'ct', 'is': 'is', 'jr': 'jr', 'lm': 'lm',
    'ez': 'ez', 'dn': 'dn', 'os': 'os', 'jl': 'jl', 'am': 'am',
    'ob': 'ob', 'jn': 'jn', 'mq': 'mq', 'na': 'na', 'hc': 'hc',
    'sf': 'sf', 'ag': 'ag', 'zc': 'zc', 'ml': 'ml',
    // Novo Testamento
    'mt': 'mt', 'mc': 'mc', 'lc': 'lc', 'jo': 'jo', 'at': 'at',
    'atos': 'at', 'rm': 'rm', '1co': '1co', '2co': '2co', 'gl': 'gl',
    'ef': 'ef', 'fp': 'fp', 'cl': 'cl', '1ts': '1ts', '2ts': '2ts',
    '1tm': '1tm', '2tm': '2tm', 'tt': 'tt', 'fm': 'fm', 'hb': 'hb',
    'tg': 'tg', '1pe': '1pe', '2pe': '2pe', '1jo': '1jo', '2jo': '2jo',
    '3jo': '3jo', 'jd': 'jd', 'ap': 'ap'
}

interface BibleBook {
    abbrev: string
    chapters: string[][]
}

interface VersionConfig {
    id: string
    name: string
    abbreviation: string
    url: string
    description?: string
}

const VERSIONS: VersionConfig[] = [
    {
        id: 'nvi',
        name: 'Nova Versão Internacional',
        abbreviation: 'NVI',
        url: 'https://raw.githubusercontent.com/thiagobodruk/biblia/master/json/nvi.json',
        description: 'Linguagem moderna e acessível'
    },
    {
        id: 'acf',
        name: 'Almeida Corrigida Fiel',
        abbreviation: 'ACF',
        url: 'https://raw.githubusercontent.com/thiagobodruk/biblia/master/json/acf.json',
        description: 'Tradução clássica e fiel aos textos originais (SBTB)'
    },
    {
        id: 'arc', // Criando uma entrada separada para ARC usando a mesma fonte ACF por enquanto, mas permitindo distinção no frontend
        name: 'Almeida Revista e Corrigida',
        abbreviation: 'ARC',
        url: 'https://raw.githubusercontent.com/thiagobodruk/biblia/master/json/acf.json', // Fallback para ACF pois ARC não está disponível em JSON aberto facilmente
        description: 'Tradução clássica da Assembleia de Deus'
    },
    {
        id: 'ara',
        name: 'Almeida Revista e Atualizada',
        abbreviation: 'ARA',
        url: 'https://raw.githubusercontent.com/thiagobodruk/biblia/master/json/aa.json', // AA é geralmente mapeada como ARA em muitos contextos digitais
        description: 'Equilíbrio entre fidelidade e clareza'
    }
    // NVT não está disponível publicamente neste formato JSON facilmente.
    // Se o usuário exigir, teríamos que buscar outra fonte, mas por enquanto vamos garantir as 3 principais.
]

async function importAllVersions() {
    console.log('🚀 Iniciando importação de múltiplas versões...')

    for (const version of VERSIONS) {
        console.log(`\n--------------------------------------------------`)
        console.log(`📥 Processando versão: ${version.name} (${version.abbreviation})...`)
        
        try {
            console.log(`   Baixando dados de: ${version.url}`)
            const response = await fetch(version.url)
            
            if (!response.ok) {
                console.error(`❌ Falha ao baixar ${version.id}: ${response.statusText}`)
                continue
            }

            const bibleData: BibleBook[] = await response.json()
            console.log(`   📖 Encontrados ${bibleData.length} livros`)

            // Upsert Version
            await prisma.bibleVersion.upsert({
                where: { id: version.id },
                update: {
                    name: version.name,
                    abbreviation: version.abbreviation,
                    description: version.description
                },
                create: {
                    id: version.id,
                    name: version.name,
                    abbreviation: version.abbreviation,
                    language: 'pt-BR',
                    description: version.description
                },
            })

            // Limpar versículos existentes desta versão
            console.log(`   🗑️ Limpando versículos antigos da versão ${version.id}...`)
            await prisma.verse.deleteMany({
                where: { bibleVersionId: version.id }
            })

            let totalVerses = 0
            let processedBooks = 0

            for (const book of bibleData) {
                const bookId = BOOK_MAPPING[book.abbrev.toLowerCase()] || BOOK_MAPPING[book.abbrev]

                if (!bookId) {
                    // console.log(`   ⚠️ Livro não mapeado: ${book.abbrev}`)
                    continue
                }

                // Garantir que o livro existe e tem capítulos
                for (let chapterNum = 0; chapterNum < book.chapters.length; chapterNum++) {
                    const chapterNumber = chapterNum + 1
                    const verses = book.chapters[chapterNum]

                    // Otimização: Buscar ID do capítulo (assumindo que seed-bible.ts já rodou e criou a estrutura)
                    // Se não existir, cria.
                    let chapter = await prisma.chapter.findUnique({
                        where: {
                            bookId_number: {
                                bookId: bookId,
                                number: chapterNumber
                            }
                        }
                    })

                    if (!chapter) {
                        chapter = await prisma.chapter.create({
                            data: {
                                bookId: bookId,
                                number: chapterNumber,
                            }
                        })
                    }

                    if (verses.length > 0) {
                        const verseData = verses.map((text, index) => ({
                            chapterId: chapter!.id,
                            number: index + 1,
                            text: text,
                            bibleVersionId: version.id,
                        }))

                        await prisma.verse.createMany({
                            data: verseData
                        })
                        totalVerses += verseData.length
                    }
                }
                processedBooks++
                process.stdout.write(`\r   📊 ${version.abbreviation}: ${processedBooks} livros processados...`)
            }
            console.log(`\n   ✅ ${version.abbreviation} concluída: ${totalVerses} versículos importados.`)

        } catch (error) {
            console.error(`❌ Erro ao processar ${version.id}:`, error)
        }
    }

    console.log('\n🎉 Importação completa!')
}

importAllVersions()
    .then(() => {
        process.exit(0)
    })
    .catch((error) => {
        console.error('Fatal error:', error)
        process.exit(1)
    })
