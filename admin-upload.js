// admin-upload.js: add files to notes/<COURSE>/ straight from /admin.
// Commits to EchoRover/links2 main through the GitHub Git Data API with a
// fine-grained token (Contents: read & write on links2 only) that lives in
// this browser's localStorage and is sent nowhere but api.github.com.
// The push then triggers .github/workflows/notes-index.yml, which rebuilds
// notes/index.json, notes/files.json and the offline list, and Vercel deploys.
(function () {
  const REPO = "EchoRover/links2";
  const KEY = "linkeen:gh-token";
  const $ = (id) => document.getElementById(id);
  const get = () => { try { return localStorage.getItem(KEY) || ""; } catch (e) { return ""; } };
  const say = (msg, bad) => { const s = $("up-status"); s.textContent = msg; s.className = bad ? "adm-err" : "adm-ok"; s.hidden = !msg; };

  const sel = $("up-course");
  if (!sel) return;
  // COURSES is a top-level const in timetable.js: shared global scope, not a window property.
  Object.keys(typeof COURSES !== "undefined" ? COURSES : {}).forEach((c) => sel.add(new Option(c, c)));

  function paintToken() {
    const has = !!get();
    $("up-token-row").hidden = has;
    $("up-token-set").hidden = !has;
  }
  $("up-token-save").onclick = () => {
    const t = $("up-token").value.trim();
    if (!/^(github_pat_|ghp_)\w{20,}$/.test(t)) { say("That doesn't look like a GitHub token.", true); return; }
    try { localStorage.setItem(KEY, t); } catch (e) { say("This browser won't store it.", true); return; }
    $("up-token").value = ""; say(""); paintToken();
  };
  $("up-token-forget").onclick = () => { try { localStorage.removeItem(KEY); } catch (e) {} paintToken(); };

  const slug = (name) => {
    const dot = name.lastIndexOf(".");
    const stem = dot > 0 ? name.slice(0, dot) : name, ext = dot > 0 ? name.slice(dot + 1).toLowerCase() : "";
    return stem.replace(/[^A-Za-z0-9]+/g, "-").replace(/^-|-$/g, "") + (ext ? "." + ext : "");
  };
  function b64(buf) {
    let s = ""; const b = new Uint8Array(buf);
    for (let i = 0; i < b.length; i += 0x8000) s += String.fromCharCode.apply(null, b.subarray(i, i + 0x8000));
    return btoa(s);
  }
  async function gh(path, opts = {}) {
    const r = await fetch("https://api.github.com/repos/" + REPO + path, {
      ...opts,
      headers: { Authorization: "Bearer " + get(), Accept: "application/vnd.github+json", "Content-Type": "application/json" },
    });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(r.status === 401 ? "token rejected (expired or wrong)" : (j.message || r.status));
    return j;
  }

  $("up-go").onclick = async () => {
    const files = [...$("up-file").files];
    if (!get()) { say("Add a GitHub token first.", true); return; }
    if (!files.length) { say("Pick a file.", true); return; }
    if (files.some((f) => f.size > 50e6)) { say("Keep files under 50 MB.", true); return; }
    const course = sel.value;
    $("up-go").disabled = true;
    try {
      say("Reading files…");
      const entries = [];
      for (const f of files) {
        const name = files.length === 1 && $("up-name").value.trim() ? slug($("up-name").value.trim()) + (/\.[a-z0-9]+$/i.test($("up-name").value) ? "" : "." + f.name.split(".").pop().toLowerCase()) : slug(f.name);
        say(`Uploading ${f.name}…`);
        const blob = await gh("/git/blobs", { method: "POST", body: JSON.stringify({ content: b64(await f.arrayBuffer()), encoding: "base64" }) });
        entries.push({ path: `notes/${course}/${name}`, mode: "100644", type: "blob", sha: blob.sha });
      }
      say("Committing…");
      const ref = await gh("/git/ref/heads/main");
      const head = await gh("/git/commits/" + ref.object.sha);
      const tree = await gh("/git/trees", { method: "POST", body: JSON.stringify({ base_tree: head.tree.sha, tree: entries }) });
      const commit = await gh("/git/commits", { method: "POST", body: JSON.stringify({
        message: `Add ${entries.map((e) => e.path.split("/").pop()).join(", ")} to ${course} notes (admin upload)`,
        tree: tree.sha, parents: [ref.object.sha] }) });
      await gh("/git/refs/heads/main", { method: "PATCH", body: JSON.stringify({ sha: commit.sha }) });
      $("up-file").value = ""; $("up-name").value = "";
      say(`Added to ${course}. Live on /files in about 2 minutes, once the index rebuilds and Vercel deploys.`);
    } catch (e) {
      say("Upload failed: " + e.message, true);
    } finally { $("up-go").disabled = false; }
  };
  paintToken();
})();
