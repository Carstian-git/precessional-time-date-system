#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Ceas TPU – widget de desktop (Windows, macOS, Linux). Doar biblioteca standard (Tkinter).
Rulare:  python ceas_tpu.py [longitudine] [ro|en|fr]     ex.  python ceas_tpu.py 26.1 en
Run:     python ceas_tpu.py [longitude] [ro|en|fr]  /  Lancer : python ceas_tpu.py [longitude] [ro|en|fr]
Mutat cu click-stânga + tragere; click-dreapta = închide; fereastra rămâne deasupra celorlalte."""
import math, sys, time, tkinter as tk
from datetime import datetime, timezone, date

LON = float(sys.argv[1]) if len(sys.argv) > 1 else 26.1   # grade est (negativ la vest)
LANG = sys.argv[2] if len(sys.argv) > 2 and sys.argv[2] in ("ro", "en", "fr") else "ro"
EPOCA = date(2011, 12, 22).toordinal(); CICLU = 25772; AN_MEDIU = 365 + 1/4 - 1/128; K_ANCORA = 2441 - 2011
LIMITE = [j * CICLU // 12 for j in range(13)]
L10N = {
    "ro": dict(zile=["Luni", "Marți", "Miercuri", "Joi", "Vineri", "Sâmbătă", "Duminică"], luna="Luna", ziua="ziua", za="Ziua anului", zb="Ziua bisectă", titlu="Ceas TPU"),
    "en": dict(zile=["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"], luna="Month", ziua="day", za="Year Day", zb="Leap Day", titlu="HPT Clock"),
    "fr": dict(zile=["lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi", "dimanche"], luna="Mois", ziua="jour", za="Jour de l'année", zb="Jour bissextile", titlu="Horloge TPH"),
}

def inceput_an(k): return EPOCA + 365*(k-1) + (k-1)//4 - (k-1)//128
def an_pentru_zi(z):
    k = int((z - EPOCA) // AN_MEDIU) + 1
    while z < inceput_an(k): k -= 1
    while z >= inceput_an(k+1): k += 1
    return k
def era_ae(k):
    p = (k - K_ANCORA) % CICLU; j = max(i for i in range(12) if LIMITE[i] <= p); return j+1, p-LIMITE[j]+1

def acum(lon):
    ms = time.time()
    fus = math.floor(lon/10 + 0.5); loc = int(math.floor(ms)) + fus*2400
    z = date(1970,1,1).toordinal() + loc // 86400
    k = an_pentru_zi(z); n = z - inceput_an(k) + 1; er, ae = era_ae(k)
    arc = min(73, (n-1)//5 + 1)
    lc, zn = ((n-1)//28 + 1, (n-1) % 28 + 1) if n <= 364 else (0, n-364)
    t = loc % 86400; hn, r = divmod(t, 2400); mn, r = divmod(r, 240); sn, ss = divmod(r, 24)
    T = L10N[LANG]; zs = T["zile"][(zn-1) % 7] if lc else (T["za"] if zn == 1 else T["zb"])
    return dict(er=er, ae=ae, lc=lc, zn=zn, hn=hn, mn=mn, sn=sn, ss=ss, fus=fus, zs=zs,
                unghi=t/86400*360, data=(f"{zs} · {T['luna']} {lc} · {T['ziua']} {zn}" if lc else zs) + f" · ER {er} AE {ae}",
                ora=f"{hn:02d}:{mn:02d}:{sn:02d}:{ss:02d}")

BG, FG, ACC, RING = "#10151f", "#eef0f5", "#ff8a6b", "#2c3650"
root = tk.Tk(); root.title(L10N[LANG]["titlu"]); root.configure(bg=BG)
root.overrideredirect(True); root.attributes("-topmost", True)
S = 240; cv = tk.Canvas(root, width=S, height=S+70, bg=BG, highlightthickness=0); cv.pack()
c, R = S/2, 100
def pt(a, r): return c + math.sin(math.radians(a))*r, c - math.cos(math.radians(a))*r
cv.create_oval(c-R, c-R, c+R, c+R, outline=RING, width=2)
for h in range(36):
    x1, y1 = pt(h*10, R-(14 if h % 3 == 0 else 7)); x2, y2 = pt(h*10, R)
    cv.create_line(x1, y1, x2, y2, fill=FG, width=2 if h % 3 == 0 else 1)
    if h % 3 == 0: x, y = pt(h*10, R-28); cv.create_text(x, y, text=str(h), fill=FG, font=("Segoe UI", 9))
hand = cv.create_line(c, c, c, c, fill=ACC, width=4, capstyle="round")
mhand = cv.create_line(c, c, c, c, fill=FG, width=2, capstyle="round")
cv.create_oval(c-4, c-4, c+4, c+4, fill=ACC, outline=ACC)
tora = cv.create_text(c, S+12, text="", fill=FG, font=("Consolas", 18, "bold"))
tdat = cv.create_text(c, S+40, text="", fill="#9aa3b8", font=("Segoe UI", 10))
def tick():
    r = acum(LON); x, y = pt(r["unghi"], R-35); cv.coords(hand, c, c, x, y)
    x, y = pt((r["mn"]*240 + r["sn"]*24 + r["ss"])/2400*360, R-8); cv.coords(mhand, c, c, x, y)
    cv.itemconfig(tora, text=r["ora"]); cv.itemconfig(tdat, text=r["data"]); root.after(1000, tick)
drag = {}
def d1(e): drag["x"], drag["y"] = e.x, e.y
def d2(e): root.geometry(f"+{root.winfo_x()+e.x-drag['x']}+{root.winfo_y()+e.y-drag['y']}")
cv.bind("<Button-1>", d1); cv.bind("<B1-Motion>", d2); cv.bind("<Button-3>", lambda e: root.destroy()); cv.bind("<Button-2>", lambda e: root.destroy())
tick(); root.mainloop()
