# Human precessional time and the human precessional calendar

## User manual for Excel, Python and the web page

Version: 3 October 2026 (English translation of the Romanian manual). Files covered: `timp_36_ore_rotatie.xlsx`, `sistem_timp.py`, `calendar_13_luni.py`, `conversie_timp.py`, `creare_cadrane.py`, `ora_minute_secunde.xlsx` and the dial images.

> All input dates and times are in UTC unless stated otherwise. The tested range is 1900–2200.
>
> **A note on language.** The files themselves (workbook sheet names, script messages and comments) are in Romanian. This manual keeps the original names in quotation marks and gives a translation in parentheses the first time they appear. Where a script prints text, the examples show the output exactly as the script prints it (in Romanian).

## Contents

1. What this system is
2. The files
3. Rules and formulas
4. Excel guide, sheet by sheet
5. Python guide
6. Worked examples
7. Checks, accuracy and limits
8. Troubleshooting and frequently asked questions
9. Appendices: glossary, the tradition behind the units, name tables

## 1. What this system is

**The name.** “Human precessional time” (HPT) is the 36-hour clock (360°), and the “human precessional calendar” is the date and the 13-month calendar. “Precessional” comes from the precession of the equinoxes, the slow motion (25,772 years) that divides time into 12 eras; “human” means on the scale of human perception: the system uses only what any person on Earth can observe. A single precession cycle, the current one (23332 BCE – 2440 CE), contains the whole known history of humankind, so every date in the past has a unique code. After 2440 the next cycle begins. The full name is used, not abbreviations.

The system measures time as an angle and anchors the year and the eras to the real motions of the Sun, the Moon and the Earth's axis, with no dependence on any religious tradition. The basic ideas are:

- **The day has 36 new hours and corresponds to one complete 360° rotation.** A new hour is 10° and 10 new minutes, a new minute is 1° and 10 new seconds, a new second is 0.1° and 24 subseconds. A subsecond is exactly one SI second, so conversion to standard time is exact, with no rounding.
- **Solar noon is at 18:00:00:00**, like “12” on the classic clock. Midnight is hour 0.
- **The year begins on the day of the December solstice.** A new year has 365 days, or 366 in leap years (the year number k is a multiple of 4 but not of 128). The mean year is 365.2421875 days, very close to the tropical year.
- **The calendar has 13 months of 28 days**, that is 364 days and exactly 52 weeks. Each month begins on Monday (day 1) and ends on Sunday (day 28). Day 365 is the **Year Day**, and in leap years day 366 is the **Leap Day**. Both are outside the week and have no weekday.
- **The Sun and the Moon are treated as angles on a circle.** The solar angle is measured from the December solstice (0°, 90°, 180°, 270° = solstice, equinox, solstice, equinox). The lunar angle is the elongation from the Sun (0° new moon, 90° first quarter, 180° full moon, 270° last quarter).
- **The eras follow the precession of the equinoxes.** The Earth's axis traces a cycle of about 25,772 years, divided into 12 precessional eras (ER 1–12) of 2147 or 2148 years, grouped into 4 quadrants of 6,443 years each. The year within the era is AE, with no year zero. The reference is the star Spica: ER 1 (Aquarius) begins with the new year that starts on 21.12.2440, and the current era is ER 12 (Pisces), from the year 293 CE. With them history can be dated too: 785 BCE = ER 11, AE 1072.
- **The names of months, days and eras** exist in Sanskrit, English and French, with numerals 1–13, so as to stay neutral toward any dogma.

The new units of time and their equivalents:

| New unit | Equivalent in new units | Rotation angle | In standard time |
|---|---|---|---|
| Day | 36 hours | 360° | 24 h = 86,400 s |
| New hour (HN) | 10 minutes | 10° | 40 min = 2,400 s |
| New minute (MN) | 10 seconds | 1° | 4 min = 240 s |
| New second (SN) | 24 subseconds | 0.1° | 24 s |
| Subsecond (SS) | – | 0.004167° | 1 s (the SI second) |

## 2. The files

| File | What it contains | When to use it |
|---|---|---|
| `timp_36_ore_rotatie.xlsx` | The main workbook, with 13 sheets (section 4) | Conversions, calendars, eras, full code, printing |
| `sistem_timp.py` | Exact UTC ↔ full code conversion (ER-AE-…), eras and historical dating, real positions of the Sun and Moon, events, zones, tests | Exact calculations for any moment; the programmatic alternative to the “Timp complet” (Full time) and “Ere” (Eras) sheets |
| `calendar_13_luni.py` | Gregorian ↔ 13-month calendar conversion, aligned to the solstice, with names in four languages | Date conversions, the table of months of a year |
| `conversie_timp.py` | Simple 24 h ↔ 36 h conversion, with subsecond | Time of day only |
| `creare_cadrane.py` | Draws four dials (year, eras, 18 h and 36 h clocks) for a given moment and can insert them into Excel | Images for printing, with the current date |
| `cadran_an.png`, `cadran_ere.png`, `cadran_18h_jumatate_zi.png`, `cadran_36h_zi_intreaga.png` | Ready-made dials, for 2 October 2026, 12:00 UTC, in Bucharest | Display, printing |
| `ora_minute_secunde.xlsx` | A simple table of the 86,400 seconds of the standard day (hour, minutes, seconds) | Basic reference |
| `manual_utilizare_sistem_timp.md` and `.docx` (this manual: Romanian original; English and French translations) | This manual | Reading |

## 3. Rules and formulas

### 3.1 Time of day: 24 h ↔ 36 h conversion

Go through T, the number of SI seconds elapsed since midnight:

```
T = h*3600 + m*60 + s                       (h 0-23, m 0-59, s 0-59)

24 h -> 36 h                                36 h -> 24 h
hour (HN)      = T // 2400                  T = HN*2400 + MN*240 + SN*24 + SS
minute (MN)    = (T % 2400) // 240          h = T // 3600
second (SN)    = (T % 240) // 24            m = (T % 3600) // 60
subsecond      = T % 24                     s = T % 60
angle (degrees) = T / 240
```

In the formulas above `//` is the integer quotient and `%` is the remainder. Example: 15:30:45 means T = 55,845, so hour 23, minute 2, second 6, subsecond 21 and 232.6875°.

Quick equivalences: standard hour × 1.5 = new hour; 1 new hour = 40 standard minutes; 1 new minute = 4 standard minutes; 1 new second = 24 standard seconds.

### 3.2 The new year

```
year_start(k) = 22.12.2011 + 365*(k-1) + (k-1)//4 - (k-1)//128
leap(k)       = (k % 4 == 0) and (k % 128 != 0)
N             = calendar_day - year_start(k) + 1        (N = 1..365, or 366)
```

The new year k is an **internal counter**: k = 1 is the new year that begins on 22.12.2011, and k can also be negative (the years before this epoch). From k the era and the year of the era are derived (section 3.8); these are the ones used in the code.

**How to choose the year in a sheet or a script.** Enter the Gregorian year that contains 1 July of the desired new year. For example, 2026 means k = 15, from 21.12.2025 to 20.12.2026, that is ER 12, AE 1734. In `calendar_13_luni.py` you can also give `AN15` directly (meaning k = 15; “AN” is Romanian for “year”).

The leap rule (4/128) gives a mean year of 365.2421875 days. The extra day is added at the end of the year, after the Year Day. The Great Jubilee (one extra day every 128,000 years) is not used, because it would increase the error relative to the tropical year.

### 3.3 The 13-month calendar, the arcs and the solar dial

```
N <= 364:  LC = (N-1)//28 + 1        ZN = (N-1)%28 + 1       weekday = (N-1)%7  (0 = Monday ... 6 = Sunday)
N == 365:  LC = 00, ZN = 01  (Year Day)
N == 366:  LC = 00, ZN = 02  (Leap Day, only in leap years)
AS = min(73, (N-1)//5 + 1)           ZA = N - 5*(AS-1)       (arc 73 has 6 days in leap years)
```

- **LC** is the calendar month (01–13, or 00 for the days outside the week), and **ZN** is the day of the month (01–28). The weekday follows: Monday is ((ZN−1) mod 7) + 1 = 1.
- **AS** is the 5-day solar arc (01–73), and **ZA** the day within the arc (1–5, or 6). The arcs are a second count of the year, similar to the 72 pentads of the Chinese tradition.
- **CS** is the solar quadrant 1–4, defined by the real position of the Sun: the quadrant in which the Sun is at the end of the day. CS 1 begins at the December solstice, CS 2 at the March equinox, CS 3 at the June solstice, CS 4 at the September equinox. The limits are the exact astronomical moments (Meeus's formulas, accuracy under one minute), not a fixed rule of arcs.
- The weekday in the new calendar generally differs from the Gregorian one. For example 29 September 2026 is a Tuesday in the Gregorian calendar, but a Wednesday (day 3 of month 11) in the new one. For this reason the sheets often show both days.

### 3.4 The Sun, the Moon and astronomical phenomena

- **The solar angle** is the longitude of the Sun from the December solstice. On 29.09.2026, 15:30:45 UTC, it is 276.5° (quadrant 4).
- **The lunar angle** is the elongation of the Moon from the Sun. At the same moment it is 218.1°, that is between full moon and last quarter.
- **The phases of the Moon** are divided into eight sectors of 45°, centered on 0°, 45°, …, 315°: new, waxing crescent, first quarter, waxing gibbous, full, waning gibbous, last quarter, waning crescent.
- **CL** is the lunar day (01–30). Day 1 is the local day on which the astronomical new moon occurs; days are then counted one by one until the next new moon.
- **The phenomena** in the “Evenimente” (Events) sheet and in the scripts are: the four solar moments (the solstices and equinoxes), the four quarters of the Moon and possible eclipses.
- **Possible eclipse.** A solar eclipse is marked when the Moon's latitude at new moon is below 1.58°, and a lunar (umbral) eclipse when the distance between the axis of the shadow and the center of the Moon is below 1.0128 equatorial Earth radii. The mark says that the Moon is near a node; it does not say where the eclipse can be seen.

### 3.5 Zones and local time

One degree of longitude is one new minute, so mean local time is UTC plus the longitude in new minutes.

```
new zone  = floor(longitude/10 + 0.5)                whole new hours, from -18 to +18
offset    = zone * 2400 seconds                      “Zone” mode (Romanian: „Fus”)
offset    = longitude * 240 seconds (rounded)        “Solar” mode
```

The 36 zones are 10° bands centered on multiples of 10°. The deviation from mean solar time is at most ±5 new minutes (±20 standard minutes). Examples:

| Place | Longitude | New zone | Offset (standard time) |
|---|---|---|---|
| Bucharest | 26.1° E | +3 | +2 h 00 min |
| London | −0.1° | 0 | 0 |
| New York | −74.0° | −7 | −4 h 40 min |
| Tokyo | 139.7° E | +14 | +9 h 20 min |

The new zones coincide with the present ones only every third zone (+3 = UTC+2, +6 = UTC+4 and so on). There is no daylight saving time.

### 3.6 The full code

The format is `ER-AE-CS-AS.ZA-CL-LC-ZN HN:MN:SN:SS suffix`.

| Field | Meaning | Values |
|---|---|---|
| ER | Precessional era (precession of the equinoxes) | 1–12 (ER 1 = Aquarius, ER 12 = Pisces) |
| AE | Year of the era, no year zero | 0001–2148 |
| CS | Solar quadrant | 1–4 |
| AS.ZA | Solar arc and day within the arc | 01–73 and 1–5 (6) |
| CL | Lunar day | 01–30 |
| LC | Calendar month | 00–13 |
| ZN | Day of the month | 01–28 (for LC 00: 01 or 02) |
| HN:MN:SN:SS | New time | 00–35 : 00–09 : 00–09 : 00–23 |
| suffix | Zone or local solar time | `F+03` (zone) or `L+26.1` (solar, longitude) |

Complete example: `12-1734-4-57.3-19-11-03 26:02:06:21 F+03` means: era 12 (Pisces), year 1734 of the era; solar quadrant 4, arc 57 day 3; lunar day 19; month 11, day 3 (Wednesday); new time 26:02:06:21; zone +3.

**Writing the time.** The hour, minute and second are written with two digits (for example `19:08:04`), as on the classic clock, although the minute and the second only go from 0 to 9. The programs also accept the form without the zero (`19:8:4`).

An ER-AE code is unique within a precession cycle (25,772 years). The current cycle ends with the year 2440; for other cycles, the functions in Python and the Excel sheets have a “cycle” parameter (0 = current).

**Short forms for daily use.** The full code is an archive format. For everyday use take only the useful part: `ER 12 · AE 1734 · month 11 · day 3 · 26:02:06` (era, year of the era, month, day and time); the other fields are optional additions.

### 3.7 Angles in degrees, gon and radians

| Unit | Circle | A quarter | 1 unit of rotation in SI seconds |
|---|---|---|---|
| Decimal degree | 360° | 90° | 240 (exact) |
| Gon (gradian) | 400 | 100 | 216 (exact), but 0.01 gon = 2.16 s |
| Radian | 2π | π/2 | 13,751 (irrational number) |

The decimal degree is the base unit, because it keeps the exact link with the SI second. The script displays every angle in degrees, gon and radians (the `unghiuri` command, “angles”).

### 3.8 The eras and historical dating

**The precession of the equinoxes.** The Earth's axis rotates slowly (about 50.29″ per year), and the full cycle lasts about 25,772 years. The system divides it into 12 eras (30° each), numbered ER 1–12, with lengths of 2147 or 2148 years: the limits are `floor(j × 25772 / 12)`, that is 0, 2147, 4295, 6443, … 25772. Eight eras have 2148 years and four have 2147; each group of three eras has exactly 6,443 years, so the cycle has four **quadrants** of 6,443 years.

**The reference: the star Spica.** Spica (α Virginis) is close to the ecliptic (latitude −2.05°); Hipparchus discovered precession by comparing its position. Ayanāṁśa(t) is defined as the ecliptic longitude of Spica at date t, minus 180°. Pisces covers ayanāṁśa from 0° to 30°, and **ER 1 (Aquarius) begins when ayanāṁśa reaches 30°**. The calculation (Spica at 203.841° in J2000, IAU 2006 precession) gives ayanāṁśa 0° around 287 CE and 30° around 2440 CE. The chosen anchor is therefore **AE 1 of ER 1 = the new year 2441** (from 21.12.2440). Polaris cannot be the reference: it is today's pole star, it is not on the ecliptic, and the pole passes near other stars (Thuban, Vega, etc.).

```
ayanamsa 0° at 286.8, 30° at 2440.5; ER 1 begins with the new year 2441
```

**The 12 eras** (the current cycle, which ends at the anchor; years in historical numbering):

| ER | Sanskrit | English | French | Years | From | To |
|---|---|---|---|---|---|---|
| 1 | Kumbha | Aquarius | Verseau | 2147 | 23332 BCE | 21186 BCE |
| 2 | Makara | Capricorn | Capricorne | 2148 | 21185 BCE | 19038 BCE |
| 3 | Dhanus | Sagittarius | Sagittaire | 2148 | 19037 BCE | 16890 BCE |
| 4 | Vṛścika | Scorpio | Scorpion | 2147 | 16889 BCE | 14743 BCE |
| 5 | Tulā | Libra | Balance | 2148 | 14742 BCE | 12595 BCE |
| 6 | Kanyā | Virgo | Vierge | 2148 | 12594 BCE | 10447 BCE |
| 7 | Siṃha | Leo | Lion | 2147 | 10446 BCE | 8300 BCE |
| 8 | Karkaṭa | Cancer | Cancer | 2148 | 8299 BCE | 6152 BCE |
| 9 | Mithuna | Gemini | Gémeaux | 2148 | 6151 BCE | 4004 BCE |
| 10 | Vṛṣabha | Taurus | Taureau | 2147 | 4003 BCE | 1857 BCE |
| 11 | Meṣa | Aries | Bélier | 2148 | 1856 BCE | 292 CE |
| 12 | Mīna | Pisces | Poissons | 2148 | 293 CE | 2440 CE |

**The formulas**, with k the new year (section 3.2) and 430 = 2441 − 2011:

```
p  = (k - 430) % 25772                       position in the cycle, 0..25771
ER = the largest j (1..12) with floor((j-1)*25772/12) <= p
AE = p - floor((ER-1)*25772/12) + 1          year of the era, no year zero
```

**Historical dating.** For a year Y in astronomical numbering (1 BCE = 0, so 785 BCE = −784), k = Y − 2011. The Gregorian year is the one that contains 1 July of the new year. Examples:

```
$ python sistem_timp.py istoric 785BCE
785 î.e.n. (an astronomic -784)  =  ER 11 (Meṣa · Aries · Bélier), AE 1072
$ python sistem_timp.py istoric-inv 11 1072
ER 11, AE 1072 (ciclul +0)  =  785 î.e.n. (an astronomic -784)
```

(The script prints in Romanian: “î.e.n.” is BCE, “an astronomic” is astronomical year, “ciclul” is cycle.)

In Excel, the same conversions are in the “Ere” sheet (the “Datare istorică”, historical dating, sections). The year 2026 is ER 12, AE 1734; the year 1 CE is ER 11, AE 1857.

**Limits.**
- The eras have equal lengths, while real precession has changed over time, so the model differs from the real position of the vernal point by about 8 years at 1 CE, 17 years at 785 BCE and 31 years at 1800 BCE.
- The stellar reference has an uncertainty of a few years (the proper motion of Spica, the precession model).
- An ER-AE code is unique only within one cycle of 25,772 years.
- Exact days (with month and day) are accepted by the scripts only for the years 1–9999 CE; for BCE years only the whole year is dated.

## 4. Excel guide, sheet by sheet

### 4.1 General rules

- **Yellow cells with blue text** are the ones to fill in. Green cells are results. The rest are formulas, which recalculate on their own.
- Yellow cells have **validations**: if you enter a value outside the limits, a message appears. Valid dates are between 1900 and 2200 (exception: the “Ere” sheet, which also accepts distant years).
- All input moments are **UTC**. For local time use the longitude and the “Fus” (Zone) or “Solar” mode in “Timp complet”.
- The file has no macros. If the values look stale, press Ctrl+Alt+F9 (full recalculation).
- The basic parameters (internal epoch, leap rule, month length, precession cycle, era anchor, etc.) are in the “Timp complet” sheet, rows 45–67. The calendar sheets and the “Ere” sheet use them from there.
- Sheet order: Timp 36h, Conversie, Calendar 13 luni, Calendar an, Calendar perete, Timp complet, Ere, Fusuri noi, Luni noi, Evenimente, Nume sanscrită, Nume EN-FR, Cadrane. In English: 36-hour time, Conversion, 13-month calendar, Year calendar, Wall calendar, Full time, Eras, New zones, New moons, Events, Sanskrit names, EN-FR names, Dials.

### 4.2 The “Timp 36h” sheet (36-hour time)

The table of the 3,600 new seconds of the day. The columns are Hour (0–35), Minute (0–9), Second (0–9), Rotation angle (°) and the standard-time equivalent (hh:mm:ss, every 24 seconds). The rules are written in column G. The sheet has no cells to fill in; it is for reference only.

### 4.3 The “Conversie” sheet (Conversion)

Converts the time of day in both directions, with subsecond.

- **Section 1 (24 h → 36 h).** Enter the standard hour, minutes and seconds in B6:D6 (example 15:30:45). The result is in B9:F9: hour (0–35), minute, second, subsecond (0–23) and angle. Example: 23 h 2 min 6 s 21 subseconds, 232.6875°.
- **Section 2 (36 h → 24 h).** Enter the new hour, minute, second and subsecond in B14:E14 (example 20 h 7 min 5 s 12 subseconds). The result is in B17:E17, including the hh:mm:ss form (13:50:12).
- **The “Units of the system” table.** B21 (24 subseconds per second) and B22 (0.1° per second) are modifiable assumptions; the rest of the table is calculated. Below it is a table of reference points (standard time → new time).
- The values are integers: seconds and subseconds are entered as whole numbers.

### 4.4 The “Calendar 13 luni” sheet (13-month calendar)

The 13-month calendar, aligned to the solstice, with three sections.

- **Section 1 (Gregorian → 13 months).** Enter the date in B6. The sheet shows the new year k, the start of the year, the day of the year N, whether the year is leap, **the era (ER), the year of the era (AE) and the name of the era**, the month, the day, the weekday, the week, the type of day (ordinary, Year Day or Leap Day), the Sanskrit names, the solar arc and the solar quadrant.
- **Section 2 (13 months → Gregorian).** Enter the Gregorian year (which identifies the new year), the month, the day and, if needed, “Special day” from the list (No, Year Day, Leap Day) in B22:E22. The result is the Gregorian date in B29, plus the Gregorian and new weekdays. For “Leap Day” in a non-leap year, “Non-leap year” appears.
- **Section 3 (the 13 months of the year).** Enter the Gregorian year in B33. The table shows the first and last Gregorian day of each month (rows 41–53), then the Year Day and the Leap Day; B39 shows the era and year of the era (ER-AE). B33 also feeds the “Calendar an” sheet.

### 4.5 The “Calendar an” sheet (Year calendar)

The day-by-day table of the chosen new year (the year is taken from “Calendar 13 luni”, B33). The columns: Gregorian date, day of the year, month, day of the month, weekday (new and Gregorian), solar arc, solar quadrant and the astronomical phenomenon of the day, with its UTC time. The first day of each month is colored blue and the special days orange. The sheet has no cells to fill in.

### 4.6 The “Calendar perete” sheet (Wall calendar)

The wall-calendar generator, with 15 landscape A4 pages: 13 months, one page for the days outside the week and one for the phenomena of the year.

- **What you fill in.** The Gregorian year in B2 and, in G3, the type of day names: “Tradiționale” (Traditional) or “Numerice” (Numeric).
- **What each month page shows.** A title with the name of the month in Romanian, Sanskrit (IAST and Devanagari), English and French; ER, AE and the name of the era; the Gregorian span of the month; the day header in four languages and the grid of 4 weeks. In each day, the large number is the day in the 13-month calendar, and below it, small, the Gregorian date and the symbols of the phenomena.
- **Symbols.** ● new moon, ◐ first quarter, ○ full moon, ◑ last quarter, ☀ solstice or equinox, ⊗ possible eclipse. The phenomena are in UTC. The first day of each Gregorian month is red.
- **Printing.** File → Print. The print area, the landscape A4 format and the page breaks are already set. For another year, change B2. The control area (rows 1–4) is not printed.

### 4.7 The “Timp complet” sheet (Full time)

The conversion between UTC and the full code, with zones.

- **Section 1 (UTC → code).** Enter the date in B6, the UTC hour, minute and second in C6:E6, the longitude in B8 and the mode in C8 (Zone or Solar; in the sheet, “Fus” or “Solar”). The results are on three rows: the solar fields (row 19: ER, AE, CS, AS, ZA and the name of the era), the month and day (row 21: CL, LC, ZN and the name of the day) and the new time (row 23: HN, MN, SN, SS). The full code appears in B24.
- **Section 2 (code → UTC).** Enter ER, AE, LC, ZN and the cycle (0 = current) in B29:F29, then HN, MN, SN, SS, the longitude and the mode in B31:G31. The result is the UTC moment (B41:E41). In F41 “OK” or an explanation appears (for example “Non-leap year: there is no Leap Day”).
- **The parameters** are in rows 45–67. Those of the eras are B50 (the precession cycle, 25,772), B51 (the number of eras, 12) and B52 (the anchor: the label year of AE 1 of ER 1, 2441). Change them only if you want to test different rules.
- **The sheet does not calculate the solar and lunar angles** for an arbitrary moment. The solar quadrant (CS) and the lunar day (CL) are obtained from the event tables. The exact angles are in Python (section 5).

### 4.8 The “Fusuri noi” sheet (New zones)

The table of the 37 zone values (−18 … +18): the central longitude, the limits of the band, the offset in new hours and the equivalent in standard hours. In columns H–K there is a table of places; you can modify the longitudes (yellow cells) to see the zone and the deviation from solar time.

### 4.9 The “Luni noi” (New moons) and “Evenimente” (Events) sheets

- “Luni noi” lists the astronomical new moons 1899–2201 (UTC), with an accuracy of about one minute. They are used for the lunar day CL.
- “Evenimente” lists all astronomical phenomena 1899–2201: solstices, equinoxes, quarters of the Moon and possible eclipses. Columns F–G are the solar moments, with the quadrant that begins at each. CS and the symbols in the wall calendar are computed from them.
- The sheets are not modified by hand. For another interval, the data can be computed with the functions in `sistem_timp.py` (section 8).

### 4.10 The “Nume sanscrită” (Sanskrit names) and “Nume EN-FR” (EN-FR names) sheets

Name tables used by the calendar sheets. “Nume sanscrită” has the numerals 1–13, the names of the months, the weekdays (traditional and numeric) and the special days, in IAST and Devanagari. “Nume EN-FR” has the months (First month / Premier mois …), the days (Monday / lundi and the numeric variant Day 1 / Jour 1) and the special days (Year Day / Jour de l'année, Leap Day / Jour bissextile). The names of the eras are in the “Ere” sheet. For other names or another language, replace the texts in the tables: the formulas in the calendar sheets pick them up automatically.

### 4.11 The “Cadrane” sheet (Dials)

It holds the four dial images (year, eras, 18 h clock and 36 h clock), generated with `creare_cadrane.py` for a given moment (2 October 2026, 12:00 UTC, Bucharest). For another moment, run the script with other values (section 5.5).

### 4.12 The “Ere” sheet (Eras)

The precessional eras and historical dating.

- **The table of the 12 eras** (rows 5–16): the names in Sanskrit, English and French, the length, the position in the cycle, the start and end years of the current cycle (in historical numbering) and the four quadrants of 6,443 years (rows 20–23).
- **Historical dating: year → ER, AE.** Enter the year and the epoch (“e.n.” = CE or “î.e.n.” = BCE) in B28:C28. The result (B33:D33) is the era, the year of the era and the name of the era. Example: 785 BCE gives ER 11, AE 1072 (Meṣa · Aries · Bélier).
- **Historical dating: ER, AE → year.** Enter ER, AE and the cycle (0 = current cycle, −1 = the one before, +1 = the next) in B38:D38. The result is the year, in B39 (astronomical year) and B40 (CE/BCE text); B41 checks whether AE fits within the chosen era.
- The parameters (cycle, number of eras, anchor) are in “Timp complet”, rows 50–52.

## 5. Python guide

### 5.1 Installation and requirements

- Python 3.9 or newer (tested with 3.12).
- `sistem_timp.py`, `calendar_13_luni.py` and `conversie_timp.py` use only the standard library. Nothing needs to be installed.
- `creare_cadrane.py` needs `matplotlib`, `numpy` and `openpyxl` (`pip install matplotlib numpy openpyxl`) and the file `sistem_timp.py` in the same folder.
- The full tests in `sistem_timp.py` compare the results with an independent astronomy program, if it is installed: `pip install ephem`. Without it, that test is skipped.
- On Windows use `py` instead of `python`, if needed. Put the scripts in the same folder.

### 5.2 `sistem_timp.py`

Exact conversion between UTC and the full code, the eras and historical dating, plus the positions of the Sun and Moon. The commands are:

```
python sistem_timp.py g2t 2026-09-29T15:30:45 26.1 F      # UTC -> code (longitude 26.1°, Zone mode)
python sistem_timp.py g2t 2026-09-29T15:30:45 26.1 L      # same moment, local solar time
python sistem_timp.py t2g "12-1734-4-57.3-19-11-03 26:02:06:21 F+03"   # code -> UTC
python sistem_timp.py acum [longitude] [F|L]              # the current moment ("acum" = now)
python sistem_timp.py unghiuri 2026-09-29T15:30:45 26.1 F # daily rotation, solar angle and lunar angle
python sistem_timp.py evenimente 2026                     # the year's phenomena
python sistem_timp.py luni-noi 2026                       # the year's new moons (UTC)
python sistem_timp.py istoric 785BCE                      # historical year -> ER, AE (also: 2026, -784, "785 î.e.n.")
python sistem_timp.py istoric-inv 11 1072 [cycle]         # ER, AE -> historical year
python sistem_timp.py ere                                 # the 12 eras: names, lengths, years
python sistem_timp.py ayanamsa [year]                     # the precession angle relative to Spica
python sistem_timp.py fusuri                              # the table of the 36 zones
python sistem_timp.py test                                # the full checks
```

The longitude is in degrees (positive to the east). Mode `F` is the new zone (“fus”), and `L` is local solar time. Examples of output:

```
$ python sistem_timp.py g2t 2026-09-29T15:30:45 26.1 F
2026-09-29 15:30:45 UTC  =  12-1734-4-57.3-19-11-03 26:02:06:21 F+03
ER 12 (Mīna · Pisces · Poissons), AE 1734; ziua 283 din an; cadranul 4, arcul 57; Miercuri (Budhavāra · Wednesday · mercredi); luna calendaristică 11; luna: ziua 19 (gibbă descrescătoare); unghi solar 276.5°, unghi lunar 218.1°

$ python sistem_timp.py unghiuri 2026-09-29T15:30:45 26.1 F
2026-09-29 15:30:45 UTC  (fus +3)
rotația zilnică :  262,69° =  291,88 gon = 4,5848 rad
unghi solar     :  276,51° =  307,23 gon = 4,8260 rad   (cadranul 4)
unghi lunar     :  218,11° =  242,34 gon = 3,8067 rad   (gibbă descrescătoare)

$ python sistem_timp.py evenimente 2026
2026-01-03 10:03 UTC ☾ lună plină
2026-01-10 15:49 UTC ☾ ultimul pătrar
2026-01-18 19:52 UTC ☾ lună nouă
...
```

(The script prints in Romanian: “ziua 283 din an” = day 283 of the year, “cadranul 4, arcul 57” = quadrant 4, arc 57, “Miercuri” = Wednesday, “luna calendaristică” = calendar month, “luna: ziua 19 (gibbă descrescătoare)” = lunar day 19 (waning gibbous), “unghi solar/lunar” = solar/lunar angle, “rotația zilnică” = daily rotation, “lună plină/nouă” = full/new moon, “ultimul pătrar” = last quarter.)

If the code in `t2g` contains inconsistent values (for example a CS or a CL that does not match the date), a **warning** is displayed. Values that cannot exist, such as hour 25, an AE too large for the given era, or the Leap Day in a non-leap year, give an error message. The `g2t` and `t2g` commands accept years between 1 and 9999 CE (for BCE years use `istoric`).

### 5.3 `calendar_13_luni.py`

Gregorian ↔ 13-month calendar conversion, aligned to the solstice, with names in Romanian, Sanskrit, English and French.

```
python calendar_13_luni.py g2n 2026-09-29        # Gregorian -> 13 months
python calendar_13_luni.py n2g 2026 11 3         # (Gregorian year, month, day) -> Gregorian date
python calendar_13_luni.py n2g AN16 ziua-bisecta # the new year can be given directly: AN<k>; or ziua-anului / ziua-bisecta
python calendar_13_luni.py an 2026               # the 13 months of the new year, with Gregorian dates
python calendar_13_luni.py test                  # check of all days 1900-2200
```

(`ziua-anului` is the Year Day and `ziua-bisecta` the Leap Day.)

```
$ python calendar_13_luni.py g2n 2026-09-29
2026-09-29  =  ER 12 (Mīna · Pisces · Poissons), AE 1734 (anul nou k = 15): luna 11 (Ekādaśa māsa · Eleventh month · Onzième mois), ziua 3, Miercuri (Budhavāra · Wednesday · mercredi), săptămâna 41; arcul solar 57.3, cadranul 4
```

In this script the solar quadrant (CS) is computed from the rule of arcs; the exact value, from the position of the Sun, is given by `sistem_timp.py` and the Excel sheets. For days near the solstices and equinoxes the two can differ by 2–3 days.

### 5.4 `conversie_timp.py`

Simple conversion of the time of day, with subsecond.

```
python conversie_timp.py 24 15:30:45     # 24 h -> 36 h:  23 h  2 min  6 s  21 subseconds  (232.6875°)
python conversie_timp.py 36 23:02:06:21    # 36 h -> 24 h:  15:30:45   (the fourth value, the subsecond, is optional)
python conversie_timp.py test            # checks all 86,400 seconds
```

### 5.5 `creare_cadrane.py`

Draws four dials for a given moment (by default now, UTC): **the year dial**, **the eras dial**, the 18 h clock dial and the 36 h clock dial. The clock dials also show the current date; the year dial shows the solar arcs, the months, the phases of the Moon and the solar quadrants, with the hand on the current date; the eras dial shows the precession circle, with the 12 eras, the enlarged scale of the current era and the hand on the current year.

```
python creare_cadrane.py                                        # four PNGs in the current folder, for the present moment
python creare_cadrane.py --moment 2026-10-02T12:00:00           # another moment (UTC)
python creare_cadrane.py --moment 2026-10-02T12:00:00 --lon 26.1 --mod F   # with longitude and mode (F = Zone, L = Solar)
python creare_cadrane.py --out cadrane                          # saves them in a folder
python creare_cadrane.py --xlsx timp_36_ore_rotatie.xlsx        # also inserts them into the "Cadrane" sheet
```

The files created are `cadran_an.png`, `cadran_ere.png`, `cadran_18h_jumatate_zi.png` and `cadran_36h_zi_intreaga.png`. After inserting them into Excel, the formulas in the file must be recalculated (open the file in Excel and save it, or press Ctrl+Alt+F9). The images are static: they show the current time only at the moment the script is run.

### 5.6 Using it as a library

The functions can be imported into your own programs:

```python
from datetime import datetime
import sistem_timp as st
import calendar_13_luni as c13
import conversie_timp as ct

# UTC -> full code
r = st.din_utc(datetime(2026, 9, 29, 15, 30, 45), lon=26.1, mod="F")
print(st.cod(r))                     # 12-1734-4-57.3-19-11-03 26:02:06:21 F+03
print(r["er"], r["ae"], r["lc"], r["zn"], r["cl"], r["faza"])   # 12 1734 11 3 19 gibbă descrescătoare
print(r["unghi_solar"], r["unghi_lunar"])

# full code -> UTC (and the list of consistency warnings)
dt, avert = st.din_cod("12-1734-4-57.3-19-11-03 26:02:06:21 F+03")
print(dt, avert)                     # 2026-09-29 15:30:45 []

# era and year of the era for any year (1 BCE = 0, 785 BCE = -784)
print(st.era_din_an(-784))                   # (11, 1072)
print(st.nume_an(st.an_din_era(11, 1072)))   # 785 î.e.n.
print(st.parse_an_istoric("785 î.e.n."))     # -784

# positions and events
print(st.fmt_unghi(st.unghi_solar(dt)))      # degrees, gon, radians
print(st.evenimente(2026)[:2])               # the first events of the year
print(st.eveniment_solar(2026, 3))           # the December 2026 solstice (UTC)

# calendar and time of day
print(c13.an_pentru_an_gregorian(2026))      # 15
print(c13.in_gregorian(15, 11, 3))           # 2026-09-29
print(ct.la_36(15, 30, 45), ct.la_24(23, 2, 6, 21))
```

The dictionary returned by `din_utc` has, among others, the keys `k`, `n` (day of the year), `er`, `ae`, `cs`, `arc`, `za`, `lc`, `zn`, `hn`, `mn`, `sn`, `ss`, `cl`, `fus` (zone), `faza` (phase), `unghi_solar`, `unghi_lunar` and `zi_sapt` (weekday). The `in_utc` and `din_cod` functions have a `ciclu` (cycle) parameter (0 = the current precession cycle).

## 6. Worked examples

**Example 1: the noon hour.** The middle of the day is 18:00:00:00, that is 12:00 in standard time. At UTC it is 12:00 UTC; in zone +3 (the zone time is UTC+2) it means 12:00 in zone time, that is 10:00 UTC.

**Example 2: what date is 29 September 2026?** In “Calendar 13 luni” (B6) you get: new year k = 15, ER 12 (Mīna · Pisces · Poissons), AE 1734, day 283, month 11, day 3, Wednesday (Budhavāra · Wednesday · mercredi). The same date in the Gregorian calendar is a Tuesday, so the two weeks are offset by one day.

**Example 3: a calendar for 2027, with the Leap Day.** In “Calendar perete” put 2027 in B2. New year 16 has 366 days (16 is a multiple of 4). The page “Days outside the week” shows the Year Day (20.12.2027) and the Leap Day (21.12.2027).

**Example 4: reading the code.** `12-1734-4-57.3-19-11-03 26:02:06:21 F+03` reads: era 12 (Pisces), year 1734 of the era; the Sun is in quadrant 4 (after the September equinox), in arc 57, day 3; the Moon is on lunar day 19, waning gibbous; it is month 11, day 3; new time 26 h 2 min 6 s 21 subseconds in zone +3 time. In standard time, the zone time is 17:30:45, that is 15:30:45 UTC.

**Example 5: the same time, two zone modes.** At longitude 26.1° E, “Zone” mode gives the time 26:02:06:21, and “Solar” mode gives 25:08:07:21, because local solar time is UTC plus 26.1 new minutes. The difference of 3.9 new minutes (15.6 standard minutes) is the deviation of the place from the center of the zone (26.1° versus 30°).

**Example 6: one hour and 24 seconds.** 1 new hour 0 min 1 s = 2,400 + 24 = 2,424 standard seconds = 00:40:24.

**Example 7: historical dating.** The year 785 BCE is ER 11 (Meṣa · Aries · Bélier), AE 1072. In reverse, ER 11 and AE 1072 mean 785 BCE. In Excel: the “Ere” sheet, B28:C28. In Python: `python sistem_timp.py istoric 785BCE`.

**Example 8: the current era.** The year 2026 is ER 12 (Pisces), AE 1734; the Age of Pisces began in the year 293 CE and ends with the year 2440. ER 1 (Aquarius) begins with the new year that starts on 21.12.2440. In Python: `python sistem_timp.py ere`.

**Example 9: the dials for a day.** `python creare_cadrane.py --moment 2026-10-02T12:00:00 --lon 26.1` draws the year, era and clock dials for 2 October 2026, 12:00 UTC, with zone +3 (new time 21:00:00:00).

## 7. Checks, accuracy and limits

### 7.1 What was checked

- **Conversions.** All 86,400 seconds of the day convert and come back exactly (24 h ↔ 36 h). All 109,938 days from 1900–2200 convert exactly between the Gregorian and the 13-month calendar, in both directions, and every month begins on Monday and ends on Sunday. `calendar_13_luni.py` and `sistem_timp.py` give the same results on all these days.
- **The start of the year.** Day 1 of each year falls on the UTC day of the December solstice for all 21 years checked (2011–2031), including 2020, compared against the astronomy library ephem.
- **Positions and phenomena, compared with an independent astronomy program (`ephem`).** The position of the Sun differs by at most 0.015°, the longitude of the Moon by at most 0.015° and the latitude by at most 0.007°. Solstices and equinoxes differ by at most 54 seconds. The quarters of the Moon in 2026 differ by at most 66 seconds, and the new moons of 2000–2050 by at most 32 seconds. The eclipses of 2024–2026 are exactly the real ones (6 solar, 5 lunar with umbra).
- **The eras.** The 12 eras have lengths 2147/2148, the four quadrants have exactly 6,443 years, the anchor computed from Spica gives ayanāṁśa 30° around the year 2440, and the year ↔ (ER, AE) conversions come back exactly over the whole current cycle. The deviation of the model from the real precession (IAU 2006) is below 0.5° (about 35 years) over the last 4,000 years.
- **Excel versus Python.** The sheets “Calendar 13 luni”, “Calendar an”, “Calendar perete”, “Timp complet”, “Ere” and “Evenimente” were compared with the scripts on several scenarios (the years 2026, 2027, 1905, leap and non-leap years, zone modes, BCE and CE years), with no difference.

### 7.2 Limits and assumptions

- **The accuracy of the Moon's phases** is about one minute. A moment within one minute of local midnight may get a different lunar day than in reality.
- **Eclipses are “possible”**: the mark is based on the position of the Moon relative to the node and does not indicate visibility. Penumbral-only lunar eclipses are not marked.
- **Leap seconds are ignored**, in Python and in Excel alike.
- **Δt (the difference between terrestrial time and UTC)** is approximated by formulas; errors of a few seconds do not affect daily results.
- **The range** 1900–2200 is the one validated for exact days. The scripts accept exact days for the years 1–9999 CE; for BCE years only the year (ER, AE) is dated.
- **Excel does not calculate the solar and lunar angles** for an arbitrary moment; for them use Python.
- **The eras are a model.** They have equal lengths (2147 or 2148 years), while real precession has changed over time: the model differs from the real position of the vernal point by about 8 years at 1 CE, 17 years at 785 BCE and 31 years at 1800 BCE. The stellar reference (Spica) has an uncertainty of a few years. Part of the “dates” of the eras are therefore conventions: the choice of the reference star and of the label year 2441.
- **An ER-AE code is unique only within one precession cycle** (25,772 years); the “cycle” parameter chooses the cycle.
- **The weekdays** of the new calendar do not coincide with the Gregorian ones. The days outside the week (Year Day and Leap Day) interrupt the continuity of the 7-day week, as in other fixed calendars.
- **The Sanskrit names** come from the author's knowledge and have not been verified in an external source; the names of the special days (Varṣa-dina, Adhika-dina) are proposals. The English and French names are direct translations.
- **The calendars of earlier versions** were aligned to 1 January, and the code had the fields MC, VA and AN. The current sheets and scripts are aligned to the solstice and use ER and AE; the results differ from the old ones.

### 7.3 Precession variants considered

Real precession accelerates slightly, so the real limits of the eras (the moment when ayanāṁśa relative to Spica reaches 30°·j, by IAU 2006 precession) are not at equal distances. The real eras are now about 2154 years long (ER 12) and 2133 (ER 1), and in the past longer: 2174 about 4,000 years ago and 2240 around 8500 BCE. Compared with the equal eras of the model, the difference at the start of an era is:

| Start of era | Real year | Model deviation |
|---|---|---|
| ER 1 (anchor) | 2441 CE | 0.5 years |
| ER 12 (Pisces) | 287 CE | 6.5 years |
| ER 11 | 1888 BCE | 33 years |
| ER 10 | 4083 BCE | 81 years |
| ER 9 | 6301 BCE | 152 years |

Three variants were evaluated:

- **A. Real limits, computed from precession.** The most accurate (under 1–2 years in written history), but the eras have different lengths, the four quadrants no longer have exactly 6,443 years, the formulas in Excel, Python and the web page become limit tables, and the cycle is no longer periodic (the precession polynomial is not reliable beyond a few thousand years).
- **B. Equal eras with an adjusted cycle.** With a cycle of about 25,760 years the error stays around ±180 years over a very wide interval, without bringing it below a few years over the whole cycle.
- **C. Equal eras, the current model.** Simple, with the same formulas and quadrants. On the scale of history the difference is of the order of tens of years.

**Decision: variant C**, for simplicity. Variants A and B remain documented here and can be adopted later without changing the structure of the ER-AE code, only the limit table.

## 8. Troubleshooting and frequently asked questions

**The values look stale or are missing.** Press Ctrl+Alt+F9 in Excel. In LibreOffice use Data → Calculate → Recalculate Hard.

**The Devanagari script or the symbols ◐ ◑ ⊗ ☀ do not display.** They depend on system fonts (for example Nirmala UI or Noto Sans Devanagari for Devanagari, Segoe UI Symbol for symbols). Install a font that contains them or change the font of the cells. The Latin transliterations display anyway.

**The message “An nebisect” (non-leap year).** You asked for the Leap Day in a new year without 366 days. Leap years are those with k a multiple of 4 and not of 128 (for example k = 16, that is Gregorian year 2027).

**The validation message on a yellow cell.** The value is outside the limits (for example hour 24, month 14, AE above 2148, or a year outside the 1900–2200 interval). Correct the value.

**How do I choose the year in the calendar sheets?** Give the Gregorian year that contains 1 July of the desired new year. For the year that begins in December 2026, enter 2027.

**How do I find ER and AE for a BCE year?** In Excel: the “Ere” sheet, B28 (the year) and C28 (“î.e.n.”, BCE). In Python: `python sistem_timp.py istoric 785BCE`.

**How do I choose another anchor for the eras?** In Excel: “Timp complet”, cell B52 (the label year of AE 1 of ER 1, default 2441). In Python: the constant `ANCORA_ET` in `sistem_timp.py` (and `K_ANCORA` in `calendar_13_luni.py`). The sheets “Ere”, “Timp complet”, “Calendar 13 luni” and “Calendar perete” update on their own; the dials are redrawn with `creare_cadrane.py`.

**How do I change the internal epoch, the leap rule or the month length?** In the “Timp complet” sheet, rows 45–67. The Python script uses its own constants: change them there as well (the start of the files `sistem_timp.py` and `calendar_13_luni.py`). The “Luni noi” and “Evenimente” tables do not depend on the epoch.

**How do I compute the event tables for another interval?** With the functions `evenimente_brute(an)` and `luna_noua(k)` in `sistem_timp.py` you can compute the list for any year and paste it into the “Evenimente” and “Luni noi” sheets (the moment as an Excel serial number, the symbol, the description and the code). The script that built the sheets is not delivered separately.

**How do I print the wall calendar?** File → Print, landscape A4 paper. The print area is already set. To export to PDF choose “Save as PDF” in the print window.

**The `python` command is not recognized (Windows).** Use `py sistem_timp.py ...`. If Python is not installed, download it from python.org (version 3.9 or newer).

**How do I make the clock run in real time?** The `acum` command shows the current moment once, and `creare_cadrane.py` draws the dials for the moment it is run. An animated dial would need a separate web page or application.

## 9. Appendices

### 9.1 Glossary

| Term | Meaning |
|---|---|
| UTC | Coordinated Universal Time, in which all input moments are given |
| SI second | The second defined with atomic clocks; a subsecond is exactly one SI second |
| ER, AE | The precessional era (1–12) and the year of the era (1–2148, no year zero) |
| Precession | The slow rotation of the Earth's axis; a cycle of about 25,772 years |
| Ayanāṁśa | The ecliptic longitude of Spica minus 180°; the precession angle relative to the stars |
| k | The number of the new year, an internal counter (k = 1 begins on 22.12.2011) |
| N | The day of the new year (1–365 or 366) |
| CS | The solar quadrant 1–4, by the real position of the Sun |
| AS, ZA | The 5-day solar arc (01–73) and the day within the arc |
| CL | The lunar day (01–30) |
| LC, ZN | The calendar month (00–13) and the day of the month (01–28) |
| HN, MN, SN, SS | The new hour, new minute, new second, subsecond |
| Solar angle | The position of the Sun from the December solstice (0° at the solstice) |
| Lunar angle | The elongation of the Moon from the Sun (0° new moon, 180° full moon) |
| Gon | Gradian: 1/400 of a circle, 0.9° |
| Year Day, Leap Day | Days 365 and 366 of the new year, outside the week |

### 9.2 The tradition behind the units

The system takes up, at different scales, units that already existed in history:

- **The Babylonian uš (the degree of time).** The Babylonian day had 360 uš, of 4 minutes each. The new minute of the system is one uš.
- **The Egyptian decans.** The ecliptic was divided into 36 decans of 10° each. The 36 new hours of 10° are the decans. The 5 epagomenal days of the Egyptian calendar play the role of the Year Day and the Leap Day.
- **The Indian pala.** A ghaṭī is about 24 minutes and has 60 pala; a pala is about 24 seconds, that is 0.1° of rotation. The new second is a pala.
- **The Chinese solar terms (jiéqì).** The year is divided into 24 periods of 15° of solar longitude, each with three pentads of 5 days (72 per year). The solar arcs of the system are pentads, and the solar angle is their basic idea.
- **Other angle units.** The sexagesimal degree (Mesopotamia), the French gradian or gon (400 per circle), the military mil (1/6400 of a circle) and the radian (2π per circle, the modern name from the 19th century). The Indian astronomer Āryabhaṭa used the radius 3438, that is, one radian expressed in minutes of arc.

### 9.3 The names of the months (Sanskrit, English, French)

| Month | Sanskrit (IAST) | English | French |
|---|---|---|---|
| 1 | Prathama māsa | First month | Premier mois |
| 2 | Dvitīya māsa | Second month | Deuxième mois |
| 3 | Tṛtīya māsa | Third month | Troisième mois |
| 4 | Caturtha māsa | Fourth month | Quatrième mois |
| 5 | Pañcama māsa | Fifth month | Cinquième mois |
| 6 | Ṣaṣṭha māsa | Sixth month | Sixième mois |
| 7 | Saptama māsa | Seventh month | Septième mois |
| 8 | Aṣṭama māsa | Eighth month | Huitième mois |
| 9 | Navama māsa | Ninth month | Neuvième mois |
| 10 | Daśama māsa | Tenth month | Dixième mois |
| 11 | Ekādaśa māsa | Eleventh month | Onzième mois |
| 12 | Dvādaśa māsa | Twelfth month | Douzième mois |
| 13 | Trayodaśa māsa | Thirteenth month | Treizième mois |

### 9.4 The names of the weekdays

| Day | Traditional Sanskrit | Numeric Sanskrit | English | French |
|---|---|---|---|---|
| Monday | Somavāra | Prathama-dina | Monday | lundi |
| Tuesday | Maṅgalavāra | Dvitīya-dina | Tuesday | mardi |
| Wednesday | Budhavāra | Tṛtīya-dina | Wednesday | mercredi |
| Thursday | Guruvāra | Caturtha-dina | Thursday | jeudi |
| Friday | Śukravāra | Pañcama-dina | Friday | vendredi |
| Saturday | Śanivāra | Ṣaṣṭha-dina | Saturday | samedi |
| Sunday | Ravivāra | Saptama-dina | Sunday | dimanche |

Special days: the Year Day is Varṣa-dina · Year Day · Jour de l'année; the Leap Day is Adhika-dina · Leap Day · Jour bissextile (the Sanskrit names are proposals). In the “Calendar perete” sheet the numeric variant uses Day 1 … Day 7 / Jour 1 … Jour 7.
