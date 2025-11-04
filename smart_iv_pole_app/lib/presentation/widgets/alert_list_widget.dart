import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_text_styles.dart';
import '../../data/models/alert.dart';

/// 알림 목록 위젯
class AlertListWidget extends StatelessWidget {
  final List<Alert> alerts;

  const AlertListWidget({
    super.key,
    required this.alerts,
  });

  @override
  Widget build(BuildContext context) {
    if (alerts.isEmpty) {
      return _buildEmptyState();
    }

    return Column(
      children: alerts.map((alert) => _buildAlertItem(alert)).toList(),
    );
  }

  Widget _buildEmptyState() {
    return Container(
      padding: const EdgeInsets.all(32),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: AppColors.statusOffline.withValues(alpha: 0.3),
        ),
      ),
      child: Column(
        children: [
          Icon(
            Icons.notifications_none,
            size: 48,
            color: AppColors.statusOffline,
          ),
          const SizedBox(height: 12),
          Text(
            '알림이 없습니다',
            style: AppTextStyles.body.copyWith(
              color: AppColors.textSecondary,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildAlertItem(Alert alert) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: _getSeverityColor(alert.severity).withValues(alpha: 0.3),
        ),
        boxShadow: [
          BoxShadow(
            color: AppColors.shadow,
            blurRadius: 4,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // 아이콘
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: _getSeverityColor(alert.severity).withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Icon(
                _getSeverityIcon(alert.severity),
                color: _getSeverityColor(alert.severity),
                size: 24,
              ),
            ),
            const SizedBox(width: 12),

            // 내용
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Expanded(
                        child: Text(
                          _getSeverityLabel(alert.severity),
                          style: AppTextStyles.body.copyWith(
                            fontWeight: FontWeight.w600,
                            color: _getSeverityColor(alert.severity),
                          ),
                        ),
                      ),
                      Text(
                        _formatTime(alert.timestamp),
                        style: AppTextStyles.caption.copyWith(
                          color: AppColors.textLight,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 4),
                  Text(
                    alert.message,
                    style: AppTextStyles.body,
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Color _getSeverityColor(AlertSeverity severity) {
    switch (severity) {
      case AlertSeverity.critical:
        return AppColors.error;
      case AlertSeverity.high:
        return AppColors.statusCritical;
      case AlertSeverity.medium:
        return AppColors.warning;
      case AlertSeverity.low:
        return AppColors.statusWarning;
      case AlertSeverity.info:
        return AppColors.info;
    }
  }

  IconData _getSeverityIcon(AlertSeverity severity) {
    switch (severity) {
      case AlertSeverity.critical:
        return Icons.error_outline;
      case AlertSeverity.high:
        return Icons.warning_amber;
      case AlertSeverity.medium:
        return Icons.warning;
      case AlertSeverity.low:
        return Icons.info;
      case AlertSeverity.info:
        return Icons.info_outline;
    }
  }

  String _getSeverityLabel(AlertSeverity severity) {
    switch (severity) {
      case AlertSeverity.critical:
        return '위급';
      case AlertSeverity.high:
        return '긴급';
      case AlertSeverity.medium:
        return '주의';
      case AlertSeverity.low:
        return '알림';
      case AlertSeverity.info:
        return '정보';
    }
  }

  String _formatTime(DateTime timestamp) {
    final now = DateTime.now();
    final diff = now.difference(timestamp);

    if (diff.inMinutes < 1) {
      return '방금 전';
    } else if (diff.inMinutes < 60) {
      return '${diff.inMinutes}분 전';
    } else if (diff.inHours < 24) {
      return '${diff.inHours}시간 전';
    } else {
      return DateFormat('MM/dd HH:mm').format(timestamp);
    }
  }
}
