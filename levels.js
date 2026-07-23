// LLL Algebra — level data
// Mirrors lll-chem's LEVELS pattern: fully data-driven, so adding a new
// equation is just a new entry here, not new app logic.
//
// Action vocabulary (v1, keep to 4):
//   "add"      — add `value` to both sides
//   "subtract" — subtract `value` from both sides
//   "multiply" — multiply both sides by `value`
//   "divide"   — divide both sides by `value`
//
// `target` is always "both-sides" for v1 (no single-side operations yet —
// keeps the button set small and the rule simple: "whatever you do, do it
// to both sides").

const LEVELS = [
  // ---- One-step equations ----
  {
    id: "linear_one_step_01",
    equation: "x + 5 = 12",
    answer: 7,
    difficulty: "easy",
    type: "one-step",
    basePoints: 10,
    steps: [
      { action: "subtract", value: 5, target: "both-sides", result: "x = 7" }
    ],
    hints: [
      "Get x alone — subtract 5 from both sides."
    ],
    explanation: "Since 5 is added to x, subtracting 5 from both sides cancels it out and leaves x by itself."
  },
  {
    id: "linear_one_step_02",
    equation: "x - 4 = 9",
    answer: 13,
    difficulty: "easy",
    type: "one-step",
    basePoints: 10,
    steps: [
      { action: "add", value: 4, target: "both-sides", result: "x = 13" }
    ],
    hints: [
      "Get x alone — add 4 to both sides."
    ],
    explanation: "Since 4 is subtracted from x, adding 4 to both sides cancels it out and leaves x by itself."
  },
  {
    id: "linear_one_step_03",
    equation: "3x = 21",
    answer: 7,
    difficulty: "easy",
    type: "one-step",
    basePoints: 10,
    steps: [
      { action: "divide", value: 3, target: "both-sides", result: "x = 7" }
    ],
    hints: [
      "Get x alone — divide both sides by 3."
    ],
    explanation: "Since x is multiplied by 3, dividing both sides by 3 cancels it out and leaves x by itself."
  },
  {
    id: "linear_one_step_04",
    equation: "x / 4 = 6",
    answer: 24,
    difficulty: "easy",
    type: "one-step",
    basePoints: 10,
    steps: [
      { action: "multiply", value: 4, target: "both-sides", result: "x = 24" }
    ],
    hints: [
      "Get x alone — multiply both sides by 4."
    ],
    explanation: "Since x is divided by 4, multiplying both sides by 4 cancels it out and leaves x by itself."
  },

  // ---- Two-step equations ----
  {
    id: "linear_two_step_01",
    equation: "2x + 3 = 11",
    answer: 4,
    difficulty: "medium",
    type: "two-step",
    basePoints: 20,
    steps: [
      { action: "subtract", value: 3, target: "both-sides", result: "2x = 8" },
      { action: "divide",   value: 2, target: "both-sides", result: "x = 4" }
    ],
    hints: [
      "Start by removing the constant — subtract 3 from both sides.",
      "Now divide both sides by 2 to finish isolating x."
    ],
    explanation: "First isolate the term with x by removing the +3, then divide by x's coefficient to solve for x."
  },
  {
    id: "linear_two_step_02",
    equation: "5x - 6 = 19",
    answer: 5,
    difficulty: "medium",
    type: "two-step",
    basePoints: 20,
    steps: [
      { action: "add",   value: 6, target: "both-sides", result: "5x = 25" },
      { action: "divide", value: 5, target: "both-sides", result: "x = 5" }
    ],
    hints: [
      "Start by removing the constant — add 6 to both sides.",
      "Now divide both sides by 5 to finish isolating x."
    ],
    explanation: "First isolate the term with x by removing the -6, then divide by x's coefficient to solve for x."
  },
  {
    id: "linear_two_step_03",
    equation: "x/3 + 2 = 9",
    answer: 21,
    difficulty: "medium",
    type: "two-step",
    basePoints: 20,
    steps: [
      { action: "subtract", value: 2, target: "both-sides", result: "x/3 = 7" },
      { action: "multiply", value: 3, target: "both-sides", result: "x = 21" }
    ],
    hints: [
      "Start by removing the constant — subtract 2 from both sides.",
      "Now multiply both sides by 3 to finish isolating x."
    ],
    explanation: "First isolate the term with x by removing the +2, then multiply to undo the division and solve for x."
  }
];

// Handy lookup by difficulty tier, mirroring how lll-admin/lll-chem
// filter their level banks by difficulty.
const LEVELS_BY_DIFFICULTY = LEVELS.reduce((acc, lvl) => {
  (acc[lvl.difficulty] = acc[lvl.difficulty] || []).push(lvl);
  return acc;
}, {});

export { LEVELS, LEVELS_BY_DIFFICULTY };