import mqtt from 'mqtt';
import { v4 as uuidv4 } from 'uuid';
import chalk from 'chalk';

// Simulator configuration
const CONFIG = {
    brokerUrl: process.env.MQTT_BROKER || 'mqtt://localhost:1883',
    simulators: [
        { poleId: 'POLE-301A-1', bed: '301A-1', initialWeight: 500 },
        { poleId: 'POLE-301A-2', bed: '301A-2', initialWeight: 450 },
        { poleId: 'POLE-301A-3', bed: '301A-3', initialWeight: 480 },
        { poleId: 'POLE-301A-4', bed: '301A-4', initialWeight: 520 },
        { poleId: 'POLE-301A-5', bed: '301A-5', initialWeight: 490 },
        { poleId: 'POLE-301A-6', bed: '301A-6', initialWeight: 470 },
    ]
};

class ESP32Simulator {
    constructor(config) {
        this.poleId = config.poleId;
        this.bed = config.bed;
        this.weight = config.initialWeight;
        this.initialWeight = config.initialWeight;
        this.flowRate = 2.5 + (Math.random() - 0.5) * 0.5; // 2.0-3.0 mL/min
        this.battery = 85 + Math.floor(Math.random() * 15);
        this.isOnline = true;
        this.sessionId = `SES-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        this.patientId = `PAT-${Math.floor(Math.random() * 10000)}`;
        this.startTime = new Date();
        this.targetDuration = 240; // 4 hours in minutes

        // Connect to MQTT broker
        this.client = mqtt.connect(CONFIG.brokerUrl, {
            clientId: this.poleId,
            clean: false,
            reconnectPeriod: 1000,
        });

        this.client.on('connect', () => {
            console.log(chalk.green(`✓ ${this.poleId} connected to MQTT broker`));
            this.startSimulation();
        });

        this.client.on('error', (err) => {
            console.error(chalk.red(`✗ ${this.poleId} MQTT error:`), err);
        });
    }

    startSimulation() {
        // Send telemetry every second
        this.telemetryInterval = setInterval(() => {
            this.publishTelemetry();
        }, 1000);

        // Send status every 30 seconds
        this.statusInterval = setInterval(() => {
            this.publishStatus();
        }, 30000);

        // Simulate nurse call randomly (low probability)
        this.nurseCallInterval = setInterval(() => {
            if (Math.random() < 0.001) { // 0.1% chance per second
                this.publishNurseCall();
            }
        }, 1000);

        // Initial status publish
        this.publishStatus();
    }

    publishTelemetry() {
        // Simulate weight decrease over time (fluid consumption)
        if (this.weight > 10) {
            this.weight -= this.flowRate / 60; // Convert mL/min to mL/sec
        }

        // Add some noise to flow rate
        const currentFlowRate = this.flowRate + (Math.random() - 0.5) * 0.2;

        // Calculate remaining percentage
        const remaining = (this.weight / this.initialWeight) * 100;

        // Calculate GTT (drops per minute)
        const dripRate = Math.floor(currentFlowRate * 20); // 20 drops per mL for macro drip

        // Estimate empty time
        const remainingMinutes = Math.floor(this.weight / this.flowRate);
        const estimatedEmpty = new Date(Date.now() + remainingMinutes * 60000);

        const telemetry = {
            poleId: this.poleId,
            timestamp: new Date().toISOString(),
            telemetry: {
                weight: this.weight,
                flowRate: currentFlowRate,
                remaining: remaining,
                dripRate: dripRate,
                estimatedEmpty: estimatedEmpty.toISOString()
            },
            session: {
                sessionId: this.sessionId,
                patientId: this.patientId,
                drugType: 'NS-500',
                startTime: this.startTime.toISOString(),
                targetDuration: this.targetDuration
            }
        };

        const topic = `hospital/pole/${this.poleId}/telemetry`;
        this.client.publish(topic, JSON.stringify(telemetry), { qos: 1 });

        // Log important changes
        if (remaining < 10 && remaining > 9.9) {
            console.log(chalk.yellow(`⚠ ${this.bed}: Low fluid warning (${remaining.toFixed(1)}%)`));
            this.publishAlert('WARNING', 'LOW_FLUID', `잔여량 ${remaining.toFixed(1)}%`);
        } else if (remaining < 5 && remaining > 4.9) {
            console.log(chalk.red(`🚨 ${this.bed}: Critical low fluid (${remaining.toFixed(1)}%)`));
            this.publishAlert('CRITICAL', 'LOW_FLUID', `긴급 - 잔여량 ${remaining.toFixed(1)}%`);
        }

        // Simulate flow abnormality randomly
        if (Math.random() < 0.0005) { // 0.05% chance
            const abnormalFlow = currentFlowRate * (0.5 + Math.random());
            console.log(chalk.magenta(`⚠ ${this.bed}: Flow abnormality detected`));
            this.publishAlert('WARNING', 'FLOW_ABNORMAL',
                `유속 이상: ${abnormalFlow.toFixed(1)} mL/min`);
        }
    }

    publishStatus() {
        // Simulate battery drain
        this.battery = Math.max(10, this.battery - Math.random() * 0.5);

        const status = {
            poleId: this.poleId,
            timestamp: new Date().toISOString(),
            status: {
                online: this.isOnline,
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

        console.log(chalk.blue(`📊 ${this.bed}: Status update (Battery: ${Math.floor(this.battery)}%)`));

        // Check battery level
        if (this.battery < 20 && this.battery > 19.5) {
            this.publishAlert('WARNING', 'BATTERY_LOW', `배터리 부족: ${Math.floor(this.battery)}%`);
        }
    }

    publishAlert(severity, type, message) {
        const alert = {
            alertId: `ALERT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            poleId: this.poleId,
            severity: severity,
            type: type,
            message: message,
            timestamp: new Date().toISOString(),
            data: {
                bed: this.bed,
                remaining: (this.weight / this.initialWeight) * 100,
                flowRate: this.flowRate,
                battery: this.battery
            }
        };

        const topic = `hospital/alert/${severity.toLowerCase()}/${this.poleId}`;
        this.client.publish(topic, JSON.stringify(alert), { qos: severity === 'CRITICAL' ? 2 : 1 });
    }

    publishNurseCall() {
        console.log(chalk.red(`🔔 ${this.bed}: NURSE CALL BUTTON PRESSED!`));

        const topic = `hospital/nurse/call/${this.poleId}`;
        const message = {
            poleId: this.poleId,
            bed: this.bed,
            timestamp: new Date().toISOString(),
            type: 'EMERGENCY_CALL'
        };

        this.client.publish(topic, JSON.stringify(message), { qos: 2 });

        // Also publish as critical alert
        this.publishAlert('CRITICAL', 'EMERGENCY_CALL', '환자 호출 버튼 눌림');
    }

    stop() {
        clearInterval(this.telemetryInterval);
        clearInterval(this.statusInterval);
        clearInterval(this.nurseCallInterval);
        this.client.end();
    }
}

// Start simulators
console.log(chalk.cyan('🚀 Starting Smart IV Pole ESP32 Simulators...'));
console.log(chalk.cyan(`📡 Connecting to MQTT Broker: ${CONFIG.brokerUrl}`));
console.log(chalk.cyan('━'.repeat(50)));

const simulators = CONFIG.simulators.map(config => new ESP32Simulator(config));

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log(chalk.yellow('\n⏹ Stopping simulators...'));
    simulators.forEach(sim => sim.stop());
    process.exit(0);
});

console.log(chalk.green('\n✨ Simulators are running. Press Ctrl+C to stop.\n'));