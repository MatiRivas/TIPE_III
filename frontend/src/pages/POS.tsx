import { useEffect, useState } from 'react';
import type { Product } from '../types/product.types';
import { productsApi } from '../api/products.api';
import { createOrder } from '../api/orders.api';
import { useCartStore } from '../store/useCartStore';
import { useAuthStore } from '../store/useAuthStore';
import { useDiscountStore } from '../store/useDiscountStore';
import { useWebSocket } from '../hooks/useWebSocket';

export default function POS() {
  const [products, setProducts] = useState<Product[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'CARD'>('CASH');
  const [showCheckoutSummary, setShowCheckoutSummary] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { items, addItem, removeItem, clearCart } = useCartStore();
  const { logout, user } = useAuthStore();
  const getDiscountedPrice = useDiscountStore((s) => s.getDiscountedPrice);
  
  useWebSocket((updatedProducts) => setProducts(updatedProducts));
  useEffect(() => {
    productsApi.getAll().then(setProducts);
  }, []);

  // Total calculado con descuentos aplicados
  const totalWithDiscount = items.reduce((sum, i) => {
    const { finalPrice } = getDiscountedPrice(i.id, i.price);
    return sum + finalPrice * i.quantity;
  }, 0);

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  const confirmCheckout = async () => {
    if (items.length === 0 || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await createOrder({
        paymentMethod,
        items: items.map((i) => ({ productId: i.id, quantity: i.quantity })),
      });
      clearCart();
      setShowCheckoutSummary(false);
      setSuccessMessage('Venta realizada con éxito');
      productsApi.getAll().then(setProducts);
    } catch (err: any) {
      setSuccessMessage('');
      alert(err.response?.data?.message || 'Error al procesar la venta');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCheckout = async () => {
    if (items.length === 0) return alert('El carrito está vacío');
    setSuccessMessage('');
    setShowCheckoutSummary(true);
  };

  const formatPrice = (p: number) => `$${p.toLocaleString('es-CL')}`;

  return (
    <div className="flex h-screen">
      {/* ── Productos ── */}
      <div className="flex-1 p-4 overflow-y-auto bg-gray-100">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-xl font-bold">Mojito Bar - POS</h1>
            <p className="text-xs text-gray-500">Sesion: {user?.name ?? 'Vendedor'} ({user?.role ?? 'VENDEDOR'})</p>
          </div>
          <button onClick={logout} className="text-sm text-red-500">Cerrar sesión</button>
        </div>
        {successMessage && (
          <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
            {successMessage}
          </div>
        )}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {products.map((p) => {
            const { finalPrice, discountPercentage, discountName } = getDiscountedPrice(p.id, p.price);
            const hasDiscount = discountPercentage > 0;

            return (
              <div
                key={p.id}
                onClick={() => p.available && addItem(p)}
                className={`bg-white p-4 rounded-xl shadow cursor-pointer hover:shadow-md transition relative ${
                  !p.available ? 'opacity-40 cursor-not-allowed' : ''
                }`}
              >
                {/* Badge descuento */}
                {hasDiscount && (
                  <span className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                    -{discountPercentage}%
                  </span>
                )}

                {p.imageUrl && (
                  <img
                    src={p.imageUrl}
                    alt={p.name}
                    className="w-full h-32 object-cover rounded mb-2"
                    loading="lazy"
                  />
                )}
                <p className="font-semibold">{p.name}</p>

                {/* Precio */}
                {hasDiscount ? (
                  <div>
                    <p className="text-gray-400 line-through text-xs">{formatPrice(p.price)}</p>
                    <p className="text-teal-600 font-bold">{formatPrice(finalPrice)}</p>
                    <p className="text-xs text-teal-500 mt-0.5">🏷️ {discountName}</p>
                  </div>
                ) : (
                  <p className="text-green-600 font-semibold">{formatPrice(p.price)}</p>
                )}

                <p className={`text-sm mt-1 font-medium ${p.available ? 'text-green-500' : 'text-red-400'}`}>
                  {p.available ? '✅ Disponible' : '🚫 No disponible'}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Carrito ── */}
      <div className="w-80 bg-white p-4 flex flex-col shadow-lg">
        <h2 className="text-lg font-bold mb-4">Carrito</h2>
        <div className="flex-1 overflow-y-auto">
          {items.length === 0 && <p className="text-gray-400 text-sm">Sin productos</p>}
          {items.map((item) => {
            const { finalPrice, discountPercentage } = getDiscountedPrice(item.id, item.price);
            const hasDiscount = discountPercentage > 0;

            return (
              <div key={item.id} className="flex justify-between items-center mb-3">
                <div>
                  <p className="text-sm font-medium">{item.name}</p>
                  <div className="flex items-center gap-1">
                    {hasDiscount && (
                      <span className="text-xs text-gray-400 line-through">
                        {formatPrice(item.price)}
                      </span>
                    )}
                    <span className={`text-xs ${hasDiscount ? 'text-teal-600 font-semibold' : 'text-gray-500'}`}>
                      {formatPrice(hasDiscount ? finalPrice : item.price)} x {item.quantity}
                    </span>
                  </div>
                </div>
                <button onClick={() => removeItem(item.id)} className="text-red-500 text-xs">✕</button>
              </div>
            );
          })}
        </div>

        <div className="border-t pt-4 mt-4">
          {/* Mostrar subtotal original si hay descuento */}
          {totalWithDiscount !== subtotal && (
            <p className="text-sm text-gray-400 line-through mb-0.5">
              Subtotal: {formatPrice(subtotal)}
            </p>
          )}
          <p className="text-sm text-gray-500 mb-0.5">
            Subtotal: {formatPrice(subtotal)}
          </p>
          <p className="font-bold text-lg mb-2 text-teal-700">
            Total: {formatPrice(totalWithDiscount)}
          </p>

          <select
            className="w-full border p-2 rounded mb-3"
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value as 'CASH' | 'CARD')}
          >
            <option value="CASH">Efectivo</option>
            <option value="CARD">Tarjeta</option>
          </select>
          <button
            onClick={handleCheckout}
            className="w-full bg-green-600 text-white p-2 rounded hover:bg-green-700"
          >
            Confirmar venta
          </button>
          <button onClick={clearCart} className="w-full mt-2 text-sm text-red-500">
            Limpiar carrito
          </button>
        </div>
      </div>

      {showCheckoutSummary && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Confirmar pedido</h3>
                <p className="text-sm text-gray-500">Revisa el resumen antes de finalizar la venta.</p>
              </div>
              <button
                onClick={() => setShowCheckoutSummary(false)}
                className="rounded-full px-3 py-1 text-sm font-semibold text-gray-500 hover:bg-gray-100"
                disabled={isSubmitting}
              >
                ✕
              </button>
            </div>

            <div className="max-h-72 overflow-y-auto rounded-xl bg-gray-50 p-4">
              <div className="space-y-3">
                {items.map((item) => {
                  const { finalPrice, discountPercentage } = getDiscountedPrice(item.id, item.price);
                  const lineTotal = finalPrice * item.quantity;

                  return (
                    <div key={item.id} className="flex items-center justify-between gap-4 border-b border-gray-200 pb-2 last:border-0 last:pb-0">
                      <div>
                        <p className="font-medium text-gray-900">{item.name}</p>
                        <p className="text-xs text-gray-500">
                          {formatPrice(finalPrice)} x {item.quantity}
                          {discountPercentage > 0 ? ` · -${discountPercentage}%` : ''}
                        </p>
                      </div>
                      <p className="text-sm font-semibold text-gray-800">{formatPrice(lineTotal)}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-4 space-y-2 border-t pt-4 text-sm">
              <div className="flex items-center justify-between text-gray-600">
                <span>Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex items-center justify-between text-lg font-bold text-teal-700">
                <span>Total</span>
                <span>{formatPrice(totalWithDiscount)}</span>
              </div>
              <div className="flex items-center justify-between text-gray-600">
                <span>Forma de pago</span>
                <span>{paymentMethod === 'CASH' ? 'Efectivo' : 'Tarjeta'}</span>
              </div>
            </div>

            <div className="mt-5 flex gap-3">
              <button
                onClick={() => setShowCheckoutSummary(false)}
                className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                disabled={isSubmitting}
              >
                Volver
              </button>
              <button
                onClick={confirmCheckout}
                className="flex-1 rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-70"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Procesando...' : 'Confirmar pedido'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}