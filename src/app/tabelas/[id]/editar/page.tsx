import { getProducts, getCustomers, getPriceTableById } from "@/lib/actions"
import { PriceTableCreator } from "@/components/price-tables/price-table-creator"
import { notFound } from "next/navigation"

export default async function EditPriceTablePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const [products, customers, table] = await Promise.all([
        getProducts(),
        getCustomers(),
        getPriceTableById(id)
    ])

    if (!table) {
        notFound()
    }

    return (
        <div className="p-4 md:p-8 space-y-6">
            <header>
                <h1 className="text-3xl font-bold tracking-tight">Editar Tabela de Preços</h1>
                <p className="text-muted-foreground">Ajuste os valores, remova itens ou altere o cliente vinculado.</p>
            </header>

            <PriceTableCreator
                initialProducts={products}
                initialCustomers={customers}
                initialData={table}
            />
        </div>
    )
}
