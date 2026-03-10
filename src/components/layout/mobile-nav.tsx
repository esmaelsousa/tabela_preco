"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
    LayoutDashboard,
    ShoppingCart,
    Users,
    Package,
    BarChart3,
    Plus
} from "lucide-react"

const mobileMenuItems = [
    { name: "Home", href: "/", icon: LayoutDashboard },
    { name: "Pedidos", href: "/pedidos", icon: ShoppingCart },
    { name: "Clientes", href: "/clientes", icon: Users },
    { name: "Produtos", href: "/produtos", icon: Package },
]

export function BottomNav() {
    const pathname = usePathname()

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 flex h-16 items-center justify-around border-t border-primary/10 glass md:hidden px-4">
            {mobileMenuItems.slice(0, 2).map((item) => {
                const isActive = pathname === item.href
                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                            "flex flex-col items-center gap-1 transition-all",
                            isActive ? "text-primary" : "text-muted-foreground"
                        )}
                    >
                        <item.icon className="h-5 w-5" />
                        <span className="text-[10px] font-medium">{item.name}</span>
                    </Link>
                )
            })}

            {/* FAB Placeholder position */}
            <div className="w-12" />

            {mobileMenuItems.slice(2).map((item) => {
                const isActive = pathname === item.href
                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                            "flex flex-col items-center gap-1 transition-all",
                            isActive ? "text-primary" : "text-muted-foreground"
                        )}
                    >
                        <item.icon className="h-5 w-5" />
                        <span className="text-[10px] font-medium">{item.name}</span>
                    </Link>
                )
            })}
        </div>
    )
}

export function FAB() {
    return (
        <button
            className="fixed bottom-6 left-1/2 z-50 flex h-14 w-14 -translate-x-1/2 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/20 transition-transform hover:scale-110 active:scale-95 md:hidden"
            aria-label="Novo Pedido"
        >
            <Plus className="h-6 w-6" />
        </button>
    )
}
