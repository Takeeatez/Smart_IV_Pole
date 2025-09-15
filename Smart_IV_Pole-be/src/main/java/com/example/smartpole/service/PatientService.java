package com.example.smartpole.service;

import com.example.smartpole.entity.Patient;
import com.example.smartpole.repository.PatientRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PatientService {

    private final PatientRepository patientRepository;

    public List<Patient> getAllPatients() {
        return patientRepository.findAll();
    }

    public Optional<Patient> getPatientById(Integer id) {
        return patientRepository.findById(id);
    }

    public List<Patient> searchPatients(String keyword) {
        if (keyword == null || keyword.trim().isEmpty()) {
            return getAllPatients();
        }
        return patientRepository.findByKeyword(keyword.trim());
    }

    @Transactional
    public Patient savePatient(Patient patient) {
        return patientRepository.save(patient);
    }

    @Transactional
    public Patient updatePatient(Integer id, Patient patientDetails) {
        Patient patient = patientRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Patient not found with id: " + id));

        // 기본 정보 업데이트
        if (patientDetails.getName() != null) {
            patient.setName(patientDetails.getName());
        }
        if (patientDetails.getBirthDate() != null) {
            patient.setBirthDate(patientDetails.getBirthDate());
        }
        if (patientDetails.getGender() != null) {
            patient.setGender(patientDetails.getGender());
        }
        if (patientDetails.getWeightKg() != null) {
            patient.setWeightKg(patientDetails.getWeightKg());
        }
        if (patientDetails.getHeightCm() != null) {
            patient.setHeightCm(patientDetails.getHeightCm());
        }
        if (patientDetails.getAddress() != null) {
            patient.setAddress(patientDetails.getAddress());
        }

        return patientRepository.save(patient);
    }

    @Transactional
    public void deletePatient(Integer id) {
        patientRepository.deleteById(id);
    }

    public boolean existsById(Integer id) {
        return patientRepository.existsById(id);
    }
}