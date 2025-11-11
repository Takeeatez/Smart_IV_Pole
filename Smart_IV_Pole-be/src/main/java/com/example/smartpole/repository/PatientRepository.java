package com.example.smartpole.repository;

import com.example.smartpole.entity.Patient;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PatientRepository extends JpaRepository<Patient, Integer> {

    List<Patient> findByNameContaining(String name);

    List<Patient> findByPhoneContaining(String phone);

    @Query("SELECT p FROM Patient p WHERE p.name LIKE %:keyword% OR p.phone LIKE %:keyword%")
    List<Patient> findByKeyword(@Param("keyword") String keyword);

    // 모바일 앱 로그인용 - 전화번호로 환자 검색
    java.util.Optional<Patient> findByPhone(String phone);
}