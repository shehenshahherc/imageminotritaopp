import { useEffect, useState, useRef, useCallback } from 'react';
import { Image } from '@shared/schema';

interface WebSocketMessage {
  type: string;
  data: any;
}

interface UseWebSocketReturn {
  currentImage: Image | null;
  connectionStatus: 'connecting' | 'connected' | 'disconnected';
  messagesReceived: number;
  lastPing: number | null;
  uptime: string;
  reconnect: () => void;
}

export function useWebSocket(): UseWebSocketReturn {
  const [currentImage, setCurrentImage] = useState<Image | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');
  const [messagesReceived, setMessagesReceived] = useState(0);
  const [lastPing, setLastPing] = useState<number | null>(null);
  const [startTime] = useState(Date.now());
  const [uptime, setUptime] = useState('0s');
  
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  
  const connect = useCallback(() => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    setConnectionStatus('connecting');
    
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;
    
    ws.onopen = () => {
      setConnectionStatus('connected');
      console.log('WebSocket connected');
      
      // Send ping to measure latency
      const pingStart = Date.now();
      ws.send(JSON.stringify({ type: 'ping', timestamp: pingStart }));
    };
    
    ws.onmessage = (event) => {
      try {
        const message: WebSocketMessage = JSON.parse(event.data);
        setMessagesReceived(prev => prev + 1);
        
        if (message.type === 'image_update') {
          setCurrentImage(message.data);
        } else if (message.type === 'pong') {
          const latency = Date.now() - message.data.timestamp;
          setLastPing(latency);
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };
    
    ws.onclose = () => {
      setConnectionStatus('disconnected');
      console.log('WebSocket disconnected');
      
      // Attempt to reconnect after 3 seconds
      reconnectTimeoutRef.current = setTimeout(() => {
        connect();
      }, 3000);
    };
    
    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      setConnectionStatus('disconnected');
    };
  }, []);
  
  const reconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    connect();
  }, [connect]);
  
  // Update uptime every second
  useEffect(() => {
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const seconds = Math.floor(elapsed / 1000);
      const minutes = Math.floor(seconds / 60);
      const hours = Math.floor(minutes / 60);
      
      if (hours > 0) {
        setUptime(`${hours}h ${minutes % 60}m`);
      } else if (minutes > 0) {
        setUptime(`${minutes}m ${seconds % 60}s`);
      } else {
        setUptime(`${seconds}s`);
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, [startTime]);
  
  // Send periodic ping
  useEffect(() => {
    const interval = setInterval(() => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        const pingStart = Date.now();
        wsRef.current.send(JSON.stringify({ type: 'ping', timestamp: pingStart }));
      }
    }, 30000); // Ping every 30 seconds
    
    return () => clearInterval(interval);
  }, []);
  
  useEffect(() => {
    connect();
    
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [connect]);
  
  return {
    currentImage,
    connectionStatus,
    messagesReceived,
    lastPing,
    uptime,
    reconnect,
  };
}
