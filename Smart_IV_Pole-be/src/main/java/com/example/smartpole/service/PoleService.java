package com.example.smartpole.service;

import com.example.smartpole.entity.Pole;
import com.example.smartpole.repository.PoleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PoleService {

    private final PoleRepository poleRepository;
    private final AlertLogService alertLogService;

    public List<Pole> getAllPoles() {
        return poleRepository.findAll();
    }

    public List<Pole> getActivePoles() {
        return poleRepository.findByStatusOrderByPoleIdAsc(Pole.PoleStatus.active);
    }

    public List<Pole> getOnlinePoles() {
        return poleRepository.findByIsOnlineOrderByPoleIdAsc(true);
    }

    public List<Pole> getAvailableOnlinePoles() {
        // 온라인 + 할당되지 않은 폴대
        return poleRepository.findByIsOnlineAndPatientIdIsNullOrderByPoleIdAsc(true);
    }

    public Optional<Pole> getPoleById(String poleId) {
        return poleRepository.findById(poleId);
    }

    public List<Pole> getLowBatteryPoles(Integer threshold) {
        return poleRepository.findLowBatteryPoles(threshold);
    }

    public List<Pole> getPolesNeedingMaintenance(Integer batteryThreshold) {
        return poleRepository.findPolesNeedingMaintenance(batteryThreshold);
    }

    public Long countActivePoles() {
        return poleRepository.countActivePoles();
    }

    @Transactional
    public Pole savePole(Pole pole) {
        return poleRepository.save(pole);
    }

    @Transactional
    public Pole updatePoleStatus(String poleId, Pole.PoleStatus status) {
        Pole pole = poleRepository.findById(poleId)
                .orElseThrow(() -> new RuntimeException("Pole not found with id: " + poleId));

        pole.setStatus(status);
        return poleRepository.save(pole);
    }

    @Transactional
    public Pole updateBatteryLevel(String poleId, Integer batteryLevel) {
        Pole pole = poleRepository.findById(poleId)
                .orElseThrow(() -> new RuntimeException("Pole not found with id: " + poleId));

        int previousBatteryLevel = pole.getBatteryLevel();
        pole.setBatteryLevel(batteryLevel);

        // Generate battery alert if battery is low
        if (batteryLevel <= 20 && previousBatteryLevel > 20) {
            alertLogService.createBatteryAlert(poleId, batteryLevel);
        }

        return poleRepository.save(pole);
    }

    @Transactional
    public Pole updateMaintenanceDate(String poleId, LocalDate maintenanceDate) {
        Pole pole = poleRepository.findById(poleId)
                .orElseThrow(() -> new RuntimeException("Pole not found with id: " + poleId));

        pole.setLastMaintenance(maintenanceDate);
        pole.setStatus(Pole.PoleStatus.active); // Reset to active after maintenance

        return poleRepository.save(pole);
    }

    @Transactional
    public void deletePole(String poleId) {
        poleRepository.deleteById(poleId);
    }

    public boolean existsById(String poleId) {
        return poleRepository.existsById(poleId);
    }

    // Patient assignment methods
    public List<Pole> getAvailablePoles() {
        return poleRepository.findAvailablePoles();
    }

    public List<Pole> getAssignedPoles() {
        return poleRepository.findAssignedPoles();
    }

    public List<Pole> getPolesByPatient(Integer patientId) {
        return poleRepository.findByPatientId(patientId);
    }

    public Optional<Pole> getActivePoleByPatient(Integer patientId) {
        return poleRepository.findByPatientIdAndStatus(patientId, Pole.PoleStatus.active);
    }

    public boolean isPatientAssignedToPole(Integer patientId) {
        return poleRepository.existsByPatientId(patientId);
    }

    @Transactional
    public Pole assignPoleToPatient(String poleId, Integer patientId) {
        Pole pole = poleRepository.findById(poleId)
                .orElseThrow(() -> new RuntimeException("Pole not found with id: " + poleId));

        if (pole.isAssigned()) {
            throw new RuntimeException("Pole " + poleId + " is already assigned to patient " + pole.getPatientId());
        }

        if (pole.getStatus() != Pole.PoleStatus.active) {
            throw new RuntimeException("Pole " + poleId + " is not active and cannot be assigned");
        }

        // Check if patient already has a pole assigned
        if (poleRepository.existsByPatientId(patientId)) {
            throw new RuntimeException("Patient " + patientId + " already has a pole assigned");
        }

        pole.assignToPatient(patientId);
        return poleRepository.save(pole);
    }

    @Transactional
    public Pole unassignPole(String poleId) {
        Pole pole = poleRepository.findById(poleId)
                .orElseThrow(() -> new RuntimeException("Pole not found with id: " + poleId));

        if (!pole.isAssigned()) {
            throw new RuntimeException("Pole " + poleId + " is not assigned to any patient");
        }

        pole.unassign();
        return poleRepository.save(pole);
    }

    @Transactional
    public void unassignPatientFromAllPoles(Integer patientId) {
        List<Pole> assignedPoles = poleRepository.findByPatientId(patientId);
        for (Pole pole : assignedPoles) {
            pole.unassign();
            poleRepository.save(pole);
        }
    }
}