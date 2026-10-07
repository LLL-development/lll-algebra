// LLL Algebra — background and celebration effects:
// the floating math symbols behind the page, and the big confetti burst for big moments.

import { sfx } from "./sound.js";

const $floatingSymbolsLayer = document.getElementById("floatingSymbolsLayer");
const $grandConfettiLayer = document.getElementById("grandConfettiLayer");

const FLOATING_SYMBOLS = ["+", "−", "×", "÷", "=", "x", "y", "(", ")", "√", "%", "π", "∞", "<", ">", "≤", "≥", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];

function randomSymbolValue() {
  return FLOATING_SYMBOLS[Math.floor(Math.random() * FLOATING_SYMBOLS.length)];
}

function applySymbolProps(el) {
  el.textContent = randomSymbolValue();
  el.style.left = `${Math.random() * 100}vw`;
  el.style.top = `${Math.random() * 100}vh`;
  el.style.fontSize = `${14 + Math.random() * 18}px`;
  const rand = () => Math.random() * 200 - 100; // −100px to +100px per axis
  el.style.setProperty("--p1x", `${rand()}px`);
  el.style.setProperty("--p1y", `${rand()}px`);
  el.style.setProperty("--p2x", `${rand()}px`);
  el.style.setProperty("--p2y", `${rand()}px`);
  el.style.setProperty("--p3x", `${rand()}px`);
  el.style.setProperty("--p3y", `${rand()}px`);
  el.style.animationDuration = `${10 + Math.random() * 6}s`;
}

function scheduleRespawn(el) {
  const lifetime = 5000 + Math.random() * 5000; // 5–10s visible
  setTimeout(() => {
    el.classList.add("fading");
    setTimeout(() => {
      applySymbolProps(el);
      el.classList.remove("fading");
      scheduleRespawn(el);
    }, 1000); // matches the CSS opacity transition duration
  }, lifetime);
}

function initFloatingSymbols() {
  const count = 10;
  for (let i = 0; i < count; i++) {
    const s = document.createElement("span");
    s.className = "floating-symbol";
    applySymbolProps(s);
    s.style.animationDelay = `${Math.random() * 3}s`;
    $floatingSymbolsLayer.appendChild(s);
    scheduleRespawn(s);
  }
}

// big = topic mastered: twice the pieces, falling for longer, in a wider wave
function burstGrandConfetti({ big = false } = {}) {
  sfx.fanfare();
  const colors = ["var(--accent)", "var(--correct)", "var(--muted)"];
  const pieceCount = big ? 160 : 80;
  for (let i = 0; i < pieceCount; i++) {
    const piece = document.createElement("span");
    piece.className = "grand-confetti-piece";
    const left = Math.random() * 100;
    const duration = (big ? 3.2 : 2.2) + Math.random() * 1.4;
    const delay = Math.random() * (big ? 1.2 : 0.4);
    const rotate = Math.random() * 720 - 360;
    piece.style.left = `${left}vw`;
    piece.style.setProperty("--rotate", `${rotate}deg`);
    piece.style.animationDuration = `${duration}s`;
    piece.style.animationDelay = `${delay}s`;
    piece.style.background = colors[Math.floor(Math.random() * colors.length)];
    $grandConfettiLayer.appendChild(piece);
    piece.addEventListener("animationend", () => piece.remove());
  }
}

export { initFloatingSymbols, burstGrandConfetti };