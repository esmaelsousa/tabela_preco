"use server"

import { revalidatePath } from "next/cache"
import prisma from "./db"

export async function getDashboardStats() {
    try {
        const [orderCount, customerCount, productCount, recentOrders] = await Promise.all([
            prisma.order.count(),
            prisma.customer.count(),
            prisma.product.count(),
            prisma.order.findMany({
                take: 5,
                orderBy: { createdAt: 'desc' },
                include: { customer: true }
            })
        ])

        const orders = await prisma.order.findMany({
            select: { totalAmount: true }
        })
        const totalRevenue = orders.reduce((acc: number, curr: any) => acc + (curr.totalAmount || 0), 0)

        return {
            orderCount,
            customerCount,
            productCount,
            totalRevenue,
            recentOrders,
            monthlyGoal: 50000, // Exemplo de meta
            currentGoalProgress: (totalRevenue / 50000) * 100
        }
    } catch (error) {
        console.error("Erro ao buscar estatísticas:", error)
        return null
    }
}

export async function getProducts() {
    try {
        return await prisma.product.findMany({
            where: { active: true },
            orderBy: { name: 'asc' }
        })
    } catch (error) {
        console.error("Erro ao buscar produtos:", error)
        return []
    }
}

export async function getCustomers() {
    try {
        return await prisma.customer.findMany({
            orderBy: { companyName: 'asc' }
        })
    } catch (error) {
        console.error("Erro ao buscar clientes:", error)
        return []
    }
}

export async function getOrders() {
    try {
        return await prisma.order.findMany({
            orderBy: { createdAt: 'desc' },
            include: { customer: true }
        })
    } catch (error) {
        console.error("Erro ao buscar pedidos:", error)
        return []
    }
}

export async function createOrder(data: {
    customerId: string,
    representativeId: string,
    totalAmount: number,
    discount: number,
    items: { productId: string, quantity: number, price: number, total: number }[]
}) {
    try {
        const lastOrder = await prisma.order.findFirst({
            orderBy: { orderNumber: 'desc' },
            select: { orderNumber: true }
        })
        const nextOrderNumber = (lastOrder?.orderNumber || 1000) + 1

        const order = await prisma.order.create({
            data: {
                orderNumber: nextOrderNumber,
                customerId: data.customerId,
                representativeId: data.representativeId,
                totalAmount: data.totalAmount,
                discount: data.discount,
                status: 'DRAFT',
                items: {
                    create: data.items.map(item => ({
                        productId: item.productId,
                        quantity: item.quantity,
                        price: item.price,
                        total: item.total
                    }))
                }
            }
        })

        revalidatePath('/')
        revalidatePath('/pedidos')
        return { success: true, orderId: order.id }
    } catch (error) {
        console.error("Erro ao criar pedido:", error)
        return { success: false, error: "Falha ao salvar pedido" }
    }
}

export async function createCustomer(data: {
    companyName: string,
    cnpj: string,
    address: string,
    city: string,
    state: string,
    phone?: string,
    email?: string,
    cep?: string,
    contactName?: string,
    segment?: string,
    abcClass?: string,
    representativeId: string
}) {
    try {
        const customer = await prisma.customer.create({
            data: {
                companyName: data.companyName,
                cnpj: data.cnpj,
                address: data.address,
                city: data.city,
                state: data.state,
                phone: data.phone,
                email: data.email,
                cep: data.cep,
                contactName: data.contactName,
                segment: data.segment,
                abcClass: data.abcClass || "C",
                representativeId: data.representativeId
            }
        })
        revalidatePath('/clientes')
        return { success: true, customerId: customer.id }
    } catch (error) {
        console.error("Erro ao criar cliente:", error)
        return { success: false, error: "Erro ao cadastrar cliente. Verifique se o CNPJ já existe." }
    }
}

export async function updateCustomer(id: string, data: any) {
    try {
        await prisma.customer.update({
            where: { id },
            data
        })
        revalidatePath('/clientes')
        return { success: true }
    } catch (error) {
        console.error("Erro ao atualizar cliente:", error)
        return { success: false, error: "Erro ao atualizar" }
    }
}

export async function deleteCustomer(id: string) {
    try {
        await prisma.customer.delete({
            where: { id }
        })
        revalidatePath('/clientes')
        return { success: true }
    } catch (error) {
        console.error("Erro ao excluir cliente:", error)
        return { success: false, error: "Erro ao excluir" }
    }
}

export async function updateProduct(id: string, data: any) {
    try {
        await prisma.product.update({
            where: { id },
            data
        })
        revalidatePath('/produtos')
        return { success: true }
    } catch (error) {
        console.error("Erro ao atualizar produto:", error)
        return { success: false, error: "Erro ao atualizar" }
    }
}

export async function deleteProduct(id: string) {
    try {
        await prisma.product.update({
            where: { id },
            data: { active: false }
        })
        revalidatePath('/produtos')
        return { success: true }
    } catch (error) {
        console.error("Erro ao excluir produto:", error)
        return { success: false, error: "Erro ao excluir" }
    }
}
export async function getOrderById(id: string) {
    try {
        return await prisma.order.findUnique({
            where: { id },
            include: {
                customer: true,
                items: {
                    include: {
                        product: true
                    }
                }
            }
        })
    } catch (error) {
        console.error("Erro ao buscar pedido por ID:", error)
        return null
    }
}

export async function getPriceTables() {
    try {
        return await prisma.priceTable.findMany({
            where: { active: true },
            orderBy: { createdAt: 'desc' },
            include: {
                customer: true,
                _count: {
                    select: { items: true }
                }
            }
        })
    } catch (error) {
        console.error("Erro ao buscar tabelas de preços:", error)
        return []
    }
}

export async function createPriceTable(data: {
    name: string,
    description?: string,
    representativeId: string,
    customerId?: string,
    items: { productId: string, salePrice: number }[]
}) {
    try {
        const table = await prisma.priceTable.create({
            data: {
                name: data.name,
                description: data.description,
                representativeId: data.representativeId,
                customerId: data.customerId,
                items: {
                    create: data.items.map(item => ({
                        productId: item.productId,
                        salePrice: item.salePrice
                    }))
                }
            }
        })
        revalidatePath('/tabelas')
        return { success: true, tableId: table.id }
    } catch (error) {
        console.error("Erro ao criar tabela de preços:", error)
        return { success: false, error: "Erro ao criar tabela" }
    }
}

export async function deletePriceTable(id: string) {
    try {
        await prisma.priceTable.delete({
            where: { id }
        })
        revalidatePath('/tabelas')
        return { success: true }
    } catch (error) {
        console.error("Erro ao excluir tabela de preços:", error)
        return { success: false, error: "Erro ao excluir tabela" }
    }
}

export async function updatePriceTable(id: string, data: {
    name: string,
    description?: string,
    customerId?: string,
    items: { productId: string, salePrice: number }[]
}) {
    try {
        await prisma.$transaction([
            // Atualizar dados básicos
            prisma.priceTable.update({
                where: { id },
                data: {
                    name: data.name,
                    description: data.description,
                    customerId: data.customerId,
                }
            }),
            // Remover itens antigos
            prisma.priceTableItem.deleteMany({
                where: { priceTableId: id }
            }),
            // Criar novos itens
            prisma.priceTableItem.createMany({
                data: data.items.map(item => ({
                    priceTableId: id,
                    productId: item.productId,
                    salePrice: item.salePrice
                }))
            })
        ])

        revalidatePath('/tabelas')
        return { success: true }
    } catch (error) {
        console.error("Erro ao atualizar tabela de preços:", error)
        return { success: false, error: "Erro ao atualizar tabela" }
    }
}

export async function getPriceTableById(id: string) {
    try {
        return await prisma.priceTable.findUnique({
            where: { id },
            include: {
                customer: true,
                items: {
                    include: {
                        product: true
                    }
                }
            }
        })
    } catch (error) {
        console.error("Erro ao buscar tabela por ID:", error)
        return null
    }
}

function getCategory(name: string) {
    const n = name.toUpperCase();
    if (n.includes('SHAMPOO')) return 'Shampoo';
    if (n.includes('MÁSCARA') || n.includes('MASCARA')) return 'Máscara';
    if (n.includes('CONDICIONADOR')) return 'Condicionador';
    if (n.includes('LEAVE-IN')) return 'Leave-in';
    if (n.includes('LOTE') || n.includes('COMBO')) return 'Combos';
    return 'Geral';
}

export async function syncProductsFromExcel(formData: FormData) {
    try {
        const file = formData.get('file') as File
        if (!file) return { success: false, error: "Arquivo não encontrado" }

        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)

        const XLSX = await import('xlsx')
        const workbook = XLSX.read(buffer)
        const sheet = workbook.Sheets[workbook.SheetNames[0]]
        const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][]

        // Pular as primeiras 12 linhas (conforme sync-products.js)
        const productRows = rows.slice(12)
        let importedCount = 0

        for (const row of productRows) {
            const sku = row[0]?.toString().trim()
            const name = row[1]?.toString().trim()
            const costPrice = parseFloat(row[3]) // VALOR UNITÁRIO
            const unitsPerBox = parseInt(row[20]) // UNID/ CAIXA

            if (!sku || !name || isNaN(costPrice)) continue

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
            })
            importedCount++
        }

        revalidatePath('/produtos')
        revalidatePath('/tabelas/novo')
        return { success: true, count: importedCount }
    } catch (error) {
        console.error("Erro ao sincronizar produtos:", error)
        return { success: false, error: "Erro ao processar planilha" }
    }
}
