// ============================================================
// bus-locate.js — "where am I, where am I going" for the shuttle.
//
// Finds the nearest stop from the phone's location and picks a sensible
// destination: from a dorm you're going to campus; from campus you're going
// home, to whichever dorm you're usually found at. A destination picked by
// hand is remembered per stop and wins over the guess.
//
// One coarse fix when asked (page open / tab back), reused for 2 min, never
// continuous tracking. The position only gets compared to STOPS here and is
// never stored or sent anywhere. Off until STOPS has coordinates.
// Used by bus.js (/bus) and bus-next.js (home card); needs bus-core.js.
// ============================================================

const BusLocate = (function () {
  // Bus pickup points. null = not pinned yet, which switches the feature off.
  const STOPS = {
    kca1: null,    // { lat: 24.xxxxx, lng: 54.xxxxx }
    kca3: null,
    campus: null
  };
  const NEAR_M = 700;        // further than this from every stop = "not at a stop"
  const FIX_MAX_AGE = 120000;

  const enabled = !!(navigator.geolocation && Object.values(STOPS).every(Boolean));

  function get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }

  function metres(a, b) {
    const R = 6371000, rad = Math.PI / 180;
    const dLat = (b.lat - a.lat) * rad, dLng = (b.lng - a.lng) * rad;
    const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin(dLng / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(h));
  }

  function nearest(pos) {
    let best = null;
    for (const [id, s] of Object.entries(STOPS)) {
      const d = metres(pos, s);
      if (!best || d < best.distance) best = { stop: id, distance: Math.round(d) };
    }
    return best;
  }

  // Already allowed? Then detection can run on page open without a prompt.
  async function allowed() {
    if (!enabled) return false;
    if (get("bus-locate-on") !== "1") return false;
    try {
      const p = await navigator.permissions.query({ name: "geolocation" });
      return p.state === "granted";
    } catch (e) { return true; }   // no Permissions API (older Safari): trust the saved opt-in
  }

  // { stop, distance, near } or { error }. Asks for permission if needed.
  function detect() {
    if (!enabled) return Promise.resolve({ error: "off" });
    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (p) => {
          set("bus-locate-on", "1");
          const n = nearest({ lat: p.coords.latitude, lng: p.coords.longitude });
          n.near = n.distance <= NEAR_M;
          if (n.near && n.stop !== "campus") set("bus-home-dorm", n.stop);
          resolve(n);
        },
        (err) => {
          if (err.code === err.PERMISSION_DENIED) set("bus-locate-on", "0");
          resolve({ error: err.code === err.PERMISSION_DENIED ? "denied" : "unavailable" });
        },
        { enableHighAccuracy: false, maximumAge: FIX_MAX_AGE, timeout: 10000 }
      );
    });
  }

  // Where you're probably going from `stop`.
  function destinationFor(stop) {
    const picked = get(`bus-dest-for-${stop}`);
    if (picked && picked !== stop && (DESTINATIONS[stop] || []).some((d) => d.id === picked)) return picked;
    if (stop === "campus") return get("bus-home-dorm") || "kca1";
    return "campus";
  }

  // Remember a hand-picked destination for this stop.
  function remember(stop, dest) { set(`bus-dest-for-${stop}`, dest); }

  // Make `stop` the saved route, the same keys /bus has always used.
  function apply(stop) {
    const dest = destinationFor(stop);
    set("bus-perspective", stop);
    set("bus-destination", dest);
    return { loc: stop, dest };
  }

  const NAMES = { kca1: "KCA 1&2", kca3: "KCA 3", campus: "Campus" };
  function describe(r) {
    if (r.error === "denied") return "Location is blocked for this site. Allow it in your browser settings to use this.";
    if (r.error) return "Couldn't get your location. Pick your stop below.";
    if (!r.near) return `You're ${(r.distance / 1000).toFixed(1)} km from the nearest stop (${NAMES[r.stop]}). Showing your last route.`;
    return `📍 You're at ${NAMES[r.stop]}`;
  }

  return { enabled, allowed, detect, destinationFor, remember, apply, describe };
})();
