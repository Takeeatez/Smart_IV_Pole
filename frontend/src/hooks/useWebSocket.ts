import { useEffect, useRef, useState } from 'react';
import { Client, IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { useWardStore } from '../stores/wardStore';

interface WebSocketConfig {
  serverUrl: string;
  reconnectDelay?: number;
  debug?: boolean;
}

interface WebSocketHookReturn {
  isConnected: boolean;
  connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'error';
  lastMessage: any;
  error: string | null;
  reconnect: () => void;
}

/**
 * Real-time WebSocket hook for ESP8266 hardware integration
 * 백엔드 WebSocket 서버와 연결하여 실시간 센서 데이터 수신
 */
export const useWebSocket = (config?: WebSocketConfig): WebSocketHookReturn => {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('disconnected');
  const [lastMessage, setLastMessage] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const clientRef = useRef<Client | null>(null);
  const reconnectTimeoutRef = useRef<number | undefined>(undefined);

  const { updatePoleData, addAlert } = useWardStore();

  const serverUrl = config?.serverUrl || 'http://localhost:8081';
  const reconnectDelay = config?.reconnectDelay || 5000;
  const debug = config?.debug || false;

  const connect = () => {
    if (clientRef.current?.active) {
      console.log('⚠️ WebSocket already connected');
      return;
    }

    setConnectionStatus('connecting');
    setError(null);

    const client = new Client({
      // SockJS를 통한 WebSocket 연결
      webSocketFactory: () => new SockJS(`${serverUrl}/ws`) as any,

      connectHeaders: {},

      debug: debug ? (str) => console.log('🔌 STOMP:', str) : undefined,

      reconnectDelay: reconnectDelay,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,

      onConnect: () => {
        console.log('✅ WebSocket Connected to:', serverUrl);
        setIsConnected(true);
        setConnectionStatus('connected');
        setError(null);

        // Subscribe to topics
        subscribeToTopics(client);
      },

      onStompError: (frame) => {
        console.error('❌ STOMP Error:', frame.headers['message']);
        console.error('Details:', frame.body);
        setError(`STOMP Error: ${frame.headers['message']}`);
        setConnectionStatus('error');
      },

      onWebSocketError: (event) => {
        console.error('❌ WebSocket Error:', event);
        setError('WebSocket connection failed');
        setConnectionStatus('error');
      },

      onDisconnect: () => {
        console.log('🔌 WebSocket Disconnected');
        setIsConnected(false);
        setConnectionStatus('disconnected');

        // Auto-reconnect after delay
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
        }
        reconnectTimeoutRef.current = setTimeout(() => {
          console.log('🔄 Attempting to reconnect...');
          connect();
        }, reconnectDelay);
      },
    });

    clientRef.current = client;
    client.activate();
  };

  const subscribeToTopics = (client: Client) => {
    // 모든 Pole 데이터 구독 (와일드카드)
    client.subscribe('/topic/pole/*', (message: IMessage) => {
      handlePoleDataMessage(message);
    });

    // 전체 알림 구독
    client.subscribe('/topic/alerts', (message: IMessage) => {
      handleAlertMessage(message);
    });

    console.log('📡 Subscribed to WebSocket topics');
  };

  const handlePoleDataMessage = (message: IMessage) => {
    try {
      const data = JSON.parse(message.body);

      if (debug) {
        console.log('📊 Pole Data Received:', data);
      }

      const {
        device_id,
        patient_id,
        session_id,
        weight,
        predicted_time,
        remaining_volume,
        percentage,
        state,
        timestamp
      } = data;

      // Update pole data in store
      updatePoleData(device_id, {
        poleId: device_id,
        patientId: `P${patient_id}`, // Include patientId for bed matching
        weight: weight,
        currentVolume: remaining_volume,
        percentage: percentage,
        status: state === 'STABLE' ? 'online' : 'error',
        estimatedTime: predicted_time / 60, // Convert seconds to minutes
        lastUpdate: new Date(timestamp),
      });

      setLastMessage({
        type: 'pole_data',
        data,
        timestamp: new Date()
      });

    } catch (err) {
      console.error('❌ Error parsing pole data:', err);
    }
  };

  const handleAlertMessage = (message: IMessage) => {
    try {
      const data = JSON.parse(message.body);

      console.log('🚨 Alert Received:', data);

      const {
        alert_id,
        device_id,
        patient_id,
        session_id,
        alert_type,
        severity,
        message: alertMessage,
        deviation_percent,
        timestamp
      } = data;

      // Add alert to store
      addAlert({
        id: `ALT${alert_id}`,
        poleId: device_id,
        patientId: `P${patient_id}`,
        type: alert_type === 'FLOW_RATE_ABNORMAL' ? 'abnormal' : 'low',
        severity: severity === 'critical' ? 'critical' : 'warning',
        message: alertMessage || `유속 이상 감지 (${deviation_percent.toFixed(1)}% 편차)`,
        timestamp: new Date(timestamp),
        acknowledged: false,
      });

      setLastMessage({
        type: 'alert',
        data,
        timestamp: new Date()
      });

    } catch (err) {
      console.error('❌ Error parsing alert:', err);
    }
  };

  const disconnect = () => {
    if (clientRef.current) {
      clientRef.current.deactivate();
      clientRef.current = null;
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = undefined;
    }
    setIsConnected(false);
    setConnectionStatus('disconnected');
  };

  const reconnect = () => {
    disconnect();
    setTimeout(() => connect(), 500);
  };

  // Initialize connection on mount
  useEffect(() => {
    connect();

    return () => {
      disconnect();
    };
  }, [serverUrl]);

  return {
    isConnected,
    connectionStatus,
    lastMessage,
    error,
    reconnect,
  };
};

/**
 * Hook for subscribing to specific pole data
 */
export const usePoleWebSocket = (poleId: string, config?: WebSocketConfig) => {
  const [poleData, setPoleData] = useState<any>(null);
  const clientRef = useRef<Client | null>(null);

  const serverUrl = config?.serverUrl || 'http://localhost:8081';

  useEffect(() => {
    const client = new Client({
      webSocketFactory: () => new SockJS(`${serverUrl}/ws`) as any,

      onConnect: () => {
        console.log(`✅ Connected to pole ${poleId}`);

        // Subscribe to specific pole
        client.subscribe(`/topic/pole/${poleId}`, (message: IMessage) => {
          const data = JSON.parse(message.body);
          setPoleData(data);
        });

        // Subscribe to pole alerts
        client.subscribe(`/topic/pole/${poleId}/alert`, (message: IMessage) => {
          const data = JSON.parse(message.body);
          console.log(`🚨 Alert for pole ${poleId}:`, data);
        });
      },
    });

    clientRef.current = client;
    client.activate();

    return () => {
      client.deactivate();
    };
  }, [poleId, serverUrl]);

  return poleData;
};
