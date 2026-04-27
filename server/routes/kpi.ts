import type { FastifyInstance } from 'fastify';
import * as queries from '../db/queries.js';

export async function kpiRoutes(fastify: FastifyInstance): Promise<void> {
  fastify.get('/api/kpi', async (_req, reply) => {
    const data = await queries.getKPI();
    return reply.send(data);
  });

  fastify.get<{ Querystring: { days?: string } }>(
    '/api/deadlines',
    async (req, reply) => {
      const days = parseInt(req.query.days ?? '30', 10);
      const data = await queries.getDeadlines(isNaN(days) ? 30 : days);
      return reply.send(data);
    },
  );

  fastify.get('/api/alerts', async (_req, reply) => {
    const data = await queries.getAlerts();
    return reply.send(data);
  });
}
