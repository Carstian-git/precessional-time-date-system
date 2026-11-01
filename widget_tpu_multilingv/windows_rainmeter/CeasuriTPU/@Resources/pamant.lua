-- ============ NUCLEU COMUN TPU (acelasi cod ca pe site) ============
local EPOCA, CICLU, AN_MEDIU, K_ANCORA = 15330, 25772, 365 + 1/4 - 1/128, 2441 - 2011
local LIMITE = {}
for j = 0, 12 do LIMITE[j] = math.floor(j * CICLU / 12) end
local L10N = {
  ro = {zile = {"Luni","Marți","Miercuri","Joi","Vineri","Sâmbătă","Duminică"}, luna = "Luna", ziua = "ziua", za = "Ziua anului", zb = "Ziua bisectă", moon = "FAZA LUNARĂ", si = "SI", data = "%d.%m.%Y"},
  en = {zile = {"Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"}, luna = "Month", ziua = "day", za = "Year Day", zb = "Leap Day", moon = "MOON PHASE", si = "SI", data = "%Y-%m-%d"},
  fr = {zile = {"lundi","mardi","mercredi","jeudi","vendredi","samedi","dimanche"}, luna = "Mois", ziua = "jour", za = "Jour de l'année", zb = "Jour bissextile", moon = "PHASE LUNAIRE", si = "SI", data = "%d/%m/%Y"},
}
local DIAC = {{"ă","a"},{"â","a"},{"î","i"},{"ș","s"},{"ț","t"},{"ş","s"},{"ţ","t"},{"Ă","A"},{"Â","A"},{"Î","I"},{"Ș","S"},{"Ț","T"},{"é","e"},{"è","e"},{"ê","e"},{"à","a"},{"ù","u"},{"ç","c"}}
local DIAC_ON, LANG, LON_FIX, LAT = true, 'en', nil, 44.4
local LANG_AUTO = false
local function txt(s)
  if DIAC_ON then return s end
  for _, p in ipairs(DIAC) do s = s:gsub(p[1], p[2]) end
  return s
end
local function inceput(k) return EPOCA + 365*(k-1) + math.floor((k-1)/4) - math.floor((k-1)/128) end
local function anpz(z)
  local k = math.floor((z - EPOCA) / AN_MEDIU) + 1
  while z < inceput(k) do k = k - 1 end
  while z >= inceput(k+1) do k = k + 1 end
  return k
end
local function p2(n) return string.format("%02d", math.floor(n)) end
local function f1(v) return string.format("%.1f", v) end
local function f2(v) return string.format("%.2f", v) end
local function mod(a, n) return ((a % n) + n) % n end

function CoreInit()
  local l = (SKIN:GetVariable('Limba', 'auto') or 'auto'):lower()
  if L10N[l] then LANG = l; LANG_AUTO = false else LANG = 'en'; LANG_AUTO = true end   -- auto: limba Windows (ro/en/fr; altfel en)
  DIAC_ON = (SKIN:GetVariable('Diacritice', '1') ~= '0')
  LON_FIX = tonumber(SKIN:GetVariable('Longitudine', 'auto'))   -- nil = automat, din fusul orar al Windows
  LAT = tonumber(SKIN:GetVariable('Latitudine', '44.4')) or 44.4
end

-- limba din setarile regionale Windows (masura [Locale] din .ini, ex. ro-RO, en-US, fr-FR)
local function rezolva_limba()
  if not LANG_AUTO then return end
  local ok, m = pcall(function() return SKIN:GetMeasure('Locale') end)
  if ok and m then
    local v = tostring(m:GetStringValue() or ''):sub(1, 2):lower()
    if v ~= '' then LANG = L10N[v] and v or 'en'; LANG_AUTO = false end
  end
end

-- decalajul orei locale fata de UTC (secunde, est pozitiv) si daca e ora de vara
local function decalaj(now)
  local u = os.date("!*t", now); local l = os.date("*t", now)
  u.isdst = l.isdst
  return os.difftime(now, os.time(u)), l.isdst and true or false
end
local function eticheta_utc(off)
  local sg = off < 0 and "-" or "+"; local a = math.abs(off)
  local h = math.floor(a/3600); local m = math.floor((a % 3600)/60)
  return "UTC" .. sg .. h .. (m > 0 and (":" .. p2(m)) or "")
end

-- starea completa la momentul `now` (secunde UTC, epoca Unix)
function Stare(now)
  rezolva_limba()
  local off, dst = decalaj(now)
  local lon = LON_FIX
  if not lon then lon = ((off - (dst and 3600 or 0)) / 3600) * 15 end
  local fus = math.floor(lon/10 + 0.5)
  local loc = now + fus*2400
  local z = math.floor(loc/86400)
  local k = anpz(z); local n = z - inceput(k) + 1
  local p = (k - K_ANCORA) % CICLU; local j = 0
  for i = 0, 11 do if LIMITE[i] <= p then j = i end end
  local er, ae = j + 1, p - LIMITE[j] + 1
  local lc, zn
  if n <= 364 then lc = math.floor((n-1)/28) + 1; zn = (n-1) % 28 + 1 else lc = 0; zn = n - 364 end
  local t = loc % 86400
  local hn = math.floor(t/2400); local r = t % 2400
  local mn = math.floor(r/240); r = r % 240
  local sn = math.floor(r/24); local ss = math.floor(r % 24)
  local T = L10N[LANG]
  local zs = (lc > 0) and T.zile[(zn-1) % 7 + 1] or ((zn == 1) and T.za or T.zb)
  local S = {hn=hn, mn=mn, sn=sn, ss=ss, er=er, ae=ae, lc=lc, zn=zn, zs=zs, t=t, loc=loc, lon=lon, fus=fus, k=k, T=T}
  S.fusTxt = "F" .. (fus < 0 and "-" or "+") .. p2(math.abs(fus))
  S.ora = p2(hn)..":"..p2(mn)..":"..p2(sn)..":"..p2(ss)
  S.si = os.date("%H:%M:%S", now)
  S.siData = os.date(L10N[LANG].data, now)
  S.utc = eticheta_utc(off)
  S.data1 = txt((lc > 0) and (zs.." | "..T.luna.." "..lc.." | "..T.ziua.." "..zn) or zs)
  S.data2 = "ER "..er.." | AE "..ae.." | "..S.siData
  return S
end

-- panoul de sub cadran, comun tuturor ceasurilor: ora TPU, ora locala SI, data
function Panou(S)
  SKIN:Bang('!SetOption', 'Ora', 'Text', S.ora.."  "..S.fusTxt)
  SKIN:Bang('!SetOption', 'Local', 'Text', S.T.si.." "..S.si.."  ("..S.utc..")")
  SKIN:Bang('!SetOption', 'Data1', 'Text', S.data1)
  SKIN:Bang('!SetOption', 'Data2', 'Text', S.data2)
end

-- ============ CEASUL PAMANTULUI (proiectie polara, nordul in centru) ============
local GR, GLAT0 = 148, -60
local SC = 1
local PI = math.pi
local function rad(d) return d * PI / 180 end
local function P(r, a) return 220 + r * math.sin(rad(a)), 220 - r * math.cos(rad(a)) end    -- unitati 440, centru 220
local function X(v) return string.format("%.1f", v * SC) end
local function XY(x, y) return X(x)..","..X(y) end
local function gproj(lat, lon)
  local r = math.min(GR, GR * (90 - lat) / (90 - GLAT0)); local a = 180 - lon
  return P(r, a)
end
local function zoneAng(k) return 180 - 10 * k end

-- ---------- astronomie (port al codului de pe site) ----------
local J2000 = 946728000000
local function deltaT(a)
  if a >= 2005 and a < 2050 then local t = a - 2000; return 62.92 + 0.32217*t + 0.005589*t*t end
  local u = (a - 1820) / 100; return -20 + 32*u*u
end
local function yearFrac(now) local u = os.date("!*t", now); return u.year + (u.yday - 1) / 365.25 end
local function Tcen(now)
  local jd = 2451545.0 + (now*1000 - J2000) / 864e5
  return (jd + deltaT(yearFrac(now)) / 86400 - 2451545.0) / 36525
end
local function longSoare(now)
  local T = Tcen(now)
  local L0 = 280.46646 + 36000.76983*T + 0.0003032*T*T
  local M = rad(357.52911 + 35999.05029*T - 0.0001537*T*T)
  local C = (1.914602 - 0.004817*T - 0.000014*T*T)*math.sin(M) + (0.019993 - 0.000101*T)*math.sin(2*M) + 0.000289*math.sin(3*M)
  local om = rad(125.04 - 1934.136*T)
  return mod(L0 + C - 0.00569 - 0.00478*math.sin(om), 360)
end
local LUNA_LON = {
 {0,0,1,0,6288774},{2,0,-1,0,1274027},{2,0,0,0,658314},{0,0,2,0,213618},{0,1,0,0,-185116},
 {0,0,0,2,-114332},{2,0,-2,0,58793},{2,-1,-1,0,57066},{2,0,1,0,53322},{2,-1,0,0,45758},
 {0,1,-1,0,-40923},{1,0,0,0,-34720},{0,1,1,0,-30383},{2,0,0,-2,15327},{0,0,1,2,-12528},
 {0,0,1,-2,10980},{4,0,-1,0,10675},{0,0,3,0,10034},{4,0,-2,0,8548},{2,1,-1,0,-7888},
 {2,1,0,0,-6766},{1,0,-1,0,-5163},{1,1,0,0,4987},{2,-1,1,0,4036},{2,0,2,0,3994},
 {4,0,0,0,3861},{2,0,-3,0,3665},{0,1,-2,0,-2689},{2,0,-1,2,-2602},{2,-1,-2,0,2390},
 {1,0,1,0,-2348},{2,-2,0,0,2236},{0,1,2,0,-2120},{0,2,0,0,-2069},{2,-2,-1,0,2048},
 {2,0,1,-2,-1773},{2,0,0,2,-1595},{4,-1,-1,0,1215},{0,0,2,2,-1110}}
local LUNA_LAT = {
 {0,0,0,1,5128122},{0,0,1,1,280602},{0,0,1,-1,277693},{2,0,0,-1,173237},{2,0,-1,1,55413},
 {2,0,-1,-1,46271},{2,0,0,1,32573},{0,0,2,1,17198},{2,0,1,-1,9266},{0,0,2,-1,8822},
 {2,-1,0,-1,8216},{2,0,-2,-1,4324},{2,0,1,1,4200},{2,1,0,-1,-3359},{2,-1,-1,1,2463},
 {2,-1,0,1,2211},{2,-1,-1,-1,2065},{0,1,-1,-1,-1870},{4,0,-1,-1,1828},{0,1,0,1,-1794},
 {0,0,0,3,-1749},{0,1,-1,1,-1565},{1,0,0,1,-1491},{0,1,1,1,-1475},{0,1,1,-1,-1410},
 {0,1,0,-1,-1344},{1,0,0,-1,-1335},{0,0,3,1,1107},{4,0,0,-1,1021},{4,0,-1,1,833}}
local function lunaLonLat(now)
  local T = Tcen(now)
  local L = 218.3164477 + 481267.88123421*T - 0.0015786*T^2 + T^3/538841 - T^4/65194000
  local D = 297.8501921 + 445267.1114034*T - 0.0018819*T^2 + T^3/545868 - T^4/113065000
  local M = 357.5291092 + 35999.0502909*T - 0.0001536*T^2 + T^3/24490000
  local Mp = 134.9633964 + 477198.8675055*T + 0.0087414*T^2 + T^3/69699 - T^4/14712000
  local F = 93.2720950 + 483202.0175233*T - 0.0036539*T^2 - T^3/3526000 + T^4/863310000
  local E = 1 - 0.002516*T - 0.0000074*T^2
  local A1, A2, A3 = 119.75 + 131.849*T, 53.09 + 479264.290*T, 313.45 + 481266.484*T
  local sin = math.sin
  local sl = 0
  for _, q in ipairs(LUNA_LON) do sl = sl + q[5] * E^math.abs(q[2]) * sin(rad(q[1]*D + q[2]*M + q[3]*Mp + q[4]*F)) end
  sl = sl + 3958*sin(rad(A1)) + 1962*sin(rad(L - F)) + 318*sin(rad(A2))
  local sb = 0
  for _, q in ipairs(LUNA_LAT) do sb = sb + q[5] * E^math.abs(q[2]) * sin(rad(q[1]*D + q[2]*M + q[3]*Mp + q[4]*F)) end
  sb = sb - 2235*sin(rad(L)) + 382*sin(rad(A3)) + 175*sin(rad(A1 - F)) + 175*sin(rad(A1 + F)) + 127*sin(rad(L - Mp)) - 115*sin(rad(L + Mp))
  local om = rad(125.04 - 1934.136*T)
  return mod(L + sl/1e6 - 0.00478*sin(om), 360), sb/1e6
end
local function unghiLunar(now) local l = lunaLonLat(now); return mod(l - longSoare(now), 360) end
local function gmst(now) return mod(280.46061837 + 360.98564736629 * ((now*1000 - J2000) / 864e5), 360) end
local function subsolar(now)
  local T = Tcen(now); local lam = rad(longSoare(now)); local eps = rad(23.4393 - 0.0130*T)
  local dec = math.asin(math.sin(eps)*math.sin(lam)) * 180/PI
  local ra = mod(math.atan2(math.cos(eps)*math.sin(lam), math.cos(lam)) * 180/PI, 360)
  return dec, mod(ra - gmst(now) + 180, 360) - 180
end
local function sublunar(now)
  local T = Tcen(now); local lamD, betD = lunaLonLat(now)
  local lam, bet, eps = rad(lamD), rad(betD), rad(23.4393 - 0.0130*T)
  local dec = math.asin(math.sin(bet)*math.cos(eps) + math.cos(bet)*math.sin(eps)*math.sin(lam)) * 180/PI
  local ra = mod(math.atan2(math.sin(lam)*math.cos(eps) - math.tan(bet)*math.sin(eps), math.cos(lam)) * 180/PI, 360)
  return dec, mod(ra - gmst(now) + 180, 360) - 180
end
-- exportate pentru test
function Astro(now) local d, l = subsolar(now); local d2, l2 = sublunar(now); return d, l, d2, l2, unghiLunar(now) end

-- ---------- desen ----------
local INK, SUN, MOON, FACE, RULE = "231,237,248", "242,162,75", "134,168,224", "16,27,48", "43,59,89"

local function fazaLuna(mx, my, r, u)
  local c = math.cos(rad(u)); local rx = math.max(0.4*SC, r*math.abs(c)*SC); local rr = r*SC
  local top = X(mx)..","..X(my - r)
  local bot = X(mx)..","..X(my + r)
  if u < 180 then
    return top.." | ArcTo "..bot..","..string.format("%.2f,%.2f",rr,rr)..",0,1,0 | ArcTo "..top..","..string.format("%.2f,%.2f",rx,rr)..",0,"..((c > 0) and 0 or 1)..",0 | ClosePath 1"
  else
    return top.." | ArcTo "..bot..","..string.format("%.2f,%.2f",rr,rr)..",0,0,0 | ArcTo "..top..","..string.format("%.2f,%.2f",rx,rr)..",0,"..((c > 0) and 1 or 0)..",0 | ClosePath 1"
  end
end

local function linie(a, r0, r1, col, w)   -- ac de la distanta r0 (negativ = coada) pana la r1
  local sx, sy = math.sin(rad(a)), -math.cos(rad(a))
  return "Line "..XY(220 + sx*r0, 220 + sy*r0)..","..XY(220 + sx*r1, 220 + sy*r1).." | StrokeWidth "..string.format("%.2f", w*SC).." | Stroke Color "..col.." | StrokeEndCap Round"
end

local ULTIMA = {night = -1, hrs = {}, zona = nil}
function Initialize()
  CoreInit()
  local m = tonumber(SKIN:GetVariable('Marime', '360')) or 360
  SC = m / 440
  for i = 0, 35 do
    local k = i - 17
    local x, y = P(198, zoneAng(k))
    SKIN:Bang('!SetOption', 'G'..i, 'X', X(x))
    SKIN:Bang('!SetOption', 'G'..i, 'Y', X(y))
    SKIN:Bang('!SetOption', 'G'..i, 'FontSize', string.format("%.1f", 9.5*SC*0.75))
  end
  SKIN:Bang('!SetOption', 'Centru', 'X', X(220)); SKIN:Bang('!SetOption', 'Centru', 'Y', X(220))
  SKIN:Bang('!SetOption', 'Centru', 'FontSize', string.format("%.1f", 9*SC*0.75))
end

function Update()
  local now = os.time()
  local S = Stare(now)
  Panou(S)
  local tu = now % 86400
  local zk = math.max(-17, math.min(18, S.fus)); if zk == -18 then zk = 18 end
  -- ore pe fusuri (se schimba o data pe ora noua)
  for i = 0, 35 do
    local k = i - 17
    local v = math.floor(((tu + 2400*k) % 86400) / 2400)
    if ULTIMA.hrs[i] ~= v then
      ULTIMA.hrs[i] = v
      SKIN:Bang('!SetOption', 'G'..i, 'Text', tostring(v))
      SKIN:Bang('!SetOption', 'G'..i, 'FontColor', v == 18 and SUN or INK)
      SKIN:Bang('!SetOption', 'G'..i, 'StringStyle', v == 18 and 'Bold' or 'Normal')
    end
  end
  -- umbra noptii, fusul locului, Luna: la 30 s
  local cheie = math.floor(now / 30)
  local dec, slon = subsolar(now)
  local ldec, llon = sublunar(now)
  if ULTIMA.night ~= cheie or ULTIMA.zona ~= zk then
    ULTIMA.night = cheie; ULTIMA.zona = zk
    local td = math.tan(rad(math.abs(dec) < 0.05 and (dec < 0 and -0.05 or 0.05) or dec))
    local pts = {}
    for lon = 0, 360, 3 do
      local lat = math.atan(-math.cos(rad(lon - slon)) / td) * 180 / PI
      lat = math.max(GLAT0, lat)
      local x, y = gproj(lat, lon)
      pts[#pts+1] = XY(x, y)
    end
    local cale = pts[1]
    for i = 2, #pts do cale = cale.." | LineTo "..pts[i] end
    cale = cale.." | ClosePath 1"
    SKIN:Bang('!SetOption', 'Noapte', 'NoapteP', cale)
    if dec >= 0 then
      SKIN:Bang('!SetOption', 'Noapte', 'Shape', "Ellipse "..XY(220,220)..","..X(GR).." | StrokeWidth 0")
      SKIN:Bang('!SetOption', 'Noapte', 'Shape2', "Path NoapteP | StrokeWidth 0")
      SKIN:Bang('!SetOption', 'Noapte', 'Shape3', "Combine Shape | Exclude Shape2 | Fill Color 2,6,15,128 | StrokeWidth 0")
    else
      SKIN:Bang('!SetOption', 'Noapte', 'Shape', "Path NoapteP | Fill Color 2,6,15,128 | StrokeWidth 0")
      SKIN:Bang('!SetOption', 'Noapte', 'Shape2', "")
      SKIN:Bang('!SetOption', 'Noapte', 'Shape3', "")
    end
    -- fusul locului, chenar
    local a0, a1 = zoneAng(zk) - 5, zoneAng(zk) + 5
    local z = {}
    for a = a0, a1, 1 do local x, y = P(208, a); z[#z+1] = XY(x, y) end
    for a = a1, a0, -1 do local x, y = P(168, a); z[#z+1] = XY(x, y) end
    local zc = z[1]
    for i = 2, #z do zc = zc.." | LineTo "..z[i] end
    SKIN:Bang('!SetOption', 'ZonaLoc', 'ZonaP', zc.." | ClosePath 1")
    -- Luna
    local mx, my = gproj(math.max(GLAT0, ldec), llon)
    local u = unghiLunar(now)
    SKIN:Bang('!SetOption', 'Luna', 'Shape',  "Ellipse "..XY(mx,my)..","..X(11).." | Fill Color 16,27,48,140 | StrokeWidth 0")
    SKIN:Bang('!SetOption', 'Luna', 'Shape2', "Ellipse "..XY(mx,my)..","..X(8).." | Fill Color 43,59,89,140 | StrokeWidth 0")
    SKIN:Bang('!SetOption', 'Luna', 'Shape3', "Path LunaP | Fill Color "..MOON.." | StrokeWidth 0")
    SKIN:Bang('!SetOption', 'Luna', 'Shape4', "Ellipse "..XY(mx,my)..","..X(8).." | Fill Color 0,0,0,0 | StrokeWidth 1 | Stroke Color "..MOON)
    SKIN:Bang('!SetOption', 'Luna', 'LunaP', fazaLuna(mx, my, 8, u))
    -- punctul subsolar si locul ales
    local sx, sy = gproj(dec, slon)
    SKIN:Bang('!SetOption', 'Subsolar', 'Shape',  "Ellipse "..XY(sx,sy)..","..X(5.5).." | Fill Color 0,0,0,0 | StrokeWidth 1.6 | Stroke Color "..SUN)
    SKIN:Bang('!SetOption', 'Subsolar', 'Shape2', "Ellipse "..XY(sx,sy)..","..X(1.6).." | Fill Color "..SUN.." | StrokeWidth 0")
    -- meridianul punctat pe care se afla Soarele (de la pol pana la marginea hartii)
    local ex, ey = gproj(GLAT0, slon)
    local n = 17
    for i = 0, n do
      local f = i / n
      local dx, dy = 220 + (ex - 220) * f, 220 + (ey - 220) * f
      SKIN:Bang('!SetOption', 'Meridian', i == 0 and 'Shape' or ('Shape'..(i+1)), "Ellipse "..XY(dx, dy)..","..string.format("%.2f", 1.5*SC).." | Fill Color 242,162,75,190 | StrokeWidth 0")
    end
    -- paralela punctata a punctului subsolar (cercul de latitudine: se mareste/micsoreaza cu declinatia)
    local rp = math.sqrt((sx - 220)^2 + (sy - 220)^2)
    for j = 0, 35 do
      local aj = rad(j * 10)
      SKIN:Bang('!SetOption', 'Meridian', 'Shape'..(19 + j), "Ellipse "..XY(220 + math.sin(aj)*rp, 220 - math.cos(aj)*rp)..","..string.format("%.2f", 1.2*SC).." | Fill Color 242,162,75,150 | StrokeWidth 0")
    end
    local px, py = gproj(math.max(GLAT0, LAT), S.lon)
    SKIN:Bang('!SetOption', 'Locul', 'Shape',  "Ellipse "..XY(px,py)..","..X(7).." | Fill Color 242,162,75,64 | StrokeWidth 0")
    SKIN:Bang('!SetOption', 'Locul', 'Shape2', "Ellipse "..XY(px,py)..","..X(3).." | Fill Color "..INK.." | StrokeWidth "..string.format("%.1f",1.2*SC).." | Stroke Color "..FACE)
  end
  -- acele (la fiecare secunda)
  local ah = tu / 240
  local tl = S.t
  local am = (tl % 2400) / 2400 * 360
  local as = (tl % 240) / 240 * 360
  local zA = zoneAng(zk)
  local shapes = {}
  -- Soarele mediu pe inel (cerc galben cu raze)
  local cx, cy = P(136, ah)
  shapes[#shapes+1] = "Ellipse "..XY(cx, cy)..","..X(7*0.85).." | Fill Color 247,195,46 | StrokeWidth "..string.format("%.2f",1.5*0.85*SC).." | Stroke Color 232,163,23"
  for i = 0, 7 do
    local a = rad(ah + i*45); local sa, ca = math.sin(a), -math.cos(a)
    shapes[#shapes+1] = "Line "..XY(cx + sa*9*0.85, cy + ca*9*0.85)..","..XY(cx + sa*13*0.85, cy + ca*13*0.85).." | StrokeWidth "..string.format("%.2f",1.4*0.85*SC).." | Stroke Color 247,195,46 | StrokeEndCap Round"
  end
  shapes[#shapes+1] = linie(zA, -10, 118, FACE, 6.6)
  shapes[#shapes+1] = "Path ArZ | Fill Color "..FACE.." | StrokeWidth "..string.format("%.2f", 2.2*SC).." | Stroke Color "..FACE
  shapes[#shapes+1] = linie(zA, -10, 118, "90,200,255", 3.8)
  shapes[#shapes+1] = "Path ArZ | Fill Color 90,200,255 | StrokeWidth 0"
  local za = rad(zA); local sx, sy = math.sin(za), -math.cos(za); local px2, py2 = -sy, sx
  local function pp(d, w) return XY(220 + sx*d + px2*w, 220 + sy*d + py2*w) end
  SKIN:Bang('!SetOption', 'Ace', 'ArZ', pp(136, 0).." | LineTo "..pp(114, -6.5).." | LineTo "..pp(114, 6.5).." | ClosePath 1")
  shapes[#shapes+1] = linie(am, -8, 156, INK, 2.6)
  shapes[#shapes+1] = linie(as, -12, 167, SUN, 1.9)
  shapes[#shapes+1] = "Ellipse "..XY(220,220)..","..X(9).." | Fill Color "..INK.." | StrokeWidth 0"
  for i = 1, #shapes do SKIN:Bang('!SetOption', 'Ace', i == 1 and 'Shape' or ('Shape'..i), shapes[i]) end
  SKIN:Bang('!UpdateMeter', '*')
  SKIN:Bang('!Redraw')
  return S.hn
end

-- protectie: o eroare de executie apare pe cadran (randul de sus) si in Log, in loc sa ramana "- -"
local _I, _U = Initialize, Update
function Initialize()
  local ok, e = pcall(_I)
  if not ok then print('TPU Initialize: ' .. tostring(e)); ERR_TXT = 'ERR ' .. tostring(e) end
end
function Update()
  local ok, r = pcall(_U)
  if ok then return r end
  print('TPU Update: ' .. tostring(r))
  SKIN:Bang('!SetOption', 'Ora', 'Text', 'ERR ' .. tostring(r):sub(1, 90))
  SKIN:Bang('!UpdateMeter', 'Ora'); SKIN:Bang('!Redraw')
  return 0
end
