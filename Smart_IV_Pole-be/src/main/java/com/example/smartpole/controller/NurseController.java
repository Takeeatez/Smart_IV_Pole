package com.example.smartpole.controller;

import com.example.smartpole.entity.Nurse;
import com.example.smartpole.service.NurseService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/nurses")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001", "http://localhost:3002", "http://localhost:5173"})
public class NurseController {

    private final NurseService nurseService;

    @GetMapping
    public ResponseEntity<List<Nurse>> getAllNurses() {
        List<Nurse> nurses = nurseService.getAllNurses();
        return ResponseEntity.ok(nurses);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Nurse> getNurseById(@PathVariable Integer id) {
        Optional<Nurse> nurse = nurseService.getNurseById(id);
        return nurse.map(ResponseEntity::ok)
                   .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/employee/{employeeId}")
    public ResponseEntity<Nurse> getNurseByEmployeeId(@PathVariable String employeeId) {
        Optional<Nurse> nurse = nurseService.getNurseByEmployeeId(employeeId);
        return nurse.map(ResponseEntity::ok)
                   .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/search")
    public ResponseEntity<List<Nurse>> searchNurses(@RequestParam(required = false) String name) {
        List<Nurse> nurses = nurseService.searchNurses(name);
        return ResponseEntity.ok(nurses);
    }

    @GetMapping("/role/{role}")
    public ResponseEntity<List<Nurse>> getNursesByRole(@PathVariable String role) {
        try {
            Nurse.NurseRole nurseRole = Nurse.NurseRole.valueOf(role);
            List<Nurse> nurses = nurseService.getNursesByRole(nurseRole);
            return ResponseEntity.ok(nurses);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping
    public ResponseEntity<Nurse> createNurse(@RequestBody Nurse nurse) {
        try {
            // Check if employee ID already exists
            if (nurseService.existsByEmployeeId(nurse.getEmployeeId())) {
                return ResponseEntity.status(HttpStatus.CONFLICT).build();
            }
            Nurse savedNurse = nurseService.saveNurse(nurse);
            return ResponseEntity.status(HttpStatus.CREATED).body(savedNurse);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Nurse> updateNurse(@PathVariable Integer id, @RequestBody Nurse nurse) {
        try {
            Nurse updatedNurse = nurseService.updateNurse(id, nurse);
            return ResponseEntity.ok(updatedNurse);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteNurse(@PathVariable Integer id) {
        try {
            nurseService.deleteNurse(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/{id}/exists")
    public ResponseEntity<Boolean> nurseExists(@PathVariable Integer id) {
        boolean exists = nurseService.existsById(id);
        return ResponseEntity.ok(exists);
    }

    @GetMapping("/employee/{employeeId}/exists")
    public ResponseEntity<Boolean> nurseExistsByEmployeeId(@PathVariable String employeeId) {
        boolean exists = nurseService.existsByEmployeeId(employeeId);
        return ResponseEntity.ok(exists);
    }

    // Authentication endpoint
    @PostMapping("/login")
    public ResponseEntity<Nurse> authenticateNurse(@RequestBody LoginRequest loginRequest) {
        Optional<Nurse> nurse = nurseService.authenticateNurse(
                loginRequest.getEmployeeId(),
                loginRequest.getPassword()
        );
        return nurse.map(ResponseEntity::ok)
                   .orElse(ResponseEntity.status(HttpStatus.UNAUTHORIZED).build());
    }

    // Inner class for login request
    public static class LoginRequest {
        private String employeeId;
        private String password;

        public String getEmployeeId() { return employeeId; }
        public void setEmployeeId(String employeeId) { this.employeeId = employeeId; }

        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
    }
}