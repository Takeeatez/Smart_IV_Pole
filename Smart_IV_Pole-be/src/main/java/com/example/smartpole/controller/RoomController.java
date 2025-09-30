package com.example.smartpole.controller;

import com.example.smartpole.entity.Room;
import com.example.smartpole.service.WardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/v1/rooms")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001", "http://localhost:3002", "http://localhost:5173"})
public class RoomController {

    private final WardService wardService;

    @GetMapping("/{roomId}")
    public ResponseEntity<Room> getRoomById(@PathVariable Integer roomId) {
        Optional<Room> room = wardService.getRoomById(roomId);
        return room.map(ResponseEntity::ok)
                  .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{roomId}")
    public ResponseEntity<Room> updateRoom(@PathVariable Integer roomId, @RequestBody Room room) {
        try {
            Room updatedRoom = wardService.updateRoom(roomId, room);
            return ResponseEntity.ok(updatedRoom);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/{roomId}")
    public ResponseEntity<Void> deleteRoom(@PathVariable Integer roomId) {
        try {
            wardService.deleteRoom(roomId);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }
}