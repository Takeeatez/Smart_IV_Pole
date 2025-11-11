package com.example.smartpole.repository;

import com.example.smartpole.entity.Pole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PoleRepository extends JpaRepository<Pole, String> {

    // Find poles by status
    List<Pole> findByStatus(Pole.PoleStatus status);

    // Find active poles
    List<Pole> findByStatusOrderByPoleIdAsc(Pole.PoleStatus status);

    // Find online poles
    List<Pole> findByIsOnlineOrderByPoleIdAsc(Boolean isOnline);

    // Find available online poles (online + not assigned)
    List<Pole> findByIsOnlineAndPatientIdIsNullOrderByPoleIdAsc(Boolean isOnline);

    // Find poles with low battery
    @Query("SELECT p FROM Pole p WHERE p.batteryLevel <= :threshold ORDER BY p.batteryLevel ASC")
    List<Pole> findLowBatteryPoles(@Param("threshold") Integer threshold);

    // Get poles needing maintenance (low battery or maintenance status)
    @Query("SELECT p FROM Pole p WHERE p.status = 'maintenance' OR p.batteryLevel <= :batteryThreshold ORDER BY p.batteryLevel ASC")
    List<Pole> findPolesNeedingMaintenance(@Param("batteryThreshold") Integer batteryThreshold);

    // Count active poles
    @Query("SELECT COUNT(p) FROM Pole p WHERE p.status = 'active'")
    Long countActivePoles();

    // Find pole by pole ID (for MQTT updates)
    Optional<Pole> findByPoleId(String poleId);

    // Patient assignment queries
    List<Pole> findByPatientId(Integer patientId);

    Optional<Pole> findByPatientIdAndStatus(Integer patientId, Pole.PoleStatus status);

    @Query("SELECT p FROM Pole p WHERE p.patientId IS NULL AND p.status = 'active'")
    List<Pole> findAvailablePoles();

    @Query("SELECT p FROM Pole p WHERE p.patientId IS NOT NULL")
    List<Pole> findAssignedPoles();

    boolean existsByPatientId(Integer patientId);

    // Clear patient assignment (for patient deletion)
    @Modifying
    @Query("UPDATE Pole p SET p.patientId = NULL WHERE p.patientId = :patientId")
    void clearPatientAssignment(@Param("patientId") Integer patientId);
}