package com.example.smartpole.dto;

/**
 * 약품 유형(DrugType)에 대한 데이터 전달 객체.
 * - Controller ↔ Service ↔ View 계층 간에 ID와 명칭을 전달.
 * - 엔티티(DrugType)에서 필요한 필드만 노출하여 의존도를 낮춤.
 * - 직렬화/역직렬화(예: JSON) 시 기본 생성자 필수.
 */
public class DrugTypeDTO {
    /** 약품 식별자(자동 증가 PK). null이면 아직 미생성 상태로 간주. */
    private Integer dripId;
    /** 약품명. DB 제약: NOT NULL, UNIQUE, 최대 100자. */
    private String dripName;

    /**
     * 직렬화/역직렬화 프레임워크용 기본 생성자.
     * 프레임워크가 리플렉션으로 인스턴스를 생성할 때 사용.
     */
    public DrugTypeDTO() {
    }

    /**
     * 모든 필드를 초기화하는 생성자.
     * @param dripId 약품 식별자(PK). 생성 시 null 가능.
     * @param dripName 약품명. 공백/중복은 서비스 레이어에서 검증.
     */
    public DrugTypeDTO(Integer dripId, String dripName) {
        this.dripId = dripId;
        this.dripName = dripName;
    }

    /**
     * @return 약품 식별자(PK). 아직 저장 전이면 null일 수 있음.
     */
    public Integer getDripId() {
        return dripId;
    }

    /**
     * 약품 식별자(PK)를 설정.
     * 일반적으로 영속화 이후 값이 부여되므로 수동 설정은 지양.
     * @param dripId 식별자
     */
    public void setDripId(Integer dripId) {
        this.dripId = dripId;
    }

    /**
     * @return 약품명
     */
    public String getDripName() {
        return dripName;
    }

    /**
     * 약품명을 설정.
     * 유효성(공백, 길이, 중복)은 서비스/검증 레이어에서 처리 권장.
     * @param dripName 약품명
     */
    public void setDripName(String dripName) {
        this.dripName = dripName;
    }
}