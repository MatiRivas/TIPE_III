import { Router, Request, Response, NextFunction } from 'express';
import { login } from './auth.service';

const router = Router();

router.post('/login', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await login(req.body);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

export default router;
