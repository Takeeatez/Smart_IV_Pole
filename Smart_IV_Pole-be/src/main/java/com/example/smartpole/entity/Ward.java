package com.example.smartpole.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Table(name = "wards")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Ward {

    @Id
    @Column(name = "ward_id", length = 20)
    private String wardId;

    @Column(name = "ward_name", nullable = false, length = 50)
    private String wardName;
}