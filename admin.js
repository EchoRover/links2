// linkeen admin: free text -> typed override ops -> preview -> apply.
// All text from the model or the store goes into the DOM via textContent.
(function () {
  const $ = (id) => document.getElementById(id);
  const MONTH = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const DOW = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  let thread = [];     // [{role, content}] sent to the model
  let proposed = [];
  let busy = false;
  let ollama = null;   // cached probe promise

  const store = {
    get(k, d) { try { return localStorage.getItem(k) || d; } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} },
  };

  function el(tag, cls, text) {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  function ymd(d) {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  }
  function dlabel(s) {
    const [y, m, d] = String(s).split("-").map(Number);
    if (!y) return String(s);
    return `${DOW[new Date(y, m - 1, d).getDay()]} ${d} ${MONTH[m - 1]}`;
  }
  function tlabel(s) { return s || ""; }

  // ---------- views ----------
  function show(view) {
    $("login").hidden = view !== "login";
    $("panel").hidden = view !== "panel";
    $("logout").hidden = view !== "panel";
  }
  function status(msg) {
    const s = $("status");
    s.textContent = msg || "";
    s.hidden = !msg;
  }

  // ---------- one human sentence per op: [[mark, text], ...] ----------
  function describeOp(o) {
    switch (o.type) {
      case "announce":
        return [["+", `Notice (${o.level}) until ${dlabel(o.until)}: ${o.text}`]];
      case "holiday":
        return [["+", `${dlabel(o.date)} is a holiday: ${o.label}`]];
      case "makeup":
        return [["+", `${dlabel(o.date)} runs ${DOW[o.followsWeekday]}'s timetable`]];
      case "class_move":
        return [["-", `${dlabel(o.fromDate)}, ${o.course} ${tlabel(o.fromTime)} removed`],
                ["+", `${dlabel(o.toDate)}, ${o.course} ${o.toTime}-${o.toEnd}${o.room ? " in " + o.room : ""} added`]];
      case "class_cancel":
        return [["-", `${dlabel(o.date)}, ${o.course}${o.time ? " " + o.time : ""} cancelled`]];
      case "exam":
        return [["+", `${o.course} ${o.kind} on ${dlabel(o.date)}${o.time ? " at " + o.time : ""}${o.room ? ", " + o.room : ""}${o.note ? " (" + o.note + ")" : ""}`]];
      case "deadline":
        return [["+", `${o.course} deadline ${dlabel(o.date)}: ${o.title}`]];
      case "mess_special":
        return [["+", `${dlabel(o.date)} ${o.meal} special: ${(o.items || []).join(", ")}`]];
      default:
        return [["+", JSON.stringify(o)]];
    }
  }

  function opRow(o, extra) {
    const out = [];
    describeOp(o).forEach(([mark, text], i) => {
      const li = el("li", mark === "-" ? "rm" : "add");
      li.appendChild(el("span", "adm-type", i === 0 ? o.type : ""));
      const s = el("span", "adm-sent", text);
      if (extra && i === 0) extra(s, li);
      li.appendChild(s);
      li.appendChild(el("span", "adm-mark " + (mark === "-" ? "adm-rm" : "adm-add"), mark));
      out.push(li);
    });
    return out;
  }

  // ---------- thread ----------
  function addMe(text) {
    $("thread").appendChild(el("div", "adm-me", text));
  }
  function addAI(parts, brain, asks) {
    const box = el("div", "adm-ai");
    parts.forEach((p) => box.appendChild(el("p", null, p)));
    if (asks) {
      const row = el("div", "adm-row");
      const inp = el("input");
      inp.type = "text";
      inp.placeholder = "your answer";
      const btn = el("button", "adm-btn", "Answer");
      btn.type = "button";
      const go = () => {
        const v = inp.value.trim();
        if (!v || busy) return;
        inp.disabled = true; btn.disabled = true;
        send(v);
      };
      btn.onclick = go;
      inp.addEventListener("keydown", (e) => { if (e.key === "Enter") go(); });
      row.appendChild(inp); row.appendChild(btn);
      box.appendChild(row);
      setTimeout(() => inp.focus(), 0);
    }
    if (brain) box.appendChild(el("span", "adm-brain", brain));
    $("thread").appendChild(box);
  }

  // ---------- brains ----------
  function probeOllama() {
    if (ollama) return ollama;
    ollama = (async () => {
      const ctl = new AbortController();
      const t = setTimeout(() => ctl.abort(), 1500);
      try {
        const r = await fetch("http://localhost:11434/api/tags", { signal: ctl.signal });
        return r.ok;
      } catch (e) { return false; } finally { clearTimeout(t); }
    })();
    return ollama;
  }

  async function askLocal(system, messages, model) {
    const r = await fetch("http://localhost:11434/api/chat", {
      method: "POST",
      body: JSON.stringify({
        model, stream: false, format: "json", options: { temperature: 0.1 },
        messages: [{ role: "system", content: system }].concat(messages),
      }),
    });
    if (!r.ok) throw new Error("local " + r.status);
    const data = await r.json();
    return { text: data.message.content, brain: "local · " + model };
  }

  async function askGemini(system, messages) {
    const r = await fetch("/api/admin/parse", {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ system, messages }),
    });
    if (r.status === 401) { show("login"); throw new Error("logged out"); }
    const data = await r.json().catch(() => ({}));
    if (!r.ok || !data.ok) throw new Error(data.error || "gemini " + r.status);
    return { text: data.text, brain: String(data.brain || "gemini").replace(/^gemini:(gemini-)?/, "gemini · ") };
  }

  function buildSystem() {
    const now = new Date();
    return LINKEEN_PROMPT.build({
      today: ymd(now),
      weekday: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][now.getDay()],
      courses: COURSES,
      week: WEEK,
      term: typeof TERM !== "undefined" ? TERM : null,
    });
  }

  function parseReply(text) {
    const r = JSON.parse(text);
    if (!r || typeof r !== "object") throw new Error("not an object");
    if (r.status === "ask" && Array.isArray(r.questions) && r.questions.length) return r;
    if (r.status === "ok" && Array.isArray(r.ops) && r.ops.length) return r;
    throw new Error("unexpected reply");
  }

  async function send(text) {
    if (busy) return;
    busy = true;
    $("send").disabled = true;
    status("");
    $("preview").hidden = true;
    proposed = [];
    thread.push({ role: "user", content: text });
    addMe(text);

    try {
      const system = buildSystem();
      const pref = $("brain").value;
      const model = $("model").value.trim() || "qwen2.5:3b";
      let reply = null, brain = "";

      // Gemini first: the 3b local model misreads dates. Local is the
      // fallback when Gemini is down or over quota, or when picked outright.
      const tryLocal = async () => {
        const r = await askLocal(system, thread, model);
        return [parseReply(r.text), r.brain];
      };
      const tryGemini = async () => {
        const r = await askGemini(system, thread);
        return [parseReply(r.text), r.brain];
      };
      if (pref === "local") {
        try { [reply, brain] = await tryLocal(); } catch (e) { [reply, brain] = await tryGemini(); }
      } else {
        try { [reply, brain] = await tryGemini(); }
        catch (e) {
          if (e.message === "logged out" || pref === "gemini" || !(await probeOllama())) throw e;
          [reply, brain] = await tryLocal();
        }
      }
      handle(reply, brain);
    } catch (e) {
      if (e.message !== "logged out") addAI(["Could not get a usable answer: " + e.message], "", false);
    } finally {
      busy = false;
      $("send").disabled = false;
    }
  }

  function handle(reply, brain) {
    thread.push({ role: "assistant", content: JSON.stringify(reply) });
    if (reply.status === "ask") {
      addAI(reply.questions.map(String), brain, true);
      return;
    }
    proposed = reply.ops;
    addAI([String(reply.summary || "Here is what I would change.")], brain, false);
    const list = $("preview-list");
    list.textContent = "";
    $("summary").textContent = String(reply.summary || "");
    proposed.forEach((o) => opRow(o).forEach((li) => list.appendChild(li)));
    $("preview").hidden = false;
  }

  // ---------- live ops ----------
  async function loadLive() {
    const list = $("live");
    try {
      const r = await fetch("/api/admin/ops", { credentials: "same-origin", cache: "no-store" });
      if (r.status === 401) { show("login"); return false; }
      const data = await r.json();
      if (!data.ok) { status(data.error || "could not load"); return true; }
      list.textContent = "";
      if (!data.ops.length) list.appendChild(el("li", "adm-quiet", "nothing live"));
      data.ops.forEach((o) => {
        opRow(o, (s) => {
          if (o.sourceText) s.appendChild(el("small", null, `"${o.sourceText}" · until ${dlabel(o.expires)}`));
        }).forEach((li, i) => {
          if (i === 0) {
            const b = el("button", "adm-btn", "undo");
            b.type = "button";
            b.onclick = () => undo(o.id);
            li.appendChild(b);
          }
          list.appendChild(li);
        });
      });
      return true;
    } catch (e) {
      status("could not reach the server");
      return true;
    }
  }

  async function apply() {
    if (!proposed.length) return;
    $("apply").disabled = true;
    try {
      const src = (thread.find((m) => m.role === "user") || {}).content || "";
      const r = await fetch("/api/admin/ops", {
        method: "POST", credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ops: proposed, sourceText: src }),
      });
      if (r.status === 401) { show("login"); return; }
      const data = await r.json().catch(() => ({}));
      if (!r.ok || !data.ok) { status("Not applied: " + (data.error || r.status)); return; }
      reset();
      status("");
      await loadLive();
    } finally { $("apply").disabled = false; }
  }

  async function undo(id) {
    try {
      const r = await fetch("/api/admin/ops?id=" + encodeURIComponent(id), { method: "DELETE", credentials: "same-origin" });
      if (r.status === 401) { show("login"); return; }
    } catch (e) { status("could not reach the server"); return; }
    loadLive();
  }

  function reset() {
    thread = []; proposed = [];
    $("thread").textContent = "";
    $("preview").hidden = true;
    $("note").value = "";
  }

  // ---------- login ----------
  async function login(pw) {
    const err = $("login-err");
    err.hidden = true;
    try {
      const r = await fetch("/api/admin/login", {
        method: "POST", credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: pw }),
      });
      const data = await r.json().catch(() => ({}));
      if (r.ok && data.ok) { $("pw").value = ""; await boot(); return; }
      err.textContent = r.status === 429 ? "Too many tries. Wait a few minutes." : (data.error || "Wrong password.");
    } catch (e) { err.textContent = "Could not reach the server."; }
    err.hidden = false;
  }

  async function logout() {
    try {
      await fetch("/api/admin/login", {
        method: "POST", credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ logout: true }),
      });
    } catch (e) {}
    reset();
    show("login");
  }

  async function boot() {
    show("panel");
    const ok = await loadLive();
    if (ok) probeOllama();
  }

  // ---------- wiring ----------
  function syncModel() { $("model-wrap").hidden = $("brain").value !== "local"; }

  function init() {
    $("brain").value = store.get("linkeen:admin:brain", "auto");
    $("model").value = store.get("linkeen:admin:model", "qwen2.5:3b");
    syncModel();
    $("brain").addEventListener("change", () => { store.set("linkeen:admin:brain", $("brain").value); syncModel(); });
    $("model").addEventListener("change", () => store.set("linkeen:admin:model", $("model").value.trim()));

    const go = () => {
      const v = $("note").value.trim();
      if (!v || busy) return;
      $("note").value = "";
      // a fresh note starts a fresh conversation
      thread = []; proposed = [];
      $("thread").textContent = "";
      send(v);
    };
    $("send").onclick = go;
    $("note").addEventListener("keydown", (e) => {
      if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) { e.preventDefault(); go(); }
    });
    $("apply").onclick = apply;
    $("discard").onclick = reset;
    $("logout").onclick = logout;
    $("login-form").addEventListener("submit", (e) => { e.preventDefault(); login($("pw").value); });

    boot();
  }

  init();
})();
