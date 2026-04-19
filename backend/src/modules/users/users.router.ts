import { Router, Request, Response, NextFunction } from 'express';
import { registerUser, listUsers, removeUser } from './users.service';
import { authMiddleware } from '../../core/middlewares/auth.middleware';
import { roleMiddleware } from '../../core/middlewares/role.middleware';

const router = Router();

router.use(authMiddleware);

router.get('/', roleMiddleware('ADMIN'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    res.json(await listUsers());
  } catch (err) { next(err); }
});

router.post('/', roleMiddleware('ADMIN'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    res.status(201).json(await registerUser(req.body));
  } catch (err) { next(err); }
});

router.delete('/:id', roleMiddleware('ADMIN'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    await removeUser(Number(req.params.id));
    res.json({ message: 'Usuario eliminado' });
  } catch (err) { next(err); }
});

export default router;
