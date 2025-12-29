const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

const dbPath = path.resolve(__dirname, '../db/custom.db');
const db = new Database(dbPath, { readonly: true });

console.log('📖 Extraindo dados do SQLite...');

const tables = ['BibleVersion', 'Book', 'Chapter', 'Verse'];
const data = {};

for (const table of tables) {
    try {
        const rows = db.prepare(`SELECT * FROM ${table}`).all();
        data[table] = rows;
        console.log(`✅ ${table}: ${rows.length} registros extraídos.`);
    } catch (error) {
        console.error(`❌ Erro ao ler tabela ${table}:`, error.message);
    }
}

const outputPath = path.resolve(__dirname, '../bible_dump.json');
fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));

console.log(`\n🎉 Dump salvo em: ${outputPath}`);
console.log(`Tamanho do arquivo: ${(fs.statSync(outputPath).size / 1024 / 1024).toFixed(2)} MB`);
