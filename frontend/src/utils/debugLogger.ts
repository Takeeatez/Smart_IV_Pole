// 🔄 Enhanced debugging and state tracking utility for prescription data synchronization
// Centralized logging system for debugging prescription data issues

export interface LogContext {
  component: string;
  patientId?: string;
  patientName?: string;
  action: string;
  details?: Record<string, any>;
  timestamp?: Date;
}

export class DebugLogger {
  private static instance: DebugLogger;
  private logs: LogContext[] = [];
  private maxLogs = 1000; // Keep last 1000 logs

  static getInstance(): DebugLogger {
    if (!DebugLogger.instance) {
      DebugLogger.instance = new DebugLogger();
    }
    return DebugLogger.instance;
  }

  // 🔄 Main logging method with enhanced formatting
  log(level: 'info' | 'warn' | 'error' | 'debug', context: LogContext): void {
    const timestamp = new Date();
    const fullContext = { ...context, timestamp };

    // Store log for debugging
    this.logs.push(fullContext);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift(); // Remove oldest log
    }

    // Enhanced console output with emojis and formatting
    const emoji = this.getEmojiForLevel(level);
    const patientInfo = context.patientId
      ? `[${context.patientName || context.patientId}]`
      : '';

    const logMessage = `${emoji} [${context.component}${patientInfo}] ${context.action}`;

    switch (level) {
      case 'error':
        console.error(logMessage, context.details || '');
        break;
      case 'warn':
        console.warn(logMessage, context.details || '');
        break;
      case 'debug':
        console.debug(logMessage, context.details || '');
        break;
      default:
        console.log(logMessage, context.details || '');
    }
  }

  // 🔄 Specialized methods for different scenarios
  logPrescriptionState(
    component: string,
    patientId: string,
    patientName: string,
    hasCurrentPrescription: boolean,
    prescriptionDetails?: any
  ): void {
    this.log('info', {
      component,
      patientId,
      patientName,
      action: hasCurrentPrescription ? '처방 정보 확인됨' : '처방 정보 누락',
      details: {
        hasCurrentPrescription,
        prescriptionName: prescriptionDetails?.medicationName,
        prescriptionId: prescriptionDetails?.id,
        prescribedAt: prescriptionDetails?.prescribedAt
      }
    });
  }

  logDataSync(
    component: string,
    action: string,
    details: Record<string, any>
  ): void {
    this.log('debug', {
      component,
      action: `데이터 동기화: ${action}`,
      details
    });
  }

  logForceUpdate(
    component: string,
    patientId: string,
    trigger: string,
    phase: string
  ): void {
    this.log('info', {
      component,
      patientId,
      action: `강제 업데이트: ${phase}`,
      details: { trigger, phase }
    });
  }

  logCallback(
    component: string,
    patientId: string,
    action: 'register' | 'unregister' | 'trigger'
  ): void {
    const actionText = {
      register: '콜백 등록',
      unregister: '콜백 해제',
      trigger: '콜백 실행'
    }[action];

    this.log('debug', {
      component,
      patientId,
      action: `실시간 콜백: ${actionText}`,
      details: { callbackAction: action }
    });
  }

  logApiCall(
    component: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    endpoint: string,
    success: boolean,
    duration?: number,
    details?: any
  ): void {
    this.log(success ? 'info' : 'error', {
      component,
      action: `API 호출: ${method} ${endpoint}`,
      details: {
        method,
        endpoint,
        success,
        duration: duration ? `${duration}ms` : undefined,
        ...details
      }
    });
  }

  // 🔄 Error tracking for specific prescription issues
  logPrescriptionError(
    component: string,
    patientId: string,
    patientName: string,
    errorType: string,
    error: any
  ): void {
    this.log('error', {
      component,
      patientId,
      patientName,
      action: `처방 오류: ${errorType}`,
      details: {
        errorType,
        errorMessage: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      }
    });
  }

  // 🔄 Get recent logs for debugging
  getRecentLogs(count = 50): LogContext[] {
    return this.logs.slice(-count);
  }

  // 🔄 Get logs for specific patient
  getPatientLogs(patientId: string, count = 20): LogContext[] {
    return this.logs
      .filter(log => log.patientId === patientId)
      .slice(-count);
  }

  // 🔄 Get logs for specific component
  getComponentLogs(component: string, count = 20): LogContext[] {
    return this.logs
      .filter(log => log.component === component)
      .slice(-count);
  }

  // 🔄 Clear logs (for debugging)
  clearLogs(): void {
    this.logs = [];
    console.log('🧹 Debug logs cleared');
  }

  // 🔄 Export logs as JSON for analysis
  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }

  private getEmojiForLevel(level: string): string {
    switch (level) {
      case 'error': return '❌';
      case 'warn': return '⚠️';
      case 'debug': return '🔍';
      default: return '📊';
    }
  }
}

// 🔄 Convenience exports for easy use
export const logger = DebugLogger.getInstance();

// 🔄 Specialized helper functions
export const logPrescriptionState = (
  component: string,
  patientId: string,
  patientName: string,
  hasCurrentPrescription: boolean,
  prescriptionDetails?: any
) => logger.logPrescriptionState(component, patientId, patientName, hasCurrentPrescription, prescriptionDetails);

export const logDataSync = (
  component: string,
  action: string,
  details: Record<string, any>
) => logger.logDataSync(component, action, details);

export const logForceUpdate = (
  component: string,
  patientId: string,
  trigger: string,
  phase: string
) => logger.logForceUpdate(component, patientId, trigger, phase);

export const logCallback = (
  component: string,
  patientId: string,
  action: 'register' | 'unregister' | 'trigger'
) => logger.logCallback(component, patientId, action);

export const logApiCall = (
  component: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  endpoint: string,
  success: boolean,
  duration?: number,
  details?: any
) => logger.logApiCall(component, method, endpoint, success, duration, details);

export const logPrescriptionError = (
  component: string,
  patientId: string,
  patientName: string,
  errorType: string,
  error: any
) => logger.logPrescriptionError(component, patientId, patientName, errorType, error);

// 🔄 Debug helper for React DevTools
declare global {
  interface Window {
    debugLogger: DebugLogger;
  }
}

if (typeof window !== 'undefined') {
  window.debugLogger = logger;
}