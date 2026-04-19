import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useDiscountStore } from '../store/useDiscountStore';
import { discountsApi } from '../api/discounts.api';
import { productsApi } from '../api/products.api';

const SOCKET_URL =
  import.meta.env.VITE_API_URL?.replace(/\/api\/?$/, '') ||
  import.meta.env.VITE_WS_URL ||
  'http://localhost:3000';

const socket = io(SOCKET_URL, { autoConnect: false });

export const useWebSocket = (
  onProductsUpdated?: (products: any[]) => void,
  onDashboardUpdated?: () => void
) => {
  const setDiscounts = useDiscountStore((s) => s.setDiscounts);
  const onProductsUpdatedRef = useRef(onProductsUpdated);
  const onDashboardUpdatedRef = useRef(onDashboardUpdated);

  useEffect(() => {
    onProductsUpdatedRef.current = onProductsUpdated;
    onDashboardUpdatedRef.current = onDashboardUpdated;
  }, [onProductsUpdated, onDashboardUpdated]);

  useEffect(() => {
    socket.connect();

    const handleDiscountsUpdated = async () => {
      const discounts = await discountsApi.getAll();
      setDiscounts(discounts);
    };

    const handleProductsUpdated = async () => {
      const callback = onProductsUpdatedRef.current;
      if (callback) {
        const products = await productsApi.getAll();
        callback(products);
      }
    };

    const handleDashboardUpdated = () => {
      onDashboardUpdatedRef.current?.();
    };

    // Cuando admin activa/desactiva un descuento
    socket.on('discounts:updated', handleDiscountsUpdated);

    // Cuando admin modifica productos
    socket.on('products:updated', handleProductsUpdated);
    socket.on('dashboard:updated', handleDashboardUpdated);

    return () => {
      socket.off('discounts:updated', handleDiscountsUpdated);
      socket.off('products:updated', handleProductsUpdated);
      socket.off('dashboard:updated', handleDashboardUpdated);
      socket.disconnect();
    };
  }, [setDiscounts]);
};