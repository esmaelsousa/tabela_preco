"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Search, Save, ArrowLeft, Percent, Calculator, Trash2, UserPlus } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { formatCurrency, formatToBRLInput, parseBrazilianValue } from "@/lib/commerce"
import { createPriceTable, updatePriceTable } from "@/lib/actions"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function PriceTableCreator({ initialProducts, initialCustomers, initialData }: {
    initialProducts: any[],
    initialCustomers: any[],
    initialData?: any
}) {
    const router = useRouter()
    const [isSaving, setIsSaving] = useState(false)
    const [tableName, setTableName] = useState(initialData?.name || "")
    const [description, setDescription] = useState(initialData?.description || "")
    const [selectedCustomerId, setSelectedCustomerId] = useState<string>(initialData?.customerId || "")
    const [markup, setMarkup] = useState(30)
    const [search, setSearch] = useState("")
    const [items, setItems] = useState<any[]>(initialData?.items?.map((item: any) => ({
        productId: item.product.id,
        name: item.product.name,
        sku: item.product.sku,
        category: item.product.category,
        costPrice: item.product.basePrice || 0,
        salePrice: item.salePrice
    })) || [])

    // Initialize items only if not in edit mode
    useEffect(() => {
        if (!initialData && initialProducts.length > 0) {
            setItems(initialProducts.map(p => ({
                productId: p.id,
                name: p.name,
                sku: p.sku,
                category: p.category,
                costPrice: p.basePrice || 0,
                salePrice: (p.basePrice || 0) * (1 + markup / 100)
            })))
        }
    }, [initialProducts, initialData])

    const applyGlobalMarkup = () => {
        setItems(prev => prev.map(item => ({
            ...item,
            salePrice: item.costPrice * (1 + markup / 100)
        })))
    }

    const updateItemPrice = (productId: string, newPrice: number) => {
        setItems(prev => prev.map(item =>
            item.productId === productId ? { ...item, salePrice: newPrice } : item
        ))
    }

    const removeItem = (productId: string) => {
        setItems(prev => prev.filter(item => item.productId !== productId))
    }

    const handleSave = async () => {
        if (!tableName) {
            alert("Por favor, dê um nome para a tabela.")
            return
        }

        setIsSaving(true)

        const payload = {
            name: tableName,
            description,
            customerId: selectedCustomerId || undefined,
            items: items.map(i => ({
                productId: i.productId,
                salePrice: i.salePrice
            }))
        }

        let result
        if (initialData?.id) {
            result = await updatePriceTable(initialData.id, payload)
        } else {
            result = await createPriceTable({
                ...payload,
                representativeId: "static-admin-id",
            })
        }

        if (result.success) {
            router.push('/tabelas')
        } else {
            alert("Erro ao salvar tabela.")
            setIsSaving(false)
        }
    }

    const filteredItems = items.filter(i =>
        i.name.toLowerCase().includes(search.toLowerCase()) ||
        i.sku.toLowerCase().includes(search.toLowerCase())
    )

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/tabelas">
                    <Button variant="outline" size="icon" className="rounded-full">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div className="flex-1">
                    <Input
                        placeholder="Nome da Tabela (ex: Tabela Varejo Campinas)"
                        className="text-2xl font-bold border-none bg-transparent h-auto p-0 focus-visible:ring-0 placeholder:opacity-30"
                        value={tableName}
                        onChange={(e) => setTableName(e.target.value)}
                    />
                </div>
                <Button onClick={handleSave} disabled={isSaving || !tableName} className="gap-2 px-8">
                    <Save className="h-4 w-4" />
                    {isSaving ? "Salvando..." : (initialData?.id ? "Salvar Alterações" : "Criar Tabela")}
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 space-y-6">
                    <Card glass>
                        <CardHeader>
                            <CardTitle className="text-lg">Configurações</CardTitle>
                            <CardDescription>Ajustes globais para esta tabela.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-1.5">
                                <Label htmlFor="description">Descrição</Label>
                                <Input
                                    id="description"
                                    placeholder="Opcional: Detalhes ou regras da tabela"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                />
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="customer" className="flex items-center gap-2">
                                    <UserPlus className="h-4 w-4 text-primary" />
                                    Vincular a Cliente (Opcional)
                                </Label>
                                <Select onValueChange={setSelectedCustomerId} value={selectedCustomerId}>
                                    <SelectTrigger id="customer">
                                        <SelectValue placeholder="Selecione um cliente..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {initialCustomers.map(c => (
                                            <SelectItem key={c.id} value={c.id}>
                                                {c.companyName}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="pt-4 border-t space-y-3">
                                <Label className="flex items-center gap-2">
                                    <Percent className="h-4 w-4 text-blue-500" />
                                    Markup Global (%) sobre Custo
                                </Label>
                                <div className="flex gap-2">
                                    <Input
                                        type="number"
                                        value={markup}
                                        onChange={(e) => setMarkup(Number(e.target.value))}
                                        className="h-10"
                                    />
                                    <Button variant="secondary" onClick={applyGlobalMarkup} className="gap-2">
                                        <Calculator className="h-4 w-4" />
                                        Aplicar
                                    </Button>
                                </div>
                                <p className="text-[10px] text-muted-foreground italic">
                                    Isso atualizará o preço de todos os itens baseando-se no custo da planilha.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="relative flex-1 max-w-sm">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Buscar produtos por nome ou SKU..."
                                className="pl-10"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <div className="text-xs text-muted-foreground">
                            Mostrando **{filteredItems.length}** produtos nesta tabela
                        </div>
                    </div>

                    <div className="rounded-xl border glass overflow-hidden">
                        <table className="w-full text-sm">
                            <thead className="bg-accent/50 border-b">
                                <tr>
                                    <th className="text-left p-3 font-medium text-muted-foreground">Produto</th>
                                    <th className="text-right p-3 font-medium text-muted-foreground">Custo (Excel)</th>
                                    <th className="text-right p-3 font-medium text-muted-foreground">Venda</th>
                                    <th className="text-right p-3 font-medium text-muted-foreground">Margem</th>
                                    <th className="p-3"></th>
                                </tr>
                            </thead>
                            <tbody>
                                <AnimatePresence initial={false}>
                                    {filteredItems.map((item) => {
                                        const margin = item.costPrice > 0
                                            ? ((item.salePrice - item.costPrice) / item.costPrice) * 100
                                            : 100
                                        return (
                                            <motion.tr
                                                key={item.productId}
                                                layout
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0, x: -20 }}
                                                className="border-b last:border-0 hover:bg-accent/20 transition-colors group"
                                            >
                                                <td className="p-3">
                                                    <div className="font-medium">{item.name}</div>
                                                    <div className="text-[10px] text-muted-foreground uppercase">{item.sku} • {item.category}</div>
                                                </td>
                                                <td className="p-3 text-right tabular-nums text-muted-foreground">
                                                    {formatCurrency(item.costPrice)}
                                                </td>
                                                <td className="p-3 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <span className="text-[10px] text-muted-foreground">R$</span>
                                                        <input
                                                            type="text"
                                                            value={formatToBRLInput(item.salePrice)}
                                                            onChange={(e) => updateItemPrice(item.productId, parseBrazilianValue(e.target.value))}
                                                            className="w-32 bg-background border rounded px-2 py-1 text-right font-bold text-primary focus:ring-1 focus:ring-primary outline-none"
                                                        />
                                                    </div>
                                                </td>
                                                <td className="p-3 text-right">
                                                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${margin >= 20 ? 'bg-green-500/10 text-green-600' : 'bg-orange-500/10 text-orange-600'}`}>
                                                        {margin.toFixed(1)}%
                                                    </span>
                                                </td>
                                                <td className="p-3 text-right">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-muted-foreground hover:text-destructive transition-opacity"
                                                        onClick={() => removeItem(item.productId)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </td>
                                            </motion.tr>
                                        )
                                    })}
                                </AnimatePresence>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    )
}
