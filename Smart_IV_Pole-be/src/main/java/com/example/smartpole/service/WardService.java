package com.example.smartpole.service;

import com.example.smartpole.entity.Room;
import com.example.smartpole.entity.Ward;
import com.example.smartpole.repository.RoomRepository;
import com.example.smartpole.repository.WardRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class WardService {

    private final WardRepository wardRepository;
    private final RoomRepository roomRepository;

    // Ward operations
    public List<Ward> getAllWards() {
        log.debug("Fetching all wards");
        return wardRepository.findAll();
    }

    public Optional<Ward> getWardById(String wardId) {
        log.debug("Fetching ward by id: {}", wardId);
        return wardRepository.findById(wardId);
    }

    public Ward saveWard(Ward ward) {
        log.debug("Saving ward: {}", ward.getWardName());
        return wardRepository.save(ward);
    }

    public Ward updateWard(String wardId, Ward ward) {
        log.debug("Updating ward with id: {}", wardId);
        return wardRepository.findById(wardId)
                .map(existingWard -> {
                    if (ward.getWardName() != null) {
                        existingWard.setWardName(ward.getWardName());
                    }
                    return wardRepository.save(existingWard);
                })
                .orElseThrow(() -> new RuntimeException("Ward not found with id: " + wardId));
    }

    public void deleteWard(String wardId) {
        log.debug("Deleting ward with id: {}", wardId);
        wardRepository.deleteById(wardId);
    }

    public boolean existsById(String wardId) {
        return wardRepository.existsById(wardId);
    }

    public List<Ward> searchWards(String name) {
        log.debug("Searching wards with name: {}", name);
        if (name == null || name.trim().isEmpty()) {
            return getAllWards();
        }
        return wardRepository.findByWardNameContainingIgnoreCase(name);
    }

    // Room operations
    public List<Room> getRoomsByWard(String wardId) {
        log.debug("Fetching rooms for ward: {}", wardId);
        return roomRepository.findByWardId(wardId);
    }

    public Optional<Room> getRoomById(Integer roomId) {
        log.debug("Fetching room by id: {}", roomId);
        return roomRepository.findById(roomId);
    }

    public Room saveRoom(Room room) {
        log.debug("Saving room: {}", room.getRoomNumber());
        return roomRepository.save(room);
    }

    public Room updateRoom(Integer roomId, Room room) {
        log.debug("Updating room with id: {}", roomId);
        return roomRepository.findById(roomId)
                .map(existingRoom -> {
                    if (room.getRoomId() != null) {
                        existingRoom.setRoomId(room.getRoomId());
                    }
                    if (room.getWardId() != null) {
                        existingRoom.setWardId(room.getWardId());
                    }
                    if (room.getRoomNumber() != null) {
                        existingRoom.setRoomNumber(room.getRoomNumber());
                    }
                    if (room.getRoomPerson() != null) {
                        existingRoom.setRoomPerson(room.getRoomPerson());
                    }
                    return roomRepository.save(existingRoom);
                })
                .orElseThrow(() -> new RuntimeException("Room not found with id: " + roomId));
    }

    public void deleteRoom(Integer roomId) {
        log.debug("Deleting room with id: {}", roomId);
        roomRepository.deleteById(roomId);
    }
}