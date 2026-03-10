"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Save, ShieldCheck, Landmark, MapPin, Phone, Mail } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createCustomer } from "@/lib/actions"

export default function NewCustomerPage() {
    const router = useRouter()
    const [cnpj, setCnpj] = useState("")
    const [isLoading, setIsLoading] = useState(false)

    const handleCnpjChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        // Máscara simples de CNPJ: 00.000.000/0000-00
        let value = e.target.value.replace(/\D/g, "")
        if (value.length > 14) value = value.slice(0, 14)

        if (value.length <= 14) {
            // Regex mais robusto para formatação progressiva
            const match = e.target.value.replace(/\D/g, "").match(/^(\dt{0,2})(\dt{0,3})(\dt{0,3})(\dt{0,4})(\dt{0,2})$/)
            if (match) {
                const parts = [match[1], match[2], match[3], match[4], match[5]].filter(Boolean)
                if (parts.length === 1) value = parts[0]
                if (parts.length === 2) value = `${parts[0]}.${parts[1]}`
                if (parts.length === 3) value = `${parts[0]}.${parts[1]}.${parts[2]}`
                if (parts.length === 4) value = `${parts[0]}.${parts[1]}.${parts[2]}/${parts[3]}`
                if (parts.length === 5) value = `${parts[0]}.${parts[1]}.${parts[2]}/${parts[3]}-${parts[4]}`
            }
        }
        setCnpj(value)
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsLoading(true)

        const formData = new FormData(e.currentTarget)
        const data = {
            companyName: formData.get("razaoSocial") as string,
            cnpj: formData.get("cnpj") as string,
            segment: formData.get("segmento") as string,
            abcClass: formData.get("abc") as string,
            cep: formData.get("cep") as string,
            address: formData.get("endereco") as string,
            city: formData.get("cidade") as string,
            state: formData.get("uf") as string,
            phone: formData.get("telefone") as string,
            email: formData.get("email") as string,
            contactName: formData.get("contato") as string,
            representativeId: "static-admin-id"
        }

        const res = await createCustomer(data)

        if (res.success) {
            router.push("/clientes")
        } else {
            alert(res.error)
            setIsLoading(false)
        }
    }

    return (
        <div className="p-4 md:p-8 space-y-6 max-w-4xl mx-auto pb-20">
            <header className="flex items-center gap-4">
                <Link href="/clientes">
                    <Button variant="ghost" size="icon" className="rounded-full">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Novo Cliente</h1>
                    <p className="text-muted-foreground">Cadastre um novo estabelecimento na sua rede.</p>
                </div>
            </header>

            <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-6">
                <Card glass className="border-primary/20">
                    <CardHeader className="flex flex-row items-center gap-2 space-y-0 pb-4">
                        <ShieldCheck className="h-5 w-5 text-primary" />
                        <CardTitle className="text-lg">Dados Principais</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="cnpj">CNPJ</Label>
                                <Input
                                    id="cnpj"
                                    name="cnpj"
                                    placeholder="00.000.000/0000-00"
                                    value={cnpj}
                                    onChange={handleCnpjChange}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="telefone">Telefone / WhatsApp</Label>
                                <Input id="telefone" name="telefone" placeholder="(00) 00000-0000" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="razaoSocial">Razão Social</Label>
                            <Input id="razaoSocial" name="razaoSocial" placeholder="Nome legal da empresa" required />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                            <div className="space-y-2">
                                <Label htmlFor="cidade">Cidade</Label>
                                <Input id="cidade" name="cidade" placeholder="Ex: São Paulo" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="uf">UF</Label>
                                <Input id="uf" name="uf" maxLength={2} className="uppercase" placeholder="EX: SP" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="flex justify-end gap-3 mt-4">
                    <Link href="/clientes">
                        <Button variant="outline" type="button" className="px-6">Cancelar</Button>
                    </Link>
                    <Button type="submit" className="gap-2 px-8" disabled={isLoading}>
                        {isLoading ? (
                            "Salvando..."
                        ) : (
                            <>
                                <Save className="h-4 w-4" />
                                Salvar Cliente
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </div>
    )
}
