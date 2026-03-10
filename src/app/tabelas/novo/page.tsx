import { getProducts, getCustomers } from "@/lib/actions"
import { PriceTableCreator } from "@/components/price-tables/price-table-creator"

export default async function NewPriceTablePage() {
    const products = await getProducts()
    const customers = await getCustomers()

    return (
        <div className="p-4 md:p-8 space-y-6">
            <header>
                <h1 className="text-3xl font-bold tracking-tight">Nova Tabela de Preços</h1>
                <p className="text-muted-foreground">Defina as margens de lucro e crie uma tabela personalizada.</p>
            </header>

            <PriceTableCreator initialProducts={products} initialCustomers={customers} />
        </div>
    )
}
