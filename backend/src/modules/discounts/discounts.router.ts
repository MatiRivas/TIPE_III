import { Router, Request, Response } from 'express';
import { discountsService } from './discounts.service';
import { authMiddleware } from '../../core/middlewares/auth.middleware';
import { roleMiddleware } from '../../core/middlewares/role.middleware';

const router = Router();

router.use(authMiddleware);

// Todos los autenticados pueden leer (el POS lo necesita)
router.get('/', async (_req: Request, res: Response) => {
  try {
    res.json(await discountsService.getAll());
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// Solo ADMIN puede crear/editar/activar/eliminar
router.use(roleMiddleware('ADMIN'));

router.post('/', async (req: Request, res: Response) => {
  try {
    res.status(201).json(await discountsService.create(req.body));
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
});

router.patch('/:id/toggle', async (req: Request, res: Response) => {
  try {
    res.json(await discountsService.toggle(Number(req.params.id)));
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
});

router.put('/:id', async (req: Request, res: Response) => {
  try {
    res.json(await discountsService.update(Number(req.params.id), req.body));
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
});

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    await discountsService.delete(Number(req.params.id));
    res.status(204).send();
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
});

export default router;