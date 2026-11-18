#!/usr/bin/env bash
# ==============================================================================
# AIRLECHOO — Android APK Build Script
# Builds full-stack standalone Android APK with embedded Termux, Go bridge,
# Antigravity Hub, and Echoo UI.
# ==============================================================================

set -e

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$DIR/android"

GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BOLD='\033[1m'
NC='\033[0m'

echo -e "${CYAN}============================================================${NC}"
echo -e "${GREEN}${BOLD}  📦 AIRLECHOO — Building Full-Power Standalone Android APK${NC}"
echo -e "${CYAN}============================================================${NC}"

# Check Java
if command -v java >/dev/null 2>&1; then
    JAVA_VER=$(java -version 2>&1 | head -n 1)
    echo -e "  [${GREEN}✔${NC}] Java: ${BOLD}$JAVA_VER${NC}"
else
    echo -e "  [${YELLOW}⚠️${NC}] Java is not installed in current environment."
    echo -e "       To build on this machine, install OpenJDK 17:"
    echo -e "       ${YELLOW}pkg install openjdk-17${NC}"
    echo -e "\n  ${BOLD}Alternatively, build on PC with Android Studio:${NC}"
    echo -e "  1. Open folder ${BOLD}$DIR/android${NC} in Android Studio"
    echo -e "  2. Select build variant: ${BOLD}termuxDebug${NC} or ${BOLD}standardDebug${NC}"
    echo -e "  3. Click ${BOLD}Build → Build APK(s)${NC}\n"
    exit 0
fi

# Ensure assets are up to date
echo -e "  [..] Syncing latest Echoo Web UI assets into Android bundle..."
mkdir -p app/src/main/assets/web
cp -r ../index.html ../manifest.json ../sw.js ../src ../assets app/src/main/assets/web/

# Make gradlew executable
chmod +x ./gradlew

# Execute Gradle build for Termux flavor
echo -e "  [..] Executing Gradle build: ${BOLD}assembleTermuxDebug${NC}..."
./gradlew assembleTermuxDebug

APK_PATH="app/build/outputs/apk/termux/debug/app-termux-debug.apk"

if [ -f "$APK_PATH" ]; then
    echo -e "\n${CYAN}============================================================${NC}"
    echo -e "${GREEN}${BOLD}  🎉 APK BUILD SUCCESSFUL!${NC}"
    echo -e "${CYAN}============================================================${NC}"
    echo -e "  • APK Path: ${BOLD}$DIR/android/$APK_PATH${NC}"
    echo -e "  • Size:     ${YELLOW}$(ls -lh "$APK_PATH" | awk '{print $5}')${NC}"
    echo -e "\n  Install on your phone using:"
    echo -e "  ${BOLD}termux-open $DIR/android/$APK_PATH${NC}"
    echo -e "${CYAN}============================================================${NC}"
else
    echo -e "\n${RED}Build failed: APK not found at $APK_PATH${NC}"
    exit 1
fi
