# Widgets for Human Precessional Time (HPT) – installation tutorial

All widgets show the same thing: the **36-new-hour dial** (10° per hour, 0 at the top, clockwise), the time as `HN:MN:SN:SS`, the date in the **human precessional calendar** (weekday, month of 13, day of the month, era and year of the era) and the new time zone.

**Language.** Widgets can be shown in Romanian, English or French (`ro`, `en`, `fr`). The PWA has a language selector (it starts with your browser language). In the others you set `LANG` / `Limba` / the second argument, see below.

**Location.** The new time zone is computed from your longitude (degrees east, negative in the west). The default, `26.1`, is Bucharest. Each widget has a single value to change (`LON` or `Longitude`), shown below.

**Accuracy.** Time and date are exact calculations (the same formulas as the website, checked automatically on tens of thousands of moments). The widgets do not show the Moon phase or the lunar day (these need the full astronomical calculation; you will find them on the website). Exception: the Rainmeter wristwatch and Earth skins also show the Moon phase.

| Platform | Folder | Needs building? |
|---|---|---|
| Any browser / phone / computer (PWA) | `pwa/` | no |
| Windows, macOS, Linux (small window) | `python/` | no |
| Windows (desktop widget) | `windows_rainmeter/` | no |
| macOS (desktop widget) | `macos_ubersicht/` | no |
| iPhone / iPad | `ios_scriptable/` | no (Scriptable app) |
| Linux (small window, autostart) | `linux/` + `python/` | no |
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

The package contains four skins: the clock with date, the 36 h and 18 h wristwatches, and the Earth Clock. Under each dial you see the HPT time with the zone, the local SI time with its UTC offset, the date in the human precessional calendar, ER, AE and the local date.

1. Install Rainmeter (rainmeter.net).
2. If you have an older version, delete the folder `Documents\Rainmeter\Skins\CeasuriTPU` (and any old `CeasTPU` folder).
3. Copy the folder `windows_rainmeter/CeasuriTPU` into `Documents\Rainmeter\Skins\` (directly there, not into `illustro`).
4. Right-click the Rainmeter icon in the system tray → “Refresh all”.
5. In the Rainmeter window, Load any of: `CeasuriTPU\Ceas\Ceas.ini`, `Mana36\Mana36.ini`, `Mana18\Mana18.ini`, `Pamant\Pamant.ini`.
6. Settings, in `[Variables]` of each `.ini` (then “Refresh skin”): `Longitudine=auto` (from the Windows time zone; or a number, degrees east), `Limba=auto` (follows the Windows language: Romanian, English or French; or `ro`, `en`, `fr`), `Diacritice=0` (no diacritics, default; set 1 if you want them). `Pamant.ini` also has `Latitudine` (default 44.4, set your own) and `Marime`.

Details in `windows_rainmeter/CeasuriTPU/CITESTE.txt` (Romanian). The skins were checked numerically against the website, but the drawing has not yet been tried directly in Rainmeter.


**How to read the Earth Clock** (the same in the Rainmeter skin and on the website):

- The map is seen from above the North Pole (at the centre). Zone 0 is at the bottom, east to the right.
- **The light-blue hand, outlined,** points to your zone. Your hour is the number in the box it points at.
- **The yellow Sun with rays**, on the ring, shows the zone where it is noon now (hour 18). The Sun moves west.
- **The small orange circle with a dot** is the subsolar point: where the Sun is at the zenith. It moves west every day and between the two tropics with the seasons.
- **The dotted meridian** runs from it to the centre: every zone on the line has solar noon right now.
- **The dotted parallel** is the circle around the Pole through the same point. It grows or shrinks with the seasons and shows how far the Sun is from the pole.
- The dark part of the map is night; the day-night line stands 90° from the subsolar point.
- On the 18 h wristwatch, the numbers of the half-day that is not current stay readable (dark brown), and those of the current half are navy and bold.


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

## 7. Linux

Two options, neither needs compiling.

**Small window (Python).** Works on any desktop (GNOME, KDE, Xfce, etc.) under X11; under Wayland the window may not stay on top of the others.

1. Install Python 3 with Tkinter: `sudo apt install python3-tk` (Debian/Ubuntu), `sudo dnf install python3-tkinter` (Fedora) or `sudo pacman -S tk` (Arch).
2. Run: `python3 python/ceas_tpu.py 26.1 en` (longitude, then language `ro`, `en` or `fr`). Left-click and drag = move; right-click = close.
3. Autostart at login: `sh linux/instaleaza.sh 26.1 en`. The script puts a file in `~/.config/autostart/`. To remove it, delete `~/.config/autostart/ceas-tpu.desktop`.

**Web app (PWA).** Open the PWA address in Chromium, Chrome or Edge and choose “Install”; it appears as an app in the menu.


## HTML clocks (any system)

The folder `ceasuri_web/` holds the same clocks (Earth Clock, 36 h and 18 h wristwatches) as HTML pages, with the website's real code. On Windows, double-click a `.bat` file; on any other system open `pamant_en.html`, `mana36_en.html` or `mana18_en.html` (`ro`/`fr` for Romanian/French) in a browser. Location: add `?lon=26.1&lat=44.4` to the address. The `assets/` folder must stay next to the pages. Details in `ceasuri_web/CITESTE.txt` (Romanian).

---

## Publishing on GitHub

The widgets are code, so they can live in the same repository as the website or in a separate one (e.g. `tpu-widgets`).

1. Put the whole content of this folder in the repository (including `README.md`).
2. For the PWA: Settings → Pages → branch `main`, folder `/ (root)`. The app is then at `https://<user>.github.io/<repository>/pwa/`.
3. If you put it in the website repository, copy `pwa/` to the site root as `/widget/` and add a link from the “Tools” page.
4. For Android, publish the APK under “Releases” (not in the code).

## Updating

The calculation core is in `tpu_mini.js` (JavaScript, with the RO/EN/FR texts) and in the ports `python/ceas_tpu.py`, `windows_rainmeter/CeasuriTPU/@Resources/tpu.lua` and `android/.../TpuWidget.kt`. If a rule of the system changes, all of them must be changed. The full reference is `core.js` / `sistem_timp.py` from the website.
