package com.example.smartpole.repository;

import com.example.smartpole.entity.Ward;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WardRepository extends JpaRepository<Ward, String> {

    @Query("SELECT w FROM Ward w WHERE w.wardName LIKE %:name%")
    List<Ward> findByWardNameContainingIgnoreCase(@Param("name") String name);

    boolean existsByWardName(String wardName);
}