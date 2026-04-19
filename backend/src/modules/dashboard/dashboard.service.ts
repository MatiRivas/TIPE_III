import { DashboardRepository } from './dashboard.repository';
import { DashboardSummary, DashboardFilters } from './dashboard.types';
import { getIO } from '../../core/socket';

export class DashboardService {
  constructor(private readonly repo: DashboardRepository) {}

  async getDashboardSummary(filters: DashboardFilters = {}): Promise<DashboardSummary> {
    const [
      salesSummary,
      topProducts,
      inventoryAlerts,
      orderStats,
      paymentBreakdown,
      recentTransactions,
    ] = await Promise.all([
      this.repo.getSalesSummary(filters),
      this.repo.getTopProducts(filters, 5),
      this.repo.getInventoryAlerts(),
      this.repo.getOrderStats(filters),
      this.repo.getPaymentBreakdown(filters),
      this.repo.getRecentTransactions(filters, 10),
    ]);

    return {
      salesSummary,
      topProducts,
      inventoryAlerts,
      orderStats,
      paymentBreakdown,
      recentTransactions,
    };
  }

  async getSalesSummary(filters: DashboardFilters = {}) {
    getIO().emit('salesSummary:updated'); 
    return this.repo.getSalesSummary(filters);
  }

  async getTopProducts(filters: DashboardFilters = {}, limit = 5) {
    getIO().emit('topProducts:updated');
    return this.repo.getTopProducts(filters, limit);
  }

  async getInventoryAlerts() {
    getIO().emit('inventoryAlerts:updated');
    return this.repo.getInventoryAlerts();
  }

  async getOrderStats(filters: DashboardFilters = {}) {
    getIO().emit('orderStats:updated');
    return this.repo.getOrderStats(filters);
  }

  async getPaymentBreakdown(filters: DashboardFilters = {}) {
    getIO().emit('paymentBreakdown:updated');
    return this.repo.getPaymentBreakdown(filters);
  }

  async getRecentTransactions(filters: DashboardFilters = {}, limit = 10) {
    getIO().emit('recentTransactions:updated');
    return this.repo.getRecentTransactions(filters, limit);
  }
}