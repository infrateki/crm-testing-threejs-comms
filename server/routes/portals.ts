import type { FastifyInstance } from 'fastify';
import * as queries from '../db/queries.js';

export async function portalsRoutes(fastify: FastifyInstance): Promise<void> {
  fastify.get('/api/portals', async (_req, reply) => {
    const data = await queries.getPortals();
    return reply.send(data);
  });
}
