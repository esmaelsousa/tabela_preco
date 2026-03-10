import { FileText, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { getOrders } from "@/lib/actions"
import { OrderListContent } from "@/components/orders/order-list-content"

export default async function OrdersPage() {
    const orders = await getOrders()

    return (
        <div className="p-4 md:p-8 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-primary flex items-center gap-2">
                        <FileText className="h-6 w-6" />
                        Meus Pedidos
                    </h1>
                    <p className="text-muted-foreground">Gerencie suas vendas e acompanhe o status de faturamento.</p>
                </div>
                <Link href="/pedidos/novo">
                    <Button className="gap-2 px-6">
                        <Plus className="h-4 w-4" />
                        Novo Pedido
                    </Button>
                </Link>
            </div>

            <OrderListContent initialOrders={orders} />
        </div>
    )
}
