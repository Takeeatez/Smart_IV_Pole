import mqtt from 'mqtt';
import chalk from 'chalk';
import readline from 'readline';

// ESP8266 시뮬레이터 - 실제 의료 워크플로우 구현
class ESP8266Simulator {
    constructor() {
        this.poleId = 'POLE-301A-1';  // 1대만 운영
        this.isConnected = false;
        this.sessionActive = false;

        // 세션 정보 (간호사가 설정)
        this.sessionInfo = null;

        // 하드웨어 상태
        this.currentWeight = 0;  // 현재 무게 (g)
        this.previousWeight = 0;
        this.battery = 95;
        this.isStable = false;
        this.stabilityBuffer = [];  // 안정성 판단용 버퍼

        // 시뮬레이션 상태
        this.movementNoise = 0;  // 움직임 노이즈
        this.dripInterval = null;
        this.telemetryInterval = null;
        this.statusInterval = null;

        // MQTT 클라이언트
        this.client = null;

        // CLI 설정
        this.setupCLI();
    }

    setupCLI() {
        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        console.log(chalk.cyan('━'.repeat(60)));
        console.log(chalk.cyan('ESP8266 Smart IV Pole Simulator - Medical Workflow'));
        console.log(chalk.cyan('━'.repeat(60)));
        this.showMenu();
    }

    showMenu() {
        console.log('\n' + chalk.yellow('Commands:'));
        console.log('  1. Connect to MQTT Broker');
        console.log('  2. Start New Session (간호사 설정)');
        console.log('  3. Simulate Movement (움직임 시뮬레이션)');
        console.log('  4. Emergency Call (응급 호출)');
        console.log('  5. Show Status');
        console.log('  6. Stop Session');
        console.log('  0. Exit');
        console.log(chalk.gray('━'.repeat(60)));

        this.rl.question('\nSelect option: ', (answer) => {
            this.handleCommand(answer);
        });
    }

    async handleCommand(command) {
        switch(command) {
            case '1':
                await this.connectMQTT();
                break;
            case '2':
                await this.startNewSession();
                break;
            case '3':
                this.simulateMovement();
                break;
            case '4':
                this.sendEmergencyCall();
                break;
            case '5':
                this.showStatus();
                break;
            case '6':
                this.stopSession();
                break;
            case '0':
                this.shutdown();
                break;
            default:
                console.log(chalk.red('Invalid option'));
        }

        if (command !== '0') {
            setTimeout(() => this.showMenu(), 1000);
        }
    }

    connectMQTT() {
        return new Promise((resolve) => {
            const brokerUrl = process.env.MQTT_BROKER || 'mqtt://localhost:1883';

            this.client = mqtt.connect(brokerUrl, {
                clientId: this.poleId,
                clean: false,
                reconnectPeriod: 1000,
            });

            this.client.on('connect', () => {
                this.isConnected = true;
                console.log(chalk.green(`✓ Connected to MQTT Broker: ${brokerUrl}`));
                resolve();
            });

            this.client.on('error', (err) => {
                console.error(chalk.red(`✗ MQTT Error: ${err.message}`));
                resolve();
            });
        });
    }

    async startNewSession() {
        if (!this.isConnected) {
            console.log(chalk.red('✗ Please connect to MQTT first'));
            return;
        }

        console.log(chalk.cyan('\n=== 새 세션 시작 (간호사 입력) ==='));

        const sessionInfo = await this.getNurseInput();
        this.sessionInfo = sessionInfo;
        this.currentWeight = sessionInfo.initialWeight;
        this.previousWeight = sessionInfo.initialWeight;
        this.sessionActive = true;

        console.log(chalk.green('\n✓ 세션 시작됨'));
        console.log(chalk.gray(`  약품: ${sessionInfo.drugType}`));
        console.log(chalk.gray(`  용량: ${sessionInfo.initialVolume}mL`));
        console.log(chalk.gray(`  처방 시간: ${sessionInfo.prescribedDuration}분`));
        console.log(chalk.gray(`  GTT: ${sessionInfo.prescribedDripRate} 방울/분`));

        // 시뮬레이션 시작
        this.startSimulation();
    }

    getNurseInput() {
        return new Promise((resolve) => {
            const session = {
                sessionId: `SES-${Date.now()}`,
                patientId: '',
                drugType: '',
                initialVolume: 0,
                initialWeight: 0,
                prescribedDuration: 0,
                prescribedDripRate: 0,
                gttFactor: 20,
                startTime: new Date().toISOString(),
                prescribedEndTime: '',
                nurseId: 'NURSE-001'
            };

            this.rl.question('환자 ID (예: PAT-12345): ', (patientId) => {
                session.patientId = patientId || 'PAT-12345';

                this.rl.question('약품 종류 (예: Normal Saline): ', (drugType) => {
                    session.drugType = drugType || 'Normal Saline 500mL';

                    this.rl.question('용량 (mL, 예: 500): ', (volume) => {
                        session.initialVolume = parseFloat(volume) || 500;
                        session.initialWeight = session.initialVolume;  // 1mL = 1g

                        this.rl.question('처방 투여 시간 (분, 예: 240): ', (duration) => {
                            session.prescribedDuration = parseInt(duration) || 240;
                            session.prescribedEndTime = new Date(
                                Date.now() + session.prescribedDuration * 60000
                            ).toISOString();

                            // GTT 계산
                            session.prescribedDripRate = Math.round(
                                (session.initialVolume * session.gttFactor) / session.prescribedDuration
                            );

                            resolve(session);
                        });
                    });
                });
            });
        });
    }

    startSimulation() {
        // 수액 소모 시뮬레이션 (실제 유속 기반)
        const flowRateMLPerMin = this.sessionInfo.prescribedDripRate / this.sessionInfo.gttFactor;
        const flowRateGPerSec = flowRateMLPerMin / 60;  // g/sec

        this.dripInterval = setInterval(() => {
            if (this.currentWeight > 50) {  // 빈 팩 무게 50g
                // 움직임이 없을 때만 정상적으로 감소
                if (this.movementNoise < 5) {
                    this.currentWeight -= flowRateGPerSec;

                    // 약간의 자연스러운 변화 추가
                    this.currentWeight += (Math.random() - 0.5) * 0.1;
                }
            }
        }, 1000);

        // 텔레메트리 전송 (1초마다)
        this.telemetryInterval = setInterval(() => {
            this.publishTelemetry();
        }, 1000);

        // 상태 전송 (30초마다)
        this.statusInterval = setInterval(() => {
            this.publishStatus();
        }, 30000);

        // 초기 상태 전송
        this.publishStatus();
    }

    publishTelemetry() {
        if (!this.sessionActive || !this.client) return;

        // 안정성 판단
        this.updateStability();

        // 남은 용량 계산
        const remainingVolume = this.currentWeight - 50;  // 빈 팩 무게 제외
        const remainingPercentage = (remainingVolume / this.sessionInfo.initialVolume) * 100;

        // 계산된 종료 시간
        const flowRate = this.sessionInfo.prescribedDripRate / this.sessionInfo.gttFactor;
        const minutesRemaining = remainingVolume / flowRate;
        const calculatedEndTime = new Date(Date.now() + minutesRemaining * 60000).toISOString();

        const telemetry = {
            poleId: this.poleId,
            timestamp: new Date().toISOString(),
            telemetry: {
                weight: this.currentWeight + this.movementNoise,
                previousWeight: this.previousWeight,
                weightChangeRate: (this.previousWeight - this.currentWeight) * 60,  // g/min
                isStable: this.isStable,
                stability: this.isStable ? 90 + Math.random() * 10 : Math.random() * 50,
                flowRate: flowRate,
                remaining: Math.max(0, remainingPercentage),
                dripRate: this.sessionInfo.prescribedDripRate,
                calculatedEndTime: calculatedEndTime
            },
            session: this.sessionInfo
        };

        const topic = `hospital/pole/${this.poleId}/telemetry`;
        this.client.publish(topic, JSON.stringify(telemetry), { qos: 1 });

        // 상태 로깅
        if (this.isStable) {
            console.log(chalk.blue(
                `📊 [${new Date().toLocaleTimeString()}] Weight: ${this.currentWeight.toFixed(1)}g | ` +
                `Remaining: ${remainingPercentage.toFixed(1)}% | Stable ✓`
            ));
        } else {
            console.log(chalk.yellow(
                `📊 [${new Date().toLocaleTimeString()}] Weight: ${this.currentWeight.toFixed(1)}g | ` +
                `Movement detected ⚠️`
            ));
        }

        // 알림 체크
        if (remainingPercentage < 10 && remainingPercentage > 9.8) {
            this.publishAlert('WARNING', 'LOW_FLUID', `잔여량 ${remainingPercentage.toFixed(1)}%`);
        } else if (remainingPercentage < 5 && remainingPercentage > 4.8) {
            this.publishAlert('CRITICAL', 'LOW_FLUID', `긴급 - 잔여량 ${remainingPercentage.toFixed(1)}%`);
        }

        this.previousWeight = this.currentWeight;
    }

    updateStability() {
        // 최근 5개 측정값으로 안정성 판단
        this.stabilityBuffer.push(this.currentWeight + this.movementNoise);
        if (this.stabilityBuffer.length > 5) {
            this.stabilityBuffer.shift();
        }

        if (this.stabilityBuffer.length >= 3) {
            const max = Math.max(...this.stabilityBuffer);
            const min = Math.min(...this.stabilityBuffer);
            const variance = max - min;

            // 2g 이내 변화는 안정 상태
            this.isStable = variance < 2.0 && this.movementNoise < 2;
        }

        // 움직임 노이즈 자연 감소
        if (this.movementNoise > 0) {
            this.movementNoise *= 0.9;
            if (this.movementNoise < 0.1) {
                this.movementNoise = 0;
            }
        }
    }

    simulateMovement() {
        if (!this.sessionActive) {
            console.log(chalk.red('✗ No active session'));
            return;
        }

        // 10-20g 범위의 움직임 노이즈 추가
        this.movementNoise = 10 + Math.random() * 10;
        this.isStable = false;
        this.stabilityBuffer = [];  // 버퍼 초기화

        console.log(chalk.yellow(`⚠️ Movement simulated! Noise: ±${this.movementNoise.toFixed(1)}g`));
        console.log(chalk.gray('   (Stability will recover in ~5 seconds)'));
    }

    publishStatus() {
        if (!this.client) return;

        const status = {
            poleId: this.poleId,
            timestamp: new Date().toISOString(),
            status: {
                online: true,
                battery: Math.floor(this.battery),
                charging: false,
                hardware: {
                    loadCell: 'OK',
                    display: 'OK',
                    wifi: 'CONNECTED',
                    signalStrength: -65 + Math.floor(Math.random() * 20)
                }
            }
        };

        const topic = `hospital/pole/${this.poleId}/status`;
        this.client.publish(topic, JSON.stringify(status), { qos: 0 });

        // 배터리 감소 시뮬레이션
        this.battery = Math.max(10, this.battery - 0.1);
    }

    publishAlert(severity, type, message) {
        if (!this.client) return;

        const alert = {
            alertId: `ALERT-${Date.now()}`,
            poleId: this.poleId,
            severity: severity,
            type: type,
            message: message,
            timestamp: new Date().toISOString(),
            data: {
                sessionId: this.sessionInfo?.sessionId,
                patientId: this.sessionInfo?.patientId
            }
        };

        const topic = `hospital/alert/${severity.toLowerCase()}/${this.poleId}`;
        this.client.publish(topic, JSON.stringify(alert), { qos: severity === 'CRITICAL' ? 2 : 1 });

        console.log(chalk.red(`🚨 Alert: ${message}`));
    }

    sendEmergencyCall() {
        if (!this.isConnected) {
            console.log(chalk.red('✗ Not connected to MQTT'));
            return;
        }

        const topic = `hospital/nurse/call/${this.poleId}`;
        const message = {
            poleId: this.poleId,
            timestamp: new Date().toISOString(),
            type: 'EMERGENCY_CALL'
        };

        this.client.publish(topic, JSON.stringify(message), { qos: 2 });
        this.publishAlert('CRITICAL', 'EMERGENCY_CALL', '환자 호출 버튼 눌림');

        console.log(chalk.red('🔔 EMERGENCY CALL SENT!'));
    }

    showStatus() {
        console.log(chalk.cyan('\n=== Current Status ==='));
        console.log(`Connection: ${this.isConnected ? chalk.green('Connected') : chalk.red('Disconnected')}`);
        console.log(`Session: ${this.sessionActive ? chalk.green('Active') : chalk.gray('Inactive')}`);

        if (this.sessionActive && this.sessionInfo) {
            const remainingVolume = this.currentWeight - 50;
            const remainingPercentage = (remainingVolume / this.sessionInfo.initialVolume) * 100;

            console.log(`\n${chalk.yellow('Session Info:')}`);
            console.log(`  Patient: ${this.sessionInfo.patientId}`);
            console.log(`  Drug: ${this.sessionInfo.drugType}`);
            console.log(`  Current Weight: ${this.currentWeight.toFixed(1)}g`);
            console.log(`  Remaining: ${remainingPercentage.toFixed(1)}%`);
            console.log(`  Stable: ${this.isStable ? chalk.green('Yes') : chalk.yellow('No')}`);
            console.log(`  Battery: ${this.battery.toFixed(1)}%`);
        }
    }

    stopSession() {
        if (!this.sessionActive) {
            console.log(chalk.red('✗ No active session'));
            return;
        }

        this.sessionActive = false;
        clearInterval(this.dripInterval);
        clearInterval(this.telemetryInterval);
        clearInterval(this.statusInterval);

        console.log(chalk.green('✓ Session stopped'));
    }

    shutdown() {
        console.log(chalk.yellow('\n⏹ Shutting down...'));

        this.stopSession();

        if (this.client) {
            this.client.end();
        }

        this.rl.close();
        process.exit(0);
    }
}

// 시뮬레이터 시작
const simulator = new ESP8266Simulator();

// Graceful shutdown
process.on('SIGINT', () => {
    simulator.shutdown();
});