import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Sale, SaleDetail, Product } from './types';

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

export const generateTicket = (sale: Sale, details: SaleDetail[], products: Product[]) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: [80, 200] // Ticket format roughly 80mm width
  });

  doc.setFontSize(10);
  doc.text('REMISION JC LIDER MUNDIAL', 40, 10, { align: 'center' });
  
  doc.setFontSize(10);
  doc.text(`Folio: ${sale.folio}`, 5, 20);
  doc.text(`Fecha: ${new Date(sale.date).toLocaleDateString()}`, 5, 25);
  doc.text(`Cliente: ${sale.customerId}`, 5, 30);

  const tableBody = details.map(d => {
    const product = products.find(p => p.code === d.productCode);
    return [
      product?.image || '', // Column 0: Image
      product?.description || d.productCode, // Column 1: Desc
      d.quantity.toString(), // Column 2: Cant
      formatCurrency(d.subtotal) // Column 3: Total
    ];
  });

  autoTable(doc, {
    head: [['Foto', 'Desc', 'Cant', 'Total']],
    body: tableBody,
    startY: 35,
    theme: 'plain',
    styles: { fontSize: 8, cellPadding: 1, minCellHeight: 10, valign: 'middle' },
    headStyles: { fillColor: [200, 200, 200] },
    columnStyles: {
      0: { cellWidth: 12 }, // Image column width
      1: { cellWidth: 'auto' }, // Description takes remaining space
      2: { cellWidth: 10, halign: 'center' }, // Quantity
      3: { cellWidth: 15, halign: 'right' } // Total
    },
    margin: { left: 2, right: 2 },
    didDrawCell: (data) => {
      if (data.section === 'body' && data.column.index === 0) {
        const image = data.cell.raw as string;
        if (image && image.startsWith('data:image')) {
          try {
            // Draw image inside the cell padding
            doc.addImage(image, 'JPEG', data.cell.x + 1, data.cell.y + 1, 8, 8);
          } catch (e) {
            console.error('Error adding image to PDF', e);
          }
        }
      }
    },
    // Hide text in image column since we draw the image manually
    didParseCell: (data) => {
      if (data.section === 'body' && data.column.index === 0) {
        data.cell.text = []; // Clear text
      }
    }
  });

  const finalY = (doc as any).lastAutoTable.finalY || 40;
  
  doc.text(`Total: ${formatCurrency(sale.total)}`, 40, finalY + 10, { align: 'right' });
  
  doc.save(`ticket-${sale.folio}.pdf`);
};
