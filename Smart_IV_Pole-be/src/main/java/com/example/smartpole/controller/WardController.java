package com.example.smartpole.controller;

import com.example.smartpole.entity.Room;
import com.example.smartpole.entity.Ward;
import com.example.smartpole.service.WardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/wards")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001", "http://localhost:3002", "http://localhost:5173"})
public class WardController {

    private final WardService wardService;

    // Ward endpoints
    @GetMapping
    public ResponseEntity<List<Ward>> getAllWards() {
        List<Ward> wards = wardService.getAllWards();
        return ResponseEntity.ok(wards);
    }

    @GetMapping("/{wardId}")
    public ResponseEntity<Ward> getWardById(@PathVariable String wardId) {
        Optional<Ward> ward = wardService.getWardById(wardId);
        return ward.map(ResponseEntity::ok)
                  .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/search")
    public ResponseEntity<List<Ward>> searchWards(@RequestParam(required = false) String name) {
        List<Ward> wards = wardService.searchWards(name);
        return ResponseEntity.ok(wards);
    }

    @PostMapping
    public ResponseEntity<Ward> createWard(@RequestBody Ward ward) {
        try {
            Ward savedWard = wardService.saveWard(ward);
            return ResponseEntity.status(HttpStatus.CREATED).body(savedWard);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/{wardId}")
    public ResponseEntity<Ward> updateWard(@PathVariable String wardId, @RequestBody Ward ward) {
        try {
            Ward updatedWard = wardService.updateWard(wardId, ward);
            return ResponseEntity.ok(updatedWard);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/{wardId}")
    public ResponseEntity<Void> deleteWard(@PathVariable String wardId) {
        try {
            wardService.deleteWard(wardId);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/{wardId}/exists")
    public ResponseEntity<Boolean> wardExists(@PathVariable String wardId) {
        boolean exists = wardService.existsById(wardId);
        return ResponseEntity.ok(exists);
    }

    // Room endpoints within ward
    @GetMapping("/{wardId}/rooms")
    public ResponseEntity<List<Room>> getRoomsByWard(@PathVariable String wardId) {
        List<Room> rooms = wardService.getRoomsByWard(wardId);
        return ResponseEntity.ok(rooms);
    }

    @PostMapping("/{wardId}/rooms")
    public ResponseEntity<Room> createRoom(@PathVariable String wardId, @RequestBody Room room) {
        try {
            room.setWardId(wardId); // Ensure room belongs to the specified ward
            Room savedRoom = wardService.saveRoom(room);
            return ResponseEntity.status(HttpStatus.CREATED).body(savedRoom);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
}