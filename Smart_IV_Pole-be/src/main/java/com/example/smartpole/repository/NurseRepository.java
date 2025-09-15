package com.example.smartpole.repository;

import com.example.smartpole.entity.Nurse;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface NurseRepository extends JpaRepository<Nurse, Integer> {

    Optional<Nurse> findByEmployeeId(String employeeId);

    @Query("SELECT n FROM Nurse n WHERE n.employeeId = :employeeId AND n.password = :password")
    Optional<Nurse> findByEmployeeIdAndPassword(@Param("employeeId") String employeeId, @Param("password") String password);

    @Query("SELECT n FROM Nurse n WHERE n.name LIKE %:name%")
    List<Nurse> findByNameContainingIgnoreCase(@Param("name") String name);

    boolean existsByEmployeeId(String employeeId);

    List<Nurse> findByRole(Nurse.NurseRole role);
}