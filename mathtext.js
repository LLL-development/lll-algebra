// LLL Algebra — math text helpers, shared by index.html and chalky.js

// Powers are written x^3 / x^-1 in level data and drawn as a half-size raised <span class="pow">,
// because neither Press Start 2P nor IBM Plex Mono has ⁰ ⁴–⁹ ⁻ (only ¹ ² ³).
// The formula sheet (formulas.js) also uses letter powers: x^m, x^-n, and x^(m+n) for more than
// one character (the brackets are dropped when drawn).
const POW = /\^(\([^()]*\)|[-−]?(?:\d+|[a-z]))/g;

// Subscripts are written x_1 / y_2 (Straight lines: m = (y_2 - y_1)/(x_2 - x_1)) and drawn as a half-size
// lowered <span class="sub">, since neither font has ₁ ₂.
const SUB = /_(\d+)/g;

// Stacked fractions are written {top}/{bottom} (Straight lines' gradient, e.g. {4 - (-5)}/{1 - (-2)})
// and drawn as a top-over-bottom block (.frac, CSS in brand.css). Plain a/b stays inline, as in Fractions.
const FRAC = /\{([^{}]*)\}\/\{([^{}]*)\}/g;

// Square roots are written with the real √ in level data: √16, √x, or √(A/π) for more than one
// term. Neither font has √, so on the pixel card it's drawn as a pixel hook with a bar over the
// root (.sqrt-hook, CSS in brand.css); normal text shows the √ character and keeps the brackets.
const SQRT = /√(\([^()]*\)|\d+|[A-Za-z])/g;

// The hook on Press Start 2P's pixel grid (1 unit = .125em), 10 wide × 11 tall:
// rows 0–1 meet the bar over the root, rows 3–9 match the digits, row 10 is the font's empty row.
const SQRT_HOOK_ROWS = [
  "........##",
  "........##",
  ".......##.",
  ".......##.",
  "......##..",
  "......##..",
  "##...##...",
  ".##..##...",
  "..####....",
  "...##.....",
  "..........",
];
const SQRT_HOOK_PATH = SQRT_HOOK_ROWS.map((row, y) =>
  [...row].map((c, x) => (c === "#" ? `M${x} ${y}h1v1h-1z` : "")).join("")).join("");

// One root span: the hook (pixel contexts), the √ character (normal text), then the root itself.
// Brackets are kept as their own spans so the pixel card can hide them under the bar.
function makeSqrt(inner, minus = "−") {
  const s = document.createElement("span");
  s.className = "sqrt";

  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("class", "sqrt-hook");
  svg.setAttribute("viewBox", "0 0 10 11");
  svg.setAttribute("aria-hidden", "true");
  const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path.setAttribute("d", SQRT_HOOK_PATH);
  svg.appendChild(path);
  s.appendChild(svg);

  const sign = document.createElement("span");
  sign.className = "sqrt-sign";
  sign.textContent = "√";
  s.appendChild(sign);

  const rad = document.createElement("span");
  rad.className = "sqrt-rad";
  const bracketed = inner[0] === "(";
  if (bracketed) rad.appendChild(makeSqrtParen("("));
  appendPowers(rad, bracketed ? inner.slice(1, -1) : inner, minus);
  if (bracketed) rad.appendChild(makeSqrtParen(")"));
  s.appendChild(rad);
  return s;
}

function makeSqrtParen(ch) {
  const p = document.createElement("span");
  p.className = "sqrt-paren";
  p.textContent = ch;
  return p;
}

// One stacked fraction: the top, then the bottom (brand.css draws the line between them).
// minus: "−" in normal text (hyphens become proper minus signs), "-" on the pixel card, which has no "−".
function makeFrac(top, bottom, minus = "−") {
  const f = document.createElement("span");
  f.className = "frac";
  for (const [part, cls] of [[top, "frac-top"], [bottom, "frac-bot"]]) {
    const s = document.createElement("span");
    s.className = cls;
    appendRoots(s, minus === "−" ? part.replace(/-/g, "−") : part, minus);
    f.appendChild(s);
  }
  return f;
}

// One subscript span, e.g. the 1 of x_1
function makeSub(digits) {
  const s = document.createElement("span");
  s.className = "sub";
  s.textContent = digits;
  return s;
}

// One power span. minus: how a negative power's sign is drawn
// ("−" in normal text, "-" on the pixel card, which has no "−").
function makePow(digits, minus = "−") {
  const s = document.createElement("span");
  s.className = "pow";
  s.textContent = digits.replace(/^\((.*)\)$/, "$1").replace(/[-−]/g, minus);
  return s;
}

// Appends text to el, turning each {top}/{bottom} into a stacked fraction, each ^n into a power span,
// each _n into a subscript span and each √… into a root span.
function appendWithPowers(el, text, minus = "−") {
  let last = 0, m;
  const re = new RegExp(FRAC.source, "g");   // local copy, so calls never share lastIndex
  while ((m = re.exec(text))) {
    if (m.index > last) appendRoots(el, text.slice(last, m.index), minus);
    el.appendChild(makeFrac(m[1], m[2], minus));
    last = m.index + m[0].length;
  }
  if (last < text.length) appendRoots(el, text.slice(last), minus);
}

// Roots, powers and subscripts (no fractions: used for plain stretches and inside a fraction).
function appendRoots(el, text, minus = "−") {
  let last = 0, m;
  const re = new RegExp(SQRT.source, "g");   // local copy, so calls never share lastIndex
  while ((m = re.exec(text))) {
    if (m.index > last) appendPowers(el, text.slice(last, m.index), minus);
    el.appendChild(makeSqrt(m[1], minus));
    last = m.index + m[0].length;
  }
  if (last < text.length) appendPowers(el, text.slice(last), minus);
}

// Powers and subscripts only (used for plain stretches and for the inside of a root).
const POW_OR_SUB = new RegExp(`${POW.source}|${SUB.source}`, "g");
function appendPowers(el, text, minus = "−") {
  let last = 0, m;
  const re = new RegExp(POW_OR_SUB.source, "g");
  while ((m = re.exec(text))) {
    if (m.index > last) el.appendChild(document.createTextNode(text.slice(last, m.index)));
    el.appendChild(m[1] !== undefined ? makePow(m[1], minus) : makeSub(m[2]));
    last = m.index + m[0].length;
  }
  if (last < text.length) el.appendChild(document.createTextNode(text.slice(last)));
}

// What the typewriter types one at a time: single characters, with each power ("^3", "^-1"),
// subscript ("_1"), root ("√16", "√(A/π)") and stacked fraction ("{9}/{3}") kept whole so it never appears half-typed.
function eqUnits(text) {
  return text.match(/\{[^{}]*\}\/\{[^{}]*\}|√(?:\([^()]*\)|\d+|[A-Za-z])|\^(?:\([^()]*\)|[-−]?(?:\d+|[a-z]))|_\d+|[\s\S]/gu) || [];
}

// A line's width in characters, for --eq-len: a power's or subscript's digits are half size; a root is the
// hook (1.25) plus what's under the bar (no brackets on the pixel card) plus the bar's overhang;
// a stacked fraction is as wide as its wider half, plus a little padding either side.
function eqLineLen(line) {
  return eqUnits(line).reduce((n, u) => {
    if (u.length > 1 && u[0] === "{") {
      const [, top, bottom] = u.match(/^\{([^{}]*)\}\/\{([^{}]*)\}$/);
      return n + Math.max(eqLineLen(top), eqLineLen(bottom)) + 0.5;
    }
    if (u.length > 1 && u[0] === "_") return n + (u.length - 1) / 2;
    if (u.length > 1 && u[0] === "^") return n + (u[1] === "(" ? u.length - 3 : u.length - 1) / 2;
    if (u.length > 1 && u[0] === "√") {
      const inner = u[1] === "(" ? u.slice(2, -1) : u.slice(1);
      return n + 1.25 + eqLineLen(inner) + 0.125;
    }
    return n + 1;
  }, 0);
}

// Sets text, keeping each math run (e.g. "(x + 2)(x + 3)", "x^3 × x^4") on one line.
// A run is 2+ math tokens joined by " <op> "; the text around it still wraps normally.
const MATH_RUN = /(^|[^A-Za-z0-9^_])([xy0-9()²^_\-−×÷\/.±√]+(?: [+\-−×÷=<>≤≥±] [xy0-9()²^_\-−×÷\/.±√]+)+)/g;

// A minus sign that isn't inside a math run, e.g. both of the ones in "(-2, -5)": after a space, "(" or
// the start, and before a number or a bracket. Hyphens in words ("y-intercept") are left alone.
const LONE_MINUS = /(^|[\s(,])-(?=[\d(])/g;

// A coordinate pair, "(x_1, y_1)" or "(−2, −5)": its space becomes a no-break space so it never splits over two lines
const POINT_PAIR = /\(([^()\s,]+), ([^()\s,]+)\)/g;

function setMathText(el, text) {
  el.textContent = "";
  text = text.replace(LONE_MINUS, "$1−").replace(POINT_PAIR, "($1,\u00A0$2)");
  // Stacked fractions first, each kept whole on one line; the text between them goes through the math runs
  let last = 0, m;
  const re = new RegExp(FRAC.source, "g");
  while ((m = re.exec(text))) {
    if (m.index > last) setMathRuns(el, text.slice(last, m.index));
    const span = document.createElement("span");
    span.className = "nowrap";
    span.appendChild(makeFrac(m[1], m[2]));
    el.appendChild(span);
    last = m.index + m[0].length;
  }
  if (last < text.length) setMathRuns(el, text.slice(last));
}

function setMathRuns(el, text) {
  let last = 0, m;
  MATH_RUN.lastIndex = 0;
  while ((m = MATH_RUN.exec(text))) {
    const start = m.index + m[1].length;
    appendWithPowers(el, text.slice(last, start));
    const span = document.createElement("span");
    span.className = "nowrap";
    appendWithPowers(span, m[2].replace(/-/g, "−")); // proper minus, matching the choice buttons
    el.appendChild(span);
    last = start + m[2].length;
  }
  appendWithPowers(el, text.slice(last));
}

export { setMathText, appendWithPowers, makePow, eqUnits, eqLineLen };