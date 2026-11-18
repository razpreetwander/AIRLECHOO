# AIRLECHOO (Echoo — AI Assistant)

![Echoo Banner](assets/images/echoo-hero.png)

> **AIRLECHOO** is an advanced, production-grade Agentic AI Assistant interface specially tailored for mobile devices and Android applications. It features multi-model intelligence, live interactive voice mode, task execution pipelines, code editing, terminal sessions, MCP tools, and autonomous planning.

---

## 📱 Key Features & Screens

Every screen, animation, and asset is crafted to provide a 100% native Android feel with edge-to-edge immersion, safe area insets, smooth gestures, and responsive themes.

```
AIRLECHOO Architecture
├── 💬 Chat Workspace (Multi-Model, DeepThink, Voice Recorder, Ghost Mode)
├── 🎙️ Live Voice Assistant (Pulsing 3D Orb, Real-time Captions, Full duplex voice)
├── 📋 Task Management (Auto-Planning, Step-by-step runner, Status badges)
├── 📁 Projects & File Hub (Multi-file workspace, Context, Prompts)
├── 📝 In-App Code Editor (Syntax styling, Line numbers, Save & Run)
├── ⚡ Automations & Routines (Scheduled triggers, Action pipelines)
├── 🛠️ MCP Tools & Integrations (Tool calling registry, Status inspection)
├── 🔐 Permissions Manager (Camera, Mic, Storage, Notifications)
├── 🧠 Autonomous Planner (Decomposes complex goals into actionable plans)
├── 💻 In-App Terminal (Multi-session shell with virtual keyboard accessory keys)
├── 🔍 Instant Search (Fuzzy search over all chats, projects, tasks)
└── ⚙️ Settings & Profile (Custom avatar upload, Light/Dark theme, Storage wipe)
```

---

### 1. 💬 Chat Workspace & Intelligence
- **Multi-Model Selector**: Switch between Gemini 2.5 Flash, Gemini Pro, GPT-4o, Claude 3.5 Sonnet, and custom models.
- **DeepThink Mode**: Toggle extended reasoning for complex multi-step problems.
- **Rich Media Attachments**: Supports Camera capture, Photo gallery selection, Audio recording, and arbitrary file uploads.
- **Voice Note Recorder**: Features an animated audio waveform bar, timer, cancel, stop, and send controls.
- **Ghost (Incognito) Mode**: Switch into private mode with zero history persistence.

### 2. 🎙️ Live Voice Assistant (`#pgLive`)
- **Dynamic 3D Live Orb**: Animated WebP glowing pulse orb that reacts to speech states (listening, thinking, speaking).
- **Real-Time Captions**: Live transcription simulation with mute, talk, and interrupt controls.

### 3. 📋 Tasks Dashboard & Runner (`#pgTasks`, `#pgTask`)
- **Status Badges**: Real-time counters for Total, Running, Paused, Done, and Failed tasks.
- **Step-by-step Execution**: Deconstructs user goals into discrete steps with live progress checkmarks.
- **Task Controls**: Pause, resume, retry failed steps, and inspect execution logs.

### 4. 📁 Projects & 📝 In-App Code Editor (`#pgProject`, `#pgEditor`)
- Full project workspace management with file explorer.
- Integrated code editor with dynamic line numbers, monospaced typography, and instant file saving.

### 5. ⚡ Automations (`#pgAutos`, `#pgAutoEdit`)
- Create autonomous background routines with customizable triggers and actions.

### 6. 💻 Terminal Emulator (`#pgTerminal`)
- Multi-tab terminal interface with simulated command execution.
- Android-optimized virtual keyboard accessory bar with quick keys: `ESC`, `TAB`, `CTRL`, `ALT`, `↑`, `↓`, `CLEAR`.

### 7. ⚙️ Settings & User Profile (`#pgSettings`)
- **Profile Customization**: Custom avatar photo upload via FileReader, full name (`razpreet wander`), and nickname editor.
- **Appearance**: Seamless switching between System, Light, and Dark mode.
- **Storage Management**: Browser storage estimation, persistent storage request, and one-tap cache wipe.

---

## 🤖 Android Optimization & Native Feel

1. **Edge-to-Edge & Safe Areas**:
   - Uses CSS `env(safe-area-inset-top)` and `env(safe-area-inset-bottom)` to avoid camera punch-holes and Android gesture bars.
2. **Android Hardware Back-Button Support**:
   - Intercepts `popstate` events: pressing Android back button or swiping back closes bottom sheets, sidebars, or sub-pages gracefully instead of exiting the app.
3. **PWA & Offline Ready**:
   - `manifest.json` provides standalone Android installation ("Add to Home screen").
   - `sw.js` caches all assets and stylesheets for instant offline loading.
4. **Native Android Wrapper Ready**:
   - Complete Kotlin `MainActivity.kt` and `AndroidManifest.xml` included in `android/` with microphone and file-picker handlers.

---

## 📂 Repository Structure

```
AIRLECHOO/
├── index.html                   # Primary Android app entry point
├── manifest.json                # Web App Manifest for Android PWA
├── sw.js                        # Offline Service Worker cache
├── package.json                 # Project configuration
├── README.md                    # Documentation
├── assets/
│   └── images/
│       ├── logo.png             # Echoo brand icon
│       ├── favicon.png          # App favicon
│       ├── settings.png         # Settings icon
│       ├── incognito.png        # Ghost mode icon
│       ├── echoo-hero.png       # Echoo welcome banner
│       ├── ghost-hero.png       # Ghost mode banner
│       └── live-orb.webp        # Animated 3D live voice orb
├── src/
│   ├── css/
│   │   └── style.css            # Complete Android responsive stylesheet
│   └── js/
│       └── app.js               # Application logic, state & Android navigation
└── android/
    ├── README.md                # Android Studio build guide
    └── app/
        ├── build.gradle.kts     # Gradle build script
        └── src/main/
            ├── AndroidManifest.xml # Permissions (Mic, Camera, Internet)
            ├── java/com/airlechoo/app/MainActivity.kt # Kotlin WebView Activity
            └── res/values/styles.xml # Android dark theme
├── server/                      # Go Engine & Terminal Supervisor
│   ├── main.go                  # IDE Bridge Server (ports 1234 & 1235)
│   ├── terminal_bridge.py       # Live Termux PTY Terminal Bridge (:1236)
│   ├── go.mod, go.sum
│   └── pkg/                     # Hub, Claude, Codex, OpenCode, FS, Git, Checkpoints
├── airlechoo.sh                 # Unified Service Launcher & Status Daemon
```

---

## 🚀 Running AIRLECHOO (Full Stack Engine + Web UI)

Start all services (Antigravity Hub, Go IDE Server, Termux Terminal Bridge, and Web UI) with a single command:

```bash
./airlechoo.sh start
```

Check real-time health across all ports:
```bash
./airlechoo.sh status
```

| Service | Port | Description |
| :--- | :--- | :--- |
| **Echoo Web UI** | `8080` | Modern mobile interface with safe-area support |
| **Go IDE Bridge** | `1234` | Supervises AI engines, `/api/fs/*`, `/api/models` |
| **Antigravity Hub** | `1235` | Official Google Antigravity Agent RPC server |
| **Termux Terminal** | `1236` | Real interactive bash shell via WebSocket & PTY |

Open your mobile browser (e.g. Chrome) and navigate to:
```
http://localhost:8080
```

To stop all services:
```bash
./airlechoo.sh stop
```

---

## 📱 Install as Android PWA (WebAPK)
1. Open `http://localhost:8080` in Chrome on Android.
2. Tap the browser menu `⋮` → **Add to Home screen** (or **Install App**).
3. The app will install as a native-like standalone Android app with the Echoo icon!

---

## 📦 Build Native Android APK
See [`android/README.md`](file:///data/user/0/com.termux/files/home/AIRLECHOO/android/README.md) for full instructions on building via Android Studio or Capacitor.

---

## 👤 Author & Credentials
- **Repository**: [razpreetwander/AIRLECHOO](https://github.com/razpreetwander/AIRLECHOO)
- **Author**: razpreet wander (`razpreetwander@gmail.com`)
