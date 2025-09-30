package com.example.smartpole.controller;

import com.example.smartpole.entity.DrugType;
import com.example.smartpole.service.DrugTypeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

/**
 * DrugTypeController
 * - 약품 유형(DrugType)에 대한 REST API 컨트롤러
 * - 기본 CRUD 및 존재 여부 확인 기능 제공
 * - 현재 프론트엔드 연결 전, Postman 등으로 테스트 가능
 */
@RestController
@RequestMapping("/api/v1/drips")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001", "http://localhost:3002", "http://localhost:5173"})
public class DrugTypeController {

    private final DrugTypeService drugTypeService;

    /**
     * 전체 약품 목록 조회
     * GET /api/v1/drips
     * @return 모든 DrugType 리스트
     */
    @GetMapping
    public ResponseEntity<List<DrugType>> getAllDrugTypes() {
        // 모든 약품 유형을 조회하여 반환
        List<DrugType> drugTypeEntities = drugTypeService.getAllDrugTypes();
        return ResponseEntity.ok(drugTypeEntities);
    }

    /**
     * 단일 약품 조회
     * GET /api/v1/drips/{id}
     * @param id 약품 식별자
     * @return 약품 정보 (없으면 404)
     */
    @GetMapping("/{id}")
    public ResponseEntity<DrugType> getDrugTypeById(@PathVariable Integer id) {
        // ID로 약품 유형을 조회, 없으면 404 반환
        Optional<DrugType> drugType = drugTypeService.getDrugTypeById(id);
        return drugType.map(ResponseEntity::ok)
                      .orElse(ResponseEntity.notFound().build());
    }

    /**
     * 약품 등록
     * POST /api/v1/drips
     * @param drugTypeEntity 요청 Body의 약품 정보
     * @return 생성된 약품 정보 (201 Created)
     *
     * Postman 예시:
     * POST http://localhost:8080/api/v1/drips
     * Body(JSON):
     * {
     *   "dripName": "Glucose 5%"
     * }
     */
    @PostMapping
    public ResponseEntity<DrugType> createDrugType(@RequestBody DrugType drugTypeEntity) {
        // 약품 유형 신규 등록
        DrugType savedDrugType = drugTypeService.createDrugType(drugTypeEntity);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedDrugType);
    }

    /**
     * 약품 수정
     * PUT /api/v1/drips/{id}
     * @param id 수정할 약품의 ID
     * @param drugTypeEntity 수정된 약품 정보
     * @return 수정된 약품 정보
     *
     * Postman 예시:
     * PUT http://localhost:8080/api/v1/drips/1
     * Body(JSON):
     * {
     *   "dripName": "Normal Saline 0.9%"
     * }
     */
    @PutMapping("/{id}")
    public ResponseEntity<DrugType> updateDrugType(@PathVariable Integer id, @RequestBody DrugType drugTypeEntity) {
        // 약품 유형 정보 수정
        DrugType updatedDrugType = drugTypeService.updateDrugType(id, drugTypeEntity);
        return ResponseEntity.ok(updatedDrugType);
    }

    /**
     * 약품 삭제
     * DELETE /api/v1/drips/{id}
     * @param id 삭제할 약품 ID
     * @return 204 No Content
     *
     * Postman 예시:
     * DELETE http://localhost:8080/api/v1/drips/1
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDrugType(@PathVariable Integer id) {
        // 약품 유형 삭제
        drugTypeService.deleteDrugType(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * 약품 존재 여부 확인
     * GET /api/v1/drips/{id}/exists
     * @param id 확인할 약품 ID
     * @return 존재 여부 (true/false)
     *
     * Postman 예시:
     * GET http://localhost:8080/api/v1/drips/1/exists
     */
    @GetMapping("/{id}/exists")
    public ResponseEntity<Boolean> drugTypeExists(@PathVariable Integer id) {
        // 해당 ID의 약품 유형 존재 여부 반환
        boolean exists = drugTypeService.existsById(id);
        return ResponseEntity.ok(exists);
    }
}