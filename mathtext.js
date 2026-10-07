// LLL Algebra — setMathText(): shared by index.html and chalky.js

// Sets text, keeping each math run (e.g. "(x + 2)(x + 3)", "x + y = 7") on one line.
// A run is 2+ math tokens joined by " <op> "; the text around it still wraps normally.
const MATH_RUN = /(^|[^A-Za-z0-9])([xy0-9()²\-−×÷\/.]+(?: [+\-−×÷=<>≤≥] [xy0-9()²\-−×÷\/.]+)+)/g;

function setMathText(el, text) {
  el.textContent = "";
  let last = 0, m;
  MATH_RUN.lastIndex = 0;
  while ((m = MATH_RUN.exec(text))) {
    const start = m.index + m[1].length;
    el.appendChild(document.createTextNode(text.slice(last, start)));
    const span = document.createElement("span");
    span.className = "nowrap";
    span.textContent = m[2].replace(/-/g, "−"); // proper minus, matching the choice buttons
    el.appendChild(span);
    last = start + m[2].length;
  }
  el.appendChild(document.createTextNode(text.slice(last)));
}

export { setMathText };