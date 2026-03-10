"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
    Users,
    Package,
    BarChart3,
    FileSpreadsheet,
    Settings,
    HelpCircle,
    LogOut
} from "lucide-react"
import { signOut } from "next-auth/react"

const menuItems = [
    { name: "Tabelas de Preços", href: "/tabelas", icon: FileSpreadsheet },
    { name: "Clientes", href: "/clientes", icon: Users },
    { name: "Produtos", href: "/produtos", icon: Package },
    { name: "Relatórios", href: "/relatorios", icon: BarChart3 },
    { name: "Configurações", href: "/configuracoes", icon: Settings },
]

export function Sidebar() {
    const pathname = usePathname()

    return (
        <div className="hidden md:flex h-full w-64 flex-col glass border-r border-primary/10">
            <div className="flex h-16 items-center px-6">
                <Link href="/tabelas" className="flex items-center gap-2 font-bold text-xl tracking-tighter">
                    <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground">
                        SG
                    </div>
                    <span>STATUS GO</span>
                </Link>
            </div>
            <div className="flex-1 overflow-auto py-4">
                <nav className="grid gap-1 px-2">
                    {menuItems.map((item) => {
                        const isActive = pathname === item.href
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all hover:bg-accent hover:text-accent-foreground",
                                    isActive ? "bg-primary/10 text-primary" : "text-muted-foreground"
                                )}
                            >
                                <item.icon className={cn("h-4 w-4", isActive && "text-primary")} />
                                {item.name}
                            </Link>
                        )
                    })}
                </nav>
            </div>
            <div className="mt-auto border-t border-primary/10 p-4 space-y-2">
                <button
                    onClick={() => signOut()}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-destructive transition-all hover:bg-destructive/10"
                >
                    <LogOut className="h-4 w-4" />
                    Sair do Sistema
                </button>
            </div>
        </div>
    )
}
