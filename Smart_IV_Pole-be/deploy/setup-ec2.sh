#!/bin/bash

# EC2 초기 설정 스크립트
# EC2 인스턴스에서 실행: ssh ubuntu@your-ec2 'bash -s' < setup-ec2.sh

set -e

echo "======================================"
echo "EC2 초기 설정 시작"
echo "======================================"

# 시스템 업데이트
echo "[1/6] 시스템 업데이트..."
sudo apt-get update
sudo apt-get upgrade -y

# Java 21 설치
echo "[2/6] Java 21 설치..."
sudo apt-get install -y openjdk-21-jdk

# Nginx 설치
echo "[3/6] Nginx 설치..."
sudo apt-get install -y nginx

# 애플리케이션 디렉토리 생성
echo "[4/6] 애플리케이션 디렉토리 생성..."
sudo mkdir -p /opt/smart-iv-pole
sudo chown -R ubuntu:ubuntu /opt/smart-iv-pole

# systemd 서비스 파일 복사 (deploy.sh에서 업로드)
echo "[5/6] systemd 서비스 설정..."
# 이 단계는 deploy.sh에서 처리됨

# 방화벽 설정 (UFW)
echo "[6/6] 방화벽 설정..."
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw --force enable

echo "======================================"
echo "✅ EC2 초기 설정 완료!"
echo "======================================"
echo "Java 버전: $(java -version 2>&1 | head -n 1)"
echo "Nginx 상태: $(systemctl is-active nginx)"
echo ""
echo "다음 단계:"
echo "1. deploy.sh로 백엔드 배포"
echo "2. Nginx 설정 파일 업로드 및 활성화"
echo "3. Let's Encrypt SSL 인증서 설정 (선택사항)"
