import express from 'express';
import cors from 'cors';
import authRouter from './modules/auth/auth.router';
import usersRouter from './modules/users/users.router';
import productsRouter from './modules/products/products.router';
import ordersRouter from './modules/orders/orders.router';
import reportsRouter from './modules/reports/reports.router';
import { errorMiddleware } from './core/middlewares/error.middleware';
import dashboardRouter from './modules/dashboard/dashboard.router';
import discountsRouter from './modules/discounts/discounts.router';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/products', productsRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/reports', reportsRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/discounts', discountsRouter);

app.use(errorMiddleware);

export default app;
