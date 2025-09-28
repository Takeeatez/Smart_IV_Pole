package com.example.smartpole.repository;

import com.example.smartpole.entity.DrugType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * DrugTypeRepository
 * - 약품 유형(DrugType)에 대한 JPA Repository
 * - Spring Data JPA를 통해 기본 CRUD 및 커스텀 메서드 제공
 * - Entity: DrugType, PK 타입: Integer
 */
@Repository
public interface DrugTypeRepository extends JpaRepository<DrugType, Integer> {

    /**
     * 약품명으로 조회
     * @param dripName 약품명
     * @return Optional 형태의 약품 엔티티
     *
     * Postman 예시:
     * GET http://localhost:8080/api/v1/drips?dripName=Glucose 5%
     */
    Optional<DrugType> findByDripName(String dripName);

    /**
     * 특정 약품명이 존재하는지 확인
     * @param dripName 약품명
     * @return 존재 여부 (true/false)
     *
     * 서비스 로직에서 중복 체크에 사용
     */
    boolean existsByDripName(String dripName);
}