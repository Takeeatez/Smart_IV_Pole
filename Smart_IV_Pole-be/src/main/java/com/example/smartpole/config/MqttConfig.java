package com.example.smartpole.config;

import org.eclipse.paho.client.mqttv3.MqttConnectOptions;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.integration.annotation.ServiceActivator;
import org.springframework.integration.channel.DirectChannel;
import org.springframework.integration.mqtt.core.DefaultMqttPahoClientFactory;
import org.springframework.integration.mqtt.core.MqttPahoClientFactory;
import org.springframework.integration.mqtt.inbound.MqttPahoMessageDrivenChannelAdapter;
import org.springframework.integration.mqtt.outbound.MqttPahoMessageHandler;
import org.springframework.integration.mqtt.support.DefaultPahoMessageConverter;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.MessageHandler;

@Configuration
public class MqttConfig {

    @Value("${mqtt.broker.url:tcp://localhost:1883}")
    private String brokerUrl;

    @Value("${mqtt.client.id:smart-iv-backend}")
    private String clientId;

    @Value("${mqtt.username:}")
    private String username;

    @Value("${mqtt.password:}")
    private String password;

    @Value("${mqtt.topics.telemetry:hospital/pole/+/telemetry}")
    private String telemetryTopic;

    @Value("${mqtt.topics.alerts:hospital/alert/#}")
    private String alertsTopic;

    @Value("${mqtt.topics.status:hospital/pole/+/status}")
    private String statusTopic;

    @Value("${mqtt.topics.nurse.call:hospital/nurse/call/+}")
    private String nurseCallTopic;

    @Bean
    public MqttPahoClientFactory mqttClientFactory() {
        DefaultMqttPahoClientFactory factory = new DefaultMqttPahoClientFactory();
        MqttConnectOptions options = new MqttConnectOptions();
        options.setServerURIs(new String[] { brokerUrl });
        options.setCleanSession(false);
        options.setAutomaticReconnect(true);
        options.setConnectionTimeout(10);
        options.setKeepAliveInterval(60);
        options.setMaxInflight(100);

        if (!username.isEmpty()) {
            options.setUserName(username);
        }
        if (!password.isEmpty()) {
            options.setPassword(password.toCharArray());
        }

        factory.setConnectionOptions(options);
        return factory;
    }

    // Inbound channels for receiving messages
    @Bean
    public MessageChannel mqttInputChannel() {
        return new DirectChannel();
    }

    @Bean
    public MessageChannel mqttTelemetryChannel() {
        return new DirectChannel();
    }

    @Bean
    public MessageChannel mqttAlertChannel() {
        return new DirectChannel();
    }

    @Bean
    public MessageChannel mqttStatusChannel() {
        return new DirectChannel();
    }

    @Bean
    public MessageChannel mqttNurseCallChannel() {
        return new DirectChannel();
    }

    // Outbound channel for sending messages
    @Bean
    public MessageChannel mqttOutboundChannel() {
        return new DirectChannel();
    }

    // Telemetry adapter
    @Bean
    public MqttPahoMessageDrivenChannelAdapter telemetryAdapter() {
        MqttPahoMessageDrivenChannelAdapter adapter =
                new MqttPahoMessageDrivenChannelAdapter(
                        clientId + "-telemetry",
                        mqttClientFactory(),
                        telemetryTopic);
        adapter.setCompletionTimeout(5000);
        adapter.setConverter(new DefaultPahoMessageConverter());
        adapter.setQos(1);
        adapter.setOutputChannel(mqttTelemetryChannel());
        return adapter;
    }

    // Alert adapter
    @Bean
    public MqttPahoMessageDrivenChannelAdapter alertAdapter() {
        MqttPahoMessageDrivenChannelAdapter adapter =
                new MqttPahoMessageDrivenChannelAdapter(
                        clientId + "-alert",
                        mqttClientFactory(),
                        alertsTopic);
        adapter.setCompletionTimeout(5000);
        adapter.setConverter(new DefaultPahoMessageConverter());
        adapter.setQos(2); // Exactly once for critical alerts
        adapter.setOutputChannel(mqttAlertChannel());
        return adapter;
    }

    // Status adapter
    @Bean
    public MqttPahoMessageDrivenChannelAdapter statusAdapter() {
        MqttPahoMessageDrivenChannelAdapter adapter =
                new MqttPahoMessageDrivenChannelAdapter(
                        clientId + "-status",
                        mqttClientFactory(),
                        statusTopic);
        adapter.setCompletionTimeout(5000);
        adapter.setConverter(new DefaultPahoMessageConverter());
        adapter.setQos(0);
        adapter.setOutputChannel(mqttStatusChannel());
        return adapter;
    }

    // Nurse call adapter
    @Bean
    public MqttPahoMessageDrivenChannelAdapter nurseCallAdapter() {
        MqttPahoMessageDrivenChannelAdapter adapter =
                new MqttPahoMessageDrivenChannelAdapter(
                        clientId + "-nurse",
                        mqttClientFactory(),
                        nurseCallTopic);
        adapter.setCompletionTimeout(5000);
        adapter.setConverter(new DefaultPahoMessageConverter());
        adapter.setQos(1);
        adapter.setOutputChannel(mqttNurseCallChannel());
        return adapter;
    }

    // Outbound adapter for publishing messages
    @Bean
    @ServiceActivator(inputChannel = "mqttOutboundChannel")
    public MessageHandler mqttOutbound() {
        MqttPahoMessageHandler messageHandler =
                new MqttPahoMessageHandler(clientId + "-outbound", mqttClientFactory());
        messageHandler.setAsync(true);
        messageHandler.setDefaultTopic("hospital/command/default");
        messageHandler.setDefaultQos(1);
        return messageHandler;
    }
}