// LLL Algebra — level data check.
// Run with: npm run check
// Catches authoring slips in levels.js before they reach players: duplicate ids, hint counts,
// malformed wrong options, and choice buttons too wide for a narrow phone.
// Errors fail the check (exit code 1); warnings are printed but still pass.

import { LEVELS } from "../levels.js";
import { isLongChoice } from "../choices.js";

// Button width, measured the way isLongChoice() does: a power's "^" isn't drawn, and a stacked
// fraction ({top}/{bottom}) is only as wide as its wider half.
const LONG_CHOICE = 16;   // over this, the button gets the `long` class (smaller text on narrow phones)
const MAX_CHOICE = 18;    // over this, it won't fit a 344px phone even at the smaller size
// Quadratic formula options (roots topic) are allowed up to MAX_CHOICE by design;
// everywhere else, going over LONG_CHOICE is a warning.
const MAX_BY_ACTION = { formula: MAX_CHOICE };
function choiceWidth(label) {
  return String(label)
    .replace(/\{([^{}]*)\}\/\{([^{}]*)\}/g, (_, top, bottom) => (top.length > bottom.length ? top : bottom))
    .replace(/\^/g, "").length;
}

const errors = [];
const warnings = [];
const where = (level, i) => (i === undefined ? level.id : `${level.id} step ${i + 1}`);

const seenIds = new Set();
for (const level of LEVELS) {
  // Unique ids: progress and achievements are saved against them
  if (seenIds.has(level.id)) errors.push(`${level.id}: duplicate id`);
  seenIds.add(level.id);

  const steps = Array.isArray(level.steps) ? level.steps : [];
  if (steps.length === 0) errors.push(`${level.id}: no steps`);

  // One hint per step, in both languages
  for (const lang of ["en", "ja"]) {
    const hints = level.hints?.[lang];
    if (!Array.isArray(hints)) errors.push(`${level.id}: hints.${lang} is missing`);
    else if (hints.length !== steps.length) {
      errors.push(`${level.id}: hints.${lang} has ${hints.length} hint(s) but there are ${steps.length} step(s)`);
    }
  }

  steps.forEach((step, i) => {
    const at = where(level, i);

    // Authored choices: the correct value plus exactly 3 distinct wrong options
    if (step.wrong !== undefined) {
      if (!Array.isArray(step.wrong) || step.wrong.length !== 3) {
        errors.push(`${at}: wrong should have 3 options`);
      } else {
        if (step.wrong.includes(step.value)) errors.push(`${at}: the answer "${step.value}" is also in wrong`);
        if (new Set(step.wrong).size !== step.wrong.length) errors.push(`${at}: wrong has a duplicate option`);
        if (step.wrongKinds !== undefined && (!Array.isArray(step.wrongKinds) || step.wrongKinds.length !== step.wrong.length)) {
          errors.push(`${at}: wrongKinds should have one kind per wrong option (${step.wrong.length})`);
        }
        // Button width, for the answer and every wrong option
        for (const label of [step.value, ...step.wrong]) {
          const width = choiceWidth(label);
          const limit = MAX_BY_ACTION[step.action] ?? LONG_CHOICE;
          if (width > MAX_CHOICE) errors.push(`${at}: "${label}" is ${width} characters (max ${MAX_CHOICE})`);
          else if (width > limit) warnings.push(`${at}: "${label}" is ${width} characters (aim for ${limit}), shown smaller on narrow phones`);
          // Keep this script's rule in step with the app's
          if (isLongChoice(label) !== width > LONG_CHOICE) {
            errors.push(`${at}: width rule out of step with isLongChoice() in choices.js for "${label}"`);
          }
        }
      }
    }

    // Authored traps: 3 distinct wrong numbers for the same move
    if (step.traps !== undefined) {
      if (!Array.isArray(step.traps) || step.traps.length !== 3) errors.push(`${at}: traps should have 3 numbers`);
      else {
        if (step.traps.includes(step.value)) errors.push(`${at}: the answer ${step.value} is also in traps`);
        if (new Set(step.traps).size !== 3) errors.push(`${at}: traps has a duplicate number`);
      }
    }

    // Authored letter moves: 3 distinct wrong moves, none the same as the correct move
    if (step.moves !== undefined) {
      if (!Array.isArray(step.moves) || step.moves.length !== 3) errors.push(`${at}: moves should have 3 moves`);
      else {
        const keys = step.moves.map(m => `${m.action} ${m.value}`);
        if (keys.includes(`${step.action} ${step.value}`)) errors.push(`${at}: the correct move is also in moves`);
        if (new Set(keys).size !== 3) errors.push(`${at}: moves has a duplicate move`);
        if (step.moves.some(m => !m.kind)) errors.push(`${at}: every move needs a kind`);
      }
    }
  });
}

for (const w of warnings) console.log(`warning  ${w}`);
for (const e of errors) console.log(`error    ${e}`);
console.log(
  `\nChecked ${LEVELS.length} levels: ${errors.length} error(s), ${warnings.length} warning(s).`
);
process.exit(errors.length ? 1 : 0);