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

    @Column(name = "phone", length = 20)
    private String phone;

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

    @Column(name = "room_id", length = 10)
    private String roomId; // 병실 번호 (예: 301A)

    @Column(name = "bed_number", length = 5)
    private String bedNumber; // 침대 번호 (예: 1, 2, 3, 4, 5, 6)

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public enum Gender {
        male, female
    }
}