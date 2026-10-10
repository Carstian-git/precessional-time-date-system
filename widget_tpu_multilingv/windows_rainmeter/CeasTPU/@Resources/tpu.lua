-- Ceas TPU pentru Rainmeter: port Lua al nucleului TPU (vezi tpu_mini.js)
local EPOCA, CICLU, AN_MEDIU, K_ANCORA = 15330, 25772, 365 + 1/4 - 1/128, 2441 - 2011
local LIMITE = {}
for j = 0, 12 do LIMITE[j] = math.floor(j * CICLU / 12) end
local L10N = {
  ro = {zile = {"Luni","Marți","Miercuri","Joi","Vineri","Sâmbătă","Duminică"}, luna = "Luna", ziua = "ziua", za = "Ziua anului", zb = "Ziua bisectă"},
  en = {zile = {"Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"}, luna = "Month", ziua = "day", za = "Year Day", zb = "Leap Day"},
  fr = {zile = {"lundi","mardi","mercredi","jeudi","vendredi","samedi","dimanche"}, luna = "Mois", ziua = "jour", za = "Jour de l'année", zb = "Jour bissextile"},
}
local function inceput(k) return EPOCA + 365*(k-1) + math.floor((k-1)/4) - math.floor((k-1)/128) end
local function anpz(z)
  local k = math.floor((z - EPOCA) / AN_MEDIU) + 1
  while z < inceput(k) do k = k - 1 end
  while z >= inceput(k+1) do k = k + 1 end
  return k
end
local function p2(n) return string.format("%02d", n) end
local CX, CY, R = 110, 110, 96
local function pt(a, r) local x = math.rad(a); return string.format('%.2f', CX + math.sin(x)*r), string.format('%.2f', CY - math.cos(x)*r) end

function Initialize()
  local lon = tonumber(SKIN:GetVariable('Longitudine', '26.1')) or 26.1
  LON = lon
  LANG = SKIN:GetVariable('Limba', 'ro')
  if not L10N[LANG] then LANG = 'ro' end
end

function Update()
  local ms = os.time()                       -- secunde UTC (epoca Unix)
  local fus = math.floor(LON/10 + 0.5)
  local loc = ms + fus*2400
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
  local sn = math.floor(r/24); local ss = r % 24
  local T = L10N[LANG]
  local zs = (lc > 0) and T.zile[(zn-1) % 7 + 1] or ((zn == 1) and T.za or T.zb)
  local data = ((lc > 0) and (zs.." · "..T.luna.." "..lc.." · "..T.ziua.." "..zn) or zs) .. " · ER "..er.." AE "..ae
  SKIN:Bang('!SetOption', 'Ora', 'Text', p2(hn)..":"..p2(mn)..":"..p2(sn)..":"..p2(ss))
  SKIN:Bang('!SetOption', 'Data', 'Text', data)
  local x, y = pt(t/86400*360, 62)
  SKIN:Bang('!SetOption', 'AcOra', 'Shape', 'Line '..CX..','..CY..','..x..','..y..' | StrokeWidth 5 | Stroke Color 255,138,107 | StrokeEndCap Round')
  x, y = pt((mn*240 + sn*24 + ss)/2400*360, 86)
  SKIN:Bang('!SetOption', 'AcMin', 'Shape', 'Line '..CX..','..CY..','..x..','..y..' | StrokeWidth 2 | Stroke Color 238,240,245 | StrokeEndCap Round')
  -- secundarul portocaliu: un tur pe minut nou (240 s)
  x, y = pt((sn*24 + ss)/240*360, 90)
  SKIN:Bang('!SetOption', 'AcSec', 'Shape', 'Line '..CX..','..CY..','..x..','..y..' | StrokeWidth 1 | Stroke Color 255,138,107 | StrokeEndCap Round')
  -- Rainmeter nu redesenează singur după !SetOption: actualizăm explicit contoarele
  SKIN:Bang('!UpdateMeter', 'Ora'); SKIN:Bang('!UpdateMeter', 'Data')
  SKIN:Bang('!UpdateMeter', 'AcOra'); SKIN:Bang('!UpdateMeter', 'AcMin'); SKIN:Bang('!UpdateMeter', 'AcSec')
  SKIN:Bang('!Redraw')
  return hn
end
