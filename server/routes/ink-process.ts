import type { FastifyInstance } from 'fastify';
import * as queries from '../db/queries.js';

interface PhotoUploadParams {
  id: string;
}

export async function inkProcessRoutes(fastify: FastifyInstance): Promise<void> {
  fastify.post<{ Params: PhotoUploadParams }>(
    '/api/opportunities/:id/photos',
    async (req, reply) => {
      const data = await req.file();
      if (!data) return reply.status(400).send({ error: 'No file provided' });

      // In production, save the file to object storage and use the URL.
      // For local dev, use a placeholder URL derived from the original filename.
      const filename = `${Date.now()}-${data.filename}`;
      const url = `/uploads/${filename}`;

      const row = await queries.insertPhoto(req.params.id, url);
      return reply.status(201).send(row);
    },
  );
}
