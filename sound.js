// LLL Algebra — sound effects + the sound on/off setting
// sfx.* is called from index.html; the Settings screen there reads and changes the
// on/off setting with isSoundOn() / setSoundOn().
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
  },
  // Endless (Chalky's Lair): boss Chalky's evil laugh when a heart breaks, and at game over.
  // Three falling "ha"s, each split in two for a wobble, then a low rumble at the end.
  // Uses the buzzier sawtooth wave on purpose, so it sounds different from the friendly blips.
  evilLaugh() {
    const ctx = getAudio(); if (!ctx) return;
    [392, 330, 262].forEach((f, i) => {
      const t = i * 0.17;
      tone(ctx, f, t, 0.06, "sawtooth", 0.7, f * 0.85);
      tone(ctx, f * 0.9, t + 0.06, 0.07, "sawtooth", 0.6, f * 0.7);
    });
    tone(ctx, 196, 0.52, 0.28, "triangle", 1.1, 110);
  }
};

// ---------- Boss music (Endless) ----------
// A spooky 4-bar chiptune loop (112 BPM, A minor): a bouncing triangle bass with a tense D# before each
// return, a sparse square-wave "villain" melody, and a soft tick-tock on every beat. Same tone() blips as
// the effects, kept well under them. startMusic() when a run starts (always after a tap), stopMusic() at
// game over and when leaving. A small scheduler queues the next 0.3 s of notes every 100 ms, so the loop
// keeps time; it pauses while the tab is hidden and stops for good when sound is switched off.
const MUSIC_EIGHTH = 60 / 112 / 2;   // seconds per eighth note
const MUSIC_NOTE = {
  F2: 87.31, A2: 110, B2: 123.47, C3: 130.81, Ds3: 155.56, E3: 164.81,
  E4: 329.63, F4: 349.23, Gs4: 415.3, A4: 440, B4: 493.88, C5: 523.25, D5: 587.33, E5: 659.25
};
// One row per bar, one slot per eighth note (null = rest)
const MUSIC_BASS = [
  ["A2", null, "A2", "E3", "A2", null, "Ds3", "E3"],
  ["F2", null, "F2", "C3", "F2", null, "B2", "C3"],
  ["A2", null, "A2", "E3", "A2", null, "Ds3", "E3"],
  ["E3", null, "E3", "B2", "E3", null, "Ds3", "E3"]
];
const MUSIC_LEAD = [
  ["A4", null, "C5", null, "B4", null, "Gs4", null],
  ["F4", null, "A4", null, "Gs4", null, "E4", null],
  ["A4", null, "C5", null, "E5", null, "D5", null],
  ["C5", null, "B4", null, "Gs4", null, null, null]
];
const MUSIC_STEPS = MUSIC_BASS.length * 8;
let music = null;   // { timer, next: audio time of the next eighth note, step: 0..31 } while playing

function playMusicStep(ctx, step, at) {
  const bar = Math.floor(step / 8), k = step % 8;
  const bass = MUSIC_BASS[bar][k], lead = MUSIC_LEAD[bar][k];
  if (bass) tone(ctx, MUSIC_NOTE[bass], at, MUSIC_EIGHTH * 0.9, "triangle", 0.45);
  if (lead) tone(ctx, MUSIC_NOTE[lead], at, MUSIC_EIGHTH * 1.6, "square", 0.1);
  if (k % 2 === 0) tone(ctx, k % 4 === 0 ? 1800 : 1350, at, 0.03, "triangle", 0.1);   // tick-tock
}

function scheduleMusic() {
  if (!music) return;
  if (!soundOn) { stopMusic(); return; }
  if (document.hidden) { music.next = 0; return; }   // paused; picks up from "now" when the tab is back
  const ctx = getAudio(); if (!ctx) return;
  if (music.next < ctx.currentTime) music.next = ctx.currentTime + 0.05;
  while (music.next < ctx.currentTime + 0.3) {
    playMusicStep(ctx, music.step, music.next - ctx.currentTime);
    music.next += MUSIC_EIGHTH;
    music.step = (music.step + 1) % MUSIC_STEPS;
  }
}

function startMusic() {
  if (music || !getAudio()) return;   // already playing, or sound is off
  music = { next: 0, step: 0, timer: setInterval(scheduleMusic, 100) };
  scheduleMusic();
}

function stopMusic() {
  if (!music) return;
  clearInterval(music.timer);
  music = null;   // notes already queued (at most 0.3 s) finish on their own
}

// The on/off setting (Settings screen in index.html). It has its own key, so "Reset progress" leaves it alone.
function isSoundOn() { return soundOn; }

function setSoundOn(on) {
  soundOn = !!on;
  try { localStorage.setItem(SOUND_KEY, soundOn ? "on" : "off"); } catch (e) { /* fail silently */ }
  if (soundOn) sfx.step(1);   // short blip so the player hears sound is back on
  else stopMusic();          // boss music goes quiet straight away too
}

export { sfx, isSoundOn, setSoundOn, startMusic, stopMusic };