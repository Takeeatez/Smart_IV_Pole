import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_text_styles.dart';
import '../../providers/infusion_provider.dart';
import '../widgets/infusion_status_card.dart';
import '../widgets/alert_list_widget.dart';
import '../widgets/call_nurse_button.dart';
import 'login_screen.dart';

/// 홈 화면 - 수액 모니터링 및 알림
class HomeScreen extends ConsumerStatefulWidget {
  const HomeScreen({super.key});

  @override
  ConsumerState<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends ConsumerState<HomeScreen> {
  @override
  void initState() {
    super.initState();
    // 데이터 로드 및 실시간 연결 시작
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(infusionProvider.notifier).startMonitoring();
    });
  }

  @override
  void dispose() {
    // 실시간 연결 종료
    ref.read(infusionProvider.notifier).stopMonitoring();
    super.dispose();
  }

  Future<void> _handleLogout() async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('로그아웃'),
        content: const Text('로그아웃 하시겠습니까?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('취소'),
          ),
          TextButton(
            onPressed: () => Navigator.pop(context, true),
            child: const Text('로그아웃'),
          ),
        ],
      ),
    );

    if (confirmed == true && mounted) {
      ref.read(infusionProvider.notifier).logout();
      Navigator.of(context).pushReplacement(
        MaterialPageRoute(builder: (_) => const LoginScreen()),
      );
    }
  }

  Future<void> _handleRefresh() async {
    await ref.read(infusionProvider.notifier).refreshData();
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(infusionProvider);
    final patient = state.patient;

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        backgroundColor: AppColors.primary,
        foregroundColor: Colors.white,
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'MEDIPOLE',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),
            if (patient != null)
              Text(
                patient.displayName,
                style: const TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.normal,
                ),
              ),
          ],
        ),
        actions: [
          // 연결 상태 표시
          Padding(
            padding: const EdgeInsets.only(right: 8.0),
            child: Center(
              child: Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: 12,
                  vertical: 6,
                ),
                decoration: BoxDecoration(
                  color: state.isConnected
                      ? AppColors.success.withOpacity(0.2)
                      : AppColors.error.withOpacity(0.2),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Container(
                      width: 8,
                      height: 8,
                      decoration: BoxDecoration(
                        color: state.isConnected
                            ? AppColors.success
                            : AppColors.error,
                        shape: BoxShape.circle,
                      ),
                    ),
                    const SizedBox(width: 6),
                    Text(
                      state.isConnected ? '온라인' : '오프라인',
                      style: TextStyle(
                        color: state.isConnected
                            ? AppColors.success
                            : AppColors.error,
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
          // 로그아웃 버튼
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: _handleLogout,
            tooltip: '로그아웃',
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: _handleRefresh,
        child: state.isLoading && state.currentSession == null
            ? const Center(child: CircularProgressIndicator())
            : state.error != null
                ? Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(
                          Icons.error_outline,
                          size: 64,
                          color: AppColors.error,
                        ),
                        const SizedBox(height: 16),
                        Text(
                          '오류가 발생했습니다',
                          style: AppTextStyles.subtitle,
                        ),
                        const SizedBox(height: 8),
                        Text(
                          state.error!,
                          style: AppTextStyles.body.copyWith(
                            color: AppColors.textSecondary,
                          ),
                          textAlign: TextAlign.center,
                        ),
                        const SizedBox(height: 24),
                        ElevatedButton.icon(
                          onPressed: _handleRefresh,
                          icon: const Icon(Icons.refresh),
                          label: const Text('다시 시도'),
                        ),
                      ],
                    ),
                  )
                : state.currentSession == null
                    ? Center(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(
                              Icons.medication_outlined,
                              size: 64,
                              color: AppColors.textSecondary,
                            ),
                            const SizedBox(height: 16),
                            Text(
                              '아직 처방이 없습니다',
                              style: AppTextStyles.subtitle,
                            ),
                            const SizedBox(height: 8),
                            Text(
                              '간호사가 약품을 처방하면\n여기에 표시됩니다',
                              style: AppTextStyles.body.copyWith(
                                color: AppColors.textSecondary,
                              ),
                              textAlign: TextAlign.center,
                            ),
                            const SizedBox(height: 24),
                            ElevatedButton.icon(
                              onPressed: _handleRefresh,
                              icon: const Icon(Icons.refresh),
                              label: const Text('새로고침'),
                            ),
                          ],
                        ),
                      )
                    : ListView(
                        padding: const EdgeInsets.all(16),
                        children: [
                          // 수액 상태 카드
                          InfusionStatusCard(session: state.currentSession),
                          const SizedBox(height: 16),

                          // 긴급 호출 버튼
                          const CallNurseButton(),
                          const SizedBox(height: 24),

                          // 알림 목록
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text(
                                '알림',
                                style: AppTextStyles.subtitle,
                              ),
                              if (state.alerts.isNotEmpty)
                                Container(
                                  padding: const EdgeInsets.symmetric(
                                    horizontal: 8,
                                    vertical: 4,
                                  ),
                                  decoration: BoxDecoration(
                                    color: AppColors.error,
                                    borderRadius: BorderRadius.circular(12),
                                  ),
                                  child: Text(
                                    '${state.alerts.length}',
                                    style: const TextStyle(
                                      color: Colors.white,
                                      fontSize: 12,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                ),
                            ],
                          ),
                          const SizedBox(height: 12),
                          AlertListWidget(alerts: state.alerts),
                        ],
                      ),
      ),
    );
  }
}
