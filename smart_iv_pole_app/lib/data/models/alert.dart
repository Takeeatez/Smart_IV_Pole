/// 알림 모델
class Alert {
  final String id;
  final String patientId;
  final String sessionId;
  final AlertType type;
  final AlertSeverity severity;
  final String message;
  final DateTime timestamp;
  final bool acknowledged;

  Alert({
    required this.id,
    required this.patientId,
    required this.sessionId,
    required this.type,
    required this.severity,
    required this.message,
    required this.timestamp,
    this.acknowledged = false,
  });

  factory Alert.fromJson(Map<String, dynamic> json) {
    return Alert(
      id: json['id']?.toString() ?? '',
      patientId: json['patientId']?.toString() ?? '',
      sessionId: json['sessionId']?.toString() ?? '',
      type: _parseType(json['type']),
      severity: _parseSeverity(json['severity']),
      message: json['message'] ?? '',
      timestamp: json['timestamp'] != null
          ? DateTime.parse(json['timestamp'])
          : DateTime.now(),
      acknowledged: json['acknowledged'] ?? false,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'patientId': patientId,
      'sessionId': sessionId,
      'type': type.name,
      'severity': severity.name,
      'message': message,
      'timestamp': timestamp.toIso8601String(),
      'acknowledged': acknowledged,
    };
  }

  static AlertType _parseType(dynamic type) {
    if (type == null) return AlertType.unknown;

    final typeStr = type.toString().toLowerCase();
    switch (typeStr) {
      case 'low_fluid':
        return AlertType.lowFluid;
      case 'empty':
        return AlertType.empty;
      case 'abnormal_flow':
        return AlertType.abnormalFlow;
      case 'emergency_call':
        return AlertType.emergencyCall;
      case 'device_offline':
        return AlertType.deviceOffline;
      default:
        return AlertType.unknown;
    }
  }

  static AlertSeverity _parseSeverity(dynamic severity) {
    if (severity == null) return AlertSeverity.info;

    final severityStr = severity.toString().toLowerCase();
    switch (severityStr) {
      case 'critical':
        return AlertSeverity.critical;
      case 'high':
        return AlertSeverity.high;
      case 'medium':
        return AlertSeverity.medium;
      case 'low':
        return AlertSeverity.low;
      case 'info':
        return AlertSeverity.info;
      default:
        return AlertSeverity.info;
    }
  }

  /// 알림 아이콘
  String get icon {
    switch (type) {
      case AlertType.lowFluid:
        return '⚠️';
      case AlertType.empty:
        return '🚨';
      case AlertType.abnormalFlow:
        return '⚡';
      case AlertType.emergencyCall:
        return '🔔';
      case AlertType.deviceOffline:
        return '📴';
      case AlertType.unknown:
        return 'ℹ️';
    }
  }

  /// 시간 경과 표시 (예: "5분 전")
  String get timeAgo {
    final now = DateTime.now();
    final diff = now.difference(timestamp);

    if (diff.inMinutes < 1) {
      return '방금';
    } else if (diff.inMinutes < 60) {
      return '${diff.inMinutes}분 전';
    } else if (diff.inHours < 24) {
      return '${diff.inHours}시간 전';
    } else {
      return '${diff.inDays}일 전';
    }
  }
}

/// 알림 타입
enum AlertType {
  lowFluid, // 수액 부족
  empty, // 수액 소진
  abnormalFlow, // 비정상 흐름
  emergencyCall, // 비상 호출
  deviceOffline, // 장치 오프라인
  unknown, // 알 수 없음
}

/// 알림 심각도
enum AlertSeverity {
  critical, // 위급
  high, // 높음
  medium, // 중간
  low, // 낮음
  info, // 정보
}
