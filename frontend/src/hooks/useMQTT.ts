import { useEffect, useRef, useState } from 'react';
import { useWardStore } from '../stores/wardStore';
import { PoleData, Alert } from '../types';

interface MQTTConfig {
  brokerUrl: string;
  clientId: string;
  username?: string;
  password?: string;
}

interface MQTTHookReturn {
  isConnected: boolean;
  connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'error';
  lastMessage: any;
  error: string | null;
}

// Mock MQTT implementation for development (하드웨어 개발 중)
export const useMQTT = (config?: MQTTConfig): MQTTHookReturn => {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('disconnected');
  const [lastMessage, setLastMessage] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  
  const intervalRef = useRef<number | undefined>(undefined);
  const { updatePoleData } = useWardStore();

  // MQTT connection simulation (목업 데이터 제거됨 - 백엔드 데이터만 사용)
  useEffect(() => {
    // Simulate connection process
    setConnectionStatus('connecting');

    const connectTimer = setTimeout(() => {
      setIsConnected(true);
      setConnectionStatus('connected');
      console.log('🔗 Mock MQTT Connected - Ready for ESP32 hardware integration');
    }, 1000);

    return () => {
      clearTimeout(connectTimer);
      stopMockDataSimulation();
    };
  }, []);

  const startMockDataSimulation = () => {
    intervalRef.current = setInterval(() => {
      simulateRealTimeUpdates();
    }, 2000); // Update every 2 seconds
  };

  const stopMockDataSimulation = () => {
    if (intervalRef.current !== undefined) {
      clearInterval(intervalRef.current);
    }
  };

  const simulateRealTimeUpdates = () => {
    const poles = ['POLE001', 'POLE002', 'POLE003', 'POLE004'];
    
    poles.forEach((poleId, index) => {
      // Simulate different scenarios for each pole
      switch (poleId) {
        case 'POLE001': // Slowly decreasing, normal operation
          updatePoleData(poleId, {
            weight: Math.max(400 - (Date.now() % 1000000) / 2000, 300),
            percentage: Math.max(80 - (Date.now() % 1000000) / 12500, 60),
            currentVolume: Math.max(400 - (Date.now() % 1000000) / 2000, 300),
            flowRate: 98 + Math.random() * 4,
            battery: Math.max(88 - (Date.now() % 10000000) / 100000, 70),
            status: 'online',
            estimatedTime: Math.max(240 - (Date.now() % 1000000) / 4166, 180)
          });
          break;

        case 'POLE002': // Low fluid, needs attention
          const lowPercentage = Math.max(15 - (Date.now() % 500000) / 50000, 5);
          updatePoleData(poleId, {
            weight: lowPercentage * 5,
            percentage: lowPercentage,
            currentVolume: lowPercentage * 5,
            flowRate: 100 + Math.random() * 6,
            battery: Math.max(45 - (Date.now() % 5000000) / 100000, 30),
            status: 'online',
            estimatedTime: Math.max(40 - (Date.now() % 100000) / 2500, 10)
          });

          // 목업 알림 생성 제거됨 - 실제 하드웨어 연동 시 구현 예정
          break;

        case 'POLE003': // Critical - almost empty
          const criticalPercentage = Math.max(3 - (Date.now() % 200000) / 66666, 0.5);
          updatePoleData(poleId, {
            weight: criticalPercentage * 10,
            percentage: criticalPercentage,
            currentVolume: criticalPercentage * 10,
            flowRate: 95 + Math.random() * 10,
            battery: 92,
            status: 'online',
            estimatedTime: Math.max(20 - (Date.now() % 100000) / 5000, 2),
            isButtonPressed: Math.random() < 0.3 // 30% chance of button pressed
          });

          // 목업 알림 생성 제거됨 - 실제 하드웨어 연동 시 구현 예정
          break;

        case 'POLE004': // Offline simulation
          const isOnline = Math.random() < 0.3; // 30% chance to be online
          updatePoleData(poleId, {
            status: isOnline ? 'online' : 'offline',
            weight: isOnline ? 200 : 0,
            percentage: isOnline ? 40 : 0,
            currentVolume: isOnline ? 200 : 0,
            flowRate: isOnline ? 98 : 0,
            battery: 12,
            estimatedTime: isOnline ? 120 : 0
          });
          break;
      }
    });

    // 랜덤 버튼 프레스 시뮬레이션 제거됨 - 실제 하드웨어 연동 시 구현 예정

    setLastMessage({
      timestamp: new Date(),
      type: 'simulation_update'
    });
  };

  // Disable disconnect/reconnect simulation for static mode
  // useEffect(() => {
  //   const reconnectTimer = setInterval(() => {
  //     if (Math.random() < 0.02) { // 2% chance of disconnect
  //       setIsConnected(false);
  //       setConnectionStatus('disconnected');
  //       stopMockDataSimulation();
  //       
  //       // Reconnect after 3-5 seconds
  //       setTimeout(() => {
  //         setIsConnected(true);
  //         setConnectionStatus('connected');
  //         startMockDataSimulation();
  //         console.log('🔄 Mock MQTT Reconnected');
  //       }, 3000 + Math.random() * 2000);
  //     }
  //   }, 10000); // Check every 10 seconds

  //   return () => clearInterval(reconnectTimer);
  // }, []);

  return {
    isConnected,
    connectionStatus,
    lastMessage,
    error
  };
};

// Real MQTT implementation (for future hardware integration)
export const useRealMQTT = (config: MQTTConfig): MQTTHookReturn => {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('disconnected');
  const [lastMessage, setLastMessage] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // TODO: Implement real MQTT connection when hardware is ready
  // This will use socket.io-client or mqtt.js to connect to the actual MQTT broker
  
  useEffect(() => {
    console.log('🚧 Real MQTT implementation pending hardware development');
    // Implementation will include:
    // - Connect to MQTT broker (Eclipse Mosquitto)
    // - Subscribe to topics: pole/+/status, pole/+/weight, alert/+/low, etc.
    // - Handle incoming messages and update store
    // - Handle connection errors and reconnection
  }, [config]);

  return {
    isConnected,
    connectionStatus,
    lastMessage,
    error
  };
};