package com.example.smartpole.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "patients")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Patient {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "patient_id")
    private Integer patientId;

    @Column(name = "name", nullable = false, length = 50)
    private String name;

    @Column(name = "phone", nullable = false, length = 20)
    private String phone = "010-1234-4567"; // 기본값

    @Column(name = "birth_date", nullable = false)
    private LocalDate birthDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "gender", nullable = false)
    private Gender gender;

    @Column(name = "weight_kg")
    private Integer weightKg; // 몸무게 (kg)

    @Column(name = "height_cm")
    private Integer heightCm; // 키 (cm)



    @Column(name = "address")
    private String address;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public enum Gender {
        male, female
    }
}