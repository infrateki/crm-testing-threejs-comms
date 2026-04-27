import type { FastifyInstance } from 'fastify';
import * as queries from '../db/queries.js';

interface OpportunityQuerystring {
  status?: string;
  tier?: string;
  owner?: string;
  portal?: string;
  search?: string;
  page?: string;
  limit?: string;
}

interface OpportunityParams {
  id: string;
}

interface PhotoParams {
  id: string;
  photo_id: string;
}

export async function opportunitiesRoutes(fastify: FastifyInstance): Promise<void> {
  fastify.get<{ Querystring: OpportunityQuerystring }>(
    '/api/opportunities',
    async (req, reply) => {
      const { status, tier, owner, portal, search, page, limit } = req.query;
      const data = await queries.getOpportunities({
        status: status ? status.split(',') : undefined,
        tier: tier ? tier.split(',').map(Number) : undefined,
        owner: owner ? owner.split(',') : undefined,
        portal: portal ? portal.split(',') : undefined,
        search,
        page: page ? parseInt(page, 10) : undefined,
        limit: limit ? parseInt(limit, 10) : undefined,
      });
      return reply.send(data);
    },
  );

  fastify.get<{ Params: OpportunityParams }>(
    '/api/opportunities/:id',
    async (req, reply) => {
      const row = await queries.getOpportunityById(req.params.id);
      if (!row) return reply.status(404).send({ error: 'Not found' });
      return reply.send(row);
    },
  );

  fastify.patch<{ Params: OpportunityParams; Body: Record<string, unknown> }>(
    '/api/opportunities/:id',
    async (req, reply) => {
      const row = await queries.updateOpportunity(req.params.id, req.body);
      if (!row) return reply.status(404).send({ error: 'Not found' });
      return reply.send(row);
    },
  );

  fastify.patch<{ Params: PhotoParams; Body: { caption?: string; processed?: boolean } }>(
    '/api/opportunities/:id/photos/:photo_id',
    async (req, reply) => {
      const row = await queries.updatePhoto(req.params.id, req.params.photo_id, req.body);
      if (!row) return reply.status(404).send({ error: 'Not found' });
      return reply.send(row);
    },
  );
}
