package com.example.smartpole.repository;

import com.example.smartpole.entity.Pole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PoleRepository extends JpaRepository<Pole, String> {

    // Find poles by status
    List<Pole> findByStatus(Pole.PoleStatus status);

    // Find active poles
    List<Pole> findByStatusOrderByPoleIdAsc(Pole.PoleStatus status);

    // Find poles with low battery
    @Query("SELECT p FROM Pole p WHERE p.batteryLevel <= :threshold ORDER BY p.batteryLevel ASC")
    List<Pole> findLowBatteryPoles(@Param("threshold") Integer threshold);

    // Get poles needing maintenance (low battery or maintenance status)
    @Query("SELECT p FROM Pole p WHERE p.status = 'maintenance' OR p.batteryLevel <= :batteryThreshold ORDER BY p.batteryLevel ASC")
    List<Pole> findPolesNeedingMaintenance(@Param("batteryThreshold") Integer batteryThreshold);

    // Count active poles
    @Query("SELECT COUNT(p) FROM Pole p WHERE p.status = 'active'")
    Long countActivePoles();
}