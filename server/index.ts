import Fastify from 'fastify';
import cors from '@fastify/cors';
import websocketPlugin from '@fastify/websocket';
import multipart from '@fastify/multipart';
import { opportunitiesRoutes } from './routes/opportunities.js';
import { portalsRoutes } from './routes/portals.js';
import { kpiRoutes } from './routes/kpi.js';
import { inkProcessRoutes } from './routes/ink-process.js';
import { addClient, broadcast } from './ws/pipeline.js';

const PORT = parseInt(process.env['PORT'] ?? '3001', 10);

const fastify = Fastify({ logger: true });

await fastify.register(cors, {
  origin: process.env['CORS_ORIGIN'] ?? 'http://localhost:5173',
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
});

await fastify.register(websocketPlugin);
await fastify.register(multipart, { limits: { fileSize: 20 * 1024 * 1024 } });

// REST routes
await fastify.register(opportunitiesRoutes);
await fastify.register(portalsRoutes);
await fastify.register(kpiRoutes);
await fastify.register(inkProcessRoutes);

// WebSocket endpoint
fastify.get('/ws/pipeline', { websocket: true }, (socket) => {
  addClient(socket);
});

// Health check
fastify.get('/health', async () => ({ ok: true, clients: broadcast.length }));

try {
  await fastify.listen({ port: PORT, host: '0.0.0.0' });
  console.log(`[server] listening on port ${PORT}`);
} catch (err) {
  fastify.log.error(err);
  process.exit(1);
}
