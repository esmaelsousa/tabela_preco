"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, FileSpreadsheet, Send, Trash2, Pencil, FileText, Loader2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { formatCurrency } from "@/lib/commerce"
import { deletePriceTable, getPriceTableById } from "@/lib/actions"
import { useRouter } from "next/navigation"
import Link from "next/link"
import * as XLSX from 'xlsx'
import { jsPDF } from "jspdf"
import autoTable from "jspdf-autotable"

export function PriceTableList({ initialTables }: { initialTables: any[] }) {
    const [search, setSearch] = useState("")
    const [tables, setTables] = useState(initialTables)
    const [sendingId, setSendingId] = useState<string | null>(null)
    const router = useRouter()

    const filteredTables = tables.filter(t =>
        t.name.toLowerCase().includes(search.toLowerCase())
    )

    const handleDelete = async (id: string) => {
        if (!confirm("Tem certeza que deseja excluir esta tabela?")) return

        const result = await deletePriceTable(id)
        if (result.success) {
            setTables(prev => prev.filter(t => t.id !== id))
        } else {
            alert("Erro ao excluir tabela.")
        }
    }

    const handleExportExcel = async (id: string) => {
        const table = await getPriceTableById(id)
        if (!table) return

        const data = table.items.map((item: any) => ({
            'Produto': item.product.name,
            'Categoria': item.product.category,
            'Volume': item.product.volume || '',
            'Preço de Venda': item.salePrice,
            'Unidades p/ Caixa': item.product.unitsPerBox || 1
        }))

        const ws = XLSX.utils.json_to_sheet(data)
        const wb = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(wb, ws, "Tabela de Preços")
        XLSX.writeFile(wb, `${table.name.replace(/\s+/g, '_')}.xlsx`)
    }

    const handleExportPDF = async (id: string) => {
        const table = await getPriceTableById(id)
        if (!table) return

        const doc = new jsPDF()

        // Header
        doc.setFontSize(20)
        doc.setTextColor(40)
        doc.text("TABELA DE PREÇOS", 14, 22)

        doc.setFontSize(14)
        doc.text(table.name, 14, 32)

        if (table.customer) {
            doc.setFontSize(10)
            doc.setTextColor(100)
            doc.text(`Cliente: ${table.customer.companyName}`, 14, 40)
        }

        const tableData = table.items.map((item: any) => [
            item.product.sku,
            item.product.name,
            item.product.volume || '-',
            formatCurrency(item.salePrice)
        ])

        autoTable(doc, {
            startY: table.customer ? 45 : 40,
            head: [['SKU', 'Produto', 'Vol', 'Preço']],
            body: tableData,
            theme: 'striped',
            headStyles: { fillColor: [41, 128, 185], textColor: 255 },
            alternateRowStyles: { fillColor: [245, 245, 245] },
            margin: { top: 20 },
        })

        doc.save(`${table.name.replace(/\s+/g, '_')}.pdf`)
    }

    const handleWhatsAppSend = async (id: string) => {
        setSendingId(id)
        try {
            const table = await getPriceTableById(id)
            if (!table) return

            // Agrupar itens por categoria
            const groupedItems: Record<string, any[]> = {}
            table.items.forEach((item: any) => {
                const cat = item.product.category || "Outros"
                if (!groupedItems[cat]) groupedItems[cat] = []
                groupedItems[cat].push(item)
            })

            let text = `Olá! Segue nossa *${table.name}* 📄\n\n`

            Object.entries(groupedItems).forEach(([category, items]) => {
                text += `*--- ${category.toUpperCase()} ---*\n`
                items.forEach((item: any) => {
                    const vol = item.product.volume ? ` (${item.product.volume})` : ""
                    text += `• ${item.product.name}${vol}: *${formatCurrency(item.salePrice)}*\n`
                })
                text += `\n`
            })

            if (table.description) {
                text += `_Obs: ${table.description}_\n\n`
            }

            text += `Boas vendas! 🚀`

            let phone = table.customer?.phone?.replace(/\D/g, '') || ''

            // Garantir prefixo 55 e lidar com números que já tem 55
            if (phone && !phone.startsWith('55') && phone.length >= 10) {
                phone = '55' + phone
            }

            const encodedText = encodeURIComponent(text)

            // Limite de segurança para URLs (aprox 4000 caracteres para ser seguro na maioria dos dispositivos)
            if (encodedText.length > 4000) {
                alert("Esta tabela é muito grande para o WhatsApp direto. Por favor, use a opção 'PDF' para enviar o arquivo completo.")
                return
            }

            const url = phone
                ? `https://wa.me/${phone}?text=${encodedText}`
                : `https://wa.me/?text=${encodedText}`

            window.open(url, '_blank')
        } catch (error) {
            console.error("Erro ao enviar WhatsApp:", error)
            alert("Não foi possível gerar o link do WhatsApp. Tente exportar para PDF.")
        } finally {
            setSendingId(null)
        }
    }

    return (
        <div className="space-y-6">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Buscar tabelas..."
                    className="pl-10"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence>
                    {filteredTables.map((table) => (
                        <motion.div
                            key={table.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                        >
                            <Card glass className="hover:border-primary/30 transition-all group">
                                <CardHeader className="pb-3">
                                    <div className="flex items-start justify-between">
                                        <div className="p-2 rounded-lg bg-primary/10 text-primary">
                                            <FileSpreadsheet className="h-5 w-5" />
                                        </div>
                                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Link href={`/tabelas/${table.id}/editar`}>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                            </Link>
                                            <Button variant="ghost" size="icon" onClick={() => handleDelete(table.id)} className="h-8 w-8 text-destructive">
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="mt-4">
                                        <CardTitle className="text-xl font-bold">{table.name}</CardTitle>
                                        <div className="flex flex-col gap-1.5 mt-1">
                                            {table.customer && (
                                                <div className="flex items-center gap-1.5 text-[10px] font-bold text-primary bg-primary/5 w-fit px-2 py-0.5 rounded-full border border-primary/10">
                                                    <Send className="h-2.5 w-2.5" />
                                                    {table.customer.companyName}
                                                </div>
                                            )}
                                            <CardDescription className="line-clamp-2">{table.description || "Nenhuma descrição fornecida."}</CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground">{table._count.items} itens</span>
                                        <span className="text-muted-foreground">{new Date(table.createdAt).toLocaleDateString('pt-BR')}</span>
                                    </div>
                                    <div className="grid grid-cols-3 gap-2 pt-2 border-t">
                                        <Button
                                            variant="outline"
                                            className="w-full gap-1.5 text-[10px] px-1"
                                            onClick={() => handleExportExcel(table.id)}
                                        >
                                            <FileSpreadsheet className="h-3 w-3" />
                                            Excel
                                        </Button>
                                        <Button
                                            variant="outline"
                                            className="w-full gap-1.5 text-[10px] px-1"
                                            onClick={() => handleExportPDF(table.id)}
                                        >
                                            <FileText className="h-3 w-3 text-red-500" />
                                            PDF
                                        </Button>
                                        <Button
                                            variant="outline"
                                            className="w-full gap-1.5 text-[10px] px-1 bg-green-500/5 hover:bg-green-500/10 text-green-600 border-green-500/20"
                                            onClick={() => handleWhatsAppSend(table.id)}
                                            disabled={sendingId === table.id}
                                        >
                                            {sendingId === table.id ? (
                                                <Loader2 className="h-3 w-3 animate-spin" />
                                            ) : (
                                                <Send className="h-3 w-3" />
                                            )}
                                            Whats
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {filteredTables.length === 0 && (
                    <div className="col-span-full text-center py-20 bg-accent/5 rounded-xl border border-dashed">
                        <FileSpreadsheet className="h-10 w-10 mx-auto text-muted-foreground opacity-20 mb-4" />
                        <p className="text-muted-foreground italic">Nenhuma tabela de preços cadastrada.</p>
                    </div>
                )}
            </div>
        </div>
    )
}
