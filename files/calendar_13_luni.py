#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
calendar_13_luni.py
-------------------
Calendar de 13 luni x 28 de zile, ALINIAT LA SOLSTITIUL DIN DECEMBRIE, cu conversie exacta gregorian <-> 13 luni.
Foloseste aceleasi reguli ca sistem_timp.py si ca foile din Excel.

Anul nou (numarul k):
  * AN 1 incepe la 22.12.2011 (ziua UTC a solstitiului din decembrie 2011); k = 1, 2, 3, ...
  * An bisect (366 zile): k multiplu de 4, cu exceptia multiplilor de 128 (Jubileu). Anul mediu = 365,2421875 zile.
  * Un an nou este identificat prin anul gregorian care contine 1 iulie al lui
    (ex.: anul gregorian 2026 = anul nou k = 15, de la 21.12.2025 la 20.12.2026 = ER 12, AE 1734).
  * Erele (precesia, ciclu de 25.772 ani = 12 ere de 2147/2148 ani; reper: steaua Spica): ER 1-12, AE = anul erei (fara an zero).
Ziua N a anului nou (1..366):
    N <= 364 :  luna = (N-1)//28 + 1 ,  ziua = (N-1)%28 + 1 ,  ziua saptamanii = (N-1)%7  (0 = luni)
    N == 365 :  Ziua anului (in afara saptamanii)      N == 366 :  Ziua bisecta (in afara saptamanii)
    Fiecare luna incepe luni si se termina duminica. Ziua 1 a anului nou cade in ziua solstitiului.
Arcul solar: AS = min(73, (N-1)//5 + 1), ZA = ziua din arc; cadranul solar CS = 1..4 (arce 1-18, 19-36, 37-55, 56-73).
Denumiri in sanscrita (IAST): lunile poarta numeralul ordinal + "masa", zilele saptamanii numele traditionale.

Utilizare:
    python calendar_13_luni.py g2n 2026-09-29        # gregorian -> 13 luni
    python calendar_13_luni.py n2g 2026 11 3         # an gregorian, luna, zi -> data gregoriana
    python calendar_13_luni.py n2g AN15 ziua-anului  # anul nou se poate da si direct: AN<k>  (sau ziua-bisecta)
    python calendar_13_luni.py an 2026               # cele 13 luni ale anului nou, cu datele gregoriene
    python calendar_13_luni.py test
"""
import math
import sys
from datetime import date, timedelta

EPOCA = date(2011, 12, 22)
AN_MEDIU = 365 + 1 / 4 - 1 / 128
CICLU_PRECESIE, N_ERE = 25772, 12
LIMITE_ERE = [(j * CICLU_PRECESIE) // N_ERE for j in range(N_ERE + 1)]
K_ANCORA = 2441 - EPOCA.year          # AE 1 din ER 1 (Varsator) = anul nou al anului gregorian 2441
NUME_ERE = [("Kumbha", "Aquarius", "Verseau"), ("Makara", "Capricorn", "Capricorne"),
            ("Dhanus", "Sagittarius", "Sagittaire"), ("Vṛścika", "Scorpio", "Scorpion"),
            ("Tulā", "Libra", "Balance"), ("Kanyā", "Virgo", "Vierge"), ("Siṃha", "Leo", "Lion"),
            ("Karkaṭa", "Cancer", "Cancer"), ("Mithuna", "Gemini", "Gémeaux"),
            ("Vṛṣabha", "Taurus", "Taureau"), ("Meṣa", "Aries", "Bélier"), ("Mīna", "Pisces", "Poissons")]

ZILE_RO = ["Luni", "Marți", "Miercuri", "Joi", "Vineri", "Sâmbătă", "Duminică"]
ZILE_SA = ["Somavāra", "Maṅgalavāra", "Budhavāra", "Guruvāra", "Śukravāra", "Śanivāra", "Ravivāra"]
ORDINALE_SA = ["Prathama", "Dvitīya", "Tṛtīya", "Caturtha", "Pañcama", "Ṣaṣṭha", "Saptama",
               "Aṣṭama", "Navama", "Daśama", "Ekādaśa", "Dvādaśa", "Trayodaśa"]
LUNI_SA = [f"{o} māsa" for o in ORDINALE_SA]
ORD_EN = ["First", "Second", "Third", "Fourth", "Fifth", "Sixth", "Seventh", "Eighth", "Ninth", "Tenth", "Eleventh",
          "Twelfth", "Thirteenth"]
ORD_FR = ["premier", "deuxième", "troisième", "quatrième", "cinquième", "sixième", "septième", "huitième", "neuvième",
          "dixième", "onzième", "douzième", "treizième"]
LUNI_EN = [f"{o} month" for o in ORD_EN]
LUNI_FR = [f"{o.capitalize()} mois" for o in ORD_FR]
ZILE_EN = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
ZILE_FR = ["lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi", "dimanche"]
ZILE_SPECIALE = {           # cheie: (ziua din an, nume romana, nume sanscrita)
    "ziua-anului": (365, "Ziua anului", "Varṣa-dina", "Year Day", "Jour de l'année"),
    "ziua-bisecta": (366, "Ziua bisectă", "Adhika-dina", "Leap Day", "Jour bissextile"),
}


def este_bisect(k):
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


def an_pentru_an_gregorian(an):
    """Anul nou care contine 1 iulie al anului gregorian dat."""
    return an_pentru_zi(date(an, 7, 1))


def campuri_an(k):
    """Anul nou k -> (ER 1-12, AE 1-2148)."""
    p = (k - K_ANCORA) % CICLU_PRECESIE
    j = max(i for i in range(N_ERE) if LIMITE_ERE[i] <= p)
    return j + 1, p - LIMITE_ERE[j] + 1


def din_gregorian(d):
    """date gregoriana -> dictionar cu data in calendarul de 13 luni."""
    k = an_pentru_zi(d)
    n = (d - inceput_an(k)).days + 1
    arc = min(73, (n - 1) // 5 + 1)
    r = {"k": k, "campuri_an": campuri_an(k), "zi_an": n, "arc": arc, "za": n - 5 * (arc - 1),
         "cs": 1 if arc <= 18 else 2 if arc <= 36 else 3 if arc <= 55 else 4}
    if n <= 364:
        r.update(tip="obisnuita", luna=(n - 1) // 28 + 1, zi=(n - 1) % 28 + 1,
                 zi_sapt=(n - 1) % 7, saptamana=(n - 1) // 7 + 1)
    else:
        r.update(tip="ziua-anului" if n == 365 else "ziua-bisecta", luna=None, zi=None, zi_sapt=None, saptamana=None)
    return r


def in_gregorian(k, luna=None, zi=None, tip="obisnuita"):
    """(anul nou k, luna 1-13, zi 1-28) sau zi speciala -> date gregoriana."""
    if tip == "obisnuita":
        if not (luna is not None and zi is not None and 1 <= luna <= 13 and 1 <= zi <= 28):
            raise ValueError("Luna trebuie să fie între 1 și 13, iar ziua între 1 și 28.")
        n = (luna - 1) * 28 + zi
    elif tip in ZILE_SPECIALE:
        n = ZILE_SPECIALE[tip][0]
        if n == 366 and not este_bisect(k):
            raise ValueError(f"Anul nou {k} nu este bisect: nu are Ziua bisectă.")
    else:
        raise ValueError("Tip de zi necunoscut.")
    return inceput_an(k) + timedelta(days=n - 1)


def descrie(r):
    er, ae = r["campuri_an"]
    sa_e, en_e, fr_e = NUME_ERE[er - 1]
    an_txt = f"ER {er} ({sa_e} · {en_e} · {fr_e}), AE {ae} (anul nou k = {r['k']})"
    arc = f"arcul solar {r['arc']}.{r['za']}, cadranul {r['cs']}"
    if r["tip"] == "obisnuita":
        n, w = r['luna'] - 1, r['zi_sapt']
        return (f"{an_txt}: luna {r['luna']} ({LUNI_SA[n]} · {LUNI_EN[n]} · {LUNI_FR[n]}), ziua {r['zi']}, "
                f"{ZILE_RO[w]} ({ZILE_SA[w]} · {ZILE_EN[w]} · {ZILE_FR[w]}), săptămâna {r['saptamana']}; {arc}")
    _, ro, sa, en, fr = ZILE_SPECIALE[r["tip"]]
    return f"{an_txt}: {ro} ({sa} · {en} · {fr}), fără zi a săptămânii; {arc}"


def tabel_an(k):
    er, ae = campuri_an(k)
    a, b = inceput_an(k), inceput_an(k + 1) - timedelta(days=1)
    print(f"Anul nou k = {k}  (ER {er}, AE {ae:04d}): {a.isoformat()} .. {b.isoformat()}"
          + ("  (bisect)" if este_bisect(k) else ""))
    print(f"{'Luna':<28}{'Prima zi':<14}{'Ultima zi':<14}")
    for luna in range(1, 14):
        print(f"{luna:>2}  {LUNI_SA[luna - 1]:<23}{in_gregorian(k, luna, 1).isoformat():<14}"
              f"{in_gregorian(k, luna, 28).isoformat():<14}")
    for tip in ("ziua-anului", "ziua-bisecta"):
        if tip == "ziua-bisecta" and not este_bisect(k):
            continue
        z = in_gregorian(k, tip=tip)
        print(f"{'  ' + ZILE_SPECIALE[tip][1]:<28}{z.isoformat():<14}{z.isoformat():<14}")


def _an_nou(text):
    t = text.strip().lower()
    return int(t[2:]) if t.startswith("an") else an_pentru_an_gregorian(int(t))


def test():
    # 1. inceputul anului = ziua UTC a solstitiului din decembrie (2011-2031, verificat cu biblioteca ephem)
    sol = {2011: 22, 2012: 21, 2013: 21, 2014: 21, 2015: 22, 2016: 21, 2017: 21, 2018: 21, 2019: 22, 2020: 21,
           2021: 21, 2022: 21, 2023: 22, 2024: 21, 2025: 21, 2026: 21, 2027: 22, 2028: 21, 2029: 21, 2030: 21, 2031: 22}
    for y, dd in sol.items():
        assert inceput_an(y - 2010) == date(y, 12, dd), y
    assert an_pentru_an_gregorian(2026) == 15 and inceput_an(15) == date(2025, 12, 21)
    # 2. dus-intors pe toate zilele 1900-2200; fiecare luna incepe luni si se termina duminica
    d, sfarsit, total = date(1900, 1, 1), date(2200, 12, 31), 0
    speciale = {}
    while d <= sfarsit:
        r = din_gregorian(d)
        if r["tip"] == "obisnuita":
            assert in_gregorian(r["k"], r["luna"], r["zi"]) == d, d
            assert r["zi"] != 1 or r["zi_sapt"] == 0, d
            assert r["zi"] != 28 or r["zi_sapt"] == 6, d
        else:
            assert in_gregorian(r["k"], tip=r["tip"]) == d, d
            speciale[r["k"]] = speciale.get(r["k"], 0) + 1
        total += 1
        d += timedelta(days=1)
    for k, n in speciale.items():
        assert n in (1, 2), k          # 1 zi speciala, 2 in anii bisecti (anii de la capete pot fi incompleti)
    # 3. lungimea anilor: 365 sau 366, 31 de ani bisecti in 128 de ani, anul mediu
    assert all((inceput_an(k + 1) - inceput_an(k)).days == (366 if este_bisect(k) else 365) for k in range(-300, 300))
    assert sum(1 for k in range(1, 129) if este_bisect(k)) == 31
    assert abs((inceput_an(1 + 128 * 30) - inceput_an(1)).days / (128 * 30) - AN_MEDIU) < 1e-9
    nr = f"{total:,}".replace(",", ".")
    print(f"OK: {nr} de zile verificate (1900-2200), solstiții 2011-2031, conversie exactă în ambele sensuri.")


def main(argv):
    if len(argv) == 2 and argv[1] == "test":
        return test()
    if len(argv) == 3 and argv[1] == "g2n":
        d = date.fromisoformat(argv[2])
        print(f"{d.isoformat()}  =  {descrie(din_gregorian(d))}")
        return 0
    if len(argv) == 3 and argv[1] == "an":
        tabel_an(_an_nou(argv[2]))
        return 0
    if argv[1:2] == ["n2g"] and len(argv) in (4, 5):
        k = _an_nou(argv[2])
        d = in_gregorian(k, tip=argv[3]) if len(argv) == 4 else in_gregorian(k, int(argv[3]), int(argv[4]))
        print(f"{d.isoformat()}  ({ZILE_RO[d.weekday()]}, zi gregoriană)  =  {descrie(din_gregorian(d))}")
        return 0
    print(__doc__)
    return 1


if __name__ == "__main__":
    try:
        sys.exit(main(sys.argv))
    except ValueError as e:
        print("Eroare:", e)
        sys.exit(2)
