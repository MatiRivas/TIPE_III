import { useEffect, useState } from 'react';
import { productsApi } from '../api/products.api';
import type { Product } from '../api/products.api';

function formatCLP(n: number) {
  return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(n);
}

const IS: React.CSSProperties = {
  width: '100%', padding: '9px 12px', borderRadius: 8,
  border: '1px solid #ddd', fontSize: 14, fontFamily: 'inherit', boxSizing: 'border-box',
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#555', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</label>
      {children}
    </div>
  );
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16 }}>
      <div style={{ background: '#fff', borderRadius: 16, padding: 28, width: '100%', maxWidth: 440, boxShadow: '0 12px 48px rgba(0,0,0,0.2)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700 }}>{title}</h2>
          <button onClick={onClose} style={{ border: 'none', background: 'none', fontSize: 20, cursor: 'pointer', color: '#aaa' }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ─── Modal crear/editar producto ──────────────────────────────────────────────
function ProductModal({ product, onSave, onClose, loading, error }: {
  product?: Product;
  onSave: (payload: Omit<Product, 'id' | 'createdAt'>) => Promise<void>;
  onClose: () => void;
  loading: boolean;
  error: string | null;
}) {
  const [name, setName]         = useState(product?.name ?? '');
  const [price, setPrice]       = useState(String(product?.price ?? ''));
  const [imageUrl, setImageUrl] = useState(product?.imageUrl ?? '');
  const [available, setAvailable] = useState(product?.available ?? true);

  return (
    <Modal title={product ? `✏️ Editar — ${product.name}` : '➕ Nuevo producto'} onClose={onClose}>
      <form onSubmit={async (e) => { e.preventDefault(); await onSave({ name, price: Number(price), imageUrl: imageUrl || undefined, available }); }}>
        <Field label="Nombre">
          <input style={IS} value={name} onChange={(e) => setName(e.target.value)} required placeholder="Ej: Mojito Clásico" />
        </Field>
        <Field label="Precio (CLP)">
          <input style={IS} type="number" min="0" value={price} onChange={(e) => setPrice(e.target.value)} required placeholder="5000" />
        </Field>
        <Field label="URL imagen (opcional)">
          <input style={IS} type="url" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://..." />
        </Field>
        <Field label="Disponible para venta">
          <div
            onClick={() => setAvailable(!available)}
            style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', width: 'fit-content' }}
          >
            <div style={{
              width: 44, height: 24, borderRadius: 999,
              background: available ? '#01696f' : '#ddd',
              position: 'relative', transition: 'background 0.2s',
            }}>
              <div style={{
                width: 18, height: 18, borderRadius: 999, background: '#fff',
                position: 'absolute', top: 3,
                left: available ? 23 : 3,
                transition: 'left 0.2s',
                boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
              }} />
            </div>
            <span style={{ fontSize: 13, fontWeight: 600, color: available ? '#01696f' : '#aaa' }}>
              {available ? 'Disponible' : 'No disponible'}
            </span>
          </div>
        </Field>
        {error && <div style={{ background: '#fff0f0', border: '1px solid #ffd6d6', borderRadius: 8, padding: '8px 12px', fontSize: 13, color: '#c0392b', marginBottom: 14 }}>⚠️ {error}</div>}
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
          <button type="button" onClick={onClose} style={{ padding: '8px 18px', borderRadius: 8, border: '1px solid #ddd', background: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>Cancelar</button>
          <button type="submit" disabled={loading} style={{ padding: '8px 20px', borderRadius: 8, border: 'none', background: '#01696f', color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 700 }}>
            {loading ? 'Guardando...' : product ? 'Guardar cambios' : 'Crear producto'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

// ─── Tarjeta producto ─────────────────────────────────────────────────────────
function ProductCard({ product, onToggle, onEdit, onDelete, toggling }: {
  product: Product;
  onToggle: (id: number, available: boolean) => void;
  onEdit: (p: Product) => void;
  onDelete: (id: number, name: string) => void;
  toggling: boolean;
}) {
  return (
    <div style={{
      borderRadius: 18, overflow: 'hidden',
      boxShadow: '0 4px 20px rgba(0,0,0,0.09)',
      border: `2px solid ${product.available ? '#a8d5b5' : '#f5b5b5'}`,
      background: '#fff',
      display: 'flex', flexDirection: 'column',
      opacity: product.available ? 1 : 0.75,
      transition: 'transform 0.15s, box-shadow 0.15s',
    }}
      onMouseOver={(e) => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-3px)'; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 8px 32px rgba(0,0,0,0.13)'; }}
      onMouseOut={(e)  => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';    (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 20px rgba(0,0,0,0.09)'; }}
    >
      {/* Imagen */}
      <div style={{ width: '100%', aspectRatio: '4/3', background: 'linear-gradient(135deg,#e8f5f5,#d0eeee)', position: 'relative', overflow: 'hidden' }}>
        {product.imageUrl
          ? <img src={product.imageUrl} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
          : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span style={{ fontSize: 52 }}>🍹</span></div>
        }
        {/* Overlay si no disponible */}
        {!product.available && (
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontWeight: 800, color: '#fff', background: 'rgba(192,57,43,0.9)', padding: '6px 16px', borderRadius: 999, fontSize: 13 }}>🚫 No disponible</span>
          </div>
        )}
        {/* Badge */}
        <span style={{
          position: 'absolute', top: 10, right: 10,
          padding: '4px 10px', borderRadius: 999, fontSize: 11, fontWeight: 700,
          background: product.available ? '#e6f4ea' : '#fff0f0',
          color: product.available ? '#2d7a3a' : '#c0392b',
          boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
        }}>
          {product.available ? '✅ Disponible' : '🚫 Agotado'}
        </span>
      </div>

      {/* Info */}
      <div style={{ padding: '16px 18px 18px', display: 'flex', flexDirection: 'column', gap: 12, flex: 1 }}>
        <div>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: '#1a1a1a' }}>{product.name}</h3>
          <p style={{ margin: '4px 0 0', fontSize: 20, fontWeight: 800, color: '#01696f', fontVariantNumeric: 'tabular-nums' }}>{formatCLP(product.price)}</p>
        </div>

        {/* Toggle disponibilidad */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f5f6fa', borderRadius: 10, padding: '10px 14px' }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#555' }}>A la venta</span>
          <div
            onClick={() => !toggling && onToggle(product.id, !product.available)}
            style={{ cursor: toggling ? 'not-allowed' : 'pointer', opacity: toggling ? 0.6 : 1 }}
          >
            <div style={{
              width: 48, height: 26, borderRadius: 999,
              background: product.available ? '#01696f' : '#ddd',
              position: 'relative', transition: 'background 0.25s',
            }}>
              <div style={{
                width: 20, height: 20, borderRadius: 999, background: '#fff',
                position: 'absolute', top: 3,
                left: product.available ? 25 : 3,
                transition: 'left 0.25s',
                boxShadow: '0 1px 4px rgba(0,0,0,0.25)',
              }} />
            </div>
          </div>
        </div>

        {/* Acciones */}
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => onEdit(product)} style={{ flex: 1, padding: '9px', borderRadius: 9, border: '1.5px solid #01696f', background: '#fff', color: '#01696f', cursor: 'pointer', fontSize: 13, fontWeight: 700 }}>✏️ Editar</button>
          <button onClick={() => onDelete(product.id, product.name)} style={{ padding: '9px 12px', borderRadius: 9, border: 'none', background: '#fff0f8', color: '#a12c7b', cursor: 'pointer', fontSize: 13, fontWeight: 700 }}>🗑️</button>
        </div>
      </div>
    </div>
  );
}

// ─── Página principal ─────────────────────────────────────────────────────────
export default function Inventory() {
  const [products, setProducts]   = useState<Product[]>([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving]       = useState(false);
  const [toggling, setToggling]   = useState<number | null>(null);
  const [search, setSearch]       = useState('');
  const [filter, setFilter]       = useState<'ALL' | 'available' | 'unavailable'>('ALL');
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [showCreate, setShowCreate]   = useState(false);

  const load = async () => {
    setLoading(true); setError(null);
    try { setProducts(await productsApi.getAll()); }
    catch { setError('Error al cargar el inventario'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleToggle = async (id: number, available: boolean) => {
    setToggling(id);
    try {
      const updated = await productsApi.toggleAvailable(id, available);
      setProducts((prev) => prev.map((p) => p.id === id ? { ...p, available: updated.available } : p));
    } catch { setError('Error al cambiar disponibilidad'); }
    finally { setToggling(null); }
  };

  const handleSave = async (payload: Omit<Product, 'id' | 'createdAt'>) => {
    setSaving(true); setFormError(null);
    try {
      if (editProduct) {
        await productsApi.update(editProduct.id, payload);
        setEditProduct(null);
      } else {
        await productsApi.create(payload);
        setShowCreate(false);
      }
      await load();
    } catch (e: any) {
      setFormError(e?.response?.data?.message ?? 'Error al guardar');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`¿Eliminar "${name}"?`)) return;
    try { await productsApi.remove(id); await load(); }
    catch { setError('Error al eliminar el producto'); }
  };

  const filtered = products.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'ALL' || (filter === 'available' ? p.available : !p.available);
    return matchSearch && matchFilter;
  });

  const availableCount   = products.filter((p) => p.available).length;
  const unavailableCount = products.filter((p) => !p.available).length;

  return (
    <div style={{ fontFamily: 'system-ui, -apple-system, sans-serif', background: '#f5f6fa', minHeight: '100vh', padding: '24px 20px' }}>
      <style>{`@keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}*{box-sizing:border-box}`}</style>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: '#1a1a1a' }}>📦 Inventario</h1>
            <p style={{ margin: '2px 0 0', fontSize: 13, color: '#888' }}>{products.length} producto{products.length !== 1 ? 's' : ''} · <span style={{ color: '#2d7a3a', fontWeight: 600 }}>✅ {availableCount} disponible{availableCount !== 1 ? 's' : ''}</span> · <span style={{ color: '#c0392b', fontWeight: 600 }}>🚫 {unavailableCount} agotado{unavailableCount !== 1 ? 's' : ''}</span></p>
          </div>
          <button onClick={() => { setFormError(null); setShowCreate(true); }}
            style={{ padding: '10px 22px', borderRadius: 10, border: 'none', background: '#01696f', color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer', boxShadow: '0 2px 8px rgba(1,105,111,0.3)' }}>
            + Nuevo producto
          </button>
        </div>

        {/* Filtros */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="🔍 Buscar producto..."
            style={{ flex: '1 1 200px', padding: '9px 14px', borderRadius: 9, border: '1px solid #ddd', fontSize: 13, background: '#fff' }} />
          <div style={{ display: 'flex', borderRadius: 9, overflow: 'hidden', border: '1px solid #ddd' }}>
            {(['ALL', 'available', 'unavailable'] as const).map((f) => (
              <button key={f} onClick={() => setFilter(f)}
                style={{ padding: '9px 16px', fontSize: 12, fontWeight: 600, border: 'none', cursor: 'pointer', whiteSpace: 'nowrap', background: filter === f ? '#01696f' : '#fff', color: filter === f ? '#fff' : '#555' }}>
                {f === 'ALL' ? 'Todos' : f === 'available' ? '✅ Disponibles' : '🚫 Agotados'}
              </button>
            ))}
          </div>
        </div>

        {error && <div style={{ background: '#fff0f0', border: '1px solid #ffd6d6', borderRadius: 10, padding: '10px 16px', marginBottom: 16, color: '#c0392b', fontSize: 13 }}>⚠️ {error}</div>}

        {/* Grid */}
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 20 }}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} style={{ borderRadius: 18, overflow: 'hidden', background: '#fff', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                <div style={{ aspectRatio: '4/3', background: 'linear-gradient(90deg,#f0f0f0 25%,#e0e0e0 50%,#f0f0f0 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s ease-in-out infinite' }} />
                <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div style={{ height: 16, background: '#f0f0f0', borderRadius: 6 }} />
                  <div style={{ height: 24, width: '60%', background: '#f0f0f0', borderRadius: 6 }} />
                  <div style={{ height: 44, background: '#f0f0f0', borderRadius: 10 }} />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ background: '#fff', borderRadius: 16, padding: 64, textAlign: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
            <span style={{ fontSize: 48 }}>📦</span>
            <p style={{ color: '#aaa', margin: '12px 0 0', fontSize: 15 }}>No se encontraron productos</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 20 }}>
            {filtered.map((p) => (
              <ProductCard key={p.id} product={p}
                onToggle={handleToggle}
                onEdit={(prod) => { setFormError(null); setEditProduct(prod); }}
                onDelete={handleDelete}
                toggling={toggling === p.id}
              />
            ))}
          </div>
        )}
      </div>

      {(editProduct || showCreate) && (
        <ProductModal
          product={editProduct ?? undefined}
          onSave={handleSave}
          onClose={() => { setEditProduct(null); setShowCreate(false); }}
          loading={saving}
          error={formError}
        />
      )}
    </div>
  );
}