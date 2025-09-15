package com.example.smartpole.config;

import com.example.smartpole.entity.*;
import com.example.smartpole.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataLoader implements CommandLineRunner {

    private final PatientRepository patientRepository;
    private final DrugTypeRepository drugTypeRepository;
    private final PoleRepository poleRepository;
    private final InfusionSessionRepository infusionSessionRepository;
    private final AlertLogRepository alertLogRepository;

    @Override
    public void run(String... args) throws Exception {
        // Sample data loading disabled - start with clean database
        log.info("DataLoader disabled - starting with empty database");
    }

    private void loadSampleData() {
        // Sample data loading disabled - starting with empty database
        log.info("Sample data loading method called but disabled");
    }
}