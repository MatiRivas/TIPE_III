import { Router, Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { DashboardRepository } from './dashboard.repository';
import { DashboardService } from './dashboard.service';
import { authMiddleware } from '../../core/middlewares/auth.middleware';
import { roleMiddleware } from '../../core/middlewares/role.middleware';
import { DashboardFilters } from './dashboard.types';

const prisma = new PrismaClient();
const repo = new DashboardRepository(prisma);
const service = new DashboardService(repo);

const router = Router();

// ─── Middlewares globales del módulo ────────────────────────────────────────
// Todos los endpoints requieren JWT válido y rol ADMIN
router.use(authMiddleware);
router.use(roleMiddleware('ADMIN'));

// ─── Helper para extraer filtros del query string ────────────────────────────
function parseFilters(req: Request): DashboardFilters {
  return {
    date: req.query.date as string | undefined,
    startDate: req.query.startDate as string | undefined,
    endDate: req.query.endDate as string | undefined,
  };
}

// ─── Rutas ────────────────────────────────────────────────────────────────────

/**
 * GET /api/dashboard
 * Retorna el resumen completo del dashboard (todos los KPIs en una sola llamada).
 * Query params: date | startDate + endDate
 */
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await service.getDashboardSummary(parseFilters(req));
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/dashboard/sales
 * KPIs de ventas: ingresos totales, número de órdenes, ticket promedio, items vendidos.
 */
router.get('/sales', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await service.getSalesSummary(parseFilters(req));
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/dashboard/top-products?limit=5
 * Productos más vendidos del período ordenados por cantidad.
 * Query param extra: limit (número entero, default 5)
 */
router.get('/top-products', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const limit = Math.min(parseInt(req.query.limit as string) || 5, 20);
    const data = await service.getTopProducts(parseFilters(req), limit);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/dashboard/inventory-alerts
 * Productos cuyo stock actual es <= minStock.
 * No acepta filtros de fecha (es estado actual del inventario).
 */
router.get('/inventory-alerts', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await service.getInventoryAlerts();
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/dashboard/order-stats
 * Estadísticas de órdenes: total, completadas, pendientes, canceladas.
 */
router.get('/order-stats', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await service.getOrderStats(parseFilters(req));
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/dashboard/payment-breakdown
 * Desglose de ventas por método de pago (CASH / CARD).
 */
router.get('/payment-breakdown', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await service.getPaymentBreakdown(parseFilters(req));
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/dashboard/recent-transactions?limit=10
 * Últimas N transacciones completadas con detalle del vendedor.
 * Query param extra: limit (número entero, default 10, máx 50)
 */
router.get('/recent-transactions', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const limit = Math.min(parseInt(req.query.limit as string) || 10, 50);
    const data = await service.getRecentTransactions(parseFilters(req), limit);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
});

export default router;