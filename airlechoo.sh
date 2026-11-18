#!/usr/bin/env bash
# ==============================================================================
# AIRLECHOO — Autonomous AI Agentic IDE & Assistant Launcher
# Controls Go IDE Bridge (:1234), Antigravity Hub (:1235),
# Termux Terminal Bridge (:1236), and Web UI Server (:8080)
# ==============================================================================

set -e

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOGS_DIR="$HOME/logs"
mkdir -p "$LOGS_DIR"

GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BOLD='\033[1m'
NC='\033[0m'

PORT_WEB=8080
PORT_BRIDGE=1234
PORT_HUB=1235
PORT_TERM=1236

TOKEN="mc6johzi7t8l"
if [ -f "$HOME/.antigem_bridge/csrf_token.txt" ]; then
    TOKEN="$(cat "$HOME/.antigem_bridge/csrf_token.txt" | tr -d '[:space:]')"
fi

header() {
    echo -e "${CYAN}============================================================${NC}"
    echo -e "${GREEN}${BOLD}  ⚡ AIRLECHOO — AI Agentic Assistant & Workspace${NC}"
    echo -e "${CYAN}============================================================${NC}"
}

is_port_open() {
    local port=$1
    python3 -c "import socket; s = socket.socket(); s.settimeout(0.4); exit(0 if s.connect_ex(('127.0.0.1', $port)) == 0 else 1)" 2>/dev/null
}

start_services() {
    header
    echo -e "${BOLD}🚀 Starting AIRLECHOO services...${NC}\n"

    # 1. Start or check Go IDE Bridge
    if is_port_open "$PORT_BRIDGE"; then
        echo -e "  [${GREEN}✔${NC}] Go IDE Server already running on port ${BOLD}$PORT_BRIDGE${NC}"
    else
        echo -e "  [..] Starting Go IDE Server & Antigravity Hub..."
        BRIDGE_BIN="/data/user/0/com.termux/files/usr/bin/agy_ide_bridge"
        if [ ! -f "$BRIDGE_BIN" ]; then
            BRIDGE_BIN="$PREFIX/bin/agy_ide_bridge"
        fi
        
        if [ -x "$BRIDGE_BIN" ]; then
            nohup "$BRIDGE_BIN" -p "$PORT_BRIDGE" -f > "$LOGS_DIR/airlechoo_bridge.log" 2>&1 &
            sleep 2
            if is_port_open "$PORT_BRIDGE"; then
                echo -e "  [${GREEN}✔${NC}] Go IDE Server started on port ${BOLD}$PORT_BRIDGE${NC}"
            else
                echo -e "  [${YELLOW}⚠️${NC}] Go IDE Server starting in background (check $LOGS_DIR/airlechoo_bridge.log)"
            fi
        else
            echo -e "  [${RED}✗${NC}] Go bridge binary not found at $BRIDGE_BIN"
        fi
    fi

    # 2. Start Termux Terminal Bridge (:1236)
    if is_port_open "$PORT_TERM"; then
        echo -e "  [${GREEN}✔${NC}] Termux Terminal Bridge already running on port ${BOLD}$PORT_TERM${NC}"
    else
        echo -e "  [..] Starting Termux Terminal Bridge (:1236)..."
        nohup python3 "$DIR/server/terminal_bridge.py" > "$LOGS_DIR/airlechoo_terminal.log" 2>&1 &
        sleep 1
        if is_port_open "$PORT_TERM"; then
            echo -e "  [${GREEN}✔${NC}] Termux Terminal Bridge started on port ${BOLD}$PORT_TERM${NC}"
        else
            echo -e "  [${YELLOW}⚠️${NC}] Terminal Bridge starting in background"
        fi
    fi

    # 3. Start Web UI Server (:8080)
    if is_port_open "$PORT_WEB"; then
        echo -e "  [${GREEN}✔${NC}] Web UI Server already running on port ${BOLD}$PORT_WEB${NC}"
    else
        echo -e "  [..] Starting Web UI Server (:8080)..."
        nohup python3 -m http.server "$PORT_WEB" --directory "$DIR" > "$LOGS_DIR/airlechoo_web.log" 2>&1 &
        sleep 1
        if is_port_open "$PORT_WEB"; then
            echo -e "  [${GREEN}✔${NC}] Web UI Server started on port ${BOLD}$PORT_WEB${NC}"
        else
            echo -e "  [${YELLOW}⚠️${NC}] Web UI Server starting in background"
        fi
    fi

    echo -e "\n${CYAN}------------------------------------------------------------${NC}"
    echo -e "  ${BOLD}📱 Open Echoo in your phone's browser:${NC}"
    echo -e "     👉 ${GREEN}${BOLD}http://localhost:${PORT_WEB}${NC}"
    echo -e "     👉 ${GREEN}${BOLD}http://127.0.0.1:${PORT_WEB}${NC}"
    echo -e ""
    echo -e "  ${BOLD}🔗 Service Status:${NC}"
    echo -e "     • Antigravity Hub: ${GREEN}http://127.0.0.1:${PORT_HUB}${NC}"
    echo -e "     • Go IDE Bridge:   ${GREEN}http://127.0.0.1:${PORT_BRIDGE}${NC}"
    echo -e "     • Terminal Bridge: ${GREEN}http://127.0.0.1:${PORT_TERM}${NC}"
    echo -e "     • Security Token:  ${YELLOW}${TOKEN}${NC}"
    echo -e "${CYAN}============================================================${NC}"
}

stop_services() {
    header
    echo -e "${BOLD}🛑 Stopping AIRLECHOO services...${NC}\n"
    
    pkill -f "terminal_bridge.py" 2>/dev/null && echo -e "  [${GREEN}✔${NC}] Stopped Terminal Bridge" || true
    pkill -f "http.server $PORT_WEB" 2>/dev/null && echo -e "  [${GREEN}✔${NC}] Stopped Web UI Server" || true
    echo -e "\n${GREEN}Done.${NC}"
}

status_services() {
    header
    echo -e "${BOLD}📊 AIRLECHOO Service Health Check:${NC}\n"

    printf "  %-25s %-15s %s\n" "Service" "Port" "Status"
    echo -e "  --------------------------------------------------"

    check_line() {
        local name=$1
        local port=$2
        if is_port_open "$port"; then
            printf "  %-25s %-15s ${GREEN}ONLINE${NC}\n" "$name" "$port"
        else
            printf "  %-25s %-15s ${RED}OFFLINE${NC}\n" "$name" "$port"
        fi
    }

    check_line "Web UI (Echoo)" "$PORT_WEB"
    check_line "Go IDE Server" "$PORT_BRIDGE"
    check_line "Antigravity Hub" "$PORT_HUB"
    check_line "Terminal Bridge" "$PORT_TERM"

    echo -e "\n  • Active Token: ${YELLOW}$TOKEN${NC}"
    echo -e "  • Web URL:      ${GREEN}http://localhost:$PORT_WEB${NC}"
    echo -e "${CYAN}============================================================${NC}"
}

case "$1" in
    start)
        start_services
        ;;
    stop)
        stop_services
        ;;
    restart)
        stop_services
        sleep 1
        start_services
        ;;
    status)
        status_services
        ;;
    *)
        start_services
        ;;
esac
