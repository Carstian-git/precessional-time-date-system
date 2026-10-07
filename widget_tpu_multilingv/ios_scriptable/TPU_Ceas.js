// Ceas TPU – widget Scriptable (iOS / iPadOS)  ·  Timpul precesional uman
// Instalare: vezi TUTORIAL_WIDGETURI.md, secțiunea iPhone. Setează LON mai jos (grade est; negativ la vest).
const LON = 26.1;
const LANG = "ro"; // "ro", "en" sau "fr"  /  "ro", "en" or "fr"
/* Nucleu mic TPU (fără Lună): data din calendarul precesional uman + ora nouă.
   Port al lui core.js / sistem_timp.py. Licență: aceeași ca proiectul. */
/* Nucleu mic TPU (fără Lună): data din calendarul precesional uman + ora nouă.
   Port al lui core.js / sistem_timp.py. Licență: aceeași ca proiectul. */
var TPU = (function () {
  var DAY = 864e5, EPOCA = Date.UTC(2011, 11, 22) / DAY, CICLU = 25772, AN_MEDIU = 365 + 1 / 4 - 1 / 128, K_ANCORA = 2441 - 2011;
  var LIMITE = []; for (var j = 0; j < 13; j++) LIMITE.push(Math.floor(j * CICLU / 12));
  var L10N = {
    ro: {zile: ["Luni", "Marți", "Miercuri", "Joi", "Vineri", "Sâmbătă", "Duminică"], luna: "Luna", ziua: "ziua", za: "Ziua anului", zb: "Ziua bisectă", fus: "Fus nou", arc: "arcul", zia: "ziua"},
    en: {zile: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"], luna: "Month", ziua: "day", za: "Year Day", zb: "Leap Day", fus: "New time zone", arc: "arc", zia: "day"},
    fr: {zile: ["lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi", "dimanche"], luna: "Mois", ziua: "jour", za: "Jour de l'année", zb: "Jour bissextile", fus: "Nouveau fuseau", arc: "arc", zia: "jour"}
  };
  function mod(a, n) { return ((a % n) + n) % n; }
  function fdiv(a, b) { return Math.floor(a / b); }
  function inceputAn(k) { return EPOCA + 365 * (k - 1) + fdiv(k - 1, 4) - fdiv(k - 1, 128); }
  function anPentruZi(zi) { var k = Math.floor((zi - EPOCA) / AN_MEDIU) + 1; while (zi < inceputAn(k)) k--; while (zi >= inceputAn(k + 1)) k++; return k; }
  function eraAe(k) { var p = mod(k - K_ANCORA, CICLU), j = 0; for (var i = 0; i < 12; i++) if (LIMITE[i] <= p) j = i; return [j + 1, p - LIMITE[j] + 1]; }
  /* ms = moment UTC (ms), lon = longitudinea (grade, E pozitiv) -> fus nou F */
  function acum(ms, lon, lang) {
    var T = L10N[lang] || L10N.ro;
    var fus = Math.floor(lon / 10 + 0.5), loc = ms + fus * 2400000, zi = Math.floor(loc / DAY);
    var k = anPentruZi(zi), n = zi - inceputAn(k) + 1, ea = eraAe(k);
    var arc = Math.min(73, Math.floor((n - 1) / 5) + 1), za = n - 5 * (arc - 1), lc, zn;
    if (n <= 364) { lc = Math.floor((n - 1) / 28) + 1; zn = (n - 1) % 28 + 1; } else { lc = 0; zn = n - 364; }
    var t = mod(Math.floor(loc / 1000), 86400), hn = Math.floor(t / 2400), r = t % 2400, mn = Math.floor(r / 240); r %= 240;
    var sn = Math.floor(r / 24), ss = r % 24;
    var zs = lc ? T.zile[(zn - 1) % 7] : (zn === 1 ? T.za : T.zb);
    return {er: ea[0], ae: ea[1], arc: arc, za: za, lc: lc, zn: zn, hn: hn, mn: mn, sn: sn, ss: ss, fus: fus, zi: zs,
      T: T, unghi: (t / 86400) * 360, // unghiul acului de ora (0 = sus, în sens orar); 10° pe oră nouă
      data: (lc ? zs + " · " + T.luna + " " + lc + " · " + T.ziua + " " + zn : zs) + " · ER " + er2(ea[0]) + " AE " + ea[1],
      ora: p2(hn) + ":" + p2(mn) + ":" + p2(sn) + ":" + p2(ss)};
  }
  function er2(e) { return e; }
  function p2(n) { return (n < 10 ? "0" : "") + n; }
  return {acum: acum, p2: p2, L10N: L10N};
})();

const r = TPU.acum(Date.now(), LON, LANG);
const W = new ListWidget();
const dark = Device.isUsingDarkAppearance();
W.backgroundColor = dark ? new Color("#10151f") : new Color("#fbf7ee");
const fg = dark ? new Color("#eef0f5") : new Color("#1d2433"), acc = dark ? new Color("#ff8a6b") : new Color("#b03a2e");
const S = 150, c = S / 2, R = 62;
const ctx = new DrawContext(); ctx.size = new Size(S, S); ctx.opaque = false; ctx.respectScreenScale = true;
function line(a, r1, r2, w, col) { const p = new Path(); const s = Math.sin(a), k = -Math.cos(a);
  p.move(new Point(c + s * r1, c + k * r1)); p.addLine(new Point(c + s * r2, c + k * r2)); ctx.addPath(p); ctx.setStrokeColor(col); ctx.setLineWidth(w); ctx.strokePath(); }
for (let h = 0; h < 36; h++) line(h * 10 * Math.PI / 180, h % 3 === 0 ? R - 9 : R - 4, R, h % 3 === 0 ? 2 : 1, fg);
line(r.unghi * Math.PI / 180, 0, R - 18, 4, acc);
line(((r.mn * 240 + r.sn * 24 + r.ss) / 2400) * 2 * Math.PI, 0, R - 4, 2, fg);
const img = W.addImage(ctx.getImage()); img.centerAlignImage(); img.imageSize = new Size(110, 110);
const t = W.addText(r.ora); t.font = Font.boldMonospacedSystemFont(15); t.textColor = fg; t.centerAlignText();
const d = W.addText(r.data); d.font = Font.systemFont(10); d.textColor = fg; d.textOpacity = 0.7; d.centerAlignText();
W.refreshAfterDate = new Date(Date.now() + 60000);
if (config.runsInWidget) Script.setWidget(W); else await W.presentSmall();
Script.complete();
