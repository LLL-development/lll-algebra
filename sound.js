// LLL Algebra — sound effects + the sound on/off button
// sfx.* is called from index.html; updateSoundBtn() is called there too (after the strings
// are loaded, and again on language change) so the button's label is in the right language.
// Short chiptune blips made with the Web Audio API, so there are no audio files to ship.
// The AudioContext is created on the first sound, which always follows a tap,
// so browsers allow it to play.
const SOUND_KEY = "lll_algebra_sound";
const SOUND_VOLUME = 0.15;   // master volume (0–1), kept low on purpose
let soundOn = true;
try { soundOn = localStorage.getItem(SOUND_KEY) !== "off"; } catch (e) { /* fail silently */ }
let audioCtx = null;

function getAudio() {
  if (!soundOn || document.hidden) return null;
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return null;
  if (!audioCtx) audioCtx = new AC();
  if (audioCtx.state === "suspended") audioCtx.resume();
  return audioCtx;
}

// One note: frequency (Hz), start offset and length (seconds), waveform, relative volume,
// and an optional pitch slide.
function tone(ctx, freq, start, length, type = "square", vol = 1, slideTo = null) {
  const t0 = ctx.currentTime + start;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t0 + length);
  gain.gain.setValueAtTime(0.0001, t0);
  gain.gain.exponentialRampToValueAtTime(SOUND_VOLUME * vol, t0 + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + length);
  osc.connect(gain).connect(ctx.destination);
  osc.start(t0);
  osc.stop(t0 + length + 0.02);
}

// All notes come from C major, so every sound feels like part of one family.
const NOTE = { C5: 523.25, E5: 659.25, G5: 783.99, A5: 880, C6: 1046.5, E6: 1318.5, G6: 1568 };
const STEP_NOTES = [NOTE.C5, NOTE.E5, NOTE.G5, NOTE.A5, NOTE.C6];

const sfx = {
  // Correct step: each step plays one note higher, so solving feels like climbing.
  step(n) {
    const ctx = getAudio(); if (!ctx) return;
    tone(ctx, STEP_NOTES[Math.min(n - 1, STEP_NOTES.length - 1)], 0, 0.09, "square", 0.8);
  },
  // Last step: a quick rising arpeggio.
  solve() {
    const ctx = getAudio(); if (!ctx) return;
    [NOTE.C5, NOTE.E5, NOTE.G5, NOTE.C6].forEach((f, i) => tone(ctx, f, i * 0.07, 0.12, "square", 0.8));
  },
  // Wrong tap: a soft low thud, not a buzzer, since mistakes are part of learning.
  wrong() {
    const ctx = getAudio(); if (!ctx) return;
    tone(ctx, 196, 0, 0.16, "triangle", 1.2, 130);
  },
  // Streak bonus on the level-complete card.
  streak() {
    const ctx = getAudio(); if (!ctx) return;
    [NOTE.G5, NOTE.C6, NOTE.E6].forEach((f, i) => tone(ctx, f, i * 0.05, 0.08, "square", 0.6));
  },
  // Achievement toast: a soft two-note chime.
  achievement() {
    const ctx = getAudio(); if (!ctx) return;
    tone(ctx, NOTE.E6, 0, 0.12, "triangle");
    tone(ctx, NOTE.G6, 0.1, 0.25, "triangle");
  },
  // Big moments (tier / topic complete, Today's Challenge, Mixed Review finished): plays with the big confetti.
  fanfare() {
    const ctx = getAudio(); if (!ctx) return;
    [NOTE.C5, NOTE.E5, NOTE.G5, NOTE.C6].forEach((f, i) => tone(ctx, f, i * 0.1, 0.1, "square", 0.8));
    tone(ctx, NOTE.E6, 0.42, 0.4, "square", 0.8);
    tone(ctx, NOTE.C5, 0.42, 0.4, "triangle");
  }
};

const $soundBtn = document.getElementById("soundBtn");
function updateSoundBtn() {
  $soundBtn.textContent = soundOn ? "🔊" : "🔇";
  $soundBtn.setAttribute("aria-label", soundOn
    ? (LLL_I18N.t("soundMuteAria") || "Mute sound")
    : (LLL_I18N.t("soundUnmuteAria") || "Turn sound on"));
}
$soundBtn.addEventListener("click", () => {
  soundOn = !soundOn;
  try { localStorage.setItem(SOUND_KEY, soundOn ? "on" : "off"); } catch (e) { /* fail silently */ }
  updateSoundBtn();
  if (soundOn) sfx.step(1);   // short blip so the player hears sound is back on
});

export { sfx, updateSoundBtn };