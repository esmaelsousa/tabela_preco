"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Plus, Users, Phone, MapPin, Loader2 } from "lucide-react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
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
import { updateCustomer, deleteCustomer } from "@/lib/actions"

export function CustomerListContent({ initialCustomers }: { initialCustomers: any[] }) {
    const [search, setSearch] = useState("")
    const [customers, setCustomers] = useState(initialCustomers)
    const [editingCustomer, setEditingCustomer] = useState<any>(null)
    const [deletingCustomer, setDeletingCustomer] = useState<any>(null)
    const [isSaving, setIsSaving] = useState(false)

    const filteredCustomers = customers.filter(c =>
        c.companyName.toLowerCase().includes(search.toLowerCase()) ||
        c.cnpj.includes(search)
    )

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSaving(true)
        const { id, representative, orders, createdAt, updatedAt, ...updateData } = editingCustomer
        const res = await updateCustomer(id, updateData)
        if (res.success) {
            setCustomers(prev => prev.map(c => c.id === id ? { ...c, ...updateData } : c))
            setEditingCustomer(null)
        }
        setIsSaving(false)
    }

    const handleDelete = async () => {
        if (!deletingCustomer) return
        setIsSaving(true)
        const res = await deleteCustomer(deletingCustomer.id)
        if (res.success) {
            setCustomers(prev => prev.filter(c => c.id !== deletingCustomer.id))
            setDeletingCustomer(null)
        }
        setIsSaving(false)
    }

    return (
        <div className="p-4 md:p-8 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-primary flex items-center gap-2">
                        <Users className="h-6 w-6" />
                        Gestão de Clientes
                    </h1>
                    <p className="text-muted-foreground">Monitore sua carteira de forma simples e rápida.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Link href="/clientes/novo">
                        <Button className="gap-2">
                            <Plus className="h-4 w-4" />
                            Novo Cliente
                        </Button>
                    </Link>
                </div>
            </div>

            <div className="relative max-w-md">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Buscar por Razão Social ou CNPJ..."
                    className="pl-8 bg-accent/20 border-primary/10"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <AnimatePresence mode="popLayout">
                    {filteredCustomers.map((c) => (
                        <motion.div
                            key={c.id}
                            layout
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.2 }}
                        >
                            <Card glass className="hover:border-primary/40 transition-all">
                                <CardContent className="p-6">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="space-y-1">
                                            <h3 className="font-bold text-lg">{c.companyName}</h3>
                                            <p className="text-xs text-muted-foreground font-mono">{c.cnpj}</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-y-3 text-sm">
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                            <MapPin className="h-3.5 w-3.5 text-primary" />
                                            <span className="truncate">{c.city} - {c.state}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                            <Phone className="h-3.5 w-3.5 text-primary" />
                                            {c.phone || "Não informado"}
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-end mt-6 gap-2 pt-4 border-t border-primary/5">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="text-xs"
                                            onClick={() => setEditingCustomer(c)}
                                        >
                                            Editar
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
                                            onClick={() => setDeletingCustomer(c)}
                                        >
                                            Excluir
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {filteredCustomers.length === 0 && (
                <div className="text-center py-20 bg-accent/10 rounded-xl border border-dashed">
                    <Users className="h-10 w-10 mx-auto text-muted-foreground opacity-50 mb-4" />
                    <h3 className="text-lg font-medium">Nenhum cliente encontrado</h3>
                </div>
            )}

            {/* Modal de Edição */}
            <Dialog open={!!editingCustomer} onOpenChange={(open) => !open && setEditingCustomer(null)}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Editar Cliente</DialogTitle>
                        <DialogDescription>
                            Altere as informações básicas do cliente.
                        </DialogDescription>
                    </DialogHeader>
                    {editingCustomer && (
                        <form onSubmit={handleUpdate} className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Razão Social</Label>
                                <Input
                                    id="name"
                                    value={editingCustomer.companyName}
                                    onChange={(e) => setEditingCustomer({ ...editingCustomer, companyName: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="city">Cidade</Label>
                                    <Input
                                        id="city"
                                        value={editingCustomer.city}
                                        onChange={(e) => setEditingCustomer({ ...editingCustomer, city: e.target.value })}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="state">UF</Label>
                                    <Input
                                        id="state"
                                        maxLength={2}
                                        value={editingCustomer.state}
                                        onChange={(e) => setEditingCustomer({ ...editingCustomer, state: e.target.value.toUpperCase() })}
                                    />
                                </div>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="phone">Telefone / WhatsApp</Label>
                                <Input
                                    id="phone"
                                    value={editingCustomer.phone || ""}
                                    onChange={(e) => setEditingCustomer({ ...editingCustomer, phone: e.target.value })}
                                />
                            </div>
                            <DialogFooter className="mt-4">
                                <Button type="button" variant="ghost" onClick={() => setEditingCustomer(null)}>
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

            {/* Alerta de Exclusão */}
            <AlertDialog open={!!deletingCustomer} onOpenChange={(open) => !open && setDeletingCustomer(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Excluir cliente?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta ação excluirá permanentemente <span className="font-bold">{deletingCustomer?.companyName}</span> e não poderá ser desfeita.
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
                            Excluir Cliente
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
