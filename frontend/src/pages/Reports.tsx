import { useState } from 'react';
import { reportsApi } from '../api/reports.api';
import type { SalesReportSummary, ReportFilters } from '../api/reports.api';

// ─── Helpers ─────────────────────────────────────────────────────────────────
function formatCLP(n: number) {
  return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(n);
}
function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString('es-CL', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
}
function todayISO() { return new Date().toISOString().split('T')[0]; }
function firstDayOfMonth() {
  const d = new Date(); d.setDate(1);
  return d.toISOString().split('T')[0];
}

// ─── KPI Card ────────────────────────────────────────────────────────────────
function KPI({ title, value, icon, color }: { title: string; value: string; icon: string; color: string }) {
  return (
    <div style={{ background: '#fff', borderRadius: 12, padding: '18px 20px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)', display: 'flex', alignItems: 'center', gap: 14, flex: '1 1 160px' }}>
      <div style={{ width: 44, height: 44, borderRadius: 10, background: color + '20', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>{icon}</div>
      <div>
        <p style={{ margin: 0, fontSize: 11, color: '#888', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{title}</p>
        <p style={{ margin: '2px 0 0', fontSize: 20, fontWeight: 800, color: '#1a1a1a', fontVariantNumeric: 'tabular-nums' }}>{value}</p>
      </div>
    </div>
  );
}

// ─── Skeleton ────────────────────────────────────────────────────────────────
function Skeleton({ h = 16, w = '100%' }: { h?: number; w?: string }) {
  return <div style={{ height: h, width: w, borderRadius: 6, background: 'linear-gradient(90deg,#f0f0f0 25%,#e0e0e0 50%,#f0f0f0 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s ease-in-out infinite' }} />;
}

// ─── Página principal ─────────────────────────────────────────────────────────
export default function Reports() {
  const [filters, setFilters]     = useState<ReportFilters>({ startDate: firstDayOfMonth(), endDate: todayISO() });
  const [report, setReport]       = useState<SalesReportSummary | null>(null);
  const [loading, setLoading]     = useState(false);
  const [downloading, setDownloading] = useState<'pdf' | 'excel' | null>(null);
  const [error, setError]         = useState<string | null>(null);
  const [searched, setSearched]   = useState(false);
  const [expandedOrder, setExpandedOrder] = useState<number | null>(null);

  const handleSearch = async () => {
    setLoading(true); setError(null); setSearched(true);
    try {
      const data = await reportsApi.getSalesReport(filters);
      setReport(data);
    } catch (e: any) {
      setError(e?.response?.data?.message ?? 'Error al generar reporte');
      setReport(null);
    } finally { setLoading(false); }
  };

  const handleDownload = async (type: 'pdf' | 'excel') => {
    setDownloading(type);
    try {
      if (type === 'pdf') await reportsApi.downloadPDF(filters);
      else await reportsApi.downloadExcel(filters);
    } catch {
      setError('Error al descargar el archivo');
    } finally { setDownloading(null); }
  };

  const paymentLabel: Record<string, string> = { CASH: '💵 Efectivo', CARD: '💳 Tarjeta' };
  const paymentColor: Record<string, { bg: string; color: string }> = {
    CASH: { bg: '#e6f4ea', color: '#2d7a3a' },
    CARD: { bg: '#e8f0fe', color: '#1a56db' },
  };

  return (
    <div style={{ fontFamily: 'system-ui, -apple-system, sans-serif', background: '#f5f6fa', minHeight: '100vh', padding: '24px 20px' }}>
      <style>{`@keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}} *{box-sizing:border-box}`}</style>
      <div style={{ maxWidth: 1050, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: '#1a1a1a' }}>📈 Reportes de Ventas</h1>
          <p style={{ margin: '2px 0 0', fontSize: 13, color: '#888' }}>Genera y exporta reportes detallados por período</p>
        </div>

        {/* Filtros */}
        <div style={{ background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.08)', marginBottom: 20 }}>
          <p style={{ margin: '0 0 14px', fontWeight: 700, fontSize: 14, color: '#333' }}>🗓️ Seleccionar período</p>

          {/* Accesos rápidos */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
            {[
              { label: 'Hoy',         start: todayISO(),        end: todayISO() },
              { label: 'Esta semana', start: (() => { const d = new Date(); d.setDate(d.getDate() - d.getDay()); return d.toISOString().split('T')[0]; })(), end: todayISO() },
              { label: 'Este mes',    start: firstDayOfMonth(), end: todayISO() },
            ].map((p) => (
              <button key={p.label} onClick={() => setFilters({ startDate: p.start, endDate: p.end })}
                style={{ padding: '6px 14px', borderRadius: 8, border: '1px solid #ddd', background: filters.startDate === p.start && filters.endDate === p.end ? '#01696f' : '#fff',
                  color: filters.startDate === p.start && filters.endDate === p.end ? '#fff' : '#555', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                {p.label}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#666', marginBottom: 4, textTransform: 'uppercase' }}>Desde</label>
              <input type="date" value={filters.startDate ?? ''} max={todayISO()}
                onChange={(e) => setFilters((f) => ({ ...f, startDate: e.target.value }))}
                style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #ddd', fontSize: 13 }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#666', marginBottom: 4, textTransform: 'uppercase' }}>Hasta</label>
              <input type="date" value={filters.endDate ?? ''} max={todayISO()}
                onChange={(e) => setFilters((f) => ({ ...f, endDate: e.target.value }))}
                style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #ddd', fontSize: 13 }}
              />
            </div>
            <button onClick={handleSearch} disabled={loading}
              style={{ padding: '9px 22px', borderRadius: 8, border: 'none', background: '#01696f', color: '#fff', fontWeight: 700, fontSize: 14, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}>
              {loading ? '⏳ Generando...' : '🔍 Generar reporte'}
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div style={{ background: '#fff0f0', border: '1px solid #ffd6d6', borderRadius: 10, padding: '10px 16px', marginBottom: 16, color: '#c0392b', fontSize: 13 }}>
            ⚠️ {error}
          </div>
        )}

        {/* Estado vacío inicial */}
        {!searched && !loading && (
          <div style={{ background: '#fff', borderRadius: 12, padding: 56, textAlign: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
            <span style={{ fontSize: 48 }}>📊</span>
            <p style={{ color: '#aaa', margin: '12px 0 0', fontSize: 14 }}>Selecciona un período y haz clic en <strong>Generar reporte</strong></p>
          </div>
        )}

        {/* Skeleton */}
        {loading && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} style={{ flex: '1 1 160px', background: '#fff', borderRadius: 12, padding: '18px 20px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
                  <Skeleton h={11} w="60%" /><div style={{ marginTop: 8 }}><Skeleton h={24} w="80%" /></div>
                </div>
              ))}
            </div>
            <div style={{ background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
              {Array.from({ length: 6 }).map((_, i) => <div key={i} style={{ marginBottom: 12 }}><Skeleton h={40} /></div>)}
            </div>
          </div>
        )}

        {/* Resultados */}
        {report && !loading && (
          <>
            {/* KPIs */}
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 16 }}>
              <KPI title="Ingresos totales"  value={formatCLP(report.totalRevenue)}             icon="💰" color="#01696f" />
              <KPI title="Órdenes"           value={String(report.totalOrders)}                  icon="🛒" color="#4f98a3" />
              <KPI title="Items vendidos"    value={String(report.totalItems)}                   icon="🍹" color="#6daa45" />
              <KPI title="Ticket promedio"   value={formatCLP(report.averageTicket)}             icon="🧾" color="#d19900" />
              <KPI title="Producto estrella" value={report.topProduct || '—'}                    icon="🏆" color="#da7101" />
            </div>

            {/* Desglose por pago */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 12, marginBottom: 16 }}>
              {[
                { method: 'CASH', label: '💵 Efectivo', amount: report.byCash },
                { method: 'CARD', label: '💳 Tarjeta',  amount: report.byCard },
              ].map((p) => (
                <div key={p.method} style={{ background: '#fff', borderRadius: 12, padding: '16px 20px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 14, fontWeight: 600, color: '#333' }}>{p.label}</span>
                  <span style={{ fontSize: 18, fontWeight: 800, color: '#01696f', fontVariantNumeric: 'tabular-nums' }}>{formatCLP(p.amount)}</span>
                </div>
              ))}
            </div>

            {/* Botones de exportación */}
            <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
              <button onClick={() => handleDownload('pdf')} disabled={!!downloading}
                style={{ padding: '9px 20px', borderRadius: 9, border: 'none', background: '#c0392b', color: '#fff', fontWeight: 700, fontSize: 13, cursor: downloading ? 'not-allowed' : 'pointer', opacity: downloading === 'pdf' ? 0.7 : 1 }}>
                {downloading === 'pdf' ? '⏳ Descargando...' : '📄 Exportar PDF'}
              </button>
              <button onClick={() => handleDownload('excel')} disabled={!!downloading}
                style={{ padding: '9px 20px', borderRadius: 9, border: 'none', background: '#1a7a3a', color: '#fff', fontWeight: 700, fontSize: 13, cursor: downloading ? 'not-allowed' : 'pointer', opacity: downloading === 'excel' ? 0.7 : 1 }}>
                {downloading === 'excel' ? '⏳ Descargando...' : '📊 Exportar Excel'}
              </button>
            </div>

            {/* Tabla de órdenes */}
            <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid #f0f0f0' }}>
                <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#333' }}>🧾 Detalle de transacciones ({report.orders.length})</h2>
              </div>
              {report.orders.length === 0 ? (
                <div style={{ padding: 40, textAlign: 'center', color: '#aaa', fontSize: 14 }}>No hay transacciones en este período</div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: '#f8f8f8', borderBottom: '2px solid #f0f0f0' }}>
                      {['#', 'Fecha', 'Vendedor', 'Items', 'Pago', 'Total', ''].map((h) => (
                        <th key={h} style={{ padding: '10px 14px', textAlign: 'left', color: '#666', fontWeight: 700, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {report.orders.map((o, i) => (
                      <>
                        <tr key={o.orderId} style={{ borderBottom: expandedOrder === o.orderId ? 'none' : '1px solid #f5f5f5', background: i % 2 === 0 ? '#fff' : '#fafafa', cursor: 'pointer' }}
                          onClick={() => setExpandedOrder(expandedOrder === o.orderId ? null : o.orderId)}>
                          <td style={{ padding: '10px 14px', color: '#aaa', fontVariantNumeric: 'tabular-nums' }}>#{o.orderId}</td>
                          <td style={{ padding: '10px 14px', color: '#555', whiteSpace: 'nowrap' }}>{formatDateTime(o.createdAt)}</td>
                          <td style={{ padding: '10px 14px', fontWeight: 600, color: '#333' }}>{o.sellerName}</td>
                          <td style={{ padding: '10px 14px', color: '#555', textAlign: 'center' }}>{o.itemCount}</td>
                          <td style={{ padding: '10px 14px' }}>
                            <span style={{ padding: '2px 8px', borderRadius: 999, fontSize: 11, fontWeight: 700, ...paymentColor[o.paymentMethod] }}>
                              {paymentLabel[o.paymentMethod]}
                            </span>
                          </td>
                          <td style={{ padding: '10px 14px', fontWeight: 700, color: '#01696f', fontVariantNumeric: 'tabular-nums', textAlign: 'right' }}>
                            {formatCLP(o.total)}
                          </td>
                          <td style={{ padding: '10px 14px', color: '#aaa', textAlign: 'center' }}>
                            {expandedOrder === o.orderId ? '▲' : '▼'}
                          </td>
                        </tr>
                        {expandedOrder === o.orderId && (
                          <tr key={`${o.orderId}-detail`} style={{ borderBottom: '1px solid #f5f5f5' }}>
                            <td colSpan={7} style={{ padding: '0 14px 12px 48px', background: '#f8fff9' }}>
                              <table style={{ width: '100%', fontSize: 12 }}>
                                <thead>
                                  <tr>
                                    {['Producto', 'Cantidad', 'Precio unit.', 'Subtotal'].map((h) => (
                                      <th key={h} style={{ padding: '6px 8px', textAlign: 'left', color: '#888', fontWeight: 600 }}>{h}</th>
                                    ))}
                                  </tr>
                                </thead>
                                <tbody>
                                  {o.products.map((p, pi) => (
                                    <tr key={pi}>
                                      <td style={{ padding: '4px 8px', color: '#333', fontWeight: 500 }}>{p.name}</td>
                                      <td style={{ padding: '4px 8px', color: '#555', fontVariantNumeric: 'tabular-nums' }}>{p.quantity}</td>
                                      <td style={{ padding: '4px 8px', color: '#555', fontVariantNumeric: 'tabular-nums' }}>{formatCLP(p.price)}</td>
                                      <td style={{ padding: '4px 8px', color: '#01696f', fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>{formatCLP(p.price * p.quantity)}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </td>
                          </tr>
                        )}
                      </>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
