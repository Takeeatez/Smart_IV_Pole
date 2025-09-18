CREATE TABLE drip_types (
drip_id INT AUTO_INCREMENT NOT NULL COMMENT '수액 고유 식별 번호',
drip_name VARCHAR(100) NOT NULL UNIQUE COMMENT '수액 이름, UNIQUE',
PRIMARY KEY (drip_id)
);

---

CREATE TABLE wards (
ward_id VARCHAR(20) NOT NULL DEFAULT 'W01' COMMENT '병동 고유 ID. 중복허용 X',
ward_name VARCHAR(50) NOT NULL COMMENT '병동 이름',
PRIMARY KEY (ward_id)
);

---

CREATE TABLE rooms (
room_id VARCHAR(50) NOT NULL COMMENT '병실 고유 ID',
ward_id VARCHAR(20) NOT NULL DEFAULT 'W01' COMMENT '병동 고유 ID',
patient_id INT AUTO_INCREMENT NOT NULL COMMENT '환자 고유 식별 번호',
room_number VARCHAR(10) NOT NULL COMMENT '병실 번호 (병동 내 중복 불가)',
room_person INT NOT NULL COMMENT '최대 가용 인원',
PRIMARY KEY (patient_id),
UNIQUE KEY uq_room (ward_id, room_number)
);

---

CREATE TABLE nurses (
nurse_id INT AUTO_INCREMENT NOT NULL COMMENT '간호사 고유 식별 번호',
name VARCHAR(50) NOT NULL COMMENT '간호사 이름',
employee_id VARCHAR(50) NOT NULL UNIQUE COMMENT '직원 ID(로그인 ID)',
password VARCHAR(255) NOT NULL COMMENT '암호화 필요',
role ENUM('Root', 'Admin') NOT NULL COMMENT 'Root(수간호사) 혹은 Admin(일반간호사)',
PRIMARY KEY (nurse_id)
);

---

CREATE TABLE alert_logs (
alert_id INT AUTO_INCREMENT NOT NULL COMMENT '알림 ID',
session_id INT NOT NULL COMMENT '투여 세션 ID',
alert_type ENUM('low_volume', 'flow_stopped', 'pole_fall', 'battery_low', 'system_error') NOT NULL COMMENT '알림 유형',
severity ENUM('info', 'warning', 'critical') NOT NULL COMMENT '심각도',
message TEXT NOT NULL COMMENT '알림 메시지',
acknowledged BOOLEAN NOT NULL DEFAULT FALSE COMMENT '확인 여부',
acknowledged_by VARCHAR(50) NULL COMMENT '확인한 간호사 ID',
acknowledged_at DATETIME NULL COMMENT '확인 시간',
created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '생성 시각',
PRIMARY KEY (alert_id),
KEY idx_session (session_id)
);

---

CREATE TABLE patients (
patient_id INT AUTO_INCREMENT NOT NULL COMMENT '환자 고유 식별 번호',
name VARCHAR(50) NOT NULL COMMENT '환자 이름',
phone VARCHAR(20) NOT NULL DEFAULT '010-1234-4567' COMMENT '환자 개인 번호',
birth_date DATE NOT NULL COMMENT '생년월일(로그인 비밀번호)',
gender ENUM('male', 'female') NOT NULL COMMENT '성별',
height_cm INT NULL COMMENT '키 (cm)',
weight_kg INT NULL COMMENT '몸무게 (kg)',
address VARCHAR(255) NULL COMMENT '주소',
room_id VARCHAR(10) NULL COMMENT '병실 번호 (예: 301A)',
bed_number VARCHAR(5) NULL COMMENT '침대 번호 (예: 1, 2, 3, 4, 5, 6)',
created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '생성 시각',
PRIMARY KEY (patient_id)
);

---

CREATE TABLE poles (
pole_id VARCHAR(20) NOT NULL COMMENT 'IV 폴대 장치 ID',
status ENUM('active', 'maintenance', 'inactive') NOT NULL DEFAULT 'active' COMMENT '장치 상태',
battery_level INT NOT NULL DEFAULT 100 COMMENT '배터리 잔량(%)',
last_maintenance DATE NULL COMMENT '마지막 정비일',
created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '생성 시각',
updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정 시각',
PRIMARY KEY (pole_id)
);

---

CREATE TABLE infusion_sessions (
session_id INT AUTO_INCREMENT NOT NULL COMMENT '투여 세션 고유 ID',
patient_id INT NOT NULL COMMENT '수액을 맞는 환자 ID',
drip_id INT NOT NULL COMMENT '투여 중인 수액 ID',
start_time TIMESTAMP NOT NULL COMMENT '투여 시작 시간',
end_time TIMESTAMP NULL COMMENT '투여중이면 NULL',
end_exp_time TIMESTAMP NULL COMMENT 'ESP에서 받아온 종료 예상 시간',
remaining_volume INT NOT NULL COMMENT '현재 남은 수액량(mL)',
flow_rate DECIMAL(6,2) NOT NULL COMMENT '현재 투여 속도 (mL/h)',
iv_pole_id VARCHAR(20) NOT NULL COMMENT '연결된 스마트 폴대 ID',
status ENUM('ACTIVE', 'PAUSED', 'ENDED') NOT NULL DEFAULT 'ACTIVE' COMMENT '현재 상태',
total_volume_ml INT NOT NULL COMMENT '총 투여량 (mL)',
PRIMARY KEY (session_id),
KEY idx_patient (patient_id),
KEY idx_drip (drip_id),
KEY idx_pole (iv_pole_id)
);

---

~~/*CREATE TABLE `drip_monitoring` (
`monitoring_id`	INT	NULL	COMMENT '모니터링 ID',
`session_id`	INT	NOT NULL	COMMENT '투여 세션 ID',
`measured_time`	DATETIME	NOT NULL	COMMENT '측정 시간',
`remaining_volume`	INT	NOT NULL	COMMENT '잔여량(ml)',
`current_rate`	DECIMAL(5, 2)	NULL	COMMENT '현재 투여율(ml/h)',
`weight_sensor_value`	DECIMAL(8, 2)	NULL	COMMENT '무게센서 값(g)',
`pole_status`	ENUM('normal', 'warning', 'critical')	NULL	DEFAULT 'normal'	COMMENT '폴대 상태',
`alert_triggered`	BOOLEAN	NULL	DEFAULT FALSE	COMMENT '알림 발생 여부',
`created_at`	TIMESTAMP	NULL,
`INDEX`	idx_session_time	NULL
);*/~~

CREATE TABLE infusion_logs (
log_id INT AUTO_INCREMENT NOT NULL COMMENT '이력 PK',
session_id INT NOT NULL COMMENT '투여 세션 ID',
patient_id INT NOT NULL COMMENT '환자 ID',
drip_id INT NOT NULL COMMENT '수액 종류 ID',
started_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '투여 시작 시각(로그 기록 시점)',
ended_at TIMESTAMP NULL COMMENT '투여 종료 시각(완료 시 기록)',
note VARCHAR(255) NULL COMMENT '비고',
PRIMARY KEY (log_id),
KEY idx_inf_log_session (session_id),
KEY idx_inf_log_patient (patient_id),
KEY idx_inf_log_drip (drip_id),
CONSTRAINT fk_inf_log_session
FOREIGN KEY (session_id) REFERENCES infusion_sessions(session_id)
ON DELETE CASCADE,
CONSTRAINT fk_inf_log_patient
FOREIGN KEY (patient_id) REFERENCES patients(patient_id),
CONSTRAINT fk_inf_log_drip
FOREIGN KEY (drip_id) REFERENCES drip_types(drip_id)
);

---

*FK

ALTER TABLE alert_logs
ADD CONSTRAINT fk_alert_session
FOREIGN KEY (session_id) REFERENCES infusion_sessions(session_id);

ALTER TABLE infusion_sessions
ADD CONSTRAINT fk_is_patient
FOREIGN KEY (patient_id) REFERENCES patients(patient_id),
ADD CONSTRAINT fk_is_drip
FOREIGN KEY (drip_id) REFERENCES drip_types(drip_id),
ADD CONSTRAINT fk_is_pole
FOREIGN KEY (iv_pole_id) REFERENCES poles(pole_id);

ALTER TABLE rooms
ADD CONSTRAINT uq_rooms_ward_roomno UNIQUE (ward_id, room_number);