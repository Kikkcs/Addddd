import { Worker, Job } from 'bullmq';
import { defaultRedisConnection } from './queue.service.js';
import { PrismaClient } from '@prisma/client';
import 'dotenv/config';

const prisma = new PrismaClient();

/**
 * Independent Worker to process WhatsApp messages via Meta Cloud API
 */
export const whatsappWorker = new Worker('NotificationQueue', async (job: Job) => {
    const { logId, channel, recipient, type, payload } = job.data;

    if (channel !== 'WHATSAPP') return;

    try {
        const phoneId = process.env.WHATSAPP_PHONE_ID;
        const token = process.env.WHATSAPP_ACCESS_TOKEN;

        if (!phoneId || !token) {
            throw new Error('WhatsApp Credentials missing. Unable to send message.');
        }

        // Mock compile template
        const bodyContent = `Hello! This is a WhatsApp alert regarding your order. Event: ${type}.`;

        const response = await fetch(`https://graph.facebook.com/v19.0/${phoneId}/messages`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                messaging_product: "whatsapp",
                to: recipient,
                type: "text",
                text: { body: bodyContent }
            })
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(`WhatsApp API Error: ${result.error?.message || response.statusText}`);
        }

        // Mark as Sent
        try {
            await prisma.notificationLog.update({
                where: { id: logId },
                data: { status: 'SENT', sentAt: new Date() }
            });
        } catch (prismaErr) {
            console.warn('[Notification Worker] WhatsApp delivered natively, but PostgreSQL analytic tracking is currently offline.');
        }

    } catch (err: any) {
        // Update Log Failure safely
        try {
            await prisma.notificationLog.update({
                where: { id: logId },
                data: { status: 'FAILED', error: err.message }
            });
        } catch (e) { }

        throw err; // Trigger BullMQ retry logic
    }
}, { connection: defaultRedisConnection });
