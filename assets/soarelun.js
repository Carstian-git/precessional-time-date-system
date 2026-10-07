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

/* Cadranele Soare–Lună (pagina Soare și Lună). Texte din #sl-data. Calcule: Meeus, aceleași ca în nucleul sistemului. */
const D = JSON.parse(document.getElementById("sl-data").textContent);
const num = (x, d) => x.toFixed(d).replace(".", D.dec);
const R_ECHIV = 6378.14, LIM_NEW = 1.58, GAMA_UMB = 1.0128, LIM_SEZON = 17;
const DIST_TERMS = [[0,0,1,0,-20905355],[2,0,-1,0,-3699111],[2,0,0,0,-2955968],[0,0,2,0,-569925],[0,1,0,0,48888],
 [2,0,-2,0,246158],[2,-1,-1,0,-152138],[2,0,1,0,-170733],[2,-1,0,0,-204586],[0,1,-1,0,-129620],[1,0,0,0,108743],
 [0,1,1,0,104755],[4,0,-1,0,-34782],[0,0,3,0,-22241],[4,0,-2,0,-30824]];
function distLuna(ms) {
  const T = Tcen(ms);
  const Dd = 297.8501921 + 445267.1114034 * T, M = 357.5291092 + 35999.0502909 * T, Mp = 134.9633964 + 477198.8675055 * T, F = 93.2720950 + 483202.0175233 * T;
  const E = 1 - 0.002516 * T; let s = 0;
  for (const [d, m, mp, f, c] of DIST_TERMS) s += c * E ** Math.abs(m) * Math.cos(rad(d * Dd + m * M + mp * Mp + f * F));
  return 385000.56 + s / 1000;
}
const nodMediu = ms => { const T = Tcen(ms); return mod(125.04452 - 1934.136261 * T + 0.0020708 * T * T, 360); };
const delta = (a, b) => mod(a - b + 180, 360) - 180;
const viteza = (f, ms) => delta(f(ms + 6 * 36e5), f(ms - 6 * 36e5)) * 2; /* grade pe zi, din diferența pe 12 h */
const lonSoare = longitudineSoare, lonLuna = ms => lunaLonLat(ms)[0], latLuna = ms => lunaLonLat(ms)[1];
const ang = lon => mod(lon - 270, 360); /* unghi solar: 0° la solstițiul din decembrie */
const GRADE_ORA = 10; /* o oră nouă = 10° */

let T0 = Date.now(), timer = null, last = 0;
const pad = n => String(n).padStart(2, "0");
const isoLocal = ms => { const d = new Date(ms); return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}T${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}`; };
const fmtUtc = ms => { const d = new Date(ms); return `${pad(d.getUTCDate())}.${pad(d.getUTCMonth() + 1)}.${d.getUTCFullYear()} ${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())} UTC`; };
const fmtDay = ms => { const d = new Date(ms); return `${pad(d.getUTCDate())}.${pad(d.getUTCMonth() + 1)}.${d.getUTCFullYear()}`; };
const parseLocal = v => { const m = /^(\d{4,})-(\d\d)-(\d\d)T(\d\d):(\d\d)/.exec(v); if (!m) return null; const x = new Date(0); x.setUTCFullYear(+m[1], +m[2] - 1, +m[3]); x.setUTCHours(+m[4], +m[5], 0, 0); return x.getTime(); };
const arcLine = (cx, cy, r, a1, a2) => { const [x1, y1] = P(cx, cy, r, a1), [x2, y2] = P(cx, cy, r, a2); const lg = mod(a2 - a1, 360) > 180 ? 1 : 0; return `M${f1(x1)} ${f1(y1)}A${r} ${r} 0 ${lg} 1 ${f1(x2)} ${f1(y2)}`; };

function faseIcon(u, cx, cy, r) {
  const c = Math.cos(rad(u)), rx = Math.abs(c) * r, waxing = mod(u, 360) < 180;
  let lit;
  if (waxing) lit = `M${cx} ${cy - r}A${r} ${r} 0 0 1 ${cx} ${cy + r}A${f1(rx)} ${r} 0 0 ${c > 0 ? 0 : 1} ${cx} ${cy - r}Z`;
  else lit = `M${cx} ${cy - r}A${r} ${r} 0 0 0 ${cx} ${cy + r}A${f1(rx)} ${r} 0 0 ${c > 0 ? 1 : 0} ${cx} ${cy - r}Z`;
  return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="var(--bg)" stroke="var(--ink)" stroke-width="1"/><path d="${lit}" fill="var(--moon)" stroke="none" opacity=".85"/>`;
}

/* ---------- cadranul 1: cursa ---------- */
function ringBase(c, rOut, rIn) {
  let s = `<circle cx="${c}" cy="${c}" r="${rOut}" fill="var(--face)" stroke="var(--ink)" stroke-width="1.4"/><circle cx="${c}" cy="${c}" r="${rIn}" fill="none" stroke="var(--rule)"/>`;
  for (let a = 0; a < 360; a += 10) s += tick(c, c, rIn, rIn + (a % 30 === 0 ? 9 : 5), a, a % 90 === 0 ? 1.6 : .8, "var(--mute)");
  const lab = D.cardinals;
  for (let i = 0; i < 4; i++) {
    s += txt(c, c, rOut - 11, i * 90, `${i * 90}°`, 10, "", 'font-weight="600"');
  }
  return s;
}
function buildDials() {
  const c = 180;
  $("sl-race").innerHTML = ringBase(c, 168, 140) + '<g id="sl-race-dyn"></g>';
  $("sl-nodes").innerHTML = ringBase(c, 168, 140) + '<g id="sl-nodes-dyn"></g>';
}
function renderRace(t) {
  const c = 180, sa = ang(lonSoare(t)), ma = ang(lonLuna(t)); let u = mod(ma - sa, 360); if (u > 359.995) u = 0;
  let s = "";
  s += `<path d="${arcLine(c, c, 100, sa, sa + u)}" fill="none" stroke="var(--moon)" stroke-width="3" stroke-linecap="round" opacity=".55"/>`;
  s += tick(c, c, 0, 118, ma, 1.2, "var(--moon)") + tick(c, c, 0, 130, sa, 1.6, "var(--sun)");
  const [sx, sy] = P(c, c, 130, sa), [mx, my] = P(c, c, 118, ma);
  s += `<circle cx="${f1(mx)}" cy="${f1(my)}" r="8" fill="var(--moon)" stroke="var(--face)" stroke-width="2"/>`;
  s += `<circle cx="${f1(sx)}" cy="${f1(sy)}" r="11" fill="var(--sun)" stroke="var(--face)" stroke-width="2"/>`;
  const [lx, ly] = P(c, c, 85, sa + u / 2);
  s += `<text x="${f1(lx)}" y="${f1(ly)}" font-size="11" text-anchor="middle" dominant-baseline="central" fill="var(--moon)" font-weight="600">${num(u, 1)}°</text>`;
  s += faseIcon(u, c, c, 22);
  $("sl-race-dyn").innerHTML = s;
  const vs = viteza(lonSoare, t), vm = viteza(lonLuna, t), rel = vm - vs;
  const k = $("sl-r");
  k.innerHTML =
    `<div class="big">${fmtUtc(t)}</div>` +
    `<div class="small">${D.sunAng}: ${num(sa, 2)}° · ${D.moonAng}: ${num(u, 2)}° · ${D.phase}: ${phaseTxt(u)}</div>` +
    `<div class="small">${D.vSun}: ${num(vs, 3)}°/${D.day} · ${D.vMoon}: ${num(vm, 2)}°/${D.day} · ${D.ratio}: ${num(vm / vs, 1)}</div>` +
    `<div class="small">${D.vMoonH}: ${num(vm / 24, 2)}°/h ≈ ${num(vm / 24 / 0.52, 2)} ${D.diam}</div>` +
    `<div class="small">${D.lag}: ${num(rel, 2)}°/${D.day} = ${num(rel / GRADE_ORA, 2)} ${D.newH} = ${num(rel / GRADE_ORA * 40, 1)} min</div>`;
  $("sl-race").setAttribute("aria-label", `${D.sunAng} ${num(sa, 1)}°, ${D.moonAng} ${num(u, 1)}°`);
}
function phaseTxt(u) { return D.phases[Math.floor(mod(u + 22.5, 360) / 45)]; }

/* ---------- cadranul 2: nodurile ---------- */
function renderNodes(t) {
  const c = 180, sl = lonSoare(t), ml = lonLuna(t), om = nodMediu(t), sa = ang(sl), ma = ang(ml), na = ang(om), nd = mod(na + 180, 360);
  let s = "";
  for (const n of [na, nd]) s += `<path d="${arcPath(c, c, 108, 138, n - LIM_SEZON, n + LIM_SEZON)}" fill="var(--sun)" opacity=".22" stroke="none"/>`;
  s += tick(c, c, 0, 138, na, 1.4, "var(--ink)") + tick(c, c, 0, 138, nd, 1.4, "var(--ink)");
  s += txt(c, c, 124, na, "☊", 15, "", 'fill="var(--ink)"') + txt(c, c, 124, nd, "☋", 15, "", 'fill="var(--ink)"');
  const [sx, sy] = P(c, c, 150, sa), [mx, my] = P(c, c, 100, ma);
  s += tick(c, c, 0, 100, ma, 1.2, "var(--moon)") + tick(c, c, 0, 150, sa, 1.6, "var(--sun)");
  s += `<circle cx="${f1(mx)}" cy="${f1(my)}" r="7" fill="var(--moon)" stroke="var(--face)" stroke-width="2"/><circle cx="${f1(sx)}" cy="${f1(sy)}" r="10" fill="var(--sun)" stroke="var(--face)" stroke-width="2"/>`;
  s += `<circle cx="${c}" cy="${c}" r="3" fill="var(--mute)"/>`;
  $("sl-nodes-dyn").innerHTML = s;
  /* vedere laterală */
  const w = 340, h = 150, x0 = 10, ys = 11, x = d => x0 + (mod(d + 180, 360)) / 360 * (w - 2 * x0), y = b => h / 2 - b * ys;
  let g = `<rect x="${x0}" y="${y(LIM_NEW)}" width="${w - 2 * x0}" height="${f1(2 * LIM_NEW * ys)}" fill="var(--sun)" opacity=".18"/>`;
  g += `<line x1="${x0}" x2="${w - x0}" y1="${h / 2}" y2="${h / 2}" stroke="var(--ink)" stroke-width="1.2"/>`;
  let p = ""; for (let d = -180; d <= 180; d += 4) p += (d === -180 ? "M" : "L") + f1(x(d)) + " " + f1(y(5.145 * Math.sin(rad(d))));
  g += `<path d="${p}" fill="none" stroke="var(--moon)" stroke-width="1.6" opacity=".7"/>`;
  g += `<text x="${x0}" y="${y(5.145) - 3}" font-size="10" class="mute">+5,1°</text><text x="${x0}" y="${y(-5.145) + 11}" font-size="10" class="mute">−5,1°</text>`;
  g += `<text x="${x(0)}" y="${h - 2}" font-size="11" text-anchor="middle">☊</text><text x="${x(180)}" y="${h - 2}" font-size="11" text-anchor="middle">☋</text>`;
  const lat = latLuna(t), dm = delta(ml, om), ds = delta(sl, om);
  g += `<circle cx="${f1(x(ds))}" cy="${h / 2}" r="5" fill="var(--sun)" stroke="var(--face)"/><circle cx="${f1(x(dm))}" cy="${f1(y(lat))}" r="4" fill="var(--moon)" stroke="var(--face)"/>`;
  $("sl-side").innerHTML = g;
  const dNod = Math.min(Math.abs(mod(sl - om, 180)), 180 - Math.abs(mod(sl - om, 180)));
  const seas = dNod < LIM_SEZON;
  $("sl-n").innerHTML =
    `<div class="big">${D.season}: ${seas ? D.yes : D.no}</div>` +
    `<div class="small">${D.sunNode}: ${num(dNod, 1)}° (${D.limit} ≈ ${LIM_SEZON}°)</div>` +
    `<div class="small">${D.moonLat}: ${lat >= 0 ? "+" : "−"}${num(Math.abs(lat), 2)}° · ${D.moonNode}: ${num(Math.min(mod(ml - om, 180), 180 - mod(ml - om, 180)), 1)}°</div>` +
    `<div class="small">${D.nodeAt}: ${num(om, 1)}° ${D.ecl} · ${D.nodeRate}</div>`;
}

/* ---------- cadranul 3: tabelul unui an ---------- */
const EC = D.known; /* [data dd.mm.yyyy, S|L, tip] */
const knownMap = {}; for (const [d, k, ty] of EC) knownMap[d] = [k, ty];
function rows(an) {
  const out = [];
  for (const [t, tinta] of fazeLunare(UTCY(an), UTCY(an + 1))) {
    if (tinta !== 0 && tinta !== 180) continue;
    const lat = latLuna(t), key = fmtDay(t), kn = knownMap[key];
    let poss, umbral = null;
    if (tinta === 0) poss = Math.abs(lat) < LIM_NEW;
    else { const gama = Math.abs(rad(lat)) * distLuna(t) / R_ECHIV; poss = gama < GAMA_UMB; }
    out.push({t, tinta, lat, poss, kn});
  }
  return out;
}
function renderYear() {
  const an = Math.max(1900, Math.min(2200, parseInt($("sl-y").value, 10) || 2026));
  const rs = rows(an); let nS = 0, nL = 0, nSp = 0, nLp = 0;
  const body = rs.map((r, i) => {
    const sol = r.tinta === 0;
    if (r.poss) sol ? nSp++ : nLp++;
    let real = "—";
    if (an >= 2026 && an <= 2028) {
      if (r.kn) { real = `${r.kn[0] === "S" ? D.solar : D.lunar}: ${D.types[r.kn[1]]}`; sol ? nS++ : nL++; }
      else if (an >= 2026) real = D.none;
    }
    const mark = r.poss ? (sol ? D.possS : D.possL) : "";
    const penum = !sol && r.kn && !r.poss ? ` <span class="mute">(${D.notMarked})</span>` : "";
    return `<tr class="${r.poss ? "poss" : ""}" data-t="${r.t}"><td>${fmtDay(r.t)}</td><td>${sol ? D.newM : D.fullM}</td><td>${r.lat >= 0 ? "+" : "−"}${num(Math.abs(r.lat), 2)}°</td><td>${mark}</td><td>${real}${penum}</td></tr>`;
  }).join("");
  $("sl-ybody").innerHTML = body;
  const known = an >= 2026 && an <= 2028;
  $("sl-ysum").textContent = D.sumTpl.replace("{y}", an).replace("{s}", nSp).replace("{l}", nLp) + (known ? " " + D.sumKnown.replace("{s}", nS).replace("{l}", nL) : " " + D.sumUnknown);
  $("sl-ybody").querySelectorAll("tr").forEach(tr => tr.onclick = () => { setT(+tr.dataset.t); $("sl-ctl").scrollIntoView({behavior: "smooth", block: "start"}); });
}

/* ---------- comenzi ---------- */
function render() {
  $("sl-when").value = isoLocal(T0);
  renderRace(T0); renderNodes(T0);
}
function setT(ms) { T0 = ms; render(); }
function nextPhase(tinta, dir) {
  let t = T0 + dir * 36e5;
  for (let i = 0; i < 40; i++) {
    const a = dir > 0 ? t : t - 40 * 864e5, b = dir > 0 ? t + 40 * 864e5 : t;
    const f = fazeLunare(a, b).filter(x => x[1] === tinta);
    if (f.length) return dir > 0 ? f[0][0] : f[f.length - 1][0];
    t += dir * 40 * 864e5;
  }
  return T0;
}
function stop() { if (timer) { cancelAnimationFrame(timer); timer = null; } $("sl-play").setAttribute("aria-pressed", "false"); $("sl-play").textContent = D.play; }
function frame(ts) {
  if (!timer) return;
  const dt = Math.min(0.1, (ts - last) / 1000); last = ts;
  T0 += dt * parseFloat($("sl-speed").value) * 864e5; render();
  timer = requestAnimationFrame(frame);
}
function play() {
  if (timer) { stop(); return; }
  $("sl-play").setAttribute("aria-pressed", "true"); $("sl-play").textContent = D.pause;
  last = performance.now(); timer = requestAnimationFrame(frame);
}
{
  buildDials();
  $("sl-speed").innerHTML = D.speeds.map(([v, l]) => `<option value="${v}"${v === 1 ? " selected" : ""}>${l}</option>`).join("");
  $("sl-when").addEventListener("change", e => { const v = parseLocal(e.target.value); if (v !== null) { stop(); setT(v); } });
  $("sl-play").onclick = play;
  $("sl-now").onclick = () => { stop(); setT(Date.now()); };
  document.querySelectorAll("[data-step]").forEach(b => b.onclick = () => { stop(); setT(T0 + parseFloat(b.dataset.step) * 36e5); });
  $("sl-nextnew").onclick = () => { stop(); setT(nextPhase(0, 1)); };
  $("sl-nextfull").onclick = () => { stop(); setT(nextPhase(180, 1)); };
  $("sl-jump").innerHTML = D.jumps.map(([lab, iso]) => `<button type="button" data-iso="${iso}">${lab}</button>`).join("");
  $("sl-jump").querySelectorAll("button").forEach(b => b.onclick = () => {
    stop(); const [y, m, d] = b.dataset.iso.split("-").map(Number), x = new Date(0); x.setUTCFullYear(y, m - 1, d); x.setUTCHours(12, 0, 0, 0);
    const f = fazeLunare(x.getTime() - 2 * 864e5, x.getTime() + 2 * 864e5).filter(z => z[1] === 0 || z[1] === 180);
    setT(f.length ? f[0][0] : x.getTime());
  });
  const yy = new Date().getUTCFullYear(); $("sl-y").value = yy >= 1900 && yy <= 2200 ? yy : 2026;
  $("sl-y").addEventListener("change", renderYear);
  $("sl-yjump").querySelectorAll("button").forEach(b => b.onclick = () => { $("sl-y").value = b.dataset.y; renderYear(); });
  render(); renderYear();
}

})();
