package com.example.smartpole.repository;

import com.example.smartpole.entity.Prescription;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface PrescriptionRepository extends JpaRepository<Prescription, Integer> {

    // Find prescriptions by patient
    List<Prescription> findByPatientId(Integer patientId);

    // Delete all prescriptions for a patient (cascade deletion)
    void deleteByPatientId(Integer patientId);

    // Find prescriptions by status
    List<Prescription> findByStatus(Prescription.PrescriptionStatus status);

    // Find active prescriptions for a patient
    @Query("SELECT p FROM Prescription p WHERE p.patientId = :patientId AND p.status = 'ACTIVE'")
    List<Prescription> findActiveByPatientId(@Param("patientId") Integer patientId);

    // Find prescribed (not yet started) prescriptions
    @Query("SELECT p FROM Prescription p WHERE p.status = 'PRESCRIBED' ORDER BY p.prescribedAt ASC")
    List<Prescription> findPendingPrescriptions();

    // Find prescriptions by drug type
    List<Prescription> findByDrugTypeId(Integer drugTypeId);

    // Find prescriptions by prescriber
    List<Prescription> findByPrescribedBy(String prescribedBy);

    // Find prescriptions that can be started (status = PRESCRIBED)
    @Query("SELECT p FROM Prescription p WHERE p.status = 'PRESCRIBED' AND p.patientId = :patientId")
    List<Prescription> findStartablePrescriptions(@Param("patientId") Integer patientId);

    // Find prescriptions needing attention (active but overdue)
    @Query("SELECT p FROM Prescription p WHERE p.status = 'ACTIVE' AND " +
           "TIMESTAMPDIFF(HOUR, p.startedAt, NOW()) > p.durationHours")
    List<Prescription> findOverduePrescriptions();

    // Count active prescriptions by patient
    @Query("SELECT COUNT(p) FROM Prescription p WHERE p.patientId = :patientId AND p.status = 'ACTIVE'")
    Long countActiveByPatientId(@Param("patientId") Integer patientId);

    // Find recent prescriptions (last 24 hours)
    @Query("SELECT p FROM Prescription p WHERE p.prescribedAt >= :since " +
           "ORDER BY p.prescribedAt DESC")
    List<Prescription> findRecentPrescriptions(@Param("since") LocalDateTime since);

    // Find latest prescription by patient (for mobile app)
    @Query("SELECT p FROM Prescription p WHERE p.patientId = :patientId " +
           "ORDER BY p.prescribedAt DESC LIMIT 1")
    Optional<Prescription> findLatestByPatientId(@Param("patientId") Integer patientId);
}