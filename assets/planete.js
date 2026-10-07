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

/* Poziții planetare: elemente keplerian + rate seculare (E. M. Standish, JPL, „Keplerian Elements for Approximate Positions of the Major Planets”, Tabelul 1, 1800–2050). */
const PL_EL = {
 Mercury:[0.38709927,0.00000037,0.20563593,0.00001906,7.00497902,-0.00594749,252.25032350,149472.67411175,77.45779628,0.16047689,48.33076593,-0.12534081],
 Venus:[0.72333566,0.00000390,0.00677672,-0.00004107,3.39467605,-0.00078890,181.97909950,58517.81538729,131.60246718,0.00268329,76.67984255,-0.27769418],
 Earth:[1.00000261,0.00000562,0.01671123,-0.00004392,-0.00001531,-0.01294668,100.46457166,35999.37244981,102.93768193,0.32327364,0,0],
 Mars:[1.52371034,0.00001847,0.09339410,0.00007882,1.84969142,-0.00813131,-4.55343205,19140.30268499,-23.94362959,0.44441088,49.55953891,-0.29257343],
 Jupiter:[5.20288700,-0.00011607,0.04838624,-0.00013253,1.30439695,-0.00183714,34.39644051,3034.74612775,14.72847983,0.21252668,100.47390909,0.20469106],
 Uranus:[19.18916464,-0.00196176,0.04725744,-0.00004397,0.77263783,-0.00242939,313.23810451,428.48202785,170.95427630,0.40805281,74.01692503,0.04240589],
 Neptune:[30.06992276,0.00026291,0.00859048,0.00005105,1.77004347,0.00035372,-55.12002969,218.45945325,44.96476227,-0.32241464,131.78422574,-0.00508664],
 Pluto:[39.48211675,-0.00031596,0.24882730,0.00005170,17.14001206,0.00004818,238.92903833,145.20780515,224.06891629,-0.04062942,110.30393684,-0.01183482],
 Saturn:[9.53667594,-0.00125060,0.05386179,-0.00050991,2.48599187,0.00193609,49.95424423,1222.49362201,92.59887831,-0.41897216,113.66242448,-0.28867794]
};
const _rad=x=>x*Math.PI/180, _mod=(x,m)=>((x%m)+m)%m;
function helio(name, T){ // T = secole julian de la J2000; returnează [x,y,z] ecliptic J2000, UA
  const e=PL_EL[name], a=e[0]+e[1]*T, ec=e[2]+e[3]*T, I=e[4]+e[5]*T, L=e[6]+e[7]*T, w=e[8]+e[9]*T, N=e[10]+e[11]*T;
  const om=w-N; let M=_mod(L-w+180,360)-180; let E=_rad(M)+ec*Math.sin(_rad(M)); // Kepler
  for(let i=0;i<8;i++){ const Ed=E; E=E-(E-ec*Math.sin(E)-_rad(M))/(1-ec*Math.cos(E)); if(Math.abs(E-Ed)<1e-12)break; }
  const xp=a*(Math.cos(E)-ec), yp=a*Math.sqrt(1-ec*ec)*Math.sin(E);
  const co=Math.cos(_rad(om)), so=Math.sin(_rad(om)), cN=Math.cos(_rad(N)), sN=Math.sin(_rad(N)), cI=Math.cos(_rad(I)), sI=Math.sin(_rad(I));
  return [(co*cN-so*sN*cI)*xp+(-so*cN-co*sN*cI)*yp, (co*sN+so*cN*cI)*xp+(-so*sN+co*cN*cI)*yp, so*sI*xp+co*sI*yp];
}
function geoLon(name, ms){ // longitudine ecliptică geocentrică (J2000), grade
  const T=(ms-Date.UTC(2000,0,1,12))/864e5/36525, p=helio(name,T), e=helio("Earth",T);
  return _mod(Math.atan2(p[1]-e[1],p[0]-e[0])*180/Math.PI,360);
}


/* Planete și zodiac: cadrane. Texte din #pl-data. Soare, Lună: Meeus (nucleul sistemului). Planete: elemente keplerian JPL (Standish), Tabelul 1; Chiron: elemente NASA, epoca 1996. */
const D = JSON.parse(document.getElementById("pl-data").textContent);
const num = (x, d) => x.toFixed(d).replace(".", D.dec);
const ang = lon => mod(lon - 270, 360); /* 0° la solstițiul din decembrie, ca în restul sistemului */
const PREC = 50.29 / 3600 / 365.25; /* grade pe zi */
const dJ = ms => (ms - Date.UTC(2000, 0, 1, 12)) / 864e5;
const planLon = (n, ms) => mod(geoLon(n, ms) + PREC * dJ(ms), 360);
/* Chiron: elemente osculatoare NASA (epoca 17.01.1996), traiectorie kepleriană; precizie de ordinul gradelor */
function chironLon(ms) {
  const a = 13.7053530, e = 0.3831649, I = 6.93524, N = 208.65735, om = 339.58061, M0 = 359.46170, ep = Date.UTC(1996, 0, 17), Pd = 50.39 * 365.25;
  const M = mod(M0 + 360 * (ms - ep) / 864e5 / Pd, 360); let E = rad(M) + e * Math.sin(rad(M));
  for (let i = 0; i < 30; i++) E -= (E - e * Math.sin(E) - rad(M)) / (1 - e * Math.cos(E));
  const xp = a * (Math.cos(E) - e), yp = a * Math.sqrt(1 - e * e) * Math.sin(E);
  const co = Math.cos(rad(om)), so = Math.sin(rad(om)), cN = Math.cos(rad(N)), sN = Math.sin(rad(N)), cI = Math.cos(rad(I));
  const p = [(co * cN - so * sN * cI) * xp + (-so * cN - co * sN * cI) * yp, (co * sN + so * cN * cI) * xp + (-so * sN + co * cN * cI) * yp];
  const T = dJ(ms) / 36525, ea = helio("Earth", T);
  return mod(Math.atan2(p[1] - ea[1], p[0] - ea[0]) * 180 / Math.PI + PREC * dJ(ms), 360);
}
const SG = ["♈","♉","♊","♋","♌","♍","♎","♏","♐","♑","♒","♓"].map(g => g + "︎");
const RULER = ["mars", "venus", "mercury", "moon", "sun", "mercury", "venus", "mars", "jupiter", "saturn", "saturn", "jupiter"]; /* guvernatoare tradiționale */
const BODIES = [
  {id: "sun", g: "☉", col: "var(--sun)", r: 128, lon: longitudineSoare},
  {id: "moon", g: "☽", col: "var(--moon)", r: 116.5, lon: ms => lunaLonLat(ms)[0]},
  {id: "mercury", g: "☿", col: "#5F7192", r: 105, lon: ms => planLon("Mercury", ms)},
  {id: "venus", g: "♀", col: "#A8497A", r: 93.5, lon: ms => planLon("Venus", ms)},
  {id: "mars", g: "♂", col: "#B03226", r: 82, lon: ms => planLon("Mars", ms)},
  {id: "jupiter", g: "♃", col: "#8A6130", r: 70.5, lon: ms => planLon("Jupiter", ms)},
  {id: "saturn", g: "♄", col: "#5E6470", r: 59, lon: ms => planLon("Saturn", ms)},
  {id: "chiron", g: "⚷", col: "#2F7F6F", r: 47.5, lon: chironLon, minor: true},
  {id: "uranus", g: "♅", col: "#1F8AA3", r: 36, lon: ms => planLon("Uranus", ms)},
  {id: "neptune", g: "♆", col: "#3A5FB0", r: 24.5, lon: ms => planLon("Neptune", ms)},
  {id: "pluto", g: "♇", col: "#6B3E75", r: 13, lon: ms => planLon("Pluto", ms)}
];
BODIES.forEach(b => { b.g += "︎"; });
const ASP = [["conj", 0], ["sext", 60], ["sq", 90], ["tri", 120], ["opp", 180]];
const ASPSTYLE = {conj: "", sext: 'stroke-dasharray="2 4"', sq: 'stroke-dasharray="7 4"', tri: "", opp: 'stroke-dasharray="1 3"'};
const ASPCOL = {conj: "var(--ink)", sext: "var(--moon)", sq: "#B03226", tri: "var(--moon)", opp: "#B03226"};
const delta = (a, b) => mod(a - b + 180, 360) - 180;
const viteza = (f, ms) => delta(f(ms + 12 * 36e5), f(ms - 12 * 36e5)); /* grade pe zi */
const CONS = [["Psc",351.57],["Ari",28.69],["Tau",53.42],["Gem",90.14],["Cnc",117.99],["Leo",138.04],["Vir",173.85],["Lib",217.81],["Sco",241.14],["Oph",247.64],["Sgr",266.62],["Cap",299.70],["Aqr",327.49]];
const consEdge = (i, ms) => CONS[i][1] + PREC * dJ(ms);
function consIdx(lon, ms) { for (let i = 0; i < 13; i++) { const a = consEdge(i, ms), b = consEdge((i + 1) % 13, ms); if (mod(lon - a, 360) < mod(b - a, 360)) return i; } return 0; }
const consName = i => D.cons[(i + 12) % 13];
const pad = n => String(n).padStart(2, "0");
const isoLocal = ms => { const d = new Date(ms); return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}T${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}`; };
const fmtUtc = ms => { const d = new Date(ms); return `${pad(d.getUTCDate())}.${pad(d.getUTCMonth() + 1)}.${d.getUTCFullYear()} ${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())} UTC`; };
const fmtDay = ms => { const d = new Date(ms); return `${pad(d.getUTCDate())}.${pad(d.getUTCMonth() + 1)}.${d.getUTCFullYear()}`; };
const parseLocal = v => { const m = /^(\d{4,})-(\d\d)-(\d\d)T(\d\d):(\d\d)/.exec(v); if (!m) return null; const x = new Date(0); x.setUTCFullYear(+m[1], +m[2] - 1, +m[3]); x.setUTCHours(+m[4], +m[5], 0, 0); return x.getTime(); };
const degTxt = lon => `${Math.floor(mod(lon, 30))}°${pad(Math.floor(mod(lon, 1) * 60))}′`;
/* corp desenat ca disc plin (Soarele galben-portocaliu și Luna albastră, ca în cadranele Soare–Lună) */
function dot(x, y, b, rr, retro) {
  const r = b.id === "sun" ? rr + 1.5 : rr;
  return (retro ? `<circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(r + 3)}" fill="none" stroke="var(--ink)" stroke-width="1.2" stroke-dasharray="2.5 2"/>` : "") +
    `<circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(r)}" fill="${b.col}" stroke="var(--face)" stroke-width="1.4"><title>${D.bodies[b.id]}</title></circle>` +
    `<text x="${f1(x)}" y="${f1(y)}" font-size="${b.id === "sun" ? 14 : 12}" text-anchor="middle" dominant-baseline="central" fill="#fff" pointer-events="none">${b.g}</text>`;
}
const sel = () => BODIES.filter(b => !b.minor || $("pl-chiron").checked);
const TMIN = Date.UTC(-4000, 0, 1), TMAX = Date.UTC(9000, 0, 1);
let T0 = Date.now(), timer = null, last = 0;

const outOfRange = ms => { const y = new Date(ms).getUTCFullYear(); return y < 1800 || y > 2050; };
function tpu(ms) {
  const r = dinUtc(ms, D.defaultFus * 10, "F");
  return `ER ${r.er} · AE ${r.ae} · ${r.lc ? r.lc + "/" + r.zn : D.yearDay + " " + r.zn}`;
}
/* ---------- cadranul 1: zodiacul și planetele ---------- */
function buildZod() {
  const c = 180; let s = `<circle cx="${c}" cy="${c}" r="170" fill="var(--face)" stroke="var(--ink)" stroke-width="1.4"/>`;
  for (let i = 0; i < 12; i++) {
    const a1 = ang(i * 30), a2 = a1 + 30;
    s += `<path d="${arcPath(c, c, 142, 170, a1, a2)}" fill="var(--ink)" opacity="${i % 2 ? .13 : .05}" stroke="var(--rule)" stroke-width=".6"><title>${D.signs[i]}</title></path>`;
    s += txt(c, c, 159, a1 + 15, SG[i], 15, "", 'fill="var(--ink)"');
    s += txt(c, c, 149, a1 + 15, BODIES.find(b => b.id === RULER[i]).g, 8, "", 'fill="var(--mute)"');
    s += tick(c, c, 142, 170, a1, .9, "var(--mute)");
  }
  for (let a = 0; a < 360; a += 10) s += tick(c, c, 138, a % 30 === 0 ? 142 : 140, a, .6, "var(--mute)");
  for (const b of BODIES) s += `<circle id="pl-ring-${b.id}" cx="${c}" cy="${c}" r="${b.r}" fill="none" stroke="var(--rule)" stroke-width=".6" stroke-dasharray="1 3"/>`;
  s += `<path d="M ${c + 170} ${c - 6} L ${c + 182} ${c} L ${c + 170} ${c + 6} Z" fill="var(--sun)"><title>${D.vernal}</title></path>`;
  $("pl-zod").innerHTML = '<g id="pl-cons"></g>' + s + '<g id="pl-zod-dyn"></g>';
}
function renderCons(t) {
  const c = 180, r1 = 176, r2 = 202; let s = `<circle cx="${c}" cy="${c}" r="${r2}" fill="var(--face)" stroke="var(--ink)" stroke-width="1.2"/>`;
  for (let i = 0; i < 13; i++) {
    const a = ang(consEdge(i, t)), b = ang(consEdge((i + 1) % 13, t)), span = mod(b - a, 360);
    s += `<path d="${arcPath(c, c, r1, r2, a, a + span)}" fill="var(--ink)" opacity="${i === 9 ? .3 : i % 2 ? .16 : .07}" stroke="var(--rule)" stroke-width=".6"><title>${consName(i)}</title></path>`;
    s += txt(c, c, (r1 + r2) / 2, a + span / 2, CONS[i][0], 9, "", 'font-weight="600" fill="var(--ink)"');
  }
  $("pl-cons").innerHTML = s;
  /* punctul vernal (0° tropical) și constelația în care se află */
  const vi = consIdx(0, t), d = mod(0 - consEdge(vi, t), 360), yrs = d / (50.29 / 3600), y0 = new Date(t).getUTCFullYear() + yrs;
  return `<div class="small"><b>${D.vernal}</b>: ${consName(vi)} · ${D.vernalOut.replace("{c}", consName((vi + 12) % 13)).replace("{y}", String(Math.round(y0)))}</div>`;
}
function renderZod(t) {
  const c = 180; let s = "", rows = "";
  const vern = renderCons(t);
  const bs = sel();
  for (const b of BODIES) $("pl-ring-" + b.id).style.display = bs.includes(b) ? "" : "none";
  for (const b of bs) {
    const lon = b.lon(t), a = ang(lon), v = viteza(b.lon, t), retro = v < 0 && b.id !== "sun" && b.id !== "moon";
    const [x, y] = P(c, c, b.r, a);
    s += dot(x, y, b, 8, retro);
    const si = Math.floor(lon / 30), home = RULER[si] === b.id || (b.id === "mercury" && si === 5) || (b.id === "venus" && si === 6);
    rows += `<tr><td><span style="color:${b.col}">${b.g}</span> ${D.bodies[b.id]}</td><td>${SG[si]} ${D.signs[si]} ${degTxt(lon)}</td><td>${consName(consIdx(lon, t))}</td><td>${retro ? D.retro : D.direct} (${num(Math.abs(v) < .005 ? 0 : v, 2)}°/${D.day})${home ? " · " + D.home : ""}</td></tr>`;
  }
  $("pl-zod-dyn").innerHTML = s;
  $("pl-z").innerHTML = vern + `<table class="grid pl-tab"><thead><tr>${D.th1.map(h => `<th>${h}</th>`).join("")}</tr></thead><tbody>${rows}</tbody></table>`;
}
/* ---------- cadranul 2: traseul unei planete ---------- */
function ingresses(b, t0, t1) {
  const out = []; const step = Math.max(.25, (t1 - t0) / 864e5 / 1500) * 864e5;
  let prev = Math.floor(b.lon(t0) / 30);
  for (let t = t0 + step; t <= t1; t += step) { const k = Math.floor(b.lon(t) / 30); if (k !== prev) { const fwd = mod(k - prev + 6, 12) - 6 > 0; out.push([t, k, fwd]); prev = k; } }
  return out;
}
function renderTrace(t) {
  const b = BODIES.find(x => x.id === $("pl-planet").value), win = parseFloat($("pl-win").value) * 365.25 * 864e5, t0 = t - win / 2, t1 = t + win / 2;
  const axSel = $("pl-ax").value, nmOn = $("pl-nm").checked;
  const w = 800, h = 500, x0 = nmOn ? 112 : 58, x1 = w - 14, yT = 34, yB = h - 26, N = 300; const pts = []; let u = b.lon(t0), prev = u;
  for (let i = 0; i <= N; i++) { const tt = t0 + win * i / N, l = b.lon(tt); u += delta(l, prev); prev = l; pts.push([tt, u]); }
  let mn = Math.min(...pts.map(p => p[1])), mx = Math.max(...pts.map(p => p[1]));
  mn = Math.floor(mn / 30) * 30; mx = Math.max(mn + 30, Math.ceil(mx / 30) * 30);
  const X = tt => x0 + (tt - t0) / win * (x1 - x0), Y = l => yB - (l - mn) / (mx - mn) * (yB - yT);
  let s = "";
  const pxDeg = (yB - yT) / (mx - mn), labs = [];
  const hl = (l, w2) => `<line x1="${x0}" x2="${x1}" y1="${f1(Y(l))}" y2="${f1(Y(l))}" stroke="var(--rule)" stroke-width="${w2}"/>`;
  if (axSel === "cn") {
    s += hl(mn, .7) + hl(mx, .7);
    for (let n = Math.floor(mn / 360) - 1; n <= Math.ceil(mx / 360) + 1; n++) for (let i = 0; i < 13; i++) {
      const a = consEdge(i, t) + 360 * n; let b2 = consEdge((i + 1) % 13, t) + 360 * n; if (b2 <= a) b2 += 360;
      if (b2 < mn || a > mx) continue;
      if (a > mn && a < mx) s += hl(a, i === 0 ? 1.4 : .9);
      labs.push({lo: Math.max(a, mn), hi: Math.min(b2, mx), g: "", n: consName(i), ab: CONS[i][0], big: false});
    }
  } else {
    for (let l = mn; l <= mx; l += 30) { s += hl(l, l % 360 === 0 ? 1.4 : .7);
      if (l < mx) labs.push({lo: l, hi: l + 30, g: SG[mod(l / 30, 12)], n: D.signs[mod(l / 30, 12)], ab: "", big: true}); }
  }
  { let lastY = 1e9;
    for (const L of labs.sort((p, q) => (q.lo + q.hi) - (p.lo + p.hi))) {
      const band = (L.hi - L.lo) * pxDeg, yc = Y((L.lo + L.hi) / 2);
      const fs = L.big ? Math.max(10, Math.min(24, band * .72)) : (nmOn ? 14 : 12);
      if (band < 9 || (lastY !== 1e9 && Math.abs(lastY - yc) < fs * 1.1)) continue;
      lastY = yc;
      const nm = L.big ? (nmOn ? L.n.split(" (")[0] : "") : (nmOn ? L.n.split(" (")[0] : L.ab);
      const nfs = Math.max(9, Math.min(13, fs * .6));
      s += `<text x="${x0 - 6}" y="${f1(yc)}" text-anchor="end" dominant-baseline="central" fill="var(--ink)">` +
        (nm ? `<tspan font-size="${f1(L.big ? nfs : fs)}"${L.big ? "" : ' font-weight="600"'}>${nm}</tspan>` : "") +
        (L.g ? `<tspan font-size="${f1(fs)}" dx="${nm ? 5 : 0}">${L.g}</tspan>` : "") + `</text>`;
    } }
  /* diviziuni: ani (linii verticale puternice) și luni, în sistemul ales (SI: 12 luni, TPU: 13 luni de 28 de zile) */
  const monSel = $("pl-mon").value, winY = win / (365.25 * 864e5), showM = winY <= 4 && monSel !== "no" && !["jupiter", "saturn", "chiron", "uranus", "neptune", "pluto"].includes(b.id), DAYMS = 864e5;
  const mf = new Intl.DateTimeFormat(document.documentElement.lang || "ro", {month: "short", timeZone: "UTC"});
  const inW = tt => tt >= t0 && tt <= t1;
  const pxYr = (x1 - x0) / winY, stepL = pxYr >= 12 ? 1 : [2, 5, 10, 25, 50, 100].find(n => pxYr * n >= 12) || 100;
  const yLine = tt => `<line x1="${f1(X(tt))}" x2="${f1(X(tt))}" y1="${yT}" y2="${yB}" stroke="var(--ink)" stroke-width="1.6" opacity=".6"/>`;
  const mLine = tt => `<line x1="${f1(X(tt))}" x2="${f1(X(tt))}" y1="${yT}" y2="${yB}" stroke="var(--mute)" stroke-width=".7" stroke-dasharray="2 3" opacity=".75"/>`;
  const mLab = (ta, tb, txt) => { const a = Math.max(ta, t0), b2 = Math.min(tb, t1), wpx = X(b2) - X(a); return wpx >= 13 ? `<text x="${f1((X(a) + X(b2)) / 2)}" y="${yB - 6}" font-size="9.5" text-anchor="middle" fill="var(--mute)">${txt}</text>` : ""; };
  let gr = "";
  if (monSel === "tpu") {
    const k0 = anPentruZi(Math.floor(t0 / DAYMS)), k1 = anPentruZi(Math.floor(t1 / DAYMS)) + 1;
    for (let k = k0; k <= k1; k++) { const ys = inceputAn(k) * DAYMS; if (inW(ys) && mod(k, stepL) === 0) gr += yLine(ys);
      if (showM) for (let m = 1; m <= 13; m++) { const ta = ys + 28 * (m - 1) * DAYMS, tb = ta + 28 * DAYMS; if (m > 1 && inW(ta)) gr += mLine(ta); if (tb >= t0 && ta <= t1) gr += mLab(ta, tb, m); } }
  } else {
    const y0 = new Date(t0).getUTCFullYear(), y1 = new Date(t1).getUTCFullYear() + 1;
    for (let y = y0; y <= y1; y++) { const ys = UTCY(y, 0, 1); if (inW(ys) && mod(y, stepL) === 0) gr += yLine(ys);
      if (showM) for (let m = 0; m < 12; m++) { const ta = UTCY(y, m, 1), tb = UTCY(y, m + 1, 1); if (m > 0 && inW(ta)) gr += mLine(ta); if (tb >= t0 && ta <= t1) gr += mLab(ta, tb, mf.format(new Date(ta))); } }
  }
  s += gr;
  let p = ""; pts.forEach(([tt, l], i) => p += (i ? "L" : "M") + f1(X(tt)) + " " + f1(Y(l)));
  s += `<path d="${p}" fill="none" stroke="${b.col}" stroke-width="2"/>`;
  const sy = new Date(t0).getUTCFullYear(), ey = new Date(t1).getUTCFullYear(), stepY = Math.max(1, Math.ceil((ey - sy) / 6));
  for (let y = Math.ceil(sy / stepY) * stepY; y <= ey; y += stepY) { const tt = UTCY(y, 0, 1); if (tt < t0 || tt > t1) continue;
    s += `<line x1="${f1(X(tt))}" x2="${f1(X(tt))}" y1="${yB}" y2="${yB + 4}" stroke="var(--mute)"/><text x="${f1(X(tt))}" y="${h - 8}" font-size="10" text-anchor="middle" fill="var(--mute)">${y}</text>`; }
  { const kA = anPentruZi(Math.floor(t0 / DAYMS)), kB = anPentruZi(Math.floor(t1 / DAYMS)) + 1; let first = true;
    for (let k = kA; k <= kB; k++) { const tt = inceputAn(k) * DAYMS; if (!inW(tt)) continue; if (!first && (k - kA) % stepY !== 0 && stepY > 1) continue; first = false;
      let te = ""; try { const [er, ae] = eraAeDinK(k); te = `${er}·${ae}`; } catch (e) {}
      s += `<line x1="${f1(X(tt))}" x2="${f1(X(tt))}" y1="${yT - 4}" y2="${yT}" stroke="var(--mute)"/><text x="${f1(X(tt))}" y="${yT - 10}" font-size="10" text-anchor="middle" fill="var(--mute)">${te}</text>`; } }
  s += `<text x="2" y="${h - 8}" font-size="9" fill="var(--ink)" font-weight="600">${D.suSI}</text><text x="2" y="${yT - 10}" font-size="9" fill="var(--ink)" font-weight="600">${D.suTPU}</text>`;
  const xc = X(t), yc = Y(pts[Math.round(N / 2)][1]);
  s += `<line x1="${f1(xc)}" x2="${f1(xc)}" y1="${yT}" y2="${yB}" stroke="var(--ink)" stroke-width="1" stroke-dasharray="3 3"/><circle cx="${f1(xc)}" cy="${f1(yc)}" r="5" fill="var(--ink)" stroke="var(--face)" stroke-width="1.5"/>`;
  $("pl-trace").innerHTML = s;
  const ing = ingresses(b, t0, t1);
  $("pl-t").innerHTML = `<div class="big"><span style="color:${b.col}">${b.g}</span> ${D.bodies[b.id]}</div><div class="small">${D.ingH}: ` + (ing.length ? ing.slice(0, 24).map(([tt, k, fwd]) => `${fmtDay(tt)} ${fwd ? "→" : "←"} ${SG[k]} ${D.signs[k]}`).join(" · ") : D.noIng) + `</div>` + (b.minor ? `<div class="small">${D.chironNote}</div>` : "");
  $("pl-trace").setAttribute("aria-label", D.bodies[b.id]);
}
/* ---------- cadranul 3: unghiurile dintre corpuri ---------- */
function buildAsp() { $("pl-asp").innerHTML = ""; }
function renderAsp(t) {
  const c = 180, R = 135, orb = parseFloat($("pl-orb").value), bs = sel();
  let s = `<circle cx="${c}" cy="${c}" r="${R + 16}" fill="var(--face)" stroke="var(--ink)" stroke-width="1.2"/><circle cx="${c}" cy="${c}" r="${R}" fill="none" stroke="var(--rule)"/>`;
  for (let i = 0; i < 12; i++) { s += tick(c, c, R, R + 16, ang(i * 30), .7, "var(--mute)") + txt(c, c, R + 8, ang(i * 30 + 15), SG[i], 11, "", 'fill="var(--ink)"'); }
  const L = bs.map(b => ({b, lon: b.lon(t)})), found = [];
  for (let i = 0; i < L.length; i++) for (let j = i + 1; j < L.length; j++) {
    const sep = Math.abs(delta(L[i].lon, L[j].lon));
    for (const [k, ex] of ASP) { const dev = Math.abs(sep - ex); if (dev <= orb) { found.push([L[i], L[j], k, sep, dev]); const [x1, y1] = P(c, c, R - 6, ang(L[i].lon)), [x2, y2] = P(c, c, R - 6, ang(L[j].lon)); s += `<line x1="${f1(x1)}" y1="${f1(y1)}" x2="${f1(x2)}" y2="${f1(y2)}" stroke="${ASPCOL[k]}" stroke-width="${k === "conj" ? 3 : 1.6}" ${ASPSTYLE[k]} opacity=".8"/>`; } }
  }
  for (const {b, lon} of L) { const [x, y] = P(c, c, R - 6, ang(lon)); s += dot(x, y, b, 9, false); }
  $("pl-asp").innerHTML = s;
  found.sort((a, b) => a[4] - b[4]);
  $("pl-a").innerHTML = found.length ? `<table class="grid pl-tab"><thead><tr>${D.th3.map(h => `<th>${h}</th>`).join("")}</tr></thead><tbody>${found.map(([a, b, k, sep, dev]) => `<tr><td>${a.b.g} ${D.bodies[a.b.id]} – ${b.b.g} ${D.bodies[b.b.id]}</td><td>${D.asp[k]} (${ASP.find(x => x[0] === k)[1]}°)</td><td>${num(sep, 1)}°</td><td>${num(dev, 1)}°</td></tr>`).join("")}</tbody></table>` : `<div class="small">${D.noAsp}</div>`;
}

/* ---------- cadranul 4: traseul circular (spirală: centrul = începutul ferestrei, marginea = sfârșitul) ---------- */
function renderCirc(t) {
  const b = BODIES.find(x => x.id === $("pl-planet").value), win = parseFloat($("pl-win").value) * 365.25 * 864e5, t0 = t - win / 2, t1 = t + win / 2;
  const mode = $("pl-ref").value, axSel = $("pl-ax").value, nmOn = $("pl-nm").checked, c = 200, rIn = 30, rOut = 146, R1 = 156, R2 = 190;
  const sun = BODIES.find(x => x.id === "sun");
  let s = `<circle cx="${c}" cy="${c}" r="${R2}" fill="var(--face)" stroke="var(--ink)" stroke-width="1.3"/>`;
  if (mode === "sun") {
    /* inel gradat în elongație; Soarele fix sus */
    s += `<circle cx="${c}" cy="${c}" r="${R1}" fill="none" stroke="var(--ink)" stroke-width="1"/>`;
    for (let a = 0; a < 360; a += 10) s += tick(c, c, a % 30 === 0 ? R1 : R1 + 4, R2, a, a % 90 === 0 ? 1.4 : .6, a % 90 === 0 ? "var(--ink)" : "var(--mute)");
    for (let a = 0; a < 360; a += 30) if (a % 90) s += txt(c, c, (R1 + R2) / 2 + 2, a, a + "°", 9, "", 'fill="var(--mute)"');
    [0, 90, 180, 270].forEach((a, i) => { s += txt(c, c, (R1 + R2) / 2 + 2, a, D.elo[i], 10, "", 'font-weight="600" fill="var(--ink)"'); s += tick(c, c, 0, R1, a, .6, "var(--rule)"); });
    const [sx, sy] = P(c, c, R1 - 8, 0); s += dot(sx, sy, sun, 9, false);
  } else if (axSel === "cn") {
    for (let i = 0; i < 13; i++) {
      const a = ang(consEdge(i, t)), e = ang(consEdge((i + 1) % 13, t)), span = mod(e - a, 360);
      s += `<path d="${arcPath(c, c, R1, R2, a, a + span)}" fill="var(--ink)" opacity="${i === 9 ? .3 : i % 2 ? .16 : .07}" stroke="var(--rule)" stroke-width=".6"><title>${consName(i)}</title></path>`;
      s += txt(c, c, (R1 + R2) / 2, a + span / 2, nmOn && span > 14 ? consName(i).split(" (")[0].slice(0, 9) : CONS[i][0], nmOn && span > 14 ? 8 : 10, "", 'font-weight="600" fill="var(--ink)"');
    }
  } else {
    for (let i = 0; i < 12; i++) {
      const a1 = ang(i * 30);
      s += `<path d="${arcPath(c, c, R1, R2, a1, a1 + 30)}" fill="var(--ink)" opacity="${i % 2 ? .13 : .05}" stroke="var(--rule)" stroke-width=".6"><title>${D.signs[i]}</title></path>`;
      s += txt(c, c, (R1 + R2) / 2 + (nmOn ? 5 : 0), a1 + 15, SG[i], nmOn ? 15 : 18, "", 'fill="var(--ink)"');
      if (nmOn) s += txt(c, c, (R1 + R2) / 2 - 10, a1 + 15, D.signs[i].split(" (")[0].slice(0, 8), 7.5, "", 'fill="var(--mute)"');
      s += tick(c, c, R1, R2, a1, .9, "var(--mute)");
    }
  }
  /* cercuri-reper */
  s += `<circle cx="${c}" cy="${c}" r="${rOut}" fill="none" stroke="var(--rule)" stroke-width=".6" stroke-dasharray="1 3"/><circle cx="${c}" cy="${c}" r="${rIn}" fill="none" stroke="var(--rule)" stroke-width=".6" stroke-dasharray="1 3"/>`;
  const self = mode === "sun" && b.id === "sun";
  let readout = "";
  if (!self) {
    const turnsEst = win / 864e5 / Math.max(20, b.id === "moon" ? 27.3 : 40), N = Math.min(4000, Math.max(300, Math.round(turnsEst * 16)));
    const ex = tt => mode === "sun" ? mod(b.lon(tt) - sun.lon(tt), 360) : b.lon(tt);
    let u = ex(t0), prev = u, p = "", uStart = u;
    for (let i = 0; i <= N; i++) {
      const tt = t0 + win * i / N, e = ex(tt); u += delta(e, prev); prev = e;
      const r = rIn + (rOut - rIn) * i / N, [x, y] = P(c, c, r, mode === "sun" ? e : ang(e));
      p += (i ? "L" : "M") + f1(x) + " " + f1(y);
    }
    const turns = Math.abs(u - uStart) / 360;
    s += `<path d="${p}" fill="none" stroke="${b.col}" stroke-width="${N > 1500 ? 1 : 1.8}" stroke-linejoin="round" opacity="${N > 1500 ? .7 : 1}"/>`;
    const [x0_, y0_] = P(c, c, rIn, mode === "sun" ? ex(t0) : ang(ex(t0))), [x1_, y1_] = P(c, c, rOut, mode === "sun" ? ex(t1) : ang(ex(t1)));
    s += `<circle cx="${f1(x0_)}" cy="${f1(y0_)}" r="3.5" fill="var(--face)" stroke="${b.col}" stroke-width="1.6"/><circle cx="${f1(x1_)}" cy="${f1(y1_)}" r="3.5" fill="${b.col}" stroke="var(--face)" stroke-width="1"/>`;
    /* momentul ales, la jumătatea ferestrei */
    const em = ex(t), rm = (rIn + rOut) / 2, [xm, ym] = P(c, c, rm, mode === "sun" ? em : ang(em));
    s += `<circle cx="${f1(xm)}" cy="${f1(ym)}" r="6" fill="var(--ink)" stroke="var(--face)" stroke-width="1.6"/>`;
    s += `<line x1="${c}" y1="${c}" x2="${f1(P(c, c, R1, mode === "sun" ? em : ang(em))[0])}" y2="${f1(P(c, c, R1, mode === "sun" ? em : ang(em))[1])}" stroke="var(--ink)" stroke-width=".8" stroke-dasharray="3 3"/>`;
    if (mode !== "sun" && b.id !== "sun") { const [sx, sy] = P(c, c, R1 - 8, ang(sun.lon(t))); s += dot(sx, sy, sun, 9, false); }
    readout = D.d4Read.replace("{a}", fmtDay(t0)).replace("{b}", fmtDay(t1)).replace("{n}", num(turns, turns < 10 ? 1 : 0)) + "<br>" +
      (mode === "sun" ? D.d4Sun.replace("{e}", num(em, 0)) : D.d4Ecl.replace("{l}", `${SG[Math.floor(mod(em, 360) / 30)]} ${degTxt(em)} · ${consName(consIdx(em, t))}`));
  } else {
    s += `<text x="${c}" y="${c}" text-anchor="middle" font-size="12" fill="var(--mute)">☉</text>`;
    readout = D.d4Self;
  }
  $("pl-circ").innerHTML = s;
  $("pl-c").innerHTML = `<div class="big"><span style="color:${b.col}">${b.g}</span> ${D.bodies[b.id]}</div><div class="small">${readout}</div>`;
}
/* ---------- comenzi ---------- */
function render() {
  const yy = new Date(T0).getUTCFullYear(); $("pl-when").value = yy >= 1000 && yy <= 9999 ? isoLocal(T0) : "";
  $("pl-clock").innerHTML = `<span><b>UTC</b> ${fmtUtc(T0)}</span><span><b>${D.tpuName}</b>: <code>${tpu(T0)}</code></span>` + (outOfRange(T0) ? `<span class="note">${D.outRange}</span>` : "");
  renderZod(T0); renderTrace(T0); renderCirc(T0); renderAsp(T0);
}
function setT(ms) { T0 = Math.max(TMIN, Math.min(TMAX, ms)); render(); }
function stop() { if (timer) { cancelAnimationFrame(timer); timer = null; } $("pl-play").setAttribute("aria-pressed", "false"); $("pl-play").textContent = "▶ " + D.play; }
function frame(ts) { if (!timer) return; const dt = Math.min(0.1, (ts - last) / 1000); last = ts; T0 = Math.max(TMIN, Math.min(TMAX, T0 + dt * parseFloat($("pl-speed").value) * 864e5)); render(); timer = requestAnimationFrame(frame); }
function play() { if (timer) { stop(); return; } $("pl-play").setAttribute("aria-pressed", "true"); $("pl-play").textContent = "■ " + D.pause; last = performance.now(); timer = requestAnimationFrame(frame); }
function nextRetro(dir) { /* următoarea schimbare de sens a planetei alese (stație) */
  const b = BODIES.find(x => x.id === $("pl-planet").value), step = 864e5; let t = T0, v0 = viteza(b.lon, t);
  for (let i = 0; i < 12000; i++) { t += dir * step; const v = viteza(b.lon, t); if ((v0 >= 0) !== (v >= 0)) { let a = t - dir * step, z = t; for (let k = 0; k < 30; k++) { const m = (a + z) / 2; if ((viteza(b.lon, m) >= 0) === (v0 >= 0)) a = m; else z = m; } return z; } v0 = v; }
  return T0;
}
{
  buildZod(); buildAsp();
  $("pl-planet").innerHTML = BODIES.filter(b => b.id !== "sun" && b.id !== "moon" || true).map(b => `<option value="${b.id}">${b.g} ${D.bodies[b.id]}</option>`).join(""); $("pl-planet").value = "mars";
  const fillSpeeds = () => {
    const prev = parseFloat($("pl-speed").value) || 10, L = $("pl-su").value === "tpu" ? D.speedsTpu : D.speeds;
    let best = L[0][0]; for (const [v] of L) if (Math.abs(Math.log(v / prev)) < Math.abs(Math.log(best / prev))) best = v;
    $("pl-speed").innerHTML = L.map(([v, l]) => `<option value="${v}"${v === best ? " selected" : ""}>${l}</option>`).join("");
  };
  fillSpeeds(); $("pl-su").addEventListener("change", fillSpeeds);
  $("pl-win").innerHTML = D.wins.map(([v, l]) => `<option value="${v}"${v === 2 ? " selected" : ""}>${l}</option>`).join("");
  $("pl-orb").innerHTML = D.orbs.map(([v, l]) => `<option value="${v}"${v === 6 ? " selected" : ""}>${l}</option>`).join("");
  $("pl-when").addEventListener("change", e => { const v = parseLocal(e.target.value); if (v !== null) { stop(); setT(v); } });
  $("pl-play").onclick = play; $("pl-now").onclick = () => { stop(); setT(Date.now()); };
  document.querySelectorAll("[data-step]").forEach(b => b.onclick = () => { stop(); setT(T0 + parseFloat(b.dataset.step) * 864e5); });
  $("pl-chiron").checked = true;
  for (const id of ["pl-chiron", "pl-planet", "pl-win", "pl-orb", "pl-mon", "pl-ax", "pl-nm", "pl-ref"]) $(id).addEventListener("change", render);
  $("pl-nextretro").onclick = () => { stop(); setT(nextRetro(1)); };
  $("pl-prevretro").onclick = () => { stop(); setT(nextRetro(-1)); };
  $("pl-jump").innerHTML = D.jumps.map(([lab, iso, pl]) => `<button type="button" data-iso="${iso}" data-pl="${pl}">${lab}</button>`).join("");
  $("pl-jump").querySelectorAll("button").forEach(b => b.onclick = () => { stop(); const [y, m, d] = b.dataset.iso.split("-").map(Number), x = new Date(0); x.setUTCFullYear(y, m - 1, d); x.setUTCHours(12, 0, 0, 0); if (b.dataset.pl) { if (b.dataset.pl === "chiron") $("pl-chiron").checked = true; $("pl-planet").value = b.dataset.pl; } setT(x.getTime()); });
  render();
}

})();
