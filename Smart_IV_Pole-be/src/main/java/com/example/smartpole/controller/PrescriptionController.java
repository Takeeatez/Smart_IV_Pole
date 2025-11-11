package com.example.smartpole.controller;

import com.example.smartpole.dto.ApiResponse;
import com.example.smartpole.entity.Prescription;
import com.example.smartpole.service.PrescriptionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/prescriptions")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001", "http://localhost:3002", "http://localhost:5173"})
public class PrescriptionController {

    private final PrescriptionService prescriptionService;

    @GetMapping
    public ResponseEntity<List<Prescription>> getAllPrescriptions() {
        List<Prescription> prescriptions = prescriptionService.getAllPrescriptions();
        return ResponseEntity.ok(prescriptions);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Prescription> getPrescriptionById(@PathVariable Integer id) {
        Optional<Prescription> prescription = prescriptionService.getPrescriptionById(id);
        return prescription.map(ResponseEntity::ok)
                          .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<Prescription>> getPrescriptionsByPatient(@PathVariable Integer patientId) {
        List<Prescription> prescriptions = prescriptionService.getPrescriptionsByPatient(patientId);
        return ResponseEntity.ok(prescriptions);
    }

    @GetMapping("/patient/{patientId}/active")
    public ResponseEntity<List<Prescription>> getActivePrescriptionsByPatient(@PathVariable Integer patientId) {
        List<Prescription> prescriptions = prescriptionService.getActivePrescriptionsByPatient(patientId);
        return ResponseEntity.ok(prescriptions);
    }

    @GetMapping("/patient/{patientId}/startable")
    public ResponseEntity<List<Prescription>> getStartablePrescriptions(@PathVariable Integer patientId) {
        List<Prescription> prescriptions = prescriptionService.getStartablePrescriptions(patientId);
        return ResponseEntity.ok(prescriptions);
    }

    @GetMapping("/status/pending")
    public ResponseEntity<List<Prescription>> getPendingPrescriptions() {
        List<Prescription> prescriptions = prescriptionService.getPendingPrescriptions();
        return ResponseEntity.ok(prescriptions);
    }

    @GetMapping("/status/overdue")
    public ResponseEntity<List<Prescription>> getOverduePrescriptions() {
        List<Prescription> prescriptions = prescriptionService.getOverduePrescriptions();
        return ResponseEntity.ok(prescriptions);
    }

    @GetMapping("/patient/{patientId}/count")
    public ResponseEntity<Long> countActiveByPatient(@PathVariable Integer patientId) {
        Long count = prescriptionService.countActiveByPatient(patientId);
        return ResponseEntity.ok(count);
    }

    @GetMapping("/recent")
    public ResponseEntity<List<Prescription>> getRecentPrescriptions() {
        List<Prescription> prescriptions = prescriptionService.getRecentPrescriptions();
        return ResponseEntity.ok(prescriptions);
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Prescription>> createPrescription(@RequestBody Prescription prescription) {
        try {
            Prescription savedPrescription = prescriptionService.createPrescription(prescription);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success(savedPrescription, "처방이 성공적으로 생성되었습니다."));
        } catch (RuntimeException e) {
            // 에러 메시지를 로그로 출력하고 클라이언트에게 전달
            System.err.println("❌ [PRESCRIPTION-ERROR] " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage(), "처방 생성 실패"));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Prescription> updatePrescription(@PathVariable Integer id, @RequestBody Prescription prescription) {
        try {
            Prescription updatedPrescription = prescriptionService.updatePrescription(id, prescription);
            return ResponseEntity.ok(updatedPrescription);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/{id}/start")
    public ResponseEntity<Prescription> startPrescription(@PathVariable Integer id) {
        try {
            Prescription prescription = prescriptionService.startPrescription(id);
            return ResponseEntity.ok(prescription);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/{id}/pause")
    public ResponseEntity<Prescription> pausePrescription(@PathVariable Integer id) {
        try {
            Prescription prescription = prescriptionService.pausePrescription(id);
            return ResponseEntity.ok(prescription);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/{id}/resume")
    public ResponseEntity<Prescription> resumePrescription(@PathVariable Integer id) {
        try {
            Prescription prescription = prescriptionService.resumePrescription(id);
            return ResponseEntity.ok(prescription);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/{id}/complete")
    public ResponseEntity<Prescription> completePrescription(@PathVariable Integer id) {
        try {
            Prescription prescription = prescriptionService.completePrescription(id);
            return ResponseEntity.ok(prescription);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<Prescription> cancelPrescription(@PathVariable Integer id) {
        try {
            Prescription prescription = prescriptionService.cancelPrescription(id);
            return ResponseEntity.ok(prescription);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePrescription(@PathVariable Integer id) {
        try {
            prescriptionService.deletePrescription(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
}