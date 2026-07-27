import { Worker, Job } from 'bullmq';
import { defaultRedisConnection } from './queue.service.js';
import { PrismaClient } from '@prisma/client';
import nodemailer from 'nodemailer';
import 'dotenv/config';

const prisma = new PrismaClient();

// SMTP Relay Configuration
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false, // TLS
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    }
});

/**
 * Independent Worker to process emails
 */
export const emailWorker = new Worker('NotificationQueue', async (job: Job) => {
    const { logId, channel, recipient, type, payload } = job.data;

    // Safety check: process EMAIL channels
    if (channel !== 'EMAIL') return;

    try {
        // Here you would normally fetch the 'NotificationTemplate' by type and inject payload variables.
        // For standard implementation, we compile it directly:
        const mailOptions = {
            from: process.env.EMAIL_FROM || '"Adeaur" <updates@adeaur.com>',
            to: recipient,
            subject: `Adeaur Notification: ${type}`,
            text: `Hello, this is an automated notification regarding your Adeaur order. Details: ${JSON.stringify(payload)}`,
        };

        // Fire Email
        await transporter.sendMail(mailOptions);

        // Mark as Sent physically if Prisma is active
        try {
            await prisma.notificationLog.update({
                where: { id: logId },
                data: { status: 'SENT', sentAt: new Date() }
            });
        } catch (prismaErr) {
            console.warn('[Notification Worker] Email successfully delivered, but PostgreSQL analytics log tracking is currently offline.');
        }

    } catch (err: any) {
        // Update Log Failure safely if Postgres is offline
        try {
            await prisma.notificationLog.update({
                where: { id: logId },
                data: { status: 'FAILED', error: err.message }
            });
        } catch (e) { }

        throw err; // Trigger BullMQ retry logic
    }
}, { connection: defaultRedisConnection });
