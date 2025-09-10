CREATE TABLE `수액 정보` (
	`drip_id`	AUTO_INCREMENT	NOT NULL	COMMENT '수액 고유 식별 번호',
	`drip_name`	VARCHAR	NOT NULL	COMMENT '수액 이름, UNIQUE'
);

CREATE TABLE `병동 정보` (
	`ward_id`	VARCHAR	NOT NULL	DEFAULT W01, 33병동	COMMENT '병동 고유 ID. 중복허용 X',
	`ward_name`	VARCHAR	NOT NULL
);

CREATE TABLE `병실 정보` (
	`room_id`	VARCHAR(255)	NOT NULL,
	`ward_id`	VARCHAR	NOT NULL	DEFAULT W01, 33병동	COMMENT '병동 고유 ID. 중복허용 X',
	`patient_id`	AUTO_INCREMENT	NOT NULL	COMMENT '환자 고유 식별 번호',
	`room_number`	VARCHAR	NOT NULL	DEFAULT 301, 601 등	COMMENT '한 병동당 같은 번호 X',
	`room_person`	INT	NOT NULL	COMMENT '최대 가용 인원'
);

CREATE TABLE `간호사정보` (
	`nurse_id`	AUTO_INCREMENT	NOT NULL	COMMENT '간호사 고유 식별 번호',
	`name`	VARCHAR	NOT NULL,
	`employee_id`	VARCHAR,  UNIQUE	NOT NULL	COMMENT '직원 ID(로그인 ID)',
	`password`	VARCHAR	NOT NULL	COMMENT '암호화 필요',
	`role`	ENUM	NOT NULL	COMMENT 'Root(수간호사) 혹은 Admin(일반간호사)'
);

CREATE TABLE `alert_logs` (
	`alert_id`	INT	NULL	COMMENT '알림 ID',
	`session_id`	INT	NOT NULL	COMMENT '투여 세션 ID',
	`alert_type`	ENUM('low_volume', 'flow_stopped', 'pole_fall', 'battery_low', 'system_error')	NOT NULL	COMMENT '알림 유형',
	`severity`	ENUM('info', 'warning', 'critical')	NOT NULL	COMMENT '심각도',
	`message`	TEXT	NOT NULL	COMMENT '알림 메시지',
	`acknowledged`	BOOLEAN	NULL	DEFAULT FALSE	COMMENT '확인 여부',
	`acknowledged_by`	VARCHAR(20)	NULL	COMMENT '확인한 간호사 ID',
	`acknowledged_at`	DATETIME	NULL	COMMENT '확인 시간',
	`created_at`	TIMESTAMP	NULL
);

CREATE TABLE `환자 정보` (
	`patient_id`	AUTO_INCREMENT	NOT NULL	COMMENT '환자 고유 식별 번호',
	`name`	VARCHAR	NOT NULL	COMMENT '환자 이름',
	`phone`	VARCHAR	NOT NULL	DEFAULT 010-1234-4567	COMMENT '환자 개인 번호',
	`birth_date`	DATE	NOT NULL	COMMENT '생년월일(로그인 비밀번호)',
	`Field`	INT	NOT NULL,
	`Field2`	ENUM('male', 'female')	NOT NULL,
	`Field3`	INT	NOT NULL,
	`Field4`	VARCHAR(255)	NULL,
	`created_at`	VARCHAR(255)	NULL
);

CREATE TABLE `폴대정보` (
	`pole_id`	VARCHAR(20)	NULL	COMMENT 'IV 폴대 장치 ID',
	`ward_id`	VARCHAR(10)	NOT NULL	COMMENT '소속 병동 ID',
	`status`	ENUM('active', 'maintenance', 'inactive')	NULL	DEFAULT 'active'	COMMENT '장치 상태',
	`battery_level`	INT	NULL	DEFAULT 100	COMMENT '배터리 잔량(%)',
	`last_maintenance`	DATE	NULL	COMMENT '마지막 정비일',
	`created_at`	TIMESTAMP	NULL,
	`updated_at`	VARCHAR(255)	NULL
);

CREATE TABLE `현재 수액 투여 정보` (
	`session_id`	AUTO_INCREMENT	NOT NULL	COMMENT '외부 시스템 연동/기기 세션ID 등',
	`patient_id`	AUTO_INCREMENT	NOT NULL	COMMENT '수액을 맞는 환자 ID',
	`drip_id`	AUTO_INCREMENT	NOT NULL	COMMENT '투여 중인 수액 ID',
	`start_time`	TIMESTAMP	NOT NULL	COMMENT '투여 시작 시간',
	`end_time`	TIMESTAMP	NULL	COMMENT '투여중이면 null',
	`end_exp_time`	TIMESTAMP	NULL	COMMENT '기본값이 NULL, ESP에서 받아온다.',
	`remaining_volume`	INT	NOT NULL	COMMENT '현재 남은 수액량(mL)',
	`flow_rate`	DECIMAL	NOT NULL	COMMENT '현재 투여 속도',
	`iv_pold_id`	VARCHAR	NOT NULL	COMMENT '연결된 스마트 폴대 ID',
	`status`	ENUM('ACTIVE', 'PAUSED','ENDED')	NOT NULL	DEFAULT ACTIVE	COMMENT 'active, paused, low_volume, complete 등 현재 상태',
	`total_volume_ml`	INT	NOT NULL
);

CREATE TABLE `drip_monitoring` (
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
);

CREATE TABLE `수액 투여 이력` (
	`log_id`	AUTO_INCREMENT	NOT NULL,
	`drip_id`	AUTO_INCREMENT	NOT NULL	COMMENT '수액 종류 ID',
	`patient_id`	AUTO_INCREMENT	NOT NULL	COMMENT '환자 고유 식별 번호',
	`session_id`	AUTO_INCREMENT	NOT NULL	COMMENT '외부 시스템 연동/기기 세션ID 등'
);

ALTER TABLE `수액 정보` ADD CONSTRAINT `PK_수액 정보` PRIMARY KEY (
	`drip_id`
);

ALTER TABLE `병동 정보` ADD CONSTRAINT `PK_병동 정보` PRIMARY KEY (
	`ward_id`
);

ALTER TABLE `병실 정보` ADD CONSTRAINT `PK_병실 정보` PRIMARY KEY (
	`room_id`,
	`ward_id`
);

ALTER TABLE `간호사정보` ADD CONSTRAINT `PK_간호사정보` PRIMARY KEY (
	`nurse_id`
);

ALTER TABLE `환자 정보` ADD CONSTRAINT `PK_환자 정보` PRIMARY KEY (
	`patient_id`
);

ALTER TABLE `현재 수액 투여 정보` ADD CONSTRAINT `PK_현재 수액 투여 정보` PRIMARY KEY (
	`session_id`
);

ALTER TABLE `수액 투여 이력` ADD CONSTRAINT `PK_수액 투여 이력` PRIMARY KEY (
	`log_id`
);

ALTER TABLE `병실 정보` ADD CONSTRAINT `FK_병동 정보_TO_병실 정보_1` FOREIGN KEY (
	`ward_id`
)
REFERENCES `병동 정보` (
	`ward_id`
);

