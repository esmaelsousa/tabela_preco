import { getProducts, getCustomers } from "@/lib/actions"
import { NewOrderContent } from "@/components/orders/new-order-content"

export default async function NewOrderPage() {
    const [products, customers] = await Promise.all([getProducts(), getCustomers()])

    return (
        <NewOrderContent
            initialProducts={products || []}
            initialCustomers={customers || []}
        />
    )
}
