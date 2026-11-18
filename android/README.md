# Android Build Guide for Echoo (AIRLECHOO)

This directory contains the native Android wrapper configuration for **Echoo — AI Assistant**.

---

## Method 1: Android Studio (Recommended Native WebView APK)

1. **Copy Assets:**
   Copy the web files from the root directory into Android `assets`:
   ```bash
   mkdir -p android/app/src/main/assets
   cp index.html manifest.json sw.js android/app/src/main/assets/
   cp -r assets android/app/src/main/assets/
   cp -r src android/app/src/main/assets/
   ```

2. **Open in Android Studio:**
   - Open Android Studio
   - Select **Open an existing project**
   - Choose the `android/` directory

3. **Build APK:**
   - Go to **Build** → **Build Bundle(s) / APK(s)** → **Build APK(s)**
   - The generated APK will be in:
     `android/app/build/outputs/apk/debug/app-debug.apk`

---

## Method 2: Capacitor / Termux Build

You can also use Capacitor to package and run this web app directly:

```bash
# Initialize Capacitor
pnpm dlx @capacitor/cli create
pnpm dlx @capacitor/cli add android
pnpm dlx @capacitor/cli copy
pnpm dlx @capacitor/cli open android
```

---

## Method 3: Instant Android PWA (No APK compile needed)

You can run the web server on your phone inside Termux:
```bash
python3 -m http.server 8080
```
Then open Chrome on Android, visit `http://localhost:8080`, tap the 3 dots menu `⋮` and select **"Add to Home screen"** or **"Install App"**. It will install Echoo as a standalone Android app with full offline capabilities!
