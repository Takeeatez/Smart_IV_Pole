#!/bin/bash

echo "🚀 Starting Smart IV Pole MQTT System"
echo "======================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Start MQTT Broker with Docker Compose
echo -e "${YELLOW}1. Starting MQTT Broker (Mosquitto)...${NC}"
docker-compose up -d mosquitto
sleep 3

# Check if Mosquitto is running
if docker ps | grep -q smart-iv-mqtt-broker; then
    echo -e "${GREEN}✓ MQTT Broker is running${NC}"
else
    echo -e "${RED}✗ Failed to start MQTT Broker${NC}"
    exit 1
fi

# Step 2: Start MariaDB if not running
echo -e "${YELLOW}2. Starting MariaDB...${NC}"
docker-compose up -d mariadb
sleep 5

# Check if MariaDB is running
if docker ps | grep -q smart-iv-db; then
    echo -e "${GREEN}✓ MariaDB is running${NC}"
else
    echo -e "${RED}✗ Failed to start MariaDB${NC}"
    exit 1
fi

# Step 3: Install ESP32 Simulator dependencies
echo -e "${YELLOW}3. Installing ESP32 Simulator dependencies...${NC}"
cd esp32-simulator
npm install
cd ..
echo -e "${GREEN}✓ Dependencies installed${NC}"

# Step 4: Instructions for manual starts
echo ""
echo "======================================"
echo -e "${GREEN}MQTT System is ready!${NC}"
echo ""
echo "Now start the following in separate terminals:"
echo ""
echo "Terminal 1 - Backend Server:"
echo "  cd Smart_IV_Pole-be"
echo "  ./gradlew bootRun"
echo ""
echo "Terminal 2 - Frontend:"
echo "  cd frontend"
echo "  npm run dev"
echo ""
echo "Terminal 3 - ESP32 Simulator:"
echo "  cd esp32-simulator"
echo "  npm start"
echo ""
echo "======================================"
echo ""
echo "Monitoring:"
echo "  - MQTT Logs: docker logs -f smart-iv-mqtt-broker"
echo "  - MariaDB Logs: docker logs -f smart-iv-db"
echo ""
echo "Access Points:"
echo "  - Frontend: http://localhost:3001"
echo "  - Backend API: http://localhost:8081"
echo "  - MQTT Broker: localhost:1883"
echo "  - MQTT WebSocket: ws://localhost:9001"