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

/* ===== Limbi: română, engleză, franceză ===== */
const I18N = {
ro: {
 h1: "Cadrane în timp real",
 sub: "Ziua are 36 de ore noi și 360°: o oră nouă înseamnă 10° de rotație a Pământului, un minut nou 1°, o secundă nouă 0,1° și o subsecundă o secundă SI. Anul pornește de la solstițiul din decembrie, iar erele urmăresc precesia echinocțiilor.",
 live: "în direct", fix: "moment fix", lonL: "Longitudine (° E)", latL: "Latitudine (° N)", placeL: "Loc", custom: "Altul (introdu coordonatele)",
 hourL: "Ora", modeF: "Fus (F)", modeL: "Local (L)", modeFt: "Fus nou de 10°, număr întreg de ore noi", modeLt: "Timp solar mediu local",
 whenL: "Moment (UTC)", nowB: "Acum",
 earthH: "Ceasul Pământului", earthP: "Privit de deasupra Polului Nord, care e în centru. <b>Cum se citește:</b><ul class=\"rd\"><li><b>Ora ta</b>: numărul de pe inelul exterior, în fusul încadrat cu galben (de exemplu 8 în F+03). <b>Minutele (MN)</b>, <b>secundele (SN)</b> și <b>subsecundele (SS)</b> se citesc pe cele două scări din interiorul hărții: minutele pe cea exterioară (0–9), secundele pe cea interioară (0–9), cu 24 de diviziuni fine între două cifre, adică subsecundele.</li><li><b>Acul albastru</b> arată fusul tău: ora ta este numărul din căsuța spre care arată (cea încadrată cu galben).</li><li><b>Soarele galben cu raze</b> arată fusul în care este acum amiază (ora 18). Soarele merge spre vest, așa că amiaza trece de la un fus la cel cu număr mai mic (F+13, apoi F+12), iar orele de pe inel cresc spre est, în sens trigonometric.</li><li><b>Acul gri subțire</b> este minutarul (un tur pe oră nouă, 40 de minute) și arată spre scara minutelor; <b>acul portocaliu subțire</b> este secundarul (un tur pe minut nou, 4 minute) și arată spre scara interioară. Diviziunea fină pe care o atinge este subsecunda (24 între două cifre).</li><li><b>Cercul portocaliu cu punct</b> este locul în care Soarele este la zenit: se mută pe rază cu anotimpurile (între 23,4° N și 23,4° S) și în jurul cercului o dată pe zi.</li><li><b>Luna mică</b> arată punctul de pe Pământ aflat sub ea, cu faza ei reală; <b>punctul negru</b> este locul ales.</li></ul>", noonZ: "Amiaza solară (ora 18) este acum în fusul", noonNext: "centrul Soarelui ajunge în centrul fusului", noonIn: "peste", solarTrue: "Ora solară adevărată la locul ales", eotT: "ecuația timpului", min: "min", hnU: "h noi",
 d36H: "Ziua întreagă, 36 h", d36P: "Un tur al acului orar este o rotație completă a Pământului (36 de ore noi). Amiaza este la 18, jos. <b>Cum se citește:</b> ora este numărul de pe inelul exterior spre care arată acul gros și scurt; minutul și secunda se citesc pe cele două inele mici, 0–9; sub ele este fereastra cu data. Dedesubt vezi, pe rând, fiecare ac și ce arată.", rdBtnOn: "Arată citirea", rdBtnOff: "Ascunde citirea", wH: "Ceasul de mână", wP: "Un ceas mecanic cu trei ace, ca cel de la mână. <b>Acul scurt</b> arată ora, pe numerele mari. <b>Acul lung</b> arată minutul, iar <b>acul subțire portocaliu</b> secunda; ambele se citesc pe același inel exterior, 0–9. Un minut nou are 4 minute obișnuite (acul lung face un tur în 40 de minute), iar o secundă nouă are 24 de secunde (acul portocaliu face un tur în 4 minute). Cadranul de 18 ore are două inele de numere, ca un ceas de 12 ore care face două ture pe zi: orele 1–18 pe cel mare, orele 19–36 pe cel mic dinăuntru.", w36: "36 h", w18: "18 h", wHalf: "Jumătatea", wMoon: "faza lunară", wLogo: "TPU · 36 h",
 d18H: "Jumătate de zi, 18 h", d18P: "Același moment, dar ca un ceas clasic de 18 ore noi: acul orar face două ture pe zi. <b>Cum se citește:</b> orele 1–18 (până la amiază) se citesc pe numerele mari de pe inelul exterior; orele 19–36 (după amiază) pe numerele mici de pe inelul interior. Miezul nopții este 36, adică 0. Minutul, secunda și data se citesc la fel ca pe cadranul de 36 h.", rdH: "Ora", rdM: "Minutul", rdS: "Secunda", rdSS: "Subsecunda", rdC: "Ora clasică", rdHw: "acul gros, scurt", rdMw: "acul gros, lung", rdSw: "acul portocaliu, lung și subțire", rdSSw: "cadranul mic de sus", rdHr36: "citește pe inelul exterior, 0–35", rdHr18a: "citește pe inelul mare, 1–18", rdHr18b: "citește pe inelul mic, 19–36", rdMr: "inelul din mijloc, 0–9 (un tur = 40 min)", rdSr: "inelul interior, 0–9 (un tur = 4 min)", rdSSr: "24 de diviziuni (1 SS = 1 s)",
 yH: "Anul", yP: "De la solstițiul din decembrie: 13 luni, 73 de arce de 5 zile, cadranele Soarelui și fazele reale ale Lunii.",
 eH: "Erele", eP: "Ciclul precesiei de 25.772 de ani, în 12 ere. Pe inelul mare, numerele sunt miile de ani de la ER 1 · AE 1. Inelul interior desfășoară era curentă, cu zeci, sute și mii de ani.",
 nextH: "Următoarele fenomene", skyH: "Acum, pe cer",
 note: "<b>Cum se citește.</b> Codul are forma ER-AE-CS-AS.ZA-CL-LC-ZN HN:MN:SN:SS. Soarele și Luna sunt calculate astronomic (serii Meeus), fără tabele. Precesia e aproximată cu ere egale de 2147–2148 de ani, ancorate la Spica. Erele și anii sunt unici doar într-un ciclu de 25.772 de ani.",
 note2: "<b>Variante luate în calcul.</b> Precesia reală se accelerează ușor, deci limitele reale ale erelor diferă de cele egale: cu circa 7 ani în jurul anului 287 e.n., 33 de ani în 1888 î.e.n. și 81 de ani în 4083 î.e.n. Am evaluat ere cu limite reale (din precesia IAU 2006) și ere egale cu ciclu reglat, dar am ales erele egale, pentru simplitate. La scara istoriei, diferența este de ordinul zecilor de ani.",
 daysS: ["Lu","Ma","Mi","Jo","Vi","Sâ","Du"], yearDayS: "ZA", leapDayS: "ZB", days: ["Luni","Marți","Miercuri","Joi","Vineri","Sâmbătă","Duminică"],
 yearDay: "Ziua anului", leapDay: "Ziua bisectă", month: "Luna", day: "ziua", dayCap: "Ziua", ofYear: "din an", greg: "calendar gregorian", outside: "În afara lunilor",
 winL: (lc, zn) => `luna ${p2(lc)} · ziua ${p2(zn)}`, winY: n => `ziua ${n} din an`,
 phases: ["nouă","semilună crescătoare","primul pătrar","gibbă crescătoare","plină","gibbă descrescătoare","ultimul pătrar","semilună descrescătoare"],
 ev: {S0:"☀ solstițiul din decembrie (începutul anului)",S1:"☀ echinocțiul din martie",S2:"☀ solstițiul din iunie",S3:"☀ echinocțiul din septembrie",L0:"● lună nouă",L90:"◐ primul pătrar",L180:"○ lună plină",L270:"◑ ultimul pătrar"},
 dUnit: "z", hUnit: "h", mUnit: "min", sun: "Soare", moon: "Lună", phase: "Fază", lunarDay: "ziua lunară", local24: "Local 24 h",
 half1: "jumătatea întâi (0–17)", half2: "jumătatea a doua (18–35)", onDial: "pe cadran", cs: "cadranul",
 eraOf: "din", labelYear: "anul-etichetă", ce: "e.n.", bce: "î.e.n.", ageOfEra: "AE", dec: ",",
 stdL: "Ora standard (24 h)", nominal: "fus nominal", utcL: "timp universal", digL: "Timpul precesional uman (36 h)", subsolar: "Punct subsolar", sublunar: "Punct sublunar", at: "La", localTime: "ora locală", N: "N", S: "S", E: "E", W: "V", utcNow: "UTC acum", zoneHour: "Ora curentă în fiecare fus",
 gdate: (d, m, y) => `${p2(d)}.${p2(m)}.${y}`,

 cvH:"Convertor", cvSiH:"Din calendarul gregorian în sistemul precesional uman", cvSiP:"Alege o dată și o oră. Rezultatul folosește zona și modul din comenzile de sus.",
 cvDt:"Data și ora (24 h)", cvRefU:"Este UTC", cvRefL:z=>`Este ora locală a zonei ${z}`,
 cvNewH:"Din sistemul precesional uman în calendarul gregorian", cvNewP:"Lipește un cod complet sau completează câmpurile. Zilele exacte sunt acceptate pentru anii 1–9999 e.n.",
 cvCode:"Cod complet", cvCyc:"Ciclul de precesie (0 = cel curent)", cvUtc:"UTC", cvLoc:"Ora locală 24 h",
 err:{era:"ER trebuie să fie între 1 și 12.",ae:(e,n)=>`AE trebuie să fie între 1 și ${n} pentru ER ${e}.`,time:"Valori întregi: HN 0–35, MN 0–9, SN 0–9, SS 0–23.",lc:"LC 1–13 și ZN 1–28; pentru LC 00, ZN este 01 (Ziua anului) sau 02 (Ziua bisectă).",leap:"Acest an nu este bisect și nu are Ziua bisectă.",range:"Zilele exacte sunt acceptate doar pentru anii 1–9999 e.n.",code:"Cod nerecunoscut. Exemplu: 12-1734-4-58.4-25-11-09 21:0:0:0 F+03",date:"Alege o dată validă."},
 calH:"Calendarul anului", calP:"Alege orice an. Anul începe la solstițiul din decembrie și are 13 luni de câte 28 de zile, de luni până duminică. Fazele Lunii și fenomenele Soarelui sunt cele reale, după zona aleasă sus. Pentru imprimare, folosește funcția de imprimare a browserului pe această pagină: se tipărește doar calendarul, pe o pagină A4 orizontală.",
 calYear:"Anul-etichetă", calPrev:"‹ Anterior", calNext:"Următorul ›", calToday:"Anul curent", calPrint:"Tipărește",
 calYearLine:(a,e,s,f,b)=>`AN ${a} · ER ${e[0]} · AE ${e[1]} · ${s} – ${f} · ${b?"an bisect (366 de zile)":"an obișnuit (365 de zile)"}`,
 calLegend:"● lună nouă · ◐ primul pătrar · ○ lună plină · ◑ ultimul pătrar · ☀ solstițiu sau echinocțiu. Cifrele mici sunt zilele gregoriene. Zilele din afara lunilor nu fac parte din săptămână.",
 celH: "Ce semn zodiacal ești?", celP: "Alege data nașterii (sau orice altă dată), în format SI sau uman. Răspunsul are două părți: semnul din zodiacul tradițional și constelația prin care trecea de fapt Soarele în ziua aceea. Dedesubt sunt cele două cadrane.",
 celDt: "Data (format SI, UTC)", celCode: "Data în format uman (cod complet)",
 celConstH: "Constelația străbătută de Soare", celConstP: "Cele 13 constelații de pe ecliptică, cu lățimile lor reale (granițele IAU din 1930, longitudine față de echinocțiul J2000). Ophiuchus se află între Scorpion și Săgetător. γ marchează echinocțiul de primăvară al datei alese, care s-a mutat din Berbec în Pești.",
 celZodH: "Zodia modernă (tropicală)", celZodP: "12 sectoare egale de 30°, numărate de la echinocțiul de primăvară. Zodia urmează anotimpurile, nu stelele din spate.",
 constN: ["Berbec", "Taur", "Gemeni", "Rac", "Leu", "Fecioară", "Balanță", "Scorpion", "Ophiuchus", "Săgetător", "Capricorn", "Vărsător", "Pești"],
 zodN: ["Berbec", "Taur", "Gemeni", "Rac", "Leu", "Fecioară", "Balanță", "Scorpion", "Săgetător", "Capricorn", "Vărsător", "Pești"],
 celConstOut: (n, a, b, lam, lj, p) => `Soarele este în constelația <b>${n}</b>, de la ${a} până la ${b} (UTC). Longitudine ecliptică: ${lam}° față de echinocțiul datei și ${lj}° față de J2000; între ele, precesia a mutat echinocțiul cu ${p}°.`,
 celZodOut: (n, a, b, lam, g) => `Soarele este în zodia <b>${g} ${n}</b>, de la ${a} până la ${b} (UTC), la longitudinea ${lam}°.`,
 celGap: (z, c, same) => same ? `Aici zodia și constelația poartă același nume.` : `Zodia (${z}) și constelația (${c}) diferă: zodiacul modern își numără sectoarele de la echinocțiul de primăvară, iar constelațiile sunt grupuri reale de stele, de lățimi inegale.`,
 celAns: (g, z, za, zb, c, ca, cb, same, cusp, oph) => `<div><small>Semnul tău în zodiacul tradițional</small><b><i>${g}</i>${z}</b><span>${za} – ${zb}</span></div><div><small>Constelația prin care trecea Soarele</small><b>${c}</b><span>${ca} – ${cb}</span></div><p>${same ? "În cazul acesta, semnul și constelația poartă același nume." : "Cele două răspunsuri diferă, și e normal: zodiacul tradițional a fost fixat acum aproape două mii de ani (în vremea lui Ptolemeu), când echinocțiul de primăvară se afla în Berbec, și își numără cele 12 sectoare egale de 30° de la acest punct. Din cauza precesiei, echinocțiul s-a mutat între timp în Pești, iar sectoarele nu mai coincid cu stelele din spatele lor."}${oph ? " Ophiuchus (Șarpar) este o constelație reală pe care Soarele o străbate, dar nu face parte din zodiacul tradițional." : ""}${cusp ? " Atenție: ești aproape de limita dintre două zodii; în astfel de zile semnul depinde de anul, ora și locul nașterii." : ""}</p>`,
 wk:["Lu","Ma","Mi","Jo","Vi","Sâ","Du"],
 tabTime:"Timp", tabDate:"Dată", tabCal:"Calendar", tabZod:"Ce semn sunt?", tabConv:"Convertor",
 nameT:"Timpul precesional uman", nameC:"Calendarul precesional uman", tabAbout:"Despre", aboutH:"Despre sistem",
 ab1:"<b>Timpul precesional uman (TPU) și calendarul precesional uman.</b> Ele alcătuiesc un sistem de timp și de dată construit numai pe ce poate observa orice om de pe Pământ, fără nicio doctrină. „Precesional” vine de la precesia echinocțiilor, iar „uman” înseamnă la scara perceperii umane.",
 ab2:"<b>Timpul.</b> Ziua este o rotație completă a Pământului, de 360° și 36 de ore. O oră nouă are 10°, un minut nou 1°, o secundă nouă 0,1°, iar o subsecundă este o secundă SI, adică secunda din Sistemul Internațional de unități.",
 ab3:"<b>Calendarul.</b> Anul pornește de la solstițiul din decembrie și are 13 luni de câte 28 de zile. Soarele și Luna sunt calculate după poziția lor reală pe cer.",
 ab4:"<b>Erele.</b> Cea mai lentă mișcare, precesia echinocțiilor (25.772 de ani), împarte timpul în 12 ere. Un singur ciclu, cel curent (de la 23332 î.e.n. la 2440 e.n.), cuprinde toată istoria cunoscută a omenirii, de la artele rupestre până azi, deci orice dată din trecut are un cod unic. După 2440 începe ciclul următor.",
 abSys:"Despre sistem", abTut:"Tutorial: ce este precesia", tutH:"Ce este precesia, pe înțelesul tuturor",
 tutIntro:"Pământul se rotește în jurul axei sale, dar axa însăși se rotește foarte încet, ca a unui titirez. Mișcarea aceasta durează circa 25.772 de ani și se numește precesia echinocțiilor. Mută glisorul și vezi ce se schimbă pe cer.",
 exPoleCap:"Capătul axei Pământului desenează un cerc printre stele. Stelele strălucitoare de pe cerc devin, pe rând, stele polare.", exEraCap:"Poziția în ciclul de 25.772 de ani, împărțit în 12 ere.",
 exYear:"Anul", exJumps:["Thuban · 2800 î.e.n.","Începutul istoriei scrise · 3300 î.e.n.","Azi","Vega · 13.700 e.n."],
 poleStar:s=>`Steaua polară: ${s}`, poleNone:"Nicio stea strălucitoare nu este aproape de pol", cyc:n=>n===0?"ciclul curent":`ciclul ${n>0?"+":""}${n}`,
 steps:["<b>Titirezul.</b> Un titirez care se rotește își ține axa înclinată, dar axa lui desenează încet un con. Axa Pământului, înclinată cu 23,4° față de orbită, face la fel, într-un ciclu de 25.772 de ani.",
 "<b>Steaua polară se schimbă.</b> Axa arată spre alt punct al cerului la fiecare epocă. Azi arată spre Polaris, în urmă cu 4800 de ani arăta spre Thuban, iar peste circa 11.700 de ani va arăta spre Vega.",
 "<b>Echinocțiul alunecă pe cer.</b> Punctul în care se află Soarele la echinocțiul de primăvară se mută printre constelații cu circa 1° la 71,6 ani (50,3 secunde de arc pe an), în sens invers mișcării Soarelui. De aici vorbim popular de „era Peștilor” sau „era Vărsătorului”.",
 "<b>O eră este un sector de 30°.</b> Împărțim cercul de 360° în 12 sectoare egale, câte unul pentru fiecare constelație zodiacală. Un sector se parcurge în circa 2147 de ani. În sistem, acestea sunt cele 12 ere precesionale (ER 1–12). Sunt unități de măsură a timpului, nu au legătură cu astrologia.",
 "<b>Cum citim ER și AE.</b> ER este era, iar AE este anul din eră (fără an zero). Anul 2026 e.n. este ER 12 (Pești), AE 1734, iar 785 î.e.n. este ER 11, AE 1072. ER 1 (Vărsător) începe în anul 2441. Reperul este steaua Spica.",
 "<b>Limite.</b> Precesia reală se accelerează ușor, deci limitele reale ale erelor nu sunt la distanțe egale. Erele egale din sistem diferă de ele cu 6,5 ani la începutul lui ER 12 și cu 33 de ani la ER 11, iar mai în urmă cu mai mult. Un cod ER-AE este unic doar într-un ciclu de 25.772 de ani."],
 cities: ["București","Greenwich","New York","Los Angeles","São Paulo","Paris","Cairo","Delhi","Beijing","Tokyo","Sydney"]
},
en: {
 h1: "Dials in real time",
 sub: "The day has 36 new hours and 360°: a new hour is 10° of Earth's rotation, a new minute 1°, a new second 0.1° and a subsecond one SI second. The year starts at the December solstice, and the eras follow the precession of the equinoxes.",
 live: "live", fix: "fixed moment", lonL: "Longitude (° E)", latL: "Latitude (° N)", placeL: "Place", custom: "Other (enter coordinates)",
 hourL: "Time", modeF: "Zone (F)", modeL: "Local (L)", modeFt: "New 10° zone, whole number of new hours", modeLt: "Local mean solar time",
 whenL: "Moment (UTC)", nowB: "Now",
 earthH: "Earth clock", earthP: "Seen from above the North Pole, which sits at the centre. <b>How to read it:</b><ul class=\"rd\"><li><b>Your hour</b>: the number on the outer ring, in the zone framed in yellow (for example 8 in F+03). <b>Minutes (MN)</b>, <b>seconds (SN)</b> and <b>subseconds (SS)</b> are read on the two scales inside the map: minutes on the outer one (0–9), seconds on the inner one (0–9), with 24 fine divisions between two digits, i.e. the subseconds.</li><li><b>The blue hand</b> points to your zone: your hour is the number in the box it points at (the one framed in yellow).</li><li><b>The yellow Sun with rays</b> shows the zone where it is noon now (hour 18). The Sun moves west, so noon passes from one zone to the one with the lower number (F+13, then F+12), and the hours on the ring grow toward the east, counter-clockwise.</li><li><b>The thin grey hand</b> is the minute hand (one turn per new hour, 40 minutes) and points at the minute scale; <b>the thin orange hand</b> is the second hand (one turn per new minute, 4 minutes) and points at the inner scale. The fine division it touches is the subsecond (24 between two digits).</li><li><b>The orange circle with a dot</b> is where the Sun is at the zenith: it moves along the radius with the seasons (between 23.4° N and 23.4° S) and round the circle once a day.</li><li><b>The small moon</b> shows the point on Earth beneath it, with its real phase; <b>the black dot</b> is the chosen place.</li></ul>", noonZ: "Solar noon (hour 18) is now in zone", noonNext: "the Sun reaches the centre of zone", noonIn: "in", solarTrue: "True solar time at the chosen place", eotT: "equation of time", min: "min", hnU: "new h",
 d36H: "The whole day, 36 h", d36P: "One turn of the hour hand is one full rotation of the Earth (36 new hours). Noon is at 18, at the bottom. <b>How to read it:</b> the hour is the number on the outer ring that the short thick hand points to; minutes and seconds are read on the two small rings, 0–9; below them is the date window. Underneath, each hand is listed with what it shows.", rdBtnOn: "Show the reading", rdBtnOff: "Hide the reading", wH: "The wristwatch", wP: "A mechanical watch with three hands, like the one on your wrist. <b>The short hand</b> shows the hour on the large numbers. <b>The long hand</b> shows the minute and <b>the thin orange hand</b> the second; both are read on the same outer ring, 0–9. A new minute is 4 ordinary minutes (the long hand turns once in 40 minutes), and a new second is 24 seconds (the orange hand turns once in 4 minutes). The 18 h dial has two rings of numbers, like a 12-hour watch that turns twice a day: hours 1–18 on the large one, hours 19–36 on the small inner one.", w36: "36 h", w18: "18 h", wHalf: "Half", wMoon: "moon phase", wLogo: "HPT · 36 h",
 d18H: "Half a day, 18 h", d18P: "The same moment, but as a classic 18-new-hour clock: the hour hand makes two turns a day. <b>How to read it:</b> hours 1–18 (up to noon) are read on the large numbers of the outer ring; hours 19–36 (after noon) on the small numbers of the inner ring. Midnight is 36, that is 0. Minutes, seconds and date are read as on the 36 h dial.", rdH: "Hour", rdM: "Minute", rdS: "Second", rdSS: "Subsecond", rdC: "Classic time", rdHw: "short thick hand", rdMw: "long thick hand", rdSw: "long thin orange hand", rdSSw: "small dial at the top", rdHr36: "read on the outer ring, 0–35", rdHr18a: "read on the large ring, 1–18", rdHr18b: "read on the small ring, 19–36", rdMr: "middle ring, 0–9 (one turn = 40 min)", rdSr: "inner ring, 0–9 (one turn = 4 min)", rdSSr: "24 divisions (1 SS = 1 s)",
 yH: "The year", yP: "From the December solstice: 13 months, 73 arcs of 5 days, the Sun's quadrants and the real phases of the Moon.",
 eH: "The eras", eP: "The 25,772-year precession cycle, in 12 eras. On the large ring, numbers are thousands of years since ER 1 · AE 1. The inner ring unrolls the current era in decades, centuries and millennia.",
 nextH: "Upcoming events", skyH: "In the sky now",
 note: "<b>How to read it.</b> The code has the form ER-AE-CS-AS.ZA-CL-LC-ZN HN:MN:SN:SS. The Sun and Moon are computed astronomically (Meeus series), with no lookup tables. Precession is approximated by equal eras of 2147–2148 years, anchored to Spica. Eras and years are unique only within one 25,772-year cycle.",
 note2: "<b>Variants considered.</b> Real precession accelerates slightly, so the real era boundaries differ from equal ones: by about 7 years around 287 CE, 33 years in 1888 BCE and 81 years in 4083 BCE. I evaluated eras with real boundaries (from IAU 2006 precession) and equal eras with a tuned cycle, but chose equal eras for simplicity. On the scale of history the difference is of the order of tens of years.",
 daysS: ["Mo","Tu","We","Th","Fr","Sa","Su"], yearDayS: "YD", leapDayS: "LD", days: ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"],
 yearDay: "Year Day", leapDay: "Leap Day", month: "Month", day: "day", dayCap: "Day", ofYear: "of the year", greg: "Gregorian calendar", outside: "Outside the months",
 winL: (lc, zn) => `month ${p2(lc)} · day ${p2(zn)}`, winY: n => `day ${n} of year`,
 phases: ["new","waxing crescent","first quarter","waxing gibbous","full","waning gibbous","last quarter","waning crescent"],
 ev: {S0:"☀ December solstice (start of the year)",S1:"☀ March equinox",S2:"☀ June solstice",S3:"☀ September equinox",L0:"● new moon",L90:"◐ first quarter",L180:"○ full moon",L270:"◑ last quarter"},
 dUnit: "d", hUnit: "h", mUnit: "min", sun: "Sun", moon: "Moon", phase: "Phase", lunarDay: "lunar day", local24: "Local 24 h",
 half1: "first half (0–17)", half2: "second half (18–35)", onDial: "on the dial", cs: "quadrant",
 eraOf: "of", labelYear: "label year", ce: "CE", bce: "BCE", dec: ".",
 stdL: "Standard time (24 h)", nominal: "nominal zone", utcL: "universal time", digL: "Human precessional time (36 h)", subsolar: "Subsolar point", sublunar: "Sublunar point", at: "At", localTime: "local time", N: "N", S: "S", E: "E", W: "W", utcNow: "UTC now", zoneHour: "Current hour in each zone",
 gdate: (d, m, y) => `${y}-${p2(m)}-${p2(d)}`,

 cvH:"Converter", cvSiH:"From the Gregorian calendar to the human precessional system", cvSiP:"Pick a date and time. The result uses the zone and mode set in the controls above.",
 cvDt:"Date and time (24 h)", cvRefU:"It is UTC", cvRefL:z=>`It is local time of zone ${z}`,
 cvNewH:"From the human precessional system to the Gregorian calendar", cvNewP:"Paste a full code or fill in the fields. Exact days are accepted for years 1–9999 CE.",
 cvCode:"Full code", cvCyc:"Precession cycle (0 = current)", cvUtc:"UTC", cvLoc:"Local time 24 h",
 err:{era:"ER must be between 1 and 12.",ae:(e,n)=>`AE must be between 1 and ${n} for ER ${e}.`,time:"Whole numbers: HN 0–35, MN 0–9, SN 0–9, SS 0–23.",lc:"LC 1–13 and ZN 1–28; for LC 00, ZN is 01 (Year Day) or 02 (Leap Day).",leap:"This year is not a leap year and has no Leap Day.",range:"Exact days are accepted only for years 1–9999 CE.",code:"Unrecognised code. Example: 12-1734-4-58.4-25-11-09 21:0:0:0 F+03",date:"Pick a valid date."},
 calH:"Calendar of the year", calP:"Pick any year. The year starts at the December solstice and has 13 months of 28 days, Monday to Sunday. Moon phases and Sun events are the real ones, for the zone chosen above. To print, use your browser's print function on this page: only the calendar is printed, on one landscape A4 page.",
 calYear:"Label year", calPrev:"‹ Previous", calNext:"Next ›", calToday:"Current year", calPrint:"Print",
 calYearLine:(a,e,s,f,b)=>`YEAR ${a} · ER ${e[0]} · AE ${e[1]} · ${s} – ${f} · ${b?"leap year (366 days)":"common year (365 days)"}`,
 calLegend:"● new moon · ◐ first quarter · ○ full moon · ◑ last quarter · ☀ solstice or equinox. Small numbers are Gregorian days. Days outside the months are not part of the week.",
 celH: "What is your zodiac sign?", celP: "Pick your birth date (or any other date), in SI or human format. The answer has two parts: your sign in the traditional zodiac and the constellation the Sun was actually crossing that day. The two dials are below.",
 celDt: "Date (SI format, UTC)", celCode: "Date in human format (full code)",
 celConstH: "The constellation the Sun is crossing", celConstP: "The 13 constellations on the ecliptic with their real widths (IAU boundaries of 1930, longitude measured from the J2000 equinox). Ophiuchus lies between Scorpius and Sagittarius. γ marks the vernal equinox of the chosen date, which has moved from Aries into Pisces.",
 celZodH: "The modern (tropical) zodiac", celZodP: "12 equal sectors of 30°, counted from the vernal equinox. The sign follows the seasons, not the stars behind it.",
 constN: ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpius", "Ophiuchus", "Sagittarius", "Capricornus", "Aquarius", "Pisces"],
 zodN: ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"],
 celConstOut: (n, a, b, lam, lj, p) => `The Sun is in the constellation <b>${n}</b>, from ${a} to ${b} (UTC). Ecliptic longitude: ${lam}° from the equinox of the date and ${lj}° from J2000; between the two, precession has moved the equinox by ${p}°.`,
 celZodOut: (n, a, b, lam, g) => `The Sun is in the sign <b>${g} ${n}</b>, from ${a} to ${b} (UTC), at longitude ${lam}°.`,
 celGap: (z, c, same) => same ? `Here the sign and the constellation share the same name.` : `The sign (${z}) and the constellation (${c}) differ: the modern zodiac counts its sectors from the vernal equinox, while constellations are real groups of stars of unequal widths.`,
 celAns: (g, z, za, zb, c, ca, cb, same, cusp, oph) => `<div><small>Your sign in the traditional zodiac</small><b><i>${g}</i>${z}</b><span>${za} – ${zb}</span></div><div><small>The constellation the Sun was crossing</small><b>${c}</b><span>${ca} – ${cb}</span></div><p>${same ? "In this case the sign and the constellation share the same name." : "The two answers differ, and that is normal: the traditional zodiac was fixed almost two thousand years ago (in Ptolemy’s time), when the vernal equinox lay in Aries, and it counts its 12 equal 30° sectors from that point. Because of precession the equinox has since moved into Pisces, so the sectors no longer line up with the stars behind them."}${oph ? " Ophiuchus (the Serpent Bearer) is a real constellation the Sun crosses, but it is not part of the traditional zodiac." : ""}${cusp ? " Note: you are close to the boundary between two signs; on such days the sign depends on the year, time and place of birth." : ""}</p>`,
 wk:["Mo","Tu","We","Th","Fr","Sa","Su"],
 tabTime:"Time", tabDate:"Date", tabCal:"Calendar", tabZod:"My sign?", tabConv:"Converter",
 nameT:"Human precessional time", nameC:"Human precessional calendar", tabAbout:"About", aboutH:"About the system",
 ab1:"<b>Human precessional time (HPT) and the human precessional calendar.</b> Together they form a system of time and date built only on what any person on Earth can observe, with no doctrine. “Precessional” comes from the precession of the equinoxes, and “human” means at the scale of human perception.",
 ab2:"<b>Time.</b> The day is one full rotation of the Earth, 360° and 36 hours. A new hour is 10°, a new minute 1°, a new second 0.1°, and a subsecond is one SI second, that is, the second of the International System of Units.",
 ab3:"<b>The calendar.</b> The year starts at the December solstice and has 13 months of 28 days. The Sun and Moon are computed from their real positions in the sky.",
 ab4:"<b>The eras.</b> The slowest motion, the precession of the equinoxes (25,772 years), divides time into 12 eras. A single cycle, the current one (from 23332 BCE to 2440 CE), holds all of recorded human history, from cave art to today, so any date in the past has a unique code. After 2440 the next cycle begins.",
 abSys:"About the system", abTut:"Tutorial: what is precession", tutH:"What precession is, in plain words",
 tutIntro:"The Earth spins around its axis, but the axis itself turns very slowly, like a spinning top. This motion takes about 25,772 years and is called the precession of the equinoxes. Move the slider and see what changes in the sky.",
 exPoleCap:"The tip of the Earth's axis traces a circle among the stars. The bright stars on the circle become pole stars in turn.", exEraCap:"Position in the 25,772-year cycle, divided into 12 eras.",
 exYear:"Year", exJumps:["Thuban · 2800 BCE","Start of recorded history · 3300 BCE","Today","Vega · 13,700 CE"],
 poleStar:s=>`Pole star: ${s}`, poleNone:"No bright star is near the pole", cyc:n=>n===0?"current cycle":`cycle ${n>0?"+":""}${n}`,
 steps:["<b>The spinning top.</b> A spinning top keeps its axis tilted, but the axis slowly draws a cone. The Earth's axis, tilted 23.4° to its orbit, does the same, in a cycle of 25,772 years.",
 "<b>The pole star changes.</b> The axis points to a different spot in the sky in each epoch. Today it points to Polaris, 4,800 years ago it pointed to Thuban, and in about 11,700 years it will point to Vega.",
 "<b>The equinox slides across the sky.</b> The point where the Sun stands at the March equinox moves through the constellations by about 1° every 71.6 years (50.3 arcseconds per year), against the Sun's own motion. That is where the popular “Age of Pisces” and “Age of Aquarius” come from.",
 "<b>An era is a 30° sector.</b> We divide the 360° circle into 12 equal sectors, one per zodiac constellation. A sector takes about 2,147 years to cross. In the system these are the 12 precessional eras (ER 1–12). They are units of time, not astrology.",
 "<b>How to read ER and AE.</b> ER is the era and AE is the year within the era (no year zero). The year 2026 CE is ER 12 (Pisces), AE 1734, and 785 BCE is ER 11, AE 1072. ER 1 (Aquarius) begins in the year 2441. The reference star is Spica.",
 "<b>Limits.</b> Real precession accelerates slightly, so the real era boundaries are not equally spaced. The system's equal eras differ from them by 6.5 years at the start of ER 12 and by 33 years at ER 11, and by more further back. An ER-AE code is unique only within one 25,772-year cycle."],
 cities: ["Bucharest","Greenwich","New York","Los Angeles","São Paulo","Paris","Cairo","Delhi","Beijing","Tokyo","Sydney"]
},
fr: {
 h1: "Cadrans en temps réel",
 sub: "Le jour compte 36 heures nouvelles et 360° : une heure nouvelle vaut 10° de rotation de la Terre, une minute nouvelle 1°, une seconde nouvelle 0,1° et une sous-seconde une seconde SI. L'année commence au solstice de décembre et les ères suivent la précession des équinoxes.",
 live: "en direct", fix: "moment fixé", lonL: "Longitude (° E)", latL: "Latitude (° N)", placeL: "Lieu", custom: "Autre (saisir les coordonnées)",
 hourL: "Heure", modeF: "Fuseau (F)", modeL: "Local (L)", modeFt: "Nouveau fuseau de 10°, nombre entier d'heures nouvelles", modeLt: "Temps solaire moyen local",
 whenL: "Moment (UTC)", nowB: "Maintenant",
 earthH: "Horloge de la Terre", earthP: "Vue au-dessus du pôle Nord, au centre. <b>Comment lire :</b><ul class=\"rd\"><li><b>Votre heure</b> : le nombre de l'anneau extérieur, dans le fuseau encadré en jaune (par exemple 8 en F+03). Les <b>minutes (MN)</b>, les <b>secondes (SN)</b> et les <b>sous-secondes (SS)</b> se lisent sur les deux échelles à l'intérieur de la carte : les minutes sur l'extérieure (0–9), les secondes sur l'intérieure (0–9), avec 24 divisions fines entre deux chiffres, soit les sous-secondes.</li><li><b>L'aiguille bleue</b> montre votre fuseau : votre heure est le nombre de la case qu'elle désigne (celle encadrée en jaune).</li><li><b>Le Soleil jaune à rayons</b> montre le fuseau où il est midi maintenant (heure 18). Le Soleil va vers l'ouest : midi passe d'un fuseau à celui de numéro inférieur (F+13, puis F+12), et les heures de l'anneau croissent vers l'est, dans le sens trigonométrique.</li><li><b>L'aiguille fine grise</b> est celle des minutes (un tour par heure nouvelle, 40 minutes) et désigne l'échelle des minutes ; <b>l'aiguille orange fine</b> est celle des secondes (un tour par minute nouvelle, 4 minutes) et désigne l'échelle intérieure. La division fine qu'elle touche est la sous-seconde (24 entre deux chiffres).</li><li><b>Le cercle orange avec un point</b> est l'endroit où le Soleil est au zénith : il se déplace sur le rayon avec les saisons (entre 23,4° N et 23,4° S) et autour du cercle une fois par jour.</li><li><b>La petite lune</b> montre le point de la Terre situé sous elle, avec sa phase réelle ; <b>le point noir</b> est le lieu choisi.</li></ul>", noonZ: "Le midi solaire (heure 18) est maintenant dans le fuseau", noonNext: "le Soleil atteint le centre du fuseau", noonIn: "dans", solarTrue: "Heure solaire vraie au lieu choisi", eotT: "équation du temps", min: "min", hnU: "h nouvelles",
 d36H: "Le jour entier, 36 h", d36P: "Un tour de l’aiguille des heures est une rotation complète de la Terre (36 heures nouvelles). Midi est à 18, en bas. <b>Comment lire :</b> l’heure est le nombre de l’anneau extérieur que montre l’aiguille courte et épaisse ; minutes et secondes se lisent sur les deux petits anneaux, 0–9 ; en dessous, la fenêtre de la date. Plus bas, chaque aiguille est détaillée.", rdBtnOn: "Montrer la lecture", rdBtnOff: "Masquer la lecture", wH: "La montre", wP: "Une montre mécanique à trois aiguilles, comme celle du poignet. <b>L’aiguille courte</b> montre l’heure sur les grands nombres. <b>L’aiguille longue</b> montre la minute et <b>la fine aiguille orange</b> la seconde ; les deux se lisent sur le même anneau extérieur, 0–9. Une minute nouvelle vaut 4 minutes ordinaires (l’aiguille longue fait un tour en 40 minutes) et une seconde nouvelle 24 secondes (l’aiguille orange fait un tour en 4 minutes). Le cadran de 18 h a deux anneaux de nombres, comme une montre de 12 h qui fait deux tours par jour : les heures 1–18 sur le grand, les heures 19–36 sur le petit anneau intérieur.", w36: "36 h", w18: "18 h", wHalf: "Moitié", wMoon: "phase lunaire", wLogo: "TPH · 36 h",
 d18H: "Un demi-jour, 18 h", d18P: "Le même instant, mais comme une horloge classique de 18 heures nouvelles : l’aiguille des heures fait deux tours par jour. <b>Comment lire :</b> les heures 1–18 (jusqu’à midi) se lisent sur les grands nombres de l’anneau extérieur ; les heures 19–36 (après midi) sur les petits nombres de l’anneau intérieur. Minuit est 36, c’est-à-dire 0. Minutes, secondes et date se lisent comme sur le cadran de 36 h.", rdH: "Heure", rdM: "Minute", rdS: "Seconde", rdSS: "Sous-seconde", rdC: "Heure classique", rdHw: "aiguille courte et épaisse", rdMw: "aiguille longue et épaisse", rdSw: "aiguille orange longue et fine", rdSSw: "petit cadran du haut", rdHr36: "se lit sur l’anneau extérieur, 0–35", rdHr18a: "se lit sur le grand anneau, 1–18", rdHr18b: "se lit sur le petit anneau, 19–36", rdMr: "anneau du milieu, 0–9 (un tour = 40 min)", rdSr: "anneau intérieur, 0–9 (un tour = 4 min)", rdSSr: "24 divisions (1 SS = 1 s)",
 yH: "L'année", yP: "Depuis le solstice de décembre : 13 mois, 73 arcs de 5 jours, les quadrants du Soleil et les phases réelles de la Lune.",
 eH: "Les ères", eP: "Le cycle de précession de 25 772 ans, en 12 ères. Sur le grand anneau, les nombres sont des milliers d'années depuis ER 1 · AE 1. L'anneau intérieur déroule l'ère en cours en décennies, siècles et millénaires.",
 nextH: "Prochains phénomènes", skyH: "Dans le ciel maintenant",
 note: "<b>Comment lire.</b> Le code a la forme ER-AE-CS-AS.ZA-CL-LC-ZN HN:MN:SN:SS. Le Soleil et la Lune sont calculés astronomiquement (séries de Meeus), sans tables. La précession est approchée par des ères égales de 2147–2148 ans, ancrées sur Spica. Les ères et les années ne sont uniques que dans un cycle de 25 772 ans.",
 note2: "<b>Variantes envisagées.</b> La précession réelle s'accélère légèrement, donc les limites réelles des ères diffèrent des ères égales : d'environ 7 ans vers 287 apr. J.-C., 33 ans en 1888 av. J.-C. et 81 ans en 4083 av. J.-C. J'ai évalué des ères aux limites réelles (précession IAU 2006) et des ères égales à cycle ajusté, mais j'ai retenu les ères égales, par simplicité. À l'échelle de l'histoire, l'écart est de l'ordre de quelques dizaines d'années.",
 daysS: ["Lu","Ma","Me","Je","Ve","Sa","Di"], yearDayS: "JA", leapDayS: "JB", days: ["lundi","mardi","mercredi","jeudi","vendredi","samedi","dimanche"],
 yearDay: "Jour de l'année", leapDay: "Jour bissextile", month: "Mois", day: "jour", dayCap: "Jour", ofYear: "de l'année", greg: "calendrier grégorien", outside: "Hors des mois",
 winL: (lc, zn) => `mois ${p2(lc)} · jour ${p2(zn)}`, winY: n => `jour ${n} de l'année`,
 phases: ["nouvelle","premier croissant","premier quartier","gibbeuse croissante","pleine","gibbeuse décroissante","dernier quartier","dernier croissant"],
 ev: {S0:"☀ solstice de décembre (début de l'année)",S1:"☀ équinoxe de mars",S2:"☀ solstice de juin",S3:"☀ équinoxe de septembre",L0:"● nouvelle lune",L90:"◐ premier quartier",L180:"○ pleine lune",L270:"◑ dernier quartier"},
 dUnit: "j", hUnit: "h", mUnit: "min", sun: "Soleil", moon: "Lune", phase: "Phase", lunarDay: "jour lunaire", local24: "Local 24 h",
 half1: "première moitié (0–17)", half2: "seconde moitié (18–35)", onDial: "sur le cadran", cs: "quadrant",
 eraOf: "sur", labelYear: "année-étiquette", ce: "apr. J.-C.", bce: "av. J.-C.", dec: ",",
 stdL: "Heure standard (24 h)", nominal: "fuseau nominal", utcL: "temps universel", digL: "Temps précessionnel humain (36 h)", subsolar: "Point subsolaire", sublunar: "Point sublunaire", at: "À", localTime: "heure locale", N: "N", S: "S", E: "E", W: "O", utcNow: "UTC maintenant", zoneHour: "Heure actuelle dans chaque fuseau",
 gdate: (d, m, y) => `${p2(d)}/${p2(m)}/${y}`,

 cvH:"Convertisseur", cvSiH:"Du calendrier grégorien vers le système précessionnel humain", cvSiP:"Choisissez une date et une heure. Le résultat utilise le fuseau et le mode réglés plus haut.",
 cvDt:"Date et heure (24 h)", cvRefU:"C'est l'UTC", cvRefL:z=>`C'est l'heure locale du fuseau ${z}`,
 cvNewH:"Du système précessionnel humain vers le calendrier grégorien", cvNewP:"Collez un code complet ou remplissez les champs. Les jours exacts sont acceptés pour les années 1–9999 apr. J.-C.",
 cvCode:"Code complet", cvCyc:"Cycle de précession (0 = actuel)", cvUtc:"UTC", cvLoc:"Heure locale 24 h",
 err:{era:"ER doit être entre 1 et 12.",ae:(e,n)=>`AE doit être entre 1 et ${n} pour ER ${e}.`,time:"Nombres entiers : HN 0–35, MN 0–9, SN 0–9, SS 0–23.",lc:"LC 1–13 et ZN 1–28 ; pour LC 00, ZN vaut 01 (Jour de l'année) ou 02 (Jour bissextile).",leap:"Cette année n'est pas bissextile et n'a pas de Jour bissextile.",range:"Les jours exacts ne sont acceptés que pour les années 1–9999 apr. J.-C.",code:"Code non reconnu. Exemple : 12-1734-4-58.4-25-11-09 21:0:0:0 F+03",date:"Choisissez une date valide."},
 calH:"Calendrier de l'année", calP:"Choisissez n'importe quelle année. L'année commence au solstice de décembre et compte 13 mois de 28 jours, du lundi au dimanche. Les phases de la Lune et les événements du Soleil sont réels, pour le fuseau choisi plus haut. Pour imprimer, utilisez la fonction d'impression du navigateur sur cette page : seul le calendrier est imprimé, sur une page A4 paysage.",
 calYear:"Année-étiquette", calPrev:"‹ Précédente", calNext:"Suivante ›", calToday:"Année en cours", calPrint:"Imprimer",
 calYearLine:(a,e,s,f,b)=>`ANNÉE ${a} · ER ${e[0]} · AE ${e[1]} · ${s} – ${f} · ${b?"année bissextile (366 jours)":"année commune (365 jours)"}`,
 calLegend:"● nouvelle lune · ◐ premier quartier · ○ pleine lune · ◑ dernier quartier · ☀ solstice ou équinoxe. Les petits nombres sont les jours grégoriens. Les jours hors des mois ne font pas partie de la semaine.",
 celH: "Quel est votre signe du zodiaque ?", celP: "Choisissez votre date de naissance (ou toute autre date), au format SI ou humain. La réponse comporte deux parties : votre signe dans le zodiaque traditionnel et la constellation que le Soleil traversait réellement ce jour-là. Les deux cadrans sont en dessous.",
 celDt: "Date (format SI, UTC)", celCode: "Date au format humain (code complet)",
 celConstH: "La constellation traversée par le Soleil", celConstP: "Les 13 constellations de l'écliptique avec leurs largeurs réelles (limites de l'UAI de 1930, longitude comptée depuis l'équinoxe J2000). Ophiuchus se trouve entre le Scorpion et le Sagittaire. γ marque l'équinoxe de printemps de la date choisie, passé du Bélier aux Poissons.",
 celZodH: "Le zodiaque moderne (tropical)", celZodP: "12 secteurs égaux de 30°, comptés depuis l'équinoxe de printemps. Le signe suit les saisons, non les étoiles situées derrière.",
 constN: ["Bélier", "Taureau", "Gémeaux", "Cancer", "Lion", "Vierge", "Balance", "Scorpion", "Ophiuchus", "Sagittaire", "Capricorne", "Verseau", "Poissons"],
 zodN: ["Bélier", "Taureau", "Gémeaux", "Cancer", "Lion", "Vierge", "Balance", "Scorpion", "Sagittaire", "Capricorne", "Verseau", "Poissons"],
 celConstOut: (n, a, b, lam, lj, p) => `Le Soleil est dans la constellation <b>${n}</b>, du ${a} au ${b} (UTC). Longitude écliptique : ${lam}° depuis l'équinoxe de la date et ${lj}° depuis J2000 ; entre les deux, la précession a déplacé l'équinoxe de ${p}°.`,
 celZodOut: (n, a, b, lam, g) => `Le Soleil est dans le signe <b>${g} ${n}</b>, du ${a} au ${b} (UTC), à la longitude ${lam}°.`,
 celGap: (z, c, same) => same ? `Ici le signe et la constellation portent le même nom.` : `Le signe (${z}) et la constellation (${c}) diffèrent : le zodiaque moderne compte ses secteurs depuis l'équinoxe de printemps, tandis que les constellations sont de vrais groupes d'étoiles, de largeurs inégales.`,
 celAns: (g, z, za, zb, c, ca, cb, same, cusp, oph) => `<div><small>Votre signe dans le zodiaque traditionnel</small><b><i>${g}</i>${z}</b><span>${za} – ${zb}</span></div><div><small>La constellation que traversait le Soleil</small><b>${c}</b><span>${ca} – ${cb}</span></div><p>${same ? "Ici, le signe et la constellation portent le même nom." : "Les deux réponses diffèrent, et c’est normal : le zodiaque traditionnel a été fixé il y a près de deux mille ans (à l’époque de Ptolémée), quand l’équinoxe de printemps se trouvait dans le Bélier, et il compte ses 12 secteurs égaux de 30° à partir de ce point. À cause de la précession, l’équinoxe est passé depuis dans les Poissons, et les secteurs ne coïncident plus avec les étoiles situées derrière."}${oph ? " Ophiuchus (le Serpentaire) est une vraie constellation que traverse le Soleil, mais elle ne fait pas partie du zodiaque traditionnel." : ""}${cusp ? " Attention : vous êtes proche de la limite entre deux signes ; ces jours-là, le signe dépend de l’année, de l’heure et du lieu de naissance." : ""}</p>`,
 wk:["lu","ma","me","je","ve","sa","di"],
 tabTime:"Heure", tabDate:"Date", tabCal:"Calendrier", tabZod:"Mon signe ?", tabConv:"Convertisseur",
 nameT:"Temps précessionnel humain", nameC:"Calendrier précessionnel humain", tabAbout:"À propos", aboutH:"À propos du système",
 ab1:"<b>Le temps précessionnel humain (TPH) et le calendrier précessionnel humain.</b> Ensemble, ils forment un système de temps et de date fondé uniquement sur ce que toute personne peut observer sur Terre, sans aucune doctrine. « Précessionnel » vient de la précession des équinoxes, et « humain » signifie à l'échelle de la perception humaine.",
 ab2:"<b>Le temps.</b> Le jour est une rotation complète de la Terre, 360° et 36 heures. Une heure nouvelle vaut 10°, une minute nouvelle 1°, une seconde nouvelle 0,1° et une sous-seconde est une seconde SI, c'est-à-dire la seconde du Système international d'unités.",
 ab3:"<b>Le calendrier.</b> L'année commence au solstice de décembre et compte 13 mois de 28 jours. Le Soleil et la Lune sont calculés d'après leur position réelle dans le ciel.",
 ab4:"<b>Les ères.</b> Le mouvement le plus lent, la précession des équinoxes (25 772 ans), divise le temps en 12 ères. Un seul cycle, l'actuel (de 23332 av. J.-C. à 2440 apr. J.-C.), contient toute l'histoire connue de l'humanité, de l'art rupestre à aujourd'hui, donc toute date du passé a un code unique. Après 2440 commence le cycle suivant.",
 abSys:"À propos du système", abTut:"Tutoriel : qu'est-ce que la précession", tutH:"Qu'est-ce que la précession, en termes simples",
 tutIntro:"La Terre tourne sur son axe, mais l'axe lui-même tourne très lentement, comme celui d'une toupie. Ce mouvement dure environ 25 772 ans et s'appelle la précession des équinoxes. Déplacez le curseur et voyez ce qui change dans le ciel.",
 exPoleCap:"L'extrémité de l'axe terrestre trace un cercle parmi les étoiles. Les étoiles brillantes du cercle deviennent tour à tour étoile polaire.", exEraCap:"Position dans le cycle de 25 772 ans, divisé en 12 ères.",
 exYear:"Année", exJumps:["Thuban · 2800 av. J.-C.","Début de l'histoire écrite · 3300 av. J.-C.","Aujourd'hui","Véga · 13 700 apr. J.-C."],
 poleStar:s=>`Étoile polaire : ${s}`, poleNone:"Aucune étoile brillante près du pôle", cyc:n=>n===0?"cycle actuel":`cycle ${n>0?"+":""}${n}`,
 steps:["<b>La toupie.</b> Une toupie qui tourne garde son axe incliné, mais l'axe dessine lentement un cône. L'axe de la Terre, incliné de 23,4° sur son orbite, fait de même, en un cycle de 25 772 ans.",
 "<b>L'étoile polaire change.</b> L'axe pointe vers un autre endroit du ciel à chaque époque. Aujourd'hui vers Polaris, il y a 4 800 ans vers Thuban, et dans environ 11 700 ans vers Véga.",
 "<b>L'équinoxe glisse dans le ciel.</b> Le point où se trouve le Soleil à l'équinoxe de mars se déplace parmi les constellations d'environ 1° tous les 71,6 ans (50,3 secondes d'arc par an), en sens inverse du mouvement du Soleil. D'où l'expression populaire « ère des Poissons » ou « ère du Verseau ».",
 "<b>Une ère est un secteur de 30°.</b> On divise le cercle de 360° en 12 secteurs égaux, un par constellation du zodiaque. Un secteur se parcourt en 2 147 ans environ. Dans le système, ce sont les 12 ères précessionnelles (ER 1–12). Ce sont des unités de temps, pas de l'astrologie.",
 "<b>Comment lire ER et AE.</b> ER est l'ère et AE l'année dans l'ère (sans année zéro). L'an 2026 apr. J.-C. est ER 12 (Poissons), AE 1734, et 785 av. J.-C. est ER 11, AE 1072. ER 1 (Verseau) commence en 2441. L'étoile de référence est Spica.",
 "<b>Limites.</b> La précession réelle s'accélère légèrement, donc les limites réelles des ères ne sont pas équidistantes. Les ères égales du système en diffèrent de 6,5 ans au début d'ER 12 et de 33 ans pour ER 11, et davantage plus loin dans le passé. Un code ER-AE n'est unique que dans un cycle de 25 772 ans."],
 cities: ["Bucarest","Greenwich","New York","Los Angeles","São Paulo","Paris","Le Caire","Delhi","Pékin","Tokyo","Sydney"]
}};
const CITY_XY = [[26.1,44.4],[0,51.5],[-74,40.7],[-118.2,34.1],[-46.6,-23.5],[2.35,48.9],[31.2,30.0],[77.2,28.6],[116.4,39.9],[139.7,35.7],[151.2,-33.9]];
let LANG = I18N[document.documentElement.lang] ? document.documentElement.lang : "ro";
const t = k => I18N[LANG][k];

const LAND = "M366.5 160.1L365.7 156.5L364.3 152.9L365.3 153.8L366.5 156.2L366.7 157.6L367.4 158.3L368.7 160.4L369.6 163.2L370.0 165.3L370.9 168.1L371.4 171.6L371.7 174.5L371.5 178.4L371.1 176.2L370.7 172.3L369.9 168.7L369.0 167.5L368.0 166.9L366.7 164.7L366.1 162.8L366.2 161.7L366.5 160.1ZM352.4 139.0L351.7 136.9L352.4 137.4L354.6 140.4L354.9 141.6L356.5 143.4L356.7 144.8L354.6 142.3L353.6 140.2L352.4 139.0ZM75.3 168.1L76.7 164.3L77.3 164.4L77.6 164.9L77.7 165.2L76.8 166.7L75.8 169.0L75.6 169.0L75.3 168.1ZM138.3 338.4L140.1 340.1L141.3 340.7L143.1 341.6L144.3 342.5L143.8 343.7L142.9 343.5L142.2 344.1L141.6 343.4L139.7 343.1L139.2 342.8L138.0 341.9L137.2 340.2L137.3 339.4L136.7 337.8L137.0 337.4L138.3 338.4ZM202.5 362.9L203.0 363.5L204.8 363.2L205.5 363.8L205.5 364.2L204.5 364.6L202.7 365.2L201.4 365.5L202.3 366.2L200.3 365.9L198.1 366.0L197.3 366.6L195.6 367.5L193.5 367.6L192.2 367.7L189.8 367.2L188.2 366.5L185.5 365.8L185.1 365.3L186.7 364.8L190.1 364.5L191.8 364.6L193.7 364.5L195.9 364.3L197.5 364.0L198.7 363.4L199.7 363.2L200.2 362.7L202.0 362.4L202.5 362.9ZM207.0 358.2L208.6 359.5L208.7 358.7L209.8 359.1L210.1 360.0L212.1 360.4L213.7 360.6L215.1 360.3L216.4 360.4L215.7 361.4L215.0 362.0L213.1 361.9L212.4 362.2L212.6 362.7L212.2 362.9L211.2 363.4L210.0 364.1L208.0 364.4L207.6 364.0L206.5 363.8L208.1 363.0L207.3 362.3L204.7 361.6L204.8 361.2L206.6 361.0L207.1 360.2L207.1 359.5L206.1 358.7L206.2 358.5L205.1 357.9L203.3 356.7L202.4 355.9L203.3 355.9L204.6 356.6L206.4 357.1L207.0 358.2ZM192.5 340.3L191.6 340.3L190.6 339.8L189.2 338.9L188.0 338.0L186.9 336.9L186.7 336.4L187.5 336.7L188.6 337.4L189.4 338.0L190.0 338.4L191.5 339.5L192.5 340.3ZM216.6 338.0L217.4 338.4L217.0 338.9L215.7 339.0L214.6 338.9L214.4 338.4L215.2 338.0L216.1 338.2L216.6 338.0ZM220.0 337.2L218.7 337.5L217.4 337.7L217.1 337.3L218.2 337.1L218.8 337.0L220.0 336.7L220.4 336.6L220.2 337.2L220.0 337.2ZM195.3 334.5L194.7 334.5L194.1 333.9L194.2 333.6L195.3 334.5ZM194.2 332.5L194.4 333.5L193.9 333.2L193.4 333.2L193.2 332.8L193.4 332.0L194.2 332.5ZM132.7 146.9L131.4 146.3L130.7 146.3L130.4 145.8L130.4 145.4L131.4 145.3L131.4 144.7L130.5 144.5L130.2 144.1L130.4 143.5L129.8 142.8L129.4 141.3L128.9 139.5L128.2 137.2L127.7 135.5L127.4 133.9L128.4 132.4L129.4 130.7L130.5 130.0L132.1 129.1L132.9 129.1L133.7 129.7L134.8 129.8L135.5 130.2L135.8 131.1L135.2 131.9L135.5 132.2L135.3 133.5L135.7 134.1L136.4 134.1L137.2 134.3L138.0 135.0L137.9 135.9L138.2 136.6L137.5 137.3L136.9 138.3L136.5 139.0L135.9 139.6L135.5 140.9L134.9 142.6L134.9 143.4L135.4 143.5L134.8 144.0L134.6 145.4L135.1 145.8L135.0 146.7L134.2 146.9L133.5 147.0L132.7 146.9ZM152.2 311.8L152.3 312.9L153.6 313.4L153.8 314.1L154.4 315.0L153.9 315.3L153.8 316.3L153.7 317.0L154.1 317.4L154.0 318.5L153.5 318.8L153.7 319.8L155.2 321.5L156.2 322.8L157.2 323.9L156.8 324.0L157.5 325.2L157.6 326.7L158.5 326.9L159.0 327.7L159.5 327.9L159.3 329.1L160.3 330.4L161.0 331.2L162.2 332.8L162.3 333.9L162.1 334.5L161.6 335.0L162.2 336.3L161.6 337.2L161.0 337.4L160.0 338.0L159.8 338.6L159.0 339.1L157.6 339.5L155.9 339.2L154.7 339.5L153.7 339.6L152.6 340.1L151.6 340.1L150.6 340.5L150.0 341.0L149.9 341.4L148.5 341.0L146.1 339.6L144.0 338.8L142.8 338.5L141.3 338.1L139.9 336.6L138.7 335.5L139.4 335.3L138.2 334.7L135.9 334.1L134.4 332.5L133.4 331.6L132.3 330.6L130.7 328.9L129.9 327.3L130.1 326.4L130.0 325.6L129.4 324.5L127.8 322.9L128.7 323.0L128.8 322.0L127.4 321.8L125.7 320.5L127.1 320.9L127.8 320.7L128.8 320.9L129.2 320.2L127.2 319.6L125.8 318.8L124.6 318.8L123.5 317.2L124.0 316.8L123.5 315.2L122.9 314.0L123.4 314.2L121.8 311.5L120.7 310.3L119.6 308.3L116.8 305.1L114.6 303.0L112.7 301.1L111.4 299.3L109.5 297.6L108.2 296.1L107.4 296.0L106.6 295.5L105.4 293.9L104.6 292.7L103.6 290.8L102.6 289.4L101.8 288.0L100.6 287.0L100.3 286.4L99.4 285.5L98.6 284.6L97.8 283.1L97.1 281.6L96.6 279.0L96.2 277.8L96.8 277.6L97.4 278.6L97.8 278.8L98.2 278.6L99.0 278.5L99.4 278.0L99.9 276.4L100.3 275.8L100.9 275.6L101.2 274.5L101.5 274.3L101.5 273.2L102.1 272.6L102.4 271.1L102.7 270.6L102.7 271.7L103.3 270.6L103.5 271.7L103.3 272.5L103.8 272.2L104.2 270.9L104.4 270.6L104.5 270.0L105.2 269.9L105.6 270.2L106.2 270.3L106.7 269.8L107.8 270.3L107.1 270.8L108.2 271.3L109.3 272.7L110.1 273.5L111.2 274.7L111.7 275.6L111.9 276.1L113.0 277.4L113.7 278.5L114.1 278.7L114.5 279.1L115.0 280.1L116.4 281.9L117.4 282.6L118.2 282.8L119.3 283.5L119.8 283.3L120.3 283.1L121.8 283.8L121.5 285.0L122.2 285.6L122.2 284.7L123.0 285.0L123.3 285.8L124.2 285.6L125.2 286.2L125.9 286.3L126.6 287.0L126.9 286.9L127.3 287.7L127.5 287.5L128.2 288.1L128.9 288.8L129.4 290.3L129.5 291.6L130.3 292.6L131.1 293.6L131.3 292.9L132.5 293.1L133.3 293.6L133.3 293.2L134.4 293.4L135.5 294.1L136.0 294.9L137.3 296.0L137.7 295.6L137.0 294.3L137.8 294.9L138.5 296.1L138.9 297.1L139.8 298.5L140.3 298.8L140.9 299.9L141.9 300.5L142.4 301.1L142.9 301.3L143.1 302.3L142.4 302.3L141.5 302.2L141.0 301.7L140.9 302.2L140.1 302.2L139.2 302.1L139.0 302.4L139.8 303.9L140.7 305.3L141.2 306.3L141.8 307.7L142.3 308.1L142.9 309.0L142.9 309.5L144.2 311.0L145.5 311.6L146.2 311.4L146.8 311.3L147.4 311.0L148.4 310.7L148.5 310.1L148.8 309.9L149.0 309.3L149.7 308.8L150.2 308.9L150.2 308.4L150.9 308.2L151.6 308.0L151.8 307.8L152.6 307.9L152.7 308.6L152.4 309.3L152.7 309.7L152.5 310.1L152.7 311.0L152.5 311.5L152.2 311.8ZM186.1 325.2L186.5 325.7L185.2 325.3L184.7 324.4L185.7 325.0L186.1 325.2ZM125.2 276.3L124.8 275.6L124.2 273.0L125.3 274.5L125.5 275.5L125.5 276.3L125.2 276.3ZM184.0 323.8L183.3 323.6L182.2 323.1L181.9 322.8L182.1 322.4L183.3 323.0L183.8 323.4L184.0 323.8ZM185.6 324.0L185.2 324.1L184.2 322.7L184.0 322.0L184.6 322.2L185.0 323.3L185.6 324.0ZM129.2 282.3L128.0 281.1L128.0 280.8L128.4 280.7L129.4 281.0L130.9 282.3L131.2 282.4L132.3 283.6L133.2 284.6L133.6 285.0L133.9 285.6L133.3 285.3L131.7 284.0L130.5 282.8L129.2 282.3ZM124.6 270.5L124.7 271.2L125.3 272.2L125.2 272.8L123.9 271.0L123.2 269.9L122.7 269.0L123.6 269.3L124.1 270.2L124.6 270.5ZM129.4 278.6L128.7 278.7L127.0 276.5L125.8 274.2L126.1 274.0L127.1 275.2L127.4 276.4L128.2 277.4L129.4 278.6ZM182.8 321.6L182.8 321.8L181.6 320.8L180.7 320.1L180.2 319.5L180.5 319.5L181.2 320.1L182.5 321.1L182.8 321.6ZM179.1 319.0L178.7 318.9L178.1 318.3L177.5 317.6L177.7 317.5L178.5 318.3L179.1 319.0ZM119.1 254.0L120.2 257.4L120.8 257.6L121.6 261.0L121.2 261.9L122.1 264.6L122.5 266.9L121.2 265.2L120.8 263.1L120.1 261.5L119.4 259.7L119.0 258.0L118.6 255.8L118.3 254.4L117.9 253.7L117.3 250.3L117.7 249.9L117.3 248.2L118.6 249.2L119.2 251.3L119.2 252.9L119.4 253.6L119.1 254.0ZM144.8 294.5L143.6 294.3L144.1 293.6L144.6 293.6L145.1 293.6L145.2 294.1L144.8 294.5ZM176.5 317.2L176.0 317.1L175.4 316.4L175.0 315.4L175.0 314.5L175.2 314.5L175.3 314.9L175.7 315.3L176.2 316.3L176.8 317.0L176.5 317.2ZM170.7 312.7L169.8 312.3L169.4 312.5L168.4 312.2L167.4 312.0L166.6 311.5L165.4 310.4L164.7 309.6L165.0 309.4L166.3 310.4L167.2 310.8L167.7 310.5L168.0 310.6L167.8 311.2L168.8 311.7L169.4 311.6L170.5 311.7L170.6 311.1L171.6 311.6L171.8 311.9L171.5 312.4L170.7 312.7ZM138.2 282.2L137.5 281.9L136.9 280.8L137.1 280.2L138.2 281.7L138.2 282.2ZM142.1 286.5L141.9 287.5L141.2 286.1L140.4 284.8L139.7 284.1L138.9 283.1L139.7 283.1L141.1 284.8L142.1 286.5ZM173.0 312.7L172.4 312.7L172.4 312.0L172.2 311.4L171.7 310.7L171.0 309.8L170.0 308.9L170.6 308.9L171.3 309.7L171.7 310.2L172.2 310.8L172.7 311.5L173.1 312.1L173.0 312.7ZM148.0 289.8L147.1 291.4L148.0 293.2L149.8 293.4L151.8 294.3L152.9 295.3L153.8 296.6L154.6 297.8L155.9 299.2L157.9 301.7L160.2 304.1L160.9 305.3L161.4 306.3L161.3 307.0L163.4 309.3L163.5 310.0L162.0 309.2L162.0 310.0L163.0 311.5L163.4 313.2L164.4 313.7L164.1 314.1L165.2 315.0L164.6 314.9L166.2 316.3L165.8 316.5L164.7 315.9L164.4 315.4L163.1 314.5L161.5 313.3L160.6 311.9L160.0 310.8L159.8 309.5L158.0 307.7L156.5 307.0L155.4 306.6L155.1 307.4L153.7 306.8L153.0 306.0L151.4 304.8L150.7 303.0L149.4 301.6L148.8 301.5L147.0 300.0L148.2 299.8L149.3 300.4L149.7 299.2L149.7 297.9L147.7 294.8L146.7 293.7L145.6 291.0L144.8 291.0L144.3 290.6L144.3 290.0L144.6 289.7L144.1 288.3L145.7 289.4L146.6 290.4L146.7 290.1L144.9 288.2L144.9 287.2L144.0 285.9L144.0 285.0L145.7 286.6L146.6 287.0L148.1 289.3L148.0 289.8ZM140.4 276.2L138.7 275.7L137.8 274.8L137.1 273.3L135.6 270.9L134.6 269.6L133.8 269.8L133.8 271.7L134.7 272.2L136.7 274.8L136.2 274.9L135.9 274.2L135.0 273.9L133.8 272.8L133.5 275.0L133.0 274.9L132.8 277.0L132.2 277.4L131.4 276.7L131.3 275.9L132.6 276.2L131.3 274.9L131.3 274.3L131.8 274.3L131.6 272.9L132.6 272.4L131.7 271.6L130.7 272.4L129.4 273.2L128.7 272.3L128.6 271.5L129.7 271.4L130.5 270.6L130.1 270.0L130.5 269.1L131.5 269.4L132.4 269.2L134.3 269.2L134.8 269.2L136.3 270.1L136.7 271.4L137.7 273.3L138.8 274.9L140.5 275.8L140.4 276.2ZM143.7 281.1L142.9 281.6L142.4 280.9L141.7 281.1L141.7 282.0L141.3 281.7L141.4 280.7L142.2 279.5L143.1 279.2L143.8 279.4L143.4 279.9L143.9 280.7L143.7 281.1ZM118.6 248.7L118.0 246.8L118.5 245.1L118.8 242.6L119.3 241.7L119.9 240.2L120.6 239.2L121.8 237.6L122.5 235.9L123.3 235.3L124.1 234.5L124.6 232.9L125.4 231.9L125.8 230.6L126.9 228.8L127.4 228.6L127.5 229.6L127.6 232.1L126.7 233.7L126.2 235.1L125.9 236.1L125.0 237.9L125.3 239.5L124.8 241.1L124.2 242.3L124.0 243.7L122.9 243.2L122.8 244.2L122.9 244.9L122.3 245.3L121.8 246.1L122.1 247.4L121.7 248.4L120.2 248.3L118.6 248.7ZM134.3 265.3L134.3 267.5L133.2 265.8L132.3 265.6L131.4 266.2L130.0 265.0L129.0 265.4L127.2 265.6L127.4 265.2L126.1 263.5L126.4 262.6L125.9 261.4L125.9 260.4L124.7 258.6L125.0 257.8L124.5 256.8L124.1 255.3L125.4 254.6L125.4 253.6L126.0 252.5L126.8 252.0L127.8 251.9L128.9 252.6L128.9 253.9L129.6 255.0L130.6 255.0L131.0 255.6L132.0 257.3L133.3 258.1L134.2 258.5L134.9 259.0L136.0 260.0L137.2 260.8L138.4 261.1L138.7 261.7L138.6 262.7L138.2 262.9L138.4 264.0L138.8 265.4L138.3 265.5L137.8 264.5L137.4 265.1L136.5 264.2L135.2 263.8L134.8 265.4L134.3 265.3ZM147.7 273.2L147.3 273.8L146.8 274.2L145.7 274.4L146.2 273.3L145.4 273.0L145.0 273.9L144.3 273.8L143.7 271.9L144.2 271.0L144.9 271.2L144.7 270.0L144.1 269.9L143.7 269.2L142.6 268.6L142.7 268.2L143.8 268.2L144.6 268.9L145.4 269.3L145.3 270.1L146.2 270.9L146.8 270.8L147.4 271.7L148.1 271.1L148.4 272.5L148.0 272.9L147.7 273.2ZM128.9 205.9L128.9 204.5L129.9 203.9L131.5 203.9L133.1 204.9L132.3 205.9L131.5 206.5L130.2 207.0L129.1 206.6L128.9 205.9ZM296.8 177.3L297.5 178.4L297.6 178.7L297.1 178.4L296.7 178.7L296.2 178.0L296.1 177.7L296.8 177.3ZM147.3 269.0L146.7 268.8L145.8 268.7L145.3 268.5L145.4 267.3L145.8 267.4L146.3 267.6L147.0 267.3L147.5 268.0L146.7 268.2L148.2 268.5L147.3 269.0ZM142.0 262.4L140.1 261.0L141.2 261.3L142.3 262.0L143.4 262.4L144.7 262.6L144.1 263.3L143.1 262.7L142.0 262.4ZM147.0 265.4L147.2 266.3L147.8 267.1L147.4 267.4L146.6 267.0L145.8 266.4L146.2 266.1L146.7 265.9L147.0 265.4ZM150.3 269.7L149.5 270.8L149.1 269.7L148.8 269.9L148.5 270.6L147.9 270.1L148.5 269.6L148.2 269.2L148.7 268.7L149.1 269.4L149.4 269.2L149.6 268.0L150.4 269.1L150.3 269.7ZM147.9 264.3L146.9 264.4L147.0 263.6L147.3 262.5L147.9 263.6L147.9 264.3ZM152.8 260.9L153.0 261.8L153.5 262.0L153.3 262.2L152.8 262.3L152.4 263.1L151.4 263.3L150.7 262.8L149.8 263.0L149.2 263.8L149.5 264.5L150.0 265.0L150.5 266.8L149.9 267.0L149.9 267.6L149.4 267.7L149.2 266.5L149.4 265.7L148.9 265.6L148.9 264.5L148.1 263.4L147.9 262.7L148.4 262.5L148.8 262.7L148.8 262.2L148.4 262.3L148.6 261.4L148.9 260.9L149.8 260.4L149.7 261.0L151.3 260.3L152.4 260.2L152.8 260.9ZM291.9 187.4L292.3 187.6L292.7 188.5L293.1 189.3L292.7 189.5L292.4 189.4L292.0 188.4L291.8 187.7L291.9 187.4ZM297.3 202.0L297.6 202.4L297.5 203.2L297.3 204.0L297.0 203.9L296.8 203.4L296.8 203.1L296.7 202.1L296.8 201.4L297.0 201.1L297.3 202.0ZM293.6 196.9L293.4 195.7L293.2 195.6L292.8 194.6L292.8 193.8L292.7 193.5L293.0 193.1L292.7 192.4L293.0 192.3L292.8 191.8L293.0 191.0L293.6 191.3L293.6 192.0L293.9 192.6L294.0 193.0L294.2 193.2L294.5 193.7L294.3 193.9L294.6 194.3L295.5 194.6L295.4 195.0L295.2 195.2L295.3 196.1L295.5 196.7L295.7 197.5L296.1 198.1L295.9 198.9L295.6 198.9L295.4 197.6L295.1 196.6L294.8 196.2L294.5 196.9L294.1 197.0L294.2 197.9L293.8 197.7L293.6 196.9ZM146.4 247.3L145.5 246.3L145.5 245.2L146.4 244.8L147.1 245.3L147.8 246.6L148.1 247.3L147.8 247.7L147.1 247.3L146.4 247.3ZM252.3 291.0L252.2 291.3L251.8 291.3L251.7 291.0L251.4 290.7L251.4 290.5L251.5 290.3L251.3 290.1L251.4 290.0L251.5 290.0L252.0 289.9L252.3 289.9L252.5 290.0L253.0 290.2L253.0 290.2L252.6 290.7L252.3 291.0ZM250.9 289.7L250.6 290.0L250.3 289.9L250.1 289.8L250.0 289.8L250.1 289.7L250.6 289.6L251.0 289.6L250.9 289.7ZM249.9 289.6L249.9 289.7L249.2 289.9L249.3 289.8L249.9 289.6ZM248.7 289.9L248.7 290.0L248.6 290.0L248.1 290.1L247.9 289.9L247.8 289.9L248.1 289.7L248.2 289.7L248.7 289.9ZM246.4 290.0L246.3 290.2L245.8 290.1L245.8 290.0L246.0 289.9L246.3 289.8L246.4 290.0ZM292.8 206.7L293.1 206.2L292.7 205.0L292.9 204.5L293.3 203.3L293.6 202.4L293.5 201.9L293.5 201.1L293.8 201.1L293.6 200.2L293.8 199.1L294.1 199.2L294.4 200.0L294.7 200.9L294.9 201.8L295.4 203.6L294.6 202.9L294.4 203.5L294.6 204.3L294.3 204.9L293.8 205.3L294.0 206.0L293.9 207.3L293.7 207.7L293.8 209.4L293.7 209.9L293.3 209.4L293.5 210.7L294.1 211.5L294.2 212.1L294.5 212.2L294.7 212.9L294.6 213.4L294.2 212.8L293.8 212.5L293.5 212.0L293.2 211.4L293.0 210.4L292.8 210.1L292.7 209.0L292.6 208.0L292.8 206.7ZM291.1 204.3L291.3 204.6L290.7 205.0L290.5 205.5L289.8 205.4L289.7 205.0L290.5 204.4L291.1 204.3ZM156.7 258.3L155.7 258.3L156.1 257.2L156.8 256.7L158.1 256.8L159.3 257.2L159.3 257.8L158.7 258.0L156.7 258.3ZM288.2 205.3L288.6 206.5L288.2 206.7L288.1 206.2L287.9 205.4L288.2 205.3ZM288.0 204.3L288.8 204.3L288.7 204.6L288.1 204.7L287.8 205.3L287.7 205.4L288.0 204.3ZM176.3 263.2L176.1 263.5L175.2 263.6L175.2 263.0L174.6 262.8L173.9 263.0L173.7 262.3L174.1 261.9L174.9 261.9L175.3 262.4L175.9 262.4L176.3 263.2ZM186.1 170.8L186.4 170.0L186.2 169.9L186.2 169.8L186.8 168.9L187.3 168.7L187.8 168.9L187.4 169.2L187.3 169.3L187.3 169.6L186.7 170.0L186.1 170.8ZM196.0 165.3L195.3 165.2L194.6 165.6L193.9 165.9L193.8 165.7L193.4 166.1L193.3 165.7L194.7 165.0L194.7 165.1L196.0 164.8L196.0 165.3ZM204.8 165.1L204.9 164.2L204.6 163.9L204.7 163.3L205.6 163.5L206.1 163.5L207.6 163.7L207.6 164.3L206.4 164.5L205.5 164.8L204.8 165.1ZM211.4 167.0L210.7 166.3L210.6 164.9L211.1 164.9L211.4 164.5L211.8 164.7L212.0 166.0L212.3 166.6L211.8 166.6L211.4 167.0ZM183.4 265.2L182.5 265.6L182.3 266.1L181.4 266.4L180.0 265.9L178.6 264.7L176.6 264.6L176.4 263.8L177.0 263.2L175.5 262.0L174.3 261.4L173.4 260.5L173.5 261.8L171.6 262.5L170.8 262.3L170.8 261.6L171.7 261.2L171.5 260.4L171.8 259.6L172.7 260.2L173.6 260.1L174.8 260.6L175.8 260.6L177.5 261.9L178.1 262.9L180.3 262.2L180.4 263.0L182.2 263.2L183.0 263.3L184.3 262.6L185.0 261.6L185.7 261.3L186.6 261.8L186.1 263.3L185.5 264.0L184.1 264.3L183.4 265.2ZM211.3 168.1L211.4 167.2L211.9 167.4L212.2 168.1L212.1 168.5L211.6 169.0L211.3 168.1ZM190.3 260.7L190.7 261.3L191.5 261.3L190.9 262.4L189.6 261.9L188.4 262.3L187.7 260.8L186.5 261.4L185.7 260.8L186.3 259.9L187.2 259.5L188.0 260.1L189.1 259.0L189.9 258.5L190.0 260.0L190.3 260.7ZM262.8 198.8L262.7 198.2L262.3 197.5L262.9 197.7L263.1 197.9L263.2 199.1L262.9 199.4L262.5 199.3L262.8 198.8ZM259.6 198.7L259.8 199.1L260.0 200.1L259.8 201.0L259.6 200.8L259.4 199.8L259.5 198.9L259.6 198.7ZM258.1 245.2L258.0 245.6L256.8 246.4L256.3 246.4L255.6 246.7L255.3 246.6L254.6 247.1L254.0 247.0L253.8 246.8L254.5 246.3L254.9 246.0L255.4 245.5L255.9 245.5L256.6 245.5L257.4 245.1L258.1 245.2ZM255.9 195.9L257.0 195.8L256.4 195.6L256.3 195.0L256.8 195.0L256.6 194.3L256.2 194.1L256.0 193.3L256.8 193.0L256.3 192.7L256.7 192.3L257.1 191.7L258.1 191.4L258.4 191.6L258.5 192.2L257.7 192.6L257.7 192.8L259.0 193.1L259.3 193.5L258.5 193.3L258.8 194.1L259.3 194.8L260.1 196.2L259.9 196.4L259.3 196.2L259.2 196.7L258.3 196.4L256.4 196.7L255.6 196.6L254.9 196.3L254.8 196.0L255.1 196.0L255.9 195.9ZM249.1 246.8L249.4 246.3L250.2 247.3L251.3 247.4L251.1 247.6L250.5 247.6L249.9 247.4L249.4 247.5L249.0 247.2L248.7 247.0L249.1 246.8ZM194.4 254.8L193.9 256.8L193.2 255.8L191.8 256.8L191.8 258.2L191.3 258.8L191.2 257.9L190.2 258.2L190.7 257.4L191.4 256.6L192.1 255.6L192.7 255.1L193.7 253.9L194.0 252.8L195.0 251.7L195.8 251.7L195.9 251.1L196.2 251.2L195.9 251.9L195.5 252.8L194.8 253.7L194.4 254.8ZM224.9 178.8L226.3 178.3L227.3 178.6L226.5 179.7L226.7 180.8L225.6 181.5L225.1 182.0L224.5 182.0L223.8 181.2L224.3 180.5L224.3 179.7L224.9 178.8ZM211.7 183.1L211.9 182.1L212.7 182.6L212.9 183.0L212.0 183.6L211.7 183.1ZM236.4 252.2L236.0 252.9L235.6 252.8L235.3 252.4L235.7 251.8L235.9 251.5L236.3 251.3L236.7 251.5L236.4 252.2ZM221.8 185.5L222.5 184.4L221.9 184.5L221.2 184.5L221.4 183.6L222.0 182.6L221.4 182.5L220.8 181.1L220.3 180.9L219.9 179.7L219.7 179.2L218.8 179.0L218.9 178.3L219.2 178.0L218.9 177.4L219.6 176.8L220.6 176.9L221.9 176.6L222.2 176.8L222.8 176.3L223.5 176.5L224.0 176.1L224.4 176.4L223.2 177.5L222.5 177.6L223.7 177.9L223.8 178.4L223.1 178.6L223.4 179.3L223.2 180.0L222.2 179.8L222.0 180.4L222.5 181.2L223.3 181.4L223.4 181.7L223.1 182.2L223.3 182.5L223.7 182.0L223.7 183.1L223.9 183.7L223.6 184.8L223.0 185.6L222.5 185.5L221.8 185.5ZM228.2 252.1L227.9 252.3L227.5 252.2L227.1 252.0L227.6 251.7L228.1 251.7L228.2 252.1ZM250.1 214.3L250.7 214.4L250.6 214.7L250.3 214.8L250.3 214.8L249.9 214.7L249.9 214.5L250.1 214.3ZM249.7 215.8L250.4 216.3L250.4 216.7L250.1 216.8L249.6 216.5L249.5 215.8L249.7 215.8ZM224.1 248.5L224.5 248.7L224.8 248.5L225.2 248.8L225.8 248.8L225.7 248.9L225.4 249.2L225.0 249.1L224.7 248.9L224.3 249.0L224.2 249.0L224.1 248.5ZM246.7 217.7L247.2 217.6L247.0 217.4L247.2 217.1L247.5 216.5L247.8 215.9L248.3 215.8L248.2 215.4L248.5 215.0L248.9 215.4L248.7 216.2L248.3 216.6L248.9 217.0L249.6 217.7L248.9 217.9L249.1 218.6L248.5 218.2L247.6 218.2L246.6 218.1L246.7 217.7ZM226.5 194.9L226.8 194.3L226.4 193.4L227.3 192.7L228.8 192.4L229.3 192.4L229.9 192.8L231.1 193.6L230.4 193.9L231.2 194.8L230.3 194.6L230.2 194.9L231.1 195.6L230.5 196.1L229.8 196.0L229.4 195.0L228.5 195.3L228.1 194.9L227.2 195.2L226.5 194.9ZM244.4 213.9L244.5 214.3L244.0 214.6L243.4 214.5L243.2 214.2L243.4 213.8L243.8 213.7L244.0 213.7L244.4 213.9ZM220.0 243.1L221.0 244.0L222.2 245.0L222.2 245.7L222.6 245.9L222.4 245.1L223.6 245.1L224.6 246.0L224.3 246.6L223.5 246.8L223.6 247.9L223.5 248.1L223.0 248.1L222.6 247.8L221.9 247.5L221.8 247.0L221.3 246.9L220.8 247.1L220.5 246.7L220.6 246.3L220.1 246.5L220.3 247.1L220.0 247.5L220.0 247.5L219.4 248.0L218.7 247.9L219.2 248.5L219.4 249.4L219.7 249.7L219.7 250.2L219.6 250.5L218.6 250.2L217.1 250.9L216.6 251.0L215.6 251.7L214.7 252.2L214.4 252.7L213.8 251.8L212.1 252.3L212.0 251.8L211.3 252.1L210.6 251.8L210.2 252.4L209.2 253.2L209.1 253.7L209.7 254.1L209.2 255.6L208.6 255.5L208.0 256.3L208.1 256.8L206.8 256.9L206.2 258.0L205.1 257.9L204.5 258.9L203.1 259.4L203.1 258.6L203.5 257.0L204.2 254.6L205.1 253.4L205.8 253.0L206.1 252.5L207.0 252.7L208.5 251.7L209.9 251.0L211.1 250.5L211.9 249.1L211.3 249.0L210.7 249.8L209.0 250.5L209.0 249.0L207.6 248.9L205.5 250.0L205.7 250.8L204.4 250.4L203.5 250.1L203.9 249.4L203.2 248.8L202.3 248.9L200.9 247.8L199.1 246.9L196.2 247.3L192.6 247.5L193.3 248.3L193.1 249.1L193.4 249.7L194.1 249.6L194.6 250.1L194.6 251.7L194.1 252.5L192.9 252.9L192.1 253.9L190.7 255.0L188.7 255.5L188.0 255.8L186.3 256.0L184.5 256.1L183.7 256.2L182.4 255.8L182.0 255.3L182.0 254.6L180.6 254.2L180.2 254.3L180.0 254.0L179.5 254.0L179.0 254.0L178.4 254.5L177.9 254.3L177.7 254.3L177.2 254.2L176.7 253.8L176.2 253.7L175.8 253.9L175.6 253.9L175.7 254.3L175.7 255.1L175.2 256.6L174.8 257.2L173.8 258.0L173.1 258.1L172.4 257.5L171.5 257.1L170.8 256.4L171.2 255.9L172.0 255.6L172.7 254.5L173.3 255.0L173.6 253.9L173.5 253.4L173.2 253.4L173.0 253.2L173.2 253.1L173.1 252.8L173.1 252.5L173.6 252.5L173.9 252.6L174.0 252.4L174.6 252.2L174.7 252.1L174.5 251.6L174.5 251.0L173.5 250.1L172.7 249.7L171.8 249.0L172.5 249.2L172.8 248.8L173.8 249.0L174.1 248.3L173.3 247.8L172.1 247.3L171.2 247.1L170.7 246.3L170.0 246.1L169.6 246.9L169.8 247.7L169.4 247.9L169.5 248.8L170.8 249.4L170.9 250.4L171.2 250.9L170.8 251.4L169.8 250.3L169.0 250.2L168.0 249.6L167.1 249.5L167.1 250.8L166.4 251.7L165.9 252.8L165.6 253.9L164.8 254.3L164.2 253.9L163.9 254.4L163.9 255.2L163.1 255.5L162.2 255.7L161.7 255.2L160.3 255.0L158.5 254.9L156.8 254.5L155.1 253.5L153.5 252.3L152.7 251.0L152.0 250.5L152.1 249.9L151.3 249.5L150.1 248.0L149.4 246.8L148.2 246.8L147.9 246.1L148.5 245.5L149.0 245.6L148.8 243.9L148.4 243.3L147.0 241.9L145.7 241.1L144.9 241.1L144.0 242.4L143.0 244.1L142.8 245.5L142.2 246.6L140.5 247.9L138.6 248.3L137.5 247.4L136.3 245.9L135.1 245.0L133.6 243.4L134.1 242.7L134.9 242.9L135.3 241.7L135.1 240.4L135.5 239.6L136.5 238.6L136.7 237.2L136.4 236.0L137.3 236.0L137.1 234.8L135.8 234.9L134.1 234.3L133.1 234.0L132.3 234.2L132.4 235.2L131.6 236.0L130.7 236.5L130.2 237.5L130.3 238.5L129.9 239.4L129.9 239.8L129.4 240.8L128.9 241.7L128.2 241.9L127.7 241.9L127.3 242.1L126.7 242.4L126.6 243.0L125.8 243.9L125.4 244.0L125.1 242.8L125.5 241.1L125.9 239.0L126.4 238.7L127.0 237.6L127.8 237.2L128.3 236.5L129.1 236.5L129.5 236.1L129.8 235.4L130.3 235.0L130.8 234.1L131.2 233.3L130.5 233.1L131.1 232.7L131.8 232.8L132.9 233.1L133.7 232.8L134.6 233.2L135.2 232.6L136.4 232.5L136.8 231.8L138.1 231.2L139.4 230.7L140.2 230.0L139.6 229.2L138.6 227.6L138.7 226.8L138.9 225.9L140.3 226.3L141.3 226.0L142.5 224.8L142.9 224.9L143.0 224.1L143.8 223.2L144.4 222.8L144.9 222.7L145.4 222.4L146.1 221.8L146.1 220.6L145.6 220.8L145.0 220.4L145.2 219.8L145.0 219.6L145.2 219.2L145.3 218.7L144.9 218.5L144.9 217.7L144.8 216.0L143.9 216.1L143.3 215.3L142.7 213.3L141.6 211.7L141.0 210.6L140.5 209.1L140.0 209.0L139.8 208.3L139.6 207.0L139.6 206.3L138.9 205.7L137.4 205.8L136.5 205.7L135.6 204.9L133.8 204.6L133.9 203.8L133.2 202.9L132.7 203.3L132.7 201.9L132.1 201.2L131.9 200.5L133.2 199.3L134.9 199.0L136.1 198.7L136.7 198.3L138.0 197.8L139.4 197.8L140.1 197.8L141.9 196.9L144.1 197.0L145.6 197.0L146.9 197.4L147.9 197.5L147.9 195.4L148.3 194.6L150.2 193.4L150.3 194.2L150.9 193.9L152.3 192.9L152.9 192.1L153.8 192.1L154.9 191.5L155.7 189.4L156.6 187.5L157.2 185.9L158.7 184.0L159.6 183.0L160.5 181.9L161.9 182.2L162.3 181.8L162.7 180.9L163.0 179.6L164.1 178.7L165.5 178.2L166.5 177.5L167.8 177.5L169.5 177.8L169.7 177.2L170.5 176.9L170.5 176.3L171.0 175.8L170.4 175.7L170.3 175.4L169.4 175.1L168.4 174.9L167.8 175.1L167.4 175.0L166.5 175.4L166.1 175.1L165.9 174.8L165.5 174.7L165.1 174.8L164.7 174.7L164.4 174.6L165.0 175.1L165.3 175.7L165.2 176.1L164.7 176.1L164.1 175.7L163.8 175.1L163.3 175.1L163.2 175.3L163.0 175.1L162.5 176.0L161.8 176.8L161.4 177.4L161.5 178.5L161.5 179.7L161.6 180.7L161.8 181.2L161.6 181.3L161.3 181.0L161.2 180.7L160.4 180.4L159.4 180.4L158.7 180.8L158.1 181.5L157.5 182.1L156.7 182.2L156.2 182.3L155.9 182.7L155.6 182.6L155.3 181.8L155.2 181.5L155.1 180.8L154.8 180.0L155.1 179.5L155.1 179.1L154.7 178.7L154.0 178.4L153.9 178.2L154.3 177.7L154.4 176.8L154.0 176.4L154.0 176.0L154.5 175.3L154.6 174.6L154.2 174.4L154.3 173.7L154.9 173.1L155.1 172.1L155.5 171.6L155.9 170.6L155.6 170.1L155.4 169.8L155.9 168.4L157.0 166.3L157.2 164.8L157.6 164.3L157.9 164.0L158.2 163.1L158.7 162.2L159.5 161.3L159.7 161.0L159.7 160.6L159.9 160.2L159.9 159.9L160.4 159.4L160.7 158.9L161.4 158.3L162.2 158.5L162.5 158.9L162.9 159.0L163.7 159.4L164.3 159.4L164.1 159.7L164.6 160.0L164.6 160.2L165.0 160.5L165.4 160.8L166.0 160.7L166.3 161.0L167.1 160.8L168.3 161.0L169.2 161.4L170.4 161.4L170.9 161.1L172.3 161.4L172.9 161.9L173.3 162.4L174.6 162.9L175.3 162.9L176.0 162.6L176.7 162.9L176.8 163.1L177.4 163.4L177.9 163.4L178.7 163.7L179.9 164.0L180.8 164.3L181.3 163.9L181.5 164.5L181.6 164.9L181.8 165.3L181.9 165.4L181.9 164.9L181.7 164.1L181.6 163.4L181.7 163.1L182.3 163.2L183.0 163.3L184.5 164.2L184.6 164.0L183.5 163.3L182.3 162.8L180.6 161.8L179.9 161.6L179.2 161.3L177.6 161.0L177.7 160.7L177.2 160.1L175.4 160.2L175.1 160.2L174.1 159.6L174.2 159.2L173.4 158.4L172.2 157.7L171.6 157.8L170.8 157.9L169.4 157.5L168.4 156.9L167.5 157.0L165.3 157.5L164.3 157.5L163.3 157.6L162.7 157.6L161.9 157.9L161.4 157.9L161.2 157.5L161.6 156.7L160.9 157.0L160.4 157.2L159.9 157.0L159.1 157.2L158.5 157.7L157.7 158.9L156.7 160.2L156.0 161.4L155.6 162.0L155.3 162.6L154.8 163.2L154.5 163.6L154.2 164.2L153.8 164.9L153.6 165.7L153.2 166.2L153.0 166.0L152.6 165.5L152.1 165.1L152.0 164.6L151.4 163.5L150.9 162.2L150.5 160.5L150.1 158.4L150.2 156.5L150.4 154.1L150.9 152.3L151.9 149.7L152.5 148.0L153.0 145.7L152.9 145.0L153.1 144.6L153.7 143.4L153.7 142.8L154.2 142.3L153.9 141.5L154.0 140.8L153.8 140.0L154.2 139.3L154.0 137.7L153.5 137.3L152.3 137.7L152.1 137.5L152.1 136.7L151.8 136.5L151.5 136.0L150.6 135.9L149.3 135.6L148.6 135.9L148.0 135.7L147.4 134.8L146.6 134.2L145.4 133.0L144.8 132.8L144.7 131.8L144.8 130.7L145.4 129.4L146.6 127.8L148.1 126.0L149.3 123.6L149.8 123.0L150.5 121.5L151.1 120.8L150.8 120.1L149.5 120.0L148.8 119.7L148.6 119.4L148.3 119.7L147.7 118.8L147.7 118.2L147.2 118.3L147.2 117.7L147.7 116.9L149.0 115.6L150.9 113.6L151.5 112.7L151.1 112.4L150.5 112.7L150.4 112.1L150.4 111.1L150.2 110.2L150.4 109.5L151.4 108.2L151.7 107.8L152.3 106.8L152.5 106.0L153.3 104.7L155.0 102.4L156.1 101.0L157.5 99.7L159.5 98.2L160.6 97.6L160.7 97.2L162.1 96.8L163.1 96.1L165.5 95.2L166.8 94.5L167.7 94.2L169.8 92.9L171.7 92.0L172.9 91.1L173.9 90.7L175.0 90.7L175.8 90.5L176.9 90.6L177.0 90.4L177.3 90.6L177.5 91.2L178.5 91.7L177.8 92.1L178.2 92.9L179.9 93.4L181.3 93.9L181.3 93.9L183.3 94.8L185.1 95.2L186.2 95.7L187.0 96.6L187.7 97.2L188.8 98.7L189.2 100.0L189.6 100.5L190.5 100.7L191.8 101.3L193.2 102.4L193.8 102.9L195.7 103.6L196.0 104.4L196.3 105.1L196.2 106.1L195.8 107.2L195.8 107.7L195.3 108.8L195.0 109.3L194.0 110.3L193.5 110.9L193.5 111.8L193.8 112.3L194.4 112.6L195.1 113.1L195.7 113.7L195.6 113.9L195.2 114.5L196.0 115.4L196.5 116.0L197.6 116.5L197.4 116.7L197.8 117.0L198.4 117.7L200.1 118.6L202.1 119.3L203.4 120.0L204.7 121.0L204.7 121.3L204.4 121.7L204.1 122.6L203.9 123.5L204.2 123.6L203.8 124.9L203.7 125.8L204.5 126.4L205.3 126.4L205.7 126.9L206.1 127.0L206.1 127.3L207.8 126.6L208.4 126.6L209.0 126.3L210.3 126.2L211.3 126.8L211.9 127.5L213.1 128.2L214.3 128.1L215.7 128.0L217.0 127.8L218.3 127.5L220.8 126.9L221.7 126.5L223.2 126.2L224.7 126.6L225.4 126.6L226.5 126.9L227.6 127.0L229.5 127.0L230.7 126.8L232.3 126.6L232.6 126.7L233.1 126.7L234.7 127.5L236.0 128.5L237.2 129.4L238.2 130.3L238.6 130.4L239.6 131.1L240.3 131.9L240.4 132.3L240.4 133.2L241.0 134.0L241.4 134.5L241.8 134.8L242.1 135.1L242.1 135.6L242.3 135.9L242.7 136.2L243.3 136.8L243.9 137.1L244.2 137.4L244.1 137.6L244.5 138.0L244.5 138.2L244.5 139.1L244.2 139.5L244.5 140.5L245.1 141.1L244.4 141.1L243.5 141.6L243.0 142.1L243.0 142.7L242.4 143.1L242.0 144.0L241.8 145.1L241.8 145.7L241.6 146.2L241.7 146.8L242.3 147.4L242.1 147.9L241.9 148.3L241.3 148.5L240.7 148.9L240.7 149.3L240.1 149.9L239.2 150.4L238.8 150.5L238.3 151.0L238.1 151.5L237.5 152.1L236.6 152.3L235.6 153.2L234.9 153.5L233.8 153.4L232.7 153.9L232.1 154.1L231.0 154.8L231.0 156.2L230.5 157.1L230.2 157.7L229.4 158.3L228.3 158.6L227.4 159.0L226.6 160.0L226.2 160.7L225.4 160.6L224.8 160.1L223.8 160.1L222.7 159.8L222.3 159.7L221.3 160.3L220.1 160.5L219.5 160.9L218.5 161.3L216.8 161.6L215.1 161.8L214.6 161.6L213.7 162.2L212.6 162.3L212.1 162.1L211.5 162.3L210.4 162.9L209.7 162.9L209.6 162.3L208.9 162.9L208.8 162.7L209.2 162.1L209.1 161.6L208.7 161.4L208.6 160.4L209.2 159.7L208.9 159.2L208.4 159.3L208.0 158.8L207.5 158.7L206.2 158.6L205.8 158.8L204.8 158.8L203.3 158.7L202.5 157.9L201.5 158.0L199.8 158.0L198.5 157.9L198.1 158.4L197.7 159.0L198.3 159.7L198.1 160.3L197.6 161.1L196.9 161.5L195.5 161.9L194.9 161.6L194.5 161.7L194.1 161.7L193.1 162.0L192.7 161.8L191.3 162.5L190.2 162.7L189.1 163.0L188.6 163.1L188.0 163.8L187.7 164.3L186.9 164.9L186.2 165.2L185.6 164.9L185.6 165.3L184.7 165.6L183.9 166.0L183.6 166.6L183.5 167.0L183.6 167.1L183.7 167.6L184.0 168.5L184.0 168.8L184.0 168.8L184.2 169.8L184.2 170.7L184.2 170.7L184.8 171.4L184.8 171.9L185.4 172.1L185.4 172.6L185.8 172.2L186.7 171.9L186.9 171.0L188.1 170.0L189.2 170.1L190.1 169.5L190.1 169.0L190.6 168.5L191.8 168.6L192.8 168.0L193.8 168.7L194.7 168.9L194.7 169.9L195.5 170.1L195.0 171.5L193.7 172.3L193.8 173.2L192.2 174.0L191.6 175.1L190.9 176.0L189.6 176.9L187.8 177.2L186.5 177.7L185.8 178.5L185.1 178.9L184.6 180.1L184.8 180.5L185.5 181.0L186.2 180.9L186.6 180.7L187.1 180.7L188.6 180.7L189.6 180.5L190.6 180.5L190.2 181.0L190.2 182.2L190.8 182.2L190.2 183.4L190.3 183.5L190.8 182.9L191.3 182.5L191.5 181.8L192.1 181.3L192.4 180.6L192.0 180.0L191.5 180.1L190.8 180.6L190.7 180.2L191.4 179.5L192.0 178.3L192.5 178.2L192.7 178.8L193.6 178.5L193.6 178.8L193.1 179.5L193.5 179.6L194.7 179.2L195.0 179.5L195.6 179.0L195.5 178.3L195.7 177.2L195.5 177.0L195.8 176.6L196.1 176.6L195.7 175.3L195.8 174.7L195.8 173.8L195.2 173.4L194.9 173.1L194.0 173.1L194.1 172.8L195.0 172.2L195.2 171.8L195.7 170.9L196.1 171.2L196.2 171.4L196.8 171.2L197.3 171.1L198.2 170.3L197.3 170.0L197.7 169.7L198.2 169.5L198.9 169.8L198.9 169.5L198.5 169.0L197.8 168.7L198.1 168.3L197.4 168.1L196.8 168.0L196.5 167.4L197.5 167.3L197.0 166.9L197.6 166.6L196.8 165.8L197.4 165.5L198.4 165.7L199.1 166.3L199.5 167.0L200.1 167.3L200.7 167.7L200.9 168.0L201.1 168.0L201.2 168.2L201.8 168.4L202.1 168.9L202.2 169.6L202.2 170.0L202.4 170.1L202.7 170.1L203.0 170.3L203.5 170.4L204.4 170.5L205.0 170.8L205.9 170.8L206.8 171.4L206.7 171.5L207.2 171.9L207.3 172.2L207.9 172.3L208.0 171.7L208.3 172.0L208.4 172.4L208.4 172.4L208.2 172.6L208.9 172.6L209.5 172.1L209.4 171.5L209.4 171.2L209.0 170.7L208.1 170.4L207.4 169.6L206.2 169.0L205.5 169.2L205.2 169.0L205.4 168.7L204.5 168.6L203.7 168.5L202.8 168.2L202.6 168.0L202.7 167.6L203.3 167.9L204.2 167.8L204.4 167.0L203.6 166.8L203.5 166.3L203.9 166.1L204.1 165.0L204.5 164.8L204.6 165.2L204.6 165.8L204.4 166.1L205.0 166.6L205.4 167.0L205.8 167.1L206.2 167.4L206.8 167.5L207.3 167.8L208.0 167.7L208.9 168.1L209.8 168.6L210.6 169.1L211.0 170.1L211.5 170.2L212.2 170.4L212.6 170.2L213.1 169.6L213.4 169.5L214.1 168.8L215.9 168.9L217.2 168.5L217.3 167.8L217.2 167.2L218.0 166.4L219.2 166.1L219.3 165.7L219.9 165.1L220.3 164.2L219.9 163.6L220.5 163.1L220.7 162.4L221.5 162.2L222.2 161.4L223.5 161.4L224.5 161.5L225.1 161.2L225.6 160.8L226.1 160.9L226.4 161.4L226.6 162.0L227.5 162.3L228.0 162.1L228.5 162.3L229.0 162.3L228.8 163.1L228.7 163.8L229.2 163.9L229.3 164.4L229.1 165.1L228.7 165.4L228.6 165.8L228.3 166.5L228.2 166.9L228.3 167.4L228.3 167.7L228.1 168.5L228.4 169.0L227.1 169.6L226.0 169.3L224.8 169.2L223.9 168.9L223.1 168.9L221.7 168.8L221.2 169.4L221.0 171.6L221.8 172.8L222.4 173.4L223.6 173.9L223.6 174.7L222.6 174.9L221.3 174.5L221.5 175.8L220.8 175.3L219.0 176.2L218.8 177.1L218.1 177.3L217.5 177.6L217.2 177.9L216.7 179.5L215.8 180.1L215.2 180.1L215.1 180.4L214.5 180.5L214.3 180.3L213.9 180.9L214.2 181.3L214.3 181.9L214.6 182.5L214.8 183.6L214.8 183.9L214.6 184.2L214.1 184.4L213.9 184.7L213.5 185.1L213.4 184.5L213.5 184.2L213.4 183.9L213.0 183.8L213.1 183.3L213.3 183.4L213.6 182.6L213.4 182.1L213.3 181.6L212.6 181.5L212.5 181.1L211.8 181.5L211.5 181.8L210.7 181.6L210.3 181.3L209.9 181.8L209.0 182.5L208.3 183.2L207.6 183.2L207.5 182.9L206.8 183.2L206.9 183.7L206.1 184.3L206.6 185.1L206.9 185.9L206.8 186.7L206.4 187.2L205.6 186.7L205.2 186.9L205.4 187.7L205.6 188.3L205.8 188.1L206.3 188.3L206.6 188.9L206.0 189.5L205.4 189.9L204.8 190.0L204.2 190.3L204.0 191.2L204.7 191.4L205.6 190.8L206.3 190.0L207.1 189.4L207.6 189.9L208.3 190.0L208.6 191.0L209.2 191.9L209.2 192.6L209.0 193.4L208.5 194.9L208.3 195.3L208.5 195.7L209.3 195.9L209.9 195.3L210.1 194.4L209.7 193.8L210.2 192.7L210.8 191.5L210.7 189.9L210.1 189.3L209.4 188.8L209.5 187.5L210.0 187.1L209.7 185.2L209.8 184.1L210.6 184.0L210.7 183.1L211.5 182.9L211.9 183.8L212.7 184.9L213.4 186.4L214.0 187.0L214.9 185.5L215.7 185.2L216.6 185.6L216.9 186.8L217.3 189.3L216.9 190.0L215.7 191.1L214.9 192.4L214.3 194.1L213.8 196.4L213.3 197.4L212.7 199.0L212.1 199.8L211.5 200.0L211.3 201.0L210.7 201.3L210.2 201.8L208.8 201.6L209.1 201.1L208.4 200.7L208.2 201.3L207.3 201.1L206.3 201.5L204.3 201.5L203.7 201.3L203.2 200.8L203.2 200.0L203.6 199.3L205.7 198.8L205.9 198.5L204.9 198.2L203.9 196.9L203.2 197.0L202.7 197.0L203.0 197.5L203.5 197.7L203.5 198.2L202.1 198.4L202.0 198.9L202.8 199.3L202.7 200.8L202.3 201.0L201.7 201.0L202.1 201.8L202.8 202.0L203.1 202.6L203.8 202.9L202.7 203.5L202.1 203.2L202.4 202.7L201.9 202.3L201.4 202.3L201.1 203.0L201.6 203.5L201.4 204.5L201.3 206.2L201.0 206.5L200.7 205.7L200.3 206.1L200.5 206.5L200.1 207.2L200.1 208.0L199.3 208.0L199.7 208.8L200.5 208.7L200.7 209.1L199.9 210.0L199.3 210.3L197.6 211.2L198.0 211.6L198.7 211.5L198.9 211.5L199.2 211.1L199.6 211.5L200.5 211.6L200.8 211.7L201.5 212.7L202.4 213.3L202.5 213.6L201.9 214.3L201.3 214.2L200.6 213.6L200.2 213.7L199.4 213.6L198.0 213.1L197.2 213.3L196.6 212.9L195.3 211.6L195.0 212.1L195.3 212.4L195.5 212.9L196.0 213.2L196.4 213.7L197.0 213.6L197.7 214.0L197.9 213.6L198.5 213.7L199.5 214.3L200.5 214.1L201.0 214.9L201.8 215.0L201.8 215.2L201.1 215.2L200.1 214.8L199.9 215.1L200.7 215.1L201.0 215.8L200.9 216.5L200.1 217.0L201.1 216.9L202.3 217.0L202.4 217.6L202.3 218.3L202.4 219.0L202.9 218.8L203.6 219.2L203.7 219.5L204.2 220.1L204.4 220.8L204.7 220.9L204.8 221.6L204.6 221.8L205.3 222.3L205.3 222.8L205.8 222.8L206.3 222.9L206.9 223.4L206.7 223.8L206.3 223.6L206.3 224.2L205.8 224.4L206.1 224.6L206.4 225.3L206.1 226.0L205.8 226.4L205.2 226.5L204.8 226.4L204.0 225.9L203.6 225.8L203.6 226.2L203.5 226.7L203.8 226.9L203.2 227.3L203.5 227.3L203.9 227.7L204.2 228.7L203.8 229.0L204.3 230.3L205.0 229.8L205.3 230.5L205.6 230.9L205.4 231.6L205.0 232.2L204.5 232.3L204.1 233.2L204.1 233.9L205.2 233.4L205.2 234.2L205.9 234.4L206.1 235.1L206.5 235.1L206.9 235.6L207.3 234.6L208.0 234.6L210.1 236.9L210.0 237.6L210.4 238.8L211.8 239.2L212.5 239.6L212.6 240.2L212.3 240.9L212.6 241.4L213.2 241.3L213.9 241.5L214.5 241.9L215.3 242.0L215.8 243.1L216.3 242.8L216.1 242.0L216.4 241.6L217.5 242.1L218.3 242.1L219.4 242.7L220.0 243.1ZM179.5 184.9L178.6 184.8L178.3 185.1L177.8 185.1L178.3 184.5L177.7 183.8L177.6 183.4L177.6 183.0L177.2 182.6L176.4 182.3L175.6 182.9L174.7 183.1L173.6 184.1L172.9 185.6L173.1 185.8L173.8 186.1L174.6 186.9L175.4 186.5L175.8 187.2L176.3 186.7L176.9 187.4L176.1 188.0L175.9 188.9L176.9 188.7L177.5 188.8L177.8 188.1L177.2 187.5L177.9 187.7L178.2 187.8L178.4 188.3L178.8 188.4L179.7 187.8L180.8 188.1L181.3 187.9L181.6 188.1L181.0 188.7L181.6 189.2L181.3 189.9L180.7 190.4L181.4 191.2L182.1 191.5L182.5 190.8L183.2 190.4L183.4 189.3L183.7 188.6L183.5 187.9L183.9 187.1L183.7 185.7L182.4 185.6L181.9 185.1L180.2 184.9L179.5 184.9ZM242.9 222.3L243.2 222.6L242.8 223.1L242.9 223.4L242.3 223.9L242.0 223.5L241.6 223.1L242.0 222.8L242.2 222.6L242.4 222.5L242.9 222.3ZM220.0 240.3L220.0 241.1L219.6 241.1L219.5 240.8L220.0 240.3ZM220.0 240.3L220.0 240.3L220.3 240.3L220.9 240.6L220.8 240.7L220.5 241.0L220.0 241.1L220.0 240.3ZM242.6 220.2L243.7 220.2L242.8 219.7L243.5 219.2L244.3 219.3L245.1 218.8L244.2 218.4L243.3 218.2L242.1 218.3L242.1 217.7L242.2 217.1L242.7 216.5L243.2 216.4L243.8 216.6L244.4 216.3L244.9 216.2L245.8 217.0L246.0 217.6L245.7 218.1L246.3 218.2L247.2 218.6L247.7 218.7L248.5 219.2L248.6 220.0L249.0 220.4L249.7 220.4L249.9 221.0L250.7 221.7L251.9 222.4L252.8 222.7L254.0 222.8L254.3 221.9L255.3 221.7L256.2 221.5L256.0 220.6L256.5 219.4L256.9 218.7L257.4 218.3L257.6 217.4L258.0 216.7L258.0 215.6L258.0 214.8L258.9 214.8L260.0 214.5L261.2 213.8L262.0 212.5L261.6 212.0L260.4 211.9L258.7 212.6L258.3 213.1L257.5 212.2L256.6 211.6L255.8 211.4L255.1 211.7L254.3 212.3L253.6 213.2L252.4 212.7L251.4 213.2L249.8 213.7L249.5 213.4L249.5 212.5L249.5 211.9L249.1 211.6L249.3 211.0L249.7 210.2L250.1 209.9L249.8 208.9L250.7 208.6L251.9 207.9L251.9 207.4L252.3 206.7L251.4 206.1L250.1 206.1L249.5 206.0L250.2 205.2L251.1 203.8L251.9 202.6L252.6 202.5L252.8 201.4L253.0 200.6L252.7 199.6L252.8 199.0L253.4 198.3L253.2 197.7L253.4 197.3L254.4 196.5L255.0 196.7L255.6 197.0L256.6 197.8L257.9 198.2L258.7 199.2L259.2 200.8L259.7 201.8L260.1 202.5L261.1 202.8L261.9 203.5L263.7 204.1L264.9 204.6L264.5 204.0L262.7 203.3L261.2 202.1L260.7 201.1L260.8 200.2L261.8 200.6L262.8 199.9L263.4 199.3L263.4 198.0L262.7 196.9L261.2 196.7L261.8 196.3L261.9 195.6L263.1 196.2L264.5 197.6L265.3 198.1L266.4 198.7L266.7 199.3L265.8 199.8L264.4 198.8L265.0 200.0L265.5 200.8L265.7 200.5L266.6 201.2L267.3 201.9L267.9 202.7L268.8 202.9L269.0 203.0L269.5 202.8L270.0 202.3L269.9 201.9L269.5 202.2L269.7 201.8L270.0 201.8L270.4 202.3L270.5 202.7L270.9 203.3L271.1 203.7L271.3 204.2L271.8 204.9L271.2 203.6L271.3 203.3L272.0 204.4L272.2 205.0L272.1 205.0L272.4 205.2L272.4 204.9L273.2 204.9L274.2 205.4L274.0 205.5L274.0 205.7L273.8 206.1L274.3 205.8L274.4 205.5L274.8 205.4L275.3 205.6L276.3 205.9L276.3 206.0L275.5 205.9L275.2 206.5L274.4 206.8L274.9 206.9L275.5 206.5L275.5 207.2L275.7 206.4L276.7 206.1L276.7 205.8L277.0 205.6L278.0 205.2L279.0 205.7L279.6 206.7L280.3 207.2L280.5 207.7L281.0 208.2L281.4 208.3L282.3 209.3L283.0 209.9L283.7 210.3L284.5 210.4L285.2 210.0L286.1 209.5L286.8 208.9L287.2 208.8L288.4 208.0L289.1 207.9L289.6 207.9L290.3 208.1L290.5 208.4L290.4 209.1L290.0 209.3L289.8 209.8L289.0 210.6L288.2 211.3L287.8 211.5L287.0 211.4L286.5 211.8L285.7 212.8L285.6 213.2L286.2 214.3L286.1 214.5L285.7 215.1L285.4 215.9L285.6 217.2L285.6 218.2L285.6 219.1L285.8 219.5L286.1 219.3L286.6 219.3L286.8 219.1L286.9 219.3L286.8 219.7L287.0 220.2L286.9 221.0L286.3 221.9L286.4 222.9L286.1 223.7L286.2 224.4L286.3 225.4L287.1 226.6L287.4 227.8L287.9 228.5L288.3 228.8L289.1 228.9L289.6 229.0L290.0 228.8L290.0 228.8L290.0 228.8L290.9 229.4L291.6 229.7L293.1 230.0L293.6 230.2L294.2 230.0L294.8 229.7L295.7 229.5L296.6 228.8L297.3 228.5L297.9 228.0L298.3 226.6L298.8 226.1L298.6 224.9L298.5 223.8L298.4 222.8L298.2 221.9L297.8 221.0L297.1 220.7L296.2 220.6L295.9 220.4L295.6 219.5L295.3 218.1L295.3 216.9L295.2 216.1L295.4 215.8L296.0 215.8L296.6 216.5L297.3 216.8L297.5 216.5L298.0 216.7L298.9 217.0L298.6 217.4L298.6 217.7L298.8 217.7L298.8 217.4L299.1 217.4L299.6 217.6L299.7 217.5L300.1 217.6L300.2 217.5L300.8 217.7L301.1 218.0L301.1 218.2L301.5 218.5L301.7 218.0L301.5 217.9L301.7 217.5L301.7 217.3L301.5 217.0L301.5 216.6L301.5 216.5L301.5 216.3L301.5 215.6L301.5 214.9L301.3 214.5L301.2 214.3L301.2 213.9L301.3 213.5L301.2 213.2L301.1 212.9L301.2 212.2L301.2 212.0L301.3 211.5L301.5 211.1L301.7 210.6L301.9 210.2L302.0 210.3L302.3 210.3L302.7 210.1L303.1 210.4L303.5 210.5L304.0 210.5L304.3 210.4L304.8 210.3L304.9 210.5L305.4 210.6L305.7 210.5L306.0 210.7L306.3 210.6L306.4 210.4L307.0 209.9L307.4 209.3L307.7 208.5L308.0 207.9L308.3 207.9L308.2 207.3L308.1 207.2L308.3 206.7L308.1 206.0L307.8 205.3L307.4 204.5L307.0 204.0L306.9 203.1L307.0 203.2L306.9 202.3L306.9 201.6L307.1 201.1L307.3 200.4L307.1 199.6L306.1 198.7L305.9 198.1L305.5 198.1L304.5 198.1L303.8 197.4L303.5 196.5L303.3 196.4L303.0 195.3L302.2 194.3L301.8 193.8L301.0 193.3L300.9 192.8L301.1 192.3L301.5 192.5L301.8 192.4L302.2 193.2L302.5 192.6L303.0 192.4L303.9 192.9L304.5 192.0L304.2 191.4L303.4 191.4L303.2 191.9L302.4 192.3L301.4 190.6L300.9 191.0L300.4 190.6L301.0 189.9L300.6 188.9L300.8 187.7L301.1 187.5L300.6 186.3L299.9 184.8L300.0 183.8L299.6 182.7L298.9 182.1L298.7 182.2L297.8 180.5L296.9 178.9L297.8 179.9L298.0 179.2L297.5 178.1L297.4 176.8L298.1 176.1L297.7 175.4L297.6 174.8L297.4 173.7L297.5 172.5L298.0 172.1L297.7 171.6L297.7 170.6L297.6 169.9L296.8 168.1L296.5 168.1L295.7 167.1L294.9 165.5L294.7 165.0L294.2 163.8L293.9 161.9L294.1 161.4L293.7 161.0L293.9 160.3L294.8 158.4L294.3 157.6L294.9 157.0L296.4 157.4L296.3 156.8L294.5 154.4L295.3 153.6L293.8 153.1L292.6 151.2L291.1 148.7L290.9 147.6L291.6 147.4L289.8 146.2L287.7 143.4L285.6 141.7L284.2 139.3L283.1 136.9L282.2 135.8L280.9 134.9L280.6 134.2L280.9 132.7L281.0 132.0L282.7 130.9L283.9 130.9L287.0 131.3L288.7 131.1L290.4 131.2L290.8 131.5L291.8 131.2L293.0 129.5L294.5 128.6L295.1 128.1L295.9 128.2L297.1 127.3L299.7 127.6L300.7 127.0L302.3 127.8L303.1 127.6L304.9 129.2L307.6 131.3L309.1 132.0L311.0 133.6L313.4 134.9L315.5 135.5L316.3 135.2L316.5 134.6L317.6 134.1L318.4 134.2L319.9 135.0L323.0 135.7L324.9 136.8L326.3 137.7L327.8 137.9L329.3 138.8L330.4 139.2L332.5 141.0L333.3 142.6L334.2 143.6L335.0 145.7L335.9 147.1L336.1 148.6L336.7 148.5L335.9 145.4L336.7 145.3L336.3 143.7L336.8 143.5L339.2 144.8L341.7 147.6L344.3 151.8L345.5 154.2L345.8 153.4L346.8 153.5L347.1 152.8L348.1 154.0L349.4 156.2L350.1 158.6L350.8 159.3L351.6 158.6L351.2 156.9L350.3 155.8L350.5 154.8L351.8 156.8L353.3 158.4L354.4 158.2L355.2 158.6L356.2 160.8L357.5 162.4L358.6 162.8L358.3 160.1L357.5 157.7L358.8 158.2L360.6 160.8L362.5 161.9L363.8 164.0L364.7 164.9L365.4 163.6L365.3 161.7L365.7 162.8L366.6 165.1L367.3 166.2L368.5 168.4L369.6 168.5L370.0 169.6L370.6 172.7L370.8 175.9L371.1 179.4L370.7 180.4L369.8 179.8L369.5 181.3L367.8 182.1L366.4 181.3L364.9 178.8L365.6 182.7L364.0 180.6L362.0 180.2L361.6 177.4L359.0 176.7L359.3 178.5L360.8 178.8L361.1 180.4L359.4 180.1L357.2 179.8L356.1 179.0L355.3 179.9L354.2 180.5L353.8 179.5L351.7 178.6L349.5 177.6L347.7 177.1L346.3 178.2L345.2 177.8L344.0 178.5L342.3 177.7L340.1 178.0L337.8 178.1L335.2 178.3L333.6 179.0L332.3 180.0L332.3 182.1L332.0 182.5L332.1 186.7L332.0 190.5L331.7 192.2L331.0 193.2L330.6 192.9L329.6 194.9L328.0 197.2L326.2 199.4L325.9 200.3L325.2 201.0L324.8 202.5L324.5 203.9L323.9 203.4L323.0 204.4L322.2 204.0L321.3 202.7L320.3 201.9L319.9 202.4L320.5 202.9L320.2 204.1L319.8 203.8L318.9 204.2L318.7 203.6L317.9 203.4L317.1 202.9L316.7 203.1L316.3 202.2L315.6 201.2L315.4 201.4L315.1 200.8L314.6 201.0L314.2 200.7L313.9 199.9L313.1 199.4L312.4 198.9L312.3 199.5L311.6 199.4L310.7 200.0L310.3 199.7L309.5 200.1L309.0 200.9L308.8 201.5L308.3 201.9L307.9 201.6L308.0 202.0L307.7 202.4L307.5 203.2L307.7 203.8L308.1 204.1L308.5 204.7L308.6 205.0L308.9 205.1L309.3 204.3L309.5 204.7L309.7 204.9L309.9 205.6L309.3 206.0L309.5 206.1L309.5 206.7L309.1 207.0L309.2 207.7L309.1 208.1L309.2 208.8L309.4 208.8L309.3 209.0L309.1 209.9L308.9 210.2L308.7 210.0L308.5 210.1L308.3 210.6L308.1 211.2L308.0 211.7L307.7 211.9L307.6 212.3L307.9 212.2L308.2 212.5L307.9 212.8L307.8 213.3L307.6 213.6L307.3 213.6L306.9 213.4L306.8 213.8L306.6 213.5L306.3 214.1L305.9 214.8L305.5 215.1L305.2 215.8L304.7 216.6L304.6 216.4L304.7 216.1L304.6 216.0L304.3 216.3L304.2 216.8L304.5 216.9L304.5 217.8L304.4 218.3L304.2 218.9L304.1 219.7L303.9 220.1L303.7 220.9L303.7 221.8L303.4 222.5L302.9 223.2L301.7 224.8L301.3 225.5L300.9 226.6L300.9 227.4L301.2 228.6L301.2 229.3L300.8 230.3L300.5 231.3L299.8 232.6L299.5 233.6L298.7 235.0L297.9 236.1L297.6 236.4L297.4 237.1L296.7 238.4L296.1 238.9L295.1 240.1L294.3 240.6L293.7 240.7L293.7 240.3L293.3 240.3L293.1 240.0L292.8 239.9L292.2 240.2L291.7 240.2L291.1 240.4L289.7 241.2L288.5 242.1L287.7 242.5L286.9 243.4L286.6 243.5L286.0 243.1L285.5 243.6L284.8 244.1L284.0 244.1L283.7 244.7L282.9 245.1L282.2 245.4L281.8 245.3L280.8 245.6L279.9 245.6L279.5 245.4L278.8 246.0L278.7 246.4L278.1 246.8L278.5 247.2L279.0 247.2L279.8 247.5L280.4 247.3L281.4 246.8L281.7 246.8L281.9 246.6L282.3 246.6L282.4 246.4L283.1 246.5L283.5 246.2L284.0 246.2L284.8 245.7L285.9 245.7L286.5 245.5L287.1 245.4L287.6 245.5L287.9 244.9L288.5 244.6L289.1 244.4L289.3 244.5L289.5 245.1L289.4 245.3L288.7 245.4L287.8 246.0L287.0 246.6L286.5 247.1L285.7 246.8L285.1 246.7L284.6 247.1L283.8 247.7L283.9 247.9L283.5 248.1L282.9 248.6L282.1 249.0L282.0 248.9L282.3 248.5L282.1 247.9L281.7 247.7L280.6 248.2L280.0 248.6L279.2 248.7L278.4 248.8L277.3 248.9L276.3 248.8L275.7 248.7L274.8 249.1L274.4 249.4L274.1 249.4L273.8 249.9L273.3 250.1L272.7 250.9L272.4 251.0L271.8 250.8L270.4 251.1L268.6 251.0L268.4 250.9L267.9 251.0L266.7 251.2L265.9 250.8L265.1 250.9L264.5 250.2L263.7 249.7L262.8 249.5L262.1 248.6L260.6 247.3L259.3 246.6L258.4 246.3L257.8 246.2L257.7 246.0L258.7 245.2L259.8 245.4L259.6 245.1L258.8 244.7L257.9 244.5L257.8 244.5L256.1 245.2L255.4 245.4L254.2 246.2L253.2 245.9L252.7 245.4L251.8 245.9L251.0 245.4L249.9 245.5L249.4 245.2L248.9 245.2L248.2 245.4L247.4 244.9L246.2 244.9L245.2 244.4L244.7 244.8L244.0 245.4L243.3 245.7L241.6 245.6L241.0 245.8L240.0 246.1L239.4 246.7L238.2 246.9L237.4 246.9L237.0 247.4L237.5 248.0L237.3 248.2L236.8 248.8L236.5 249.4L236.1 249.9L235.7 249.3L235.4 248.3L235.8 247.7L235.5 247.5L235.2 248.4L235.2 249.2L234.8 250.3L235.4 250.6L235.2 251.6L234.8 252.3L234.4 252.8L234.5 253.3L233.7 254.2L233.8 254.8L233.2 255.5L232.7 255.6L232.3 256.1L231.7 256.6L231.3 257.2L230.3 257.8L230.1 257.6L230.7 256.9L231.2 256.4L231.7 255.6L232.4 255.3L232.6 254.7L233.2 253.8L233.2 253.5L233.5 253.0L233.3 252.2L233.3 251.5L232.8 252.1L232.6 251.9L232.4 252.4L231.9 252.1L231.8 252.5L231.4 252.0L231.0 252.7L230.7 252.8L230.4 252.2L230.4 251.7L229.9 251.5L229.3 251.9L228.7 251.5L228.2 251.4L228.0 250.8L227.5 250.4L227.6 249.8L227.8 249.1L227.9 248.5L228.2 248.3L228.6 248.3L228.9 247.7L229.2 247.7L229.5 247.2L229.3 246.8L228.9 246.7L229.1 246.2L228.9 246.3L228.4 246.7L228.4 247.0L227.9 246.8L227.3 247.1L226.5 247.1L226.2 246.7L225.5 246.2L226.0 245.6L226.9 244.8L227.3 244.7L227.3 245.3L228.3 244.9L227.7 244.4L227.1 244.2L226.6 243.7L226.1 243.4L225.5 243.2L225.5 242.6L226.2 242.3L226.6 241.7L226.5 241.2L226.7 240.6L227.0 240.3L227.5 239.6L227.9 239.6L228.2 238.8L228.7 238.8L229.2 239.1L229.2 238.9L229.8 238.7L229.9 238.9L230.5 238.8L230.8 238.5L231.7 238.4L232.3 238.1L232.7 238.0L233.0 237.6L233.6 237.5L234.0 237.3L234.8 237.1L235.6 237.1L236.0 236.8L235.9 236.3L236.0 235.7L236.5 235.4L236.5 234.6L236.7 233.9L237.3 234.0L237.2 233.6L236.9 233.3L237.1 233.1L238.3 233.2L238.0 232.3L238.7 232.8L238.8 232.3L238.7 232.0L239.0 231.6L239.7 231.3L240.5 230.7L240.9 230.3L241.0 229.9L241.7 229.6L242.0 230.4L242.5 229.8L242.8 228.7L242.8 228.3L243.5 228.1L243.2 227.4L242.6 227.7L242.3 227.3L242.4 226.8L242.4 226.5L242.7 226.2L243.4 226.0L243.5 225.5L244.1 224.9L244.0 224.2L244.2 223.6L243.5 223.5L243.4 223.1L243.8 222.6L244.8 222.7L244.0 222.3L244.0 222.0L243.0 221.7L242.3 222.1L241.8 222.5L240.6 222.3L239.8 221.8L240.0 221.4L240.5 221.0L241.8 220.6L242.3 220.9L242.6 220.2ZM236.9 227.6L237.3 228.0L237.3 227.2L238.0 226.9L237.6 226.4L238.1 226.2L239.2 226.3L238.8 226.0L237.7 225.9L237.6 225.6L237.8 225.3L238.4 225.1L239.5 225.1L240.2 225.2L240.9 224.7L241.6 224.2L242.0 224.3L242.0 225.0L242.5 224.8L242.8 225.0L242.5 225.7L242.0 226.3L242.0 226.8L242.1 227.6L241.8 228.8L241.7 229.3L241.1 229.3L240.6 229.7L240.6 230.1L239.6 230.1L239.6 229.8L239.7 229.2L239.9 228.8L240.0 228.2L239.4 228.8L239.2 229.6L238.9 230.0L238.5 230.0L238.5 229.0L238.2 229.6L237.7 230.0L237.1 229.3L236.8 228.9L236.6 227.8L236.9 227.6ZM237.7 224.6L238.3 225.0L237.4 225.3L237.3 225.2L237.4 224.7L237.7 224.6ZM238.1 215.6L238.3 215.5L238.4 215.9L238.5 216.2L238.7 216.5L238.6 216.6L238.1 217.1L237.7 217.1L237.6 217.0L237.6 216.3L238.1 215.6ZM238.5 218.9L239.2 218.6L238.3 218.4L237.7 217.6L238.8 216.9L239.5 216.8L239.0 216.2L238.5 216.0L238.9 215.1L239.3 214.5L239.8 214.4L239.3 213.8L239.9 213.2L240.0 212.2L240.3 211.8L241.1 211.0L241.8 211.5L242.1 210.4L242.1 209.6L242.7 208.6L242.4 208.0L243.2 207.8L244.7 207.9L244.5 208.6L243.9 209.7L244.2 210.2L244.8 210.0L245.2 209.3L245.4 208.5L245.6 208.2L246.5 207.5L247.2 207.3L247.2 208.0L246.9 209.5L247.5 208.5L247.9 207.8L248.2 207.5L248.4 209.0L248.2 210.3L247.9 211.1L247.5 211.0L247.2 211.9L246.9 212.7L247.2 212.6L247.7 214.0L247.4 214.4L246.6 214.3L246.3 213.4L245.9 212.5L245.6 212.8L245.0 212.8L243.8 212.5L243.4 212.8L243.1 213.1L242.8 213.8L242.6 214.7L242.3 214.5L241.7 215.1L241.7 215.5L241.4 215.8L241.8 216.0L242.0 216.6L242.0 218.1L241.7 218.9L241.5 219.5L241.2 219.8L240.7 219.4L240.7 220.0L239.5 220.1L238.6 219.8L238.1 219.5L237.8 218.7L238.5 218.9ZM237.5 223.2L237.8 222.9L237.7 222.3L238.0 222.3L238.5 222.6L239.1 222.2L240.0 222.4L240.4 223.0L240.2 223.3L239.8 223.5L238.8 224.2L238.4 224.1L238.7 223.4L237.9 223.7L237.5 223.2ZM209.0 234.9L208.6 234.6L208.2 234.1L208.2 234.0L208.7 233.8L209.1 234.0L209.2 234.6L209.0 234.9ZM238.9 221.1L239.7 221.5L239.6 221.9L238.7 222.0L238.1 221.9L237.7 221.7L237.4 221.4L237.5 220.7L237.8 220.2L238.7 220.7L238.9 221.1ZM237.6 230.4L237.6 231.5L237.1 231.4L236.2 231.7L235.9 231.4L235.3 230.7L234.9 230.0L234.2 229.9L234.6 228.9L235.0 228.7L235.4 228.0L235.8 227.9L236.4 227.8L236.5 228.3L236.8 229.4L237.2 230.1L237.6 230.4ZM212.0 234.3L211.5 234.5L211.1 234.2L210.9 233.5L211.2 233.3L211.5 233.7L212.0 234.3ZM236.5 221.0L236.9 221.2L236.8 221.6L236.5 222.0L236.0 221.8L235.7 221.3L236.1 221.1L236.5 221.0ZM210.9 233.0L210.3 233.6L209.4 232.9L208.9 232.8L208.9 231.9L209.6 231.4L210.0 231.5L210.5 232.0L210.9 233.0ZM234.4 222.2L235.0 222.0L235.5 222.1L236.3 222.3L236.4 222.8L236.1 223.1L235.5 223.0L235.5 223.4L234.7 223.3L234.8 223.0L234.5 222.5L234.6 222.2L234.4 222.2ZM234.4 224.7L234.8 224.8L234.7 224.5L234.8 224.2L235.4 224.3L235.8 224.6L235.7 225.6L235.9 226.5L235.7 226.9L235.4 226.8L235.2 226.1L234.7 227.3L234.4 227.6L233.6 226.7L233.4 226.4L234.1 225.9L234.9 225.6L235.1 225.2L234.0 225.2L233.7 224.9L233.9 224.7L234.4 224.7ZM202.1 208.6L202.1 208.4L203.0 207.5L203.4 207.7L204.0 207.3L204.5 207.7L204.5 208.1L205.0 208.5L205.4 209.5L205.6 209.4L206.0 210.5L206.5 210.7L206.6 211.6L206.8 212.7L206.5 213.6L206.7 214.1L206.7 214.7L206.2 214.7L205.9 214.4L205.8 213.3L205.7 212.3L205.3 211.0L204.6 210.0L204.0 209.0L203.2 208.5L202.1 208.6ZM234.1 221.2L234.5 220.9L234.5 220.4L234.9 220.2L235.3 220.3L235.6 220.0L235.8 219.8L235.9 219.4L235.9 219.0L235.7 218.6L235.5 218.0L235.5 217.6L235.9 217.2L236.3 217.1L236.6 217.2L236.9 217.6L236.9 218.0L237.1 218.8L237.2 219.4L237.0 219.9L236.7 220.7L236.1 220.8L235.5 220.8L235.0 221.0L234.8 221.5L234.5 221.8L234.0 221.7L234.1 221.2ZM232.2 226.0L232.9 226.4L233.2 226.8L233.1 227.0L233.3 227.6L233.2 228.1L232.8 228.3L232.4 227.5L232.0 226.7L232.2 226.4L232.2 226.0ZM233.7 220.9L233.7 221.0L233.6 221.5L233.3 221.5L233.4 221.0L233.6 220.9L233.7 220.9ZM232.7 224.7L232.8 225.2L232.4 225.4L232.1 225.1L232.1 224.7L232.4 224.5L232.7 224.7ZM214.4 207.9L214.7 207.2L215.2 207.3L215.2 207.6L215.4 207.9L215.1 208.3L214.8 208.0L214.4 207.9ZM231.8 224.2L231.9 224.5L231.8 224.9L231.6 224.8L231.4 224.5L231.5 224.4L231.8 224.2ZM233.1 221.3L233.3 221.7L233.0 221.9L232.6 221.9L232.1 221.8L232.2 221.6L232.3 221.5L232.7 221.2L233.1 221.3ZM232.6 222.2L233.1 222.2L232.9 222.6L232.5 222.9L232.3 223.3L232.1 223.1L231.8 223.2L231.3 223.1L231.6 222.8L232.1 222.3L232.6 222.2ZM207.6 223.3L206.9 222.2L208.4 222.3L208.5 222.5L208.5 222.6L208.0 223.3L207.6 223.3ZM216.5 209.2L215.5 208.7L215.9 208.1L215.8 207.3L215.9 207.0L215.7 206.1L216.0 206.0L216.7 206.5L216.6 206.9L217.0 207.2L217.6 208.0L217.9 208.8L217.5 209.3L217.3 209.0L217.0 209.0L217.1 209.4L216.8 209.5L216.5 209.2ZM215.5 210.5L215.0 210.3L215.0 209.6L215.4 209.3L216.1 209.2L216.2 209.5L216.5 209.4L216.8 209.8L216.4 210.3L216.0 210.2L216.0 210.5L215.5 210.5ZM211.9 213.5L211.9 213.2L212.0 213.0L211.9 212.9L211.9 212.6L212.2 212.6L212.4 212.9L212.7 212.7L212.6 213.1L212.4 213.3L212.2 213.1L212.3 213.3L212.3 213.6L212.0 213.6L211.9 213.5ZM208.0 222.1L207.7 221.7L208.0 221.0L208.4 220.7L209.2 220.5L209.4 220.2L210.1 220.7L210.4 221.0L209.9 221.4L208.9 222.0L208.0 222.1ZM231.4 219.4L231.7 219.1L232.0 219.4L232.9 219.8L233.0 220.2L232.8 220.6L232.3 220.9L231.9 220.8L231.7 220.6L231.6 221.0L231.3 221.2L230.8 221.3L230.3 221.1L230.0 220.9L229.9 220.7L229.6 220.8L229.6 220.4L230.2 220.2L230.4 219.9L230.6 219.6L231.4 219.4ZM227.1 217.2L227.0 216.9L227.0 216.5L227.2 216.2L227.4 216.0L228.0 216.2L228.4 216.4L228.6 216.4L228.5 216.1L229.3 216.2L229.7 216.4L230.6 216.4L230.9 216.7L231.2 216.8L231.4 217.3L231.5 217.0L231.7 217.1L232.2 216.8L232.6 216.9L233.0 217.2L233.5 217.2L233.8 217.5L234.1 217.4L234.0 217.0L234.2 216.9L235.0 217.5L234.8 218.2L235.0 219.0L234.9 219.4L234.9 219.9L234.4 219.9L234.1 219.5L233.3 219.6L233.2 219.5L233.7 218.8L233.0 219.2L232.8 219.5L232.4 219.4L232.1 219.0L231.7 219.0L231.3 219.3L230.7 219.4L230.7 218.9L230.8 218.7L230.4 218.5L230.3 218.9L230.4 219.6L230.1 219.9L229.6 220.0L229.3 220.2L228.9 220.2L228.7 220.0L228.7 219.8L228.5 219.6L228.1 219.4L228.1 219.2L228.4 219.0L227.8 219.0L227.6 218.8L227.4 218.6L227.3 218.2L227.4 218.1L227.1 217.8L227.1 217.5L227.1 217.2ZM223.2 213.7L222.8 212.5L223.2 212.2L223.8 212.4L224.5 212.7L224.6 212.5L224.0 212.3L223.8 211.8L223.4 212.0L223.4 211.6L223.8 211.1L223.3 211.3L222.4 211.4L222.0 211.1L222.0 210.6L222.9 210.1L223.1 209.8L223.7 209.8L223.3 209.7L223.8 209.0L224.2 208.4L224.6 207.2L224.5 206.4L224.9 206.5L225.4 206.3L225.2 205.6L225.4 204.7L225.8 204.7L225.7 203.7L226.4 203.9L226.2 203.3L226.4 203.0L226.9 203.0L227.3 203.2L227.3 202.3L227.4 201.9L227.9 202.6L228.2 202.4L227.8 201.9L227.7 201.1L227.9 200.2L228.6 200.3L228.7 200.8L228.8 201.6L229.0 200.8L229.7 200.5L228.8 200.0L228.3 199.8L229.7 199.3L231.0 199.0L232.3 199.3L232.7 199.5L233.3 199.4L234.4 198.8L235.7 198.7L235.9 198.9L236.6 199.0L237.3 199.3L238.0 199.0L238.5 198.4L239.2 198.0L240.4 198.0L240.8 197.2L241.6 196.7L242.6 196.1L243.2 196.6L243.2 197.8L243.9 198.7L243.8 199.5L243.2 200.4L242.7 202.0L242.3 202.6L241.6 203.3L241.2 204.4L240.4 204.8L240.3 205.2L239.0 205.7L238.3 205.4L237.8 205.6L237.1 206.1L237.7 206.2L238.0 206.2L238.3 206.4L238.3 207.0L237.7 207.5L237.1 207.7L236.9 207.4L236.7 206.7L236.5 207.6L236.4 208.1L236.8 208.3L236.7 208.7L235.6 208.9L235.4 209.3L234.9 210.0L234.2 210.9L234.0 211.5L233.6 211.7L233.4 212.7L233.6 213.2L233.9 213.8L234.3 214.4L234.0 214.8L233.5 215.4L233.0 215.0L232.8 214.5L232.9 215.6L232.6 216.2L232.2 216.3L231.4 215.7L230.6 215.2L230.2 215.3L230.1 215.9L229.6 215.9L228.7 215.7L228.4 215.6L228.0 215.8L227.6 215.7L227.2 215.3L227.0 215.0L227.1 214.6L226.4 214.7L226.5 214.2L226.4 213.9L226.4 213.5L226.3 214.1L225.9 214.4L225.1 214.6L224.8 214.2L224.4 214.5L224.0 214.3L223.2 213.7Z";
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
function moon(cx, cy, r, u, id) {
  cx = +cx; cy = +cy;
  const c = Math.cos(rad(u)), rx = Math.max(0.001, r * Math.abs(c)), waxing = u < 180;
  const top = `${f1(cx)} ${f1(cy - r)}`, bot = `${f1(cx)} ${f1(cy + r)}`;
  let d;
  if (waxing) d = `M${top}A${r} ${r} 0 0 1 ${bot}A${f1(rx)} ${r} 0 0 ${c > 0 ? 0 : 1} ${top}Z`;
  else d = `M${top}A${r} ${r} 0 0 0 ${bot}A${f1(rx)} ${r} 0 0 ${c > 0 ? 1 : 0} ${top}Z`;
  return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="var(--rule)" opacity=".55"/><path d="${d}" fill="var(--moon)"/><circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="var(--moon)" stroke-width="1"/>`;
}

/* ---------- cadranele orare ---------- */
function buildHour(svg, turn) {
  const half = turn === 18, per = 360 / turn;
  let s = `<circle cx="200" cy="200" r="194" fill="var(--face)" stroke="var(--ink)" stroke-width="2"/><circle cx="200" cy="200" r="186" fill="none" stroke="var(--rule)"/>`;
  for (let i = 0; i < turn; i++) {
    s += tick(200, 200, 186, 172, i * per, i % (half ? 3 : 6) === 0 ? 2.6 : 1.6);
    const a = i * per, lab = half ? (i === 0 ? 18 : i) : i;
    s += txt(200, 200, 160, a, lab, half ? 14 : 12.5, i === (half ? 0 : 18) ? "" : "", i === (half ? 0 : 18) ? 'font-weight="600" style="fill:var(--sun)"' : (i === 0 && !half ? 'font-weight="600"' : ""));
    if (half) s += txt(200, 200, 138, a, i === 0 ? 36 : 18 + i, 9.5, "mute");
  }
  const mper = 360 / (turn * 10);
  for (let j = 0; j < turn * 10; j++) if (j % 10) s += tick(200, 200, 186, j % 5 === 0 ? 178 : 181.5, j * mper, 0.8, "var(--mute)");
  // inel minute noi: 0-9 într-o oră
  s += `<circle cx="200" cy="200" r="118" fill="none" stroke="var(--rule)"/>`;
  for (let m = 0; m < 10; m++) { s += tick(200, 200, 118, 110, m * 36, 1.6); s += txt(200, 200, 100, m * 36, m, 9.5, "mute"); }
  for (let m = 0; m < 100; m++) if (m % 10) s += tick(200, 200, 118, 114, m * 3.6, .6, "var(--mute)");
  // inel secunde noi: 0-9 într-un minut
  s += `<circle cx="200" cy="200" r="86" fill="none" stroke="var(--rule)"/>`;
  for (let m = 0; m < 10; m++) { s += tick(200, 200, 86, 79, m * 36, 1.3, "var(--sun)"); s += txt(200, 200, 70, m * 36, m, 8, "mute"); }
  s += txt(200, 200, 100, 18, "MN", 6.5, "mute", 'style="font-weight:600"') + txt(200, 200, 70, 18, "SN", 6.5, "mute", 'style="font-weight:600"');
  // subcadran: subsecunde (24)
  s += `<circle cx="200" cy="158" r="19" fill="var(--bg)" stroke="var(--rule)"/>`;
  for (let i = 0; i < 24; i++) s += tick(200, 158, 19, i % 6 === 0 ? 14 : 16.5, i * 15, i % 6 === 0 ? 1.3 : .7, "var(--mute)");
  s += `<line id="${svg.id}-ss" x1="200" y1="158" x2="200" y2="143" stroke="var(--sun)" stroke-width="1.6" stroke-linecap="round"/><circle cx="200" cy="158" r="1.8" fill="var(--sun)"/>`;
  s += `<text x="200" y="183.5" font-size="5.5" text-anchor="middle" class="mute">24 SS</text>`;
  // fereastra datei
  s += `<rect x="134" y="228" width="132" height="38" rx="3" fill="var(--bg)" stroke="var(--rule)"/><g id="${svg.id}-date"></g>`;
  // ace
  s += `<g id="${svg.id}-h"><line x1="200" y1="214" x2="200" y2="${half ? 140 : 148}" stroke="var(--hand)" stroke-width="5.5" stroke-linecap="round"/></g>`;
  s += `<g id="${svg.id}-m"><line x1="200" y1="218" x2="200" y2="96" stroke="var(--hand)" stroke-width="3" stroke-linecap="round"/></g>`;
  s += `<g id="${svg.id}-s"><line x1="200" y1="226" x2="200" y2="66" stroke="var(--sun)" stroke-width="1.4" stroke-linecap="round"/></g>`;
  s += `<g id="${svg.id}-rd"></g>`;
  s += `<circle cx="200" cy="200" r="5.5" fill="var(--hand)"/><circle cx="200" cy="200" r="2.2" fill="var(--sun)"/>`;
  svg.innerHTML = s;
}
const rot = (id, a) => $(id).setAttribute("transform", `rotate(${a.toFixed(3)} 200 200)`);
let showRd = false;
function rdMarks(turn, r) {
  const ring = (cx, cy, rad, ang, rr, col, w) => { const [x, y] = P(cx, cy, rad, ang); return `<circle cx="${f1(x)}" cy="${f1(y)}" r="${rr}" fill="none" stroke="${col}" stroke-width="${w}"/>`; };
  const per = 360 / turn;
  let hp, hr;
  if (turn === 36) { hp = r.hn * per; hr = 160; }
  else if (r.hn >= 1 && r.hn <= 18) { hp = (r.hn % 18) * per; hr = 160; }
  else { hp = (r.hn % 18) * per; hr = 138; }
  return ring(200, 200, hr, hp, 12, "var(--hand)", 2.2) + ring(200, 200, 100, r.mn * 36, 9, "var(--hand)", 2) + ring(200, 200, 70, r.sn * 36, 8, "var(--sun)", 2)
    + ring(200, 158, 16.5, r.ss * 15, 3.2, "var(--sun)", 1.6);
}
function updHour(svg, turn, t, r) {
  const id = svg.id;
  $(id + "-rd").innerHTML = showRd ? rdMarks(turn, r) : "";
  const per = 2400 * turn;      // secunde standard pe tur al acului orar: 36 h noi = 86400 s, 18 h noi = 43200 s
  rot(id + "-h", mod(t, per) / per * 360);
  rot(id + "-m", mod(t, 2400) / 2400 * 360);
  rot(id + "-s", mod(t, 240) / 240 * 360);
  $(id + "-ss").setAttribute("transform", `rotate(${Math.floor(mod(t, 24)) * 15} 200 158)`);
}
function dateWindow(id, r) {
  const wd = r.lc ? t("days")[r.ziSapt] : (r.zn === 1 ? t("yearDay") : t("leapDay"));
  const l2 = r.lc ? t("winL")(r.lc, r.zn) : t("winY")(364 + r.zn);
  $(id + "-date").innerHTML =
    `<text x="200" y="236.5" font-size="8.5" text-anchor="middle" dominant-baseline="central">ER ${r.er} · AE ${r.ae}</text>` +
    `<text x="200" y="247" font-size="8.5" text-anchor="middle" dominant-baseline="central">${l2}</text>` +
    `<text x="200" y="258" font-size="8.5" text-anchor="middle" dominant-baseline="central" style="fill:var(--sun)">${wd}</text>`;
}

/* ---------- cadranul anului ---------- */
const evCache = new Map();
function evAn(y) { if (!evCache.has(y)) evCache.set(y, evenimenteAn(y)); return evCache.get(y); }
let yKey = "", Y = {};
function buildYear(r) {
  const k = r.k, off = r.off, c = 220;
  const s0 = inceputAn(k), L = inceputAn(k + 1) - s0, y0 = new Date(s0 * DAY).getUTCFullYear();
  const ang = ms => (ms + off * 1000 - s0 * DAY) / DAY / L * 360;
  Y = {k, off, s0, L, ang};
  let s = `<circle cx="220" cy="220" r="214" fill="var(--face)" stroke="var(--ink)" stroke-width="2"/>`;
  // luni
  for (let i = 0; i < 13; i++) {
    const a1 = 28 * i / L * 360, a2 = 28 * (i + 1) / L * 360;
    s += `<path d="${arcPath(c, c, 176, 204, a1, a2)}" fill="${i % 2 ? "var(--q4)" : "var(--q2)"}" stroke="var(--rule)" stroke-width=".8"/>`;
    s += txt(c, c, 190, (a1 + a2) / 2, i + 1, 12, "", 'font-weight="500"');
  }
  s += `<path d="${arcPath(c, c, 176, 204, 364 / L * 360, 360)}" fill="var(--sun)" stroke="var(--rule)" stroke-width=".8"/>`;
  s += `<g id="y-hl"></g>`;
  // arce de 5 zile
  s += `<circle cx="220" cy="220" r="172" fill="none" stroke="var(--rule)"/>`;
  for (let i = 0; i <= 73; i++) s += i === 73 ? "" : tick(c, c, 172, i % 9 === 0 ? 160 : 166, 5 * i / L * 360, i % 9 === 0 ? 1.4 : .7, i % 9 === 0 ? "var(--ink)" : "var(--mute)");
  for (let i = 0; i < 73; i += 9) s += txt(c, c, 151, (5 * i + 2.5) / L * 360, i + 1, 8, "mute");
  // cadrane solare reale
  const sol = [evenimentSolar(y0, 3), evenimentSolar(y0 + 1, 0), evenimentSolar(y0 + 1, 1), evenimentSolar(y0 + 1, 2)];
  const b = [0, ...sol.slice(1).map(ang), 360];
  const names = ["iarnă", "primăvară", "vară", "toamnă"], qc = ["--q1", "--q2", "--q3", "--q4"];
  for (let q = 0; q < 4; q++) {
    s += `<path d="${arcPath(c, c, 124, 142, b[q], b[q + 1])}" fill="var(${qc[q]})" stroke="var(--rule)" stroke-width=".8"/>`;
    s += txt(c, c, 133, (b[q] + b[q + 1]) / 2, "CS " + (q + 1), 8.5, "", 'font-weight="500"');
  }
  for (let q = 0; q < 4; q++) {
    const a = q === 0 ? 0 : b[q];
    s += tick(c, c, 142, 124, a, 1.6, "var(--sun)");
    const [x, y] = P(c, c, 145, a);
    s += `<circle cx="${f1(x)}" cy="${f1(y)}" r="3" fill="var(--sun)"/>`;
  }
  // luna: fazele reale
  s += `<circle cx="220" cy="220" r="118" fill="none" stroke="var(--rule)"/>`;
  const evs = [...evAn(y0), ...evAn(y0 + 1)].filter(e => e[1][0] === "L" && e[0] >= s0 * DAY - off * 1000 && e[0] < (s0 + L) * DAY - off * 1000);
  for (const [t, code] of evs) {
    const a = ang(t), u = +code.slice(1);
    s += tick(c, c, 118, 112, a, .6, "var(--mute)");
    const [x, y] = P(c, c, 104, a);
    s += moon(f1(x), f1(y), u % 180 === 0 ? 5.4 : 5, u, "");
  }
  s += `<circle cx="220" cy="220" r="92" fill="none" stroke="var(--rule)" stroke-dasharray="2 3"/>`;
  s += `<g id="y-moon"></g>`;
  s += `<g id="y-hand"><line x1="220" y1="186" x2="220" y2="20" stroke="var(--sun)" stroke-width="1.8" stroke-linecap="round"/><circle cx="220" cy="22" r="4.2" fill="var(--sun)" stroke="var(--face)" stroke-width="1.5"/></g>`;
  s += `<circle cx="220" cy="220" r="3" fill="var(--sun)"/>`;
  $("dy").innerHTML = s;
  yKey = k + "|" + off;
}
function updYear(r, t) {
  const frac = (r.n - 1 + t / 86400) / Y.L * 360;
  $("y-hand").setAttribute("transform", `rotate(${frac.toFixed(3)} 220 220)`);
}
function updYearHL(r) {
  const c = 220, L = Y.L;
  let a1, a2, a3, a4;
  if (r.lc) { a1 = 28 * (r.lc - 1) / L * 360; a2 = 28 * r.lc / L * 360; } else { a1 = (364 + r.zn - 1) / L * 360; a2 = (364 + r.zn) / L * 360; }
  const as1 = 5 * (r.arc - 1) / L * 360, as2 = r.arc === 73 ? 360 : 5 * r.arc / L * 360;
  $("y-hl").innerHTML = `<path d="${arcPath(c, c, 176, 204, a1, a2)}" fill="none" stroke="var(--ink)" stroke-width="2.4"/><path d="${arcPath(c, c, 160, 172, as1, as2)}" fill="var(--sun)" opacity=".75"/>`;
  $("y-moon").innerHTML = moon(220, 220, 36, r.unghiLunar, "") +
    `<text x="220" y="272" font-size="9" text-anchor="middle" class="mute">${phaseName(r.unghiLunar)}</text>` +
    `<text x="220" y="164" font-size="9" text-anchor="middle" class="mute">AE ${r.ae}</text>`;
}

/* ---------- cadranul erelor ---------- */
let eKey = 0;
function buildEra(er, ae) {
  const c = 220, len = lungimeEra(er);
  let s = `<circle cx="220" cy="220" r="214" fill="var(--face)" stroke="var(--ink)" stroke-width="2"/>`;
  const qc = ["--q1", "--q2", "--q3", "--q4"];
  for (let j = 0; j < 12; j++) {
    const a1 = LIMITE[j] / CICLU * 360, a2 = LIMITE[j + 1] / CICLU * 360, mid = (a1 + a2) / 2;
    s += `<path d="${arcPath(c, c, 172, 206, a1, a2)}" fill="var(${qc[Math.floor(j / 3)]})" stroke="var(--rule)" stroke-width=".8"/>`;
    const [x, y] = P(c, c, 189, mid), flip = mid > 90 && mid < 270;
    s += `<text x="${f1(x)}" y="${f1(y)}" font-size="10.5" text-anchor="middle" dominant-baseline="central" transform="rotate(${f1(flip ? mid + 180 : mid)} ${f1(x)} ${f1(y)})" ${j + 1 === er ? 'font-weight="600" style="fill:var(--sun)"' : ""}>${j + 1} · ${NUME_ERE[j][0]}</text>`;
  }
  for (let q = 0; q < 4; q++) s += tick(c, c, 206, 100, q * 90, 1.4, "var(--ink)");
  // ticks pe ciclul întreg: sute și mii de ani
  for (let y = 0; y < CICLU; y += 100) {
    const a = y / CICLU * 360, mil = y % 1000 === 0;
    s += tick(c, c, 172, mil ? 160 : 166, a, mil ? 1.4 : .6, mil ? "var(--ink)" : "var(--mute)");
    if (mil) s += txt(c, c, 151, a, y / 1000, 8.5, "mute");
  }
  // inel interior: era curentă desfășurată pe 360°
  s += `<circle cx="220" cy="220" r="128" fill="none" stroke="var(--rule)"/><circle cx="220" cy="220" r="96" fill="none" stroke="var(--rule)"/>`;
  for (let y = 0; y <= len; y += 10) {
    const a = y / len * 360, h = y % 500 === 0 ? 14 : y % 100 === 0 ? 9 : 4;
    s += tick(c, c, 128, 128 - h, a, y % 100 === 0 ? 1.2 : .5, y % 100 === 0 ? "var(--ink)" : "var(--mute)");
    if (y % 500 === 0 && y < len) s += txt(c, c, 108, a, y === 0 ? "1" : y, 7.5, "mute");
  }
  // mini-cadran AS (73 arce)
  for (let i = 0; i < 73; i++) s += tick(c, c, 82, i % 9 === 0 ? 74 : 78, i / 73 * 360, i % 9 === 0 ? 1.2 : .6, "var(--mute)");
  s += `<g id="e-ann"></g><g id="e-h1"></g><g id="e-h2"></g><circle cx="220" cy="220" r="3.4" fill="var(--ink)"/>`;
  $("de").innerHTML = s;
  eKey = er;
}
function updEra(r, t) {
  const f = (r.n - 1 + t / 86400) / (inceputAn(r.k + 1) - inceputAn(r.k)), len = lungimeEra(r.er);
  const p = mod(r.k - K_ANCORA, CICLU) + f, a1 = p / CICLU * 360, a2 = (r.ae - 1 + f) / len * 360, a3 = f * 360;
  $("e-h1").innerHTML = `<g transform="rotate(${a1.toFixed(3)} 220 220)"><path d="M220 168 L214 150 L226 150Z" fill="var(--sun)" transform="translate(0,0)"/><line x1="220" y1="150" x2="220" y2="136" stroke="var(--sun)" stroke-width="1.2"/><path d="M220 207 L214.5 220 L225.5 220Z" fill="none"/><circle cx="220" cy="22" r="0" /><path d="M220 14 L213 4 L227 4Z" fill="none"/></g>`;
  // ac exterior: săgeată pe inelul erelor + linie fină spre centru
  $("e-h1").innerHTML = `<g transform="rotate(${a1.toFixed(3)} 220 220)"><line x1="220" y1="200" x2="220" y2="134" stroke="var(--sun)" stroke-width="1" stroke-dasharray="3 3"/><path d="M220 174 L213.5 158 L226.5 158Z" fill="var(--sun)" stroke="var(--face)" stroke-width="1"/></g>`;
  $("e-h2").innerHTML = `<g transform="rotate(${a2.toFixed(3)} 220 220)"><line x1="220" y1="220" x2="220" y2="94" stroke="var(--ink)" stroke-width="2" stroke-linecap="round"/><circle cx="220" cy="94" r="3.6" fill="var(--ink)"/></g>` +
    `<g transform="rotate(${a3.toFixed(3)} 220 220)"><line x1="220" y1="220" x2="220" y2="72" stroke="var(--sun)" stroke-width="1.3" stroke-linecap="round"/></g>`;
  return {p, len};
}
function updEraStatic(r) {
  const len = lungimeEra(r.er), lab = y => y >= 1 ? `${y} ${t("ce")}` : `${1 - y} ${t("bce")}`;
  const yNow = r.k + 2011, y1 = yNow - (r.ae - 1), y2 = y1 + len - 1;
  $("e-ann").innerHTML = `<text x="220" y="252" font-size="9" text-anchor="middle" class="mute">AS ${p2(r.arc)}.${r.za}</text><text x="220" y="262" font-size="7" text-anchor="middle" class="mute">${t("cs")} ${r.cs}</text>`;
  const x = v => 12 + 416 * v / len;
  let s = `<line x1="12" y1="22" x2="428" y2="22" stroke="var(--ink)" stroke-width="1.5"/>`;
  for (let a = 0; a <= len; a += 100) s += `<line x1="${f1(x(a))}" y1="22" x2="${f1(x(a))}" y2="${a % 500 === 0 ? 14 : 18}" stroke="var(--mute)"/>`;
  s += `<line x1="12" y1="22" x2="${f1(x(r.ae - 1))}" y2="22" stroke="var(--sun)" stroke-width="3.5"/>`;
  s += `<path d="M${f1(x(r.ae - 1))} 24 l-4.5 8 h9z" fill="var(--sun)"/>`;
  s += `<text x="12" y="46" font-size="9" class="mute">AE 1 · ${lab(y1)}</text><text x="428" y="46" font-size="9" text-anchor="end" class="mute">AE ${len} · ${lab(y2)}</text>`;
  s += `<text x="${f1(Math.min(Math.max(x(r.ae - 1), 90), 350))}" y="8" font-size="9" text-anchor="middle">AE ${r.ae}</text>`;
  $("erabar").innerHTML = s;
  return {y1, y2, lab, yNow};
}


/* ---------- Ceasul Pământului (proiecție polară, nordul în centru) ---------- */
const GR = 165, GLAT0 = -60;
const gproj = (lat, lon) => { const r = Math.min(GR, GR * (90 - lat) / (90 - GLAT0)), a = -lon; return P(220, 220, r, a); };
const zoneAng = k => -10 * k;
let gZoneTxt = [], gHours = [];
function buildGlobe() {
  const c = 220;
  let s = `<circle cx="220" cy="220" r="214" fill="var(--face)" stroke="var(--ink)" stroke-width="2"/>`;
  s += `<circle cx="220" cy="220" r="${GR}" fill="var(--sea)"/>`;
  s += `<path d="${LAND}" fill="var(--land)" stroke="var(--mute)" stroke-width=".5" stroke-linejoin="round"/>`;
  s += `<path id="g-night" fill="var(--night)" fill-opacity="var(--nightop)" fill-rule="evenodd" stroke="none"/>`;
  // paralele și meridiane
  for (const lat of [60, 30, 0, -30]) s += `<circle cx="220" cy="220" r="${(GR * (90 - lat) / (90 - GLAT0)).toFixed(1)}" fill="none" stroke="var(--ink)" stroke-opacity="${lat === 0 ? .5 : .28}" stroke-width=".7" ${lat === 0 ? "" : 'stroke-dasharray="2 3"'}/>`;
  for (let m = 0; m < 36; m++) s += tick(c, c, 0, GR, m * 10 - 0, m % 3 === 0 ? 1 : .55, "var(--ink)").replace("stroke-linecap", `stroke-opacity="${m % 3 === 0 ? .6 : .4}" stroke-linecap`);
  s += `<circle cx="220" cy="220" r="${GR}" fill="none" stroke="var(--ink)" stroke-width="1.4"/>`;
  // inelele fusurilor: număr de fus (A) și ora curentă (B)
  gZoneTxt = []; gHours = [];
  for (let k = -17; k <= 18; k++) {
    const a = zoneAng(k), a1 = a - 5, a2 = a + 5, id = "gz" + k;
    s += `<path id="${id}" d="${arcPath(c, c, 168, 188, a1, a2)}" fill="${k % 2 ? "var(--q4)" : "var(--q2)"}" stroke="var(--rule)" stroke-width=".6"/>`;
    s += `<path d="${arcPath(c, c, 188, 210, a1, a2)}" fill="var(--face)" stroke="var(--rule)" stroke-width=".6"/>`;
    s += txt(c, c, 178, a, k === 18 ? "±18" : (k > 0 ? "+" + k : k < 0 ? "−" + (-k) : "0"), k === 18 ? 6.5 : 7.5, "mute");
    s += `<text id="gh${k}" x="${f1(P(c, c, 199, a)[0])}" y="${f1(P(c, c, 199, a)[1])}" font-size="9.5" text-anchor="middle" dominant-baseline="central" font-weight="500">0</text>`;
  }
  // trei cadrane concentrice în interiorul hărții: ore (fusurile), minute (MN, 0–9, exterior), secunde (SN, 0–9, interior) cu 24 SS între două cifre
  const halo = 'stroke="var(--face)" stroke-width="2.6" paint-order="stroke"';
  s += `<circle cx="220" cy="220" r="157" fill="none" stroke="var(--ink)" stroke-opacity=".45" stroke-width=".8"/><circle cx="220" cy="220" r="122" fill="none" stroke="var(--sun)" stroke-opacity=".7" stroke-width=".8"/>`;
  for (let i = 0; i < 10; i++) { s += tick(c, c, 157, 151, i * 36, 1.2, "var(--ink)") + txt(c, c, 146, i * 36, i, 8, "", `fill="var(--ink)" ${halo}`) + tick(c, c, 122, 129, i * 36, 1.4, "var(--sun)") + txt(c, c, 136, i * 36, i, 7.5, "", `fill="var(--ink)" ${halo}`); }
  for (let i = 0; i < 240; i++) if (i % 24) s += tick(c, c, 122, i % 6 === 0 ? 117.5 : 119.5, i * 1.5, i % 6 === 0 ? .8 : .45, "var(--sun)");
  s += txt(c, c, 104, 18, "MN", 7, "", `fill="var(--ink)" ${halo}`) + txt(c, c, 104, 342, "SN · SS", 6.5, "", `fill="var(--ink)" ${halo}`);
  s += `<g id="g-zone"></g><g id="g-sub"></g><g id="g-moon"></g><g id="g-pin"></g><g id="g-hands"></g><g id="g-rd"></g>`;
  $("dg").innerHTML = s;
  gHours = Array.from({length: 36}, (_, i) => ({k: i - 17, el: $("gh" + (i - 17)), v: -1}));
}
let SUBL = {lat: 0, lon: 0};
function updGlobe(ms, r) {
  const sub = subsolar(ms), dec = sub.lat, c = 220;
  const tu = mod(ms / 1000, 86400);
  // terminator
  const td = Math.tan(rad(Math.abs(dec) < 0.05 ? 0.05 * (dec < 0 ? -1 : 1) : dec));
  let pts = "";
  for (let lon = 0; lon <= 360; lon += 3) {
    let lat = Math.atan(-Math.cos(rad(lon - sub.lon)) / td) * 180 / Math.PI;
    lat = Math.max(GLAT0, lat);
    const [x, y] = gproj(lat, lon);
    pts += (lon ? "L" : "M") + f1(x) + " " + f1(y);
  }
  pts += "Z";
  const full = `M${c - GR} ${c}a${GR} ${GR} 0 1 0 ${2 * GR} 0a${GR} ${GR} 0 1 0 ${-2 * GR} 0Z`;
  $("g-night").setAttribute("d", dec >= 0 ? full + pts : pts);
  // ore pe fusuri
  for (const h of gHours) {
    const v = Math.floor(mod(tu + 2400 * h.k, 86400) / 2400);
    if (v !== h.v) { h.v = v; h.el.textContent = v; h.el.style.fill = v === 18 ? "var(--sun)" : ""; h.el.style.fontWeight = v === 18 ? "700" : "500"; }
  }
  // fusul locului
  const zk = Math.max(-17, Math.min(18, Math.floor(st.lon / 10 + 0.5) || 0)), zkk = zk === -18 ? 18 : zk;
  $("g-zone").innerHTML = `<path d="${arcPath(c, c, 168, 210, zoneAng(zkk) - 5, zoneAng(zkk) + 5)}" fill="none" stroke="var(--sun)" stroke-width="2"/>`;
  // punct subsolar adevărat și locul
  const [sx, sy] = gproj(sub.lat, sub.lon), [px, py] = gproj(Math.max(GLAT0, st.lat), st.lon);
  $("g-sub").innerHTML = `<circle cx="${f1(sx)}" cy="${f1(sy)}" r="5.5" fill="none" stroke="var(--sun)" stroke-width="1.6"/><circle cx="${f1(sx)}" cy="${f1(sy)}" r="1.6" fill="var(--sun)"/>`;
  const lu = sublunar(ms), [mx, my] = gproj(Math.max(GLAT0, lu.lat), lu.lon);
  $("g-moon").innerHTML = `<circle cx="${f1(mx)}" cy="${f1(my)}" r="11" fill="var(--face)" fill-opacity=".55"/>` + moon(mx, my, 8, unghiLunar(ms)) + `<circle cx="${f1(mx)}" cy="${f1(my)}" r="9.5" fill="none" stroke="var(--ink)" stroke-opacity=".5" stroke-width=".7"/>`;
  SUBL = lu;
  $("g-pin").innerHTML = `<circle cx="${f1(px)}" cy="${f1(py)}" r="7" fill="var(--sun)" fill-opacity=".25"/><circle cx="${f1(px)}" cy="${f1(py)}" r="3" fill="var(--ink)" stroke="var(--face)" stroke-width="1.2"/>`;
  // ace: orar = Soarele mediu (spre fusul unde e amiază), minut, secundă
  const tt = reduce ? Math.floor(tu) : tu;
  const tl = mod(tt + r.off, 86400), ah = tt / 240 + 180, am = mod(tl, 2400) / 2400 * 360, as = mod(tl, 240) / 240 * 360, sa = Math.floor(mod(tl, 24)) * 15;
  let rays = ""; for (let i = 0; i < 8; i++) rays += tick(0, 0, 0, 0, 0, 0).slice(0, 0) + `<line x1="${f1(9 * Math.sin(i * Math.PI / 4))}" y1="${f1(-9 * Math.cos(i * Math.PI / 4))}" x2="${f1(13 * Math.sin(i * Math.PI / 4))}" y2="${f1(-13 * Math.cos(i * Math.PI / 4))}" stroke="#E8A317" stroke-width="1.6" stroke-linecap="round"/>`;
  const zA = zoneAng(zkk);
  $("g-hands").innerHTML =
    `<g transform="rotate(${zA} 220 220)"><line x1="220" y1="228" x2="220" y2="${220 - 100}" stroke="var(--moon)" stroke-width="2.6" stroke-linecap="round"/><path d="M220 ${220 - 114} L215.5 ${220 - 100} L224.5 ${220 - 100} Z" fill="var(--moon)"/></g>` +
    `<g transform="rotate(${ah.toFixed(3)} 220 220)"><g transform="translate(220 ${220 - 156})"><circle r="7" fill="#F7C32E" stroke="#E8A317" stroke-width="1.5"/>${rays}</g></g>` +
    `<g transform="rotate(${am.toFixed(3)} 220 220)"><line x1="220" y1="228" x2="220" y2="${220 - 150}" stroke="var(--hand)" stroke-width="2.4" stroke-linecap="round"/></g>` +
    `<g transform="rotate(${as.toFixed(3)} 220 220)"><line x1="220" y1="232" x2="220" y2="${220 - 121}" stroke="var(--sun)" stroke-width="1.2" stroke-linecap="round"/></g>` +
    `<circle cx="220" cy="220" r="9" fill="var(--hand)"/><text x="220" y="220.5" font-size="9" font-weight="700" text-anchor="middle" dominant-baseline="central" style="fill:var(--bg)">N</text>`;
  { const ring = (rad, ang, rr, col, w, dash) => { const [x, y] = P(c, c, rad, ang); return `<circle cx="${f1(x)}" cy="${f1(y)}" r="${rr}" fill="none" stroke="${col}" stroke-width="${w}"${dash ? ' stroke-dasharray="3 2"' : ""}/>`; };
    const kN = Math.floor(sub.lon / 10 + 0.5);
    $("g-rd").innerHTML = showRd ? ring(199, zoneAng(zkk), 13, "var(--hand)", 2.2) + ring(146, r.mn * 36, 8, "var(--hand)", 2) + ring(136, r.sn * 36, 8, "var(--sun)", 2) + ring(120.5, r.sn * 36 + r.ss * 1.5, 3.4, "var(--sun)", 1.4) + ring(199, zoneAng(kN), 13, "var(--sun)", 2, true) : ""; }
  stdTime(ms);
  $("dig").innerHTML = `<div class="k">${t("digL")}</div><div class="k">HN : MN : SN : SS</div><div class="v">${p2(r.hn)}:${p2(r.mn)}:${p2(r.sn)}<span class="z">:${p2(r.ss)}</span></div><div class="z">${r.mod === "F" ? t("modeF") + " " + (r.fus >= 0 ? "+" : "−") + p2(Math.abs(r.fus)) : t("modeL")}</div>`;
  return sub;
}
const CITY_TZ = ["Europe/Bucharest","Europe/London","America/New_York","America/Los_Angeles","America/Sao_Paulo","Europe/Paris","Africa/Cairo","Asia/Kolkata","Asia/Shanghai","Asia/Tokyo","Australia/Sydney"];
let stdKey = "";
function stdTime(ms) {
  const i = CITY_XY.findIndex(([x, y]) => Math.abs(x - st.lon) < 1e-6 && Math.abs(y - st.lat) < 1e-6);
  let hms, zone;
  try {
    if (i >= 0) {
      const o = {timeZone: CITY_TZ[i], hourCycle: "h23", hour: "2-digit", minute: "2-digit", second: "2-digit"};
      hms = new Intl.DateTimeFormat("en-GB", o).format(ms);
      zone = new Intl.DateTimeFormat("en-GB", {timeZone: CITY_TZ[i], timeZoneName: "shortOffset"}).formatToParts(ms).find(p => p.type === "timeZoneName").value.replace("GMT", "UTC").replace(/^UTC$/, "UTC+0");
      zone = zone.replace(/([+-])(\d)$/, "$1$2");
    }
  } catch (e) { hms = null; }
  if (!hms) {
    const off = Math.round(st.lon / 15), s = mod(ms / 1000 + off * 3600, 86400);
    hms = hhmmss(s); zone = "UTC" + (off >= 0 ? "+" : "−") + Math.abs(off) + " (" + t("nominal") + ")";
  }
  const key = hms + zone + LANG;
  if (key === stdKey) return; stdKey = key;
  $("std").innerHTML = `<div class="k">${t("stdL")}</div><div class="k">UTC</div><div class="v">${hms}</div><div class="v">${hhmmss(mod(ms / 1000, 86400))}</div><div class="z">${zone}</div><div class="z">${t("utcL")}</div>`;
}
function coord(lat, lon) {
  return `${ro(Math.abs(lat), 1)}° ${lat >= 0 ? t("N") : t("S")}, ${ro(Math.abs(lon), 1)}° ${lon >= 0 ? t("E") : t("W")}`;
}

/* ---------- stare și bucla principală ---------- */
const st = {lon: 26.1, lat: 44.4, mode: "F", fixed: null};
let chipSec = -1, lastSec = -1, R = null, lastMinKey = "", lastYearHL = "", eraInfo = null, SUB = null;
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

function codebar(r) {
  const sg = (v, l, cls) => `<div class="seg ${cls || ""}"><b>${v}</b><span>${l}</span></div>`;
  const zone = r.mod === "F" ? "F" + (r.fus >= 0 ? "+" : "−") + p2(Math.abs(r.fus)) : "L" + (r.lon >= 0 ? "+" : "−") + Math.abs(r.lon).toFixed(1);
  $("codebar").innerHTML = sg(r.er, "ER") + sg(String(r.ae).padStart(4, "0"), "AE") + sg(r.cs, "CS") + sg(`${p2(r.arc)}.${r.za}`, "AS.ZA") + sg(p2(r.cl), "CL") +
    sg(p2(r.lc), "LC") + sg(p2(r.zn), "ZN") + sg(`${p2(r.hn)}:${p2(r.mn)}:${p2(r.sn)}:${p2(r.ss)}`, "HN:MN:SN:SS", "t") + sg(zone, r.mod === "F" ? "F" : "L");
}
function deg3(a) { return `${ro(a, 2)}° = ${ro(a * 400 / 360, 2)} gon = ${ro(rad(a), 4)} rad`; }
function hhmmss(x) { return `${p2(Math.floor(x / 3600))}:${p2(Math.floor(x % 3600 / 60))}:${p2(Math.floor(x % 60))}`; }
function cd(ms) {
  let s = Math.max(0, Math.floor(ms / 1000)); const d = Math.floor(s / 86400); s -= d * 86400; const h = Math.floor(s / 3600), m = Math.floor(s % 3600 / 60);
  return d ? `${d} ${t("dUnit")} ${h} ${t("hUnit")}` : `${h} ${t("hUnit")} ${m} ${t("mUnit")}`;
}
function nextEvents(now) {
  const y = new Date(now).getUTCFullYear();
  const all = [...evAn(y), ...evAn(y + 1)].filter(e => e[0] > now).slice(0, 7);
  $("next").innerHTML = all.map(([tm, c]) => {
    const q = dinUtc(tm, st.lon, st.mode);
    return `<tr><td>${t("ev")[c]}</td><td class="n">${p2(q.lc)}-${p2(q.zn)} ${p2(q.hn)}:${p2(q.mn)}</td><td class="n">${cd(tm - now)}</td></tr>`;
  }).join("");
}
function full(now) {
  const r = dinUtc(now, st.lon, st.mode); R = r;
  codebar(r);
  if (yKey !== r.k + "|" + r.off) buildYear(r);
  if (eKey !== r.er) buildEra(r.er, r.ae);
  dateWindow("d36", r); dateWindow("d18", r);
  const mk = r.k + "|" + r.n + "|" + r.hn + "|" + r.mn + "|" + LANG; if (mk !== lastMinKey) { lastMinKey = mk; updYearHL(r); }
  eraInfo = updEraStatic(r);
  const wd = r.lc ? `${t("days")[r.ziSapt]} · ${ZILE_SA[r.ziSapt]}` : `${r.zn === 1 ? t("yearDay") : t("leapDay")} · ${r.zn === 1 ? "Varṣa-dina" : "Adhika-dina"}`;
  const loc = now + r.off * 1000, d = new Date(loc), g = t("gdate")(d.getUTCDate(), d.getUTCMonth() + 1, d.getUTCFullYear());
  $("ry").innerHTML = `<b>${r.lc ? t("month") + " " + r.lc + " (" + LUNI_SA[r.lc - 1] + " māsa)" : t("outside")}</b>, ${t("day")} ${r.zn} · ${wd}<br>${t("dayCap")} ${r.n} ${t("ofYear")} · ${t("greg")} ${g}`;
  const sa = NUME_ERE[r.er - 1];
  $("re").innerHTML = `<b>ER ${r.er} · ${sa[0]} · ${sa[1]} · ${sa[2]}</b><br>AE ${r.ae} ${t("eraOf")} ${lungimeEra(r.er)} · ${t("labelYear")} ${eraInfo.lab(eraInfo.yNow)}`;
  $("sky").innerHTML =
    `<dt>${t("sun")}</dt><dd>${deg3(r.unghiSolar)}</dd><dt>${t("moon")}</dt><dd>${deg3(r.unghiLunar)}</dd>` +
    `<dt>${t("phase")}</dt><dd>${phaseName(r.unghiLunar)} · ${t("lunarDay")} ${r.cl}</dd><dt>UTC</dt><dd>${new Date(now).toISOString().slice(0, 19).replace("T", " ")}</dd>` +
    `<dt>${t("local24")}</dt><dd>${g} ${hhmmss(mod(loc / 1000, 86400))}</dd>`;
  if (Math.floor(now / 60000) !== full.nm) { full.nm = Math.floor(now / 60000); nextEvents(now); }
  r.g = g;
}
full.nm = -1;

function chips(id, turn, r) {
  const sw = (w, c) => `<svg viewBox="0 0 34 14" aria-hidden="true"><line x1="3" y1="7" x2="31" y2="7" stroke="${c}" stroke-width="${w}" stroke-linecap="round"/></svg>`;
  const row = (svg, k, v, w) => `<div class="rw">${svg}<span><span class="k">${t(k)}</span><br><span class="v">${v}</span></span><span class="w">${w}</span></div>`;
  const tot = r.hn * 2400 + r.mn * 240 + r.sn * 24 + r.ss, hh = Math.floor(tot / 3600), mm = Math.floor(tot % 3600 / 60), ss = tot % 60;
  let hv, hw;
  if (turn === 36) { hv = r.hn; hw = t("rdHr36"); }
  else if (r.hn >= 1 && r.hn <= 18) { hv = r.hn; hw = t("rdHr18a"); }
  else { hv = r.hn === 0 ? 36 : r.hn; hw = t("rdHr18b"); }
  $(id).innerHTML = row(sw(5, "var(--hand)"), "rdH", hv, `${t("rdHw")} · ${hw}`)
    + row(sw(3, "var(--hand)"), "rdM", r.mn, `${t("rdMw")} · ${t("rdMr")}`)
    + row(sw(1.4, "var(--sun)"), "rdS", r.sn, `${t("rdSw")} · ${t("rdSr")}`)
    + row(sw(1.6, "var(--sun)"), "rdSS", p2(r.ss), `${t("rdSSw")} · ${t("rdSSr")}`)
    + row("<span></span>", "rdC", `${p2(hh)}:${p2(mm)}:${p2(ss)}`, "");
}
/* ---------- ceasul de mână (mecanic) ---------- */
let wMode = 36;
function buildWatch() {
  const c = 220, F = "font-family:Georgia,'Times New Roman',serif";
  let s = `<defs>
    <linearGradient id="wBz" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f2f4f7"/><stop offset=".45" stop-color="#8d96a3"/><stop offset=".55" stop-color="#e9edf2"/><stop offset="1" stop-color="#5d6672"/></linearGradient>
    <radialGradient id="wDl" cx=".5" cy=".42" r=".65"><stop offset="0" stop-color="#fbf8ef"/><stop offset="1" stop-color="#e3dccb"/></radialGradient>
    <linearGradient id="wGl" x1="0" y1="0" x2=".7" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".38"/><stop offset=".5" stop-color="#fff" stop-opacity="0"/></linearGradient>
    <linearGradient id="wDr" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8f8870"/><stop offset=".22" stop-color="#e9e3d0"/><stop offset=".5" stop-color="#fffdf5"/><stop offset=".78" stop-color="#e9e3d0"/><stop offset="1" stop-color="#8f8870"/></linearGradient>
    <filter id="wSh" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="1.5" dy="2.5" stdDeviation="2" flood-color="#000" flood-opacity=".35"/></filter></defs>
  <circle cx="${c}" cy="${c}" r="216" fill="url(#wBz)"/><circle cx="${c}" cy="${c}" r="203" fill="#20242b"/><circle cx="${c}" cy="${c}" r="198" fill="url(#wDl)"/>`;
  // inel interior: minut/secundă — 100 diviziuni, cifre 0–9 (ora e pe inelul exterior)
  for (let i = 0; i < 100; i++) s += tick(c, c, 136, i % 10 === 0 ? 124 : i % 5 === 0 ? 128 : 131, i * 3.6, i % 10 === 0 ? 2.2 : i % 5 === 0 ? 1.3 : .8, "#2a2f3a");
  for (let m = 0; m < 10; m++) s += txt(c, c, 113, m * 36, m, 14, "", `style="${F};font-weight:700;fill:#9b3414"`);
  s += `<circle cx="${c}" cy="${c}" r="139" fill="none" stroke="#c9bfa5" stroke-width=".8"/>`;
  s += `<g id="wt-nums"></g>`;
  s += `<g id="wt-moon"></g><g id="wt-logo"></g><g id="wt-date"></g>`;
  // subcadran: subsecunde (24 SS într-o secundă nouă), ca la ceasul de mână cu secundar mic
  const sx = 284, sy = 222;
  s += `<circle cx="${sx}" cy="${sy}" r="20" fill="#fbf8ef" stroke="#6b6552" stroke-width="1.4"/>`;
  for (let i = 0; i < 24; i++) s += tick(sx, sy, 20, i % 6 === 0 ? 13.5 : 17, i * 15, i % 6 === 0 ? 1.4 : .8, "#2a2f3a");
  for (let i = 0; i < 4; i++) s += txt(sx, sy, 8.8, i * 90, i * 6, 6, "", `style="${F};font-weight:700;fill:#9b3414"`);
  s += `<text x="${sx}" y="${sy - 25}" font-size="6" letter-spacing="1" text-anchor="middle" style="${F};fill:#4a4e57">24 SS</text>`;
  s += `<g id="wt-ss"><line x1="${sx}" y1="${sy + 4}" x2="${sx}" y2="${sy - 16.5}" stroke="#d9531e" stroke-width="1.4" stroke-linecap="round"/><circle cx="${sx}" cy="${sy}" r="2" fill="#d9531e"/></g>`;
  s += `<g id="wt-h" filter="url(#wSh)"><path d="M-6.5,20 L-4,-168 L0,-182 L4,-168 L6.5,20 Z" transform="translate(${c} ${c})" fill="#1b2230" stroke="#0b0f17" stroke-width=".8"/><path d="M-2.2,2 L-1.5,-158 L0,-168 L1.5,-158 L2.2,2 Z" transform="translate(${c} ${c})" fill="#dfeec0"/></g>`;
  s += `<g id="wt-m" filter="url(#wSh)"><path d="M-5,22 L-3,-118 L0,-132 L3,-118 L5,22 Z" transform="translate(${c} ${c})" fill="#1b2230" stroke="#0b0f17" stroke-width=".8"/><path d="M-1.6,2 L-1,-110 L0,-120 L1,-110 L1.6,2 Z" transform="translate(${c} ${c})" fill="#dfeec0"/></g>`;
  s += `<g id="wt-s" filter="url(#wSh)"><g transform="translate(${c} ${c})"><line x1="0" y1="46" x2="0" y2="-176" stroke="#d9531e" stroke-width="1.6" stroke-linecap="round"/><circle cx="0" cy="34" r="7" fill="none" stroke="#d9531e" stroke-width="2.4"/><circle cx="0" cy="-140" r="4.5" fill="#d9531e"/></g></g>`;
  s += `<circle cx="${c}" cy="${c}" r="8" fill="#1b2230" stroke="#0b0f17"/><circle cx="${c}" cy="${c}" r="3.2" fill="#d9531e"/>`;
  s += `<path d="M${c} 22 A198 198 0 0 0 40 150 A190 190 0 0 1 ${c} 22 Z" fill="url(#wGl)"/>`;
  $("wt").innerHTML = s; $("wt").dataset.mode = "";
}
function watchNums(half) {
  const c = 220, F = "font-family:Georgia,'Times New Roman',serif", n = wMode, per = 360 / n;
  let s = "";
  if (n === 18) s += `<circle cx="${c}" cy="${c}" r="${half === 1 ? 172 : 150}" fill="none" stroke="#d9531e" stroke-opacity=".16" stroke-width="${half === 1 ? 24 : 20}"/>`;
  for (let i = 0; i < n; i++) {
    const a = i * per, big = n === 36 ? i % 3 === 0 : true;
    s += tick(c, c, 196, big ? 183 : 189, a, big ? 3.6 : 2.2, "#2a2f3a");
    if (n === 18) {
      s += txt(c, c, 172, a, i === 0 ? 18 : i, half === 1 ? 22 : 14, "", `style="${F};font-weight:${half === 1 ? 700 : 500};fill:${half === 1 ? "#1b2230" : "#6b6552"};opacity:${half === 1 ? 1 : .45}"`);
      s += txt(c, c, 150, a, i === 0 ? 36 : 18 + i, half === 2 ? 18 : 11, "", `style="${F};font-weight:${half === 2 ? 700 : 500};fill:${half === 2 ? "#1b2230" : "#6b6552"};opacity:${half === 2 ? 1 : .45}"`);
    } else s += txt(c, c, 166, a, i, 16, "", `style="${F};font-weight:${i % 3 ? 500 : 700};fill:#1b2230"`);
  }
  $("wt-nums").innerHTML = s; $("wt").dataset.mode = wMode + "|" + (n === 18 ? half : 0);
}
/* rând de „tamburi” mecanice: cifrele stau în celule cu umbră cilindrică și se rostogolesc când se schimbă; cuvintele sunt gravate fix */
function drumRow(str, y, col, id, all) {
  const F = "font-family:Georgia,'Times New Roman',serif", W = 7, prev = (updWatch.drumPrev || {})[id] || "";
  const toks = str.match(/\d+|\D+/g) || [];
  const cell = tk => all || /\d/.test(tk[0]), wid = tk => cell(tk) ? tk.length * W + 2 : [...tk].reduce((w, c) => w + (c === " " ? 3 : c === "·" ? 3.4 : c === c.toUpperCase() && c !== c.toLowerCase() ? 5.6 : 4.5), 0);
  let x = 220 - toks.reduce((w, tk) => w + wid(tk), 0) / 2, o = "";
  for (const tk of toks) {
    if (!cell(tk)) { o += `<text x="${x.toFixed(1)}" y="${y}" font-size="8" dominant-baseline="central" style="${F};fill:${col};font-weight:500">${tk.replace(/ /g, "\u00a0")}</text>`; }
    if (cell(tk)) {
      [...tk].forEach((ch, n) => {
        const cx = x + n * W, changed = prev && prev !== str && prev[str.indexOf(tk) + n] !== ch;
        o += `<rect x="${(cx + .3).toFixed(1)}" y="${y - 5}" width="${W - .6}" height="10" rx="1" fill="url(#wDr)" stroke="#a79f86" stroke-width=".4"/>` +
          `<text x="${(cx + W / 2).toFixed(1)}" y="${y + .2}" font-size="8.2" text-anchor="middle" dominant-baseline="central" class="${changed ? "wroll" : ""}" style="${F};fill:${col};font-weight:700">${ch}</text>`;
      });
    }
    x += wid(tk);
  }
  updWatch.drumNow[id] = str;
  return o;
}
function updWatch(tl, r, ms) {
  const half = r.hn >= 1 && r.hn <= 18 ? 1 : 2;
  if ($("wt").dataset.mode !== wMode + "|" + (wMode === 18 ? half : 0)) watchNums(half);
  const per = wMode === 36 ? 86400 : 43200;
  const tf = a => `rotate(${a.toFixed(3)} 220 220)`;
  $("wt-h").setAttribute("transform", tf(mod(tl, per) / per * 360));
  $("wt-m").setAttribute("transform", tf(mod(tl, 2400) / 2400 * 360));
  $("wt-s").setAttribute("transform", tf(mod(tl, 240) / 240 * 360));
  $("wt-ss").setAttribute("transform", `rotate(${Math.floor(mod(tl, 24)) * 15} 284 222)`);
  const key = r.hn + "|" + r.zn + "|" + r.lc + "|" + wMode + "|" + LANG + "|" + Math.floor(ms / 600000);
  if (key !== updWatch.key) {
    updWatch.key = key;
    const F = "font-family:Georgia,'Times New Roman',serif";
    $("wt-moon").innerHTML = `<text x="220" y="133" font-size="6" letter-spacing="1.2" text-anchor="middle" style="${F};fill:#4a4e57">${t("wMoon").toUpperCase()}</text><circle cx="220" cy="160" r="22" fill="#0f1b33" stroke="#9a8f74" stroke-width="2"/>` + moon(220, 160, 17, unghiLunar(ms));
    $("wt-logo").innerHTML = "";
    const wd = r.lc ? t("daysS")[r.ziSapt] : (r.zn === 1 ? t("yearDayS") : t("leapDayS"));
    const l2 = r.lc ? t("winL")(r.lc, r.zn) : t("winY")(364 + r.zn);
    updWatch.drumPrev = Object.assign({}, updWatch.drumNow); updWatch.drumNow = {};
    $("wt-date").innerHTML = `<rect x="152" y="245" width="136" height="42" rx="4" fill="#2a2a2e" stroke="#6b6552" stroke-width="1.6"/><rect x="155" y="248" width="130" height="36" rx="2" fill="#f4efe0"/>` +
      drumRow(`ER ${r.er} · AE ${r.ae}`, 258.4, "#14213D", "a") + drumRow(l2, 269.4, "#14213D", "b") + drumRow(wd, 279.8, "#9b3414", "c", true);

  }
}
function setW(n) { wMode = n; $("w36").setAttribute("aria-pressed", n === 36); $("w18").setAttribute("aria-pressed", n === 18); updWatch.key = ""; }
$("w36").onclick = () => setW(36); $("w18").onclick = () => setW(18);

function frame() {
  const now = st.fixed != null ? st.fixed : Date.now();
  const sec = Math.floor(now / 1000);
  if (sec !== lastSec || R == null) { lastSec = sec; full(now); }
  if (R && chipSec !== sec) { chipSec = sec; chips("r36c", 36, R); chips("r18c", 18, R);
    const tot = R.hn * 2400 + R.mn * 240 + R.sn * 24 + R.ss; $("wrd").innerHTML = `<b>${t("rdH")} ${R.hn} · ${t("rdM")} ${R.mn} · ${t("rdS")} ${R.sn}</b> · ${t("rdC")} ${p2(Math.floor(tot / 3600))}:${p2(Math.floor(tot % 3600 / 60))}:${p2(tot % 60)}`; }
  const r = R, nowS = reduce ? sec : now / 1000;
  const tl = mod(nowS + r.off, 86400);
  updHour($("d36"), 36, tl, r); updHour($("d18"), 18, tl, r);
  updWatch(tl, r, now); updYear(r, tl); updEra(r, tl);
  SUB = updGlobe(reduce ? sec * 1000 : now, r);
  const a = tl / 240;
  $("r36").innerHTML = `<b>${p2(r.hn)} h ${p2(r.mn)} min ${p2(r.sn)} s ${p2(r.ss)} SS</b> · ${deg3(a)}`;
  $("r18").innerHTML = `<b>${r.hn % 18} h ${p2(r.mn)} min ${p2(r.sn)} s</b> · ${r.hn < 18 ? t("half1") : t("half2")} · ${deg3(a % 180 * 2)} ${t("onDial")}`;
  const fz = k => "F" + (k >= 0 ? "+" : "−") + p2(Math.abs(k)), tuS = mod(now / 1000, 86400), kS = Math.floor(SUB.lon / 10 + 0.5), kT = SUB.lon > 10 * kS ? kS : kS - 1, hnLeft = (SUB.lon - 10 * kT) / 10;
  const eotM = 4 * (mod(15 * (12 - tuS / 3600) - SUB.lon + 180, 360) - 180), ts = mod(tuS + st.lon * 240 + eotM * 60, 86400);
  const noonL = `<br><b>${t("noonZ")} ${fz(kS)}</b> (${t("noonNext")} ${fz(kT)} ${t("noonIn")} ${Math.floor(hnLeft)} ${t("hnU")} ${Math.floor(hnLeft % 1 * 10)} MN)<br>${t("solarTrue")}: <b>${p2(Math.floor(ts / 2400))}:${p2(Math.floor(ts % 2400 / 240))}:${p2(Math.floor(ts % 240 / 24))}</b> (${t("eotT")} ${eotM >= 0 ? "+" : "−"}${Math.floor(Math.abs(eotM))} ${t("min")} ${p2(Math.round(Math.abs(eotM) % 1 * 60))} s)`;
  $("rg").innerHTML = `<b>${t("subsolar")}</b>: ${coord(SUB.lat, SUB.lon)}<br><b>${t("sublunar")}</b>: ${coord(SUBL.lat, SUBL.lon)} · ${phaseName(unghiLunar(now))}<br>${t("at")} ${coord(st.lat, st.lon)}: <b>${p2(r.hn)}:${p2(r.mn)}:${p2(r.sn)}</b> ${t("localTime")} (${r.mod === "F" ? "F" + (r.fus >= 0 ? "+" : "−") + p2(Math.abs(r.fus)) : "L"})<br>${t("utcNow")}: ${hhmmss(mod(now / 1000, 86400))}` + noonL;
  requestAnimationFrame(frame);
}

/* ---------- limbă și comenzi ---------- */
function rdLabel() { document.querySelectorAll(".rdbtn").forEach(b => { b.textContent = t(showRd ? "rdBtnOff" : "rdBtnOn"); b.setAttribute("aria-pressed", showRd); }); }
document.querySelectorAll(".rdbtn").forEach(b => b.onclick = () => { showRd = !showRd; rdLabel(); });
function applyLang() {
  document.documentElement.lang = LANG;
  document.querySelectorAll("[data-i18n]").forEach(e => { const v = t(e.dataset.i18n); if (typeof v === "string") e.innerHTML = v; });
  document.querySelectorAll("[data-i18n-title]").forEach(e => e.title = t(e.dataset.i18nTitle));
  document.querySelectorAll("[data-lang]").forEach(b => b.setAttribute("aria-pressed", b.dataset.lang === LANG));
  const sel = $("preset"), cur = sel.value;
  sel.innerHTML = t("cities").map((c, i) => `<option value="${i}">${c}</option>`).join("") + `<option value="custom">${t("custom")}</option>`;
  sel.value = cur || "0";
  rdLabel(); chipSec = -1; liveUi(); lastSec = -1; lastMinKey = ""; full.nm = -1;
}
function setMode(m) { st.mode = m; $("mF").setAttribute("aria-pressed", m === "F"); $("mL").setAttribute("aria-pressed", m === "L"); lastSec = -1; lastMinKey = ""; full.nm = -1; }
$("mF").onclick = () => setMode("F"); $("mL").onclick = () => setMode("L");
function syncPreset() {
  const i = CITY_XY.findIndex(([x, y]) => Math.abs(x - st.lon) < 1e-6 && Math.abs(y - st.lat) < 1e-6);
  $("preset").value = i >= 0 ? String(i) : "custom";
}
function setPos(lon, lat) {
  if (isFinite(lon)) st.lon = Math.max(-180, Math.min(180, lon));
  if (isFinite(lat)) st.lat = Math.max(-90, Math.min(90, lat));
  lastSec = -1; full.nm = -1; lastMinKey = ""; syncPreset();
}
$("lon").addEventListener("input", e => setPos(parseFloat(e.target.value), NaN));
$("lat").addEventListener("input", e => setPos(NaN, parseFloat(e.target.value)));
$("preset").addEventListener("change", e => {
  if (e.target.value === "custom") return;
  const [x, y] = CITY_XY[+e.target.value]; $("lon").value = x; $("lat").value = y; setPos(x, y);
});
function liveUi() { $("live").classList.toggle("fix", st.fixed != null); $("livetxt").textContent = st.fixed != null ? t("fix") : t("live"); }
$("when").addEventListener("input", e => { const v = Date.parse(e.target.value + (e.target.value.length === 16 ? ":00" : "") + "Z"); if (isFinite(v)) { st.fixed = v; lastSec = -1; full.nm = -1; lastMinKey = ""; liveUi(); } });
$("now").onclick = () => { st.fixed = null; $("when").value = ""; lastSec = -1; full.nm = -1; lastMinKey = ""; liveUi(); };

buildWatch(); buildHour($("d36"), 36); buildHour($("d18"), 18); buildGlobe();
$("preset").innerHTML = "";
applyLang(); $("preset").value = "0";
requestAnimationFrame(frame);

/* ---------- convertor ---------- */
const zoneTxt = () => st.mode === "F" ? "F" + (fus(st.lon) >= 0 ? "+" : "−") + p2(Math.abs(fus(st.lon))) : "L" + (st.lon >= 0 ? "+" : "−") + Math.abs(st.lon).toFixed(1);
const isoUtc = ms => new Date(ms).toISOString().slice(0, 19).replace("T", " ");
function describeR(r) {
  const sa = NUME_ERE[r.er - 1];
  const day = r.lc ? `${t("days")[r.ziSapt]} · ${ZILE_SA[r.ziSapt]}` : (r.zn === 1 ? t("yearDay") : t("leapDay"));
  return `ER ${r.er} ${sa[0]} · ${sa[1]} · ${sa[2]} · AE ${r.ae} · ${day} · ${phaseName(r.unghiLunar)}`;
}
function convSI() {
  const o = $("cv-o1"), d = $("cv-o1d"), v = $("cv-dt").value;
  o.classList.remove("err");
  const ms0 = Date.parse(v + (v.length === 16 ? ":00" : "") + "Z");
  if (!v || !isFinite(ms0)) { o.classList.add("err"); o.textContent = t("err").date; d.textContent = ""; return; }
  const ms = $("cv-ref-l").checked ? ms0 - decalajS(st.lon, st.mode) * 1000 : ms0;
  const r = dinUtc(ms, st.lon, st.mode);
  o.textContent = cod(r); d.textContent = describeR(r) + "  ·  UTC " + isoUtc(ms);
}
function convNew() {
  const o = $("cv-o2"), d = $("cv-o2d"); o.classList.remove("err");
  const g = id => parseInt($("cv-" + id).value, 10);
  try {
    const ms = inUtc(g("er"), g("ae"), g("lc"), g("zn"), g("hn"), g("mn"), g("sn"), g("ss"), st.lon, st.mode, parseInt($("cv-cyc").value, 10));
    const off = decalajS(st.lon, st.mode) * 1000, r = dinUtc(ms, st.lon, st.mode);
    o.textContent = "UTC " + isoUtc(ms);
    d.textContent = `${t("cvLoc")} (${zoneTxt()}): ${isoUtc(ms + off).replace(/ /, " ")}  ·  ${describeR(r)}`;
  } catch (e) {
    o.classList.add("err"); const m = t("err")[e.e]; o.textContent = typeof m === "function" ? m(...e.a) : (m || t("err").time); d.textContent = "";
  }
}
function fillNew(r) { for (const k of ["er", "ae", "lc", "zn", "hn", "mn", "sn", "ss"]) $("cv-" + k).value = r[k]; }
$("cv-code").addEventListener("input", e => {
  const p = parseCod(e.target.value), o = $("cv-o2");
  if (!p) { o.classList.add("err"); o.textContent = t("err").code; $("cv-o2d").textContent = ""; return; }
  fillNew(p);
  if (p.mod !== st.mode) setMode(p.mod);
  $("lon").value = p.lon; setPos(p.lon, NaN);
  convNew(); convRefLabel();
});
for (const id of ["er", "ae", "lc", "zn", "hn", "mn", "sn", "ss", "cyc"]) $("cv-" + id).addEventListener("input", convNew);
$("cv-dt").addEventListener("input", convSI);
document.querySelectorAll("input[name=cv-ref]").forEach(x => x.addEventListener("change", convSI));
function convRefLabel() { $("cv-ref-lt").textContent = t("cvRefL")(zoneTxt()); }
function convAll() { convRefLabel(); convSI(); convNew(); }
// recalculează când se schimbă zona sau limba
for (const id of ["lon", "preset"]) $(id).addEventListener("input", convAll), $(id).addEventListener("change", convAll);
$("mF").addEventListener("click", convAll); $("mL").addEventListener("click", convAll);
document.querySelectorAll("[data-lang]").forEach(b => b.addEventListener("click", convAll));
// valori inițiale: momentul curent
(function () {
  const now = Date.now(), r = dinUtc(now, st.lon, st.mode);
  $("cv-dt").value = new Date(now).toISOString().slice(0, 19);
  fillNew(r); $("cv-code").value = cod(r);
  applyLang(); convAll();
})();

/* ---------- calendarul anului ---------- */
const GMON = {ro: ["ian","feb","mar","apr","mai","iun","iul","aug","sep","oct","nov","dec"], en: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"], fr: ["janv","févr","mars","avr","mai","juin","juil","août","sept","oct","nov","déc"]};
let calK = null;
function gparts(day) { const d = new Date(day * DAY); return [d.getUTCDate(), d.getUTCMonth() + 1, d.getUTCFullYear()]; }
function buildCalendar() {
  if (calK === null) return;
  const k = calK, s0 = inceputAn(k), L = inceputAn(k + 1) - s0, off = decalajS(st.lon, st.mode) * 1000, label = k + 2011;
  const y0 = gparts(s0)[2], marks = {};
  for (const [tm, code] of [...evAn(y0), ...evAn(y0 + 1)]) {
    const day = Math.floor((tm + off) / DAY);
    if (day < s0 || day >= s0 + L) continue;
    const sym = {L0: "●", L90: "◐", L180: "○", L270: "◑", S0: "☀", S1: "☀", S2: "☀", S3: "☀"}[code];
    (marks[day - s0 + 1] = marks[day - s0 + 1] || []).push([sym, code[0] === "S"]);
  }
  const todayDay = Math.floor((Date.now() + off) / DAY), fmtD = d => t("gdate")(...gparts(d));
  const [er, ae] = eraAeDinK(k);
  $("cal-head").innerHTML = `<b>${t("calYearLine")(label, [er, ae], fmtD(s0), fmtD(s0 + L - 1), esteBisect(k)).split(" · ")[0]}</b><span>${t("calYearLine")(label, [er, ae], fmtD(s0), fmtD(s0 + L - 1), esteBisect(k)).split(" · ").slice(1).join(" · ")} · ${t("cs").length ? zoneTxt() : ""}</span>`;
  const cell = n => {
    const day = s0 + n - 1, [d, m] = gparts(day), mk = (marks[n] || []).map(([sy, sol]) => `<em class="${sol ? "sun" : ""}">${sy}</em>`).join("");
    return `<td class="${day === todayDay ? "today" : ""}"><b>${n <= 364 ? ((n - 1) % 28 + 1) : n - 364}</b><i>${d === 1 ? d + " " + GMON[LANG][m - 1] : d}</i>${mk}</td>`;
  };
  let html = "";
  for (let mo = 0; mo < 13; mo++) {
    const a = gparts(s0 + mo * 28), b = gparts(s0 + mo * 28 + 27);
    let rows = "";
    for (let w = 0; w < 4; w++) { rows += "<tr>"; for (let d = 0; d < 7; d++) rows += cell(mo * 28 + w * 7 + d + 1); rows += "</tr>"; }
    html += `<div class="mo"><h4><b>${mo + 1}</b>${LUNI_SA[mo]} māsa<small>${a[0]} ${GMON[LANG][a[1] - 1]} – ${b[0]} ${GMON[LANG][b[1] - 1]}</small></h4>` +
      `<table><thead><tr>${t("wk").map((w, i) => `<th class="${i > 4 ? "we" : ""}" title="${t("days")[i]}">${w}</th>`).join("")}</tr></thead><tbody>${rows}</tbody></table></div>`;
  }
  const yd = [364 + 1].concat(L === 366 ? [366] : []);
  html += `<div class="mo yd"><h4><b>·</b>${t("yearDay")}${L === 366 ? " / " + t("leapDay") : ""}</h4><table><tbody>` +
    yd.map(n => `<tr><td class="${s0 + n - 1 === todayDay ? "today" : ""}"><b>${n === 365 ? t("yearDay") : t("leapDay")}</b><i>${fmtD(s0 + n - 1)}${(marks[n] || []).map(m => " " + m[0]).join("")}</i></td></tr>`).join("") + `</tbody></table></div>`;
  $("cal-months").innerHTML = html;
  $("cal-legend").textContent = t("calLegend");
  $("cal-y").value = label;
}
function calSet(label) { label = Math.max(1, Math.min(9998, Math.round(label))); calK = label - 2011; buildCalendar(); }
$("cal-y").addEventListener("change", e => { const v = parseInt(e.target.value, 10); if (isFinite(v)) calSet(v); });
$("cal-prev").onclick = () => calSet(calK + 2011 - 1); $("cal-next").onclick = () => calSet(calK + 2011 + 1);
$("cal-today").onclick = () => calSet((R ? R.k : dinUtc(Date.now(), st.lon, st.mode).k) + 2011);
for (const id of ["lon", "preset"]) { $(id).addEventListener("input", buildCalendar); $(id).addEventListener("change", buildCalendar); }
$("mF").addEventListener("click", buildCalendar); $("mL").addEventListener("click", buildCalendar);
document.querySelectorAll("[data-lang]").forEach(b => b.addEventListener("click", buildCalendar));
calSet(dinUtc(Date.now(), st.lon, st.mode).k + 2011);

/* ---------- cadrane cerești: constelația străbătută de Soare și zodia modernă ---------- */
// Limitele constelațiilor de pe ecliptică, în longitudine ecliptică J2000 (grade). Calculate din granițele IAU (Delporte 1930,
// tabelul Roman 1987) cu astropy 8.0; ordinea: Ari Tau Gem Cnc Leo Vir Lib Sco Oph Sgr Cap Aqr Psc (Psc începe la ultima limită).
const CONST_BND = [28.69, 53.42, 90.14, 117.99, 138.04, 173.855, 217.81, 241.05, 247.64, 266.24, 299.66, 327.49, 351.65];
const precesLon = ms => { const T = Tcen(ms); return 1.396971278 * T + 0.000308637 * T * T; };   // precesia generală în longitudine față de J2000, grade
const lonSoareJ = ms => mod(longitudineSoare(ms) - precesLon(ms), 360);                          // longitudinea Soarelui față de echinocțiul J2000
function constIdx(lj) { for (let i = 12; i >= 0; i--) if (lj >= CONST_BND[i]) return i; return 12; }
const constA1 = i => CONST_BND[i], constA2 = i => i === 12 ? CONST_BND[0] + 360 : CONST_BND[i + 1];
// momentul cel mai apropiat (dir = −1 înainte, +1 după ms) în care longitudinea f(ms) trece prin b
function sunCross(f, ms, b, dir) {
  const h = x => mod(f(x) - b + 180, 360) - 180, S = 12 * 3600e3;
  let x0 = ms, x1 = ms;
  if (dir < 0) { for (let i = 0; i < 800 && h(x1) >= 0; i++) { x0 = x1; x1 -= S; } [x0, x1] = [x1, x0]; }
  else { for (let i = 0; i < 800 && h(x1) < 0; i++) { x0 = x1; x1 += S; } }
  for (let i = 0; i < 40; i++) { const m = (x0 + x1) / 2; if (h(m) < 0) x0 = m; else x1 = m; }
  return x1;
}
const ZOD_GLYPH = ["♈", "♉", "♊", "♋", "♌", "♍", "♎", "♏", "♐", "♑", "♒", "♓"].map(g => g + "︎");
const csDate = ms => { const d = new Date(ms); return t("gdate")(d.getUTCDate(), d.getUTCMonth() + 1, d.getUTCFullYear()); };
const csDeg = x => x.toFixed(2).replace(".", t("dec"));
let csMs = Math.floor(Date.now() / 60000) * 60000;

function csFrame(cx, cy, r1, labels) {
  let s = `<circle cx="${cx}" cy="${cy}" r="216" fill="var(--face)" stroke="var(--ink)" stroke-width="2"/>`;
  for (let d = 0; d < 360; d += 10) s += tick(cx, cy, r1, d % 30 === 0 ? r1 - 9 : r1 - 5, d, d % 30 === 0 ? 1.4 : .8, "var(--mute)");
  if (labels) for (let d = 0; d < 360; d += 30) s += txt(cx, cy, r1 - 20, d, d + "°", 9, "mute");
  return s;
}
function csSun(cx, cy, r, a) {
  const [x, y] = P(cx, cy, r, a);
  const [x0, y0] = P(cx, cy, 40, a);
  let s = `<line x1="${f1(x0)}" y1="${f1(y0)}" x2="${f1(x)}" y2="${f1(y)}" stroke="var(--sun)" stroke-width="1.4" stroke-dasharray="3 3"/>`;
  for (let k = 0; k < 8; k++) s += tick(x, y, 10.5, 15, k * 45, 1.6, "var(--sun)");
  return s + `<circle cx="${f1(x)}" cy="${f1(y)}" r="8" fill="var(--sun)" stroke="var(--ink)" stroke-width="1.2"/>`;
}

function drawConst(ms) {
  const cx = 220, cy = 220, r1 = 100, r2 = 142, lj = lonSoareJ(ms), idx = constIdx(lj), N = t("constN");
  let s = csFrame(cx, cy, r1, true);
  for (let i = 0; i < 13; i++) {
    const a1 = constA1(i), a2 = constA2(i), cur = i === idx;
    const fill = cur ? "color-mix(in srgb,var(--sun) 34%,var(--face))" : (i % 2 ? "var(--face)" : "color-mix(in srgb,var(--moon) 10%,var(--face))");
    s += `<path d="${arcPath(cx, cy, r1, r2, a1, a2)}" fill="${fill}" stroke="var(--ink)" stroke-width="${cur ? 1.8 : 1}"/>`;
    const mid = (a1 + a2) / 2, lr = i === 7 ? 202 : 178;
    s += txt(cx, cy, lr, mid, N[i], 10.5, "", cur ? 'font-weight="700" style="fill:var(--sun)"' : "");
  }
  // punctul vernal al datei (echinocțiul de primăvară): se mută lent înapoi prin constelații
  const vp = mod(-precesLon(ms), 360), [vx, vy] = P(cx, cy, 58, vp);
  s += tick(cx, cy, r1 - 1, r1 - 8, vp, 2.4, "var(--moon)") + tick(cx, cy, r1 - 8, r1 - 34, vp, 1, "var(--moon)") + `<text x="${f1(vx)}" y="${f1(vy)}" font-size="13" text-anchor="middle" dominant-baseline="central" style="fill:var(--moon)" font-weight="700">γ</text>`;
  s += csSun(cx, cy, (r1 + r2) / 2, lj);
  s += `<text x="${cx}" y="${cy - 8}" font-size="16" text-anchor="middle" font-weight="600">${N[idx]}</text><text x="${cx}" y="${cy + 12}" font-size="10" text-anchor="middle" class="mute">${csDeg(lj)}° J2000</text>`;
  $("dc").innerHTML = s;
  $("dc").setAttribute("aria-label", t("celConstH") + ": " + N[idx]);
  const a = sunCross(lonSoareJ, ms, constA1(idx), -1), b = sunCross(lonSoareJ, ms, constA2(idx) % 360, +1);
  $("rc").innerHTML = t("celConstOut")(N[idx], csDate(a), csDate(b), csDeg(longitudineSoare(ms)), csDeg(lj), csDeg(precesLon(ms)));
  return {idx, a, b, edge: Math.min(lj - constA1(idx), constA2(idx) - (lj < constA1(idx) ? lj + 360 : lj))};
}

function drawZod(ms) {
  const cx = 220, cy = 220, r1 = 100, r2 = 142, lam = longitudineSoare(ms), j = Math.floor(lam / 30), Z = t("zodN");
  let s = csFrame(cx, cy, r1, false);
  for (let i = 0; i < 12; i++) {
    const cur = i === j, a1 = i * 30, a2 = a1 + 30;
    const fill = cur ? "color-mix(in srgb,var(--sun) 34%,var(--face))" : (i % 2 ? "var(--face)" : "color-mix(in srgb,var(--moon) 10%,var(--face))");
    s += `<path d="${arcPath(cx, cy, r1, r2, a1, a2)}" fill="${fill}" stroke="var(--ink)" stroke-width="${cur ? 1.8 : 1}"/>`;
    s += txt(cx, cy, 124, a1 + 15, ZOD_GLYPH[i], 21, "", cur ? 'style="fill:var(--sun)"' : "");
    s += txt(cx, cy, 178, a1 + 15, Z[i], 10.5, "", cur ? 'font-weight="700" style="fill:var(--sun)"' : "");
  }
  s += csSun(cx, cy, 84, lam);
  s += `<text x="${cx}" y="${cy - 8}" font-size="16" text-anchor="middle" font-weight="600">${Z[j]}</text><text x="${cx}" y="${cy + 12}" font-size="10" text-anchor="middle" class="mute">${csDeg(lam)}°</text>`;
  $("dz").innerHTML = s;
  $("dz").setAttribute("aria-label", t("celZodH") + ": " + Z[j]);
  const a = sunCross(longitudineSoare, ms, j * 30, -1), b = sunCross(longitudineSoare, ms, ((j + 1) * 30) % 360, +1);
  $("rz").innerHTML = t("celZodOut")(Z[j], csDate(a), csDate(b), csDeg(lam), ZOD_GLYPH[j]);
  return {j, a, b, edge: Math.min(lam - j * 30, (j + 1) * 30 - lam)};
}

function csRender(fromCode) {
  const r = dinUtc(csMs, st.lon, st.mode);
  if (!fromCode) $("cs-code").value = cod(r);
  $("cs-dt").value = new Date(csMs).toISOString().slice(0, 16);
  $("cs-msg").classList.remove("err"); $("cs-msg").textContent = "";
  const C = drawConst(csMs), Zd = drawZod(csMs), N = t("constN"), Z = t("zodN"), co = zodOfConst(C.idx) === Zd.j;
  $("cs-ans").innerHTML = t("celAns")(ZOD_GLYPH[Zd.j], Z[Zd.j], csDate(Zd.a), csDate(Zd.b), N[C.idx], csDate(C.a), csDate(C.b), co, Zd.edge < 1.5, C.idx === 8);
}
// zodia „firească” a unei constelații (Ophiuchus nu are zodie)
function zodOfConst(ci) { return ci === 8 ? -1 : ci < 8 ? ci : ci - 1; }
function csFromSI() {
  const v = $("cs-dt").value, ms = Date.parse(v + (v.length === 16 ? ":00" : "") + "Z");
  if (!v || !isFinite(ms)) { $("cs-msg").classList.add("err"); $("cs-msg").textContent = t("err").date; return; }
  csMs = ms; csRender(false);
}
function csFromCode() {
  const p = parseCod($("cs-code").value), m = $("cs-msg");
  if (!p) { m.classList.add("err"); m.textContent = t("err").code; return; }
  try {
    const cyc = parseInt($("cv-cyc").value, 10);
    csMs = inUtc(p.er, p.ae, p.lc, p.zn, p.hn, p.mn, p.sn, p.ss, p.lon, p.mod, cyc);
    csRender(true);
  } catch (e) {
    m.classList.add("err"); const x = t("err")[e.e]; m.textContent = typeof x === "function" ? x(...e.a) : (x || t("err").time);
  }
}
$("cs-dt").addEventListener("input", csFromSI);
$("cs-code").addEventListener("input", csFromCode);
$("cs-now").onclick = () => { csMs = Math.floor(Date.now() / 60000) * 60000; csRender(false); };
for (const id of ["lon", "preset"]) { $(id).addEventListener("input", () => csRender(false)); $(id).addEventListener("change", () => csRender(false)); }
$("mF").addEventListener("click", () => csRender(false)); $("mL").addEventListener("click", () => csRender(false));
document.querySelectorAll("[data-lang]").forEach(b => b.addEventListener("click", () => csRender(false)));
csRender(false);

/* ---------- meniu cu file ---------- */
const TABS = ["timp", "data", "calendar", "zodiac", "convertor"];
function showTab(name, focus) {
  if (!TABS.includes(name)) name = "timp";
  for (const n of TABS) {
    const b = $("t-" + n), on = n === name;
    b.setAttribute("aria-selected", on); b.tabIndex = on ? 0 : -1; $("p-" + n).hidden = !on;
    if (on && focus) b.focus();
  }
  try { localStorage.setItem("cp-tab", name); } catch (e) {}
  try { history.replaceState(null, "", "#" + name); } catch (e) {}
}
document.querySelectorAll("[data-tab]").forEach(b => {
  b.addEventListener("click", () => showTab(b.dataset.tab));
  b.addEventListener("keydown", e => {
    const i = TABS.indexOf(b.dataset.tab);
    if (e.key === "ArrowRight") { e.preventDefault(); showTab(TABS[(i + 1) % TABS.length], true); }
    if (e.key === "ArrowLeft") { e.preventDefault(); showTab(TABS[(i + TABS.length - 1) % TABS.length], true); }
  });
});
{ let first = (location.hash || "").slice(1);
  if (!TABS.includes(first)) { try { first = localStorage.getItem("cp-tab"); } catch (e) { first = null; } }
  showTab(TABS.includes(first) ? first : "timp"); }

applyLang();
{ const pb = document.getElementById("cal-print"); if (pb) pb.onclick = () => window.print(); }

})();
