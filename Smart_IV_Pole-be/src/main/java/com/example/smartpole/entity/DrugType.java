package com.example.smartpole.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Table(name = "drip_types")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class DrugType {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "drip_id")
    private Integer dripId;

    @Column(name = "drip_name", nullable = false, unique = true, length = 100)
    private String dripName;
}