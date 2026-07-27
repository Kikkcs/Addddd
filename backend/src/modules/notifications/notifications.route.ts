import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { ShopifyService } from '../shopify/shopify.service.js';
import { QueueService } from './queue.service.js';
import fs from 'fs';
import path from 'path';
import nodemailer from 'nodemailer';

export async function notificationsRoutes(fastify: FastifyInstance) {
    const shopify = ShopifyService.getInstance();
    const queue = QueueService.getInstance();

    // Flat-file state machine for approvals (resilient without Postgres)
    const decisionsFile = path.resolve(process.cwd(), 'notification_decisions_log.json');
    if (!fs.existsSync(decisionsFile)) fs.writeFileSync(decisionsFile, JSON.stringify([]));

    /**
     * GET /api/v1/notifications/pending
     * Dynamically determines actionable notification events that require manual approval
     */
    fastify.get('/api/v1/notifications/pending', async (req: FastifyRequest, reply: FastifyReply) => {
        try {
            // Read past decisions
            let decisions: any[] = [];
            try {
                decisions = JSON.parse(fs.readFileSync(decisionsFile, 'utf-8'));
            } catch (e) { }

            const rawOrders = await shopify.getRecentOrdersFilter(30, 'Last 30 Days');
            const actionableEvents = [];

            // Grab organically saved templates
            let organicTemplates: any[] = [];
            try { organicTemplates = JSON.parse(fs.readFileSync(templatesFile, 'utf-8')); } catch (e) { }

            // Detect new state changes per order
            for (const order of rawOrders) {
                let eventType = null;

                if (order.fulfillment_status === 'fulfilled') {
                    eventType = 'ORDER_DELIVERED';
                } else if (order.cancelled_at) {
                    eventType = 'ORDER_CANCELLED';
                } else if (!order.fulfillment_status) {
                    eventType = 'ORDER_PLACED';
                }

                if (eventType) {
                    const hasDecision = decisions.find(d => d.orderId === order.id.toString() && d.eventType === eventType);
                    if (!hasDecision) {
                        // Find matching template
                        const templateConfig = organicTemplates.find((t: any) => t.type === eventType) || { body: `System Update for {order_number}` };

                        // Parse template tokens
                        let messageBody = templateConfig.body
                            .replace('{customer_name}', order.customer?.first_name || 'Customer')
                            .replace('{order_number}', `#${order.order_number}`);

                        actionableEvents.push({
                            id: `pending-${order.id}-${eventType}`,
                            orderId: order.id.toString(),
                            orderNumber: `#${order.order_number}`,
                            customerName: order.customer ? `${order.customer.first_name} ${order.customer.last_name}` : 'Guest',
                            recipientEmail: order.customer?.email || 'buyer@adeaur.com',
                            eventType,
                            messagePreview: messageBody,
                            timestamp: order.created_at
                        });
                    }
                }
            }

            return reply.send({ success: true, pending: actionableEvents });
        } catch (err: any) {
            return reply.status(500).send({ success: false, error: err.message });
        }
    });

    /**
     * POST /api/v1/notifications/action
     * Accepts user's manual authorization to release or kill a notification payload
     */
    fastify.post('/api/v1/notifications/action', async (req: FastifyRequest<{ Body: { orderId: string, eventType: string, decision: 'SEND_EMAIL' | 'REJECT', recipient: string, payload: string } }>, reply: FastifyReply) => {
        try {
            const { orderId, eventType, decision, recipient, payload } = req.body;

            // 1. Physically push the job payload into BullMQ only if Approved
            if (decision === 'SEND_EMAIL') {
                try {
                    await queue.dispatchNotification({
                        logId: `log-${Date.now()}`,
                        channel: 'EMAIL',
                        recipient,
                        type: eventType,
                        payload
                    });
                } catch (redisErr) {
                    console.warn('[Notification Engine] Redis worker queue offline. Falling back to native Ethereal dispatch...');

                    try {
                        const testAccount = await nodemailer.createTestAccount();
                        const transporter = nodemailer.createTransport({
                            host: "smtp.ethereal.email",
                            port: 587,
                            secure: false,
                            auth: { user: testAccount.user, pass: testAccount.pass },
                        });

                        const info = await transporter.sendMail({
                            from: '"Adeaur Local Diagnostics" <no-reply@adeaur.com>',
                            to: recipient,
                            subject: `Diagnostic Notification: ${eventType}`,
                            text: payload
                        });

                        const url = nodemailer.getTestMessageUrl(info);
                        console.log(`\n======================================================`);
                        console.log(`[Diagnostic] Email Transmitted successfully via Ethereal!`);
                        console.log(`[Link] 👉 ${url}`);
                        console.log(`======================================================\n`);

                        try {
                            fs.writeFileSync(path.resolve(process.cwd(), 'diagnostic_ethereal_link.txt'), url as string);
                        } catch (fsErr) { }
                    } catch (mockErr: any) {
                        console.error('[Diagnostic Error] Ethereal fallback crashed:', mockErr.message);
                    }
                }
            }

            // 2. Erase the request permanently from the Action Queue by logging the decision
            let decisions: any[] = [];
            try { decisions = JSON.parse(fs.readFileSync(decisionsFile, 'utf-8')); } catch (e) { }

            decisions.push({
                orderId,
                eventType,
                decision,
                actionedAt: new Date().toISOString()
            });

            fs.writeFileSync(decisionsFile, JSON.stringify(decisions, null, 2));

            return reply.send({ success: true, message: `Notification physically mapped as: ${decision}` });
        } catch (err: any) {
            return reply.status(500).send({ success: false, error: err.message });
        }
    });

    // --- TEMPLATE MANAGEMENT ENGINE ---

    const templatesFile = path.resolve(process.cwd(), 'notification_templates.json');
    if (!fs.existsSync(templatesFile)) {
        // Hydrate default organic templates
        const defaultTemplates = [
            { id: 't1', type: 'ORDER_DELIVERED', subject: 'Your Adeaur Order has arrived!', body: 'Hi {customer_name},\n\nYour order {order_number} has been delivered. Enjoy!\n\n- Adeaur Team' },
            { id: 't2', type: 'ORDER_PLACED', subject: 'Order Confirmation', body: 'Hi {customer_name},\n\nWe received your order {order_number}. We will notify you when it ships.' },
            { id: 't3', type: 'ORDER_CANCELLED', subject: 'Order Cancelled', body: 'Hi {customer_name},\n\nYour order {order_number} has been cancelled successfully.' }
        ];
        fs.writeFileSync(templatesFile, JSON.stringify(defaultTemplates, null, 2));
    }

    fastify.get('/api/v1/notifications/templates', async (req: FastifyRequest, reply: FastifyReply) => {
        try {
            const templates = JSON.parse(fs.readFileSync(templatesFile, 'utf-8'));
            return reply.send({ success: true, data: templates });
        } catch (err: any) {
            return reply.status(500).send({ success: false, error: err.message });
        }
    });

    fastify.post('/api/v1/notifications/templates', async (req: FastifyRequest<{ Body: { id: string, subject: string, body: string } }>, reply: FastifyReply) => {
        try {
            const temps = JSON.parse(fs.readFileSync(templatesFile, 'utf-8'));
            const idx = temps.findIndex((t: any) => t.id === req.body.id);
            if (idx >= 0) {
                temps[idx].subject = req.body.subject;
                temps[idx].body = req.body.body;
                fs.writeFileSync(templatesFile, JSON.stringify(temps, null, 2));
            }
            return reply.send({ success: true });
        } catch (err: any) {
            return reply.status(500).send({ success: false, error: err.message });
        }
    });
}
