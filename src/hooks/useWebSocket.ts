import { useState, useEffect, useRef, useCallback } from 'react';
import { PriceUpdate } from '../types';

interface UseWebSocketOptions {
  url: string;
  onMessage?: (data: PriceUpdate) => void;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
}

interface UseWebSocketReturn {
  isConnected: boolean;
  lastMessage: PriceUpdate | null;
  error: string | null;
  sendMessage: (message: object) => void;
  reconnect: () => void;
}

/**
 * هوک WebSocket برای اتصال به بک‌اند Django
 * 
 * نحوه استفاده:
 * const { isConnected, lastMessage } = useWebSocket({
 *   url: 'ws://localhost:8000/ws/prices/',
 *   onMessage: (data) => console.log(data),
 * });
 * 
 * نمونه بک‌اند Django Channels:
 * 
 * # consumers.py
 * class PriceConsumer(WebsocketConsumer):
 *     def connect(self):
 *         self.accept()
 *         # ارسال قیمت‌ها هر ۵ ثانیه
 *         
 *     def receive(self, text_data):
 *         # دریافت پیام از کلاینت
 *         data = json.loads(text_data)
 *         # پردازش و ارسال پاسخ
 */
export function useWebSocket({
  url,
  onMessage,
  reconnectInterval = 3000,
  maxReconnectAttempts = 5,
}: UseWebSocketOptions): UseWebSocketReturn {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<PriceUpdate | null>(null);
  const [error, setError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectCountRef = useRef(0);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const connect = useCallback(() => {
    try {
      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('WebSocket connected to:', url);
        setIsConnected(true);
        setError(null);
        reconnectCountRef.current = 0;
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data) as PriceUpdate;
          setLastMessage(data);
          onMessage?.(data);
        } catch (e) {
          console.warn('Failed to parse WebSocket message:', e);
        }
      };

      ws.onclose = (event) => {
        console.log('WebSocket closed:', event.code, event.reason);
        setIsConnected(false);

        // تلاش برای اتصال مجدد
        if (reconnectCountRef.current < maxReconnectAttempts) {
          reconnectTimerRef.current = setTimeout(() => {
            reconnectCountRef.current += 1;
            console.log(`Reconnecting... attempt ${reconnectCountRef.current}`);
            connect();
          }, reconnectInterval);
        } else {
          setError('حداکثر تلاش برای اتصال مجدد انجام شد');
        }
      };

      ws.onerror = (event) => {
        console.error('WebSocket error:', event);
        setError('خطا در اتصال WebSocket');
        setIsConnected(false);
      };
    } catch (e) {
      setError('خطا در ایجاد اتصال WebSocket');
      setIsConnected(false);
    }
  }, [url, onMessage, reconnectInterval, maxReconnectAttempts]);

  const sendMessage = useCallback((message: object) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    }
  }, []);

  const reconnect = useCallback(() => {
    reconnectCountRef.current = 0;
    if (wsRef.current) {
      wsRef.current.close();
    }
    connect();
  }, [connect]);

  useEffect(() => {
    connect();

    return () => {
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [connect]);

  return {
    isConnected,
    lastMessage,
    error,
    sendMessage,
    reconnect,
  };
}
