import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'app_colors.dart';

/// 타이포그래피 시스템
class AppTextStyles {
  // Base font family (Noto Sans KR for Korean support)
  static TextStyle get _baseStyle => GoogleFonts.notoSansKr();

  // Display (매우 큰 텍스트 - 남은 시간 표시)
  static TextStyle get displayLarge => _baseStyle.copyWith(
    fontSize: 56,
    fontWeight: FontWeight.bold,
    height: 1.2,
    color: AppColors.textPrimary,
  );

  static TextStyle get displayMedium => _baseStyle.copyWith(
    fontSize: 48,
    fontWeight: FontWeight.bold,
    height: 1.2,
    color: AppColors.textPrimary,
  );

  static TextStyle get displaySmall => _baseStyle.copyWith(
    fontSize: 36,
    fontWeight: FontWeight.bold,
    height: 1.2,
    color: AppColors.textPrimary,
  );

  // Headline (제목)
  static TextStyle get headlineLarge => _baseStyle.copyWith(
    fontSize: 32,
    fontWeight: FontWeight.bold,
    color: AppColors.textPrimary,
  );

  static TextStyle get headlineMedium => _baseStyle.copyWith(
    fontSize: 28,
    fontWeight: FontWeight.w600,
    color: AppColors.textPrimary,
  );

  static TextStyle get headlineSmall => _baseStyle.copyWith(
    fontSize: 24,
    fontWeight: FontWeight.w600,
    color: AppColors.textPrimary,
  );

  // Title (타이틀)
  static TextStyle get titleLarge => _baseStyle.copyWith(
    fontSize: 22,
    fontWeight: FontWeight.w600,
    color: AppColors.textPrimary,
  );

  static TextStyle get titleMedium => _baseStyle.copyWith(
    fontSize: 18,
    fontWeight: FontWeight.w600,
    color: AppColors.textPrimary,
  );

  static TextStyle get titleSmall => _baseStyle.copyWith(
    fontSize: 16,
    fontWeight: FontWeight.w600,
    color: AppColors.textPrimary,
  );

  // Body (본문)
  static TextStyle get bodyLarge => _baseStyle.copyWith(
    fontSize: 16,
    fontWeight: FontWeight.normal,
    height: 1.5,
    color: AppColors.textPrimary,
  );

  static TextStyle get bodyMedium => _baseStyle.copyWith(
    fontSize: 14,
    fontWeight: FontWeight.normal,
    height: 1.5,
    color: AppColors.textPrimary,
  );

  static TextStyle get bodySmall => _baseStyle.copyWith(
    fontSize: 12,
    fontWeight: FontWeight.normal,
    height: 1.5,
    color: AppColors.textSecondary,
  );

  // Label (라벨)
  static TextStyle get labelLarge => _baseStyle.copyWith(
    fontSize: 14,
    fontWeight: FontWeight.w500,
    color: AppColors.textSecondary,
  );

  static TextStyle get labelMedium => _baseStyle.copyWith(
    fontSize: 12,
    fontWeight: FontWeight.w500,
    color: AppColors.textSecondary,
  );

  static TextStyle get labelSmall => _baseStyle.copyWith(
    fontSize: 10,
    fontWeight: FontWeight.w500,
    color: AppColors.textSecondary,
  );

  // Special (특수 용도)

  /// 남은 시간 표시 (프로그레스 링 중앙)
  static TextStyle get timeDisplay => _baseStyle.copyWith(
    fontSize: 48,
    fontWeight: FontWeight.bold,
    height: 1.0,
    color: AppColors.textPrimary,
    fontFeatures: [const FontFeature.tabularFigures()], // 숫자 정렬
  );

  /// 퍼센트 표시
  static TextStyle get percentage => _baseStyle.copyWith(
    fontSize: 24,
    fontWeight: FontWeight.w600,
    color: AppColors.textSecondary,
    fontFeatures: [const FontFeature.tabularFigures()],
  );

  /// 상태 표시 텍스트
  static TextStyle get statusText => _baseStyle.copyWith(
    fontSize: 16,
    fontWeight: FontWeight.w600,
    color: AppColors.textPrimary,
  );

  /// 버튼 텍스트
  static TextStyle get buttonLarge => _baseStyle.copyWith(
    fontSize: 18,
    fontWeight: FontWeight.w600,
    color: Colors.white,
  );

  static TextStyle get buttonMedium => _baseStyle.copyWith(
    fontSize: 16,
    fontWeight: FontWeight.w600,
    color: Colors.white,
  );

  /// 카드 타이틀
  static TextStyle get cardTitle => _baseStyle.copyWith(
    fontSize: 14,
    fontWeight: FontWeight.w500,
    color: AppColors.textSecondary,
  );

  /// 카드 값
  static TextStyle get cardValue => _baseStyle.copyWith(
    fontSize: 18,
    fontWeight: FontWeight.w600,
    color: AppColors.textPrimary,
  );

  // Simplified aliases for common use
  static TextStyle get title => titleLarge;
  static TextStyle get subtitle => titleMedium;
  static TextStyle get body => bodyMedium;
  static TextStyle get caption => labelMedium;
  static TextStyle get button => buttonMedium;
}
