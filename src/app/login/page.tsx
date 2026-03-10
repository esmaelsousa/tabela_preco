"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ShieldCheck, Mail, Lock, ArrowRight, CheckCircle2, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"

export default function LoginPage() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError("")

        try {
            const result = await signIn("credentials", {
                email,
                password,
                redirect: false
            })

            if (result?.error) {
                setError("Credenciais inválidas. Verifique seu e-mail e senha.")
                setIsLoading(false)
            } else {
                router.push("/")
                router.refresh()
            }
        } catch (err) {
            setError("Ocorreu um erro ao tentar entrar.")
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-background relative overflow-hidden">
            {/* Background Decorativo */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px] animate-pulse" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-blue-500/10 rounded-full blur-[100px]" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-[400px] p-4 relative z-10"
            >
                <Card glass className="border-primary/20 shadow-2xl shadow-primary/10">
                    <CardHeader className="space-y-1 text-center">
                        <div className="mx-auto h-12 w-12 rounded-xl bg-primary flex items-center justify-center mb-4 shadow-lg shadow-primary/20">
                            <ShieldCheck className="h-7 w-7 text-white" />
                        </div>
                        <CardTitle className="text-3xl font-black tracking-tighter italic">STATUS GO</CardTitle>
                        <CardDescription className="text-muted-foreground font-medium">
                            Entre com suas credenciais de acesso
                        </CardDescription>
                    </CardHeader>

                    <CardContent>
                        <AnimatePresence>
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 flex items-center gap-3 text-destructive text-sm font-medium"
                                >
                                    <AlertCircle className="h-4 w-4" />
                                    {error}
                                </motion.div>
                            )}
                        </AnimatePresence>
                        <motion.form
                            key="login-form"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            onSubmit={handleLogin}
                            className="space-y-4"
                        >
                            <div className="space-y-2">
                                <Label htmlFor="email">E-mail Corporativo</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="admin@admin.com"
                                        className="pl-10"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="password">Senha</Label>
                                    <button type="button" className="text-xs text-primary hover:underline">Esqueceu a senha?</button>
                                </div>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="password"
                                        type="password"
                                        className="pl-10"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                            <Button className="w-full group" size="lg" disabled={isLoading}>
                                {isLoading ? "Acessando..." : (
                                    <>
                                        Entrar no Sistema
                                        <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </Button>
                        </motion.form>
                    </CardContent>
                </Card>

                <p className="text-center mt-8 text-xs text-muted-foreground">
                    &copy; 2026 STATUS GO - Sistema de Gestão de Força de Vendas.<br />
                    Sua conexão está protegida por criptografia de ponta a ponta.
                </p>
            </motion.div>
        </div>
    )
}
