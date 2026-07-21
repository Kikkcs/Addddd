import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { MetaAdsService } from './meta.service.js';

export const metaRoutes: FastifyPluginAsync = async (server: FastifyInstance) => {
    const metaAdsService = MetaAdsService.getInstance();

    server.get('/api/meta/insights', async (request, reply) => {
        try {
            const insights = await metaAdsService.getCampaignInsights();
            return reply.send({ success: true, count: insights.length, data: insights });
        } catch (error) {
            server.log.error(error as Error, 'Meta API Error');
            return reply.status(500).send({ success: false, message: 'Failed to fetch Meta insights.' });
        }
    });
};
