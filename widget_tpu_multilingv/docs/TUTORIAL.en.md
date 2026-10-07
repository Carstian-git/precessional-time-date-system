# Widgets for Human Precessional Time (HPT) – installation tutorial

All widgets show the same thing: the **36-new-hour dial** (10° per hour, 0 at the top, clockwise), the time as `HN:MN:SN:SS`, the date in the **human precessional calendar** (weekday, month of 13, day of the month, era and year of the era) and the new time zone.

**Language.** Widgets can be shown in Romanian, English or French (`ro`, `en`, `fr`). The PWA has a language selector (it starts with your browser language). In the others you set `LANG` / `Limba` / the second argument, see below.

**Location.** The new time zone is computed from your longitude (degrees east, negative in the west). The default, `26.1`, is Bucharest. Each widget has a single value to change (`LON` or `Longitude`), shown below.

**Accuracy.** Time and date are exact calculations (the same formulas as the website, checked automatically on tens of thousands of moments). The widgets do not show the Moon phase or the lunar day (these need the full astronomical calculation; you will find them on the website).

| Platform | Folder | Needs building? |
|---|---|---|
| Any browser / phone / computer (PWA) | `pwa/` | no |
| Windows, macOS, Linux (small window) | `python/` | no |
| Windows (desktop widget) | `windows_rainmeter/` | no |
| macOS (desktop widget) | `macos_ubersicht/` | no |
| iPhone / iPad | `ios_scriptable/` | no (Scriptable app) |
| Android | `android/` | **yes** (Android Studio) |

---

## 1. PWA – installable web app (all platforms)

The simplest option; it keeps working offline after the first visit.

1. Put the `pwa/` folder on an HTTPS server. Easiest: GitHub Pages (see “Publishing on GitHub”). The address becomes `https://<user>.github.io/<repository>/pwa/`.
2. Open the address:
   - **Chrome/Edge (computer, Android):** the “Install” icon in the address bar, or menu ⋮ → “Install app” / “Add to Home screen”.
   - **Safari (iPhone/iPad):** Share button → “Add to Home Screen”.
   - **Safari (macOS):** File → “Add to Dock”.
3. Set the longitude: open “Location (new time zone)” in the app and type the value or press “Use my location”. It is remembered on the device. The same panel has the language selector.

Note: a PWA is an app window, not a home-screen widget (on a computer you can keep it always visible). For a true widget, use the options below.

## 2. Python – small always-on-top window (Windows / macOS / Linux)

Needs only Python 3 with Tkinter (included in the official installer from python.org).

```
python python/ceas_tpu.py 26.1 en
```

The first argument is the longitude, the second the language (`ro`, `en`, `fr`). Left-click and drag = move; right-click = close.
On Windows, to avoid the console, rename the file to `ceas_tpu.pyw` and double-click it. To start automatically, put a shortcut in `shell:startup`.
On Linux, if Tkinter is missing: `sudo apt install python3-tk`.

## 3. Windows – Rainmeter

1. Install Rainmeter (rainmeter.net).
2. Copy the folder `windows_rainmeter/CeasTPU` into `Documents\Rainmeter\Skins\`.
3. Right-click the Rainmeter icon in the system tray → “Refresh all”.
4. In the Rainmeter window: `CeasTPU` → `CeasTPU.ini` → “Load”.
5. Longitude and language: edit the lines `Longitudine=26.1` and `Limba=ro` in `CeasTPU.ini` (or use Rainmeter’s “Edit skin”), then “Refresh skin”.

## 4. macOS – Übersicht

1. Install Übersicht (tracesof.net/uebersicht, free).
2. Copy the folder `macos_ubersicht/CeasTPU.widget` into `~/Library/Application Support/Übersicht/widgets/` (Übersicht menu: “Open Widgets Folder”).
3. The widget appears on the desktop immediately. Position: edit `left`/`top` in `className`; longitude and language: the constants `LON` and `LANG` at the top of `index.jsx`.

## 5. iPhone / iPad – Scriptable

1. Install the free **Scriptable** app from the App Store.
2. In Scriptable press **+** (new script), name it “Ceas TPU” and paste the whole content of `ios_scriptable/TPU_Ceas.js`. Change `LON` and `LANG` at the top if needed.
3. Press ▶ to test.
4. On the home screen: long-press → **+** → Scriptable → small size → “Add Widget”. Then tap the widget → “Script”: Ceas TPU.

iOS decides by itself how often widgets refresh (usually every few minutes), so the hand may lag between updates. This is a system limit, not a calculation issue.

## 6. Android – building with Android Studio

The native Android widget has to be built, so the sources are a Gradle project.

1. Install **Android Studio** (developer.android.com/studio).
2. File → Open → choose the `android/` folder. Wait for the Gradle sync (it downloads components automatically).
3. Change the longitude and language in `app/src/main/java/ro/tpu/widget/TpuWidget.kt` (constants `LON` and `LANG`). The app name translates itself according to the phone language.
4. Connect your phone (Developer options → USB debugging) or start an emulator, then press ▶ Run. For an installable file: Build → Build APK(s); the file appears in `app/build/outputs/apk/debug/`.
5. On the phone: long-press the home screen → Widgets → “HPT Clock”.

Limit: Android may delay updates in battery-saver mode; the widget refreshes about every 30 seconds while the phone is active.

> **Status:** the Android code was not compiled in the environment where it was written (no Android SDK there). The calculation logic is the same as in the other widgets, which were checked, but small Gradle/AGP version adjustments may be needed on the first build. If you get an error, send it and we will fix it.

---

## Publishing on GitHub

The widgets are code, so they can live in the same repository as the website or in a separate one (e.g. `tpu-widgets`).

1. Put the whole content of this folder in the repository (including `README.md`).
2. For the PWA: Settings → Pages → branch `main`, folder `/ (root)`. The app is then at `https://<user>.github.io/<repository>/pwa/`.
3. If you put it in the website repository, copy `pwa/` to the site root as `/widget/` and add a link from the “Tools” page.
4. For Android, publish the APK under “Releases” (not in the code).

## Updating

The calculation core is in `tpu_mini.js` (JavaScript, with the RO/EN/FR texts) and in the ports `python/ceas_tpu.py`, `windows_rainmeter/CeasTPU/@Resources/tpu.lua` and `android/.../TpuWidget.kt`. If a rule of the system changes, all of them must be changed. The full reference is `core.js` / `sistem_timp.py` from the website.
