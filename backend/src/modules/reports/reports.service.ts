import PDFDocument from 'pdfkit';
import ExcelJS from 'exceljs';
import { getSalesRows, normalizeRange } from './reports.repository';
import type { ReportFilters, SalesReportRow, SalesReportSummary, ReportOrderItem } from './reports.types';

function buildSummary(rows: SalesReportRow[], filters: ReportFilters): SalesReportSummary {
  const orderItemsMap = new Map<string, { name: string; quantity: number; revenue: number }>();

  const orders: ReportOrderItem[] = rows.map((order) => {
    const products = order.items.map((item) => {
      const subtotal = item.price * item.quantity;
      const current = orderItemsMap.get(item.product.name) ?? { name: item.product.name, quantity: 0, revenue: 0 };
      current.quantity += item.quantity;
      current.revenue += subtotal;
      orderItemsMap.set(item.product.name, current);

      return {
        name: item.product.name,
        quantity: item.quantity,
        price: item.price,
        subtotal,
      };
    });

    return {
      orderId: order.orderId,
      createdAt: order.createdAt.toISOString(),
      total: order.total,
      paymentMethod: order.paymentMethod as 'CASH' | 'CARD',
      itemCount: order.items.reduce((sum, item) => sum + item.quantity, 0),
      sellerName: order.user?.name ?? 'N/A',
      products,
    };
  });

  const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
  const totalOrders = orders.length;
  const totalItems = orders.reduce((sum, order) => sum + order.itemCount, 0);
  const byCash = orders.filter((order) => order.paymentMethod === 'CASH').reduce((sum, order) => sum + order.total, 0);
  const byCard = orders.filter((order) => order.paymentMethod === 'CARD').reduce((sum, order) => sum + order.total, 0);

  const topProduct = Array.from(orderItemsMap.values()).sort((a, b) => b.quantity - a.quantity)[0]?.name ?? '—';
  const averageTicket = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  return {
    totalRevenue,
    totalOrders,
    totalItems,
    averageTicket: Math.round(averageTicket * 100) / 100,
    byCash,
    byCard,
    topProduct,
    orders,
  };
}

export const getSalesReport = async (filters: ReportFilters): Promise<SalesReportSummary> => {
  const { from, to } = normalizeRange(filters);
  const rows = await getSalesRows(from, to);
  return buildSummary(rows, filters);
};

export const buildPdfBuffer = async (filters: ReportFilters): Promise<Buffer> => {
  const report = await getSalesReport(filters);

  return new Promise<Buffer>((resolve, reject) => {
    const doc = new PDFDocument({ margin: 40, size: 'A4' });
    const chunks: Buffer[] = [];

    doc.on('data', (chunk: Buffer | Uint8Array | string) => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    doc.fontSize(18).text('Reporte de ventas', { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(10).text(`Período: ${filters.startDate ?? filters.date ?? 'inicio'} - ${filters.endDate ?? filters.date ?? 'hoy'}`, { align: 'center' });
    doc.moveDown(1);

    doc.fontSize(12).text(`Ingresos totales: ${report.totalRevenue.toLocaleString('es-CL')}`);
    doc.text(`Órdenes: ${report.totalOrders}`);
    doc.text(`Items vendidos: ${report.totalItems}`);
    doc.text(`Ticket promedio: ${report.averageTicket.toLocaleString('es-CL')}`);
    doc.text(`Producto estrella: ${report.topProduct}`);
    doc.moveDown(1);

    doc.fontSize(13).text('Detalle de órdenes', { underline: true });
    doc.moveDown(0.5);

    report.orders.forEach((order) => {
      doc.fontSize(10).text(`#${order.orderId} | ${new Date(order.createdAt).toLocaleString('es-CL')} | ${order.sellerName} | ${order.paymentMethod} | ${order.total.toLocaleString('es-CL')}`);
      order.products.forEach((product) => {
        doc.fontSize(9).text(`- ${product.name}: ${product.quantity} x ${product.price.toLocaleString('es-CL')} = ${product.subtotal.toLocaleString('es-CL')}`, { indent: 18 });
      });
      doc.moveDown(0.5);
    });

    doc.end();
  });
};

export const buildExcelBuffer = async (filters: ReportFilters): Promise<Buffer> => {
  const report = await getSalesReport(filters);
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Ventas');

  sheet.columns = [
    { header: 'Orden', key: 'orderId', width: 10 },
    { header: 'Fecha', key: 'createdAt', width: 22 },
    { header: 'Vendedor', key: 'sellerName', width: 20 },
    { header: 'Método', key: 'paymentMethod', width: 12 },
    { header: 'Items', key: 'itemCount', width: 10 },
    { header: 'Total', key: 'total', width: 14 },
  ];

  report.orders.forEach((order) => {
    sheet.addRow({
      orderId: order.orderId,
      createdAt: new Date(order.createdAt).toLocaleString('es-CL'),
      sellerName: order.sellerName,
      paymentMethod: order.paymentMethod,
      itemCount: order.itemCount,
      total: order.total,
    });
  });

  const summary = workbook.addWorksheet('Resumen');
  summary.addRows([
    ['Ingresos totales', report.totalRevenue],
    ['Órdenes', report.totalOrders],
    ['Items vendidos', report.totalItems],
    ['Ticket promedio', report.averageTicket],
    ['Efectivo', report.byCash],
    ['Tarjeta', report.byCard],
    ['Producto estrella', report.topProduct],
  ]);

  return Buffer.from(await workbook.xlsx.writeBuffer());
};
