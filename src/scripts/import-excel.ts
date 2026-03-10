import XLSX from 'xlsx';
import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import Database from 'better-sqlite3';
import * as path from 'path';

const adapter = new PrismaBetterSqlite3({ url: 'prisma/dev.db' });
const prisma = new PrismaClient({ adapter });

async function importExcel() {
    console.log('--- Iniciando Importação do Excel ---');

    const workbook = XLSX.readFile(path.join(process.cwd(), 'tabela.xlsx'));
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    // Converter para JSON para facilitar a manipulação
    const data: any[] = XLSX.utils.sheet_to_json(worksheet, { header: 'A' });

    console.log(`Planilha lida: ${data.length} linhas encontradas.`);

    let importedCount = 0;
    let currentCategory = 'Diversos';

    for (const row of data) {
        // Identificar categorias (linhas que têm apenas texto em B e talvez fundo colorido)
        // Na minha análise, linhas de categoria geralmente não têm SKU (coluna A)
        if (!row.A && row.B && isNaN(row.D)) {
            currentCategory = row.B;
            console.log(`Categoria identificada: ${currentCategory}`);
            continue;
        }

        // Se tem SKU e Preço, é um produto
        if (row.A && row.D && !isNaN(row.D)) {
            const sku = String(row.A);
            const fullName = String(row.B);
            const price = parseFloat(row.D);
            const unitsPerBox = row.U ? parseInt(row.U) : 1;

            // Extrair volume do nome (ex: "300 ML", "500 G")
            const volumeMatch = fullName.match(/\d+\s*(ML|G|L|KG)/i);
            const volume = volumeMatch ? volumeMatch[0].toUpperCase() : null;

            try {
                await prisma.product.upsert({
                    where: { sku },
                    update: {
                        name: fullName,
                        basePrice: price,
                        category: currentCategory,
                        volume: volume,
                        unitsPerBox: unitsPerBox,
                        active: true
                    },
                    create: {
                        sku,
                        name: fullName,
                        basePrice: price,
                        category: currentCategory,
                        volume: volume,
                        unitsPerBox: unitsPerBox,
                        active: true
                    }
                });
                importedCount++;
            } catch (err) {
                console.error(`Erro ao importar SKU ${sku}:`, err);
            }
        }
    }

    console.log(`--- Importação concluída! ${importedCount} produtos processados. ---`);
}

importExcel()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
