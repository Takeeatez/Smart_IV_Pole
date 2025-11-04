import 'dart:async';
import 'dart:convert';
import 'package:web_socket_channel/web_socket_channel.dart';
import 'package:web_socket_channel/status.dart' as status;
import '../models/infusion_session.dart';
import '../../core/constants/api_constants.dart';

/// WebSocket 실시간 업데이트 서비스
class WebSocketService {
  final String patientId;
  WebSocketChannel? _channel;
  bool _isConnected = false;
  Timer? _reconnectTimer;

  final _infusionController = StreamController<InfusionSession>.broadcast();
  final _connectionController = StreamController<bool>.broadcast();

  Stream<InfusionSession> get infusionUpdates => _infusionController.stream;
  Stream<bool> get connectionStatus => _connectionController.stream;
  bool get isConnected => _isConnected;

  WebSocketService(this.patientId);

  /// WebSocket 연결
  void connect() {
    if (_isConnected) return;

    try {
      final wsUrl = ApiConstants.patientWebSocket(patientId);
      print('Connecting to WebSocket: $wsUrl');

      _channel = WebSocketChannel.connect(Uri.parse(wsUrl));

      _channel!.stream.listen(
        _handleMessage,
        onError: _handleError,
        onDone: _handleDisconnect,
        cancelOnError: false,
      );

      _isConnected = true;
      _connectionController.add(true);
      print('WebSocket connected');
    } catch (e) {
      print('WebSocket connection error: $e');
      _scheduleReconnect();
    }
  }

  /// 메시지 처리
  void _handleMessage(dynamic message) {
    try {
      final data = json.decode(message as String);

      if (data['type'] == 'infusion_update') {
        final session = InfusionSession.fromJson(data['data']);
        _infusionController.add(session);
      } else if (data['type'] == 'alert') {
        // 알림 처리 (필요 시 별도 스트림 추가)
        print('Alert received: ${data['data']}');
      }
    } catch (e) {
      print('Message parsing error: $e');
    }
  }

  /// 에러 처리
  void _handleError(error) {
    print('WebSocket error: $error');
    _isConnected = false;
    _connectionController.add(false);
    _scheduleReconnect();
  }

  /// 연결 종료 처리
  void _handleDisconnect() {
    print('WebSocket disconnected');
    _isConnected = false;
    _connectionController.add(false);
    _scheduleReconnect();
  }

  /// 재연결 스케줄링
  void _scheduleReconnect() {
    _reconnectTimer?.cancel();
    _reconnectTimer = Timer(ApiConstants.wsReconnectDelay, () {
      print('Attempting to reconnect WebSocket...');
      disconnect();
      connect();
    });
  }

  /// 연결 종료
  void disconnect() {
    _reconnectTimer?.cancel();
    _channel?.sink.close(status.goingAway);
    _channel = null;
    _isConnected = false;
    _connectionController.add(false);
  }

  /// 리소스 정리
  void dispose() {
    _reconnectTimer?.cancel();
    disconnect();
    _infusionController.close();
    _connectionController.close();
  }
}
