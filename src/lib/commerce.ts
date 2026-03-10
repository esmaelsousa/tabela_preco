/**
 * STATUS GO - Motor de Regras Comerciais
 * Centraliza os cálculos de descontos, impostos e sugestões inteligentes.
 */

export interface SalesItem {
    productId: string
    quantity: number
    price: number
    category: string
}

export interface CommercialRules {
    maxDiscount: number
    suggestedProducts: string[]
}

/**
 * Calcula o desconto máximo permitido com base na Curva ABC do cliente.
 * Clientes 'A' podem ter descontos maiores.
 */
export function calculateMaxDiscount(abcClass: string): number {
    switch (abcClass.toUpperCase()) {
        case 'A': return 15; // 15% de desconto máximo
        case 'B': return 10; // 10%
        case 'C': return 5;  // 5%
        default: return 3;   // 3% para prospectos
    }
}

/**
 * Aplica lógica de sugestão inteligente baseada no histórico ou categoria.
 */
export function getSmartSuggestions(category: string): string[] {
    const suggestions: Record<string, string[]> = {
        'Alimentos': ['Óleo de Soja', 'Arroz 5kg'],
        'Limpeza': ['Detergente', 'Sabão em Pó'],
    }
    return suggestions[category] || []
}

/**
 * Helper para formatar moeda brasileira com precisão corporativa.
 */
export const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    }).format(value)
}

/**
 * Estima o valor de Substituição Tributária (ST) baseado no multiplicador da planilha (0.205).
 */
export function calculateST(price: number, quantity: number): number {
    const stRate = 0.205; // 20.5% identificado na planilha
    return price * quantity * stRate;
}

/**
 * Estima o ICMS baseado na taxa de 7% identificada na planilha.
 */
export function calculateICMS(price: number, quantity: number): number {
    const icmsRate = 0.07; // 7% identificado na planilha
    return price * quantity * icmsRate;
}

/**
 * Calcula o total bruto, impostos e o total líquido com descontos aplicados.
 */
export function calculateOrderSummary(items: SalesItem[], globalDiscount: number = 0) {
    const subtotal = items.reduce((acc, item) => acc + (item.price * item.quantity), 0)

    // Na planilha, os impostos parecem ser somados ao preço base
    const totalST = items.reduce((acc, item) => acc + calculateST(item.price, item.quantity), 0)
    const totalICMS = items.reduce((acc, item) => acc + calculateICMS(item.price, item.quantity), 0)

    const discountAmount = (subtotal * globalDiscount) / 100

    // O total final inclui os impostos (conforme lógica de representante comercial)
    const total = subtotal + totalST + totalICMS - discountAmount

    return {
        subtotal,
        totalST,
        totalICMS,
        totalTaxes: totalST + totalICMS,
        discountAmount,
        total,
        itemsCount: items.length
    }
}
/**
 * Converte uma string formatada (ex: "1.234,56") em um número puro (1234.56).
 */
export function parseBrazilianValue(value: string): number {
    const cleanValue = value.replace(/\D/g, '')
    return Number(cleanValue) / 100
}

/**
 * Formata um número para string de input (ex: 80 -> "80,00").
 */
export function formatToBRLInput(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(value)
}
