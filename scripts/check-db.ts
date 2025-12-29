import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkDatabase() {
    console.log('🔍 Verificando banco de dados...')
    
    const versions = await prisma.bibleVersion.findMany()
    console.log('\n📚 Versões cadastradas:', versions.map(v => `${v.name} (${v.id})`))

    for (const v of versions) {
        const count = await prisma.verse.count({
            where: { bibleVersionId: v.id }
        })
        console.log(`   - ${v.id}: ${count} versículos`)
    }

    const books = await prisma.book.count()
    console.log(`\n📖 Total de livros: ${books}`)
    
    const chapters = await prisma.chapter.count()
    console.log(`📑 Total de capítulos: ${chapters}`)
}

checkDatabase()
    .then(() => process.exit(0))
    .catch(e => {
        console.error(e)
        process.exit(1)
    })
