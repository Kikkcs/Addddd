import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { ShopifyService } from '../shopify/shopify.service.js';

export async function reportsRoutes(fastify: FastifyInstance) {
    const shopify = ShopifyService.getInstance();

    /**
     * GET /api/v1/reports/export?format=csv|json&range=...
     * Generates a real downloadable report from live Shopify data
     */
    fastify.get('/api/v1/reports/export', async (req: FastifyRequest<{ Querystring: { format?: string; range?: string; type?: string } }>, reply: FastifyReply) => {
        try {
            const format = req.query.format || 'csv';
            const rangeStr = req.query.range || 'Last 30 Days';
            const reportType = req.query.type || 'Financial';

            const orders = await shopify.getRecentOrdersFilter(50000, rangeStr);
            const metrics = await shopify.getStoreMetrics(rangeStr);

            if (format === 'csv') {
                // Build CSV
                const headers = ['Order Number', 'Customer', 'Email', 'Date', 'Amount (INR)', 'Payment Status', 'Fulfillment Status', 'City', 'State'];
                const rows = orders.map((o: any) => [
                    `#${o.order_number}`,
                    o.customer ? `${o.customer.first_name} ${o.customer.last_name}` : 'Guest',
                    o.customer?.email || '',
                    new Date(o.created_at).toLocaleDateString('en-IN'),
                    parseFloat(o.total_price).toFixed(2),
                    o.financial_status || 'paid',
                    o.fulfillment_status || 'unfulfilled',
                    o.shipping_address?.city || '',
                    o.shipping_address?.province || ''
                ].join(','));

                const csvContent = [headers.join(','), ...rows].join('\n');

                // Summary rows
                const summaryBlock = [
                    '',
                    '--- SUMMARY ---',
                    `Total Revenue,₹${metrics.totalRevenue.toFixed(2)}`,
                    `Total Orders,${metrics.totalOrders}`,
                    `Average Order Value,₹${metrics.averageOrderValue.toFixed(2)}`,
                    `Active (Unfulfilled),${metrics.activeOrders}`,
                    `Report Generated,${new Date().toLocaleString('en-IN')}`,
                    `Date Range,${rangeStr}`,
                    `Report Type,${reportType}`
                ].join('\n');

                reply.header('Content-Type', 'text/csv; charset=utf-8');
                reply.header('Content-Disposition', `attachment; filename="Adeaur_${reportType}_Report_${Date.now()}.csv"`);

                // Prepend UTF-8 BOM (\uFEFF) to guarantee Excel parses the Rupee hardware symbol correctly
                return reply.send('\uFEFF' + csvContent + '\n' + summaryBlock);
            }

            // JSON format
            return reply.status(200).send({
                success: true,
                report: {
                    type: reportType,
                    dateRange: rangeStr,
                    generatedAt: new Date().toISOString(),
                    summary: metrics,
                    ordersCount: orders.length,
                    orders: orders.map((o: any) => ({
                        orderNumber: `#${o.order_number}`,
                        customer: o.customer ? `${o.customer.first_name} ${o.customer.last_name}` : 'Guest',
                        amount: parseFloat(o.total_price),
                        status: o.fulfillment_status || 'unfulfilled',
                        date: o.created_at
                    }))
                }
            });
        } catch (err: any) {
            fastify.log.error(`[Reports Error] ${err.message}`);
            return reply.status(500).send({ success: false, error: 'Failed to generate report' });
        }
    });
}
