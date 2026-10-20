// LLL Algebra — graphs
// Level-complete card:
//   Systems: both lines of a system, read from its equation text, drawn crossing at the answer.
//   Straight lines: the level's line (level.line), with its two points or its y-intercept marked.
//   Inequalities: the answer (e.g. "x < -4") on a number line.
// Play screen (Straight lines with two points): the points on a grid, then the rise and run once they're worked out.
// index.html calls showSystemGraph() / showLineGraph() / clearSystemGraph() / showNumberLine() / clearNumberLine() /
// afterGraphDrawn() / showPlayGraph().

const $completeGraph = document.getElementById("completeGraph");
const $completeGraphSvg = document.getElementById("completeGraphSvg");
const $completeGraphLegend = document.getElementById("completeGraphLegend");
const REDUCED_MOTION = !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);

// Both lines of a system, read from its equation text, drawn crossing at the answer.
// Line 1 draws in, then line 2, then a dot pops in at the crossing; reduced motion shows it finished.
const SVG_NS = "http://www.w3.org/2000/svg";
const GRAPH_SIZE = 280, GRAPH_PAD = 20, GRAPH_W = GRAPH_SIZE - 2 * GRAPH_PAD;
const GRAPH_DONE_MS = 2100;   // when the dot has landed and Chalky speaks
let graphAnims = [];
let graphTimer = null;

// "2x - y = 3" → [2, -1, 3], i.e. ax + by = c. null if the line isn't in that shape.
function parseSystemLine(text) {
  const m = text.replace(/\s+/g, "").replace(/−/g, "-").match(/^(.+)=(-?\d+)$/);
  if (!m) return null;
  let a = 0, b = 0;
  for (const term of m[1].match(/[+-]?[^+-]+/g) || []) {
    const tm = term.match(/^([+-]?)(\d*)([xy])$/);
    if (!tm) return null;
    const k = (tm[1] === "-" ? -1 : 1) * (tm[2] === "" ? 1 : Number(tm[2]));
    if (tm[3] === "x") a += k; else b += k;
  }
  return [a, b, Number(m[2])];
}

// Both lines, or null if either doesn't parse or the answer isn't on both (the card then skips the graph).
function systemLines(level) {
  const lines = (level.equation || "").split("\n").map(parseSystemLine);
  const { x, y } = level.answer || {};
  if (lines.length !== 2 || lines.some(l => !l || l[0] * x + l[1] * y !== l[2])) return null;
  return lines;
}

// Clips ax + by = c to the square [-R, R]; returns 2 endpoints, left to right (bottom to top if vertical).
function clipSystemLine([a, b, c], R) {
  const pts = [];
  if (b !== 0) for (const x of [-R, R]) { const y = (c - a * x) / b; if (Math.abs(y) <= R + 1e-9) pts.push([x, y]); }
  if (a !== 0) for (const y of [-R, R]) { const x = (c - b * y) / a; if (Math.abs(x) <= R + 1e-9) pts.push([x, y]); }
  let best = null, bestLen = -1;
  for (let i = 0; i < pts.length; i++) for (let j = i + 1; j < pts.length; j++) {
    const len = Math.hypot(pts[i][0] - pts[j][0], pts[i][1] - pts[j][1]);
    if (len > bestLen) { bestLen = len; best = [pts[i], pts[j]]; }
  }
  return best && best.sort((p, q) => p[0] - q[0] || p[1] - q[1]);
}

// Where to put the "(x, y)" label: steps outward from the dot in 8 directions and takes the closest
// spot that clears both lines and the axes' tick numbers; failing that, the closest that clears the lines.
// Press Start 2P glyphs are 1em wide, so the label is text.length × 11 units wide.
// near (Straight lines): stay within this gap of the dot if a spot there clears the lines, even if it
// covers a tick number (those are then left out); Systems keeps the default, which prefers clearing the ticks.
function placePointLabel(lines, R, px, py, text, near = Infinity) {
  const size = 11, w = text.length * size;
  const lo = GRAPH_PAD + 2, hi = GRAPH_PAD + GRAPH_W - 2;
  const unit = GRAPH_W / (2 * R);   // SVG units per graph unit
  const toGraph = (sx, sy) => [(sx - GRAPH_PAD) / unit - R, R - (sy - GRAPH_PAD) / unit];
  // Gap (SVG units) between the box and the line a·x + b·y = c; 0 if the line runs through it
  const gapTo = (corners, [a, b, c]) => {
    const vals = corners.map(([gx, gy]) => (a * gx + b * gy - c) / Math.hypot(a, b));
    return Math.min(...vals) < 0 && Math.max(...vals) > 0 ? 0 : Math.min(...vals.map(Math.abs)) * unit;
  };
  const dirs = [[1, -1], [-1, -1], [1, 1], [-1, 1], [0, -1], [0, 1], [1, 0], [-1, 0]];
  let clearOfLines = null, best = null;
  for (let gap = 8; gap <= 60; gap += 4) {
    for (const [dx, dy] of dirs) {
      const left = dx > 0 ? px + gap : dx < 0 ? px - gap - w : px - w / 2;
      const top = dy < 0 ? py - gap - size : dy > 0 ? py + gap : py - size / 2;
      if (left < lo || left + w > hi || top < lo || top + size > hi) continue;
      const corners = [[left, top], [left + w, top], [left, top + size], [left + w, top + size]].map(p => toGraph(...p));
      const lineGap = Math.min(...lines.map(l => gapTo(corners, l)));
      const axisGap = Math.min(gapTo(corners, [1, 0, 0]), gapTo(corners, [0, 1, 0]));
      const spot = { x: left, y: top + size, w };
      if (lineGap >= 4 && axisGap >= 14) return spot;
      if (lineGap >= 4 && gap <= near) return spot;
      if (lineGap >= 4 && !clearOfLines) clearOfLines = spot;
      if (!best || lineGap > best.lineGap) best = { ...spot, lineGap };
    }
  }
  return clearOfLines || best || { x: px + 8, y: py - 8, w };
}

function svgEl(tag, attrs, parent) {
  const el = document.createElementNS(SVG_NS, tag);
  for (const k in attrs) el.setAttribute(k, attrs[k]);
  parent.appendChild(el);
  return el;
}

const fmtNum = n => (n < 0 ? "−" + Math.abs(n) : String(n));

// Square graph, same unit on both axes: the furthest value + 2 of room, never smaller than ±5.
// Up to ±8 the grid is 1 unit per square (Straight lines keeps every value within ±6 for this).
function graphRange(values) {
  let R = Math.max(5, ...values.map(v => Math.abs(v) + 2));
  const step = R <= 8 ? 1 : 2;
  R = Math.ceil(R / step) * step;
  return { R, step, labelEvery: step * 2 };
}

// Frame, grid, axes and axis names; returns the graph → SVG coordinate maps and a group clipped to the frame.
// clipId must be unique on the page (the complete card and the play screen each have their own).
function drawGrid(svg, { R, step }, clipId) {
  const X = x => GRAPH_PAD + (x + R) / (2 * R) * GRAPH_W;
  const Y = y => GRAPH_PAD + (R - y) / (2 * R) * GRAPH_W;
  svg.replaceChildren();
  const clip = svgEl("clipPath", { id: clipId }, svgEl("defs", {}, svg));
  svgEl("rect", { x: GRAPH_PAD, y: GRAPH_PAD, width: GRAPH_W, height: GRAPH_W }, clip);
  svgEl("rect", { x: GRAPH_PAD, y: GRAPH_PAD, width: GRAPH_W, height: GRAPH_W, class: "graph-frame" }, svg);

  const grid = svgEl("g", { class: "graph-grid" }, svg);
  for (let v = -R + step; v < R; v += step) {
    if (v === 0) continue;
    svgEl("line", { x1: X(v), y1: GRAPH_PAD, x2: X(v), y2: GRAPH_PAD + GRAPH_W }, grid);
    svgEl("line", { x1: GRAPH_PAD, y1: Y(v), x2: GRAPH_PAD + GRAPH_W, y2: Y(v) }, grid);
  }
  const axes = svgEl("g", { class: "graph-axis" }, svg);
  svgEl("line", { x1: GRAPH_PAD, y1: Y(0), x2: GRAPH_PAD + GRAPH_W, y2: Y(0) }, axes);
  svgEl("line", { x1: X(0), y1: GRAPH_PAD, x2: X(0), y2: GRAPH_PAD + GRAPH_W }, axes);
  // Axis names sit in the margin outside the frame, so a line can never cover them
  svgEl("text", { x: GRAPH_PAD + GRAPH_W + 5, y: Y(0) + 4, class: "graph-axis-name" }, svg).textContent = "x";
  svgEl("text", { x: X(0), y: GRAPH_PAD - 6, "text-anchor": "middle", class: "graph-axis-name" }, svg).textContent = "y";
  const clipped = svgEl("g", { "clip-path": `url(#${clipId})` }, svg);
  return { X, Y, clipped };
}

// Tick numbers on both axes, on top of the lines (their halo keeps them readable where a line passes).
// skip(left, top, right, bottom) leaves out any that would sit under a label.
function drawTicks(svg, { R, step, labelEvery }, X, Y, skip = () => false) {
  for (let v = -R + step; v < R; v += step) {
    if (v === 0 || v % labelEvery !== 0) continue;
    const tw = fmtNum(v).length * 7;
    if (!skip(X(v) - tw / 2, Y(0) + 4, X(v) + tw / 2, Y(0) + 14))
      svgEl("text", { x: X(v), y: Y(0) + 13, "text-anchor": "middle", class: "graph-tick" }, svg).textContent = fmtNum(v);
    if (!skip(X(0) - 5 - tw, Y(v) - 6, X(0) - 5, Y(v) + 4))
      svgEl("text", { x: X(0) - 5, y: Y(v) + 3, "text-anchor": "end", class: "graph-tick" }, svg).textContent = fmtNum(v);
  }
}

// A dot that pops in, with a ring that pulses out, and its "(x, y)" label (a dotted leader if it had to move away).
// Returns the elements to animate; avoid: the lines the label must keep clear of.
function drawPoint(svg, R, X, Y, [x, y], avoid, cls = "") {
  const px = X(x), py = Y(y);
  const text = `(${x}, ${y})`;
  const spot = placePointLabel(avoid, R, px, py, text, 16);
  const nearX = Math.min(Math.max(px, spot.x), spot.x + spot.w);
  const nearY = Math.min(Math.max(py, spot.y - 11), spot.y);
  const leader = Math.hypot(nearX - px, nearY - py) > 16
    ? svgEl("line", { x1: px, y1: py, x2: nearX, y2: nearY, class: "graph-leader" }, svg)
    : null;
  const ring = svgEl("circle", { cx: px, cy: py, r: 7, class: `graph-ring ${cls}` }, svg);
  const dot = svgEl("circle", { cx: px, cy: py, r: 6, class: `graph-dot ${cls}` }, svg);
  const label = svgEl("text", { x: spot.x, y: spot.y, class: "graph-point" }, svg);
  label.textContent = text;
  return { dot, ring, label, leader, spot };
}

function popPoint(anims, { dot, ring, label, leader }, at) {
  anims.push(
    dot.animate([{ transform: "scale(0)" }, { transform: "scale(1.35)", offset: 0.65 }, { transform: "scale(1)" }],
      { duration: 380, delay: at, easing: "ease-out", fill: "both" }),
    ring.animate([{ opacity: 0.9, transform: "scale(1)" }, { opacity: 0, transform: "scale(3)" }],
      { duration: 650, delay: at + 100, easing: "ease-out", fill: "both" }),
    label.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 250, delay: at + 200, fill: "both" })
  );
  if (leader) anims.push(leader.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 250, delay: at + 200, fill: "both" }));
}

// Draws a line in from one end (its length is set as a dash so the dash offset can run down to 0)
function drawIn(anims, el, len, delay, duration = 800) {
  el.style.strokeDasharray = len;
  anims.push(el.animate([{ strokeDashoffset: len }, { strokeDashoffset: 0 }],
    { duration, delay, easing: "cubic-bezier(.45,.05,.35,1)", fill: "both" }));
}

function clearSystemGraph() {
  clearTimeout(graphTimer);
  graphTimer = null;
  graphAnims.forEach(a => a.cancel());
  graphAnims = [];
  $completeGraph.hidden = true;
  $completeGraph.parentElement.classList.remove("has-graph");   // back to the normal card layout
}

// Draws the graph for a system level; returns false (and stays hidden) if the level can't be graphed.
function showSystemGraph(level) {
  clearSystemGraph();
  const lines = systemLines(level);
  if (!lines) return false;
  const t = k => LLL_I18N.t(k) || "";
  const fmt = fmtNum;
  const { x: x0, y: y0 } = level.answer;

  // Square graph, same unit on both axes: crossing + 2 of room, never smaller than ±5
  const range = graphRange([x0, y0]);
  const { R } = range;
  const svg = $completeGraphSvg;
  const { X, Y, clipped: lineGroup } = drawGrid(svg, range, "completeGraphClip");
  const lineEls = lines.map((ln, i) => {
    const seg = clipSystemLine(ln, R);
    if (!seg) return null;
    const [[xa, ya], [xb, yb]] = seg;
    const el = svgEl("line", { x1: X(xa), y1: Y(ya), x2: X(xb), y2: Y(yb), class: `graph-line l${i + 1}` }, lineGroup);
    el.dataset.len = Math.hypot(X(xb) - X(xa), Y(yb) - Y(ya));
    return el;
  });

  // Where the "(x, y)" label goes (worked out now so tick numbers can keep out of its way)
  const px = X(x0), py = Y(y0);
  const pointText = `(${x0}, ${y0})`;
  const spot = placePointLabel(lines, R, px, py, pointText);
  const underLabel = (l, t, r, b) => r > spot.x - 3 && l < spot.x + spot.w + 3 && b > spot.y - 14 && t < spot.y + 3;

  // Tick numbers, except any that would sit under the "(x, y)" label
  drawTicks(svg, range, X, Y, underLabel);

  // A label that had to move away from the dot gets a dotted leader back to it (drawn under the dot)
  const nearX = Math.min(Math.max(px, spot.x), spot.x + spot.w);
  const nearY = Math.min(Math.max(py, spot.y - 11), spot.y);
  const leader = Math.hypot(nearX - px, nearY - py) > 16
    ? svgEl("line", { x1: px, y1: py, x2: nearX, y2: nearY, class: "graph-leader" }, svg)
    : null;
  const ring = svgEl("circle", { cx: px, cy: py, r: 7, class: "graph-ring" }, svg);
  const dot = svgEl("circle", { cx: px, cy: py, r: 6, class: "graph-dot" }, svg);
  const label = svgEl("text", { x: spot.x, y: spot.y, class: "graph-point" }, svg);
  label.textContent = pointText;
  svg.setAttribute("aria-label", (t("graphAria") || "({x}, {y})").split("{x}").join(fmt(x0)).split("{y}").join(fmt(y0)));

  // Legend: colour swatch + the equation as written on the card
  $completeGraphLegend.replaceChildren(...level.equation.split("\n").map((text, i) => {
    const row = document.createElement("div");
    row.className = "complete-graph-key";
    const swatch = document.createElement("span");
    swatch.className = `graph-swatch l${i + 1}`;
    const name = document.createElement("span");
    name.className = "graph-key-name";   // regular font: Press Start 2P has no 式 glyph
    name.textContent = `${t(i ? "graphLine2" : "graphLine1")}:`;
    const eq = document.createElement("span");
    eq.textContent = text;   // keeps ASCII "-": Press Start 2P has no "−" glyph
    row.append(swatch, name, eq);
    return row;
  }));
  $completeGraph.hidden = false;
  $completeGraph.parentElement.classList.add("has-graph");

  if (!REDUCED_MOTION) {
    const ease = "cubic-bezier(.45,.05,.35,1)";
    lineEls.forEach((el, i) => {
      if (!el) return;
      const len = Number(el.dataset.len);
      el.style.strokeDasharray = len;
      graphAnims.push(el.animate([{ strokeDashoffset: len }, { strokeDashoffset: 0 }],
        { duration: 800, delay: 200 + i * 800, easing: ease, fill: "both" }));
    });
    graphAnims.push(
      dot.animate([{ transform: "scale(0)" }, { transform: "scale(1.35)", offset: 0.65 }, { transform: "scale(1)" }],
        { duration: 380, delay: 1900, easing: "ease-out", fill: "both" }),
      ring.animate([{ opacity: 0.9, transform: "scale(1)" }, { opacity: 0, transform: "scale(3)" }],
        { duration: 650, delay: 2000, easing: "ease-out", fill: "both" }),
      label.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 250, delay: 2100, fill: "both" })
    );
    if (leader) graphAnims.push(leader.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 250, delay: 2100, fill: "both" }));
  }
  return true;
}

// ---------- Straight lines: the level's line on the complete card ----------
// "y = 2x - 1" (ASCII "-": Press Start 2P has no "−"), the same form as the Hard answers
function lineEquation(m, c) {
  const xTerm = m === 0 ? "" : m === 1 ? "x" : m === -1 ? "-x" : `${m}x`;
  if (!xTerm) return `y = ${c}`;
  return c === 0 ? `y = ${xTerm}` : `y = ${xTerm} ${c < 0 ? "-" : "+"} ${Math.abs(c)}`;
}

// Draws the line from level.line { m, c, points }: it draws in, then its two points pop in (or, on levels
// without points, the y-intercept). Returns false (and stays hidden) if the level has no line data.
function showLineGraph(level) {
  clearSystemGraph();
  const ln = level.line;
  if (!ln) return false;
  const t = k => LLL_I18N.t(k) || "";
  const { m, c } = ln;
  const marks = ln.points && ln.points.length ? ln.points : [[0, c]];
  const abc = [-m, 1, c];   // y = mx + c as ax + by = c, the shape clipSystemLine() takes

  const range = graphRange([c, ...marks.flat()]);
  const svg = $completeGraphSvg;
  const { X, Y, clipped } = drawGrid(svg, range, "completeGraphClip");
  const seg = clipSystemLine(abc, range.R);
  const lineEl = seg && svgEl("line", { x1: X(seg[0][0]), y1: Y(seg[0][1]), x2: X(seg[1][0]), y2: Y(seg[1][1]), class: "graph-line l1" }, clipped);

  // Points (labels placed clear of the line and of each other), then ticks that keep out from under the labels
  const placed = marks.map(p => drawPoint(svg, range.R, X, Y, p, [abc]));
  const under = (l, tp, r, b) => placed.some(({ spot }) => r > spot.x - 3 && l < spot.x + spot.w + 3 && b > spot.y - 14 && tp < spot.y + 3);
  drawTicks(svg, range, X, Y, under);
  placed.forEach(({ dot, ring, label, leader }) => { svg.append(...[leader, ring, dot, label].filter(Boolean)); });   // back on top of the ticks

  const eq = lineEquation(m, c);
  svg.setAttribute("aria-label", (t("graphLineAria") || "Graph of the line {eq}").split("{eq}").join(eq.replace(/-/g, "−")));
  const row = document.createElement("div");
  row.className = "complete-graph-key";
  const swatch = document.createElement("span");
  swatch.className = "graph-swatch l1";
  const text = document.createElement("span");
  text.textContent = eq;
  row.append(swatch, text);
  $completeGraphLegend.replaceChildren(row);
  $completeGraph.hidden = false;
  $completeGraph.parentElement.classList.add("has-graph");

  if (!REDUCED_MOTION) {
    if (lineEl) drawIn(graphAnims, lineEl, Math.hypot(X(seg[1][0]) - X(seg[0][0]), Y(seg[1][1]) - Y(seg[0][1])), 200, 1000);
    placed.forEach((pt, i) => popPoint(graphAnims, pt, 1300 + i * 250));
  }
  return true;
}

// ---------- Straight lines: the play-screen graph ----------
// Two-point levels (Medium and Hard) show both points from the start. Once the step that works out the
// top and bottom is done ("gradCalc" in Medium, "gradient" in Hard), the run (across, from point 1) and
// the rise (up or down, to point 2) draw in, labelled with the same numbers as the fraction.
// Easy and Hard's rearrange-first levels have no points, so it stays hidden (a drawn line would give it away).
const $playGraph = document.getElementById("playGraph");
const $playGraphSvg = document.getElementById("playGraphSvg");
let playGraphKey = null;   // what's drawn now ("<level id>:<legs shown>"), so a re-render doesn't redraw it
let playAnims = [];

function showPlayGraph(level, stepsDone) {
  const pts = level && level.topic === "line" && level.line && level.line.points;
  if (!pts || pts.length !== 2) {
    playAnims.forEach(a => a.cancel());
    playAnims = [];
    playGraphKey = null;
    $playGraph.hidden = true;
    return;
  }
  const legsAfter = level.steps.findIndex(s => s.action === "gradCalc" || s.action === "gradient") + 1;
  const legs = stepsDone >= legsAfter;
  const key = `${level.id}:${legs}`;
  if (key === playGraphKey) return;
  const animateLegs = legs && playGraphKey === `${level.id}:false`;   // only when they appear mid-level
  playGraphKey = key;
  playAnims.forEach(a => a.cancel());
  playAnims = [];

  const [[x1, y1], [x2, y2]] = pts;
  const { m, c } = level.line;
  const range = graphRange([x1, y1, x2, y2]);
  const svg = $playGraphSvg;
  const { X, Y } = drawGrid(svg, range, "playGraphClip");
  // A faint dotted line between the points: what the gradient measures
  svgEl("line", { x1: X(x1), y1: Y(y1), x2: X(x2), y2: Y(y2), class: "graph-leader" }, svg);

  // The run (across, at point 1's height) and the rise (up or down, at point 2's x), drawn under the points
  let run = null, rise = null;
  if (legs) {
    run = svgEl("line", { x1: X(x1), y1: Y(y1), x2: X(x2), y2: Y(y1), class: "pg-leg pg-run" }, svg);
    rise = svgEl("line", { x1: X(x2), y1: Y(y1), x2: X(x2), y2: Y(y2), class: "pg-leg pg-rise" }, svg);
  }
  const abc = [-m, 1, c];
  const placed = [[x1, y1], [x2, y2]].map((p, i) => drawPoint(svg, range.R, X, Y, p, [abc], `pg-p${i + 1}`));

  // Leg numbers: each takes the first side of its leg that's clear of both point labels and inside the frame
  const boxes = [];   // [left, top, right, bottom] of each leg number, so tick numbers keep out from under them
  const overlaps = ([l, tp, r, b]) => l < GRAPH_PAD || r > GRAPH_PAD + GRAPH_W || tp < GRAPH_PAD || b > GRAPH_PAD + GRAPH_W
    || placed.some(({ spot }) => r > spot.x - 2 && l < spot.x + spot.w + 2 && b > spot.y - 13 && tp < spot.y + 2);
  const legLabel = (text, cls, candidates) => {
    const w = text.length * 11;
    const box = ([x, y, anchor]) => {
      const l = anchor === "middle" ? x - w / 2 : anchor === "end" ? x - w : x;
      return [l, y - 11, l + w, y];
    };
    const pick = candidates.find(cand => !overlaps(box(cand))) || candidates[0];
    boxes.push(box(pick));
    const el = svgEl("text", { x: pick[0], y: pick[1], "text-anchor": pick[2], class: `pg-leg-label ${cls}` }, svg);
    el.textContent = text;
    return el;
  };
  let runLabel = null, riseLabel = null;
  if (legs) {
    const mx = (X(x1) + X(x2)) / 2, my = (Y(y1) + Y(y2)) / 2;
    const away = x2 >= x1 ? 1 : -1;   // the rise's outer side, away from point 1
    // Run: below its leg or above it, at the middle, then towards either end
    runLabel = legLabel(fmtNum(x2 - x1), "pg-run", [
      [mx, Y(y1) + 16, "middle"], [mx, Y(y1) - 7, "middle"],
      [X(x1) + (X(x2) - X(x1)) / 4, Y(y1) + 16, "middle"], [X(x1) + (X(x2) - X(x1)) / 4, Y(y1) - 7, "middle"]
    ]);
    // Rise: on its outer side or inner side, at the middle, then towards point 1's height
    const qy = Y(y1) + (Y(y2) - Y(y1)) / 4 + 5;
    riseLabel = legLabel(fmtNum(y2 - y1), "pg-rise", [
      [X(x2) + 7 * away, my + 5, away > 0 ? "start" : "end"], [X(x2) - 7 * away, my + 5, away > 0 ? "end" : "start"],
      [X(x2) + 7 * away, qy, away > 0 ? "start" : "end"], [X(x2) - 7 * away, qy, away > 0 ? "end" : "start"]
    ]);
  }
  const under = (l, tp, r, b) => placed.some(({ spot }) => r > spot.x - 3 && l < spot.x + spot.w + 3 && b > spot.y - 14 && tp < spot.y + 3)
    || boxes.some(([bl, bt, br, bb]) => r > bl - 3 && l < br + 3 && b > bt - 3 && tp < bb + 3);
  drawTicks(svg, range, X, Y, under);
  // Back on top of the ticks: the points, then the leg numbers
  placed.forEach(({ dot, ring, label, leader }) => { svg.append(...[leader, ring, dot, label].filter(Boolean)); });
  if (legs) svg.append(runLabel, riseLabel);
  svg.setAttribute("aria-label", `(${fmtNum(x1)}, ${fmtNum(y1)}), (${fmtNum(x2)}, ${fmtNum(y2)})`);
  $playGraph.hidden = false;

  if (animateLegs && !REDUCED_MOTION) {
    drawIn(playAnims, run, Math.abs(X(x2) - X(x1)), 0, 450);
    drawIn(playAnims, rise, Math.abs(Y(y2) - Y(y1)), 450, 450);
    playAnims.push(
      runLabel.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 200, delay: 350, fill: "both" }),
      riseLabel.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 200, delay: 800, fill: "both" })
    );
  }
}

// ---------- Inequalities: number line ----------
// The boundary sits in the middle (ticks from boundary − 5 to + 5). The dot pops in,
// then a thick ray draws out to the solution side and ends in an arrowhead.
const $completeNumberLine = document.getElementById("completeNumberLine");
const $completeNumberLineSvg = document.getElementById("completeNumberLineSvg");
const $completeNumberLineLabel = document.getElementById("completeNumberLineLabel");
const NL_W = 280, NL_PAD = 14, NL_Y = 22;
const NL_DONE_MS = 1500;   // when the arrowhead has appeared and Chalky speaks
let nlAnims = [];

// "x ≤ -4" → { sign: "≤", v: -4 }. null for anything else (the card then skips the number line).
function parseInequalityAnswer(text) {
  const m = String(text || "").replace(/\s+/g, "").replace(/−/g, "-").match(/^x([<>≤≥])(-?\d+)$/);
  return m ? { sign: m[1], v: Number(m[2]) } : null;
}

function clearNumberLine() {
  clearTimeout(graphTimer);
  graphTimer = null;
  nlAnims.forEach(a => a.cancel());
  nlAnims = [];
  $completeNumberLine.hidden = true;
}

// Draws the number line for an inequality level; returns false (and stays hidden) if the answer can't be read.
function showNumberLine(level) {
  clearNumberLine();
  const ans = parseInequalityAnswer(level.answer);
  if (!ans) return false;
  const { sign, v } = ans;
  const right = sign === ">" || sign === "≥";
  const filled = sign === "≤" || sign === "≥";
  const fmt = n => (n < 0 ? "−" + Math.abs(n) : String(n));
  const lo = v - 6, hi = v + 6;   // one unit of room past the outer ticks for the arrowhead
  const X = n => NL_PAD + (n - lo) / (hi - lo) * (NL_W - 2 * NL_PAD);

  const svg = $completeNumberLineSvg;
  svg.replaceChildren();
  svgEl("line", { x1: NL_PAD, y1: NL_Y, x2: NL_W - NL_PAD, y2: NL_Y, class: "nl-axis" }, svg);
  for (let n = v - 5; n <= v + 5; n++) {
    svgEl("line", { x1: X(n), y1: NL_Y - 5, x2: X(n), y2: NL_Y + 5, class: "nl-tick" }, svg);
    // Every other number, always including the boundary
    if ((n - v) % 2 === 0) {
      svgEl("text", { x: X(n), y: NL_Y + 21, "text-anchor": "middle", class: n === v ? "graph-tick nl-tick-main" : "graph-tick" }, svg)
        .textContent = fmt(n);
    }
  }

  // Solution side: ray from the boundary to near the edge, then an arrowhead (x goes on forever that way)
  const x0 = X(v);
  const tip = right ? NL_W - NL_PAD : NL_PAD;
  const xEnd = right ? tip - 10 : tip + 10;
  const ray = svgEl("line", { x1: x0, y1: NL_Y, x2: xEnd, y2: NL_Y, class: "nl-ray" }, svg);
  const arrow = svgEl("polygon", { points: `${tip},${NL_Y} ${xEnd},${NL_Y - 7} ${xEnd},${NL_Y + 7}`, class: "nl-arrow" }, svg);
  // Drawn last so it sits on top of the ray (an open dot hides the ray's start)
  const dot = svgEl("circle", { cx: x0, cy: NL_Y, r: 7, class: "nl-dot" + (filled ? " filled" : "") }, svg);

  const text = `x ${sign} ${fmt(v)}`;
  $completeNumberLineLabel.textContent = text;   // IBM Plex Mono has ≤ / ≥ and −
  svg.setAttribute("aria-label", text);
  $completeNumberLine.hidden = false;

  if (!REDUCED_MOTION) {
    const len = Math.abs(xEnd - x0);
    ray.style.strokeDasharray = len;
    nlAnims.push(
      dot.animate([{ transform: "scale(0)" }, { transform: "scale(1.35)", offset: 0.65 }, { transform: "scale(1)" }],
        { duration: 380, delay: 250, easing: "ease-out", fill: "both" }),
      ray.animate([{ strokeDashoffset: len }, { strokeDashoffset: 0 }],
        { duration: 700, delay: 550, easing: "cubic-bezier(.45,.05,.35,1)", fill: "both" }),
      arrow.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 200, delay: 1200, fill: "both" })
    );
  }
  return true;
}

// Runs fn once the graph or number line has finished drawing
// (cancelled by clearSystemGraph / clearNumberLine if the card closes first)
function afterGraphDrawn(fn) {
  graphTimer = setTimeout(fn, $completeNumberLine.hidden ? GRAPH_DONE_MS : NL_DONE_MS);
}

export { showSystemGraph, showLineGraph, clearSystemGraph, showNumberLine, clearNumberLine, afterGraphDrawn, showPlayGraph };