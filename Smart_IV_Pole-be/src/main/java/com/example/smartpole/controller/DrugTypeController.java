package com.example.smartpole.controller;

import com.example.smartpole.entity.DrugType;
import com.example.smartpole.service.DrugTypeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/drips")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class DrugTypeController {

    private final DrugTypeService drugTypeService;

    @GetMapping
    public ResponseEntity<List<DrugType>> getAllDrugTypes() {
        List<DrugType> drugTypes = drugTypeService.getAllDrugTypes();
        return ResponseEntity.ok(drugTypes);
    }

    @GetMapping("/{id}")
    public ResponseEntity<DrugType> getDrugTypeById(@PathVariable Integer id) {
        Optional<DrugType> drugType = drugTypeService.getDrugTypeById(id);
        return drugType.map(ResponseEntity::ok)
                      .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<DrugType> createDrugType(@RequestBody DrugType drugType) {
        try {
            DrugType savedDrugType = drugTypeService.saveDrugType(drugType);
            return ResponseEntity.status(HttpStatus.CREATED).body(savedDrugType);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<DrugType> updateDrugType(@PathVariable Integer id, @RequestBody DrugType drugType) {
        try {
            DrugType updatedDrugType = drugTypeService.updateDrugType(id, drugType);
            return ResponseEntity.ok(updatedDrugType);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDrugType(@PathVariable Integer id) {
        try {
            drugTypeService.deleteDrugType(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/{id}/exists")
    public ResponseEntity<Boolean> drugTypeExists(@PathVariable Integer id) {
        boolean exists = drugTypeService.existsById(id);
        return ResponseEntity.ok(exists);
    }
}