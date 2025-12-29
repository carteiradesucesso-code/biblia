import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

const prisma = new PrismaClient()

// Função auxiliar para converter datas
const fixDate = (dateVal: any) => {
    if (!dateVal) return new Date();
    if (typeof dateVal === 'number') return new Date(dateVal);
    return new Date(dateVal);
}

async function importData() {
    const dumpPath = path.resolve(__dirname, '../bible_dump.json')
    console.log('📖 Lendo arquivo de dump:', dumpPath)

    const rawData = fs.readFileSync(dumpPath, 'utf-8')
    const data = JSON.parse(rawData)

    console.log('🚀 Iniciando importação para o Supabase...')

    // 1. Bible Versions
    console.log(`\n📦 Importando ${data.BibleVersion.length} Versões da Bíblia...`)
    for (const item of data.BibleVersion) {
        await prisma.bibleVersion.upsert({
            where: { id: item.id },
            update: {},
            create: {
                ...item,
                createdAt: fixDate(item.createdAt)
            }
        })
    }

    // 2. Books
    console.log(`\n📚 Importando ${data.Book.length} Livros...`)
    for (const item of data.Book) {
        await prisma.book.upsert({
            where: { id: item.id },
            update: {},
            create: {
                ...item,
                createdAt: fixDate(item.createdAt)
            }
        })
    }

    // 3. Chapters (Batch)
    console.log(`\n📑 Importando ${data.Chapter.length} Capítulos...`)
    const chapters = data.Chapter.map(c => ({
        ...c,
        createdAt: fixDate(c.createdAt)
    }))

    await prisma.chapter.createMany({
        data: chapters,
        skipDuplicates: true
    })

    // 4. Verses (Batch - Chunked)
    console.log(`\n✝️ Importando ${data.Verse.length} Versículos (isso pode demorar)...`)
    const verses = data.Verse.map(v => ({
        ...v,
        createdAt: fixDate(v.createdAt)
    }))

    const BATCH_SIZE = 2000 // Aumentei o batch para ser mais rápido

    for (let i = 0; i < verses.length; i += BATCH_SIZE) {
        const batch = verses.slice(i, i + BATCH_SIZE)
        process.stdout.write(`\rProcessando versículos ${i} a ${Math.min(i + batch.length, verses.length)}...`)
        await prisma.verse.createMany({
            data: batch,
            skipDuplicates: true
        })
    }

    console.log('\n\n✅ Importação Concluída com Sucesso!')
}

importData()
    .catch(e => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
