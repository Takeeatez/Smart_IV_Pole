# AWS Deployment Checklist

## Pre-Deployment Cleanup ✓

### 1. Security & Credentials
- [x] Database credentials moved to environment variables
- [x] application.yml uses env variables (SPRING_DATASOURCE_*, SERVER_PORT, etc.)
- [x] application-aws.yml created for production
- [x] .gitignore updated to exclude:
  - application.yml (contains dev credentials)
  - .env files
  - config files with credentials
- [x] .env.example files created for both backend and docker

### 2. Logging Cleanup
- [x] Removed emojis from backend logs (PoleScheduledTasks, Esp8266Controller)
- [x] Removed emojis from frontend logs (api.ts, storageService.ts)
- [ ] **TODO**: Review wardStore.ts for excessive logging (100+ console.log statements)
- [ ] **TODO**: Review App.tsx initialization logging
- [ ] **TODO**: Remove debug console.log from hooks (useMQTT.ts, useWebSocket.ts)

### 3. Code Cleanup
- [ ] **TODO**: Remove duplicate code patterns
- [ ] **TODO**: Delete unnecessary files:
  - Documentation files with emojis (ALGORITHM_IMPROVEMENTS.md, etc.)
  - Unused markdown files
  - Development troubleshooting guides (ESP8266_TROUBLESHOOTING.md)

## Environment Setup

### Backend (.env for Spring Boot)
```bash
# In Smart_IV_Pole-be/ directory
cp .env.example .env
# Edit .env with production credentials
```

Required variables:
- `DB_URL`: Database connection string
- `DB_USERNAME`: Database user
- `DB_PASSWORD`: Database password
- `SERVER_PORT`: Application port (default: 8081)
- `MQTT_BROKER_URL`: MQTT broker URL
- `LOG_LEVEL`: Logging level (INFO for production)

### Frontend (.env for Vite)
```bash
# In frontend/ directory
# Edit .env with production API URL
VITE_API_URL=https://your-backend-url.com/api/v1
```

### Docker (.env for Docker Compose)
```bash
# In project root
cp .env.docker.example .env
# Edit .env with secure passwords
```

## AWS Deployment Steps

### 1. Database Setup
- [ ] Create RDS MariaDB instance
- [ ] Configure security groups (port 3306)
- [ ] Update DB_URL in backend .env

### 2. Backend Deployment
- [ ] Build JAR: `./gradlew bootJar`
- [ ] Deploy to EC2 or Elastic Beanstalk
- [ ] Configure environment variables
- [ ] Set up MQTT broker (Mosquitto on EC2)
- [ ] Configure security groups (ports 8081, 1883)

### 3. Frontend Deployment
- [ ] Update VITE_API_URL in .env
- [ ] Build: `npm run build`
- [ ] Deploy to S3 + CloudFront or EC2
- [ ] Configure CORS on backend

### 4. Post-Deployment
- [ ] Test database connection
- [ ] Test MQTT broker connection
- [ ] Verify patient management workflow
- [ ] Test real-time monitoring
- [ ] Check logging (no emojis, no excessive logs)

## Security Checklist
- [ ] No hardcoded credentials in code
- [ ] All .env files in .gitignore
- [ ] Database uses strong passwords
- [ ] HTTPS enabled for frontend
- [ ] Backend API behind security group
- [ ] MQTT broker secured (if exposed)

## Testing Checklist
- [ ] Patient registration works
- [ ] Drug prescription workflow functional
- [ ] Ward monitoring displays correctly
- [ ] Real-time updates working
- [ ] Alerts system functional
- [ ] Pole connection management works

## Rollback Plan
If deployment fails:
1. Keep old production system running
2. Investigate issue using CloudWatch/EC2 logs
3. Fix and redeploy
4. Update DNS to point to new deployment

## Notes
- application.yml is now gitignored - use application-aws.yml for prod
- Local development: use localhost credentials
- Production: environment variables only
- All emojis removed from production logs
