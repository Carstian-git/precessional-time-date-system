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

/* Pagina Răsărit și apus + faze lunare, în TPU și SI, pentru un loc ales. Calcule: Meeus, ca în nucleul sistemului. */
const D = JSON.parse(document.getElementById("zi-data").textContent);
const num = (x, d) => x.toFixed(d).replace(".", D.dec);
const pad = n => String(n).padStart(2, "0");
const isTPU = () => $("zi-mon").value === "tpu";
const fusSel = () => parseInt($("zi-fus").value, 10) || 0;
const fusLab = () => { const k = fusSel(); return "F" + (k >= 0 ? "+" : "−") + pad(Math.abs(k)); };
const offSI = () => (parseFloat($("zi-utc").value) || 0) * 36e5;
const off = () => isTPU() ? fusSel() * 2400 * 1000 : offSI();
const LAT = () => Math.max(-89.9, Math.min(89.9, parseFloat($("zi-lat").value) || 0));
const LON = () => Math.max(-180, Math.min(180, parseFloat($("zi-lon").value) || 0));
const fmtDate = ms => { const d = new Date(ms + off()); return `${pad(d.getUTCDate())}.${pad(d.getUTCMonth() + 1)}.${d.getUTCFullYear()}`; };
const fmtSI = ms => { const d = new Date(ms + offSI()); return `${pad(d.getUTCDate())}.${pad(d.getUTCMonth() + 1)}.${d.getUTCFullYear()} · ${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}`; };
const dateKey = ms => new Date(ms + off() + 12 * 36e5).toISOString().slice(0, 10);
function tpu(ms) { return dinUtc(ms, fusSel() * 10, "F"); }
const tpuDate = ms => { const r = tpu(ms); return r.lc ? `${r.lc}/${r.zn}` : `${D.yearDay} ${r.zn}`; };
const timeOf = ms => { if (ms == null) return "—"; if (isTPU()) { const r = tpu(ms); return `${pad(r.hn)}:${pad(r.mn)}`; } const d = new Date(ms + offSI()); return `${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}`; };
const dateTime = ms => isTPU() ? `${tpuDate(ms)} · ${timeOf(ms)}` : `${fmtDate(ms)} · ${timeOf(ms)}`;
const durTxt = ms => { const m = ms / 6e4; if (isTPU()) { const n = m / 40; return `${Math.floor(n)}:${pad(Math.floor(n % 1 * 60))} ${D.newH}`; } return `${Math.floor(m / 60)}:${pad(Math.floor(m % 60))} ${D.hours}`; };

/* ---------- ziua aleasă ---------- */
function dayStart() {
  const [y, m, d] = ($("zi-date").value || "2026-10-07").split("-").map(Number), u = UTCY(y, m - 1, d);
  if (!isTPU()) return u - offSI();
  return Math.floor((u + 12 * 36e5) / DAY) * DAY - off();
}
const alt = (body, t) => {
  const s = body === "s" ? subsolar(t) : sublunar(t), p = rad(LAT()), dd = rad(s.lat), H = rad(LON() - s.lon);
  return Math.asin(Math.sin(p) * Math.sin(dd) + Math.cos(p) * Math.cos(dd) * Math.cos(H)) * 180 / Math.PI;
};
const H0 = {s: -0.833, m: 0.125};
function crossings(body, h0, t0, t1) {
  const out = {rise: [], set: []}, st = 6 * 6e4; let pt = t0, pa = alt(body, t0) - h0;
  for (let t = t0 + st; t <= t1 + 1; t += st) {
    const a = alt(body, t) - h0;
    if ((pa < 0) !== (a < 0)) { let lo = pt, hi = t; for (let i = 0; i < 24; i++) { const mid = (lo + hi) / 2; ((alt(body, mid) - h0 < 0) === (pa < 0)) ? lo = mid : hi = mid; } (pa < 0 ? out.rise : out.set).push(Math.round((lo + hi) / 2 / 1000) * 1000); }
    pt = t; pa = a;
  }
  return out;
}
function transit(body, t0, t1) {
  let best = null, st = 6 * 6e4, prev = alt(body, t0), cur = alt(body, t0 + st);
  for (let t = t0 + 2 * st; t <= t1; t += st) { const nx = alt(body, t); if (cur > prev && cur >= nx) { let lo = t - 2 * st, hi = t; for (let i = 0; i < 30; i++) { const m1 = lo + (hi - lo) / 3, m2 = hi - (hi - lo) / 3; alt(body, m1) < alt(body, m2) ? lo = m1 : hi = m2; } const tm = (lo + hi) / 2; if (tm >= t0 && tm < t1) best = [Math.round(tm / 1000) * 1000, alt(body, tm)]; } prev = cur; cur = nx; }
  return best;
}
const azalt = (body, t) => {
  const q = body === "s" ? subsolar(t) : sublunar(t), p = rad(LAT()), dd = rad(q.lat), H = rad(LON() - q.lon);
  const az = mod(Math.atan2(Math.sin(H), Math.cos(H) * Math.sin(p) - Math.tan(dd) * Math.cos(p)) * 180 / Math.PI + 180, 360);
  return [az, Math.asin(Math.sin(p) * Math.sin(dd) + Math.cos(p) * Math.cos(dd) * Math.cos(H)) * 180 / Math.PI];
};
let C = null;
function compute() {
  const t0 = dayStart(), t1 = t0 + DAY, sun = crossings("s", H0.s, t0, t1), civ = crossings("s", -6, t0, t1), mo = crossings("m", H0.m, t0, t1);
  C = {t0, t1, sun, civ, mo, noon: transit("s", t0, t1), mt: transit("m", t0, t1), aMid: alt("s", t0 + DAY / 2)};
}
const CLS = a => a > -0.833 ? 3 : a > -6 ? 2 : a > -12 ? 1 : 0;
const COLS = ["#232c4d", "#4d5f9a", "#d98a52", "#f1c85a"];

/* ---------- cadranul 1: ziua ---------- */
const c0 = 180;
let tSel = 0.5;
const angOf = t => (t - C.t0) / DAY * 360;
function glyph(a, r, g, fill, sz) { const [x, y] = P(c0, c0, r, a); return `<circle cx="${f1(x)}" cy="${f1(y)}" r="${sz}" fill="${fill}" stroke="var(--face)" stroke-width="1.5"/><text x="${f1(x)}" y="${f1(y + .5)}" font-size="${sz + 3}" text-anchor="middle" dominant-baseline="central" style="fill:#fff" pointer-events="none">${g}</text>`; }
function renderDial() {
  let s = `<circle cx="${c0}" cy="${c0}" r="198" fill="var(--face)" stroke="var(--ink)" stroke-width="1.4"/>`;
  let a0 = 0, k0 = CLS(alt("s", C.t0 + 3e5));
  const N = 144;
  for (let i = 1; i <= N; i++) { const k = i === N ? -1 : CLS(alt("s", C.t0 + (i + .5) * DAY / N)); if (k !== k0) { s += `<path d="${arcPath(c0, c0, 134, 164, a0, i * 360 / N)}" fill="${COLS[k0]}" opacity=".85"/>`; a0 = i * 360 / N; k0 = k; } }
  s += `<circle cx="${c0}" cy="${c0}" r="134" fill="none" stroke="var(--rule)"/><circle cx="${c0}" cy="${c0}" r="164" fill="none" stroke="var(--ink)"/>`;
  const tp = isTPU(), nt = tp ? 36 : 24, step = tp ? 3 : 2;
  for (let h = 0; h < nt; h++) { const a = h / nt * 360, big = h % step === 0; s += tick(c0, c0, 164, big ? 175 : 170, a, big ? 1.4 : .8, "var(--ink)"); if (big) s += txt(c0, c0, 187, a, String(h), 10, "mute"); }
  for (const t of C.sun.rise) s += glyph(angOf(t), 149, "↑", "#d9972b", 10);
  for (const t of C.sun.set) s += glyph(angOf(t), 149, "↓", "#c0562b", 10);
  for (const t of C.mo.rise) s += glyph(angOf(t), 112, "☽", "#7d8aa8", 9);
  for (const t of C.mo.set) s += glyph(angOf(t), 112, "☽", "#4a587a", 9);
  if (C.noon) s += glyph(angOf(C.noon[0]), 149, "☉", "var(--sun)", 10);
  s += `<g id="zi-cur"></g>`; $("zi-dial").innerHTML = s; renderCur();
}
function renderCur() {
  const t = C.t0 + tSel * DAY, a = tSel * 360, [x, y] = P(c0, c0, 164, a), as = alt("s", t), am = alt("m", t);
  let s = `<line x1="${c0}" y1="${c0}" x2="${f1(x)}" y2="${f1(y)}" stroke="var(--ink)" stroke-width="1.2" opacity=".6"/><circle cx="${f1(x)}" cy="${f1(y)}" r="4" fill="var(--ink)"/>`;
  s += `<text x="${c0}" y="${c0 - 22}" font-size="12" text-anchor="middle" fill="var(--ink)">${isTPU() ? tpuDate(t) : fmtDate(t)}</text><text x="${c0}" y="${c0 + 2}" font-size="24" text-anchor="middle" fill="var(--ink)" font-weight="500">${timeOf(t)}</text><text x="${c0}" y="${c0 + 20}" font-size="10.5" text-anchor="middle" class="mute">${isTPU() ? fusLab() : "UTC" + (offSI() >= 0 ? "+" : "−") + Math.abs(offSI() / 36e5)}</text>`;
  s += `<text x="${c0}" y="${c0 + 40}" font-size="10.5" text-anchor="middle" fill="${as > 0 ? "#b87a10" : "var(--mute)"}">☉ ${num(as, 1)}°</text><text x="${c0}" y="${c0 + 54}" font-size="10.5" text-anchor="middle" fill="${am > 0 ? "#4a587a" : "var(--mute)"}">☽ ${num(am, 1)}°</text>`;
  $("zi-cur").innerHTML = s; $("zi-t").value = Math.round(tSel * 1440);
  renderSky(t, as); renderMoon(t); renderOut(t, as, am);
}
function lst(list) { return list.length ? list.map(timeOf).join(" · ") : "—"; }
function renderOut(t, as, am) {
  const sd = C.sun.rise.length && C.sun.set.length ? (C.sun.set[0] > C.sun.rise[0] ? C.sun.set[0] - C.sun.rise[0] : C.sun.set[0] + DAY - C.sun.rise[0]) : null;
  const polar = sd == null ? (C.aMid > -0.833 ? D.polarDay : D.polarNight) : "";
  $("zi-r").innerHTML =
    `<div class="big">${isTPU() ? tpuDate(C.t0 + DAY / 2) + " · ER " + tpu(C.t0 + DAY / 2).er + " · AE " + tpu(C.t0 + DAY / 2).ae : fmtDate(C.t0 + DAY / 2)}</div>` +
    `<div class="small">↑ ${D.sunrise}: ${lst(C.sun.rise)} · ↓ ${D.sunset}: ${lst(C.sun.set)}</div>` +
    `<div class="small">${D.noon}: ${C.noon ? timeOf(C.noon[0]) + " (" + num(C.noon[1], 1) + "°)" : "—"} · ${D.dayLen}: ${sd == null ? polar : durTxt(sd)}</div>` +
    `<div class="small">${D.civil}: ${lst(C.civ.rise)} → ${lst(C.civ.set)}</div>` +
    `<div class="small">☽↑ ${D.moonrise}: ${lst(C.mo.rise)} · ☽↓ ${D.moonset}: ${lst(C.mo.set)}${C.mt ? " · " + D.transit + " " + timeOf(C.mt[0]) : ""}</div>` +
    `<div class="small">${D.at} ${timeOf(t)}: ☉ ${num(as, 1)}° (${as > 0 ? D.above : D.below}) · ☽ ${num(am, 1)}° (${am > 0 ? D.above : D.below})</div>`;
}

/* ---------- cerul: Soarele și Luna față de orizont ---------- */
const SW = 440, SH = 250, SX0 = 20, SX1 = 420, SA0 = -25, SA1 = 90, SYT = 14, SYB = 218;
const SKY = ["#1b2342", "#3b4c85", "#c98456", "#8fc3ea"];
const sx = az => SX0 + az / 360 * (SX1 - SX0), sy = a => SYB - (a - SA0) / (SA1 - SA0) * (SYB - SYT);
function renderSky(t, as) {
  const k = CLS(as), [azS, aS] = azalt("s", t), [azM, aM] = azalt("m", t), u = unghiLunar(t), hy = sy(0);
  let s = `<rect x="${SX0}" y="${SYT}" width="${SX1 - SX0}" height="${f1(hy - SYT)}" fill="${SKY[k]}"/><rect x="${SX0}" y="${f1(hy)}" width="${SX1 - SX0}" height="${f1(SYB - hy)}" fill="var(--rule)"/><line x1="${SX0}" x2="${SX1}" y1="${f1(hy)}" y2="${f1(hy)}" stroke="var(--ink)" stroke-width="1.4"/>`;
  for (const a of [30, 60]) s += `<line x1="${SX0}" x2="${SX1}" y1="${f1(sy(a))}" y2="${f1(sy(a))}" stroke="#fff" stroke-opacity=".25" stroke-dasharray="2 4"/><text x="${SX0 + 3}" y="${f1(sy(a) - 3)}" font-size="9.5" style="fill:#fff" opacity=".8">${a}°</text>`;
  [["N", 0], ["E", 90], ["S", 180], ["V", 270], ["N", 360]].forEach(([l, a]) => { s += `<line x1="${sx(a)}" x2="${sx(a)}" y1="${f1(hy)}" y2="${f1(hy + 5)}" stroke="var(--ink)"/><text x="${sx(a)}" y="${f1(hy + 17)}" font-size="11" text-anchor="middle" fill="var(--ink)" font-weight="600">${D.cardinal[a / 90 % 4 === 0 && a === 360 ? 0 : a / 90]}</text>`; });
  const trail = (body, col) => { let d = "", px = null; for (let i = 0; i <= 144; i++) { const [az, a] = azalt(body, C.t0 + i / 144 * DAY), x = sx(az); if (a < SA0) { px = null; continue; } d += (px !== null && Math.abs(x - px) < 100 ? "L" : "M") + f1(x) + " " + f1(sy(a)) + " "; px = x; } return `<path d="${d}" fill="none" stroke="${col}" stroke-width="1.4" stroke-dasharray="3 3" opacity=".85"/>`; };
  s += trail("s", "#ffe9a8") + trail("m", "#cfd8f0");
  if (aM > SA0) s += faseIcon(u, f1(sx(azM)), f1(sy(aM)), 11, "#4a5373", "#f4f1dc");
  if (aS > SA0) s += `<circle cx="${f1(sx(azS))}" cy="${f1(sy(aS))}" r="11" fill="#f5c542" stroke="#fff" stroke-width="1.5"/>`;
  s += `<text x="${SX0}" y="${SH - 6}" font-size="10.5" class="mute">☉ ${D.az} ${num(azS, 0)}° · ${num(aS, 1)}°   ☽ ${D.az} ${num(azM, 0)}° · ${num(aM, 1)}°</text>`;
  $("zi-sky").innerHTML = s;
}

/* ---------- cadranul 2: faza Lunii ---------- */
function faseIcon(u, cx, cy, r, dark, light) {
  const co = Math.cos(rad(u)), rx = Math.abs(co) * r, waxing = mod(u, 360) < 180; let lit;
  if (waxing) lit = `M${cx} ${cy - r}A${r} ${r} 0 0 1 ${cx} ${cy + r}A${f1(rx)} ${r} 0 0 ${co > 0 ? 0 : 1} ${cx} ${cy - r}Z`;
  else lit = `M${cx} ${cy - r}A${r} ${r} 0 0 0 ${cx} ${cy + r}A${f1(rx)} ${r} 0 0 ${co > 0 ? 1 : 0} ${cx} ${cy - r}Z`;
  return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${dark || "var(--rule)"}" stroke="${dark ? "#fff" : "var(--ink)"}" stroke-width="1"/><path d="${lit}" fill="${light || "var(--moon)"}" stroke="none"/>`;
}
const phName = u => D.phN[Math.floor(mod(u + 22.5, 360) / 45)];
function renderMoon(t) {
  const u = unghiLunar(t), il = (1 - Math.cos(rad(u))) / 2, age = u / 360 * 29.530588;
  $("zi-moon").innerHTML = faseIcon(u, 110, 90, 70);
  $("zi-mr").innerHTML = `<div class="big">${phName(u)}</div><div class="small">${D.illum}: ${num(il * 100, 1)}%</div><div class="small">${D.age}: ${num(age, 1)} ${D.days} · ${D.elong}: ${num(u, 1)}°</div>`;
}

/* ---------- luna calendaristică cu fazele ---------- */
function monthDays() {
  const mid = C.t0 + DAY / 2;
  if (isTPU()) {
    const zi = Math.floor((mid + off()) / DAY), r = campuriSolare(zi);
    if (!r.lc) return {title: `${D.yearDay} · ER ${tpu(mid).er} · AE ${tpu(mid).ae}`, days: [zi], lead: 0, tpu: true};
    return {title: `${D.monthL} ${r.lc} · ER ${tpu(mid).er} · AE ${tpu(mid).ae}`, days: Array.from({length: 28}, (_, i) => zi - (r.zn - 1) + i), lead: 0, tpu: true};
  }
  const d = new Date(mid + offSI()), y = d.getUTCFullYear(), m = d.getUTCMonth(), n = new Date(Date.UTC(y, m + 1, 0)).getUTCDate();
  const first = Date.UTC(y, m, 1) / DAY; /* zile de la epocă, în ora locală */
  return {title: new Date(Date.UTC(y, m, 1)).toLocaleDateString(D.locale, {month: "long", year: "numeric", timeZone: "UTC"}), days: Array.from({length: n}, (_, i) => first + i), lead: (new Date(Date.UTC(y, m, 1)).getUTCDay() + 6) % 7, tpu: false};
}
let MS = null;
function renderMonth() {
  const M = monthDays(), W = 60, Hc = 70, cols = 7, rows = Math.ceil((M.days.length + M.lead) / cols);
  const startOf = i => M.tpu ? M.days[i] * DAY - off() : M.days[i] * DAY - offSI();
  const t00 = startOf(0), t11 = startOf(M.days.length - 1) + DAY, ph = fazeLunare(t00 - 1, t11);
  MS = {t00, t11, ph};
  let s = "";
  for (let c = 0; c < cols; c++) { const lab = M.tpu ? D.dowT + (c + 1) : new Date(Date.UTC(2024, 0, 1 + c)).toLocaleDateString(D.locale, {weekday: "short", timeZone: "UTC"}); s += `<text x="${c * W + W / 2}" y="12" font-size="10.5" text-anchor="middle" class="mute">${lab}</text>`; }
  const sel = dateKey(C.t0);
  M.days.forEach((dd, i) => {
    const k = i + M.lead, cx = (k % cols) * W + W / 2, y0 = 20 + Math.floor(k / cols) * Hc, ts = startOf(i), tn = ts + DAY / 2, u = unghiLunar(tn), il = (1 - Math.cos(rad(u))) / 2;
    const isSel = dateKey(ts) === sel, pr = ph.filter(p => p[0] >= ts && p[0] < ts + DAY)[0];
    const label = M.tpu ? (campuriSolare(dd).lc ? campuriSolare(dd).zn : campuriSolare(dd).zn) : new Date(dd * DAY).getUTCDate();
    s += `<g class="zi-cell" data-k="${dateKey(ts)}" style="cursor:pointer" tabindex="0" role="button">${isSel ? `<rect x="${cx - W / 2 + 2}" y="${y0 - 2}" width="${W - 4}" height="${Hc - 4}" rx="6" fill="none" stroke="var(--sun)" stroke-width="2"/>` : ""}<text x="${cx}" y="${y0 + 9}" font-size="11" text-anchor="middle" fill="var(--ink)">${label}</text>${faseIcon(u, cx, y0 + 33, 14)}${pr ? `<circle cx="${cx}" cy="${y0 + 33}" r="17.5" fill="none" stroke="var(--sun)" stroke-width="2"/>` : ""}<text x="${cx}" y="${y0 + 62}" font-size="9.5" text-anchor="middle" class="mute">${Math.round(il * 100)}%</text></g>`;
  });
  $("zi-cal").setAttribute("viewBox", `0 0 ${cols * W} ${20 + rows * Hc}`); $("zi-cal").innerHTML = s; $("zi-calh").textContent = M.title;
  $("zi-ph").innerHTML = ph.map(p => `<tr><td>${D.phF[p[1] / 90]}</td><td>${fmtSI(p[0])}</td><td>${tpuDate(p[0])} · ${(() => { const r = tpu(p[0]); return pad(r.hn) + ":" + pad(r.mn); })()} ${fusLab()}</td></tr>`).join("");
  document.querySelectorAll(".zi-cell").forEach(g => { const go = () => { $("zi-date").value = g.dataset.k; refresh(); }; g.onclick = go; g.onkeydown = e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); go(); } }; });
}

function refresh(keepT) { compute(); renderDial(); renderMonth(); }
function shift(n) { const d = new Date($("zi-date").value + "T12:00:00Z"); d.setUTCDate(d.getUTCDate() + n); $("zi-date").value = d.toISOString().slice(0, 10); refresh(); }
function now() { const n = Date.now(); $("zi-date").value = new Date(Math.floor((n + off()) / DAY) * DAY).toISOString().slice(0, 10); compute(); tSel = Math.max(0, Math.min(.9999, (n - C.t0) / DAY)); renderDial(); renderMonth(); }
let anim = null, lastTs = 0;
function speeds() { const t = isTPU(); return D[t ? "spT" : "spS"]; }
function fillSpeeds() { const cur = $("zi-sp").selectedIndex; $("zi-sp").innerHTML = speeds().map(([v, l], i) => `<option value="${v}">${l}</option>`).join(""); $("zi-sp").selectedIndex = cur < 0 ? 1 : cur; }
function stopAnim() { if (anim) { cancelAnimationFrame(anim); anim = null; } $("zi-play").textContent = "▶ " + D.play; }
function frameA(ts) {
  if (!anim) return;
  const dt = Math.min(.1, (ts - lastTs) / 1000); lastTs = ts; tSel += dt * parseFloat($("zi-sp").value);
  if (tSel >= 1) { const keep = tSel - 1; const d = new Date($("zi-date").value + "T12:00:00Z"); d.setUTCDate(d.getUTCDate() + 1); $("zi-date").value = d.toISOString().slice(0, 10); compute(); renderDial(); renderMonth(); tSel = Math.min(.9999, keep); }
  renderCur(); anim = requestAnimationFrame(frameA);
}
function playA() { if (anim) { stopAnim(); return; } $("zi-play").textContent = "■ " + D.pause; lastTs = performance.now(); anim = requestAnimationFrame(frameA); }
function setVis() { $("zi-fusF").hidden = !isTPU(); $("zi-utcF").hidden = isTPU(); }
{
  { let o = ""; for (let k = -17; k <= 18; k++) o += `<option value="${k}">F${k >= 0 ? "+" : "−"}${pad(Math.abs(k))}</option>`; $("zi-fus").innerHTML = o; $("zi-fus").value = String(D.defaultFus); }
  $("zi-prev").onclick = () => shift(-1); $("zi-next").onclick = () => shift(1); $("zi-now").onclick = now;
  $("zi-p1").onclick = () => shift(-28); $("zi-p2").onclick = () => shift(28);
  for (const id of ["zi-mon", "zi-fus", "zi-utc", "zi-lat", "zi-lon", "zi-date"]) $(id).addEventListener("change", () => { setVis(); fillSpeeds(); refresh(); });
  $("zi-play").onclick = playA; $("zi-t").addEventListener("input", e => { stopAnim(); tSel = (+e.target.value) / 1440; renderCur(); });
  fillSpeeds(); setVis(); now();
}

})();
