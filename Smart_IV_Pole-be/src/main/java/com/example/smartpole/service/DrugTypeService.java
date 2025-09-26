package com.example.smartpole.service;

import com.example.smartpole.entity.DrugTypeEntity;
import com.example.smartpole.repository.DrugTypeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class DrugTypeService {

    private final DrugTypeRepository drugTypeRepository;

    // CREATE
    public DrugTypeEntity createDrugType(DrugTypeEntity drugTypeEntity) {
        log.debug("Creating new drug type: {}", drugTypeEntity.getDripName());
        return drugTypeRepository.save(drugTypeEntity);
    }

    // READ (all)
    public List<DrugTypeEntity> getAllDrugTypes() {
        log.debug("Fetching all drug types");
        return drugTypeRepository.findAll();
    }

    // READ (by id)
    public Optional<DrugTypeEntity> getDrugTypeById(Integer id) {
        log.debug("Fetching drug type by id: {}", id);
        return drugTypeRepository.findById(id);
    }

    public DrugTypeEntity saveDrugType(DrugTypeEntity drugTypeEntity) {
        log.debug("Saving drug type: {}", drugTypeEntity.getDripName());
        return drugTypeRepository.save(drugTypeEntity);
    }

    // UPDATE
    public DrugTypeEntity updateDrugType(Integer id, DrugTypeEntity drugTypeEntity) {
        log.debug("Updating drug type with id: {}", id);
        return drugTypeRepository.findById(id)
                .map(existingDrugType -> {
                    if (drugTypeEntity.getDripName() != null) {
                        existingDrugType.setDripName(drugTypeEntity.getDripName());
                    }
                    return drugTypeRepository.save(existingDrugType);
                })
                .orElseThrow(() -> new RuntimeException("DrugType not found with id: " + id));
    }

    // DELETE
    public void deleteDrugType(Integer id) {
        log.debug("Deleting drug type with id: {}", id);
        drugTypeRepository.deleteById(id);
    }

    public boolean existsById(Integer id) {
        return drugTypeRepository.existsById(id);
    }
}