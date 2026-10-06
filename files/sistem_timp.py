#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
sistem_timp.py
--------------
Timpul precesional uman si calendarul precesional uman: conversie exacta intre data/ora UTC (gregoriana) si codul complet

    ER-AE-CS-AS.ZA-CL-LC-ZN HN:MN:SN:SS  F+00
    exemplu:  12-1734-4-57.3-19-11-03 23:02:06:21 F+00        (29.09.2026, 15:30:45 UTC)

Campuri
    ER  era precesionala 1-12 (precesia echinoctiilor: ciclu de 25.772 ani = 12 ere de 2147 sau 2148 ani; 4 cadrane de 6.443 ani)
        ER 1 = Varsator (Kumbha), 2 = Capricorn, ... 11 = Berbec, 12 = Pesti (era curenta)
    AE  anul erei, 0001-2148 (fara an zero); fiecare an incepe in ziua solstitiului din decembrie
    CS  cadranul solar 1-4 (derivat din AS)
    AS  arcul solar de 5 zile, 01-73 (arcul 73 are 6 zile in anii bisecti);  ZA = ziua din arc, 1-5 (6)
    CL  ziua lunara 01-30: ziua 1 = ziua (locala) a lunii noi astronomice
    LC  luna din calendarul de 13 luni x 28 de zile (00 = zilele din afara saptamanii)
    ZN  ziua lunii 01-28 (ziua saptamanii = ((ZN-1) mod 7)+1; luni = 1).  LC 00: ZN 01 = Ziua anului, ZN 02 = Ziua bisecta
    HN:MN:SN:SS  ora 0-35, minut 0-9, secunda 0-9, subsecunda 0-23  (1 subsecunda = 1 secunda SI)

Anul incepe in ziua solstitiului din decembrie (ziua UTC). Anul nou k = 1 incepe la 22 decembrie 2011 (contor intern).
An bisect (366 zile): k multiplu de 4, cu exceptia multiplilor de 128 (Jubileu); ziua in plus se adauga la
sfarsitul arcului 73. Anul mediu = 365 + 1/4 - 1/128 = 365,2421875 zile.

Erele: reperul este steaua Spica (alfa Virginis), aproape de ecliptica. ayanamsa(t) = longitudinea ecliptica a lui Spica - 180.
Pestii acopera ayanamsa 0-30 grade (de la ~287 e.n.), ER 1 (Varsator) incepe la ayanamsa 30 grade (~2440 e.n.): ER 1, AE 1 =
anul nou al anului gregorian 2441 (21.12.2440). Erele au lungimi egale (floor(j*25772/12)), deci modelul difera de precesia
reala cu ~8 ani la anul 1 e.n., ~17 ani la 785 i.e.n. si ~31 ani la 1800 i.e.n. Un cod ER-AE este unic intr-un ciclu de 25.772 ani
(ciclul curent se termina in 2440); pentru alte cicluri se foloseste parametrul `ciclu` din API.
Mare Jubileu (zi in plus la 128.000 de ani): nu este folosit (ar dubla eroarea fata de anul tropic).

Unghiuri reale (Soarele si Luna)
    Unghi solar  = longitudinea Soarelui de la solstitiul din decembrie: 0 / 90 / 180 / 270 = solstitiu dec., echinoctiu mar.,
                   solstitiu iun., echinoctiu sept.  CS (cadranul solar 1-4) = cadranul in care se afla Soarele la sfarsitul zilei.
    Unghi lunar  = elongatia Lunii fata de Soare: 0 luna noua, 90 primul patrar, 180 luna plina, 270 ultimul patrar.
    Unghiurile se dau in grade zecimale, gon (400 pe cerc) si radiani. Pozitiile folosesc serii Meeus trunchiate (~0,01-0,03 grade).

Timp si spatiu
    1 grad de longitudine = 1 minut nou = 240 s SI.   Fus nou = banda de 10 grade centrata pe multiplii de 10 (36 de fusuri,
    ora locala = UTC + fus ore noi, 1 ora noua = 40 min).  Sufix:  F+03  (fus)   sau   L+26.1  (timp solar mediu local).

Utilizare
    python sistem_timp.py acum [longitudine] [F|L]
    python sistem_timp.py g2t 2026-09-29T15:30:45 [longitudine] [F|L]     # UTC -> cod
    python sistem_timp.py t2g "12-1734-4-57.3-19-11-03 23:02:06:21 F+00"      # cod -> UTC
    python sistem_timp.py unghiuri [2026-09-29T15:30:45] [lon] [F|L]         # rotatie, unghi solar, unghi lunar
    python sistem_timp.py evenimente 2026                                    # solstitii, echinoctii, patrarele Lunii, eclipse
    python sistem_timp.py istoric 785BCE                                     # an istoric -> ER, AE  (si: 2026, -784, "785 i.e.n.")
    python sistem_timp.py istoric-inv 11 1072 [ciclu]                        # ER, AE -> an istoric
    python sistem_timp.py ere                                                # cele 12 ere: nume, lungimi, ani
    python sistem_timp.py ayanamsa [an]                                      # unghiul de precesie fata de Spica
    python sistem_timp.py fusuri                                             # tabelul celor 36 de fusuri
    python sistem_timp.py luni-noi 2026                                      # lunile noi ale anului (UTC)
    python sistem_timp.py test
Data/ora de intrare sunt UTC. Secundele intercalare sunt ignorate (ca in Python si Excel).
"""
import math
import re
import sys
from datetime import date, datetime, time, timedelta, timezone

EPOCA = date(2011, 12, 22)          # ziua 1 a lui AN 1 (ziua UTC a solstitiului din decembrie 2011)

# --- Erele (precesia echinoctiilor) --------------------------------------------------------------
CICLU_PRECESIE = 25772                       # ani (360 grade / 50,29 secunde de arc pe an)
N_ERE = 12
LIMITE_ERE = [(j * CICLU_PRECESIE) // N_ERE for j in range(N_ERE + 1)]     # 0, 2147, 4295, 6443, ..., 25772
ANCORA_ET = 2441            # an-eticheta (anul gregorian care contine 1 iulie) al lui AE 1 din ER 1 (Varsator)
K_ANCORA = ANCORA_ET - EPOCA.year            # anul nou k al lui AE 1 din ER 1
LAMBDA_SPICA_J2000 = 203.8414                # longitudinea ecliptica a lui Spica, echinoctiul J2000 (grade)
NUME_ERE = [("Kumbha", "Aquarius", "Verseau"), ("Makara", "Capricorn", "Capricorne"),
            ("Dhanus", "Sagittarius", "Sagittaire"), ("Vṛścika", "Scorpio", "Scorpion"),
            ("Tulā", "Libra", "Balance"), ("Kanyā", "Virgo", "Vierge"), ("Siṃha", "Leo", "Lion"),
            ("Karkaṭa", "Cancer", "Cancer"), ("Mithuna", "Gemini", "Gémeaux"),
            ("Vṛṣabha", "Taurus", "Taureau"), ("Meṣa", "Aries", "Bélier"), ("Mīna", "Pisces", "Poissons")]
SS_ORA, SS_MIN, SS_SEC = 2400, 240, 24     # subsecunde (= secunde SI) intr-o ora / minut / secunda noua
AN_MEDIU = 365 + 1 / 4 - 1 / 128
LUNATIE = 29.530588861
ZILE_RO = ["Luni", "Marți", "Miercuri", "Joi", "Vineri", "Sâmbătă", "Duminică"]
ZILE_SA = ["Somavāra", "Maṅgalavāra", "Budhavāra", "Guruvāra", "Śukravāra", "Śanivāra", "Ravivāra"]
ZILE_EN = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
ZILE_FR = ["lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi", "dimanche"]


# ------------------------------------------------------------------ anul solar
def este_bisect(k):
    """k = numarul anului nou (AN 1 = 2011-12-22)."""
    return k % 4 == 0 and k % 128 != 0


def inceput_an(k):
    return EPOCA + timedelta(days=365 * (k - 1) + (k - 1) // 4 - (k - 1) // 128)


def an_pentru_zi(zi):
    k = math.floor((zi - EPOCA).days / AN_MEDIU) + 1
    while zi < inceput_an(k):
        k -= 1
    while zi >= inceput_an(k + 1):
        k += 1
    return k


def era_ae_din_k(k):
    """Anul nou k -> (ER 1-12, AE 1-2148). Ciclul se repeta la fiecare 25.772 de ani."""
    p = (k - K_ANCORA) % CICLU_PRECESIE
    j = max(i for i in range(N_ERE) if LIMITE_ERE[i] <= p)
    return j + 1, p - LIMITE_ERE[j] + 1


def lungime_era(er):
    return LIMITE_ERE[er] - LIMITE_ERE[er - 1]


def k_din_era_ae(er, ae, ciclu=0):
    """(ER, AE) -> anul nou k. ciclu 0 = ciclul curent (cel care se termina la ancora, in 2440), -1 = cel dinainte, +1 = urmatorul."""
    if not 1 <= er <= N_ERE:
        raise ValueError("ER trebuie să fie între 1 și 12.")
    if not 1 <= ae <= lungime_era(er):
        raise ValueError(f"AE trebuie să fie între 1 și {lungime_era(er)} pentru ER {er}.")
    return K_ANCORA - CICLU_PRECESIE + LIMITE_ERE[er - 1] + ae - 1 + ciclu * CICLU_PRECESIE


def nume_an(y):
    """An astronomic (1 i.e.n. = 0) -> text istoric."""
    return f"{y} e.n." if y >= 1 else f"{1 - y} î.e.n."


def era_din_an(y):
    """An astronomic (1 i.e.n. = 0, 785 i.e.n. = -784) -> (ER, AE). Anul este anul gregorian care contine 1 iulie al anului nou."""
    return era_ae_din_k(y - EPOCA.year)


def an_din_era(er, ae, ciclu=0):
    return k_din_era_ae(er, ae, ciclu) + EPOCA.year


def parse_an_istoric(text):
    """'785BCE', '785 î.e.n.', '2026', '2026 e.n.' sau un an astronomic cu semn ('-784')."""
    t = re.sub(r"[ .]", "", text.strip().lower())
    m = re.match(r"^(-?\d+)(bce|bc|ien|îen|ihr|îhr|ce|ad|en)?$", t)
    if not m:
        raise ValueError('An nerecunoscut. Exemple: 785BCE, "785 î.e.n.", 2026, -784.')
    n, suf = int(m.group(1)), m.group(2)
    if suf in ("bce", "bc", "ien", "îen", "ihr", "îhr"):
        if n < 1:
            raise ValueError("Anii î.e.n. se dau ca numere pozitive (785 î.e.n.).")
        return 1 - n
    return n


def precesie_generala(T):
    """Precesia generala in longitudine (grade), IAU 2006; T = secole iuliene de la J2000."""
    return (5028.796195 * T + 1.1054348 * T * T) / 3600


def ayanamsa(an):
    """Longitudinea ecliptica a lui Spica minus 180 grade, la anul zecimal `an` (2000.0 = J2000)."""
    return LAMBDA_SPICA_J2000 + precesie_generala((an - 2000) / 100) - 180


def an_ayanamsa(grade):
    """Anul zecimal in care ayanamsa atinge `grade` (bisectie)."""
    a, b = -30000.0, 30000.0
    for _ in range(100):
        m = (a + b) / 2
        a, b = (m, b) if ayanamsa(m) < grade else (a, m)
    return (a + b) / 2


def campuri_solare(zi):
    k = an_pentru_zi(zi)
    n = (zi - inceput_an(k)).days + 1                    # ziua din an, 1..366
    er, ae = era_ae_din_k(k)
    arc = min(73, (n - 1) // 5 + 1)
    za = n - 5 * (arc - 1)
    cs = 1 if arc <= 18 else 2 if arc <= 36 else 3 if arc <= 55 else 4
    if n <= 364:
        lc, zn = (n - 1) // 28 + 1, (n - 1) % 28 + 1
    else:
        lc, zn = 0, n - 364                              # 365 -> ZN 1 (Ziua anului), 366 -> ZN 2 (Ziua bisecta)
    return dict(k=k, n=n, er=er, ae=ae, cs=cs, arc=arc, za=za, lc=lc, zn=zn)


# ------------------------------------------------------------------ fus / timp local
def fus(lon):
    """Fusul nou (numar intreg de ore noi) pentru longitudinea lon (grade, +E)."""
    return math.floor(lon / 10 + 0.5)


def decalaj_s(lon, mod="F"):
    """Decalajul fata de UTC, in secunde: fus (F) sau timp solar mediu local (L)."""
    return fus(lon) * SS_ORA if mod == "F" else round(lon * SS_MIN)


# ------------------------------------------------------------------ luna (Meeus, cap. 49)
def _delta_t(an_frac):
    if 2005 <= an_frac < 2050:
        t = an_frac - 2000
        return 62.92 + 0.32217 * t + 0.005589 * t * t
    u = (an_frac - 1820) / 100
    return -20 + 32 * u * u


def _luna_noua_jde(k):
    T = k / 1236.85
    jde = (2451550.09766 + 29.530588861 * k + 0.00015437 * T ** 2 - 0.000000150 * T ** 3 + 0.00000000073 * T ** 4)
    E = 1 - 0.002516 * T - 0.0000074 * T ** 2
    rad = math.radians
    M = rad((2.5534 + 29.10535670 * k - 0.0000014 * T ** 2 - 0.00000011 * T ** 3) % 360)
    Mp = rad((201.5643 + 385.81693528 * k + 0.0107582 * T ** 2 + 0.00001238 * T ** 3 - 0.000000058 * T ** 4) % 360)
    F = rad((160.7108 + 390.67050284 * k - 0.0016118 * T ** 2 - 0.00000227 * T ** 3 + 0.000000011 * T ** 4) % 360)
    Om = rad((124.7746 - 1.56375588 * k + 0.0020672 * T ** 2 + 0.00000215 * T ** 3) % 360)
    s = math.sin
    c = (-0.40720 * s(Mp) + 0.17241 * E * s(M) + 0.01608 * s(2 * Mp) + 0.01039 * s(2 * F)
         + 0.00739 * E * s(Mp - M) - 0.00514 * E * s(Mp + M) + 0.00208 * E * E * s(2 * M)
         - 0.00111 * s(Mp - 2 * F) - 0.00057 * s(Mp + 2 * F) + 0.00056 * E * s(2 * Mp + M)
         - 0.00042 * s(3 * Mp) + 0.00042 * E * s(M + 2 * F) + 0.00038 * E * s(M - 2 * F)
         - 0.00024 * E * s(2 * Mp - M) - 0.00017 * s(Om) - 0.00007 * s(Mp + 2 * M)
         + 0.00004 * s(2 * Mp - 2 * F) + 0.00004 * s(3 * M) + 0.00003 * s(Mp + M - 2 * F)
         + 0.00003 * s(2 * Mp + 2 * F) - 0.00003 * s(Mp + M + 2 * F) + 0.00003 * s(Mp - M + 2 * F)
         - 0.00002 * s(Mp - M - 2 * F) - 0.00002 * s(3 * Mp + M) + 0.00002 * s(4 * Mp))
    A = [299.77 + 0.107408 * k - 0.009173 * T ** 2, 251.88 + 0.016321 * k, 251.83 + 26.651886 * k,
         349.42 + 36.412478 * k, 84.66 + 18.206239 * k, 141.74 + 53.303771 * k, 207.14 + 2.453732 * k,
         154.84 + 7.306860 * k, 34.52 + 27.261239 * k, 207.19 + 0.121824 * k, 291.34 + 1.844379 * k,
         161.72 + 24.198154 * k, 239.56 + 25.513099 * k, 331.55 + 3.592518 * k]
    coef = [0.000325, 0.000165, 0.000164, 0.000126, 0.000110, 0.000062, 0.000060,
            0.000056, 0.000047, 0.000042, 0.000040, 0.000037, 0.000035, 0.000023]
    return jde + c + sum(cf * s(rad(a)) for cf, a in zip(coef, A))


def luna_noua(k):
    """Momentul (UTC, datetime naiv) al lunii noi cu indicele k (k=0 ~ 6 ianuarie 2000)."""
    jde = _luna_noua_jde(k)
    jd_utc = jde - _delta_t(2000 + k / 12.3685) / 86400
    return datetime(2000, 1, 1, 12) + timedelta(days=jd_utc - 2451545.0)


def luna_noua_inainte(dt):
    """Ultima luna noua <= dt (UTC)."""
    k0 = math.floor((dt.year + (dt.timetuple().tm_yday - 1) / 365.25 - 2000) * 12.3685)
    cand = [luna_noua(k) for k in range(k0 - 2, k0 + 3)]
    return max(c for c in cand if c <= dt)


def luna_noua_ziua_1(dt, off):
    """Luna nouă a cărei zi locală este cea mai recentă (<= ziua locală a lui dt).
    Ziua locală a lunii noi este ziua lunară 1, chiar dacă luna nouă are loc mai târziu în acea zi."""
    zi = (dt + timedelta(seconds=off)).date()
    k0 = math.floor((dt.year + (dt.timetuple().tm_yday - 1) / 365.25 - 2000) * 12.3685)
    cand = [luna_noua(k) for k in range(k0 - 2, k0 + 4)]
    return max(c for c in cand if (c + timedelta(seconds=off)).date() <= zi)


def luni_noi_an(an):
    k0 = math.floor((an - 2000) * 12.3685) - 1
    return [x for x in (luna_noua(k) for k in range(k0, k0 + 15)) if x.year == an]


# ------------------------------------------------------------------ Soarele si Luna: pozitii reale
def _T(dt):
    """Secole iuliene de la J2000, in timp terestru (UTC + delta T)."""
    jd = 2451545.0 + (dt - datetime(2000, 1, 1, 12)).total_seconds() / 86400
    dtt = _delta_t(dt.year + (dt.timetuple().tm_yday - 1) / 365.25)
    return (jd + dtt / 86400 - 2451545.0) / 36525


def longitudine_soare(dt):
    """Longitudinea aparenta a Soarelui in grade, masurata de la echinoctiul de martie (Meeus, cap. 25)."""
    T = _T(dt)
    L0 = 280.46646 + 36000.76983 * T + 0.0003032 * T * T
    M = math.radians(357.52911 + 35999.05029 * T - 0.0001537 * T * T)
    C = ((1.914602 - 0.004817 * T - 0.000014 * T * T) * math.sin(M)
         + (0.019993 - 0.000101 * T) * math.sin(2 * M) + 0.000289 * math.sin(3 * M))
    om = math.radians(125.04 - 1934.136 * T)
    return (L0 + C - 0.00569 - 0.00478 * math.sin(om)) % 360


# Meeus, cap. 47 (serii trunchiate): D, M, M', F, coeficient (in 1e-6 grade)
_LUNA_LON = [
    (0, 0, 1, 0, 6288774), (2, 0, -1, 0, 1274027), (2, 0, 0, 0, 658314), (0, 0, 2, 0, 213618), (0, 1, 0, 0, -185116),
    (0, 0, 0, 2, -114332), (2, 0, -2, 0, 58793), (2, -1, -1, 0, 57066), (2, 0, 1, 0, 53322), (2, -1, 0, 0, 45758),
    (0, 1, -1, 0, -40923), (1, 0, 0, 0, -34720), (0, 1, 1, 0, -30383), (2, 0, 0, -2, 15327), (0, 0, 1, 2, -12528),
    (0, 0, 1, -2, 10980), (4, 0, -1, 0, 10675), (0, 0, 3, 0, 10034), (4, 0, -2, 0, 8548), (2, 1, -1, 0, -7888),
    (2, 1, 0, 0, -6766), (1, 0, -1, 0, -5163), (1, 1, 0, 0, 4987), (2, -1, 1, 0, 4036), (2, 0, 2, 0, 3994),
    (4, 0, 0, 0, 3861), (2, 0, -3, 0, 3665), (0, 1, -2, 0, -2689), (2, 0, -1, 2, -2602), (2, -1, -2, 0, 2390),
    (1, 0, 1, 0, -2348), (2, -2, 0, 0, 2236), (0, 1, 2, 0, -2120), (0, 2, 0, 0, -2069), (2, -2, -1, 0, 2048),
    (2, 0, 1, -2, -1773), (2, 0, 0, 2, -1595), (4, -1, -1, 0, 1215), (0, 0, 2, 2, -1110)]
_LUNA_LAT = [
    (0, 0, 0, 1, 5128122), (0, 0, 1, 1, 280602), (0, 0, 1, -1, 277693), (2, 0, 0, -1, 173237), (2, 0, -1, 1, 55413),
    (2, 0, -1, -1, 46271), (2, 0, 0, 1, 32573), (0, 0, 2, 1, 17198), (2, 0, 1, -1, 9266), (0, 0, 2, -1, 8822),
    (2, -1, 0, -1, 8216), (2, 0, -2, -1, 4324), (2, 0, 1, 1, 4200), (2, 1, 0, -1, -3359), (2, -1, -1, 1, 2463),
    (2, -1, 0, 1, 2211), (2, -1, -1, -1, 2065), (0, 1, -1, -1, -1870), (4, 0, -1, -1, 1828), (0, 1, 0, 1, -1794),
    (0, 0, 0, 3, -1749), (0, 1, -1, 1, -1565), (1, 0, 0, 1, -1491), (0, 1, 1, 1, -1475), (0, 1, 1, -1, -1410),
    (0, 1, 0, -1, -1344), (1, 0, 0, -1, -1335), (0, 0, 3, 1, 1107), (4, 0, 0, -1, 1021), (4, 0, -1, 1, 833)]


def _luna_lon_lat(dt):
    """(longitudine, latitudine) ecliptice ale Lunii, in grade (longitudinea include nutatia)."""
    T = _T(dt)
    L = 218.3164477 + 481267.88123421 * T - 0.0015786 * T ** 2 + T ** 3 / 538841 - T ** 4 / 65194000
    D = 297.8501921 + 445267.1114034 * T - 0.0018819 * T ** 2 + T ** 3 / 545868 - T ** 4 / 113065000
    M = 357.5291092 + 35999.0502909 * T - 0.0001536 * T ** 2 + T ** 3 / 24490000
    Mp = 134.9633964 + 477198.8675055 * T + 0.0087414 * T ** 2 + T ** 3 / 69699 - T ** 4 / 14712000
    F = 93.2720950 + 483202.0175233 * T - 0.0036539 * T ** 2 - T ** 3 / 3526000 + T ** 4 / 863310000
    E = 1 - 0.002516 * T - 0.0000074 * T ** 2
    A1, A2, A3 = 119.75 + 131.849 * T, 53.09 + 479264.290 * T, 313.45 + 481266.484 * T
    r, sin = math.radians, math.sin
    sl = sum(c * E ** abs(m) * sin(r(d * D + m * M + mp * Mp + f * F)) for d, m, mp, f, c in _LUNA_LON)
    sl += 3958 * sin(r(A1)) + 1962 * sin(r(L - F)) + 318 * sin(r(A2))
    sb = sum(c * E ** abs(m) * sin(r(d * D + m * M + mp * Mp + f * F)) for d, m, mp, f, c in _LUNA_LAT)
    sb += (-2235 * sin(r(L)) + 382 * sin(r(A3)) + 175 * sin(r(A1 - F)) + 175 * sin(r(A1 + F))
           + 127 * sin(r(L - Mp)) - 115 * sin(r(L + Mp)))
    om = r(125.04 - 1934.136 * T)
    return (L + sl / 1e6 - 0.00478 * sin(om)) % 360, sb / 1e6


_LUNA_DIST = [
    (0, 0, 1, 0, -20905355), (2, 0, -1, 0, -3699111), (2, 0, 0, 0, -2955968), (0, 0, 2, 0, -569925), (0, 1, 0, 0, 48888),
    (0, 0, 0, 2, -3149), (2, 0, -2, 0, 246158), (2, -1, -1, 0, -152138), (2, 0, 1, 0, -170733), (2, -1, 0, 0, -204586),
    (0, 1, -1, 0, -129620), (1, 0, 0, 0, 108743), (0, 1, 1, 0, 104755), (2, 0, 0, -2, 10321), (0, 0, 1, -2, 79661),
    (4, 0, -1, 0, -34782), (0, 0, 3, 0, -23210), (4, 0, -2, 0, -21636), (2, 1, -1, 0, 24208), (2, 1, 0, 0, 30824),
    (1, 0, -1, 0, -8379), (1, 1, 0, 0, -16675), (2, -1, 1, 0, -12831), (2, 0, 2, 0, -10445), (4, 0, 0, 0, -11650),
    (2, 0, -3, 0, 14403), (0, 1, -2, 0, -7003), (2, -1, -2, 0, 10056), (1, 0, 1, 0, 6322), (2, -2, 0, 0, -9884),
    (0, 1, 2, 0, 5751), (2, -2, -1, 0, -4950), (2, 0, 1, -2, 4130)]


def distanta_luna_km(dt):
    T = _T(dt)
    D = 297.8501921 + 445267.1114034 * T - 0.0018819 * T ** 2 + T ** 3 / 545868 - T ** 4 / 113065000
    M = 357.5291092 + 35999.0502909 * T - 0.0001536 * T ** 2 + T ** 3 / 24490000
    Mp = 134.9633964 + 477198.8675055 * T + 0.0087414 * T ** 2 + T ** 3 / 69699 - T ** 4 / 14712000
    F = 93.2720950 + 483202.0175233 * T - 0.0036539 * T ** 2 - T ** 3 / 3526000 + T ** 4 / 863310000
    E = 1 - 0.002516 * T - 0.0000074 * T ** 2
    sr = sum(c * E ** abs(m) * math.cos(math.radians(d * D + m * M + mp * Mp + f * F)) for d, m, mp, f, c in _LUNA_DIST)
    return 385000.56 + sr / 1000


def gama_luna(dt):
    """Distanta (in raze ecuatoriale ale Pamantului) dintre axa umbrei si centrul Lunii, aprox.: |latitudine| x distanta."""
    return abs(math.radians(latitudine_luna(dt))) * distanta_luna_km(dt) / 6378.14


def unghi_solar(dt):
    """Unghiul solar: pozitia Soarelui pe orbita, de la solstitiul din decembrie (0) — 90 = echinoctiul din martie,
    180 = solstitiul din iunie, 270 = echinoctiul din septembrie."""
    return (longitudine_soare(dt) - 270) % 360


def unghi_lunar(dt):
    """Unghiul lunar: elongatia Lunii fata de Soare — 0 luna noua, 90 primul patrar, 180 luna plina, 270 ultimul patrar."""
    return (_luna_lon_lat(dt)[0] - longitudine_soare(dt)) % 360


def latitudine_luna(dt):
    return _luna_lon_lat(dt)[1]


_FAZE = ["nouă", "semilună crescătoare", "primul pătrar", "gibbă crescătoare", "plină",
         "gibbă descrescătoare", "ultimul pătrar", "semilună descrescătoare"]


def faza_unghi(u):
    return _FAZE[int(((u + 22.5) % 360) // 45)]


# Meeus, cap. 27: momentele echinoctiilor si solstitiilor (ani 1000-3000); termeni periodici (A, B, C)
_EQ_A = [(485, 324.96, 1934.136), (203, 337.23, 32964.467), (199, 342.08, 20.186), (182, 27.85, 445267.112),
         (156, 73.14, 45036.886), (136, 171.52, 22518.443), (77, 222.54, 65928.934), (74, 296.72, 3034.906),
         (70, 243.58, 9037.513), (58, 119.81, 33718.147), (52, 297.17, 150.678), (50, 21.02, 2281.226),
         (45, 247.54, 29929.562), (44, 325.15, 31555.956), (29, 60.93, 4443.417), (18, 155.12, 67555.328),
         (17, 288.79, 4562.452), (16, 198.04, 62894.029), (14, 199.76, 31436.921), (12, 95.39, 14577.848),
         (12, 287.11, 31931.756), (12, 320.81, 34777.259), (9, 227.73, 1222.114), (8, 15.45, 16859.074)]
_EQ_JDE0 = {0: (2451623.80984, 365242.37404, 0.05169, -0.00411, -0.00057),    # echinoctiul din martie
            1: (2451716.56767, 365241.62603, 0.00325, 0.00888, -0.00030),     # solstitiul din iunie
            2: (2451810.21715, 365242.01767, -0.11575, 0.00337, 0.00078),     # echinoctiul din septembrie
            3: (2451900.05952, 365242.74049, -0.06223, -0.00823, 0.00032)}    # solstitiul din decembrie


def eveniment_solar(an, idx):
    """Momentul UTC al echinoctiului/solstitiului `idx` (0 martie, 1 iunie, 2 septembrie, 3 decembrie) din anul `an`."""
    Y = (an - 2000) / 1000
    c = _EQ_JDE0[idx]
    jde0 = c[0] + c[1] * Y + c[2] * Y ** 2 + c[3] * Y ** 3 + c[4] * Y ** 4
    T = (jde0 - 2451545.0) / 36525
    W = math.radians(35999.373 * T - 2.47)
    dl = 1 + 0.0334 * math.cos(W) + 0.0007 * math.cos(2 * W)
    S = sum(a * math.cos(math.radians(b + cc * T)) for a, b, cc in _EQ_A)
    jde = jde0 + 0.00001 * S / dl
    jd_utc = jde - _delta_t(an + (0.2, 0.47, 0.73, 0.97)[idx]) / 86400
    return (datetime(2000, 1, 1, 12) + timedelta(days=jd_utc - 2451545.0)).replace(microsecond=0)


def cadran_real(zi, off):
    """Cadranul solar 1-4 al zilei locale `zi`: cadranul in care se afla Soarele la sfarsitul zilei
    (1 = de la solstitiul din decembrie, 2 = de la echinoctiul din martie, 3 = de la solstitiul din iunie,
    4 = de la echinoctiul din septembrie)."""
    fin = datetime.combine(zi + timedelta(days=1), time()) - timedelta(seconds=off)
    cand = [(eveniment_solar(fin.year - 1, 3), 1), (eveniment_solar(fin.year, 0), 2), (eveniment_solar(fin.year, 1), 3),
            (eveniment_solar(fin.year, 2), 4), (eveniment_solar(fin.year, 3), 1)]
    return max((t, c) for t, c in cand if t <= fin)[1]


def unitati(grade):
    """Un unghi in grade zecimale, gon si radiani."""
    return {"grade": grade, "gon": grade * 400 / 360, "rad": math.radians(grade)}


def fmt_unghi(grade):
    u = unitati(grade)
    return f"{u['grade']:7.2f}° = {u['gon']:7.2f} gon = {u['rad']:6.4f} rad".replace(".", ",")


def _dif(f, t, tinta):
    return (f(t) - tinta + 180) % 360 - 180


def _treceri(f, t0, t1, tinta, pas_s):
    """Momentele din [t0, t1) in care unghiul f(t) creste trecand prin `tinta` (grade)."""
    out, t, prev = [], t0, _dif(f, t0, tinta)
    while t < t1:
        tn = t + timedelta(seconds=pas_s)
        cur = _dif(f, tn, tinta)
        if prev < 0 <= cur and cur - prev < 90:
            lo, hi = t, tn
            for _ in range(40):
                mid = lo + (hi - lo) / 2
                lo, hi = (mid, hi) if _dif(f, mid, tinta) < 0 else (lo, mid)
            out.append((hi + timedelta(microseconds=500000)).replace(microsecond=0))
        prev, t = cur, tn
    return out


def _faze_lunare(t0, t1):
    """Momentele (UTC) in care elongatia Lunii trece prin 0/90/180/270 grade, cu unghiul-tinta."""
    out, t, prev = [], t0, unghi_lunar(t0)
    while t < t1:
        tn = t + timedelta(hours=12)
        cur = unghi_lunar(tn)
        if int(cur // 90) != int(prev // 90) and (cur - prev) % 360 < 90:
            tinta = (int(cur // 90) * 90) % 360
            lo, hi = t, tn
            for _ in range(40):
                mid = lo + (hi - lo) / 2
                lo, hi = (mid, hi) if _dif(unghi_lunar, mid, tinta) < 0 else (lo, mid)
            out.append(((hi + timedelta(microseconds=500000)).replace(microsecond=0), tinta))
        prev, t = cur, tn
    return out


def evenimente_brute(an):
    """Lista (moment UTC, cod, eclipsa) pentru un an gregorian. cod: S0..S3 = solstitiul din decembrie, echinoctiul din
    martie, solstitiul din iunie, echinoctiul din septembrie; L0/L90/L180/L270 = luna noua, primul patrar, luna plina,
    ultimul patrar. eclipsa = True daca luna noua / luna plina are loc langa un nod (eclipsa posibila)."""
    ev = [(eveniment_solar(an, idx), ("S1", "S2", "S3", "S0")[idx], False) for idx in range(4)]
    for t, tinta in _faze_lunare(datetime(an, 1, 1), datetime(an + 1, 1, 1)):
        ecl = False
        if tinta == 0:
            ecl = abs(latitudine_luna(t)) < 1.58
        elif tinta == 180:
            ecl = gama_luna(t) < 1.0128
        ev.append((t, "L%d" % tinta, ecl))
    return sorted(ev)


_NUME_EV = {"S1": "☀ echinocțiul din martie (unghi solar 90°)", "S2": "☀ solstițiul din iunie (180°)",
            "S3": "☀ echinocțiul din septembrie (270°)", "S0": "☀ solstițiul din decembrie (0°, începutul anului nou)",
            "L0": "☾ lună nouă", "L90": "☾ primul pătrar", "L180": "☾ lună plină", "L270": "☾ ultimul pătrar"}


def evenimente(an):
    """Fenomenele astronomice ale unui an gregorian (UTC), ca (moment, text)."""
    out = []
    for t, cod, ecl in evenimente_brute(an):
        extra = ""
        if ecl:
            extra = "  — eclipsă de Soare posibilă" if cod == "L0" else "  — eclipsă de Lună posibilă"
        out.append((t, _NUME_EV[cod] + extra))
    return out


def unitati(grade):
    """Un unghi in grade zecimale, gon si radiani."""
    return {"grade": grade, "gon": grade * 400 / 360, "rad": math.radians(grade)}


def fmt_unghi(grade):
    u = unitati(grade)
    return f"{u['grade']:7.2f}° = {u['gon']:7.2f} gon = {u['rad']:6.4f} rad".replace(".", ",")


def _dif(f, t, tinta):
    return (f(t) - tinta + 180) % 360 - 180


def _treceri(f, t0, t1, tinta, pas_s):
    """Momentele din [t0, t1) in care unghiul f(t) creste trecand prin `tinta` (grade)."""
    out, t, prev = [], t0, _dif(f, t0, tinta)
    while t < t1:
        tn = t + timedelta(seconds=pas_s)
        cur = _dif(f, tn, tinta)
        if prev < 0 <= cur and cur - prev < 90:
            lo, hi = t, tn
            for _ in range(40):
                mid = lo + (hi - lo) / 2
                lo, hi = (mid, hi) if _dif(f, mid, tinta) < 0 else (lo, mid)
            out.append((hi + timedelta(microseconds=500000)).replace(microsecond=0))
        prev, t = cur, tn
    return out


# ------------------------------------------------------------------ conversii
def din_utc(dt, lon=0.0, mod="F"):
    """datetime UTC -> dictionar cu toate campurile."""
    off = decalaj_s(lon, mod)
    loc = dt + timedelta(seconds=off)
    r = campuri_solare(loc.date())
    t = loc.hour * 3600 + loc.minute * 60 + loc.second
    hn, rest = divmod(t, SS_ORA)
    mn, rest = divmod(rest, SS_MIN)
    sn, ss = divmod(rest, SS_SEC)
    nz = luna_noua_ziua_1(dt, off)                   # pentru ziua lunara
    cl = (loc.date() - (nz + timedelta(seconds=off)).date()).days + 1
    r.update(hn=hn, mn=mn, sn=sn, ss=ss, cl=cl, lon=lon, mod=mod, fus=fus(lon))
    r["cs_arc"] = r["cs"]                            # cadranul dupa regula arcelor 18/18/19/18 (informativ)
    r["cs"] = cadran_real(loc.date(), off)           # cadranul real: dupa pozitia Soarelui
    r["unghi_solar"], r["unghi_lunar"] = unghi_solar(dt), unghi_lunar(dt)
    r["faza"] = faza_unghi(r["unghi_lunar"])
    r["zi_sapt"] = (r["zn"] - 1) % 7 if r["lc"] else None
    return r


def cod(r):
    sufix = (f"F{r['fus']:+03d}" if r["mod"] == "F" else f"L{r['lon']:+.1f}")
    return (f"{r['er']}-{r['ae']:04d}-{r['cs']}-{r['arc']:02d}.{r['za']}-{r['cl']:02d}-"
            f"{r['lc']:02d}-{r['zn']:02d} {r['hn']:02d}:{r['mn']:02d}:{r['sn']:02d}:{r['ss']:02d} {sufix}")


def in_utc(er, ae, lc, zn, hn, mn, sn, ss, lon=0.0, mod="F", ciclu=0):
    """ER, AE, LC, ZN + timpul nou (locale) -> datetime UTC (ciclu 0 = ciclul curent de precesie)."""
    if not (0 <= hn <= 35 and 0 <= mn <= 9 and 0 <= sn <= 9 and 0 <= ss <= 23):
        raise ValueError("Timp nou invalid: HN 0-35, MN 0-9, SN 0-9, SS 0-23.")
    k = k_din_era_ae(er, ae, ciclu)
    if lc == 0:
        if zn not in (1, 2):
            raise ValueError("Pentru LC 00, ZN poate fi 01 (Ziua anului) sau 02 (Ziua bisectă).")
        if zn == 2 and not este_bisect(k):
            raise ValueError("Acest an nu este bisect: nu are Ziua bisectă.")
        n = 364 + zn
    elif 1 <= lc <= 13 and 1 <= zn <= 28:
        n = (lc - 1) * 28 + zn
    else:
        raise ValueError("LC 0-13 și ZN 1-28.")
    if not (1 - EPOCA.year <= k <= 9998 - EPOCA.year):
        raise ValueError("Zilele exacte sunt acceptate doar pentru anii 1-9999 e.n.; pentru ani î.e.n. folosiți „istoric”.")
    zi = inceput_an(k) + timedelta(days=n - 1)
    loc = datetime.combine(zi, time()) + timedelta(seconds=hn * SS_ORA + mn * SS_MIN + sn * SS_SEC + ss)
    return loc - timedelta(seconds=decalaj_s(lon, mod))


_TIPAR = re.compile(r"^(\d{1,2})-(\d{4})-(\d)-(\d{2})\.(\d)-(\d{2})-(\d{2})-(\d{2}) "
                    r"(\d{2}):(\d{1,2}):(\d{1,2}):(\d{2}) ([FL])([+-]\d+(?:\.\d+)?)$")


def din_cod(text, ciclu=0):
    """cod complet -> (datetime UTC, lista de avertismente de coerenta)."""
    m = _TIPAR.match(text.strip())
    if not m:
        raise ValueError("Format de cod nerecunoscut. Exemplu: 12-1734-4-57.3-19-11-03 23:02:06:21 F+00")
    er, ae, cs, arc, za, cl, lc, zn, hn, mn, sn, ss = (int(x) for x in m.groups()[:12])
    mod, val = m.group(13), float(m.group(14))
    lon = val * 10 if mod == "F" else val
    dt = in_utc(er, ae, lc, zn, hn, mn, sn, ss, lon, mod, ciclu)
    r = din_utc(dt, lon, mod)
    avert = []
    for nume, dat, calc in (("CS", cs, r["cs"]), ("AS", arc, r["arc"]), ("ZA", za, r["za"]), ("CL", cl, r["cl"])):
        if dat != calc:
            avert.append(f"{nume} din cod ({dat}) diferă de valoarea calculată ({calc}).")
    return dt, avert


def descrie(r):
    if r["lc"]:
        w = r["zi_sapt"]
        zi = f"{ZILE_RO[w]} ({ZILE_SA[w]} · {ZILE_EN[w]} · {ZILE_FR[w]})"
    else:
        zi = "Ziua anului (Year Day · Jour de l'année)" if r["zn"] == 1 else "Ziua bisectă (Leap Day · Jour bissextile)"
    sa, en, fr = NUME_ERE[r["er"] - 1]
    return (f"ER {r['er']} ({sa} · {en} · {fr}), AE {r['ae']}; ziua {r['n']} din an; "
            f"cadranul {r['cs']}, arcul {r['arc']}; {zi}; luna calendaristică {r['lc']}; "
            f"luna: ziua {r['cl']} ({r['faza']}); unghi solar {r['unghi_solar']:.1f}°, unghi lunar {r['unghi_lunar']:.1f}°")


# ------------------------------------------------------------------ interfata
def tabel_fusuri():
    print(f"{'Fus':>4} {'Long. centrală':>15} {'Decalaj (ore noi)':>18} {'Echivalent standard':>21}")
    for z in range(-18, 19):
        m = z * 40
        semn = "+" if m >= 0 else "-"
        print(f"{z:>+4d} {z * 10:>+14d}° {z:>+18d} {semn}{abs(m) // 60:02d}:{abs(m) % 60:02d}".replace("+-", "-"))


def test():
    import random
    # 1. inceputul anului = ziua UTC a solstitiului din decembrie (tabele 2011-2019, 2021-2031)
    sol = {2011: 22, 2012: 21, 2013: 21, 2014: 21, 2015: 22, 2016: 21, 2017: 21, 2018: 21, 2019: 22,
           2021: 21, 2022: 21, 2023: 22, 2024: 21, 2025: 21, 2026: 21, 2027: 22, 2028: 21, 2029: 21, 2030: 21, 2031: 22}
    for y, d in sol.items():
        assert inceput_an(y - 2010) == date(y, 12, d), y
    # 2. exemplul din specificatie
    r = din_utc(datetime(2026, 9, 29, 15, 30, 45))
    assert cod(r) == "12-1734-4-57.3-19-11-03 23:02:06:21 F+00", cod(r)
    # 3. luna noua din septembrie 2026: 11.09, 03:27 UTC (+-3 minute)
    assert abs((luna_noua_inainte(datetime(2026, 9, 20)) - datetime(2026, 9, 11, 3, 27)).total_seconds()) < 180
    # 4. structura anului: 73 de arce, cadrane 18/18/19/18, anul mediu, ani bisecti in 128 de ani
    assert [sum(1 for a in range(1, 74) if (1 if a <= 18 else 2 if a <= 36 else 3 if a <= 55 else 4) == c)
            for c in (1, 2, 3, 4)] == [18, 18, 19, 18]
    assert sum(1 for k in range(1, 129) if este_bisect(k)) == 31
    assert abs((inceput_an(1 + 128 * 30) - inceput_an(1)).days / (128 * 30) - AN_MEDIU) < 1e-9
    # 5. dus-intors pe toate zilele 1900-2200 (la amiaza UTC), in ambele moduri de fus
    z = date(1900, 1, 1)
    while z <= date(2200, 12, 31):
        dt = datetime.combine(z, time(12, 34, 56))
        for lon, mod in ((0.0, "F"), (-74.0, "F"), (26.1, "L")):
            rr = din_utc(dt, lon, mod)
            dt2, av = din_cod(cod(rr))
            assert dt2 == dt and not av, (dt, cod(rr), dt2, av)
        z += timedelta(days=37)                      # 37 e prim cu 7, 28 si 365: acopera toate combinatiile
    # 6. dus-intors pentru toate secundele unei zile si pentru instante aleatoare
    for s in range(0, 86400, 7):
        dt = datetime(2028, 12, 30) + timedelta(seconds=s)
        dt2, av = din_cod(cod(din_utc(dt, 12.3, "F")))
        assert dt2 == dt and not av, dt
    random.seed(1)
    for _ in range(20000):
        dt = datetime(1900, 1, 1) + timedelta(seconds=random.randrange(0, 301 * 365 * 86400))
        lon = round(random.uniform(-180, 180), 1)
        mod = random.choice("FL")
        dt2, av = din_cod(cod(din_utc(dt, lon, mod)))
        assert dt2 == dt and not av, (dt, lon, mod)
    # 6b. ziua lunara este mereu 1..30 si creste cu 1 pe zi sau revine la 1
    for lon, mod in ((0.0, "F"), (139.7, "F"), (-118.2, "L")):
        prev = None
        d0 = datetime(2026, 1, 1, 12)
        for i in range(3 * 366):
            cl = din_utc(d0 + timedelta(days=i), lon, mod)["cl"]
            assert 1 <= cl <= 30, (i, cl)
            assert prev is None or cl == prev + 1 or cl == 1, (i, prev, cl)
            prev = cl
    assert din_utc(datetime(2026, 9, 11, 3, 0), 0.0, "F")["cl"] == 1     # inainte de luna nouă (03:27), aceeași zi
    assert din_utc(datetime(2026, 9, 10, 23, 0), 0.0, "F")["cl"] == 30   # ziua precedentă = ultima zi lunară
    # 7. Ziua anului / Ziua bisecta: 30 si 31 decembrie 2027-2028 in calendarul nou
    assert din_utc(datetime(2028, 12, 20, 12), 0, "F")["lc"] == 0        # AN 17 (2027-12-22..2028-12-20) bisect
    print("OK: toate verificările au trecut (solstiții 2011-2031, luna nouă, structura anului, dus-întors).")
    try:                                                                # 8. comparatie cu efemeride independente
        import ephem
        d = ephem.Date("2000/1/1")
        maxdif = 0.0
        while d < ephem.Date("2050/1/1"):
            nm = ephem.next_new_moon(d)
            mine = luna_noua_inainte(nm.datetime() + timedelta(hours=1))
            maxdif = max(maxdif, abs((mine - nm.datetime()).total_seconds()))
            d = ephem.Date(nm + 20)
        print(f"Lunile noi 2000-2050 comparate cu 'ephem': diferența maximă = {maxdif:.0f} secunde.")
    except ImportError:
        print("(modulul 'ephem' nu este instalat: comparația cu efemeride externe a fost omisă)")
    test_astro()
    test_era()


def test_astro(tol=None):
    """Compara pozitiile si evenimentele cu efemeride independente (modulul 'ephem'), daca este instalat."""
    import random
    try:
        import ephem
    except ImportError:
        print("(modulul 'ephem' nu este instalat: comparația astronomică a fost omisă)")
        return
    random.seed(7)
    ms = ml = mb = 0.0
    for _ in range(1500):
        dt = datetime(1950, 1, 1) + timedelta(seconds=random.randrange(0, 150 * 365 * 86400))
        d = ephem.Date(dt)
        ls = math.degrees(ephem.Ecliptic(ephem.Sun(d), epoch=d).lon)
        moon = ephem.Ecliptic(ephem.Moon(d), epoch=d)
        lm, bm = _luna_lon_lat(dt)
        ms = max(ms, abs((longitudine_soare(dt) - ls + 180) % 360 - 180))
        ml = max(ml, abs((lm - math.degrees(moon.lon) + 180) % 360 - 180))
        mb = max(mb, abs(bm - math.degrees(moon.lat)))
    assert ms < 0.02 and ml < 0.06 and mb < 0.03, (ms, ml, mb)
    # solstitii / echinoctii 2000-2040 fata de efemeride
    mx = 0.0
    for y in range(2000, 2041):
        ref = [ephem.next_vernal_equinox(f"{y}/1/1"), ephem.next_summer_solstice(f"{y}/4/1"),
               ephem.next_autumnal_equinox(f"{y}/7/1"), ephem.next_winter_solstice(f"{y}/11/1")]
        for idx, b in enumerate(ref):
            mx = max(mx, abs((eveniment_solar(y, idx) - b.datetime()).total_seconds()))
    assert mx < 180, mx
    # unghiul solar (formula rapida) fata de momentele exacte: la echinoctiu/solstitiu trebuie sa fie aproape de 0/90/180/270
    for y, idx in ((2026, 0), (2026, 1), (2026, 2), (2026, 3)):
        u = unghi_solar(eveniment_solar(y, idx))
        assert min(abs(u - t) for t in (0, 90, 180, 270, 360)) < 0.03, (y, idx, u)
    # patrarele Lunii 2026 fata de efemeride
    mq, cnt = 0.0, 0
    mine = [t for t, n in evenimente(2026) if n.startswith("☾")]
    for fn in (ephem.next_new_moon, ephem.next_first_quarter_moon, ephem.next_full_moon, ephem.next_last_quarter_moon):
        d = ephem.Date("2026/1/1")
        while True:
            d = fn(d)
            if d.datetime().year > 2026:
                break
            near = min(mine, key=lambda t: abs((t - d.datetime()).total_seconds()))
            mq = max(mq, abs((near - d.datetime()).total_seconds())); cnt += 1
            d = ephem.Date(d + 1)
    assert mq < 300 and cnt >= 48, (mq, cnt)
    # eclipse 2024-2026 (Soare: toate; Luna: doar umbrale)
    sol_exp = {"2024-04-08", "2024-10-02", "2025-03-29", "2025-09-21", "2026-02-17", "2026-08-12"}
    lun_exp = {"2024-09-18", "2025-03-14", "2025-09-07", "2026-03-03", "2026-08-28"}
    sol, lun = set(), set()
    for y in (2024, 2025, 2026):
        for t, n in evenimente(y):
            if "eclipsă de Soare" in n:
                sol.add(t.date().isoformat())
            if "eclipsă de Lună" in n:
                lun.add(t.date().isoformat())
    assert sol == sol_exp and lun == lun_exp, (sorted(sol), sorted(lun))
    print(f"Astronomie: Soare max {ms:.4f}°, Lună lon {ml:.4f}° / lat {mb:.4f}°; solstiții și echinocțiuri max {mx:.0f} s; "
          f"pătrare 2026 max {mq:.0f} s ({cnt} evenimente); eclipsele 2024-2026 sunt corecte.")


def test_era():
    """Modelul erelor, ancora (Spica) si datarea istorica."""
    # limite si lungimi: 4 ere de 2147 si 8 de 2148 de ani, fiecare grup de 3 ere = 6443 de ani (un sfert din ciclu)
    lung = [lungime_era(e) for e in range(1, N_ERE + 1)]
    assert sorted(set(lung)) == [2147, 2148] and lung.count(2147) == 4 and sum(lung) == CICLU_PRECESIE
    assert [LIMITE_ERE[3 * i] for i in range(5)] == [0, 6443, 12886, 19329, 25772]
    # ancora este calculata din Spica: ayanamsa 30 grade in jurul lui 2440 e.n. -> ER 1 incepe cu anul-eticheta 2441
    assert math.floor(an_ayanamsa(30)) + 1 == ANCORA_ET, an_ayanamsa(30)
    assert abs(an_ayanamsa(0) - 286.8) < 1.5
    # exemple: 2026 -> ER 12 (Pesti), 785 i.e.n. -> ER 11 (Berbec)
    assert era_din_an(2026) == (12, 1734) and era_din_an(parse_an_istoric("785 î.e.n.")) == (11, 1072)
    assert parse_an_istoric("785BCE") == parse_an_istoric("-784") == -784 and parse_an_istoric("2026 e.n.") == 2026
    # nu exista an zero in era: AE incepe la 1; ultimul an al unei ere este urmat de AE 1 din era urmatoare
    for er in range(1, N_ERE + 1):
        assert era_ae_din_k(k_din_era_ae(er, 1)) == (er, 1)
        assert era_ae_din_k(k_din_era_ae(er, lungime_era(er))) == (er, lungime_era(er))
        urm = k_din_era_ae(er, lungime_era(er)) + 1
        assert era_ae_din_k(urm) == (er % N_ERE + 1, 1)
    # dus-intors pe tot ciclul curent (de la -23.331 la 2440) si pe cel precedent
    for y in range(-23331, 2441, 7):
        er, ae = era_din_an(y)
        assert an_din_era(er, ae) == y, (y, er, ae)
    assert an_din_era(12, 1734) == 2026 and an_din_era(12, 1734, ciclu=-1) == 2026 - CICLU_PRECESIE
    # ER 1 AE 1 = anul nou care incepe la 21.12.2440; ER 12 AE 1 incepe in 293
    assert an_din_era(1, 1, ciclu=1) == ANCORA_ET and nume_an(an_din_era(12, 1)) == "293 e.n."
    # abaterea modelului (ere egale) fata de precesia reala (IAU 2006): sub 0,5 grade (~35 de ani) in ultimele 4.000 de ani
    for y in (-1800, -784, 1, 1000, 2026):
        model = 30 + (y + 0.5 - an_ayanamsa(30)) * 360 / CICLU_PRECESIE
        assert abs(ayanamsa(y + 0.5) - model) < 0.5, y
    print("Ere: lungimi 2147/2148, ancora din Spica (ayanamsa 30° la %.1f e.n.), datare istorică și dus-întors verificate." % an_ayanamsa(30))


def _arg_lon(argv, i):
    lon = float(argv[i]) if len(argv) > i else 0.0
    mod = argv[i + 1].upper() if len(argv) > i + 1 else "F"
    if mod not in ("F", "L"):
        raise ValueError("Modul trebuie să fie F (fus) sau L (timp solar local).")
    return lon, mod


def main(argv):
    if len(argv) >= 2 and argv[1] == "test":
        return test()
    if len(argv) >= 2 and argv[1] == "fusuri":
        return tabel_fusuri()
    if len(argv) == 3 and argv[1] == "luni-noi":
        for x in luni_noi_an(int(argv[2])):
            print(x.strftime("%Y-%m-%d %H:%M UTC"))
        return 0
    if len(argv) == 3 and argv[1] == "istoric":
        y = parse_an_istoric(argv[2])
        er, ae = era_din_an(y)
        sa, en, fr = NUME_ERE[er - 1]
        print(f"{nume_an(y)} (an astronomic {y})  =  ER {er} ({sa} · {en} · {fr}), AE {ae}")
        return 0
    if len(argv) in (4, 5) and argv[1] == "istoric-inv":
        er, ae, ciclu = int(argv[2]), int(argv[3]), (int(argv[4]) if len(argv) == 5 else 0)
        y = an_din_era(er, ae, ciclu)
        print(f"ER {er}, AE {ae} (ciclul {ciclu:+d})  =  {nume_an(y)} (an astronomic {y})")
        return 0
    if len(argv) == 2 and argv[1] == "ere":
        print(f"{'ER':>3} {'Sanscrită':<10} {'Engleză':<12} {'Franceză':<11} {'Ani':>5}  {'De la':>11} {'Până la':>11}  (ciclul curent)")
        for e in range(1, N_ERE + 1):
            a0 = an_din_era(e, 1)
            a1 = an_din_era(e, lungime_era(e))
            sa, en, fr = NUME_ERE[e - 1]
            print(f"{e:>3} {sa:<10} {en:<12} {fr:<11} {lungime_era(e):>5}  {nume_an(a0):>11} {nume_an(a1):>11}")
        return 0
    if len(argv) in (2, 3) and argv[1] == "ayanamsa":
        if len(argv) == 3:
            an = float(argv[2])
            print(f"ayanamsa({an:g}) = {ayanamsa(an):.3f}°")
        else:
            print(f"ayanamsa 0° la {an_ayanamsa(0):.1f}, 30° la {an_ayanamsa(30):.1f}; ER 1 începe cu anul nou {ANCORA_ET}")
        return 0
    if len(argv) == 3 and argv[1] == "evenimente":
        for t, nume in evenimente(int(argv[2])):
            print(t.strftime("%Y-%m-%d %H:%M UTC"), nume)
        return 0
    if len(argv) >= 2 and argv[1] == "unghiuri":
        dt = (datetime.fromisoformat(argv[2]).replace(microsecond=0) if len(argv) >= 3
              else datetime.now(timezone.utc).replace(tzinfo=None, microsecond=0))
        lon, mod = _arg_lon(argv, 3)
        r = din_utc(dt, lon, mod)
        rot = (r["hn"] * SS_ORA + r["mn"] * SS_MIN + r["sn"] * SS_SEC + r["ss"]) / SS_MIN
        print(f"{dt.isoformat(sep=' ')} UTC  (fus {r['fus']:+d})")
        print("rotația zilnică :", fmt_unghi(rot))
        print("unghi solar     :", fmt_unghi(r["unghi_solar"]), f"  (cadranul {r['cs']})")
        print("unghi lunar     :", fmt_unghi(r["unghi_lunar"]), f"  ({r['faza']})")
        return 0
    if len(argv) >= 2 and argv[1] == "acum":
        lon, mod = _arg_lon(argv, 2)
        dt = datetime.now(timezone.utc).replace(tzinfo=None, microsecond=0)
    elif len(argv) >= 3 and argv[1] == "g2t":
        lon, mod = _arg_lon(argv, 3)
        dt = datetime.fromisoformat(argv[2]).replace(microsecond=0)
    elif len(argv) == 3 and argv[1] == "t2g":
        dt, av = din_cod(argv[2])
        print(dt.strftime("%Y-%m-%d %H:%M:%S UTC"))
        for a in av:
            print("Avertisment:", a)
        return 0
    else:
        print(__doc__)
        return 1
    r = din_utc(dt, lon, mod)
    print(f"{dt.isoformat(sep=' ')} UTC  =  {cod(r)}")
    print(descrie(r))
    return 0


if __name__ == "__main__":
    try:
        sys.exit(main(sys.argv))
    except ValueError as e:
        print("Eroare:", e)
        sys.exit(2)
