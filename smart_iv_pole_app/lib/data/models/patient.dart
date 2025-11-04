/// 환자 정보 모델
class Patient {
  final String id;
  final String name;
  final String roomId;
  final String bedNumber;
  final String? phone;
  final String? pinCode;
  final String? deviceToken;

  Patient({
    required this.id,
    required this.name,
    required this.roomId,
    required this.bedNumber,
    this.phone,
    this.pinCode,
    this.deviceToken,
  });

  factory Patient.fromJson(Map<String, dynamic> json) {
    return Patient(
      id: json['id']?.toString() ?? '',
      name: json['name'] ?? '',
      roomId: json['roomId'] ?? '',
      bedNumber: json['bedNumber'] ?? '',
      phone: json['phone'],
      pinCode: json['pinCode'],
      deviceToken: json['deviceToken'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'roomId': roomId,
      'bedNumber': bedNumber,
      'phone': phone,
      'pinCode': pinCode,
      'deviceToken': deviceToken,
    };
  }

  /// 환자 표시 이름 (예: "김환자 | 301A-2")
  String get displayName => '$name | $roomId-$bedNumber';

  /// 병실 정보 (예: "301A-2")
  String get roomInfo => '$roomId-$bedNumber';
}
