// ============================================================
// overrides.js — live corrections patched over the static data.
//
// Loaded synchronously BEFORE the scripts that own the data. Each of those
// calls LINKEEN.layer(theirObject, pick) right after declaring it; the layer
// applies the current overrides immediately and again whenever fresh ones
// arrive, then `linkeen:overrides` fires so the page can re-render.
//
// Ops are written from /admin and served by /api/overrides. The last good
// copy is cached in localStorage so the site still works offline.
// ============================================================
(function () {
  const KEY = "linkeen:ov";
  const layers = [];
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

  function todayYmd() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  }

  function load() {
    try {
      const v = JSON.parse(localStorage.getItem(KEY) || "null");
      if (v && Array.isArray(v.ops)) return v;
    } catch (e) {}
    return { rev: "", ops: [] };
  }
  function save(v) { try { localStorage.setItem(KEY, JSON.stringify(v)); } catch (e) {} }

  function cap(s) { return s ? s[0].toUpperCase() + s.slice(1) : s; }

  function derive(ops) {
    const out = { noClass: {}, follows: {}, updates: [], announce: [], tweaks: {}, mess: {} };
    const tw = (d) => out.tweaks[d] || (out.tweaks[d] = { cancel: [], add: [] });
    for (const o of ops) {
      try {
        switch (o.type) {
          case "holiday": out.noClass[o.date] = o.label; break;
          case "makeup": out.follows[o.date] = o.followsWeekday; break;
          case "exam": {
            const bits = [cap(esc(o.kind)) + (o.time ? " · " + esc(o.time) : ""), o.room ? esc(o.room) : "", o.note ? esc(o.note) : ""];
            out.updates.push(["quizzes", `${esc(o.course)}: ${bits.filter(Boolean).join(" · ")}`, o.date]);
            break;
          }
          case "deadline":
            out.updates.push(["assignments", `${esc(o.course)}: ${esc(o.title)}`, o.date]);
            break;
          case "announce":
            out.announce.push({ id: "ov-" + o.id, text: o.text, level: o.level || "info",
                                from: o.from, until: o.until, link: o.link, linkText: o.link ? "Open" : undefined });
            break;
          case "class_move":
            tw(o.fromDate).cancel.push({ course: o.course, time: o.fromTime });
            tw(o.toDate).add.push({ course: o.course, s: o.toTime, e: o.toEnd, room: o.room || "" });
            break;
          case "class_cancel":
            tw(o.date).cancel.push({ course: o.course, time: o.time || "" });
            break;
          case "mess_special": out.mess[o.date + "|" + o.meal] = o.items; break;
        }
      } catch (e) {}
    }
    return out;
  }

  let state = load();
  let derived;
  function recompute() {
    const t = todayYmd();
    state.ops = state.ops.filter((o) => !o.expires || o.expires >= t);
    derived = derive(state.ops);
  }
  recompute();

  function apply(l) {
    try {
      const extra = l.pick(derived) || (Array.isArray(l.base) ? [] : {});
      if (Array.isArray(l.target)) {
        l.target.length = 0;
        l.base.forEach((x) => l.target.push(x));
        extra.forEach((x) => l.target.push(x));
      } else {
        Object.keys(l.target).forEach((k) => delete l.target[k]);
        Object.assign(l.target, l.base, extra);
      }
    } catch (e) {}
  }

  const L = {
    get ops() { return state.ops; },
    get rev() { return state.rev; },
    layer(target, pick) {
      try {
        const l = { target, pick, base: Array.isArray(target) ? target.slice() : Object.assign({}, target) };
        layers.push(l);
        apply(l);
      } catch (e) {}
    },
    tweaks(dateKey) { return derived.tweaks[dateKey] || null; },
    announcements() { return derived.announce; },
    messSpecial(date, meal) {
      try {
        if (!date) return null;
        const k = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
        return derived.mess[k + "|" + meal] || null;
      } catch (e) { return null; }
    },
    async refresh() {
      try {
        const ctl = new AbortController();
        const timer = setTimeout(() => ctl.abort(), 4000);
        const r = await fetch("/api/overrides", { cache: "no-cache", signal: ctl.signal });
        clearTimeout(timer);
        if (!r.ok) return;
        const data = await r.json();
        if (!data || !data.ok || !Array.isArray(data.ops)) return;
        const rev = data.rev || "";
        if (rev === state.rev) return;
        state = { rev, ops: data.ops };
        save(state);
        recompute();
        layers.forEach(apply);
        window.dispatchEvent(new Event("linkeen:overrides"));
      } catch (e) {}
    },
  };
  window.LINKEEN = L;

  document.addEventListener("DOMContentLoaded", () => L.refresh());
  setInterval(() => L.refresh(), 5 * 60 * 1000);
  document.addEventListener("visibilitychange", () => { if (!document.hidden) L.refresh(); });
})();
