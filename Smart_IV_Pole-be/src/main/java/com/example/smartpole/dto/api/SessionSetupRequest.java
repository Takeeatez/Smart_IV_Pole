package com.example.smartpole.dto.api;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import jakarta.validation.constraints.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SessionSetupRequest {

    @NotBlank(message = "환자 ID는 필수입니다")
    private String patientId;

    @NotBlank(message = "폴대 ID는 필수입니다")
    private String poleId;

    @NotBlank(message = "약품 종류는 필수입니다")
    private String drugType;

    @NotNull(message = "초기 용량은 필수입니다")
    @Positive(message = "초기 용량은 양수여야 합니다")
    private Double initialVolume;  // mL

    @NotNull(message = "초기 무게는 필수입니다")
    @Positive(message = "초기 무게는 양수여야 합니다")
    private Double initialWeight;  // g

    @NotNull(message = "처방 투여 시간은 필수입니다")
    @Min(value = 1, message = "투여 시간은 최소 1분 이상이어야 합니다")
    private Integer prescribedDuration;  // 분

    @NotNull(message = "처방 방울 수는 필수입니다")
    @Min(value = 1, message = "방울 수는 최소 1 이상이어야 합니다")
    private Integer prescribedDripRate;  // GTT

    @NotNull(message = "GTT 계수는 필수입니다")
    @Pattern(regexp = "20|60", message = "GTT 계수는 20 또는 60이어야 합니다")
    private String gttFactor;  // "20" or "60"

    @NotBlank(message = "간호사 ID는 필수입니다")
    private String nurseId;

    @Size(max = 500, message = "특이사항은 500자 이내로 입력해주세요")
    private String notes;
}