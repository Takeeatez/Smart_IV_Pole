package com.example.smartpole.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Table(name = "nurses")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Nurse {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "nurse_id")
    private Integer nurseId;

    @Column(name = "name", nullable = false, length = 50)
    private String name;

    @Column(name = "employee_id", nullable = false, unique = true, length = 50)
    private String employeeId;

    @Column(name = "password", nullable = false, length = 255)
    private String password;

    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false)
    private NurseRole role;

    public enum NurseRole {
        Root, Admin
    }
}