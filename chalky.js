// LLL Algebra — Chalky, the chalk-stick companion
// Pixel sprites (faces + idle animations), random lines and makeBuddy(), which drives
// one Chalky per place he appears. The instances themselves (playBuddy, homeBuddy, …) stay in index.html.

import { setMathText } from "./mathtext.js";

const REDUCED_MOTION = !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);

// A chalk stick drawn in code on a 24×24 pixel grid: one SVG per expression, built once.
// Sizes per screen are set in brand.css (play, home, tutorial; smaller on narrow phones).
// K (outline, feet, arms, thinking dots) follows the theme so it shows on dark backgrounds too;
// E (eyes, mouth) stays dark because it always sits on the white chalk.
// B/P = book cover/page, D/F = chalkboard/frame, Y = chalk dust (used by the idle animations)
const BUDDY_PAL = { K: "var(--buddy-line)", E: "#2C2C2A", W: "#F4F1EA", S: "#D3D1C7", R: "#C2562F", G: "#E8B44A", C: "#F0997B", L: "#85B7EB", T: "#D85A30",
                    B: "#4A78B5", P: "#FFFFFF", D: "#2F4A3A", F: "#8A5A33", Y: "#B4B2A9" };
// Faces are 10×5 blocks placed at (7, 6). `x` = extras drawn around (18, 3): sparkle, sweat drop, thinking dots.
const BUDDY_FACES = {
  idle:        { f: ["..........", "..E....E..", "..E....E..", ".C......C.", "....EE...."] },
  blink:       { f: ["..........", "..........", "..E....E..", ".C......C.", "....EE...."] },
  talk:        { f: ["..........", "..E....E..", "..E....E..", ".C..EE..C.", "....EE...."] },
  happy:       { f: ["..E....E..", ".E.E..E.E.", "..........", ".C.E..E.C.", "....EE...."], x: [[1, 0, "G"], [0, 1, "G"], [1, 1, "G"], [2, 1, "G"], [1, 2, "G"]] },
  oops:        { f: ["...E..E...", "..E....E..", "..E....E..", "....EE....", "...E..E..."], x: [[1, 0, "L"], [0, 1, "L"], [1, 1, "L"], [2, 1, "L"], [1, 2, "L"]] },
  thinking:    { f: ["..........", "...E....E.", "...E....E.", "..........", "......EE.."], x: [[0, 1, "K"], [2, 0, "K"], [3, -2, "K"], [4, -2, "K"], [3, -3, "K"], [4, -3, "K"]] },
  celebrating: { f: ["..E....E..", ".E.E..E.E.", "..........", "..EEEEEE..", "...ETTE..."], arms: true }
};

// spec: a face name ("happy"), or an idle-animation frame { face?, px?: [[x, y, colour]], noCheeks? }
function buildBuddySvg(spec) {
  const frame = typeof spec === "string" ? { face: spec } : spec;
  const N = 24;
  const g = Array.from({ length: N }, () => Array(N).fill(null));
  const put = (x, y, c) => { if (g[y] && x >= 0 && x < N) g[y][x] = c; };
  // Body: chalk stick with a shaded right edge and a rust paper band
  for (let y = 3; y <= 18; y++) {
    for (let x = 7; x <= 16; x++) g[y][x] = (y >= 14 && y <= 16) ? "R" : (x >= 15 ? "S" : "W");
  }
  [[7, 3], [16, 3], [7, 18], [16, 18]].forEach(([x, y]) => { g[y][x] = null; });   // rounded corners
  // Outline: every empty cell touching the body
  const body = g.map(r => r.slice());
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    if (!body[y][x] && [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => (body[y + dy] || [])[x + dx])) g[y][x] = "K";
  }
  [9, 10, 13, 14].forEach(x => put(x, 20, "K"));   // feet
  if (frame.face) {
    const face = BUDDY_FACES[frame.face];
    face.f.forEach((row, dy) => [...row].forEach((c, dx) => { if (c !== ".") put(7 + dx, 6 + dy, c); }));
    if (face.arms) [[5, 10], [4, 9], [3, 8], [18, 10], [19, 9], [20, 8]].forEach(([x, y]) => put(x, y, "K"));
    (face.x || []).forEach(([dx, dy, c]) => put(18 + dx, 3 + dy, c));
  } else if (!frame.noCheeks) {
    put(8, 9, "C"); put(15, 9, "C");   // idle frames draw their own eyes and mouth, but keep his cheeks
  }
  (frame.px || []).forEach(([x, y, c]) => put(x, y, c));   // props (book, cup, board, Zzz…) and custom eyes
  let rects = "";
  g.forEach((row, y) => row.forEach((c, x) => {
    if (c) rects += `<rect x="${x}" y="${y}" width="1.02" height="1.02" fill="${BUDDY_PAL[c]}"/>`;
  }));
  return `<svg viewBox="0 0 24 24" shape-rendering="crispEdges">${rects}</svg>`;
}

const BUDDY_SVG = Object.fromEntries(Object.keys(BUDDY_FACES).map(k => [k, buildBuddySvg(k)]));
const BUDDY_MOODS = ["idle", "happy", "oops", "thinking", "celebrating", "nod"];
// An idle frame's `motion` → the existing stepped animation class on the sprite
const IDLE_MOTION = { bob: "idle", hop: "happy", shake: "oops", jump: "celebrating", nod: "nod" };

// ---------- Chalky's idle animations ----------
// Short frame sequences on the same 24×24 grid. A frame is { face? | px, noCheeks?, ms, motion? }.
//   Home: a random one every 6–10 s.  Play: the doze nudge after ~10 s with no tap.
//   Never in tutorials, the intro or mid-reaction (any reaction calls stop()); off with reduced motion.
const CHALKY_IDLES = (() => {
  const px = (c, pts) => pts.map(([x, y]) => [x, y, c]);
  const fill = (x0, y0, x1, y1, c) => { const o = []; for (let x = x0; x <= x1; x++) for (let y = y0; y <= y1; y++) o.push([x, y, c]); return o; };
  const border = (x0, y0, x1, y1, c) => fill(x0, y0, x1, y1, c).filter(([x, y]) => x === x0 || x === x1 || y === y0 || y === y1);
  const mirror = pts => pts.map(([x, y, c]) => [23 - x, y, c]);

  const EYES_OPEN = px("E", [[9, 7], [9, 8], [14, 7], [14, 8]]);
  const EYES_SQUINT = px("E", [[8, 8], [9, 7], [10, 8], [13, 8], [14, 7], [15, 8]]);
  const EYES_SLEEP = px("E", [[8, 8], [9, 8], [10, 8], [13, 8], [14, 8], [15, 8]]);
  const EYES_HALF = px("E", [[9, 8], [14, 8]]);
  const EYES_LEFT = px("E", [[8, 7], [8, 8], [13, 7], [13, 8]]);
  const EYES_WIDE = px("E", [[9, 6], [9, 7], [9, 8], [14, 6], [14, 7], [14, 8]]);
  const MOUTH = px("E", [[11, 10], [12, 10]]);
  const MOUTH_O = px("E", [[11, 10], [12, 10], [11, 11], [12, 11]]);

  // Reading: glasses + an open book; eyes move across the pages, then a page turn
  const GLASSES = [...border(7, 6, 10, 9, "E"), ...border(13, 6, 16, 9, "E"), [11, 7, "E"], [12, 7, "E"]];
  const BOOK = [];
  for (let x = 5; x <= 18; x++) for (let y = 12; y <= 16; y++) {
    BOOK.push([x, y, (x === 5 || x === 18 || y === 16 || x === 11 || x === 12) ? "B" : "P"]);
  }
  const TEXT_L = px("S", [[7, 13], [8, 13], [9, 13], [10, 13], [7, 14], [8, 14], [9, 14]]);
  const TEXT_R = px("S", [[13, 13], [14, 13], [15, 13], [16, 13], [13, 14], [14, 14], [15, 14]]);
  const FLAP = [[13, 11, "B"], [14, 10, "B"], [15, 10, "B"], [16, 11, "B"], [14, 11, "P"], [15, 11, "P"]];
  const readEyes = side => px("E", side === "L" ? [[8, 8], [14, 8]] : [[9, 8], [15, 8]]);
  const read = (side, ms, text = [TEXT_L, TEXT_R]) =>
    ({ noCheeks: true, motion: "bob", ms, px: [...GLASSES, ...readEyes(side), ...MOUTH, ...BOOK, ...text.flat()] });
  const READING = [
    read("L", 700), read("R", 700), read("L", 700), read("R", 700),
    { noCheeks: true, motion: "bob", ms: 260, px: [...GLASSES, ...readEyes("R"), ...MOUTH, ...BOOK, ...TEXT_L, ...FLAP] },
    read("L", 260, [TEXT_L]),
    read("L", 700), read("R", 700), read("L", 700), read("R", 700),
    { noCheeks: true, motion: "bob", ms: 160, px: [...GLASSES, ...px("E", [[8, 8], [9, 8], [14, 8], [15, 8]]), ...MOUTH, ...BOOK, ...TEXT_L, ...TEXT_R] },
    read("L", 500)
  ];

  // Sipping water: cup on the right, straw to his mouth, the water drops a level each sip
  const cup = level => {
    const o = border(18, 11, 21, 15, "K").filter(([x, y]) => !(y === 11 && (x === 19 || x === 20)));
    for (let y = 15 - level; y <= 14; y++) o.push([19, y, "L"], [20, y, "L"]);
    return o;
  };
  const STRAW_HOLD = px("T", [[20, 8], [20, 9], [20, 10], [20, 11]]);
  const STRAW_SIP = px("T", [[13, 10], [14, 10], [15, 10], [16, 10], [17, 10], [18, 10], [19, 10], [20, 10], [20, 11]]);
  const hold = (level, ms) => ({ ms, motion: "bob", px: [...EYES_OPEN, ...MOUTH, ...cup(level), ...STRAW_HOLD] });
  const sip = (level, ms) => ({ ms, px: [...EYES_SQUINT, ...px("E", [[12, 10]]), ...cup(level), ...STRAW_SIP] });
  const ahh = (level, ms) => ({ face: "happy", ms, motion: "hop", px: [...cup(level), ...STRAW_HOLD] });
  const SIPPING = [hold(3, 1000), sip(3, 600), sip(2, 600), ahh(2, 800), hold(2, 900), sip(2, 600), sip(1, 600), ahh(1, 800), hold(1, 700)];

  // Writing an x on a tiny chalkboard, admiring it, wiping it clean
  const XS = [[1, 10], [2, 11], [3, 12], [4, 13], [4, 10], [3, 11], [2, 12], [1, 13]];
  const board = n => [...border(0, 8, 5, 15, "F"), ...fill(1, 9, 4, 14, "D"), ...px("W", XS.slice(0, n))];
  const FOCUS = [...EYES_LEFT, ...MOUTH, [12, 11, "T"]];   // eyes on the board, tongue out
  const WRITING = [
    { ms: 600, motion: "bob", px: [...EYES_LEFT, ...MOUTH, ...board(0)] },
    ...[1, 2, 3, 4, 5, 6, 7, 8].map(n => ({ ms: n === 4 ? 360 : 200, px: [...FOCUS, ...board(n)] })),
    { face: "happy", ms: 1100, motion: "hop", px: board(8) },
    { ms: 260, px: [...EYES_OPEN, ...MOUTH, ...board(8), ...px("Y", [[1, 10], [3, 12], [4, 10], [2, 12]])] },
    { ms: 260, px: [...EYES_OPEN, ...MOUTH, ...board(0), ...px("Y", [[2, 11], [3, 11], [2, 13]])] },
    { ms: 600, motion: "bob", px: [...EYES_OPEN, ...MOUTH, ...board(0)] }
  ];

  // Dozing: eyes close, Zzz floats up, then he wakes with a start (the play nudge loops instead)
  const Z1 = px("K", [[18, 7], [19, 7], [20, 7], [19, 8], [18, 9], [19, 9], [20, 9]]);
  const Z2 = px("K", [[19, 1], [20, 1], [21, 1], [22, 1], [21, 2], [20, 3], [19, 4], [20, 4], [21, 4], [22, 4]]);
  const SLEEP = [...EYES_SLEEP, ...MOUTH_O];
  const DOZE_START = [
    { ms: 700, px: [...EYES_HALF, ...MOUTH] },
    { ms: 600, motion: "nod", px: SLEEP }
  ];
  const DOZE_LOOP = [
    { ms: 900, motion: "nod", px: [...SLEEP, ...Z1] },
    { ms: 900, motion: "nod", px: [...SLEEP, ...Z1, ...Z2] },
    { ms: 900, motion: "nod", px: [...SLEEP, ...Z2] },
    { ms: 600, motion: "nod", px: SLEEP }
  ];
  const WAKE = [
    { ms: 700, motion: "hop", px: [...EYES_WIDE, ...MOUTH_O, ...px("K", [[19, 2], [19, 3], [19, 4], [19, 6]])] },
    { face: "blink", ms: 140 },
    { face: "idle", ms: 500, motion: "bob" }
  ];
  const DOZING = [...DOZE_START, ...DOZE_LOOP, ...DOZE_LOOP, ...WAKE];

  // Dusting off: pats the chalk dust off one side, then the other, then a quick shake
  const ARM_UP_L = px("K", [[5, 11], [4, 10], [3, 9]]);
  const ARM_PAT_L = px("K", [[5, 12], [4, 12], [3, 12]]);
  const PUFF_L = px("Y", [[2, 14], [3, 15], [1, 12], [2, 10], [4, 14]]);
  const pat = (arm, puff = []) => ({ ms: 220, px: [...EYES_SQUINT, ...MOUTH, ...arm, ...puff] });
  const DUSTING = [
    pat(ARM_UP_L), pat(ARM_PAT_L, PUFF_L), pat(ARM_UP_L), pat(ARM_PAT_L, PUFF_L),
    pat(mirror(ARM_UP_L)), pat(mirror(ARM_PAT_L), mirror(PUFF_L)), pat(mirror(ARM_UP_L)), pat(mirror(ARM_PAT_L), mirror(PUFF_L)),
    { ms: 450, motion: "shake", px: [...EYES_SQUINT, ...MOUTH, ...px("Y", [[3, 17], [20, 18], [5, 19], [18, 20], [2, 20]])] },
    { face: "happy", ms: 900, motion: "hop" },
    { face: "idle", ms: 400, motion: "bob" }
  ];

  // Mastery hat: a graduation cap with a gold tassel
  const HAT = [...fill(4, 1, 19, 1, "E"), ...fill(8, 2, 15, 2, "E"), [11, 0, "G"], [12, 0, "G"], [19, 2, "G"], [19, 3, "G"], [19, 4, "G"]];

  const home = [READING, SIPPING, WRITING, DOZING, DUSTING].map(frames => ({ frames }));
  const dozeNudge = { frames: [...DOZE_START, ...DOZE_LOOP], loopFrom: DOZE_START.length, line: () => buddyLine("buddyDoze") };
  [...home, dozeNudge].forEach(a => a.frames.forEach(f => { f.svg = f.svg || buildBuddySvg(f); }));   // build each SVG once
  return { home, dozeNudge, hat: HAT };
})();
// The hat only appears on the topic-mastered card (a design change, so it's kept to that one moment)
BUDDY_SVG.celebratingHat = buildBuddySvg({ face: "celebrating", px: CHALKY_IDLES.hat });

// Random line from a "a|b|c" string in STRINGS
function buddyLine(key) {
  const lines = (LLL_I18N.t(key) || "").split("|").filter(Boolean);
  return lines[Math.floor(Math.random() * lines.length)] || "";
}

// One buddy per place it appears (play screen, home, tutorial), each with its own mood and timers.
// $bubble is optional: the tutorial buddy speaks through the explanation text instead.
// idles (optional): { delay: () => ms, pick: () => { frames, loopFrom?, line? }, canPlay: () => bool }
function makeBuddy($sprite, $bubble, { keepBubble = false, idles = null } = {}) {
  let mood = "idle";
  let timers = [];
  const later = (fn, ms) => timers.push(setTimeout(fn, ms));
  const stop = () => { timers.forEach(clearTimeout); timers = []; };   // clearTimeout also clears intervals
  const face = expr => { $sprite.innerHTML = BUDDY_SVG[expr]; };
  const animate = cls => {
    $sprite.classList.remove(...BUDDY_MOODS);
    void $sprite.offsetWidth;   // restart the animation
    if (cls) $sprite.classList.add(cls);   // some idle frames have no motion
  };

  // Resting state: idle face, slow bob, a blink every few seconds.
  function idle() {
    stop();
    mood = "idle";
    if ($bubble && !keepBubble) $bubble.classList.remove("show");   // the home bubble stays up
    face("idle");
    animate("idle");
    timers.push(setInterval(() => {
      if (mood !== "idle") return;
      face("blink");
      setTimeout(() => { if (mood === "idle") face("idle"); }, 140);
    }, 3200));
    if (idles && !REDUCED_MOTION) later(playIdle, idles.delay());
  }

  // An idle animation (home: a random one; play: the doze nudge, which loops until a reaction).
  // Any reaction or talk calls stop(), which ends it right away.
  function playIdle() {
    if (mood !== "idle") return;
    if (!idles.canPlay()) { later(playIdle, idles.delay()); return; }   // not on screen right now: try again later
    const anim = idles.pick();
    mood = "idling";
    if ($bubble && anim.line) { $bubble.textContent = anim.line(); $bubble.classList.add("show"); }
    let i = 0, lastCls = null;
    const step = () => {
      const f = anim.frames[i++];
      $sprite.innerHTML = f.svg;
      const cls = IDLE_MOTION[f.motion];
      if (cls !== lastCls) { animate(cls); lastCls = cls; }   // don't restart a looping motion (nod) every frame
      later(() => {
        if (i < anim.frames.length) step();
        else if (anim.loopFrom != null) { i = anim.loopFrom; step(); }
        else idle();
      }, f.ms);
    };
    step();
  }

  // A reaction: face + motion + optional speech bubble, then back to idle (unless `stay`).
  // look: an alternative face for this mood (e.g. "celebratingHat")
  function react(newMood, { line = "", ms = 1200, stay = false, look = null } = {}) {
    stop();
    mood = newMood;
    face(look || newMood);
    animate(newMood);
    if ($bubble) {
      $bubble.textContent = line;
      $bubble.classList.toggle("show", !!line);
    }
    if (!stay) later(idle, ms);
  }

  // Types `text` into `el` with the mouth moving, then calls onDone.
  function talk(el, text, onDone) {
    stop();
    mood = "talking";
    animate("idle");
    if (REDUCED_MOTION) { setMathText(el, text); idle(); if (onDone) onDone(); return; }
    const chars = [...text];
    let i = 0, open = false;
    el.textContent = "";
    timers.push(setInterval(() => { open = !open; face(open ? "talk" : "idle"); }, 160));
    timers.push(setInterval(() => {
      if (i < chars.length) { el.textContent += chars[i++]; return; }
      setMathText(el, text);   // final pass keeps math runs on one line
      idle();
      if (onDone) onDone();
    }, 30));
  }

  return { idle, react, talk, stop };
}

export { BUDDY_SVG, CHALKY_IDLES, buddyLine, makeBuddy };