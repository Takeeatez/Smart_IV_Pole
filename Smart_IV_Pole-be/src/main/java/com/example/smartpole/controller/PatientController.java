package com.example.smartpole.controller;

import com.example.smartpole.dto.ApiResponse;
import com.example.smartpole.entity.Patient;
import com.example.smartpole.service.PatientService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001", "http://localhost:5173"})
public class PatientController {

    private final PatientService patientService;

    // Health check endpoint
    @GetMapping("/health")
    public ResponseEntity<ApiResponse<String>> health() {
        return ResponseEntity.ok(ApiResponse.success("Server is running", "Health check successful"));
    }

    @GetMapping("/patients")
    public ResponseEntity<ApiResponse<List<Patient>>> getAllPatients() {
        try {
            List<Patient> patients = patientService.getAllPatients();
            return ResponseEntity.ok(ApiResponse.success(patients));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to fetch patients: " + e.getMessage()));
        }
    }

    @GetMapping("/patients/{id}")
    public ResponseEntity<ApiResponse<Patient>> getPatientById(@PathVariable Integer id) {
        try {
            Optional<Patient> patient = patientService.getPatientById(id);
            if (patient.isPresent()) {
                return ResponseEntity.ok(ApiResponse.success(patient.get()));
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.error("Patient not found"));
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to fetch patient: " + e.getMessage()));
        }
    }

    @GetMapping("/patients/search")
    public ResponseEntity<ApiResponse<List<Patient>>> searchPatients(@RequestParam(required = false) String keyword) {
        try {
            List<Patient> patients = patientService.searchPatients(keyword);
            return ResponseEntity.ok(ApiResponse.success(patients));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to search patients: " + e.getMessage()));
        }
    }

    @PostMapping("/patients")
    public ResponseEntity<ApiResponse<Patient>> createPatient(@RequestBody Patient patient) {
        try {
            Patient savedPatient = patientService.savePatient(patient);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success(savedPatient, "Patient created successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("Failed to create patient: " + e.getMessage()));
        }
    }

    @PutMapping("/patients/{id}")
    public ResponseEntity<ApiResponse<Patient>> updatePatient(@PathVariable Integer id, @RequestBody Patient patient) {
        try {
            Patient updatedPatient = patientService.updatePatient(id, patient);
            return ResponseEntity.ok(ApiResponse.success(updatedPatient, "Patient updated successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("Patient not found"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("Failed to update patient: " + e.getMessage()));
        }
    }

    @DeleteMapping("/patients/{id}")
    public ResponseEntity<ApiResponse<Void>> deletePatient(@PathVariable Integer id) {
        try {
            patientService.deletePatient(id);
            return ResponseEntity.ok(ApiResponse.success(null, "Patient deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("Failed to delete patient: " + e.getMessage()));
        }
    }

    @GetMapping("/patients/{id}/exists")
    public ResponseEntity<ApiResponse<Boolean>> patientExists(@PathVariable Integer id) {
        try {
            boolean exists = patientService.existsById(id);
            return ResponseEntity.ok(ApiResponse.success(exists));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to check patient existence: " + e.getMessage()));
        }
    }
}