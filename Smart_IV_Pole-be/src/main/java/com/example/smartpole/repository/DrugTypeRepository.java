package com.example.smartpole.repository;

import com.example.smartpole.entity.DrugType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface DrugTypeRepository extends JpaRepository<DrugType, Integer> {

    Optional<DrugType> findByDripName(String dripName);

    boolean existsByDripName(String dripName);
}