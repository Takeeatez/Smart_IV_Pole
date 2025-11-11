package com.example.smartpole;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class SmartPoleApplication {

    public static void main(String[] args) {
        SpringApplication.run(SmartPoleApplication.class, args);
    }

}
