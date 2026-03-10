"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ShoppingCart, Plus, Trash2, Calculator, CheckCircle2, Info } from "lucide-react"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import {
    calculateOrderSummary as calcSummary,
    calculateMaxDiscount as calcMaxDisc,
    formatCurrency as fmtCurr,
    SalesItem
} from "@/lib/commerce"
import { createOrder } from "@/lib/actions"
import { useRouter } from "next/navigation"

export function NewOrderContent({ initialProducts, initialCustomers }: { initialProducts: any[], initialCustomers: any[] }) {
    const router = useRouter()
    const [isSaving, setIsSaving] = useState(false)

    const [selectedCustomerId, setSelectedCustomerId] = useState("")
    const [items, setItems] = useState<{
        id: string,
        name: string,
        price: number,
        quantity: number,
        category: string,
        volume?: string,
        unitsPerBox: number,
        sellType: "UN" | "CX"
    }[]>([])
    const [discountPercent, setDiscountPercent] = useState(0)

    const selectedCustomer = initialCustomers.find(c => c.id === selectedCustomerId)

    const summary = useMemo(() => {
        const salesItems: SalesItem[] = items.map(i => ({
            productId: i.id,
            quantity: i.sellType === "CX" ? i.quantity * i.unitsPerBox : i.quantity,
            price: i.price,
            category: i.category
        }))
        return calcSummary(salesItems, discountPercent)
    }, [items, discountPercent])

    const maxAllowedDiscount = selectedCustomer ? calcMaxDisc(selectedCustomer.abcClass) : 10

    const addItem = (productId: string, qty: number = 1) => {
        const product = initialProducts.find(p => p.id === productId)
        if (!product) return

        setItems(prev => {
            const existing = prev.find(item => item.id === productId)
            if (existing) {
                return prev.map(item => item.id === productId ? { ...item, quantity: item.quantity + qty } : item)
            }
            return [...prev, {
                id: product.id,
                name: product.name,
                price: product.basePrice,
                quantity: qty,
                category: product.category,
                volume: product.volume,
                unitsPerBox: product.unitsPerBox || 1,
                sellType: "UN"
            }]
        })
    }

    const handleSaveOrder = async () => {
        if (!selectedCustomerId || items.length === 0) return

        setIsSaving(true)
        const result = await createOrder({
            customerId: selectedCustomerId,
            representativeId: "static-admin-id",
            totalAmount: summary.total,
            discount: summary.discountAmount,
            items: items.map(i => {
                const finalQty = i.sellType === "CX" ? i.quantity * i.unitsPerBox : i.quantity
                return {
                    productId: i.id,
                    quantity: finalQty,
                    price: i.price,
                    total: i.price * finalQty
                }
            })
        })

        if (result.success) {
            router.push('/')
        } else {
            alert("Erro ao salvar pedido!")
            setIsSaving(false)
        }
    }

    const removeItem = (id: string) => {
        setItems(prev => prev.filter(item => item.id !== id))
    }

    const updateQuantity = (id: string, qty: number) => {
        if (qty < 1) return
        setItems(prev => prev.map(item => item.id === id ? { ...item, quantity: qty } : item))
    }

    const toggleSellType = (id: string) => {
        setItems(prev => prev.map(item => {
            if (item.id === id && item.unitsPerBox > 1) {
                return { ...item, sellType: item.sellType === "UN" ? "CX" : "UN" }
            }
            return item
        }))
    }

    return (
        <div className="p-4 md:p-8 space-y-6 max-w-5xl mx-auto pb-32">
            <header className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-primary">Novo Pedido</h1>
                    <p className="text-muted-foreground">Preencha os itens e aplique as regras comerciais.</p>
                </div>
                <Button variant="outline" className="hidden md:flex gap-2">
                    <Calculator className="h-4 w-4" />
                    Regras Ativas
                </Button>
            </header>

            <AnimatePresence>
                {!selectedCustomerId && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                    >
                        <Card className="border-warning/50 bg-warning/10">
                            <CardContent className="p-4 flex items-center gap-3 text-warning-foreground">
                                <Info className="h-5 w-5" />
                                <p className="text-sm font-medium">Selecione um cliente para habilitar a finalização do pedido e visualizar descontos permitidos.</p>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <Card glass>
                        <CardHeader>
                            <CardTitle className="text-lg">Dados do Cliente</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Select value={selectedCustomerId} onValueChange={setSelectedCustomerId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione um cliente..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {initialCustomers.map(c => (
                                        <SelectItem key={c.id} value={c.id}>
                                            <div className="flex justify-between w-full">
                                                <span>{c.companyName}</span>
                                                <span className="text-[10px] bg-primary/10 px-2 py-0.5 rounded ml-2">Classe {c.abcClass}</span>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </CardContent>
                    </Card>

                    <Card glass>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="text-lg">Itens do Pedido</CardTitle>
                            <div className="flex gap-2">
                                <Select onValueChange={(val) => addItem(val)}>
                                    <SelectTrigger className="w-full md:w-[300px]">
                                        <Plus className="h-4 w-4 mr-2" />
                                        <SelectValue placeholder="Adicionar Produto" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {initialProducts.map(p => (
                                            <SelectItem key={p.id} value={p.id}>
                                                {p.name} {p.volume && `(${p.volume})`}
                                                {p.unitsPerBox > 1 && ` - CX c/${p.unitsPerBox}`}
                                                - R$ {p.basePrice.toFixed(2)}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <AnimatePresence initial={false}>
                                    {items.length === 0 ? (
                                        <div className="text-center py-12 bg-accent/5 rounded-xl border border-dashed">
                                            <ShoppingCart className="h-10 w-10 mx-auto text-muted-foreground opacity-20 mb-4" />
                                            <p className="text-muted-foreground italic">Carrinho vazio. Adicione produtos acima.</p>
                                        </div>
                                    ) : (
                                        items.map((item) => (
                                            <motion.div
                                                key={item.id}
                                                layout
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: 20 }}
                                                className="group flex flex-col md:flex-row md:items-center justify-between p-4 rounded-xl bg-card border border-primary/5 hover:border-primary/20 transition-all shadow-sm"
                                            >
                                                <div className="flex-1 mb-3 md:mb-0">
                                                    <div className="flex items-center gap-2">
                                                        <h4 className="font-bold text-sm md:text-base">{item.name}</h4>
                                                        {item.volume && <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground">{item.volume}</span>}
                                                    </div>
                                                    <p className="text-[11px] text-muted-foreground mt-1">
                                                        R$ {item.price.toFixed(2)} / un
                                                        {item.unitsPerBox > 1 && <span className="ml-2">• Caixa c/ {item.unitsPerBox} un</span>}
                                                    </p>
                                                </div>

                                                <div className="flex items-center justify-between md:justify-end gap-4">
                                                    {/* Toggle UN/CX */}
                                                    {item.unitsPerBox > 1 && (
                                                        <div className="flex p-0.5 bg-muted rounded-lg border">
                                                            <button
                                                                onClick={() => toggleSellType(item.id)}
                                                                className={cn(
                                                                    "px-2 py-1 text-[10px] font-bold rounded-md transition-all",
                                                                    item.sellType === "UN" ? "bg-background shadow-sm text-primary" : "text-muted-foreground"
                                                                )}
                                                            >UN</button>
                                                            <button
                                                                onClick={() => toggleSellType(item.id)}
                                                                className={cn(
                                                                    "px-2 py-1 text-[10px] font-bold rounded-md transition-all",
                                                                    item.sellType === "CX" ? "bg-background shadow-sm text-primary" : "text-muted-foreground"
                                                                )}
                                                            >CX</button>
                                                        </div>
                                                    )}

                                                    <div className="flex items-center bg-accent/30 rounded-lg p-1 border">
                                                        <button
                                                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                            className="h-8 w-8 flex items-center justify-center hover:bg-background rounded-md transition-colors"
                                                        >-</button>
                                                        <span className="w-8 text-center text-sm font-bold tabular-nums">{item.quantity}</span>
                                                        <button
                                                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                            className="h-8 w-8 flex items-center justify-center hover:bg-background rounded-md transition-colors"
                                                        >+</button>
                                                    </div>

                                                    <div className="w-24 text-right">
                                                        <p className="text-[10px] text-muted-foreground leading-none">Total Item</p>
                                                        <p className="font-bold tabular-nums text-primary">
                                                            {fmtCurr(item.price * (item.sellType === "CX" ? item.quantity * item.unitsPerBox : item.quantity))}
                                                        </p>
                                                    </div>

                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => removeItem(item.id)}
                                                        className="h-8 w-8 text-destructive hover:bg-destructive/10 rounded-full"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </motion.div>
                                        ))
                                    )}
                                </AnimatePresence>
                            </div>
                        </CardContent>
                    </Card>
                </div>


                <div className="space-y-6">
                    <Card glass className="sticky top-6 border-primary/20 bg-primary/5">
                        <CardHeader>
                            <CardTitle className="text-lg">Resumo Financeiro</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Subtotal</span>
                                <span className="tabular-nums">{fmtCurr(summary.subtotal)}</span>
                            </div>

                            <div className="flex justify-between text-sm">
                                <div className="flex flex-col">
                                    <span className="text-muted-foreground">Impostos Estimados</span>
                                    <span className="text-[10px] text-muted-foreground italic">(ICMS 7% + ST 20.5%)</span>
                                </div>
                                <span className="tabular-nums text-orange-600 font-medium">+{fmtCurr(summary.totalTaxes)}</span>
                            </div>

                            <div className="space-y-1.5">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Desconto (%)</span>
                                    <span className="text-green-500 font-medium">{discountPercent}%</span>
                                </div>
                                <Input
                                    type="number"
                                    value={discountPercent}
                                    onChange={(e) => setDiscountPercent(Number(e.target.value))}
                                    max={maxAllowedDiscount}
                                    className="h-8"
                                    placeholder={`Máx ${maxAllowedDiscount}%`}
                                />
                                <p className="text-[10px] text-muted-foreground italic">
                                    * Baseado na classe {selectedCustomer?.abcClass || 'C'} do cliente.
                                </p>
                            </div>

                            <div className="pt-4 border-t border-primary/20 flex justify-between items-baseline">
                                <span className="font-bold text-lg">Total Líquido</span>
                                <div className="text-right">
                                    <p className="text-2xl font-black text-primary tabular-nums">{fmtCurr(summary.total)}</p>
                                    <p className="text-xs text-green-600 bg-green-500/10 px-1 rounded inline-block">
                                        Economia: {fmtCurr(summary.discountAmount)}
                                    </p>
                                </div>
                            </div>

                            <Button
                                disabled={items.length === 0 || !selectedCustomer || isSaving}
                                onClick={handleSaveOrder}
                                className="w-full mt-6 h-12 text-lg font-bold group"
                            >
                                {isSaving ? "Salvando..." : "Finalizar Pedido"}
                                <CheckCircle2 className="ml-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                            </Button>

                            {!selectedCustomer && (
                                <p className="text-center text-xs text-destructive mt-2 font-medium animate-pulse">
                                    Selecione um cliente para finalizar.
                                </p>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
