import type { WebSocket } from '@fastify/websocket';

export type WsEventType = 'scan_complete' | 'opportunity_updated' | 'deadline_alert';

export interface WsEvent {
  type: WsEventType;
  payload: Record<string, unknown>;
}

const clients = new Set<WebSocket>();

export function addClient(ws: WebSocket): void {
  clients.add(ws);
  ws.on('close', () => clients.delete(ws));
}

export function broadcast(event: WsEvent): void {
  const message = JSON.stringify(event);
  for (const ws of clients) {
    if (ws.readyState === ws.OPEN) {
      ws.send(message);
    }
  }
}

export function clientCount(): number {
  return clients.size;
}
