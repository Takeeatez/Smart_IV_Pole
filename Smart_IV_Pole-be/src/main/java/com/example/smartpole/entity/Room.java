package com.example.smartpole.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Table(name = "rooms")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Room {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "patient_id")
    private Integer patientId;

    @Column(name = "room_id", length = 50)
    private String roomId;

    @Column(name = "ward_id", nullable = false, length = 20)
    private String wardId;

    @Column(name = "room_number", nullable = false, length = 10)
    private String roomNumber;

    @Column(name = "room_person", nullable = false)
    private Integer roomPerson;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ward_id", insertable = false, updatable = false)
    private Ward ward;
}