const { PrismaClient } = require('@prisma/client');
const XLSX = require('xlsx');
const path = require('path');

// Helper to determine category based on name (very basic)
function getCategory(name) {
    name = name.toUpperCase();
    if (name.includes('SHAMPOO')) return 'Shampoo';
    if (name.includes('MÁSCARA') || name.includes('MASCARA')) return 'Máscara';
    if (name.includes('CONDICIONADOR')) return 'Condicionador';
    if (name.includes('LEAVE-IN')) return 'Leave-in';
    if (name.includes('LOTE') || name.includes('COMBO')) return 'Combos';
    return 'Geral';
}

const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3');
const Database = require('better-sqlite3');

async function startImport() {
    const adapter = new PrismaBetterSqlite3({ url: 'prisma/dev.db' });
    const prisma = new PrismaClient({ adapter });
    console.log('--- INICIANDO IMPORTAÇÃO PLANILHA DE CUSTO ---');

    try {
        const workbook = XLSX.readFile(path.join(__dirname, 'tabela.xlsx'));
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });

        // Pular as primeiras 12 linhas (cabeçalhos e lixo)
        const productRows = rows.slice(12);
        let importedCount = 0;

        for (const row of productRows) {
            const sku = row[0]?.toString().trim();
            const name = row[1]?.toString().trim();
            const costPrice = parseFloat(row[3]); // VALOR UNITÁRIO
            const unitsPerBox = parseInt(row[20]); // UNID/ CAIXA

            // Validar se é uma linha de produto real
            if (!sku || !name || isNaN(costPrice)) continue;

            await prisma.product.upsert({
                where: { sku },
                update: {
                    name,
                    basePrice: costPrice,
                    unitsPerBox: isNaN(unitsPerBox) ? 1 : unitsPerBox,
                    category: getCategory(name),
                    active: true
                },
                create: {
                    sku,
                    name,
                    basePrice: costPrice,
                    category: getCategory(name),
                    unitsPerBox: isNaN(unitsPerBox) ? 1 : unitsPerBox,
                    unit: 'UN',
                    active: true
                }
            });

            importedCount++;
            if (importedCount % 50 === 0) console.log(`Progresso: ${importedCount} produtos processados...`);
        }

        console.log(`--- SUCESSO: ${importedCount} PRODUTOS SINCRONIZADOS ---`);
    } catch (err) {
        console.error('ERRO CRÍTICO NA IMPORTAÇÃO:', err.message);
    } finally {
        await prisma.$disconnect();
    }
}

startImport();
