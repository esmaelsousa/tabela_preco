import { getProducts } from "@/lib/actions"
import { ProductListContent } from "@/components/products/product-list-content"

export default async function ProductsPage() {
    const products = await getProducts()
    return <ProductListContent initialProducts={products || []} />
}
