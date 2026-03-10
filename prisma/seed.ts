import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import Database from 'better-sqlite3'
import * as dotenv from 'dotenv'

dotenv.config()

const adapter = new PrismaBetterSqlite3({ url: 'prisma/dev.db' })
const prisma = new PrismaClient({ adapter })

async function main() {
    console.log('Iniciando seed...')

    // Limpar dados existentes
    await prisma.orderItem.deleteMany()
    await prisma.order.deleteMany()
    await prisma.customer.deleteMany()
    await prisma.product.deleteMany()
    await prisma.user.deleteMany()

    // Criar Usuário Admin
    const admin = await prisma.user.create({
        data: {
            id: 'static-admin-id',
            name: 'Esmael Admin',
            email: 'admin@admin.com',
            password: 'admin123', // Em prod usar hash!
            role: 'ADMIN',
        },
    })

    // Criar Produtos
    const productItems = [
        { name: 'Arroz 5kg Premium', sku: 'ARR-001', basePrice: 25.50, category: 'Alimentos' },
        { name: 'Feijão 1kg Preto', sku: 'FEI-002', basePrice: 8.90, category: 'Alimentos' },
        { name: 'Óleo de Soja 900ml', sku: 'OLE-003', basePrice: 6.45, category: 'Limpeza' },
    ]

    for (const p of productItems) {
        await prisma.product.create({ data: p })
    }

    // Criar Clientes
    await prisma.customer.create({
        data: {
            companyName: 'Supermercado Central',
            cnpj: '12.345.678/0001-90',
            address: 'Rua das Flores, 123',
            city: 'São Paulo',
            state: 'SP',
            abcClass: 'A',
            representativeId: admin.id,
        },
    })

    console.log('Seed concluído com sucesso!')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
