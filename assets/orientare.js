(function(){
const f = document.getElementById("or-calc");
if (f) {
  const q = s => f.querySelector(s), out = document.getElementById("or-out");
  const T = JSON.parse(document.getElementById("or-data").textContent);
  function calc() {
    const mode = q('input[name=mode]:checked').value;
    const h = +q("#or-h").value, m = +q("#or-m").value, s = +q("#or-s").value;
    const hmax = mode === "tpu" ? 35 : 23, mmax = mode === "tpu" ? 9 : 59, smax = mode === "tpu" ? 9 : 59;
    q("#or-h").max = hmax; q("#or-m").max = mmax; q("#or-s").max = smax;
    if (![h, m, s].every(Number.isFinite) || h < 0 || m < 0 || s < 0 || h > hmax || m > mmax || s > smax) { out.textContent = T.bad; return; }
    const ref = mode === "tpu" ? h * 2400 + m * 240 + s * 24 : h * 3600 + m * 60 + s;
    const noon = mode === "tpu" ? 18 * 2400 : 43200;
    let lon = (noon - ref) / 240;               // 1° = 240 s, în ambele sisteme
    lon = ((lon + 180) % 360 + 360) % 360 - 180;
    const a = Math.abs(lon), z = Math.round(lon / 10);
    out.innerHTML = `<b>${a.toFixed(2)}° ${lon >= 0 ? T.e : T.w}</b> · ${T.zone} ${z > 0 ? "+" + z : z}`;
  }
  f.addEventListener("input", calc); calc();
}

})();
