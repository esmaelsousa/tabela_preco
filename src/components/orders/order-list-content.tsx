"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search, Filter, FileText, Clock, CheckCircle2, AlertCircle, MoreVertical, ChevronRight } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { formatCurrency } from "@/lib/commerce"
import { getOrderById } from "@/lib/actions"
import { generateOrderPDF, PDFOrderData } from "@/lib/pdf"
import { Loader2 } from "lucide-react"

const statusStyles = {
    APPROVED: { label: "Aprovado", variant: "success", icon: CheckCircle2 },
    PENDING: { label: "Pendente", variant: "warning", icon: Clock },
    INVOICED: { label: "Faturado", variant: "default", icon: FileText },
    CANCELLED: { label: "Cancelado", variant: "destructive", icon: AlertCircle },
    DRAFT: { label: "Rascunho", variant: "outline", icon: Clock },
}

export function OrderListContent({ initialOrders }: { initialOrders: any[] }) {
    const [search, setSearch] = useState("")
    const [generatingId, setGeneratingId] = useState<string | null>(null)

    const handleDownloadPDF = async (id: string) => {
        setGeneratingId(id)
        try {
            const order = await getOrderById(id)
            if (!order) {
                alert("Erro ao buscar detalhes do pedido.")
                return
            }

            // Estimating taxes (keeping logic consistent with commerce.ts)
            const subtotal = order.totalAmount + order.discount
            const taxes = subtotal * 0.275 // ICMS + ST approx

            const pdfData: PDFOrderData = {
                orderNumber: order.orderNumber,
                customerName: order.customer?.companyName || "Cliente",
                customerCnpj: order.customer?.cnpj || "N/A",
                date: new Date(order.createdAt).toLocaleDateString('pt-BR'),
                items: order.items.map((item: any) => ({
                    sku: item.product?.sku || '-',
                    name: item.product?.name || 'Produto',
                    quantity: item.quantity,
                    price: item.price,
                    total: item.total
                })),
                subtotal: order.totalAmount, // Assuming totalAmount is base for this display
                taxes: taxes,
                discount: order.discount,
                total: order.totalAmount
            }

            generateOrderPDF(pdfData)
        } catch (error) {
            console.error(error)
            alert("Erro ao gerar PDF.")
        } finally {
            setGeneratingId(null)
        }
    }

    const filteredOrders = initialOrders.filter(o =>
        o.customer?.companyName?.toLowerCase().includes(search.toLowerCase()) ||
        o.orderNumber.toString().includes(search)
    )

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Buscar por cliente ou nº do pedido..."
                        className="pl-8 bg-accent/20 border-primary/10"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <Button variant="outline" className="gap-2">
                    <Filter className="h-4 w-4" />
                    Filtrar Status
                </Button>
            </div>

            <div className="space-y-3">
                <AnimatePresence>
                    {filteredOrders.map((order, index) => {
                        const style = statusStyles[order.status as keyof typeof statusStyles] || statusStyles.DRAFT
                        return (
                            <motion.div
                                key={order.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ delay: index * 0.03 }}
                            >
                                <Card glass className="hover:border-primary/30 transition-all cursor-pointer group">
                                    <CardContent className="p-4 flex items-center justify-between">
                                        <div className="flex items-center gap-4 flex-1">
                                            <div className={cn(
                                                "hidden sm:flex h-10 w-10 rounded-full items-center justify-center border",
                                                order.status === "APPROVED" ? "bg-green-500/10 border-green-500/20 text-green-500" :
                                                    order.status === "PENDING" ? "bg-yellow-500/10 border-yellow-500/20 text-yellow-500" :
                                                        "bg-accent border-primary/10 text-muted-foreground"
                                            )}>
                                                <style.icon className="h-5 w-5" />
                                            </div>
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-mono text-[10px] text-muted-foreground">#{order.orderNumber}</span>
                                                    <h3 className="font-bold text-sm sm:text-base leading-none">
                                                        {order.customer?.companyName || "Cliente Desconhecido"}
                                                    </h3>
                                                </div>
                                                <p className="text-xs text-muted-foreground">
                                                    {new Date(order.createdAt).toLocaleDateString('pt-BR')}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-6">
                                            <div className="hidden md:block text-right">
                                                <p className="text-xs text-muted-foreground">Valor Total</p>
                                                <p className="font-bold tabular-nums">{formatCurrency(order.totalAmount)}</p>
                                            </div>

                                            <Badge variant={style.variant as any} className="hidden sm:flex">
                                                {style.label}
                                            </Badge>

                                            <div className="flex items-center gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="rounded-full hover:text-primary"
                                                    disabled={generatingId === order.id}
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        handleDownloadPDF(order.id)
                                                    }}
                                                >
                                                    {generatingId === order.id ? (
                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                    ) : (
                                                        <FileText className="h-4 w-4" />
                                                    )}
                                                </Button>
                                                <Button variant="ghost" size="icon" className="rounded-full">
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                                <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        )
                    })}
                </AnimatePresence>

                {filteredOrders.length === 0 && (
                    <div className="text-center py-20 bg-accent/10 rounded-xl border border-dashed">
                        <FileText className="h-10 w-10 mx-auto text-muted-foreground opacity-50 mb-4" />
                        <h3 className="text-lg font-medium">Nenhum pedido encontrado</h3>
                        <p className="text-muted-foreground">Tente buscar por outro termo.</p>
                    </div>
                )}
            </div>
        </div>
    )
}
