#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
conversie_timp.py
-----------------
Conversie exacta intre timpul standard (24 h) si timpul de 36 de ore.

Reguli:
    1 zi = 24 h standard = 36 h noi = 360 grade
    1 ora noua = 10 minute noi = 10 grade
    1 minut nou = 10 secunde noi = 1 grad
    1 secunda noua = 24 subsecunde = 0,1 grade
    => 1 subsecunda = 1 secunda standard (SI)

Formule (T = secunde standard scurse de la miezul noptii):
    T = h*3600 + m*60 + s

    24 h -> 36 h                          36 h -> 24 h
    ora        = T // 2400                T = H*2400 + M*240 + S*24 + SS
    minutul    = (T % 2400) // 240        h = T // 3600
    secunda    = (T % 240) // 24          m = (T % 3600) // 60
    subsecunda = T % 24                   s = T % 60
    unghi      = T / 240   (grade)

Utilizare:
    python conversie_timp.py 24 15:30:45      # 24 h -> 36 h
    python conversie_timp.py 36 23:02:06:21     # 36 h -> 24 h  (ora:minut:secunda:subsecunda)
    python conversie_timp.py test             # verifica toate cele 86.400 de secunde
"""
import sys

SEC_STANDARD_PE_ZI = 86400
SUBSECUNDE_PE_SECUNDA = 24
SECUNDE_PE_MINUT_NOU = 10
MINUTE_PE_ORA_NOUA = 10
SS_PE_MINUT_NOU = SUBSECUNDE_PE_SECUNDA * SECUNDE_PE_MINUT_NOU          # 240
SS_PE_ORA_NOUA = SS_PE_MINUT_NOU * MINUTE_PE_ORA_NOUA                   # 2400


def la_36(h, m, s):
    """Timp standard (h, m, s) -> (ora, minut, secunda, subsecunda, unghi in grade)."""
    if not (0 <= h <= 23 and 0 <= m <= 59 and 0 <= s < 60):
        raise ValueError("Timp standard invalid: ora 0-23, minute 0-59, secunde 0-59.")
    T = h * 3600 + m * 60 + s
    ora, rest = divmod(T, SS_PE_ORA_NOUA)
    minut, rest = divmod(rest, SS_PE_MINUT_NOU)
    secunda, subsecunda = divmod(rest, SUBSECUNDE_PE_SECUNDA)
    unghi = T / SS_PE_MINUT_NOU
    return int(ora), int(minut), int(secunda), subsecunda, unghi


def la_24(H, M, S, SS=0):
    """Timp de 36 h (ora, minut, secunda, subsecunda) -> (h, m, s) standard."""
    if not (0 <= H <= 35 and 0 <= M <= 9 and 0 <= S <= 9 and 0 <= SS < SUBSECUNDE_PE_SECUNDA):
        raise ValueError("Timp nou invalid: ora 0-35, minut 0-9, secunda 0-9, subsecunda 0-23.")
    T = H * SS_PE_ORA_NOUA + M * SS_PE_MINUT_NOU + S * SUBSECUNDE_PE_SECUNDA + SS
    h, rest = divmod(T, 3600)
    m, s = divmod(rest, 60)
    return int(h), int(m), s


def _numar(x):
    v = float(x)
    return int(v) if v == int(v) else v


def _parseaza(text, n):
    parti = text.split(":")
    if len(parti) != n:
        raise ValueError(f"Format asteptat: {n} valori separate prin ':'.")
    return [_numar(p) for p in parti]


def test():
    """Verifica dus-intors pentru fiecare secunda a zilei."""
    for T in range(SEC_STANDARD_PE_ZI):
        h, rest = divmod(T, 3600)
        m, s = divmod(rest, 60)
        ora, minut, sec, ss, _ = la_36(h, m, s)
        assert la_24(ora, minut, sec, ss) == (h, m, s), (h, m, s)
    print("OK: toate cele 86.400 de secunde se convertesc exact, in ambele sensuri.")


def main(argv):
    if len(argv) == 2 and argv[1] == "test":
        return test()
    if len(argv) != 3 or argv[1] not in ("24", "36"):
        print(__doc__)
        return 1
    if argv[1] == "24":
        h, m, s = _parseaza(argv[2], 3)
        o, mi, se, ss, u = la_36(h, m, s)
        print(f"{h:02d}:{m:02d}:{s:02d} (24 h)  =  {o:02d} h  {mi:02d} min  {se:02d} s  {ss:02d} subsecunde  ({u:.4f}\u00b0)".replace(".", ","))
    else:
        H, M, S, SS = (_parseaza(argv[2], 4) if argv[2].count(":") == 3 else _parseaza(argv[2], 3) + [0])
        h, m, s = la_24(H, M, S, SS)
        print(f"{H:02d} h  {M:02d} min  {S:02d} s  {SS:02d} subsecunde (36 h)  =  {h:02d}:{m:02d}:{int(s):02d} (24 h)")
    return 0


if __name__ == "__main__":
    try:
        sys.exit(main(sys.argv))
    except ValueError as e:
        print("Eroare:", e)
        sys.exit(2)
