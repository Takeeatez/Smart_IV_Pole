#!/bin/bash

# Smart IV Pole Backend Deployment Script for AWS EC2
# 사용법: ./deploy.sh [EC2_USER@EC2_HOST]
# 예시: ./deploy.sh ubuntu@ec2-13-125-123-45.ap-northeast-2.compute.amazonaws.com

set -e  # 오류 발생 시 스크립트 중단

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# EC2 정보
EC2_HOST=${1:-"ubuntu@your-ec2-instance.compute.amazonaws.com"}
APP_NAME="smart-iv-pole"
APP_DIR="/opt/${APP_NAME}"
JAR_NAME="smart-iv-pole-backend.jar"

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Smart IV Pole Backend Deployment${NC}"
echo -e "${GREEN}========================================${NC}"

# 1. Gradle 빌드
echo -e "\n${YELLOW}[1/5] Gradle 빌드 중...${NC}"
cd "$(dirname "$0")/.."
./gradlew clean build -x test

if [ ! -f "build/libs/*.jar" ]; then
    echo -e "${RED}❌ JAR 파일 생성 실패!${NC}"
    exit 1
fi

# JAR 파일 이름 변경
mv build/libs/*.jar build/libs/${JAR_NAME}
echo -e "${GREEN}✅ 빌드 완료: ${JAR_NAME}${NC}"

# 2. EC2에 애플리케이션 디렉토리 생성
echo -e "\n${YELLOW}[2/5] EC2 서버 디렉토리 준비 중...${NC}"
ssh ${EC2_HOST} "sudo mkdir -p ${APP_DIR} && sudo chown -R ubuntu:ubuntu ${APP_DIR}"

# 3. JAR 파일 업로드
echo -e "\n${YELLOW}[3/5] JAR 파일 업로드 중...${NC}"
scp build/libs/${JAR_NAME} ${EC2_HOST}:${APP_DIR}/

# 4. 환경 변수 파일 업로드 (있는 경우)
if [ -f ".env.production" ]; then
    echo -e "\n${YELLOW}[4/5] 환경 변수 파일 업로드 중...${NC}"
    scp .env.production ${EC2_HOST}:${APP_DIR}/.env
else
    echo -e "\n${YELLOW}[4/5] 환경 변수 파일 없음 (건너뛰기)${NC}"
fi

# 5. 서비스 재시작
echo -e "\n${YELLOW}[5/5] 애플리케이션 재시작 중...${NC}"
ssh ${EC2_HOST} << 'EOF'
    # 기존 프로세스 종료
    sudo systemctl stop smartpole || true

    # 새 서비스 시작
    sudo systemctl daemon-reload
    sudo systemctl start smartpole
    sudo systemctl enable smartpole

    # 상태 확인
    sleep 3
    sudo systemctl status smartpole --no-pager
EOF

echo -e "\n${GREEN}========================================${NC}"
echo -e "${GREEN}✅ 배포 완료!${NC}"
echo -e "${GREEN}========================================${NC}"
echo -e "애플리케이션 URL: http://${EC2_HOST#*@}"
echo -e "로그 확인: ssh ${EC2_HOST} 'sudo journalctl -u smartpole -f'"
echo -e "상태 확인: ssh ${EC2_HOST} 'sudo systemctl status smartpole'"
