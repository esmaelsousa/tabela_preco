"use client"

import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export function DashboardSkeleton() {
    return (
        <div className="p-4 md:p-8 space-y-8 animate-in fade-in duration-500">
            <div className="space-y-2">
                <Skeleton className="h-8 w-[200px]" />
                <Skeleton className="h-4 w-[300px]" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                    <Card key={i} glass className="border-primary/5">
                        <CardHeader className="pb-2">
                            <Skeleton className="h-4 w-[100px]" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-8 w-[120px] mb-2" />
                            <Skeleton className="h-3 w-[80px]" />
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card glass className="lg:col-span-2 border-primary/5">
                    <CardHeader>
                        <Skeleton className="h-6 w-[150px]" />
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-[300px] w-full" />
                    </CardContent>
                </Card>
                <Card glass className="border-primary/5">
                    <CardHeader>
                        <Skeleton className="h-6 w-[150px]" />
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="flex items-center gap-4">
                                <Skeleton className="h-10 w-10 rounded-full" />
                                <div className="flex-1 space-y-2">
                                    <Skeleton className="h-4 w-[120px]" />
                                    <Skeleton className="h-3 w-[80px]" />
                                </div>
                                <Skeleton className="h-4 w-[60px]" />
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

export function ProductGridSkeleton() {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <Card key={i} glass className="h-full border-primary/5">
                    <CardHeader className="pb-2">
                        <div className="flex justify-between items-start mb-4">
                            <Skeleton className="h-4 w-[60px] rounded-full" />
                            <Skeleton className="h-3 w-[40px]" />
                        </div>
                        <Skeleton className="h-6 w-full" />
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex justify-between items-center">
                            <Skeleton className="h-8 w-[80px]" />
                            <Skeleton className="h-4 w-[60px]" />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <Skeleton className="h-9 w-full" />
                            <Skeleton className="h-9 w-full" />
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}
