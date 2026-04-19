export interface ReportFilters {
	startDate?: string;
	endDate?: string;
	date?: string;
}

export interface ReportProductLine {
	name: string;
	quantity: number;
	price: number;
	subtotal: number;
}

export interface ReportOrderItem {
	orderId: number;
	createdAt: string;
	total: number;
	paymentMethod: 'CASH' | 'CARD';
	itemCount: number;
	sellerName: string;
	products: ReportProductLine[];
}

export interface SalesReportSummary {
	totalRevenue: number;
	totalOrders: number;
	totalItems: number;
	averageTicket: number;
	byCash: number;
	byCard: number;
	topProduct: string;
	orders: ReportOrderItem[];
}

export interface SalesReportRow {
	orderId: number;
	createdAt: Date;
	total: number;
	paymentMethod: string;
	status: string;
	user: { name: string } | null;
	items: Array<{
		quantity: number;
		price: number;
		product: { name: string };
	}>;
}
