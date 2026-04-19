import { Router, Request, Response, NextFunction } from 'express';
import * as service from './orders.service';
import { authMiddleware } from '../../core/middlewares/auth.middleware';
import { roleMiddleware } from '../../core/middlewares/role.middleware';

const router = Router();
router.use(authMiddleware);

router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const rawUserId = (req as any).user?.id;
    const userId = Number(rawUserId);
    if (!Number.isFinite(userId)) {
      throw { status: 401, message: 'Usuario autenticado inválido' };
    }
    res.status(201).json(await service.placeOrder(userId, req.body));
  } catch (err) { next(err); }
});

router.get('/', roleMiddleware('ADMIN'), async (req: Request, res: Response, next: NextFunction) => {
  try { res.json(await service.listOrders()); } catch (err) { next(err); }
});

router.get('/by-date', roleMiddleware('ADMIN'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const date = req.query.date as string || new Date().toISOString().split('T')[0];
    res.json(await service.ordersByDate(date));
  } catch (err) { next(err); }
});

export default router;
