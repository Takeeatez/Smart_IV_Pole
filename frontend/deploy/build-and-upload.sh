#!/bin/bash

# Smart IV Pole Frontend Deployment Script for AWS S3 + CloudFront
# 사용법: ./build-and-upload.sh [S3_BUCKET_NAME]
# 예시: ./build-and-upload.sh smart-iv-pole-frontend

set -e

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# S3 버킷 이름
S3_BUCKET=${1:-"smart-iv-pole-frontend"}
CLOUDFRONT_ID=${2:-""}  # CloudFront Distribution ID (선택사항)

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Smart IV Pole Frontend Deployment${NC}"
echo -e "${GREEN}========================================${NC}"

# 1. 환경 변수 확인
echo -e "\n${YELLOW}[1/5] 환경 변수 확인...${NC}"
if [ ! -f ".env.production" ]; then
    echo -e "${RED}❌ .env.production 파일이 없습니다!${NC}"
    echo -e "${YELLOW}💡 .env.production.example을 복사하여 .env.production을 생성하세요.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ 환경 변수 파일 확인 완료${NC}"
cat .env.production

# 2. 의존성 설치
echo -e "\n${YELLOW}[2/5] 의존성 설치 중...${NC}"
cd "$(dirname "$0")/.."
npm install

# 3. 프로덕션 빌드
echo -e "\n${YELLOW}[3/5] 프로덕션 빌드 중...${NC}"
npm run build

if [ ! -d "dist" ]; then
    echo -e "${RED}❌ 빌드 실패! dist 디렉토리가 없습니다.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ 빌드 완료: dist/${NC}"

# 4. S3 버킷 존재 확인 및 생성
echo -e "\n${YELLOW}[4/5] S3 버킷 확인 중...${NC}"
if aws s3 ls "s3://${S3_BUCKET}" 2>&1 | grep -q 'NoSuchBucket'; then
    echo -e "${YELLOW}버킷이 없습니다. 생성 중...${NC}"
    aws s3 mb "s3://${S3_BUCKET}" --region ap-northeast-2

    # 정적 웹 호스팅 활성화
    aws s3 website "s3://${S3_BUCKET}" \
        --index-document index.html \
        --error-document index.html

    # 퍼블릭 액세스 허용
    aws s3api put-bucket-policy --bucket "${S3_BUCKET}" --policy "{
        \"Version\": \"2012-10-17\",
        \"Statement\": [{
            \"Sid\": \"PublicReadGetObject\",
            \"Effect\": \"Allow\",
            \"Principal\": \"*\",
            \"Action\": \"s3:GetObject\",
            \"Resource\": \"arn:aws:s3:::${S3_BUCKET}/*\"
        }]
    }"

    echo -e "${GREEN}✅ S3 버킷 생성 완료${NC}"
else
    echo -e "${GREEN}✅ S3 버킷 존재 확인${NC}"
fi

# 5. S3 업로드
echo -e "\n${YELLOW}[5/5] S3 업로드 중...${NC}"
aws s3 sync dist/ "s3://${S3_BUCKET}" \
    --delete \
    --cache-control "public, max-age=31536000" \
    --exclude "index.html" \
    --exclude "*.map"

# index.html은 캐싱 비활성화 (항상 최신 버전)
aws s3 cp dist/index.html "s3://${S3_BUCKET}/index.html" \
    --cache-control "no-cache, no-store, must-revalidate"

echo -e "${GREEN}✅ S3 업로드 완료${NC}"

# CloudFront 캐시 무효화 (Distribution ID가 있는 경우)
if [ -n "$CLOUDFRONT_ID" ]; then
    echo -e "\n${YELLOW}[6/5] CloudFront 캐시 무효화 중...${NC}"
    aws cloudfront create-invalidation \
        --distribution-id "$CLOUDFRONT_ID" \
        --paths "/*"
    echo -e "${GREEN}✅ CloudFront 캐시 무효화 완료${NC}"
fi

echo -e "\n${GREEN}========================================${NC}"
echo -e "${GREEN}✅ 배포 완료!${NC}"
echo -e "${GREEN}========================================${NC}"
echo -e "S3 웹사이트 URL: http://${S3_BUCKET}.s3-website-ap-northeast-2.amazonaws.com"
if [ -n "$CLOUDFRONT_ID" ]; then
    echo -e "CloudFront URL: https://${CLOUDFRONT_ID}.cloudfront.net"
fi
echo -e "\n${YELLOW}다음 단계:${NC}"
echo -e "1. CloudFront 배포 생성 (아직 안 했다면)"
echo -e "2. 도메인 연결 (Route 53 또는 외부 DNS)"
echo -e "3. HTTPS 인증서 설정 (ACM)"
