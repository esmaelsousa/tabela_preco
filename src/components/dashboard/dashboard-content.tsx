"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { DollarSign, ShoppingCart, Users, Package, ArrowUpRight, ArrowDownRight } from "lucide-react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { formatCurrency } from "@/lib/commerce"

export interface DashboardContentProps {
    data: {
        orderCount: number
        customerCount: number
        productCount: number
        totalRevenue: number
        recentOrders: any[]
        monthlyGoal: number
        currentGoalProgress: number
    }
}

export function DashboardContent({ data }: DashboardContentProps) {
    const stats = [
        {
            title: "Faturamento Total",
            value: formatCurrency(data.totalRevenue),
            description: "Baseado em todos os pedidos",
            icon: DollarSign,
            trend: "up",
            color: "text-blue-500"
        },
        {
            title: "Novos Pedidos",
            value: data.orderCount.toString(),
            description: "Total no sistema",
            icon: ShoppingCart,
            trend: "up",
            color: "text-green-500"
        },
        {
            title: "Clientes",
            value: data.customerCount.toString(),
            description: "Base de dados ativa",
            icon: Users,
            trend: "up",
            color: "text-orange-500"
        },
        {
            title: "Produtos",
            value: data.productCount.toString(),
            description: "Itens no catálogo",
            icon: Package,
            trend: "up",
            color: "text-purple-500"
        }
    ]

    return (
        <div className="flex-1 space-y-8 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                    Dashboard
                </h2>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat, index) => (
                    <motion.div
                        key={stat.title}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                    >
                        <Card glass className="hover:shadow-lg transition-all border-primary/10">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                                <stat.icon className={cn("h-4 w-4", stat.color)} />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stat.value}</div>
                                <div className="flex items-center mt-1 text-xs">
                                    <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
                                    <span className="text-green-500 font-medium">{stat.description}</span>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card glass className="col-span-4 border-primary/10">
                    <CardHeader>
                        <CardTitle>Meta de Vendas Mensal</CardTitle>
                        <CardDescription>Acompanhamento do seu objetivo de faturamento.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-8">
                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground font-medium">Progresso Atual</span>
                                <span className="font-bold text-primary">{data.currentGoalProgress.toFixed(1)}%</span>
                            </div>
                            <div className="h-4 w-full bg-accent/30 rounded-full overflow-hidden border">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${Math.min(data.currentGoalProgress, 100)}%` }}
                                    className="h-full bg-gradient-to-r from-blue-500 to-primary transition-all"
                                />
                            </div>
                            <div className="flex justify-between text-[10px] text-muted-foreground italic">
                                <span>R$ 0,00</span>
                                <span>Meta: {formatCurrency(data.monthlyGoal)}</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 rounded-xl bg-primary/5 border border-primary/10">
                                <p className="text-xs text-muted-foreground">Faltam para a meta</p>
                                <p className="text-xl font-bold">{formatCurrency(Math.max(0, data.monthlyGoal - data.totalRevenue))}</p>
                            </div>
                            <div className="p-4 rounded-xl bg-green-500/5 border border-green-500/10">
                                <p className="text-xs text-muted-foreground">Status do Mês</p>
                                <p className="text-xl font-bold text-green-600">
                                    {data.currentGoalProgress >= 100 ? "Meta Batida! 🚀" : "Em andamento"}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card glass className="col-span-3 border-primary/10">
                    <CardHeader>
                        <CardTitle>Pedidos Recentes</CardTitle>
                        <CardDescription>Você tem {data.orderCount} pedidos no sistema.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-8">
                            {data.recentOrders.length === 0 ? (
                                <p className="text-sm text-muted-foreground">Nenhum pedido realizado ainda.</p>
                            ) : (
                                data.recentOrders.map((order: any) => (
                                    <div key={order.id} className="flex items-center">
                                        <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
                                            <Package className="h-5 w-5 text-primary" />
                                        </div>
                                        <div className="ml-4 space-y-1">
                                            <p className="text-sm font-medium leading-none">{order.customer.companyName}</p>
                                            <p className="text-sm text-muted-foreground">{formatCurrency(order.totalAmount)}</p>
                                        </div>
                                        <div className="ml-auto font-medium">
                                            <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                                                {order.status}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
