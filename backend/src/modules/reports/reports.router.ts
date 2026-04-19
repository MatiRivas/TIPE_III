import { Router, Request, Response, NextFunction } from 'express';
import { buildExcelBuffer, buildPdfBuffer, getSalesReport } from './reports.service';
import { authMiddleware } from '../../core/middlewares/auth.middleware';
import { roleMiddleware } from '../../core/middlewares/role.middleware';

const router = Router();
router.use(authMiddleware, roleMiddleware('ADMIN'));

function getFilters(req: Request) {
  return {
    startDate: req.query.startDate as string | undefined,
    endDate: req.query.endDate as string | undefined,
    date: (req.query.date as string) || undefined,
  };
}

router.get('/sales', async (req: Request, res: Response, next: NextFunction) => {
  try {
    res.json({ data: await getSalesReport(getFilters(req)) });
  } catch (err) { next(err); }
});

router.get('/daily', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const date = (req.query.date as string) || new Date().toISOString().split('T')[0];
    res.json({ data: await getSalesReport({ date }) });
  } catch (err) { next(err); }
});

router.get('/export/pdf', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const file = await buildPdfBuffer(getFilters(req));
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="reporte-ventas.pdf"');
    res.send(file);
  } catch (err) { next(err); }
});

router.get('/export/excel', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const file = await buildExcelBuffer(getFilters(req));
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="reporte-ventas.xlsx"');
    res.send(file);
  } catch (err) { next(err); }
});

export default router;
