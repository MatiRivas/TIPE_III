import { Router, Request, Response, NextFunction } from 'express';
import * as service from './products.service';
import { authMiddleware } from '../../core/middlewares/auth.middleware';
import { roleMiddleware } from '../../core/middlewares/role.middleware';
import { listProducts, getProduct, addProduct, editProduct, removeProduct } from './products.service';

const router = Router();
router.use(authMiddleware);

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try { res.json(await listProducts()); }
  catch (err) { next(err); }
});

router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try { res.json(await getProduct(Number(req.params.id))); }
  catch (err) { next(err); }
});

// Solo ADMIN puede crear, editar, eliminar
router.post('/', authMiddleware, roleMiddleware('ADMIN'), async (req: Request, res: Response, next: NextFunction) => {
  try { res.status(201).json(await addProduct(req.body)); }
  catch (err) { next(err); }
});

router.put('/:id', roleMiddleware('ADMIN'), async (req: Request, res: Response, next: NextFunction) => {
  try { res.json(await editProduct(Number(req.params.id), req.body)); }
  catch (err) { next(err); }
});

router.delete('/:id', authMiddleware, roleMiddleware('ADMIN'), async (req: Request, res: Response, next: NextFunction) => {
  try { res.json(await removeProduct(Number(req.params.id))); }
  catch (err) { next(err); }
});

export default router;
