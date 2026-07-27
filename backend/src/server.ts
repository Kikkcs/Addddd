import 'dotenv/config';
import Fastify from 'fastify';
import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import helmet from '@fastify/helmet';
import cors from '@fastify/cors';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { shopifyAuthRoutes } from './modules/auth/shopify.auth.js';
import { localAuthRoutes } from './modules/auth/local.auth.js';
import { ordersRoutes } from './modules/orders/orders.route.js';
import { reportsRoutes } from './modules/reports/reports.route.js';
import { aiRoutes } from './modules/ai/ai.route.js';
import { notificationsRoutes } from './modules/notifications/notifications.route.js';

// Boot Background Workers (Requires Local Redis)
import './modules/notifications/email.worker.js';

// Highly optimized Fastify server initialization
const server: FastifyInstance = Fastify({
  logger: {
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  },
  disableRequestLogging: true,
});

const prisma = new PrismaClient();

async function setupSecurity() {
  await server.register(helmet, { global: true });
  await server.register(cors, {
    origin: [process.env.FRONTEND_URL || 'http://localhost:3000', 'https://addddd-gray.vercel.app', 'https://addddd-cv76ycxep-kusha.vercel.app', 'https://addddd.vercel.app'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  });
}

async function setupRoutes() {
  // Health check
  server.get('/health', async (_req: FastifyRequest, reply: FastifyReply) => {
    return reply.status(200).send({
      status: 'ok',
      system: 'addd-dashboard-backend',
    });
  });

  // Shopify OAuth routes
  await server.register(shopifyAuthRoutes);

  // Local JWT Login routes
  await server.register(localAuthRoutes);

  // Dashboard data routes (Shopify integration)
  await server.register(ordersRoutes);

  // Reports export routes
  await server.register(reportsRoutes);

  // AI intelligence routes
  await server.register(aiRoutes);

  // Manual Notification Approval Queue endpoints
  await server.register(notificationsRoutes);
}

async function startServer() {
  try {
    await setupSecurity();
    await setupRoutes();

    // Try to connect to PostgreSQL — non-fatal for now (OAuth flow doesn't need DB)
    try {
      await prisma.$connect();
      server.log.info('PostgreSQL connected via Prisma.');
      // Auto seed default admin user if not existing
      const hashedPassword = await bcrypt.hash('password123', 10);
      await prisma.user.upsert({
        where: { email: 'admin@adeaur.com' },
        update: {},
        create: {
          email: 'admin@adeaur.com',
          name: 'Adeaur Admin',
          role: 'ADMIN',
          password: hashedPassword,
        },
      }).catch(err => server.log.warn('Admin auto-seed error: ' + err.message));
    } catch (dbErr) {
      server.log.warn('PostgreSQL not available — DB features disabled. OAuth flow will still work.');
    }

    const PORT = process.env.PORT ? parseInt(process.env.PORT) : 5000;
    await server.listen({ port: PORT, host: '0.0.0.0' });
    server.log.info(`Server running at http://localhost:${PORT}`);

    // Boot background sync
    setTimeout(async () => {
      try {
        const { SyncService } = await import('./modules/sync/sync.service.js');
        const syncer = SyncService.getInstance();
        // Run robust background sync exactly once every day (24 hours) as requested
        setInterval(() => syncer.runDailyGlobalSync(), 24 * 60 * 60 * 1000);
        // Fire initial sync immediately to compile the core snapshot lake
        syncer.runDailyGlobalSync();
      } catch (e) {
        console.error('Failed to init sync service:', e);
      }
    }, 2000);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
}

startServer();
