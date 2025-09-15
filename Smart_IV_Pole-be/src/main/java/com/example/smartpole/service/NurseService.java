package com.example.smartpole.service;

import com.example.smartpole.entity.Nurse;
import com.example.smartpole.repository.NurseRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class NurseService {

    private final NurseRepository nurseRepository;

    public List<Nurse> getAllNurses() {
        log.debug("Fetching all nurses");
        return nurseRepository.findAll();
    }

    public Optional<Nurse> getNurseById(Integer id) {
        log.debug("Fetching nurse by id: {}", id);
        return nurseRepository.findById(id);
    }

    public Optional<Nurse> getNurseByEmployeeId(String employeeId) {
        log.debug("Fetching nurse by employee id: {}", employeeId);
        return nurseRepository.findByEmployeeId(employeeId);
    }

    public Nurse saveNurse(Nurse nurse) {
        log.debug("Saving nurse: {}", nurse.getName());
        return nurseRepository.save(nurse);
    }

    public Nurse updateNurse(Integer id, Nurse nurse) {
        log.debug("Updating nurse with id: {}", id);
        return nurseRepository.findById(id)
                .map(existingNurse -> {
                    if (nurse.getName() != null) {
                        existingNurse.setName(nurse.getName());
                    }
                    if (nurse.getEmployeeId() != null) {
                        existingNurse.setEmployeeId(nurse.getEmployeeId());
                    }
                    if (nurse.getPassword() != null) {
                        existingNurse.setPassword(nurse.getPassword());
                    }
                    if (nurse.getRole() != null) {
                        existingNurse.setRole(nurse.getRole());
                    }
                    return nurseRepository.save(existingNurse);
                })
                .orElseThrow(() -> new RuntimeException("Nurse not found with id: " + id));
    }

    public void deleteNurse(Integer id) {
        log.debug("Deleting nurse with id: {}", id);
        nurseRepository.deleteById(id);
    }

    public boolean existsById(Integer id) {
        return nurseRepository.existsById(id);
    }

    public boolean existsByEmployeeId(String employeeId) {
        return nurseRepository.existsByEmployeeId(employeeId);
    }

    public List<Nurse> searchNurses(String name) {
        log.debug("Searching nurses with name: {}", name);
        if (name == null || name.trim().isEmpty()) {
            return getAllNurses();
        }
        return nurseRepository.findByNameContainingIgnoreCase(name);
    }

    public List<Nurse> getNursesByRole(Nurse.NurseRole role) {
        log.debug("Fetching nurses by role: {}", role);
        return nurseRepository.findByRole(role);
    }

    // Authentication method
    public Optional<Nurse> authenticateNurse(String employeeId, String password) {
        log.debug("Authenticating nurse with employee id: {}", employeeId);
        return nurseRepository.findByEmployeeIdAndPassword(employeeId, password);
    }
}