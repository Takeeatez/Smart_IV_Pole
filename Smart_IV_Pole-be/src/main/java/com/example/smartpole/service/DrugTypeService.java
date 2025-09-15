package com.example.smartpole.service;

import com.example.smartpole.entity.DrugType;
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

    public List<DrugType> getAllDrugTypes() {
        log.debug("Fetching all drug types");
        return drugTypeRepository.findAll();
    }

    public Optional<DrugType> getDrugTypeById(Integer id) {
        log.debug("Fetching drug type by id: {}", id);
        return drugTypeRepository.findById(id);
    }

    public DrugType saveDrugType(DrugType drugType) {
        log.debug("Saving drug type: {}", drugType.getDripName());
        return drugTypeRepository.save(drugType);
    }

    public DrugType updateDrugType(Integer id, DrugType drugType) {
        log.debug("Updating drug type with id: {}", id);
        return drugTypeRepository.findById(id)
                .map(existingDrugType -> {
                    if (drugType.getDripName() != null) {
                        existingDrugType.setDripName(drugType.getDripName());
                    }
                    return drugTypeRepository.save(existingDrugType);
                })
                .orElseThrow(() -> new RuntimeException("DrugType not found with id: " + id));
    }

    public void deleteDrugType(Integer id) {
        log.debug("Deleting drug type with id: {}", id);
        drugTypeRepository.deleteById(id);
    }

    public boolean existsById(Integer id) {
        return drugTypeRepository.existsById(id);
    }
}