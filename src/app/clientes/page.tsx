import { getCustomers } from "@/lib/actions"
import { CustomerListContent } from "@/components/customers/customer-list-content"

export default async function CustomersPage() {
    const customers = await getCustomers()
    return <CustomerListContent initialCustomers={customers || []} />
}
