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

-- ============ CEASUL (cadran de 36 h cu o singura limba pe ora) ============
local CX, CY = 110, 110
local function pt(a, r) local x = math.rad(a); return CX + math.sin(x)*r, CY - math.cos(x)*r end

function Initialize() CoreInit() end

function Update()
  local S = Stare(os.time())
  Panou(S)
  local x, y = pt(S.t/86400*360, 62)
  SKIN:Bang('!SetOption', 'AcOra', 'Shape', 'Line '..CX..','..CY..','..f1(x)..','..f1(y)..' | StrokeWidth 5 | Stroke Color 255,138,107 | StrokeEndCap Round')
  x, y = pt((S.mn*240 + S.sn*24 + S.ss)/2400*360, 86)
  SKIN:Bang('!SetOption', 'AcMin', 'Shape', 'Line '..CX..','..CY..','..f1(x)..','..f1(y)..' | StrokeWidth 2 | Stroke Color 238,240,245 | StrokeEndCap Round')
  x, y = pt(((S.sn*24 + S.ss) % 240)/240*360, 94)
  local tx, ty = pt(((S.sn*24 + S.ss) % 240)/240*360, -18)
  SKIN:Bang('!SetOption', 'AcSec', 'Shape', 'Line '..f1(tx)..','..f1(ty)..','..f1(x)..','..f1(y)..' | StrokeWidth 1.5 | Stroke Color 255,170,60 | StrokeEndCap Round')
  local aa = math.rad(math.floor(S.t % 24) * 15)
  SKIN:Bang('!SetOption', 'AcSS', 'Shape', 'Line '..f1(110 - math.sin(aa)*3)..','..f1(150 + math.cos(aa)*3)..','..f1(110 + math.sin(aa)*14.5)..','..f1(150 - math.cos(aa)*14.5)..' | StrokeWidth 1.2 | Stroke Color 255,138,107 | StrokeEndCap Round')
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
