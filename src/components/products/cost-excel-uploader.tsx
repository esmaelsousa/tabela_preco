"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { FileUp, Loader2, CheckCircle2, AlertCircle } from "lucide-react"
import { syncProductsFromExcel } from "@/lib/actions"
import { motion, AnimatePresence } from "framer-motion"

export function CostExcelUploader() {
    const [isUploading, setIsUploading] = useState(false)
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
    const [count, setCount] = useState(0)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setIsUploading(true)
        setStatus('idle')

        const formData = new FormData()
        formData.append('file', file)

        const result = await syncProductsFromExcel(formData)

        if (result.success) {
            setStatus('success')
            setCount(result.count || 0)
            setTimeout(() => setStatus('idle'), 5000)
        } else {
            setStatus('error')
        }

        setIsUploading(false)
        if (fileInputRef.current) fileInputRef.current.value = ""
    }

    return (
        <div className="flex items-center gap-4">
            <input
                type="file"
                accept=".xlsx, .xls"
                className="hidden"
                ref={fileInputRef}
                onChange={handleUpload}
                disabled={isUploading}
            />

            <AnimatePresence mode="wait">
                {status === 'idle' ? (
                    <motion.div
                        key="idle"
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                    >
                        <Button
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isUploading}
                            variant="outline"
                            className="bg-primary/5 border-primary/20 hover:bg-primary/10 text-primary gap-2"
                        >
                            {isUploading ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <FileUp className="h-4 w-4" />
                            )}
                            {isUploading ? "Processando..." : "Importar Planilha de Custo"}
                        </Button>
                    </motion.div>
                ) : status === 'success' ? (
                    <motion.div
                        key="success"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex items-center gap-2 text-green-600 bg-green-500/10 px-4 py-2 rounded-lg text-sm font-medium border border-green-500/20"
                    >
                        <CheckCircle2 className="h-4 w-4" />
                        Sincronizados {count} produtos com sucesso!
                    </motion.div>
                ) : (
                    <motion.div
                        key="error"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex items-center gap-2 text-destructive bg-destructive/10 px-4 py-2 rounded-lg text-sm font-medium border border-destructive/20"
                    >
                        <AlertCircle className="h-4 w-4" />
                        Erro ao processar planilha. Tente novamente.
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
