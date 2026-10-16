// LLL Algebra — choice buttons: the label for a move and the 3 generated wrong options.
// Authored-choice steps (expand/factor/roots/combine/substitute/scale/simplify, and sqrt/complete/
// formula/evalRoot in Completing the square) bring their own
// `wrong` options in levels.js; makeDistractors() is for the + − × ÷ moves. A + − × ÷ step
// may also carry authored `traps` (numbers), used as its wrong options instead of generated ones.
// A + − × ÷ step whose value is a letter term (Formulas, e.g. "÷ m") carries authored `moves`
// instead: full wrong moves { action, value, kind }, since letters can't be generated like numbers.

// Steps that show their own authored choices get a short prompt above the buttons.
const CHOICE_PROMPT_KEYS = {
  expand: "expandPrompt", factor: "factorPrompt", roots: "rootsPrompt",
  combine: "combinePrompt", substitute: "substitutePrompt", scale: "scalePrompt",
  simplify: "simplifyPrompt",
  // Completing the square: √ both sides, complete the square, the quadratic formula, work out the √
  sqrt: "sqrtPrompt", complete: "completePrompt", formula: "formulaPrompt", evalRoot: "evalRootPrompt"
};

// Options longer than this (e.g. the quadratic formula "x = (−11 ± √361)/2") get the `long` class,
// which drops them to 12px on narrow phones so they stay on one line (brand.css, 420px block).
// A power's "^" isn't drawn, so it doesn't count.
const LONG_CHOICE = 16;
function isLongChoice(label) {
  return String(label).replace(/\^/g, "").length > LONG_CHOICE;
}

function actionLabel(action, value) {
  const verbs = { add: "+", subtract: "−", multiply: "×", divide: "÷", add_x: "+", subtract_x: "−" };
  const suffix = LLL_I18N.t("bothSidesLabel") || "both sides";
  // A letter term on a + − × ÷ move (Formulas): "÷ m both sides", "− 2b both sides"
  if (typeof value === "string" && verbs[action]) return `${verbs[action]} ${value} ${suffix}`;
  // Authored choices (expand/factor/roots/…) are strings, shown as-is with a proper minus sign
  // e.g. "2x + 6", "(x + 2)(x - 3)", "x = -2, -3"
  if (typeof value === "string") return value.replace(/-/g, "−");
  if (action === "add_x" || action === "subtract_x") {
    const xTerm = value === 1 ? "x" : `${value}x`;
    return `${verbs[action]} ${xTerm} ${suffix}`;
  }
  const shown = value < 0 ? `(−${Math.abs(value)})` : `${value}`;
  return `${verbs[action]} ${shown} ${suffix}`;
}

// What kind of mistake a wrong option represents, compared with the correct move.
// Chalky reads this (choice.kind) to explain a wrong tap. Generated options only:
// authored traps are tagged "notLcd" where they're made, and authored letter moves carry their own kind.
const OPPOSITE_ACTION = {
  add: "subtract", subtract: "add", add_x: "subtract_x", subtract_x: "add_x",
  multiply: "divide", divide: "multiply"
};
const ADD_FAMILY = new Set(["add", "subtract", "add_x", "subtract_x"]);

function mistakeKindFor(choice, correctStep) {
  if (choice.action === correctStep.action) {
    // Same operation: either the minus sign got dropped (÷ 3 for ÷ (−3)) or the number is off
    return choice.value === -correctStep.value ? "forgotSign" : "wrongNumber";
  }
  if (choice.action === OPPOSITE_ACTION[correctStep.action]) return "wrongWay";   // + ↔ −, × ↔ ÷
  if (ADD_FAMILY.has(choice.action) !== ADD_FAMILY.has(correctStep.action)) return "wrongKind";   // +/− vs ×/÷
  return "generic";
}

function buildDistractors(correctStep) {
  // Authored letter moves (Formulas): full wrong moves, each already tagged with its kind
  if (Array.isArray(correctStep.moves)) return correctStep.moves.map(m => ({ ...m }));

  // Authored traps: the step names its own wrong numbers for the same move
  // (fractions: × one denominator, or × the sum of the denominators, instead of × the LCD).
  if (Array.isArray(correctStep.traps)) {
    return correctStep.traps.map(v => ({ action: correctStep.action, value: v, kind: "notLcd" }));
  }

  const isXAction = correctStep.action === "add_x" || correctStep.action === "subtract_x";
  const actions = isXAction ? ["add_x", "subtract_x"] : ["add", "subtract", "multiply", "divide"];
  const pool = [];
  actions.forEach(a => {
    // Only multiply/divide may use negative values. "+ (−3)" is the same move as "− 3",
    // so a negative add/subtract distractor could duplicate the correct answer under another label.
    const allowNegative = a === "multiply" || a === "divide";
    const center = allowNegative ? correctStep.value : Math.abs(correctStep.value);
    [center, center + 1, center - 1].forEach(v => {
      if (v === 0) return;
      if (allowNegative && v === 1) return; // "× 1" / "÷ 1" change nothing, so never offer them
      if (!allowNegative && v < 0) return;
      if (a === correctStep.action && v === correctStep.value) return;
      pool.push({ action: a, value: v });
    });
  });
  // shuffle + take 3
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  // Guaranteed sign-mistake distractor: for +/− moves, always offer the opposite move with
  // the same value (e.g. "− 8" when the answer is "+ 8"). For constant moves, also offer a
  // same-number ×/÷ move, so most buttons share the number and the player has to pick the
  // right operation, not just the right number.
  const OPPOSITE = { add: "subtract", subtract: "add", add_x: "subtract_x", subtract_x: "add_x" };
  const opposite = OPPOSITE[correctStep.action];
  if (opposite) {
    const v = correctStep.value;
    const picks = [{ action: opposite, value: v }];
    if (!isXAction && v !== 1) {   // "× 1" / "÷ 1" would be a do-nothing move, so skip it
      picks.push({ action: Math.random() < 0.5 ? "multiply" : "divide", value: v });
    }
    const alreadyPicked = d => picks.some(p => p.action === d.action && p.value === d.value);
    return [...picks, ...pool.filter(d => !alreadyPicked(d))].slice(0, 3);
  }

  // Guaranteed ×/÷ mistakes: for a positive ×/÷ move, always offer the opposite operation
  // with the same number (e.g. "× 3" when the answer is "÷ 3") and the matching +/− move
  // (e.g. "− 3" for 3x = 12), so ×/÷ steps don't end up with only +/− options.
  const MULDIV_OPPOSITE = { multiply: "divide", divide: "multiply" };
  if (MULDIV_OPPOSITE[correctStep.action] && correctStep.value > 0) {
    const v = correctStep.value;
    const picks = [
      { action: MULDIV_OPPOSITE[correctStep.action], value: v },
      { action: correctStep.action === "divide" ? "subtract" : "add", value: v }
    ];
    const alreadyPicked = d => picks.some(p => p.action === d.action && p.value === d.value);
    return [...picks, ...pool.filter(d => !alreadyPicked(d))].slice(0, 3);
  }

  // Guaranteed sign-flip distractor: when the correct move is multiply/divide by a
  // negative, always offer the positive counterpart (the classic "forgot the sign" mistake).
  const isNegativeMulDiv =
    (correctStep.action === "multiply" || correctStep.action === "divide") && correctStep.value < 0;
  if (isNegativeMulDiv) {
    const signFlip = { action: correctStep.action, value: Math.abs(correctStep.value) };
    return [signFlip, ...pool.slice(0, 2)];
  }
  return pool.slice(0, 3);
}

// Same options as before, each with a `kind` (see mistakeKindFor) so Chalky can explain a wrong tap.
function makeDistractors(correctStep) {
  return buildDistractors(correctStep).map(d => d.kind ? d : { ...d, kind: mistakeKindFor(d, correctStep) });
}

// Mistake kinds a step will offer as a wrong option, from the guaranteed picks in buildDistractors().
// Used by Tricky spots to find practice levels for a mistake. Authored-choice steps count as
// "tip_<action>" (e.g. tip_expand). wrongNumber isn't guaranteed, but nearly every generated
// step offers a nearby number, so any generated step can practise it.
function practiceKinds(step) {
  // Expressions, Indices and Completing the square: each authored wrong option is tagged with its own kind;
  // "generic" isn't practised
  if (Array.isArray(step.wrong) && Array.isArray(step.wrongKinds)) {
    return [...new Set(step.wrongKinds.filter(k => k !== "generic"))];
  }
  if (Array.isArray(step.wrong)) return [`tip_${step.action}`];
  if (Array.isArray(step.moves)) return [...new Set(step.moves.map(m => m.kind))];
  if (Array.isArray(step.traps)) return ["notLcd"];
  const v = step.value;
  if (ADD_FAMILY.has(step.action)) {
    const isXAction = step.action === "add_x" || step.action === "subtract_x";
    return isXAction || v === 1 ? ["wrongWay", "wrongNumber"] : ["wrongWay", "wrongKind", "wrongNumber"];
  }
  if (step.action === "multiply" || step.action === "divide") {
    return v > 0 ? ["wrongWay", "wrongKind", "wrongNumber"] : ["forgotSign", "wrongNumber"];
  }
  return [];
}

export { CHOICE_PROMPT_KEYS, actionLabel, makeDistractors, practiceKinds, isLongChoice };