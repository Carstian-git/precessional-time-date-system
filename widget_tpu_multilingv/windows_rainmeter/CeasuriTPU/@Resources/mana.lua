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

-- ============ CEASURILE DE MANA (36 h / 18 h) ============
local SC = 0.6
local C = 220 * SC
local function pt(a, r) local x = math.rad(a); return C + math.sin(x)*r*SC, C - math.cos(x)*r*SC end
local function g1(v) return string.format("%.2f", v) end

-- ac: poligon subtire cu coada; lung = lungimea spre varf, coada = lungimea spre spate, l = latimea
local function ac(a, lung, coada, l)
  local t = math.rad(a); local sx, sy = math.sin(t), -math.cos(t)
  local px, py = -sy, sx
  local function p(d, w) return C + (sx*d + px*w)*SC, C + (sy*d + py*w)*SC end
  local x1,y1 = p(-coada, -l); local x2,y2 = p(lung*0.9, -l*0.6)
  local x3,y3 = p(lung, 0);   local x4,y4 = p(lung*0.9, l*0.6)
  local x5,y5 = p(-coada, l)
  return g1(x1)..","..g1(y1).." | LineTo "..g1(x2)..","..g1(y2).." | LineTo "..g1(x3)..","..g1(y3).." | LineTo "..g1(x4)..","..g1(y4).." | LineTo "..g1(x5)..","..g1(y5).." | ClosePath 1"
end

local function luna(fr)
  local mx, my, r = 220*SC, 160*SC, 22*SC
  local c = math.cos(2*math.pi*fr)
  local rx = math.max(0.4, r*math.abs(c))
  local top = g1(mx)..","..g1(my-r)
  local bot = g1(mx)..","..g1(my+r)
  if fr < 0.5 then
    local sw = (fr < 0.25) and 0 or 1
    return top.." | ArcTo "..bot..","..g1(r)..","..g1(r)..",0,1,0 | ArcTo "..top..","..g1(rx)..","..g1(r)..",0,"..sw..",0 | ClosePath 1"
  else
    local sw = (fr < 0.75) and 0 or 1
    return top.." | ArcTo "..bot..","..g1(r)..","..g1(r)..",0,0,0 | ArcTo "..top..","..g1(rx)..","..g1(r)..",0,"..sw..",0 | ClosePath 1"
  end
end

local ULTIMA = ""
local MOD = 36
function Initialize()
  CoreInit()
  MOD = tonumber(SKIN:GetVariable('Mod', '36')) or 36
end

function Update()
  local now = os.time()
  local S = Stare(now)
  Panou(S)
  local t = S.t
  local per = (MOD == 36) and 86400 or 43200
  SKIN:Bang('!SetOption', 'AcOra', 'AcOraP', ac(t % per / per * 360, 108, 20, 6.5))
  SKIN:Bang('!SetOption', 'AcMin', 'AcMinP', ac((t % 2400) / 2400 * 360, 158, 22, 5))
  SKIN:Bang('!SetOption', 'AcSec', 'AcSecP', ac((t % 240) / 240 * 360, 131, 46, 1.6))
  local sx, sy = 284*SC, 222*SC
  local aa = math.rad((math.floor(t % 24)) * 15)
  SKIN:Bang('!SetOption', 'AcSS', 'Shape', "Line "..g1(sx)..","..g1(sy)..","..g1(sx + math.sin(aa)*16.5*SC)..","..g1(sy - math.cos(aa)*16.5*SC).." | StrokeWidth 1.2 | Stroke Color 217,83,30 | StrokeEndCap Round")
  local key = S.hn..'|'..S.zn..'|'..S.lc..'|'..math.floor(now/600)..'|'..S.T.moon
  if key ~= ULTIMA then
    ULTIMA = key
    SKIN:Bang('!SetOption', 'D1', 'Text', "ER "..S.er.." | AE "..S.ae)
    SKIN:Bang('!SetOption', 'D2', 'Text', txt((S.lc > 0) and (S.T.luna.." "..S.lc.." | "..S.T.ziua.." "..S.zn) or (S.T.ziua.." "..(364+S.zn))))
    SKIN:Bang('!SetOption', 'D3', 'Text', txt(S.zs))
    SKIN:Bang('!SetOption', 'LunaTxt', 'Text', txt(S.T.moon))
    local jd = now/86400 + 2440587.5
    local fr = ((jd - 2451550.1) / 29.530588853) % 1
    SKIN:Bang('!SetOption', 'LunaBg', 'LunaCale', luna(fr))
    if MOD == 18 then
      local half = (S.hn >= 1 and S.hn <= 18) and 1 or 2
      SKIN:Bang('!SetOption', 'Banda', 'Shape', "Ellipse "..g1(C)..","..g1(C)..","..g1((half==1 and 172 or 150)*SC).." | Fill Color 0,0,0,0 | StrokeWidth "..g1((half==1 and 24 or 20)*SC).." | Stroke Color 217,83,30,40")
      for i = 0, 17 do
        SKIN:Bang('!SetOption', 'HO'..i, 'FontColor', half==1 and '27,34,48' or '84,76,52')
        SKIN:Bang('!SetOption', 'HO'..i, 'FontSize', half==1 and 9.9 or 8.2)
        SKIN:Bang('!SetOption', 'HI'..i, 'FontColor', half==2 and '27,34,48' or '84,76,52')
        SKIN:Bang('!SetOption', 'HI'..i, 'FontSize', half==2 and 8.1 or 6.6)
        SKIN:Bang('!SetOption', 'HO'..i, 'StringStyle', half==1 and 'Bold' or 'Normal')
        SKIN:Bang('!SetOption', 'HI'..i, 'StringStyle', half==2 and 'Bold' or 'Normal')
      end
    end
  end
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
