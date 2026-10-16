// LLL Algebra — math text helpers, shared by index.html and chalky.js

// Powers are written x^3 / x^-1 in level data and drawn as a half-size raised <span class="pow">,
// because neither Press Start 2P nor IBM Plex Mono has ⁰ ⁴–⁹ ⁻ (only ¹ ² ³).
const POW = /\^([-−]?\d+)/g;

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

// One power span. minus: how a negative power's sign is drawn
// ("−" in normal text, "-" on the pixel card, which has no "−").
function makePow(digits, minus = "−") {
  const s = document.createElement("span");
  s.className = "pow";
  s.textContent = digits.replace(/[-−]/, minus);
  return s;
}

// Appends text to el, turning each ^n into a power span and each √… into a root span.
function appendWithPowers(el, text, minus = "−") {
  let last = 0, m;
  const re = new RegExp(SQRT.source, "g");   // local copy, so calls never share lastIndex
  while ((m = re.exec(text))) {
    if (m.index > last) appendPowers(el, text.slice(last, m.index), minus);
    el.appendChild(makeSqrt(m[1], minus));
    last = m.index + m[0].length;
  }
  if (last < text.length) appendPowers(el, text.slice(last), minus);
}

// Powers only (used for plain stretches and for the inside of a root).
function appendPowers(el, text, minus = "−") {
  let last = 0, m;
  POW.lastIndex = 0;
  while ((m = POW.exec(text))) {
    if (m.index > last) el.appendChild(document.createTextNode(text.slice(last, m.index)));
    el.appendChild(makePow(m[1], minus));
    last = m.index + m[0].length;
  }
  if (last < text.length) el.appendChild(document.createTextNode(text.slice(last)));
}

// What the typewriter types one at a time: single characters, with each power
// ("^3", "^-1") and each root ("√16", "√(A/π)") kept whole so it never appears half-typed.
function eqUnits(text) {
  return text.match(/√(?:\([^()]*\)|\d+|[A-Za-z])|\^[-−]?\d+|[\s\S]/gu) || [];
}

// A line's width in characters, for --eq-len: a power's digits are half size; a root is the
// hook (1.25) plus what's under the bar (no brackets on the pixel card) plus the bar's overhang.
function eqLineLen(line) {
  return eqUnits(line).reduce((n, u) => {
    if (u.length > 1 && u[0] === "^") return n + (u.length - 1) / 2;
    if (u.length > 1 && u[0] === "√") {
      const inner = u[1] === "(" ? u.slice(2, -1) : u.slice(1);
      return n + 1.25 + eqLineLen(inner) + 0.125;
    }
    return n + 1;
  }, 0);
}

// Sets text, keeping each math run (e.g. "(x + 2)(x + 3)", "x^3 × x^4") on one line.
// A run is 2+ math tokens joined by " <op> "; the text around it still wraps normally.
const MATH_RUN = /(^|[^A-Za-z0-9^])([xy0-9()²^\-−×÷\/.±√]+(?: [+\-−×÷=<>≤≥±] [xy0-9()²^\-−×÷\/.±√]+)+)/g;

function setMathText(el, text) {
  el.textContent = "";
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