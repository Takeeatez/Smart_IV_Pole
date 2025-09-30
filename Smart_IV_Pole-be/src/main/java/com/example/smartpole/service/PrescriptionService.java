package com.example.smartpole.service;

import com.example.smartpole.entity.Prescription;
import com.example.smartpole.repository.PrescriptionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PrescriptionService {

    private final PrescriptionRepository prescriptionRepository;

    public List<Prescription> getAllPrescriptions() {
        return prescriptionRepository.findAll();
    }

    public Optional<Prescription> getPrescriptionById(Integer id) {
        return prescriptionRepository.findById(id);
    }

    public List<Prescription> getPrescriptionsByPatient(Integer patientId) {
        return prescriptionRepository.findByPatientId(patientId);
    }

    public List<Prescription> getActivePrescriptionsByPatient(Integer patientId) {
        return prescriptionRepository.findActiveByPatientId(patientId);
    }

    public List<Prescription> getPendingPrescriptions() {
        return prescriptionRepository.findPendingPrescriptions();
    }

    public List<Prescription> getStartablePrescriptions(Integer patientId) {
        return prescriptionRepository.findStartablePrescriptions(patientId);
    }

    public List<Prescription> getOverduePrescriptions() {
        return prescriptionRepository.findOverduePrescriptions();
    }

    public Long countActiveByPatient(Integer patientId) {
        return prescriptionRepository.countActiveByPatientId(patientId);
    }

    public List<Prescription> getRecentPrescriptions() {
        LocalDateTime since = LocalDateTime.now().minusHours(24);
        return prescriptionRepository.findRecentPrescriptions(since);
    }

    @Transactional
    public Prescription createPrescription(Prescription prescription) {
        // Validate required fields
        validatePrescription(prescription);

        // Mark existing active/prescribed prescriptions as COMPLETED for this patient
        List<Prescription> existingPrescriptions = prescriptionRepository.findByPatientId(prescription.getPatientId());
        for (Prescription existing : existingPrescriptions) {
            if (existing.getStatus() == Prescription.PrescriptionStatus.ACTIVE ||
                existing.getStatus() == Prescription.PrescriptionStatus.PRESCRIBED) {
                existing.setStatus(Prescription.PrescriptionStatus.COMPLETED);
                existing.setCompletedAt(LocalDateTime.now());
                prescriptionRepository.save(existing);
            }
        }

        // Set default values for new prescription
        if (prescription.getPrescribedAt() == null) {
            prescription.setPrescribedAt(LocalDateTime.now());
        }
        if (prescription.getStatus() == null) {
            prescription.setStatus(Prescription.PrescriptionStatus.PRESCRIBED);
        }

        return prescriptionRepository.save(prescription);
    }

    @Transactional
    public Prescription updatePrescription(Integer id, Prescription updatedPrescription) {
        Prescription existing = prescriptionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Prescription not found with id: " + id));

        // Only allow updates if prescription hasn't started
        if (existing.getStatus() != Prescription.PrescriptionStatus.PRESCRIBED) {
            throw new RuntimeException("Cannot modify prescription that has already started");
        }

        // Update allowed fields
        existing.setTotalVolumeMl(updatedPrescription.getTotalVolumeMl());
        existing.setInfusionRateMlHr(updatedPrescription.getInfusionRateMlHr());
        existing.setGttFactor(updatedPrescription.getGttFactor());
        existing.setCalculatedGtt(updatedPrescription.getCalculatedGtt());
        existing.setDurationHours(updatedPrescription.getDurationHours());
        existing.setSpecialInstructions(updatedPrescription.getSpecialInstructions());

        return prescriptionRepository.save(existing);
    }

    @Transactional
    public Prescription startPrescription(Integer id) {
        Prescription prescription = prescriptionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Prescription not found with id: " + id));

        prescription.startInfusion();
        return prescriptionRepository.save(prescription);
    }

    @Transactional
    public Prescription pausePrescription(Integer id) {
        Prescription prescription = prescriptionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Prescription not found with id: " + id));

        prescription.pauseInfusion();
        return prescriptionRepository.save(prescription);
    }

    @Transactional
    public Prescription resumePrescription(Integer id) {
        Prescription prescription = prescriptionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Prescription not found with id: " + id));

        prescription.resumeInfusion();
        return prescriptionRepository.save(prescription);
    }

    @Transactional
    public Prescription completePrescription(Integer id) {
        Prescription prescription = prescriptionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Prescription not found with id: " + id));

        prescription.completeInfusion();
        return prescriptionRepository.save(prescription);
    }

    @Transactional
    public Prescription cancelPrescription(Integer id) {
        Prescription prescription = prescriptionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Prescription not found with id: " + id));

        prescription.setStatus(Prescription.PrescriptionStatus.CANCELLED);
        prescription.setCompletedAt(LocalDateTime.now());
        return prescriptionRepository.save(prescription);
    }

    @Transactional
    public void deletePrescription(Integer id) {
        Prescription prescription = prescriptionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Prescription not found with id: " + id));

        // Only allow deletion if prescription hasn't started
        if (prescription.getStatus() != Prescription.PrescriptionStatus.PRESCRIBED) {
            throw new RuntimeException("Cannot delete prescription that has already started. Use cancel instead.");
        }

        prescriptionRepository.delete(prescription);
    }

    private void validatePrescription(Prescription prescription) {
        if (prescription.getPatientId() == null) {
            throw new RuntimeException("Patient ID is required");
        }
        if (prescription.getDrugTypeId() == null) {
            throw new RuntimeException("Drug Type ID is required");
        }
        if (prescription.getTotalVolumeMl() == null || prescription.getTotalVolumeMl() <= 0) {
            throw new RuntimeException("Total volume must be greater than 0");
        }
        if (prescription.getInfusionRateMlHr() == null || prescription.getInfusionRateMlHr() <= 0) {
            throw new RuntimeException("Infusion rate must be greater than 0");
        }
        if (prescription.getGttFactor() == null || (prescription.getGttFactor() != 20 && prescription.getGttFactor() != 60)) {
            throw new RuntimeException("GTT factor must be 20 (macro) or 60 (micro)");
        }
        if (prescription.getDurationHours() == null || prescription.getDurationHours() <= 0) {
            throw new RuntimeException("Duration must be greater than 0");
        }
        if (prescription.getPrescribedBy() == null || prescription.getPrescribedBy().trim().isEmpty()) {
            throw new RuntimeException("Prescriber name is required");
        }
    }
}