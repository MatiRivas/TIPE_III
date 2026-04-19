import { useState, useEffect } from 'react';
import { useDiscounts } from '../hooks/useDiscounts';
import { useDiscountStore } from '../store/useDiscountStore';
import { productsApi } from '../api/products.api';

interface ProductOption {
  id: number;
  name: string;
  price: number;
  imageUrl?: string;
}

export default function AdminDiscounts() {
  const { discounts, createDiscount, toggleDiscount, deleteDiscount } = useDiscounts();
  const getDiscountedPrice = useDiscountStore((s) => s.getDiscountedPrice);

  const [products, setProducts] = useState<ProductOption[]>([]);
  const [form, setForm] = useState({
    name: '',
    percentage: '',
    applyToAll: true,
    productIds: [] as number[],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    productsApi.getAll().then((data: ProductOption[]) => setProducts(data)).catch(console.error);
  }, []);

  const handleProductToggle = (id: number) => {
    setForm((prev) => ({
      ...prev,
      productIds: prev.productIds.includes(id)
        ? prev.productIds.filter((p) => p !== id)
        : [...prev.productIds, id],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const pct = Number(form.percentage);
    if (isNaN(pct) || pct <= 0 || pct > 100) return setError('El porcentaje debe ser entre 1 y 100.');
    if (!form.applyToAll && form.productIds.length === 0) return setError('Selecciona al menos un producto.');
    setLoading(true);
    try {
      await createDiscount(form.name.trim(), pct, form.applyToAll, form.productIds);
      setForm({ name: '', percentage: '', applyToAll: true, productIds: [] });
      setShowForm(false);
    } catch {
      setError('Error al crear el descuento.');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (p: number) =>
    p.toLocaleString('es-CL', { style: 'currency', currency: 'CLP' });

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">🏷️ Gestión de Descuentos</h1>
          <p className="text-sm text-gray-500 mt-1">
            {discounts.length} descuento{discounts.length !== 1 ? 's' : ''} ·{' '}
            <span className="text-teal-600 font-medium">
              {discounts.filter(d => d.active).length} activo{discounts.filter(d => d.active).length !== 1 ? 's' : ''}
            </span>
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-xl px-4 py-2 text-sm transition shadow"
        >
          <span className="text-lg leading-none">{showForm ? '✕' : '+'}</span>
          {showForm ? 'Cancelar' : 'Nuevo descuento'}
        </button>
      </div>

      {/* Formulario */}
      {showForm && (
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 mb-8">
          <h2 className="text-lg font-semibold mb-4 text-gray-700">Nuevo descuento</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Nombre</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Ej: Promo verano"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Porcentaje (%)</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={form.percentage}
                  onChange={(e) => setForm({ ...form, percentage: e.target.value })}
                  placeholder="Ej: 15"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>

            {/* Aplicar a */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">Aplicar a</label>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setForm({ ...form, applyToAll: true, productIds: [] })}
                  className={`flex-1 py-2 rounded-xl text-sm font-medium border-2 transition ${
                    form.applyToAll
                      ? 'border-teal-500 bg-teal-50 text-teal-700'
                      : 'border-gray-200 text-gray-500 hover:border-gray-300'
                  }`}
                >
                  🍹 Todos los productos
                </button>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, applyToAll: false })}
                  className={`flex-1 py-2 rounded-xl text-sm font-medium border-2 transition ${
                    !form.applyToAll
                      ? 'border-teal-500 bg-teal-50 text-teal-700'
                      : 'border-gray-200 text-gray-500 hover:border-gray-300'
                  }`}
                >
                  🎯 Productos específicos
                </button>
              </div>
            </div>

            {/* Selector productos */}
            {!form.applyToAll && (
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">
                  Selecciona los productos
                </label>
                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto border border-gray-200 rounded-xl p-3 bg-gray-50">
                  {products.map((p) => (
                    <label
                      key={p.id}
                      className={`flex items-center gap-2 cursor-pointer text-sm px-3 py-2 rounded-lg transition ${
                        form.productIds.includes(p.id)
                          ? 'bg-teal-50 text-teal-700 font-medium'
                          : 'hover:bg-white'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={form.productIds.includes(p.id)}
                        onChange={() => handleProductToggle(p.id)}
                        className="accent-teal-600"
                      />
                      <span>{p.name}</span>
                      <span className="ml-auto text-gray-400 text-xs">{formatPrice(p.price)}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {error && (
              <div className="bg-red-50 text-red-600 text-sm px-4 py-2 rounded-xl border border-red-200">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-xl px-4 py-2.5 text-sm transition shadow disabled:opacity-50"
            >
              {loading ? 'Creando...' : '✓ Crear descuento'}
            </button>
          </form>
        </div>
      )}

      {/* Lista vacía */}
      {discounts.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">🏷️</p>
          <p className="font-medium text-gray-500">No hay descuentos creados aún.</p>
          <p className="text-sm mt-1">Crea uno con el botón de arriba.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {discounts.map((d) => {
            const affectedProducts = d.applyToAll
              ? products
              : products.filter((p) => d.productIds.includes(p.id));

            return (
              <div
                key={d.id}
                className={`bg-white rounded-2xl shadow-sm border-2 transition ${
                  d.active ? 'border-teal-400' : 'border-gray-100'
                }`}
              >
                <div className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-gray-800 text-base">{d.name}</h3>
                        <span className="bg-teal-100 text-teal-700 text-xs font-bold px-2 py-0.5 rounded-full">
                          -{d.percentage}%
                        </span>
                        {d.active ? (
                          <span className="bg-green-100 text-green-700 text-xs font-medium px-2 py-0.5 rounded-full">
                            ✓ Activo
                          </span>
                        ) : (
                          <span className="bg-gray-100 text-gray-400 text-xs font-medium px-2 py-0.5 rounded-full">
                            Inactivo
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-400 mt-0.5">
                        {d.applyToAll
                          ? '🍹 Aplica a todos los productos'
                          : `🎯 ${affectedProducts.length} producto${affectedProducts.length !== 1 ? 's' : ''} específico${affectedProducts.length !== 1 ? 's' : ''}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => toggleDiscount(d.id)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          d.active ? 'bg-teal-500' : 'bg-gray-300'
                        }`}
                        title={d.active ? 'Desactivar' : 'Activar'}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                            d.active ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                      <button
                        onClick={() => deleteDiscount(d.id)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg bg-red-50 hover:bg-red-100 text-red-400 hover:text-red-600 transition"
                        title="Eliminar"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Precios con descuento */}
                  {affectedProducts.length > 0 && (
                    <div className="mt-3 border-t border-gray-100 pt-3">
                      <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">
                        Precios con descuento aplicado
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {affectedProducts.map((p) => {
                          const finalPrice = Math.round(p.price * (1 - d.percentage / 100));
                          return (
                            <div
                              key={p.id}
                              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm border ${
                                d.active
                                  ? 'bg-teal-50 border-teal-200'
                                  : 'bg-gray-50 border-gray-200'
                              }`}
                            >
                              <span className="font-medium text-gray-700">{p.name}</span>
                              <span className="text-gray-400 line-through text-xs">
                                {formatPrice(p.price)}
                              </span>
                              <span className={`font-bold text-xs ${d.active ? 'text-teal-600' : 'text-gray-400'}`}>
                                {formatPrice(finalPrice)}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}