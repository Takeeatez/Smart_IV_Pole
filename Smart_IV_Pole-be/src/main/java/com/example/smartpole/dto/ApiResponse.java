package com.example.smartpole.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ApiResponse<T> {
    private boolean success;
    private T data;
    private String error;
    private String message;

    // 성공 응답 생성자
    public static <T> ApiResponse<T> success(T data) {
        return new ApiResponse<>(true, data, null, null);
    }

    public static <T> ApiResponse<T> success(T data, String message) {
        return new ApiResponse<>(true, data, null, message);
    }

    // 실패 응답 생성자
    public static <T> ApiResponse<T> error(String error) {
        return new ApiResponse<>(false, null, error, null);
    }

    public static <T> ApiResponse<T> error(String error, String message) {
        return new ApiResponse<>(false, null, error, message);
    }
}