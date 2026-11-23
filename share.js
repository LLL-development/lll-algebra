// LLL Algebra — sharing a result (Today's Challenge now, Endless later)
// Text: buildShareText() / dailyShareText(), sent by shareResult().
// Image: makeDailyCard() draws a 1080×1080 PNG card on a canvas; shareCard() sends it:
//   phones → the share sheet with the picture (text as the caption)
//   desktop → the picture copied to the clipboard (Chrome / Edge), else downloaded (Firefox)
//   anything that can't take a picture → the text version

import { BUDDY_SVG } from "./chalky.js";
import { eqUnits } from "./mathtext.js";

const SHARE_URL = "https://lll-algebra.pages.dev";

// "{n}-day streak" + { n: 5 } → "5-day streak"
function fmt(str, vars = {}) {
  return (str || "").replace(/\{(\w+)\}/g, (m, k) => (k in vars ? vars[k] : m));
}

// Short date in the current language: "23 Nov" / "11月23日"
function shareDate(d = new Date()) {
  const locale = LLL_I18N.lang() === "ja" ? "ja-JP" : "en-GB";
  return d.toLocaleDateString(locale, { day: "numeric", month: "short" });
}

// "2026-11-23", for the file name
function dateKey(d = new Date()) {
  const pad = n => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

const isTouch = () => !!(window.matchMedia && window.matchMedia("(pointer: coarse)").matches);

// ---------- text ----------

// title line, then the non-empty details joined with shareSep, then the link
function buildShareText({ title, details = [], url = SHARE_URL }) {
  const lines = [title];
  const parts = details.filter(Boolean);
  if (parts.length) lines.push(parts.join(LLL_I18N.t("shareSep")));
  lines.push(url);
  return lines.join("\n");
}

// Today's Challenge caption: a first-person invite (streak only from 2 days up), then the link on its own line,
// so chat apps make it tappable. The topic and date are already on the picture.
function dailyShareText({ streak = 0 }) {
  const line = streak >= 2 ? fmt(LLL_I18N.t("shareInviteStreak"), { n: streak }) : LLL_I18N.t("shareInvite");
  return `${line}\n${SHARE_URL}`;
}

// Clipboard API first; the old textarea trick covers http:// and older browsers
async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (e) {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.cssText = "position:fixed;top:0;left:0;opacity:0";
    document.body.appendChild(ta);
    ta.select();
    let ok = false;
    try { ok = document.execCommand("copy"); } catch (e2) { ok = false; }
    ta.remove();
    return ok;
  }
}

// Returns "shared" | "copied" | "cancelled" | "failed".
// Desktop Chrome/Edge also have navigator.share (the Windows share dialog), so it's limited
// to touch screens; desktop copies instead.
async function shareResult(text) {
  if (navigator.share && isTouch()) {
    try {
      await navigator.share({ text });
      return "shared";
    } catch (e) {
      if (e && e.name === "AbortError") return "cancelled";   // closed the sheet: say nothing
      // anything else: fall back to copying
    }
  }
  return (await copyText(text)) ? "copied" : "failed";
}

// ---------- image card ----------
// Always the dark chalkboard look (same colours as brand.css's dark theme), whatever the player's theme.
const C = {
  bg: "#14181d", surface: "#1c2128", ink: "#eee9df", muted: "#8d9199", border: "#2b313a",
  accent: "#e2a06b", correct: "#7fc9a3", buddyLine: "#9aa0a8"
};
const SANS = '"Space Grotesk", "Noto Sans JP", "Hiragino Sans", "Yu Gothic", sans-serif';
const MONO = '"IBM Plex Mono", ui-monospace, monospace';
const PIXEL = '"Press Start 2P", "IBM Plex Mono", monospace';   // ≤ ≥ √ ± fall back to Plex Mono

// The canvas only uses a web font once it has loaded, so wait for the three the card uses
function fontsReady() {
  if (!document.fonts || !document.fonts.load) return Promise.resolve();
  return Promise.all(['48px "Press Start 2P"', '700 52px "Space Grotesk"', '600 36px "IBM Plex Mono"']
    .map(f => document.fonts.load(f).catch(() => {}))).then(() => {});
}

// Chalky's celebrating sprite as an <img>. var(--buddy-line) means nothing outside the page,
// so his outline gets the dark theme's colour; xmlns is needed for an SVG loaded as an image.
function loadChalky(size) {
  const svg = BUDDY_SVG.celebrating
    .replace("<svg ", `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" `)
    .replace(/var\(--buddy-line\)/g, C.buddyLine);
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
  });
}

// A rectangle with stepped pixel corners, like the .pixel-card clip-path
function notchedPath(ctx, x, y, w, h, n) {
  ctx.beginPath();
  ctx.moveTo(x, y + n); ctx.lineTo(x + n, y + n); ctx.lineTo(x + n, y);
  ctx.lineTo(x + w - n, y); ctx.lineTo(x + w - n, y + n); ctx.lineTo(x + w, y + n);
  ctx.lineTo(x + w, y + h - n); ctx.lineTo(x + w - n, y + h - n); ctx.lineTo(x + w - n, y + h);
  ctx.lineTo(x + n, y + h); ctx.lineTo(x + n, y + h - n); ctx.lineTo(x, y + h - n);
  ctx.closePath();
}

// Solved pixel card: green offset shadow, light border, dark face
function drawPixelCard(ctx, { x, y, w, h }) {
  ctx.fillStyle = C.correct; notchedPath(ctx, x + 12, y + 12, w, h, 16); ctx.fill();
  ctx.fillStyle = C.ink;     notchedPath(ctx, x, y, w, h, 16); ctx.fill();
  ctx.fillStyle = C.surface; notchedPath(ctx, x + 8, y + 8, w - 16, h - 16, 8); ctx.fill();
}

function roundRectPath(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

// Biggest font size (up to `size`) at which `text` fits in maxW
function fitFont(ctx, text, weight, size, family, maxW) {
  let s = size;
  ctx.font = `${weight} ${s}px ${family}`;
  while (s > 16 && ctx.measureText(text).width > maxW) {
    s -= 2;
    ctx.font = `${weight} ${s}px ${family}`;
  }
  return s;
}

// One equation line → runs of plain text / powers (x^3) / subscripts (x_1), using the game's own eqUnits().
// A stacked fraction ({9}/{3}) is written inline as (9)/(3), as Chalky says it in a replay.
function eqRuns(line) {
  return eqUnits(line).map(u => {
    if (u.length > 1 && u[0] === "^") return { text: u.slice(1), kind: "sup" };
    if (u.length > 1 && u[0] === "_") return { text: u.slice(1), kind: "sub" };
    if (u.length > 1 && u[0] === "{") {
      return { text: u.replace(/\{([^{}]*)\}\/\{([^{}]*)\}/g, "($1)/($2)").replace(/_(\w)/g, "$1"), kind: "text" };
    }
    return { text: u, kind: "text" };
  });
}

function runsWidth(ctx, runs, s) {
  return runs.reduce((w, r) => {
    ctx.font = `${r.kind === "text" ? s : Math.round(s * 0.55)}px ${PIXEL}`;
    return w + ctx.measureText(r.text).width;
  }, 0);
}

// The equation in the pixel font, centred on (cx, cy), shrunk so its longest line fits maxW.
// Systems' "\n" gives two lines.
function drawEquation(ctx, equation, cx, cy, maxW, maxSize) {
  const lines = equation.split("\n").map(eqRuns);
  const widest = Math.max(...lines.map(runs => runsWidth(ctx, runs, maxSize)));
  const s = Math.min(maxSize, Math.floor(maxSize * maxW / widest));
  const lineH = s * 1.7;
  ctx.fillStyle = C.ink;
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  lines.forEach((runs, i) => {
    const y = cy + (i - (lines.length - 1) / 2) * lineH;
    let x = cx - runsWidth(ctx, runs, s) / 2;
    runs.forEach(r => {
      const small = r.kind !== "text";
      ctx.font = `${small ? Math.round(s * 0.55) : s}px ${PIXEL}`;
      const dy = r.kind === "sup" ? -s * 0.4 : r.kind === "sub" ? s * 0.3 : 0;
      ctx.fillText(r.text, x, y + dy);
      x += ctx.measureText(r.text).width;
    });
  });
}

// Today's Challenge card, 1080×1080. Shows the equation without its answer, so friends can try it.
async function drawDailyCard({ equation, topicName, tierName, streak = 0 }) {
  const t = k => LLL_I18N.t(k) || "";
  const W = 1080;
  const [, chalky] = await Promise.all([fontsReady(), loadChalky(260)]);

  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = W;
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = C.bg;
  ctx.fillRect(0, 0, W, W);

  // Header: brand on the left, date on the right
  ctx.textBaseline = "alphabetic";
  ctx.textAlign = "left";
  ctx.fillStyle = C.ink;
  ctx.font = `700 52px ${SANS}`;
  ctx.fillText(t("brand") || "LLL Algebra", 80, 120);
  ctx.textAlign = "right";
  ctx.fillStyle = C.muted;
  ctx.font = `600 34px ${MONO}`;
  ctx.fillText(shareDate(), 1000, 118);

  // "Today's Challenge ✓"
  ctx.textAlign = "left";
  ctx.fillStyle = C.accent;
  ctx.font = `700 46px ${SANS}`;
  const title = t("dailyTitle");
  ctx.fillText(title, 80, 200);
  // ✓ as a thick drawn tick (Space Grotesk has no ✓, and the fallback glyph is thin)
  const tx = 80 + ctx.measureText(title).width + 22;
  ctx.strokeStyle = C.accent;
  ctx.lineWidth = 7;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.beginPath();
  ctx.moveTo(tx, 184); ctx.lineTo(tx + 12, 196); ctx.lineTo(tx + 34, 170);
  ctx.stroke();

  // The equation on a solved pixel card, "Fractions · Easy" above it
  const card = { x: 80, y: 250, w: 908, h: 360 };
  drawPixelCard(ctx, card);
  ctx.textAlign = "center";
  ctx.fillStyle = C.muted;
  const topicLine = `${topicName}${t("shareSep")}${tierName}`;   // " · " in EN, "・" in JA
  fitFont(ctx, topicLine, 600, 32, SANS, card.w - 80);
  ctx.fillText(topicLine, card.x + card.w / 2, card.y + 72);
  drawEquation(ctx, equation, card.x + card.w / 2, card.y + card.h / 2 + 30, card.w - 120, 64);

  // Chalky celebrating, with a speech bubble: the streak (or "Challenge complete!") and "Can you solve it?"
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(chalky, 70, 650, 260, 260);
  const b = { x: 370, y: 680, w: 630, h: 200 };
  const tailY = b.y + b.h / 2;
  ctx.fillStyle = C.surface;
  ctx.strokeStyle = C.border;
  ctx.lineWidth = 4;
  ctx.beginPath();   // tail pointing back at Chalky
  ctx.moveTo(b.x + 2, tailY - 22); ctx.lineTo(b.x - 26, tailY); ctx.lineTo(b.x + 2, tailY + 22);
  ctx.closePath(); ctx.fill(); ctx.stroke();
  roundRectPath(ctx, b.x, b.y, b.w, b.h, 24);
  ctx.fill(); ctx.stroke();
  ctx.fillRect(b.x - 2, tailY - 19, 6, 38);   // join the tail to the bubble (hides the border between them)

  const headline = streak >= 2 ? fmt(t("shareStreak"), { n: streak }) : t("dailyClear");
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = C.ink;
  fitFont(ctx, headline, 700, 56, SANS, b.w - 80);
  ctx.fillText(headline, b.x + 40, b.y + 88);
  ctx.fillStyle = C.muted;
  fitFont(ctx, t("shareCardCta"), 500, 40, SANS, b.w - 80);
  ctx.fillText(t("shareCardCta"), b.x + 40, b.y + 152);

  // Footer: a rule and the link
  ctx.fillStyle = C.border;
  ctx.fillRect(80, 950, 920, 3);
  ctx.textAlign = "center";
  ctx.fillStyle = C.accent;
  ctx.font = `600 36px ${MONO}`;
  ctx.fillText(SHARE_URL.replace(/^https:\/\//, ""), W / 2, 1018);

  return canvas;
}

// → Promise<Blob> (PNG). Call it when the complete card opens, so the picture is ready before the tap.
async function makeDailyCard(opts) {
  const canvas = await drawDailyCard(opts);
  return new Promise((resolve, reject) => canvas.toBlob(b => (b ? resolve(b) : reject(new Error("toBlob failed"))), "image/png"));
}

function downloadBlob(blob, filename) {
  try {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    return true;
  } catch (e) {
    return false;
  }
}

// Returns "shared" | "copiedImage" | "saved" | "copied" | "cancelled" | "failed".
// blob: the ready PNG (or null if drawing failed, which goes straight to the text version).
// Call it straight from the click handler with no await before it: the share sheet and the clipboard need the tap.
async function shareCard({ blob, text }) {
  const filename = `lll-algebra-${dateKey()}.png`;
  if (blob && isTouch() && navigator.canShare) {
    const file = new File([blob], filename, { type: "image/png" });
    if (navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({ files: [file], text });
        return "shared";
      } catch (e) {
        if (e && e.name === "AbortError") return "cancelled";
        // anything else: try the text version below
      }
    }
  }
  if (blob && !isTouch()) {
    if (window.ClipboardItem && navigator.clipboard && navigator.clipboard.write) {
      try {
        await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
        return "copiedImage";
      } catch (e) { /* Firefox, or no permission: download instead */ }
    }
    if (downloadBlob(blob, filename)) return "saved";
  }
  return shareResult(text);
}

export { SHARE_URL, buildShareText, dailyShareText, shareResult, makeDailyCard, shareCard };