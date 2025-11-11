package com.example.smartpole.controller;

import com.example.smartpole.entity.Pole;
import com.example.smartpole.service.PoleService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/poles")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001", "http://localhost:3002", "http://localhost:5173"})
public class PoleController {

    private final PoleService poleService;

    @GetMapping
    public ResponseEntity<List<Pole>> getAllPoles() {
        List<Pole> poles = poleService.getAllPoles();
        return ResponseEntity.ok(poles);
    }

    @GetMapping("/active")
    public ResponseEntity<List<Pole>> getActivePoles() {
        List<Pole> poles = poleService.getActivePoles();
        return ResponseEntity.ok(poles);
    }

    @GetMapping("/online")
    public ResponseEntity<List<Pole>> getOnlinePoles() {
        List<Pole> poles = poleService.getOnlinePoles();
        return ResponseEntity.ok(poles);
    }

    @GetMapping("/available-online")
    public ResponseEntity<List<Pole>> getAvailableOnlinePoles() {
        List<Pole> poles = poleService.getAvailableOnlinePoles();
        return ResponseEntity.ok(poles);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Pole> getPoleById(@PathVariable String id) {
        Optional<Pole> pole = poleService.getPoleById(id);
        return pole.map(ResponseEntity::ok)
                  .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/low-battery")
    public ResponseEntity<List<Pole>> getLowBatteryPoles(@RequestParam(defaultValue = "20") Integer threshold) {
        List<Pole> poles = poleService.getLowBatteryPoles(threshold);
        return ResponseEntity.ok(poles);
    }

    @GetMapping("/maintenance-needed")
    public ResponseEntity<List<Pole>> getPolesNeedingMaintenance(@RequestParam(defaultValue = "20") Integer batteryThreshold) {
        List<Pole> poles = poleService.getPolesNeedingMaintenance(batteryThreshold);
        return ResponseEntity.ok(poles);
    }

    @GetMapping("/count/active")
    public ResponseEntity<Long> getActivePoleCount() {
        Long count = poleService.countActivePoles();
        return ResponseEntity.ok(count);
    }

    @PostMapping
    public ResponseEntity<Pole> createPole(@RequestBody Pole pole) {
        try {
            Pole savedPole = poleService.savePole(pole);
            return ResponseEntity.status(HttpStatus.CREATED).body(savedPole);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<Pole> updatePoleStatus(@PathVariable String id, @RequestParam String status) {
        try {
            Pole.PoleStatus poleStatus = Pole.PoleStatus.valueOf(status);
            Pole pole = poleService.updatePoleStatus(id, poleStatus);
            return ResponseEntity.ok(pole);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/{id}/battery")
    public ResponseEntity<Pole> updateBatteryLevel(@PathVariable String id, @RequestParam Integer batteryLevel) {
        try {
            if (batteryLevel < 0 || batteryLevel > 100) {
                return ResponseEntity.badRequest().build();
            }
            Pole pole = poleService.updateBatteryLevel(id, batteryLevel);
            return ResponseEntity.ok(pole);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/{id}/maintenance")
    public ResponseEntity<Pole> updateMaintenanceDate(
            @PathVariable String id,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate maintenanceDate) {
        try {
            Pole pole = poleService.updateMaintenanceDate(id, maintenanceDate);
            return ResponseEntity.ok(pole);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePole(@PathVariable String id) {
        try {
            poleService.deletePole(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/{id}/exists")
    public ResponseEntity<Boolean> poleExists(@PathVariable String id) {
        boolean exists = poleService.existsById(id);
        return ResponseEntity.ok(exists);
    }

    // Patient assignment endpoints
    @GetMapping("/available")
    public ResponseEntity<List<Pole>> getAvailablePoles() {
        List<Pole> poles = poleService.getAvailablePoles();
        return ResponseEntity.ok(poles);
    }

    @GetMapping("/assigned")
    public ResponseEntity<List<Pole>> getAssignedPoles() {
        List<Pole> poles = poleService.getAssignedPoles();
        return ResponseEntity.ok(poles);
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<Pole>> getPolesByPatient(@PathVariable Integer patientId) {
        List<Pole> poles = poleService.getPolesByPatient(patientId);
        return ResponseEntity.ok(poles);
    }

    @GetMapping("/patient/{patientId}/active")
    public ResponseEntity<Pole> getActivePoleByPatient(@PathVariable Integer patientId) {
        Optional<Pole> pole = poleService.getActivePoleByPatient(patientId);
        return pole.map(ResponseEntity::ok)
                  .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/patient/{patientId}/assigned")
    public ResponseEntity<Boolean> isPatientAssignedToPole(@PathVariable Integer patientId) {
        boolean assigned = poleService.isPatientAssignedToPole(patientId);
        return ResponseEntity.ok(assigned);
    }

    @PostMapping("/{poleId}/assign/{patientId}")
    public ResponseEntity<Pole> assignPoleToPatient(@PathVariable String poleId, @PathVariable Integer patientId) {
        try {
            Pole pole = poleService.assignPoleToPatient(poleId, patientId);
            return ResponseEntity.ok(pole);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/{poleId}/unassign")
    public ResponseEntity<Pole> unassignPole(@PathVariable String poleId) {
        try {
            Pole pole = poleService.unassignPole(poleId);
            return ResponseEntity.ok(pole);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/patient/{patientId}/unassign-all")
    public ResponseEntity<Void> unassignPatientFromAllPoles(@PathVariable Integer patientId) {
        try {
            poleService.unassignPatientFromAllPoles(patientId);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
}