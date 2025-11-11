# 🔐 Security Setup Guide

This guide explains how to set up credentials and sensitive configuration for the Smart IV Pole project.

## ⚠️ Important Security Notice

**NEVER commit the following files to git:**
- `.env` files (except `.example` files)
- `application.yml` with real credentials
- `hardware/config.h` with real WiFi passwords
- Any file containing passwords, API keys, or sensitive data

## 📋 Setup Checklist

### 1. Backend Configuration (Spring Boot)

**Location**: `Smart_IV_Pole-be/.env`

```bash
# Create .env file from example
cd Smart_IV_Pole-be/
cp .env.example .env

# Edit .env with your actual credentials
nano .env
```

**Required credentials:**
- `SPRING_DATASOURCE_URL` - MariaDB connection URL
- `SPRING_DATASOURCE_USERNAME` - Database username
- `SPRING_DATASOURCE_PASSWORD` - Database password
- `MQTT_BROKER_URL` - MQTT broker URL (if using)

**Verification:**
```bash
# Check that .env is ignored by git
git status | grep .env
# Should show: nothing (file is ignored)

# application.yml should use environment variables
grep "SPRING_DATASOURCE" Smart_IV_Pole-be/src/main/resources/application.yml
# Should show: ${SPRING_DATASOURCE_PASSWORD:...}
```

### 2. ESP32 WiFi Configuration

**Location**: `hardware/config.h`

```bash
# Create config.h from example
cd hardware/
cp config.h.example config.h

# Edit config.h with your WiFi credentials
nano config.h
```

**Required credentials:**
- `ssid` - Your WiFi network name
- `password` - Your WiFi password
- `serverHost` - Backend server IP/domain
- `serverPort` - Backend server port (default: 8081)

**Verification:**
```bash
# Check that config.h is ignored by git
git status | grep config.h
# Should show: ?? config.h.example (only example file)

# sketch_sep12a.ino should include config.h
grep '#include "config.h"' hardware/sketch_sep12a.ino
# Should show: #include "config.h"
```

### 3. Docker Compose Configuration (Optional)

**Location**: `.env.docker` (root directory)

```bash
# Create .env.docker from example
cp .env.docker.example .env.docker

# Edit with your Docker credentials
nano .env.docker
```

**Required credentials:**
- `MYSQL_ROOT_PASSWORD` - MariaDB root password
- `MYSQL_PASSWORD` - Application database password

**Usage:**
```bash
# Docker Compose will automatically load .env.docker
docker-compose --env-file .env.docker up -d
```

## 🔍 Security Verification

Run these commands to verify your security setup:

```bash
# 1. Check .gitignore coverage
echo "Checking .gitignore..."
git check-ignore -v Smart_IV_Pole-be/.env
git check-ignore -v hardware/config.h
git check-ignore -v .env.docker

# 2. Verify no sensitive files are tracked
echo "Checking for tracked sensitive files..."
git ls-files | grep -E "(\.env$|config\.h$|application\.yml$)"
# Should only show: application.yml.example (if any)

# 3. Search for hardcoded passwords (should return nothing)
echo "Scanning for hardcoded credentials..."
grep -r "password.*=" --include="*.java" --include="*.ts" --include="*.ino" Smart_IV_Pole-be/src frontend/src hardware/ | grep -v "example" | grep -v "TODO"
```

## 🚀 Development Workflow

### Starting the Project

1. **Backend**:
   ```bash
   cd Smart_IV_Pole-be/
   # Ensure .env exists with correct credentials
   ./gradlew bootRun
   ```

2. **Frontend**:
   ```bash
   cd frontend/
   npm install
   npm run dev
   ```

3. **ESP32**:
   ```bash
   # Ensure hardware/config.h exists
   # Upload sketch_sep12a.ino via Arduino IDE or PlatformIO
   ```

### Adding New Team Members

1. **Share example files only** (committed to git):
   - `.env.example`
   - `config.h.example`
   - `.env.docker.example`
   - `application.yml.example`

2. **Team member creates their own credential files**:
   ```bash
   cp Smart_IV_Pole-be/.env.example Smart_IV_Pole-be/.env
   cp hardware/config.h.example hardware/config.h
   # Edit files with actual credentials
   ```

3. **Never share actual credential files** via:
   - Git commits
   - Slack/Discord messages
   - Email
   - Screenshots

## 🛡️ Git Protection

### Pre-commit Checks

Add this to `.git/hooks/pre-commit` to prevent accidental commits:

```bash
#!/bin/bash

# Check for sensitive files
SENSITIVE_FILES="Smart_IV_Pole-be/.env hardware/config.h .env.docker"

for file in $SENSITIVE_FILES; do
    if git diff --cached --name-only | grep -q "^$file$"; then
        echo "ERROR: Attempting to commit sensitive file: $file"
        echo "This file contains credentials and should not be committed!"
        exit 1
    fi
done

# Check for hardcoded passwords
if git diff --cached | grep -iE "password.*=.*['\"](?!.*example|.*TODO|.*your_)"; then
    echo "WARNING: Possible hardcoded password detected in staged changes"
    echo "Please use environment variables instead"
    exit 1
fi

exit 0
```

Make it executable:
```bash
chmod +x .git/hooks/pre-commit
```

## 📝 Environment Variable Reference

### Backend (.env)
| Variable | Description | Example |
|----------|-------------|---------|
| `SPRING_DATASOURCE_URL` | Database JDBC URL | `jdbc:mariadb://localhost:3306/smartpole` |
| `SPRING_DATASOURCE_USERNAME` | DB username | `smartpole_user` |
| `SPRING_DATASOURCE_PASSWORD` | DB password | `secure_password_123` |
| `MQTT_BROKER_URL` | MQTT broker | `tcp://localhost:1883` |
| `SERVER_PORT` | Backend port | `8081` |

### ESP32 (config.h)
| Variable | Description | Example |
|----------|-------------|---------|
| `ssid` | WiFi SSID | `MyWiFiNetwork` |
| `password` | WiFi password | `wifi_password_123` |
| `serverHost` | Backend IP/domain | `192.168.1.100` or `api.example.com` |
| `serverPort` | Backend port | `8081` |

### Docker (.env.docker)
| Variable | Description | Example |
|----------|-------------|---------|
| `MYSQL_ROOT_PASSWORD` | MariaDB root password | `root_password_123` |
| `MYSQL_DATABASE` | Database name | `smart_iv_pole` |
| `MYSQL_USER` | Application DB user | `smart_iv_user` |
| `MYSQL_PASSWORD` | Application DB password | `user_password_123` |

## ❓ Troubleshooting

### "Application fails to start - database connection error"
- Check `Smart_IV_Pole-be/.env` file exists
- Verify database credentials are correct
- Ensure MariaDB is running and accessible

### "ESP32 fails to connect to WiFi"
- Check `hardware/config.h` file exists
- Verify WiFi SSID and password are correct
- Ensure WiFi network is 2.4GHz (ESP8266 doesn't support 5GHz)

### "Git trying to commit .env file"
- Run: `git rm --cached Smart_IV_Pole-be/.env`
- Verify `.gitignore` includes `*.env` pattern
- Never use `git add -f` to force-add ignored files

### "Missing environment variables error"
- Check `.env` file is in correct directory
- Ensure variable names match exactly (case-sensitive)
- Verify no extra spaces around `=` in `.env` files

## 📞 Support

If you encounter security-related issues:
1. **Do NOT** share actual credentials in issue reports
2. Use example values when reporting problems
3. Contact team lead for credential verification

## 🔄 Updates

**Last Updated**: 2025-01-11
**Version**: 1.0
**Security Review**: Required before production deployment
