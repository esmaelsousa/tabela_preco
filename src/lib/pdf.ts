import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { formatCurrency } from './commerce';

export interface PDFOrderData {
    orderNumber: number;
    customerName: string;
    customerCnpj: string;
    date: string;
    items: {
        sku: string;
        name: string;
        quantity: number;
        price: number;
        total: number;
    }[];
    subtotal: number;
    taxes: number;
    discount: number;
    total: number;
}

export function generateOrderPDF(order: PDFOrderData) {
    const doc = new jsPDF() as any;

    // Header
    doc.setFontSize(22);
    doc.setTextColor(40, 116, 252); // Primary Blue
    doc.text('STATUS GO', 15, 20);

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text('Relatório de Pedido de Venda', 15, 26);

    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text(`Pedido #${order.orderNumber}`, 160, 20);
    doc.text(`Data: ${order.date}`, 160, 26);

    // Divider
    doc.setDrawColor(230);
    doc.line(15, 32, 195, 32);

    // Customer Info
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('DADOS DO CLIENTE', 15, 42);
    doc.setFont('helvetica', 'normal');
    doc.text(`Razão Social: ${order.customerName}`, 15, 48);
    doc.text(`CNPJ: ${order.customerCnpj}`, 15, 54);

    // Items Table
    const tableRows = order.items.map(item => [
        item.sku,
        item.name,
        item.quantity.toString(),
        formatCurrency(item.price),
        formatCurrency(item.total)
    ]);

    doc.autoTable({
        startY: 65,
        head: [['SKU', 'Produto', 'Qtd', 'Preço Unit.', 'Total']],
        body: tableRows,
        headStyles: { fillStyle: 'fill', fillColor: [40, 116, 252], textColor: 255 },
        alternateRowStyles: { fillColor: [245, 247, 250] },
        margin: { left: 15, right: 15 }
    });

    const finalY = doc.lastAutoTable.finalY + 10;

    // Financial Summary
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('RESUMO FINANCEIRO', 130, finalY);

    doc.setFont('helvetica', 'normal');
    doc.text('Subtotal:', 130, finalY + 6);
    doc.text(formatCurrency(order.subtotal), 175, finalY + 6, { align: 'right' });

    doc.text('Impostos Est. (+):', 130, finalY + 12);
    doc.text(formatCurrency(order.taxes), 175, finalY + 12, { align: 'right' });

    doc.text('Desconto (-):', 130, finalY + 18);
    doc.text(formatCurrency(order.discount), 175, finalY + 18, { align: 'right' });

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(40, 116, 252);
    doc.text('TOTAL LÍQUIDO:', 130, finalY + 28);
    doc.text(formatCurrency(order.total), 175, finalY + 28, { align: 'right' });

    // Footer
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.setFont('helvetica', 'italic');
    doc.text('Documento gerado automaticamente pelo sistema STATUS GO.', 105, 285, { align: 'center' });

    // Save/Download
    doc.save(`Pedido_${order.orderNumber}.pdf`);
}
