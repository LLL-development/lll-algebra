// LLL Algebra — Systems graph on the level-complete card
// Both lines of a system, read from its equation text, drawn crossing at the answer.
// index.html calls showSystemGraph() / clearSystemGraph() / afterGraphDrawn().

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
function placePointLabel(lines, R, px, py, text) {
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
  const fmt = n => (n < 0 ? "−" + Math.abs(n) : String(n));
  const { x: x0, y: y0 } = level.answer;

  // Square graph, same unit on both axes: crossing + 2 of room, never smaller than ±5
  let R = Math.max(5, Math.abs(x0) + 2, Math.abs(y0) + 2);
  const step = R <= 8 ? 1 : 2;
  R = Math.ceil(R / step) * step;
  const labelEvery = step * 2;
  const X = x => GRAPH_PAD + (x + R) / (2 * R) * GRAPH_W;
  const Y = y => GRAPH_PAD + (R - y) / (2 * R) * GRAPH_W;

  const svg = $completeGraphSvg;
  svg.replaceChildren();
  const clip = svgEl("clipPath", { id: "completeGraphClip" }, svgEl("defs", {}, svg));
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

  const lineGroup = svgEl("g", { "clip-path": "url(#completeGraphClip)" }, svg);
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

  // Tick numbers go on top of the lines (their halo keeps them readable where a line passes),
  // except any that would sit under the "(x, y)" label
  for (let v = -R + step; v < R; v += step) {
    if (v === 0 || v % labelEvery !== 0) continue;
    const tw = fmt(v).length * 7;
    if (!underLabel(X(v) - tw / 2, Y(0) + 4, X(v) + tw / 2, Y(0) + 14))
      svgEl("text", { x: X(v), y: Y(0) + 13, "text-anchor": "middle", class: "graph-tick" }, svg).textContent = fmt(v);
    if (!underLabel(X(0) - 5 - tw, Y(v) - 6, X(0) - 5, Y(v) + 4))
      svgEl("text", { x: X(0) - 5, y: Y(v) + 3, "text-anchor": "end", class: "graph-tick" }, svg).textContent = fmt(v);
  }

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

// Runs fn once the graph has finished drawing (cancelled by clearSystemGraph if the card closes first)
function afterGraphDrawn(fn) {
  graphTimer = setTimeout(fn, GRAPH_DONE_MS);
}

export { showSystemGraph, clearSystemGraph, afterGraphDrawn };