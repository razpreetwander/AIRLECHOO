#!/usr/bin/env python3
"""
AIRLECHOO Termux Terminal Bridge
Provides real interactive PTY and one-off command execution over HTTP & WebSocket
Zero external dependencies - uses standard Python 3 libraries.
"""

import os
import sys
import pty
import tty
import termios
import struct
import fcntl
import select
import subprocess
import json
import base64
import hashlib
import threading
import time
from http.server import HTTPServer, BaseHTTPRequestHandler
from socketserver import ThreadingMixIn

HOST = "127.0.0.1"
PORT = 1236

SHELL_CANDIDATES = [
    "/data/data/com.termux/files/usr/bin/bash",
    "/data/data/com.termux/files/usr/bin/zsh",
    "/data/data/com.termux/files/usr/bin/sh",
    "/bin/bash",
    "/bin/sh"
]

def find_shell():
    for sh in SHELL_CANDIDATES:
        if os.path.exists(sh) and os.access(sh, os.X_OK):
            return sh
    return "/bin/sh"

# Store active PTY sessions: session_id -> { "master": fd, "pid": pid, "clients": [] }
ACTIVE_PTY_SESSIONS = {}
SESSIONS_LOCK = threading.Lock()

class TerminalSession:
    def __init__(self, cols=80, rows=24, cwd=None):
        self.cols = cols
        self.rows = rows
        self.cwd = cwd or os.environ.get("HOME", "/data/data/com.termux/files/home")
        self.shell = find_shell()
        self.id = os.urandom(8).hex()
        self.closed = False
        self.listeners = []
        self.lock = threading.Lock()

        # Open PTY
        self.master_fd, self.slave_fd = pty.openpty()
        self.set_size(cols, rows)

        # Environment
        env = os.environ.copy()
        env["TERM"] = "xterm-256color"
        env["COLORTERM"] = "truecolor"
        if "PREFIX" not in env and os.path.exists("/data/data/com.termux/files/usr"):
            env["PREFIX"] = "/data/data/com.termux/files/usr"
        
        # Fork child process
        self.pid = os.fork()
        if self.pid == 0:
            # Child process
            os.close(self.master_fd)
            os.setsid()
            os.dup2(self.slave_fd, 0)
            os.dup2(self.slave_fd, 1)
            os.dup2(self.slave_fd, 2)
            if self.slave_fd > 2:
                os.close(self.slave_fd)
            
            try:
                os.chdir(self.cwd)
            except Exception:
                pass
            
            os.execvpe(self.shell, [self.shell, "-l"], env)
            sys.exit(1)
        else:
            # Parent process
            os.close(self.slave_fd)
            # Start background reader thread
            self.reader_thread = threading.Thread(target=self._read_loop, daemon=True)
            self.reader_thread.start()

    def set_size(self, cols, rows):
        self.cols = cols
        self.rows = rows
        try:
            winsize = struct.pack("HHHH", rows, cols, 0, 0)
            fcntl.ioctl(self.master_fd, termios.TIOCSWINSZ, winsize)
        except Exception:
            pass

    def write(self, data):
        if self.closed:
            return
        try:
            if isinstance(data, str):
                data = data.encode("utf-8")
            os.write(self.master_fd, data)
        except Exception:
            self.close()

    def _read_loop(self):
        while not self.closed:
            try:
                r, _, _ = select.select([self.master_fd], [], [], 0.2)
                if self.master_fd in r:
                    data = os.read(self.master_fd, 4096)
                    if not data:
                        break
                    with self.lock:
                        for listener in list(self.listeners):
                            try:
                                listener(data)
                            except Exception:
                                self.listeners.remove(listener)
            except (OSError, ValueError):
                break
        self.close()

    def add_listener(self, callback):
        with self.lock:
            self.listeners.append(callback)

    def remove_listener(self, callback):
        with self.lock:
            if callback in self.listeners:
                self.listeners.remove(callback)

    def close(self):
        if self.closed:
            return
        self.closed = True
        try:
            os.close(self.master_fd)
        except Exception:
            pass
        try:
            os.kill(self.pid, 15) # SIGTERM
        except Exception:
            pass
        with SESSIONS_LOCK:
            if self.id in ACTIVE_PTY_SESSIONS:
                del ACTIVE_PTY_SESSIONS[self.id]

def parse_ws_frame(data):
    if len(data) < 2:
        return None, 0
    byte1, byte2 = data[0], data[1]
    fin = (byte1 & 0x80) != 0
    opcode = byte1 & 0x0f
    is_masked = (byte2 & 0x80) != 0
    payload_len = byte2 & 0x7f

    offset = 2
    if payload_len == 126:
        if len(data) < 4:
            return None, 0
        payload_len = struct.unpack("!H", data[2:4])[0]
        offset = 4
    elif payload_len == 127:
        if len(data) < 10:
            return None, 0
        payload_len = struct.unpack("!Q", data[2:10])[0]
        offset = 10

    mask = None
    if is_masked:
        if len(data) < offset + 4:
            return None, 0
        mask = data[offset:offset+4]
        offset += 4

    if len(data) < offset + payload_len:
        return None, 0

    payload = bytearray(data[offset:offset+payload_len])
    if is_masked and mask:
        for i in range(len(payload)):
            payload[i] ^= mask[i % 4]

    total_len = offset + payload_len
    return (opcode, bytes(payload)), total_len

def make_ws_frame(payload, opcode=0x01):
    if isinstance(payload, str):
        payload = payload.encode("utf-8")
    length = len(payload)
    frame = bytearray()
    frame.append(0x80 | (opcode & 0x0f))

    if length <= 125:
        frame.append(length)
    elif length <= 65535:
        frame.append(126)
        frame.extend(struct.pack("!H", length))
    else:
        frame.append(127)
        frame.extend(struct.pack("!Q", length))

    frame.extend(payload)
    return bytes(frame)

class ThreadedHTTPServer(ThreadingMixIn, HTTPServer):
    daemon_threads = True

class BridgeHandler(BaseHTTPRequestHandler):
    def send_cors_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization, *")

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_cors_headers()
        self.end_headers()

    def do_GET(self):
        if self.path == "/api/terminal/health":
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_cors_headers()
            self.end_headers()
            self.wfile.write(json.dumps({
                "status": "ok",
                "shell": find_shell(),
                "time": time.time()
            }).encode("utf-8"))
            return

        # WebSocket Upgrade for interactive PTY
        if self.headers.get("Upgrade", "").lower() == "websocket":
            self.handle_websocket()
            return

        self.send_response(404)
        self.end_headers()

    def do_POST(self):
        if self.path == "/api/terminal/exec":
            content_len = int(self.headers.get("Content-Length", 0))
            body = self.rfile.read(content_len) if content_len > 0 else b"{}"
            try:
                data = json.loads(body.decode("utf-8"))
            except Exception:
                data = {}

            cmd = data.get("command", "")
            cwd = data.get("cwd") or os.environ.get("HOME", "/data/data/com.termux/files/home")
            timeout = min(data.get("timeout", 60), 300)

            if not cmd:
                self.send_response(400)
                self.send_header("Content-Type", "application/json")
                self.send_cors_headers()
                self.end_headers()
                self.wfile.write(json.dumps({"error": "Missing command"}).encode("utf-8"))
                return

            try:
                sh = find_shell()
                res = subprocess.run(
                    [sh, "-c", cmd],
                    cwd=cwd,
                    capture_output=True,
                    text=True,
                    timeout=timeout
                )
                resp = {
                    "exit_code": res.returncode,
                    "stdout": res.stdout,
                    "stderr": res.stderr,
                    "command": cmd
                }
                status_code = 200
            except subprocess.TimeoutExpired:
                resp = {"exit_code": 124, "stdout": "", "stderr": "Command timed out", "command": cmd}
                status_code = 408
            except Exception as e:
                resp = {"exit_code": 1, "stdout": "", "stderr": str(e), "command": cmd}
                status_code = 500

            self.send_response(status_code)
            self.send_header("Content-Type", "application/json")
            self.send_cors_headers()
            self.end_headers()
            self.wfile.write(json.dumps(resp).encode("utf-8"))
            return

        self.send_response(404)
        self.end_headers()

    def handle_websocket(self):
        ws_key = self.headers.get("Sec-WebSocket-Key", "")
        if not ws_key:
            self.send_response(400)
            self.end_headers()
            return

        guid = "258EAFA5-E914-47DA-95CA-C5AB0DC85B11"
        accept = base64.b64encode(hashlib.sha1((ws_key + guid).encode("utf-8")).digest()).decode("utf-8")

        self.send_response(101)
        self.send_header("Upgrade", "websocket")
        self.send_header("Connection", "Upgrade")
        self.send_header("Sec-WebSocket-Accept", accept)
        self.end_headers()

        # Start interactive PTY session
        session = TerminalSession(cols=80, rows=24)
        with SESSIONS_LOCK:
            ACTIVE_PTY_SESSIONS[session.id] = session

        sock = self.request
        sock.setblocking(True)

        # Forward PTY output to WebSocket client
        def on_pty_data(data):
            try:
                frame = make_ws_frame(data, opcode=0x02) # binary or text
                sock.sendall(frame)
            except Exception:
                pass

        session.add_listener(on_pty_data)

        # Read frames from WebSocket and forward to PTY
        buf = bytearray()
        try:
            while not session.closed:
                chunk = sock.recv(4096)
                if not chunk:
                    break
                buf.extend(chunk)
                while True:
                    frame, consumed = parse_ws_frame(buf)
                    if frame is None:
                        break
                    buf = buf[consumed:]
                    opcode, payload = frame
                    if opcode == 0x08: # close
                        return
                    elif opcode in (0x01, 0x02): # text / binary
                        # Check for JSON control messages (e.g. resize)
                        try:
                            msg = json.loads(payload.decode("utf-8"))
                            if isinstance(msg, dict) and msg.get("type") == "resize":
                                session.set_size(msg.get("cols", 80), msg.get("rows", 24))
                                continue
                        except Exception:
                            pass
                        session.write(payload)
        except Exception:
            pass
        finally:
            session.remove_listener(on_pty_data)
            session.close()

def run_server():
    server = ThreadedHTTPServer((HOST, PORT), BridgeHandler)
    print(f"⚡ AIRLECHOO Terminal Bridge running on http://{HOST}:{PORT}")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()

if __name__ == "__main__":
    run_server()
