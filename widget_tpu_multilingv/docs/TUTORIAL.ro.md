# Widgeturi pentru Timpul precesional uman (TPU) – tutorial de instalare

Toate widgeturile arată același lucru: **cadranul de 36 de ore noi** (10° pe oră, 0 sus, în sens orar), ora în forma `HN:MN:SN:SS`, data din **calendarul precesional uman** (luna din 13, ziua lunii, ziua săptămânii, era și anul erei) și fusul nou.

**Limba.** Widgeturile se pot afișa în română, engleză sau franceză (`ro`, `en`, `fr`). PWA-ul are un selector de limbă (implicit limba browserului); în celelalte, setezi `LANG` / `Limba` / al doilea argument, vezi mai jos.

**Locația.** Fusul nou se calculează din longitudine (grade est, negativ la vest). Valoarea implicită, `26.1`, este București. În fiecare widget există o singură valoare de schimbat (`LON` sau `Longitudine`), indicată mai jos.

**Acuratețe.** Ora și data sunt calcul exact (aceleași formule ca pe site, verificate automat pe zeci de mii de momente). Widgeturile nu afișează faza Lunii și ziua lunară (acestea cer calculul astronomic complet; le găsești pe site).

| Platformă | Folder | Se compilează? |
|---|---|---|
| Orice browser / telefon / calculator (PWA) | `pwa/` | nu |
| Windows, macOS, Linux (fereastră mică) | `python/` | nu |
| Windows (widget pe desktop) | `windows_rainmeter/` | nu |
| macOS (widget pe desktop) | `macos_ubersicht/` | nu |
| iPhone / iPad | `ios_scriptable/` | nu (aplicația Scriptable) |
| Android | `android/` | **da** (Android Studio) |

---

## 1. PWA – aplicație instalabilă (toate platformele)

Cea mai simplă variantă; merge și fără internet după prima deschidere.

1. Pune folderul `pwa/` pe un server HTTPS. Cel mai simplu: GitHub Pages (vezi secțiunea „Publicare pe GitHub”). Adresa devine `https://<utilizator>.github.io/<depozit>/pwa/`.
2. Deschide adresa:
   - **Chrome/Edge (calculator, Android):** pictograma „Instalează” din bara de adrese, sau meniul ⋮ → „Instalează aplicația” / „Adaugă pe ecranul de pornire”.
   - **Safari (iPhone/iPad):** butonul Partajare → „Adaugă pe ecranul principal”.
   - **Safari (macOS):** Fișier → „Adaugă în Dock”.
3. Setează longitudinea: deschide „Locația (fusul nou)” în aplicație și scrie valoarea sau apasă „Folosește locația mea”. Se reține pe dispozitiv.

Notă: PWA nu este un widget pe ecranul de start, ci o fereastră de aplicație (pe calculator o poți lăsa mereu vizibilă). Pentru widget adevărat folosește variantele de mai jos.

## 2. Python – fereastră mică, mereu deasupra (Windows / macOS / Linux)

Nu necesită nimic în afară de Python 3 cu Tkinter (inclus în instalarea oficială de pe python.org).

```
python python/ceas_tpu.py 26.1 en
```

Primul argument este longitudinea, al doilea limba (`ro`, `en`, `fr`). Click-stânga și tragere = mută; click-dreapta = închide.
Pe Windows, dacă vrei fără consolă, redenumește fișierul în `ceas_tpu.pyw` și deschide-l cu dublu-click. Pentru pornire automată, pune o scurtătură în `shell:startup`.
Pe Linux, dacă lipsește Tkinter: `sudo apt install python3-tk`.

## 3. Windows – Rainmeter

1. Instalează Rainmeter (rainmeter.net).
2. Copiază folderul `windows_rainmeter/CeasTPU` în `Documente\Rainmeter\Skins\`.
3. Clic-dreapta pe pictograma Rainmeter din bara de sistem → „Refresh all”.
4. În fereastra Rainmeter: `CeasTPU` → `CeasTPU.ini` → „Load”.
5. Longitudinea și limba: editează în `CeasTPU.ini` liniile `Longitudine=26.1` și `Limba=ro` (sau din Rainmeter: „Edit skin”), apoi „Refresh skin”.

## 4. macOS – Übersicht

1. Instalează Übersicht (tracesof.net/uebersicht, gratuit).
2. Copiază folderul `macos_ubersicht/CeasTPU.widget` în `~/Library/Application Support/Übersicht/widgets/` (din meniul Übersicht: „Open Widgets Folder”).
3. Widgetul apare imediat pe desktop. Poziția: editează `left`/`top` din `className`; longitudinea și limba: constantele `LON` și `LANG` de la începutul `index.jsx`.

## 5. iPhone / iPad – Scriptable

1. Instalează aplicația gratuită **Scriptable** din App Store.
2. În Scriptable apasă **+** (script nou), numește-l „Ceas TPU” și lipește tot conținutul fișierului `ios_scriptable/TPU_Ceas.js`. Schimbă `LON` și `LANG` de la început dacă e nevoie.
3. Apasă ▶ pentru test.
4. Pe ecranul de start: apăsare lungă → **+** → Scriptable → mărimea mică → „Adaugă widget”. Apoi apasă pe widget → „Script”: Ceas TPU.

iOS decide singur cât de des reîmprospătează widgeturile (de obicei la câteva minute), deci acul poate rămâne în urmă între actualizări. Aceasta este o limită a sistemului, nu a calculului.

## 6. Android – compilare cu Android Studio

Widgetul nativ Android trebuie compilat, de aceea sursele sunt într-un proiect Gradle.

1. Instalează **Android Studio** (developer.android.com/studio).
2. File → Open → alege folderul `android/`. Așteaptă sincronizarea Gradle (descarcă automat componentele).
3. Schimbă longitudinea și limba în `app/src/main/java/ro/tpu/widget/TpuWidget.kt` (constantele `LON` și `LANG`). Numele aplicației se traduce singur după limba telefonului.
4. Conectează telefonul (Opțiuni dezvoltator → Depanare USB) sau pornește un emulator, apoi apasă ▶ Run. Pentru un fișier de instalat: Build → Build APK(s); fișierul apare în `app/build/outputs/apk/debug/`.
5. Pe telefon: apăsare lungă pe ecranul de start → Widgeturi → „Ceas TPU”.

Limită: Android poate amâna actualizările în modul de economisire a bateriei; widgetul se reîmprospătează aproximativ la 30 de secunde când telefonul e activ.

> **Stare:** codul Android nu a fost compilat în mediul în care a fost scris (nu există SDK Android acolo). Logica de calcul este aceeași cu cea verificată în celelalte widgeturi, dar la prima compilare pot apărea mici ajustări de versiuni Gradle/AGP. Dacă apare o eroare, trimite-o și o corectăm.

---

## Publicare pe GitHub

Widgeturile sunt cod, deci pot sta în același depozit ca site-ul sau într-unul separat (ex. `tpu-widgeturi`).

1. Pune în depozit tot conținutul acestui folder (inclusiv `README.md`).
2. Pentru PWA: Settings → Pages → ramura `main`, folderul `/ (root)`. Aplicația este apoi la `https://<utilizator>.github.io/<depozit>/pwa/`.
3. Dacă îl pui în depozitul site-ului, copiază `pwa/` în rădăcina site-ului, ca `/widget/`, și adaugă un link din pagina „Instrumente”.
4. Pentru Android, publică APK-ul la „Releases” (nu în cod).

## Actualizare

Formulele (nucleul de calcul) sunt în `tpu_mini.js` (JavaScript, cu textele RO/EN/FR) și în portările din `python/ceas_tpu.py`, `windows_rainmeter/CeasTPU/@Resources/tpu.lua` și `android/.../TpuWidget.kt`. Dacă se schimbă o regulă a sistemului, trebuie modificate toate. Referința completă este `core.js` / `sistem_timp.py` de pe site.
