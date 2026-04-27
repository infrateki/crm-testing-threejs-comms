import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { BASE_URL } from './client';

const WS_URL = BASE_URL.replace(/^http/, 'ws') + '/ws/pipeline';

export type WsMessageType = 'scan_complete' | 'opportunity_updated' | 'deadline_alert';

export interface WsMessage {
  type: WsMessageType;
  payload: Record<string, unknown>;
}

class PipelineWebSocket {
  private ws: WebSocket | null = null;
  private reconnectDelay = 1_000;
  private readonly maxDelay = 30_000;
  private readonly listeners = new Set<(msg: WsMessage) => void>();
  private shouldReconnect = true;

  connect(): void {
    this.ws = new WebSocket(WS_URL);

    this.ws.onopen = () => {
      this.reconnectDelay = 1_000;
    };

    this.ws.onmessage = (ev) => {
      try {
        const msg = JSON.parse(ev.data as string) as WsMessage;
        this.listeners.forEach((l) => l(msg));
      } catch {
        // ignore malformed frames
      }
    };

    this.ws.onclose = () => {
      if (!this.shouldReconnect) return;
      const delay = this.reconnectDelay;
      this.reconnectDelay = Math.min(delay * 2, this.maxDelay);
      setTimeout(() => this.connect(), delay);
    };
  }

  addListener(fn: (msg: WsMessage) => void): void {
    this.listeners.add(fn);
  }

  removeListener(fn: (msg: WsMessage) => void): void {
    this.listeners.delete(fn);
  }

  disconnect(): void {
    this.shouldReconnect = false;
    this.ws?.close();
  }
}

export const pipelineSocket = new PipelineWebSocket();
pipelineSocket.connect();

export function useWebSocket(): void {
  const queryClient = useQueryClient();

  useEffect(() => {
    const handler = (msg: WsMessage) => {
      if (msg.type === 'opportunity_updated') {
        const id = msg.payload['id'] as string | undefined;
        void queryClient.invalidateQueries({ queryKey: ['opportunities'] });
        if (id) void queryClient.invalidateQueries({ queryKey: ['opportunity', id] });
      } else if (msg.type === 'scan_complete') {
        void queryClient.invalidateQueries({ queryKey: ['portals'] });
        void queryClient.invalidateQueries({ queryKey: ['opportunities'] });
      } else if (msg.type === 'deadline_alert') {
        void queryClient.invalidateQueries({ queryKey: ['deadlines'] });
        void queryClient.invalidateQueries({ queryKey: ['kpi'] });
      }
    };

    pipelineSocket.addListener(handler);
    return () => pipelineSocket.removeListener(handler);
  }, [queryClient]);
}
