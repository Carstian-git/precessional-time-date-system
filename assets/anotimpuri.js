(function(){
/* ===== Nucleu: port JavaScript al sistem_timp.py (timpul in ms UTC) ===== */
const DAY = 864e5, J2000 = Date.UTC(2000, 0, 1, 12);
const EPOCA_DAY = Date.UTC(2011, 11, 22) / DAY;
const CICLU = 25772, N_ERE = 12;
const LIMITE = Array.from({length: 13}, (_, j) => Math.floor(j * CICLU / N_ERE));
const ANCORA_ET = 2441, K_ANCORA = ANCORA_ET - 2011;
const AN_MEDIU = 365 + 1 / 4 - 1 / 128;
const SS_ORA = 2400, SS_MIN = 240, SS_SEC = 24;
const NUME_ERE = [["Kumbha","Aquarius","Verseau"],["Makara","Capricorn","Capricorne"],["Dhanus","Sagittarius","Sagittaire"],
 ["Vṛścika","Scorpio","Scorpion"],["Tulā","Libra","Balance"],["Kanyā","Virgo","Vierge"],["Siṃha","Leo","Lion"],
 ["Karkaṭa","Cancer","Cancer"],["Mithuna","Gemini","Gémeaux"],["Vṛṣabha","Taurus","Taureau"],["Meṣa","Aries","Bélier"],["Mīna","Pisces","Poissons"]];
const ZILE_RO = ["Luni","Marți","Miercuri","Joi","Vineri","Sâmbătă","Duminică"];
const ZILE_SA = ["Somavāra","Maṅgalavāra","Budhavāra","Guruvāra","Śukravāra","Śanivāra","Ravivāra"];
const ZILE_EN = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
const ZILE_FR = ["lundi","mardi","mercredi","jeudi","vendredi","samedi","dimanche"];
const LUNI_SA = ["Prathama","Dvitīya","Tṛtīya","Caturtha","Pañcama","Ṣaṣṭha","Saptama","Aṣṭama","Navama","Daśama","Ekādaśa","Dvādaśa","Trayodaśa"];
const FAZE = ["nouă","semilună crescătoare","primul pătrar","gibbă crescătoare","plină","gibbă descrescătoare","ultimul pătrar","semilună descrescătoare"];

const UTCY = (y, m = 0, d = 1) => { const x = new Date(0); x.setUTCFullYear(y, m, d); return x.getTime(); };
const fdiv = (a, b) => Math.floor(a / b);
const mod = (a, n) => ((a % n) + n) % n;
const rad = d => d * Math.PI / 180;

function esteBisect(k) { return mod(k, 4) === 0 && mod(k, 128) !== 0; }
function inceputAn(k) { return EPOCA_DAY + 365 * (k - 1) + fdiv(k - 1, 4) - fdiv(k - 1, 128); }
function anPentruZi(zi) {
  let k = Math.floor((zi - EPOCA_DAY) / AN_MEDIU) + 1;
  while (zi < inceputAn(k)) k--;
  while (zi >= inceputAn(k + 1)) k++;
  return k;
}
function eraAeDinK(k) {
  const p = mod(k - K_ANCORA, CICLU);
  let j = 0; for (let i = 0; i < N_ERE; i++) if (LIMITE[i] <= p) j = i;
  return [j + 1, p - LIMITE[j] + 1];
}
function lungimeEra(er) { return LIMITE[er] - LIMITE[er - 1]; }
function campuriSolare(zi) {
  const k = anPentruZi(zi), n = zi - inceputAn(k) + 1, [er, ae] = eraAeDinK(k);
  const arc = Math.min(73, Math.floor((n - 1) / 5) + 1), za = n - 5 * (arc - 1);
  let lc, zn;
  if (n <= 364) { lc = Math.floor((n - 1) / 28) + 1; zn = (n - 1) % 28 + 1; } else { lc = 0; zn = n - 364; }
  return {k, n, er, ae, arc, za, lc, zn};
}
const fus = lon => Math.floor(lon / 10 + 0.5);
const decalajS = (lon, m) => m === "F" ? fus(lon) * SS_ORA : Math.round(lon * SS_MIN);

function yearFrac(ms) {
  const y = new Date(ms).getUTCFullYear();
  return y + Math.floor((ms - UTCY(y)) / DAY) / 365.25;
}
function deltaT(a) {
  if (a >= 2005 && a < 2050) { const t = a - 2000; return 62.92 + 0.32217 * t + 0.005589 * t * t; }
  const u = (a - 1820) / 100; return -20 + 32 * u * u;
}
function lunaNouaJde(k) {
  const T = k / 1236.85;
  const jde = 2451550.09766 + 29.530588861 * k + 0.00015437 * T ** 2 - 0.000000150 * T ** 3 + 0.00000000073 * T ** 4;
  const E = 1 - 0.002516 * T - 0.0000074 * T ** 2;
  const M = rad(mod(2.5534 + 29.10535670 * k - 0.0000014 * T ** 2 - 0.00000011 * T ** 3, 360));
  const Mp = rad(mod(201.5643 + 385.81693528 * k + 0.0107582 * T ** 2 + 0.00001238 * T ** 3 - 0.000000058 * T ** 4, 360));
  const F = rad(mod(160.7108 + 390.67050284 * k - 0.0016118 * T ** 2 - 0.00000227 * T ** 3 + 0.000000011 * T ** 4, 360));
  const Om = rad(mod(124.7746 - 1.56375588 * k + 0.0020672 * T ** 2 + 0.00000215 * T ** 3, 360));
  const s = Math.sin;
  const c = (-0.40720 * s(Mp) + 0.17241 * E * s(M) + 0.01608 * s(2 * Mp) + 0.01039 * s(2 * F)
    + 0.00739 * E * s(Mp - M) - 0.00514 * E * s(Mp + M) + 0.00208 * E * E * s(2 * M)
    - 0.00111 * s(Mp - 2 * F) - 0.00057 * s(Mp + 2 * F) + 0.00056 * E * s(2 * Mp + M)
    - 0.00042 * s(3 * Mp) + 0.00042 * E * s(M + 2 * F) + 0.00038 * E * s(M - 2 * F)
    - 0.00024 * E * s(2 * Mp - M) - 0.00017 * s(Om) - 0.00007 * s(Mp + 2 * M)
    + 0.00004 * s(2 * Mp - 2 * F) + 0.00004 * s(3 * M) + 0.00003 * s(Mp + M - 2 * F)
    + 0.00003 * s(2 * Mp + 2 * F) - 0.00003 * s(Mp + M + 2 * F) + 0.00003 * s(Mp - M + 2 * F)
    - 0.00002 * s(Mp - M - 2 * F) - 0.00002 * s(3 * Mp + M) + 0.00002 * s(4 * Mp));
  const A = [299.77 + 0.107408 * k - 0.009173 * T ** 2, 251.88 + 0.016321 * k, 251.83 + 26.651886 * k,
    349.42 + 36.412478 * k, 84.66 + 18.206239 * k, 141.74 + 53.303771 * k, 207.14 + 2.453732 * k,
    154.84 + 7.306860 * k, 34.52 + 27.261239 * k, 207.19 + 0.121824 * k, 291.34 + 1.844379 * k,
    161.72 + 24.198154 * k, 239.56 + 25.513099 * k, 331.55 + 3.592518 * k];
  const coef = [0.000325, 0.000165, 0.000164, 0.000126, 0.000110, 0.000062, 0.000060,
    0.000056, 0.000047, 0.000042, 0.000040, 0.000037, 0.000035, 0.000023];
  let sum = 0; for (let i = 0; i < 14; i++) sum += coef[i] * s(rad(A[i]));
  return jde + c + sum;
}
function lunaNoua(k) {
  const jdUtc = lunaNouaJde(k) - deltaT(2000 + k / 12.3685) / 86400;
  return J2000 + (jdUtc - 2451545.0) * DAY;
}
function k0Luna(ms) { return Math.floor((yearFrac(ms) - 2000) * 12.3685); }
function lunaNouaZiua1(ms, off) {
  const zi = Math.floor((ms + off * 1000) / DAY), k0 = k0Luna(ms);
  let best = -Infinity;
  for (let k = k0 - 2; k < k0 + 4; k++) { const c = lunaNoua(k); if (Math.floor((c + off * 1000) / DAY) <= zi && c > best) best = c; }
  return best;
}
function Tcen(ms) {
  const jd = 2451545.0 + (ms - J2000) / DAY;
  return (jd + deltaT(yearFrac(ms)) / 86400 - 2451545.0) / 36525;
}
function longitudineSoare(ms) {
  const T = Tcen(ms);
  const L0 = 280.46646 + 36000.76983 * T + 0.0003032 * T * T;
  const M = rad(357.52911 + 35999.05029 * T - 0.0001537 * T * T);
  const C = (1.914602 - 0.004817 * T - 0.000014 * T * T) * Math.sin(M) + (0.019993 - 0.000101 * T) * Math.sin(2 * M) + 0.000289 * Math.sin(3 * M);
  const om = rad(125.04 - 1934.136 * T);
  return mod(L0 + C - 0.00569 - 0.00478 * Math.sin(om), 360);
}
const LUNA_LON = [
 [0,0,1,0,6288774],[2,0,-1,0,1274027],[2,0,0,0,658314],[0,0,2,0,213618],[0,1,0,0,-185116],
 [0,0,0,2,-114332],[2,0,-2,0,58793],[2,-1,-1,0,57066],[2,0,1,0,53322],[2,-1,0,0,45758],
 [0,1,-1,0,-40923],[1,0,0,0,-34720],[0,1,1,0,-30383],[2,0,0,-2,15327],[0,0,1,2,-12528],
 [0,0,1,-2,10980],[4,0,-1,0,10675],[0,0,3,0,10034],[4,0,-2,0,8548],[2,1,-1,0,-7888],
 [2,1,0,0,-6766],[1,0,-1,0,-5163],[1,1,0,0,4987],[2,-1,1,0,4036],[2,0,2,0,3994],
 [4,0,0,0,3861],[2,0,-3,0,3665],[0,1,-2,0,-2689],[2,0,-1,2,-2602],[2,-1,-2,0,2390],
 [1,0,1,0,-2348],[2,-2,0,0,2236],[0,1,2,0,-2120],[0,2,0,0,-2069],[2,-2,-1,0,2048],
 [2,0,1,-2,-1773],[2,0,0,2,-1595],[4,-1,-1,0,1215],[0,0,2,2,-1110]];
const LUNA_LAT = [
 [0,0,0,1,5128122],[0,0,1,1,280602],[0,0,1,-1,277693],[2,0,0,-1,173237],[2,0,-1,1,55413],
 [2,0,-1,-1,46271],[2,0,0,1,32573],[0,0,2,1,17198],[2,0,1,-1,9266],[0,0,2,-1,8822],
 [2,-1,0,-1,8216],[2,0,-2,-1,4324],[2,0,1,1,4200],[2,1,0,-1,-3359],[2,-1,-1,1,2463],
 [2,-1,0,1,2211],[2,-1,-1,-1,2065],[0,1,-1,-1,-1870],[4,0,-1,-1,1828],[0,1,0,1,-1794],
 [0,0,0,3,-1749],[0,1,-1,1,-1565],[1,0,0,1,-1491],[0,1,1,1,-1475],[0,1,1,-1,-1410],
 [0,1,0,-1,-1344],[1,0,0,-1,-1335],[0,0,3,1,1107],[4,0,0,-1,1021],[4,0,-1,1,833]];
function lunaLonLat(ms) {
  const T = Tcen(ms);
  const L = 218.3164477 + 481267.88123421 * T - 0.0015786 * T ** 2 + T ** 3 / 538841 - T ** 4 / 65194000;
  const D = 297.8501921 + 445267.1114034 * T - 0.0018819 * T ** 2 + T ** 3 / 545868 - T ** 4 / 113065000;
  const M = 357.5291092 + 35999.0502909 * T - 0.0001536 * T ** 2 + T ** 3 / 24490000;
  const Mp = 134.9633964 + 477198.8675055 * T + 0.0087414 * T ** 2 + T ** 3 / 69699 - T ** 4 / 14712000;
  const F = 93.2720950 + 483202.0175233 * T - 0.0036539 * T ** 2 - T ** 3 / 3526000 + T ** 4 / 863310000;
  const E = 1 - 0.002516 * T - 0.0000074 * T ** 2;
  const A1 = 119.75 + 131.849 * T, A2 = 53.09 + 479264.290 * T, A3 = 313.45 + 481266.484 * T;
  const sin = Math.sin;
  let sl = 0; for (const [d, m, mp, f, c] of LUNA_LON) sl += c * E ** Math.abs(m) * sin(rad(d * D + m * M + mp * Mp + f * F));
  sl += 3958 * sin(rad(A1)) + 1962 * sin(rad(L - F)) + 318 * sin(rad(A2));
  let sb = 0; for (const [d, m, mp, f, c] of LUNA_LAT) sb += c * E ** Math.abs(m) * sin(rad(d * D + m * M + mp * Mp + f * F));
  sb += -2235 * sin(rad(L)) + 382 * sin(rad(A3)) + 175 * sin(rad(A1 - F)) + 175 * sin(rad(A1 + F)) + 127 * sin(rad(L - Mp)) - 115 * sin(rad(L + Mp));
  const om = rad(125.04 - 1934.136 * T);
  return [mod(L + sl / 1e6 - 0.00478 * sin(om), 360), sb / 1e6];
}
const unghiSolar = ms => mod(longitudineSoare(ms) - 270, 360);
const unghiLunar = ms => mod(lunaLonLat(ms)[0] - longitudineSoare(ms), 360);
const fazaUnghi = u => FAZE[Math.floor(mod(u + 22.5, 360) / 45)];

const EQ_A = [[485,324.96,1934.136],[203,337.23,32964.467],[199,342.08,20.186],[182,27.85,445267.112],
 [156,73.14,45036.886],[136,171.52,22518.443],[77,222.54,65928.934],[74,296.72,3034.906],
 [70,243.58,9037.513],[58,119.81,33718.147],[52,297.17,150.678],[50,21.02,2281.226],
 [45,247.54,29929.562],[44,325.15,31555.956],[29,60.93,4443.417],[18,155.12,67555.328],
 [17,288.79,4562.452],[16,198.04,62894.029],[14,199.76,31436.921],[12,95.39,14577.848],
 [12,287.11,31931.756],[12,320.81,34777.259],[9,227.73,1222.114],[8,15.45,16859.074]];
const EQ_JDE0 = [[2451623.80984,365242.37404,0.05169,-0.00411,-0.00057],[2451716.56767,365241.62603,0.00325,0.00888,-0.00030],
 [2451810.21715,365242.01767,-0.11575,0.00337,0.00078],[2451900.05952,365242.74049,-0.06223,-0.00823,0.00032]];
function evenimentSolar(an, idx) {
  const Y = (an - 2000) / 1000, c = EQ_JDE0[idx];
  const jde0 = c[0] + c[1] * Y + c[2] * Y ** 2 + c[3] * Y ** 3 + c[4] * Y ** 4;
  const T = (jde0 - 2451545.0) / 36525;
  const W = rad(35999.373 * T - 2.47);
  const dl = 1 + 0.0334 * Math.cos(W) + 0.0007 * Math.cos(2 * W);
  let S = 0; for (const [a, b, cc] of EQ_A) S += a * Math.cos(rad(b + cc * T));
  const jde = jde0 + 0.00001 * S / dl;
  const jdUtc = jde - deltaT(an + [0.2, 0.47, 0.73, 0.97][idx]) / 86400;
  return Math.floor((J2000 + (jdUtc - 2451545.0) * DAY) / 1000) * 1000;
}
function cadranReal(zi, off) {
  const fin = (zi + 1) * DAY - off * 1000, y = new Date(fin).getUTCFullYear();
  const cand = [[evenimentSolar(y - 1, 3), 1], [evenimentSolar(y, 0), 2], [evenimentSolar(y, 1), 3], [evenimentSolar(y, 2), 4], [evenimentSolar(y, 3), 1]];
  let best = null; for (const [t, c] of cand) if (t <= fin && (!best || t > best[0])) best = [t, c];
  return best[1];
}
const dif = (f, t, tinta) => mod(f(t) - tinta + 180, 360) - 180;
function fazeLunare(t0, t1) {
  const out = []; let t = t0, prev = unghiLunar(t0);
  while (t < t1) {
    const tn = t + 12 * 36e5, cur = unghiLunar(tn);
    if (Math.floor(cur / 90) !== Math.floor(prev / 90) && mod(cur - prev, 360) < 90) {
      const tinta = (Math.floor(cur / 90) * 90) % 360;
      let lo = t, hi = tn;
      for (let i = 0; i < 40; i++) { const mid = lo + (hi - lo) / 2; if (dif(unghiLunar, mid, tinta) < 0) lo = mid; else hi = mid; }
      out.push([Math.floor((hi + 500) / 1000) * 1000, tinta]);
    }
    prev = cur; t = tn;
  }
  return out;
}
/* fenomenele unui an gregorian: [ms, cod] cod S0..S3 (solstitiu dec, ech. martie, solst. iunie, ech. sept.), L0/L90/L180/L270 */
function evenimenteAn(an) {
  const ev = [[evenimentSolar(an, 0), "S1"], [evenimentSolar(an, 1), "S2"], [evenimentSolar(an, 2), "S3"], [evenimentSolar(an, 3), "S0"]];
  for (const [t, tinta] of fazeLunare(UTCY(an), UTCY(an + 1))) ev.push([t, "L" + tinta]);
  return ev.sort((a, b) => a[0] - b[0]);
}
function dinUtc(ms, lon, m) {
  const off = decalajS(lon, m), loc = ms + off * 1000, zi = Math.floor(loc / DAY);
  const r = campuriSolare(zi);
  const t = mod(Math.floor(loc / 1000), 86400);
  const hn = Math.floor(t / SS_ORA); let rest = t % SS_ORA;
  const mn = Math.floor(rest / SS_MIN); rest %= SS_MIN;
  const sn = Math.floor(rest / SS_SEC), ss = rest % SS_SEC;
  const nz = lunaNouaZiua1(ms, off);
  r.cl = zi - Math.floor((nz + off * 1000) / DAY) + 1;
  Object.assign(r, {hn, mn, sn, ss, lon, mod: m, fus: fus(lon), off, zi});
  r.cs = cadranReal(zi, off);
  r.unghiSolar = unghiSolar(ms); r.unghiLunar = unghiLunar(ms); r.faza = fazaUnghi(r.unghiLunar);
  r.ziSapt = r.lc ? (r.zn - 1) % 7 : null;
  return r;
}
const p2 = n => String(n).padStart(2, "0");
function cod(r) {
  const sg = r.fus >= 0 ? "+" : "-", suf = r.mod === "F" ? "F" + sg + p2(Math.abs(r.fus)) : "L" + (r.lon >= 0 ? "+" : "") + r.lon.toFixed(1);
  return `${r.er}-${String(r.ae).padStart(4, "0")}-${r.cs}-${p2(r.arc)}.${r.za}-${p2(r.cl)}-${p2(r.lc)}-${p2(r.zn)} ${p2(r.hn)}:${p2(r.mn)}:${p2(r.sn)}:${p2(r.ss)} ${suf}`;
}
if (false) module.exports = {dinUtc, cod, evenimenteAn, evenimentSolar, unghiSolar, unghiLunar, lunaNoua, inceputAn, eraAeDinK, LIMITE, esteBisect};

/* punctul subsolar (lat, lon, grade) pentru un moment UTC */
function subsolar(ms) {
  const T = Tcen(ms), lam = rad(longitudineSoare(ms)), eps = rad(23.4393 - 0.0130 * T);
  const dec = Math.asin(Math.sin(eps) * Math.sin(lam)) * 180 / Math.PI;
  const ra = mod(Math.atan2(Math.cos(eps) * Math.sin(lam), Math.cos(lam)) * 180 / Math.PI, 360);
  const gmst = mod(280.46061837 + 360.98564736629 * ((ms - J2000) / DAY), 360);
  return {lat: dec, lon: mod(ra - gmst + 180, 360) - 180};
}

function sublunar(ms) {
  const T = Tcen(ms), [lamD, betD] = lunaLonLat(ms), lam = rad(lamD), bet = rad(betD), eps = rad(23.4393 - 0.0130 * T);
  const dec = Math.asin(Math.sin(bet) * Math.cos(eps) + Math.cos(bet) * Math.sin(eps) * Math.sin(lam)) * 180 / Math.PI;
  const ra = mod(Math.atan2(Math.sin(lam) * Math.cos(eps) - Math.tan(bet) * Math.sin(eps), Math.cos(lam)) * 180 / Math.PI, 360);
  const gmst = mod(280.46061837 + 360.98564736629 * ((ms - J2000) / DAY), 360);
  return {lat: dec, lon: mod(ra - gmst + 180, 360) - 180};
}

/* conversie inversă: ER, AE, LC, ZN + timp nou -> ms UTC; aruncă {e: cheie, a: argumente} */
function inUtc(er, ae, lc, zn, hn, mn, sn, ss, lon, m, ciclu) {
  const ints = [er, ae, lc, zn, hn, mn, sn, ss, ciclu];
  if (ints.some(x => !Number.isInteger(x))) throw {e: "time"};
  if (er < 1 || er > N_ERE) throw {e: "era"};
  if (ae < 1 || ae > lungimeEra(er)) throw {e: "ae", a: [er, lungimeEra(er)]};
  if (hn < 0 || hn > 35 || mn < 0 || mn > 9 || sn < 0 || sn > 9 || ss < 0 || ss > 23) throw {e: "time"};
  const k = K_ANCORA - CICLU + LIMITE[er - 1] + ae - 1 + ciclu * CICLU;
  let n;
  if (lc === 0) { if (zn !== 1 && zn !== 2) throw {e: "lc"}; if (zn === 2 && !esteBisect(k)) throw {e: "leap"}; n = 364 + zn; }
  else if (lc >= 1 && lc <= 13 && zn >= 1 && zn <= 28) n = (lc - 1) * 28 + zn;
  else throw {e: "lc"};
  if (k < 1 - 2011 || k > 9998 - 2011) throw {e: "range"};
  const zi = inceputAn(k) + n - 1;
  return zi * DAY + (hn * SS_ORA + mn * SS_MIN + sn * SS_SEC + ss) * 1000 - decalajS(lon, m) * 1000;
}
const TIPAR = /^\s*(\d{1,2})-(\d{4})-(\d)-(\d{2})\.(\d)-(\d{2})-(\d{2})-(\d{2}) (\d{2}):(\d{1,2}):(\d{1,2}):(\d{2}) ([FL])([+-−]\d+(?:\.\d+)?)\s*$/;
function parseCod(text) {
  const m = TIPAR.exec(text.replace("−", "-"));
  if (!m) return null;
  const v = m.slice(1, 13).map(Number), val = parseFloat(m[14].replace("−", "-"));
  return {er: v[0], ae: v[1], cs: v[2], arc: v[3], za: v[4], cl: v[5], lc: v[6], zn: v[7], hn: v[8], mn: v[9], sn: v[10], ss: v[11], mod: m[13], lon: m[13] === "F" ? val * 10 : val};
}

/* ===== Interfață ===== */
const $ = id => document.getElementById(id);
const CX = 200, CY = 200;
const P = (cx, cy, r, a) => [cx + r * Math.sin(rad(a)), cy - r * Math.cos(rad(a))];
const f1 = n => n.toFixed(1);
const f2 = n => n.toFixed(2).replace(".", ",");
const ro = (n, d) => n.toFixed(d).replace(".", t("dec"));
const phaseName = u => t("phases")[Math.floor(mod(u + 22.5, 360) / 45)];
function arcPath(cx, cy, r1, r2, a1, a2) {
  const [x1, y1] = P(cx, cy, r2, a1), [x2, y2] = P(cx, cy, r2, a2), [x3, y3] = P(cx, cy, r1, a2), [x4, y4] = P(cx, cy, r1, a1);
  const lg = (a2 - a1) > 180 ? 1 : 0;
  return `M${f1(x1)} ${f1(y1)}A${r2} ${r2} 0 ${lg} 1 ${f1(x2)} ${f1(y2)}L${f1(x3)} ${f1(y3)}A${r1} ${r1} 0 ${lg} 0 ${f1(x4)} ${f1(y4)}Z`;
}
function tick(cx, cy, r1, r2, a, w, cls) {
  const [x1, y1] = P(cx, cy, r1, a), [x2, y2] = P(cx, cy, r2, a);
  return `<line x1="${f1(x1)}" y1="${f1(y1)}" x2="${f1(x2)}" y2="${f1(y2)}" stroke="${cls || "var(--ink)"}" stroke-width="${w}" stroke-linecap="round"/>`;
}
function txt(cx, cy, r, a, s, size, cls, extra) {
  const [x, y] = P(cx, cy, r, a);
  return `<text x="${f1(x)}" y="${f1(y)}" font-size="${size}" text-anchor="middle" dominant-baseline="central" class="${cls || ""}" ${extra || ""}>${s}</text>`;
}

/* Pagina Anotimpuri: roata anului, solstiții și echinocții, declinația Soarelui și durata zilei. Texte din #an-data. Calcule: Meeus, ca în nucleul sistemului. */
const D = JSON.parse(document.getElementById("an-data").textContent);
const num = (x, d) => x.toFixed(d).replace(".", D.dec);
const pad = n => String(n).padStart(2, "0");
const lonSoare = longitudineSoare, ang = lon => mod(lon - 270, 360); /* unghi solar: 0° la solstițiul din decembrie */
const sunAng = t => ang(lonSoare(t));
const fmtDay = ms => { const d = new Date(ms); return `${pad(d.getUTCDate())}.${pad(d.getUTCMonth() + 1)}.${d.getUTCFullYear()}`; };
const hhmm = ms => { const d = new Date(ms); return `${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}`; };
const isTPU = () => $("an-mon").value === "tpu";
const fusSel = () => parseInt($("an-fus").value, 10) || 0;
const fusLab = () => { const k = fusSel(); return "F" + (k >= 0 ? "+" : "−") + pad(Math.abs(k)); };
function tpu(ms) { const r = dinUtc(ms, fusSel() * 10, "F"); return {r, date: `ER ${r.er} · AE ${r.ae} · ${r.lc ? r.lc + "/" + r.zn : D.yearDay + " " + r.zn}`, time: `${pad(r.hn)}:${pad(r.mn)}`, short: r.lc ? `${r.lc}/${r.zn}` : `${D.yearDay} ${r.zn}`}; }
const dateTxt = ms => isTPU() ? tpu(ms).date : fmtDay(ms);
const timeTxt = ms => isTPU() ? `${tpu(ms).time} ${fusLab()}` : `${hhmm(ms)} ${D.utc}`;
const shortTxt = ms => { if (isTPU()) return tpu(ms).short; const d = new Date(ms); return `${pad(d.getUTCDate())}.${pad(d.getUTCMonth() + 1)}`; };
const latSel = () => Math.max(-89, Math.min(89, parseFloat($("an-lat").value) || 0));
const hemS = () => $("an-hem").value === "S";
const seasName = q => D.seas[(q + (hemS() ? 2 : 0)) % 4];
const COL = ["#6c8ebf", "#6a9a5b", "#d99a2b", "#b5683c"]; /* iarnă, primăvară, vară, toamnă (emisfera nordică; sudul le rotește) */
const colOf = q => COL[(q + (hemS() ? 2 : 0)) % 4];

/* ---------- date astronomice ---------- */
const evCache = {};
const events = an => evCache[an] || (evCache[an] = [evenimentSolar(an - 1, 3), evenimentSolar(an, 0), evenimentSolar(an, 1), evenimentSolar(an, 2), evenimentSolar(an, 3), evenimentSolar(an + 1, 0)]);
const evQuad = i => i % 4; /* 0 = solstițiul din decembrie, 1 = echinocțiul din martie, 2 = solstițiul din iunie, 3 = echinocțiul din septembrie, 4 = decembrie (anul următor) */
const decOf = t => subsolar(t).lat;
function dayLen(lat, dec) {
  const p = rad(lat), d = rad(dec), c = (Math.sin(rad(-0.833)) - Math.sin(p) * Math.sin(d)) / (Math.cos(p) * Math.cos(d));
  return c >= 1 ? 0 : c <= -1 ? 24 : 2 * Math.acos(c) * 180 / Math.PI / 15;
}
/* ecuația timpului (min): timp solar adevărat − timp solar mediu, din longitudinea subsolară */
function eot(ms) { const d = new Date(ms), h = d.getUTCHours() + d.getUTCMinutes() / 60 + d.getUTCSeconds() / 3600, w = 15 * (12 - h) - subsolar(ms).lon; return 4 * (mod(w + 180, 360) - 180); }
const lonSel = () => Math.max(-180, Math.min(180, parseFloat($("an-lon").value) || 0));
const serCache = {};
function series(an, lat) {
  const key = an + "|" + lat; if (serCache[key]) return serCache[key];
  const a = UTCY(an), n = Math.round((UTCY(an + 1) - a) / DAY), out = [];
  for (let i = 0; i < n; i++) { const t = a + i * DAY + 12 * 36e5, dec = decOf(t); out.push([t, dec, dayLen(lat, dec)]); }
  return serCache[key] = out;
}
const tickCache = {};
function calTicks(an) {
  const key = an + "|" + isTPU() + "|" + (isTPU() ? fusSel() : 0);
  if (tickCache[key]) return tickCache[key];
  const o = {m: [], w: [], d: []}, a = UTCY(an), b = UTCY(an + 1);
  if (!isTPU()) {
    for (let t = a; t < b; t += DAY) { const dt = new Date(t), ag = sunAng(t); o.d.push(ag); if (dt.getUTCDay() === 1) o.w.push(ag); if (dt.getUTCDate() === 1) o.m.push([ag, String(dt.getUTCMonth() + 1), t]); }
  } else {
    const off = fusSel() * 2400 * 1000;
    for (let zi = Math.floor((a + off) / DAY); zi <= Math.floor((b + off) / DAY); zi++) {
      const t = zi * DAY - off; if (t < a || t >= b) continue;
      const r = campuriSolare(zi), ag = sunAng(t); o.d.push(ag);
      if (r.lc) { if ((r.zn - 1) % 7 === 0) o.w.push(ag); if (r.zn === 1) o.m.push([ag, String(r.lc), t]); }
    }
  }
  return tickCache[key] = o;
}

/* ---------- starea ---------- */
let Y = 2026, TC = Date.now(), timer = null, last = 0, daysShown = false;
const doy = t => Math.floor((t - UTCY(new Date(t).getUTCFullYear())) / DAY) + 1;
const seasonOf = t => { const a = sunAng(t); return Math.floor(a / 90); };
const showDays = () => $("an-ring").getBoundingClientRect().width >= 440;

/* ---------- cadranul 1: roata anului ---------- */
const CR = 180;
function renderRing() {
  daysShown = showDays();
  const c = CR, T = calTicks(Y);
  let s = `<circle cx="${c}" cy="${c}" r="198" fill="var(--face)" stroke="var(--ink)" stroke-width="1.4"/>`;
  for (let q = 0; q < 4; q++) {
    s += `<path d="${arcPath(c, c, 100, 164, q * 90, q * 90 + 90)}" fill="${colOf(q)}" opacity=".30" stroke="var(--face)" stroke-width="1"/>`;
    s += txt(c, c, 146, q * 90 + 45, seasName(q), 11, "", 'font-weight="600" fill="var(--ink)"');
  }
  s += `<circle cx="${c}" cy="${c}" r="100" fill="none" stroke="var(--rule)"/><circle cx="${c}" cy="${c}" r="164" fill="none" stroke="var(--ink)" stroke-width="1"/>`;
  const line = (r1, r2, ags) => { let p = ""; for (const a of ags) { const [x1, y1] = P(c, c, r1, a), [x2, y2] = P(c, c, r2, a); p += `M${f1(x1)} ${f1(y1)}L${f1(x2)} ${f1(y2)}`; } return p; };
  if (daysShown) s += `<path d="${line(168, 171, T.d)}" stroke="var(--mute)" stroke-width=".5" fill="none"/>`;
  s += `<path d="${line(168, 175, T.w)}" stroke="var(--mute)" stroke-width=".9" fill="none"/><path d="${line(168, 181, T.m.map(x => x[0]))}" stroke="var(--ink)" stroke-width="1.5" fill="none"/>`;
  for (const [a, lab] of T.m) s += txt(c, c, 190, a + 3, lab, 9.5, "mute");
  /* cele patru repere: solstiții și echinocții, cu data lor */
  const ev = events(Y);
  for (let q = 0; q < 4; q++) {
    const t = q === 0 ? ev[4] : ev[q], inY = t >= UTCY(Y) && t < UTCY(Y + 1), tt = inY ? t : (q === 0 ? ev[0] : t);
    s += tick(c, c, 100, 198, q * 90, 1.8, "var(--ink)");
    s += txt(c, c, 118, q * 90, shortTxt(inY ? t : tt), 9, "", 'fill="var(--ink)" stroke="var(--face)" stroke-width="3" paint-order="stroke"');
  }
  s += `<g id="an-ring-cur"></g>`;
  $("an-ring").innerHTML = s;
  renderCursor();
}
function renderCursor() {
  const c = CR, a = sunAng(TC), [x, y] = P(c, c, 164, a), q = seasonOf(TC);
  let s = `<line x1="${c}" y1="${c}" x2="${f1(x)}" y2="${f1(y)}" stroke="var(--sun)" stroke-width="1.4" opacity=".85"/><circle cx="${f1(x)}" cy="${f1(y)}" r="10" fill="var(--sun)" stroke="var(--face)" stroke-width="1.6"/><text x="${f1(x)}" y="${f1(y + .5)}" font-size="13" text-anchor="middle" dominant-baseline="central" style="fill:#fff" pointer-events="none">☉</text>`;
  s += `<text x="${c}" y="${c - 10}" font-size="22" text-anchor="middle" fill="var(--ink)" font-weight="500">${Y}</text>`;
  s += `<text x="${c}" y="${c + 8}" font-size="10.5" text-anchor="middle" fill="var(--ink)">${dateTxt(TC)}</text>`;
  s += `<text x="${c}" y="${c + 24}" font-size="10.5" text-anchor="middle" fill="${colOf(q)}" font-weight="600">${seasName(q)}</text>`;
  $("an-ring-cur").innerHTML = s;
  const ev = events(Y), i = q === 0 && TC < ev[1] ? 0 : q === 0 ? 4 : q; /* începutul anotimpului curent */
  const t0 = i === 4 ? ev[4] : ev[i], t1 = i === 4 ? evenimentSolar(Y + 1, 0) : ev[i + 1], dur = (t1 - t0) / DAY, gone = (TC - t0) / DAY;
  $("an-r").innerHTML =
    `<div class="big">${dateTxt(TC)} · ${seasName(q)}</div>` +
    `<div class="small">${isTPU() ? tpuInfo(TC) : D.doy.replace("{n}", doy(TC)).replace("{m}", UTCY(Y + 1) - UTCY(Y) > 365 * DAY ? 366 : 365)}</div>` +
    `<div class="small">${D.began}: ${dateTxt(t0)} · ${timeTxt(t0)}</div>` +
    `<div class="small">${D.lasts.replace("{d}", num(dur, 2))} · ${D.passed.replace("{a}", num(gone, 1)).replace("{b}", num(dur - gone, 1))}</div>` +
    `<div class="small">${D.sunLon}: ${num(mod(lonSoare(TC), 360), 1)}° · ${D.sunAng}: ${num(a, 1)}°</div>`;
}
function tpuInfo(t) { const r = tpu(t).r; return `${r.lc ? D.monthL + " " + r.lc + ", " + D.dayL + " " + r.zn : D.yearDay + " " + r.zn}`; }

/* ---------- cadranul 2: declinația și durata zilei ---------- */
const CW = 440, CH = 348, X0 = 46, X1 = 394, Y0 = 26, Y1 = 262;
function renderChart() {
  const lat = latSel(), S = series(Y, lat), a = UTCY(Y), b = UTCY(Y + 1), n = S.length;
  const X = t => X0 + (t - a) / (b - a) * (X1 - X0), yD = d => Y1 - (d + 25) / 50 * (Y1 - Y0), yH = h => Y1 - h / 24 * (Y1 - Y0), tpuM = isTPU();
  let s = `<rect x="${X0}" y="${Y0}" width="${X1 - X0}" height="${Y1 - Y0}" fill="var(--face)" stroke="var(--rule)"/>`;
  for (const d of [-20, -10, 0, 10, 20]) s += `<line x1="${X0}" x2="${X1}" y1="${f1(yD(d))}" y2="${f1(yD(d))}" stroke="var(--rule)" ${d ? 'stroke-dasharray="2 3"' : 'stroke-width="1.2"'}/><text x="${X0 - 5}" y="${f1(yD(d))}" font-size="10.5" text-anchor="end" dominant-baseline="central" style="fill:#c0701a">${d > 0 ? "+" : d < 0 ? "−" : ""}${Math.abs(d)}°</text>`;
  for (const h of [0, 6, 12, 18, 24]) s += `<text x="${X1 + 5}" y="${f1(yH(h))}" font-size="10.5" dominant-baseline="central" style="fill:#3a5fb0">${tpuM ? h * 1.5 : h}</text>`;
  for (const [, lab, t] of calTicks(Y).m) s += `<line x1="${f1(X(t))}" x2="${f1(X(t))}" y1="${Y1}" y2="${Y1 + 5}" stroke="var(--ink)"/><text x="${f1(X(t) + 3)}" y="${Y1 + 15}" font-size="9.5" class="mute">${lab}</text>`;
  const ev = events(Y);
  for (let i = 1; i <= 4; i++) { const t = ev[i]; if (t < a || t >= b) continue; s += `<line x1="${f1(X(t))}" x2="${f1(X(t))}" y1="${Y0}" y2="${Y1}" stroke="var(--ink)" stroke-opacity=".5" stroke-dasharray="4 3"/><text x="${f1(X(t))}" y="${Y0 - 6}" font-size="9.5" text-anchor="middle" fill="var(--ink)">${shortTxt(t)}</text>`; }
  let pd = "", ph = ""; S.forEach((p, i) => { pd += (i ? "L" : "M") + f1(X(p[0])) + " " + f1(yD(p[1])); ph += (i ? "L" : "M") + f1(X(p[0])) + " " + f1(yH(p[2])); });
  s += `<path d="${ph}" fill="none" stroke="#3a5fb0" stroke-width="2"/><path d="${pd}" fill="none" stroke="#c0701a" stroke-width="2"/>`;
  s += `<text x="${X0}" y="${CH - 46}" font-size="11" style="fill:#c0701a">━ ${D.decL}</text><text x="${X0}" y="${CH - 30}" font-size="11" style="fill:#3a5fb0">━ ${D.dayLenL} (${tpuM ? D.newH : D.hours}), ${D.latL} ${num(lat, 1)}°</text>`;
  s += `<text x="${X0}" y="${CH - 12}" font-size="10.5" class="mute">${D.xNote}</text><g id="an-chart-cur"></g>`;
  $("an-chart").innerHTML = s;
  renderChartCursor();
}
function renderChartCursor() {
  const lat = latSel(), S = series(Y, lat), a = UTCY(Y), b = UTCY(Y + 1), X = t => X0 + (t - a) / (b - a) * (X1 - X0), yD = d => Y1 - (d + 25) / 50 * (Y1 - Y0), yH = h => Y1 - h / 24 * (Y1 - Y0);
  const i = Math.max(0, Math.min(S.length - 1, Math.floor((TC - a) / DAY))), [t, dec, dl] = S[i], x = X(Math.max(a, Math.min(b, TC)));
  $("an-chart-cur").innerHTML = `<line x1="${f1(x)}" x2="${f1(x)}" y1="${Y0}" y2="${Y1}" stroke="var(--sun)" stroke-width="1.6"/><circle cx="${f1(x)}" cy="${f1(yD(dec))}" r="4.5" fill="#c0701a" stroke="var(--face)" stroke-width="1.4"/><circle cx="${f1(x)}" cy="${f1(yH(dl))}" r="4.5" fill="#3a5fb0" stroke="var(--face)" stroke-width="1.4"/>`;
  const alt = 90 - Math.abs(lat - dec), nh = dl * 1.5, hm = h => `${Math.floor(h)}:${pad(Math.floor(h % 1 * 60))}`, hn = h => `${Math.floor(h)}:${pad(Math.floor(h % 1 * 60))}`;
  $("an-c").innerHTML =
    `<div class="big">${dateTxt(t)}</div>` +
    `<div class="small">${D.decL}: ${dec >= 0 ? "+" : "−"}${num(Math.abs(dec), 2)}°</div>` +
    `<div class="small">${D.dayLenL}: ${isTPU() ? hn(nh) + " " + D.newH + " (HN:MN)" : hm(dl) + " " + D.hours + " (h:min)"}</div>` +
    `<div class="small">${D.noonAlt}: ${num(Math.max(0, alt), 1)}° · ${D.latL} ${num(lat, 1)}°</div>` +
    (dl === 0 ? `<div class="small">${D.polarNight}</div>` : dl === 24 ? `<div class="small">${D.polarDay}</div>` : "");
  $("an-day").value = i;
}

/* ---------- tabelul evenimentelor ---------- */
/* ---------- cadranul 3: analema ---------- */
const AW = 440, AH = 400, AX0 = 60, AX1 = 400, AY0 = 24, AY1 = 330;
function renderAnalema() {
  const a = UTCY(Y), n = Math.round((UTCY(Y + 1) - a) / DAY), pts = [], xE = e => (AX0 + AX1) / 2 + e * (AX1 - AX0) / 2 / 20, yD = d => AY1 - (d + 25) / 50 * (AY1 - AY0);
  for (let i = 0; i < n; i++) { const t = a + i * DAY + 12 * 36e5; pts.push([t, eot(t), decOf(t)]); }
  let s = `<rect x="${AX0}" y="${AY0}" width="${AX1 - AX0}" height="${AY1 - AY0}" fill="var(--face)" stroke="var(--rule)"/>`;
  for (const d of [-20, -10, 0, 10, 20]) s += `<line x1="${AX0}" x2="${AX1}" y1="${f1(yD(d))}" y2="${f1(yD(d))}" stroke="var(--rule)" ${d ? 'stroke-dasharray="2 3"' : ""}/><text x="${AX0 - 5}" y="${f1(yD(d))}" font-size="10.5" text-anchor="end" dominant-baseline="central" style="fill:#c0701a">${d > 0 ? "+" : d < 0 ? "−" : ""}${Math.abs(d)}°</text>`;
  for (const e of [-15, -10, -5, 0, 5, 10, 15]) s += `<line x1="${f1(xE(e))}" x2="${f1(xE(e))}" y1="${AY0}" y2="${AY1}" stroke="var(--rule)" ${e ? 'stroke-dasharray="2 3"' : ""}/><text x="${f1(xE(e))}" y="${AY1 + 14}" font-size="10.5" text-anchor="middle" class="mute">${e > 0 ? "+" : e < 0 ? "−" : ""}${Math.abs(e)}</text>`;
  s += `<text x="${(AX0 + AX1) / 2}" y="${AY1 + 30}" font-size="11" text-anchor="middle" class="mute">${D.eotL} (${D.min})</text>`;
  let d = ""; pts.forEach((p, i) => d += (i ? "L" : "M") + f1(xE(p[1])) + " " + f1(yD(p[2]))); s += `<path d="${d}" fill="none" stroke="var(--ink)" stroke-width="2"/>`;
  const ev = events(Y);
  for (let i = 1; i <= 4; i++) { const t = ev[i]; if (t < a || t >= b0(a)) continue; const e = eot(t), dd = decOf(t); s += `<circle cx="${f1(xE(e))}" cy="${f1(yD(dd))}" r="3.5" fill="var(--face)" stroke="var(--ink)" stroke-width="1.5"/><text x="${f1(xE(e) + (i % 2 ? 7 : -7))}" y="${f1(yD(dd) - 6)}" font-size="9.5" text-anchor="${i % 2 ? "start" : "end"}" fill="var(--ink)">${shortTxt(t)}</text>`; }
  s += `<g id="an-an-cur"></g>`; $("an-analema").innerHTML = s; renderAnalemaCursor();
}
const b0 = a => UTCY(new Date(a).getUTCFullYear() + 1);
function renderAnalemaCursor() {
  const xE = e => (AX0 + AX1) / 2 + e * (AX1 - AX0) / 2 / 20, yD = d => AY1 - (d + 25) / 50 * (AY1 - AY0);
  const t = UTCY(Y) + Math.max(0, Math.min(Math.round((UTCY(Y + 1) - UTCY(Y)) / DAY) - 1, Math.floor((TC - UTCY(Y)) / DAY))) * DAY + 12 * 36e5, e = eot(t), dd = decOf(t);
  $("an-an-cur").innerHTML = `<circle cx="${f1(xE(e))}" cy="${f1(yD(dd))}" r="7" fill="var(--sun)" stroke="var(--face)" stroke-width="1.6"/>`;
  const lon = lonSel(), noon = t - 12 * 36e5 + 12 * 36e5 - lon * 240000 - e * 60000, mean = t - lon * 240000, ab = e;
  const hm = ms => isTPU() ? timeTxt(ms) : `${hhmm(ms)} ${D.utc}`;
  $("an-a").innerHTML = `<div class="big">${dateTxt(t)}</div>` +
    `<div class="small">${D.eotL}: ${ab >= 0 ? "+" : "−"}${Math.floor(Math.abs(ab))} ${D.min} ${pad(Math.round(Math.abs(ab) % 1 * 60))} ${D.sec} · ${ab >= 0 ? D.fast : D.slow}</div>` +
    `<div class="small">${D.decL}: ${dd >= 0 ? "+" : "−"}${num(Math.abs(dd), 2)}°</div>` +
    `<div class="small">${D.meanNoon} (${D.lonL} ${num(lon, 1)}°): ${hm(mean)}</div>` +
    `<div class="small">${D.trueNoon}: ${hm(noon)}</div>`;
}
function renderTable() {
  const ev = events(Y); let rows = "";
  for (let i = 0; i < 5; i++) {
    const t = ev[i], nxt = i < 4 ? ev[i + 1] : evenimentSolar(Y + 1, 0), q = i % 4 === 0 ? 0 : i, dur = (nxt - t) / DAY;
    rows += `<tr class="${i === 0 || i === 4 ? "poss" : ""}"><td>${D.evN[i % 4]}${i === 0 ? " (" + (Y - 1) + ")" : i === 4 ? " (" + Y + ")" : ""}</td><td>${fmtDay(t)} · ${hhmm(t)} ${D.utc}</td><td>${tpu(t).date} · ${tpu(t).time} ${fusLab()}</td><td>${seasName(q)}</td><td>${num(dur, 2)}</td><td>${num(dur / 7, 2)}</td></tr>`;
  }
  $("an-body").innerHTML = rows; $("an-thT").textContent = `${D.thTPU} ${fusLab()}`;
}
function renderAll() { renderRing(); renderChart(); renderAnalema(); renderTable(); }
function setYear(y) { Y = Math.max(1900, Math.min(2200, y || 2026)); $("an-y").value = Y; const n = new Date().getUTCFullYear(); TC = Y === n ? Date.now() : UTCY(Y, 5, 21) ; renderAll(); }
function setDay(i) { TC = UTCY(Y) + i * DAY + 12 * 36e5; renderCursor(); renderChartCursor(); renderAnalemaCursor(); }
function stop() { if (timer) { cancelAnimationFrame(timer); timer = null; } $("an-play").textContent = "▶ " + D.play; }
function frame(ts) {
  if (!timer) return;
  const dt = Math.min(.1, (ts - last) / 1000); last = ts; TC += dt * parseFloat($("an-sp").value) * DAY;
  if (TC >= UTCY(Y + 1)) { if (Y >= 2200) { stop(); return; } Y++; $("an-y").value = Y; const c = TC; renderAll(); TC = c; }
  renderCursor(); renderChartCursor(); renderAnalemaCursor();
  timer = requestAnimationFrame(frame);
}
function play() { if (timer) { stop(); return; } $("an-play").textContent = "■ " + D.pause; last = performance.now(); timer = requestAnimationFrame(frame); }
{
  { let o = ""; for (let k = -17; k <= 18; k++) o += `<option value="${k}">F${k >= 0 ? "+" : "−"}${pad(Math.abs(k))}</option>`; $("an-fus").innerHTML = o; $("an-fus").value = String(D.defaultFus); }
  $("an-sp").innerHTML = D.speeds.map(([v, l], i) => `<option value="${v}"${i === 1 ? " selected" : ""}>${l}</option>`).join("");
  $("an-y").addEventListener("change", () => { stop(); setYear(parseInt($("an-y").value, 10)); });
  $("an-prev").onclick = () => { stop(); setYear(Y - 1); }; $("an-next").onclick = () => { stop(); setYear(Y + 1); }; $("an-cur").onclick = () => { stop(); setYear(new Date().getUTCFullYear()); };
  for (const id of ["an-mon", "an-fus", "an-hem", "an-lat", "an-lon"]) $(id).addEventListener("change", renderAll);
  $("an-lat").addEventListener("input", renderAll); $("an-lon").addEventListener("input", renderAnalemaCursor);
  $("an-day").addEventListener("input", e => { stop(); setDay(+e.target.value); });
  $("an-play").onclick = play;
  let rt = null; window.addEventListener("resize", () => { clearTimeout(rt); rt = setTimeout(() => { if (showDays() !== daysShown) renderRing(); }, 150); });
  setYear(new Date().getUTCFullYear());
}

})();
