// LLL Algebra — math text helpers, shared by index.html and chalky.js

// Powers are written x^3 / x^-1 in level data and drawn as a half-size raised <span class="pow">,
// because neither Press Start 2P nor IBM Plex Mono has ⁰ ⁴–⁹ ⁻ (only ¹ ² ³).
const POW = /\^([-−]?\d+)/g;

// One power span. minus: how a negative power's sign is drawn
// ("−" in normal text, "-" on the pixel card, which has no "−").
function makePow(digits, minus = "−") {
  const s = document.createElement("span");
  s.className = "pow";
  s.textContent = digits.replace(/[-−]/, minus);
  return s;
}

// Appends text to el, turning each ^n into a power span.
function appendWithPowers(el, text, minus = "−") {
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
// ("^3", "^-1") kept whole so it never appears half-typed.
function eqUnits(text) {
  return text.match(/\^[-−]?\d+|[\s\S]/gu) || [];
}

// A line's width in characters, for --eq-len: a power's digits are half size.
function eqLineLen(line) {
  return eqUnits(line).reduce((n, u) => n + (u.length > 1 && u[0] === "^" ? (u.length - 1) / 2 : 1), 0);
}

// Sets text, keeping each math run (e.g. "(x + 2)(x + 3)", "x^3 × x^4") on one line.
// A run is 2+ math tokens joined by " <op> "; the text around it still wraps normally.
const MATH_RUN = /(^|[^A-Za-z0-9])([xy0-9()²^\-−×÷\/.]+(?: [+\-−×÷=<>≤≥] [xy0-9()²^\-−×÷\/.]+)+)/g;

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