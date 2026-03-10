const XLSX = require('xlsx');
const path = require('path');

try {
    const workbook = XLSX.readFile(path.join(__dirname, 'tabela.xlsx'));
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    // Pegar linhas cruas (sem converter colunas em chaves) para depurar estrutura
    const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    console.log('--- ESTRUTURA CRUA (Top 20 linhas) ---');
    rows.slice(0, 20).forEach((row, idx) => {
        console.log(`Linha ${idx}:`, row);
    });
} catch (err) {
    console.error('Erro ao ler Excel:', err.message);
}
