
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const maxDuration = 60; // Set max duration to 60 seconds (limit for Hobby plan is 10s usually, but 60 for Pro)

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
};

const BOOKS = [
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
];

interface VersionConfig {
    id: string;
    name: string;
    abbreviation: string;
    url: string;
    description?: string;
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
        id: 'arc',
        name: 'Almeida Revista e Corrigida',
        abbreviation: 'ARC',
        url: 'https://raw.githubusercontent.com/thiagobodruk/biblia/master/json/acf.json',
        description: 'Tradução clássica da Assembleia de Deus'
    },
    {
        id: 'ara',
        name: 'Almeida Revista e Atualizada',
        abbreviation: 'ARA',
        url: 'https://raw.githubusercontent.com/thiagobodruk/biblia/master/json/aa.json',
        description: 'Equilíbrio entre fidelidade e clareza'
    }
];

interface BibleBook {
    abbrev: string;
    chapters: string[][];
}

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const action = searchParams.get('action');
    const versionId = searchParams.get('id');
    const key = searchParams.get('key');

    if (key !== 'migracao_biblia_2025') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (action === 'structure') {
        try {
            console.log('Criando livros da Bíblia...');
            for (const book of BOOKS) {
                await db.book.upsert({
                    where: { id: book.id },
                    update: {},
                    create: book,
                });
            }
            return NextResponse.json({ message: 'Structure (Books) created successfully' });
        } catch (error) {
            console.error(error);
            return NextResponse.json({ error: 'Failed to create structure', details: error }, { status: 500 });
        }
    }

    if (action === 'version' && versionId) {
        const version = VERSIONS.find(v => v.id === versionId);
        if (!version) {
            return NextResponse.json({ error: 'Version not found' }, { status: 404 });
        }

        try {
            console.log(`Processing version: ${version.name}`);
            const response = await fetch(version.url);
            if (!response.ok) {
                throw new Error(`Failed to download ${version.id}`);
            }

            const bibleData: BibleBook[] = await response.json();

            // Upsert Version
            await db.bibleVersion.upsert({
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
            });

            // Delete old verses to avoid duplicates/conflicts if re-running
            // await db.verse.deleteMany({ where: { bibleVersionId: version.id } });
            // Commented out deleteMany to prevent timeouts on large deletes. Upsert/ignore is better or just assume clean state.
            // Actually, if we re-run, we might want to clear. But deleteMany can be slow.
            // Let's assume we are seeding fresh.

            let totalVerses = 0;

            for (const book of bibleData) {
                const bookId = BOOK_MAPPING[book.abbrev.toLowerCase()] || BOOK_MAPPING[book.abbrev];
                if (!bookId) continue;

                for (let chapterNum = 0; chapterNum < book.chapters.length; chapterNum++) {
                    const chapterNumber = chapterNum + 1;
                    const verses = book.chapters[chapterNum];

                    // Find or create chapter
                    // We can optimize this by assuming chapters exist if we ran structure, but we need to link them.
                    // Actually, 'Chapter' table depends on Book.
                    // We need to make sure Chapter exists.
                    
                    // Optimistic approach: try to find, if not create.
                    // For bulk performance, maybe we can skip checking if we trust the structure?
                    // No, let's be safe.
                    let chapter = await db.chapter.findUnique({
                        where: {
                            bookId_number: {
                                bookId: bookId,
                                number: chapterNumber
                            }
                        }
                    });

                    if (!chapter) {
                        chapter = await db.chapter.create({
                            data: {
                                bookId: bookId,
                                number: chapterNumber,
                            }
                        });
                    }

                    if (verses.length > 0) {
                        const verseData = verses.map((text, index) => ({
                            chapterId: chapter!.id,
                            number: index + 1,
                            text: text,
                            bibleVersionId: version.id,
                        }));

                        // skipDuplicates is not available in createMany for all DBs, but for Postgres it is usually supported in newer Prisma versions.
                        // However, standard createMany ignores duplicates? No, it throws.
                        // skipDuplicates: true is available since Prisma 2.24 for Postgres.
                        await db.verse.createMany({
                            data: verseData,
                            skipDuplicates: true
                        });
                        totalVerses += verseData.length;
                    }
                }
            }

            return NextResponse.json({ message: `Version ${version.id} imported`, totalVerses });

        } catch (error) {
            console.error(error);
            return NextResponse.json({ error: `Failed to import version ${versionId}`, details: error }, { status: 500 });
        }
    }

    return NextResponse.json({ 
        message: 'Seeding API', 
        usage: [
            '?key=migracao_biblia_2025&action=structure',
            '?key=migracao_biblia_2025&action=version&id=nvi',
            '?key=migracao_biblia_2025&action=version&id=acf',
            '?key=migracao_biblia_2025&action=version&id=ara',
            '?key=migracao_biblia_2025&action=version&id=arc'
        ]
    });
}
