# Timpul precesional uman și calendarul precesional uman

## Manual de utilizare pentru Excel, Python și pagina web

Versiune: 3 octombrie 2026. Fișiere acoperite: `timp_36_ore_rotatie.xlsx`, `sistem_timp.py`, `calendar_13_luni.py`, `conversie_timp.py`, `creare_cadrane.py`, `ora_minute_secunde.xlsx` și imaginile cadranelor.

> Toate datele și orele de intrare sunt în UTC, cu excepția cazurilor în care se spune altfel. Intervalul testat este 1900–2200.

## Cuprins

1. Ce este acest sistem
2. Fișierele livrate
3. Reguli și formule
4. Ghid pentru Excel, foaie cu foaie
5. Ghid pentru Python
6. Exemple lucrate
7. Verificări, acuratețe și limite
8. Depanare și întrebări frecvente
9. Anexe: glosar, tradiția din spatele unităților, tabele de nume

## 1. Ce este acest sistem

**Numele.** „Timpul precesional uman” este ceasul de 36 de ore (360°), iar „calendarul precesional uman” este data și calendarul de 13 luni. „Precesional” vine din precesia echinocțiilor, mișcarea lentă (25.772 de ani) care împarte timpul în 12 ere; „uman” înseamnă la scara perceperii umane: sistemul folosește numai ce poate observa orice om de pe Pământ. Un singur ciclu precesional, cel curent (23332 î.e.n. – 2440 e.n.), cuprinde toată istoria cunoscută a omenirii, deci orice dată din trecut are un cod unic. După 2440 începe ciclul următor. Se folosește numele întreg, nu abrevieri.

Sistemul măsoară timpul ca pe un unghi și ancorează anul și erele de mișcările reale ale Soarelui, ale Lunii și ale axei Pământului, fără nicio dependență de o tradiție religioasă. Ideile de bază sunt:

- **Ziua are 36 de ore noi și corespunde unei rotații complete de 360°.** O oră nouă are 10° și 10 minute noi, un minut nou are 1° și 10 secunde noi, o secundă nouă are 0,1° și 24 de subsecunde. O subsecundă este exact o secundă SI, deci conversia cu timpul standard este exactă, fără rotunjiri.
- **Prânzul solar este la ora 18:00:00:00**, ca „12" la ceasul clasic. Miezul nopții este ora 0.
- **Anul începe în ziua solstițiului din decembrie.** Un an nou are 365 de zile, sau 366 în anii bisecți (numărul anului k este multiplu de 4, dar nu de 128). Anul mediu este 365,2421875 zile, foarte aproape de anul tropic.
- **Calendarul are 13 luni a câte 28 de zile**, adică 364 de zile și 52 de săptămâni exacte. Fiecare lună începe luni (ziua 1) și se termină duminică (ziua 28). Ziua 365 este **Ziua anului**, iar în anii bisecți ziua 366 este **Ziua bisectă**. Ambele sunt în afara săptămânii și nu au zi a săptămânii.
- **Soarele și Luna sunt tratate ca unghiuri pe un cerc.** Unghiul solar se măsoară de la solstițiul din decembrie (0°, 90°, 180°, 270° = solstițiu, echinocțiu, solstițiu, echinocțiu). Unghiul lunar este elongația față de Soare (0° lună nouă, 90° primul pătrar, 180° lună plină, 270° ultimul pătrar).
- **Erele urmează precesia echinocțiilor.** Axa Pământului descrie un ciclu de circa 25.772 de ani, împărțit în 12 ere precesionale (ER 1–12) de 2147 sau 2148 de ani, grupate în 4 cadrane de câte 6.443 de ani. Anul din eră este AE, fără an zero. Reperul este steaua Spica: ER 1 (Vărsător) începe cu anul nou care începe la 21.12.2440, iar era curentă este ER 12 (Pești), din anul 293 e.n. Cu ele se poate data și istoria: 785 î.e.n. = ER 11, AE 1072.
- **Denumirile lunilor, zilelor și erelor** există în sanscrită, engleză și franceză, cu numerale 1–13, ca să rămână neutre față de orice dogmă.

Unitățile de timp noi și echivalentele lor:

| Unitate nouă | Echivalent în unități noi | Unghi de rotație | În timp standard |
|---|---|---|---|
| Zi | 36 de ore | 360° | 24 h = 86.400 s |
| Oră nouă (HN) | 10 minute | 10° | 40 min = 2.400 s |
| Minut nou (MN) | 10 secunde | 1° | 4 min = 240 s |
| Secundă nouă (SN) | 24 de subsecunde | 0,1° | 24 s |
| Subsecundă (SS) | – | 0,004167° | 1 s (secunda SI) |

## 2. Fișierele livrate

| Fișier | Ce conține | Când îl folosești |
|---|---|---|
| `timp_36_ore_rotatie.xlsx` | Registrul principal, cu 13 foi (secțiunea 4) | Conversii, calendare, ere, cod complet, tipărire |
| `sistem_timp.py` | Conversia exactă UTC ↔ cod complet (ER-AE-…), erele și datarea istorică, poziții reale ale Soarelui și Lunii, evenimente, fusuri, teste | Calcule exacte pentru orice moment; alternativa programatică la foile „Timp complet" și „Ere" |
| `calendar_13_luni.py` | Conversia gregorian ↔ calendarul de 13 luni, aliniat la solstițiu, cu denumiri în patru limbi | Conversii de date, tabelul lunilor unui an |
| `conversie_timp.py` | Conversia simplă 24 h ↔ 36 h, cu subsecundă | Doar ora din zi |
| `creare_cadrane.py` | Desenează patru cadrane (anul, erele, ora de 18 h și de 36 h) pentru un moment dat și le poate insera în Excel | Imagini pentru tipărit, cu data curentă |
| `cadran_an.png`, `cadran_ere.png`, `cadran_18h_jumatate_zi.png`, `cadran_36h_zi_intreaga.png` | Cadranele gata făcute, pentru 2 octombrie 2026, 12:00 UTC, la București | Afișare, tipărire |
| `ora_minute_secunde.xlsx` | Tabel simplu cu cele 86.400 de secunde ale zilei standard (ora, minutele, secundele) | Referință de bază |
| `manual_utilizare_sistem_timp.md` și `.docx` | Acest manual | Citire |

## 3. Reguli și formule

### 3.1 Ora din zi: conversia 24 h ↔ 36 h

Se trece prin T, numărul de secunde SI scurse de la miezul nopții:

```
T = h*3600 + m*60 + s                       (h 0-23, m 0-59, s 0-59)

24 h -> 36 h                                36 h -> 24 h
ora (HN)     = T // 2400                    T = HN*2400 + MN*240 + SN*24 + SS
minutul (MN) = (T % 2400) // 240            h = T // 3600
secunda (SN) = (T % 240) // 24              m = (T % 3600) // 60
subsecunda   = T % 24                       s = T % 60
unghi (grade) = T / 240
```

În formulele de mai sus `//` este câtul întreg și `%` este restul. Exemplu: 15:30:45 înseamnă T = 55.845, deci ora 23, minutul 2, secunda 6, subsecunda 21 și 232,6875°.

Echivalențe rapide: ora standard × 1,5 = ora nouă; 1 oră nouă = 40 de minute standard; 1 minut nou = 4 minute standard; 1 secundă nouă = 24 de secunde standard.

### 3.2 Anul nou

```
inceput_an(k) = 22.12.2011 + 365*(k-1) + (k-1)//4 - (k-1)//128
bisect(k)     = (k % 4 == 0) si (k % 128 != 0)
N             = ziua_calendaristica - inceput_an(k) + 1        (N = 1..365, sau 366)
```

Anul nou k este un **contor intern**: k = 1 este anul nou care începe la 22.12.2011, iar k poate fi și negativ (anii de dinaintea acestei epoci). Din k se deduc era și anul erei (secțiunea 3.8), care sunt cele folosite în cod.

**Cum alegi anul într-o foaie sau într-un script.** Se dă anul gregorian care conține 1 iulie al anului nou dorit. De exemplu, 2026 înseamnă k = 15, de la 21.12.2025 până la 20.12.2026, adică ER 12, AE 1734. În `calendar_13_luni.py` se poate da și direct `AN15` (adică k = 15).

Regula bisectă (4/128) dă un an mediu de 365,2421875 zile. Ziua în plus se adaugă la sfârșitul anului, după Ziua anului. Marele Jubileu (o zi în plus la 128.000 de ani) nu este folosit, pentru că ar mări eroarea față de anul tropic.

### 3.3 Calendarul de 13 luni, arcurile și cadranul solar

```
N <= 364:  LC = (N-1)//28 + 1        ZN = (N-1)%28 + 1       zi_saptamana = (N-1)%7  (0 = luni ... 6 = duminica)
N == 365:  LC = 00, ZN = 01  (Ziua anului)
N == 366:  LC = 00, ZN = 02  (Ziua bisecta, doar in anii bisecti)
AS = min(73, (N-1)//5 + 1)           ZA = N - 5*(AS-1)       (arcul 73 are 6 zile in anii bisecti)
```

- **LC** este luna calendaristică (01–13, sau 00 pentru zilele din afara săptămânii), iar **ZN** este ziua lunii (01–28). Ziua săptămânii se deduce: luni este ((ZN−1) mod 7) + 1 = 1.
- **AS** este arcul solar de 5 zile (01–73), iar **ZA** ziua din arc (1–5, sau 6). Arcurile sunt o a doua numărătoare a anului, asemănătoare cu cele 72 de pentade ale tradiției chineze.
- **CS** este cadranul solar 1–4, definit după poziția reală a Soarelui: cadranul în care se află Soarele la sfârșitul zilei. CS 1 începe la solstițiul din decembrie, CS 2 la echinocțiul din martie, CS 3 la solstițiul din iunie, CS 4 la echinocțiul din septembrie. Limitele sunt momentele astronomice exacte (formulele lui Meeus, precizie sub un minut), nu o regulă fixă de arce.
- Ziua săptămânii din calendarul nou diferă, în general, de cea gregoriană. De exemplu 29 septembrie 2026 este marți în calendarul gregorian, dar miercuri (ziua 3 a lunii 11) în cel nou. De aceea foile afișează adesea ambele zile.

### 3.4 Soarele, Luna și fenomenele astronomice

- **Unghiul solar** este longitudinea Soarelui de la solstițiul din decembrie. La 29.09.2026, 15:30:45 UTC, este 276,5° (cadranul 4).
- **Unghiul lunar** este elongația Lunii față de Soare. În același moment este 218,1°, adică între luna plină și ultimul pătrar.
- **Fazele Lunii** se împart în opt sectoare de câte 45°, centrate pe 0°, 45°, …, 315°: nouă, semilună crescătoare, primul pătrar, gibbă crescătoare, plină, gibbă descrescătoare, ultimul pătrar, semilună descrescătoare.
- **CL** este ziua lunară (01–30). Ziua 1 este ziua locală în care are loc luna nouă astronomică; ziua se numără apoi din zi în zi până la următoarea lună nouă.
- **Fenomenele** din foaia „Evenimente” și din scripturi sunt: cele patru momente solare (solstițiile și echinocțiile), cele patru pătrare ale Lunii și eclipsele posibile.
- **Eclipsă posibilă.** Se marchează eclipsa de Soare când latitudinea Lunii la luna nouă este sub 1,58°, și eclipsa de Lună (cu umbră) când distanța dintre axa umbrei și centrul Lunii este sub 1,0128 raze ecuatoriale ale Pământului. Marcajul spune că Luna e aproape de nod; nu spune unde se vede eclipsa.

### 3.5 Fusuri și timp local

Un grad de longitudine este un minut nou, deci timpul local mediu este UTC plus longitudinea în minute noi.

```
fus nou   = floor(longitudine/10 + 0.5)              ore noi întregi, de la -18 la +18
decalaj   = fus * 2400 secunde                       modul „Fus”
decalaj   = longitudine * 240 secunde (rotunjit)     modul „Solar”
```

Cele 36 de fusuri sunt benzi de 10° centrate pe multiplii de 10°. Abaterea față de ora solară medie este cel mult ±5 minute noi (±20 de minute standard). Exemple:

| Localitate | Longitudine | Fus nou | Decalaj (timp standard) |
|---|---|---|---|
| București | 26,1° E | +3 | +2 h 00 min |
| Londra | −0,1° | 0 | 0 |
| New York | −74,0° | −7 | −4 h 40 min |
| Tokyo | 139,7° E | +14 | +9 h 20 min |

Fusurile noi coincid cu cele actuale doar din trei în trei (+3 = UTC+2, +6 = UTC+4 și așa mai departe). Nu există oră de vară.

### 3.6 Codul complet

Formatul este `ER-AE-CS-AS.ZA-CL-LC-ZN HN:MN:SN:SS sufix`.

| Câmp | Sens | Valori |
|---|---|---|
| ER | Era precesională (precesia echinocțiilor) | 1–12 (ER 1 = Vărsător, ER 12 = Pești) |
| AE | Anul erei, fără an zero | 0001–2148 |
| CS | Cadranul solar | 1–4 |
| AS.ZA | Arcul solar și ziua din arc | 01–73 și 1–5 (6) |
| CL | Ziua lunară | 01–30 |
| LC | Luna calendaristică | 00–13 |
| ZN | Ziua lunii | 01–28 (la LC 00: 01 sau 02) |
| HN:MN:SN:SS | Timpul nou | 00–35 : 00–09 : 00–09 : 00–23 |
| sufix | Fusul sau timpul solar local | `F+03` (fus) sau `L+26.1` (solar, longitudine) |

Exemplu complet: `12-1734-4-57.3-19-11-03 26:02:06:21 F+03` înseamnă: era 12 (Pești), anul 1734 al erei; cadranul solar 4, arcul 57 ziua 3; ziua lunară 19; luna 11, ziua 3 (miercuri); ora nouă 26:02:06:21; fusul +3.

**Scrierea orei.** Ora, minutul și secunda se scriu pe două cifre (de exemplu `19:08:04`), ca la ceasul clasic, deși minutul și secunda merg doar de la 0 la 9. Programele acceptă și forma fără zero (`19:8:4`).

Un cod ER-AE este unic într-un ciclu de precesie (25.772 de ani). Ciclul curent se termină cu anul 2440; pentru alte cicluri, funcțiile din Python și foile Excel au un parametru „ciclu" (0 = curent).

**Forme scurte pentru uz zilnic.** Codul complet este un format de arhivă. Pentru uz curent folosește doar partea utilă: `ER 12 · AE 1734 · luna 11 · ziua 3 · 26:02:06` (era, anul erei, luna, ziua și ora); restul câmpurilor sunt adăugiri opționale.

### 3.7 Unghiurile în grade, gon și radiani

| Unitate | Cerc | Un pătrar | 1 unitate de rotație în secunde SI |
|---|---|---|---|
| Grad zecimal | 360° | 90° | 240 (exact) |
| Gon (gradian) | 400 | 100 | 216 (exact), dar 0,01 gon = 2,16 s |
| Radian | 2π | π/2 | 13.751 (număr irațional) |

Gradul zecimal este unitatea de bază, pentru că păstrează legătura exactă cu secunda SI. Scriptul afișează fiecare unghi în grade, gon și radiani (comanda `unghiuri`).

### 3.8 Erele și datarea istorică

**Precesia echinocțiilor.** Axa Pământului se rotește lent (circa 50,29″ pe an), iar ciclul complet durează aproximativ 25.772 de ani. Sistemul îl împarte în 12 ere (30° fiecare), numerotate ER 1–12, cu lungimi de 2147 sau 2148 de ani: limitele sunt `floor(j × 25772 / 12)`, adică 0, 2147, 4295, 6443, … 25772. Opt ere au 2148 de ani și patru au 2147; fiecare grup de trei ere are exact 6.443 de ani, deci ciclul are patru **cadrane** de 6.443 de ani.

**Reperul: steaua Spica.** Spica (α Virginis) este aproape de ecliptică (latitudine −2,05°); Hipparchus a descoperit precesia comparând poziția ei. Se definește ayanāṁśa(t) = longitudinea ecliptică a lui Spica la data t, minus 180°. Peștii acoperă ayanāṁśa de la 0° la 30°, iar **ER 1 (Vărsător) începe când ayanāṁśa atinge 30°**. Calculul (Spica la 203,841° în J2000, precesia IAU 2006) dă ayanāṁśa 0° în jurul anului 287 e.n. și 30° în jurul anului 2440 e.n. Ancora aleasă este deci **AE 1 din ER 1 = anul nou 2441** (de la 21.12.2440). Polaris nu poate fi reperul: este steaua polară de azi, nu stă pe ecliptică, iar polul trece pe lângă alte stele (Thuban, Vega etc.).

```
ayanamsa 0° la 286.8, 30° la 2440.5; ER 1 începe cu anul nou 2441
```

**Cele 12 ere** (ciclul curent, care se termină la ancoră; anii în numerotare istorică):

| ER | Sanscrită | Engleză | Franceză | Ani | De la | Până la |
|---|---|---|---|---|---|---|
| 1 | Kumbha | Aquarius | Verseau | 2147 | 23332 î.e.n. | 21186 î.e.n. |
| 2 | Makara | Capricorn | Capricorne | 2148 | 21185 î.e.n. | 19038 î.e.n. |
| 3 | Dhanus | Sagittarius | Sagittaire | 2148 | 19037 î.e.n. | 16890 î.e.n. |
| 4 | Vṛścika | Scorpio | Scorpion | 2147 | 16889 î.e.n. | 14743 î.e.n. |
| 5 | Tulā | Libra | Balance | 2148 | 14742 î.e.n. | 12595 î.e.n. |
| 6 | Kanyā | Virgo | Vierge | 2148 | 12594 î.e.n. | 10447 î.e.n. |
| 7 | Siṃha | Leo | Lion | 2147 | 10446 î.e.n. | 8300 î.e.n. |
| 8 | Karkaṭa | Cancer | Cancer | 2148 | 8299 î.e.n. | 6152 î.e.n. |
| 9 | Mithuna | Gemini | Gémeaux | 2148 | 6151 î.e.n. | 4004 î.e.n. |
| 10 | Vṛṣabha | Taurus | Taureau | 2147 | 4003 î.e.n. | 1857 î.e.n. |
| 11 | Meṣa | Aries | Bélier | 2148 | 1856 î.e.n. | 292 e.n. |
| 12 | Mīna | Pisces | Poissons | 2148 | 293 e.n. | 2440 e.n. |

**Formulele**, cu k anul nou (secțiunea 3.2) și 430 = 2441 − 2011:

```
p  = (k - 430) % 25772                       poziția în ciclu, 0..25771
ER = cel mai mare j (1..12) cu floor((j-1)*25772/12) <= p
AE = p - floor((ER-1)*25772/12) + 1          anul erei, fără an zero
```

**Datarea istorică.** Pentru un an Y în numerotare astronomică (1 î.e.n. = 0, deci 785 î.e.n. = −784), k = Y − 2011. Anul gregorian este cel care conține 1 iulie al anului nou. Exemple:

```
$ python sistem_timp.py istoric 785BCE
785 î.e.n. (an astronomic -784)  =  ER 11 (Meṣa · Aries · Bélier), AE 1072
$ python sistem_timp.py istoric-inv 11 1072
ER 11, AE 1072 (ciclul +0)  =  785 î.e.n. (an astronomic -784)
```

În Excel, aceleași conversii sunt în foaia „Ere" (secțiunile „Datare istorică"). Anul 2026 este ER 12, AE 1734; anul 1 e.n. este ER 11, AE 1857.

**Limite.**
- Erele au lungimi egale, iar precesia reală s-a schimbat în timp, deci modelul diferă de poziția reală a punctului vernal cu circa 8 ani la anul 1 e.n., 17 ani la 785 î.e.n. și 31 de ani la 1800 î.e.n.
- Reperul stelar are o incertitudine de câțiva ani (mișcarea proprie a lui Spica, modelul precesiei).
- Un cod ER-AE este unic doar într-un ciclu de 25.772 de ani.
- Zilele exacte (cu lună și zi) sunt acceptate de scripturi doar pentru anii 1–9999 e.n.; pentru anii î.e.n. se datează doar anul întreg.

## 4. Ghid pentru Excel, foaie cu foaie

### 4.1 Reguli generale

- **Celule galbene cu text albastru** sunt cele de completat. Celulele verzi sunt rezultate. Restul sunt formule, care se recalculează singure.
- Celulele galbene au **validări**: dacă introduci o valoare în afara limitelor, apare un mesaj. Datele valide sunt între 1900 și 2200 (excepție: foaia „Ere", care acceptă și ani îndepărtați).
- Toate momentele de intrare sunt **UTC**. Pentru ora locală se folosește longitudinea și modul „Fus" sau „Solar" din „Timp complet".
- Fișierul nu are macrocomenzi. Dacă valorile par vechi, apasă Ctrl+Alt+F9 (recalculare completă).
- Parametrii de bază (epoca internă, regula bisectă, lungimea lunii, ciclul de precesie, ancora erelor etc.) sunt în foaia „Timp complet", rândurile 45–67. Foile de calendar și foaia „Ere" îi folosesc de acolo.
- Ordinea foilor: Timp 36h, Conversie, Calendar 13 luni, Calendar an, Calendar perete, Timp complet, Ere, Fusuri noi, Luni noi, Evenimente, Nume sanscrită, Nume EN-FR, Cadrane.

### 4.2 Foaia „Timp 36h”

Tabelul celor 3.600 de secunde noi ale zilei. Coloanele sunt Ora (0–35), Minutul (0–9), Secunda (0–9), Unghiul de rotație (°) și echivalentul în timp standard (hh:mm:ss, din 24 în 24 de secunde). Regulile sunt scrise în coloana G. Foaia nu are celule de completat; e doar de consultat.

### 4.3 Foaia „Conversie”

Convertește ora din zi în ambele sensuri, cu subsecundă.

- **Secțiunea 1 (24 h → 36 h).** Completezi ora, minutele și secundele standard în B6:D6 (exemplu 15:30:45). Rezultatul este în B9:F9: ora (0–35), minutul, secunda, subsecunda (0–23) și unghiul. Exemplu: 23 h 2 min 6 s 21 subsecunde, 232,6875°.
- **Secțiunea 2 (36 h → 24 h).** Completezi ora, minutul, secunda și subsecunda nouă în B14:E14 (exemplu 20 h 7 min 5 s 12 subsecunde). Rezultatul este în B17:E17, inclusiv forma hh:mm:ss (13:50:12).
- **Tabelul „Unitățile sistemului”.** B21 (24 de subsecunde pe secundă) și B22 (0,1° pe secundă) sunt ipoteze modificabile; restul tabelului se calculează. Mai jos este un tabel de puncte de reper (ora standard → ora nouă).
- Valorile sunt întregi: secundele și subsecundele se introduc ca numere întregi.

### 4.4 Foaia „Calendar 13 luni”

Calendarul de 13 luni, aliniat la solstițiu, cu trei secțiuni.

- **Secțiunea 1 (gregorian → 13 luni).** Completezi data în B6. Foaia arată anul nou k, începutul anului, ziua din an N, dacă anul este bisect, **era (ER), anul erei (AE) și numele erei**, luna, ziua, ziua săptămânii, săptămâna, tipul zilei (obișnuită, Ziua anului sau Ziua bisectă), denumirile sanscrite, arcul solar și cadranul solar.
- **Secțiunea 2 (13 luni → gregorian).** Completezi anul gregorian (care identifică anul nou), luna, ziua și, la nevoie, „Zi specială" din listă (Nu, Ziua anului, Ziua bisectă) în B22:E22. Rezultatul este data gregoriană din B29, plus ziua gregoriană și cea nouă a săptămânii. Pentru „Ziua bisectă" într-un an nebisect apare „An nebisect".
- **Secțiunea 3 (cele 13 luni ale anului).** Completezi anul gregorian în B33. Tabelul arată prima și ultima zi gregoriană a fiecărei luni (rândurile 41–53), apoi Ziua anului și Ziua bisectă; B39 arată era și anul erei (ER-AE). B33 alimentează și foaia „Calendar an".

### 4.5 Foaia „Calendar an”

Tabelul zi cu zi al anului nou ales (anul se ia din „Calendar 13 luni”, B33). Coloanele: data gregoriană, ziua din an, luna, ziua lunii, ziua săptămânii (nouă și gregoriană), arcul solar, cadranul solar și fenomenul astronomic al zilei, cu ora UTC. Prima zi a fiecărei luni este colorată albastru, iar zilele speciale portocaliu. Foaia nu are celule de completat.

### 4.6 Foaia „Calendar perete”

Generatorul de calendar de perete, cu 15 pagini A4 orizontale: 13 luni, o pagină pentru zilele din afara săptămânii și una pentru fenomenele anului.

- **Ce completezi.** Anul gregorian în B2 și, în G3, tipul numelor de zile: „Tradiționale" sau „Numerice".
- **Ce arată fiecare pagină de lună.** Un titlu cu numele lunii în română, sanscrită (IAST și devanagari), engleză și franceză; ER, AE și numele erei; intervalul gregorian al lunii; antetul zilelor în patru limbi și grila de 4 săptămâni. În fiecare zi, numărul mare este ziua din calendarul de 13 luni, iar sub el, mic, apare data gregoriană și simbolurile fenomenelor.
- **Simboluri.** ● lună nouă, ◐ primul pătrar, ○ lună plină, ◑ ultimul pătrar, ☀ solstițiu sau echinocțiu, ⊗ eclipsă posibilă. Fenomenele sunt în UTC. Prima zi a fiecărei luni gregoriene este roșie.
- **Tipărire.** Fișier → Imprimare. Zona de imprimare, formatul A4 orizontal și întreruperile de pagină sunt deja setate. Pentru alt an, schimbă B2. Zona de comandă (rândurile 1–4) nu se tipărește.

### 4.7 Foaia „Timp complet”

Conversia dintre UTC și codul complet, cu fusuri.

- **Secțiunea 1 (UTC → cod).** Completezi data în B6, ora, minutul și secunda UTC în C6:E6, longitudinea în B8 și modul în C8 (Fus sau Solar). Rezultatele sunt pe trei rânduri: câmpurile solare (rândul 19: ER, AE, CS, AS, ZA și numele erei), luna și ziua (rândul 21: CL, LC, ZN și numele zilei) și timpul nou (rândul 23: HN, MN, SN, SS). În B24 apare codul complet.
- **Secțiunea 2 (cod → UTC).** Completezi ER, AE, LC, ZN și ciclul (0 = curent) în B29:F29, apoi HN, MN, SN, SS, longitudinea și modul în B31:G31. Rezultatul este momentul UTC (B41:E41). În F41 apare „OK" sau o explicație (de exemplu „An nebisect: nu există Ziua bisectă").
- **Parametrii** sunt în rândurile 45–67. Cei ai erelor sunt B50 (ciclul de precesie, 25.772), B51 (numărul de ere, 12) și B52 (ancora: anul-etichetă al lui AE 1 din ER 1, 2441). Modifică-i numai dacă vrei să testezi reguli diferite.
- **Foaia nu calculează unghiurile solar și lunar** pentru un moment oarecare. Cadranul solar (CS) și ziua lunară (CL) se obțin din tabelele de evenimente. Unghiurile exacte sunt în Python (secțiunea 5).

### 4.8 Foaia „Fusuri noi”

Tabelul celor 37 de valori de fus (−18 … +18): longitudinea centrală, limitele benzii, decalajul în ore noi și echivalentul în ore standard. În coloanele H–K este un tabel de localități; poți modifica longitudinile (celule galbene) ca să vezi fusul și abaterea față de ora solară.

### 4.9 Foile „Luni noi” și „Evenimente”

- „Luni noi” listează lunile noi astronomice 1899–2201 (UTC), cu precizie de circa un minut. Sunt folosite pentru ziua lunară CL.
- „Evenimente” listează toate fenomenele astronomice 1899–2201: solstiții, echinocțiuri, pătrarele Lunii și eclipsele posibile. Coloanele F–G sunt momentele solare, cu cadranul care începe la fiecare. Din ele se calculează CS și simbolurile din calendarul de perete.
- Foile nu se modifică manual. Pentru alt interval, datele se pot calcula cu funcțiile din `sistem_timp.py` (secțiunea 8).

### 4.10 Foile „Nume sanscrită” și „Nume EN-FR”

Tabele de denumiri folosite de foile de calendar. „Nume sanscrită" are numeralele 1–13, numele lunilor, zilele săptămânii (tradiționale și numerice) și zilele speciale, în IAST și devanagari. „Nume EN-FR" are lunile (First month / Premier mois …), zilele (Monday / lundi și varianta numerică Day 1 / Jour 1) și zilele speciale (Year Day / Jour de l'année, Leap Day / Jour bissextile). Numele erelor sunt în foaia „Ere". Pentru alte nume sau altă limbă, înlocuiește textele din tabele: formulele din foile de calendar le preiau automat.

### 4.11 Foaia „Cadrane”

Conține cele patru imagini ale cadranelor (anul, erele, ora de 18 h și ora de 36 h), generate cu `creare_cadrane.py` pentru un moment dat (2 octombrie 2026, 12:00 UTC, București). Pentru alt moment, rulezi scriptul cu alte valori (secțiunea 5.5).

### 4.12 Foaia „Ere”

Erele precesionale și datarea istorică.

- **Tabelul celor 12 ere** (rândurile 5–16): numele în sanscrită, engleză și franceză, lungimea, poziția în ciclu, anii de început și de sfârșit ai ciclului curent (în numerotare istorică) și cele patru cadrane de 6.443 de ani (rândurile 20–23).
- **Datare istorică: an → ER, AE.** Completezi anul și epoca („e.n." sau „î.e.n.") în B28:C28. Rezultatul (B33:D33) este era, anul erei și numele erei. Exemplu: 785 î.e.n. dă ER 11, AE 1072 (Meṣa · Aries · Bélier).
- **Datare istorică: ER, AE → an.** Completezi ER, AE și ciclul (0 = ciclul curent, −1 = cel dinainte, +1 = următorul) în B38:D38. Rezultatul este anul, în B39 (an astronomic) și B40 (text e.n./î.e.n.); B41 verifică dacă AE se încadrează în era aleasă.
- Parametrii (ciclul, numărul de ere, ancora) sunt în „Timp complet", rândurile 50–52.

## 5. Ghid pentru Python

### 5.1 Instalare și cerințe

- Python 3.9 sau mai nou (testat cu 3.12).
- `sistem_timp.py`, `calendar_13_luni.py` și `conversie_timp.py` folosesc numai biblioteca standard. Nu trebuie instalat nimic.
- `creare_cadrane.py` are nevoie de `matplotlib`, `numpy` și `openpyxl` (`pip install matplotlib numpy openpyxl`) și de fișierul `sistem_timp.py` în același folder.
- Testele complete din `sistem_timp.py` compară rezultatele cu un program astronomic independent, dacă acesta e instalat: `pip install ephem`. Fără el, testul respectiv este omis.
- Pe Windows folosește `py` în locul lui `python`, dacă e cazul. Pune scripturile în același folder.

### 5.2 `sistem_timp.py`

Conversia exactă între UTC și codul complet, erele și datarea istorică, plus pozițiile Soarelui și Lunii. Comenzile sunt:

```
python sistem_timp.py g2t 2026-09-29T15:30:45 26.1 F      # UTC -> cod (longitudine 26,1°, mod Fus)
python sistem_timp.py g2t 2026-09-29T15:30:45 26.1 L      # același moment, timp solar local
python sistem_timp.py t2g "12-1734-4-57.3-19-11-03 26:02:06:21 F+03"   # cod -> UTC
python sistem_timp.py acum [longitudine] [F|L]            # momentul curent
python sistem_timp.py unghiuri 2026-09-29T15:30:45 26.1 F # rotația zilnică, unghiul solar și cel lunar
python sistem_timp.py evenimente 2026                     # fenomenele anului
python sistem_timp.py luni-noi 2026                       # lunile noi ale anului (UTC)
python sistem_timp.py istoric 785BCE                      # an istoric -> ER, AE (și: 2026, -784, "785 î.e.n.")
python sistem_timp.py istoric-inv 11 1072 [ciclu]         # ER, AE -> an istoric
python sistem_timp.py ere                                 # cele 12 ere: nume, lungimi, ani
python sistem_timp.py ayanamsa [an]                       # unghiul de precesie față de Spica
python sistem_timp.py fusuri                              # tabelul celor 36 de fusuri
python sistem_timp.py test                                # verificările complete
```

Longitudinea este în grade (pozitivă la est). Modul `F` este fusul nou, iar `L` este timpul solar local. Exemple de ieșiri:

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

Dacă codul din `t2g` conține valori inconsistente (de exemplu un CS sau un CL care nu se potrivește cu data), se afișează un **avertisment**. Valorile care nu pot exista, cum ar fi ora 25, un AE prea mare pentru era respectivă sau Ziua bisectă într-un an nebisect, dau un mesaj de eroare. Comenzile `g2t` și `t2g` acceptă ani între 1 și 9999 e.n. (pentru anii î.e.n. se folosește `istoric`).

### 5.3 `calendar_13_luni.py`

Conversia gregorian ↔ calendarul de 13 luni, aliniat la solstițiu, cu denumiri în română, sanscrită, engleză și franceză.

```
python calendar_13_luni.py g2n 2026-09-29        # gregorian -> 13 luni
python calendar_13_luni.py n2g 2026 11 3         # (an gregorian, luna, ziua) -> data gregoriană
python calendar_13_luni.py n2g AN16 ziua-bisecta # anul nou se poate da direct: AN<k>; sau ziua-anului / ziua-bisecta
python calendar_13_luni.py an 2026               # cele 13 luni ale anului nou, cu datele gregoriene
python calendar_13_luni.py test                  # verificarea tuturor zilelor 1900-2200
```

```
$ python calendar_13_luni.py g2n 2026-09-29
2026-09-29  =  ER 12 (Mīna · Pisces · Poissons), AE 1734 (anul nou k = 15): luna 11 (Ekādaśa māsa · Eleventh month · Onzième mois), ziua 3, Miercuri (Budhavāra · Wednesday · mercredi), săptămâna 41; arcul solar 57.3, cadranul 4
```

În acest script cadranul solar (CS) se calculează din regula arcelor; valoarea exactă, din poziția Soarelui, o dă `sistem_timp.py` și foile Excel. La zilele din apropierea solstițiilor și echinocțiilor cele două pot diferi cu 2–3 zile.

### 5.4 `conversie_timp.py`

Conversia simplă a orei din zi, cu subsecundă.

```
python conversie_timp.py 24 15:30:45     # 24 h -> 36 h:  23 h  2 min  6 s  21 subsecunde  (232,6875°)
python conversie_timp.py 36 23:02:06:21    # 36 h -> 24 h:  15:30:45   (a patra valoare, subsecunda, e opțională)
python conversie_timp.py test            # verifică toate cele 86.400 de secunde
```

### 5.5 `creare_cadrane.py`

Desenează patru cadrane pentru un moment dat (implicit acum, UTC): **cadranul anului**, **cadranul erelor**, cadranul orei de 18 h și cadranul orei de 36 h. Cadranele orei arată și data curentă; cel al anului arată arcele solare, lunile, fazele Lunii și cadranele solare, cu acul pe data curentă; cel al erelor arată cercul precesiei, cu cele 12 ere, scara mărită a erei curente și acul pe anul curent.

```
python creare_cadrane.py                                        # patru PNG în folderul curent, pentru momentul actual
python creare_cadrane.py --moment 2026-10-02T12:00:00           # alt moment (UTC)
python creare_cadrane.py --moment 2026-10-02T12:00:00 --lon 26.1 --mod F   # cu longitudine și mod (Fus sau Solar)
python creare_cadrane.py --out cadrane                          # le salvează într-un folder
python creare_cadrane.py --xlsx timp_36_ore_rotatie.xlsx        # le inserează și în foaia „Cadrane"
```

Fișierele create sunt `cadran_an.png`, `cadran_ere.png`, `cadran_18h_jumatate_zi.png` și `cadran_36h_zi_intreaga.png`. După inserarea în Excel, formulele din fișier trebuie recalculate (deschide fișierul în Excel și salvează-l, sau apasă Ctrl+Alt+F9). Imaginile sunt statice: nu arată ora curentă decât în momentul rulării scriptului.

### 5.6 Folosirea ca bibliotecă

Funcțiile pot fi importate în propriile programe:

```python
from datetime import datetime
import sistem_timp as st
import calendar_13_luni as c13
import conversie_timp as ct

# UTC -> cod complet
r = st.din_utc(datetime(2026, 9, 29, 15, 30, 45), lon=26.1, mod="F")
print(st.cod(r))                     # 12-1734-4-57.3-19-11-03 26:02:06:21 F+03
print(r["er"], r["ae"], r["lc"], r["zn"], r["cl"], r["faza"])   # 12 1734 11 3 19 gibbă descrescătoare
print(r["unghi_solar"], r["unghi_lunar"])

# cod complet -> UTC (și lista avertismentelor de coerență)
dt, avert = st.din_cod("12-1734-4-57.3-19-11-03 26:02:06:21 F+03")
print(dt, avert)                     # 2026-09-29 15:30:45 []

# era și anul erei pentru orice an (1 î.e.n. = 0, 785 î.e.n. = -784)
print(st.era_din_an(-784))                   # (11, 1072)
print(st.nume_an(st.an_din_era(11, 1072)))   # 785 î.e.n.
print(st.parse_an_istoric("785 î.e.n."))     # -784

# poziții și evenimente
print(st.fmt_unghi(st.unghi_solar(dt)))      # grade, gon, radiani
print(st.evenimente(2026)[:2])               # primele evenimente ale anului
print(st.eveniment_solar(2026, 3))           # solstițiul din decembrie 2026 (UTC)

# calendar și ora din zi
print(c13.an_pentru_an_gregorian(2026))      # 15
print(c13.in_gregorian(15, 11, 3))           # 2026-09-29
print(ct.la_36(15, 30, 45), ct.la_24(23, 2, 6, 21))
```

Dicționarul întors de `din_utc` are, printre altele, cheile `k`, `n` (ziua din an), `er`, `ae`, `cs`, `arc`, `za`, `lc`, `zn`, `hn`, `mn`, `sn`, `ss`, `cl`, `fus`, `faza`, `unghi_solar`, `unghi_lunar` și `zi_sapt`. Funcțiile `in_utc` și `din_cod` au un parametru `ciclu` (0 = ciclul curent de precesie).

## 6. Exemple lucrate

**Exemplul 1: ora de la prânz.** Mijlocul zilei este 18:00:00:00, adică 12:00 în timp standard. La UTC este 12:00 UTC; la fusul +3 (ora fusului este UTC+2) înseamnă 12:00 în ora fusului, adică 10:00 UTC.

**Exemplul 2: ce dată este 29 septembrie 2026?** În „Calendar 13 luni” (B6) obții: anul nou k = 15, ER 12 (Mīna · Pisces · Poissons), AE 1734, ziua 283, luna 11, ziua 3, miercuri (Budhavāra · Wednesday · mercredi). Aceeași dată în calendarul gregorian este marți, deci cele două săptămâni sunt decalate cu o zi.

**Exemplul 3: calendar pentru 2027, cu Ziua bisectă.** În „Calendar perete” pune 2027 în B2. Anul nou 16 are 366 de zile (16 este multiplu de 4). Pagina „Zilele din afara săptămânii” arată Ziua anului (20.12.2027) și Ziua bisectă (21.12.2027).

**Exemplul 4: citirea codului.** `12-1734-4-57.3-19-11-03 26:02:06:21 F+03` se citește: era 12 (Pești), anul 1734 al erei; Soarele este în cadranul 4 (după echinocțiul din septembrie), în arcul 57, ziua 3; Luna este în ziua lunară 19, gibbă descrescătoare; este luna 11, ziua 3; ora nouă 26 h 2 min 6 s 21 subsecunde în ora fusului +3. În timp standard, ora fusului este 17:30:45, adică 15:30:45 UTC.

**Exemplul 5: aceeași oră, două moduri de fus.** La longitudinea 26,1° E, modul „Fus” dă ora 26:02:06:21, iar modul „Solar” dă 25:08:07:21, pentru că timpul solar local este UTC plus 26,1 minute noi. Diferența de 3,9 minute noi (15,6 minute standard) este abaterea locului față de centrul fusului (26,1° față de 30°).

**Exemplul 6: o oră și 24 de secunde.** 1 h 0 min 1 s nouă = 2.400 + 24 = 2.424 s standard = 00:40:24.

**Exemplul 7: datare istorică.** Anul 785 î.e.n. este ER 11 (Meṣa · Aries · Bélier), AE 1072. În sens invers, ER 11 și AE 1072 înseamnă 785 î.e.n. În Excel: foaia „Ere”, B28:C28. În Python: `python sistem_timp.py istoric 785BCE`.

**Exemplul 8: era curentă.** Anul 2026 este ER 12 (Pești), AE 1734; era Peștilor a început în anul 293 e.n. și se termină cu anul 2440. ER 1 (Vărsător) începe cu anul nou care începe la 21.12.2440. În Python: `python sistem_timp.py ere`.

**Exemplul 9: cadranele pentru o zi.** `python creare_cadrane.py --moment 2026-10-02T12:00:00 --lon 26.1` desenează cadranele anului, erelor și orei pentru 2 octombrie 2026, 12:00 UTC, cu fusul +3 (ora nouă 21:00:00:00).

## 7. Verificări, acuratețe și limite

### 7.1 Ce a fost verificat

- **Conversii.** Toate cele 86.400 de secunde ale zilei se convertesc și se întorc exact (24 h ↔ 36 h). Toate cele 109.938 de zile din 1900–2200 se convertesc exact între gregorian și calendarul de 13 luni, în ambele sensuri, iar fiecare lună începe luni și se termină duminică. `calendar_13_luni.py` și `sistem_timp.py` dau aceleași rezultate pe toate aceste zile.
- **Începutul anului.** Ziua 1 a fiecărui an cade în ziua UTC a solstițiului din decembrie pentru cei 20 de ani din tabelele consultate (2011–2019 și 2021–2031).
- **Poziții și fenomene, comparate cu un program astronomic independent (`ephem`).** Poziția Soarelui diferă cu cel mult 0,015°, longitudinea Lunii cu cel mult 0,015° și latitudinea cu cel mult 0,007°. Solstițiile și echinocțiile diferă cu cel mult 54 de secunde. Pătrarele Lunii din 2026 diferă cu cel mult 66 de secunde, iar lunile noi din 2000–2050 cu cel mult 32 de secunde. Eclipsele din 2024–2026 sunt exact cele reale (6 de Soare, 5 de Lună cu umbră).
- **Erele.** Cele 12 ere au lungimile 2147/2148, cele patru cadrane au exact 6.443 de ani, ancora calculată din Spica dă ayanāṁśa 30° în jurul anului 2440, iar conversiile an ↔ (ER, AE) se întorc exact pe tot ciclul curent. Abaterea modelului față de precesia reală (IAU 2006) este sub 0,5° (circa 35 de ani) în ultimii 4.000 de ani.
- **Excel față de Python.** Foile „Calendar 13 luni”, „Calendar an”, „Calendar perete”, „Timp complet”, „Ere” și „Evenimente” au fost comparate cu scripturile pe mai multe scenarii (anii 2026, 2027, 1905, ani bisecți și nebisecți, moduri de fus, ani î.e.n. și e.n.), fără nicio diferență.

### 7.2 Limite și ipoteze

- **Precizia fazelor Lunii** este de circa un minut. Un moment aflat la un minut de miezul nopții locale poate primi o altă zi lunară decât în realitate.
- **Eclipsele sunt „posibile”**: marcajul se bazează pe poziția Lunii față de nod și nu indică vizibilitatea. Eclipsele de Lună cu penumbră simplă nu sunt marcate.
- **Secundele intercalare sunt ignorate**, ca în Python și în Excel.
- **Δt (diferența dintre timpul terestru și UTC)** este aproximat prin formule; erorile de câteva secunde nu afectează rezultatele zilnice.
- **Intervalul** 1900–2200 este cel validat pentru zile exacte. Scripturile acceptă zile exacte pentru anii 1–9999 e.n.; pentru anii î.e.n. se datează doar anul (ER, AE).
- **Excelul nu calculează unghiurile solar și lunar** pentru un moment oarecare; pentru ele folosește Python.
- **Erele sunt un model.** Au lungimi egale (2147 sau 2148 de ani), iar precesia reală s-a schimbat în timp: modelul diferă de poziția reală a punctului vernal cu circa 8 ani la anul 1 e.n., 17 ani la 785 î.e.n. și 31 de ani la 1800 î.e.n. Reperul stelar (Spica) are o incertitudine de câțiva ani. O parte din „datele” erelor sunt deci convenții: alegerea stelei de referință și a anului-etichetă 2441.
- **Un cod ER-AE este unic doar într-un ciclu de precesie** (25.772 de ani); parametrul „ciclu” alege ciclul.
- **Zilele săptămânii** din calendarul nou nu coincid cu cele gregoriene. Ziua din afara săptămânii (Ziua anului și Ziua bisectă) întrerupe continuitatea săptămânii de 7 zile, ca la alte calendare fixe.
- **Denumirile în sanscrită** sunt din cunoștințele autorului și nu au fost verificate într-o sursă externă; numele zilelor speciale (Varṣa-dina, Adhika-dina) sunt propuneri. Denumirile în engleză și franceză sunt traduceri directe.
- **Calendarele din versiunile anterioare** erau aliniate la 1 ianuarie, iar codul avea câmpurile MC, VA și AN. Foile și scripturile actuale sunt aliniate la solstițiu și folosesc ER și AE; rezultatele diferă de cele vechi.

### 7.3 Variante de precesie luate în calcul

Precesia reală se accelerează ușor, deci limitele reale ale erelor (momentul în care ayanāṁśa față de Spica atinge 30°·j, după precesia IAU 2006) nu sunt la distanțe egale. Erele reale au acum circa 2154 de ani (ER 12) și 2133 (ER 1), iar în trecut mai mult: 2174 în urmă cu vreo 4000 de ani și 2240 în jurul anului 8500 î.e.n. Față de erele egale din model, diferența la începutul unei ere este:

| Început de eră | An real | Abaterea modelului |
|---|---|---|
| ER 1 (ancora) | 2441 e.n. | 0,5 ani |
| ER 12 (Pești) | 287 e.n. | 6,5 ani |
| ER 11 | 1888 î.e.n. | 33 de ani |
| ER 10 | 4083 î.e.n. | 81 de ani |
| ER 9 | 6301 î.e.n. | 152 de ani |

Au fost evaluate trei variante:

- **A. Limite reale, calculate din precesie.** Cea mai exactă (sub 1–2 ani în istoria scrisă), dar erele au lungimi diferite, cele patru cadrane nu mai au exact 6.443 de ani, formulele din Excel, Python și pagina web devin tabele de limite, iar ciclul nu mai este periodic (polinomul precesiei nu e de încredere dincolo de câteva mii de ani).
- **B. Ere egale cu ciclu reglat.** Cu un ciclu de circa 25.760 de ani eroarea rămâne în jur de ±180 de ani pe un interval foarte larg, fără a o aduce sub câțiva ani pe tot ciclul.
- **C. Ere egale, modelul actual.** Simplu, cu aceleași formule și cadrane. La scara istoriei, diferența este de ordinul zecilor de ani.

**Decizia: varianta C**, pentru simplitate. Variantele A și B rămân documentate aici și pot fi adoptate ulterior fără a schimba structura codului ER-AE, doar tabelul de limite.

## 8. Depanare și întrebări frecvente

**Valorile par vechi sau lipsesc.** Apasă Ctrl+Alt+F9 în Excel. În LibreOffice folosește Date → Calculează → Recalculează tot.

**Nu se văd scrierea devanagari sau simbolurile ◐ ◑ ⊗ ☀.** Depind de fonturile sistemului (de exemplu Nirmala UI sau Noto Sans Devanagari pentru devanagari, Segoe UI Symbol pentru simboluri). Instalează un font care le conține sau schimbă fontul celulelor. Transliterările latine se văd oricum.

**Mesajul „An nebisect”.** Ai cerut Ziua bisectă într-un an nou fără 366 de zile. Anii bisecți sunt cei cu k multiplu de 4 și nu de 128 (de exemplu k = 16, adică anul gregorian 2027).

**Mesajul de validare la o celulă galbenă.** Valoarea e în afara limitelor (de exemplu ora 24, luna 14, AE peste 2148 sau un an în afara intervalului 1900–2200). Corectează valoarea.

**Cum aleg anul în foile de calendar?** Dă anul gregorian care conține 1 iulie al anului nou dorit. Pentru anul care începe în decembrie 2026, introdu 2027.

**Cum găsesc ER și AE pentru un an î.e.n.?** În Excel: foaia „Ere”, B28 (anul) și C28 („î.e.n.”). În Python: `python sistem_timp.py istoric 785BCE`.

**Cum aleg altă ancoră pentru ere?** În Excel: „Timp complet”, celula B52 (anul-etichetă al lui AE 1 din ER 1, implicit 2441). În Python: constanta `ANCORA_ET` din `sistem_timp.py` (și `K_ANCORA` din `calendar_13_luni.py`). Foile „Ere”, „Timp complet”, „Calendar 13 luni” și „Calendar perete” se actualizează singure; cadranele se redesenează cu `creare_cadrane.py`.

**Cum schimb epoca internă, regula bisectă sau lungimea lunii?** În foaia „Timp complet”, rândurile 45–67. Scriptul Python folosește constantele proprii: modifică-le și acolo (începutul fișierelor `sistem_timp.py` și `calendar_13_luni.py`). Tabelele „Luni noi” și „Evenimente” nu depind de epocă.

**Cum calculez tabelele de evenimente pentru alt interval?** Cu funcțiile `evenimente_brute(an)` și `luna_noua(k)` din `sistem_timp.py` poți calcula lista pentru orice an și o poți lipi în foile „Evenimente” și „Luni noi” (momentul ca număr de serie Excel, simbolul, descrierea și codul). Scriptul care a construit foile nu este livrat separat.

**Cum tipăresc calendarul de perete?** Fișier → Imprimare, hârtie A4 orizontală. Zona de imprimare este deja stabilită. Pentru exportul în PDF alege „Salvează ca PDF” din fereastra de imprimare.

**Comanda `python` nu e recunoscută (Windows).** Folosește `py sistem_timp.py ...`. Dacă Python nu e instalat, descarcă-l de pe python.org (versiunea 3.9 sau mai nouă).

**Cum fac ca ceasul să meargă în timp real?** Comanda `acum` afișează momentul curent o singură dată, iar `creare_cadrane.py` desenează cadranele pentru momentul rulării. Un cadran animat ar necesita o pagină web sau o aplicație separată.

## 9. Anexe

### 9.1 Glosar

| Termen | Sens |
|---|---|
| UTC | Timpul universal coordonat, pe care sunt date toate momentele de intrare |
| Secunda SI | Secunda definită cu ceasuri atomice; o subsecundă este exact o secundă SI |
| ER, AE | Era precesională (1–12) și anul erei (1–2148, fără an zero) |
| Precesie | Rotația lentă a axei Pământului; ciclu de circa 25.772 de ani |
| Ayanāṁśa | Longitudinea ecliptică a lui Spica minus 180°; unghiul de precesie față de stele |
| k | Numărul anului nou, contor intern (k = 1 începe la 22.12.2011) |
| N | Ziua din anul nou (1–365 sau 366) |
| CS | Cadranul solar 1–4, după poziția reală a Soarelui |
| AS, ZA | Arcul solar de 5 zile (01–73) și ziua din arc |
| CL | Ziua lunară (01–30) |
| LC, ZN | Luna calendaristică (00–13) și ziua lunii (01–28) |
| HN, MN, SN, SS | Ora nouă, minutul nou, secunda nouă, subsecunda |
| Unghi solar | Poziția Soarelui de la solstițiul din decembrie (0° la solstițiu) |
| Unghi lunar | Elongația Lunii față de Soare (0° lună nouă, 180° lună plină) |
| Gon | Gradian: 1/400 dintr-un cerc, 0,9° |
| Ziua anului, Ziua bisectă | Zilele 365 și 366 ale anului nou, în afara săptămânii |

### 9.2 Tradiția din spatele unităților

Sistemul reia, la scări diferite, unități care au existat deja în istorie:

- **Uš babilonian (gradul de timp).** Ziua babiloniană avea 360 de uš, de câte 4 minute. Minutul nou al sistemului este un uš.
- **Decanii egipteni.** Eclipticul era împărțit în 36 de decani de câte 10°. Cele 36 de ore noi de 10° sunt decanii. Cele 5 zile epagomenale ale calendarului egiptean au rolul Zilei anului și Zilei bisecte.
- **Pala indiană.** O ghaṭī este circa 24 de minute și are 60 de pala; o pala este circa 24 de secunde, adică 0,1° de rotație. Secunda nouă este o pala.
- **Perioadele solare chineze (jiéqì).** Anul este împărțit în 24 de perioade de câte 15° de longitudine solară, fiecare cu trei pentade de 5 zile (72 pe an). Arcurile solare ale sistemului sunt pentade, iar unghiul solar este ideea lor de bază.
- **Alte unități de unghi.** Gradul sexagesimal (Mesopotamia), gradianul sau gon-ul francez (400 pe cerc), mil-ul militar (1/6400 din cerc) și radianul (2π pe cerc, numele modern din secolul al XIX-lea). Astronomul indian Āryabhaṭa a folosit raza 3438, adică un radian exprimat în minute de arc.

### 9.3 Numele lunilor (sanscrită, engleză, franceză)

| Luna | Sanscrită (IAST) | Engleză | Franceză |
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

### 9.4 Numele zilelor săptămânii

| Ziua | Sanscrită tradițională | Sanscrită numerică | Engleză | Franceză |
|---|---|---|---|---|
| Luni | Somavāra | Prathama-dina | Monday | lundi |
| Marți | Maṅgalavāra | Dvitīya-dina | Tuesday | mardi |
| Miercuri | Budhavāra | Tṛtīya-dina | Wednesday | mercredi |
| Joi | Guruvāra | Caturtha-dina | Thursday | jeudi |
| Vineri | Śukravāra | Pañcama-dina | Friday | vendredi |
| Sâmbătă | Śanivāra | Ṣaṣṭha-dina | Saturday | samedi |
| Duminică | Ravivāra | Saptama-dina | Sunday | dimanche |

Zilele speciale: Ziua anului este Varṣa-dina · Year Day · Jour de l'année; Ziua bisectă este Adhika-dina · Leap Day · Jour bissextile (denumirile sanscrite sunt propuneri). În foaia „Calendar perete” varianta numerică folosește Day 1 … Day 7 / Jour 1 … Jour 7.
