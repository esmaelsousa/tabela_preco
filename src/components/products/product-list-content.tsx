"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Filter, Package, ShoppingCart, Info, Loader2, Edit, Trash2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Label } from "@/components/ui/label"
import { updateProduct, deleteProduct } from "@/lib/actions"
import { CostExcelUploader } from "./cost-excel-uploader"

export function ProductListContent({ initialProducts }: { initialProducts: any[] }) {
    const [search, setSearch] = useState("")
    const [products, setProducts] = useState(initialProducts)
    const [editingProduct, setEditingProduct] = useState<any>(null)
    const [deletingProduct, setDeletingProduct] = useState<any>(null)
    const [isSaving, setIsSaving] = useState(false)

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.sku.toLowerCase().includes(search.toLowerCase())
    )

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSaving(true)
        const updatedData = {
            ...editingProduct,
            basePrice: parseFloat(editingProduct.basePrice),
            unitsPerBox: parseInt(editingProduct.unitsPerBox)
        }
        const res = await updateProduct(editingProduct.id, updatedData)
        if (res.success) {
            setProducts(prev => prev.map(p => p.id === editingProduct.id ? updatedData : p))
            setEditingProduct(null)
        }
        setIsSaving(false)
    }

    const handleDelete = async () => {
        if (!deletingProduct) return
        setIsSaving(true)
        const res = await deleteProduct(deletingProduct.id)
        if (res.success) {
            setProducts(prev => prev.filter(p => p.id !== deletingProduct.id))
            setDeletingProduct(null)
        }
        setIsSaving(false)
    }

    return (
        <div className="p-4 md:p-8 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-primary">Catálogo de Produtos</h1>
                    <p className="text-muted-foreground">Consulte SKUs, preços e disponibilidade em tempo real.</p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="relative w-full md:w-[300px]">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Buscar por nome ou SKU..."
                            className="pl-8 bg-accent/20 border-primary/10"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <CostExcelUploader />
                    <Button variant="outline" size="icon">
                        <Filter className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                <AnimatePresence mode="popLayout">
                    {filteredProducts.map((p, index) => (
                        <motion.div
                            key={p.id}
                            layout
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.2 }}
                        >
                            <Card glass className="h-full hover:border-primary/50 transition-all group relative">
                                <CardHeader className="pb-2">
                                    <div className="flex justify-between items-start">
                                        <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider">
                                            {p.category}
                                        </span>
                                        <div className="flex gap-1">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                                onClick={() => setEditingProduct(p)}
                                            >
                                                <Edit className="h-3 w-3" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10"
                                                onClick={() => setDeletingProduct(p)}
                                            >
                                                <Trash2 className="h-3 w-3" />
                                            </Button>
                                            <span className="text-[10px] text-muted-foreground font-mono ml-1">{p.sku}</span>
                                        </div>
                                    </div>
                                    <CardTitle className="text-base mt-2 group-hover:text-primary transition-colors">
                                        {p.name} {p.volume && <span className="text-muted-foreground font-normal">({p.volume})</span>}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-baseline justify-between">
                                        <div className="text-2xl font-bold text-foreground">
                                            R$ {p.basePrice.toFixed(2)}
                                        </div>
                                        <div className="text-[10px] text-muted-foreground text-right">
                                            {p.unitsPerBox > 1 ? `Caixa c/ ${p.unitsPerBox} un` : 'Venda Unitária'}
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <Button variant="outline" size="sm" className="w-full text-xs gap-1">
                                            <Info className="h-3 w-3" />
                                            Detalhes
                                        </Button>
                                        <Button size="sm" className="w-full text-xs gap-1">
                                            <ShoppingCart className="h-3 w-3" />
                                            Carrinho
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {filteredProducts.length === 0 && (
                <div className="text-center py-20 bg-accent/10 rounded-xl border border-dashed">
                    <Package className="h-10 w-10 mx-auto text-muted-foreground opacity-50 mb-4" />
                    <h3 className="text-lg font-medium">Nenhum produto encontrado</h3>
                    <p className="text-muted-foreground">Experimente mudar o termo de busca ou filtros.</p>
                </div>
            )}

            {/* Modal de Edição de Produto */}
            <Dialog open={!!editingProduct} onOpenChange={(open) => !open && setEditingProduct(null)}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Editar Produto</DialogTitle>
                        <DialogDescription>
                            Ajuste os preços e informações do catálogo.
                        </DialogDescription>
                    </DialogHeader>
                    {editingProduct && (
                        <form onSubmit={handleUpdate} className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="pname">Nome do Produto</Label>
                                <Input
                                    id="pname"
                                    value={editingProduct.name}
                                    onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="price">Preço Base (R$)</Label>
                                    <Input
                                        id="price"
                                        type="number"
                                        step="0.01"
                                        value={editingProduct.basePrice}
                                        onChange={(e) => setEditingProduct({ ...editingProduct, basePrice: e.target.value })}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="box">Unidades/Caixa</Label>
                                    <Input
                                        id="box"
                                        type="number"
                                        value={editingProduct.unitsPerBox}
                                        onChange={(e) => setEditingProduct({ ...editingProduct, unitsPerBox: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="pcategory">Categoria</Label>
                                <Input
                                    id="pcategory"
                                    value={editingProduct.category}
                                    onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                                />
                            </div>
                            <DialogFooter className="mt-4">
                                <Button type="button" variant="ghost" onClick={() => setEditingProduct(null)}>
                                    Cancelar
                                </Button>
                                <Button type="submit" disabled={isSaving}>
                                    {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Salvar Alterações
                                </Button>
                            </DialogFooter>
                        </form>
                    )}
                </DialogContent>
            </Dialog>

            {/* Alerta de Inativação de Produto */}
            <AlertDialog open={!!deletingProduct} onOpenChange={(open) => !open && setDeletingProduct(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Inativar Produto?</AlertDialogTitle>
                        <AlertDialogDescription>
                            O produto <span className="font-bold text-foreground">{deletingProduct?.name}</span> deixará de aparecer no catálogo de vendas, mas permanecerá no histórico de pedidos antigos.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            disabled={isSaving}
                        >
                            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Inativar Produto
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}

