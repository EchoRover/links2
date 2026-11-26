// ============================================================
// nd-game.js — Fireworks Rush (National Day mini game).
// Loaded on demand by national-day.js. window.ndGame.open() shows it.
// Rockets rise over the Dubai skyline; tap each one near its peak to
// burst it. Every point lights the Burj Khalifa a little higher. Light
// it fully (TARGET points) before the 45 s run out to win. A rocket that
// falls off the screen unburst costs one of 5 lives.
// ============================================================

(function () {
  if (window.ndGame) return;
  const COLORS = ["#ff2d4a", "#00b856", "#ffffff", "#ffd34d"];
  const ROUND = 45, LIVES = 5, TARGET = 50, BEST_KEY = "linkeen:nd-best";

  const css = `
    .ndg { position: fixed; inset: 0; z-index: 9999; background: #05070d; color: #fff;
      font-family: Inter, system-ui, sans-serif; touch-action: none; user-select: none; -webkit-user-select: none; }
    .ndg canvas { position: absolute; inset: 0; width: 100%; height: 100%; display: block; }
    .ndg-hud { position: absolute; inset: 0 0 auto 0; display: flex; gap: 14px; align-items: center;
      padding: 14px 60px 14px 18px; font-weight: 700; font-size: 15px; pointer-events: none; font-variant-numeric: tabular-nums; }
    .ndg-hud .ndg-goal { flex: 1; max-width: 260px; height: 10px; border-radius: 99px; background: rgba(255,255,255,.12); overflow: hidden; }
    .ndg-hud .ndg-goal i { display: block; height: 100%; width: 0; border-radius: inherit;
      background: linear-gradient(90deg, #ffd34d, #fff); transition: width .2s; }
    .ndg-hud .ndg-lives { color: #ff2d4a; letter-spacing: 2px; }
    .ndg-hud .ndg-combo { color: #ffd34d; }
    .ndg-x { position: absolute; top: 10px; right: 12px; width: 36px; height: 36px; border-radius: 50%; border: 0;
      background: rgba(255,255,255,.12); color: #fff; font-size: 20px; cursor: pointer; z-index: 2; }
    .ndg-card { position: absolute; inset: 0; display: grid; place-items: center; text-align: center; padding: 24px; z-index: 1;
      background: radial-gradient(closest-side, rgba(5,7,13,.75), transparent); }
    .ndg-card > div { max-width: 360px; }
    .ndg-card h2 { margin: 0 0 6px; font-size: 34px; font-weight: 800; letter-spacing: -.02em;
      background: linear-gradient(90deg, #ff2d4a, #fff 45%, #00b856); -webkit-background-clip: text; background-clip: text; color: transparent; }
    .ndg-card p { margin: 6px 0; color: #d5dce6; font-size: 15px; line-height: 1.45; }
    .ndg-card .ndg-big { font-size: 52px; font-weight: 800; color: #fff; margin: 4px 0; }
    .ndg-btn { margin-top: 16px; padding: 12px 28px; border-radius: 999px; border: 0; font: 700 16px Inter, sans-serif;
      color: #05070d; background: linear-gradient(90deg, #00b856, #7dffb0); cursor: pointer; box-shadow: 0 6px 24px rgba(0,184,86,.4); }
    .ndg-btn.ghost { background: rgba(255,255,255,.12); color: #fff; box-shadow: none; margin-left: 8px; }
  `;

  let root, cv, ctx, hud, card, W, H, G, dpr, raf, state, city;

  function build() {
    const st = document.createElement("style"); st.textContent = css; document.head.appendChild(st);
    root = document.createElement("div"); root.className = "ndg"; root.setAttribute("role", "dialog"); root.setAttribute("aria-label", "Fireworks Rush");
    root.innerHTML = `<canvas></canvas>
      <div class="ndg-hud"><span class="ndg-score"></span><span class="ndg-goal" title="Burj Khalifa lit"><i></i></span><span class="ndg-combo"></span><span class="ndg-lives"></span><span class="ndg-time"></span></div>
      <button class="ndg-x" aria-label="Close">×</button><div class="ndg-card"></div>`;
    cv = root.querySelector("canvas"); ctx = cv.getContext("2d");
    const $ = (s) => root.querySelector(s);
    hud = { score: $(".ndg-score"), goal: $(".ndg-goal i"), combo: $(".ndg-combo"), lives: $(".ndg-lives"), time: $(".ndg-time") };
    card = $(".ndg-card");
    $(".ndg-x").onclick = close;
    cv.addEventListener("pointerdown", tap);
    window.addEventListener("resize", size);
    document.addEventListener("keydown", (e) => { if (e.key === "Escape" && root.isConnected) close(); });
  }

  function size() {
    if (!cv) return;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = innerWidth; H = innerHeight; G = H - Math.max(46, H * .09);   // G = waterline
    cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    city = makeCity();
  }

  // ---------- Dubai skyline ----------
  function burjPath(cx, base, h, w) {
    // stepped setbacks that taper into a long spire
    const tiers = [[1, .08], [.8, .24], [.7, .43], [.57, .54], [.46, .64], [.36, .72], [.27, .79], [.19, .85], [.12, .9]];
    const p = new Path2D(); p.moveTo(cx - w / 2, base);
    let y = base;
    for (const [fw, fh] of tiers) { const x = cx - (w * fw) / 2; p.lineTo(x, y); y = base - h * fh; p.lineTo(x, y); }
    p.lineTo(cx - w * .025, y); p.lineTo(cx, base - h); p.lineTo(cx + w * .025, y);
    for (let i = tiers.length - 1; i >= 0; i--) {
      const [fw, fh] = tiers[i], x = cx + (w * fw) / 2;
      p.lineTo(x, base - h * fh); p.lineTo(x, i ? base - h * tiers[i - 1][1] : base);
    }
    p.closePath(); return p;
  }
  function sailPath(x, base, h, w) {           // Burj Al Arab
    const p = new Path2D();
    p.moveTo(x, base); p.lineTo(x, base - h * 1.08); p.lineTo(x + 3, base - h * 1.08); p.lineTo(x + 3, base - h);
    p.quadraticCurveTo(x + w * 1.25, base - h * .55, x + w, base); p.closePath(); return p;
  }
  function makeCity() {
    const bw = Math.min(92, Math.max(56, W * .085)), bh = Math.min(G * .78, 620);
    const burj = { cx: W * .5, w: bw, h: bh, path: burjPath(W * .5, G, bh, bw) };
    const sail = { path: sailPath(W * .8, G, Math.min(G * .3, 230), Math.min(70, W * .07)) };
    const twins = [W * .22, W * .22 + 34].map((x, i) => ({ x, w: 26, h: G * (i ? .3 : .34) }));
    const towers = []; let x = -10;
    while (x < W + 10) {
      const w = 16 + Math.random() * 40, h = 30 + Math.random() * Math.min(150, G * .2);
      const busy = Math.abs(x + w / 2 - burj.cx) < bw * .6 || (x > twins[0].x - 4 && x < twins[1].x + 30);
      if (!busy) towers.push({ x, w, h, lit: Array.from({ length: 12 }, () => Math.random()) });
      x += w + 2;
    }
    return { burj, sail, twins, towers };
  }

  const best = () => +(localStorage.getItem(BEST_KEY) || 0);
  const progress = () => Math.min(1, state.score / TARGET);
  function showCard(html) { card.innerHTML = `<div>${html}</div>`; card.style.display = "grid"; }

  function intro() {
    showCard(`<h2>Fireworks Rush</h2>
      <p>Light up the Burj Khalifa for National Day.</p>
      <p>Tap each rocket at the top of its climb. Every point lights the tower higher. Reach the top in 45 seconds to win.</p>
      <p><b style="color:#ffd34d">Gold</b> +10 and slow motion · <b style="color:#7fd0ff">Blue</b> splits into 3 · <b style="color:#9aa0ab">Grey</b> is a dud, don't tap it</p>
      <p style="opacity:.75">5 lives. A rocket that falls off the screen costs one.</p>
      ${best() ? `<p style="opacity:.75">Best: ${best()}</p>` : ""}
      <button class="ndg-btn">Start</button>`);
    card.querySelector(".ndg-btn").onclick = start;
  }

  function fresh(over) {
    return { t: 0, left: ROUND, score: 0, combo: 0, lives: LIVES, rockets: [], sparks: [], pops: [], spawn: .8, over, won: false, fin: 0, slow: 0, banner: null, last: performance.now() };
  }

  function start() {
    card.style.display = "none";
    state = fresh(false);
    cancelAnimationFrame(raf); raf = requestAnimationFrame(loop);
  }

  function end(won) {
    state.over = true; state.won = won; state.rockets = [];
    const b = best(), nb = state.score > b;
    if (nb) try { localStorage.setItem(BEST_KEY, state.score); } catch (e) {}
    const pct = Math.round(progress() * 100);
    const show = () => {
      showCard(won
        ? `<h2>Burj lit up!</h2><div class="ndg-big" style="font-size:30px">Happy National Day</div>
           <p>Done in ${Math.ceil(state.t)} s with ${state.lives} ${state.lives === 1 ? "life" : "lives"} left. Score ${state.score}${nb ? " (new best)" : ""}.</p>`
        : `<h2>${state.lives <= 0 ? "Out of lives" : "Time's up"}</h2><div class="ndg-big">${pct}%</div>
           <p>of the Burj lit. Score ${state.score}${nb ? " (new best)" : ""}. Reach the top to win.</p>`) +
        `<button class="ndg-btn">Again</button><button class="ndg-btn ghost">Close</button>`;
      card.querySelector(".ndg-btn").onclick = start;
      card.querySelector(".ghost").onclick = close;
    };
    if (won) { state.fin = 3.2; setTimeout(show, 2200); } else show();
  }

  function spawnRocket() {
    const peakY = G * (.1 + Math.random() * .32);
    const g = 300 + state.t * 3;
    const roll = Math.random();
    const type = state.t > 6 && roll < .09 ? "dud" : roll < .19 ? "gold" : roll < .31 ? "cluster" : "norm";
    const c = { dud: "#6b7180", gold: "#ffd34d", cluster: "#7fd0ff" }[type] || COLORS[Math.floor(Math.random() * 3)];
    state.rockets.push({ x: W * (.08 + Math.random() * .84), y: G, vx: (Math.random() - .5) * 40,
      vy: -Math.sqrt(2 * g * (G - peakY)) * (type === "gold" ? 1.08 : 1), g, c, type, trail: [] });
  }
  function children(x, y) {
    for (const vx of [-90, 0, 90]) {
      const g = 300 + state.t * 3, up = 110 + Math.random() * 110;
      state.rockets.push({ x, y, vx, vy: -Math.sqrt(2 * g * up), g, c: COLORS[Math.floor(Math.random() * 3)], type: "norm", small: true, trail: [] });
    }
  }

  function burst(x, y, big) {
    const n = big ? 80 : 45;
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2, s = (big ? 170 : 115) * (.4 + Math.random());
      state.sparks.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: 1, c: COLORS[i % (big ? 4 : 3)] });
    }
  }

  function tap(e) {
    if (!state || state.over) return;
    const x = e.clientX, y = e.clientY;
    let hit = null, hd = 1e9;
    for (const r of state.rockets) { const d = Math.hypot(r.x - x, r.y - y); if (d < 80 && d < hd) { hit = r; hd = d; } }
    if (!hit) return;
    state.rockets.splice(state.rockets.indexOf(hit), 1);
    if (hit.type === "dud") {
      state.lives--; state.combo = 0;
      for (let i = 0; i < 25; i++) { const a = Math.random() * 6.283; state.sparks.push({ x: hit.x, y: hit.y, vx: Math.cos(a) * 60, vy: Math.sin(a) * 60, life: .7, c: "#6b7180" }); }
      state.pops.push({ x: hit.x, y: hit.y, txt: "DUD -1 ♥", life: 1, c: "#ff2d4a" });
      if (navigator.vibrate) navigator.vibrate(60);
      if (state.lives <= 0) { state.lives = 0; end(false); }
      return;
    }
    const before = progress();
    const perfect = Math.abs(hit.vy) < 200;
    state.combo++;
    const mult = 1 + Math.floor(state.combo / 4);
    const pts = (hit.type === "gold" ? 10 : perfect ? 3 : 1) * mult;
    state.score += pts;
    burst(hit.x, hit.y, perfect || hit.type === "gold");
    let label = (perfect ? "PERFECT " : "") + "+" + pts;
    if (hit.type === "gold") { state.slow = 2.5; label = "GOLD +" + pts + " · SLOW-MO"; }
    if (hit.type === "cluster") { children(hit.x, hit.y); label = "SPLIT! +" + pts; }
    state.pops.push({ x: hit.x, y: hit.y, txt: label, life: 1, c: hit.type === "gold" || perfect ? "#ffd34d" : "#fff" });
    const m = [[.25, "Quarter lit"], [.5, "Halfway up the Burj"], [.75, "Almost at the top"]].find(([v]) => before < v && progress() >= v);
    if (m && progress() < 1) state.banner = { txt: m[1], life: 1.6 };
    if (perfect && navigator.vibrate) navigator.vibrate(12);
    if (state.score >= TARGET) end(true);
  }

  function loop(now) {
    const dt = Math.min(.05, (now - state.last) / 1000); state.last = now;
    if (!state.over) {
      state.t += dt; state.left = Math.max(0, ROUND - state.t);
      state.spawn -= dt;
      if (state.spawn <= 0) { spawnRocket(); state.spawn = Math.max(.7, 1.6 - state.t * .018) * (.7 + Math.random() * .6); }
      state.slow = Math.max(0, state.slow - dt);
      const pdt = state.slow > 0 ? dt * .45 : dt;
      for (const r of state.rockets) {
        r.vy += r.g * pdt; r.x += r.vx * pdt; r.y += r.vy * pdt;
        r.trail.push([r.x, r.y]); if (r.trail.length > 10) r.trail.shift();
      }
      const gone = state.rockets.filter((r) => r.vy > 0 && r.y > H + 10);
      state.rockets = state.rockets.filter((r) => !(r.type === "dud" && gone.includes(r)));
      const fell = gone.filter((r) => r.type !== "dud");
      if (fell.length) {
        state.rockets = state.rockets.filter((r) => !fell.includes(r));
        state.lives -= fell.length; state.combo = 0;
        if (navigator.vibrate) navigator.vibrate(40);
      }
      if (state.lives <= 0) { state.lives = 0; end(false); }
      else if (state.left <= 0) end(false);
    }
    if (state.fin > 0) {                                   // victory finale
      state.fin -= dt;
      if (Math.random() < dt * 9) burst(W * (.1 + Math.random() * .8), G * (.08 + Math.random() * .4), true);
    }
    for (const s of state.sparks) { s.vy += 90 * dt; s.vx *= .985; s.x += s.vx * dt; s.y += s.vy * dt; s.life -= dt * .9; }
    state.sparks = state.sparks.filter((s) => s.life > 0);
    for (const p of state.pops) { p.y -= 40 * dt; p.life -= dt * 1.2; }
    state.pops = state.pops.filter((p) => p.life > 0);
    if (state.banner && (state.banner.life -= dt) <= 0) state.banner = null;
    draw(now / 1000);
    hud.score.textContent = state.score;
    hud.goal.style.width = progress() * 100 + "%";
    hud.combo.textContent = state.combo >= 4 ? `x${1 + Math.floor(state.combo / 4)}` : "";
    hud.lives.textContent = "♥".repeat(state.lives);
    hud.time.textContent = Math.ceil(state.left) + "s";
    if (!state.over || state.sparks.length || state.fin > 0) raf = requestAnimationFrame(loop);
  }

  function draw(t) {
    const sky = ctx.createLinearGradient(0, 0, 0, G);
    sky.addColorStop(0, "#04060d"); sky.addColorStop(.65, "#0e1530"); sky.addColorStop(1, "#2a1d3d");
    ctx.fillStyle = sky; ctx.fillRect(0, 0, W, G);

    // sparks behind the city
    ctx.globalCompositeOperation = "lighter";
    for (const s of state.sparks) { ctx.globalAlpha = Math.max(0, s.life); ctx.fillStyle = s.c; ctx.fillRect(s.x - 1.5, s.y - 1.5, 3, 3); }
    ctx.globalCompositeOperation = "source-over"; ctx.globalAlpha = 1;

    const { burj, sail, twins, towers } = city;
    ctx.fillStyle = "#03040a";
    for (const b of towers) {
      ctx.fillRect(b.x, G - b.h, b.w, b.h);
    }
    ctx.fillStyle = "rgba(255,211,77,.45)";
    for (const b of towers) b.lit.forEach((v, i) => { if (v > .72) ctx.fillRect(b.x + 4 + (i % 3) * (b.w - 10) / 3, G - b.h + 10 + Math.floor(i / 3) * 14, 3, 5); });
    // Emirates-style twin towers with sloped tops
    ctx.fillStyle = "#03040a";
    for (const tw of twins) {
      ctx.beginPath(); ctx.moveTo(tw.x, G); ctx.lineTo(tw.x, G - tw.h); ctx.lineTo(tw.x + tw.w, G - tw.h - tw.w * 1.3); ctx.lineTo(tw.x + tw.w, G); ctx.fill();
    }
    // sail hotel
    ctx.fill(sail.path);
    ctx.strokeStyle = "rgba(255,255,255,.18)"; ctx.lineWidth = 1; ctx.stroke(sail.path);

    // Burj Khalifa: dark body, lit from the ground up by your score
    const p = progress();
    ctx.fillStyle = "#05070f"; ctx.fill(burj.path);
    ctx.save(); ctx.clip(burj.path);
    const top = G - burj.h * p;
    const lg = ctx.createLinearGradient(0, G, 0, G - burj.h);
    if (state.won) { const k = (t * 2) % 1; lg.addColorStop(0, "#00b856"); lg.addColorStop(.33 + k * .1, "#ffffff"); lg.addColorStop(.66, "#ff2d4a"); lg.addColorStop(1, "#ffd34d"); }
    else { lg.addColorStop(0, "#ffb020"); lg.addColorStop(.6, "#ffe08a"); lg.addColorStop(1, "#ffffff"); }
    ctx.fillStyle = lg; ctx.fillRect(burj.cx - burj.w, top, burj.w * 2, G - top);
    if (p > 0 && p < 1) { ctx.fillStyle = "rgba(255,255,255,.9)"; ctx.fillRect(burj.cx - burj.w, top - 2, burj.w * 2, 2); }
    ctx.restore();
    ctx.strokeStyle = p > 0 ? "rgba(255,224,138,.5)" : "rgba(255,255,255,.15)"; ctx.lineWidth = 1; ctx.stroke(burj.path);
    if (p > 0) { ctx.save(); ctx.shadowColor = "#ffd34d"; ctx.shadowBlur = 18 * p; ctx.strokeStyle = "rgba(255,211,77,.35)"; ctx.stroke(burj.path); ctx.restore(); }

    // rockets
    for (const r of state.rockets) {
      ctx.strokeStyle = r.c; ctx.lineWidth = 2; ctx.beginPath();
      r.trail.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.stroke();
      const near = Math.abs(r.vy) < 200 && r.type !== "dud";
      const rad = (r.small ? .7 : 1) * (r.type === "gold" ? 1.3 : 1);
      ctx.fillStyle = near ? "#ffd34d" : r.c; ctx.beginPath(); ctx.arc(r.x, r.y, (near ? 9 : 6) * rad, 0, 7); ctx.fill();
      if (near || r.type === "gold") { ctx.globalAlpha = .35; ctx.fillStyle = r.type === "gold" ? "#ffd34d" : ctx.fillStyle; ctx.beginPath(); ctx.arc(r.x, r.y, 22 * rad, 0, 7); ctx.fill(); ctx.globalAlpha = 1; }
      if (r.type === "cluster") { ctx.fillStyle = "#7fd0ff"; for (let k = 0; k < 3; k++) { const a = t * 4 + k * 2.094; ctx.beginPath(); ctx.arc(r.x + Math.cos(a) * 13, r.y + Math.sin(a) * 13, 2.5, 0, 7); ctx.fill(); } }
      if (r.type === "dud") { ctx.strokeStyle = "#ff2d4a"; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(r.x - 4, r.y - 4); ctx.lineTo(r.x + 4, r.y + 4); ctx.moveTo(r.x + 4, r.y - 4); ctx.lineTo(r.x - 4, r.y + 4); ctx.stroke(); }
    }

    // water with a soft reflection of the lit tower
    const wg = ctx.createLinearGradient(0, G, 0, H);
    wg.addColorStop(0, "#0a1024"); wg.addColorStop(1, "#04060d");
    ctx.fillStyle = wg; ctx.fillRect(0, G, W, H - G);
    if (p > 0) {
      ctx.globalAlpha = .35 * p; ctx.fillStyle = state.won ? "#ffffff" : "#ffd34d";
      for (let i = 0; i < 6; i++) { const y = G + 6 + i * 6, w = burj.w * (.5 - i * .06) * (1 + .15 * Math.sin(t * 3 + i)); ctx.fillRect(burj.cx - w / 2, y, w, 2); }
      ctx.globalAlpha = 1;
    }
    // flag band
    const fb = 4; ctx.fillStyle = "#00b856"; ctx.fillRect(0, H - fb * 3, W, fb);
    ctx.fillStyle = "#fff"; ctx.fillRect(0, H - fb * 2, W, fb); ctx.fillStyle = "#000"; ctx.fillRect(0, H - fb, W, fb);
    ctx.fillStyle = "#ff2d4a"; ctx.fillRect(0, H - fb * 3, 50, fb * 3);

    if (state.slow > 0) { ctx.fillStyle = "rgba(255,211,77,.07)"; ctx.fillRect(0, 0, W, H); }
    if (state.banner) {
      ctx.globalAlpha = Math.min(1, state.banner.life); ctx.textAlign = "center"; ctx.font = "800 26px Inter, sans-serif";
      ctx.fillStyle = "#ffd34d"; ctx.fillText(state.banner.txt, W / 2, G * .5); ctx.globalAlpha = 1;
    }
    ctx.textAlign = "center"; ctx.font = "800 16px Inter, sans-serif";
    for (const q of state.pops) { ctx.globalAlpha = Math.max(0, q.life); ctx.fillStyle = q.c; ctx.fillText(q.txt, q.x, q.y - 14); }
    ctx.globalAlpha = 1;
  }

  function open() {
    if (!root) build();
    document.body.appendChild(root); document.body.style.overflow = "hidden";
    size();
    state = fresh(true);
    draw(0);
    for (const k of ["score", "combo", "lives", "time"]) hud[k].textContent = "";
    hud.goal.style.width = "0";
    intro();
  }

  function close() {
    cancelAnimationFrame(raf); if (state) { state.over = true; state.fin = 0; }
    root.remove(); document.body.style.overflow = "";
  }

  window.ndGame = { open };
})();
