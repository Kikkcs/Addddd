import { Queue } from 'bullmq';
import { Redis } from 'ioredis';
import 'dotenv/config';

// Robust caching & broker configuration
export const defaultRedisConnection = new Redis(process.env.REDIS_URL || 'redis://127.0.0.1:6379', {
    maxRetriesPerRequest: null,
    retryStrategy(times) {
        // Prevent infinite crashing logs when Redis is physically offline on Windows
        return null;
    }
});

// Suppress unhandled Redis error events to keep Fastify alive
defaultRedisConnection.on('error', () => {
    // Silently continue organically
});

export class QueueService {
    private static instance: QueueService;
    public notificationQueue: Queue;

    private constructor() {
        // Initialize BullMQ Queue
        this.notificationQueue = new Queue('NotificationQueue', {
            connection: defaultRedisConnection,
            defaultJobOptions: {
                attempts: 3, // Enable exponential backoff retries
                backoff: {
                    type: 'exponential',
                    delay: 1000,
                },
                removeOnComplete: true, // Keep list clean
                removeOnFail: false,    // Retain failures for Dashboard visibility
            },
        });
    }

    public static getInstance(): QueueService {
        if (!QueueService.instance) {
            QueueService.instance = new QueueService();
        }
        return QueueService.instance;
    }

    /**
     * Dispatch an event decoupled from the main thread
     */
    public async dispatchNotification(jobData: any, delay: number = 0) {
        return await this.notificationQueue.add('send-notification', jobData, {
            delay, // Useful for Review Requests configured after X hours
        });
    }
}
