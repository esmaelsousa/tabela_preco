import { getPriceTables } from "@/lib/actions"
import { PriceTableList } from "@/components/price-tables/price-table-list"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"

export default async function PriceTablesPage() {
    const tables = await getPriceTables()

    return (
        <div className="p-4 md:p-8 space-y-6">
            <header className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Tabelas de Preços</h1>
                    <p className="text-muted-foreground">Gerencie suas tabelas personalizadas para diferentes clientes ou regiões.</p>
                </div>
                <Link href="/tabelas/novo">
                    <Button className="gap-2">
                        <Plus className="h-4 w-4" />
                        Nova Tabela
                    </Button>
                </Link>
            </header>

            <PriceTableList initialTables={tables} />
        </div>
    )
}
