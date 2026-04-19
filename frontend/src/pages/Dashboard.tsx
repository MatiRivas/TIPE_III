import { useEffect, useState, useCallback } from 'react';
import { dashboardApi } from '../api/dashboard.api';
import type{DashboardSummary, DashboardFilters, InventoryAlert, RecentTransaction, PaymentBreakdown, TopProduct} from '../types/dashboard.types';
import { useWebSocket } from '../hooks/useWebSocket';
import { useAuthStore } from '../store/useAuthStore';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatCLP(amount: number): string {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('es-CL', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function todayISO(): string {
  return new Date().toISOString().split('T')[0];
}

// ─── Sub-componentes ──────────────────────────────────────────────────────────

interface KPICardProps {
  title: string;
  value: string;
  sub?: string;
  icon: string;
  color: string;
}

function KPICard({ title, value, sub, icon, color }: KPICardProps) {
  return (
    <div style={{
      background: '#fff',
      borderRadius: 12,
      padding: '20px 24px',
      boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
      display: 'flex',
      alignItems: 'center',
      gap: 16,
      flex: '1 1 200px',
      minWidth: 180,
    }}>
      <div style={{
        width: 48,
        height: 48,
        borderRadius: 12,
        background: color + '20',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 22,
        flexShrink: 0,
      }}>
        {icon}
      </div>
      <div>
        <p style={{ margin: 0, fontSize: 12, color: '#888', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{title}</p>
        <p style={{ margin: '2px 0 0', fontSize: 22, fontWeight: 700, color: '#1a1a1a', fontVariantNumeric: 'tabular-nums' }}>{value}</p>
        {sub && <p style={{ margin: 0, fontSize: 12, color: '#aaa' }}>{sub}</p>}
      </div>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 style={{ fontSize: 15, fontWeight: 700, color: '#333', margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: 8 }}>
      {children}
    </h2>
  );
}

function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{
      background: '#fff',
      borderRadius: 12,
      padding: 20,
      boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
      ...style,
    }}>
      {children}
    </div>
  );
}

// Top Products bar chart
function TopProductsChart({ products }: { products: TopProduct[] }) {
  if (products.length === 0) return <p style={{ color: '#aaa', fontSize: 13, textAlign: 'center', padding: '24px 0' }}>Sin datos para este período</p>;
  const max = Math.max(...products.map((p) => p.quantitySold));
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {products.map((p, i) => (
        <div key={p.productId}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <span style={{ fontSize: 13, fontWeight: 500, color: '#333' }}>{p.name}</span>
            <span style={{ fontSize: 13, color: '#666', fontVariantNumeric: 'tabular-nums' }}>
              {p.quantitySold} uds · {formatCLP(p.revenue)}
            </span>
          </div>
          <div style={{ height: 8, background: '#f0f0f0', borderRadius: 999 }}>
            <div style={{
              height: '100%',
              width: `${(p.quantitySold / max) * 100}%`,
              background: ['#01696f', '#4f98a3', '#6daa45', '#d19900', '#da7101'][i % 5],
              borderRadius: 999,
              transition: 'width 0.6s ease',
            }} />
          </div>
        </div>
      ))}
    </div>
  );
}

// Payment breakdown donut-style bars
function PaymentBreakdownChart({ breakdown }: { breakdown: PaymentBreakdown[] }) {
  if (breakdown.length === 0) return <p style={{ color: '#aaa', fontSize: 13, textAlign: 'center', padding: '24px 0' }}>Sin ventas registradas</p>;
  const total = breakdown.reduce((s, b) => s + b.totalAmount, 0);
  const colors: Record<string, string> = { CASH: '#01696f', CARD: '#4f98a3' };
  const labels: Record<string, string> = { CASH: '💵 Efectivo', CARD: '💳 Tarjeta' };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {breakdown.map((b) => (
        <div key={b.method}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#333' }}>{labels[b.method] ?? b.method}</span>
            <span style={{ fontSize: 13, color: '#666', fontVariantNumeric: 'tabular-nums' }}>
              {formatCLP(b.totalAmount)} · {b.orderCount} ped.
            </span>
          </div>
          <div style={{ height: 10, background: '#f0f0f0', borderRadius: 999 }}>
            <div style={{
              height: '100%',
              width: total > 0 ? `${(b.totalAmount / total) * 100}%` : '0%',
              background: colors[b.method] ?? '#888',
              borderRadius: 999,
              transition: 'width 0.6s ease',
            }} />
          </div>
        </div>
      ))}
      <p style={{ margin: '4px 0 0', fontSize: 12, color: '#aaa', textAlign: 'right' }}>
        Total: {formatCLP(total)}
      </p>
    </div>
  );
}

// Inventory alerts list
function InventoryAlertsList({ alerts }: { alerts: InventoryAlert[] }) {
  if (alerts.length === 0) return (
    <div style={{ textAlign: 'center', padding: '24px 0', color: '#6daa45' }}>
      <span style={{ fontSize: 28 }}>✅</span>
      <p style={{ margin: '8px 0 0', fontSize: 13, fontWeight: 500 }}>Todo el inventario está OK</p>
    </div>
  );
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {alerts.map((a) => (
        <div key={a.productId} style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 12px',
          borderRadius: 8,
          background: a.status === 'out' ? '#fff0f0' : '#fffbea',
          border: `1px solid ${a.status === 'out' ? '#ffd6d6' : '#ffe8a1'}`,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>{a.status === 'out' ? '🔴' : '🟡'}</span>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#333' }}>{a.name}</span>
          </div>
          <span style={{ fontSize: 12, color: '#666', fontVariantNumeric: 'tabular-nums' }}>
            Stock: <strong>{a.currentStock}</strong> / mín {a.minStock}
          </span>
        </div>
      ))}
    </div>
  );
}

// Recent transactions table
function RecentTransactionsTable({ transactions }: { transactions: RecentTransaction[] }) {
  if (transactions.length === 0) return (
    <p style={{ color: '#aaa', fontSize: 13, textAlign: 'center', padding: '24px 0' }}>
      No hay transacciones en este período
    </p>
  );
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
        <thead>
          <tr style={{ borderBottom: '2px solid #f0f0f0' }}>
            {['#', 'Hora', 'Vendedor', 'Items', 'Pago', 'Total'].map((h) => (
              <th key={h} style={{ padding: '6px 10px', textAlign: 'left', color: '#888', fontWeight: 600, whiteSpace: 'nowrap' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {transactions.map((t, i) => (
            <tr key={t.orderId} style={{ borderBottom: '1px solid #f5f5f5', background: i % 2 === 0 ? '#fff' : '#fafafa' }}>
              <td style={{ padding: '8px 10px', color: '#aaa', fontVariantNumeric: 'tabular-nums' }}>#{t.orderId}</td>
              <td style={{ padding: '8px 10px', color: '#555', fontVariantNumeric: 'tabular-nums' }}>{formatTime(t.createdAt)}</td>
              <td style={{ padding: '8px 10px', color: '#333', fontWeight: 500 }}>{t.sellerName}</td>
              <td style={{ padding: '8px 10px', color: '#555', textAlign: 'center', fontVariantNumeric: 'tabular-nums' }}>{t.itemCount}</td>
              <td style={{ padding: '8px 10px' }}>
                <span style={{
                  padding: '2px 8px',
                  borderRadius: 999,
                  fontSize: 11,
                  fontWeight: 600,
                  background: t.paymentMethod === 'CASH' ? '#e6f4ea' : '#e8f0fe',
                  color: t.paymentMethod === 'CASH' ? '#2d7a3a' : '#1a56db',
                }}>
                  {t.paymentMethod === 'CASH' ? 'Efectivo' : 'Tarjeta'}
                </span>
              </td>
              <td style={{ padding: '8px 10px', fontWeight: 700, color: '#01696f', fontVariantNumeric: 'tabular-nums', textAlign: 'right' }}>
                {formatCLP(t.total)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Order stats donut-style summary
function OrderStatsPanel({ stats }: { stats: DashboardSummary['orderStats'] }) {
  const items = [
    { label: 'Completadas', value: stats.completedOrders, color: '#6daa45', bg: '#e6f4ea' },
    { label: 'Pendientes',  value: stats.pendingOrders,   color: '#d19900', bg: '#fffbea' },
    { label: 'Canceladas',  value: stats.cancelledOrders, color: '#a12c7b', bg: '#fdf0f8' },
  ];
  return (
    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
      {items.map((item) => (
        <div key={item.label} style={{
          flex: '1 1 80px',
          textAlign: 'center',
          padding: '14px 8px',
          borderRadius: 10,
          background: item.bg,
        }}>
          <p style={{ margin: 0, fontSize: 28, fontWeight: 800, color: item.color, fontVariantNumeric: 'tabular-nums' }}>
            {item.value}
          </p>
          <p style={{ margin: '4px 0 0', fontSize: 11, color: '#555', fontWeight: 600 }}>{item.label}</p>
        </div>
      ))}
      <div style={{
        flex: '1 1 80px',
        textAlign: 'center',
        padding: '14px 8px',
        borderRadius: 10,
        background: '#f0f4ff',
      }}>
        <p style={{ margin: 0, fontSize: 28, fontWeight: 800, color: '#006494', fontVariantNumeric: 'tabular-nums' }}>
          {stats.totalOrders}
        </p>
        <p style={{ margin: '4px 0 0', fontSize: 11, color: '#555', fontWeight: 600 }}>Total</p>
      </div>
    </div>
  );
}

// ─── Loading skeleton ─────────────────────────────────────────────────────────
function Skeleton({ h = 20, w = '100%', r = 8 }: { h?: number; w?: string | number; r?: number }) {
  return (
    <div style={{
      height: h,
      width: w,
      borderRadius: r,
      background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
      backgroundSize: '200% 100%',
      animation: 'shimmer 1.5s ease-in-out infinite',
    }} />
  );
}

// ─── Dashboard principal ──────────────────────────────────────────────────────

export default function Dashboard() {
  const { user } = useAuthStore();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<DashboardFilters>({ date: todayISO() });
  const [filterMode, setFilterMode] = useState<'day' | 'range'>('day');

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await dashboardApi.getSummary(filters);
      setSummary(data);
    } catch (e: any) {
      setError(e?.response?.data?.message ?? 'Error al cargar el dashboard');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useWebSocket(undefined, () => {
    void load();
  });

  useEffect(() => { load(); }, [load]);

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div style={{ fontFamily: 'system-ui, -apple-system, sans-serif', background: '#f5f6fa', minHeight: '100vh', padding: '24px 20px' }}>
      <style>{`
        @keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
        * { box-sizing: border-box; }
      `}</style>

      {/* Header */}
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 24 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: '#1a1a1a' }}>📊 Dashboard</h1>
            <p style={{ margin: '2px 0 0', fontSize: 13, color: '#888' }}>
              Resumen de operaciones — Mojito Bar
            </p>
          </div>

          {/* Filtros */}
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', borderRadius: 8, overflow: 'hidden', border: '1px solid #ddd' }}>
              {(['day', 'range'] as const).map((m) => (
                <button key={m}
                  onClick={() => {
                    setFilterMode(m);
                    setFilters(m === 'day' ? { date: todayISO() } : { startDate: todayISO(), endDate: todayISO() });
                  }}
                  style={{
                    padding: '6px 14px',
                    fontSize: 12,
                    fontWeight: 600,
                    border: 'none',
                    cursor: 'pointer',
                    background: filterMode === m ? '#01696f' : '#fff',
                    color: filterMode === m ? '#fff' : '#555',
                    transition: 'all 0.15s',
                  }}>
                  {m === 'day' ? 'Día' : 'Rango'}
                </button>
              ))}
            </div>

            {filterMode === 'day' ? (
              <input type="date" value={filters.date ?? ''} max={todayISO()}
                onChange={(e) => setFilters({ date: e.target.value })}
                style={{ padding: '6px 10px', borderRadius: 8, border: '1px solid #ddd', fontSize: 13, cursor: 'pointer' }}
              />
            ) : (
              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                <input type="date" value={filters.startDate ?? ''} max={todayISO()}
                  onChange={(e) => setFilters((f) => ({ ...f, startDate: e.target.value }))}
                  style={{ padding: '6px 10px', borderRadius: 8, border: '1px solid #ddd', fontSize: 13 }}
                />
                <span style={{ color: '#aaa', fontSize: 13 }}>→</span>
                <input type="date" value={filters.endDate ?? ''} max={todayISO()}
                  onChange={(e) => setFilters((f) => ({ ...f, endDate: e.target.value }))}
                  style={{ padding: '6px 10px', borderRadius: 8, border: '1px solid #ddd', fontSize: 13 }}
                />
              </div>
            )}

            <div style={{ fontSize: 12, color: '#666', fontWeight: 600 }}>
              Sesion: {user?.name ?? 'Admin'}
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div style={{ background: '#fff0f0', border: '1px solid #ffd6d6', borderRadius: 10, padding: '12px 16px', marginBottom: 20, color: '#c0392b', fontSize: 13, fontWeight: 500 }}>
            ⚠️ {error}
          </div>
        )}

        {/* KPI Cards */}
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 24 }}>
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} style={{ flex: '1 1 200px', minWidth: 180, background: '#fff', borderRadius: 12, padding: '20px 24px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
                <Skeleton h={12} w="60%" />
                <div style={{ marginTop: 8 }}><Skeleton h={28} w="80%" /></div>
              </div>
            ))
          ) : summary ? (
            <>
              <KPICard title="Ingresos Totales"   value={formatCLP(summary.salesSummary.totalRevenue)}  icon="💰" color="#01696f" />
              <KPICard title="Órdenes Completadas" value={String(summary.salesSummary.totalOrders)}       icon="🛒" color="#4f98a3" sub={`${summary.salesSummary.totalItemsSold} productos vendidos`} />
              <KPICard title="Ticket Promedio"     value={formatCLP(summary.salesSummary.averageTicket)}  icon="🧾" color="#6daa45" />
              <KPICard title="Alertas Inventario"  value={String(summary.inventoryAlerts.length)}         icon="⚠️" color={summary.inventoryAlerts.length > 0 ? '#d19900' : '#6daa45'} sub={summary.inventoryAlerts.length > 0 ? 'productos bajo mínimo' : 'todo en orden'} />
            </>
          ) : null}
        </div>

        {/* Fila 2: Top Products + Payment Breakdown */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16, marginBottom: 16 }}>
          <Card>
            <SectionTitle>🏆 Productos más vendidos</SectionTitle>
            {loading ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} h={16} />)}
              </div>
            ) : (
              <TopProductsChart products={summary?.topProducts ?? []} />
            )}
          </Card>

          <Card>
            <SectionTitle>💳 Ventas por método de pago</SectionTitle>
            {loading ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <Skeleton h={16} /><Skeleton h={16} />
              </div>
            ) : (
              <PaymentBreakdownChart breakdown={summary?.paymentBreakdown ?? []} />
            )}
          </Card>
        </div>

        {/* Fila 3: Order Stats + Inventory Alerts */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16, marginBottom: 16 }}>
          <Card>
            <SectionTitle>📦 Estado de órdenes</SectionTitle>
            {loading ? (
              <div style={{ display: 'flex', gap: 12 }}>
                {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} h={70} w="25%" r={10} />)}
              </div>
            ) : summary ? (
              <OrderStatsPanel stats={summary.orderStats} />
            ) : null}
          </Card>

          <Card>
            <SectionTitle>🚨 Alertas de inventario</SectionTitle>
            {loading ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} h={38} r={8} />)}
              </div>
            ) : (
              <InventoryAlertsList alerts={summary?.inventoryAlerts ?? []} />
            )}
          </Card>
        </div>

        {/* Fila 4: Transacciones recientes */}
        <Card>
          <SectionTitle>🕐 Transacciones recientes</SectionTitle>
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} h={36} />)}
            </div>
          ) : (
            <RecentTransactionsTable transactions={summary?.recentTransactions ?? []} />
          )}
        </Card>

        {/* Footer */}
        <p style={{ textAlign: 'center', color: '#ccc', fontSize: 12, marginTop: 24 }}>
          Última actualización: {new Date().toLocaleTimeString('es-CL')}
        </p>
      </div>
    </div>
  );
}