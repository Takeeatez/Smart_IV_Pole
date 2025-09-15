package com.example.smartpole.repository;

import com.example.smartpole.entity.Room;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RoomRepository extends JpaRepository<Room, Integer> {

    List<Room> findByWardId(String wardId);

    @Query("SELECT r FROM Room r WHERE r.wardId = :wardId AND r.roomNumber = :roomNumber")
    List<Room> findByWardIdAndRoomNumber(@Param("wardId") String wardId, @Param("roomNumber") String roomNumber);

    boolean existsByRoomId(String roomId);
}