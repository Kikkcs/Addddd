import { PrismaClient } from '@prisma/client';
import { QueueService } from './queue.service.js';

const prisma = new PrismaClient();
const queueService = QueueService.getInstance();

export class NotificationService {
    /**
     * Entry point for Webhooks to request a notification safely.
     * Webhook executes this, saves the record to DB, and instantly returns 200 OK.
     */
    public static async scheduleNotification(data: {
        orderId: string,
        channel: 'EMAIL' | 'WHATSAPP',
        recipient: string,
        type: string,
        payload: any
    }, delayMs = 0) {

        // 1. Create PENDING Log inside database
        const log = await prisma.notificationLog.create({
            data: {
                orderId: data.orderId,
                channel: data.channel,
                recipient: data.recipient,
                type: data.type,
                status: 'PENDING'
            }
        });

        // 2. Dispatch payload into Redis queue immediately
        await queueService.dispatchNotification({
            logId: log.id,
            channel: data.channel,
            recipient: data.recipient,
            type: data.type,
            payload: data.payload
        }, delayMs);

        return log;
    }
}
