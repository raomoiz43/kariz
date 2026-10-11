/* =====================================================================
   WEDDING CARD – EDIT HERE
   Bride ka naam ayay to sirf brideName mein likh dein, baqi sab khud update ho jayega.
   ===================================================================== */
const CONFIG = {
  groomName: "Rao Kariz Ahmed",
  brideName: "",                               // e.g. "Ayesha"  (khali ho to sirf "Daughter of..." dikhega)
  brideParent: "Daughter of Mr. Zainulabiddin",
  sealText: "K&N",                             // envelope ki seal par monogram
  letterText: "K & N",                         // envelope ke andar wale letter par
  // Barat ka waqt (Pakistan time, UTC+5). Countdown isi tak chalega.
  countdownTo: "2026-11-13T20:00:00+05:00"
};

(() => {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- apply CONFIG to the page ---------- */
  $(".groom").textContent = CONFIG.groomName;
  $("#letterText").textContent = CONFIG.letterText;
  $(".sign").textContent = CONFIG.groomName;
  $("#brideParent").textContent = CONFIG.brideParent;
  $("#sealText").textContent = CONFIG.sealText;
  if (CONFIG.brideName.trim()) {
    $("#brideName").textContent = CONFIG.brideName.trim();
    $(".sign").textContent = CONFIG.groomName + " & " + CONFIG.brideName.trim();
    document.title = CONFIG.groomName + " & " + CONFIG.brideName.trim() + " | Wedding Invitation";
  } else {
    $(".names").classList.add("no-bride");
  }

  /* ---------- scroll reveal ---------- */
  let io;
  function startReveals() {
    if (!("IntersectionObserver" in window)) { $$(".reveal").forEach(e => e.classList.add("in")); return; }
    io = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
    }), { threshold: 0.18, rootMargin: "0px 0px -6% 0px" });
    $$(".reveal").forEach((el, i) => { el.style.transitionDelay = (i % 3) * 90 + "ms"; io.observe(el); });
  }

  /* ---------- envelope intro ---------- */
  // Envelope khulne ke baad wahin ruka rehta hai; scroll shuru karte hi hat jata hai.
  const intro = $("#intro"), env = $("#envelope");
  let opened = false, ready = false, left = false;
  function leaveIntro() {
    if (!ready || left) return;
    left = true;
    intro.classList.add("leave");
    document.body.classList.add("revealed");
    $("#card").removeAttribute("aria-hidden");
    startReveals();
    ["wheel", "touchmove", "scroll", "keydown"].forEach(t => removeEventListener(t, onUserScroll));
    setTimeout(() => intro.remove(), 1600);
  }
  function onUserScroll(e) {
    if (e.type === "keydown" && !["ArrowDown", "PageDown", " ", "End"].includes(e.key)) return;
    if (e.type === "wheel" && e.deltaY <= 0) return;
    leaveIntro();
  }
  env.addEventListener("click", () => {
    if (opened) return;
    opened = true;
    intro.classList.add("open");
    setTimeout(() => {
      ready = true;
      document.body.classList.remove("locked");     // ab scroll ho sakta hai
      ["wheel", "touchmove", "scroll", "keydown"].forEach(t => addEventListener(t, onUserScroll, { passive: true }));
    }, reduceMotion ? 100 : 2400);
  });
  $("#scrollCue").addEventListener("click", () => { leaveIntro(); window.scrollBy({ top: innerHeight * .5, behavior: "smooth" }); });

  /* ---------- floating petals (background life) ---------- */
  const pc = $("#petals"), px = pc.getContext("2d");
  let PW, PH, petals = [];
  const DPR = Math.min(window.devicePixelRatio || 1, 2);
  function sizePetals() {
    PW = pc.width = innerWidth * DPR; PH = pc.height = innerHeight * DPR;
  }
  const palette = ["238,226,214", "226,196,186", "246,240,228", "214,200,170"];
  function newPetal(initial) {
    return {
      x: Math.random() * PW, y: initial ? Math.random() * PH : -30 * DPR,
      r: (4 + Math.random() * 7) * DPR, vy: (.25 + Math.random() * .55) * DPR, sway: .4 + Math.random() * 1.2,
      ph: Math.random() * 6.28, rot: Math.random() * 6.28, vr: (Math.random() - .5) * .025,
      c: palette[(Math.random() * palette.length) | 0], a: .35 + Math.random() * .45
    };
  }
  function initPetals() {
    sizePetals();
    petals = Array.from({ length: innerWidth < 520 ? 16 : 26 }, () => newPetal(true));
  }
  let last = 0;
  function loopPetals(t) {
    requestAnimationFrame(loopPetals);
    if (document.hidden || t - last < 30) return;
    last = t;
    px.clearRect(0, 0, PW, PH);
    for (const p of petals) {
      p.ph += .02; p.y += p.vy; p.x += Math.sin(p.ph) * p.sway * DPR * .6 + .12 * DPR; p.rot += p.vr;
      if (p.y > PH + 30 || p.x > PW + 30) Object.assign(p, newPetal(false));
      px.save(); px.translate(p.x, p.y); px.rotate(p.rot); px.scale(1, .55 + .45 * Math.abs(Math.cos(p.ph)));
      px.fillStyle = `rgba(${p.c},${p.a})`;
      px.beginPath(); px.ellipse(0, 0, p.r, p.r * .55, 0, 0, 6.283); px.fill();
      px.restore();
    }
  }
  initPetals();
  addEventListener("resize", () => { sizePetals(); });
  if (!reduceMotion) requestAnimationFrame(loopPetals);

  /* ---------- confetti burst ---------- */
  const cc = $("#confetti"), cx = cc.getContext("2d");
  let bits = [], confettiOn = false;
  function burst(x, y) {
    cc.width = innerWidth * DPR; cc.height = innerHeight * DPR;
    const cols = ["#f0dc9e", "#d9b86a", "#f6f0e4", "#e2c4ba", "#b9995a"];
    for (let i = 0; i < 90; i++) {
      const a = Math.random() * 6.283, s = (2 + Math.random() * 7) * DPR;
      bits.push({ x: x * DPR, y: y * DPR, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 4 * DPR,
        w: (3 + Math.random() * 5) * DPR, h: (2 + Math.random() * 4) * DPR, r: Math.random() * 6, vr: (Math.random() - .5) * .4,
        c: cols[(Math.random() * cols.length) | 0], life: 1 });
    }
    if (!confettiOn) { confettiOn = true; requestAnimationFrame(stepConfetti); }
  }
  function stepConfetti() {
    cx.clearRect(0, 0, cc.width, cc.height);
    bits = bits.filter(b => b.life > 0);
    for (const b of bits) {
      b.vy += .22 * DPR; b.vx *= .985; b.x += b.vx; b.y += b.vy; b.r += b.vr; b.life -= .011;
      cx.save(); cx.globalAlpha = Math.max(b.life, 0); cx.translate(b.x, b.y); cx.rotate(b.r);
      cx.fillStyle = b.c; cx.fillRect(-b.w / 2, -b.h / 2, b.w, b.h); cx.restore();
    }
    if (bits.length) requestAnimationFrame(stepConfetti);
    else { confettiOn = false; cx.clearRect(0, 0, cc.width, cc.height); }
  }

  /* ---------- scratch & reveal ---------- */
  const sc = $("#scratch"), sctx = sc.getContext("2d", { willReadFrequently: true });
  const wrap = $("#scratchWrap"), hint = $("#scratchHint"), revealBtn = $("#revealBtn");
  let sw = 0, sh = 0, scratching = false, started = false, finished = false, moves = 0, lastPt = null;

  function paintFoil() {
    const r = sc.getBoundingClientRect();
    sw = Math.round(r.width); sh = Math.round(r.height);
    if (!sw) return;
    sc.width = sw * DPR; sc.height = sh * DPR;
    sctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    sctx.globalCompositeOperation = "source-over";
    const g = sctx.createLinearGradient(0, 0, sw, sh);
    g.addColorStop(0, "#9c7a35"); g.addColorStop(.22, "#e9d08a"); g.addColorStop(.45, "#b8944b");
    g.addColorStop(.7, "#f3e1a4"); g.addColorStop(1, "#a07c36");
    sctx.fillStyle = g; sctx.fillRect(0, 0, sw, sh);
    // brushed-metal streaks
    for (let i = -sh; i < sw; i += 3) {
      sctx.strokeStyle = `rgba(${Math.random() > .5 ? "255,246,210" : "110,80,25"},${.06 + Math.random() * .09})`;
      sctx.lineWidth = 1; sctx.beginPath(); sctx.moveTo(i, 0); sctx.lineTo(i + sh, sh); sctx.stroke();
    }
    for (let i = 0; i < 700; i++) {
      sctx.fillStyle = `rgba(${Math.random() > .5 ? "255,255,255" : "80,55,15"},${Math.random() * .16})`;
      sctx.fillRect(Math.random() * sw, Math.random() * sh, 1.4, 1.4);
    }
    // inner border
    sctx.strokeStyle = "rgba(255,245,205,.7)"; sctx.lineWidth = 1.2; sctx.strokeRect(7, 7, sw - 14, sh - 14);
    sctx.strokeStyle = "rgba(90,62,18,.45)"; sctx.strokeRect(10, 10, sw - 20, sh - 20);
    // label
    sctx.textAlign = "center"; sctx.textBaseline = "middle";
    sctx.font = `600 ${Math.max(15, sw * .075)}px "Lora",Georgia,serif`;
    sctx.fillStyle = "rgba(255,248,220,.75)"; sctx.fillText("SCRATCH HERE", sw / 2, sh / 2 + 15);
    sctx.fillStyle = "rgba(80,55,15,.75)"; sctx.fillText("SCRATCH HERE", sw / 2, sh / 2 + 14);
    // coin icon
    sctx.beginPath(); sctx.arc(sw / 2, sh / 2 - 26, 17, 0, 6.283);
    sctx.fillStyle = "rgba(60,70,50,.88)"; sctx.fill();
    sctx.strokeStyle = "rgba(255,245,205,.8)"; sctx.lineWidth = 1.5; sctx.stroke();
    sctx.fillStyle = "#f0dc9e"; sctx.font = "16px serif"; sctx.fillText("✦", sw / 2, sh / 2 - 25);
  }

  function pos(e) { const r = sc.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; }
  function scratchTo(p) {
    sctx.globalCompositeOperation = "destination-out";
    sctx.lineCap = sctx.lineJoin = "round"; sctx.lineWidth = Math.max(30, sw * .11);
    sctx.beginPath(); sctx.moveTo((lastPt || p).x, (lastPt || p).y); sctx.lineTo(p.x + .01, p.y); sctx.stroke();
    lastPt = p;
  }
  function clearedRatio() {
    const d = sctx.getImageData(0, 0, sc.width, sc.height).data;
    let clear = 0, n = 0;
    for (let i = 3; i < d.length; i += 4 * 37) { n++; if (d[i] < 40) clear++; }
    return clear / n;
  }
  function finish(auto) {
    if (finished) return;
    finished = true;
    sc.classList.add("gone"); wrap.classList.add("done");
    hint.textContent = "Save the date — see you there, In sha Allah ✦";
    revealBtn.hidden = true;
    const r = wrap.getBoundingClientRect();
    if (!reduceMotion) burst(r.left + r.width / 2, r.top + r.height / 2);
    if (navigator.vibrate) try { navigator.vibrate(40); } catch (_) {}
  }
  sc.addEventListener("pointerdown", e => {
    if (finished) return;
    scratching = true; started = true; lastPt = null; sc.setPointerCapture(e.pointerId);
    scratchTo(pos(e)); e.preventDefault();
    hint.textContent = "Keep going…";
  });
  sc.addEventListener("pointermove", e => {
    if (!scratching || finished) return;
    scratchTo(pos(e));
    if (++moves % 10 === 0 && clearedRatio() > .5) finish(true);
  });
  const stop = () => { if (!scratching) return; scratching = false; lastPt = null; if (!finished && clearedRatio() > .5) finish(true); };
  sc.addEventListener("pointerup", stop); sc.addEventListener("pointercancel", stop);
  revealBtn.addEventListener("click", () => finish(false));

  // paint once layout + fonts are ready
  const repaint = () => { if (!started && !finished) paintFoil(); };
  (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(repaint);
  addEventListener("load", repaint);
  addEventListener("resize", repaint);
  paintFoil();

  /* ---------- countdown ---------- */
  const target = new Date(CONFIG.countdownTo).getTime();
  const els = { d: $("#cd-d"), h: $("#cd-h"), m: $("#cd-m"), s: $("#cd-s") };
  const pad = n => String(n).padStart(2, "0");
  function setVal(el, v) {
    if (el.textContent === v) return;
    el.textContent = v; el.classList.remove("tick"); void el.offsetWidth; el.classList.add("tick");
  }
  function tickClock() {
    let diff = Math.max(0, target - Date.now());
    const d = Math.floor(diff / 864e5); diff %= 864e5;
    const h = Math.floor(diff / 36e5); diff %= 36e5;
    const m = Math.floor(diff / 6e4); diff %= 6e4;
    const s = Math.floor(diff / 1e3);
    setVal(els.d, pad(d)); setVal(els.h, pad(h)); setVal(els.m, pad(m)); setVal(els.s, pad(s));
    if (target - Date.now() <= 0) { $(".count-sec .h-script").textContent = "Alhamdulillah, the day is here"; }
  }
  tickClock(); setInterval(tickClock, 1000);
})();
