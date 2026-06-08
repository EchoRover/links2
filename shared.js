// ============================================================
// shared.js — code used by BOTH index.html and archive.html
// (render helpers, quote rotator, theme toggle, background)
// Loaded BEFORE scripts.js / archive.js on each page.
// ============================================================

// ================= THEME (apply early to avoid flash) =================
(function applySavedTheme() {
  const saved = localStorage.getItem("theme");
  if (saved) document.documentElement.setAttribute("data-theme", saved);
})();

function wireThemeToggle() {
  const toggleBtn = document.getElementById("theme-toggle");
  if (!toggleBtn) return;
  toggleBtn.addEventListener("click", () => {
    const current = document.documentElement.getAttribute("data-theme");
    const next = current === "light" ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("theme", next);
  });
}

// ================= GENERAL LINKS (pills) =================
// values may be a string url, or { url, className?, quip?, quipTop? }
function renderGeneralLinks(selector, data) {
  const container = document.querySelector(selector);
  if (!container) return;

  for (const [name, value] of Object.entries(data)) {
    const url      = typeof value === "string" ? value : value.url;
    const klass    = typeof value === "object" ? value.className : null;
    const quip     = typeof value === "object" ? value.quip      : null;
    const quipTop  = typeof value === "object" ? value.quipTop   : null;

    const link = document.createElement("a");
    link.href = url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    if (klass === "cs-link") {
      link.innerHTML = `${name}<span class="cs-arrow" aria-hidden="true">↗</span>`;
    } else {
      link.textContent = name;
    }
    if (klass) link.classList.add(klass);
    if (quip)    { link.dataset.quip    = quip;    link.title = quip; }
    if (quipTop) { link.dataset.quipTop = quipTop; }
    container.appendChild(link);
  }
}

// ================= COURSE LINKS (cards) =================
function splitCourseLabel(label) {
  const match = String(label).match(/^\s*([A-Z]{2,}\s*\d+[A-Za-z]*)\s*(?:\((.+)\))?\s*$/);
  if (match) {
    return { code: match[1].trim(), title: (match[2] || "").trim() || match[1].trim() };
  }
  return { code: "", title: label };
}

// Accepts both shapes:
//   "CODE (Title)": { Blackboard: "url", OneDrive: "url" }     (legacy flat)
//   "CODE (Title)": { credits: 4, ltp: "3-1-0", links: {...} } (new with meta)
function normalizeCourseEntry(value) {
  if (value && typeof value === "object" && (value.links || value.credits || value.ltp)) {
    return {
      credits: value.credits ?? null,
      ltp: value.ltp ?? null,
      links: value.links || {}
    };
  }
  return { credits: null, ltp: null, links: value || {} };
}

function renderCourseLinks(selector, data) {
  const container = document.querySelector(selector);
  if (!container) return;

  for (const [course, raw] of Object.entries(data)) {
    const { credits, ltp, links } = normalizeCourseEntry(raw);
    const { code, title } = splitCourseLabel(course);

    const card = document.createElement("article");
    card.className = "course-card";

    // header row: code pill (left) + spec [ltp + credits badge] (right)
    const head = document.createElement("div");
    head.className = "course-head";
    if (code) {
      const codeEl = document.createElement("span");
      codeEl.className = "course-code";
      codeEl.textContent = code;
      head.appendChild(codeEl);
    }
    if (ltp || credits != null) {
      const spec = document.createElement("span");
      spec.className = "course-spec";
      if (ltp) {
        const l = document.createElement("span");
        l.className = "ltp";
        l.textContent = ltp;
        spec.appendChild(l);
      }
      if (credits != null) {
        const c = document.createElement("span");
        c.className = "cr-badge";
        c.textContent = credits;
        c.title = credits + " credits";
        spec.appendChild(c);
      }
      head.appendChild(spec);
    }
    card.appendChild(head);

    // title — colored drop-cap initial via CSS ::first-letter
    const heading = document.createElement("h3");
    heading.className = "course-title";
    heading.textContent = title;
    card.appendChild(heading);

    // links — bullet + label + reveal-on-hover arrow
    const linkRow = document.createElement("div");
    linkRow.className = "course-links";
    for (const [name, url] of Object.entries(links)) {
      const link = document.createElement("a");
      link.href = url;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      const label = document.createElement("span");
      label.className = "ln-label";
      label.textContent = name;
      link.appendChild(label);
      linkRow.appendChild(link);
    }
    card.appendChild(linkRow);

    container.appendChild(card);
  }
}

// ================= QUOTE ROTATOR =================
// keep attributions tight — every line should be traceable to the listed source.
// quotes default to weight: 1. give a higher weight to bias the random pick.
const QUOTES = [
  // --- House lines (weighted to surface ~5x more often than base quotes) ---
  { text: "That's soo sad",                                   src: "Sumedh Jamsandekar",  weight: 5 },
  { text: "It's soo over",                                    src: "Sumedh Jamsandekar",  weight: 5 },
  { text: "MONNNKKKKKEEEYYYYYY!!!",                           src: "James Joshua Koshy",  weight: 5 },
  { text: "I love KFC wrappers",                              src: "James Joshua Koshy",  weight: 5 },
  { text: "Procrastination is the assassination of all destination", src: "Aaron Binoj Amacadu", weight: 5 },
  { text: "Chocolate chip cookies",                           src: "Evan Johan Tobias",   weight: 5 },

  // --- Star Wars / Star Trek ---
  { text: "Do or do not. There is no try.",                                              src: "Yoda" },
  { text: "May the Force be with you.",                                                  src: "Star Wars" },
  { text: "I find your lack of faith disturbing.",                                       src: "Darth Vader" },
  { text: "I am one with the Force, the Force is with me.",                              src: "Chirrut Îmwe" },
  { text: "Rebellions are built on hope.",                                               src: "Jyn Erso" },
  { text: "Never tell me the odds.",                                                     src: "Han Solo" },
  { text: "Help me, Obi-Wan Kenobi. You're my only hope.",                               src: "Princess Leia" },
  { text: "Live long and prosper.",                                                      src: "Spock" },
  { text: "The needs of the many outweigh the needs of the few.",                        src: "Spock" },

  // --- Sci-fi / cult ---
  { text: "I've seen things you people wouldn't believe.",                               src: "Roy Batty, Blade Runner" },
  { text: "Houston, we have a problem.",                                                 src: "Apollo 13" },
  { text: "There is no spoon.",                                                          src: "The Matrix" },
  { text: "I know kung fu.",                                                              src: "Neo" },
  { text: "I'll be back.",                                                                src: "The Terminator" },
  { text: "Hasta la vista, baby.",                                                       src: "Terminator 2" },
  { text: "Life finds a way.",                                                           src: "Ian Malcolm, Jurassic Park" },
  { text: "Welcome to Jurassic Park.",                                                   src: "John Hammond" },
  { text: "Roads? Where we're going, we don't need roads.",                              src: "Doc Brown" },
  { text: "I see dead people.",                                                          src: "The Sixth Sense" },

  // --- LOTR / Middle-Earth ---
  { text: "Even the smallest person can change the course of the future.",               src: "Galadriel" },
  { text: "All we have to decide is what to do with the time that is given us.",         src: "Gandalf" },
  { text: "You shall not pass!",                                                          src: "Gandalf" },
  { text: "Not all those who wander are lost.",                                          src: "Tolkien" },
  { text: "There is some good in this world. And it's worth fighting for.",              src: "Samwise Gamgee" },
  { text: "My precious.",                                                                src: "Gollum" },

  // --- Iconic Hollywood ---
  { text: "Frankly, my dear, I don't give a damn.",                                      src: "Gone with the Wind" },
  { text: "Here's looking at you, kid.",                                                 src: "Casablanca" },
  { text: "I'm gonna make him an offer he can't refuse.",                                src: "The Godfather" },
  { text: "You're gonna need a bigger boat.",                                            src: "Jaws" },
  { text: "Life is like a box of chocolates.",                                           src: "Forrest Gump" },
  { text: "Stupid is as stupid does.",                                                   src: "Forrest Gump" },
  { text: "Get busy living, or get busy dying.",                                         src: "The Shawshank Redemption" },
  { text: "Hope is a good thing, maybe the best of things.",                             src: "The Shawshank Redemption" },
  { text: "I'm the king of the world!",                                                  src: "Titanic" },
  { text: "There's no place like home.",                                                 src: "The Wizard of Oz" },
  { text: "Bond. James Bond.",                                                           src: "James Bond" },
  { text: "Carpe diem. Seize the day, boys.",                                            src: "Dead Poets Society" },
  { text: "Just keep swimming.",                                                         src: "Dory, Finding Nemo" },
  { text: "Hakuna Matata.",                                                              src: "The Lion King" },
  { text: "To infinity and beyond.",                                                     src: "Buzz Lightyear" },

  // --- Dark Knight ---
  { text: "Why so serious?",                                                             src: "The Joker" },
  { text: "The night is darkest just before the dawn.",                                  src: "Harvey Dent" },
  { text: "Some men just want to watch the world burn.",                                 src: "Alfred Pennyworth" },
  { text: "You either die a hero, or live long enough to see yourself become the villain.", src: "Harvey Dent" },
  { text: "Madness is like gravity. All it takes is a little push.",                     src: "The Joker" },
  { text: "I am vengeance. I am the night. I am Batman.",                                src: "Batman" },

  // --- Christopher Nolan ---
  { text: "You mustn't be afraid to dream a little bigger, darling.",                    src: "Eames, Inception" },
  { text: "Dreams feel real while we're in them.",                                       src: "Cobb, Inception" },
  { text: "Do not go gentle into that good night.",                                      src: "Dylan Thomas" },
  { text: "Love is the one thing that transcends time and space.",                       src: "Brand, Interstellar" },
  { text: "We used to look up at the sky and wonder. Now we just look down and worry.",  src: "Cooper, Interstellar" },

  // --- Tarantino / cult ---
  { text: "The Dude abides.",                                                            src: "The Big Lebowski" },
  { text: "What's the most you ever lost on a coin toss?",                               src: "Chigurh, No Country for Old Men" },

  // --- Whiplash ---
  { text: "There are no two words in the English language more harmful than 'good job'.", src: "Whiplash" },
  { text: "Were you rushing or were you dragging?",                                      src: "Whiplash" },
  { text: "I'd rather die drunk and broke at 34 than live to 90 sitting at a dinner table.", src: "Andrew, Whiplash" },

  // --- Marvel ---
  { text: "I am Iron Man.",                                                              src: "Tony Stark" },
  { text: "With great power comes great responsibility.",                                src: "Uncle Ben" },
  { text: "Whatever it takes.",                                                          src: "Avengers: Endgame" },
  { text: "I love you 3000.",                                                            src: "Morgan Stark" },
  { text: "I am Groot.",                                                                  src: "Groot" },
  { text: "Wakanda forever.",                                                            src: "Black Panther" },
  { text: "Avengers, assemble.",                                                         src: "Captain America" },
  { text: "On your left.",                                                               src: "Steve Rogers" },
  { text: "I can do this all day.",                                                      src: "Steve Rogers" },
  { text: "Mr. Stark, I don't feel so good.",                                            src: "Peter Parker" },

  // --- Indie / romantic ---
  { text: "We accept the love we think we deserve.",                                     src: "Perks of Being a Wallflower" },
  { text: "Here's to the ones who dream, foolish as they may seem.",                     src: "La La Land" },
  { text: "Constantly talking isn't necessarily communicating.",                         src: "Eternal Sunshine of the Spotless Mind" },

  // --- Studio Ghibli ---
  { text: "Once you've met someone, you never really forget them.",                      src: "Zeniba, Spirited Away" },
  { text: "Nothing that happens is ever forgotten, even if you can't remember it.",      src: "Zeniba, Spirited Away" },
  { text: "A heart's a heavy burden.",                                                   src: "Calcifer, Howl's Moving Castle" },
  { text: "Everybody, try laughing. Then whatever scares you will go away.",             src: "My Neighbor Totoro" },
  { text: "I want to see with eyes unclouded by hate.",                                  src: "Ashitaka, Princess Mononoke" },
  { text: "I want to live.",                                                              src: "Ashitaka, Princess Mononoke" },

  // --- Shōnen / anime ---
  { text: "I'll become the Pirate King!",                                                src: "Monkey D. Luffy" },
  { text: "If you don't take risks, you can't create a future.",                         src: "Monkey D. Luffy" },
  { text: "I am the hope of the universe.",                                              src: "Goku" },
  { text: "I'll be the Hokage one day!",                                                 src: "Naruto Uzumaki" },
  { text: "Hard work is absolutely worthless for those who don't believe in themselves.", src: "Naruto Uzumaki" },
  { text: "I am the storm that is approaching.",                                         src: "Madara Uchiha" },
  { text: "There's no such thing as a painless lesson.",                                 src: "Edward Elric" },
  { text: "The world isn't perfect. But it's there for us, doing the best it can.",     src: "Roy Mustang, FMA: Brotherhood" },
  { text: "Plus Ultra!",                                                                  src: "All Might" },
  { text: "Tatakae.",                                                                     src: "Eren Yeager" },
  { text: "Yare yare daze.",                                                              src: "Jotaro Kujo" },
  { text: "Ora ora ora ora ora!",                                                         src: "Star Platinum" },
  { text: "I'll take a potato chip and eat it.",                                         src: "Light Yagami" },
  { text: "Just as planned.",                                                            src: "Light Yagami" },
  { text: "I shall become the god of the new world.",                                    src: "Light Yagami" },
  { text: "Shinigami love apples.",                                                      src: "Ryuk" },
  { text: "I am the bone of my sword.",                                                  src: "Archer, Fate/Stay Night" },
  { text: "If you really want to be strong, stop caring about what others think of you.", src: "Saitama" },
  { text: "I'm just a hero for fun.",                                                    src: "Saitama" },
  { text: "All hail Lelouch!",                                                           src: "Code Geass" },
  { text: "The only ones who should kill are those who are prepared to be killed.",      src: "Lelouch vi Britannia" },

  // --- Literature ---
  { text: "A man can be destroyed but not defeated.",                                    src: "Hemingway" },
  { text: "It was the best of times, it was the worst of times.",                        src: "Dickens" },
  { text: "We are such stuff as dreams are made on.",                                    src: "Shakespeare" },
  { text: "The course of true love never did run smooth.",                               src: "A Midsummer Night's Dream" },

  // --- Harry Potter ---
  { text: "After all this time? Always.",                                                src: "Severus Snape" },
  { text: "It does not do to dwell on dreams and forget to live.",                       src: "Dumbledore" },
  { text: "Happiness can be found, even in the darkest of times.",                       src: "Dumbledore" },

  // --- Misc ---
  { text: "What is a man? A miserable little pile of secrets.",                          src: "Dracula, Castlevania" },
  { text: "Whatever you do, make it your masterpiece.",                                  src: "John Wooden" }
];

function pickWeighted(items) {
  const total = items.reduce((sum, q) => sum + (q.weight || 1), 0);
  let r = Math.random() * total;
  for (const q of items) {
    r -= (q.weight || 1);
    if (r <= 0) return q;
  }
  return items[items.length - 1];
}

function buildFooterQuote() {
  const el = document.getElementById("footer-quote");
  if (!el) return;
  const q = pickWeighted(QUOTES);
  el.innerHTML = `<span class="q-mark q-open">“</span><span class="q-body">${q.text}</span><span class="q-mark q-close">”</span> <span class="q-src">· ${q.src}</span>`;
}

// ================= BACKGROUND: floating botanicals =================
// Sparse leaves drifting up behind the content. transform/opacity only.
function spawnBotanicals(count = 6) {
  const bg = document.getElementById("bg");
  if (!bg) return;
  const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce) return; // CSS also hides #bg under reduced-motion; bail early too

  const LEAF =
    '<svg viewBox="0 0 24 24" aria-hidden="true">' +
    '<path d="M12 1.5C6.8 6 4.3 11.8 5.9 17.9c.4 1.6 1.2 3 2.3 4.3.2-3.6 1.1-6.8 2.8-9.6-.9 3-1.3 6.1-1.1 9.4 4.9-3 7.8-8.4 7.7-14.3C19.9 5.2 16.5 2.6 12 1.5Z"/>' +
    '<path d="M9 12.5c2-2.4 4.6-4.3 7.6-5.4" fill="none"/>' +
    '</svg>';

  for (let i = 0; i < count; i++) {
    const leaf = document.createElement("span");
    leaf.className = "leaf";
    leaf.innerHTML = LEAF;
    const dur = 18 + Math.random() * 16; // 18–34s
    leaf.style.setProperty("--x", (Math.random() * 100).toFixed(2) + "vw");
    leaf.style.setProperty("--sz", (14 + Math.random() * 16).toFixed(0) + "px"); // 14–30px
    leaf.style.setProperty("--drift", (Math.random() * 120 - 60).toFixed(0) + "px"); // -60..60
    leaf.style.setProperty("--spin", (Math.random() * 520 - 160).toFixed(0) + "deg");
    leaf.style.animationDuration = dur.toFixed(1) + "s";
    leaf.style.animationDelay = (-Math.random() * dur).toFixed(1) + "s"; // pre-distribute on load
    bg.appendChild(leaf);
  }
}

// ================= ENERGY SPRITE (CURSOR REPLACEMENT) =================
function initEnergySprite() {
  if (window.innerWidth <= 1024) return;

  const sprite = document.createElement("div");
  sprite.id = "energy-sprite";
  const orb = document.createElement("div");
  orb.className = "sprite-orb";
  sprite.appendChild(orb);
  document.body.appendChild(sprite);

  // Instant follow for cursor replacement (exactly at mouse tip)
  window.addEventListener("mousemove", (e) => {
    sprite.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
  });

  const courseForms = {
    "aenl226": "form-battery", "power": "form-battery",
    "aenl228": "form-meter", "measurement": "form-meter", "instr": "form-meter",
    "aenp200": "form-solar", "energy tech": "form-solar",
    "aenp225": "form-volt", "elec energy": "form-volt",
    "ahul256": "form-think", "thinking": "form-think",
    "ahul261": "form-brain", "psych": "form-brain",
    "asbl100": "form-dna", "bio": "form-dna"
  };

  document.addEventListener("mouseover", (e) => {
    const target = e.target.closest(".course-card, #open-games-modal, #archive-btn, .game-choice-btn, .box, .general a, #theme-toggle, .brand a");
    if (!target) { orb.className = "sprite-orb"; return; }
    const rawText = (target.innerText || target.textContent || "").toLowerCase();
    const id = (target.id || "").toLowerCase();
    const klass = (target.className || "").toLowerCase();
    let form = "sprite-orb";

    if (id === "open-games-modal" || klass.includes("game-choice-btn")) form = "sprite-orb form-ghost";
    else if (id === "archive-btn" || rawText.includes("archive")) form = "sprite-orb form-old";
    else if (klass.includes("cs-link") || rawText.includes("linkcs")) form = "sprite-orb form-computer";
    else if (id === "theme-toggle") {
      const isDark = document.documentElement.getAttribute("data-theme") === "dark";
      form = isDark ? "sprite-orb form-sun" : "sprite-orb form-moon";
    }
    else if (rawText.includes("cgpa")) form = "sprite-orb form-task";
    else if (id.includes("timetable")) form = "sprite-orb form-clock";
    else if (id.includes("assignment")) form = "sprite-orb form-task";
    else if (id.includes("quiz")) form = "sprite-orb form-star";
    else {
      for (const [key, val] of Object.entries(courseForms)) {
        if (rawText.indexOf(key) !== -1) { form = `sprite-orb ${val}`; break; }
      }
    }
    orb.className = form;
  });
}

// ================= COMMON INIT =================
window.addEventListener("DOMContentLoaded", () => {
  console.log("--- SHARED.JS FORCE LOAD V11 ---");
  wireThemeToggle();
  buildFooterQuote();
  spawnBotanicals(6);
});
