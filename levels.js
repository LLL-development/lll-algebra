// LLL Algebra — level data
// Mirrors lll-chem's LEVELS pattern: fully data-driven, so adding a new
// equation is just a new entry here, not new app logic.
//
// Action vocabulary (v1, keep to 4 + 2 x-term variants):
//   "add"         — add `value` to both sides
//   "subtract"    — subtract `value` from both sides
//   "multiply"    — multiply both sides by `value`
//   "divide"      — divide both sides by `value`
//   "add_x"       — add `value`·x to both sides (combine x-terms)
//   "subtract_x"  — subtract `value`·x from both sides (combine x-terms)
//   "expand"      — multiply out brackets on ONE side (a rewrite, not a both-sides move).
//                   `value` is the correct expansion as a string (e.g. "2x + 6");
//                   `wrong` is an array of 3 authored wrong expansions used as distractors;
//                   `target` is "left" or "right" (the side being rewritten).
//   "factor"      — factorise a quadratic expression (quadratics topic). Authored like
//                   "expand": `value` is the correct factorisation (e.g. "(x + 2)(x + 3)").
//   "roots"       — read both answers off a factorised "= 0" equation (zero-product rule).
//                   `value` is the answers as a string, smallest first (e.g. "x = -3, -2").
//   "combine"     — add or subtract the two equations of a system to eliminate a letter
//                   (systems topic). Authored: `value` is the resulting equation (e.g. "3x = 12").
//                   Always top minus bottom when subtracting.
//   "substitute"  — put the known letter back into an equation to find the other (systems).
//                   Authored: `value` is the full answer, x first (e.g. "x = 4, y = 5").
//   "scale"       — multiply one equation of a system so a letter will cancel (systems, Hard).
//                   Authored: `value` is just the scaled equation (e.g. "2x + 6y = 14");
//                   `result` is the new two-line system with that line replaced.
//   "simplify"    — combine like terms on ONE side (fractions, after clearing them), or one
//                   group of like terms in an expression (expression topic).
//                   Authored like "expand": `value` is the combined side (e.g. "5x"),
//                   `target` is "left" or "right" ("expression" in the expression topic).
//   "sqrt"        — square root both sides (roots topic). Authored: `value` is the result with ±
//                   (e.g. "x + 3 = ±4"), or both answers when x² is already alone (e.g. "x = -6, 6").
//   "complete"    — complete the square (roots topic). Authored: `value` is e.g. "(x + 3)² = 25".
//   "formula"     — put a, b and c into the quadratic formula (roots topic). Authored: `value` is
//                   e.g. "x = (-5 ± √121)/2".
//   "evalRoot"    — work out the square root in the formula (roots topic), e.g. "x = (-5 ± 11)/2".
//   "coef"        — read off a, b and c before using the formula (roots topic). Authored: `value` is e.g.
//                   "1, 5, -24"; its prompt comes from the step's own `prompt`. Its `result` keeps the equation as
//                   a first line ("x² + 5x - 24 = 0\na = 1, b = 5, c = -24"). With `fill: "formula"`, the formula
//                   panel under the card fills in a, b and c once it's answered (the level's `abc`).
//   "discriminant" — work out b² - 4ac before using the formula (roots topic). Authored: `value` is e.g.
//                   "b² - 4ac = 121"; its prompt comes from the step's own `prompt`. Its `result` keeps the
//                   a, b, c line first ("a = 1, b = 5, c = -24\nb² - 4ac = 121"), since b² - 4ac is a side calculation.
//   "gradient"    — read or work out the gradient m (line topic). Authored: `value` is e.g. "m = 2".
//   "intercept"   — read or work out the y-intercept c (line topic). Authored: `value` is e.g. "c = 3".
//   "gradSub"     — put two points into m = (y_2 - y_1)/(x_2 - x_1) (line topic, Medium). Authored: `value`
//                   is a stacked fraction, e.g. "{4 - (-5)}/{1 - (-2)}".
//   "gradCalc"    — work out the top and bottom of that fraction (line topic, Medium), e.g. "{9}/{3}".
//   "isolate"     — get y on its own before reading m and c (line topic, Hard). Authored: `value` is
//                   the line in y = mx + c form (e.g. "y = 2x - 1"). Not "rearrange": that's Quadratics Hard's type.
//
// Systems: `equation` is two lines joined by "\n" (e.g. "x + y = 9\n2x - y = 3"), and
// `answer` is { x, y }. A step whose result the player must substitute into keeps that
// equation as a second line (e.g. "x = 4\nx + y = 9"), so it stays on the card.
//
// Any step with a `wrong` array is an authored-choice step: the UI shows `value` plus
// the 3 `wrong` options instead of generating distractors.
//
// A + − × ÷ step may instead carry `traps`: 3 wrong numbers for the same move, used in place
// of generated distractors (fractions: "× 2" or "× 5" when the answer is "× 6"). Traps must
// never be a common multiple of the denominators — any common multiple also clears the fractions.
//
// A + − × ÷ step whose `value` is a letter term (Formulas Medium/Hard, e.g. "m" or "2b") carries
// `moves`: 3 authored wrong moves { action, value, kind }, kind = "wrongWay" (opposite move),
// "wrongKind" (+/− vs ×/÷) or "wrongNumber" (another letter from the formula).
//
// Authoring rules:
//   - add/subtract/add_x/subtract_x values are always POSITIVE
//     ("x - 3 > 5" is { action: "add", value: 3 }, never subtract -3).
//     Only multiply/divide may carry a negative value.
//   - Inequality steps that multiply/divide by a negative set `flip: true`
//     (the inequality sign reverses on that step).
//
// `subject` (subject topic only) is the letter to make the subject, e.g. "x". It drives the
// "Make x the subject:" prompt. Earlier steps keep the formula's layout (y - 1 = 2x); only the
// final step's result puts the subject on the left (x = (y - 1)/2), so no "swap sides" move is needed.
//
// Expression topic (simplifying): `equation` is an expression with no "=" (e.g. "4x + 3 + 2x"), and
// `answer` is the simplified expression. Each collect step is an authored "simplify" step with
// `collect`: the group of terms being collected ("x", "xy", "x²" or "number"), which drives the
// "Collect the x terms:" prompt. `wrongKinds` tags each `wrong` option, in the same order:
// "unlikeTerms" (combining terms that aren't alike, or x + x → x²), "signSlip" (a minus mishandled),
// "loneLetter" (a lone x not counted as 1x) or "generic" (an arithmetic slip, not tracked).
// Hard expands every bracket in one "expand" step with no wrongKinds, so those slips count as tip_expand.
// Rules: in each option, terms not being collected stay exactly as they are (unless the mistake is
// merging them), and expressions are written so collecting in order of first appearance gives the
// answer order: x² first, then letters alphabetically, then the number.
//
// Indices topic (laws of indices): powers are written x^3 / x^-2 (drawn raised by mathtext.js) and, like
// Expressions, there's no "=". Each step is an authored "simplify" step using one law, named in `law`:
// "multiply" (add the powers), "divide" (subtract them), "power" (multiply them), "zero" (x^0 = 1) or
// "positive" (rewrite a negative power: x^-3 → 1/x^3). `law` drives the "Use the multiply rule:" prompt.
// `wrongKinds`: "powerOp" (wrong operation on the powers, sign slips included), "coefficient" (numbers in
// front mishandled), "lonePower" (a lone x not counted as x^1), "zeroPower" (x^0 taken as 0 or x),
// "negPower" (x^-3 taken as -x^3, or not moved under the line), "unlikeTerms" (shared with Expressions:
// x and y powers merged) or "generic" (not tracked). Answers use positive powers, and x^1 is always written x.
//
// Completing the square (topic key `roots`): squares are written x² like Quadratics, and square roots with
// the real √ (√121, or √(b² - 4ac) for more than one term), drawn by mathtext.js. Answers are whole numbers,
// smallest first, like Quadratics. Every authored step has `wrongKinds`: "plusMinus" (only one root, the ±
// forgotten), "rootSlip" (the √ skipped or halved), "undoSign" (a sign slip undoing a number, or -b in the
// formula), "halfB" (completed with b instead of half of b), "addSquare" (forgot to add (b/2)² to the other
// side), "discriminant" (a slip in b² - 4ac), "twoA" (divided by a or not at all, instead of by 2a),
// "readCoef" (a, b or c read off wrong: a sign dropped, a = 0, or a and b swapped) or "generic" (not tracked). Formula options stay within 18 characters so they fit a narrow phone's button.
// Medium adds (half of b)² as its own step, so its wrong moves are authored `moves` (like Formulas), with kinds
// "halfB", "squareHalf" (halved but didn't square) or "wrongWay". A step may name its own prompt in `prompt`
// (a strings.js key), e.g. "moveNumberPrompt", which wins over the action's prompt.
// Hard levels carry `abc: [a, b, c]` for the quadratic formula panel under the card. It appears after the
// step with `fill: "formula"`, and a later step's `focus` lights up the part it uses: "disc" (b² - 4ac) or
// "top" (the top of the fraction).
//
// Straight lines (topic key `line`): every step is authored, with `wrongKinds`: "swapMC" (m and c swapped),
// "lineSign" (a sign dropped from m or c), "loneLetter" (shared with Expressions: x read as 0x, not 1x),
// "riseRun" (the gradient fraction upside down: x's on top), "subtractOrder" (the points subtracted in
// different orders on top and bottom), "minusNegative" (4 - (-5) worked out as -1), "findC" (c = y + mx
// instead of y - mx), "rearrangeSlip" (only some terms divided, or the move undone the wrong way) or "generic"
// (not tracked). Cards keep what's been found as a second line (like `coef`). Two-point cards show the points
// as "(1, 2), (3, 6)" (no words, so no Japanese is needed in the pixel font). {top}/{bottom} is drawn as a
// stacked fraction and x_1 as a subscript (mathtext.js); plain a/b stays inline. Every level carries
// `line: { m, c, points }` for the graph; gradients are whole numbers, and every point and intercept stays
// within -6..6 so the grid stays at 1 unit.
//
// `topic` is "equation", "inequality", "brackets", "quadratic", "system", "fraction", "subject", "expression", "indices", "roots" or "line". `target` is "both-sides"
// for every move that changes a side's value; only "expand" and "simplify" rewrite one side,
// because expanding doesn't change the value (2(x + 3) and 2x + 6 are equal)
//
// `hints` and `explanation` are per-language objects ({ en, ja }) so the
// UI can pick the active language at render time.

const LEVELS = [
  // =====================================================================
  // EQUATIONS
  // =====================================================================

  // ---- One-step equations ----
  {
    id: "linear_one_step_01",
    topic: "equation",
    equation: "x + 5 = 12",
    answer: 7,
    difficulty: "easy",
    type: "one-step",
    basePoints: 10,
    steps: [
      { action: "subtract", value: 5, target: "both-sides", result: "x = 7" }
    ],
    hints: {
      en: ["Get x alone — subtract 5 from both sides."],
      ja: ["xを求める — 両辺から5を引く。"]
    },
    explanation: {
      en: "Since 5 is added to x, subtracting 5 from both sides cancels it out and leaves x by itself.",
      ja: "xに5が足されているので、両辺から5を引くと打ち消され、xだけが残ります。"
    }
  },
  {
    id: "linear_one_step_02",
    topic: "equation",
    equation: "x - 4 = 9",
    answer: 13,
    difficulty: "easy",
    type: "one-step",
    basePoints: 10,
    steps: [
      { action: "add", value: 4, target: "both-sides", result: "x = 13" }
    ],
    hints: {
      en: ["Get x alone — add 4 to both sides."],
      ja: ["xを求める — 両辺に4を足す。"]
    },
    explanation: {
      en: "Since 4 is subtracted from x, adding 4 to both sides cancels it out and leaves x by itself.",
      ja: "xから4が引かれているので、両辺に4を足すと打ち消され、xだけが残ります。"
    }
  },
  {
    id: "linear_one_step_03",
    topic: "equation",
    equation: "3x = 21",
    answer: 7,
    difficulty: "easy",
    type: "one-step",
    basePoints: 10,
    steps: [
      { action: "divide", value: 3, target: "both-sides", result: "x = 7" }
    ],
    hints: {
      en: ["Get x alone — divide both sides by 3."],
      ja: ["xを求める — 両辺を3で割る。"]
    },
    explanation: {
      en: "Since x is multiplied by 3, dividing both sides by 3 cancels it out and leaves x by itself.",
      ja: "xに3がかけられているので、両辺を3で割ると打ち消され、xだけが残ります。"
    }
  },
  {
    id: "linear_one_step_04",
    topic: "equation",
    equation: "x / 4 = 6",
    answer: 24,
    difficulty: "easy",
    type: "one-step",
    basePoints: 10,
    steps: [
      { action: "multiply", value: 4, target: "both-sides", result: "x = 24" }
    ],
    hints: {
      en: ["Get x alone — multiply both sides by 4."],
      ja: ["xを求める — 両辺に4をかける。"]
    },
    explanation: {
      en: "Since x is divided by 4, multiplying both sides by 4 cancels it out and leaves x by itself.",
      ja: "xが4で割られているので、両辺に4をかけると打ち消され、xだけが残ります。"
    }
  },
  {
    id: "linear_one_step_05",
    topic: "equation",
    equation: "x + 8 = 3",
    answer: -5,
    difficulty: "easy",
    type: "one-step",
    basePoints: 10,
    steps: [
      { action: "subtract", value: 8, target: "both-sides", result: "x = -5" }
    ],
    hints: {
      en: ["Get x alone — subtract 8 from both sides."],
      ja: ["xを求める — 両辺から8を引く。"]
    },
    explanation: {
      en: "Since 8 is added to x, subtracting 8 from both sides cancels it out — this time landing on a negative value for x.",
      ja: "xに8が足されているので、両辺から8を引くと打ち消されます — 今回はxが負の数になります。"
    }
  },
  {
    id: "linear_one_step_06",
    topic: "equation",
    equation: "x - 7 = -2",
    answer: 5,
    difficulty: "easy",
    type: "one-step",
    basePoints: 10,
    steps: [
      { action: "add", value: 7, target: "both-sides", result: "x = 5" }
    ],
    hints: {
      en: ["Get x alone — add 7 to both sides."],
      ja: ["xを求める — 両辺に7を足す。"]
    },
    explanation: {
      en: "Since 7 is subtracted from x, adding 7 to both sides cancels it out and leaves x by itself.",
      ja: "xから7が引かれているので、両辺に7を足すと打ち消され、xだけが残ります。"
    }
  },
  {
    id: "linear_one_step_07",
    topic: "equation",
    equation: "5x = 45",
    answer: 9,
    difficulty: "easy",
    type: "one-step",
    basePoints: 10,
    steps: [
      { action: "divide", value: 5, target: "both-sides", result: "x = 9" }
    ],
    hints: {
      en: ["Get x alone — divide both sides by 5."],
      ja: ["xを求める — 両辺を5で割る。"]
    },
    explanation: {
      en: "Since x is multiplied by 5, dividing both sides by 5 cancels it out and leaves x by itself.",
      ja: "xに5がかけられているので、両辺を5で割ると打ち消され、xだけが残ります。"
    }
  },
  {
    id: "linear_one_step_08",
    topic: "equation",
    equation: "x / 3 = -4",
    answer: -12,
    difficulty: "easy",
    type: "one-step",
    basePoints: 10,
    steps: [
      { action: "multiply", value: 3, target: "both-sides", result: "x = -12" }
    ],
    hints: {
      en: ["Get x alone — multiply both sides by 3."],
      ja: ["xを求める — 両辺に3をかける。"]
    },
    explanation: {
      en: "Since x is divided by 3, multiplying both sides by 3 cancels it out — the answer comes out negative.",
      ja: "xが3で割られているので、両辺に3をかけると打ち消されます。答えは負の数になります。"
    }
  },
  {
    id: "linear_one_step_09",
    topic: "equation",
    equation: "x + 12 = 20",
    answer: 8,
    difficulty: "easy",
    type: "one-step",
    basePoints: 10,
    steps: [
      { action: "subtract", value: 12, target: "both-sides", result: "x = 8" }
    ],
    hints: {
      en: ["Get x alone — subtract 12 from both sides."],
      ja: ["xを求める — 両辺から12を引く。"]
    },
    explanation: {
      en: "Since 12 is added to x, subtracting 12 from both sides cancels it out and leaves x by itself.",
      ja: "xに12が足されているので、両辺から12を引くと打ち消され、xだけが残ります。"
    }
  },
  {
    id: "linear_one_step_10",
    topic: "equation",
    equation: "7x = -28",
    answer: -4,
    difficulty: "easy",
    type: "one-step",
    basePoints: 10,
    steps: [
      { action: "divide", value: 7, target: "both-sides", result: "x = -4" }
    ],
    hints: {
      en: ["Get x alone — divide both sides by 7."],
      ja: ["xを求める — 両辺を7で割る。"]
    },
    explanation: {
      en: "Since x is multiplied by 7, dividing both sides by 7 leaves x by itself — a negative divided by a positive is negative.",
      ja: "xに7がかけられているので、両辺を7で割るとxだけが残ります。負の数÷正の数は負の数です。"
    }
  },

  // ---- Two-step equations ----
  {
    id: "linear_two_step_01",
    topic: "equation",
    equation: "2x + 3 = 11",
    answer: 4,
    difficulty: "medium",
    type: "two-step",
    basePoints: 20,
    steps: [
      { action: "subtract", value: 3, target: "both-sides", result: "2x = 8" },
      { action: "divide",   value: 2, target: "both-sides", result: "x = 4" }
    ],
    hints: {
      en: [
        "Start by removing the constant — subtract 3 from both sides.",
        "Now divide both sides by 2 to finish isolating x."
      ],
      ja: [
        "まず定数項を消す — 両辺から3を引く。",
        "次に両辺を2で割ってxを求める。"
      ]
    },
    explanation: {
      en: "First isolate the term with x by removing the +3, then divide by x's coefficient to solve for x.",
      ja: "まず+3を消してxの項だけにし、次にxの係数で割ってxを求めます。"
    }
  },
  {
    id: "linear_two_step_02",
    topic: "equation",
    equation: "5x - 6 = 19",
    answer: 5,
    difficulty: "medium",
    type: "two-step",
    basePoints: 20,
    steps: [
      { action: "add",   value: 6, target: "both-sides", result: "5x = 25" },
      { action: "divide", value: 5, target: "both-sides", result: "x = 5" }
    ],
    hints: {
      en: [
        "Start by removing the constant — add 6 to both sides.",
        "Now divide both sides by 5 to finish isolating x."
      ],
      ja: [
        "まず定数項を消す — 両辺に6を足す。",
        "次に両辺を5で割ってxを求める。"
      ]
    },
    explanation: {
      en: "First isolate the term with x by removing the -6, then divide by x's coefficient to solve for x.",
      ja: "まず-6を消してxの項だけにし、次にxの係数で割ってxを求めます。"
    }
  },
  {
    id: "linear_two_step_03",
    topic: "equation",
    equation: "x/3 + 2 = 9",
    answer: 21,
    difficulty: "medium",
    type: "two-step",
    basePoints: 20,
    steps: [
      { action: "subtract", value: 2, target: "both-sides", result: "x/3 = 7" },
      { action: "multiply", value: 3, target: "both-sides", result: "x = 21" }
    ],
    hints: {
      en: [
        "Start by removing the constant — subtract 2 from both sides.",
        "Now multiply both sides by 3 to finish isolating x."
      ],
      ja: [
        "まず定数項を消す — 両辺から2を引く。",
        "次に両辺に3をかけてxを求める。"
      ]
    },
    explanation: {
      en: "First isolate the term with x by removing the +2, then multiply to undo the division and solve for x.",
      ja: "まず+2を消してxの項だけにし、次に両辺に3をかけて割り算を打ち消し、xを求めます。"
    }
  },
  {
    id: "linear_two_step_04",
    topic: "equation",
    equation: "3x + 10 = 4",
    answer: -2,
    difficulty: "medium",
    type: "two-step",
    basePoints: 20,
    steps: [
      { action: "subtract", value: 10, target: "both-sides", result: "3x = -6" },
      { action: "divide",   value: 3,  target: "both-sides", result: "x = -2" }
    ],
    hints: {
      en: [
        "Start by removing the constant — subtract 10 from both sides.",
        "Now divide both sides by 3 to finish isolating x."
      ],
      ja: [
        "まず定数項を消す — 両辺から10を引く。",
        "次に両辺を3で割ってxを求める。"
      ]
    },
    explanation: {
      en: "First isolate the term with x by removing the +10, then divide by x's coefficient — the intermediate value goes negative along the way.",
      ja: "まず+10を消してxの項だけにし、次にxの係数で割ります — 途中で負の数になります。"
    }
  },
  {
    id: "linear_two_step_05",
    topic: "equation",
    equation: "4x - 7 = 21",
    answer: 7,
    difficulty: "medium",
    type: "two-step",
    basePoints: 20,
    steps: [
      { action: "add",    value: 7, target: "both-sides", result: "4x = 28" },
      { action: "divide", value: 4, target: "both-sides", result: "x = 7" }
    ],
    hints: {
      en: [
        "Start by removing the constant — add 7 to both sides.",
        "Now divide both sides by 4 to finish isolating x."
      ],
      ja: [
        "まず定数項を消す — 両辺に7を足す。",
        "次に両辺を4で割ってxを求める。"
      ]
    },
    explanation: {
      en: "First isolate the term with x by removing the -7, then divide by x's coefficient to solve for x.",
      ja: "まず-7を消してxの項だけにし、次にxの係数で割ってxを求めます。"
    }
  },
  {
    id: "linear_two_step_06",
    topic: "equation",
    equation: "x/5 - 3 = 4",
    answer: 35,
    difficulty: "medium",
    type: "two-step",
    basePoints: 20,
    steps: [
      { action: "add",      value: 3, target: "both-sides", result: "x/5 = 7" },
      { action: "multiply", value: 5, target: "both-sides", result: "x = 35" }
    ],
    hints: {
      en: [
        "Start by removing the constant — add 3 to both sides.",
        "Now multiply both sides by 5 to finish isolating x."
      ],
      ja: [
        "まず定数項を消す — 両辺に3を足す。",
        "次に両辺に5をかけてxを求める。"
      ]
    },
    explanation: {
      en: "First isolate the term with x by removing the -3, then multiply to undo the division and solve for x.",
      ja: "まず-3を消してxの項だけにし、次に両辺に5をかけて割り算を打ち消し、xを求めます。"
    }
  },
  {
    id: "linear_two_step_07",
    topic: "equation",
    equation: "3x + 5 = 20",
    answer: 5,
    difficulty: "medium",
    type: "two-step",
    basePoints: 20,
    steps: [
      { action: "subtract", value: 5, target: "both-sides", result: "3x = 15" },
      { action: "divide",   value: 3, target: "both-sides", result: "x = 5" }
    ],
    hints: {
      en: [
        "Start by removing the constant — subtract 5 from both sides.",
        "Now divide both sides by 3 to finish isolating x."
      ],
      ja: [
        "まず定数項を消す — 両辺から5を引く。",
        "次に両辺を3で割ってxを求める。"
      ]
    },
    explanation: {
      en: "First isolate the term with x by removing the +5, then divide by x's coefficient to solve for x.",
      ja: "まず+5を消してxの項だけにし、次にxの係数で割ってxを求めます。"
    }
  },
  {
    id: "linear_two_step_08",
    topic: "equation",
    equation: "-2x + 7 = 15",
    answer: -4,
    difficulty: "medium",
    type: "two-step",
    basePoints: 20,
    steps: [
      { action: "subtract", value: 7,  target: "both-sides", result: "-2x = 8" },
      { action: "divide",   value: -2, target: "both-sides", result: "x = -4" }
    ],
    hints: {
      en: [
        "Start by removing the constant — subtract 7 from both sides.",
        "Now divide both sides by -2 — watch the negative sign!"
      ],
      ja: [
        "まず定数項を消す — 両辺から7を引く。",
        "次に両辺を-2で割る — マイナスの符号に注意！"
      ]
    },
    explanation: {
      en: "Remove the +7 first, then divide by the coefficient -2 — including its negative sign.",
      ja: "まず+7を消し、次に係数の-2（マイナスも含めて）で割ります。"
    }
  },
  {
    id: "linear_two_step_09",
    topic: "equation",
    equation: "x/2 - 6 = 1",
    answer: 14,
    difficulty: "medium",
    type: "two-step",
    basePoints: 20,
    steps: [
      { action: "add",      value: 6, target: "both-sides", result: "x/2 = 7" },
      { action: "multiply", value: 2, target: "both-sides", result: "x = 14" }
    ],
    hints: {
      en: [
        "Start by removing the constant — add 6 to both sides.",
        "Now multiply both sides by 2 to finish isolating x."
      ],
      ja: [
        "まず定数項を消す — 両辺に6を足す。",
        "次に両辺に2をかけてxを求める。"
      ]
    },
    explanation: {
      en: "First isolate the term with x by removing the -6, then multiply to undo the division and solve for x.",
      ja: "まず-6を消してxの項だけにし、次に両辺に2をかけて割り算を打ち消し、xを求めます。"
    }
  },
  {
    id: "linear_two_step_10",
    topic: "equation",
    equation: "-x/3 + 4 = 6",
    answer: -6,
    difficulty: "medium",
    type: "two-step",
    basePoints: 20,
    steps: [
      { action: "subtract", value: 4,  target: "both-sides", result: "-x/3 = 2" },
      { action: "multiply", value: -3, target: "both-sides", result: "x = -6" }
    ],
    hints: {
      en: [
        "Start by removing the constant — subtract 4 from both sides.",
        "Now multiply both sides by -3 — watch the negative sign!"
      ],
      ja: [
        "まず定数項を消す — 両辺から4を引く。",
        "次に両辺に-3をかける — マイナスの符号に注意！"
      ]
    },
    explanation: {
      en: "Remove the +4, then multiply by -3 to undo the division by -3.",
      ja: "まず+4を消し、次に両辺に-3をかけて-3での割り算を打ち消します。"
    }
  },

  // ---- x-on-both-sides equations (hard) ----
  {
    id: "linear_x_both_sides_01",
    topic: "equation",
    equation: "3x + 4 = x + 12",
    answer: 4,
    difficulty: "hard",
    type: "x-both-sides",
    basePoints: 30,
    steps: [
      { action: "subtract_x", value: 1, target: "both-sides", result: "2x + 4 = 12" },
      { action: "subtract",   value: 4, target: "both-sides", result: "2x = 8" },
      { action: "divide",     value: 2, target: "both-sides", result: "x = 4" }
    ],
    hints: {
      en: [
        "Start by combining the x terms — subtract x from both sides.",
        "Now remove the constant — subtract 4 from both sides.",
        "Finally divide both sides by 2 to isolate x."
      ],
      ja: [
        "まずxの項をまとめる — 両辺からxを引く。",
        "次に定数項を消す — 両辺から4を引く。",
        "最後に両辺を2で割ってxを求める。"
      ]
    },
    explanation: {
      en: "First eliminate the smaller x term by subtracting it from both sides, then solve the resulting two-step equation as usual.",
      ja: "まず小さい方のxの項を両辺から引いて消し、残った2ステップの方程式をいつも通り解きます。"
    }
  },
  {
    id: "linear_x_both_sides_02",
    topic: "equation",
    equation: "5x - 2 = 2x + 10",
    answer: 4,
    difficulty: "hard",
    type: "x-both-sides",
    basePoints: 30,
    steps: [
      { action: "subtract_x", value: 2, target: "both-sides", result: "3x - 2 = 10" },
      { action: "add",        value: 2, target: "both-sides", result: "3x = 12" },
      { action: "divide",     value: 3, target: "both-sides", result: "x = 4" }
    ],
    hints: {
      en: [
        "Start by combining the x terms — subtract 2x from both sides.",
        "Now remove the constant — add 2 to both sides.",
        "Finally divide both sides by 3 to isolate x."
      ],
      ja: [
        "まずxの項をまとめる — 両辺から2xを引く。",
        "次に定数項を消す — 両辺に2を足す。",
        "最後に両辺を3で割ってxを求める。"
      ]
    },
    explanation: {
      en: "First eliminate the smaller x term, then solve the resulting two-step equation as usual.",
      ja: "まず小さい方のxの項を消し、残った2ステップの方程式をいつも通り解きます。"
    }
  },
  {
    id: "linear_x_both_sides_03",
    topic: "equation",
    equation: "4x + 3 = x + 18",
    answer: 5,
    difficulty: "hard",
    type: "x-both-sides",
    basePoints: 30,
    steps: [
      { action: "subtract_x", value: 1, target: "both-sides", result: "3x + 3 = 18" },
      { action: "subtract",   value: 3, target: "both-sides", result: "3x = 15" },
      { action: "divide",     value: 3, target: "both-sides", result: "x = 5" }
    ],
    hints: {
      en: [
        "Start by combining the x terms — subtract x from both sides.",
        "Now remove the constant — subtract 3 from both sides.",
        "Finally divide both sides by 3 to isolate x."
      ],
      ja: [
        "まずxの項をまとめる — 両辺からxを引く。",
        "次に定数項を消す — 両辺から3を引く。",
        "最後に両辺を3で割ってxを求める。"
      ]
    },
    explanation: {
      en: "First eliminate the smaller x term, then solve the resulting two-step equation as usual.",
      ja: "まず小さい方のxの項を消し、残った2ステップの方程式をいつも通り解きます。"
    }
  },
  {
    id: "linear_x_both_sides_04",
    topic: "equation",
    equation: "6x - 5 = 2x + 7",
    answer: 3,
    difficulty: "hard",
    type: "x-both-sides",
    basePoints: 30,
    steps: [
      { action: "subtract_x", value: 2, target: "both-sides", result: "4x - 5 = 7" },
      { action: "add",        value: 5, target: "both-sides", result: "4x = 12" },
      { action: "divide",     value: 4, target: "both-sides", result: "x = 3" }
    ],
    hints: {
      en: [
        "Start by combining the x terms — subtract 2x from both sides.",
        "Now remove the constant — add 5 to both sides.",
        "Finally divide both sides by 4 to isolate x."
      ],
      ja: [
        "まずxの項をまとめる — 両辺から2xを引く。",
        "次に定数項を消す — 両辺に5を足す。",
        "最後に両辺を4で割ってxを求める。"
      ]
    },
    explanation: {
      en: "First eliminate the smaller x term, then solve the resulting two-step equation as usual.",
      ja: "まず小さい方のxの項を消し、残った2ステップの方程式をいつも通り解きます。"
    }
  },
  {
    id: "linear_x_both_sides_05",
    topic: "equation",
    equation: "7x + 2 = 3x - 10",
    answer: -3,
    difficulty: "hard",
    type: "x-both-sides",
    basePoints: 30,
    steps: [
      { action: "subtract_x", value: 3, target: "both-sides", result: "4x + 2 = -10" },
      { action: "subtract",   value: 2, target: "both-sides", result: "4x = -12" },
      { action: "divide",     value: 4, target: "both-sides", result: "x = -3" }
    ],
    hints: {
      en: [
        "Start by combining the x terms — subtract 3x from both sides.",
        "Now remove the constant — subtract 2 from both sides.",
        "Finally divide both sides by 4 to isolate x."
      ],
      ja: [
        "まずxの項をまとめる — 両辺から3xを引く。",
        "次に定数項を消す — 両辺から2を引く。",
        "最後に両辺を4で割ってxを求める。"
      ]
    },
    explanation: {
      en: "Eliminate the smaller x term, then remove the constant — the right side goes negative, so x does too.",
      ja: "小さい方のxの項を消してから定数項を消します。右辺が負の数になるので、xも負の数になります。"
    }
  },
  {
    id: "linear_x_both_sides_06",
    topic: "equation",
    equation: "2x + 9 = 5x - 3",
    answer: 4,
    difficulty: "hard",
    type: "x-both-sides",
    basePoints: 30,
    steps: [
      { action: "subtract_x", value: 5,  target: "both-sides", result: "-3x + 9 = -3" },
      { action: "subtract",   value: 9,  target: "both-sides", result: "-3x = -12" },
      { action: "divide",     value: -3, target: "both-sides", result: "x = 4" }
    ],
    hints: {
      en: [
        "Start by combining the x terms — subtract 5x from both sides.",
        "Now remove the constant — subtract 9 from both sides.",
        "Finally divide both sides by -3 — watch the negative sign!"
      ],
      ja: [
        "まずxの項をまとめる — 両辺から5xを引く。",
        "次に定数項を消す — 両辺から9を引く。",
        "最後に両辺を-3で割る — マイナスの符号に注意！"
      ]
    },
    explanation: {
      en: "Subtracting 5x leaves a negative x term (-3x); dividing by -3 at the end turns -12 into a positive 4.",
      ja: "5xを引くとxの項が負（-3x）になります。最後に-3で割ると、-12が正の4になります。"
    }
  },
  {
    id: "linear_x_both_sides_07",
    topic: "equation",
    equation: "5x - 8 = x + 12",
    answer: 5,
    difficulty: "hard",
    type: "x-both-sides",
    basePoints: 30,
    steps: [
      { action: "subtract_x", value: 1, target: "both-sides", result: "4x - 8 = 12" },
      { action: "add",        value: 8, target: "both-sides", result: "4x = 20" },
      { action: "divide",     value: 4, target: "both-sides", result: "x = 5" }
    ],
    hints: {
      en: [
        "Start by combining the x terms — subtract x from both sides.",
        "Now remove the constant — add 8 to both sides.",
        "Finally divide both sides by 4 to isolate x."
      ],
      ja: [
        "まずxの項をまとめる — 両辺からxを引く。",
        "次に定数項を消す — 両辺に8を足す。",
        "最後に両辺を4で割ってxを求める。"
      ]
    },
    explanation: {
      en: "First eliminate the smaller x term, then solve the resulting two-step equation as usual.",
      ja: "まず小さい方のxの項を消し、残った2ステップの方程式をいつも通り解きます。"
    }
  },
  {
    id: "linear_x_both_sides_08",
    topic: "equation",
    equation: "3x + 14 = 5x + 2",
    answer: 6,
    difficulty: "hard",
    type: "x-both-sides",
    basePoints: 30,
    steps: [
      { action: "subtract_x", value: 5,  target: "both-sides", result: "-2x + 14 = 2" },
      { action: "subtract",   value: 14, target: "both-sides", result: "-2x = -12" },
      { action: "divide",     value: -2, target: "both-sides", result: "x = 6" }
    ],
    hints: {
      en: [
        "Start by combining the x terms — subtract 5x from both sides.",
        "Now remove the constant — subtract 14 from both sides.",
        "Finally divide both sides by -2 — watch the negative sign!"
      ],
      ja: [
        "まずxの項をまとめる — 両辺から5xを引く。",
        "次に定数項を消す — 両辺から14を引く。",
        "最後に両辺を-2で割る — マイナスの符号に注意！"
      ]
    },
    explanation: {
      en: "Subtracting 5x leaves -2x; dividing both sides by -2 at the end gives a positive answer.",
      ja: "5xを引くと-2xが残ります。最後に両辺を-2で割ると、答えは正の数になります。"
    }
  },
  {
    id: "linear_x_both_sides_09",
    topic: "equation",
    equation: "8x - 3 = 5x + 18",
    answer: 7,
    difficulty: "hard",
    type: "x-both-sides",
    basePoints: 30,
    steps: [
      { action: "subtract_x", value: 5, target: "both-sides", result: "3x - 3 = 18" },
      { action: "add",        value: 3, target: "both-sides", result: "3x = 21" },
      { action: "divide",     value: 3, target: "both-sides", result: "x = 7" }
    ],
    hints: {
      en: [
        "Start by combining the x terms — subtract 5x from both sides.",
        "Now remove the constant — add 3 to both sides.",
        "Finally divide both sides by 3 to isolate x."
      ],
      ja: [
        "まずxの項をまとめる — 両辺から5xを引く。",
        "次に定数項を消す — 両辺に3を足す。",
        "最後に両辺を3で割ってxを求める。"
      ]
    },
    explanation: {
      en: "First eliminate the smaller x term, then solve the resulting two-step equation as usual.",
      ja: "まず小さい方のxの項を消し、残った2ステップの方程式をいつも通り解きます。"
    }
  },
  {
    id: "linear_x_both_sides_10",
    topic: "equation",
    equation: "x + 6 = 4x + 12",
    answer: -2,
    difficulty: "hard",
    type: "x-both-sides",
    basePoints: 30,
    steps: [
      { action: "subtract_x", value: 4,  target: "both-sides", result: "-3x + 6 = 12" },
      { action: "subtract",   value: 6,  target: "both-sides", result: "-3x = 6" },
      { action: "divide",     value: -3, target: "both-sides", result: "x = -2" }
    ],
    hints: {
      en: [
        "Start by combining the x terms — subtract 4x from both sides.",
        "Now remove the constant — subtract 6 from both sides.",
        "Finally divide both sides by -3 — watch the negative sign!"
      ],
      ja: [
        "まずxの項をまとめる — 両辺から4xを引く。",
        "次に定数項を消す — 両辺から6を引く。",
        "最後に両辺を-3で割る — マイナスの符号に注意！"
      ]
    },
    explanation: {
      en: "Subtracting 4x leaves -3x; dividing 6 by -3 at the end gives a negative answer.",
      ja: "4xを引くと-3xが残ります。最後に6を-3で割ると、答えは負の数になります。"
    }
  },

  // =====================================================================
  // INEQUALITIES
  // =====================================================================

  // ---- Easy: one-step, no sign flip ----
  {
    id: "ineq_easy_01",
    topic: "inequality",
    equation: "x + 3 > 7",
    answer: "x > 4",
    difficulty: "easy",
    type: "one-step",
    basePoints: 10,
    steps: [
      { action: "subtract", value: 3, target: "both-sides", result: "x > 4" }
    ],
    hints: {
      en: ["Get x alone — subtract 3 from both sides."],
      ja: ["xを求める — 両辺から3を引く。"]
    },
    explanation: {
      en: "Inequalities are solved like equations: subtracting 3 from both sides keeps the inequality true and leaves x by itself.",
      ja: "不等式も方程式と同じように解けます。両辺から3を引いても不等式は成り立ち、xだけが残ります。"
    }
  },
  {
    id: "ineq_easy_02",
    topic: "inequality",
    equation: "x - 5 ≤ 2",
    answer: "x ≤ 7",
    difficulty: "easy",
    type: "one-step",
    basePoints: 10,
    steps: [
      { action: "add", value: 5, target: "both-sides", result: "x ≤ 7" }
    ],
    hints: {
      en: ["Get x alone — add 5 to both sides."],
      ja: ["xを求める — 両辺に5を足す。"]
    },
    explanation: {
      en: "Adding the same number to both sides never changes the direction of the inequality sign.",
      ja: "両辺に同じ数を足しても、不等号の向きは変わりません。"
    }
  },
  {
    id: "ineq_easy_03",
    topic: "inequality",
    equation: "4x ≥ 20",
    answer: "x ≥ 5",
    difficulty: "easy",
    type: "one-step",
    basePoints: 10,
    steps: [
      { action: "divide", value: 4, target: "both-sides", result: "x ≥ 5" }
    ],
    hints: {
      en: ["Get x alone — divide both sides by 4."],
      ja: ["xを求める — 両辺を4で割る。"]
    },
    explanation: {
      en: "Dividing both sides by a positive number keeps the inequality sign pointing the same way.",
      ja: "両辺を正の数で割っても、不等号の向きは変わりません。"
    }
  },
  {
    id: "ineq_easy_04",
    topic: "inequality",
    equation: "x/2 < 6",
    answer: "x < 12",
    difficulty: "easy",
    type: "one-step",
    basePoints: 10,
    steps: [
      { action: "multiply", value: 2, target: "both-sides", result: "x < 12" }
    ],
    hints: {
      en: ["Get x alone — multiply both sides by 2."],
      ja: ["xを求める — 両辺に2をかける。"]
    },
    explanation: {
      en: "Multiplying both sides by a positive number undoes the division and keeps the sign the same.",
      ja: "両辺に正の数をかけると割り算が打ち消され、不等号の向きはそのままです。"
    }
  },
  {
    id: "ineq_easy_05",
    topic: "inequality",
    equation: "x + 9 < 4",
    answer: "x < -5",
    difficulty: "easy",
    type: "one-step",
    basePoints: 10,
    steps: [
      { action: "subtract", value: 9, target: "both-sides", result: "x < -5" }
    ],
    hints: {
      en: ["Get x alone — subtract 9 from both sides."],
      ja: ["xを求める — 両辺から9を引く。"]
    },
    explanation: {
      en: "Subtracting 9 from both sides isolates x — the answer is negative, but the sign doesn't change.",
      ja: "両辺から9を引くとxが残ります。答えは負の数ですが、不等号の向きは変わりません。"
    }
  },
  {
    id: "ineq_easy_06",
    topic: "inequality",
    equation: "x - 2 ≥ -6",
    answer: "x ≥ -4",
    difficulty: "easy",
    type: "one-step",
    basePoints: 10,
    steps: [
      { action: "add", value: 2, target: "both-sides", result: "x ≥ -4" }
    ],
    hints: {
      en: ["Get x alone — add 2 to both sides."],
      ja: ["xを求める — 両辺に2を足す。"]
    },
    explanation: {
      en: "Adding 2 to both sides cancels the -2 and leaves x by itself, with the sign unchanged.",
      ja: "両辺に2を足すと-2が打ち消され、xだけが残ります。不等号の向きはそのままです。"
    }
  },
  {
    id: "ineq_easy_07",
    topic: "inequality",
    equation: "6x > 42",
    answer: "x > 7",
    difficulty: "easy",
    type: "one-step",
    basePoints: 10,
    steps: [
      { action: "divide", value: 6, target: "both-sides", result: "x > 7" }
    ],
    hints: {
      en: ["Get x alone — divide both sides by 6."],
      ja: ["xを求める — 両辺を6で割る。"]
    },
    explanation: {
      en: "Dividing both sides by 6 (a positive number) isolates x and keeps the sign the same.",
      ja: "両辺を6（正の数）で割るとxが残り、不等号の向きは変わりません。"
    }
  },
  {
    id: "ineq_easy_08",
    topic: "inequality",
    equation: "x/3 ≤ 5",
    answer: "x ≤ 15",
    difficulty: "easy",
    type: "one-step",
    basePoints: 10,
    steps: [
      { action: "multiply", value: 3, target: "both-sides", result: "x ≤ 15" }
    ],
    hints: {
      en: ["Get x alone — multiply both sides by 3."],
      ja: ["xを求める — 両辺に3をかける。"]
    },
    explanation: {
      en: "Multiplying both sides by 3 undoes the division by 3 and keeps the sign the same.",
      ja: "両辺に3をかけると3での割り算が打ち消され、不等号の向きはそのままです。"
    }
  },
  {
    id: "ineq_easy_09",
    topic: "inequality",
    equation: "5x < -15",
    answer: "x < -3",
    difficulty: "easy",
    type: "one-step",
    basePoints: 10,
    steps: [
      { action: "divide", value: 5, target: "both-sides", result: "x < -3" }
    ],
    hints: {
      en: ["Get x alone — divide both sides by 5."],
      ja: ["xを求める — 両辺を5で割る。"]
    },
    explanation: {
      en: "The right side is negative, but you're dividing by a positive 5 — so the sign does NOT flip.",
      ja: "右辺は負の数ですが、割る数は正の5なので、不等号の向きは変わりません。"
    }
  },
  {
    id: "ineq_easy_10",
    topic: "inequality",
    equation: "x + 7 ≥ 7",
    answer: "x ≥ 0",
    difficulty: "easy",
    type: "one-step",
    basePoints: 10,
    steps: [
      { action: "subtract", value: 7, target: "both-sides", result: "x ≥ 0" }
    ],
    hints: {
      en: ["Get x alone — subtract 7 from both sides."],
      ja: ["xを求める — 両辺から7を引く。"]
    },
    explanation: {
      en: "Subtracting 7 from both sides leaves x ≥ 0 — x can be zero or any positive number.",
      ja: "両辺から7を引くと x ≥ 0 になります。xは0または正の数です。"
    }
  },

  // ---- Medium: one-step sign flips + two-step ----
  {
    id: "ineq_medium_01",
    topic: "inequality",
    equation: "-3x > 12",
    answer: "x < -4",
    difficulty: "medium",
    type: "one-step",
    basePoints: 20,
    steps: [
      { action: "divide", value: -3, target: "both-sides", result: "x < -4", flip: true }
    ],
    hints: {
      en: ["Divide both sides by -3 — dividing by a negative flips the sign!"],
      ja: ["両辺を-3で割る — 負の数で割ると不等号の向きが逆になる！"]
    },
    explanation: {
      en: "Whenever you multiply or divide both sides by a negative number, the inequality sign reverses: > becomes <.",
      ja: "両辺に負の数をかけたり、負の数で割ったりすると、不等号の向きが逆になります（> が < に）。"
    }
  },
  {
    id: "ineq_medium_02",
    topic: "inequality",
    equation: "-x/2 ≤ 5",
    answer: "x ≥ -10",
    difficulty: "medium",
    type: "one-step",
    basePoints: 20,
    steps: [
      { action: "multiply", value: -2, target: "both-sides", result: "x ≥ -10", flip: true }
    ],
    hints: {
      en: ["Multiply both sides by -2 — multiplying by a negative flips the sign!"],
      ja: ["両辺に-2をかける — 負の数をかけると不等号の向きが逆になる！"]
    },
    explanation: {
      en: "x is divided by -2, so multiply both sides by -2. Because -2 is negative, ≤ becomes ≥.",
      ja: "xが-2で割られているので、両辺に-2をかけます。-2は負の数なので、≤ が ≥ になります。"
    }
  },
  {
    id: "ineq_medium_03",
    topic: "inequality",
    equation: "2x + 3 < 11",
    answer: "x < 4",
    difficulty: "medium",
    type: "two-step",
    basePoints: 20,
    steps: [
      { action: "subtract", value: 3, target: "both-sides", result: "2x < 8" },
      { action: "divide",   value: 2, target: "both-sides", result: "x < 4" }
    ],
    hints: {
      en: [
        "Start by removing the constant — subtract 3 from both sides.",
        "Now divide both sides by 2 to finish isolating x."
      ],
      ja: [
        "まず定数項を消す — 両辺から3を引く。",
        "次に両辺を2で割ってxを求める。"
      ]
    },
    explanation: {
      en: "Same two steps as an equation: remove the +3, then divide by 2. Both are positive, so the sign stays the same.",
      ja: "方程式と同じ2ステップです。+3を消してから2で割ります。どちらも正の数なので、不等号の向きは変わりません。"
    }
  },
  {
    id: "ineq_medium_04",
    topic: "inequality",
    equation: "-2x + 5 ≥ 13",
    answer: "x ≤ -4",
    difficulty: "medium",
    type: "two-step",
    basePoints: 20,
    steps: [
      { action: "subtract", value: 5,  target: "both-sides", result: "-2x ≥ 8" },
      { action: "divide",   value: -2, target: "both-sides", result: "x ≤ -4", flip: true }
    ],
    hints: {
      en: [
        "Start by removing the constant — subtract 5 from both sides.",
        "Now divide both sides by -2 — remember to flip the sign!"
      ],
      ja: [
        "まず定数項を消す — 両辺から5を引く。",
        "次に両辺を-2で割る — 不等号の向きを逆にするのを忘れずに！"
      ]
    },
    explanation: {
      en: "Subtracting 5 doesn't affect the sign, but dividing by -2 does: ≥ becomes ≤.",
      ja: "5を引いても不等号は変わりませんが、-2で割ると ≥ が ≤ になります。"
    }
  },
  {
    id: "ineq_medium_05",
    topic: "inequality",
    equation: "-4x ≤ -20",
    answer: "x ≥ 5",
    difficulty: "medium",
    type: "one-step",
    basePoints: 20,
    steps: [
      { action: "divide", value: -4, target: "both-sides", result: "x ≥ 5", flip: true }
    ],
    hints: {
      en: ["Divide both sides by -4 — dividing by a negative flips the sign!"],
      ja: ["両辺を-4で割る — 負の数で割ると不等号の向きが逆になる！"]
    },
    explanation: {
      en: "Dividing by -4 flips ≤ to ≥ — and -20 ÷ -4 gives a positive 5.",
      ja: "-4で割ると ≤ が ≥ になります。-20 ÷ -4 は正の5です。"
    }
  },
  {
    id: "ineq_medium_06",
    topic: "inequality",
    equation: "3x - 4 > 11",
    answer: "x > 5",
    difficulty: "medium",
    type: "two-step",
    basePoints: 20,
    steps: [
      { action: "add",    value: 4, target: "both-sides", result: "3x > 15" },
      { action: "divide", value: 3, target: "both-sides", result: "x > 5" }
    ],
    hints: {
      en: [
        "Start by removing the constant — add 4 to both sides.",
        "Now divide both sides by 3 to finish isolating x."
      ],
      ja: [
        "まず定数項を消す — 両辺に4を足す。",
        "次に両辺を3で割ってxを求める。"
      ]
    },
    explanation: {
      en: "Remove the -4 by adding 4, then divide by 3. No negatives involved, so the sign stays the same.",
      ja: "4を足して-4を消し、3で割ります。負の数は使わないので、不等号の向きは変わりません。"
    }
  },
  {
    id: "ineq_medium_07",
    topic: "inequality",
    equation: "x/4 + 1 ≥ 3",
    answer: "x ≥ 8",
    difficulty: "medium",
    type: "two-step",
    basePoints: 20,
    steps: [
      { action: "subtract", value: 1, target: "both-sides", result: "x/4 ≥ 2" },
      { action: "multiply", value: 4, target: "both-sides", result: "x ≥ 8" }
    ],
    hints: {
      en: [
        "Start by removing the constant — subtract 1 from both sides.",
        "Now multiply both sides by 4 to finish isolating x."
      ],
      ja: [
        "まず定数項を消す — 両辺から1を引く。",
        "次に両辺に4をかけてxを求める。"
      ]
    },
    explanation: {
      en: "Remove the +1, then multiply by 4 to undo the division. The sign stays ≥ throughout.",
      ja: "+1を消してから、両辺に4をかけて割り算を打ち消します。不等号は ≥ のままです。"
    }
  },
  {
    id: "ineq_medium_08",
    topic: "inequality",
    equation: "-5x < 30",
    answer: "x > -6",
    difficulty: "medium",
    type: "one-step",
    basePoints: 20,
    steps: [
      { action: "divide", value: -5, target: "both-sides", result: "x > -6", flip: true }
    ],
    hints: {
      en: ["Divide both sides by -5 — dividing by a negative flips the sign!"],
      ja: ["両辺を-5で割る — 負の数で割ると不等号の向きが逆になる！"]
    },
    explanation: {
      en: "Dividing by -5 flips < to >, giving x > -6.",
      ja: "-5で割ると < が > になり、x > -6 になります。"
    }
  },
  {
    id: "ineq_medium_09",
    topic: "inequality",
    equation: "5 - 3x > 20",
    answer: "x < -5",
    difficulty: "medium",
    type: "two-step",
    basePoints: 20,
    steps: [
      { action: "subtract", value: 5,  target: "both-sides", result: "-3x > 15" },
      { action: "divide",   value: -3, target: "both-sides", result: "x < -5", flip: true }
    ],
    hints: {
      en: [
        "Start by removing the constant — subtract 5 from both sides.",
        "Now divide both sides by -3 — remember to flip the sign!"
      ],
      ja: [
        "まず定数項を消す — 両辺から5を引く。",
        "次に両辺を-3で割る — 不等号の向きを逆にするのを忘れずに！"
      ]
    },
    explanation: {
      en: "The x term is negative (-3x), so the final division by -3 flips > to <.",
      ja: "xの項が負（-3x）なので、最後に-3で割ると > が < になります。"
    }
  },
  {
    id: "ineq_medium_10",
    topic: "inequality",
    equation: "-x/3 > 2",
    answer: "x < -6",
    difficulty: "medium",
    type: "one-step",
    basePoints: 20,
    steps: [
      { action: "multiply", value: -3, target: "both-sides", result: "x < -6", flip: true }
    ],
    hints: {
      en: ["Multiply both sides by -3 — multiplying by a negative flips the sign!"],
      ja: ["両辺に-3をかける — 負の数をかけると不等号の向きが逆になる！"]
    },
    explanation: {
      en: "x is divided by -3, so multiply both sides by -3. Because it's negative, > becomes <.",
      ja: "xが-3で割られているので、両辺に-3をかけます。負の数なので > が < になります。"
    }
  },

  // ---- Hard: two-step flips + x on both sides ----
  {
    id: "ineq_hard_01",
    topic: "inequality",
    equation: "5x - 2 > 2x + 10",
    answer: "x > 4",
    difficulty: "hard",
    type: "x-both-sides",
    basePoints: 30,
    steps: [
      { action: "subtract_x", value: 2, target: "both-sides", result: "3x - 2 > 10" },
      { action: "add",        value: 2, target: "both-sides", result: "3x > 12" },
      { action: "divide",     value: 3, target: "both-sides", result: "x > 4" }
    ],
    hints: {
      en: [
        "Start by combining the x terms — subtract 2x from both sides.",
        "Now remove the constant — add 2 to both sides.",
        "Finally divide both sides by 3 to isolate x."
      ],
      ja: [
        "まずxの項をまとめる — 両辺から2xを引く。",
        "次に定数項を消す — 両辺に2を足す。",
        "最後に両辺を3で割ってxを求める。"
      ]
    },
    explanation: {
      en: "Gather the x terms on one side, remove the constant, then divide. The coefficient ends up positive, so the sign never flips.",
      ja: "xの項を片側にまとめ、定数項を消してから割ります。係数は正なので、不等号の向きは変わりません。"
    }
  },
  {
    id: "ineq_hard_02",
    topic: "inequality",
    equation: "x + 4 ≥ 3x - 6",
    answer: "x ≤ 5",
    difficulty: "hard",
    type: "x-both-sides",
    basePoints: 30,
    steps: [
      { action: "subtract_x", value: 3,  target: "both-sides", result: "-2x + 4 ≥ -6" },
      { action: "subtract",   value: 4,  target: "both-sides", result: "-2x ≥ -10" },
      { action: "divide",     value: -2, target: "both-sides", result: "x ≤ 5", flip: true }
    ],
    hints: {
      en: [
        "Start by combining the x terms — subtract 3x from both sides.",
        "Now remove the constant — subtract 4 from both sides.",
        "Finally divide both sides by -2 — remember to flip the sign!"
      ],
      ja: [
        "まずxの項をまとめる — 両辺から3xを引く。",
        "次に定数項を消す — 両辺から4を引く。",
        "最後に両辺を-2で割る — 不等号の向きを逆にするのを忘れずに！"
      ]
    },
    explanation: {
      en: "Subtracting 3x leaves a negative x term (-2x), so the final division by -2 flips ≥ to ≤.",
      ja: "3xを引くとxの項が負（-2x）になるので、最後に-2で割ると ≥ が ≤ になります。"
    }
  },
  {
    id: "ineq_hard_03",
    topic: "inequality",
    equation: "4x + 1 < x + 13",
    answer: "x < 4",
    difficulty: "hard",
    type: "x-both-sides",
    basePoints: 30,
    steps: [
      { action: "subtract_x", value: 1, target: "both-sides", result: "3x + 1 < 13" },
      { action: "subtract",   value: 1, target: "both-sides", result: "3x < 12" },
      { action: "divide",     value: 3, target: "both-sides", result: "x < 4" }
    ],
    hints: {
      en: [
        "Start by combining the x terms — subtract x from both sides.",
        "Now remove the constant — subtract 1 from both sides.",
        "Finally divide both sides by 3 to isolate x."
      ],
      ja: [
        "まずxの項をまとめる — 両辺からxを引く。",
        "次に定数項を消す — 両辺から1を引く。",
        "最後に両辺を3で割ってxを求める。"
      ]
    },
    explanation: {
      en: "Subtract the smaller x term first so the coefficient stays positive — then no sign flip is needed.",
      ja: "小さい方のxの項を先に引くと係数が正のままになり、不等号を逆にする必要がありません。"
    }
  },
  {
    id: "ineq_hard_04",
    topic: "inequality",
    equation: "-3x - 4 ≤ 11",
    answer: "x ≥ -5",
    difficulty: "hard",
    type: "two-step",
    basePoints: 30,
    steps: [
      { action: "add",    value: 4,  target: "both-sides", result: "-3x ≤ 15" },
      { action: "divide", value: -3, target: "both-sides", result: "x ≥ -5", flip: true }
    ],
    hints: {
      en: [
        "Start by removing the constant — add 4 to both sides.",
        "Now divide both sides by -3 — remember to flip the sign!"
      ],
      ja: [
        "まず定数項を消す — 両辺に4を足す。",
        "次に両辺を-3で割る — 不等号の向きを逆にするのを忘れずに！"
      ]
    },
    explanation: {
      en: "Adding 4 keeps the sign, but dividing by -3 flips ≤ to ≥.",
      ja: "4を足しても不等号は変わりませんが、-3で割ると ≤ が ≥ になります。"
    }
  },
  {
    id: "ineq_hard_05",
    topic: "inequality",
    equation: "7x - 3 ≥ 4x + 9",
    answer: "x ≥ 4",
    difficulty: "hard",
    type: "x-both-sides",
    basePoints: 30,
    steps: [
      { action: "subtract_x", value: 4, target: "both-sides", result: "3x - 3 ≥ 9" },
      { action: "add",        value: 3, target: "both-sides", result: "3x ≥ 12" },
      { action: "divide",     value: 3, target: "both-sides", result: "x ≥ 4" }
    ],
    hints: {
      en: [
        "Start by combining the x terms — subtract 4x from both sides.",
        "Now remove the constant — add 3 to both sides.",
        "Finally divide both sides by 3 to isolate x."
      ],
      ja: [
        "まずxの項をまとめる — 両辺から4xを引く。",
        "次に定数項を消す — 両辺に3を足す。",
        "最後に両辺を3で割ってxを求める。"
      ]
    },
    explanation: {
      en: "Gather x terms, remove the constant, then divide by a positive 3 — the sign stays ≥.",
      ja: "xの項をまとめ、定数項を消し、正の3で割ります。不等号は ≥ のままです。"
    }
  },
  {
    id: "ineq_hard_06",
    topic: "inequality",
    equation: "2x + 7 > 5x - 8",
    answer: "x < 5",
    difficulty: "hard",
    type: "x-both-sides",
    basePoints: 30,
    steps: [
      { action: "subtract_x", value: 5,  target: "both-sides", result: "-3x + 7 > -8" },
      { action: "subtract",   value: 7,  target: "both-sides", result: "-3x > -15" },
      { action: "divide",     value: -3, target: "both-sides", result: "x < 5", flip: true }
    ],
    hints: {
      en: [
        "Start by combining the x terms — subtract 5x from both sides.",
        "Now remove the constant — subtract 7 from both sides.",
        "Finally divide both sides by -3 — remember to flip the sign!"
      ],
      ja: [
        "まずxの項をまとめる — 両辺から5xを引く。",
        "次に定数項を消す — 両辺から7を引く。",
        "最後に両辺を-3で割る — 不等号の向きを逆にするのを忘れずに！"
      ]
    },
    explanation: {
      en: "After subtracting 5x the x term is negative, so dividing by -3 at the end flips > to <.",
      ja: "5xを引くとxの項が負になるので、最後に-3で割ると > が < になります。"
    }
  },
  {
    id: "ineq_hard_07",
    topic: "inequality",
    equation: "-x/4 + 2 < 5",
    answer: "x > -12",
    difficulty: "hard",
    type: "two-step",
    basePoints: 30,
    steps: [
      { action: "subtract", value: 2,  target: "both-sides", result: "-x/4 < 3" },
      { action: "multiply", value: -4, target: "both-sides", result: "x > -12", flip: true }
    ],
    hints: {
      en: [
        "Start by removing the constant — subtract 2 from both sides.",
        "Now multiply both sides by -4 — remember to flip the sign!"
      ],
      ja: [
        "まず定数項を消す — 両辺から2を引く。",
        "次に両辺に-4をかける — 不等号の向きを逆にするのを忘れずに！"
      ]
    },
    explanation: {
      en: "Remove the +2, then multiply by -4 to undo the division by -4. Multiplying by a negative flips < to >.",
      ja: "+2を消してから、両辺に-4をかけて-4での割り算を打ち消します。負の数をかけると < が > になります。"
    }
  },
  {
    id: "ineq_hard_08",
    topic: "inequality",
    equation: "6x - 5 ≤ 2x + 11",
    answer: "x ≤ 4",
    difficulty: "hard",
    type: "x-both-sides",
    basePoints: 30,
    steps: [
      { action: "subtract_x", value: 2, target: "both-sides", result: "4x - 5 ≤ 11" },
      { action: "add",        value: 5, target: "both-sides", result: "4x ≤ 16" },
      { action: "divide",     value: 4, target: "both-sides", result: "x ≤ 4" }
    ],
    hints: {
      en: [
        "Start by combining the x terms — subtract 2x from both sides.",
        "Now remove the constant — add 5 to both sides.",
        "Finally divide both sides by 4 to isolate x."
      ],
      ja: [
        "まずxの項をまとめる — 両辺から2xを引く。",
        "次に定数項を消す — 両辺に5を足す。",
        "最後に両辺を4で割ってxを求める。"
      ]
    },
    explanation: {
      en: "Gather the x terms, remove the -5, then divide by a positive 4 — no flip needed.",
      ja: "xの項をまとめ、-5を消し、正の4で割ります。不等号を逆にする必要はありません。"
    }
  },
  {
    id: "ineq_hard_09",
    topic: "inequality",
    equation: "3 - 2x ≥ x + 12",
    answer: "x ≤ -3",
    difficulty: "hard",
    type: "x-both-sides",
    basePoints: 30,
    steps: [
      { action: "subtract_x", value: 1,  target: "both-sides", result: "3 - 3x ≥ 12" },
      { action: "subtract",   value: 3,  target: "both-sides", result: "-3x ≥ 9" },
      { action: "divide",     value: -3, target: "both-sides", result: "x ≤ -3", flip: true }
    ],
    hints: {
      en: [
        "Start by combining the x terms — subtract x from both sides.",
        "Now remove the constant — subtract 3 from both sides.",
        "Finally divide both sides by -3 — remember to flip the sign!"
      ],
      ja: [
        "まずxの項をまとめる — 両辺からxを引く。",
        "次に定数項を消す — 両辺から3を引く。",
        "最後に両辺を-3で割る — 不等号の向きを逆にするのを忘れずに！"
      ]
    },
    explanation: {
      en: "The x terms combine into -3x, so the last step divides by a negative and flips ≥ to ≤.",
      ja: "xの項をまとめると-3xになるので、最後に負の数で割り、≥ が ≤ になります。"
    }
  },
  {
    id: "ineq_hard_10",
    topic: "inequality",
    equation: "x - 9 < 4x + 3",
    answer: "x > -4",
    difficulty: "hard",
    type: "x-both-sides",
    basePoints: 30,
    steps: [
      { action: "subtract_x", value: 4,  target: "both-sides", result: "-3x - 9 < 3" },
      { action: "add",        value: 9,  target: "both-sides", result: "-3x < 12" },
      { action: "divide",     value: -3, target: "both-sides", result: "x > -4", flip: true }
    ],
    hints: {
      en: [
        "Start by combining the x terms — subtract 4x from both sides.",
        "Now remove the constant — add 9 to both sides.",
        "Finally divide both sides by -3 — remember to flip the sign!"
      ],
      ja: [
        "まずxの項をまとめる — 両辺から4xを引く。",
        "次に定数項を消す — 両辺に9を足す。",
        "最後に両辺を-3で割る — 不等号の向きを逆にするのを忘れずに！"
      ]
    },
    explanation: {
      en: "Subtracting 4x leaves -3x on the left, so dividing by -3 flips < to >.",
      ja: "4xを引くと左辺が-3xになるので、-3で割ると < が > になります。"
    }
  },
  // =====================================================================
  // BRACKETS
  // =====================================================================

  // ---- Easy: positive number outside, + inside ----
  {
    id: "brackets_easy_01",
    topic: "brackets",
    equation: "2(x + 3) = 14",
    answer: 4,
    difficulty: "easy",
    type: "brackets",
    basePoints: 10,
    steps: [
      { action: "expand",   value: "2x + 6", wrong: ["2x + 3", "x + 6", "2x + 5"], target: "left", result: "2x + 6 = 14" },
      { action: "subtract", value: 6, target: "both-sides", result: "2x = 8" },
      { action: "divide",   value: 2, target: "both-sides", result: "x = 4" }
    ],
    hints: {
      en: [
        "Expand the brackets — multiply 2 by each term inside: 2 × x and 2 × 3.",
        "Now remove the constant — subtract 6 from both sides.",
        "Finally divide both sides by 2 to isolate x."
      ],
      ja: [
        "かっこを展開する — 2をかっこの中の各項にかける：2 × x と 2 × 3。",
        "次に定数項を消す — 両辺から6を引く。",
        "最後に両辺を2で割ってxを求める。"
      ]
    },
    explanation: {
      en: "Expanding multiplies the number outside by every term inside, so 2(x + 3) becomes 2x + 6. The value doesn't change, so it's done on one side only — then solve as usual.",
      ja: "展開では、かっこの外の数を中のすべての項にかけます。2(x + 3) は 2x + 6 になります。値は変わらないので片側だけで行い、その後はいつも通り解きます。"
    }
  },

  {
    id: "brackets_easy_02",
    topic: "brackets",
    equation: "3(x + 2) = 21",
    answer: 5,
    difficulty: "easy",
    type: "brackets",
    basePoints: 10,
    steps: [
      { action: "expand",   value: "3x + 6", wrong: ["3x + 2", "x + 6", "3x + 5"], target: "left", result: "3x + 6 = 21" },
      { action: "subtract", value: 6, target: "both-sides", result: "3x = 15" },
      { action: "divide",   value: 3, target: "both-sides", result: "x = 5" }
    ],
    hints: {
      en: [
        "Expand the brackets — multiply 3 by each term inside: 3 × x and 3 × 2.",
        "Now remove the constant — subtract 6 from both sides.",
        "Finally divide both sides by 3 to isolate x."
      ],
      ja: [
        "かっこを展開する — 3をかっこの中の各項にかける：3 × x と 3 × 2。",
        "次に定数項を消す — 両辺から6を引く。",
        "最後に両辺を3で割ってxを求める。"
      ]
    },
    explanation: {
      en: "3 multiplies both x and 2, so 3(x + 2) becomes 3x + 6 — not 3x + 2.",
      ja: "3はxと2の両方にかかるので、3(x + 2) は 3x + 2 ではなく 3x + 6 になります。"
    }
  },
  {
    id: "brackets_easy_03",
    topic: "brackets",
    equation: "4(x + 1) = 20",
    answer: 4,
    difficulty: "easy",
    type: "brackets",
    basePoints: 10,
    steps: [
      { action: "expand",   value: "4x + 4", wrong: ["4x + 1", "x + 4", "4x + 5"], target: "left", result: "4x + 4 = 20" },
      { action: "subtract", value: 4, target: "both-sides", result: "4x = 16" },
      { action: "divide",   value: 4, target: "both-sides", result: "x = 4" }
    ],
    hints: {
      en: [
        "Expand the brackets — multiply 4 by each term inside: 4 × x and 4 × 1.",
        "Now remove the constant — subtract 4 from both sides.",
        "Finally divide both sides by 4 to isolate x."
      ],
      ja: [
        "かっこを展開する — 4をかっこの中の各項にかける：4 × x と 4 × 1。",
        "次に定数項を消す — 両辺から4を引く。",
        "最後に両辺を4で割ってxを求める。"
      ]
    },
    explanation: {
      en: "Multiply 4 by each term: 4 × x = 4x and 4 × 1 = 4, giving 4x + 4.",
      ja: "4を各項にかけます：4 × x = 4x、4 × 1 = 4 で 4x + 4 になります。"
    }
  },
  {
    id: "brackets_easy_04",
    topic: "brackets",
    equation: "5(x + 2) = 40",
    answer: 6,
    difficulty: "easy",
    type: "brackets",
    basePoints: 10,
    steps: [
      { action: "expand",   value: "5x + 10", wrong: ["5x + 2", "x + 10", "5x + 7"], target: "left", result: "5x + 10 = 40" },
      { action: "subtract", value: 10, target: "both-sides", result: "5x = 30" },
      { action: "divide",   value: 5,  target: "both-sides", result: "x = 6" }
    ],
    hints: {
      en: [
        "Expand the brackets — multiply 5 by each term inside: 5 × x and 5 × 2.",
        "Now remove the constant — subtract 10 from both sides.",
        "Finally divide both sides by 5 to isolate x."
      ],
      ja: [
        "かっこを展開する — 5をかっこの中の各項にかける：5 × x と 5 × 2。",
        "次に定数項を消す — 両辺から10を引く。",
        "最後に両辺を5で割ってxを求める。"
      ]
    },
    explanation: {
      en: "Every term inside gets multiplied: 5(x + 2) = 5x + 10. Then remove the 10 and divide by 5.",
      ja: "かっこの中のすべての項にかけます：5(x + 2) = 5x + 10。その後10を消して5で割ります。"
    }
  },
  {
    id: "brackets_easy_05",
    topic: "brackets",
    equation: "2(x + 5) = 16",
    answer: 3,
    difficulty: "easy",
    type: "brackets",
    basePoints: 10,
    steps: [
      { action: "expand",   value: "2x + 10", wrong: ["2x + 5", "x + 10", "2x + 7"], target: "left", result: "2x + 10 = 16" },
      { action: "subtract", value: 10, target: "both-sides", result: "2x = 6" },
      { action: "divide",   value: 2,  target: "both-sides", result: "x = 3" }
    ],
    hints: {
      en: [
        "Expand the brackets — multiply 2 by each term inside: 2 × x and 2 × 5.",
        "Now remove the constant — subtract 10 from both sides.",
        "Finally divide both sides by 2 to isolate x."
      ],
      ja: [
        "かっこを展開する — 2をかっこの中の各項にかける：2 × x と 2 × 5。",
        "次に定数項を消す — 両辺から10を引く。",
        "最後に両辺を2で割ってxを求める。"
      ]
    },
    explanation: {
      en: "The number outside multiplies x too — 2(x + 5) is 2x + 10, not x + 10.",
      ja: "外の数はxにもかかります。2(x + 5) は x + 10 ではなく 2x + 10 です。"
    }
  },
  {
    id: "brackets_easy_06",
    topic: "brackets",
    equation: "3(x + 4) = 18",
    answer: 2,
    difficulty: "easy",
    type: "brackets",
    basePoints: 10,
    steps: [
      { action: "expand",   value: "3x + 12", wrong: ["3x + 4", "x + 12", "3x + 7"], target: "left", result: "3x + 12 = 18" },
      { action: "subtract", value: 12, target: "both-sides", result: "3x = 6" },
      { action: "divide",   value: 3,  target: "both-sides", result: "x = 2" }
    ],
    hints: {
      en: [
        "Expand the brackets — multiply 3 by each term inside: 3 × x and 3 × 4.",
        "Now remove the constant — subtract 12 from both sides.",
        "Finally divide both sides by 3 to isolate x."
      ],
      ja: [
        "かっこを展開する — 3をかっこの中の各項にかける：3 × x と 3 × 4。",
        "次に定数項を消す — 両辺から12を引く。",
        "最後に両辺を3で割ってxを求める。"
      ]
    },
    explanation: {
      en: "3 × 4 = 12, so 3(x + 4) expands to 3x + 12. Subtracting 12 and dividing by 3 gives x = 2.",
      ja: "3 × 4 = 12 なので、3(x + 4) は 3x + 12 に展開されます。12を引いて3で割ると x = 2 です。"
    }
  },
  {
    id: "brackets_easy_07",
    topic: "brackets",
    equation: "6(x + 1) = 30",
    answer: 4,
    difficulty: "easy",
    type: "brackets",
    basePoints: 10,
    steps: [
      { action: "expand",   value: "6x + 6", wrong: ["6x + 1", "x + 6", "6x + 7"], target: "left", result: "6x + 6 = 30" },
      { action: "subtract", value: 6, target: "both-sides", result: "6x = 24" },
      { action: "divide",   value: 6, target: "both-sides", result: "x = 4" }
    ],
    hints: {
      en: [
        "Expand the brackets — multiply 6 by each term inside: 6 × x and 6 × 1.",
        "Now remove the constant — subtract 6 from both sides.",
        "Finally divide both sides by 6 to isolate x."
      ],
      ja: [
        "かっこを展開する — 6をかっこの中の各項にかける：6 × x と 6 × 1。",
        "次に定数項を消す — 両辺から6を引く。",
        "最後に両辺を6で割ってxを求める。"
      ]
    },
    explanation: {
      en: "Even when the term inside is 1, it still gets multiplied: 6 × 1 = 6, so 6(x + 1) = 6x + 6.",
      ja: "かっこの中の項が1でもかけ算は必要です。6 × 1 = 6 なので、6(x + 1) = 6x + 6 です。"
    }
  },
  {
    id: "brackets_easy_08",
    topic: "brackets",
    equation: "2(x + 7) = 32",
    answer: 9,
    difficulty: "easy",
    type: "brackets",
    basePoints: 10,
    steps: [
      { action: "expand",   value: "2x + 14", wrong: ["2x + 7", "x + 14", "2x + 9"], target: "left", result: "2x + 14 = 32" },
      { action: "subtract", value: 14, target: "both-sides", result: "2x = 18" },
      { action: "divide",   value: 2,  target: "both-sides", result: "x = 9" }
    ],
    hints: {
      en: [
        "Expand the brackets — multiply 2 by each term inside: 2 × x and 2 × 7.",
        "Now remove the constant — subtract 14 from both sides.",
        "Finally divide both sides by 2 to isolate x."
      ],
      ja: [
        "かっこを展開する — 2をかっこの中の各項にかける：2 × x と 2 × 7。",
        "次に定数項を消す — 両辺から14を引く。",
        "最後に両辺を2で割ってxを求める。"
      ]
    },
    explanation: {
      en: "Expanding means multiplying, not adding: 2 × 7 = 14, so 2(x + 7) becomes 2x + 14.",
      ja: "展開は足し算ではなくかけ算です。2 × 7 = 14 なので、2(x + 7) は 2x + 14 になります。"
    }
  },
  {
    id: "brackets_easy_09",
    topic: "brackets",
    equation: "4(x + 3) = 40",
    answer: 7,
    difficulty: "easy",
    type: "brackets",
    basePoints: 10,
    steps: [
      { action: "expand",   value: "4x + 12", wrong: ["4x + 3", "x + 12", "4x + 7"], target: "left", result: "4x + 12 = 40" },
      { action: "subtract", value: 12, target: "both-sides", result: "4x = 28" },
      { action: "divide",   value: 4,  target: "both-sides", result: "x = 7" }
    ],
    hints: {
      en: [
        "Expand the brackets — multiply 4 by each term inside: 4 × x and 4 × 3.",
        "Now remove the constant — subtract 12 from both sides.",
        "Finally divide both sides by 4 to isolate x."
      ],
      ja: [
        "かっこを展開する — 4をかっこの中の各項にかける：4 × x と 4 × 3。",
        "次に定数項を消す — 両辺から12を引く。",
        "最後に両辺を4で割ってxを求める。"
      ]
    },
    explanation: {
      en: "4(x + 3) becomes 4x + 12. Subtract 12 to leave 4x = 28, then divide by 4.",
      ja: "4(x + 3) は 4x + 12 になります。12を引くと 4x = 28、4で割って x = 7 です。"
    }
  },
  {
    id: "brackets_easy_10",
    topic: "brackets",
    equation: "5(x + 3) = 55",
    answer: 8,
    difficulty: "easy",
    type: "brackets",
    basePoints: 10,
    steps: [
      { action: "expand",   value: "5x + 15", wrong: ["5x + 3", "x + 15", "5x + 8"], target: "left", result: "5x + 15 = 55" },
      { action: "subtract", value: 15, target: "both-sides", result: "5x = 40" },
      { action: "divide",   value: 5,  target: "both-sides", result: "x = 8" }
    ],
    hints: {
      en: [
        "Expand the brackets — multiply 5 by each term inside: 5 × x and 5 × 3.",
        "Now remove the constant — subtract 15 from both sides.",
        "Finally divide both sides by 5 to isolate x."
      ],
      ja: [
        "かっこを展開する — 5をかっこの中の各項にかける：5 × x と 5 × 3。",
        "次に定数項を消す — 両辺から15を引く。",
        "最後に両辺を5で割ってxを求める。"
      ]
    },
    explanation: {
      en: "5(x + 3) = 5x + 15 — both terms inside are multiplied by 5. Then solve the two-step equation as usual.",
      ja: "5(x + 3) = 5x + 15 — かっこの中の両方の項に5をかけます。その後はいつも通り2ステップで解きます。"
    }
  },

  // ---- Medium: minus inside the brackets ----
  {
    id: "brackets_medium_01",
    topic: "brackets",
    equation: "3(x - 2) = 12",
    answer: 6,
    difficulty: "medium",
    type: "brackets",
    basePoints: 20,
    steps: [
      { action: "expand", value: "3x - 6", wrong: ["3x - 2", "3x + 6", "x - 6"], target: "left", result: "3x - 6 = 12" },
      { action: "add",    value: 6, target: "both-sides", result: "3x = 18" },
      { action: "divide", value: 3, target: "both-sides", result: "x = 6" }
    ],
    hints: {
      en: [
        "Expand the brackets — multiply 3 by each term: 3 × x and 3 × (-2).",
        "Now remove the constant — add 6 to both sides.",
        "Finally divide both sides by 3 to isolate x."
      ],
      ja: [
        "かっこを展開する — 3を各項にかける：3 × x と 3 ×（-2）。",
        "次に定数項を消す — 両辺に6を足す。",
        "最後に両辺を3で割ってxを求める。"
      ]
    },
    explanation: {
      en: "The minus inside the brackets gets multiplied too: 3 × (-2) = -6, so 3(x - 2) becomes 3x - 6.",
      ja: "かっこの中のマイナスも一緒にかけます。3 ×（-2）= -6 なので、3(x - 2) は 3x - 6 になります。"
    }
  },

  {
    id: "brackets_medium_02",
    topic: "brackets",
    equation: "2(x - 4) = 6",
    answer: 7,
    difficulty: "medium",
    type: "brackets",
    basePoints: 20,
    steps: [
      { action: "expand", value: "2x - 8", wrong: ["2x - 4", "2x + 8", "x - 8"], target: "left", result: "2x - 8 = 6" },
      { action: "add",    value: 8, target: "both-sides", result: "2x = 14" },
      { action: "divide", value: 2, target: "both-sides", result: "x = 7" }
    ],
    hints: {
      en: [
        "Expand the brackets — multiply 2 by each term: 2 × x and 2 × (-4).",
        "Now remove the constant — add 8 to both sides.",
        "Finally divide both sides by 2 to isolate x."
      ],
      ja: [
        "かっこを展開する — 2を各項にかける：2 × x と 2 ×（-4）。",
        "次に定数項を消す — 両辺に8を足す。",
        "最後に両辺を2で割ってxを求める。"
      ]
    },
    explanation: {
      en: "Keep the minus with the 4: 2 × (-4) = -8, so 2(x - 4) becomes 2x - 8.",
      ja: "4のマイナスも一緒にかけます：2 ×（-4）= -8 なので、2(x - 4) は 2x - 8 になります。"
    }
  },
  {
    id: "brackets_medium_03",
    topic: "brackets",
    equation: "4(x - 3) = 20",
    answer: 8,
    difficulty: "medium",
    type: "brackets",
    basePoints: 20,
    steps: [
      { action: "expand", value: "4x - 12", wrong: ["4x - 3", "4x + 12", "x - 12"], target: "left", result: "4x - 12 = 20" },
      { action: "add",    value: 12, target: "both-sides", result: "4x = 32" },
      { action: "divide", value: 4,  target: "both-sides", result: "x = 8" }
    ],
    hints: {
      en: [
        "Expand the brackets — multiply 4 by each term: 4 × x and 4 × (-3).",
        "Now remove the constant — add 12 to both sides.",
        "Finally divide both sides by 4 to isolate x."
      ],
      ja: [
        "かっこを展開する — 4を各項にかける：4 × x と 4 ×（-3）。",
        "次に定数項を消す — 両辺に12を足す。",
        "最後に両辺を4で割ってxを求める。"
      ]
    },
    explanation: {
      en: "The minus stays with the 3 when you multiply: 4 × (-3) = -12, giving 4x - 12 — not 4x + 12.",
      ja: "かけてもマイナスは3と一緒です。4 ×（-3）= -12 なので 4x - 12 になり、4x + 12 ではありません。"
    }
  },
  {
    id: "brackets_medium_04",
    topic: "brackets",
    equation: "5(x - 1) = 15",
    answer: 4,
    difficulty: "medium",
    type: "brackets",
    basePoints: 20,
    steps: [
      { action: "expand", value: "5x - 5", wrong: ["5x - 1", "5x + 5", "x - 5"], target: "left", result: "5x - 5 = 15" },
      { action: "add",    value: 5, target: "both-sides", result: "5x = 20" },
      { action: "divide", value: 5, target: "both-sides", result: "x = 4" }
    ],
    hints: {
      en: [
        "Expand the brackets — multiply 5 by each term: 5 × x and 5 × (-1).",
        "Now remove the constant — add 5 to both sides.",
        "Finally divide both sides by 5 to isolate x."
      ],
      ja: [
        "かっこを展開する — 5を各項にかける：5 × x と 5 ×（-1）。",
        "次に定数項を消す — 両辺に5を足す。",
        "最後に両辺を5で割ってxを求める。"
      ]
    },
    explanation: {
      en: "5 × (-1) = -5, so 5(x - 1) expands to 5x - 5. Then add 5 and divide by 5.",
      ja: "5 ×（-1）= -5 なので、5(x - 1) は 5x - 5 に展開されます。その後5を足して5で割ります。"
    }
  },
  {
    id: "brackets_medium_05",
    topic: "brackets",
    equation: "4(x + 5) = 8",
    answer: -3,
    difficulty: "medium",
    type: "brackets",
    basePoints: 20,
    steps: [
      { action: "expand",   value: "4x + 20", wrong: ["4x + 5", "x + 20", "4x + 9"], target: "left", result: "4x + 20 = 8" },
      { action: "subtract", value: 20, target: "both-sides", result: "4x = -12" },
      { action: "divide",   value: 4,  target: "both-sides", result: "x = -3" }
    ],
    hints: {
      en: [
        "Expand the brackets — multiply 4 by each term inside: 4 × x and 4 × 5.",
        "Now remove the constant — subtract 20 from both sides.",
        "Finally divide both sides by 4 to isolate x."
      ],
      ja: [
        "かっこを展開する — 4をかっこの中の各項にかける：4 × x と 4 × 5。",
        "次に定数項を消す — 両辺から20を引く。",
        "最後に両辺を4で割ってxを求める。"
      ]
    },
    explanation: {
      en: "Expanding gives 4x + 20. Subtracting 20 from 8 goes negative (4x = -12), so the answer is negative.",
      ja: "展開すると 4x + 20。8から20を引くと負の数（4x = -12）になるので、答えも負の数です。"
    }
  },
  {
    id: "brackets_medium_06",
    topic: "brackets",
    equation: "3(x - 5) = -6",
    answer: 3,
    difficulty: "medium",
    type: "brackets",
    basePoints: 20,
    steps: [
      { action: "expand", value: "3x - 15", wrong: ["3x - 5", "3x + 15", "x - 15"], target: "left", result: "3x - 15 = -6" },
      { action: "add",    value: 15, target: "both-sides", result: "3x = 9" },
      { action: "divide", value: 3,  target: "both-sides", result: "x = 3" }
    ],
    hints: {
      en: [
        "Expand the brackets — multiply 3 by each term: 3 × x and 3 × (-5).",
        "Now remove the constant — add 15 to both sides.",
        "Finally divide both sides by 3 to isolate x."
      ],
      ja: [
        "かっこを展開する — 3を各項にかける：3 × x と 3 ×（-5）。",
        "次に定数項を消す — 両辺に15を足す。",
        "最後に両辺を3で割ってxを求める。"
      ]
    },
    explanation: {
      en: "3(x - 5) = 3x - 15. Adding 15 to -6 gives 9, so 3x = 9 and x = 3.",
      ja: "3(x - 5) = 3x - 15。-6に15を足すと9なので、3x = 9、x = 3 です。"
    }
  },
  {
    id: "brackets_medium_07",
    topic: "brackets",
    equation: "2(x - 6) = -20",
    answer: -4,
    difficulty: "medium",
    type: "brackets",
    basePoints: 20,
    steps: [
      { action: "expand", value: "2x - 12", wrong: ["2x - 6", "2x + 12", "x - 12"], target: "left", result: "2x - 12 = -20" },
      { action: "add",    value: 12, target: "both-sides", result: "2x = -8" },
      { action: "divide", value: 2,  target: "both-sides", result: "x = -4" }
    ],
    hints: {
      en: [
        "Expand the brackets — multiply 2 by each term: 2 × x and 2 × (-6).",
        "Now remove the constant — add 12 to both sides.",
        "Finally divide both sides by 2 to isolate x."
      ],
      ja: [
        "かっこを展開する — 2を各項にかける：2 × x と 2 ×（-6）。",
        "次に定数項を消す — 両辺に12を足す。",
        "最後に両辺を2で割ってxを求める。"
      ]
    },
    explanation: {
      en: "2(x - 6) = 2x - 12. Adding 12 to -20 still leaves a negative, so x comes out negative.",
      ja: "2(x - 6) = 2x - 12。-20に12を足してもまだ負の数なので、xも負の数になります。"
    }
  },
  {
    id: "brackets_medium_08",
    topic: "brackets",
    equation: "6(x - 2) = 18",
    answer: 5,
    difficulty: "medium",
    type: "brackets",
    basePoints: 20,
    steps: [
      { action: "expand", value: "6x - 12", wrong: ["6x - 2", "6x + 12", "x - 12"], target: "left", result: "6x - 12 = 18" },
      { action: "add",    value: 12, target: "both-sides", result: "6x = 30" },
      { action: "divide", value: 6,  target: "both-sides", result: "x = 5" }
    ],
    hints: {
      en: [
        "Expand the brackets — multiply 6 by each term: 6 × x and 6 × (-2).",
        "Now remove the constant — add 12 to both sides.",
        "Finally divide both sides by 6 to isolate x."
      ],
      ja: [
        "かっこを展開する — 6を各項にかける：6 × x と 6 ×（-2）。",
        "次に定数項を消す — 両辺に12を足す。",
        "最後に両辺を6で割ってxを求める。"
      ]
    },
    explanation: {
      en: "Multiply 6 by both terms: 6 × x = 6x and 6 × (-2) = -12, giving 6x - 12.",
      ja: "6を両方の項にかけます：6 × x = 6x、6 ×（-2）= -12 で 6x - 12 です。"
    }
  },
  {
    id: "brackets_medium_09",
    topic: "brackets",
    equation: "3(x + 7) = 6",
    answer: -5,
    difficulty: "medium",
    type: "brackets",
    basePoints: 20,
    steps: [
      { action: "expand",   value: "3x + 21", wrong: ["3x + 7", "x + 21", "3x + 10"], target: "left", result: "3x + 21 = 6" },
      { action: "subtract", value: 21, target: "both-sides", result: "3x = -15" },
      { action: "divide",   value: 3,  target: "both-sides", result: "x = -5" }
    ],
    hints: {
      en: [
        "Expand the brackets — multiply 3 by each term inside: 3 × x and 3 × 7.",
        "Now remove the constant — subtract 21 from both sides.",
        "Finally divide both sides by 3 to isolate x."
      ],
      ja: [
        "かっこを展開する — 3をかっこの中の各項にかける：3 × x と 3 × 7。",
        "次に定数項を消す — 両辺から21を引く。",
        "最後に両辺を3で割ってxを求める。"
      ]
    },
    explanation: {
      en: "3(x + 7) = 3x + 21. Since 21 is bigger than 6, subtracting it makes the right side negative: 3x = -15.",
      ja: "3(x + 7) = 3x + 21。21は6より大きいので、引くと右辺は負の数になります：3x = -15。"
    }
  },
  {
    id: "brackets_medium_10",
    topic: "brackets",
    equation: "5(x - 4) = -35",
    answer: -3,
    difficulty: "medium",
    type: "brackets",
    basePoints: 20,
    steps: [
      { action: "expand", value: "5x - 20", wrong: ["5x - 4", "5x + 20", "x - 20"], target: "left", result: "5x - 20 = -35" },
      { action: "add",    value: 20, target: "both-sides", result: "5x = -15" },
      { action: "divide", value: 5,  target: "both-sides", result: "x = -3" }
    ],
    hints: {
      en: [
        "Expand the brackets — multiply 5 by each term: 5 × x and 5 × (-4).",
        "Now remove the constant — add 20 to both sides.",
        "Finally divide both sides by 5 to isolate x."
      ],
      ja: [
        "かっこを展開する — 5を各項にかける：5 × x と 5 ×（-4）。",
        "次に定数項を消す — 両辺に20を足す。",
        "最後に両辺を5で割ってxを求める。"
      ]
    },
    explanation: {
      en: "5(x - 4) = 5x - 20. Add 20 to both sides: -35 + 20 = -15, then divide by 5 to get x = -3.",
      ja: "5(x - 4) = 5x - 20。両辺に20を足すと -35 + 20 = -15、5で割って x = -3 です。"
    }
  },

  // ---- Hard: negative number outside the brackets ----
  {
    id: "brackets_hard_01",
    topic: "brackets",
    equation: "-2(x - 3) = 14",
    answer: -4,
    difficulty: "hard",
    type: "brackets",
    basePoints: 30,
    steps: [
      { action: "expand",   value: "-2x + 6", wrong: ["-2x - 6", "-2x - 3", "2x - 6"], target: "left", result: "-2x + 6 = 14" },
      { action: "subtract", value: 6,  target: "both-sides", result: "-2x = 8" },
      { action: "divide",   value: -2, target: "both-sides", result: "x = -4" }
    ],
    hints: {
      en: [
        "Expand the brackets — multiply -2 by each term: -2 × x and -2 × (-3). Watch the signs!",
        "Now remove the constant — subtract 6 from both sides.",
        "Finally divide both sides by -2 — watch the negative sign!"
      ],
      ja: [
        "かっこを展開する — -2を各項にかける：-2 × x と -2 ×（-3）。符号に注意！",
        "次に定数項を消す — 両辺から6を引く。",
        "最後に両辺を-2で割る — マイナスの符号に注意！"
      ]
    },
    explanation: {
      en: "A negative outside the brackets changes the sign of every term inside: -2 × x = -2x and -2 × (-3) = +6.",
      ja: "かっこの外が負の数だと、中のすべての項の符号が変わります。-2 × x = -2x、-2 ×（-3）= +6 です。"
    }
  },
  {
    id: "brackets_hard_02",
    topic: "brackets",
    equation: "-3(x + 2) = 12",
    answer: -6,
    difficulty: "hard",
    type: "brackets",
    basePoints: 30,
    steps: [
      { action: "expand", value: "-3x - 6", wrong: ["-3x + 6", "-3x - 2", "3x + 6"], target: "left", result: "-3x - 6 = 12" },
      { action: "add",    value: 6,  target: "both-sides", result: "-3x = 18" },
      { action: "divide", value: -3, target: "both-sides", result: "x = -6" }
    ],
    hints: {
      en: [
        "Expand the brackets — multiply -3 by each term: -3 × x and -3 × 2. Watch the signs!",
        "Now remove the constant — add 6 to both sides.",
        "Finally divide both sides by -3 — watch the negative sign!"
      ],
      ja: [
        "かっこを展開する — -3を各項にかける：-3 × x と -3 × 2。符号に注意！",
        "次に定数項を消す — 両辺に6を足す。",
        "最後に両辺を-3で割る — マイナスの符号に注意！"
      ]
    },
    explanation: {
      en: "-3 × 2 = -6, so -3(x + 2) becomes -3x - 6. Both terms end up negative.",
      ja: "-3 × 2 = -6 なので、-3(x + 2) は -3x - 6 になります。両方の項が負になります。"
    }
  },
  {
    id: "brackets_hard_03",
    topic: "brackets",
    equation: "-4(x - 1) = 20",
    answer: -4,
    difficulty: "hard",
    type: "brackets",
    basePoints: 30,
    steps: [
      { action: "expand",   value: "-4x + 4", wrong: ["-4x - 4", "-4x - 1", "4x - 4"], target: "left", result: "-4x + 4 = 20" },
      { action: "subtract", value: 4,  target: "both-sides", result: "-4x = 16" },
      { action: "divide",   value: -4, target: "both-sides", result: "x = -4" }
    ],
    hints: {
      en: [
        "Expand the brackets — multiply -4 by each term: -4 × x and -4 × (-1). Watch the signs!",
        "Now remove the constant — subtract 4 from both sides.",
        "Finally divide both sides by -4 — watch the negative sign!"
      ],
      ja: [
        "かっこを展開する — -4を各項にかける：-4 × x と -4 ×（-1）。符号に注意！",
        "次に定数項を消す — 両辺から4を引く。",
        "最後に両辺を-4で割る — マイナスの符号に注意！"
      ]
    },
    explanation: {
      en: "-4 × (-1) = +4 — a negative times a negative is positive — so -4(x - 1) becomes -4x + 4.",
      ja: "-4 ×（-1）= +4（負×負は正）なので、-4(x - 1) は -4x + 4 になります。"
    }
  },
  {
    id: "brackets_hard_04",
    topic: "brackets",
    equation: "-5(x + 3) = -10",
    answer: -1,
    difficulty: "hard",
    type: "brackets",
    basePoints: 30,
    steps: [
      { action: "expand", value: "-5x - 15", wrong: ["-5x + 15", "-5x - 3", "5x + 15"], target: "left", result: "-5x - 15 = -10" },
      { action: "add",    value: 15, target: "both-sides", result: "-5x = 5" },
      { action: "divide", value: -5, target: "both-sides", result: "x = -1" }
    ],
    hints: {
      en: [
        "Expand the brackets — multiply -5 by each term: -5 × x and -5 × 3. Watch the signs!",
        "Now remove the constant — add 15 to both sides.",
        "Finally divide both sides by -5 — watch the negative sign!"
      ],
      ja: [
        "かっこを展開する — -5を各項にかける：-5 × x と -5 × 3。符号に注意！",
        "次に定数項を消す — 両辺に15を足す。",
        "最後に両辺を-5で割る — マイナスの符号に注意！"
      ]
    },
    explanation: {
      en: "-5(x + 3) = -5x - 15. Adding 15 gives -5x = 5, and dividing by -5 gives x = -1.",
      ja: "-5(x + 3) = -5x - 15。15を足すと -5x = 5、-5で割ると x = -1 です。"
    }
  },
  {
    id: "brackets_hard_05",
    topic: "brackets",
    equation: "-2(x - 7) = 6",
    answer: 4,
    difficulty: "hard",
    type: "brackets",
    basePoints: 30,
    steps: [
      { action: "expand",   value: "-2x + 14", wrong: ["-2x - 14", "-2x - 7", "2x - 14"], target: "left", result: "-2x + 14 = 6" },
      { action: "subtract", value: 14, target: "both-sides", result: "-2x = -8" },
      { action: "divide",   value: -2, target: "both-sides", result: "x = 4" }
    ],
    hints: {
      en: [
        "Expand the brackets — multiply -2 by each term: -2 × x and -2 × (-7). Watch the signs!",
        "Now remove the constant — subtract 14 from both sides.",
        "Finally divide both sides by -2 — watch the negative sign!"
      ],
      ja: [
        "かっこを展開する — -2を各項にかける：-2 × x と -2 ×（-7）。符号に注意！",
        "次に定数項を消す — 両辺から14を引く。",
        "最後に両辺を-2で割る — マイナスの符号に注意！"
      ]
    },
    explanation: {
      en: "The minus outside flips the minus inside: -2 × (-7) = +14, giving -2x + 14.",
      ja: "外のマイナスが中のマイナスを反転させます：-2 ×（-7）= +14 で -2x + 14 です。"
    }
  },
  {
    id: "brackets_hard_06",
    topic: "brackets",
    equation: "-6(x + 1) = -18",
    answer: 2,
    difficulty: "hard",
    type: "brackets",
    basePoints: 30,
    steps: [
      { action: "expand", value: "-6x - 6", wrong: ["-6x + 6", "-6x - 1", "6x + 6"], target: "left", result: "-6x - 6 = -18" },
      { action: "add",    value: 6,  target: "both-sides", result: "-6x = -12" },
      { action: "divide", value: -6, target: "both-sides", result: "x = 2" }
    ],
    hints: {
      en: [
        "Expand the brackets — multiply -6 by each term: -6 × x and -6 × 1. Watch the signs!",
        "Now remove the constant — add 6 to both sides.",
        "Finally divide both sides by -6 — watch the negative sign!"
      ],
      ja: [
        "かっこを展開する — -6を各項にかける：-6 × x と -6 × 1。符号に注意！",
        "次に定数項を消す — 両辺に6を足す。",
        "最後に両辺を-6で割る — マイナスの符号に注意！"
      ]
    },
    explanation: {
      en: "-6 × 1 = -6, so -6(x + 1) = -6x - 6. Then add 6 and divide by -6 — a negative divided by a negative makes x positive.",
      ja: "-6 × 1 = -6 なので、-6(x + 1) = -6x - 6。6を足して-6で割ると、負÷負で x は正の数になります。"
    }
  },

  // ---- Hard: brackets + x on both sides ----
  {
    id: "brackets_hard_07",
    topic: "brackets",
    equation: "3(x + 2) = x + 10",
    answer: 2,
    difficulty: "hard",
    type: "brackets",
    basePoints: 30,
    steps: [
      { action: "expand",     value: "3x + 6", wrong: ["3x + 2", "x + 6", "3x + 5"], target: "left", result: "3x + 6 = x + 10" },
      { action: "subtract_x", value: 1, target: "both-sides", result: "2x + 6 = 10" },
      { action: "subtract",   value: 6, target: "both-sides", result: "2x = 4" },
      { action: "divide",     value: 2, target: "both-sides", result: "x = 2" }
    ],
    hints: {
      en: [
        "Expand the brackets — multiply 3 by each term inside: 3 × x and 3 × 2.",
        "Now combine the x terms — subtract x from both sides.",
        "Remove the constant — subtract 6 from both sides.",
        "Finally divide both sides by 2 to isolate x."
      ],
      ja: [
        "かっこを展開する — 3をかっこの中の各項にかける：3 × x と 3 × 2。",
        "次にxの項をまとめる — 両辺からxを引く。",
        "定数項を消す — 両辺から6を引く。",
        "最後に両辺を2で割ってxを求める。"
      ]
    },
    explanation: {
      en: "Expand first to get 3x + 6 = x + 10 — now it's an x-on-both-sides equation: subtract x, subtract 6, then divide by 2.",
      ja: "まず展開して 3x + 6 = x + 10 にすると、両辺にxがある方程式になります。xを引き、6を引き、2で割ります。"
    }
  },
  {
    id: "brackets_hard_08",
    topic: "brackets",
    equation: "4(x - 1) = 2x + 6",
    answer: 5,
    difficulty: "hard",
    type: "brackets",
    basePoints: 30,
    steps: [
      { action: "expand",     value: "4x - 4", wrong: ["4x - 1", "4x + 4", "x - 4"], target: "left", result: "4x - 4 = 2x + 6" },
      { action: "subtract_x", value: 2, target: "both-sides", result: "2x - 4 = 6" },
      { action: "add",        value: 4, target: "both-sides", result: "2x = 10" },
      { action: "divide",     value: 2, target: "both-sides", result: "x = 5" }
    ],
    hints: {
      en: [
        "Expand the brackets — multiply 4 by each term: 4 × x and 4 × (-1).",
        "Now combine the x terms — subtract 2x from both sides.",
        "Remove the constant — add 4 to both sides.",
        "Finally divide both sides by 2 to isolate x."
      ],
      ja: [
        "かっこを展開する — 4を各項にかける：4 × x と 4 ×（-1）。",
        "次にxの項をまとめる — 両辺から2xを引く。",
        "定数項を消す — 両辺に4を足す。",
        "最後に両辺を2で割ってxを求める。"
      ]
    },
    explanation: {
      en: "4(x - 1) = 4x - 4. Subtract 2x to gather the x terms, add 4, then divide by 2.",
      ja: "4(x - 1) = 4x - 4。2xを引いてxの項をまとめ、4を足してから2で割ります。"
    }
  },
  {
    id: "brackets_hard_09",
    topic: "brackets",
    equation: "5(x - 2) = 3x + 4",
    answer: 7,
    difficulty: "hard",
    type: "brackets",
    basePoints: 30,
    steps: [
      { action: "expand",     value: "5x - 10", wrong: ["5x - 2", "5x + 10", "x - 10"], target: "left", result: "5x - 10 = 3x + 4" },
      { action: "subtract_x", value: 3,  target: "both-sides", result: "2x - 10 = 4" },
      { action: "add",        value: 10, target: "both-sides", result: "2x = 14" },
      { action: "divide",     value: 2,  target: "both-sides", result: "x = 7" }
    ],
    hints: {
      en: [
        "Expand the brackets — multiply 5 by each term: 5 × x and 5 × (-2).",
        "Now combine the x terms — subtract 3x from both sides.",
        "Remove the constant — add 10 to both sides.",
        "Finally divide both sides by 2 to isolate x."
      ],
      ja: [
        "かっこを展開する — 5を各項にかける：5 × x と 5 ×（-2）。",
        "次にxの項をまとめる — 両辺から3xを引く。",
        "定数項を消す — 両辺に10を足す。",
        "最後に両辺を2で割ってxを求める。"
      ]
    },
    explanation: {
      en: "Expanding gives 5x - 10 = 3x + 4. Subtract 3x, add 10, then divide by 2 to get x = 7.",
      ja: "展開すると 5x - 10 = 3x + 4。3xを引き、10を足して、2で割ると x = 7 です。"
    }
  },
  {
    id: "brackets_hard_10",
    topic: "brackets",
    equation: "-2(x + 3) = x + 9",
    answer: -5,
    difficulty: "hard",
    type: "brackets",
    basePoints: 30,
    steps: [
      { action: "expand",     value: "-2x - 6", wrong: ["-2x + 6", "-2x - 3", "2x + 6"], target: "left", result: "-2x - 6 = x + 9" },
      { action: "subtract_x", value: 1,  target: "both-sides", result: "-3x - 6 = 9" },
      { action: "add",        value: 6,  target: "both-sides", result: "-3x = 15" },
      { action: "divide",     value: -3, target: "both-sides", result: "x = -5" }
    ],
    hints: {
      en: [
        "Expand the brackets — multiply -2 by each term: -2 × x and -2 × 3. Watch the signs!",
        "Now combine the x terms — subtract x from both sides.",
        "Remove the constant — add 6 to both sides.",
        "Finally divide both sides by -3 — watch the negative sign!"
      ],
      ja: [
        "かっこを展開する — -2を各項にかける：-2 × x と -2 × 3。符号に注意！",
        "次にxの項をまとめる — 両辺からxを引く。",
        "定数項を消す — 両辺に6を足す。",
        "最後に両辺を-3で割る — マイナスの符号に注意！"
      ]
    },
    explanation: {
      en: "The negative outside gives -2x - 6. Subtracting x makes it -3x, so the last step divides by a negative.",
      ja: "外のマイナスで -2x - 6 になります。xを引くと -3x になるので、最後は負の数で割ります。"
    }
  },

  // =====================================================================
  // QUADRATICS
  // =====================================================================

  // ---- Easy: already factored, read off both answers (zero-product rule) ----
  {
    id: "quad_easy_01",
    topic: "quadratic",
    equation: "(x + 2)(x + 3) = 0",
    answer: [-3, -2],
    difficulty: "easy",
    type: "factored",
    basePoints: 10,
    steps: [
      { action: "roots", value: "x = -3, -2", wrong: ["x = 2, 3", "x = -3, 2", "x = -2, 3"], target: "both-sides", result: "x = -3, -2" }
    ],
    hints: {
      en: ["If two brackets multiply to 0, one of them must be 0. Solve x + 2 = 0 and x + 3 = 0."],
      ja: ["かけて0になるなら、どちらかのかっこが0です。x + 2 = 0 と x + 3 = 0 を解きます。"]
    },
    explanation: {
      en: "x + 2 = 0 gives x = -2, and x + 3 = 0 gives x = -3. Notice the sign flips: +2 inside the bracket becomes x = -2.",
      ja: "x + 2 = 0 から x = -2、x + 3 = 0 から x = -3。かっこの中の +2 が x = -2 になるように、符号が逆になります。"
    }
  },
  {
    id: "quad_easy_02",
    topic: "quadratic",
    equation: "(x - 4)(x - 1) = 0",
    answer: [1, 4],
    difficulty: "easy",
    type: "factored",
    basePoints: 10,
    steps: [
      { action: "roots", value: "x = 1, 4", wrong: ["x = -4, -1", "x = -1, 4", "x = -4, 1"], target: "both-sides", result: "x = 1, 4" }
    ],
    hints: {
      en: ["If two brackets multiply to 0, one of them must be 0. Solve x - 4 = 0 and x - 1 = 0."],
      ja: ["かけて0になるなら、どちらかのかっこが0です。x - 4 = 0 と x - 1 = 0 を解きます。"]
    },
    explanation: {
      en: "x - 4 = 0 gives x = 4, and x - 1 = 0 gives x = 1. A minus inside the bracket gives a positive answer.",
      ja: "x - 4 = 0 から x = 4、x - 1 = 0 から x = 1。かっこの中がマイナスなら、答えはプラスになります。"
    }
  },
  {
    id: "quad_easy_03",
    topic: "quadratic",
    equation: "(x + 5)(x - 2) = 0",
    answer: [-5, 2],
    difficulty: "easy",
    type: "factored",
    basePoints: 10,
    steps: [
      { action: "roots", value: "x = -5, 2", wrong: ["x = -2, 5", "x = -5, -2", "x = 2, 5"], target: "both-sides", result: "x = -5, 2" }
    ],
    hints: {
      en: ["If two brackets multiply to 0, one of them must be 0. Solve x + 5 = 0 and x - 2 = 0."],
      ja: ["かけて0になるなら、どちらかのかっこが0です。x + 5 = 0 と x - 2 = 0 を解きます。"]
    },
    explanation: {
      en: "x + 5 = 0 gives x = -5, and x - 2 = 0 gives x = 2 — one negative answer and one positive.",
      ja: "x + 5 = 0 から x = -5、x - 2 = 0 から x = 2。答えは負の数と正の数が1つずつです。"
    }
  },
  {
    id: "quad_easy_04",
    topic: "quadratic",
    equation: "(x - 3)(x + 6) = 0",
    answer: [-6, 3],
    difficulty: "easy",
    type: "factored",
    basePoints: 10,
    steps: [
      { action: "roots", value: "x = -6, 3", wrong: ["x = -3, 6", "x = 3, 6", "x = -6, -3"], target: "both-sides", result: "x = -6, 3" }
    ],
    hints: {
      en: ["If two brackets multiply to 0, one of them must be 0. Solve x - 3 = 0 and x + 6 = 0."],
      ja: ["かけて0になるなら、どちらかのかっこが0です。x - 3 = 0 と x + 6 = 0 を解きます。"]
    },
    explanation: {
      en: "x - 3 = 0 gives x = 3, and x + 6 = 0 gives x = -6. Answers are listed from smallest to largest.",
      ja: "x - 3 = 0 から x = 3、x + 6 = 0 から x = -6。答えは小さい順に書きます。"
    }
  },
  {
    id: "quad_easy_05",
    topic: "quadratic",
    equation: "x(x - 5) = 0",
    answer: [0, 5],
    difficulty: "easy",
    type: "factored",
    basePoints: 10,
    steps: [
      { action: "roots", value: "x = 0, 5", wrong: ["x = 5", "x = -5, 0", "x = 1, 5"], target: "both-sides", result: "x = 0, 5" }
    ],
    hints: {
      en: ["One factor is just x, so x = 0 is an answer. Then solve x - 5 = 0."],
      ja: ["片方の因数はx自身なので、x = 0 も解です。次に x - 5 = 0 を解きます。"]
    },
    explanation: {
      en: "Don't forget x = 0: the first factor is x itself, so x = 0 makes the whole product 0. Then x - 5 = 0 gives x = 5.",
      ja: "x = 0 を忘れずに。最初の因数はx自身なので、x = 0 で全体が0になります。そして x - 5 = 0 から x = 5 です。"
    }
  },
  {
    id: "quad_easy_06",
    topic: "quadratic",
    equation: "(x + 7)(x + 1) = 0",
    answer: [-7, -1],
    difficulty: "easy",
    type: "factored",
    basePoints: 10,
    steps: [
      { action: "roots", value: "x = -7, -1", wrong: ["x = 1, 7", "x = -7, 1", "x = -1, 7"], target: "both-sides", result: "x = -7, -1" }
    ],
    hints: {
      en: ["If two brackets multiply to 0, one of them must be 0. Solve x + 7 = 0 and x + 1 = 0."],
      ja: ["かけて0になるなら、どちらかのかっこが0です。x + 7 = 0 と x + 1 = 0 を解きます。"]
    },
    explanation: {
      en: "Both brackets have +, so both answers are negative: x = -7 and x = -1.",
      ja: "どちらのかっこも + なので、答えは両方とも負の数です：x = -7 と x = -1。"
    }
  },
  {
    id: "quad_easy_07",
    topic: "quadratic",
    equation: "x(x + 3) = 0",
    answer: [-3, 0],
    difficulty: "easy",
    type: "factored",
    basePoints: 10,
    steps: [
      { action: "roots", value: "x = -3, 0", wrong: ["x = -3", "x = 0, 3", "x = -3, 1"], target: "both-sides", result: "x = -3, 0" }
    ],
    hints: {
      en: ["One factor is just x, so x = 0 is an answer. Then solve x + 3 = 0."],
      ja: ["片方の因数はx自身なので、x = 0 も解です。次に x + 3 = 0 を解きます。"]
    },
    explanation: {
      en: "x = 0 comes from the first factor, and x + 3 = 0 gives x = -3.",
      ja: "最初の因数から x = 0、x + 3 = 0 から x = -3 です。"
    }
  },
  {
    id: "quad_easy_08",
    topic: "quadratic",
    equation: "(x - 8)(x - 2) = 0",
    answer: [2, 8],
    difficulty: "easy",
    type: "factored",
    basePoints: 10,
    steps: [
      { action: "roots", value: "x = 2, 8", wrong: ["x = -8, -2", "x = -2, 8", "x = -8, 2"], target: "both-sides", result: "x = 2, 8" }
    ],
    hints: {
      en: ["If two brackets multiply to 0, one of them must be 0. Solve x - 8 = 0 and x - 2 = 0."],
      ja: ["かけて0になるなら、どちらかのかっこが0です。x - 8 = 0 と x - 2 = 0 を解きます。"]
    },
    explanation: {
      en: "Both brackets have −, so both answers are positive: x = 2 and x = 8.",
      ja: "どちらのかっこも − なので、答えは両方とも正の数です：x = 2 と x = 8。"
    }
  },
  {
    id: "quad_easy_09",
    topic: "quadratic",
    equation: "(x + 4)(x - 9) = 0",
    answer: [-4, 9],
    difficulty: "easy",
    type: "factored",
    basePoints: 10,
    steps: [
      { action: "roots", value: "x = -4, 9", wrong: ["x = -9, 4", "x = 4, 9", "x = -9, -4"], target: "both-sides", result: "x = -4, 9" }
    ],
    hints: {
      en: ["If two brackets multiply to 0, one of them must be 0. Solve x + 4 = 0 and x - 9 = 0."],
      ja: ["かけて0になるなら、どちらかのかっこが0です。x + 4 = 0 と x - 9 = 0 を解きます。"]
    },
    explanation: {
      en: "x + 4 = 0 gives x = -4, and x - 9 = 0 gives x = 9.",
      ja: "x + 4 = 0 から x = -4、x - 9 = 0 から x = 9 です。"
    }
  },
  {
    id: "quad_easy_10",
    topic: "quadratic",
    equation: "(x - 6)(x + 6) = 0",
    answer: [-6, 6],
    difficulty: "easy",
    type: "factored",
    basePoints: 10,
    steps: [
      { action: "roots", value: "x = -6, 6", wrong: ["x = 6", "x = -6", "x = 0, 6"], target: "both-sides", result: "x = -6, 6" }
    ],
    hints: {
      en: ["Solve x - 6 = 0 and x + 6 = 0 — you'll get two answers of the same size."],
      ja: ["x - 6 = 0 と x + 6 = 0 を解きます — 大きさが同じ2つの答えになります。"]
    },
    explanation: {
      en: "x - 6 = 0 gives x = 6, and x + 6 = 0 gives x = -6. Both count — a quadratic can have two answers.",
      ja: "x - 6 = 0 から x = 6、x + 6 = 0 から x = -6。どちらも解です — 二次方程式は2つの解を持つことがあります。"
    }
  },

  // ---- Medium: factorise it yourself (x² + bx + c, leading coefficient 1) ----
  {
    id: "quad_medium_01",
    topic: "quadratic",
    equation: "x² + 5x + 6 = 0",
    answer: [-3, -2],
    difficulty: "medium",
    type: "factor",
    basePoints: 20,
    steps: [
      { action: "factor", value: "(x + 2)(x + 3)", wrong: ["(x + 1)(x + 6)", "(x - 2)(x - 3)", "(x + 2)(x - 3)"], target: "left", result: "(x + 2)(x + 3) = 0" },
      { action: "roots",  value: "x = -3, -2", wrong: ["x = 2, 3", "x = -3, 2", "x = -2, 3"], target: "both-sides", result: "x = -3, -2" }
    ],
    hints: {
      en: [
        "Find two numbers that multiply to 6 and add to 5.",
        "Now set each bracket to 0: x + 2 = 0 and x + 3 = 0."
      ],
      ja: [
        "かけて6、足して5になる2つの数を探す。",
        "それぞれのかっこを0にする：x + 2 = 0 と x + 3 = 0。"
      ]
    },
    explanation: {
      en: "2 × 3 = 6 and 2 + 3 = 5, so x² + 5x + 6 = (x + 2)(x + 3). Setting each bracket to 0 gives x = -2 and x = -3.",
      ja: "2 × 3 = 6、2 + 3 = 5 なので、x² + 5x + 6 = (x + 2)(x + 3)。それぞれのかっこを0にすると x = -2 と x = -3 です。"
    }
  },
  {
    id: "quad_medium_02",
    topic: "quadratic",
    equation: "x² + 7x + 12 = 0",
    answer: [-4, -3],
    difficulty: "medium",
    type: "factor",
    basePoints: 20,
    steps: [
      { action: "factor", value: "(x + 3)(x + 4)", wrong: ["(x + 2)(x + 6)", "(x - 3)(x - 4)", "(x + 1)(x + 12)"], target: "left", result: "(x + 3)(x + 4) = 0" },
      { action: "roots",  value: "x = -4, -3", wrong: ["x = 3, 4", "x = -4, 3", "x = -3, 4"], target: "both-sides", result: "x = -4, -3" }
    ],
    hints: {
      en: [
        "Find two numbers that multiply to 12 and add to 7.",
        "Now set each bracket to 0: x + 3 = 0 and x + 4 = 0."
      ],
      ja: [
        "かけて12、足して7になる2つの数を探す。",
        "それぞれのかっこを0にする：x + 3 = 0 と x + 4 = 0。"
      ]
    },
    explanation: {
      en: "12 has several factor pairs (1 × 12, 2 × 6, 3 × 4) — only 3 and 4 add to 7. So it's (x + 3)(x + 4), giving x = -3 and x = -4.",
      ja: "12には複数の組（1 × 12、2 × 6、3 × 4）がありますが、足して7になるのは3と4だけです。(x + 3)(x + 4) から x = -3 と x = -4 です。"
    }
  },
  {
    id: "quad_medium_03",
    topic: "quadratic",
    equation: "x² - 5x + 6 = 0",
    answer: [2, 3],
    difficulty: "medium",
    type: "factor",
    basePoints: 20,
    steps: [
      { action: "factor", value: "(x - 2)(x - 3)", wrong: ["(x - 1)(x - 6)", "(x + 2)(x + 3)", "(x + 2)(x - 3)"], target: "left", result: "(x - 2)(x - 3) = 0" },
      { action: "roots",  value: "x = 2, 3", wrong: ["x = -3, -2", "x = -2, 3", "x = -3, 2"], target: "both-sides", result: "x = 2, 3" }
    ],
    hints: {
      en: [
        "Find two numbers that multiply to 6 and add to -5.",
        "Now set each bracket to 0: x - 2 = 0 and x - 3 = 0."
      ],
      ja: [
        "かけて6、足して-5になる2つの数を探す。",
        "それぞれのかっこを0にする：x - 2 = 0 と x - 3 = 0。"
      ]
    },
    explanation: {
      en: "The constant is positive but the middle term is negative, so both numbers are negative: (-2) × (-3) = 6 and (-2) + (-3) = -5.",
      ja: "定数項は正、真ん中の項は負なので、2つの数はどちらも負です：(-2) × (-3) = 6、(-2) + (-3) = -5。"
    }
  },
  {
    id: "quad_medium_04",
    topic: "quadratic",
    equation: "x² - 7x + 10 = 0",
    answer: [2, 5],
    difficulty: "medium",
    type: "factor",
    basePoints: 20,
    steps: [
      { action: "factor", value: "(x - 2)(x - 5)", wrong: ["(x - 1)(x - 10)", "(x + 2)(x + 5)", "(x + 2)(x - 5)"], target: "left", result: "(x - 2)(x - 5) = 0" },
      { action: "roots",  value: "x = 2, 5", wrong: ["x = -5, -2", "x = -2, 5", "x = -5, 2"], target: "both-sides", result: "x = 2, 5" }
    ],
    hints: {
      en: [
        "Find two numbers that multiply to 10 and add to -7.",
        "Now set each bracket to 0: x - 2 = 0 and x - 5 = 0."
      ],
      ja: [
        "かけて10、足して-7になる2つの数を探す。",
        "それぞれのかっこを0にする：x - 2 = 0 と x - 5 = 0。"
      ]
    },
    explanation: {
      en: "(-2) × (-5) = 10 and (-2) + (-5) = -7, so it's (x - 2)(x - 5). A minus in each bracket gives two positive answers: x = 2 and x = 5.",
      ja: "(-2) × (-5) = 10、(-2) + (-5) = -7 なので (x - 2)(x - 5)。どちらのかっこもマイナスなので、答えは正の x = 2 と x = 5 です。"
    }
  },
  {
    id: "quad_medium_05",
    topic: "quadratic",
    equation: "x² + 8x + 15 = 0",
    answer: [-5, -3],
    difficulty: "medium",
    type: "factor",
    basePoints: 20,
    steps: [
      { action: "factor", value: "(x + 3)(x + 5)", wrong: ["(x + 1)(x + 15)", "(x - 3)(x - 5)", "(x + 3)(x - 5)"], target: "left", result: "(x + 3)(x + 5) = 0" },
      { action: "roots",  value: "x = -5, -3", wrong: ["x = 3, 5", "x = -5, 3", "x = -3, 5"], target: "both-sides", result: "x = -5, -3" }
    ],
    hints: {
      en: [
        "Find two numbers that multiply to 15 and add to 8.",
        "Now set each bracket to 0: x + 3 = 0 and x + 5 = 0."
      ],
      ja: [
        "かけて15、足して8になる2つの数を探す。",
        "それぞれのかっこを0にする：x + 3 = 0 と x + 5 = 0。"
      ]
    },
    explanation: {
      en: "3 × 5 = 15 and 3 + 5 = 8 (1 and 15 multiply to 15 too, but add to 16). So it's (x + 3)(x + 5), giving x = -3 and x = -5.",
      ja: "3 × 5 = 15、3 + 5 = 8（1と15もかけて15ですが、足すと16）。(x + 3)(x + 5) から x = -3 と x = -5 です。"
    }
  },
  {
    id: "quad_medium_06",
    topic: "quadratic",
    equation: "x² + x - 6 = 0",
    answer: [-3, 2],
    difficulty: "medium",
    type: "factor",
    basePoints: 20,
    steps: [
      { action: "factor", value: "(x + 3)(x - 2)", wrong: ["(x - 3)(x + 2)", "(x + 6)(x - 1)", "(x - 6)(x + 1)"], target: "left", result: "(x + 3)(x - 2) = 0" },
      { action: "roots",  value: "x = -3, 2", wrong: ["x = -2, 3", "x = 2, 3", "x = -3, -2"], target: "both-sides", result: "x = -3, 2" }
    ],
    hints: {
      en: [
        "Find two numbers that multiply to -6 and add to 1.",
        "Now set each bracket to 0: x + 3 = 0 and x - 2 = 0."
      ],
      ja: [
        "かけて-6、足して1になる2つの数を探す。",
        "それぞれのかっこを0にする：x + 3 = 0 と x - 2 = 0。"
      ]
    },
    explanation: {
      en: "The constant is negative, so the two numbers have opposite signs: 3 × (-2) = -6 and 3 + (-2) = 1. That gives (x + 3)(x - 2), so x = -3 and x = 2.",
      ja: "定数項が負なので、2つの数は符号が逆です：3 × (-2) = -6、3 + (-2) = 1。(x + 3)(x - 2) から x = -3 と x = 2 です。"
    }
  },
  {
    id: "quad_medium_07",
    topic: "quadratic",
    equation: "x² - 2x - 8 = 0",
    answer: [-2, 4],
    difficulty: "medium",
    type: "factor",
    basePoints: 20,
    steps: [
      { action: "factor", value: "(x - 4)(x + 2)", wrong: ["(x + 4)(x - 2)", "(x - 8)(x + 1)", "(x + 8)(x - 1)"], target: "left", result: "(x - 4)(x + 2) = 0" },
      { action: "roots",  value: "x = -2, 4", wrong: ["x = -4, 2", "x = 2, 4", "x = -4, -2"], target: "both-sides", result: "x = -2, 4" }
    ],
    hints: {
      en: [
        "Find two numbers that multiply to -8 and add to -2.",
        "Now set each bracket to 0: x - 4 = 0 and x + 2 = 0."
      ],
      ja: [
        "かけて-8、足して-2になる2つの数を探す。",
        "それぞれのかっこを0にする：x - 4 = 0 と x + 2 = 0。"
      ]
    },
    explanation: {
      en: "(-4) × 2 = -8 and (-4) + 2 = -2. The bigger number takes the minus, because the middle term is negative. So it's (x - 4)(x + 2), giving x = 4 and x = -2.",
      ja: "(-4) × 2 = -8、(-4) + 2 = -2。真ん中の項が負なので、大きい方の数がマイナスになります。(x - 4)(x + 2) から x = 4 と x = -2 です。"
    }
  },
  {
    id: "quad_medium_08",
    topic: "quadratic",
    equation: "x² - x - 12 = 0",
    answer: [-3, 4],
    difficulty: "medium",
    type: "factor",
    basePoints: 20,
    steps: [
      { action: "factor", value: "(x - 4)(x + 3)", wrong: ["(x + 4)(x - 3)", "(x - 6)(x + 2)", "(x - 12)(x + 1)"], target: "left", result: "(x - 4)(x + 3) = 0" },
      { action: "roots",  value: "x = -3, 4", wrong: ["x = -4, 3", "x = 3, 4", "x = -4, -3"], target: "both-sides", result: "x = -3, 4" }
    ],
    hints: {
      en: [
        "Find two numbers that multiply to -12 and add to -1.",
        "Now set each bracket to 0: x - 4 = 0 and x + 3 = 0."
      ],
      ja: [
        "かけて-12、足して-1になる2つの数を探す。",
        "それぞれのかっこを0にする：x - 4 = 0 と x + 3 = 0。"
      ]
    },
    explanation: {
      en: "(-4) × 3 = -12 and (-4) + 3 = -1. So it's (x - 4)(x + 3), giving x = 4 and x = -3.",
      ja: "(-4) × 3 = -12、(-4) + 3 = -1。(x - 4)(x + 3) から x = 4 と x = -3 です。"
    }
  },
  {
    id: "quad_medium_09",
    topic: "quadratic",
    equation: "x² + 2x - 15 = 0",
    answer: [-5, 3],
    difficulty: "medium",
    type: "factor",
    basePoints: 20,
    steps: [
      { action: "factor", value: "(x + 5)(x - 3)", wrong: ["(x - 5)(x + 3)", "(x + 15)(x - 1)", "(x - 15)(x + 1)"], target: "left", result: "(x + 5)(x - 3) = 0" },
      { action: "roots",  value: "x = -5, 3", wrong: ["x = -3, 5", "x = 3, 5", "x = -5, -3"], target: "both-sides", result: "x = -5, 3" }
    ],
    hints: {
      en: [
        "Find two numbers that multiply to -15 and add to 2.",
        "Now set each bracket to 0: x + 5 = 0 and x - 3 = 0."
      ],
      ja: [
        "かけて-15、足して2になる2つの数を探す。",
        "それぞれのかっこを0にする：x + 5 = 0 と x - 3 = 0。"
      ]
    },
    explanation: {
      en: "5 × (-3) = -15 and 5 + (-3) = 2. The middle term is positive, so the bigger number keeps the plus: (x + 5)(x - 3), giving x = -5 and x = 3.",
      ja: "5 × (-3) = -15、5 + (-3) = 2。真ん中の項が正なので、大きい方の数がプラスです：(x + 5)(x - 3) から x = -5 と x = 3 です。"
    }
  },
  {
    id: "quad_medium_10",
    topic: "quadratic",
    equation: "x² - 9x + 20 = 0",
    answer: [4, 5],
    difficulty: "medium",
    type: "factor",
    basePoints: 20,
    steps: [
      { action: "factor", value: "(x - 4)(x - 5)", wrong: ["(x - 2)(x - 10)", "(x + 4)(x + 5)", "(x - 1)(x - 20)"], target: "left", result: "(x - 4)(x - 5) = 0" },
      { action: "roots",  value: "x = 4, 5", wrong: ["x = -5, -4", "x = -4, 5", "x = -5, 4"], target: "both-sides", result: "x = 4, 5" }
    ],
    hints: {
      en: [
        "Find two numbers that multiply to 20 and add to -9.",
        "Now set each bracket to 0: x - 4 = 0 and x - 5 = 0."
      ],
      ja: [
        "かけて20、足して-9になる2つの数を探す。",
        "それぞれのかっこを0にする：x - 4 = 0 と x - 5 = 0。"
      ]
    },
    explanation: {
      en: "Both numbers are negative: (-4) × (-5) = 20 and (-4) + (-5) = -9. So it's (x - 4)(x - 5), giving x = 4 and x = 5.",
      ja: "2つの数はどちらも負です：(-4) × (-5) = 20、(-4) + (-5) = -9。(x - 4)(x - 5) から x = 4 と x = 5 です。"
    }
  },

  // ---- Hard: rearrange to "= 0" first, then factorise ----
  // Levels 3, 6 and 9 are common-factor cases: the lesson is NOT to divide by x (that loses x = 0).
  {
    id: "quad_hard_01",
    topic: "quadratic",
    equation: "x² + 6x = -8",
    answer: [-4, -2],
    difficulty: "hard",
    type: "rearrange",
    basePoints: 30,
    steps: [
      { action: "add",    value: 8, target: "both-sides", result: "x² + 6x + 8 = 0" },
      { action: "factor", value: "(x + 2)(x + 4)", wrong: ["(x + 1)(x + 8)", "(x - 2)(x - 4)", "(x + 2)(x - 4)"], target: "left", result: "(x + 2)(x + 4) = 0" },
      { action: "roots",  value: "x = -4, -2", wrong: ["x = 2, 4", "x = -4, 2", "x = -2, 4"], target: "both-sides", result: "x = -4, -2" }
    ],
    hints: {
      en: [
        "Make the right side 0 — add 8 to both sides.",
        "Find two numbers that multiply to 8 and add to 6.",
        "Now set each bracket to 0: x + 2 = 0 and x + 4 = 0."
      ],
      ja: [
        "右辺を0にする — 両辺に8を足す。",
        "かけて8、足して6になる2つの数を探す。",
        "それぞれのかっこを0にする：x + 2 = 0 と x + 4 = 0。"
      ]
    },
    explanation: {
      en: "Factorising only works when one side is 0, so add 8 first: x² + 6x + 8 = 0. Then 2 × 4 = 8 and 2 + 4 = 6 give (x + 2)(x + 4), so x = -2 or x = -4.",
      ja: "因数分解で解くには片側を0にする必要があるので、まず8を足して x² + 6x + 8 = 0 にします。2 × 4 = 8、2 + 4 = 6 なので (x + 2)(x + 4)、x = -2 または x = -4 です。"
    }
  },
  {
    id: "quad_hard_02",
    topic: "quadratic",
    equation: "x² - 6x = -5",
    answer: [1, 5],
    difficulty: "hard",
    type: "rearrange",
    basePoints: 30,
    steps: [
      { action: "add",    value: 5, target: "both-sides", result: "x² - 6x + 5 = 0" },
      { action: "factor", value: "(x - 1)(x - 5)", wrong: ["(x + 1)(x + 5)", "(x + 1)(x - 5)", "(x - 1)(x + 5)"], target: "left", result: "(x - 1)(x - 5) = 0" },
      { action: "roots",  value: "x = 1, 5", wrong: ["x = -5, -1", "x = -1, 5", "x = -5, 1"], target: "both-sides", result: "x = 1, 5" }
    ],
    hints: {
      en: [
        "Make the right side 0 — add 5 to both sides.",
        "Find two numbers that multiply to 5 and add to -6.",
        "Now set each bracket to 0: x - 1 = 0 and x - 5 = 0."
      ],
      ja: [
        "右辺を0にする — 両辺に5を足す。",
        "かけて5、足して-6になる2つの数を探す。",
        "それぞれのかっこを0にする：x - 1 = 0 と x - 5 = 0。"
      ]
    },
    explanation: {
      en: "Add 5 to make the right side 0: x² - 6x + 5 = 0. (-1) × (-5) = 5 and (-1) + (-5) = -6, so it's (x - 1)(x - 5), giving x = 1 and x = 5.",
      ja: "5を足して右辺を0にします：x² - 6x + 5 = 0。(-1) × (-5) = 5、(-1) + (-5) = -6 なので (x - 1)(x - 5)、x = 1 と x = 5 です。"
    }
  },
  {
    id: "quad_hard_03",
    topic: "quadratic",
    equation: "x² = 4x",
    answer: [0, 4],
    difficulty: "hard",
    type: "rearrange",
    basePoints: 30,
    steps: [
      { action: "subtract_x", value: 4, target: "both-sides", result: "x² - 4x = 0" },
      { action: "factor", value: "x(x - 4)", wrong: ["x(x + 4)", "(x - 2)(x + 2)", "2x(x - 2)"], target: "left", result: "x(x - 4) = 0" },
      { action: "roots",  value: "x = 0, 4", wrong: ["x = 4", "x = -4, 0", "x = -2, 2"], target: "both-sides", result: "x = 0, 4" }
    ],
    hints: {
      en: [
        "Don't divide by x — you'd lose the answer x = 0. Subtract 4x from both sides so one side is 0.",
        "Both terms have x in them — take x out: x(…).",
        "Set each factor to 0: x = 0 and x - 4 = 0."
      ],
      ja: [
        "xで割らないこと — x = 0 の解がなくなります。両辺から4xを引いて右辺を0にする。",
        "どちらの項にもxがある — xでくくる：x(…)。",
        "それぞれの因数を0にする：x = 0 と x - 4 = 0。"
      ]
    },
    explanation: {
      en: "Dividing both sides by x would only give x = 4 and lose x = 0. Instead, subtract 4x to get x² - 4x = 0, then take out x: x(x - 4) = 0. So x = 0 or x = 4.",
      ja: "両辺をxで割ると x = 4 しか残らず、x = 0 を失います。代わりに4xを引いて x² - 4x = 0 にし、xでくくると x(x - 4) = 0。x = 0 または x = 4 です。"
    }
  },
  {
    id: "quad_hard_04",
    topic: "quadratic",
    equation: "x² + 3x = 10",
    answer: [-5, 2],
    difficulty: "hard",
    type: "rearrange",
    basePoints: 30,
    steps: [
      { action: "subtract", value: 10, target: "both-sides", result: "x² + 3x - 10 = 0" },
      { action: "factor", value: "(x + 5)(x - 2)", wrong: ["(x - 5)(x + 2)", "(x + 10)(x - 1)", "(x - 10)(x + 1)"], target: "left", result: "(x + 5)(x - 2) = 0" },
      { action: "roots",  value: "x = -5, 2", wrong: ["x = -2, 5", "x = 2, 5", "x = -5, -2"], target: "both-sides", result: "x = -5, 2" }
    ],
    hints: {
      en: [
        "Make the right side 0 — subtract 10 from both sides.",
        "Find two numbers that multiply to -10 and add to 3.",
        "Now set each bracket to 0: x + 5 = 0 and x - 2 = 0."
      ],
      ja: [
        "右辺を0にする — 両辺から10を引く。",
        "かけて-10、足して3になる2つの数を探す。",
        "それぞれのかっこを0にする：x + 5 = 0 と x - 2 = 0。"
      ]
    },
    explanation: {
      en: "Subtract 10 so the right side is 0: x² + 3x - 10 = 0. The constant is negative, so the signs are opposite: 5 × (-2) = -10 and 5 + (-2) = 3. That gives (x + 5)(x - 2), so x = -5 and x = 2.",
      ja: "10を引いて右辺を0にします：x² + 3x - 10 = 0。定数項が負なので符号は逆です：5 × (-2) = -10、5 + (-2) = 3。(x + 5)(x - 2) から x = -5 と x = 2 です。"
    }
  },
  {
    id: "quad_hard_05",
    topic: "quadratic",
    equation: "x² - 4x = 12",
    answer: [-2, 6],
    difficulty: "hard",
    type: "rearrange",
    basePoints: 30,
    steps: [
      { action: "subtract", value: 12, target: "both-sides", result: "x² - 4x - 12 = 0" },
      { action: "factor", value: "(x - 6)(x + 2)", wrong: ["(x + 6)(x - 2)", "(x - 4)(x + 3)", "(x - 12)(x + 1)"], target: "left", result: "(x - 6)(x + 2) = 0" },
      { action: "roots",  value: "x = -2, 6", wrong: ["x = -6, 2", "x = 2, 6", "x = -6, -2"], target: "both-sides", result: "x = -2, 6" }
    ],
    hints: {
      en: [
        "Make the right side 0 — subtract 12 from both sides.",
        "Find two numbers that multiply to -12 and add to -4.",
        "Now set each bracket to 0: x - 6 = 0 and x + 2 = 0."
      ],
      ja: [
        "右辺を0にする — 両辺から12を引く。",
        "かけて-12、足して-4になる2つの数を探す。",
        "それぞれのかっこを0にする：x - 6 = 0 と x + 2 = 0。"
      ]
    },
    explanation: {
      en: "Subtract 12 to get x² - 4x - 12 = 0. (-6) × 2 = -12 and (-6) + 2 = -4. Careful: (-4) × 3 is also -12, but it adds to -1. So it's (x - 6)(x + 2), giving x = 6 and x = -2.",
      ja: "12を引いて x² - 4x - 12 = 0 にします。(-6) × 2 = -12、(-6) + 2 = -4。注意：(-4) × 3 も -12 ですが、足すと -1 です。(x - 6)(x + 2) から x = 6 と x = -2 です。"
    }
  },
  {
    id: "quad_hard_06",
    topic: "quadratic",
    equation: "x² = -5x",
    answer: [-5, 0],
    difficulty: "hard",
    type: "rearrange",
    basePoints: 30,
    steps: [
      { action: "add_x",  value: 5, target: "both-sides", result: "x² + 5x = 0" },
      { action: "factor", value: "x(x + 5)", wrong: ["x(x - 5)", "5x(x + 1)", "(x + 5)(x - 5)"], target: "left", result: "x(x + 5) = 0" },
      { action: "roots",  value: "x = -5, 0", wrong: ["x = -5", "x = 0, 5", "x = -5, 5"], target: "both-sides", result: "x = -5, 0" }
    ],
    hints: {
      en: [
        "Don't divide by x — you'd lose the answer x = 0. Add 5x to both sides so one side is 0.",
        "Both terms have x in them — take x out: x(…).",
        "Set each factor to 0: x = 0 and x + 5 = 0."
      ],
      ja: [
        "xで割らないこと — x = 0 の解がなくなります。両辺に5xを足して右辺を0にする。",
        "どちらの項にもxがある — xでくくる：x(…)。",
        "それぞれの因数を0にする：x = 0 と x + 5 = 0。"
      ]
    },
    explanation: {
      en: "Add 5x to both sides to get x² + 5x = 0, then take out x: x(x + 5) = 0. So x = 0 or x = -5. Dividing by x at the start would have lost x = 0.",
      ja: "両辺に5xを足して x² + 5x = 0 にし、xでくくると x(x + 5) = 0。x = 0 または x = -5 です。最初にxで割ると x = 0 を失っていました。"
    }
  },
  {
    id: "quad_hard_07",
    topic: "quadratic",
    equation: "x² + 2x - 3 = 5",
    answer: [-4, 2],
    difficulty: "hard",
    type: "rearrange",
    basePoints: 30,
    steps: [
      { action: "subtract", value: 5, target: "both-sides", result: "x² + 2x - 8 = 0" },
      { action: "factor", value: "(x + 4)(x - 2)", wrong: ["(x - 4)(x + 2)", "(x + 8)(x - 1)", "(x - 8)(x + 1)"], target: "left", result: "(x + 4)(x - 2) = 0" },
      { action: "roots",  value: "x = -4, 2", wrong: ["x = -2, 4", "x = 2, 4", "x = -4, -2"], target: "both-sides", result: "x = -4, 2" }
    ],
    hints: {
      en: [
        "Make the right side 0 — subtract 5 from both sides.",
        "Find two numbers that multiply to -8 and add to 2.",
        "Now set each bracket to 0: x + 4 = 0 and x - 2 = 0."
      ],
      ja: [
        "右辺を0にする — 両辺から5を引く。",
        "かけて-8、足して2になる2つの数を探す。",
        "それぞれのかっこを0にする：x + 4 = 0 と x - 2 = 0。"
      ]
    },
    explanation: {
      en: "There's already a constant on the left, so subtracting 5 combines them: -3 - 5 = -8, giving x² + 2x - 8 = 0. Then 4 × (-2) = -8 and 4 + (-2) = 2, so (x + 4)(x - 2) and x = -4 or x = 2.",
      ja: "左辺にすでに定数項があるので、5を引くとまとまります：-3 - 5 = -8 で x² + 2x - 8 = 0。4 × (-2) = -8、4 + (-2) = 2 なので (x + 4)(x - 2)、x = -4 または x = 2 です。"
    }
  },
  {
    id: "quad_hard_08",
    topic: "quadratic",
    equation: "x² - 5x + 1 = -3",
    answer: [1, 4],
    difficulty: "hard",
    type: "rearrange",
    basePoints: 30,
    steps: [
      { action: "add",    value: 3, target: "both-sides", result: "x² - 5x + 4 = 0" },
      { action: "factor", value: "(x - 1)(x - 4)", wrong: ["(x - 2)(x - 2)", "(x + 1)(x + 4)", "(x + 1)(x - 4)"], target: "left", result: "(x - 1)(x - 4) = 0" },
      { action: "roots",  value: "x = 1, 4", wrong: ["x = -4, -1", "x = -1, 4", "x = -4, 1"], target: "both-sides", result: "x = 1, 4" }
    ],
    hints: {
      en: [
        "Make the right side 0 — add 3 to both sides.",
        "Find two numbers that multiply to 4 and add to -5.",
        "Now set each bracket to 0: x - 1 = 0 and x - 4 = 0."
      ],
      ja: [
        "右辺を0にする — 両辺に3を足す。",
        "かけて4、足して-5になる2つの数を探す。",
        "それぞれのかっこを0にする：x - 1 = 0 と x - 4 = 0。"
      ]
    },
    explanation: {
      en: "Add 3 to both sides: 1 + 3 = 4, giving x² - 5x + 4 = 0. (-1) × (-4) = 4 and (-1) + (-4) = -5. (-2) × (-2) is also 4, but it adds to -4. So (x - 1)(x - 4), and x = 1 or x = 4.",
      ja: "両辺に3を足すと 1 + 3 = 4 で x² - 5x + 4 = 0。(-1) × (-4) = 4、(-1) + (-4) = -5。(-2) × (-2) も4ですが、足すと -4 です。(x - 1)(x - 4) から x = 1 または x = 4 です。"
    }
  },
  {
    id: "quad_hard_09",
    topic: "quadratic",
    equation: "x² + 2x = 5x",
    answer: [0, 3],
    difficulty: "hard",
    type: "rearrange",
    basePoints: 30,
    steps: [
      { action: "subtract_x", value: 5, target: "both-sides", result: "x² - 3x = 0" },
      { action: "factor", value: "x(x - 3)", wrong: ["x(x + 3)", "3x(x - 1)", "(x - 3)(x + 3)"], target: "left", result: "x(x - 3) = 0" },
      { action: "roots",  value: "x = 0, 3", wrong: ["x = 3", "x = -3, 0", "x = 0, 1"], target: "both-sides", result: "x = 0, 3" }
    ],
    hints: {
      en: [
        "Don't divide by x — you'd lose the answer x = 0. Subtract 5x from both sides so one side is 0.",
        "Both terms have x in them — take x out: x(…).",
        "Set each factor to 0: x = 0 and x - 3 = 0."
      ],
      ja: [
        "xで割らないこと — x = 0 の解がなくなります。両辺から5xを引いて右辺を0にする。",
        "どちらの項にもxがある — xでくくる：x(…)。",
        "それぞれの因数を0にする：x = 0 と x - 3 = 0。"
      ]
    },
    explanation: {
      en: "Subtract 5x from both sides: 2x - 5x = -3x, so x² - 3x = 0. Take out x to get x(x - 3) = 0, so x = 0 or x = 3.",
      ja: "両辺から5xを引くと 2x - 5x = -3x で x² - 3x = 0。xでくくると x(x - 3) = 0、x = 0 または x = 3 です。"
    }
  },
  {
    id: "quad_hard_10",
    topic: "quadratic",
    equation: "x² + 6x = 3x + 18",
    answer: [-6, 3],
    difficulty: "hard",
    type: "rearrange",
    basePoints: 30,
    steps: [
      { action: "subtract_x", value: 3,  target: "both-sides", result: "x² + 3x = 18" },
      { action: "subtract",   value: 18, target: "both-sides", result: "x² + 3x - 18 = 0" },
      { action: "factor", value: "(x + 6)(x - 3)", wrong: ["(x - 6)(x + 3)", "(x + 9)(x - 2)", "(x - 9)(x + 2)"], target: "left", result: "(x + 6)(x - 3) = 0" },
      { action: "roots",  value: "x = -6, 3", wrong: ["x = -3, 6", "x = 3, 6", "x = -6, -3"], target: "both-sides", result: "x = -6, 3" }
    ],
    hints: {
      en: [
        "Start with the x terms — subtract 3x from both sides.",
        "Now make the right side 0 — subtract 18 from both sides.",
        "Find two numbers that multiply to -18 and add to 3.",
        "Now set each bracket to 0: x + 6 = 0 and x - 3 = 0."
      ],
      ja: [
        "まずxの項をまとめる — 両辺から3xを引く。",
        "次に右辺を0にする — 両辺から18を引く。",
        "かけて-18、足して3になる2つの数を探す。",
        "それぞれのかっこを0にする：x + 6 = 0 と x - 3 = 0。"
      ]
    },
    explanation: {
      en: "Move everything to the left one step at a time: subtract 3x, then subtract 18, giving x² + 3x - 18 = 0. 6 × (-3) = -18 and 6 + (-3) = 3, so (x + 6)(x - 3) and x = -6 or x = 3.",
      ja: "1ステップずつ左辺に移します：3xを引き、18を引くと x² + 3x - 18 = 0。6 × (-3) = -18、6 + (-3) = 3 なので (x + 6)(x - 3)、x = -6 または x = 3 です。"
    }
  },

  // =====================================================================
  // SYSTEMS OF EQUATIONS
  // =====================================================================

  // ---- Easy: add the equations to cancel y ----
  // x coefficients always differ, so subtracting never eliminates a letter (it's a real mistake here).
  {
    id: "system_easy_01",
    topic: "system",
    equation: "x + y = 9\n2x - y = 3",
    answer: { x: 4, y: 5 },
    difficulty: "easy",
    type: "elimination",
    basePoints: 10,
    steps: [
      { action: "combine",    value: "3x = 12", wrong: ["-x + 2y = 6", "3x = 9", "3x = 6"], target: "both-sides", result: "3x = 12" },
      { action: "divide",     value: 3, target: "both-sides", result: "x = 4\nx + y = 9" },
      { action: "substitute", value: "x = 4, y = 5", wrong: ["x = 4, y = 13", "x = 4, y = -5", "x = 4, y = 4"], target: "both-sides", result: "x = 4, y = 5" }
    ],
    hints: {
      en: [
        "Add the two equations: +y and -y cancel.",
        "Divide both sides by 3.",
        "Put x = 4 into the top line: 4 + y = 9, so y = 5."
      ],
      ja: [
        "2つの式を足す — +y と -y が消える。",
        "両辺を3で割る。",
        "上の式に x = 4 を代入：4 + y = 9 なので y = 5。"
      ]
    },
    explanation: {
      en: "Adding the equations cancels y, leaving 3x = 12, so x = 4. Putting x = 4 back into x + y = 9 gives y = 5.",
      ja: "2つの式を足すとyが消えて 3x = 12、x = 4 です。x = 4 を x + y = 9 に代入すると y = 5 です。"
    }
  },
  {
    id: "system_easy_02",
    topic: "system",
    equation: "2x + y = 7\nx - y = -1",
    answer: { x: 2, y: 3 },
    difficulty: "easy",
    type: "elimination",
    basePoints: 10,
    steps: [
      { action: "combine",    value: "3x = 6", wrong: ["x + 2y = 8", "3x = 7", "3x = 8"], target: "both-sides", result: "3x = 6" },
      { action: "divide",     value: 3, target: "both-sides", result: "x = 2\n2x + y = 7" },
      { action: "substitute", value: "x = 2, y = 3", wrong: ["x = 2, y = 5", "x = 2, y = 11", "x = 2, y = -3"], target: "both-sides", result: "x = 2, y = 3" }
    ],
    hints: {
      en: [
        "Add the two equations: +y and -y cancel.",
        "Divide both sides by 3.",
        "Put x = 2 into the top line: 2 × 2 = 4, so 4 + y = 7 and y = 3."
      ],
      ja: [
        "2つの式を足す — +y と -y が消える。",
        "両辺を3で割る。",
        "上の式に x = 2 を代入：2 × 2 = 4 なので 4 + y = 7、y = 3。"
      ]
    },
    explanation: {
      en: "Watch the negative on the bottom line: 7 + (-1) = 6, so 3x = 6 and x = 2. Then 2 × 2 = 4, so 4 + y = 7 and y = 3.",
      ja: "下の式の右辺は負の数です：7 + (-1) = 6 なので 3x = 6、x = 2。2 × 2 = 4 なので 4 + y = 7、y = 3 です。"
    }
  },
  {
    id: "system_easy_03",
    topic: "system",
    equation: "3x + y = 14\nx - y = 2",
    answer: { x: 4, y: 2 },
    difficulty: "easy",
    type: "elimination",
    basePoints: 10,
    steps: [
      { action: "combine",    value: "4x = 16", wrong: ["2x + 2y = 12", "4x = 14", "4x = 12"], target: "both-sides", result: "4x = 16" },
      { action: "divide",     value: 4, target: "both-sides", result: "x = 4\n3x + y = 14" },
      { action: "substitute", value: "x = 4, y = 2", wrong: ["x = 4, y = 10", "x = 4, y = 26", "x = 4, y = -2"], target: "both-sides", result: "x = 4, y = 2" }
    ],
    hints: {
      en: [
        "Add the two equations: +y and -y cancel.",
        "Divide both sides by 4.",
        "Put x = 4 into the top line: 3 × 4 = 12, so 12 + y = 14 and y = 2."
      ],
      ja: [
        "2つの式を足す — +y と -y が消える。",
        "両辺を4で割る。",
        "上の式に x = 4 を代入：3 × 4 = 12 なので 12 + y = 14、y = 2。"
      ]
    },
    explanation: {
      en: "Adding cancels y: 4x = 16, so x = 4. Remember to multiply when you substitute: 3 × 4 = 12, so 12 + y = 14 and y = 2.",
      ja: "足すとyが消えて 4x = 16、x = 4。代入するときはかけ算を忘れずに：3 × 4 = 12 なので 12 + y = 14、y = 2 です。"
    }
  },
  {
    id: "system_easy_04",
    topic: "system",
    equation: "3x + y = 13\n2x - y = -3",
    answer: { x: 2, y: 7 },
    difficulty: "easy",
    type: "elimination",
    basePoints: 10,
    steps: [
      { action: "combine",    value: "5x = 10", wrong: ["x + 2y = 16", "5x = 13", "5x = 16"], target: "both-sides", result: "5x = 10" },
      { action: "divide",     value: 5, target: "both-sides", result: "x = 2\n3x + y = 13" },
      { action: "substitute", value: "x = 2, y = 7", wrong: ["x = 2, y = 11", "x = 2, y = 19", "x = 2, y = -7"], target: "both-sides", result: "x = 2, y = 7" }
    ],
    hints: {
      en: [
        "Add the two equations: +y and -y cancel.",
        "Divide both sides by 5.",
        "Put x = 2 into the top line: 3 × 2 = 6, so 6 + y = 13 and y = 7."
      ],
      ja: [
        "2つの式を足す — +y と -y が消える。",
        "両辺を5で割る。",
        "上の式に x = 2 を代入：3 × 2 = 6 なので 6 + y = 13、y = 7。"
      ]
    },
    explanation: {
      en: "Adding cancels y: 13 + (-3) = 10, so 5x = 10 and x = 2. Then 3 × 2 = 6, so 6 + y = 13 and y = 7.",
      ja: "足すとyが消えます：13 + (-3) = 10 なので 5x = 10、x = 2。3 × 2 = 6 なので 6 + y = 13、y = 7 です。"
    }
  },
  {
    id: "system_easy_05",
    topic: "system",
    equation: "2x + y = 2\nx - y = 7",
    answer: { x: 3, y: -4 },
    difficulty: "easy",
    type: "elimination",
    basePoints: 10,
    steps: [
      { action: "combine",    value: "3x = 9", wrong: ["x + 2y = -5", "3x = 2", "3x = -5"], target: "both-sides", result: "3x = 9" },
      { action: "divide",     value: 3, target: "both-sides", result: "x = 3\n2x + y = 2" },
      { action: "substitute", value: "x = 3, y = -4", wrong: ["x = 3, y = -1", "x = 3, y = 8", "x = 3, y = 4"], target: "both-sides", result: "x = 3, y = -4" }
    ],
    hints: {
      en: [
        "Add the two equations: +y and -y cancel.",
        "Divide both sides by 3.",
        "Put x = 3 into the top line: 2 × 3 = 6, so 6 + y = 2 and y = -4."
      ],
      ja: [
        "2つの式を足す — +y と -y が消える。",
        "両辺を3で割る。",
        "上の式に x = 3 を代入：2 × 3 = 6 なので 6 + y = 2、y = -4。"
      ]
    },
    explanation: {
      en: "Adding gives 3x = 9, so x = 3. Then 6 + y = 2 — y has to take 4 away, so y = -4.",
      ja: "足すと 3x = 9、x = 3。6 + y = 2 なので、yは4を引く数、つまり y = -4 です。"
    }
  },
  {
    id: "system_easy_06",
    topic: "system",
    equation: "4x + y = 14\n2x - y = -2",
    answer: { x: 2, y: 6 },
    difficulty: "easy",
    type: "elimination",
    basePoints: 10,
    steps: [
      { action: "combine",    value: "6x = 12", wrong: ["2x + 2y = 16", "6x = 14", "6x = 16"], target: "both-sides", result: "6x = 12" },
      { action: "divide",     value: 6, target: "both-sides", result: "x = 2\n4x + y = 14" },
      { action: "substitute", value: "x = 2, y = 6", wrong: ["x = 2, y = 12", "x = 2, y = 22", "x = 2, y = -6"], target: "both-sides", result: "x = 2, y = 6" }
    ],
    hints: {
      en: [
        "Add the two equations: +y and -y cancel.",
        "Divide both sides by 6.",
        "Put x = 2 into the top line: 4 × 2 = 8, so 8 + y = 14 and y = 6."
      ],
      ja: [
        "2つの式を足す — +y と -y が消える。",
        "両辺を6で割る。",
        "上の式に x = 2 を代入：4 × 2 = 8 なので 8 + y = 14、y = 6。"
      ]
    },
    explanation: {
      en: "Adding cancels y: 14 + (-2) = 12, so 6x = 12 and x = 2. Then 4 × 2 = 8, so 8 + y = 14 and y = 6.",
      ja: "足すとyが消えます：14 + (-2) = 12 なので 6x = 12、x = 2。4 × 2 = 8 なので 8 + y = 14、y = 6 です。"
    }
  },
  {
    id: "system_easy_07",
    topic: "system",
    equation: "x + 2y = 13\n2x - 2y = 8",
    answer: { x: 7, y: 3 },
    difficulty: "easy",
    type: "elimination",
    basePoints: 10,
    steps: [
      { action: "combine",    value: "3x = 21", wrong: ["-x + 4y = 5", "3x = 13", "3x = 5"], target: "both-sides", result: "3x = 21" },
      { action: "divide",     value: 3, target: "both-sides", result: "x = 7\nx + 2y = 13" },
      { action: "substitute", value: "x = 7, y = 3", wrong: ["x = 7, y = 6", "x = 7, y = 10", "x = 7, y = -3"], target: "both-sides", result: "x = 7, y = 3" }
    ],
    hints: {
      en: [
        "Add the two equations: +2y and -2y cancel.",
        "Divide both sides by 3.",
        "Put x = 7 into the top line: 7 + 2y = 13, so 2y = 6 and y = 3."
      ],
      ja: [
        "2つの式を足す — +2y と -2y が消える。",
        "両辺を3で割る。",
        "上の式に x = 7 を代入：7 + 2y = 13 なので 2y = 6、y = 3。"
      ]
    },
    explanation: {
      en: "+2y and -2y cancel just like +y and -y, leaving 3x = 21, so x = 7. Then 7 + 2y = 13 gives 2y = 6 — divide by 2 to get y = 3.",
      ja: "+2y と -2y も +y と -y と同じように消えて 3x = 21、x = 7。7 + 2y = 13 から 2y = 6、2で割って y = 3 です。"
    }
  },
  {
    id: "system_easy_08",
    topic: "system",
    equation: "3x + 2y = 16\nx - 2y = -8",
    answer: { x: 2, y: 5 },
    difficulty: "easy",
    type: "elimination",
    basePoints: 10,
    steps: [
      { action: "combine",    value: "4x = 8", wrong: ["2x + 4y = 24", "4x = 16", "4x = 24"], target: "both-sides", result: "4x = 8" },
      { action: "divide",     value: 4, target: "both-sides", result: "x = 2\n3x + 2y = 16" },
      { action: "substitute", value: "x = 2, y = 5", wrong: ["x = 2, y = 10", "x = 2, y = 7", "x = 2, y = -5"], target: "both-sides", result: "x = 2, y = 5" }
    ],
    hints: {
      en: [
        "Add the two equations: +2y and -2y cancel.",
        "Divide both sides by 4.",
        "Put x = 2 into the top line: 3 × 2 = 6, so 6 + 2y = 16, 2y = 10 and y = 5."
      ],
      ja: [
        "2つの式を足す — +2y と -2y が消える。",
        "両辺を4で割る。",
        "上の式に x = 2 を代入：3 × 2 = 6 なので 6 + 2y = 16、2y = 10、y = 5。"
      ]
    },
    explanation: {
      en: "Adding cancels 2y: 16 + (-8) = 8, so 4x = 8 and x = 2. Then 6 + 2y = 16 gives 2y = 10, so y = 5.",
      ja: "足すと2yが消えます：16 + (-8) = 8 なので 4x = 8、x = 2。6 + 2y = 16 から 2y = 10、y = 5 です。"
    }
  },
  {
    id: "system_easy_09",
    topic: "system",
    equation: "x + 3y = 14\n5x - 3y = 16",
    answer: { x: 5, y: 3 },
    difficulty: "easy",
    type: "elimination",
    basePoints: 10,
    steps: [
      { action: "combine",    value: "6x = 30", wrong: ["-4x + 6y = -2", "6x = 14", "6x = -2"], target: "both-sides", result: "6x = 30" },
      { action: "divide",     value: 6, target: "both-sides", result: "x = 5\nx + 3y = 14" },
      { action: "substitute", value: "x = 5, y = 3", wrong: ["x = 5, y = 9", "x = 5, y = 19", "x = 5, y = -3"], target: "both-sides", result: "x = 5, y = 3" }
    ],
    hints: {
      en: [
        "Add the two equations: +3y and -3y cancel.",
        "Divide both sides by 6.",
        "Put x = 5 into the top line: 5 + 3y = 14, so 3y = 9 and y = 3."
      ],
      ja: [
        "2つの式を足す — +3y と -3y が消える。",
        "両辺を6で割る。",
        "上の式に x = 5 を代入：5 + 3y = 14 なので 3y = 9、y = 3。"
      ]
    },
    explanation: {
      en: "Adding cancels 3y, leaving 6x = 30, so x = 5. Then 5 + 3y = 14 gives 3y = 9 — divide by 3 to get y = 3.",
      ja: "足すと3yが消えて 6x = 30、x = 5。5 + 3y = 14 から 3y = 9、3で割って y = 3 です。"
    }
  },
  {
    id: "system_easy_10",
    topic: "system",
    equation: "3x + 2y = 5\n2x - 2y = 20",
    answer: { x: 5, y: -5 },
    difficulty: "easy",
    type: "elimination",
    basePoints: 10,
    steps: [
      { action: "combine",    value: "5x = 25", wrong: ["x + 4y = -15", "5x = 5", "5x = -15"], target: "both-sides", result: "5x = 25" },
      { action: "divide",     value: 5, target: "both-sides", result: "x = 5\n3x + 2y = 5" },
      { action: "substitute", value: "x = 5, y = -5", wrong: ["x = 5, y = -10", "x = 5, y = 5", "x = 5, y = 0"], target: "both-sides", result: "x = 5, y = -5" }
    ],
    hints: {
      en: [
        "Add the two equations: +2y and -2y cancel.",
        "Divide both sides by 5.",
        "Put x = 5 into the top line: 3 × 5 = 15, so 15 + 2y = 5, 2y = -10 and y = -5."
      ],
      ja: [
        "2つの式を足す — +2y と -2y が消える。",
        "両辺を5で割る。",
        "上の式に x = 5 を代入：3 × 5 = 15 なので 15 + 2y = 5、2y = -10、y = -5。"
      ]
    },
    explanation: {
      en: "Adding cancels 2y: 5x = 25, so x = 5. Then 3 × 5 = 15, so 15 + 2y = 5 gives 2y = -10 and y = -5.",
      ja: "足すと2yが消えて 5x = 25、x = 5。3 × 5 = 15 なので 15 + 2y = 5 から 2y = -10、y = -5 です。"
    }
  },

  // ---- Medium: decide whether to add or subtract ----
  // Same-sign letter → subtract (always top minus bottom); opposite signs → add.
  // Combine options form a 2×2 grid (letter terms added/subtracted × numbers added/subtracted),
  // so every option has the same shape and the player has to choose the operation.
  // Levels 4, 5, 6 and 9 cancel x instead of y.
  {
    id: "system_medium_01",
    topic: "system",
    equation: "3x + y = 14\nx + y = 6",
    answer: { x: 4, y: 2 },
    difficulty: "medium",
    type: "elimination",
    basePoints: 20,
    steps: [
      { action: "combine",    value: "2x = 8", wrong: ["4x = 20", "2x = 20", "4x = 8"], target: "both-sides", result: "2x = 8" },
      { action: "divide",     value: 2, target: "both-sides", result: "x = 4\n3x + y = 14" },
      { action: "substitute", value: "x = 4, y = 2", wrong: ["x = 4, y = 10", "x = 4, y = 26", "x = 4, y = -2"], target: "both-sides", result: "x = 4, y = 2" }
    ],
    hints: {
      en: [
        "+y and +y are the same, so subtract: top minus bottom. y cancels.",
        "Divide both sides by 2.",
        "Put x = 4 into 3x + y = 14: 3 × 4 = 12, so 12 + y = 14 and y = 2."
      ],
      ja: [
        "+y と +y は同じなので、上の式から下の式を引く。yが消える。",
        "両辺を2で割る。",
        "x = 4 を 3x + y = 14 に代入：3 × 4 = 12 なので 12 + y = 14、y = 2。"
      ]
    },
    explanation: {
      en: "Both equations have +y, so subtracting cancels it: 3x - x = 2x and 14 - 6 = 8, giving x = 4. Then 3 × 4 = 12, so 12 + y = 14 and y = 2.",
      ja: "どちらの式も +y なので、引くとyが消えます：3x - x = 2x、14 - 6 = 8 で x = 4。3 × 4 = 12 なので 12 + y = 14、y = 2 です。"
    }
  },
  {
    id: "system_medium_02",
    topic: "system",
    equation: "2x + 3y = 12\nx - 3y = -3",
    answer: { x: 3, y: 2 },
    difficulty: "medium",
    type: "elimination",
    basePoints: 20,
    steps: [
      { action: "combine",    value: "3x = 9", wrong: ["x = 15", "3x = 15", "x = 9"], target: "both-sides", result: "3x = 9" },
      { action: "divide",     value: 3, target: "both-sides", result: "x = 3\n2x + 3y = 12" },
      { action: "substitute", value: "x = 3, y = 2", wrong: ["x = 3, y = 6", "x = 3, y = 3", "x = 3, y = -2"], target: "both-sides", result: "x = 3, y = 2" }
    ],
    hints: {
      en: [
        "+3y and -3y are opposite, so add the two equations. y cancels.",
        "Divide both sides by 3.",
        "Put x = 3 into 2x + 3y = 12: 2 × 3 = 6, so 6 + 3y = 12, 3y = 6 and y = 2."
      ],
      ja: [
        "+3y と -3y は反対なので、2つの式を足す。yが消える。",
        "両辺を3で割る。",
        "x = 3 を 2x + 3y = 12 に代入：2 × 3 = 6 なので 6 + 3y = 12、3y = 6、y = 2。"
      ]
    },
    explanation: {
      en: "+3y and -3y are opposites, so adding cancels y: 12 + (-3) = 9, so 3x = 9 and x = 3. Then 6 + 3y = 12 gives 3y = 6, so y = 2.",
      ja: "+3y と -3y は反対なので、足すとyが消えます：12 + (-3) = 9 で 3x = 9、x = 3。6 + 3y = 12 から 3y = 6、y = 2 です。"
    }
  },
  {
    id: "system_medium_03",
    topic: "system",
    equation: "x + 2y = 11\n3x - 2y = 1",
    answer: { x: 3, y: 4 },
    difficulty: "medium",
    type: "elimination",
    basePoints: 20,
    steps: [
      { action: "combine",    value: "4x = 12", wrong: ["-2x = 10", "4x = 10", "-2x = 12"], target: "both-sides", result: "4x = 12" },
      { action: "divide",     value: 4, target: "both-sides", result: "x = 3\nx + 2y = 11" },
      { action: "substitute", value: "x = 3, y = 4", wrong: ["x = 3, y = 8", "x = 3, y = 7", "x = 3, y = -4"], target: "both-sides", result: "x = 3, y = 4" }
    ],
    hints: {
      en: [
        "+2y and -2y are opposite, so add the two equations. y cancels.",
        "Divide both sides by 4.",
        "Put x = 3 into x + 2y = 11: 3 + 2y = 11, so 2y = 8 and y = 4."
      ],
      ja: [
        "+2y と -2y は反対なので、2つの式を足す。yが消える。",
        "両辺を4で割る。",
        "x = 3 を x + 2y = 11 に代入：3 + 2y = 11 なので 2y = 8、y = 4。"
      ]
    },
    explanation: {
      en: "+2y and -2y are opposites, so add: x + 3x = 4x and 11 + 1 = 12, giving x = 3. Then 3 + 2y = 11, so 2y = 8 and y = 4.",
      ja: "+2y と -2y は反対なので足します：x + 3x = 4x、11 + 1 = 12 で x = 3。3 + 2y = 11 から 2y = 8、y = 4 です。"
    }
  },
  {
    id: "system_medium_04",
    topic: "system",
    equation: "2x + 5y = 16\n2x + y = 8",
    answer: { x: 3, y: 2 },
    difficulty: "medium",
    type: "elimination",
    basePoints: 20,
    steps: [
      { action: "combine",    value: "4y = 8", wrong: ["6y = 24", "4y = 24", "6y = 8"], target: "both-sides", result: "4y = 8" },
      { action: "divide",     value: 4, target: "both-sides", result: "y = 2\n2x + y = 8" },
      { action: "substitute", value: "x = 3, y = 2", wrong: ["x = 6, y = 2", "x = 5, y = 2", "x = -3, y = 2"], target: "both-sides", result: "x = 3, y = 2" }
    ],
    hints: {
      en: [
        "+2x and +2x are the same, so subtract: top minus bottom. This time x cancels.",
        "Divide both sides by 4.",
        "Put y = 2 into 2x + y = 8: 2x + 2 = 8, so 2x = 6 and x = 3."
      ],
      ja: [
        "+2x と +2x は同じなので、上の式から下の式を引く。今回はxが消える。",
        "両辺を4で割る。",
        "y = 2 を 2x + y = 8 に代入：2x + 2 = 8 なので 2x = 6、x = 3。"
      ]
    },
    explanation: {
      en: "Both equations have +2x, so subtracting cancels x: 5y - y = 4y and 16 - 8 = 8, giving y = 2. Then 2x + 2 = 8, so 2x = 6 and x = 3.",
      ja: "どちらの式も +2x なので、引くとxが消えます：5y - y = 4y、16 - 8 = 8 で y = 2。2x + 2 = 8 から 2x = 6、x = 3 です。"
    }
  },
  {
    id: "system_medium_05",
    topic: "system",
    equation: "3x + 2y = 12\n-3x + y = -3",
    answer: { x: 2, y: 3 },
    difficulty: "medium",
    type: "elimination",
    basePoints: 20,
    steps: [
      { action: "combine",    value: "3y = 9", wrong: ["y = 15", "3y = 15", "y = 9"], target: "both-sides", result: "3y = 9" },
      { action: "divide",     value: 3, target: "both-sides", result: "y = 3\n3x + 2y = 12" },
      { action: "substitute", value: "x = 2, y = 3", wrong: ["x = 3, y = 3", "x = 6, y = 3", "x = -2, y = 3"], target: "both-sides", result: "x = 2, y = 3" }
    ],
    hints: {
      en: [
        "+3x and -3x are opposite, so add the two equations. x cancels.",
        "Divide both sides by 3.",
        "Put y = 3 into 3x + 2y = 12: 2 × 3 = 6, so 3x + 6 = 12, 3x = 6 and x = 2."
      ],
      ja: [
        "+3x と -3x は反対なので、2つの式を足す。xが消える。",
        "両辺を3で割る。",
        "y = 3 を 3x + 2y = 12 に代入：2 × 3 = 6 なので 3x + 6 = 12、3x = 6、x = 2。"
      ]
    },
    explanation: {
      en: "+3x and -3x are opposites, so adding cancels x: 12 + (-3) = 9, so 3y = 9 and y = 3. Then 3x + 6 = 12 gives 3x = 6, so x = 2.",
      ja: "+3x と -3x は反対なので、足すとxが消えます：12 + (-3) = 9 で 3y = 9、y = 3。3x + 6 = 12 から 3x = 6、x = 2 です。"
    }
  },
  {
    id: "system_medium_06",
    topic: "system",
    equation: "2x + 3y = 7\n2x - y = -5",
    answer: { x: -1, y: 3 },
    difficulty: "medium",
    type: "elimination",
    basePoints: 20,
    steps: [
      { action: "combine",    value: "4y = 12", wrong: ["2y = 2", "4y = 2", "2y = 12"], target: "both-sides", result: "4y = 12" },
      { action: "divide",     value: 4, target: "both-sides", result: "y = 3\n2x + 3y = 7" },
      { action: "substitute", value: "x = -1, y = 3", wrong: ["x = 2, y = 3", "x = -2, y = 3", "x = 8, y = 3"], target: "both-sides", result: "x = -1, y = 3" }
    ],
    hints: {
      en: [
        "+2x and +2x are the same, so subtract: top minus bottom. Careful: 3y - (-y) = 4y.",
        "Divide both sides by 4.",
        "Put y = 3 into 2x + 3y = 7: 3 × 3 = 9, so 2x + 9 = 7, 2x = -2 and x = -1."
      ],
      ja: [
        "+2x と +2x は同じなので、上の式から下の式を引く。注意：3y - (-y) = 4y。",
        "両辺を4で割る。",
        "y = 3 を 2x + 3y = 7 に代入：3 × 3 = 9 なので 2x + 9 = 7、2x = -2、x = -1。"
      ]
    },
    explanation: {
      en: "Subtracting cancels x. Subtracting a negative adds: 3y - (-y) = 4y and 7 - (-5) = 12, so 4y = 12 and y = 3. Then 2x + 9 = 7 gives 2x = -2, so x = -1.",
      ja: "引くとxが消えます。負の数を引くと足し算になります：3y - (-y) = 4y、7 - (-5) = 12 で 4y = 12、y = 3。2x + 9 = 7 から 2x = -2、x = -1 です。"
    }
  },
  {
    id: "system_medium_07",
    topic: "system",
    equation: "x + 2y = 8\n3x + 2y = 12",
    answer: { x: 2, y: 3 },
    difficulty: "medium",
    type: "elimination",
    basePoints: 20,
    steps: [
      { action: "combine",    value: "-2x = -4", wrong: ["4x = 20", "-2x = 20", "4x = -4"], target: "both-sides", result: "-2x = -4" },
      { action: "divide",     value: -2, target: "both-sides", result: "x = 2\nx + 2y = 8" },
      { action: "substitute", value: "x = 2, y = 3", wrong: ["x = 2, y = 6", "x = 2, y = 5", "x = 2, y = -3"], target: "both-sides", result: "x = 2, y = 3" }
    ],
    hints: {
      en: [
        "+2y and +2y are the same, so subtract top minus bottom: x - 3x = -2x and 8 - 12 = -4.",
        "Divide both sides by -2 — watch the sign!",
        "Put x = 2 into x + 2y = 8: 2 + 2y = 8, so 2y = 6 and y = 3."
      ],
      ja: [
        "+2y と +2y は同じなので、上の式から下の式を引く：x - 3x = -2x、8 - 12 = -4。",
        "両辺を-2で割る — 符号に注意！",
        "x = 2 を x + 2y = 8 に代入：2 + 2y = 8 なので 2y = 6、y = 3。"
      ]
    },
    explanation: {
      en: "Top minus bottom cancels y and leaves a negative: x - 3x = -2x and 8 - 12 = -4. Dividing by -2 gives x = 2. Then 2 + 2y = 8, so y = 3.",
      ja: "上の式から下の式を引くとyが消え、負の数が残ります：x - 3x = -2x、8 - 12 = -4。-2で割ると x = 2。2 + 2y = 8 から y = 3 です。"
    }
  },
  {
    id: "system_medium_08",
    topic: "system",
    equation: "4x - y = 25\nx - y = 7",
    answer: { x: 6, y: -1 },
    difficulty: "medium",
    type: "elimination",
    basePoints: 20,
    steps: [
      { action: "combine",    value: "3x = 18", wrong: ["5x = 32", "3x = 32", "5x = 18"], target: "both-sides", result: "3x = 18" },
      { action: "divide",     value: 3, target: "both-sides", result: "x = 6\n4x - y = 25" },
      { action: "substitute", value: "x = 6, y = -1", wrong: ["x = 6, y = 1", "x = 6, y = -19", "x = 6, y = -15"], target: "both-sides", result: "x = 6, y = -1" }
    ],
    hints: {
      en: [
        "-y and -y are the same, so subtract: top minus bottom. -y - (-y) = 0, so y cancels.",
        "Divide both sides by 3.",
        "Put x = 6 into 4x - y = 25: 4 × 6 = 24, so 24 - y = 25, -y = 1 and y = -1."
      ],
      ja: [
        "-y と -y は同じなので、上の式から下の式を引く。-y - (-y) = 0 でyが消える。",
        "両辺を3で割る。",
        "x = 6 を 4x - y = 25 に代入：4 × 6 = 24 なので 24 - y = 25、-y = 1、y = -1。"
      ]
    },
    explanation: {
      en: "Both equations have -y, so subtract: 4x - x = 3x and 25 - 7 = 18, giving x = 6. Then 24 - y = 25, so -y = 1 and y = -1.",
      ja: "どちらの式も -y なので引きます：4x - x = 3x、25 - 7 = 18 で x = 6。24 - y = 25 から -y = 1、y = -1 です。"
    }
  },
  {
    id: "system_medium_09",
    topic: "system",
    equation: "2x + 4y = 4\n-2x + y = 6",
    answer: { x: -2, y: 2 },
    difficulty: "medium",
    type: "elimination",
    basePoints: 20,
    steps: [
      { action: "combine",    value: "5y = 10", wrong: ["3y = -2", "5y = -2", "3y = 10"], target: "both-sides", result: "5y = 10" },
      { action: "divide",     value: 5, target: "both-sides", result: "y = 2\n2x + 4y = 4" },
      { action: "substitute", value: "x = -2, y = 2", wrong: ["x = 1, y = 2", "x = 6, y = 2", "x = 2, y = 2"], target: "both-sides", result: "x = -2, y = 2" }
    ],
    hints: {
      en: [
        "+2x and -2x are opposite, so add the two equations. x cancels.",
        "Divide both sides by 5.",
        "Put y = 2 into 2x + 4y = 4: 4 × 2 = 8, so 2x + 8 = 4, 2x = -4 and x = -2."
      ],
      ja: [
        "+2x と -2x は反対なので、2つの式を足す。xが消える。",
        "両辺を5で割る。",
        "y = 2 を 2x + 4y = 4 に代入：4 × 2 = 8 なので 2x + 8 = 4、2x = -4、x = -2。"
      ]
    },
    explanation: {
      en: "+2x and -2x are opposites, so adding cancels x: 4y + y = 5y and 4 + 6 = 10, giving y = 2. Then 2x + 8 = 4 gives 2x = -4, so x = -2.",
      ja: "+2x と -2x は反対なので、足すとxが消えます：4y + y = 5y、4 + 6 = 10 で y = 2。2x + 8 = 4 から 2x = -4、x = -2 です。"
    }
  },
  {
    id: "system_medium_10",
    topic: "system",
    equation: "5x + 2y = 11\n2x + 2y = -4",
    answer: { x: 5, y: -7 },
    difficulty: "medium",
    type: "elimination",
    basePoints: 20,
    steps: [
      { action: "combine",    value: "3x = 15", wrong: ["7x = 7", "3x = 7", "7x = 15"], target: "both-sides", result: "3x = 15" },
      { action: "divide",     value: 3, target: "both-sides", result: "x = 5\n5x + 2y = 11" },
      { action: "substitute", value: "x = 5, y = -7", wrong: ["x = 5, y = -14", "x = 5, y = 3", "x = 5, y = 7"], target: "both-sides", result: "x = 5, y = -7" }
    ],
    hints: {
      en: [
        "+2y and +2y are the same, so subtract: top minus bottom. Careful: 11 - (-4) = 15.",
        "Divide both sides by 3.",
        "Put x = 5 into 5x + 2y = 11: 5 × 5 = 25, so 25 + 2y = 11, 2y = -14 and y = -7."
      ],
      ja: [
        "+2y と +2y は同じなので、上の式から下の式を引く。注意：11 - (-4) = 15。",
        "両辺を3で割る。",
        "x = 5 を 5x + 2y = 11 に代入：5 × 5 = 25 なので 25 + 2y = 11、2y = -14、y = -7。"
      ]
    },
    explanation: {
      en: "Subtracting cancels 2y. Subtracting a negative adds: 11 - (-4) = 15, so 3x = 15 and x = 5. Then 25 + 2y = 11 gives 2y = -14, so y = -7.",
      ja: "引くと2yが消えます。負の数を引くと足し算になります：11 - (-4) = 15 で 3x = 15、x = 5。25 + 2y = 11 から 2y = -14、y = -7 です。"
    }
  },

  // ---- Hard: multiply one equation first (scale), then combine ----
  // Each system has exactly one coefficient of 1, so there is one clear route: multiply that line.
  // Scale options form a 2×2 grid: the matched term is always right; the other letter term and
  // the number are each either multiplied or not. Combine options use the same 2×2 grid as Medium.
  {
    id: "system_hard_01",
    topic: "system",
    equation: "2x + 11y = 24\nx + 3y = 7",
    answer: { x: 1, y: 2 },
    difficulty: "hard",
    type: "elimination",
    basePoints: 30,
    steps: [
      { action: "scale",      value: "2x + 6y = 14", wrong: ["2x + 6y = 7", "2x + 3y = 14", "2x + 3y = 7"], target: "both-sides", result: "2x + 11y = 24\n2x + 6y = 14" },
      { action: "combine",    value: "5y = 10", wrong: ["17y = 38", "5y = 38", "17y = 10"], target: "both-sides", result: "5y = 10" },
      { action: "divide",     value: 5, target: "both-sides", result: "y = 2\nx + 3y = 7" },
      { action: "substitute", value: "x = 1, y = 2", wrong: ["x = 5, y = 2", "x = 13, y = 2", "x = -1, y = 2"], target: "both-sides", result: "x = 1, y = 2" }
    ],
    hints: {
      en: [
        "Multiply the bottom equation by 2 so both have 2x. Multiply every term, including the number.",
        "+2x and +2x are the same, so subtract: top minus bottom. x cancels.",
        "Divide both sides by 5.",
        "Put y = 2 into x + 3y = 7: 3 × 2 = 6, so x + 6 = 7 and x = 1."
      ],
      ja: [
        "下の式を2倍して、どちらも2xにする。数字も含めて、すべての項にかける。",
        "+2x と +2x は同じなので、上の式から下の式を引く。xが消える。",
        "両辺を5で割る。",
        "y = 2 を x + 3y = 7 に代入：3 × 2 = 6 なので x + 6 = 7、x = 1。"
      ]
    },
    explanation: {
      en: "No letter matches yet, so multiply x + 3y = 7 by 2 to get 2x + 6y = 14. Now subtract: 11y - 6y = 5y and 24 - 14 = 10, so y = 2. Then x + 6 = 7 gives x = 1.",
      ja: "そのままでは消せる文字がないので、x + 3y = 7 を2倍して 2x + 6y = 14 にします。引くと 11y - 6y = 5y、24 - 14 = 10 で y = 2。x + 6 = 7 から x = 1 です。"
    }
  },
  {
    id: "system_hard_02",
    topic: "system",
    equation: "2x + y = 8\n3x - 2y = 5",
    answer: { x: 3, y: 2 },
    difficulty: "hard",
    type: "elimination",
    basePoints: 30,
    steps: [
      { action: "scale",      value: "4x + 2y = 16", wrong: ["4x + 2y = 8", "2x + 2y = 16", "2x + 2y = 8"], target: "both-sides", result: "4x + 2y = 16\n3x - 2y = 5" },
      { action: "combine",    value: "7x = 21", wrong: ["x = 11", "7x = 11", "x = 21"], target: "both-sides", result: "7x = 21" },
      { action: "divide",     value: 7, target: "both-sides", result: "x = 3\n2x + y = 8" },
      { action: "substitute", value: "x = 3, y = 2", wrong: ["x = 3, y = 5", "x = 3, y = 14", "x = 3, y = -2"], target: "both-sides", result: "x = 3, y = 2" }
    ],
    hints: {
      en: [
        "Multiply the top equation by 2 so it has +2y to match -2y.",
        "+2y and -2y are opposite, so add the two equations. y cancels.",
        "Divide both sides by 7.",
        "Put x = 3 into 2x + y = 8: 2 × 3 = 6, so 6 + y = 8 and y = 2."
      ],
      ja: [
        "上の式を2倍して +2y にし、-2y とそろえる。",
        "+2y と -2y は反対なので、2つの式を足す。yが消える。",
        "両辺を7で割る。",
        "x = 3 を 2x + y = 8 に代入：2 × 3 = 6 なので 6 + y = 8、y = 2。"
      ]
    },
    explanation: {
      en: "Multiplying 2x + y = 8 by 2 gives +2y, the opposite of -2y. Adding cancels y: 4x + 3x = 7x and 16 + 5 = 21, so x = 3. Then 6 + y = 8 gives y = 2.",
      ja: "2x + y = 8 を2倍すると +2y になり、-2y と反対になります。足すとyが消えて 4x + 3x = 7x、16 + 5 = 21 で x = 3。6 + y = 8 から y = 2 です。"
    }
  },
  {
    id: "system_hard_03",
    topic: "system",
    equation: "3x + 2y = 12\n2x - y = 1",
    answer: { x: 2, y: 3 },
    difficulty: "hard",
    type: "elimination",
    basePoints: 30,
    steps: [
      { action: "scale",      value: "4x - 2y = 2", wrong: ["4x - 2y = 1", "2x - 2y = 2", "2x - 2y = 1"], target: "both-sides", result: "3x + 2y = 12\n4x - 2y = 2" },
      { action: "combine",    value: "7x = 14", wrong: ["-x = 10", "7x = 10", "-x = 14"], target: "both-sides", result: "7x = 14" },
      { action: "divide",     value: 7, target: "both-sides", result: "x = 2\n2x - y = 1" },
      { action: "substitute", value: "x = 2, y = 3", wrong: ["x = 2, y = 1", "x = 2, y = -5", "x = 2, y = -3"], target: "both-sides", result: "x = 2, y = 3" }
    ],
    hints: {
      en: [
        "Multiply the bottom equation by 2 so it has -2y to match +2y.",
        "+2y and -2y are opposite, so add the two equations. y cancels.",
        "Divide both sides by 7.",
        "Put x = 2 into 2x - y = 1: 2 × 2 = 4, so 4 - y = 1, -y = -3 and y = 3."
      ],
      ja: [
        "下の式を2倍して -2y にし、+2y とそろえる。",
        "+2y と -2y は反対なので、2つの式を足す。yが消える。",
        "両辺を7で割る。",
        "x = 2 を 2x - y = 1 に代入：2 × 2 = 4 なので 4 - y = 1、-y = -3、y = 3。"
      ]
    },
    explanation: {
      en: "Multiplying 2x - y = 1 by 2 gives -2y, the opposite of +2y. Adding cancels y: 3x + 4x = 7x and 12 + 2 = 14, so x = 2. Then 4 - y = 1 gives y = 3.",
      ja: "2x - y = 1 を2倍すると -2y になり、+2y と反対になります。足すとyが消えて 3x + 4x = 7x、12 + 2 = 14 で x = 2。4 - y = 1 から y = 3 です。"
    }
  },
  {
    id: "system_hard_04",
    topic: "system",
    equation: "x + 3y = 11\n4x + 5y = 23",
    answer: { x: 2, y: 3 },
    difficulty: "hard",
    type: "elimination",
    basePoints: 30,
    steps: [
      { action: "scale",      value: "4x + 12y = 44", wrong: ["4x + 12y = 11", "4x + 3y = 44", "4x + 3y = 11"], target: "both-sides", result: "4x + 12y = 44\n4x + 5y = 23" },
      { action: "combine",    value: "7y = 21", wrong: ["17y = 67", "7y = 67", "17y = 21"], target: "both-sides", result: "7y = 21" },
      { action: "divide",     value: 7, target: "both-sides", result: "y = 3\nx + 3y = 11" },
      { action: "substitute", value: "x = 2, y = 3", wrong: ["x = 8, y = 3", "x = 20, y = 3", "x = -2, y = 3"], target: "both-sides", result: "x = 2, y = 3" }
    ],
    hints: {
      en: [
        "Multiply the top equation by 4 so both have 4x.",
        "+4x and +4x are the same, so subtract: top minus bottom. x cancels.",
        "Divide both sides by 7.",
        "Put y = 3 into x + 3y = 11: 3 × 3 = 9, so x + 9 = 11 and x = 2."
      ],
      ja: [
        "上の式を4倍して、どちらも4xにする。",
        "+4x と +4x は同じなので、上の式から下の式を引く。xが消える。",
        "両辺を7で割る。",
        "y = 3 を x + 3y = 11 に代入：3 × 3 = 9 なので x + 9 = 11、x = 2。"
      ]
    },
    explanation: {
      en: "Multiplying x + 3y = 11 by 4 makes 4x, matching the bottom line. Subtracting cancels x: 12y - 5y = 7y and 44 - 23 = 21, so y = 3. Then x + 9 = 11 gives x = 2.",
      ja: "x + 3y = 11 を4倍すると 4x になり、下の式とそろいます。引くとxが消えて 12y - 5y = 7y、44 - 23 = 21 で y = 3。x + 9 = 11 から x = 2 です。"
    }
  },
  {
    id: "system_hard_05",
    topic: "system",
    equation: "2x + 3y = 12\nx + 4y = 11",
    answer: { x: 3, y: 2 },
    difficulty: "hard",
    type: "elimination",
    basePoints: 30,
    steps: [
      { action: "scale",      value: "2x + 8y = 22", wrong: ["2x + 8y = 11", "2x + 4y = 22", "2x + 4y = 11"], target: "both-sides", result: "2x + 3y = 12\n2x + 8y = 22" },
      { action: "combine",    value: "-5y = -10", wrong: ["11y = 34", "-5y = 34", "11y = -10"], target: "both-sides", result: "-5y = -10" },
      { action: "divide",     value: -5, target: "both-sides", result: "y = 2\nx + 4y = 11" },
      { action: "substitute", value: "x = 3, y = 2", wrong: ["x = 9, y = 2", "x = 19, y = 2", "x = -3, y = 2"], target: "both-sides", result: "x = 3, y = 2" }
    ],
    hints: {
      en: [
        "Multiply the bottom equation by 2 so both have 2x.",
        "+2x and +2x are the same, so subtract top minus bottom: 3y - 8y = -5y and 12 - 22 = -10.",
        "Divide both sides by -5 — watch the sign!",
        "Put y = 2 into x + 4y = 11: 4 × 2 = 8, so x + 8 = 11 and x = 3."
      ],
      ja: [
        "下の式を2倍して、どちらも2xにする。",
        "+2x と +2x は同じなので、上の式から下の式を引く：3y - 8y = -5y、12 - 22 = -10。",
        "両辺を-5で割る — 符号に注意！",
        "y = 2 を x + 4y = 11 に代入：4 × 2 = 8 なので x + 8 = 11、x = 3。"
      ]
    },
    explanation: {
      en: "Multiplying x + 4y = 11 by 2 makes 2x on both lines. Top minus bottom gives 3y - 8y = -5y and 12 - 22 = -10, so y = 2. Then x + 8 = 11 gives x = 3.",
      ja: "x + 4y = 11 を2倍すると、どちらも2xになります。上の式から下の式を引くと 3y - 8y = -5y、12 - 22 = -10 で y = 2。x + 8 = 11 から x = 3 です。"
    }
  },
  {
    id: "system_hard_06",
    topic: "system",
    equation: "3x - 2y = -7\n-x + 3y = 7",
    answer: { x: -1, y: 2 },
    difficulty: "hard",
    type: "elimination",
    basePoints: 30,
    steps: [
      { action: "scale",      value: "-3x + 9y = 21", wrong: ["-3x + 9y = 7", "-3x + 3y = 21", "-3x + 3y = 7"], target: "both-sides", result: "3x - 2y = -7\n-3x + 9y = 21" },
      { action: "combine",    value: "7y = 14", wrong: ["-11y = -28", "7y = -28", "-11y = 14"], target: "both-sides", result: "7y = 14" },
      { action: "divide",     value: 7, target: "both-sides", result: "y = 2\n-x + 3y = 7" },
      { action: "substitute", value: "x = -1, y = 2", wrong: ["x = -5, y = 2", "x = -13, y = 2", "x = 1, y = 2"], target: "both-sides", result: "x = -1, y = 2" }
    ],
    hints: {
      en: [
        "Multiply the bottom equation by 3 so it has -3x to match +3x.",
        "+3x and -3x are opposite, so add the two equations. x cancels.",
        "Divide both sides by 7.",
        "Put y = 2 into -x + 3y = 7: 3 × 2 = 6, so -x + 6 = 7, -x = 1 and x = -1."
      ],
      ja: [
        "下の式を3倍して -3x にし、+3x とそろえる。",
        "+3x と -3x は反対なので、2つの式を足す。xが消える。",
        "両辺を7で割る。",
        "y = 2 を -x + 3y = 7 に代入：3 × 2 = 6 なので -x + 6 = 7、-x = 1、x = -1。"
      ]
    },
    explanation: {
      en: "Multiplying -x + 3y = 7 by 3 gives -3x, the opposite of +3x. Adding cancels x: -2y + 9y = 7y and -7 + 21 = 14, so y = 2. Then -x + 6 = 7, so -x = 1 and x = -1.",
      ja: "-x + 3y = 7 を3倍すると -3x になり、+3x と反対になります。足すとxが消えて -2y + 9y = 7y、-7 + 21 = 14 で y = 2。-x + 6 = 7 から -x = 1、x = -1 です。"
    }
  },
  {
    id: "system_hard_07",
    topic: "system",
    equation: "4x + 3y = 5\n-x + 2y = -4",
    answer: { x: 2, y: -1 },
    difficulty: "hard",
    type: "elimination",
    basePoints: 30,
    steps: [
      { action: "scale",      value: "-4x + 8y = -16", wrong: ["-4x + 8y = -4", "-4x + 2y = -16", "-4x + 2y = -4"], target: "both-sides", result: "4x + 3y = 5\n-4x + 8y = -16" },
      { action: "combine",    value: "11y = -11", wrong: ["-5y = 21", "11y = 21", "-5y = -11"], target: "both-sides", result: "11y = -11" },
      { action: "divide",     value: 11, target: "both-sides", result: "y = -1\n-x + 2y = -4" },
      { action: "substitute", value: "x = 2, y = -1", wrong: ["x = 3, y = -1", "x = 6, y = -1", "x = -2, y = -1"], target: "both-sides", result: "x = 2, y = -1" }
    ],
    hints: {
      en: [
        "Multiply the bottom equation by 4 so it has -4x to match +4x.",
        "+4x and -4x are opposite, so add the two equations. x cancels.",
        "Divide both sides by 11.",
        "Put y = -1 into -x + 2y = -4: 2 × (-1) = -2, so -x - 2 = -4, -x = -2 and x = 2."
      ],
      ja: [
        "下の式を4倍して -4x にし、+4x とそろえる。",
        "+4x と -4x は反対なので、2つの式を足す。xが消える。",
        "両辺を11で割る。",
        "y = -1 を -x + 2y = -4 に代入：2 × (-1) = -2 なので -x - 2 = -4、-x = -2、x = 2。"
      ]
    },
    explanation: {
      en: "Multiplying -x + 2y = -4 by 4 gives -4x, the opposite of +4x. Adding cancels x: 3y + 8y = 11y and 5 + (-16) = -11, so y = -1. Then -x - 2 = -4, so -x = -2 and x = 2.",
      ja: "-x + 2y = -4 を4倍すると -4x になり、+4x と反対になります。足すとxが消えて 3y + 8y = 11y、5 + (-16) = -11 で y = -1。-x - 2 = -4 から -x = -2、x = 2 です。"
    }
  },
  {
    id: "system_hard_08",
    topic: "system",
    equation: "2x - 3y = 7\n3x - y = 7",
    answer: { x: 2, y: -1 },
    difficulty: "hard",
    type: "elimination",
    basePoints: 30,
    steps: [
      { action: "scale",      value: "9x - 3y = 21", wrong: ["9x - 3y = 7", "3x - 3y = 21", "3x - 3y = 7"], target: "both-sides", result: "2x - 3y = 7\n9x - 3y = 21" },
      { action: "combine",    value: "-7x = -14", wrong: ["11x = 28", "-7x = 28", "11x = -14"], target: "both-sides", result: "-7x = -14" },
      { action: "divide",     value: -7, target: "both-sides", result: "x = 2\n3x - y = 7" },
      { action: "substitute", value: "x = 2, y = -1", wrong: ["x = 2, y = -5", "x = 2, y = -13", "x = 2, y = 1"], target: "both-sides", result: "x = 2, y = -1" }
    ],
    hints: {
      en: [
        "Multiply the bottom equation by 3 so both have -3y.",
        "-3y and -3y are the same, so subtract top minus bottom: 2x - 9x = -7x and 7 - 21 = -14.",
        "Divide both sides by -7 — watch the sign!",
        "Put x = 2 into 3x - y = 7: 3 × 2 = 6, so 6 - y = 7, -y = 1 and y = -1."
      ],
      ja: [
        "下の式を3倍して、どちらも -3y にする。",
        "-3y と -3y は同じなので、上の式から下の式を引く：2x - 9x = -7x、7 - 21 = -14。",
        "両辺を-7で割る — 符号に注意！",
        "x = 2 を 3x - y = 7 に代入：3 × 2 = 6 なので 6 - y = 7、-y = 1、y = -1。"
      ]
    },
    explanation: {
      en: "Multiplying 3x - y = 7 by 3 makes -3y on both lines. Top minus bottom gives 2x - 9x = -7x and 7 - 21 = -14, so x = 2. Then 6 - y = 7, so -y = 1 and y = -1.",
      ja: "3x - y = 7 を3倍すると、どちらも -3y になります。上の式から下の式を引くと 2x - 9x = -7x、7 - 21 = -14 で x = 2。6 - y = 7 から -y = 1、y = -1 です。"
    }
  },
  {
    id: "system_hard_09",
    topic: "system",
    equation: "x - 2y = 5\n4x - 3y = 10",
    answer: { x: 1, y: -2 },
    difficulty: "hard",
    type: "elimination",
    basePoints: 30,
    steps: [
      { action: "scale",      value: "4x - 8y = 20", wrong: ["4x - 8y = 5", "4x - 2y = 20", "4x - 2y = 5"], target: "both-sides", result: "4x - 8y = 20\n4x - 3y = 10" },
      { action: "combine",    value: "-5y = 10", wrong: ["-11y = 30", "-5y = 30", "-11y = 10"], target: "both-sides", result: "-5y = 10" },
      { action: "divide",     value: -5, target: "both-sides", result: "y = -2\nx - 2y = 5" },
      { action: "substitute", value: "x = 1, y = -2", wrong: ["x = 3, y = -2", "x = 9, y = -2", "x = -1, y = -2"], target: "both-sides", result: "x = 1, y = -2" }
    ],
    hints: {
      en: [
        "Multiply the top equation by 4 so both have 4x.",
        "+4x and +4x are the same, so subtract top minus bottom: -8y - (-3y) = -5y and 20 - 10 = 10.",
        "Divide both sides by -5 — watch the sign!",
        "Put y = -2 into x - 2y = 5: -2 × (-2) = +4, so x + 4 = 5 and x = 1."
      ],
      ja: [
        "上の式を4倍して、どちらも4xにする。",
        "+4x と +4x は同じなので、上の式から下の式を引く：-8y - (-3y) = -5y、20 - 10 = 10。",
        "両辺を-5で割る — 符号に注意！",
        "y = -2 を x - 2y = 5 に代入：-2 × (-2) = +4 なので x + 4 = 5、x = 1。"
      ]
    },
    explanation: {
      en: "Multiplying x - 2y = 5 by 4 makes 4x on both lines. Subtracting cancels x: -8y - (-3y) = -5y and 20 - 10 = 10, so y = -2. Then -2 × (-2) = +4, so x + 4 = 5 and x = 1.",
      ja: "x - 2y = 5 を4倍すると、どちらも4xになります。引くとxが消えて -8y - (-3y) = -5y、20 - 10 = 10 で y = -2。-2 × (-2) = +4 なので x + 4 = 5、x = 1 です。"
    }
  },
  {
    id: "system_hard_10",
    topic: "system",
    equation: "3x + 5y = 9\n2x + y = -1",
    answer: { x: -2, y: 3 },
    difficulty: "hard",
    type: "elimination",
    basePoints: 30,
    steps: [
      { action: "scale",      value: "10x + 5y = -5", wrong: ["10x + 5y = -1", "2x + 5y = -5", "2x + 5y = -1"], target: "both-sides", result: "3x + 5y = 9\n10x + 5y = -5" },
      { action: "combine",    value: "-7x = 14", wrong: ["13x = 4", "-7x = 4", "13x = 14"], target: "both-sides", result: "-7x = 14" },
      { action: "divide",     value: -7, target: "both-sides", result: "x = -2\n2x + y = -1" },
      { action: "substitute", value: "x = -2, y = 3", wrong: ["x = -2, y = 1", "x = -2, y = -5", "x = -2, y = -3"], target: "both-sides", result: "x = -2, y = 3" }
    ],
    hints: {
      en: [
        "Multiply the bottom equation by 5 so both have 5y.",
        "+5y and +5y are the same, so subtract top minus bottom. Careful: 9 - (-5) = 14.",
        "Divide both sides by -7 — watch the sign!",
        "Put x = -2 into 2x + y = -1: 2 × (-2) = -4, so -4 + y = -1 and y = 3."
      ],
      ja: [
        "下の式を5倍して、どちらも5yにする。",
        "+5y と +5y は同じなので、上の式から下の式を引く。注意：9 - (-5) = 14。",
        "両辺を-7で割る — 符号に注意！",
        "x = -2 を 2x + y = -1 に代入：2 × (-2) = -4 なので -4 + y = -1、y = 3。"
      ]
    },
    explanation: {
      en: "Multiplying 2x + y = -1 by 5 makes 5y on both lines. Subtracting cancels y: 3x - 10x = -7x and 9 - (-5) = 14, so x = -2. Then -4 + y = -1 gives y = 3.",
      ja: "2x + y = -1 を5倍すると、どちらも5yになります。引くとyが消えて 3x - 10x = -7x、9 - (-5) = 14 で x = -2。-4 + y = -1 から y = 3 です。"
    }
  },

  // =====================================================================
  // FRACTIONS
  // =====================================================================

  // ---- Easy: a fraction in front of x — clear the fraction first, then divide ----
  // Fractions are written inline (2x/3), which the pixel font and typewriter reveal already handle.
  {
    id: "fraction_easy_01",
    topic: "fraction",
    equation: "2x/3 = 8",
    answer: 12,
    difficulty: "easy",
    type: "fraction-coefficient",
    basePoints: 10,
    steps: [
      { action: "multiply", value: 3, target: "both-sides", result: "2x = 24" },
      { action: "divide",   value: 2, target: "both-sides", result: "x = 12" }
    ],
    hints: {
      en: [
        "Clear the fraction — multiply both sides by 3.",
        "Now divide both sides by 2 to isolate x."
      ],
      ja: [
        "分数をなくす — 両辺に3をかける。",
        "次に両辺を2で割ってxを求める。"
      ]
    },
    explanation: {
      en: "x is multiplied by 2 and divided by 3. Undo the division first: × 3 gives 2x = 24, then ÷ 2 gives x = 12.",
      ja: "xは2倍されて3で割られています。まず両辺に3をかけて割り算を打ち消すと 2x = 24、次に2で割って x = 12 です。"
    }
  },
  {
    id: "fraction_easy_02",
    topic: "fraction",
    equation: "3x/4 = 6",
    answer: 8,
    difficulty: "easy",
    type: "fraction-coefficient",
    basePoints: 10,
    steps: [
      { action: "multiply", value: 4, target: "both-sides", result: "3x = 24" },
      { action: "divide",   value: 3, target: "both-sides", result: "x = 8" }
    ],
    hints: {
      en: [
        "Clear the fraction — multiply both sides by 4.",
        "Now divide both sides by 3 to isolate x."
      ],
      ja: [
        "分数をなくす — 両辺に4をかける。",
        "次に両辺を3で割ってxを求める。"
      ]
    },
    explanation: {
      en: "Multiply both sides by 4 to clear the fraction: 3x = 24. Then divide by 3 to get x = 8.",
      ja: "両辺に4をかけて分数をなくすと 3x = 24。3で割って x = 8 です。"
    }
  },
  {
    id: "fraction_easy_03",
    topic: "fraction",
    equation: "2x/5 = 4",
    answer: 10,
    difficulty: "easy",
    type: "fraction-coefficient",
    basePoints: 10,
    steps: [
      { action: "multiply", value: 5, target: "both-sides", result: "2x = 20" },
      { action: "divide",   value: 2, target: "both-sides", result: "x = 10" }
    ],
    hints: {
      en: [
        "Clear the fraction — multiply both sides by 5.",
        "Now divide both sides by 2 to isolate x."
      ],
      ja: [
        "分数をなくす — 両辺に5をかける。",
        "次に両辺を2で割ってxを求める。"
      ]
    },
    explanation: {
      en: "Clearing the fraction first keeps the numbers whole: × 5 gives 2x = 20, then ÷ 2 gives x = 10.",
      ja: "先に分数をなくすと整数のまま計算できます。5をかけて 2x = 20、2で割って x = 10 です。"
    }
  },
  {
    id: "fraction_easy_04",
    topic: "fraction",
    equation: "5x/2 = 15",
    answer: 6,
    difficulty: "easy",
    type: "fraction-coefficient",
    basePoints: 10,
    steps: [
      { action: "multiply", value: 2, target: "both-sides", result: "5x = 30" },
      { action: "divide",   value: 5, target: "both-sides", result: "x = 6" }
    ],
    hints: {
      en: [
        "Clear the fraction — multiply both sides by 2.",
        "Now divide both sides by 5 to isolate x."
      ],
      ja: [
        "分数をなくす — 両辺に2をかける。",
        "次に両辺を5で割ってxを求める。"
      ]
    },
    explanation: {
      en: "The top number is bigger than the bottom this time, but the steps are the same: × 2 gives 5x = 30, then ÷ 5 gives x = 6.",
      ja: "今回は分子が分母より大きいですが、手順は同じです。2をかけて 5x = 30、5で割って x = 6 です。"
    }
  },
  {
    id: "fraction_easy_05",
    topic: "fraction",
    equation: "3x/2 = -9",
    answer: -6,
    difficulty: "easy",
    type: "fraction-coefficient",
    basePoints: 10,
    steps: [
      { action: "multiply", value: 2, target: "both-sides", result: "3x = -18" },
      { action: "divide",   value: 3, target: "both-sides", result: "x = -6" }
    ],
    hints: {
      en: [
        "Clear the fraction — multiply both sides by 2.",
        "Now divide both sides by 3 to isolate x."
      ],
      ja: [
        "分数をなくす — 両辺に2をかける。",
        "次に両辺を3で割ってxを求める。"
      ]
    },
    explanation: {
      en: "× 2 gives 3x = -18, then ÷ 3 gives x = -6. The right side is negative, so the answer is too.",
      ja: "2をかけて 3x = -18、3で割って x = -6 です。右辺が負の数なので、答えも負の数になります。"
    }
  },
  {
    id: "fraction_easy_06",
    topic: "fraction",
    equation: "4x/3 = 12",
    answer: 9,
    difficulty: "easy",
    type: "fraction-coefficient",
    basePoints: 10,
    steps: [
      { action: "multiply", value: 3, target: "both-sides", result: "4x = 36" },
      { action: "divide",   value: 4, target: "both-sides", result: "x = 9" }
    ],
    hints: {
      en: [
        "Clear the fraction — multiply both sides by 3.",
        "Now divide both sides by 4 to isolate x."
      ],
      ja: [
        "分数をなくす — 両辺に3をかける。",
        "次に両辺を4で割ってxを求める。"
      ]
    },
    explanation: {
      en: "Multiply both sides by 3 to get 4x = 36, then divide by 4 to get x = 9.",
      ja: "両辺に3をかけて 4x = 36、4で割って x = 9 です。"
    }
  },
  {
    id: "fraction_easy_07",
    topic: "fraction",
    equation: "2x/7 = 2",
    answer: 7,
    difficulty: "easy",
    type: "fraction-coefficient",
    basePoints: 10,
    steps: [
      { action: "multiply", value: 7, target: "both-sides", result: "2x = 14" },
      { action: "divide",   value: 2, target: "both-sides", result: "x = 7" }
    ],
    hints: {
      en: [
        "Clear the fraction — multiply both sides by 7.",
        "Now divide both sides by 2 to isolate x."
      ],
      ja: [
        "分数をなくす — 両辺に7をかける。",
        "次に両辺を2で割ってxを求める。"
      ]
    },
    explanation: {
      en: "Multiplying both sides by 7 multiplies the right side too: 2 × 7 = 14, so 2x = 14 and x = 7.",
      ja: "両辺に7をかけると右辺にもかかります：2 × 7 = 14 なので 2x = 14、x = 7 です。"
    }
  },
  {
    id: "fraction_easy_08",
    topic: "fraction",
    equation: "3x/5 = -6",
    answer: -10,
    difficulty: "easy",
    type: "fraction-coefficient",
    basePoints: 10,
    steps: [
      { action: "multiply", value: 5, target: "both-sides", result: "3x = -30" },
      { action: "divide",   value: 3, target: "both-sides", result: "x = -10" }
    ],
    hints: {
      en: [
        "Clear the fraction — multiply both sides by 5.",
        "Now divide both sides by 3 to isolate x."
      ],
      ja: [
        "分数をなくす — 両辺に5をかける。",
        "次に両辺を3で割ってxを求める。"
      ]
    },
    explanation: {
      en: "× 5 gives 3x = -30, then ÷ 3 gives x = -10.",
      ja: "5をかけて 3x = -30、3で割って x = -10 です。"
    }
  },
  {
    id: "fraction_easy_09",
    topic: "fraction",
    equation: "5x/4 = 10",
    answer: 8,
    difficulty: "easy",
    type: "fraction-coefficient",
    basePoints: 10,
    steps: [
      { action: "multiply", value: 4, target: "both-sides", result: "5x = 40" },
      { action: "divide",   value: 5, target: "both-sides", result: "x = 8" }
    ],
    hints: {
      en: [
        "Clear the fraction — multiply both sides by 4.",
        "Now divide both sides by 5 to isolate x."
      ],
      ja: [
        "分数をなくす — 両辺に4をかける。",
        "次に両辺を5で割ってxを求める。"
      ]
    },
    explanation: {
      en: "Multiply both sides by 4 to get 5x = 40, then divide by 5 to get x = 8.",
      ja: "両辺に4をかけて 5x = 40、5で割って x = 8 です。"
    }
  },
  {
    id: "fraction_easy_10",
    topic: "fraction",
    equation: "-2x/3 = 4",
    answer: -6,
    difficulty: "easy",
    type: "fraction-coefficient",
    basePoints: 10,
    steps: [
      { action: "multiply", value: 3,  target: "both-sides", result: "-2x = 12" },
      { action: "divide",   value: -2, target: "both-sides", result: "x = -6" }
    ],
    hints: {
      en: [
        "Clear the fraction — multiply both sides by 3.",
        "Now divide both sides by -2 — watch the negative sign!"
      ],
      ja: [
        "分数をなくす — 両辺に3をかける。",
        "次に両辺を-2で割る — マイナスの符号に注意！"
      ]
    },
    explanation: {
      en: "× 3 gives -2x = 12. Divide by -2, including its negative sign: x = -6.",
      ja: "3をかけて -2x = 12。マイナスも含めて-2で割ると x = -6 です。"
    }
  },

  // ---- Medium: two fractions — multiply by the LCD, then combine the x terms ----
  // Levels 4, 7 and 9: the LCD is NOT the two denominators multiplied together.
  // Levels 2 and 7: combining leaves just x, so there's no divide step.
  {
    id: "fraction_medium_01",
    topic: "fraction",
    equation: "x/2 + x/3 = 5",
    answer: 6,
    difficulty: "medium",
    type: "lcd",
    basePoints: 20,
    steps: [
      { action: "multiply", value: 6, traps: [2, 3, 5], target: "both-sides", result: "3x + 2x = 30" },
      { action: "simplify", value: "5x", wrong: ["6x", "x", "5x²"], target: "left", result: "5x = 30" },
      { action: "divide",   value: 5, target: "both-sides", result: "x = 6" }
    ],
    hints: {
      en: [
        "Clear both fractions at once — multiply both sides by 6, the smallest number 2 and 3 both go into.",
        "Combine the x terms: 3x + 2x.",
        "Now divide both sides by 5 to isolate x."
      ],
      ja: [
        "分数をまとめてなくす — 2でも3でも割り切れる一番小さい数、6を両辺にかける。",
        "xの項をまとめる：3x + 2x。",
        "次に両辺を5で割ってxを求める。"
      ]
    },
    explanation: {
      en: "6 is the smallest number both 2 and 3 go into (the LCD). × 6 turns x/2 into 3x and x/3 into 2x, and the 5 becomes 30. Then 5x = 30, so x = 6.",
      ja: "6は2でも3でも割り切れる一番小さい数（分母の最小公倍数）です。6をかけると x/2 は 3x、x/3 は 2x に、右辺の5は30になります。5x = 30 なので x = 6 です。"
    }
  },
  {
    id: "fraction_medium_02",
    topic: "fraction",
    equation: "x/2 - x/3 = 2",
    answer: 12,
    difficulty: "medium",
    type: "lcd",
    basePoints: 20,
    steps: [
      { action: "multiply", value: 6, traps: [2, 3, 5], target: "both-sides", result: "3x - 2x = 12" },
      { action: "simplify", value: "x", wrong: ["5x", "-x", "6x"], target: "left", result: "x = 12" }
    ],
    hints: {
      en: [
        "Clear both fractions at once — multiply both sides by 6, the smallest number 2 and 3 both go into.",
        "Combine the x terms: 3x - 2x."
      ],
      ja: [
        "分数をまとめてなくす — 2でも3でも割り切れる一番小さい数、6を両辺にかける。",
        "xの項をまとめる：3x - 2x。"
      ]
    },
    explanation: {
      en: "× 6 gives 3x - 2x = 12. 3x take away 2x leaves just x, so x = 12 — no dividing needed.",
      ja: "6をかけると 3x - 2x = 12。3xから2xを引くとxだけが残るので x = 12 です。割る必要はありません。"
    }
  },
  {
    id: "fraction_medium_03",
    topic: "fraction",
    equation: "x/3 + x/4 = 7",
    answer: 12,
    difficulty: "medium",
    type: "lcd",
    basePoints: 20,
    steps: [
      { action: "multiply", value: 12, traps: [3, 4, 7], target: "both-sides", result: "4x + 3x = 84" },
      { action: "simplify", value: "7x", wrong: ["12x", "x", "7x²"], target: "left", result: "7x = 84" },
      { action: "divide",   value: 7, target: "both-sides", result: "x = 12" }
    ],
    hints: {
      en: [
        "Clear both fractions at once — multiply both sides by 12, the smallest number 3 and 4 both go into.",
        "Combine the x terms: 4x + 3x.",
        "Now divide both sides by 7 to isolate x."
      ],
      ja: [
        "分数をまとめてなくす — 3でも4でも割り切れる一番小さい数、12を両辺にかける。",
        "xの項をまとめる：4x + 3x。",
        "次に両辺を7で割ってxを求める。"
      ]
    },
    explanation: {
      en: "The LCD of 3 and 4 is 12. × 12 gives 4x + 3x = 84, so 7x = 84 and x = 12.",
      ja: "3と4の最小公倍数は12です。12をかけると 4x + 3x = 84、7x = 84 なので x = 12 です。"
    }
  },
  {
    id: "fraction_medium_04",
    topic: "fraction",
    equation: "x/2 + x/4 = 3",
    answer: 4,
    difficulty: "medium",
    type: "lcd",
    basePoints: 20,
    steps: [
      { action: "multiply", value: 4, traps: [2, 3, 6], target: "both-sides", result: "2x + x = 12" },
      { action: "simplify", value: "3x", wrong: ["2x", "x", "3x²"], target: "left", result: "3x = 12" },
      { action: "divide",   value: 3, target: "both-sides", result: "x = 4" }
    ],
    hints: {
      en: [
        "Clear both fractions at once — multiply both sides by 4. 2 goes into 4 too!",
        "Combine the x terms: 2x + x. Remember x is 1x.",
        "Now divide both sides by 3 to isolate x."
      ],
      ja: [
        "分数をまとめてなくす — 両辺に4をかける。4は2でも割り切れるよ！",
        "xの項をまとめる：2x + x。xは1xと同じ。",
        "次に両辺を3で割ってxを求める。"
      ]
    },
    explanation: {
      en: "4 already goes into 4, and 2 goes into 4 too, so the LCD is 4, not 8. × 4 gives 2x + x = 12 — x counts as 1x — so 3x = 12 and x = 4.",
      ja: "4は2でも4でも割り切れるので、最小公倍数は8ではなく4です。4をかけると 2x + x = 12。xは1xなので 3x = 12、x = 4 です。"
    }
  },
  {
    id: "fraction_medium_05",
    topic: "fraction",
    equation: "x/3 - x/5 = 2",
    answer: 15,
    difficulty: "medium",
    type: "lcd",
    basePoints: 20,
    steps: [
      { action: "multiply", value: 15, traps: [3, 5, 8], target: "both-sides", result: "5x - 3x = 30" },
      { action: "simplify", value: "2x", wrong: ["8x", "-2x", "15x"], target: "left", result: "2x = 30" },
      { action: "divide",   value: 2, target: "both-sides", result: "x = 15" }
    ],
    hints: {
      en: [
        "Clear both fractions at once — multiply both sides by 15, the smallest number 3 and 5 both go into.",
        "Combine the x terms: 5x - 3x.",
        "Now divide both sides by 2 to isolate x."
      ],
      ja: [
        "分数をまとめてなくす — 3でも5でも割り切れる一番小さい数、15を両辺にかける。",
        "xの項をまとめる：5x - 3x。",
        "次に両辺を2で割ってxを求める。"
      ]
    },
    explanation: {
      en: "The LCD of 3 and 5 is 15. × 15 gives 5x - 3x = 30, so 2x = 30 and x = 15.",
      ja: "3と5の最小公倍数は15です。15をかけると 5x - 3x = 30、2x = 30 なので x = 15 です。"
    }
  },
  {
    id: "fraction_medium_06",
    topic: "fraction",
    equation: "x/2 + x/5 = 7",
    answer: 10,
    difficulty: "medium",
    type: "lcd",
    basePoints: 20,
    steps: [
      { action: "multiply", value: 10, traps: [2, 5, 7], target: "both-sides", result: "5x + 2x = 70" },
      { action: "simplify", value: "7x", wrong: ["10x", "3x", "7x²"], target: "left", result: "7x = 70" },
      { action: "divide",   value: 7, target: "both-sides", result: "x = 10" }
    ],
    hints: {
      en: [
        "Clear both fractions at once — multiply both sides by 10, the smallest number 2 and 5 both go into.",
        "Combine the x terms: 5x + 2x.",
        "Now divide both sides by 7 to isolate x."
      ],
      ja: [
        "分数をまとめてなくす — 2でも5でも割り切れる一番小さい数、10を両辺にかける。",
        "xの項をまとめる：5x + 2x。",
        "次に両辺を7で割ってxを求める。"
      ]
    },
    explanation: {
      en: "The LCD of 2 and 5 is 10. × 10 gives 5x + 2x = 70, so 7x = 70 and x = 10.",
      ja: "2と5の最小公倍数は10です。10をかけると 5x + 2x = 70、7x = 70 なので x = 10 です。"
    }
  },
  {
    id: "fraction_medium_07",
    topic: "fraction",
    equation: "x/4 - x/6 = 1",
    answer: 12,
    difficulty: "medium",
    type: "lcd",
    basePoints: 20,
    steps: [
      { action: "multiply", value: 12, traps: [4, 6, 10], target: "both-sides", result: "3x - 2x = 12" },
      { action: "simplify", value: "x", wrong: ["5x", "-x", "6x"], target: "left", result: "x = 12" }
    ],
    hints: {
      en: [
        "Clear both fractions at once — multiply both sides by 12, the smallest number 4 and 6 both go into.",
        "Combine the x terms: 3x - 2x."
      ],
      ja: [
        "分数をまとめてなくす — 4でも6でも割り切れる一番小さい数、12を両辺にかける。",
        "xの項をまとめる：3x - 2x。"
      ]
    },
    explanation: {
      en: "4 × 6 = 24 would work too, but the LCD is 12 — the smallest number both 4 and 6 go into — and it keeps the numbers small. × 12 gives 3x - 2x = 12, so x = 12.",
      ja: "4 × 6 = 24 でも解けますが、最小公倍数は12です。小さい数の方が計算が楽になります。12をかけると 3x - 2x = 12 なので x = 12 です。"
    }
  },
  {
    id: "fraction_medium_08",
    topic: "fraction",
    equation: "x/2 + x/3 = -10",
    answer: -12,
    difficulty: "medium",
    type: "lcd",
    basePoints: 20,
    steps: [
      { action: "multiply", value: 6, traps: [2, 3, 5], target: "both-sides", result: "3x + 2x = -60" },
      { action: "simplify", value: "5x", wrong: ["6x", "x", "5x²"], target: "left", result: "5x = -60" },
      { action: "divide",   value: 5, target: "both-sides", result: "x = -12" }
    ],
    hints: {
      en: [
        "Clear both fractions at once — multiply both sides by 6, the smallest number 2 and 3 both go into.",
        "Combine the x terms: 3x + 2x.",
        "Now divide both sides by 5 to isolate x."
      ],
      ja: [
        "分数をまとめてなくす — 2でも3でも割り切れる一番小さい数、6を両辺にかける。",
        "xの項をまとめる：3x + 2x。",
        "次に両辺を5で割ってxを求める。"
      ]
    },
    explanation: {
      en: "× 6 multiplies the right side too: -10 × 6 = -60. Then 3x + 2x = 5x, so 5x = -60 and x = -12.",
      ja: "6をかけると右辺にもかかります：-10 × 6 = -60。3x + 2x = 5x なので 5x = -60、x = -12 です。"
    }
  },
  {
    id: "fraction_medium_09",
    topic: "fraction",
    equation: "x/3 + x/6 = 4",
    answer: 8,
    difficulty: "medium",
    type: "lcd",
    basePoints: 20,
    steps: [
      { action: "multiply", value: 6, traps: [2, 3, 9], target: "both-sides", result: "2x + x = 24" },
      { action: "simplify", value: "3x", wrong: ["2x", "x", "3x²"], target: "left", result: "3x = 24" },
      { action: "divide",   value: 3, target: "both-sides", result: "x = 8" }
    ],
    hints: {
      en: [
        "Clear both fractions at once — multiply both sides by 6. 3 goes into 6 too!",
        "Combine the x terms: 2x + x. Remember x is 1x.",
        "Now divide both sides by 3 to isolate x."
      ],
      ja: [
        "分数をまとめてなくす — 両辺に6をかける。6は3でも割り切れるよ！",
        "xの項をまとめる：2x + x。xは1xと同じ。",
        "次に両辺を3で割ってxを求める。"
      ]
    },
    explanation: {
      en: "6 is already a multiple of 3, so the LCD is 6, not 18. × 6 gives 2x + x = 24, so 3x = 24 and x = 8.",
      ja: "6は3の倍数なので、最小公倍数は18ではなく6です。6をかけると 2x + x = 24、3x = 24 なので x = 8 です。"
    }
  },
  {
    id: "fraction_medium_10",
    topic: "fraction",
    equation: "2x/3 - x/4 = 5",
    answer: 12,
    difficulty: "medium",
    type: "lcd",
    basePoints: 20,
    steps: [
      { action: "multiply", value: 12, traps: [3, 4, 7], target: "both-sides", result: "8x - 3x = 60" },
      { action: "simplify", value: "5x", wrong: ["11x", "-5x", "24x"], target: "left", result: "5x = 60" },
      { action: "divide",   value: 5, target: "both-sides", result: "x = 12" }
    ],
    hints: {
      en: [
        "Clear both fractions at once — multiply both sides by 12, the smallest number 3 and 4 both go into.",
        "Combine the x terms: 8x - 3x.",
        "Now divide both sides by 5 to isolate x."
      ],
      ja: [
        "分数をまとめてなくす — 3でも4でも割り切れる一番小さい数、12を両辺にかける。",
        "xの項をまとめる：8x - 3x。",
        "次に両辺を5で割ってxを求める。"
      ]
    },
    explanation: {
      en: "× 12 turns 2x/3 into 8x (12 ÷ 3 = 4, and 4 × 2x = 8x) and x/4 into 3x. Then 8x - 3x = 5x, so 5x = 60 and x = 12.",
      ja: "12をかけると、2x/3 は 8x（12 ÷ 3 = 4、4 × 2x = 8x）、x/4 は 3x になります。8x - 3x = 5x なので 5x = 60、x = 12 です。"
    }
  },

  // ---- Hard: fractions on both sides ----
  // Levels 1-5: plain numbers too — multiply EVERY term by the LCD.
  // Levels 6-10: a bracket on top — keep the brackets after × LCD, then expand (both sides in 6-8 and 10).
  // The bigger x term always lands on the left, so x ends up positive without a ÷ (-1) step.
  {
    id: "fraction_hard_01",
    topic: "fraction",
    equation: "x/2 + 1 = x/3 + 3",
    answer: 12,
    difficulty: "hard",
    type: "lcd-both-sides",
    basePoints: 30,
    steps: [
      { action: "multiply",   value: 6, traps: [2, 3, 5], target: "both-sides", result: "3x + 6 = 2x + 18" },
      { action: "subtract_x", value: 2, target: "both-sides", result: "x + 6 = 18" },
      { action: "subtract",   value: 6, target: "both-sides", result: "x = 12" }
    ],
    hints: {
      en: [
        "Clear the fractions — multiply every term by 6, the plain numbers too.",
        "Combine the x terms — subtract 2x from both sides.",
        "Now remove the constant — subtract 6 from both sides."
      ],
      ja: [
        "分数をなくす — すべての項に6をかける。ただの数にもかける。",
        "xの項をまとめる — 両辺から2xを引く。",
        "次に定数項を消す — 両辺から6を引く。"
      ]
    },
    explanation: {
      en: "× 6 turns every term into a whole number: x/2 → 3x, 1 → 6, x/3 → 2x and 3 → 18. Don't forget the plain numbers! Then subtract 2x and 6 to get x = 12.",
      ja: "6をかけるとすべての項が整数になります：x/2 → 3x、1 → 6、x/3 → 2x、3 → 18。ただの数にもかけ忘れないように！その後2xと6を引いて x = 12 です。"
    }
  },
  {
    id: "fraction_hard_02",
    topic: "fraction",
    equation: "x/3 - 2 = x/4",
    answer: 24,
    difficulty: "hard",
    type: "lcd-both-sides",
    basePoints: 30,
    steps: [
      { action: "multiply",   value: 12, traps: [3, 4, 7], target: "both-sides", result: "4x - 24 = 3x" },
      { action: "subtract_x", value: 3,  target: "both-sides", result: "x - 24 = 0" },
      { action: "add",        value: 24, target: "both-sides", result: "x = 24" }
    ],
    hints: {
      en: [
        "Clear the fractions — multiply every term by 12, the plain numbers too.",
        "Combine the x terms — subtract 3x from both sides.",
        "Now remove the constant — add 24 to both sides."
      ],
      ja: [
        "分数をなくす — すべての項に12をかける。ただの数にもかける。",
        "xの項をまとめる — 両辺から3xを引く。",
        "次に定数項を消す — 両辺に24を足す。"
      ]
    },
    explanation: {
      en: "× 12 gives 4x - 24 = 3x — the -2 becomes -24 too. Subtract 3x to get x - 24 = 0, then add 24: x = 24.",
      ja: "12をかけると 4x - 24 = 3x。-2も-24になります。3xを引くと x - 24 = 0、24を足して x = 24 です。"
    }
  },
  {
    id: "fraction_hard_03",
    topic: "fraction",
    equation: "x/2 + 3 = x/5 + 6",
    answer: 10,
    difficulty: "hard",
    type: "lcd-both-sides",
    basePoints: 30,
    steps: [
      { action: "multiply",   value: 10, traps: [2, 5, 7], target: "both-sides", result: "5x + 30 = 2x + 60" },
      { action: "subtract_x", value: 2,  target: "both-sides", result: "3x + 30 = 60" },
      { action: "subtract",   value: 30, target: "both-sides", result: "3x = 30" },
      { action: "divide",     value: 3,  target: "both-sides", result: "x = 10" }
    ],
    hints: {
      en: [
        "Clear the fractions — multiply every term by 10, the plain numbers too.",
        "Combine the x terms — subtract 2x from both sides.",
        "Now remove the constant — subtract 30 from both sides.",
        "Finally divide both sides by 3 to isolate x."
      ],
      ja: [
        "分数をなくす — すべての項に10をかける。ただの数にもかける。",
        "xの項をまとめる — 両辺から2xを引く。",
        "次に定数項を消す — 両辺から30を引く。",
        "最後に両辺を3で割ってxを求める。"
      ]
    },
    explanation: {
      en: "× 10 gives 5x + 30 = 2x + 60. Subtract 2x, subtract 30, then divide by 3: x = 10.",
      ja: "10をかけると 5x + 30 = 2x + 60。2xを引き、30を引いて、3で割ると x = 10 です。"
    }
  },
  {
    id: "fraction_hard_04",
    topic: "fraction",
    equation: "x/4 - 1 = x/6 + 1",
    answer: 24,
    difficulty: "hard",
    type: "lcd-both-sides",
    basePoints: 30,
    steps: [
      { action: "multiply",   value: 12, traps: [4, 6, 10], target: "both-sides", result: "3x - 12 = 2x + 12" },
      { action: "subtract_x", value: 2,  target: "both-sides", result: "x - 12 = 12" },
      { action: "add",        value: 12, target: "both-sides", result: "x = 24" }
    ],
    hints: {
      en: [
        "Clear the fractions — multiply every term by 12, the smallest number 4 and 6 both go into.",
        "Combine the x terms — subtract 2x from both sides.",
        "Now remove the constant — add 12 to both sides."
      ],
      ja: [
        "分数をなくす — 4でも6でも割り切れる一番小さい数、12をすべての項にかける。",
        "xの項をまとめる — 両辺から2xを引く。",
        "次に定数項を消す — 両辺に12を足す。"
      ]
    },
    explanation: {
      en: "The LCD of 4 and 6 is 12, not 24. × 12 gives 3x - 12 = 2x + 12. Subtract 2x, then add 12: x = 24.",
      ja: "4と6の最小公倍数は24ではなく12です。12をかけると 3x - 12 = 2x + 12。2xを引いて12を足すと x = 24 です。"
    }
  },
  {
    id: "fraction_hard_05",
    topic: "fraction",
    equation: "x/2 + 5 = x/3 + 2",
    answer: -18,
    difficulty: "hard",
    type: "lcd-both-sides",
    basePoints: 30,
    steps: [
      { action: "multiply",   value: 6,  traps: [2, 3, 5], target: "both-sides", result: "3x + 30 = 2x + 12" },
      { action: "subtract_x", value: 2,  target: "both-sides", result: "x + 30 = 12" },
      { action: "subtract",   value: 30, target: "both-sides", result: "x = -18" }
    ],
    hints: {
      en: [
        "Clear the fractions — multiply every term by 6, the plain numbers too.",
        "Combine the x terms — subtract 2x from both sides.",
        "Now remove the constant — subtract 30 from both sides."
      ],
      ja: [
        "分数をなくす — すべての項に6をかける。ただの数にもかける。",
        "xの項をまとめる — 両辺から2xを引く。",
        "次に定数項を消す — 両辺から30を引く。"
      ]
    },
    explanation: {
      en: "× 6 gives 3x + 30 = 2x + 12. Subtract 2x to get x + 30 = 12, then subtract 30: x = -18.",
      ja: "6をかけると 3x + 30 = 2x + 12。2xを引くと x + 30 = 12、30を引いて x = -18 です。"
    }
  },
  {
    id: "fraction_hard_06",
    topic: "fraction",
    equation: "(x + 1)/2 = (x - 2)/3",
    answer: -7,
    difficulty: "hard",
    type: "lcd-brackets",
    basePoints: 30,
    steps: [
      { action: "multiply",   value: 6, traps: [2, 3, 5], target: "both-sides", result: "3(x + 1) = 2(x - 2)" },
      { action: "expand",     value: "3x + 3", wrong: ["3x + 1", "x + 3", "3x + 4"], target: "left", result: "3x + 3 = 2(x - 2)" },
      { action: "expand",     value: "2x - 4", wrong: ["2x - 2", "2x + 4", "x - 4"], target: "right", result: "3x + 3 = 2x - 4" },
      { action: "subtract_x", value: 2, target: "both-sides", result: "x + 3 = -4" },
      { action: "subtract",   value: 3, target: "both-sides", result: "x = -7" }
    ],
    hints: {
      en: [
        "Clear the fractions — multiply both sides by 6. Keep the brackets: 6 × (x + 1)/2 = 3(x + 1).",
        "Expand the left side: 3 × x and 3 × 1.",
        "Expand the right side: 2 × x and 2 × (-2).",
        "Combine the x terms — subtract 2x from both sides.",
        "Now remove the constant — subtract 3 from both sides."
      ],
      ja: [
        "分数をなくす — 両辺に6をかける。かっこは残す：6 × (x + 1)/2 = 3(x + 1)。",
        "左辺を展開する：3 × x と 3 × 1。",
        "右辺を展開する：2 × x と 2 ×（-2）。",
        "xの項をまとめる — 両辺から2xを引く。",
        "次に定数項を消す — 両辺から3を引く。"
      ]
    },
    explanation: {
      en: "× 6 cancels both bottoms: 6 ÷ 2 = 3 goes in front of (x + 1), and 6 ÷ 3 = 2 in front of (x - 2). The whole top gets multiplied, so keep the brackets, then expand: 3x + 3 = 2x - 4, so x = -7.",
      ja: "6をかけると両方の分母が消えます：6 ÷ 2 = 3 が (x + 1) の前に、6 ÷ 3 = 2 が (x - 2) の前につきます。分子全体にかかるのでかっこは残し、展開すると 3x + 3 = 2x - 4、x = -7 です。"
    }
  },
  {
    id: "fraction_hard_07",
    topic: "fraction",
    equation: "(x + 2)/2 = (x + 4)/3",
    answer: 2,
    difficulty: "hard",
    type: "lcd-brackets",
    basePoints: 30,
    steps: [
      { action: "multiply",   value: 6, traps: [2, 3, 5], target: "both-sides", result: "3(x + 2) = 2(x + 4)" },
      { action: "expand",     value: "3x + 6", wrong: ["3x + 2", "x + 6", "3x + 5"], target: "left", result: "3x + 6 = 2(x + 4)" },
      { action: "expand",     value: "2x + 8", wrong: ["2x + 4", "x + 8", "2x + 6"], target: "right", result: "3x + 6 = 2x + 8" },
      { action: "subtract_x", value: 2, target: "both-sides", result: "x + 6 = 8" },
      { action: "subtract",   value: 6, target: "both-sides", result: "x = 2" }
    ],
    hints: {
      en: [
        "Clear the fractions — multiply both sides by 6. Keep the brackets.",
        "Expand the left side: 3 × x and 3 × 2.",
        "Expand the right side: 2 × x and 2 × 4.",
        "Combine the x terms — subtract 2x from both sides.",
        "Now remove the constant — subtract 6 from both sides."
      ],
      ja: [
        "分数をなくす — 両辺に6をかける。かっこは残す。",
        "左辺を展開する：3 × x と 3 × 2。",
        "右辺を展開する：2 × x と 2 × 4。",
        "xの項をまとめる — 両辺から2xを引く。",
        "次に定数項を消す — 両辺から6を引く。"
      ]
    },
    explanation: {
      en: "× 6 gives 3(x + 2) = 2(x + 4). Expanding gives 3x + 6 = 2x + 8, then subtract 2x and 6: x = 2.",
      ja: "6をかけると 3(x + 2) = 2(x + 4)。展開すると 3x + 6 = 2x + 8、2xと6を引いて x = 2 です。"
    }
  },
  {
    id: "fraction_hard_08",
    topic: "fraction",
    equation: "(x - 1)/3 = (x + 1)/4",
    answer: 7,
    difficulty: "hard",
    type: "lcd-brackets",
    basePoints: 30,
    steps: [
      { action: "multiply",   value: 12, traps: [3, 4, 7], target: "both-sides", result: "4(x - 1) = 3(x + 1)" },
      { action: "expand",     value: "4x - 4", wrong: ["4x - 1", "4x + 4", "x - 4"], target: "left", result: "4x - 4 = 3(x + 1)" },
      { action: "expand",     value: "3x + 3", wrong: ["3x + 1", "x + 3", "3x + 4"], target: "right", result: "4x - 4 = 3x + 3" },
      { action: "subtract_x", value: 3, target: "both-sides", result: "x - 4 = 3" },
      { action: "add",        value: 4, target: "both-sides", result: "x = 7" }
    ],
    hints: {
      en: [
        "Clear the fractions — multiply both sides by 12. Keep the brackets.",
        "Expand the left side: 4 × x and 4 × (-1).",
        "Expand the right side: 3 × x and 3 × 1.",
        "Combine the x terms — subtract 3x from both sides.",
        "Now remove the constant — add 4 to both sides."
      ],
      ja: [
        "分数をなくす — 両辺に12をかける。かっこは残す。",
        "左辺を展開する：4 × x と 4 ×（-1）。",
        "右辺を展開する：3 × x と 3 × 1。",
        "xの項をまとめる — 両辺から3xを引く。",
        "次に定数項を消す — 両辺に4を足す。"
      ]
    },
    explanation: {
      en: "× 12 gives 4(x - 1) = 3(x + 1). Expanding gives 4x - 4 = 3x + 3, then subtract 3x and add 4: x = 7.",
      ja: "12をかけると 4(x - 1) = 3(x + 1)。展開すると 4x - 4 = 3x + 3、3xを引いて4を足すと x = 7 です。"
    }
  },
  {
    id: "fraction_hard_09",
    topic: "fraction",
    equation: "(x + 3)/2 = (x + 1)/4",
    answer: -5,
    difficulty: "hard",
    type: "lcd-brackets",
    basePoints: 30,
    steps: [
      { action: "multiply",   value: 4, traps: [2, 3, 6], target: "both-sides", result: "2(x + 3) = x + 1" },
      { action: "expand",     value: "2x + 6", wrong: ["2x + 3", "x + 6", "2x + 5"], target: "left", result: "2x + 6 = x + 1" },
      { action: "subtract_x", value: 1, target: "both-sides", result: "x + 6 = 1" },
      { action: "subtract",   value: 6, target: "both-sides", result: "x = -5" }
    ],
    hints: {
      en: [
        "Clear the fractions — multiply both sides by 4. 2 goes into 4 too!",
        "Expand the left side: 2 × x and 2 × 3.",
        "Combine the x terms — subtract x from both sides.",
        "Now remove the constant — subtract 6 from both sides."
      ],
      ja: [
        "分数をなくす — 両辺に4をかける。4は2でも割り切れるよ！",
        "左辺を展開する：2 × x と 2 × 3。",
        "xの項をまとめる — 両辺からxを引く。",
        "次に定数項を消す — 両辺から6を引く。"
      ]
    },
    explanation: {
      en: "The LCD of 2 and 4 is 4. × 4 gives 2(x + 3) on the left, and on the right 4 ÷ 4 = 1, so it just becomes x + 1. Then 2x + 6 = x + 1, so x = -5.",
      ja: "2と4の最小公倍数は4です。4をかけると左辺は 2(x + 3)、右辺は 4 ÷ 4 = 1 なので x + 1 のままです。2x + 6 = x + 1 から x = -5 です。"
    }
  },
  {
    id: "fraction_hard_10",
    topic: "fraction",
    equation: "(2x - 1)/3 = (x + 3)/2",
    answer: 11,
    difficulty: "hard",
    type: "lcd-brackets",
    basePoints: 30,
    steps: [
      { action: "multiply",   value: 6, traps: [2, 3, 5], target: "both-sides", result: "2(2x - 1) = 3(x + 3)" },
      { action: "expand",     value: "4x - 2", wrong: ["4x - 1", "2x - 2", "4x + 2"], target: "left", result: "4x - 2 = 3(x + 3)" },
      { action: "expand",     value: "3x + 9", wrong: ["3x + 3", "x + 9", "3x + 6"], target: "right", result: "4x - 2 = 3x + 9" },
      { action: "subtract_x", value: 3, target: "both-sides", result: "x - 2 = 9" },
      { action: "add",        value: 2, target: "both-sides", result: "x = 11" }
    ],
    hints: {
      en: [
        "Clear the fractions — multiply both sides by 6. Keep the brackets.",
        "Expand the left side: 2 × 2x and 2 × (-1).",
        "Expand the right side: 3 × x and 3 × 3.",
        "Combine the x terms — subtract 3x from both sides.",
        "Now remove the constant — add 2 to both sides."
      ],
      ja: [
        "分数をなくす — 両辺に6をかける。かっこは残す。",
        "左辺を展開する：2 × 2x と 2 ×（-1）。",
        "右辺を展開する：3 × x と 3 × 3。",
        "xの項をまとめる — 両辺から3xを引く。",
        "次に定数項を消す — 両辺に2を足す。"
      ]
    },
    explanation: {
      en: "× 6 gives 2(2x - 1) = 3(x + 3). Careful when expanding: 2 × 2x = 4x. Then 4x - 2 = 3x + 9, so x = 11.",
      ja: "6をかけると 2(2x - 1) = 3(x + 3)。展開に注意：2 × 2x = 4x。4x - 2 = 3x + 9 なので x = 11 です。"
    }
  },

  // =====================================================================
  // CHANGING THE SUBJECT (topic "subject", shown as "Formulas")
  // =====================================================================

  // ---- Easy: y and numbers only, always make x the subject ----
  // Same moves as Equations, but y stays on the other side instead of a number.
  // Levels 1-5 are one step; 6-10 are two steps (undo + or − first, then × or ÷).
  {
    id: "subject_easy_01",
    topic: "subject",
    subject: "x",
    equation: "y = x + 5",
    answer: "x = y - 5",
    difficulty: "easy",
    type: "one-step",
    basePoints: 10,
    steps: [
      { action: "subtract", value: 5, target: "both-sides", result: "x = y - 5" }
    ],
    hints: {
      en: ["Get x on its own — subtract 5 from both sides."],
      ja: ["xだけにする — 両辺から5を引く。"]
    },
    explanation: {
      en: "Changing the subject works like solving an equation: undo what's done to x. Subtracting 5 from both sides gives y - 5 = x, so x = y - 5.",
      ja: "等式の変形も方程式と同じで、xにされていることを打ち消します。両辺から5を引くと y - 5 = x なので、x = y - 5 です。"
    }
  },
  {
    id: "subject_easy_02",
    topic: "subject",
    subject: "x",
    equation: "y = x - 3",
    answer: "x = y + 3",
    difficulty: "easy",
    type: "one-step",
    basePoints: 10,
    steps: [
      { action: "add", value: 3, target: "both-sides", result: "x = y + 3" }
    ],
    hints: {
      en: ["Get x on its own — add 3 to both sides."],
      ja: ["xだけにする — 両辺に3を足す。"]
    },
    explanation: {
      en: "3 is taken away from x, so add 3 to both sides: y + 3 = x, so x = y + 3.",
      ja: "xから3が引かれているので、両辺に3を足します。y + 3 = x なので、x = y + 3 です。"
    }
  },
  {
    id: "subject_easy_03",
    topic: "subject",
    subject: "x",
    equation: "y = 4x",
    answer: "x = y/4",
    difficulty: "easy",
    type: "one-step",
    basePoints: 10,
    steps: [
      { action: "divide", value: 4, target: "both-sides", result: "x = y/4" }
    ],
    hints: {
      en: ["Get x on its own — divide both sides by 4."],
      ja: ["xだけにする — 両辺を4で割る。"]
    },
    explanation: {
      en: "x is multiplied by 4, so divide both sides by 4. The y side can't be worked out as a number, so it stays as y/4.",
      ja: "xに4がかけられているので、両辺を4で割ります。yの側は数にできないので、y/4 のまま残します。"
    }
  },
  {
    id: "subject_easy_04",
    topic: "subject",
    subject: "x",
    equation: "y = x/2",
    answer: "x = 2y",
    difficulty: "easy",
    type: "one-step",
    basePoints: 10,
    steps: [
      { action: "multiply", value: 2, target: "both-sides", result: "x = 2y" }
    ],
    hints: {
      en: ["Get x on its own — multiply both sides by 2."],
      ja: ["xだけにする — 両辺に2をかける。"]
    },
    explanation: {
      en: "x is divided by 2, so multiply both sides by 2: 2y = x, so x = 2y.",
      ja: "xが2で割られているので、両辺に2をかけます。2y = x なので、x = 2y です。"
    }
  },
  {
    id: "subject_easy_05",
    topic: "subject",
    subject: "x",
    equation: "y = -2x",
    answer: "x = -y/2",
    difficulty: "easy",
    type: "one-step",
    basePoints: 10,
    steps: [
      { action: "divide", value: -2, target: "both-sides", result: "x = -y/2" }
    ],
    hints: {
      en: ["Get x on its own — divide both sides by -2. Watch the negative sign!"],
      ja: ["xだけにする — 両辺を-2で割る。マイナスの符号に注意！"]
    },
    explanation: {
      en: "x is multiplied by -2, so divide by -2, including the minus. y ÷ (-2) is written -y/2.",
      ja: "xに-2がかけられているので、マイナスも含めて-2で割ります。y ÷ (-2) は -y/2 と書きます。"
    }
  },
  {
    id: "subject_easy_06",
    topic: "subject",
    subject: "x",
    equation: "y = 2x + 1",
    answer: "x = (y - 1)/2",
    difficulty: "easy",
    type: "two-step",
    basePoints: 10,
    steps: [
      { action: "subtract", value: 1, target: "both-sides", result: "y - 1 = 2x" },
      { action: "divide",   value: 2, target: "both-sides", result: "x = (y - 1)/2" }
    ],
    hints: {
      en: [
        "Undo the + 1 first — subtract 1 from both sides.",
        "Now divide both sides by 2. All of y - 1 is divided, so keep it in brackets."
      ],
      ja: [
        "まず + 1 を消す — 両辺から1を引く。",
        "次に両辺を2で割る。y - 1 全体を割るので、かっこでまとめる。"
      ]
    },
    explanation: {
      en: "Undo the + 1, then the × 2, just like 2x + 1 = 7. Dividing y - 1 by 2 divides all of it, so it's written (y - 1)/2, not y - 1/2.",
      ja: "2x + 1 = 7 を解くときと同じく、+ 1 を消してから × 2 を消します。y - 1 全体を2で割るので、y - 1/2 ではなく (y - 1)/2 と書きます。"
    }
  },
  {
    id: "subject_easy_07",
    topic: "subject",
    subject: "x",
    equation: "y = 3x - 4",
    answer: "x = (y + 4)/3",
    difficulty: "easy",
    type: "two-step",
    basePoints: 10,
    steps: [
      { action: "add",    value: 4, target: "both-sides", result: "y + 4 = 3x" },
      { action: "divide", value: 3, target: "both-sides", result: "x = (y + 4)/3" }
    ],
    hints: {
      en: [
        "Undo the - 4 first — add 4 to both sides.",
        "Now divide both sides by 3. All of y + 4 is divided, so keep it in brackets."
      ],
      ja: [
        "まず - 4 を消す — 両辺に4を足す。",
        "次に両辺を3で割る。y + 4 全体を割るので、かっこでまとめる。"
      ]
    },
    explanation: {
      en: "Adding 4 gives y + 4 = 3x. Then divide both sides by 3: the whole of y + 4 is divided, so x = (y + 4)/3.",
      ja: "4を足すと y + 4 = 3x。両辺を3で割ると y + 4 全体が割られるので、x = (y + 4)/3 です。"
    }
  },
  {
    id: "subject_easy_08",
    topic: "subject",
    subject: "x",
    equation: "y = x/3 + 2",
    answer: "x = 3(y - 2)",
    difficulty: "easy",
    type: "two-step",
    basePoints: 10,
    steps: [
      { action: "subtract", value: 2, target: "both-sides", result: "y - 2 = x/3" },
      { action: "multiply", value: 3, target: "both-sides", result: "x = 3(y - 2)" }
    ],
    hints: {
      en: [
        "Undo the + 2 first — subtract 2 from both sides.",
        "Now multiply both sides by 3. All of y - 2 is multiplied, so keep it in brackets."
      ],
      ja: [
        "まず + 2 を消す — 両辺から2を引く。",
        "次に両辺に3をかける。y - 2 全体にかけるので、かっこでまとめる。"
      ]
    },
    explanation: {
      en: "Subtracting 2 gives y - 2 = x/3. Multiplying by 3 multiplies all of y - 2, so x = 3(y - 2).",
      ja: "2を引くと y - 2 = x/3。3をかけると y - 2 全体にかかるので、x = 3(y - 2) です。"
    }
  },
  {
    id: "subject_easy_09",
    topic: "subject",
    subject: "x",
    equation: "y = x/4 - 1",
    answer: "x = 4(y + 1)",
    difficulty: "easy",
    type: "two-step",
    basePoints: 10,
    steps: [
      { action: "add",      value: 1, target: "both-sides", result: "y + 1 = x/4" },
      { action: "multiply", value: 4, target: "both-sides", result: "x = 4(y + 1)" }
    ],
    hints: {
      en: [
        "Undo the - 1 first — add 1 to both sides.",
        "Now multiply both sides by 4. All of y + 1 is multiplied, so keep it in brackets."
      ],
      ja: [
        "まず - 1 を消す — 両辺に1を足す。",
        "次に両辺に4をかける。y + 1 全体にかけるので、かっこでまとめる。"
      ]
    },
    explanation: {
      en: "Adding 1 gives y + 1 = x/4. Multiplying by 4 multiplies all of y + 1, so x = 4(y + 1).",
      ja: "1を足すと y + 1 = x/4。4をかけると y + 1 全体にかかるので、x = 4(y + 1) です。"
    }
  },
  {
    id: "subject_easy_10",
    topic: "subject",
    subject: "x",
    equation: "y = 5x + 10",
    answer: "x = (y - 10)/5",
    difficulty: "easy",
    type: "two-step",
    basePoints: 10,
    steps: [
      { action: "subtract", value: 10, target: "both-sides", result: "y - 10 = 5x" },
      { action: "divide",   value: 5,  target: "both-sides", result: "x = (y - 10)/5" }
    ],
    hints: {
      en: [
        "Undo the + 10 first — subtract 10 from both sides.",
        "Now divide both sides by 5. All of y - 10 is divided, so keep it in brackets."
      ],
      ja: [
        "まず + 10 を消す — 両辺から10を引く。",
        "次に両辺を5で割る。y - 10 全体を割るので、かっこでまとめる。"
      ]
    },
    explanation: {
      en: "Subtracting 10 gives y - 10 = 5x. Dividing by 5 divides all of y - 10, so x = (y - 10)/5.",
      ja: "10を引くと y - 10 = 5x。5で割ると y - 10 全体が割られるので、x = (y - 10)/5 です。"
    }
  },

  // ---- Medium: letters in the moves, and the subject changes every level ----
  // Levels 1-5 are one step (÷, ×, +, −, ÷); 6-10 are two steps. Real formulas mixed with made-up ones.
  // No l, I or O: they look like 1 or 0 in the pixel font.
  {
    id: "subject_medium_01",
    topic: "subject",
    subject: "a",
    equation: "F = ma",
    answer: "a = F/m",
    difficulty: "medium",
    type: "one-step",
    basePoints: 20,
    steps: [
      { action: "divide", value: "m", target: "both-sides", result: "a = F/m",
        moves: [
          { action: "multiply", value: "m", kind: "wrongWay" },
          { action: "subtract", value: "m", kind: "wrongKind" },
          { action: "divide",   value: "F", kind: "wrongNumber" }
        ] }
    ],
    hints: {
      en: ["a is multiplied by m — divide both sides by m."],
      ja: ["aにmがかけられている — 両辺をmで割る。"]
    },
    explanation: {
      en: "Letters work just like numbers. ma means m × a, so dividing both sides by m leaves a on its own: a = F/m.",
      ja: "文字も数と同じように扱えます。ma は m × a なので、両辺をmで割るとaだけが残り、a = F/m です。"
    }
  },
  {
    id: "subject_medium_02",
    topic: "subject",
    subject: "d",
    equation: "s = d/t",
    answer: "d = st",
    difficulty: "medium",
    type: "one-step",
    basePoints: 20,
    steps: [
      { action: "multiply", value: "t", target: "both-sides", result: "d = st",
        moves: [
          { action: "divide",   value: "t", kind: "wrongWay" },
          { action: "add",      value: "t", kind: "wrongKind" },
          { action: "multiply", value: "s", kind: "wrongNumber" }
        ] }
    ],
    hints: {
      en: ["d is divided by t — multiply both sides by t."],
      ja: ["dがtで割られている — 両辺にtをかける。"]
    },
    explanation: {
      en: "Multiplying both sides by t cancels the ÷ t: st = d, so d = st.",
      ja: "両辺にtをかけると ÷ t が打ち消され、st = d なので d = st です。"
    }
  },
  {
    id: "subject_medium_03",
    topic: "subject",
    subject: "q",
    equation: "p = q - r",
    answer: "q = p + r",
    difficulty: "medium",
    type: "one-step",
    basePoints: 20,
    steps: [
      { action: "add", value: "r", target: "both-sides", result: "q = p + r",
        moves: [
          { action: "subtract", value: "r", kind: "wrongWay" },
          { action: "multiply", value: "r", kind: "wrongKind" },
          { action: "add",      value: "p", kind: "wrongNumber" }
        ] }
    ],
    hints: {
      en: ["r is taken away from q — add r to both sides."],
      ja: ["qからrが引かれている — 両辺にrを足す。"]
    },
    explanation: {
      en: "Adding r to both sides cancels the - r: p + r = q, so q = p + r.",
      ja: "両辺にrを足すと - r が打ち消され、p + r = q なので q = p + r です。"
    }
  },
  {
    id: "subject_medium_04",
    topic: "subject",
    subject: "a",
    equation: "c = a + b",
    answer: "a = c - b",
    difficulty: "medium",
    type: "one-step",
    basePoints: 20,
    steps: [
      { action: "subtract", value: "b", target: "both-sides", result: "a = c - b",
        moves: [
          { action: "add",      value: "b", kind: "wrongWay" },
          { action: "divide",   value: "b", kind: "wrongKind" },
          { action: "subtract", value: "c", kind: "wrongNumber" }
        ] }
    ],
    hints: {
      en: ["b is added to a — subtract b from both sides."],
      ja: ["aにbが足されている — 両辺からbを引く。"]
    },
    explanation: {
      en: "Subtracting b from both sides leaves a on its own: c - b = a, so a = c - b.",
      ja: "両辺からbを引くとaだけが残ります。c - b = a なので a = c - b です。"
    }
  },
  {
    id: "subject_medium_05",
    topic: "subject",
    subject: "h",
    equation: "A = bh",
    answer: "h = A/b",
    difficulty: "medium",
    type: "one-step",
    basePoints: 20,
    steps: [
      { action: "divide", value: "b", target: "both-sides", result: "h = A/b",
        moves: [
          { action: "multiply", value: "b", kind: "wrongWay" },
          { action: "subtract", value: "b", kind: "wrongKind" },
          { action: "divide",   value: "A", kind: "wrongNumber" }
        ] }
    ],
    hints: {
      en: ["h is multiplied by b — divide both sides by b."],
      ja: ["hにbがかけられている — 両辺をbで割る。"]
    },
    explanation: {
      en: "bh means b × h, so divide both sides by b: h = A/b. This is the area of a rectangle, rearranged to find the height.",
      ja: "bh は b × h なので、両辺をbで割ると h = A/b です。長方形の面積の式を、高さを求める形に変えました。"
    }
  },
  {
    id: "subject_medium_06",
    topic: "subject",
    subject: "t",
    equation: "v = u + at",
    answer: "t = (v - u)/a",
    difficulty: "medium",
    type: "two-step",
    basePoints: 20,
    steps: [
      { action: "subtract", value: "u", target: "both-sides", result: "v - u = at",
        moves: [
          { action: "add",      value: "u", kind: "wrongWay" },
          { action: "divide",   value: "u", kind: "wrongKind" },
          { action: "subtract", value: "v", kind: "wrongNumber" }
        ] },
      { action: "divide", value: "a", target: "both-sides", result: "t = (v - u)/a",
        moves: [
          { action: "multiply", value: "a", kind: "wrongWay" },
          { action: "subtract", value: "a", kind: "wrongKind" },
          { action: "divide",   value: "v", kind: "wrongNumber" }
        ] }
    ],
    hints: {
      en: [
        "Undo the + u first — subtract u from both sides.",
        "t is multiplied by a — divide both sides by a. All of v - u is divided, so keep it in brackets."
      ],
      ja: [
        "まず + u を消す — 両辺からuを引く。",
        "tにaがかけられている — 両辺をaで割る。v - u 全体を割るので、かっこでまとめる。"
      ]
    },
    explanation: {
      en: "Same order as a number equation: undo the + u, then the × a. This is the motion formula rearranged to find the time: t = (v - u)/a.",
      ja: "数の方程式と同じ順番で、+ u を消してから × a を消します。運動の式を、時間を求める形に変えると t = (v - u)/a です。"
    }
  },
  {
    id: "subject_medium_07",
    topic: "subject",
    subject: "a",
    equation: "P = 2a + 2b",
    answer: "a = (P - 2b)/2",
    difficulty: "medium",
    type: "two-step",
    basePoints: 20,
    steps: [
      { action: "subtract", value: "2b", target: "both-sides", result: "P - 2b = 2a",
        moves: [
          { action: "add",      value: "2b", kind: "wrongWay" },
          { action: "divide",   value: "2b", kind: "wrongKind" },
          { action: "subtract", value: "2a", kind: "wrongNumber" }
        ] },
      { action: "divide", value: 2, target: "both-sides", result: "a = (P - 2b)/2" }
    ],
    hints: {
      en: [
        "Undo the + 2b first — subtract 2b from both sides.",
        "Now divide both sides by 2. All of P - 2b is divided, so keep it in brackets."
      ],
      ja: [
        "まず + 2b を消す — 両辺から2bを引く。",
        "次に両辺を2で割る。P - 2b 全体を割るので、かっこでまとめる。"
      ]
    },
    explanation: {
      en: "2b is one whole term, so it moves in one go: subtract 2b, then divide by 2. This is the perimeter of a rectangle rearranged: a = (P - 2b)/2.",
      ja: "2b はひとまとまりの項なので、まとめて引きます。2bを引いてから2で割ると、長方形の周の長さの式から a = (P - 2b)/2 になります。"
    }
  },
  {
    id: "subject_medium_08",
    topic: "subject",
    subject: "x",
    equation: "y = mx + c",
    answer: "x = (y - c)/m",
    difficulty: "medium",
    type: "two-step",
    basePoints: 20,
    steps: [
      { action: "subtract", value: "c", target: "both-sides", result: "y - c = mx",
        moves: [
          { action: "add",      value: "c", kind: "wrongWay" },
          { action: "divide",   value: "c", kind: "wrongKind" },
          { action: "subtract", value: "y", kind: "wrongNumber" }
        ] },
      { action: "divide", value: "m", target: "both-sides", result: "x = (y - c)/m",
        moves: [
          { action: "multiply", value: "m", kind: "wrongWay" },
          { action: "subtract", value: "m", kind: "wrongKind" },
          { action: "divide",   value: "y", kind: "wrongNumber" }
        ] }
    ],
    hints: {
      en: [
        "Undo the + c first — subtract c from both sides.",
        "x is multiplied by m — divide both sides by m, keeping y - c in brackets."
      ],
      ja: [
        "まず + c を消す — 両辺からcを引く。",
        "xにmがかけられている — 両辺をmで割る。y - c はかっこでまとめる。"
      ]
    },
    explanation: {
      en: "This is the straight-line formula. Undo the + c, then the × m: x = (y - c)/m.",
      ja: "直線の式です。+ c を消してから × m を消すと x = (y - c)/m です。"
    }
  },
  {
    id: "subject_medium_09",
    topic: "subject",
    subject: "m",
    equation: "k = 3m - n",
    answer: "m = (k + n)/3",
    difficulty: "medium",
    type: "two-step",
    basePoints: 20,
    steps: [
      { action: "add", value: "n", target: "both-sides", result: "k + n = 3m",
        moves: [
          { action: "subtract", value: "n", kind: "wrongWay" },
          { action: "multiply", value: "n", kind: "wrongKind" },
          { action: "add",      value: "k", kind: "wrongNumber" }
        ] },
      { action: "divide", value: 3, target: "both-sides", result: "m = (k + n)/3" }
    ],
    hints: {
      en: [
        "Undo the - n first — add n to both sides.",
        "Now divide both sides by 3, keeping k + n in brackets."
      ],
      ja: [
        "まず - n を消す — 両辺にnを足す。",
        "次に両辺を3で割る。k + n はかっこでまとめる。"
      ]
    },
    explanation: {
      en: "Adding n gives k + n = 3m, then dividing by 3 gives m = (k + n)/3.",
      ja: "nを足すと k + n = 3m、3で割ると m = (k + n)/3 です。"
    }
  },
  {
    id: "subject_medium_10",
    topic: "subject",
    subject: "b",
    equation: "a = b/c + d",
    answer: "b = c(a - d)",
    difficulty: "medium",
    type: "two-step",
    basePoints: 20,
    steps: [
      { action: "subtract", value: "d", target: "both-sides", result: "a - d = b/c",
        moves: [
          { action: "add",      value: "d", kind: "wrongWay" },
          { action: "divide",   value: "d", kind: "wrongKind" },
          { action: "subtract", value: "a", kind: "wrongNumber" }
        ] },
      { action: "multiply", value: "c", target: "both-sides", result: "b = c(a - d)",
        moves: [
          { action: "divide",   value: "c", kind: "wrongWay" },
          { action: "add",      value: "c", kind: "wrongKind" },
          { action: "multiply", value: "a", kind: "wrongNumber" }
        ] }
    ],
    hints: {
      en: [
        "Undo the + d first — subtract d from both sides.",
        "b is divided by c — multiply both sides by c. All of a - d is multiplied, so keep it in brackets."
      ],
      ja: [
        "まず + d を消す — 両辺からdを引く。",
        "bがcで割られている — 両辺にcをかける。a - d 全体にかけるので、かっこでまとめる。"
      ]
    },
    explanation: {
      en: "Undo the + d, then the ÷ c. Multiplying by c multiplies all of a - d, so b = c(a - d).",
      ja: "+ d を消してから ÷ c を消します。cをかけると a - d 全体にかかるので、b = c(a - d) です。"
    }
  },

  // ---- Hard: brackets and fractions, 2–3 steps ----
  // Work from the outside in: undo any + or − on the end, then the number or letter in front
  // of the brackets (or underneath the fraction), and the inside last. Brackets are divided
  // away, never expanded, so Hard stays different from the Brackets topic.
  // Levels 1-3: numbers only. 4-6: a letter in the × or ÷ step. 7-10: three steps.
  {
    id: "subject_hard_01",
    topic: "subject",
    subject: "x",
    equation: "y = 2(x - 3)",
    answer: "x = y/2 + 3",
    difficulty: "hard",
    type: "two-step",
    basePoints: 30,
    steps: [
      { action: "divide", value: 2, target: "both-sides", result: "y/2 = x - 3" },
      { action: "add",    value: 3, target: "both-sides", result: "x = y/2 + 3" }
    ],
    hints: {
      en: [
        "The 2 is outside the brackets — divide both sides by 2 first.",
        "Now undo the - 3 — add 3 to both sides."
      ],
      ja: [
        "2はかっこの外にある — まず両辺を2で割る。",
        "次に - 3 を消す — 両辺に3を足す。"
      ]
    },
    explanation: {
      en: "Dividing by 2 first removes the brackets in one move: y/2 = x - 3. Then add 3: x = y/2 + 3. Expanding first would work too, but it takes more steps.",
      ja: "先に2で割ると、1回でかっこが外れます：y/2 = x - 3。次に3を足して x = y/2 + 3 です。先に展開しても解けますが、手順が増えます。"
    }
  },
  {
    id: "subject_hard_02",
    topic: "subject",
    subject: "p",
    equation: "k = 4(p + q)",
    answer: "p = k/4 - q",
    difficulty: "hard",
    type: "two-step",
    basePoints: 30,
    steps: [
      { action: "divide", value: 4, target: "both-sides", result: "k/4 = p + q" },
      { action: "subtract", value: "q", target: "both-sides", result: "p = k/4 - q",
        moves: [
          { action: "add",      value: "q", kind: "wrongWay" },
          { action: "divide",   value: "q", kind: "wrongKind" },
          { action: "subtract", value: "k", kind: "wrongNumber" }
        ] }
    ],
    hints: {
      en: [
        "The 4 is outside the brackets — divide both sides by 4 first.",
        "Now undo the + q — subtract q from both sides."
      ],
      ja: [
        "4はかっこの外にある — まず両辺を4で割る。",
        "次に + q を消す — 両辺からqを引く。"
      ]
    },
    explanation: {
      en: "Divide by 4 to remove the brackets: k/4 = p + q. Then subtract q, just like a number: p = k/4 - q.",
      ja: "4で割るとかっこが外れます：k/4 = p + q。次に、数と同じようにqを引くと p = k/4 - q です。"
    }
  },
  {
    id: "subject_hard_03",
    topic: "subject",
    subject: "x",
    equation: "y = (x + 4)/3",
    answer: "x = 3y - 4",
    difficulty: "hard",
    type: "two-step",
    basePoints: 30,
    steps: [
      { action: "multiply", value: 3, target: "both-sides", result: "3y = x + 4" },
      { action: "subtract", value: 4, target: "both-sides", result: "x = 3y - 4" }
    ],
    hints: {
      en: [
        "All of x + 4 is divided by 3 — multiply both sides by 3 first.",
        "Now undo the + 4 — subtract 4 from both sides."
      ],
      ja: [
        "x + 4 全体が3で割られている — まず両辺に3をかける。",
        "次に + 4 を消す — 両辺から4を引く。"
      ]
    },
    explanation: {
      en: "The whole top, x + 4, is divided by 3, so multiply by 3 first: 3y = x + 4. Then subtract 4: x = 3y - 4.",
      ja: "分子の x + 4 全体が3で割られているので、まず3をかけます：3y = x + 4。次に4を引いて x = 3y - 4 です。"
    }
  },
  {
    id: "subject_hard_04",
    topic: "subject",
    subject: "n",
    equation: "m = a(n + 3)",
    answer: "n = m/a - 3",
    difficulty: "hard",
    type: "two-step",
    basePoints: 30,
    steps: [
      { action: "divide", value: "a", target: "both-sides", result: "m/a = n + 3",
        moves: [
          { action: "multiply", value: "a", kind: "wrongWay" },
          { action: "subtract", value: "a", kind: "wrongKind" },
          { action: "divide",   value: "m", kind: "wrongNumber" }
        ] },
      { action: "subtract", value: 3, target: "both-sides", result: "n = m/a - 3" }
    ],
    hints: {
      en: [
        "a is outside the brackets — divide both sides by a first.",
        "Now undo the + 3 — subtract 3 from both sides."
      ],
      ja: [
        "aはかっこの外にある — まず両辺をaで割る。",
        "次に + 3 を消す — 両辺から3を引く。"
      ]
    },
    explanation: {
      en: "a multiplies the whole bracket, so dividing by a removes it: m/a = n + 3. Then subtract 3: n = m/a - 3.",
      ja: "aはかっこ全体にかかっているので、aで割るとかっこが外れます：m/a = n + 3。次に3を引いて n = m/a - 3 です。"
    }
  },
  {
    id: "subject_hard_05",
    topic: "subject",
    subject: "x",
    equation: "y = (x + 2)/k",
    answer: "x = ky - 2",
    difficulty: "hard",
    type: "two-step",
    basePoints: 30,
    steps: [
      { action: "multiply", value: "k", target: "both-sides", result: "ky = x + 2",
        moves: [
          { action: "divide",   value: "k", kind: "wrongWay" },
          { action: "add",      value: "k", kind: "wrongKind" },
          { action: "multiply", value: "y", kind: "wrongNumber" }
        ] },
      { action: "subtract", value: 2, target: "both-sides", result: "x = ky - 2" }
    ],
    hints: {
      en: [
        "All of x + 2 is divided by k — multiply both sides by k first.",
        "Now undo the + 2 — subtract 2 from both sides."
      ],
      ja: [
        "x + 2 全体がkで割られている — まず両辺にkをかける。",
        "次に + 2 を消す — 両辺から2を引く。"
      ]
    },
    explanation: {
      en: "Multiplying by k clears the fraction: ky = x + 2. Then subtract 2: x = ky - 2.",
      ja: "kをかけると分数がなくなります：ky = x + 2。次に2を引いて x = ky - 2 です。"
    }
  },
  {
    id: "subject_hard_06",
    topic: "subject",
    subject: "h",
    equation: "A = (a + b)h/2",
    answer: "h = 2A/(a + b)",
    difficulty: "hard",
    type: "two-step",
    basePoints: 30,
    steps: [
      { action: "multiply", value: 2, target: "both-sides", result: "2A = (a + b)h" },
      { action: "divide", value: "(a + b)", target: "both-sides", result: "h = 2A/(a + b)",
        moves: [
          { action: "multiply", value: "(a + b)", kind: "wrongWay" },
          { action: "subtract", value: "(a + b)", kind: "wrongKind" },
          { action: "divide",   value: "a",       kind: "wrongNumber" }
        ] }
    ],
    hints: {
      en: [
        "Clear the fraction — multiply both sides by 2.",
        "h is multiplied by the whole bracket — divide both sides by (a + b)."
      ],
      ja: [
        "分数をなくす — 両辺に2をかける。",
        "hにかっこ全体がかけられている — 両辺を (a + b) で割る。"
      ]
    },
    explanation: {
      en: "This is the area of a trapezium. × 2 gives 2A = (a + b)h. h is multiplied by all of (a + b), so divide by the whole bracket, not just a: h = 2A/(a + b).",
      ja: "台形の面積の式です。2をかけると 2A = (a + b)h。hには (a + b) 全体がかけられているので、aだけでなくかっこ全体で割ります：h = 2A/(a + b)。"
    }
  },
  {
    id: "subject_hard_07",
    topic: "subject",
    subject: "C",
    equation: "F = 9C/5 + 32",
    answer: "C = 5(F - 32)/9",
    difficulty: "hard",
    type: "three-step",
    basePoints: 30,
    steps: [
      { action: "subtract", value: 32, target: "both-sides", result: "F - 32 = 9C/5" },
      { action: "multiply", value: 5,  target: "both-sides", result: "5(F - 32) = 9C" },
      { action: "divide",   value: 9,  target: "both-sides", result: "C = 5(F - 32)/9" }
    ],
    hints: {
      en: [
        "Undo the + 32 first — subtract 32 from both sides.",
        "Clear the fraction — multiply both sides by 5. All of F - 32 is multiplied, so keep it in brackets.",
        "C is multiplied by 9 — divide both sides by 9."
      ],
      ja: [
        "まず + 32 を消す — 両辺から32を引く。",
        "分数をなくす — 両辺に5をかける。F - 32 全体にかけるので、かっこでまとめる。",
        "Cに9がかけられている — 両辺を9で割る。"
      ]
    },
    explanation: {
      en: "This turns °F into °C. Undo the steps in reverse order: - 32, × 5, ÷ 9. So C = 5(F - 32)/9.",
      ja: "華氏（°F）を摂氏（°C）に直す式です。逆の順番で打ち消します：32を引く、5をかける、9で割る。C = 5(F - 32)/9 です。"
    }
  },
  {
    id: "subject_hard_08",
    topic: "subject",
    subject: "x",
    equation: "y = (x - 5)/2 + 1",
    answer: "x = 2(y - 1) + 5",
    difficulty: "hard",
    type: "three-step",
    basePoints: 30,
    steps: [
      { action: "subtract", value: 1, target: "both-sides", result: "y - 1 = (x - 5)/2" },
      { action: "multiply", value: 2, target: "both-sides", result: "2(y - 1) = x - 5" },
      { action: "add",      value: 5, target: "both-sides", result: "x = 2(y - 1) + 5" }
    ],
    hints: {
      en: [
        "Undo the + 1 on the end first — subtract 1 from both sides.",
        "Clear the fraction — multiply both sides by 2, keeping y - 1 in brackets.",
        "Now undo the - 5 — add 5 to both sides."
      ],
      ja: [
        "まず最後の + 1 を消す — 両辺から1を引く。",
        "分数をなくす — 両辺に2をかける。y - 1 はかっこでまとめる。",
        "次に - 5 を消す — 両辺に5を足す。"
      ]
    },
    explanation: {
      en: "Work from the outside in: the + 1, then the ÷ 2, then the - 5 inside. x = 2(y - 1) + 5, which you could also simplify to x = 2y + 3.",
      ja: "外側から順に打ち消します：+ 1、÷ 2、かっこの中の - 5。x = 2(y - 1) + 5 で、整理すると x = 2y + 3 とも書けます。"
    }
  },
  {
    id: "subject_hard_09",
    topic: "subject",
    subject: "v",
    equation: "s = (u + v)t/2",
    answer: "v = 2s/t - u",
    difficulty: "hard",
    type: "three-step",
    basePoints: 30,
    steps: [
      { action: "multiply", value: 2, target: "both-sides", result: "2s = (u + v)t" },
      { action: "divide", value: "t", target: "both-sides", result: "2s/t = u + v",
        moves: [
          { action: "multiply", value: "t", kind: "wrongWay" },
          { action: "subtract", value: "t", kind: "wrongKind" },
          { action: "divide",   value: "u", kind: "wrongNumber" }
        ] },
      { action: "subtract", value: "u", target: "both-sides", result: "v = 2s/t - u",
        moves: [
          { action: "add",      value: "u", kind: "wrongWay" },
          { action: "divide",   value: "u", kind: "wrongKind" },
          { action: "subtract", value: "s", kind: "wrongNumber" }
        ] }
    ],
    hints: {
      en: [
        "Clear the fraction — multiply both sides by 2.",
        "The bracket is multiplied by t — divide both sides by t.",
        "Now undo the + u — subtract u from both sides."
      ],
      ja: [
        "分数をなくす — 両辺に2をかける。",
        "かっこにtがかけられている — 両辺をtで割る。",
        "次に + u を消す — 両辺からuを引く。"
      ]
    },
    explanation: {
      en: "This motion formula gives the distance from the start and end speeds. × 2, then ÷ t, leaves u + v on its own; subtracting u gives v = 2s/t - u.",
      ja: "最初と最後の速さから距離を求める運動の式です。2をかけてtで割ると u + v だけが残り、uを引くと v = 2s/t - u です。"
    }
  },
  {
    id: "subject_hard_10",
    topic: "subject",
    subject: "x",
    equation: "y = k(x - 2) + c",
    answer: "x = (y - c)/k + 2",
    difficulty: "hard",
    type: "three-step",
    basePoints: 30,
    steps: [
      { action: "subtract", value: "c", target: "both-sides", result: "y - c = k(x - 2)",
        moves: [
          { action: "add",      value: "c", kind: "wrongWay" },
          { action: "divide",   value: "c", kind: "wrongKind" },
          { action: "subtract", value: "k", kind: "wrongNumber" }
        ] },
      { action: "divide", value: "k", target: "both-sides", result: "(y - c)/k = x - 2",
        moves: [
          { action: "multiply", value: "k", kind: "wrongWay" },
          { action: "subtract", value: "k", kind: "wrongKind" },
          { action: "divide",   value: "c", kind: "wrongNumber" }
        ] },
      { action: "add", value: 2, target: "both-sides", result: "x = (y - c)/k + 2" }
    ],
    hints: {
      en: [
        "Undo the + c on the end first — subtract c from both sides.",
        "k multiplies the whole bracket — divide both sides by k, keeping y - c in brackets.",
        "Now undo the - 2 — add 2 to both sides."
      ],
      ja: [
        "まず最後の + c を消す — 両辺からcを引く。",
        "kはかっこ全体にかかっている — 両辺をkで割る。y - c はかっこでまとめる。",
        "次に - 2 を消す — 両辺に2を足す。"
      ]
    },
    explanation: {
      en: "Everything together: undo the + c, then the × k outside the brackets, then the - 2 inside. x = (y - c)/k + 2.",
      ja: "すべてを使います：+ c を消し、かっこの外の × k を消し、最後にかっこの中の - 2 を消します。x = (y - c)/k + 2 です。"
    }
  },

  // =====================================================================
  // SIMPLIFYING EXPRESSIONS (topic "expression", shown as "Expressions")
  // =====================================================================

  // ---- Easy: one letter plus numbers ----
  // Levels 1-7 are one step; 8-10 are two steps (collect the letter, then the numbers).
  // Levels 3, 4, 5 and 9 have a lone letter (y means 1y).
  {
    id: "expression_easy_01",
    topic: "expression",
    equation: "3x + 5x",
    answer: "8x",
    difficulty: "easy",
    type: "one-step",
    basePoints: 10,
    steps: [
      { action: "simplify", collect: "x", value: "8x", target: "expression", result: "8x",
        wrong: ["8x²", "2x", "15x"], wrongKinds: ["unlikeTerms", "signSlip", "generic"] }
    ],
    hints: {
      en: ["Collect the x terms: 3x + 5x — add the numbers in front of x."],
      ja: ["xの項をまとめる：3x + 5x — xの前の数を足す。"]
    },
    explanation: {
      en: "3x and 5x are like terms — both are a number of x's. Add the numbers in front: 3 + 5 = 8, so 8x. The letter stays the same; it doesn't become x².",
      ja: "3xと5xは同類項（どちらもxがいくつ分か）です。xの前の数を足して 3 + 5 = 8 で 8x。文字はそのままで、x² にはなりません。"
    }
  },
  {
    id: "expression_easy_02",
    topic: "expression",
    equation: "2a + 6 + 3a",
    answer: "5a + 6",
    difficulty: "easy",
    type: "one-step",
    basePoints: 10,
    steps: [
      { action: "simplify", collect: "a", value: "5a + 6", target: "expression", result: "5a + 6",
        wrong: ["11a", "-a + 6", "6a + 6"], wrongKinds: ["unlikeTerms", "signSlip", "generic"] }
    ],
    hints: {
      en: ["Collect the a terms: 2a + 3a. The 6 isn't an a term, so it stays as it is."],
      ja: ["aの項をまとめる：2a + 3a。6はaの項ではないので、そのまま残す。"]
    },
    explanation: {
      en: "2a and 3a are like terms, so 2a + 3a = 5a. The 6 is just a number, not an a term, so it can't join them: 5a + 6.",
      ja: "2aと3aは同類項なので 2a + 3a = 5a。6はただの数でaの項ではないので、まとめられません：5a + 6。"
    }
  },
  {
    id: "expression_easy_03",
    topic: "expression",
    equation: "7y - y",
    answer: "6y",
    difficulty: "easy",
    type: "one-step",
    basePoints: 10,
    steps: [
      { action: "simplify", collect: "y", value: "6y", target: "expression", result: "6y",
        wrong: ["7y", "8y", "6y²"], wrongKinds: ["loneLetter", "signSlip", "unlikeTerms"] }
    ],
    hints: {
      en: ["A lone y means 1y. Collect the y terms: 7y - 1y."],
      ja: ["yだけのときは1y。yの項をまとめる：7y - 1y。"]
    },
    explanation: {
      en: "y on its own counts as 1y, so 7y - y = 7y - 1y = 6y.",
      ja: "yだけのときは1yと数えるので、7y - y = 7y - 1y = 6y です。"
    }
  },
  {
    id: "expression_easy_04",
    topic: "expression",
    equation: "x + 4x",
    answer: "5x",
    difficulty: "easy",
    type: "one-step",
    basePoints: 10,
    steps: [
      { action: "simplify", collect: "x", value: "5x", target: "expression", result: "5x",
        wrong: ["4x", "3x", "4x²"], wrongKinds: ["loneLetter", "signSlip", "unlikeTerms"] }
    ],
    hints: {
      en: ["A lone x means 1x. Collect the x terms: 1x + 4x."],
      ja: ["xだけのときは1x。xの項をまとめる：1x + 4x。"]
    },
    explanation: {
      en: "x on its own is 1x, so x + 4x = 1x + 4x = 5x — not 4x.",
      ja: "xだけのときは1xなので、x + 4x = 1x + 4x = 5x です。4xではありません。"
    }
  },
  {
    id: "expression_easy_05",
    topic: "expression",
    equation: "6b - 2b + b",
    answer: "5b",
    difficulty: "easy",
    type: "one-step",
    basePoints: 10,
    steps: [
      { action: "simplify", collect: "b", value: "5b", target: "expression", result: "5b",
        wrong: ["4b", "9b", "3b"], wrongKinds: ["loneLetter", "signSlip", "signSlip"] }
    ],
    hints: {
      en: ["Collect the b terms, keeping each sign: 6b - 2b + 1b."],
      ja: ["bの項を符号ごとまとめる：6b - 2b + 1b。"]
    },
    explanation: {
      en: "Each term keeps the sign in front of it: 6 - 2 + 1 = 5, so 5b. The last b is 1b, not nothing.",
      ja: "それぞれの項は前の符号と一緒です：6 - 2 + 1 = 5 で 5b。最後のbは1bで、0ではありません。"
    }
  },
  {
    id: "expression_easy_06",
    topic: "expression",
    equation: "4x + 3 + 2x",
    answer: "6x + 3",
    difficulty: "easy",
    type: "one-step",
    basePoints: 10,
    steps: [
      { action: "simplify", collect: "x", value: "6x + 3", target: "expression", result: "6x + 3",
        wrong: ["9x", "2x + 3", "8x + 3"], wrongKinds: ["unlikeTerms", "signSlip", "generic"] }
    ],
    hints: {
      en: ["Collect the x terms: 4x + 2x. The 3 stays as it is."],
      ja: ["xの項をまとめる：4x + 2x。3はそのまま。"]
    },
    explanation: {
      en: "Only like terms can be added: 4x + 2x = 6x. The 3 has no x, so it stays: 6x + 3, not 9x.",
      ja: "まとめられるのは同類項だけです：4x + 2x = 6x。3にはxがないのでそのまま残り、9xではなく 6x + 3 です。"
    }
  },
  {
    id: "expression_easy_07",
    topic: "expression",
    equation: "8x - 3 - 5x",
    answer: "3x - 3",
    difficulty: "easy",
    type: "one-step",
    basePoints: 10,
    steps: [
      { action: "simplify", collect: "x", value: "3x - 3", target: "expression", result: "3x - 3",
        wrong: ["13x - 3", "-3x - 3", "3x² - 3"], wrongKinds: ["signSlip", "signSlip", "unlikeTerms"] }
    ],
    hints: {
      en: ["Collect the x terms: 8x - 5x. The minus stays with the 5x."],
      ja: ["xの項をまとめる：8x - 5x。マイナスは5xと一緒。"]
    },
    explanation: {
      en: "The - in front of 5x belongs to it, so 8x - 5x = 3x. The - 3 stays as it is: 3x - 3.",
      ja: "5xの前の - は5xについています。8x - 5x = 3x で、- 3 はそのまま残り 3x - 3 です。"
    }
  },
  {
    id: "expression_easy_08",
    topic: "expression",
    equation: "5a + 2 + 3a + 4",
    answer: "8a + 6",
    difficulty: "easy",
    type: "two-step",
    basePoints: 10,
    steps: [
      { action: "simplify", collect: "a", value: "8a + 2 + 4", target: "expression", result: "8a + 2 + 4",
        wrong: ["8a² + 2 + 4", "2a + 2 + 4", "15a + 2 + 4"], wrongKinds: ["unlikeTerms", "signSlip", "generic"] },
      { action: "simplify", collect: "number", value: "8a + 6", target: "expression", result: "8a + 6",
        wrong: ["14a", "8a - 2", "8a + 8"], wrongKinds: ["unlikeTerms", "signSlip", "generic"] }
    ],
    hints: {
      en: [
        "Collect the a terms first: 5a + 3a.",
        "Now collect the numbers: 2 + 4."
      ],
      ja: [
        "まずaの項をまとめる：5a + 3a。",
        "次に数をまとめる：2 + 4。"
      ]
    },
    explanation: {
      en: "Group like with like: the a terms make 8a and the numbers make 6. They're different kinds of term, so the answer stays as two terms: 8a + 6.",
      ja: "同じ種類どうしでまとめます：aの項で8a、数で6。種類が違うので、答えは2つの項のまま 8a + 6 です。"
    }
  },
  {
    id: "expression_easy_09",
    topic: "expression",
    equation: "6y - 1 + y + 5",
    answer: "7y + 4",
    difficulty: "easy",
    type: "two-step",
    basePoints: 10,
    steps: [
      { action: "simplify", collect: "y", value: "7y - 1 + 5", target: "expression", result: "7y - 1 + 5",
        wrong: ["6y - 1 + 5", "5y - 1 + 5", "7y² - 1 + 5"], wrongKinds: ["loneLetter", "signSlip", "unlikeTerms"] },
      { action: "simplify", collect: "number", value: "7y + 4", target: "expression", result: "7y + 4",
        wrong: ["7y + 6", "7y - 4", "11y"], wrongKinds: ["signSlip", "signSlip", "unlikeTerms"] }
    ],
    hints: {
      en: [
        "Collect the y terms: 6y + y. A lone y is 1y.",
        "Now collect the numbers: -1 + 5."
      ],
      ja: [
        "yの項をまとめる：6y + y。yだけのときは1y。",
        "次に数をまとめる：-1 + 5。"
      ]
    },
    explanation: {
      en: "6y + 1y = 7y, and -1 + 5 = 4, so 7y + 4. Keep the minus with the 1 when you add the numbers.",
      ja: "6y + 1y = 7y、-1 + 5 = 4 なので 7y + 4。数をまとめるときは、マイナスを1と一緒に扱います。"
    }
  },
  {
    id: "expression_easy_10",
    topic: "expression",
    equation: "2a + 7 - 4a - 1",
    answer: "-2a + 6",
    difficulty: "easy",
    type: "two-step",
    basePoints: 10,
    steps: [
      { action: "simplify", collect: "a", value: "-2a + 7 - 1", target: "expression", result: "-2a + 7 - 1",
        wrong: ["6a + 7 - 1", "2a + 7 - 1", "-2a² + 7 - 1"], wrongKinds: ["signSlip", "signSlip", "unlikeTerms"] },
      { action: "simplify", collect: "number", value: "-2a + 6", target: "expression", result: "-2a + 6",
        wrong: ["-2a + 8", "-2a - 6", "4a"], wrongKinds: ["signSlip", "signSlip", "unlikeTerms"] }
    ],
    hints: {
      en: [
        "Collect the a terms: 2a - 4a. Taking away more than you have goes negative.",
        "Now collect the numbers: 7 - 1."
      ],
      ja: [
        "aの項をまとめる：2a - 4a。持っているより多く引くと負になる。",
        "次に数をまとめる：7 - 1。"
      ]
    },
    explanation: {
      en: "2a - 4a = -2a, since 2 - 4 = -2. Then 7 - 1 = 6, so -2a + 6. It's fine for a negative term to come first.",
      ja: "2 - 4 = -2 なので 2a - 4a = -2a。7 - 1 = 6 で、答えは -2a + 6 です。負の項が先頭に来ても大丈夫です。"
    }
  },

  // ---- Medium: two kinds of term (levels 1-6), then x² and xy (levels 7-10) ----
  // Every level is two steps: one group of like terms per step.
  {
    id: "expression_medium_01",
    topic: "expression",
    equation: "5a + 3b - 2a + b",
    answer: "3a + 4b",
    difficulty: "medium",
    type: "two-step",
    basePoints: 20,
    steps: [
      { action: "simplify", collect: "a", value: "3a + 3b + b", target: "expression", result: "3a + 3b + b",
        wrong: ["7a + 3b + b", "-3a + 3b + b", "3a² + 3b + b"], wrongKinds: ["signSlip", "signSlip", "unlikeTerms"] },
      { action: "simplify", collect: "b", value: "3a + 4b", target: "expression", result: "3a + 4b",
        wrong: ["3a + 3b", "3a + 2b", "3a + 4b²"], wrongKinds: ["loneLetter", "signSlip", "unlikeTerms"] }
    ],
    hints: {
      en: [
        "Collect the a terms: 5a - 2a. Leave the b terms alone for now.",
        "Now collect the b terms: 3b + b. A lone b is 1b."
      ],
      ja: [
        "aの項をまとめる：5a - 2a。bの項はまだそのまま。",
        "次にbの項をまとめる：3b + b。bだけのときは1b。"
      ]
    },
    explanation: {
      en: "a terms and b terms are different kinds, so collect each group separately: 5a - 2a = 3a and 3b + 1b = 4b. The answer keeps both: 3a + 4b.",
      ja: "aの項とbの項は種類が違うので、別々にまとめます：5a - 2a = 3a、3b + 1b = 4b。答えは両方を残して 3a + 4b です。"
    }
  },
  {
    id: "expression_medium_02",
    topic: "expression",
    equation: "4x - 7 - 6x + 2",
    answer: "-2x - 5",
    difficulty: "medium",
    type: "two-step",
    basePoints: 20,
    steps: [
      { action: "simplify", collect: "x", value: "-2x - 7 + 2", target: "expression", result: "-2x - 7 + 2",
        wrong: ["10x - 7 + 2", "2x - 7 + 2", "-2x² - 7 + 2"], wrongKinds: ["signSlip", "signSlip", "unlikeTerms"] },
      { action: "simplify", collect: "number", value: "-2x - 5", target: "expression", result: "-2x - 5",
        wrong: ["-2x - 9", "-2x + 5", "-7x"], wrongKinds: ["signSlip", "signSlip", "unlikeTerms"] }
    ],
    hints: {
      en: [
        "Collect the x terms: 4x - 6x. The minus belongs to the 6x.",
        "Now collect the numbers: -7 + 2."
      ],
      ja: [
        "xの項をまとめる：4x - 6x。マイナスは6xについている。",
        "次に数をまとめる：-7 + 2。"
      ]
    },
    explanation: {
      en: "Each term keeps its own sign. 4x - 6x = -2x, and -7 + 2 = -5, so -2x - 5.",
      ja: "それぞれの項は自分の符号を持っています。4x - 6x = -2x、-7 + 2 = -5 で -2x - 5 です。"
    }
  },
  {
    id: "expression_medium_03",
    topic: "expression",
    equation: "6p + 2q - p - 5q",
    answer: "5p - 3q",
    difficulty: "medium",
    type: "two-step",
    basePoints: 20,
    steps: [
      { action: "simplify", collect: "p", value: "5p + 2q - 5q", target: "expression", result: "5p + 2q - 5q",
        wrong: ["6p + 2q - 5q", "7p + 2q - 5q", "5p² + 2q - 5q"], wrongKinds: ["loneLetter", "signSlip", "unlikeTerms"] },
      { action: "simplify", collect: "q", value: "5p - 3q", target: "expression", result: "5p - 3q",
        wrong: ["5p + 7q", "5p + 3q", "5p - 3q²"], wrongKinds: ["signSlip", "signSlip", "unlikeTerms"] }
    ],
    hints: {
      en: [
        "Collect the p terms: 6p - p. A lone p is 1p.",
        "Now collect the q terms: 2q - 5q."
      ],
      ja: [
        "pの項をまとめる：6p - p。pだけのときは1p。",
        "次にqの項をまとめる：2q - 5q。"
      ]
    },
    explanation: {
      en: "6p - 1p = 5p, and 2q - 5q = -3q. Put them together: 5p - 3q.",
      ja: "6p - 1p = 5p、2q - 5q = -3q。合わせて 5p - 3q です。"
    }
  },
  {
    id: "expression_medium_04",
    topic: "expression",
    equation: "3m - 4n + 2m + 6n",
    answer: "5m + 2n",
    difficulty: "medium",
    type: "two-step",
    basePoints: 20,
    steps: [
      { action: "simplify", collect: "m", value: "5m - 4n + 6n", target: "expression", result: "5m - 4n + 6n",
        wrong: ["m - 4n + 6n", "5m² - 4n + 6n", "6m - 4n + 6n"], wrongKinds: ["signSlip", "unlikeTerms", "generic"] },
      { action: "simplify", collect: "n", value: "5m + 2n", target: "expression", result: "5m + 2n",
        wrong: ["5m - 10n", "5m - 2n", "7mn"], wrongKinds: ["signSlip", "signSlip", "unlikeTerms"] }
    ],
    hints: {
      en: [
        "Collect the m terms: 3m + 2m.",
        "Now collect the n terms: -4n + 6n."
      ],
      ja: [
        "mの項をまとめる：3m + 2m。",
        "次にnの項をまとめる：-4n + 6n。"
      ]
    },
    explanation: {
      en: "3m + 2m = 5m, and -4n + 6n = 2n, so 5m + 2n. m and n are different letters, so they never join into mn.",
      ja: "3m + 2m = 5m、-4n + 6n = 2n で 5m + 2n。mとnは違う文字なので、mnにはなりません。"
    }
  },
  {
    id: "expression_medium_05",
    topic: "expression",
    equation: "-2x + 5y + 7x - 8y",
    answer: "5x - 3y",
    difficulty: "medium",
    type: "two-step",
    basePoints: 20,
    steps: [
      { action: "simplify", collect: "x", value: "5x + 5y - 8y", target: "expression", result: "5x + 5y - 8y",
        wrong: ["-9x + 5y - 8y", "9x + 5y - 8y", "5x² + 5y - 8y"], wrongKinds: ["signSlip", "signSlip", "unlikeTerms"] },
      { action: "simplify", collect: "y", value: "5x - 3y", target: "expression", result: "5x - 3y",
        wrong: ["5x + 13y", "5x + 3y", "2xy"], wrongKinds: ["signSlip", "signSlip", "unlikeTerms"] }
    ],
    hints: {
      en: [
        "Collect the x terms: -2x + 7x.",
        "Now collect the y terms: 5y - 8y."
      ],
      ja: [
        "xの項をまとめる：-2x + 7x。",
        "次にyの項をまとめる：5y - 8y。"
      ]
    },
    explanation: {
      en: "-2x + 7x = 5x, and 5y - 8y = -3y, so 5x - 3y. A negative term at the start works the same way as any other.",
      ja: "-2x + 7x = 5x、5y - 8y = -3y で 5x - 3y です。先頭が負の項でも、まとめ方は同じです。"
    }
  },
  {
    id: "expression_medium_06",
    topic: "expression",
    equation: "a - 3b - 4a + b",
    answer: "-3a - 2b",
    difficulty: "medium",
    type: "two-step",
    basePoints: 20,
    steps: [
      { action: "simplify", collect: "a", value: "-3a - 3b + b", target: "expression", result: "-3a - 3b + b",
        wrong: ["-4a - 3b + b", "5a - 3b + b", "3a - 3b + b"], wrongKinds: ["loneLetter", "signSlip", "signSlip"] },
      { action: "simplify", collect: "b", value: "-3a - 2b", target: "expression", result: "-3a - 2b",
        wrong: ["-3a - 3b", "-3a - 4b", "-3a + 2b"], wrongKinds: ["loneLetter", "signSlip", "signSlip"] }
    ],
    hints: {
      en: [
        "Collect the a terms: 1a - 4a.",
        "Now collect the b terms: -3b + 1b."
      ],
      ja: [
        "aの項をまとめる：1a - 4a。",
        "次にbの項をまとめる：-3b + 1b。"
      ]
    },
    explanation: {
      en: "Both lone letters count as 1: a - 4a = 1a - 4a = -3a, and -3b + b = -3b + 1b = -2b. So -3a - 2b.",
      ja: "文字だけの項はどちらも1と数えます：a - 4a = 1a - 4a = -3a、-3b + b = -3b + 1b = -2b。答えは -3a - 2b です。"
    }
  },
  {
    id: "expression_medium_07",
    topic: "expression",
    equation: "x² + 3x + 2x² - x",
    answer: "3x² + 2x",
    difficulty: "medium",
    type: "two-step",
    basePoints: 20,
    steps: [
      { action: "simplify", collect: "x²", value: "3x² + 3x - x", target: "expression", result: "3x² + 3x - x",
        wrong: ["2x² + 3x - x", "-x² + 3x - x", "3x + 3x - x"], wrongKinds: ["loneLetter", "signSlip", "unlikeTerms"] },
      { action: "simplify", collect: "x", value: "3x² + 2x", target: "expression", result: "3x² + 2x",
        wrong: ["3x² + 3x", "3x² + 4x", "5x²"], wrongKinds: ["loneLetter", "signSlip", "unlikeTerms"] }
    ],
    hints: {
      en: [
        "x² and x are different kinds of term. Collect the x² terms first: x² + 2x².",
        "Now collect the x terms: 3x - x."
      ],
      ja: [
        "x²とxは違う種類の項。まずx²の項をまとめる：x² + 2x²。",
        "次にxの項をまとめる：3x - x。"
      ]
    },
    explanation: {
      en: "x² and x are not like terms, so they're collected separately: x² + 2x² = 3x² and 3x - x = 2x. They can't be joined, so the answer is 3x² + 2x.",
      ja: "x²とxは同類項ではないので、別々にまとめます：x² + 2x² = 3x²、3x - x = 2x。これ以上まとめられないので、答えは 3x² + 2x です。"
    }
  },
  {
    id: "expression_medium_08",
    topic: "expression",
    equation: "4x² - 2x - x² + 5x",
    answer: "3x² + 3x",
    difficulty: "medium",
    type: "two-step",
    basePoints: 20,
    steps: [
      { action: "simplify", collect: "x²", value: "3x² - 2x + 5x", target: "expression", result: "3x² - 2x + 5x",
        wrong: ["4x² - 2x + 5x", "5x² - 2x + 5x", "3x - 2x + 5x"], wrongKinds: ["loneLetter", "signSlip", "unlikeTerms"] },
      { action: "simplify", collect: "x", value: "3x² + 3x", target: "expression", result: "3x² + 3x",
        wrong: ["3x² - 7x", "3x² + 7x", "6x²"], wrongKinds: ["signSlip", "signSlip", "unlikeTerms"] }
    ],
    hints: {
      en: [
        "Collect the x² terms: 4x² - x². A lone x² is 1x².",
        "Now collect the x terms: -2x + 5x."
      ],
      ja: [
        "x²の項をまとめる：4x² - x²。x²だけのときは1x²。",
        "次にxの項をまとめる：-2x + 5x。"
      ]
    },
    explanation: {
      en: "4x² - 1x² = 3x², and -2x + 5x = 3x. 3x² and 3x look alike but aren't like terms, so the answer is 3x² + 3x, not 6x².",
      ja: "4x² - 1x² = 3x²、-2x + 5x = 3x。3x²と3xは似ていますが同類項ではないので、6x²ではなく 3x² + 3x です。"
    }
  },
  {
    id: "expression_medium_09",
    topic: "expression",
    equation: "3xy + 2x - xy + 4x",
    answer: "2xy + 6x",
    difficulty: "medium",
    type: "two-step",
    basePoints: 20,
    steps: [
      { action: "simplify", collect: "xy", value: "2xy + 2x + 4x", target: "expression", result: "2xy + 2x + 4x",
        wrong: ["3xy + 2x + 4x", "4xy + 2x + 4x", "2x + 2x + 4x"], wrongKinds: ["loneLetter", "signSlip", "unlikeTerms"] },
      { action: "simplify", collect: "x", value: "2xy + 6x", target: "expression", result: "2xy + 6x",
        wrong: ["2xy - 2x", "8xy", "2xy + 8x"], wrongKinds: ["signSlip", "unlikeTerms", "generic"] }
    ],
    hints: {
      en: [
        "xy is its own kind of term. Collect the xy terms: 3xy - xy.",
        "Now collect the x terms: 2x + 4x."
      ],
      ja: [
        "xyはそれだけで1つの種類の項。xyの項をまとめる：3xy - xy。",
        "次にxの項をまとめる：2x + 4x。"
      ]
    },
    explanation: {
      en: "xy terms only join other xy terms: 3xy - 1xy = 2xy. The x terms make 6x. xy and x are different, so the answer is 2xy + 6x.",
      ja: "xyの項はxyの項としかまとめられません：3xy - 1xy = 2xy。xの項で6x。xyとxは違う種類なので、答えは 2xy + 6x です。"
    }
  },
  {
    id: "expression_medium_10",
    topic: "expression",
    equation: "5ab - 2a + ab - 3a",
    answer: "6ab - 5a",
    difficulty: "medium",
    type: "two-step",
    basePoints: 20,
    steps: [
      { action: "simplify", collect: "ab", value: "6ab - 2a - 3a", target: "expression", result: "6ab - 2a - 3a",
        wrong: ["5ab - 2a - 3a", "4ab - 2a - 3a", "6a - 2a - 3a"], wrongKinds: ["loneLetter", "signSlip", "unlikeTerms"] },
      { action: "simplify", collect: "a", value: "6ab - 5a", target: "expression", result: "6ab - 5a",
        wrong: ["6ab - a", "6ab + 5a", "ab"], wrongKinds: ["signSlip", "signSlip", "unlikeTerms"] }
    ],
    hints: {
      en: [
        "Collect the ab terms: 5ab + ab. A lone ab is 1ab.",
        "Now collect the a terms: -2a - 3a."
      ],
      ja: [
        "abの項をまとめる：5ab + ab。abだけのときは1ab。",
        "次にaの項をまとめる：-2a - 3a。"
      ]
    },
    explanation: {
      en: "5ab + 1ab = 6ab, and -2a - 3a = -5a. ab and a are different kinds of term, so the answer is 6ab - 5a.",
      ja: "5ab + 1ab = 6ab、-2a - 3a = -5a。abとaは違う種類の項なので、答えは 6ab - 5a です。"
    }
  },

  // ---- Hard: expand every bracket in one step, then collect (2–3 steps) ----
  // Expand steps carry no wrongKinds, so their slips count toward "tip_expand" (shared with Brackets).
  // Levels 4, 8 and 10: a minus in front of the bracket. Level 9: a letter outside (x × x = x²).
  {
    id: "expression_hard_01",
    topic: "expression",
    equation: "3(x + 2) + 2x",
    answer: "5x + 6",
    difficulty: "hard",
    type: "two-step",
    basePoints: 30,
    steps: [
      { action: "expand", value: "3x + 6 + 2x", wrong: ["3x + 2 + 2x", "x + 6 + 2x", "3x + 5 + 2x"], target: "expression", result: "3x + 6 + 2x" },
      { action: "simplify", collect: "x", value: "5x + 6", target: "expression", result: "5x + 6",
        wrong: ["11x", "x + 6", "5x² + 6"], wrongKinds: ["unlikeTerms", "signSlip", "unlikeTerms"] }
    ],
    hints: {
      en: [
        "Expand the brackets: 3 × x and 3 × 2.",
        "Now collect the x terms: 3x + 2x."
      ],
      ja: [
        "かっこを展開する：3 × x と 3 × 2。",
        "次にxの項をまとめる：3x + 2x。"
      ]
    },
    explanation: {
      en: "Brackets first: 3(x + 2) = 3x + 6. Then the x terms collect: 3x + 2x = 5x, so 5x + 6.",
      ja: "まずかっこ：3(x + 2) = 3x + 6。次にxの項をまとめて 3x + 2x = 5x、答えは 5x + 6 です。"
    }
  },
  {
    id: "expression_hard_02",
    topic: "expression",
    equation: "4(a - 1) + 3a",
    answer: "7a - 4",
    difficulty: "hard",
    type: "two-step",
    basePoints: 30,
    steps: [
      { action: "expand", value: "4a - 4 + 3a", wrong: ["4a - 1 + 3a", "4a + 4 + 3a", "a - 4 + 3a"], target: "expression", result: "4a - 4 + 3a" },
      { action: "simplify", collect: "a", value: "7a - 4", target: "expression", result: "7a - 4",
        wrong: ["a - 4", "7a² - 4", "3a"], wrongKinds: ["signSlip", "unlikeTerms", "unlikeTerms"] }
    ],
    hints: {
      en: [
        "Expand the brackets: 4 × a and 4 × (-1).",
        "Now collect the a terms: 4a + 3a."
      ],
      ja: [
        "かっこを展開する：4 × a と 4 ×（-1）。",
        "次にaの項をまとめる：4a + 3a。"
      ]
    },
    explanation: {
      en: "4(a - 1) = 4a - 4 — the minus inside gets multiplied too. Then 4a + 3a = 7a, so 7a - 4.",
      ja: "4(a - 1) = 4a - 4（中のマイナスも一緒にかけます）。次に 4a + 3a = 7a で、答えは 7a - 4 です。"
    }
  },
  {
    id: "expression_hard_03",
    topic: "expression",
    equation: "2(x + 4) + 3(x - 1)",
    answer: "5x + 5",
    difficulty: "hard",
    type: "three-step",
    basePoints: 30,
    steps: [
      { action: "expand", value: "2x + 8 + 3x - 3", wrong: ["2x + 4 + 3x - 1", "2x + 8 + 3x + 3", "2x + 8 + 3x - 1"], target: "expression", result: "2x + 8 + 3x - 3" },
      { action: "simplify", collect: "x", value: "5x + 8 - 3", target: "expression", result: "5x + 8 - 3",
        wrong: ["-x + 8 - 3", "5x² + 8 - 3", "6x + 8 - 3"], wrongKinds: ["signSlip", "unlikeTerms", "generic"] },
      { action: "simplify", collect: "number", value: "5x + 5", target: "expression", result: "5x + 5",
        wrong: ["5x + 11", "5x - 5", "10x"], wrongKinds: ["signSlip", "signSlip", "unlikeTerms"] }
    ],
    hints: {
      en: [
        "Expand both brackets: 2 × x, 2 × 4, then 3 × x and 3 × (-1).",
        "Collect the x terms: 2x + 3x.",
        "Now collect the numbers: 8 - 3."
      ],
      ja: [
        "両方のかっこを展開する：2 × x、2 × 4、3 × x、3 ×（-1）。",
        "xの項をまとめる：2x + 3x。",
        "次に数をまとめる：8 - 3。"
      ]
    },
    explanation: {
      en: "Expanding both brackets gives 2x + 8 + 3x - 3. Then 2x + 3x = 5x and 8 - 3 = 5, so 5x + 5.",
      ja: "両方のかっこを展開すると 2x + 8 + 3x - 3。2x + 3x = 5x、8 - 3 = 5 で、答えは 5x + 5 です。"
    }
  },
  {
    id: "expression_hard_04",
    topic: "expression",
    equation: "5x - 2(x - 3)",
    answer: "3x + 6",
    difficulty: "hard",
    type: "two-step",
    basePoints: 30,
    steps: [
      { action: "expand", value: "5x - 2x + 6", wrong: ["5x - 2x - 6", "5x - 2x - 3", "5x - 2x + 3"], target: "expression", result: "5x - 2x + 6" },
      { action: "simplify", collect: "x", value: "3x + 6", target: "expression", result: "3x + 6",
        wrong: ["7x + 6", "9x", "3x² + 6"], wrongKinds: ["signSlip", "unlikeTerms", "unlikeTerms"] }
    ],
    hints: {
      en: [
        "Expand: -2 × x and -2 × (-3). The minus in front belongs to the 2.",
        "Now collect the x terms: 5x - 2x."
      ],
      ja: [
        "展開する：-2 × x と -2 ×（-3）。前のマイナスは2についている。",
        "次にxの項をまとめる：5x - 2x。"
      ]
    },
    explanation: {
      en: "The - in front of the bracket goes with the 2, so multiply by -2: -2 × x = -2x and -2 × (-3) = +6. Then 5x - 2x = 3x, so 3x + 6.",
      ja: "かっこの前の - は2についているので、-2をかけます：-2 × x = -2x、-2 ×（-3）= +6。次に 5x - 2x = 3x で、答えは 3x + 6 です。"
    }
  },
  {
    id: "expression_hard_05",
    topic: "expression",
    equation: "3(2a + b) - 4a",
    answer: "2a + 3b",
    difficulty: "hard",
    type: "two-step",
    basePoints: 30,
    steps: [
      { action: "expand", value: "6a + 3b - 4a", wrong: ["6a + b - 4a", "2a + 3b - 4a", "5a + 3b - 4a"], target: "expression", result: "6a + 3b - 4a" },
      { action: "simplify", collect: "a", value: "2a + 3b", target: "expression", result: "2a + 3b",
        wrong: ["10a + 3b", "-2a + 3b", "2a² + 3b"], wrongKinds: ["signSlip", "signSlip", "unlikeTerms"] }
    ],
    hints: {
      en: [
        "Expand the brackets: 3 × 2a and 3 × b.",
        "Now collect the a terms: 6a - 4a."
      ],
      ja: [
        "かっこを展開する：3 × 2a と 3 × b。",
        "次にaの項をまとめる：6a - 4a。"
      ]
    },
    explanation: {
      en: "3 × 2a = 6a and 3 × b = 3b, giving 6a + 3b - 4a. Collect the a terms: 6a - 4a = 2a, so 2a + 3b.",
      ja: "3 × 2a = 6a、3 × b = 3b で 6a + 3b - 4a。aの項をまとめて 6a - 4a = 2a、答えは 2a + 3b です。"
    }
  },
  {
    id: "expression_hard_06",
    topic: "expression",
    equation: "2(x² + 3x) - x²",
    answer: "x² + 6x",
    difficulty: "hard",
    type: "two-step",
    basePoints: 30,
    steps: [
      { action: "expand", value: "2x² + 6x - x²", wrong: ["2x² + 3x - x²", "2x + 6x - x²", "x² + 6x - x²"], target: "expression", result: "2x² + 6x - x²" },
      { action: "simplify", collect: "x²", value: "x² + 6x", target: "expression", result: "x² + 6x",
        wrong: ["2x² + 6x", "3x² + 6x", "x + 6x"], wrongKinds: ["loneLetter", "signSlip", "unlikeTerms"] }
    ],
    hints: {
      en: [
        "Expand: 2 × x² and 2 × 3x.",
        "Now collect the x² terms: 2x² - x². A lone x² is 1x²."
      ],
      ja: [
        "展開する：2 × x² と 2 × 3x。",
        "次にx²の項をまとめる：2x² - x²。x²だけのときは1x²。"
      ]
    },
    explanation: {
      en: "2(x² + 3x) = 2x² + 6x. Then 2x² - 1x² = 1x², written x². The x term can't join the x² term, so the answer is x² + 6x.",
      ja: "2(x² + 3x) = 2x² + 6x。次に 2x² - 1x² = 1x² で、x² と書きます。xの項はx²の項とまとめられないので、答えは x² + 6x です。"
    }
  },
  {
    id: "expression_hard_07",
    topic: "expression",
    equation: "4(m + 2n) - 3(m - n)",
    answer: "m + 11n",
    difficulty: "hard",
    type: "three-step",
    basePoints: 30,
    steps: [
      { action: "expand", value: "4m + 8n - 3m + 3n", wrong: ["4m + 8n - 3m - 3n", "4m + 2n - 3m - n", "4m + 8n - 3m - n"], target: "expression", result: "4m + 8n - 3m + 3n" },
      { action: "simplify", collect: "m", value: "m + 8n + 3n", target: "expression", result: "m + 8n + 3n",
        wrong: ["8n + 3n", "7m + 8n + 3n", "m² + 8n + 3n"], wrongKinds: ["loneLetter", "signSlip", "unlikeTerms"] },
      { action: "simplify", collect: "n", value: "m + 11n", target: "expression", result: "m + 11n",
        wrong: ["m + 5n", "12mn", "m + 24n"], wrongKinds: ["signSlip", "unlikeTerms", "generic"] }
    ],
    hints: {
      en: [
        "Expand both brackets. The second one is multiplied by -3, so -3 × (-n) = +3n.",
        "Collect the m terms: 4m - 3m. 1m is written m.",
        "Now collect the n terms: 8n + 3n."
      ],
      ja: [
        "両方のかっこを展開する。2つ目は-3をかけるので、-3 ×（-n）= +3n。",
        "mの項をまとめる：4m - 3m。1mはmと書く。",
        "次にnの項をまとめる：8n + 3n。"
      ]
    },
    explanation: {
      en: "-3 multiplies both terms in the second bracket: -3m and +3n. Then 4m - 3m = m (1m, not nothing) and 8n + 3n = 11n, so m + 11n.",
      ja: "2つ目のかっこの両方の項に-3をかけて -3m と +3n。4m - 3m = m（1mで、0ではありません）、8n + 3n = 11n で、答えは m + 11n です。"
    }
  },
  {
    id: "expression_hard_08",
    topic: "expression",
    equation: "6y - 2(y + 4) + 3",
    answer: "4y - 5",
    difficulty: "hard",
    type: "three-step",
    basePoints: 30,
    steps: [
      { action: "expand", value: "6y - 2y - 8 + 3", wrong: ["6y - 2y + 8 + 3", "6y - 2y - 4 + 3", "6y - 2y + 4 + 3"], target: "expression", result: "6y - 2y - 8 + 3" },
      { action: "simplify", collect: "y", value: "4y - 8 + 3", target: "expression", result: "4y - 8 + 3",
        wrong: ["8y - 8 + 3", "-4y - 8 + 3", "4y² - 8 + 3"], wrongKinds: ["signSlip", "signSlip", "unlikeTerms"] },
      { action: "simplify", collect: "number", value: "4y - 5", target: "expression", result: "4y - 5",
        wrong: ["4y - 11", "4y + 5", "-y"], wrongKinds: ["signSlip", "signSlip", "unlikeTerms"] }
    ],
    hints: {
      en: [
        "Expand: -2 × y and -2 × 4. Both come out negative.",
        "Collect the y terms: 6y - 2y.",
        "Now collect the numbers: -8 + 3."
      ],
      ja: [
        "展開する：-2 × y と -2 × 4。どちらも負になる。",
        "yの項をまとめる：6y - 2y。",
        "次に数をまとめる：-8 + 3。"
      ]
    },
    explanation: {
      en: "-2(y + 4) = -2y - 8. Then 6y - 2y = 4y and -8 + 3 = -5, so 4y - 5.",
      ja: "-2(y + 4) = -2y - 8。次に 6y - 2y = 4y、-8 + 3 = -5 で、答えは 4y - 5 です。"
    }
  },
  {
    id: "expression_hard_09",
    topic: "expression",
    equation: "x(x + 3) + 2x",
    answer: "x² + 5x",
    difficulty: "hard",
    type: "two-step",
    basePoints: 30,
    steps: [
      { action: "expand", value: "x² + 3x + 2x", wrong: ["x² + 3 + 2x", "2x + 3x + 2x", "x + 3x + 2x"], target: "expression", result: "x² + 3x + 2x" },
      { action: "simplify", collect: "x", value: "x² + 5x", target: "expression", result: "x² + 5x",
        wrong: ["x² + x", "x² + 5x²", "x² + 6x"], wrongKinds: ["signSlip", "unlikeTerms", "generic"] }
    ],
    hints: {
      en: [
        "Expand: x × x and x × 3. x × x is x².",
        "Now collect the x terms: 3x + 2x."
      ],
      ja: [
        "展開する：x × x と x × 3。x × x は x²。",
        "次にxの項をまとめる：3x + 2x。"
      ]
    },
    explanation: {
      en: "A letter outside the brackets multiplies too: x × x = x² and x × 3 = 3x. Then 3x + 2x = 5x, so x² + 5x.",
      ja: "かっこの外が文字でも、同じようにかけます：x × x = x²、x × 3 = 3x。次に 3x + 2x = 5x で、答えは x² + 5x です。"
    }
  },
  {
    id: "expression_hard_10",
    topic: "expression",
    equation: "2(3x - y) - (x - 4y)",
    answer: "5x + 2y",
    difficulty: "hard",
    type: "three-step",
    basePoints: 30,
    steps: [
      { action: "expand", value: "6x - 2y - x + 4y", wrong: ["6x - 2y - x - 4y", "6x - y - x + 4y", "6x - 2y + x - 4y"], target: "expression", result: "6x - 2y - x + 4y" },
      { action: "simplify", collect: "x", value: "5x - 2y + 4y", target: "expression", result: "5x - 2y + 4y",
        wrong: ["6x - 2y + 4y", "7x - 2y + 4y", "5x² - 2y + 4y"], wrongKinds: ["loneLetter", "signSlip", "unlikeTerms"] },
      { action: "simplify", collect: "y", value: "5x + 2y", target: "expression", result: "5x + 2y",
        wrong: ["5x - 6y", "5x + 6y", "7xy"], wrongKinds: ["signSlip", "signSlip", "unlikeTerms"] }
    ],
    hints: {
      en: [
        "Expand both brackets. A minus in front of a bracket means × (-1): -(x - 4y) = -x + 4y.",
        "Collect the x terms: 6x - x.",
        "Now collect the y terms: -2y + 4y."
      ],
      ja: [
        "両方のかっこを展開する。かっこの前のマイナスは ×（-1）：-(x - 4y) = -x + 4y。",
        "xの項をまとめる：6x - x。",
        "次にyの項をまとめる：-2y + 4y。"
      ]
    },
    explanation: {
      en: "A minus in front of a bracket changes every sign inside: -(x - 4y) = -x + 4y. Then 6x - x = 5x and -2y + 4y = 2y, so 5x + 2y.",
      ja: "かっこの前のマイナスは、中のすべての符号を変えます：-(x - 4y) = -x + 4y。次に 6x - x = 5x、-2y + 4y = 2y で、答えは 5x + 2y です。"
    }
  },

  // =====================================================================
  // LAWS OF INDICES (topic "indices", shown as "Indices")
  // =====================================================================
 
  // ---- Easy: one law, plain powers ----
  // Levels 1-8 are one step; 9-10 are two steps (same law twice, left to right).
  // Levels 7 and 8 have a lone x (x means x^1).
  {
    id: "indices_easy_01",
    topic: "indices",
    equation: "x^3 × x^4",
    answer: "x^7",
    difficulty: "easy",
    type: "one-step",
    basePoints: 10,
    steps: [
      { action: "simplify", law: "multiply", value: "x^7", target: "expression", result: "x^7",
        wrong: ["x^12", "2x^7", "x"], wrongKinds: ["powerOp", "coefficient", "powerOp"] }
    ],
    hints: {
      en: ["Multiply rule: when you multiply, add the powers: 3 + 4."],
      ja: ["かけ算のルール：かけるときは指数を足す：3 + 4。"]
    },
    explanation: {
      en: "x^3 × x^4 is three x's times four more x's — seven x's in all. So add the powers: 3 + 4 = 7, giving x^7. Multiplying the powers (x^12) is the slip to avoid.",
      ja: "x^3 × x^4 は、xを3個かけたものにさらに4個かけたもの — 全部で7個です。だから指数を足して 3 + 4 = 7、答えは x^7。指数どうしをかけて x^12 にしないように。"
    }
  },
  {
    id: "indices_easy_02",
    topic: "indices",
    equation: "x^2 × x^5",
    answer: "x^7",
    difficulty: "easy",
    type: "one-step",
    basePoints: 10,
    steps: [
      { action: "simplify", law: "multiply", value: "x^7", target: "expression", result: "x^7",
        wrong: ["x^10", "2x^7", "x^3"], wrongKinds: ["powerOp", "coefficient", "powerOp"] }
    ],
    hints: {
      en: ["Add the powers: 2 + 5."],
      ja: ["指数を足す：2 + 5。"]
    },
    explanation: {
      en: "Multiplying the same letter adds the powers: 2 + 5 = 7, so x^7. There's only one x in the answer, so no 2 in front.",
      ja: "同じ文字のかけ算は指数を足します：2 + 5 = 7 で x^7。答えのxは1つだけなので、前に2はつきません。"
    }
  },
  {
    id: "indices_easy_03",
    topic: "indices",
    equation: "x^6 ÷ x^2",
    answer: "x^4",
    difficulty: "easy",
    type: "one-step",
    basePoints: 10,
    steps: [
      { action: "simplify", law: "divide", value: "x^4", target: "expression", result: "x^4",
        wrong: ["x^3", "x^8", "x^12"], wrongKinds: ["powerOp", "powerOp", "powerOp"] }
    ],
    hints: {
      en: ["Divide rule: when you divide, subtract the powers: 6 - 2."],
      ja: ["わり算のルール：わるときは指数を引く：6 - 2。"]
    },
    explanation: {
      en: "Dividing cancels x's: six on top, two underneath, so four are left. Subtract the powers: 6 - 2 = 4, giving x^4. Dividing the powers (x^3) is a common slip.",
      ja: "わり算ではxが約分されます：上に6個、下に2個なので、残りは4個。指数を引いて 6 - 2 = 4、答えは x^4。指数どうしをわって x^3 にしないように。"
    }
  },
  {
    id: "indices_easy_04",
    topic: "indices",
    equation: "x^9 ÷ x^3",
    answer: "x^6",
    difficulty: "easy",
    type: "one-step",
    basePoints: 10,
    steps: [
      { action: "simplify", law: "divide", value: "x^6", target: "expression", result: "x^6",
        wrong: ["x^3", "x^12", "x^27"], wrongKinds: ["powerOp", "powerOp", "powerOp"] }
    ],
    hints: {
      en: ["Subtract the powers: 9 - 3."],
      ja: ["指数を引く：9 - 3。"]
    },
    explanation: {
      en: "Divide means subtract the powers: 9 - 3 = 6, so x^6. Not 9 ÷ 3, which would give x^3.",
      ja: "わり算は指数を引きます：9 - 3 = 6 で x^6。9 ÷ 3 で x^3 にはなりません。"
    }
  },
  {
    id: "indices_easy_05",
    topic: "indices",
    equation: "(x^2)^3",
    answer: "x^6",
    difficulty: "easy",
    type: "one-step",
    basePoints: 10,
    steps: [
      { action: "simplify", law: "power", value: "x^6", target: "expression", result: "x^6",
        wrong: ["x^5", "x^8", "x^9"], wrongKinds: ["powerOp", "generic", "generic"] }
    ],
    hints: {
      en: ["Power rule: a power of a power multiplies the powers: 2 × 3."],
      ja: ["累乗のルール：累乗の累乗は指数をかける：2 × 3。"]
    },
    explanation: {
      en: "(x^2)^3 means x^2 × x^2 × x^2, which is 2 + 2 + 2 = 6 x's. That's the same as 2 × 3, so x^6. Adding the powers (x^5) is the slip to avoid.",
      ja: "(x^2)^3 は x^2 × x^2 × x^2 のこと。2 + 2 + 2 = 6 個のxで、2 × 3 と同じなので x^6。指数を足して x^5 にしないように。"
    }
  },
  {
    id: "indices_easy_06",
    topic: "indices",
    equation: "(x^4)^2",
    answer: "x^8",
    difficulty: "easy",
    type: "one-step",
    basePoints: 10,
    steps: [
      { action: "simplify", law: "power", value: "x^8", target: "expression", result: "x^8",
        wrong: ["x^6", "x^16", "x^2"], wrongKinds: ["powerOp", "generic", "powerOp"] }
    ],
    hints: {
      en: ["Multiply the powers: 4 × 2."],
      ja: ["指数をかける：4 × 2。"]
    },
    explanation: {
      en: "(x^4)^2 = x^4 × x^4 = x^8. A power of a power multiplies: 4 × 2 = 8.",
      ja: "(x^4)^2 = x^4 × x^4 = x^8。累乗の累乗は指数をかけます：4 × 2 = 8。"
    }
  },
  {
    id: "indices_easy_07",
    topic: "indices",
    equation: "x × x^5",
    answer: "x^6",
    difficulty: "easy",
    type: "one-step",
    basePoints: 10,
    steps: [
      { action: "simplify", law: "multiply", value: "x^6", target: "expression", result: "x^6",
        wrong: ["x^5", "2x^6", "x^4"], wrongKinds: ["lonePower", "coefficient", "powerOp"] }
    ],
    hints: {
      en: ["A lone x means x^1. Add the powers: 1 + 5."],
      ja: ["xだけのときは x^1。指数を足す：1 + 5。"]
    },
    explanation: {
      en: "x on its own is x^1, so x × x^5 = x^1 × x^5 = x^6 — not x^5.",
      ja: "xだけのときは x^1 なので、x × x^5 = x^1 × x^5 = x^6 です。x^5 ではありません。"
    }
  },
  {
    id: "indices_easy_08",
    topic: "indices",
    equation: "x^7 ÷ x",
    answer: "x^6",
    difficulty: "easy",
    type: "one-step",
    basePoints: 10,
    steps: [
      { action: "simplify", law: "divide", value: "x^6", target: "expression", result: "x^6",
        wrong: ["x^7", "x^8", "x^5"], wrongKinds: ["lonePower", "powerOp", "generic"] }
    ],
    hints: {
      en: ["A lone x means x^1. Subtract the powers: 7 - 1."],
      ja: ["xだけのときは x^1。指数を引く：7 - 1。"]
    },
    explanation: {
      en: "x is x^1, so x^7 ÷ x = x^7 ÷ x^1 = x^6. One x cancels, so the power goes down by 1.",
      ja: "xは x^1 なので、x^7 ÷ x = x^7 ÷ x^1 = x^6。xが1個約分されるので、指数が1減ります。"
    }
  },
  {
    id: "indices_easy_09",
    topic: "indices",
    equation: "x^2 × x^3 × x^4",
    answer: "x^9",
    difficulty: "easy",
    type: "two-step",
    basePoints: 10,
    steps: [
      { action: "simplify", law: "multiply", value: "x^5 × x^4", target: "expression", result: "x^5 × x^4",
        wrong: ["x^6 × x^4", "2x^5 × x^4", "x × x^4"], wrongKinds: ["powerOp", "coefficient", "powerOp"] },
      { action: "simplify", law: "multiply", value: "x^9", target: "expression", result: "x^9",
        wrong: ["x^20", "2x^9", "x"], wrongKinds: ["powerOp", "coefficient", "powerOp"] }
    ],
    hints: {
      en: [
        "Multiply the first two: add the powers 2 + 3.",
        "Now x^5 × x^4: add 5 + 4."
      ],
      ja: [
        "最初の2つをかける：指数を足して 2 + 3。",
        "次に x^5 × x^4：5 + 4。"
      ]
    },
    explanation: {
      en: "Work left to right, adding the powers each time: 2 + 3 = 5, then 5 + 4 = 9. So x^9 — the same as adding all three powers at once.",
      ja: "左から順に、毎回指数を足します：2 + 3 = 5、次に 5 + 4 = 9。答えは x^9 で、3つの指数を一度に足しても同じです。"
    }
  },
  {
    id: "indices_easy_10",
    topic: "indices",
    equation: "x^12 ÷ x^4 ÷ x^2",
    answer: "x^6",
    difficulty: "easy",
    type: "two-step",
    basePoints: 10,
    steps: [
      { action: "simplify", law: "divide", value: "x^8 ÷ x^2", target: "expression", result: "x^8 ÷ x^2",
        wrong: ["x^16 ÷ x^2", "x^3 ÷ x^2", "x^12 ÷ x^2"], wrongKinds: ["powerOp", "powerOp", "generic"] },
      { action: "simplify", law: "divide", value: "x^6", target: "expression", result: "x^6",
        wrong: ["x^10", "x^4", "x^16"], wrongKinds: ["powerOp", "powerOp", "powerOp"] }
    ],
    hints: {
      en: [
        "Divide the first two: subtract 12 - 4.",
        "Now x^8 ÷ x^2: subtract 8 - 2."
      ],
      ja: [
        "最初の2つをわる：12 - 4。",
        "次に x^8 ÷ x^2：8 - 2。"
      ]
    },
    explanation: {
      en: "Go left to right, subtracting the powers: 12 - 4 = 8, then 8 - 2 = 6. So x^6. Doing x^4 ÷ x^2 first would give the wrong answer.",
      ja: "左から順に指数を引きます：12 - 4 = 8、次に 8 - 2 = 6 で x^6。先に x^4 ÷ x^2 を計算すると答えが変わってしまいます。"
    }
  },
 
  // ---- Medium: numbers in front, two letters, mixed laws ----
  // Levels 1-5 and 9 are one step; 6, 7, 8 and 10 are two steps.
  // Levels 2 and 9 have two letters (each letter's powers on their own).
  {
    id: "indices_medium_01",
    topic: "indices",
    equation: "3x^2 × 4x^5",
    answer: "12x^7",
    difficulty: "medium",
    type: "one-step",
    basePoints: 20,
    steps: [
      { action: "simplify", law: "multiply", value: "12x^7", target: "expression", result: "12x^7",
        wrong: ["7x^7", "12x^10", "12x^3"], wrongKinds: ["coefficient", "powerOp", "powerOp"] }
    ],
    hints: {
      en: ["Multiply the numbers (3 × 4) and add the powers (2 + 5)."],
      ja: ["数をかけて（3 × 4）、指数を足す（2 + 5）。"]
    },
    explanation: {
      en: "Numbers and powers follow different rules: the numbers in front multiply, 3 × 4 = 12, and the powers add, 2 + 5 = 7. So 12x^7.",
      ja: "数と指数はルールが違います：前の数はかけ算で 3 × 4 = 12、指数は足し算で 2 + 5 = 7。答えは 12x^7 です。"
    }
  },
  {
    id: "indices_medium_02",
    topic: "indices",
    equation: "x^2y^3 × x^4y",
    answer: "x^6y^4",
    difficulty: "medium",
    type: "one-step",
    basePoints: 20,
    steps: [
      { action: "simplify", law: "multiply", value: "x^6y^4", target: "expression", result: "x^6y^4",
        wrong: ["x^6y^3", "x^8y^3", "x^10"], wrongKinds: ["lonePower", "powerOp", "unlikeTerms"] }
    ],
    hints: {
      en: ["Do each letter on its own: x powers 2 + 4, y powers 3 + 1."],
      ja: ["文字ごとに計算する：xの指数は 2 + 4、yの指数は 3 + 1。"]
    },
    explanation: {
      en: "x and y are different letters, so their powers never mix. x: 2 + 4 = 6. y: the lone y is y^1, so 3 + 1 = 4. That gives x^6y^4.",
      ja: "xとyは違う文字なので、指数は混ぜません。x：2 + 4 = 6。y：yだけのときは y^1 なので 3 + 1 = 4。答えは x^6y^4 です。"
    }
  },
  {
    id: "indices_medium_03",
    topic: "indices",
    equation: "12x^8 ÷ 4x^2",
    answer: "3x^6",
    difficulty: "medium",
    type: "one-step",
    basePoints: 20,
    steps: [
      { action: "simplify", law: "divide", value: "3x^6", target: "expression", result: "3x^6",
        wrong: ["8x^6", "3x^4", "3x^10"], wrongKinds: ["coefficient", "powerOp", "powerOp"] }
    ],
    hints: {
      en: ["Divide the numbers (12 ÷ 4) and subtract the powers (8 - 2)."],
      ja: ["数をわって（12 ÷ 4）、指数を引く（8 - 2）。"]
    },
    explanation: {
      en: "The numbers divide, 12 ÷ 4 = 3, and the powers subtract, 8 - 2 = 6. So 3x^6.",
      ja: "数はわり算で 12 ÷ 4 = 3、指数は引き算で 8 - 2 = 6。答えは 3x^6 です。"
    }
  },
  {
    id: "indices_medium_04",
    topic: "indices",
    equation: "15x^9 ÷ 3x^3",
    answer: "5x^6",
    difficulty: "medium",
    type: "one-step",
    basePoints: 20,
    steps: [
      { action: "simplify", law: "divide", value: "5x^6", target: "expression", result: "5x^6",
        wrong: ["12x^6", "5x^3", "5x^12"], wrongKinds: ["coefficient", "powerOp", "powerOp"] }
    ],
    hints: {
      en: ["Divide the numbers (15 ÷ 3) and subtract the powers (9 - 3)."],
      ja: ["数をわって（15 ÷ 3）、指数を引く（9 - 3）。"]
    },
    explanation: {
      en: "15 ÷ 3 = 5 and 9 - 3 = 6, so 5x^6. Subtracting the numbers (12x^6) is a common slip — the numbers in front divide.",
      ja: "15 ÷ 3 = 5、9 - 3 = 6 で 5x^6。前の数を引いて 12x^6 にしないように — 前の数はわり算です。"
    }
  },
  {
    id: "indices_medium_05",
    topic: "indices",
    equation: "6x × 2x^4",
    answer: "12x^5",
    difficulty: "medium",
    type: "one-step",
    basePoints: 20,
    steps: [
      { action: "simplify", law: "multiply", value: "12x^5", target: "expression", result: "12x^5",
        wrong: ["8x^5", "12x^4", "12x^3"], wrongKinds: ["coefficient", "lonePower", "powerOp"] }
    ],
    hints: {
      en: ["Multiply 6 × 2. The lone x is x^1, so add 1 + 4."],
      ja: ["6 × 2 をかける。xだけのときは x^1 なので、1 + 4。"]
    },
    explanation: {
      en: "Numbers multiply: 6 × 2 = 12. 6x has x^1, so the powers add to 1 + 4 = 5. That gives 12x^5.",
      ja: "数はかけ算で 6 × 2 = 12。6x のxは x^1 なので、指数は 1 + 4 = 5。答えは 12x^5 です。"
    }
  },
  {
    id: "indices_medium_06",
    topic: "indices",
    equation: "(x^3)^2 × x^4",
    answer: "x^10",
    difficulty: "medium",
    type: "two-step",
    basePoints: 20,
    steps: [
      { action: "simplify", law: "power", value: "x^6 × x^4", target: "expression", result: "x^6 × x^4",
        wrong: ["x^5 × x^4", "x^9 × x^4", "2x^3 × x^4"], wrongKinds: ["powerOp", "generic", "coefficient"] },
      { action: "simplify", law: "multiply", value: "x^10", target: "expression", result: "x^10",
        wrong: ["x^24", "x^2", "2x^10"], wrongKinds: ["powerOp", "powerOp", "coefficient"] }
    ],
    hints: {
      en: [
        "Bracket first: a power of a power, so 3 × 2.",
        "Now x^6 × x^4: add the powers."
      ],
      ja: [
        "まずかっこ：累乗の累乗なので 3 × 2。",
        "次に x^6 × x^4：指数を足す。"
      ]
    },
    explanation: {
      en: "Do the bracket first: (x^3)^2 = x^6, because a power of a power multiplies. Then x^6 × x^4 adds the powers: 6 + 4 = 10, so x^10.",
      ja: "まずかっこ：累乗の累乗は指数をかけるので (x^3)^2 = x^6。次に x^6 × x^4 は指数を足して 6 + 4 = 10、答えは x^10 です。"
    }
  },
  {
    id: "indices_medium_07",
    topic: "indices",
    equation: "x^8 ÷ (x^2)^3",
    answer: "x^2",
    difficulty: "medium",
    type: "two-step",
    basePoints: 20,
    steps: [
      { action: "simplify", law: "power", value: "x^8 ÷ x^6", target: "expression", result: "x^8 ÷ x^6",
        wrong: ["x^8 ÷ x^5", "x^8 ÷ x^8", "x^8 ÷ x^9"], wrongKinds: ["powerOp", "generic", "generic"] },
      { action: "simplify", law: "divide", value: "x^2", target: "expression", result: "x^2",
        wrong: ["x^14", "x^48", "x^3"], wrongKinds: ["powerOp", "powerOp", "generic"] }
    ],
    hints: {
      en: [
        "Bracket first: (x^2)^3, so multiply 2 × 3.",
        "Now x^8 ÷ x^6: subtract the powers."
      ],
      ja: [
        "まずかっこ：(x^2)^3 なので 2 × 3。",
        "次に x^8 ÷ x^6：指数を引く。"
      ]
    },
    explanation: {
      en: "(x^2)^3 = x^6, so the problem is x^8 ÷ x^6. Dividing subtracts the powers: 8 - 6 = 2, giving x^2.",
      ja: "(x^2)^3 = x^6 なので、問題は x^8 ÷ x^6 になります。わり算は指数を引いて 8 - 6 = 2、答えは x^2 です。"
    }
  },
  {
    id: "indices_medium_08",
    topic: "indices",
    equation: "4x^3 × 3x^2 ÷ 6x",
    answer: "2x^4",
    difficulty: "medium",
    type: "two-step",
    basePoints: 20,
    steps: [
      { action: "simplify", law: "multiply", value: "12x^5 ÷ 6x", target: "expression", result: "12x^5 ÷ 6x",
        wrong: ["7x^5 ÷ 6x", "12x^6 ÷ 6x", "12x ÷ 6x"], wrongKinds: ["coefficient", "powerOp", "powerOp"] },
      { action: "simplify", law: "divide", value: "2x^4", target: "expression", result: "2x^4",
        wrong: ["6x^4", "2x^5", "2x^6"], wrongKinds: ["coefficient", "lonePower", "powerOp"] }
    ],
    hints: {
      en: [
        "Multiply first: 4 × 3, and add 3 + 2.",
        "Now 12x^5 ÷ 6x: 12 ÷ 6, and 5 - 1 (x is x^1)."
      ],
      ja: [
        "まずかけ算：4 × 3、指数は 3 + 2。",
        "次に 12x^5 ÷ 6x：12 ÷ 6、指数は 5 - 1（xは x^1）。"
      ]
    },
    explanation: {
      en: "4x^3 × 3x^2 = 12x^5: numbers multiply, powers add. Then 12x^5 ÷ 6x: 12 ÷ 6 = 2, and 5 - 1 = 4 because 6x has x^1. So 2x^4.",
      ja: "4x^3 × 3x^2 = 12x^5（数はかけ算、指数は足し算）。次に 12x^5 ÷ 6x：12 ÷ 6 = 2、6x のxは x^1 なので 5 - 1 = 4。答えは 2x^4 です。"
    }
  },
  {
    id: "indices_medium_09",
    topic: "indices",
    equation: "6x^5y^4 ÷ 2x^2y",
    answer: "3x^3y^3",
    difficulty: "medium",
    type: "one-step",
    basePoints: 20,
    steps: [
      { action: "simplify", law: "divide", value: "3x^3y^3", target: "expression", result: "3x^3y^3",
        wrong: ["4x^3y^3", "3x^3y^4", "3x^6"], wrongKinds: ["coefficient", "lonePower", "unlikeTerms"] }
    ],
    hints: {
      en: ["Divide 6 ÷ 2. Then each letter on its own: x 5 - 2, y 4 - 1."],
      ja: ["6 ÷ 2 をわる。文字ごとに：xは 5 - 2、yは 4 - 1。"]
    },
    explanation: {
      en: "Numbers divide: 6 ÷ 2 = 3. Each letter subtracts its own powers: x: 5 - 2 = 3, y: 4 - 1 = 3 (the lone y is y^1). So 3x^3y^3.",
      ja: "数はわり算で 6 ÷ 2 = 3。指数は文字ごとに引きます：x：5 - 2 = 3、y：4 - 1 = 3（yだけのときは y^1）。答えは 3x^3y^3 です。"
    }
  },
  {
    id: "indices_medium_10",
    topic: "indices",
    equation: "3x^2 × 2x^3 × x",
    answer: "6x^6",
    difficulty: "medium",
    type: "two-step",
    basePoints: 20,
    steps: [
      { action: "simplify", law: "multiply", value: "6x^5 × x", target: "expression", result: "6x^5 × x",
        wrong: ["5x^5 × x", "6x × x", "3x^5 × x"], wrongKinds: ["coefficient", "powerOp", "coefficient"] },
      { action: "simplify", law: "multiply", value: "6x^6", target: "expression", result: "6x^6",
        wrong: ["6x^5", "7x^6", "6x^4"], wrongKinds: ["lonePower", "coefficient", "powerOp"] }
    ],
    hints: {
      en: [
        "Multiply the first two: 3 × 2, and add 2 + 3.",
        "Now 6x^5 × x: x is x^1, so add 5 + 1."
      ],
      ja: [
        "最初の2つをかける：3 × 2、指数は 2 + 3。",
        "次に 6x^5 × x：xは x^1 なので 5 + 1。"
      ]
    },
    explanation: {
      en: "3x^2 × 2x^3 = 6x^5. Then × x adds one more to the power, since x is x^1: 6x^6. The number stays 6, because x has 1 in front.",
      ja: "3x^2 × 2x^3 = 6x^5。次に × x は、xが x^1 なので指数が1増えて 6x^6。xの前の数は1なので、6はそのままです。"
    }
  },
 
  // ---- Hard: brackets with a number, zero and negative powers ----
  // Answers are written with positive powers, so a negative power ends with a "positive" step.
  // Levels 3, 4 and 7 use the zero rule; 5, 6, 8 and 10 end with a negative power.
  {
    id: "indices_hard_01",
    topic: "indices",
    equation: "(2x^3)^2",
    answer: "4x^6",
    difficulty: "hard",
    type: "one-step",
    basePoints: 30,
    steps: [
      { action: "simplify", law: "power", value: "4x^6", target: "expression", result: "4x^6",
        wrong: ["2x^6", "4x^5", "4x^9"], wrongKinds: ["coefficient", "powerOp", "generic"] }
    ],
    hints: {
      en: ["The power applies to everything in the bracket: square the 2 and multiply the powers 3 × 2."],
      ja: ["かっこの外の指数は中のすべてにかかる：2を2乗し、指数は 3 × 2。"]
    },
    explanation: {
      en: "(2x^3)^2 = 2x^3 × 2x^3, so the 2 is squared too: 2^2 = 4. The powers multiply: 3 × 2 = 6. That gives 4x^6 — forgetting to square the 2 gives 2x^6.",
      ja: "(2x^3)^2 = 2x^3 × 2x^3 なので、2も2乗されます：2^2 = 4。指数はかけて 3 × 2 = 6。答えは 4x^6 — 2を2乗し忘れると 2x^6 になってしまいます。"
    }
  },
  {
    id: "indices_hard_02",
    topic: "indices",
    equation: "(3x^2)^3",
    answer: "27x^6",
    difficulty: "hard",
    type: "one-step",
    basePoints: 30,
    steps: [
      { action: "simplify", law: "power", value: "27x^6", target: "expression", result: "27x^6",
        wrong: ["3x^6", "9x^6", "27x^5"], wrongKinds: ["coefficient", "coefficient", "powerOp"] }
    ],
    hints: {
      en: ["Cube the 3 (3 × 3 × 3) and multiply the powers 2 × 3."],
      ja: ["3を3乗し（3 × 3 × 3）、指数は 2 × 3。"]
    },
    explanation: {
      en: "Everything inside is cubed: 3^3 = 27 (not 9, and not 3), and (x^2)^3 = x^6. So 27x^6.",
      ja: "中のすべてが3乗されます：3^3 = 27（9でも3でもありません）、(x^2)^3 = x^6。答えは 27x^6 です。"
    }
  },
  {
    id: "indices_hard_03",
    topic: "indices",
    equation: "5x^0",
    answer: "5",
    difficulty: "hard",
    type: "one-step",
    basePoints: 30,
    steps: [
      { action: "simplify", law: "zero", value: "5", target: "expression", result: "5",
        wrong: ["0", "5x", "1"], wrongKinds: ["zeroPower", "zeroPower", "zeroPower"] }
    ],
    hints: {
      en: ["Zero rule: anything to the power 0 is 1. Only the x has the power."],
      ja: ["0乗のルール：0乗はいつも1。指数がついているのはxだけ。"]
    },
    explanation: {
      en: "x^0 = 1, so 5x^0 = 5 × 1 = 5. The power belongs only to x, so the 5 stays. And it's not 0 — x^0 is 1.",
      ja: "x^0 = 1 なので、5x^0 = 5 × 1 = 5。指数はxだけにかかるので、5はそのまま。0にはなりません — x^0 は1です。"
    }
  },
  {
    id: "indices_hard_04",
    topic: "indices",
    equation: "x^4 ÷ x^4",
    answer: "1",
    difficulty: "hard",
    type: "two-step",
    basePoints: 30,
    steps: [
      { action: "simplify", law: "divide", value: "x^0", target: "expression", result: "x^0",
        wrong: ["x", "x^8", "x^16"], wrongKinds: ["powerOp", "powerOp", "powerOp"] },
      { action: "simplify", law: "zero", value: "1", target: "expression", result: "1",
        wrong: ["0", "x", "4"], wrongKinds: ["zeroPower", "zeroPower", "generic"] }
    ],
    hints: {
      en: [
        "Subtract the powers: 4 - 4.",
        "Zero rule: x^0 = 1."
      ],
      ja: [
        "指数を引く：4 - 4。",
        "0乗のルール：x^0 = 1。"
      ]
    },
    explanation: {
      en: "x^4 ÷ x^4 = x^0 by the divide rule. But anything divided by itself is 1 — that's exactly why x^0 = 1.",
      ja: "わり算のルールで x^4 ÷ x^4 = x^0。でも、同じものどうしのわり算は1 — だから x^0 = 1 なのです。"
    }
  },
  {
    id: "indices_hard_05",
    topic: "indices",
    equation: "x^2 × x^-5",
    answer: "1/x^3",
    difficulty: "hard",
    type: "two-step",
    basePoints: 30,
    steps: [
      { action: "simplify", law: "multiply", value: "x^-3", target: "expression", result: "x^-3",
        wrong: ["x^-10", "x^7", "x^3"], wrongKinds: ["powerOp", "powerOp", "powerOp"] },
      { action: "simplify", law: "positive", value: "1/x^3", target: "expression", result: "1/x^3",
        wrong: ["-x^3", "x^3", "-1/x^3"], wrongKinds: ["negPower", "negPower", "negPower"] }
    ],
    hints: {
      en: [
        "Add the powers, sign included: 2 + (-5).",
        "A negative power means one over: x^-3 = 1/x^3."
      ],
      ja: [
        "符号ごと指数を足す：2 + (-5)。",
        "負の指数は「1分の」：x^-3 = 1/x^3。"
      ]
    },
    explanation: {
      en: "Adding the powers gives 2 + (-5) = -3, so x^-3. A negative power doesn't make the answer negative — it means one over the positive power: x^-3 = 1/x^3.",
      ja: "指数を足すと 2 + (-5) = -3 で x^-3。負の指数は答えをマイナスにするのではなく、「正の指数の1分の」という意味です：x^-3 = 1/x^3。"
    }
  },
  {
    id: "indices_hard_06",
    topic: "indices",
    equation: "x^3 ÷ x^7",
    answer: "1/x^4",
    difficulty: "hard",
    type: "two-step",
    basePoints: 30,
    steps: [
      { action: "simplify", law: "divide", value: "x^-4", target: "expression", result: "x^-4",
        wrong: ["x^4", "x^10", "x^21"], wrongKinds: ["powerOp", "powerOp", "powerOp"] },
      { action: "simplify", law: "positive", value: "1/x^4", target: "expression", result: "1/x^4",
        wrong: ["-x^4", "x^4", "-1/x^4"], wrongKinds: ["negPower", "negPower", "negPower"] }
    ],
    hints: {
      en: [
        "Subtract the powers in order: 3 - 7.",
        "Write x^-4 with a positive power."
      ],
      ja: [
        "順番どおりに指数を引く：3 - 7。",
        "x^-4 を正の指数で書く。"
      ]
    },
    explanation: {
      en: "3 - 7 = -4, so x^-4. There are more x's underneath (7) than on top (3), so 4 are left on the bottom: 1/x^4.",
      ja: "3 - 7 = -4 で x^-4。下のx（7個）が上（3個）より多いので、下に4個残ります：1/x^4。"
    }
  },
  {
    id: "indices_hard_07",
    topic: "indices",
    equation: "7x^3 ÷ x^3",
    answer: "7",
    difficulty: "hard",
    type: "two-step",
    basePoints: 30,
    steps: [
      { action: "simplify", law: "divide", value: "7x^0", target: "expression", result: "7x^0",
        wrong: ["7x", "7x^6", "6x^0"], wrongKinds: ["powerOp", "powerOp", "coefficient"] },
      { action: "simplify", law: "zero", value: "7", target: "expression", result: "7",
        wrong: ["0", "7x", "1"], wrongKinds: ["zeroPower", "zeroPower", "zeroPower"] }
    ],
    hints: {
      en: [
        "Subtract the powers: 3 - 3. The 7 has nothing to divide by, so it stays.",
        "Zero rule: x^0 = 1, so 7x^0 = 7 × 1."
      ],
      ja: [
        "指数を引く：3 - 3。7はわる相手がないので、そのまま。",
        "0乗のルール：x^0 = 1 なので、7x^0 = 7 × 1。"
      ]
    },
    explanation: {
      en: "The x^3 parts cancel: 3 - 3 = 0, leaving 7x^0. Since x^0 = 1, the answer is 7.",
      ja: "x^3 どうしが約分されて 3 - 3 = 0、残りは 7x^0。x^0 = 1 なので、答えは7です。"
    }
  },
  {
    id: "indices_hard_08",
    topic: "indices",
    equation: "(x^-2)^3",
    answer: "1/x^6",
    difficulty: "hard",
    type: "two-step",
    basePoints: 30,
    steps: [
      { action: "simplify", law: "power", value: "x^-6", target: "expression", result: "x^-6",
        wrong: ["x", "x^6", "x^-8"], wrongKinds: ["powerOp", "powerOp", "generic"] },
      { action: "simplify", law: "positive", value: "1/x^6", target: "expression", result: "1/x^6",
        wrong: ["-x^6", "x^6", "-1/x^6"], wrongKinds: ["negPower", "negPower", "negPower"] }
    ],
    hints: {
      en: [
        "Power of a power: multiply -2 × 3.",
        "Write x^-6 with a positive power."
      ],
      ja: [
        "累乗の累乗：-2 × 3。",
        "x^-6 を正の指数で書く。"
      ]
    },
    explanation: {
      en: "-2 × 3 = -6, so (x^-2)^3 = x^-6. Then x^-6 = 1/x^6.",
      ja: "-2 × 3 = -6 なので、(x^-2)^3 = x^-6。そして x^-6 = 1/x^6 です。"
    }
  },
  {
    id: "indices_hard_09",
    topic: "indices",
    equation: "(2x^4)^3 ÷ 4x^5",
    answer: "2x^7",
    difficulty: "hard",
    type: "two-step",
    basePoints: 30,
    steps: [
      { action: "simplify", law: "power", value: "8x^12 ÷ 4x^5", target: "expression", result: "8x^12 ÷ 4x^5",
        wrong: ["2x^12 ÷ 4x^5", "8x^7 ÷ 4x^5", "6x^12 ÷ 4x^5"], wrongKinds: ["coefficient", "powerOp", "coefficient"] },
      { action: "simplify", law: "divide", value: "2x^7", target: "expression", result: "2x^7",
        wrong: ["4x^7", "2x^17", "32x^7"], wrongKinds: ["coefficient", "powerOp", "coefficient"] }
    ],
    hints: {
      en: [
        "Bracket first: 2^3 = 8, and multiply the powers 4 × 3.",
        "Now divide 8 ÷ 4 and subtract 12 - 5."
      ],
      ja: [
        "まずかっこ：2^3 = 8、指数は 4 × 3。",
        "次に 8 ÷ 4、指数は 12 - 5。"
      ]
    },
    explanation: {
      en: "(2x^4)^3 = 8x^12: the 2 is cubed and the powers multiply. Then 8x^12 ÷ 4x^5: 8 ÷ 4 = 2 and 12 - 5 = 7. So 2x^7.",
      ja: "(2x^4)^3 = 8x^12（2を3乗し、指数はかける）。次に 8x^12 ÷ 4x^5：8 ÷ 4 = 2、12 - 5 = 7。答えは 2x^7 です。"
    }
  },
  {
    id: "indices_hard_10",
    topic: "indices",
    equation: "(3x^3)^2 × x^-8",
    answer: "9/x^2",
    difficulty: "hard",
    type: "three-step",
    basePoints: 30,
    steps: [
      { action: "simplify", law: "power", value: "9x^6 × x^-8", target: "expression", result: "9x^6 × x^-8",
        wrong: ["3x^6 × x^-8", "6x^6 × x^-8", "9x^5 × x^-8"], wrongKinds: ["coefficient", "coefficient", "powerOp"] },
      { action: "simplify", law: "multiply", value: "9x^-2", target: "expression", result: "9x^-2",
        wrong: ["9x^-48", "9x^14", "9x^2"], wrongKinds: ["powerOp", "powerOp", "powerOp"] },
      { action: "simplify", law: "positive", value: "9/x^2", target: "expression", result: "9/x^2",
        wrong: ["-9x^2", "9x^2", "1/(9x^2)"], wrongKinds: ["negPower", "negPower", "negPower"] }
    ],
    hints: {
      en: [
        "Bracket first: 3^2 = 9, and multiply the powers 3 × 2.",
        "Add the powers: 6 + (-8).",
        "Only x has the negative power, so only x goes under the line."
      ],
      ja: [
        "まずかっこ：3^2 = 9、指数は 3 × 2。",
        "指数を足す：6 + (-8)。",
        "負の指数がついているのはxだけなので、下に行くのはxだけ。"
      ]
    },
    explanation: {
      en: "(3x^3)^2 = 9x^6, then 6 + (-8) = -2 gives 9x^-2. The power belongs to x, not the 9, so 9x^-2 = 9/x^2 — not 1/(9x^2).",
      ja: "(3x^3)^2 = 9x^6、次に 6 + (-8) = -2 で 9x^-2。指数はxだけにかかり9にはかからないので、9x^-2 = 9/x^2 です。1/(9x^2) ではありません。"
    }
  },

  // =====================================================================
  // COMPLETING THE SQUARE (topic key: roots)
  // =====================================================================

  // ---- Easy: square root both sides (x² = k, then (x + a)² = k) ----
  // Levels 1-2 are one step; 9-10 move the number first (a normal + step, like Quadratics Hard).
  {
    id: "roots_easy_01",
    topic: "roots",
    equation: "x² = 36",
    answer: [-6, 6],
    difficulty: "easy",
    type: "square-root",
    basePoints: 10,
    steps: [
      { action: "sqrt", value: "x = -6, 6", target: "both-sides", result: "x = -6, 6",
        wrong: ["x = 6", "x = -18, 18", "x = -36, 36"], wrongKinds: ["plusMinus", "rootSlip", "rootSlip"] }
    ],
    hints: {
      en: ["Undo the square with a square root. Both 6 and -6 square to 36, so there are two answers."],
      ja: ["平方根で2乗を戻します。6も-6も2乗すると36なので、答えは2つ。"]
    },
    explanation: {
      en: "√36 = 6, but (-6)² = 36 too, so x = -6 or x = 6. An equation with x² usually has two answers.",
      ja: "√36 = 6。でも (-6)² = 36 でもあるので、x = -6 または x = 6。x² の方程式には、ふつう答えが2つあります。"
    }
  },
  {
    id: "roots_easy_02",
    topic: "roots",
    equation: "x² = 64",
    answer: [-8, 8],
    difficulty: "easy",
    type: "square-root",
    basePoints: 10,
    steps: [
      { action: "sqrt", value: "x = -8, 8", target: "both-sides", result: "x = -8, 8",
        wrong: ["x = 8", "x = -32, 32", "x = -64, 64"], wrongKinds: ["plusMinus", "rootSlip", "rootSlip"] }
    ],
    hints: {
      en: ["Undo the square with a square root. Both 8 and -8 square to 64, so there are two answers."],
      ja: ["平方根で2乗を戻します。8も-8も2乗すると64なので、答えは2つ。"]
    },
    explanation: {
      en: "√64 = 8, but (-8)² = 64 too, so x = -8 or x = 8. An equation with x² usually has two answers.",
      ja: "√64 = 8。でも (-8)² = 64 でもあるので、x = -8 または x = 8。x² の方程式には、ふつう答えが2つあります。"
    }
  },
  {
    id: "roots_easy_03",
    topic: "roots",
    equation: "(x + 3)² = 16",
    answer: [-7, 1],
    difficulty: "easy",
    type: "perfect-square",
    basePoints: 10,
    steps: [
      { action: "sqrt", value: "x + 3 = ±4", target: "both-sides", result: "x + 3 = ±4",
        wrong: ["x + 3 = 4", "x + 3 = ±16", "x - 3 = ±4"], wrongKinds: ["plusMinus", "rootSlip", "undoSign"] },
      { action: "roots", value: "x = -7, 1", target: "both-sides", result: "x = -7, 1",
        wrong: ["x = -1, 7", "x = 1", "x = -4, 4"], wrongKinds: ["undoSign", "plusMinus", "generic"] }
    ],
    hints: {
      en: [
        "Take the square root of both sides. √16 = 4, and don't forget ±.",
        "Subtract 3 from both sides: x = -3 + 4 and x = -3 - 4."
      ],
      ja: [
        "両辺の平方根をとる。√16 = 4、±を忘れずに。",
        "両辺から3を引く：x = -3 + 4 と x = -3 - 4。"
      ]
    },
    explanation: {
      en: "√16 = 4, so x + 3 = ±4. x = -3 + 4 = 1 or x = -3 - 4 = -7, so x = -7 or x = 1.",
      ja: "√16 = 4 なので x + 3 = ±4。x = -3 + 4 = 1、または x = -3 - 4 = -7 なので、x = -7 または x = 1。"
    }
  },
  {
    id: "roots_easy_04",
    topic: "roots",
    equation: "(x - 2)² = 9",
    answer: [-1, 5],
    difficulty: "easy",
    type: "perfect-square",
    basePoints: 10,
    steps: [
      { action: "sqrt", value: "x - 2 = ±3", target: "both-sides", result: "x - 2 = ±3",
        wrong: ["x - 2 = 3", "x - 2 = ±9", "x + 2 = ±3"], wrongKinds: ["plusMinus", "rootSlip", "undoSign"] },
      { action: "roots", value: "x = -1, 5", target: "both-sides", result: "x = -1, 5",
        wrong: ["x = -5, 1", "x = 5", "x = -3, 3"], wrongKinds: ["undoSign", "plusMinus", "generic"] }
    ],
    hints: {
      en: [
        "Take the square root of both sides. √9 = 3, and don't forget ±.",
        "Add 2 to both sides: x = 2 + 3 and x = 2 - 3."
      ],
      ja: [
        "両辺の平方根をとる。√9 = 3、±を忘れずに。",
        "両辺に2を足す：x = 2 + 3 と x = 2 - 3。"
      ]
    },
    explanation: {
      en: "√9 = 3, so x - 2 = ±3. x = 2 + 3 = 5 or x = 2 - 3 = -1, so x = -1 or x = 5.",
      ja: "√9 = 3 なので x - 2 = ±3。x = 2 + 3 = 5、または x = 2 - 3 = -1 なので、x = -1 または x = 5。"
    }
  },
  {
    id: "roots_easy_05",
    topic: "roots",
    equation: "(x + 5)² = 25",
    answer: [-10, 0],
    difficulty: "easy",
    type: "perfect-square",
    basePoints: 10,
    steps: [
      { action: "sqrt", value: "x + 5 = ±5", target: "both-sides", result: "x + 5 = ±5",
        wrong: ["x + 5 = 5", "x + 5 = ±25", "x - 5 = ±5"], wrongKinds: ["plusMinus", "rootSlip", "undoSign"] },
      { action: "roots", value: "x = -10, 0", target: "both-sides", result: "x = -10, 0",
        wrong: ["x = 0, 10", "x = 0", "x = -5, 5"], wrongKinds: ["undoSign", "plusMinus", "generic"] }
    ],
    hints: {
      en: [
        "Take the square root of both sides. √25 = 5, and don't forget ±.",
        "Subtract 5 from both sides: x = -5 + 5 and x = -5 - 5."
      ],
      ja: [
        "両辺の平方根をとる。√25 = 5、±を忘れずに。",
        "両辺から5を引く：x = -5 + 5 と x = -5 - 5。"
      ]
    },
    explanation: {
      en: "√25 = 5, so x + 5 = ±5. x = -5 + 5 = 0 or x = -5 - 5 = -10, so x = -10 or x = 0.",
      ja: "√25 = 5 なので x + 5 = ±5。x = -5 + 5 = 0、または x = -5 - 5 = -10 なので、x = -10 または x = 0。"
    }
  },
  {
    id: "roots_easy_06",
    topic: "roots",
    equation: "(x - 6)² = 49",
    answer: [-1, 13],
    difficulty: "easy",
    type: "perfect-square",
    basePoints: 10,
    steps: [
      { action: "sqrt", value: "x - 6 = ±7", target: "both-sides", result: "x - 6 = ±7",
        wrong: ["x - 6 = 7", "x - 6 = ±49", "x + 6 = ±7"], wrongKinds: ["plusMinus", "rootSlip", "undoSign"] },
      { action: "roots", value: "x = -1, 13", target: "both-sides", result: "x = -1, 13",
        wrong: ["x = -13, 1", "x = 13", "x = -7, 7"], wrongKinds: ["undoSign", "plusMinus", "generic"] }
    ],
    hints: {
      en: [
        "Take the square root of both sides. √49 = 7, and don't forget ±.",
        "Add 6 to both sides: x = 6 + 7 and x = 6 - 7."
      ],
      ja: [
        "両辺の平方根をとる。√49 = 7、±を忘れずに。",
        "両辺に6を足す：x = 6 + 7 と x = 6 - 7。"
      ]
    },
    explanation: {
      en: "√49 = 7, so x - 6 = ±7. x = 6 + 7 = 13 or x = 6 - 7 = -1, so x = -1 or x = 13.",
      ja: "√49 = 7 なので x - 6 = ±7。x = 6 + 7 = 13、または x = 6 - 7 = -1 なので、x = -1 または x = 13。"
    }
  },
  {
    id: "roots_easy_07",
    topic: "roots",
    equation: "(x + 1)² = 36",
    answer: [-7, 5],
    difficulty: "easy",
    type: "perfect-square",
    basePoints: 10,
    steps: [
      { action: "sqrt", value: "x + 1 = ±6", target: "both-sides", result: "x + 1 = ±6",
        wrong: ["x + 1 = 6", "x + 1 = ±36", "x - 1 = ±6"], wrongKinds: ["plusMinus", "rootSlip", "undoSign"] },
      { action: "roots", value: "x = -7, 5", target: "both-sides", result: "x = -7, 5",
        wrong: ["x = -5, 7", "x = 5", "x = -6, 6"], wrongKinds: ["undoSign", "plusMinus", "generic"] }
    ],
    hints: {
      en: [
        "Take the square root of both sides. √36 = 6, and don't forget ±.",
        "Subtract 1 from both sides: x = -1 + 6 and x = -1 - 6."
      ],
      ja: [
        "両辺の平方根をとる。√36 = 6、±を忘れずに。",
        "両辺から1を引く：x = -1 + 6 と x = -1 - 6。"
      ]
    },
    explanation: {
      en: "√36 = 6, so x + 1 = ±6. x = -1 + 6 = 5 or x = -1 - 6 = -7, so x = -7 or x = 5.",
      ja: "√36 = 6 なので x + 1 = ±6。x = -1 + 6 = 5、または x = -1 - 6 = -7 なので、x = -7 または x = 5。"
    }
  },
  {
    id: "roots_easy_08",
    topic: "roots",
    equation: "(x - 4)² = 100",
    answer: [-6, 14],
    difficulty: "easy",
    type: "perfect-square",
    basePoints: 10,
    steps: [
      { action: "sqrt", value: "x - 4 = ±10", target: "both-sides", result: "x - 4 = ±10",
        wrong: ["x - 4 = 10", "x - 4 = ±100", "x + 4 = ±10"], wrongKinds: ["plusMinus", "rootSlip", "undoSign"] },
      { action: "roots", value: "x = -6, 14", target: "both-sides", result: "x = -6, 14",
        wrong: ["x = -14, 6", "x = 14", "x = -10, 10"], wrongKinds: ["undoSign", "plusMinus", "generic"] }
    ],
    hints: {
      en: [
        "Take the square root of both sides. √100 = 10, and don't forget ±.",
        "Add 4 to both sides: x = 4 + 10 and x = 4 - 10."
      ],
      ja: [
        "両辺の平方根をとる。√100 = 10、±を忘れずに。",
        "両辺に4を足す：x = 4 + 10 と x = 4 - 10。"
      ]
    },
    explanation: {
      en: "√100 = 10, so x - 4 = ±10. x = 4 + 10 = 14 or x = 4 - 10 = -6, so x = -6 or x = 14.",
      ja: "√100 = 10 なので x - 4 = ±10。x = 4 + 10 = 14、または x = 4 - 10 = -6 なので、x = -6 または x = 14。"
    }
  },
  {
    id: "roots_easy_09",
    topic: "roots",
    equation: "(x + 2)² - 9 = 0",
    answer: [-5, 1],
    difficulty: "easy",
    type: "perfect-square-move",
    basePoints: 10,
    steps: [
      { action: "add", value: 9, target: "both-sides", result: "(x + 2)² = 9" },
      { action: "sqrt", value: "x + 2 = ±3", target: "both-sides", result: "x + 2 = ±3",
        wrong: ["x + 2 = 3", "x + 2 = ±9", "x - 2 = ±3"], wrongKinds: ["plusMinus", "rootSlip", "undoSign"] },
      { action: "roots", value: "x = -5, 1", target: "both-sides", result: "x = -5, 1",
        wrong: ["x = -1, 5", "x = 1", "x = -3, 3"], wrongKinds: ["undoSign", "plusMinus", "generic"] }
    ],
    hints: {
      en: [
        "Get the square on its own: add 9 to both sides.",
        "Take the square root of both sides. √9 = 3, and don't forget ±.",
        "Subtract 2 from both sides: x = -2 + 3 and x = -2 - 3."
      ],
      ja: [
        "2乗の部分だけを残す：両辺に9を足す。",
        "両辺の平方根をとる。√9 = 3、±を忘れずに。",
        "両辺から2を引く：x = -2 + 3 と x = -2 - 3。"
      ]
    },
    explanation: {
      en: "Add 9 first, so the square is on its own: (x + 2)² = 9. Then √9 = 3, so x + 2 = ±3. x = -2 + 3 = 1 or x = -2 - 3 = -5, so x = -5 or x = 1.",
      ja: "まず9を足して、2乗の部分だけにします：(x + 2)² = 9。√9 = 3 なので x + 2 = ±3。x = -2 + 3 = 1、または x = -2 - 3 = -5 なので、x = -5 または x = 1。"
    }
  },
  {
    id: "roots_easy_10",
    topic: "roots",
    equation: "(x - 3)² - 64 = 0",
    answer: [-5, 11],
    difficulty: "easy",
    type: "perfect-square-move",
    basePoints: 10,
    steps: [
      { action: "add", value: 64, target: "both-sides", result: "(x - 3)² = 64" },
      { action: "sqrt", value: "x - 3 = ±8", target: "both-sides", result: "x - 3 = ±8",
        wrong: ["x - 3 = 8", "x - 3 = ±64", "x + 3 = ±8"], wrongKinds: ["plusMinus", "rootSlip", "undoSign"] },
      { action: "roots", value: "x = -5, 11", target: "both-sides", result: "x = -5, 11",
        wrong: ["x = -11, 5", "x = 11", "x = -8, 8"], wrongKinds: ["undoSign", "plusMinus", "generic"] }
    ],
    hints: {
      en: [
        "Get the square on its own: add 64 to both sides.",
        "Take the square root of both sides. √64 = 8, and don't forget ±.",
        "Add 3 to both sides: x = 3 + 8 and x = 3 - 8."
      ],
      ja: [
        "2乗の部分だけを残す：両辺に64を足す。",
        "両辺の平方根をとる。√64 = 8、±を忘れずに。",
        "両辺に3を足す：x = 3 + 8 と x = 3 - 8。"
      ]
    },
    explanation: {
      en: "Add 64 first, so the square is on its own: (x - 3)² = 64. Then √64 = 8, so x - 3 = ±8. x = 3 + 8 = 11 or x = 3 - 8 = -5, so x = -5 or x = 11.",
      ja: "まず64を足して、2乗の部分だけにします：(x - 3)² = 64。√64 = 8 なので x - 3 = ±8。x = 3 + 8 = 11、または x = 3 - 8 = -5 なので、x = -5 または x = 11。"
    }
  },

  // ---- Medium: complete the square from x² + bx + c = 0 (b always even, so half of b is whole) ----
  // Five steps, so every number shows: move the number, add (b/2)² to both sides (16 + 9 stays on the card),
  // write the left side as a square, √ both sides, solve. Step 2's wrong moves are authored `moves`, like Formulas.
  {
    id: "roots_medium_01",
    topic: "roots",
    equation: "x² + 6x - 16 = 0",
    answer: [-8, 2],
    difficulty: "medium",
    type: "complete-square",
    basePoints: 20,
    steps: [
      { action: "add", value: 16, prompt: "moveNumberPrompt", target: "both-sides", result: "x² + 6x = 16" },
      { action: "add", value: 9, prompt: "addSquarePrompt", target: "both-sides", result: "x² + 6x + 9 = 16 + 9",
        moves: [{ action: "add", value: 36, kind: "halfB" }, { action: "add", value: 3, kind: "squareHalf" }, { action: "subtract", value: 9, kind: "wrongWay" }] },
      { action: "complete", value: "(x + 3)² = 25", target: "both-sides", result: "(x + 3)² = 25",
        wrong: ["(x + 9)² = 25", "(x - 3)² = 25", "(x + 3)² = 7"], wrongKinds: ["halfB", "undoSign", "generic"] },
      { action: "sqrt", value: "x + 3 = ±5", target: "both-sides", result: "x + 3 = ±5",
        wrong: ["x + 3 = 5", "x + 3 = ±25", "x - 3 = ±5"], wrongKinds: ["plusMinus", "rootSlip", "undoSign"] },
      { action: "roots", value: "x = -8, 2", target: "both-sides", result: "x = -8, 2",
        wrong: ["x = -2, 8", "x = 2", "x = -5, 5"], wrongKinds: ["undoSign", "plusMinus", "generic"] }
    ],
    hints: {
      en: [
        "Move the number first: add 16 to both sides.",
        "(x + n)² = x² + 2n·x + n². Here 2n = 6, so n = 3 and n² = 9: add 9 to both sides.",
        "(x + 3)² = x² + 3x + 3x + 9 = x² + 6x + 9, so the left side is (x + 3)². Right side: 16 + 9 = 25.",
        "Take the square root of both sides. √25 = 5, and don't forget ±.",
        "Subtract 3 from both sides: x = -3 + 5 and x = -3 - 5."
      ],
      ja: [
        "まず数を移す：両辺に16を足す。",
        "(x + n)² = x² + 2n·x + n²。ここでは 2n = 6 なので n = 3、n² = 9：両辺に9を足す。",
        "(x + 3)² = x² + 3x + 3x + 9 = x² + 6x + 9 なので、左辺は (x + 3)²。右辺は 16 + 9 = 25。",
        "両辺の平方根をとる。√25 = 5、±を忘れずに。",
        "両辺から3を引く：x = -3 + 5 と x = -3 - 5。"
      ]
    },
    explanation: {
      en: "Completing the square: move the number to get x² + 6x = 16. Half of 6 is 3, and (x + 3)² = x² + 3x + 3x + 9 = x² + 6x + 9, so adding 9 to both sides makes the left side (x + 3)². The right side is 16 + 9 = 25. Then x + 3 = ±5. x = -3 + 5 = 2 or x = -3 - 5 = -8, so x = -8 or x = 2.",
      ja: "平方完成：数を移して x² + 6x = 16。6の半分は3で、(x + 3)² = x² + 3x + 3x + 9 = x² + 6x + 9。だから両辺に9を足すと、左辺は (x + 3)² になります。右辺は 16 + 9 = 25。x + 3 = ±5。x = -3 + 5 = 2、または x = -3 - 5 = -8 なので、x = -8 または x = 2。"
    }
  },
  {
    id: "roots_medium_02",
    topic: "roots",
    equation: "x² + 4x - 12 = 0",
    answer: [-6, 2],
    difficulty: "medium",
    type: "complete-square",
    basePoints: 20,
    steps: [
      { action: "add", value: 12, prompt: "moveNumberPrompt", target: "both-sides", result: "x² + 4x = 12" },
      { action: "add", value: 4, prompt: "addSquarePrompt", target: "both-sides", result: "x² + 4x + 4 = 12 + 4",
        moves: [{ action: "add", value: 16, kind: "halfB" }, { action: "add", value: 2, kind: "squareHalf" }, { action: "subtract", value: 4, kind: "wrongWay" }] },
      { action: "complete", value: "(x + 2)² = 16", target: "both-sides", result: "(x + 2)² = 16",
        wrong: ["(x + 4)² = 16", "(x - 2)² = 16", "(x + 2)² = 8"], wrongKinds: ["halfB", "undoSign", "generic"] },
      { action: "sqrt", value: "x + 2 = ±4", target: "both-sides", result: "x + 2 = ±4",
        wrong: ["x + 2 = 4", "x + 2 = ±16", "x - 2 = ±4"], wrongKinds: ["plusMinus", "rootSlip", "undoSign"] },
      { action: "roots", value: "x = -6, 2", target: "both-sides", result: "x = -6, 2",
        wrong: ["x = -2, 6", "x = 2", "x = -4, 4"], wrongKinds: ["undoSign", "plusMinus", "generic"] }
    ],
    hints: {
      en: [
        "Move the number first: add 12 to both sides.",
        "(x + n)² = x² + 2n·x + n². Here 2n = 4, so n = 2 and n² = 4: add 4 to both sides.",
        "(x + 2)² = x² + 2x + 2x + 4 = x² + 4x + 4, so the left side is (x + 2)². Right side: 12 + 4 = 16.",
        "Take the square root of both sides. √16 = 4, and don't forget ±.",
        "Subtract 2 from both sides: x = -2 + 4 and x = -2 - 4."
      ],
      ja: [
        "まず数を移す：両辺に12を足す。",
        "(x + n)² = x² + 2n·x + n²。ここでは 2n = 4 なので n = 2、n² = 4：両辺に4を足す。",
        "(x + 2)² = x² + 2x + 2x + 4 = x² + 4x + 4 なので、左辺は (x + 2)²。右辺は 12 + 4 = 16。",
        "両辺の平方根をとる。√16 = 4、±を忘れずに。",
        "両辺から2を引く：x = -2 + 4 と x = -2 - 4。"
      ]
    },
    explanation: {
      en: "Completing the square: move the number to get x² + 4x = 12. Half of 4 is 2, and (x + 2)² = x² + 2x + 2x + 4 = x² + 4x + 4, so adding 4 to both sides makes the left side (x + 2)². The right side is 12 + 4 = 16. Then x + 2 = ±4. x = -2 + 4 = 2 or x = -2 - 4 = -6, so x = -6 or x = 2.",
      ja: "平方完成：数を移して x² + 4x = 12。4の半分は2で、(x + 2)² = x² + 2x + 2x + 4 = x² + 4x + 4。だから両辺に4を足すと、左辺は (x + 2)² になります。右辺は 12 + 4 = 16。x + 2 = ±4。x = -2 + 4 = 2、または x = -2 - 4 = -6 なので、x = -6 または x = 2。"
    }
  },
  {
    id: "roots_medium_03",
    topic: "roots",
    equation: "x² - 8x + 7 = 0",
    answer: [1, 7],
    difficulty: "medium",
    type: "complete-square",
    basePoints: 20,
    steps: [
      { action: "subtract", value: 7, prompt: "moveNumberPrompt", target: "both-sides", result: "x² - 8x = -7" },
      { action: "add", value: 16, prompt: "addSquarePrompt", target: "both-sides", result: "x² - 8x + 16 = -7 + 16",
        moves: [{ action: "add", value: 64, kind: "halfB" }, { action: "add", value: 4, kind: "squareHalf" }, { action: "subtract", value: 16, kind: "wrongWay" }] },
      { action: "complete", value: "(x - 4)² = 9", target: "both-sides", result: "(x - 4)² = 9",
        wrong: ["(x - 16)² = 9", "(x + 4)² = 9", "(x - 4)² = -23"], wrongKinds: ["halfB", "undoSign", "generic"] },
      { action: "sqrt", value: "x - 4 = ±3", target: "both-sides", result: "x - 4 = ±3",
        wrong: ["x - 4 = 3", "x - 4 = ±9", "x + 4 = ±3"], wrongKinds: ["plusMinus", "rootSlip", "undoSign"] },
      { action: "roots", value: "x = 1, 7", target: "both-sides", result: "x = 1, 7",
        wrong: ["x = -7, -1", "x = 7", "x = -3, 3"], wrongKinds: ["undoSign", "plusMinus", "generic"] }
    ],
    hints: {
      en: [
        "Move the number first: subtract 7 from both sides.",
        "(x - n)² = x² - 2n·x + n². Here 2n = 8, so n = 4 and n² = 16: add 16 to both sides.",
        "(x - 4)² = x² - 4x - 4x + 16 = x² - 8x + 16, so the left side is (x - 4)². Right side: -7 + 16 = 9.",
        "Take the square root of both sides. √9 = 3, and don't forget ±.",
        "Add 4 to both sides: x = 4 + 3 and x = 4 - 3."
      ],
      ja: [
        "まず数を移す：両辺から7を引く。",
        "(x - n)² = x² - 2n·x + n²。ここでは 2n = 8 なので n = 4、n² = 16：両辺に16を足す。",
        "(x - 4)² = x² - 4x - 4x + 16 = x² - 8x + 16 なので、左辺は (x - 4)²。右辺は -7 + 16 = 9。",
        "両辺の平方根をとる。√9 = 3、±を忘れずに。",
        "両辺に4を足す：x = 4 + 3 と x = 4 - 3。"
      ]
    },
    explanation: {
      en: "Completing the square: move the number to get x² - 8x = -7. Half of -8 is -4, and (x - 4)² = x² - 4x - 4x + 16 = x² - 8x + 16, so adding 16 to both sides makes the left side (x - 4)². The right side is -7 + 16 = 9. Then x - 4 = ±3. x = 4 + 3 = 7 or x = 4 - 3 = 1, so x = 1 or x = 7.",
      ja: "平方完成：数を移して x² - 8x = -7。-8の半分は-4で、(x - 4)² = x² - 4x - 4x + 16 = x² - 8x + 16。だから両辺に16を足すと、左辺は (x - 4)² になります。右辺は -7 + 16 = 9。x - 4 = ±3。x = 4 + 3 = 7、または x = 4 - 3 = 1 なので、x = 1 または x = 7。"
    }
  },
  {
    id: "roots_medium_04",
    topic: "roots",
    equation: "x² - 6x - 16 = 0",
    answer: [-2, 8],
    difficulty: "medium",
    type: "complete-square",
    basePoints: 20,
    steps: [
      { action: "add", value: 16, prompt: "moveNumberPrompt", target: "both-sides", result: "x² - 6x = 16" },
      { action: "add", value: 9, prompt: "addSquarePrompt", target: "both-sides", result: "x² - 6x + 9 = 16 + 9",
        moves: [{ action: "add", value: 36, kind: "halfB" }, { action: "add", value: 3, kind: "squareHalf" }, { action: "subtract", value: 9, kind: "wrongWay" }] },
      { action: "complete", value: "(x - 3)² = 25", target: "both-sides", result: "(x - 3)² = 25",
        wrong: ["(x - 9)² = 25", "(x + 3)² = 25", "(x - 3)² = 7"], wrongKinds: ["halfB", "undoSign", "generic"] },
      { action: "sqrt", value: "x - 3 = ±5", target: "both-sides", result: "x - 3 = ±5",
        wrong: ["x - 3 = 5", "x - 3 = ±25", "x + 3 = ±5"], wrongKinds: ["plusMinus", "rootSlip", "undoSign"] },
      { action: "roots", value: "x = -2, 8", target: "both-sides", result: "x = -2, 8",
        wrong: ["x = -8, 2", "x = 8", "x = -5, 5"], wrongKinds: ["undoSign", "plusMinus", "generic"] }
    ],
    hints: {
      en: [
        "Move the number first: add 16 to both sides.",
        "(x - n)² = x² - 2n·x + n². Here 2n = 6, so n = 3 and n² = 9: add 9 to both sides.",
        "(x - 3)² = x² - 3x - 3x + 9 = x² - 6x + 9, so the left side is (x - 3)². Right side: 16 + 9 = 25.",
        "Take the square root of both sides. √25 = 5, and don't forget ±.",
        "Add 3 to both sides: x = 3 + 5 and x = 3 - 5."
      ],
      ja: [
        "まず数を移す：両辺に16を足す。",
        "(x - n)² = x² - 2n·x + n²。ここでは 2n = 6 なので n = 3、n² = 9：両辺に9を足す。",
        "(x - 3)² = x² - 3x - 3x + 9 = x² - 6x + 9 なので、左辺は (x - 3)²。右辺は 16 + 9 = 25。",
        "両辺の平方根をとる。√25 = 5、±を忘れずに。",
        "両辺に3を足す：x = 3 + 5 と x = 3 - 5。"
      ]
    },
    explanation: {
      en: "Completing the square: move the number to get x² - 6x = 16. Half of -6 is -3, and (x - 3)² = x² - 3x - 3x + 9 = x² - 6x + 9, so adding 9 to both sides makes the left side (x - 3)². The right side is 16 + 9 = 25. Then x - 3 = ±5. x = 3 + 5 = 8 or x = 3 - 5 = -2, so x = -2 or x = 8.",
      ja: "平方完成：数を移して x² - 6x = 16。-6の半分は-3で、(x - 3)² = x² - 3x - 3x + 9 = x² - 6x + 9。だから両辺に9を足すと、左辺は (x - 3)² になります。右辺は 16 + 9 = 25。x - 3 = ±5。x = 3 + 5 = 8、または x = 3 - 5 = -2 なので、x = -2 または x = 8。"
    }
  },
  {
    id: "roots_medium_05",
    topic: "roots",
    equation: "x² + 10x + 9 = 0",
    answer: [-9, -1],
    difficulty: "medium",
    type: "complete-square",
    basePoints: 20,
    steps: [
      { action: "subtract", value: 9, prompt: "moveNumberPrompt", target: "both-sides", result: "x² + 10x = -9" },
      { action: "add", value: 25, prompt: "addSquarePrompt", target: "both-sides", result: "x² + 10x + 25 = -9 + 25",
        moves: [{ action: "add", value: 100, kind: "halfB" }, { action: "add", value: 5, kind: "squareHalf" }, { action: "subtract", value: 25, kind: "wrongWay" }] },
      { action: "complete", value: "(x + 5)² = 16", target: "both-sides", result: "(x + 5)² = 16",
        wrong: ["(x + 25)² = 16", "(x - 5)² = 16", "(x + 5)² = -34"], wrongKinds: ["halfB", "undoSign", "generic"] },
      { action: "sqrt", value: "x + 5 = ±4", target: "both-sides", result: "x + 5 = ±4",
        wrong: ["x + 5 = 4", "x + 5 = ±16", "x - 5 = ±4"], wrongKinds: ["plusMinus", "rootSlip", "undoSign"] },
      { action: "roots", value: "x = -9, -1", target: "both-sides", result: "x = -9, -1",
        wrong: ["x = 1, 9", "x = -1", "x = -4, 4"], wrongKinds: ["undoSign", "plusMinus", "generic"] }
    ],
    hints: {
      en: [
        "Move the number first: subtract 9 from both sides.",
        "(x + n)² = x² + 2n·x + n². Here 2n = 10, so n = 5 and n² = 25: add 25 to both sides.",
        "(x + 5)² = x² + 5x + 5x + 25 = x² + 10x + 25, so the left side is (x + 5)². Right side: -9 + 25 = 16.",
        "Take the square root of both sides. √16 = 4, and don't forget ±.",
        "Subtract 5 from both sides: x = -5 + 4 and x = -5 - 4."
      ],
      ja: [
        "まず数を移す：両辺から9を引く。",
        "(x + n)² = x² + 2n·x + n²。ここでは 2n = 10 なので n = 5、n² = 25：両辺に25を足す。",
        "(x + 5)² = x² + 5x + 5x + 25 = x² + 10x + 25 なので、左辺は (x + 5)²。右辺は -9 + 25 = 16。",
        "両辺の平方根をとる。√16 = 4、±を忘れずに。",
        "両辺から5を引く：x = -5 + 4 と x = -5 - 4。"
      ]
    },
    explanation: {
      en: "Completing the square: move the number to get x² + 10x = -9. Half of 10 is 5, and (x + 5)² = x² + 5x + 5x + 25 = x² + 10x + 25, so adding 25 to both sides makes the left side (x + 5)². The right side is -9 + 25 = 16. Then x + 5 = ±4. x = -5 + 4 = -1 or x = -5 - 4 = -9, so x = -9 or x = -1.",
      ja: "平方完成：数を移して x² + 10x = -9。10の半分は5で、(x + 5)² = x² + 5x + 5x + 25 = x² + 10x + 25。だから両辺に25を足すと、左辺は (x + 5)² になります。右辺は -9 + 25 = 16。x + 5 = ±4。x = -5 + 4 = -1、または x = -5 - 4 = -9 なので、x = -9 または x = -1。"
    }
  },
  {
    id: "roots_medium_06",
    topic: "roots",
    equation: "x² - 4x - 60 = 0",
    answer: [-6, 10],
    difficulty: "medium",
    type: "complete-square",
    basePoints: 20,
    steps: [
      { action: "add", value: 60, prompt: "moveNumberPrompt", target: "both-sides", result: "x² - 4x = 60" },
      { action: "add", value: 4, prompt: "addSquarePrompt", target: "both-sides", result: "x² - 4x + 4 = 60 + 4",
        moves: [{ action: "add", value: 16, kind: "halfB" }, { action: "add", value: 2, kind: "squareHalf" }, { action: "subtract", value: 4, kind: "wrongWay" }] },
      { action: "complete", value: "(x - 2)² = 64", target: "both-sides", result: "(x - 2)² = 64",
        wrong: ["(x - 4)² = 64", "(x + 2)² = 64", "(x - 2)² = 56"], wrongKinds: ["halfB", "undoSign", "generic"] },
      { action: "sqrt", value: "x - 2 = ±8", target: "both-sides", result: "x - 2 = ±8",
        wrong: ["x - 2 = 8", "x - 2 = ±64", "x + 2 = ±8"], wrongKinds: ["plusMinus", "rootSlip", "undoSign"] },
      { action: "roots", value: "x = -6, 10", target: "both-sides", result: "x = -6, 10",
        wrong: ["x = -10, 6", "x = 10", "x = -8, 8"], wrongKinds: ["undoSign", "plusMinus", "generic"] }
    ],
    hints: {
      en: [
        "Move the number first: add 60 to both sides.",
        "(x - n)² = x² - 2n·x + n². Here 2n = 4, so n = 2 and n² = 4: add 4 to both sides.",
        "(x - 2)² = x² - 2x - 2x + 4 = x² - 4x + 4, so the left side is (x - 2)². Right side: 60 + 4 = 64.",
        "Take the square root of both sides. √64 = 8, and don't forget ±.",
        "Add 2 to both sides: x = 2 + 8 and x = 2 - 8."
      ],
      ja: [
        "まず数を移す：両辺に60を足す。",
        "(x - n)² = x² - 2n·x + n²。ここでは 2n = 4 なので n = 2、n² = 4：両辺に4を足す。",
        "(x - 2)² = x² - 2x - 2x + 4 = x² - 4x + 4 なので、左辺は (x - 2)²。右辺は 60 + 4 = 64。",
        "両辺の平方根をとる。√64 = 8、±を忘れずに。",
        "両辺に2を足す：x = 2 + 8 と x = 2 - 8。"
      ]
    },
    explanation: {
      en: "Completing the square: move the number to get x² - 4x = 60. Half of -4 is -2, and (x - 2)² = x² - 2x - 2x + 4 = x² - 4x + 4, so adding 4 to both sides makes the left side (x - 2)². The right side is 60 + 4 = 64. Then x - 2 = ±8. x = 2 + 8 = 10 or x = 2 - 8 = -6, so x = -6 or x = 10.",
      ja: "平方完成：数を移して x² - 4x = 60。-4の半分は-2で、(x - 2)² = x² - 2x - 2x + 4 = x² - 4x + 4。だから両辺に4を足すと、左辺は (x - 2)² になります。右辺は 60 + 4 = 64。x - 2 = ±8。x = 2 + 8 = 10、または x = 2 - 8 = -6 なので、x = -6 または x = 10。"
    }
  },
  {
    id: "roots_medium_07",
    topic: "roots",
    equation: "x² + 8x - 20 = 0",
    answer: [-10, 2],
    difficulty: "medium",
    type: "complete-square",
    basePoints: 20,
    steps: [
      { action: "add", value: 20, prompt: "moveNumberPrompt", target: "both-sides", result: "x² + 8x = 20" },
      { action: "add", value: 16, prompt: "addSquarePrompt", target: "both-sides", result: "x² + 8x + 16 = 20 + 16",
        moves: [{ action: "add", value: 64, kind: "halfB" }, { action: "add", value: 4, kind: "squareHalf" }, { action: "subtract", value: 16, kind: "wrongWay" }] },
      { action: "complete", value: "(x + 4)² = 36", target: "both-sides", result: "(x + 4)² = 36",
        wrong: ["(x + 16)² = 36", "(x - 4)² = 36", "(x + 4)² = 4"], wrongKinds: ["halfB", "undoSign", "generic"] },
      { action: "sqrt", value: "x + 4 = ±6", target: "both-sides", result: "x + 4 = ±6",
        wrong: ["x + 4 = 6", "x + 4 = ±36", "x - 4 = ±6"], wrongKinds: ["plusMinus", "rootSlip", "undoSign"] },
      { action: "roots", value: "x = -10, 2", target: "both-sides", result: "x = -10, 2",
        wrong: ["x = -2, 10", "x = 2", "x = -6, 6"], wrongKinds: ["undoSign", "plusMinus", "generic"] }
    ],
    hints: {
      en: [
        "Move the number first: add 20 to both sides.",
        "(x + n)² = x² + 2n·x + n². Here 2n = 8, so n = 4 and n² = 16: add 16 to both sides.",
        "(x + 4)² = x² + 4x + 4x + 16 = x² + 8x + 16, so the left side is (x + 4)². Right side: 20 + 16 = 36.",
        "Take the square root of both sides. √36 = 6, and don't forget ±.",
        "Subtract 4 from both sides: x = -4 + 6 and x = -4 - 6."
      ],
      ja: [
        "まず数を移す：両辺に20を足す。",
        "(x + n)² = x² + 2n·x + n²。ここでは 2n = 8 なので n = 4、n² = 16：両辺に16を足す。",
        "(x + 4)² = x² + 4x + 4x + 16 = x² + 8x + 16 なので、左辺は (x + 4)²。右辺は 20 + 16 = 36。",
        "両辺の平方根をとる。√36 = 6、±を忘れずに。",
        "両辺から4を引く：x = -4 + 6 と x = -4 - 6。"
      ]
    },
    explanation: {
      en: "Completing the square: move the number to get x² + 8x = 20. Half of 8 is 4, and (x + 4)² = x² + 4x + 4x + 16 = x² + 8x + 16, so adding 16 to both sides makes the left side (x + 4)². The right side is 20 + 16 = 36. Then x + 4 = ±6. x = -4 + 6 = 2 or x = -4 - 6 = -10, so x = -10 or x = 2.",
      ja: "平方完成：数を移して x² + 8x = 20。8の半分は4で、(x + 4)² = x² + 4x + 4x + 16 = x² + 8x + 16。だから両辺に16を足すと、左辺は (x + 4)² になります。右辺は 20 + 16 = 36。x + 4 = ±6。x = -4 + 6 = 2、または x = -4 - 6 = -10 なので、x = -10 または x = 2。"
    }
  },
  {
    id: "roots_medium_08",
    topic: "roots",
    equation: "x² - 10x - 24 = 0",
    answer: [-2, 12],
    difficulty: "medium",
    type: "complete-square",
    basePoints: 20,
    steps: [
      { action: "add", value: 24, prompt: "moveNumberPrompt", target: "both-sides", result: "x² - 10x = 24" },
      { action: "add", value: 25, prompt: "addSquarePrompt", target: "both-sides", result: "x² - 10x + 25 = 24 + 25",
        moves: [{ action: "add", value: 100, kind: "halfB" }, { action: "add", value: 5, kind: "squareHalf" }, { action: "subtract", value: 25, kind: "wrongWay" }] },
      { action: "complete", value: "(x - 5)² = 49", target: "both-sides", result: "(x - 5)² = 49",
        wrong: ["(x - 25)² = 49", "(x + 5)² = 49", "(x - 5)² = -1"], wrongKinds: ["halfB", "undoSign", "generic"] },
      { action: "sqrt", value: "x - 5 = ±7", target: "both-sides", result: "x - 5 = ±7",
        wrong: ["x - 5 = 7", "x - 5 = ±49", "x + 5 = ±7"], wrongKinds: ["plusMinus", "rootSlip", "undoSign"] },
      { action: "roots", value: "x = -2, 12", target: "both-sides", result: "x = -2, 12",
        wrong: ["x = -12, 2", "x = 12", "x = -7, 7"], wrongKinds: ["undoSign", "plusMinus", "generic"] }
    ],
    hints: {
      en: [
        "Move the number first: add 24 to both sides.",
        "(x - n)² = x² - 2n·x + n². Here 2n = 10, so n = 5 and n² = 25: add 25 to both sides.",
        "(x - 5)² = x² - 5x - 5x + 25 = x² - 10x + 25, so the left side is (x - 5)². Right side: 24 + 25 = 49.",
        "Take the square root of both sides. √49 = 7, and don't forget ±.",
        "Add 5 to both sides: x = 5 + 7 and x = 5 - 7."
      ],
      ja: [
        "まず数を移す：両辺に24を足す。",
        "(x - n)² = x² - 2n·x + n²。ここでは 2n = 10 なので n = 5、n² = 25：両辺に25を足す。",
        "(x - 5)² = x² - 5x - 5x + 25 = x² - 10x + 25 なので、左辺は (x - 5)²。右辺は 24 + 25 = 49。",
        "両辺の平方根をとる。√49 = 7、±を忘れずに。",
        "両辺に5を足す：x = 5 + 7 と x = 5 - 7。"
      ]
    },
    explanation: {
      en: "Completing the square: move the number to get x² - 10x = 24. Half of -10 is -5, and (x - 5)² = x² - 5x - 5x + 25 = x² - 10x + 25, so adding 25 to both sides makes the left side (x - 5)². The right side is 24 + 25 = 49. Then x - 5 = ±7. x = 5 + 7 = 12 or x = 5 - 7 = -2, so x = -2 or x = 12.",
      ja: "平方完成：数を移して x² - 10x = 24。-10の半分は-5で、(x - 5)² = x² - 5x - 5x + 25 = x² - 10x + 25。だから両辺に25を足すと、左辺は (x - 5)² になります。右辺は 24 + 25 = 49。x - 5 = ±7。x = 5 + 7 = 12、または x = 5 - 7 = -2 なので、x = -2 または x = 12。"
    }
  },
  {
    id: "roots_medium_09",
    topic: "roots",
    equation: "x² + 6x + 5 = 0",
    answer: [-5, -1],
    difficulty: "medium",
    type: "complete-square",
    basePoints: 20,
    steps: [
      { action: "subtract", value: 5, prompt: "moveNumberPrompt", target: "both-sides", result: "x² + 6x = -5" },
      { action: "add", value: 9, prompt: "addSquarePrompt", target: "both-sides", result: "x² + 6x + 9 = -5 + 9",
        moves: [{ action: "add", value: 36, kind: "halfB" }, { action: "add", value: 3, kind: "squareHalf" }, { action: "subtract", value: 9, kind: "wrongWay" }] },
      { action: "complete", value: "(x + 3)² = 4", target: "both-sides", result: "(x + 3)² = 4",
        wrong: ["(x + 9)² = 4", "(x - 3)² = 4", "(x + 3)² = -14"], wrongKinds: ["halfB", "undoSign", "generic"] },
      { action: "sqrt", value: "x + 3 = ±2", target: "both-sides", result: "x + 3 = ±2",
        wrong: ["x + 3 = 2", "x + 3 = ±4", "x - 3 = ±2"], wrongKinds: ["plusMinus", "rootSlip", "undoSign"] },
      { action: "roots", value: "x = -5, -1", target: "both-sides", result: "x = -5, -1",
        wrong: ["x = 1, 5", "x = -1", "x = -2, 2"], wrongKinds: ["undoSign", "plusMinus", "generic"] }
    ],
    hints: {
      en: [
        "Move the number first: subtract 5 from both sides.",
        "(x + n)² = x² + 2n·x + n². Here 2n = 6, so n = 3 and n² = 9: add 9 to both sides.",
        "(x + 3)² = x² + 3x + 3x + 9 = x² + 6x + 9, so the left side is (x + 3)². Right side: -5 + 9 = 4.",
        "Take the square root of both sides. √4 = 2, and don't forget ±.",
        "Subtract 3 from both sides: x = -3 + 2 and x = -3 - 2."
      ],
      ja: [
        "まず数を移す：両辺から5を引く。",
        "(x + n)² = x² + 2n·x + n²。ここでは 2n = 6 なので n = 3、n² = 9：両辺に9を足す。",
        "(x + 3)² = x² + 3x + 3x + 9 = x² + 6x + 9 なので、左辺は (x + 3)²。右辺は -5 + 9 = 4。",
        "両辺の平方根をとる。√4 = 2、±を忘れずに。",
        "両辺から3を引く：x = -3 + 2 と x = -3 - 2。"
      ]
    },
    explanation: {
      en: "Completing the square: move the number to get x² + 6x = -5. Half of 6 is 3, and (x + 3)² = x² + 3x + 3x + 9 = x² + 6x + 9, so adding 9 to both sides makes the left side (x + 3)². The right side is -5 + 9 = 4. Then x + 3 = ±2. x = -3 + 2 = -1 or x = -3 - 2 = -5, so x = -5 or x = -1.",
      ja: "平方完成：数を移して x² + 6x = -5。6の半分は3で、(x + 3)² = x² + 3x + 3x + 9 = x² + 6x + 9。だから両辺に9を足すと、左辺は (x + 3)² になります。右辺は -5 + 9 = 4。x + 3 = ±2。x = -3 + 2 = -1、または x = -3 - 2 = -5 なので、x = -5 または x = -1。"
    }
  },
  {
    id: "roots_medium_10",
    topic: "roots",
    equation: "x² - 12x - 45 = 0",
    answer: [-3, 15],
    difficulty: "medium",
    type: "complete-square",
    basePoints: 20,
    steps: [
      { action: "add", value: 45, prompt: "moveNumberPrompt", target: "both-sides", result: "x² - 12x = 45" },
      { action: "add", value: 36, prompt: "addSquarePrompt", target: "both-sides", result: "x² - 12x + 36 = 45 + 36",
        moves: [{ action: "add", value: 144, kind: "halfB" }, { action: "add", value: 6, kind: "squareHalf" }, { action: "subtract", value: 36, kind: "wrongWay" }] },
      { action: "complete", value: "(x - 6)² = 81", target: "both-sides", result: "(x - 6)² = 81",
        wrong: ["(x - 36)² = 81", "(x + 6)² = 81", "(x - 6)² = 9"], wrongKinds: ["halfB", "undoSign", "generic"] },
      { action: "sqrt", value: "x - 6 = ±9", target: "both-sides", result: "x - 6 = ±9",
        wrong: ["x - 6 = 9", "x - 6 = ±81", "x + 6 = ±9"], wrongKinds: ["plusMinus", "rootSlip", "undoSign"] },
      { action: "roots", value: "x = -3, 15", target: "both-sides", result: "x = -3, 15",
        wrong: ["x = -15, 3", "x = 15", "x = -9, 9"], wrongKinds: ["undoSign", "plusMinus", "generic"] }
    ],
    hints: {
      en: [
        "Move the number first: add 45 to both sides.",
        "(x - n)² = x² - 2n·x + n². Here 2n = 12, so n = 6 and n² = 36: add 36 to both sides.",
        "(x - 6)² = x² - 6x - 6x + 36 = x² - 12x + 36, so the left side is (x - 6)². Right side: 45 + 36 = 81.",
        "Take the square root of both sides. √81 = 9, and don't forget ±.",
        "Add 6 to both sides: x = 6 + 9 and x = 6 - 9."
      ],
      ja: [
        "まず数を移す：両辺に45を足す。",
        "(x - n)² = x² - 2n·x + n²。ここでは 2n = 12 なので n = 6、n² = 36：両辺に36を足す。",
        "(x - 6)² = x² - 6x - 6x + 36 = x² - 12x + 36 なので、左辺は (x - 6)²。右辺は 45 + 36 = 81。",
        "両辺の平方根をとる。√81 = 9、±を忘れずに。",
        "両辺に6を足す：x = 6 + 9 と x = 6 - 9。"
      ]
    },
    explanation: {
      en: "Completing the square: move the number to get x² - 12x = 45. Half of -12 is -6, and (x - 6)² = x² - 6x - 6x + 36 = x² - 12x + 36, so adding 36 to both sides makes the left side (x - 6)². The right side is 45 + 36 = 81. Then x - 6 = ±9. x = 6 + 9 = 15 or x = 6 - 9 = -3, so x = -3 or x = 15.",
      ja: "平方完成：数を移して x² - 12x = 45。-12の半分は-6で、(x - 6)² = x² - 6x - 6x + 36 = x² - 12x + 36。だから両辺に36を足すと、左辺は (x - 6)² になります。右辺は 45 + 36 = 81。x - 6 = ±9。x = 6 + 9 = 15、または x = 6 - 9 = -3 なので、x = -3 または x = 15。"
    }
  },

  // ---- Hard: the quadratic formula, x = (-b ± √(b² - 4ac))/2a (b² - 4ac a perfect square) ----
  // Five steps: read off a, b and c (the formula panel under the card then fills them in), work out
  // b² - 4ac on its own (the sign of -4ac is where most slips happen), put it into the formula,
  // work out the √, and find both answers. `abc` is [a, b, c] for the panel.
  // Levels 7-10 have a number in front of x²: 2a is then 4 or 6.
  {
    id: "roots_hard_01",
    topic: "roots",
    equation: "x² + 5x - 24 = 0",
    answer: [-8, 3],
    difficulty: "hard",
    type: "formula",
    basePoints: 30,
    abc: [1, 5, -24],
    steps: [
      { action: "coef", value: "1, 5, -24", prompt: "coefPrompt", fill: "formula", target: "both-sides", result: "x² + 5x - 24 = 0\na = 1, b = 5, c = -24",
        wrong: ["1, 5, 24", "1, -5, -24", "0, 5, -24"], wrongKinds: ["readCoef", "readCoef", "readCoef"] },
      { action: "discriminant", value: "b² - 4ac = 121", prompt: "discriminantPrompt", focus: "disc", target: "both-sides", result: "a = 1, b = 5, c = -24\nb² - 4ac = 121",
        wrong: ["b² - 4ac = -71", "b² - 4ac = 49", "b² - 4ac = 106"], wrongKinds: ["discriminant", "discriminant", "discriminant"] },
      { action: "formula", value: "x = (-5 ± √121)/2", focus: "top", target: "both-sides", result: "x = (-5 ± √121)/2",
        wrong: ["x = (5 ± √121)/2", "x = (-5 ± 121)/2", "x = -5 ± √121"], wrongKinds: ["undoSign", "rootSlip", "twoA"] },
      { action: "evalRoot", value: "x = (-5 ± 11)/2", target: "both-sides", result: "x = (-5 ± 11)/2",
        wrong: ["x = (-5 + 11)/2", "x = (-5 ± 12)/2", "x = -5 ± 11"], wrongKinds: ["plusMinus", "rootSlip", "twoA"] },
      { action: "roots", value: "x = -8, 3", target: "both-sides", result: "x = -8, 3",
        wrong: ["x = 3", "x = -16, 6", "x = -3, 8"], wrongKinds: ["plusMinus", "twoA", "undoSign"] }
    ],
    hints: {
      en: [
        "a is the number in front of x², b the number in front of x, c the number on its own. Keep their signs: a = 1, b = 5, c = -24. (x² is 1x², so a = 1.)",
        "Put the numbers in: b² - 4ac = 5² - 4 × 1 × (-24) = 25 + 96 = 121. Careful: c is -24, so -4ac is +96.",
        "Quadratic formula: x = (-b ± √(b² - 4ac))/2a. Here -b = -5 and 2a = 2, so put in √121.",
        "√121 = 11, because 11² = 121. Keep the ±: it gives both answers.",
        "Work out both: (-5 + 11)/2 = 3 and (-5 - 11)/2 = -8."
      ],
      ja: [
        "aはx²の前の数、bはxの前の数、cは単独の数。符号もそのまま：a = 1、b = 5、c = -24。（x² は 1x² なので a = 1。）",
        "数を入れる：b² - 4ac = 5² - 4 × 1 × (-24) = 25 + 96 = 121。注意：c は -24 なので、-4ac は +96。",
        "解の公式：x = (-b ± √(b² - 4ac))/2a。-b = -5、2a = 2 なので、√121 を入れる。",
        "11² = 121 なので √121 = 11。±はそのまま：答えが2つ出ます。",
        "両方計算する：(-5 + 11)/2 = 3、(-5 - 11)/2 = -8。"
      ]
    },
    explanation: {
      en: "The quadratic formula works on any quadratic. Read off a = 1, b = 5, c = -24: b² - 4ac = 5² - 4 × 1 × (-24) = 25 + 96 = 121, and √121 = 11. So x = (-5 ± 11)/2: x = -8 or x = 3.",
      ja: "解の公式はどんな二次方程式にも使えます。a = 1、b = 5、c = -24 を読み取って、b² - 4ac = 5² - 4 × 1 × (-24) = 25 + 96 = 121、√121 = 11。x = (-5 ± 11)/2 なので、x = -8 または x = 3。"
    }
  },
  {
    id: "roots_hard_02",
    topic: "roots",
    equation: "x² - 3x - 40 = 0",
    answer: [-5, 8],
    difficulty: "hard",
    type: "formula",
    basePoints: 30,
    abc: [1, -3, -40],
    steps: [
      { action: "coef", value: "1, -3, -40", prompt: "coefPrompt", fill: "formula", target: "both-sides", result: "x² - 3x - 40 = 0\na = 1, b = -3, c = -40",
        wrong: ["1, -3, 40", "1, 3, -40", "0, -3, -40"], wrongKinds: ["readCoef", "readCoef", "readCoef"] },
      { action: "discriminant", value: "b² - 4ac = 169", prompt: "discriminantPrompt", focus: "disc", target: "both-sides", result: "a = 1, b = -3, c = -40\nb² - 4ac = 169",
        wrong: ["b² - 4ac = -151", "b² - 4ac = 49", "b² - 4ac = 154"], wrongKinds: ["discriminant", "discriminant", "discriminant"] },
      { action: "formula", value: "x = (3 ± √169)/2", focus: "top", target: "both-sides", result: "x = (3 ± √169)/2",
        wrong: ["x = (-3 ± √169)/2", "x = (3 ± 169)/2", "x = 3 ± √169"], wrongKinds: ["undoSign", "rootSlip", "twoA"] },
      { action: "evalRoot", value: "x = (3 ± 13)/2", target: "both-sides", result: "x = (3 ± 13)/2",
        wrong: ["x = (3 + 13)/2", "x = (3 ± 14)/2", "x = 3 ± 13"], wrongKinds: ["plusMinus", "rootSlip", "twoA"] },
      { action: "roots", value: "x = -5, 8", target: "both-sides", result: "x = -5, 8",
        wrong: ["x = 8", "x = -10, 16", "x = -8, 5"], wrongKinds: ["plusMinus", "twoA", "undoSign"] }
    ],
    hints: {
      en: [
        "a is the number in front of x², b the number in front of x, c the number on its own. Keep their signs: a = 1, b = -3, c = -40. (x² is 1x², so a = 1.)",
        "Put the numbers in: b² - 4ac = (-3)² - 4 × 1 × (-40) = 9 + 160 = 169. Careful: c is -40, so -4ac is +160.",
        "Quadratic formula: x = (-b ± √(b² - 4ac))/2a. Here -b = 3 and 2a = 2, so put in √169.",
        "√169 = 13, because 13² = 169. Keep the ±: it gives both answers.",
        "Work out both: (3 + 13)/2 = 8 and (3 - 13)/2 = -5."
      ],
      ja: [
        "aはx²の前の数、bはxの前の数、cは単独の数。符号もそのまま：a = 1、b = -3、c = -40。（x² は 1x² なので a = 1。）",
        "数を入れる：b² - 4ac = (-3)² - 4 × 1 × (-40) = 9 + 160 = 169。注意：c は -40 なので、-4ac は +160。",
        "解の公式：x = (-b ± √(b² - 4ac))/2a。-b = 3、2a = 2 なので、√169 を入れる。",
        "13² = 169 なので √169 = 13。±はそのまま：答えが2つ出ます。",
        "両方計算する：(3 + 13)/2 = 8、(3 - 13)/2 = -5。"
      ]
    },
    explanation: {
      en: "The quadratic formula works on any quadratic. Read off a = 1, b = -3, c = -40: b² - 4ac = (-3)² - 4 × 1 × (-40) = 9 + 160 = 169, and √169 = 13. So x = (3 ± 13)/2: x = -5 or x = 8.",
      ja: "解の公式はどんな二次方程式にも使えます。a = 1、b = -3、c = -40 を読み取って、b² - 4ac = (-3)² - 4 × 1 × (-40) = 9 + 160 = 169、√169 = 13。x = (3 ± 13)/2 なので、x = -5 または x = 8。"
    }
  },
  {
    id: "roots_hard_03",
    topic: "roots",
    equation: "x² + 7x - 44 = 0",
    answer: [-11, 4],
    difficulty: "hard",
    type: "formula",
    basePoints: 30,
    abc: [1, 7, -44],
    steps: [
      { action: "coef", value: "1, 7, -44", prompt: "coefPrompt", fill: "formula", target: "both-sides", result: "x² + 7x - 44 = 0\na = 1, b = 7, c = -44",
        wrong: ["1, 7, 44", "1, -7, -44", "0, 7, -44"], wrongKinds: ["readCoef", "readCoef", "readCoef"] },
      { action: "discriminant", value: "b² - 4ac = 225", prompt: "discriminantPrompt", focus: "disc", target: "both-sides", result: "a = 1, b = 7, c = -44\nb² - 4ac = 225",
        wrong: ["b² - 4ac = -127", "b² - 4ac = 93", "b² - 4ac = 190"], wrongKinds: ["discriminant", "discriminant", "discriminant"] },
      { action: "formula", value: "x = (-7 ± √225)/2", focus: "top", target: "both-sides", result: "x = (-7 ± √225)/2",
        wrong: ["x = (7 ± √225)/2", "x = (-7 ± 225)/2", "x = -7 ± √225"], wrongKinds: ["undoSign", "rootSlip", "twoA"] },
      { action: "evalRoot", value: "x = (-7 ± 15)/2", target: "both-sides", result: "x = (-7 ± 15)/2",
        wrong: ["x = (-7 + 15)/2", "x = (-7 ± 16)/2", "x = -7 ± 15"], wrongKinds: ["plusMinus", "rootSlip", "twoA"] },
      { action: "roots", value: "x = -11, 4", target: "both-sides", result: "x = -11, 4",
        wrong: ["x = 4", "x = -22, 8", "x = -4, 11"], wrongKinds: ["plusMinus", "twoA", "undoSign"] }
    ],
    hints: {
      en: [
        "a is the number in front of x², b the number in front of x, c the number on its own. Keep their signs: a = 1, b = 7, c = -44. (x² is 1x², so a = 1.)",
        "Put the numbers in: b² - 4ac = 7² - 4 × 1 × (-44) = 49 + 176 = 225. Careful: c is -44, so -4ac is +176.",
        "Quadratic formula: x = (-b ± √(b² - 4ac))/2a. Here -b = -7 and 2a = 2, so put in √225.",
        "√225 = 15, because 15² = 225. Keep the ±: it gives both answers.",
        "Work out both: (-7 + 15)/2 = 4 and (-7 - 15)/2 = -11."
      ],
      ja: [
        "aはx²の前の数、bはxの前の数、cは単独の数。符号もそのまま：a = 1、b = 7、c = -44。（x² は 1x² なので a = 1。）",
        "数を入れる：b² - 4ac = 7² - 4 × 1 × (-44) = 49 + 176 = 225。注意：c は -44 なので、-4ac は +176。",
        "解の公式：x = (-b ± √(b² - 4ac))/2a。-b = -7、2a = 2 なので、√225 を入れる。",
        "15² = 225 なので √225 = 15。±はそのまま：答えが2つ出ます。",
        "両方計算する：(-7 + 15)/2 = 4、(-7 - 15)/2 = -11。"
      ]
    },
    explanation: {
      en: "The quadratic formula works on any quadratic. Read off a = 1, b = 7, c = -44: b² - 4ac = 7² - 4 × 1 × (-44) = 49 + 176 = 225, and √225 = 15. So x = (-7 ± 15)/2: x = -11 or x = 4.",
      ja: "解の公式はどんな二次方程式にも使えます。a = 1、b = 7、c = -44 を読み取って、b² - 4ac = 7² - 4 × 1 × (-44) = 49 + 176 = 225、√225 = 15。x = (-7 ± 15)/2 なので、x = -11 または x = 4。"
    }
  },
  {
    id: "roots_hard_04",
    topic: "roots",
    equation: "x² - 9x - 52 = 0",
    answer: [-4, 13],
    difficulty: "hard",
    type: "formula",
    basePoints: 30,
    abc: [1, -9, -52],
    steps: [
      { action: "coef", value: "1, -9, -52", prompt: "coefPrompt", fill: "formula", target: "both-sides", result: "x² - 9x - 52 = 0\na = 1, b = -9, c = -52",
        wrong: ["1, -9, 52", "1, 9, -52", "0, -9, -52"], wrongKinds: ["readCoef", "readCoef", "readCoef"] },
      { action: "discriminant", value: "b² - 4ac = 289", prompt: "discriminantPrompt", focus: "disc", target: "both-sides", result: "a = 1, b = -9, c = -52\nb² - 4ac = 289",
        wrong: ["b² - 4ac = -127", "b² - 4ac = 133", "b² - 4ac = 190"], wrongKinds: ["discriminant", "discriminant", "discriminant"] },
      { action: "formula", value: "x = (9 ± √289)/2", focus: "top", target: "both-sides", result: "x = (9 ± √289)/2",
        wrong: ["x = (-9 ± √289)/2", "x = (9 ± 289)/2", "x = 9 ± √289"], wrongKinds: ["undoSign", "rootSlip", "twoA"] },
      { action: "evalRoot", value: "x = (9 ± 17)/2", target: "both-sides", result: "x = (9 ± 17)/2",
        wrong: ["x = (9 + 17)/2", "x = (9 ± 18)/2", "x = 9 ± 17"], wrongKinds: ["plusMinus", "rootSlip", "twoA"] },
      { action: "roots", value: "x = -4, 13", target: "both-sides", result: "x = -4, 13",
        wrong: ["x = 13", "x = -8, 26", "x = -13, 4"], wrongKinds: ["plusMinus", "twoA", "undoSign"] }
    ],
    hints: {
      en: [
        "a is the number in front of x², b the number in front of x, c the number on its own. Keep their signs: a = 1, b = -9, c = -52. (x² is 1x², so a = 1.)",
        "Put the numbers in: b² - 4ac = (-9)² - 4 × 1 × (-52) = 81 + 208 = 289. Careful: c is -52, so -4ac is +208.",
        "Quadratic formula: x = (-b ± √(b² - 4ac))/2a. Here -b = 9 and 2a = 2, so put in √289.",
        "√289 = 17, because 17² = 289. Keep the ±: it gives both answers.",
        "Work out both: (9 + 17)/2 = 13 and (9 - 17)/2 = -4."
      ],
      ja: [
        "aはx²の前の数、bはxの前の数、cは単独の数。符号もそのまま：a = 1、b = -9、c = -52。（x² は 1x² なので a = 1。）",
        "数を入れる：b² - 4ac = (-9)² - 4 × 1 × (-52) = 81 + 208 = 289。注意：c は -52 なので、-4ac は +208。",
        "解の公式：x = (-b ± √(b² - 4ac))/2a。-b = 9、2a = 2 なので、√289 を入れる。",
        "17² = 289 なので √289 = 17。±はそのまま：答えが2つ出ます。",
        "両方計算する：(9 + 17)/2 = 13、(9 - 17)/2 = -4。"
      ]
    },
    explanation: {
      en: "The quadratic formula works on any quadratic. Read off a = 1, b = -9, c = -52: b² - 4ac = (-9)² - 4 × 1 × (-52) = 81 + 208 = 289, and √289 = 17. So x = (9 ± 17)/2: x = -4 or x = 13.",
      ja: "解の公式はどんな二次方程式にも使えます。a = 1、b = -9、c = -52 を読み取って、b² - 4ac = (-9)² - 4 × 1 × (-52) = 81 + 208 = 289、√289 = 17。x = (9 ± 17)/2 なので、x = -4 または x = 13。"
    }
  },
  {
    id: "roots_hard_05",
    topic: "roots",
    equation: "x² + 11x - 60 = 0",
    answer: [-15, 4],
    difficulty: "hard",
    type: "formula",
    basePoints: 30,
    abc: [1, 11, -60],
    steps: [
      { action: "coef", value: "1, 11, -60", prompt: "coefPrompt", fill: "formula", target: "both-sides", result: "x² + 11x - 60 = 0\na = 1, b = 11, c = -60",
        wrong: ["1, 11, 60", "1, -11, -60", "0, 11, -60"], wrongKinds: ["readCoef", "readCoef", "readCoef"] },
      { action: "discriminant", value: "b² - 4ac = 361", prompt: "discriminantPrompt", focus: "disc", target: "both-sides", result: "a = 1, b = 11, c = -60\nb² - 4ac = 361",
        wrong: ["b² - 4ac = -119", "b² - 4ac = 181", "b² - 4ac = 262"], wrongKinds: ["discriminant", "discriminant", "discriminant"] },
      { action: "formula", value: "x = (-11 ± √361)/2", focus: "top", target: "both-sides", result: "x = (-11 ± √361)/2",
        wrong: ["x = (11 ± √361)/2", "x = (-11 ± 361)/2", "x = -11 ± √361"], wrongKinds: ["undoSign", "rootSlip", "twoA"] },
      { action: "evalRoot", value: "x = (-11 ± 19)/2", target: "both-sides", result: "x = (-11 ± 19)/2",
        wrong: ["x = (-11 + 19)/2", "x = (-11 ± 20)/2", "x = -11 ± 19"], wrongKinds: ["plusMinus", "rootSlip", "twoA"] },
      { action: "roots", value: "x = -15, 4", target: "both-sides", result: "x = -15, 4",
        wrong: ["x = 4", "x = -30, 8", "x = -4, 15"], wrongKinds: ["plusMinus", "twoA", "undoSign"] }
    ],
    hints: {
      en: [
        "a is the number in front of x², b the number in front of x, c the number on its own. Keep their signs: a = 1, b = 11, c = -60. (x² is 1x², so a = 1.)",
        "Put the numbers in: b² - 4ac = 11² - 4 × 1 × (-60) = 121 + 240 = 361. Careful: c is -60, so -4ac is +240.",
        "Quadratic formula: x = (-b ± √(b² - 4ac))/2a. Here -b = -11 and 2a = 2, so put in √361.",
        "√361 = 19, because 19² = 361. Keep the ±: it gives both answers.",
        "Work out both: (-11 + 19)/2 = 4 and (-11 - 19)/2 = -15."
      ],
      ja: [
        "aはx²の前の数、bはxの前の数、cは単独の数。符号もそのまま：a = 1、b = 11、c = -60。（x² は 1x² なので a = 1。）",
        "数を入れる：b² - 4ac = 11² - 4 × 1 × (-60) = 121 + 240 = 361。注意：c は -60 なので、-4ac は +240。",
        "解の公式：x = (-b ± √(b² - 4ac))/2a。-b = -11、2a = 2 なので、√361 を入れる。",
        "19² = 361 なので √361 = 19。±はそのまま：答えが2つ出ます。",
        "両方計算する：(-11 + 19)/2 = 4、(-11 - 19)/2 = -15。"
      ]
    },
    explanation: {
      en: "The quadratic formula works on any quadratic. Read off a = 1, b = 11, c = -60: b² - 4ac = 11² - 4 × 1 × (-60) = 121 + 240 = 361, and √361 = 19. So x = (-11 ± 19)/2: x = -15 or x = 4.",
      ja: "解の公式はどんな二次方程式にも使えます。a = 1、b = 11、c = -60 を読み取って、b² - 4ac = 11² - 4 × 1 × (-60) = 121 + 240 = 361、√361 = 19。x = (-11 ± 19)/2 なので、x = -15 または x = 4。"
    }
  },
  {
    id: "roots_hard_06",
    topic: "roots",
    equation: "x² - 12x - 28 = 0",
    answer: [-2, 14],
    difficulty: "hard",
    type: "formula",
    basePoints: 30,
    abc: [1, -12, -28],
    steps: [
      { action: "coef", value: "1, -12, -28", prompt: "coefPrompt", fill: "formula", target: "both-sides", result: "x² - 12x - 28 = 0\na = 1, b = -12, c = -28",
        wrong: ["1, -12, 28", "1, 12, -28", "0, -12, -28"], wrongKinds: ["readCoef", "readCoef", "readCoef"] },
      { action: "discriminant", value: "b² - 4ac = 256", prompt: "discriminantPrompt", focus: "disc", target: "both-sides", result: "a = 1, b = -12, c = -28\nb² - 4ac = 256",
        wrong: ["b² - 4ac = 32", "b² - 4ac = 172", "b² - 4ac = 88"], wrongKinds: ["discriminant", "discriminant", "discriminant"] },
      { action: "formula", value: "x = (12 ± √256)/2", focus: "top", target: "both-sides", result: "x = (12 ± √256)/2",
        wrong: ["x = (-12 ± √256)/2", "x = (12 ± 256)/2", "x = 12 ± √256"], wrongKinds: ["undoSign", "rootSlip", "twoA"] },
      { action: "evalRoot", value: "x = (12 ± 16)/2", target: "both-sides", result: "x = (12 ± 16)/2",
        wrong: ["x = (12 + 16)/2", "x = (12 ± 17)/2", "x = 12 ± 16"], wrongKinds: ["plusMinus", "rootSlip", "twoA"] },
      { action: "roots", value: "x = -2, 14", target: "both-sides", result: "x = -2, 14",
        wrong: ["x = 14", "x = -4, 28", "x = -14, 2"], wrongKinds: ["plusMinus", "twoA", "undoSign"] }
    ],
    hints: {
      en: [
        "a is the number in front of x², b the number in front of x, c the number on its own. Keep their signs: a = 1, b = -12, c = -28. (x² is 1x², so a = 1.)",
        "Put the numbers in: b² - 4ac = (-12)² - 4 × 1 × (-28) = 144 + 112 = 256. Careful: c is -28, so -4ac is +112.",
        "Quadratic formula: x = (-b ± √(b² - 4ac))/2a. Here -b = 12 and 2a = 2, so put in √256.",
        "√256 = 16, because 16² = 256. Keep the ±: it gives both answers.",
        "Work out both: (12 + 16)/2 = 14 and (12 - 16)/2 = -2."
      ],
      ja: [
        "aはx²の前の数、bはxの前の数、cは単独の数。符号もそのまま：a = 1、b = -12、c = -28。（x² は 1x² なので a = 1。）",
        "数を入れる：b² - 4ac = (-12)² - 4 × 1 × (-28) = 144 + 112 = 256。注意：c は -28 なので、-4ac は +112。",
        "解の公式：x = (-b ± √(b² - 4ac))/2a。-b = 12、2a = 2 なので、√256 を入れる。",
        "16² = 256 なので √256 = 16。±はそのまま：答えが2つ出ます。",
        "両方計算する：(12 + 16)/2 = 14、(12 - 16)/2 = -2。"
      ]
    },
    explanation: {
      en: "The quadratic formula works on any quadratic. Read off a = 1, b = -12, c = -28: b² - 4ac = (-12)² - 4 × 1 × (-28) = 144 + 112 = 256, and √256 = 16. So x = (12 ± 16)/2: x = -2 or x = 14.",
      ja: "解の公式はどんな二次方程式にも使えます。a = 1、b = -12、c = -28 を読み取って、b² - 4ac = (-12)² - 4 × 1 × (-28) = 144 + 112 = 256、√256 = 16。x = (12 ± 16)/2 なので、x = -2 または x = 14。"
    }
  },
  {
    id: "roots_hard_07",
    topic: "roots",
    equation: "2x² + 6x - 20 = 0",
    answer: [-5, 2],
    difficulty: "hard",
    type: "formula",
    basePoints: 30,
    abc: [2, 6, -20],
    steps: [
      { action: "coef", value: "2, 6, -20", prompt: "coefPrompt", fill: "formula", target: "both-sides", result: "2x² + 6x - 20 = 0\na = 2, b = 6, c = -20",
        wrong: ["2, 6, 20", "2, -6, -20", "6, 2, -20"], wrongKinds: ["readCoef", "readCoef", "readCoef"] },
      { action: "discriminant", value: "b² - 4ac = 196", prompt: "discriminantPrompt", focus: "disc", target: "both-sides", result: "a = 2, b = 6, c = -20\nb² - 4ac = 196",
        wrong: ["b² - 4ac = -124", "b² - 4ac = 76", "b² - 4ac = 172"], wrongKinds: ["discriminant", "discriminant", "discriminant"] },
      { action: "formula", value: "x = (-6 ± √196)/4", focus: "top", target: "both-sides", result: "x = (-6 ± √196)/4",
        wrong: ["x = (6 ± √196)/4", "x = (-6 ± 196)/4", "x = (-6 ± √196)/2"], wrongKinds: ["undoSign", "rootSlip", "twoA"] },
      { action: "evalRoot", value: "x = (-6 ± 14)/4", target: "both-sides", result: "x = (-6 ± 14)/4",
        wrong: ["x = (-6 + 14)/4", "x = (-6 ± 15)/4", "x = (-6 ± 14)/2"], wrongKinds: ["plusMinus", "rootSlip", "twoA"] },
      { action: "roots", value: "x = -5, 2", target: "both-sides", result: "x = -5, 2",
        wrong: ["x = 2", "x = -20, 8", "x = -2, 5"], wrongKinds: ["plusMinus", "twoA", "undoSign"] }
    ],
    hints: {
      en: [
        "a is the number in front of x², b the number in front of x, c the number on its own. Keep their signs: a = 2, b = 6, c = -20.",
        "Put the numbers in: b² - 4ac = 6² - 4 × 2 × (-20) = 36 + 160 = 196. Careful: c is -20, so -4ac is +160.",
        "Quadratic formula: x = (-b ± √(b² - 4ac))/2a. Here -b = -6 and 2a = 4, so put in √196.",
        "√196 = 14, because 14² = 196. Keep the ±: it gives both answers.",
        "Work out both: (-6 + 14)/4 = 2 and (-6 - 14)/4 = -5."
      ],
      ja: [
        "aはx²の前の数、bはxの前の数、cは単独の数。符号もそのまま：a = 2、b = 6、c = -20。",
        "数を入れる：b² - 4ac = 6² - 4 × 2 × (-20) = 36 + 160 = 196。注意：c は -20 なので、-4ac は +160。",
        "解の公式：x = (-b ± √(b² - 4ac))/2a。-b = -6、2a = 4 なので、√196 を入れる。",
        "14² = 196 なので √196 = 14。±はそのまま：答えが2つ出ます。",
        "両方計算する：(-6 + 14)/4 = 2、(-6 - 14)/4 = -5。"
      ]
    },
    explanation: {
      en: "The quadratic formula works on any quadratic. Read off a = 2, b = 6, c = -20: b² - 4ac = 6² - 4 × 2 × (-20) = 36 + 160 = 196, and √196 = 14. So x = (-6 ± 14)/4: x = -5 or x = 2.",
      ja: "解の公式はどんな二次方程式にも使えます。a = 2、b = 6、c = -20 を読み取って、b² - 4ac = 6² - 4 × 2 × (-20) = 36 + 160 = 196、√196 = 14。x = (-6 ± 14)/4 なので、x = -5 または x = 2。"
    }
  },
  {
    id: "roots_hard_08",
    topic: "roots",
    equation: "2x² - 8x - 42 = 0",
    answer: [-3, 7],
    difficulty: "hard",
    type: "formula",
    basePoints: 30,
    abc: [2, -8, -42],
    steps: [
      { action: "coef", value: "2, -8, -42", prompt: "coefPrompt", fill: "formula", target: "both-sides", result: "2x² - 8x - 42 = 0\na = 2, b = -8, c = -42",
        wrong: ["2, -8, 42", "2, 8, -42", "-8, 2, -42"], wrongKinds: ["readCoef", "readCoef", "readCoef"] },
      { action: "discriminant", value: "b² - 4ac = 400", prompt: "discriminantPrompt", focus: "disc", target: "both-sides", result: "a = 2, b = -8, c = -42\nb² - 4ac = 400",
        wrong: ["b² - 4ac = -272", "b² - 4ac = 148", "b² - 4ac = 320"], wrongKinds: ["discriminant", "discriminant", "discriminant"] },
      { action: "formula", value: "x = (8 ± √400)/4", focus: "top", target: "both-sides", result: "x = (8 ± √400)/4",
        wrong: ["x = (-8 ± √400)/4", "x = (8 ± 400)/4", "x = (8 ± √400)/2"], wrongKinds: ["undoSign", "rootSlip", "twoA"] },
      { action: "evalRoot", value: "x = (8 ± 20)/4", target: "both-sides", result: "x = (8 ± 20)/4",
        wrong: ["x = (8 + 20)/4", "x = (8 ± 21)/4", "x = (8 ± 20)/2"], wrongKinds: ["plusMinus", "rootSlip", "twoA"] },
      { action: "roots", value: "x = -3, 7", target: "both-sides", result: "x = -3, 7",
        wrong: ["x = 7", "x = -12, 28", "x = -7, 3"], wrongKinds: ["plusMinus", "twoA", "undoSign"] }
    ],
    hints: {
      en: [
        "a is the number in front of x², b the number in front of x, c the number on its own. Keep their signs: a = 2, b = -8, c = -42.",
        "Put the numbers in: b² - 4ac = (-8)² - 4 × 2 × (-42) = 64 + 336 = 400. Careful: c is -42, so -4ac is +336.",
        "Quadratic formula: x = (-b ± √(b² - 4ac))/2a. Here -b = 8 and 2a = 4, so put in √400.",
        "√400 = 20, because 20² = 400. Keep the ±: it gives both answers.",
        "Work out both: (8 + 20)/4 = 7 and (8 - 20)/4 = -3."
      ],
      ja: [
        "aはx²の前の数、bはxの前の数、cは単独の数。符号もそのまま：a = 2、b = -8、c = -42。",
        "数を入れる：b² - 4ac = (-8)² - 4 × 2 × (-42) = 64 + 336 = 400。注意：c は -42 なので、-4ac は +336。",
        "解の公式：x = (-b ± √(b² - 4ac))/2a。-b = 8、2a = 4 なので、√400 を入れる。",
        "20² = 400 なので √400 = 20。±はそのまま：答えが2つ出ます。",
        "両方計算する：(8 + 20)/4 = 7、(8 - 20)/4 = -3。"
      ]
    },
    explanation: {
      en: "The quadratic formula works on any quadratic. Read off a = 2, b = -8, c = -42: b² - 4ac = (-8)² - 4 × 2 × (-42) = 64 + 336 = 400, and √400 = 20. So x = (8 ± 20)/4: x = -3 or x = 7.",
      ja: "解の公式はどんな二次方程式にも使えます。a = 2、b = -8、c = -42 を読み取って、b² - 4ac = (-8)² - 4 × 2 × (-42) = 64 + 336 = 400、√400 = 20。x = (8 ± 20)/4 なので、x = -3 または x = 7。"
    }
  },
  {
    id: "roots_hard_09",
    topic: "roots",
    equation: "3x² + 9x - 12 = 0",
    answer: [-4, 1],
    difficulty: "hard",
    type: "formula",
    basePoints: 30,
    abc: [3, 9, -12],
    steps: [
      { action: "coef", value: "3, 9, -12", prompt: "coefPrompt", fill: "formula", target: "both-sides", result: "3x² + 9x - 12 = 0\na = 3, b = 9, c = -12",
        wrong: ["3, 9, 12", "3, -9, -12", "9, 3, -12"], wrongKinds: ["readCoef", "readCoef", "readCoef"] },
      { action: "discriminant", value: "b² - 4ac = 225", prompt: "discriminantPrompt", focus: "disc", target: "both-sides", result: "a = 3, b = 9, c = -12\nb² - 4ac = 225",
        wrong: ["b² - 4ac = -63", "b² - 4ac = 117", "b² - 4ac = 162"], wrongKinds: ["discriminant", "discriminant", "discriminant"] },
      { action: "formula", value: "x = (-9 ± √225)/6", focus: "top", target: "both-sides", result: "x = (-9 ± √225)/6",
        wrong: ["x = (9 ± √225)/6", "x = (-9 ± 225)/6", "x = (-9 ± √225)/3"], wrongKinds: ["undoSign", "rootSlip", "twoA"] },
      { action: "evalRoot", value: "x = (-9 ± 15)/6", target: "both-sides", result: "x = (-9 ± 15)/6",
        wrong: ["x = (-9 + 15)/6", "x = (-9 ± 16)/6", "x = (-9 ± 15)/3"], wrongKinds: ["plusMinus", "rootSlip", "twoA"] },
      { action: "roots", value: "x = -4, 1", target: "both-sides", result: "x = -4, 1",
        wrong: ["x = 1", "x = -24, 6", "x = -1, 4"], wrongKinds: ["plusMinus", "twoA", "undoSign"] }
    ],
    hints: {
      en: [
        "a is the number in front of x², b the number in front of x, c the number on its own. Keep their signs: a = 3, b = 9, c = -12.",
        "Put the numbers in: b² - 4ac = 9² - 4 × 3 × (-12) = 81 + 144 = 225. Careful: c is -12, so -4ac is +144.",
        "Quadratic formula: x = (-b ± √(b² - 4ac))/2a. Here -b = -9 and 2a = 6, so put in √225.",
        "√225 = 15, because 15² = 225. Keep the ±: it gives both answers.",
        "Work out both: (-9 + 15)/6 = 1 and (-9 - 15)/6 = -4."
      ],
      ja: [
        "aはx²の前の数、bはxの前の数、cは単独の数。符号もそのまま：a = 3、b = 9、c = -12。",
        "数を入れる：b² - 4ac = 9² - 4 × 3 × (-12) = 81 + 144 = 225。注意：c は -12 なので、-4ac は +144。",
        "解の公式：x = (-b ± √(b² - 4ac))/2a。-b = -9、2a = 6 なので、√225 を入れる。",
        "15² = 225 なので √225 = 15。±はそのまま：答えが2つ出ます。",
        "両方計算する：(-9 + 15)/6 = 1、(-9 - 15)/6 = -4。"
      ]
    },
    explanation: {
      en: "The quadratic formula works on any quadratic. Read off a = 3, b = 9, c = -12: b² - 4ac = 9² - 4 × 3 × (-12) = 81 + 144 = 225, and √225 = 15. So x = (-9 ± 15)/6: x = -4 or x = 1.",
      ja: "解の公式はどんな二次方程式にも使えます。a = 3、b = 9、c = -12 を読み取って、b² - 4ac = 9² - 4 × 3 × (-12) = 81 + 144 = 225、√225 = 15。x = (-9 ± 15)/6 なので、x = -4 または x = 1。"
    }
  },
  {
    id: "roots_hard_10",
    topic: "roots",
    equation: "3x² - 6x - 24 = 0",
    answer: [-2, 4],
    difficulty: "hard",
    type: "formula",
    basePoints: 30,
    abc: [3, -6, -24],
    steps: [
      { action: "coef", value: "3, -6, -24", prompt: "coefPrompt", fill: "formula", target: "both-sides", result: "3x² - 6x - 24 = 0\na = 3, b = -6, c = -24",
        wrong: ["3, -6, 24", "3, 6, -24", "-6, 3, -24"], wrongKinds: ["readCoef", "readCoef", "readCoef"] },
      { action: "discriminant", value: "b² - 4ac = 324", prompt: "discriminantPrompt", focus: "disc", target: "both-sides", result: "a = 3, b = -6, c = -24\nb² - 4ac = 324",
        wrong: ["b² - 4ac = -252", "b² - 4ac = 108", "b² - 4ac = 276"], wrongKinds: ["discriminant", "discriminant", "discriminant"] },
      { action: "formula", value: "x = (6 ± √324)/6", focus: "top", target: "both-sides", result: "x = (6 ± √324)/6",
        wrong: ["x = (-6 ± √324)/6", "x = (6 ± 324)/6", "x = (6 ± √324)/3"], wrongKinds: ["undoSign", "rootSlip", "twoA"] },
      { action: "evalRoot", value: "x = (6 ± 18)/6", target: "both-sides", result: "x = (6 ± 18)/6",
        wrong: ["x = (6 + 18)/6", "x = (6 ± 19)/6", "x = (6 ± 18)/3"], wrongKinds: ["plusMinus", "rootSlip", "twoA"] },
      { action: "roots", value: "x = -2, 4", target: "both-sides", result: "x = -2, 4",
        wrong: ["x = 4", "x = -12, 24", "x = -4, 2"], wrongKinds: ["plusMinus", "twoA", "undoSign"] }
    ],
    hints: {
      en: [
        "a is the number in front of x², b the number in front of x, c the number on its own. Keep their signs: a = 3, b = -6, c = -24.",
        "Put the numbers in: b² - 4ac = (-6)² - 4 × 3 × (-24) = 36 + 288 = 324. Careful: c is -24, so -4ac is +288.",
        "Quadratic formula: x = (-b ± √(b² - 4ac))/2a. Here -b = 6 and 2a = 6, so put in √324.",
        "√324 = 18, because 18² = 324. Keep the ±: it gives both answers.",
        "Work out both: (6 + 18)/6 = 4 and (6 - 18)/6 = -2."
      ],
      ja: [
        "aはx²の前の数、bはxの前の数、cは単独の数。符号もそのまま：a = 3、b = -6、c = -24。",
        "数を入れる：b² - 4ac = (-6)² - 4 × 3 × (-24) = 36 + 288 = 324。注意：c は -24 なので、-4ac は +288。",
        "解の公式：x = (-b ± √(b² - 4ac))/2a。-b = 6、2a = 6 なので、√324 を入れる。",
        "18² = 324 なので √324 = 18。±はそのまま：答えが2つ出ます。",
        "両方計算する：(6 + 18)/6 = 4、(6 - 18)/6 = -2。"
      ]
    },
    explanation: {
      en: "The quadratic formula works on any quadratic. Read off a = 3, b = -6, c = -24: b² - 4ac = (-6)² - 4 × 3 × (-24) = 36 + 288 = 324, and √324 = 18. So x = (6 ± 18)/6: x = -2 or x = 4.",
      ja: "解の公式はどんな二次方程式にも使えます。a = 3、b = -6、c = -24 を読み取って、b² - 4ac = (-6)² - 4 × 3 × (-24) = 36 + 288 = 324、√324 = 18。x = (6 ± 18)/6 なので、x = -2 または x = 4。"
    }
  },

  // =====================================================================
  // STRAIGHT LINES
  // =====================================================================
  {
    id: "line_easy_01",
    topic: "line",
    equation: "y = 2x + 3",
    answer: "m = 2, c = 3",
    difficulty: "easy",
    type: "read",
    basePoints: 10,
    line: { m: 2, c: 3, points: [] },
    steps: [
      { action: "gradient", value: "m = 2", target: "both-sides", result: "y = 2x + 3\nm = 2",
        wrong: ["m = 3", "m = -2", "m = 2x"], wrongKinds: ["swapMC", "lineSign", "generic"] },
      { action: "intercept", value: "c = 3", target: "both-sides", result: "y = 2x + 3\nm = 2, c = 3",
        wrong: ["c = 2", "c = -3", "c = 0"], wrongKinds: ["swapMC", "lineSign", "generic"] }
    ],
    hints: {
      en: [
        "In y = mx + c, m is the number in front of x, sign included. Here m = 2.",
        "c is the number on its own: 3. That's where the line crosses the y-axis, at (0, 3)."
      ],
      ja: [
        "y = mx + c では、m はxの前の数（符号も含む）。ここでは m = 2。",
        "c は単独の数：3。直線がy軸と交わる点 (0, 3)。"
      ]
    },
    explanation: {
      en: "In y = mx + c, m (the gradient) is the number in front of x and c (the y-intercept) is the number on its own. So m = 2 and c = 3: the line goes up 2 for every 1 across, and it crosses the y-axis at (0, 3).",
      ja: "y = mx + c では、m（傾き）はxの前の数、c（切片）は単独の数です。よって m = 2、c = 3。右に1進むと上に2進む直線で、y軸と (0, 3) で交わります。"
    }
  },
  {
    id: "line_easy_02",
    topic: "line",
    equation: "y = 4x - 1",
    answer: "m = 4, c = -1",
    difficulty: "easy",
    type: "read",
    basePoints: 10,
    line: { m: 4, c: -1, points: [] },
    steps: [
      { action: "gradient", value: "m = 4", target: "both-sides", result: "y = 4x - 1\nm = 4",
        wrong: ["m = -1", "m = -4", "m = 4x"], wrongKinds: ["swapMC", "lineSign", "generic"] },
      { action: "intercept", value: "c = -1", target: "both-sides", result: "y = 4x - 1\nm = 4, c = -1",
        wrong: ["c = 4", "c = 1", "c = 0"], wrongKinds: ["swapMC", "lineSign", "generic"] }
    ],
    hints: {
      en: [
        "In y = mx + c, m is the number in front of x, sign included. Here m = 4.",
        "c is the number on its own, sign included: the - 1 means c = -1. That's where the line crosses the y-axis."
      ],
      ja: [
        "y = mx + c では、m はxの前の数（符号も含む）。ここでは m = 4。",
        "c は単独の数（符号も含む）：- 1 なので c = -1。直線がy軸と交わる点。"
      ]
    },
    explanation: {
      en: "In y = mx + c, m (the gradient) is the number in front of x and c (the y-intercept) is the number on its own. So m = 4 and c = -1: the line goes up 4 for every 1 across, and it crosses the y-axis at (0, -1).",
      ja: "y = mx + c では、m（傾き）はxの前の数、c（切片）は単独の数です。よって m = 4、c = -1。右に1進むと上に4進む直線で、y軸と (0, -1) で交わります。"
    }
  },
  {
    id: "line_easy_03",
    topic: "line",
    equation: "y = x + 4",
    answer: "m = 1, c = 4",
    difficulty: "easy",
    type: "read",
    basePoints: 10,
    line: { m: 1, c: 4, points: [] },
    steps: [
      { action: "gradient", value: "m = 1", target: "both-sides", result: "y = x + 4\nm = 1",
        wrong: ["m = 4", "m = 0", "m = -1"], wrongKinds: ["swapMC", "loneLetter", "lineSign"] },
      { action: "intercept", value: "c = 4", target: "both-sides", result: "y = x + 4\nm = 1, c = 4",
        wrong: ["c = 1", "c = -4", "c = 0"], wrongKinds: ["swapMC", "lineSign", "generic"] }
    ],
    hints: {
      en: [
        "In y = mx + c, m is the number in front of x. x on its own means 1x, so m = 1.",
        "c is the number on its own: 4. That's where the line crosses the y-axis, at (0, 4)."
      ],
      ja: [
        "y = mx + c では、m はxの前の数。x は 1x のことなので m = 1。",
        "c は単独の数：4。直線がy軸と交わる点 (0, 4)。"
      ]
    },
    explanation: {
      en: "In y = mx + c, m (the gradient) is the number in front of x and c (the y-intercept) is the number on its own. x on its own counts as 1x. So m = 1 and c = 4: the line goes up 1 for every 1 across, and it crosses the y-axis at (0, 4).",
      ja: "y = mx + c では、m（傾き）はxの前の数、c（切片）は単独の数です。x は 1x と数えます。よって m = 1、c = 4。右に1進むと上に1進む直線で、y軸と (0, 4) で交わります。"
    }
  },
  {
    id: "line_easy_04",
    topic: "line",
    equation: "y = 3 - 2x",
    answer: "m = -2, c = 3",
    difficulty: "easy",
    type: "read",
    basePoints: 10,
    line: { m: -2, c: 3, points: [] },
    steps: [
      { action: "gradient", value: "m = -2", target: "both-sides", result: "y = 3 - 2x\nm = -2",
        wrong: ["m = 3", "m = 2", "m = -2x"], wrongKinds: ["swapMC", "lineSign", "generic"] },
      { action: "intercept", value: "c = 3", target: "both-sides", result: "y = 3 - 2x\nm = -2, c = 3",
        wrong: ["c = -2", "c = -3", "c = 0"], wrongKinds: ["swapMC", "lineSign", "generic"] }
    ],
    hints: {
      en: [
        "The x term can come second: 3 - 2x is the same as -2x + 3. The number in front of x, sign included, is -2.",
        "c is the number on its own: 3. That's where the line crosses the y-axis, at (0, 3)."
      ],
      ja: [
        "xの項が後ろに来ることもある：3 - 2x は -2x + 3 と同じ。xの前の数（符号も含む）は -2。",
        "c は単独の数：3。直線がy軸と交わる点 (0, 3)。"
      ]
    },
    explanation: {
      en: "In y = mx + c, m (the gradient) is the number in front of x and c (the y-intercept) is the number on its own. 3 - 2x is just -2x + 3 written the other way round. So m = -2 and c = 3: the line goes down 2 for every 1 across, and it crosses the y-axis at (0, 3).",
      ja: "y = mx + c では、m（傾き）はxの前の数、c（切片）は単独の数です。3 - 2x は -2x + 3 を逆の順に書いただけです。よって m = -2、c = 3。右に1進むと下に2進む直線で、y軸と (0, 3) で交わります。"
    }
  },
  {
    id: "line_easy_05",
    topic: "line",
    equation: "y = -x + 2",
    answer: "m = -1, c = 2",
    difficulty: "easy",
    type: "read",
    basePoints: 10,
    line: { m: -1, c: 2, points: [] },
    steps: [
      { action: "gradient", value: "m = -1", target: "both-sides", result: "y = -x + 2\nm = -1",
        wrong: ["m = 2", "m = 0", "m = 1"], wrongKinds: ["swapMC", "loneLetter", "lineSign"] },
      { action: "intercept", value: "c = 2", target: "both-sides", result: "y = -x + 2\nm = -1, c = 2",
        wrong: ["c = -1", "c = -2", "c = 0"], wrongKinds: ["swapMC", "lineSign", "generic"] }
    ],
    hints: {
      en: [
        "In y = mx + c, m is the number in front of x. -x on its own means -1x, so m = -1.",
        "c is the number on its own: 2. That's where the line crosses the y-axis, at (0, 2)."
      ],
      ja: [
        "y = mx + c では、m はxの前の数。-x は -1x のことなので m = -1。",
        "c は単独の数：2。直線がy軸と交わる点 (0, 2)。"
      ]
    },
    explanation: {
      en: "In y = mx + c, m (the gradient) is the number in front of x and c (the y-intercept) is the number on its own. -x on its own counts as -1x. So m = -1 and c = 2: the line goes down 1 for every 1 across, and it crosses the y-axis at (0, 2).",
      ja: "y = mx + c では、m（傾き）はxの前の数、c（切片）は単独の数です。-x は -1x と数えます。よって m = -1、c = 2。右に1進むと下に1進む直線で、y軸と (0, 2) で交わります。"
    }
  },
  {
    id: "line_easy_06",
    topic: "line",
    equation: "y = 4",
    answer: "m = 0, c = 4",
    difficulty: "easy",
    type: "read",
    basePoints: 10,
    line: { m: 0, c: 4, points: [] },
    steps: [
      { action: "gradient", value: "m = 0", target: "both-sides", result: "y = 4\nm = 0",
        wrong: ["m = 4", "m = 1", "m = -4"], wrongKinds: ["swapMC", "generic", "generic"] },
      { action: "intercept", value: "c = 4", target: "both-sides", result: "y = 4\nm = 0, c = 4",
        wrong: ["c = 0", "c = -4", "c = 2"], wrongKinds: ["swapMC", "lineSign", "generic"] }
    ],
    hints: {
      en: [
        "There's no x term at all, so think of it as y = 0x + 4. m = 0.",
        "c is the number on its own: 4. That's where the line crosses the y-axis, at (0, 4)."
      ],
      ja: [
        "xの項がないので、y = 0x + 4 と考える。m = 0。",
        "c は単独の数：4。直線がy軸と交わる点 (0, 4)。"
      ]
    },
    explanation: {
      en: "In y = mx + c, m (the gradient) is the number in front of x and c (the y-intercept) is the number on its own. With no x term, the number in front of x is 0. So m = 0 and c = 4: the line is flat, and it crosses the y-axis at (0, 4).",
      ja: "y = mx + c では、m（傾き）はxの前の数、c（切片）は単独の数です。xの項がないので、xの前の数は0です。よって m = 0、c = 4。直線は水平で、y軸と (0, 4) で交わります。"
    }
  },
  {
    id: "line_easy_07",
    topic: "line",
    equation: "y = -3x - 4",
    answer: "m = -3, c = -4",
    difficulty: "easy",
    type: "read",
    basePoints: 10,
    line: { m: -3, c: -4, points: [] },
    steps: [
      { action: "gradient", value: "m = -3", target: "both-sides", result: "y = -3x - 4\nm = -3",
        wrong: ["m = -4", "m = 3", "m = -3x"], wrongKinds: ["swapMC", "lineSign", "generic"] },
      { action: "intercept", value: "c = -4", target: "both-sides", result: "y = -3x - 4\nm = -3, c = -4",
        wrong: ["c = -3", "c = 4", "c = 0"], wrongKinds: ["swapMC", "lineSign", "generic"] }
    ],
    hints: {
      en: [
        "In y = mx + c, m is the number in front of x, sign included. Here m = -3.",
        "c is the number on its own, sign included: the - 4 means c = -4. That's where the line crosses the y-axis."
      ],
      ja: [
        "y = mx + c では、m はxの前の数（符号も含む）。ここでは m = -3。",
        "c は単独の数（符号も含む）：- 4 なので c = -4。直線がy軸と交わる点。"
      ]
    },
    explanation: {
      en: "In y = mx + c, m (the gradient) is the number in front of x and c (the y-intercept) is the number on its own. So m = -3 and c = -4: the line goes down 3 for every 1 across, and it crosses the y-axis at (0, -4).",
      ja: "y = mx + c では、m（傾き）はxの前の数、c（切片）は単独の数です。よって m = -3、c = -4。右に1進むと下に3進む直線で、y軸と (0, -4) で交わります。"
    }
  },
  {
    id: "line_easy_08",
    topic: "line",
    equation: "y = 6 + x",
    answer: "m = 1, c = 6",
    difficulty: "easy",
    type: "read",
    basePoints: 10,
    line: { m: 1, c: 6, points: [] },
    steps: [
      { action: "gradient", value: "m = 1", target: "both-sides", result: "y = 6 + x\nm = 1",
        wrong: ["m = 6", "m = 0", "m = -1"], wrongKinds: ["swapMC", "loneLetter", "lineSign"] },
      { action: "intercept", value: "c = 6", target: "both-sides", result: "y = 6 + x\nm = 1, c = 6",
        wrong: ["c = 1", "c = -6", "c = 0"], wrongKinds: ["swapMC", "lineSign", "generic"] }
    ],
    hints: {
      en: [
        "6 + x is the same as x + 6, and x on its own means 1x, so m = 1.",
        "c is the number on its own: 6. That's where the line crosses the y-axis, at (0, 6)."
      ],
      ja: [
        "6 + x は x + 6 と同じ。x は 1x のことなので m = 1。",
        "c は単独の数：6。直線がy軸と交わる点 (0, 6)。"
      ]
    },
    explanation: {
      en: "In y = mx + c, m (the gradient) is the number in front of x and c (the y-intercept) is the number on its own. 6 + x is just x + 6 the other way round, and x counts as 1x. So m = 1 and c = 6: the line goes up 1 for every 1 across, and it crosses the y-axis at (0, 6).",
      ja: "y = mx + c では、m（傾き）はxの前の数、c（切片）は単独の数です。6 + x は x + 6 を逆に書いただけで、x は 1x と数えます。よって m = 1、c = 6。右に1進むと上に1進む直線で、y軸と (0, 6) で交わります。"
    }
  },
  {
    id: "line_easy_09",
    topic: "line",
    equation: "y = -2x",
    answer: "m = -2, c = 0",
    difficulty: "easy",
    type: "read",
    basePoints: 10,
    line: { m: -2, c: 0, points: [] },
    steps: [
      { action: "gradient", value: "m = -2", target: "both-sides", result: "y = -2x\nm = -2",
        wrong: ["m = 0", "m = 2", "m = -2x"], wrongKinds: ["swapMC", "lineSign", "generic"] },
      { action: "intercept", value: "c = 0", target: "both-sides", result: "y = -2x\nm = -2, c = 0",
        wrong: ["c = -2", "c = 2", "c = 1"], wrongKinds: ["swapMC", "generic", "generic"] }
    ],
    hints: {
      en: [
        "In y = mx + c, m is the number in front of x, sign included. Here m = -2.",
        "c is the number on its own, but there isn't one, so c = 0. The line goes through (0, 0)."
      ],
      ja: [
        "y = mx + c では、m はxの前の数（符号も含む）。ここでは m = -2。",
        "c は単独の数だが、ここにはないので c = 0。直線は (0, 0) を通る。"
      ]
    },
    explanation: {
      en: "In y = mx + c, m (the gradient) is the number in front of x and c (the y-intercept) is the number on its own. There's no number on its own, so c = 0. So m = -2 and c = 0: the line goes down 2 for every 1 across, and it crosses the y-axis at (0, 0).",
      ja: "y = mx + c では、m（傾き）はxの前の数、c（切片）は単独の数です。単独の数がないので c = 0 です。よって m = -2、c = 0。右に1進むと下に2進む直線で、y軸と (0, 0) で交わります。"
    }
  },
  {
    id: "line_easy_10",
    topic: "line",
    equation: "y = 1 - 3x",
    answer: "m = -3, c = 1",
    difficulty: "easy",
    type: "read",
    basePoints: 10,
    line: { m: -3, c: 1, points: [] },
    steps: [
      { action: "gradient", value: "m = -3", target: "both-sides", result: "y = 1 - 3x\nm = -3",
        wrong: ["m = 1", "m = 3", "m = -3x"], wrongKinds: ["swapMC", "lineSign", "generic"] },
      { action: "intercept", value: "c = 1", target: "both-sides", result: "y = 1 - 3x\nm = -3, c = 1",
        wrong: ["c = -3", "c = -1", "c = 0"], wrongKinds: ["swapMC", "lineSign", "generic"] }
    ],
    hints: {
      en: [
        "The x term can come second: 1 - 3x is the same as -3x + 1. The number in front of x, sign included, is -3.",
        "c is the number on its own: 1. That's where the line crosses the y-axis, at (0, 1)."
      ],
      ja: [
        "xの項が後ろに来ることもある：1 - 3x は -3x + 1 と同じ。xの前の数（符号も含む）は -3。",
        "c は単独の数：1。直線がy軸と交わる点 (0, 1)。"
      ]
    },
    explanation: {
      en: "In y = mx + c, m (the gradient) is the number in front of x and c (the y-intercept) is the number on its own. 1 - 3x is just -3x + 1 written the other way round. So m = -3 and c = 1: the line goes down 3 for every 1 across, and it crosses the y-axis at (0, 1).",
      ja: "y = mx + c では、m（傾き）はxの前の数、c（切片）は単独の数です。1 - 3x は -3x + 1 を逆の順に書いただけです。よって m = -3、c = 1。右に1進むと下に3進む直線で、y軸と (0, 1) で交わります。"
    }
  },
  {
    id: "line_medium_01",
    topic: "line",
    equation: "(1, 2), (3, 6)\nm = {y_2 - y_1}/{x_2 - x_1}",
    answer: "m = 2",
    difficulty: "medium",
    type: "two-point-gradient",
    basePoints: 20,
    line: { m: 2, c: 0, points: [[1, 2], [3, 6]] },
    steps: [
      { action: "gradSub", value: "{6 - 2}/{3 - 1}", target: "both-sides", result: "(1, 2), (3, 6)\nm = {6 - 2}/{3 - 1}",
        wrong: ["{3 - 1}/{6 - 2}", "{6 - 2}/{1 - 3}", "{6 - 3}/{2 - 1}"], wrongKinds: ["riseRun", "subtractOrder", "generic"] },
      { action: "gradCalc", value: "{4}/{2}", target: "both-sides", result: "(1, 2), (3, 6)\nm = {4}/{2}",
        wrong: ["{-4}/{2}", "{4}/{-2}", "{4}/{3}"], wrongKinds: ["generic", "generic", "generic"] },
      { action: "gradient", value: "m = 2", prompt: "gradDividePrompt", target: "both-sides", result: "(1, 2), (3, 6)\nm = 2",
        wrong: ["m = 1/2", "m = -2", "m = 4"], wrongKinds: ["riseRun", "lineSign", "generic"] }
    ],
    hints: {
      en: [
        "Label the points: (x_1, y_1) = (1, 2) and (x_2, y_2) = (3, 6). Then the top is y_2 - y_1 = 6 - 2 and the bottom is x_2 - x_1 = 3 - 1.",
        "Top: 6 - 2 = 4. Bottom: 3 - 1 = 2.",
        "4 ÷ 2 = 2, so m = 2."
      ],
      ja: [
        "点に名前をつける：(x_1, y_1) = (1, 2)、(x_2, y_2) = (3, 6)。上は y_2 - y_1 = 6 - 2、下は x_2 - x_1 = 3 - 1。",
        "上：6 - 2 = 4。下：3 - 1 = 2。",
        "4 ÷ 2 = 2 なので m = 2。"
      ]
    },
    explanation: {
      en: "Label the points (x_1, y_1) = (1, 2) and (x_2, y_2) = (3, 6). The formula is m = (y_2 - y_1) ÷ (x_2 - x_1). Putting the points in: m = (6 - 2) ÷ (3 - 1). That's 4 ÷ 2, so m = 2: the line goes up 2 for every 1 across.",
      ja: "点に名前をつけます：(x_1, y_1) = (1, 2)、(x_2, y_2) = (3, 6)。公式は m = (y_2 - y_1) ÷ (x_2 - x_1)。点を代入すると m = (6 - 2) ÷ (3 - 1)。これは 4 ÷ 2 なので m = 2。右に1進むと上に2進む直線です。"
    }
  },
  {
    id: "line_medium_02",
    topic: "line",
    equation: "(0, -5), (2, 1)\nm = {y_2 - y_1}/{x_2 - x_1}",
    answer: "m = 3",
    difficulty: "medium",
    type: "two-point-gradient",
    basePoints: 20,
    line: { m: 3, c: -5, points: [[0, -5], [2, 1]] },
    steps: [
      { action: "gradSub", value: "{1 - (-5)}/{2 - 0}", target: "both-sides", result: "(0, -5), (2, 1)\nm = {1 - (-5)}/{2 - 0}",
        wrong: ["{2 - 0}/{1 - (-5)}", "{1 - (-5)}/{0 - 2}", "{1 - 2}/{-5 - 0}"], wrongKinds: ["riseRun", "subtractOrder", "generic"] },
      { action: "gradCalc", value: "{6}/{2}", target: "both-sides", result: "(0, -5), (2, 1)\nm = {6}/{2}",
        wrong: ["{-4}/{2}", "{-6}/{2}", "{6}/{-2}"], wrongKinds: ["minusNegative", "generic", "generic"] },
      { action: "gradient", value: "m = 3", prompt: "gradDividePrompt", target: "both-sides", result: "(0, -5), (2, 1)\nm = 3",
        wrong: ["m = 1/3", "m = -3", "m = 6"], wrongKinds: ["riseRun", "lineSign", "generic"] }
    ],
    hints: {
      en: [
        "Label the points: (x_1, y_1) = (0, -5) and (x_2, y_2) = (2, 1). Then the top is y_2 - y_1 = 1 - (-5) and the bottom is x_2 - x_1 = 2 - 0.",
        "Top: 1 - (-5) = 1 + 5 = 6. Bottom: 2 - 0 = 2. Minus a negative is a plus.",
        "6 ÷ 2 = 3, so m = 3."
      ],
      ja: [
        "点に名前をつける：(x_1, y_1) = (0, -5)、(x_2, y_2) = (2, 1)。上は y_2 - y_1 = 1 - (-5)、下は x_2 - x_1 = 2 - 0。",
        "上：1 - (-5) = 1 + 5 = 6。下：2 - 0 = 2。マイナスのマイナスはプラス。",
        "6 ÷ 2 = 3 なので m = 3。"
      ]
    },
    explanation: {
      en: "Label the points (x_1, y_1) = (0, -5) and (x_2, y_2) = (2, 1). The formula is m = (y_2 - y_1) ÷ (x_2 - x_1). Putting the points in: m = (1 - (-5)) ÷ (2 - 0). That's 6 ÷ 2, so m = 3: the line goes up 3 for every 1 across.",
      ja: "点に名前をつけます：(x_1, y_1) = (0, -5)、(x_2, y_2) = (2, 1)。公式は m = (y_2 - y_1) ÷ (x_2 - x_1)。点を代入すると m = (1 - (-5)) ÷ (2 - 0)。これは 6 ÷ 2 なので m = 3。右に1進むと上に3進む直線です。"
    }
  },
  {
    id: "line_medium_03",
    topic: "line",
    equation: "(-2, -5), (1, 4)\nm = {y_2 - y_1}/{x_2 - x_1}",
    answer: "m = 3",
    difficulty: "medium",
    type: "two-point-gradient",
    basePoints: 20,
    line: { m: 3, c: 1, points: [[-2, -5], [1, 4]] },
    steps: [
      { action: "gradSub", value: "{4 - (-5)}/{1 - (-2)}", target: "both-sides", result: "(-2, -5), (1, 4)\nm = {4 - (-5)}/{1 - (-2)}",
        wrong: ["{1 - (-2)}/{4 - (-5)}", "{4 - (-5)}/{-2 - 1}", "{4 - 1}/{-5 - (-2)}"], wrongKinds: ["riseRun", "subtractOrder", "generic"] },
      { action: "gradCalc", value: "{9}/{3}", target: "both-sides", result: "(-2, -5), (1, 4)\nm = {9}/{3}",
        wrong: ["{-1}/{3}", "{9}/{-1}", "{-9}/{3}"], wrongKinds: ["minusNegative", "minusNegative", "generic"] },
      { action: "gradient", value: "m = 3", prompt: "gradDividePrompt", target: "both-sides", result: "(-2, -5), (1, 4)\nm = 3",
        wrong: ["m = 1/3", "m = -3", "m = 9"], wrongKinds: ["riseRun", "lineSign", "generic"] }
    ],
    hints: {
      en: [
        "Label the points: (x_1, y_1) = (-2, -5) and (x_2, y_2) = (1, 4). Then the top is y_2 - y_1 = 4 - (-5) and the bottom is x_2 - x_1 = 1 - (-2).",
        "Top: 4 - (-5) = 4 + 5 = 9. Bottom: 1 - (-2) = 1 + 2 = 3. Minus a negative is a plus.",
        "9 ÷ 3 = 3, so m = 3."
      ],
      ja: [
        "点に名前をつける：(x_1, y_1) = (-2, -5)、(x_2, y_2) = (1, 4)。上は y_2 - y_1 = 4 - (-5)、下は x_2 - x_1 = 1 - (-2)。",
        "上：4 - (-5) = 4 + 5 = 9。下：1 - (-2) = 1 + 2 = 3。マイナスのマイナスはプラス。",
        "9 ÷ 3 = 3 なので m = 3。"
      ]
    },
    explanation: {
      en: "Label the points (x_1, y_1) = (-2, -5) and (x_2, y_2) = (1, 4). The formula is m = (y_2 - y_1) ÷ (x_2 - x_1). Putting the points in: m = (4 - (-5)) ÷ (1 - (-2)). That's 9 ÷ 3, so m = 3: the line goes up 3 for every 1 across.",
      ja: "点に名前をつけます：(x_1, y_1) = (-2, -5)、(x_2, y_2) = (1, 4)。公式は m = (y_2 - y_1) ÷ (x_2 - x_1)。点を代入すると m = (4 - (-5)) ÷ (1 - (-2))。これは 9 ÷ 3 なので m = 3。右に1進むと上に3進む直線です。"
    }
  },
  {
    id: "line_medium_04",
    topic: "line",
    equation: "(1, 3), (3, -1)\nm = {y_2 - y_1}/{x_2 - x_1}",
    answer: "m = -2",
    difficulty: "medium",
    type: "two-point-gradient",
    basePoints: 20,
    line: { m: -2, c: 5, points: [[1, 3], [3, -1]] },
    steps: [
      { action: "gradSub", value: "{-1 - 3}/{3 - 1}", target: "both-sides", result: "(1, 3), (3, -1)\nm = {-1 - 3}/{3 - 1}",
        wrong: ["{3 - 1}/{-1 - 3}", "{-1 - 3}/{1 - 3}", "{3 - (-1)}/{3 - 1}"], wrongKinds: ["riseRun", "subtractOrder", "subtractOrder"] },
      { action: "gradCalc", value: "{-4}/{2}", target: "both-sides", result: "(1, 3), (3, -1)\nm = {-4}/{2}",
        wrong: ["{4}/{2}", "{-4}/{-2}", "{-4}/{3}"], wrongKinds: ["generic", "generic", "generic"] },
      { action: "gradient", value: "m = -2", prompt: "gradDividePrompt", target: "both-sides", result: "(1, 3), (3, -1)\nm = -2",
        wrong: ["m = -1/2", "m = 2", "m = -4"], wrongKinds: ["riseRun", "lineSign", "generic"] }
    ],
    hints: {
      en: [
        "Label the points: (x_1, y_1) = (1, 3) and (x_2, y_2) = (3, -1). Then the top is y_2 - y_1 = -1 - 3 and the bottom is x_2 - x_1 = 3 - 1.",
        "Top: -1 - 3 = -4. Bottom: 3 - 1 = 2.",
        "-4 ÷ 2 = -2, so m = -2."
      ],
      ja: [
        "点に名前をつける：(x_1, y_1) = (1, 3)、(x_2, y_2) = (3, -1)。上は y_2 - y_1 = -1 - 3、下は x_2 - x_1 = 3 - 1。",
        "上：-1 - 3 = -4。下：3 - 1 = 2。",
        "-4 ÷ 2 = -2 なので m = -2。"
      ]
    },
    explanation: {
      en: "Label the points (x_1, y_1) = (1, 3) and (x_2, y_2) = (3, -1). The formula is m = (y_2 - y_1) ÷ (x_2 - x_1). Putting the points in: m = (-1 - 3) ÷ (3 - 1). That's -4 ÷ 2, so m = -2: the line goes down 2 for every 1 across.",
      ja: "点に名前をつけます：(x_1, y_1) = (1, 3)、(x_2, y_2) = (3, -1)。公式は m = (y_2 - y_1) ÷ (x_2 - x_1)。点を代入すると m = (-1 - 3) ÷ (3 - 1)。これは -4 ÷ 2 なので m = -2。右に1進むと下に2進む直線です。"
    }
  },
  {
    id: "line_medium_05",
    topic: "line",
    equation: "(-1, -3), (1, 5)\nm = {y_2 - y_1}/{x_2 - x_1}",
    answer: "m = 4",
    difficulty: "medium",
    type: "two-point-gradient",
    basePoints: 20,
    line: { m: 4, c: 1, points: [[-1, -3], [1, 5]] },
    steps: [
      { action: "gradSub", value: "{5 - (-3)}/{1 - (-1)}", target: "both-sides", result: "(-1, -3), (1, 5)\nm = {5 - (-3)}/{1 - (-1)}",
        wrong: ["{1 - (-1)}/{5 - (-3)}", "{5 - (-3)}/{-1 - 1}", "{5 - 1}/{-3 - (-1)}"], wrongKinds: ["riseRun", "subtractOrder", "generic"] },
      { action: "gradCalc", value: "{8}/{2}", target: "both-sides", result: "(-1, -3), (1, 5)\nm = {8}/{2}",
        wrong: ["{2}/{2}", "{8}/{0}", "{-8}/{2}"], wrongKinds: ["minusNegative", "minusNegative", "generic"] },
      { action: "gradient", value: "m = 4", prompt: "gradDividePrompt", target: "both-sides", result: "(-1, -3), (1, 5)\nm = 4",
        wrong: ["m = 1/4", "m = -4", "m = 8"], wrongKinds: ["riseRun", "lineSign", "generic"] }
    ],
    hints: {
      en: [
        "Label the points: (x_1, y_1) = (-1, -3) and (x_2, y_2) = (1, 5). Then the top is y_2 - y_1 = 5 - (-3) and the bottom is x_2 - x_1 = 1 - (-1).",
        "Top: 5 - (-3) = 5 + 3 = 8. Bottom: 1 - (-1) = 1 + 1 = 2. Minus a negative is a plus.",
        "8 ÷ 2 = 4, so m = 4."
      ],
      ja: [
        "点に名前をつける：(x_1, y_1) = (-1, -3)、(x_2, y_2) = (1, 5)。上は y_2 - y_1 = 5 - (-3)、下は x_2 - x_1 = 1 - (-1)。",
        "上：5 - (-3) = 5 + 3 = 8。下：1 - (-1) = 1 + 1 = 2。マイナスのマイナスはプラス。",
        "8 ÷ 2 = 4 なので m = 4。"
      ]
    },
    explanation: {
      en: "Label the points (x_1, y_1) = (-1, -3) and (x_2, y_2) = (1, 5). The formula is m = (y_2 - y_1) ÷ (x_2 - x_1). Putting the points in: m = (5 - (-3)) ÷ (1 - (-1)). That's 8 ÷ 2, so m = 4: the line goes up 4 for every 1 across.",
      ja: "点に名前をつけます：(x_1, y_1) = (-1, -3)、(x_2, y_2) = (1, 5)。公式は m = (y_2 - y_1) ÷ (x_2 - x_1)。点を代入すると m = (5 - (-3)) ÷ (1 - (-1))。これは 8 ÷ 2 なので m = 4。右に1進むと上に4進む直線です。"
    }
  },
  {
    id: "line_medium_06",
    topic: "line",
    equation: "(-1, 4), (2, -2)\nm = {y_2 - y_1}/{x_2 - x_1}",
    answer: "m = -2",
    difficulty: "medium",
    type: "two-point-gradient",
    basePoints: 20,
    line: { m: -2, c: 2, points: [[-1, 4], [2, -2]] },
    steps: [
      { action: "gradSub", value: "{-2 - 4}/{2 - (-1)}", target: "both-sides", result: "(-1, 4), (2, -2)\nm = {-2 - 4}/{2 - (-1)}",
        wrong: ["{2 - (-1)}/{-2 - 4}", "{-2 - 4}/{-1 - 2}", "{-2 - 2}/{4 - (-1)}"], wrongKinds: ["riseRun", "subtractOrder", "generic"] },
      { action: "gradCalc", value: "{-6}/{3}", target: "both-sides", result: "(-1, 4), (2, -2)\nm = {-6}/{3}",
        wrong: ["{-6}/{1}", "{6}/{3}", "{-6}/{-3}"], wrongKinds: ["minusNegative", "generic", "generic"] },
      { action: "gradient", value: "m = -2", prompt: "gradDividePrompt", target: "both-sides", result: "(-1, 4), (2, -2)\nm = -2",
        wrong: ["m = -1/2", "m = 2", "m = -6"], wrongKinds: ["riseRun", "lineSign", "generic"] }
    ],
    hints: {
      en: [
        "Label the points: (x_1, y_1) = (-1, 4) and (x_2, y_2) = (2, -2). Then the top is y_2 - y_1 = -2 - 4 and the bottom is x_2 - x_1 = 2 - (-1).",
        "Top: -2 - 4 = -6. Bottom: 2 - (-1) = 2 + 1 = 3. Minus a negative is a plus.",
        "-6 ÷ 3 = -2, so m = -2."
      ],
      ja: [
        "点に名前をつける：(x_1, y_1) = (-1, 4)、(x_2, y_2) = (2, -2)。上は y_2 - y_1 = -2 - 4、下は x_2 - x_1 = 2 - (-1)。",
        "上：-2 - 4 = -6。下：2 - (-1) = 2 + 1 = 3。マイナスのマイナスはプラス。",
        "-6 ÷ 3 = -2 なので m = -2。"
      ]
    },
    explanation: {
      en: "Label the points (x_1, y_1) = (-1, 4) and (x_2, y_2) = (2, -2). The formula is m = (y_2 - y_1) ÷ (x_2 - x_1). Putting the points in: m = (-2 - 4) ÷ (2 - (-1)). That's -6 ÷ 3, so m = -2: the line goes down 2 for every 1 across.",
      ja: "点に名前をつけます：(x_1, y_1) = (-1, 4)、(x_2, y_2) = (2, -2)。公式は m = (y_2 - y_1) ÷ (x_2 - x_1)。点を代入すると m = (-2 - 4) ÷ (2 - (-1))。これは -6 ÷ 3 なので m = -2。右に1進むと下に2進む直線です。"
    }
  },
  {
    id: "line_medium_07",
    topic: "line",
    equation: "(1, -2), (3, 4)\nm = {y_2 - y_1}/{x_2 - x_1}",
    answer: "m = 3",
    difficulty: "medium",
    type: "two-point-gradient",
    basePoints: 20,
    line: { m: 3, c: -5, points: [[1, -2], [3, 4]] },
    steps: [
      { action: "gradSub", value: "{4 - (-2)}/{3 - 1}", target: "both-sides", result: "(1, -2), (3, 4)\nm = {4 - (-2)}/{3 - 1}",
        wrong: ["{3 - 1}/{4 - (-2)}", "{4 - (-2)}/{1 - 3}", "{4 - 3}/{-2 - 1}"], wrongKinds: ["riseRun", "subtractOrder", "generic"] },
      { action: "gradCalc", value: "{6}/{2}", target: "both-sides", result: "(1, -2), (3, 4)\nm = {6}/{2}",
        wrong: ["{2}/{2}", "{-6}/{2}", "{6}/{-2}"], wrongKinds: ["minusNegative", "generic", "generic"] },
      { action: "gradient", value: "m = 3", prompt: "gradDividePrompt", target: "both-sides", result: "(1, -2), (3, 4)\nm = 3",
        wrong: ["m = 1/3", "m = -3", "m = 6"], wrongKinds: ["riseRun", "lineSign", "generic"] }
    ],
    hints: {
      en: [
        "Label the points: (x_1, y_1) = (1, -2) and (x_2, y_2) = (3, 4). Then the top is y_2 - y_1 = 4 - (-2) and the bottom is x_2 - x_1 = 3 - 1.",
        "Top: 4 - (-2) = 4 + 2 = 6. Bottom: 3 - 1 = 2. Minus a negative is a plus.",
        "6 ÷ 2 = 3, so m = 3."
      ],
      ja: [
        "点に名前をつける：(x_1, y_1) = (1, -2)、(x_2, y_2) = (3, 4)。上は y_2 - y_1 = 4 - (-2)、下は x_2 - x_1 = 3 - 1。",
        "上：4 - (-2) = 4 + 2 = 6。下：3 - 1 = 2。マイナスのマイナスはプラス。",
        "6 ÷ 2 = 3 なので m = 3。"
      ]
    },
    explanation: {
      en: "Label the points (x_1, y_1) = (1, -2) and (x_2, y_2) = (3, 4). The formula is m = (y_2 - y_1) ÷ (x_2 - x_1). Putting the points in: m = (4 - (-2)) ÷ (3 - 1). That's 6 ÷ 2, so m = 3: the line goes up 3 for every 1 across.",
      ja: "点に名前をつけます：(x_1, y_1) = (1, -2)、(x_2, y_2) = (3, 4)。公式は m = (y_2 - y_1) ÷ (x_2 - x_1)。点を代入すると m = (4 - (-2)) ÷ (3 - 1)。これは 6 ÷ 2 なので m = 3。右に1進むと上に3進む直線です。"
    }
  },
  {
    id: "line_medium_08",
    topic: "line",
    equation: "(0, 6), (2, -2)\nm = {y_2 - y_1}/{x_2 - x_1}",
    answer: "m = -4",
    difficulty: "medium",
    type: "two-point-gradient",
    basePoints: 20,
    line: { m: -4, c: 6, points: [[0, 6], [2, -2]] },
    steps: [
      { action: "gradSub", value: "{-2 - 6}/{2 - 0}", target: "both-sides", result: "(0, 6), (2, -2)\nm = {-2 - 6}/{2 - 0}",
        wrong: ["{2 - 0}/{-2 - 6}", "{-2 - 6}/{0 - 2}", "{-2 - 2}/{6 - 0}"], wrongKinds: ["riseRun", "subtractOrder", "generic"] },
      { action: "gradCalc", value: "{-8}/{2}", target: "both-sides", result: "(0, 6), (2, -2)\nm = {-8}/{2}",
        wrong: ["{8}/{2}", "{-8}/{-2}", "{-8}/{3}"], wrongKinds: ["generic", "generic", "generic"] },
      { action: "gradient", value: "m = -4", prompt: "gradDividePrompt", target: "both-sides", result: "(0, 6), (2, -2)\nm = -4",
        wrong: ["m = -1/4", "m = 4", "m = -8"], wrongKinds: ["riseRun", "lineSign", "generic"] }
    ],
    hints: {
      en: [
        "Label the points: (x_1, y_1) = (0, 6) and (x_2, y_2) = (2, -2). Then the top is y_2 - y_1 = -2 - 6 and the bottom is x_2 - x_1 = 2 - 0.",
        "Top: -2 - 6 = -8. Bottom: 2 - 0 = 2.",
        "-8 ÷ 2 = -4, so m = -4."
      ],
      ja: [
        "点に名前をつける：(x_1, y_1) = (0, 6)、(x_2, y_2) = (2, -2)。上は y_2 - y_1 = -2 - 6、下は x_2 - x_1 = 2 - 0。",
        "上：-2 - 6 = -8。下：2 - 0 = 2。",
        "-8 ÷ 2 = -4 なので m = -4。"
      ]
    },
    explanation: {
      en: "Label the points (x_1, y_1) = (0, 6) and (x_2, y_2) = (2, -2). The formula is m = (y_2 - y_1) ÷ (x_2 - x_1). Putting the points in: m = (-2 - 6) ÷ (2 - 0). That's -8 ÷ 2, so m = -4: the line goes down 4 for every 1 across.",
      ja: "点に名前をつけます：(x_1, y_1) = (0, 6)、(x_2, y_2) = (2, -2)。公式は m = (y_2 - y_1) ÷ (x_2 - x_1)。点を代入すると m = (-2 - 6) ÷ (2 - 0)。これは -8 ÷ 2 なので m = -4。右に1進むと下に4進む直線です。"
    }
  },
  {
    id: "line_medium_09",
    topic: "line",
    equation: "(-2, 6), (0, 0)\nm = {y_2 - y_1}/{x_2 - x_1}",
    answer: "m = -3",
    difficulty: "medium",
    type: "two-point-gradient",
    basePoints: 20,
    line: { m: -3, c: 0, points: [[-2, 6], [0, 0]] },
    steps: [
      { action: "gradSub", value: "{0 - 6}/{0 - (-2)}", target: "both-sides", result: "(-2, 6), (0, 0)\nm = {0 - 6}/{0 - (-2)}",
        wrong: ["{0 - (-2)}/{0 - 6}", "{0 - 6}/{-2 - 0}", "{0 - 0}/{6 - (-2)}"], wrongKinds: ["riseRun", "subtractOrder", "generic"] },
      { action: "gradCalc", value: "{-6}/{2}", target: "both-sides", result: "(-2, 6), (0, 0)\nm = {-6}/{2}",
        wrong: ["{-6}/{-2}", "{6}/{2}", "{-6}/{3}"], wrongKinds: ["minusNegative", "generic", "generic"] },
      { action: "gradient", value: "m = -3", prompt: "gradDividePrompt", target: "both-sides", result: "(-2, 6), (0, 0)\nm = -3",
        wrong: ["m = -1/3", "m = 3", "m = -6"], wrongKinds: ["riseRun", "lineSign", "generic"] }
    ],
    hints: {
      en: [
        "Label the points: (x_1, y_1) = (-2, 6) and (x_2, y_2) = (0, 0). Then the top is y_2 - y_1 = 0 - 6 and the bottom is x_2 - x_1 = 0 - (-2).",
        "Top: 0 - 6 = -6. Bottom: 0 - (-2) = 0 + 2 = 2. Minus a negative is a plus.",
        "-6 ÷ 2 = -3, so m = -3."
      ],
      ja: [
        "点に名前をつける：(x_1, y_1) = (-2, 6)、(x_2, y_2) = (0, 0)。上は y_2 - y_1 = 0 - 6、下は x_2 - x_1 = 0 - (-2)。",
        "上：0 - 6 = -6。下：0 - (-2) = 0 + 2 = 2。マイナスのマイナスはプラス。",
        "-6 ÷ 2 = -3 なので m = -3。"
      ]
    },
    explanation: {
      en: "Label the points (x_1, y_1) = (-2, 6) and (x_2, y_2) = (0, 0). The formula is m = (y_2 - y_1) ÷ (x_2 - x_1). Putting the points in: m = (0 - 6) ÷ (0 - (-2)). That's -6 ÷ 2, so m = -3: the line goes down 3 for every 1 across.",
      ja: "点に名前をつけます：(x_1, y_1) = (-2, 6)、(x_2, y_2) = (0, 0)。公式は m = (y_2 - y_1) ÷ (x_2 - x_1)。点を代入すると m = (0 - 6) ÷ (0 - (-2))。これは -6 ÷ 2 なので m = -3。右に1進むと下に3進む直線です。"
    }
  },
  {
    id: "line_medium_10",
    topic: "line",
    equation: "(4, 3), (1, -3)\nm = {y_2 - y_1}/{x_2 - x_1}",
    answer: "m = 2",
    difficulty: "medium",
    type: "two-point-gradient",
    basePoints: 20,
    line: { m: 2, c: -5, points: [[4, 3], [1, -3]] },
    steps: [
      { action: "gradSub", value: "{-3 - 3}/{1 - 4}", target: "both-sides", result: "(4, 3), (1, -3)\nm = {-3 - 3}/{1 - 4}",
        wrong: ["{1 - 4}/{-3 - 3}", "{-3 - 3}/{4 - 1}", "{-3 - 1}/{3 - 4}"], wrongKinds: ["riseRun", "subtractOrder", "generic"] },
      { action: "gradCalc", value: "{-6}/{-3}", target: "both-sides", result: "(4, 3), (1, -3)\nm = {-6}/{-3}",
        wrong: ["{6}/{-3}", "{-6}/{3}", "{-6}/{-2}"], wrongKinds: ["generic", "generic", "generic"] },
      { action: "gradient", value: "m = 2", prompt: "gradDividePrompt", target: "both-sides", result: "(4, 3), (1, -3)\nm = 2",
        wrong: ["m = 1/2", "m = -2", "m = -6"], wrongKinds: ["riseRun", "lineSign", "generic"] }
    ],
    hints: {
      en: [
        "Label the points: (x_1, y_1) = (4, 3) and (x_2, y_2) = (1, -3). Then the top is y_2 - y_1 = -3 - 3 and the bottom is x_2 - x_1 = 1 - 4.",
        "Top: -3 - 3 = -6. Bottom: 1 - 4 = -3.",
        "-6 ÷ (-3) = 2, so m = 2."
      ],
      ja: [
        "点に名前をつける：(x_1, y_1) = (4, 3)、(x_2, y_2) = (1, -3)。上は y_2 - y_1 = -3 - 3、下は x_2 - x_1 = 1 - 4。",
        "上：-3 - 3 = -6。下：1 - 4 = -3。",
        "-6 ÷ (-3) = 2 なので m = 2。"
      ]
    },
    explanation: {
      en: "Label the points (x_1, y_1) = (4, 3) and (x_2, y_2) = (1, -3). The formula is m = (y_2 - y_1) ÷ (x_2 - x_1). Putting the points in: m = (-3 - 3) ÷ (1 - 4). That's -6 ÷ (-3), so m = 2: the line goes up 2 for every 1 across. The second point is to the left, so the top and bottom both come out negative, and that's fine: what matters is taking both in the same order.",
      ja: "点に名前をつけます：(x_1, y_1) = (4, 3)、(x_2, y_2) = (1, -3)。公式は m = (y_2 - y_1) ÷ (x_2 - x_1)。点を代入すると m = (-3 - 3) ÷ (1 - 4)。これは -6 ÷ (-3) なので m = 2。右に1進むと上に2進む直線です。2つ目の点が左にあるので上も下も負になりますが、問題ありません。大事なのは同じ順番で引くことです。"
    }
  },
  {
    id: "line_hard_01",
    topic: "line",
    equation: "(-1, 1), (1, 5)",
    answer: "y = 2x + 3",
    difficulty: "hard",
    type: "two-point-equation",
    basePoints: 30,
    line: { m: 2, c: 3, points: [[-1, 1], [1, 5]] },
    steps: [
      { action: "gradient", value: "m = 2", target: "both-sides", result: "(-1, 1), (1, 5)\nm = 2",
        wrong: ["m = -2", "m = 1/2", "m = 4"], wrongKinds: ["subtractOrder", "riseRun", "generic"] },
      { action: "intercept", value: "c = 3", target: "both-sides", result: "y = 2x + 3",
        wrong: ["c = -1", "c = 1", "c = -3"], wrongKinds: ["findC", "generic", "lineSign"] }
    ],
    hints: {
      en: [
        "m = (y_2 - y_1) ÷ (x_2 - x_1). Here that's (5 - 1) ÷ (1 - (-1)) = 2.",
        "Put a point into y = 2x + c. Using (-1, 1): 1 = 2 × (-1) + c, so c = 1 - (-2) = 3."
      ],
      ja: [
        "m = (y_2 - y_1) ÷ (x_2 - x_1)。ここでは (5 - 1) ÷ (1 - (-1)) = 2。",
        "点を y = 2x + c に代入する。(-1, 1) を使うと：1 = 2 × (-1) + c なので、c = 1 - (-2) = 3。"
      ]
    },
    explanation: {
      en: "First the gradient: m = (5 - 1) ÷ (1 - (-1)), which is 4 ÷ 2 = 2. So y = 2x + c. Then put a point in to find c: (-1, 1) gives 1 = 2 × (-1) + c, so c = 3. The line is y = 2x + 3. Check with the other point: 2 × 1 + 3 = 5 ✓",
      ja: "まず傾き：m = (5 - 1) ÷ (1 - (-1))、つまり 4 ÷ 2 = 2。よって y = 2x + c。次に点を代入して c を求めます：(-1, 1) から 1 = 2 × (-1) + c、よって c = 3。直線は y = 2x + 3。もう一方の点で確かめ：2 × 1 + 3 = 5 ✓"
    }
  },
  {
    id: "line_hard_02",
    topic: "line",
    equation: "(2, 1), (3, 4)",
    answer: "y = 3x - 5",
    difficulty: "hard",
    type: "two-point-equation",
    basePoints: 30,
    line: { m: 3, c: -5, points: [[2, 1], [3, 4]] },
    steps: [
      { action: "gradient", value: "m = 3", target: "both-sides", result: "(2, 1), (3, 4)\nm = 3",
        wrong: ["m = -3", "m = 1/3", "m = 4"], wrongKinds: ["subtractOrder", "riseRun", "generic"] },
      { action: "intercept", value: "c = -5", target: "both-sides", result: "y = 3x - 5",
        wrong: ["c = 7", "c = 1", "c = 5"], wrongKinds: ["findC", "generic", "lineSign"] }
    ],
    hints: {
      en: [
        "m = (y_2 - y_1) ÷ (x_2 - x_1). Here that's (4 - 1) ÷ (3 - 2) = 3.",
        "Put a point into y = 3x + c. Using (2, 1): 1 = 3 × 2 + c, so c = 1 - 6 = -5."
      ],
      ja: [
        "m = (y_2 - y_1) ÷ (x_2 - x_1)。ここでは (4 - 1) ÷ (3 - 2) = 3。",
        "点を y = 3x + c に代入する。(2, 1) を使うと：1 = 3 × 2 + c なので、c = 1 - 6 = -5。"
      ]
    },
    explanation: {
      en: "First the gradient: m = (4 - 1) ÷ (3 - 2), which is 3 ÷ 1 = 3. So y = 3x + c. Then put a point in to find c: (2, 1) gives 1 = 3 × 2 + c, so c = -5. The line is y = 3x - 5. Check with the other point: 3 × 3 + (-5) = 4 ✓",
      ja: "まず傾き：m = (4 - 1) ÷ (3 - 2)、つまり 3 ÷ 1 = 3。よって y = 3x + c。次に点を代入して c を求めます：(2, 1) から 1 = 3 × 2 + c、よって c = -5。直線は y = 3x - 5。もう一方の点で確かめ：3 × 3 + (-5) = 4 ✓"
    }
  },
  {
    id: "line_hard_03",
    topic: "line",
    equation: "(-1, 6), (2, 0)",
    answer: "y = -2x + 4",
    difficulty: "hard",
    type: "two-point-equation",
    basePoints: 30,
    line: { m: -2, c: 4, points: [[-1, 6], [2, 0]] },
    steps: [
      { action: "gradient", value: "m = -2", target: "both-sides", result: "(-1, 6), (2, 0)\nm = -2",
        wrong: ["m = 2", "m = -1/2", "m = -6"], wrongKinds: ["subtractOrder", "riseRun", "generic"] },
      { action: "intercept", value: "c = 4", target: "both-sides", result: "y = -2x + 4",
        wrong: ["c = 8", "c = 6", "c = -4"], wrongKinds: ["findC", "generic", "lineSign"] }
    ],
    hints: {
      en: [
        "m = (y_2 - y_1) ÷ (x_2 - x_1). Here that's (0 - 6) ÷ (2 - (-1)) = -2.",
        "Put a point into y = -2x + c. Using (-1, 6): 6 = -2 × (-1) + c, so c = 6 - 2 = 4."
      ],
      ja: [
        "m = (y_2 - y_1) ÷ (x_2 - x_1)。ここでは (0 - 6) ÷ (2 - (-1)) = -2。",
        "点を y = -2x + c に代入する。(-1, 6) を使うと：6 = -2 × (-1) + c なので、c = 6 - 2 = 4。"
      ]
    },
    explanation: {
      en: "First the gradient: m = (0 - 6) ÷ (2 - (-1)), which is -6 ÷ 3 = -2. So y = -2x + c. Then put a point in to find c: (-1, 6) gives 6 = -2 × (-1) + c, so c = 4. The line is y = -2x + 4. Check with the other point: -2 × 2 + 4 = 0 ✓",
      ja: "まず傾き：m = (0 - 6) ÷ (2 - (-1))、つまり -6 ÷ 3 = -2。よって y = -2x + c。次に点を代入して c を求めます：(-1, 6) から 6 = -2 × (-1) + c、よって c = 4。直線は y = -2x + 4。もう一方の点で確かめ：-2 × 2 + 4 = 0 ✓"
    }
  },
  {
    id: "line_hard_04",
    topic: "line",
    equation: "(1, -2), (3, 2)",
    answer: "y = 2x - 4",
    difficulty: "hard",
    type: "two-point-equation",
    basePoints: 30,
    line: { m: 2, c: -4, points: [[1, -2], [3, 2]] },
    steps: [
      { action: "gradient", value: "m = 2", target: "both-sides", result: "(1, -2), (3, 2)\nm = 2",
        wrong: ["m = -2", "m = 1/2", "m = 4"], wrongKinds: ["subtractOrder", "riseRun", "generic"] },
      { action: "intercept", value: "c = -4", target: "both-sides", result: "y = 2x - 4",
        wrong: ["c = 0", "c = -2", "c = 4"], wrongKinds: ["findC", "generic", "lineSign"] }
    ],
    hints: {
      en: [
        "m = (y_2 - y_1) ÷ (x_2 - x_1). Here that's (2 - (-2)) ÷ (3 - 1) = 2.",
        "Put a point into y = 2x + c. Using (1, -2): -2 = 2 × 1 + c, so c = -2 - 2 = -4."
      ],
      ja: [
        "m = (y_2 - y_1) ÷ (x_2 - x_1)。ここでは (2 - (-2)) ÷ (3 - 1) = 2。",
        "点を y = 2x + c に代入する。(1, -2) を使うと：-2 = 2 × 1 + c なので、c = -2 - 2 = -4。"
      ]
    },
    explanation: {
      en: "First the gradient: m = (2 - (-2)) ÷ (3 - 1), which is 4 ÷ 2 = 2. So y = 2x + c. Then put a point in to find c: (1, -2) gives -2 = 2 × 1 + c, so c = -4. The line is y = 2x - 4. Check with the other point: 2 × 3 + (-4) = 2 ✓",
      ja: "まず傾き：m = (2 - (-2)) ÷ (3 - 1)、つまり 4 ÷ 2 = 2。よって y = 2x + c。次に点を代入して c を求めます：(1, -2) から -2 = 2 × 1 + c、よって c = -4。直線は y = 2x - 4。もう一方の点で確かめ：2 × 3 + (-4) = 2 ✓"
    }
  },
  {
    id: "line_hard_05",
    topic: "line",
    equation: "(-2, 1), (2, 5)",
    answer: "y = x + 3",
    difficulty: "hard",
    type: "two-point-equation",
    basePoints: 30,
    line: { m: 1, c: 3, points: [[-2, 1], [2, 5]] },
    steps: [
      { action: "gradient", value: "m = 1", target: "both-sides", result: "(-2, 1), (2, 5)\nm = 1",
        wrong: ["m = -1", "m = 4", "m = 2"], wrongKinds: ["subtractOrder", "generic", "generic"] },
      { action: "intercept", value: "c = 3", target: "both-sides", result: "y = x + 3",
        wrong: ["c = -1", "c = 1", "c = -3"], wrongKinds: ["findC", "generic", "lineSign"] }
    ],
    hints: {
      en: [
        "m = (y_2 - y_1) ÷ (x_2 - x_1). Here that's (5 - 1) ÷ (2 - (-2)) = 1.",
        "Put a point into y = x + c. Using (-2, 1): 1 = 1 × (-2) + c, so c = 1 - (-2) = 3."
      ],
      ja: [
        "m = (y_2 - y_1) ÷ (x_2 - x_1)。ここでは (5 - 1) ÷ (2 - (-2)) = 1。",
        "点を y = x + c に代入する。(-2, 1) を使うと：1 = 1 × (-2) + c なので、c = 1 - (-2) = 3。"
      ]
    },
    explanation: {
      en: "First the gradient: m = (5 - 1) ÷ (2 - (-2)), which is 4 ÷ 4 = 1. So y = x + c. Then put a point in to find c: (-2, 1) gives 1 = 1 × (-2) + c, so c = 3. The line is y = x + 3. Check with the other point: 1 × 2 + 3 = 5 ✓",
      ja: "まず傾き：m = (5 - 1) ÷ (2 - (-2))、つまり 4 ÷ 4 = 1。よって y = x + c。次に点を代入して c を求めます：(-2, 1) から 1 = 1 × (-2) + c、よって c = 3。直線は y = x + 3。もう一方の点で確かめ：1 × 2 + 3 = 5 ✓"
    }
  },
  {
    id: "line_hard_06",
    topic: "line",
    equation: "(1, 1), (3, -5)",
    answer: "y = -3x + 4",
    difficulty: "hard",
    type: "two-point-equation",
    basePoints: 30,
    line: { m: -3, c: 4, points: [[1, 1], [3, -5]] },
    steps: [
      { action: "gradient", value: "m = -3", target: "both-sides", result: "(1, 1), (3, -5)\nm = -3",
        wrong: ["m = 3", "m = -1/3", "m = -6"], wrongKinds: ["subtractOrder", "riseRun", "generic"] },
      { action: "intercept", value: "c = 4", target: "both-sides", result: "y = -3x + 4",
        wrong: ["c = -2", "c = 1", "c = -4"], wrongKinds: ["findC", "generic", "lineSign"] }
    ],
    hints: {
      en: [
        "m = (y_2 - y_1) ÷ (x_2 - x_1). Here that's (-5 - 1) ÷ (3 - 1) = -3.",
        "Put a point into y = -3x + c. Using (1, 1): 1 = -3 × 1 + c, so c = 1 - (-3) = 4."
      ],
      ja: [
        "m = (y_2 - y_1) ÷ (x_2 - x_1)。ここでは (-5 - 1) ÷ (3 - 1) = -3。",
        "点を y = -3x + c に代入する。(1, 1) を使うと：1 = -3 × 1 + c なので、c = 1 - (-3) = 4。"
      ]
    },
    explanation: {
      en: "First the gradient: m = (-5 - 1) ÷ (3 - 1), which is -6 ÷ 2 = -3. So y = -3x + c. Then put a point in to find c: (1, 1) gives 1 = -3 × 1 + c, so c = 4. The line is y = -3x + 4. Check with the other point: -3 × 3 + 4 = -5 ✓",
      ja: "まず傾き：m = (-5 - 1) ÷ (3 - 1)、つまり -6 ÷ 2 = -3。よって y = -3x + c。次に点を代入して c を求めます：(1, 1) から 1 = -3 × 1 + c、よって c = 4。直線は y = -3x + 4。もう一方の点で確かめ：-3 × 3 + 4 = -5 ✓"
    }
  },
  {
    id: "line_hard_07",
    topic: "line",
    equation: "(-1, -5), (2, 4)",
    answer: "y = 3x - 2",
    difficulty: "hard",
    type: "two-point-equation",
    basePoints: 30,
    line: { m: 3, c: -2, points: [[-1, -5], [2, 4]] },
    steps: [
      { action: "gradient", value: "m = 3", target: "both-sides", result: "(-1, -5), (2, 4)\nm = 3",
        wrong: ["m = -3", "m = 1/3", "m = 9"], wrongKinds: ["subtractOrder", "riseRun", "generic"] },
      { action: "intercept", value: "c = -2", target: "both-sides", result: "y = 3x - 2",
        wrong: ["c = -8", "c = -5", "c = 2"], wrongKinds: ["findC", "generic", "lineSign"] }
    ],
    hints: {
      en: [
        "m = (y_2 - y_1) ÷ (x_2 - x_1). Here that's (4 - (-5)) ÷ (2 - (-1)) = 3.",
        "Put a point into y = 3x + c. Using (-1, -5): -5 = 3 × (-1) + c, so c = -5 - (-3) = -2."
      ],
      ja: [
        "m = (y_2 - y_1) ÷ (x_2 - x_1)。ここでは (4 - (-5)) ÷ (2 - (-1)) = 3。",
        "点を y = 3x + c に代入する。(-1, -5) を使うと：-5 = 3 × (-1) + c なので、c = -5 - (-3) = -2。"
      ]
    },
    explanation: {
      en: "First the gradient: m = (4 - (-5)) ÷ (2 - (-1)), which is 9 ÷ 3 = 3. So y = 3x + c. Then put a point in to find c: (-1, -5) gives -5 = 3 × (-1) + c, so c = -2. The line is y = 3x - 2. Check with the other point: 3 × 2 + (-2) = 4 ✓",
      ja: "まず傾き：m = (4 - (-5)) ÷ (2 - (-1))、つまり 9 ÷ 3 = 3。よって y = 3x + c。次に点を代入して c を求めます：(-1, -5) から -5 = 3 × (-1) + c、よって c = -2。直線は y = 3x - 2。もう一方の点で確かめ：3 × 2 + (-2) = 4 ✓"
    }
  },
  {
    id: "line_hard_08",
    topic: "line",
    equation: "2y = 4x - 2",
    answer: "y = 2x - 1",
    difficulty: "hard",
    type: "isolate",
    basePoints: 30,
    line: { m: 2, c: -1, points: [] },
    steps: [
      { action: "isolate", value: "y = 2x - 1", target: "both-sides", result: "y = 2x - 1",
        wrong: ["y = 2x - 2", "y = 4x - 1", "y = 8x - 4"], wrongKinds: ["rearrangeSlip", "rearrangeSlip", "generic"] },
      { action: "gradient", value: "m = 2", target: "both-sides", result: "y = 2x - 1\nm = 2",
        wrong: ["m = -1", "m = -2", "m = 2x"], wrongKinds: ["swapMC", "lineSign", "generic"] },
      { action: "intercept", value: "c = -1", target: "both-sides", result: "y = 2x - 1\nm = 2, c = -1",
        wrong: ["c = 2", "c = 1", "c = 0"], wrongKinds: ["swapMC", "lineSign", "generic"] }
    ],
    hints: {
      en: [
        "Get y on its own: divide every term by 2, not just one. 2y ÷ 2 = y, 4x ÷ 2 = 2x, -2 ÷ 2 = -1.",
        "In y = mx + c, m is the number in front of x, sign included. Here m = 2.",
        "c is the number on its own, sign included: the - 1 means c = -1. That's where the line crosses the y-axis."
      ],
      ja: [
        "yだけにする：1つの項だけでなく、すべての項を2で割る。2y ÷ 2 = y、4x ÷ 2 = 2x、-2 ÷ 2 = -1。",
        "y = mx + c では、m はxの前の数（符号も含む）。ここでは m = 2。",
        "c は単独の数（符号も含む）：- 1 なので c = -1。直線がy軸と交わる点。"
      ]
    },
    explanation: {
      en: "y isn't on its own yet, so divide both sides by 2, which means every term: y = 2x - 1. Now it's in y = mx + c form: m = 2 and c = -1.",
      ja: "まだyだけになっていないので、両辺を2で割ります（すべての項を割る）：y = 2x - 1。これで y = mx + c の形になり、m = 2、c = -1。"
    }
  },
  {
    id: "line_hard_09",
    topic: "line",
    equation: "y - 1 = 3x",
    answer: "y = 3x + 1",
    difficulty: "hard",
    type: "isolate",
    basePoints: 30,
    line: { m: 3, c: 1, points: [] },
    steps: [
      { action: "isolate", value: "y = 3x + 1", target: "both-sides", result: "y = 3x + 1",
        wrong: ["y = 3x - 1", "y = -3x + 1", "y = 4x"], wrongKinds: ["rearrangeSlip", "lineSign", "generic"] },
      { action: "gradient", value: "m = 3", target: "both-sides", result: "y = 3x + 1\nm = 3",
        wrong: ["m = 1", "m = -3", "m = 3x"], wrongKinds: ["swapMC", "lineSign", "generic"] },
      { action: "intercept", value: "c = 1", target: "both-sides", result: "y = 3x + 1\nm = 3, c = 1",
        wrong: ["c = 3", "c = -1", "c = 0"], wrongKinds: ["swapMC", "lineSign", "generic"] }
    ],
    hints: {
      en: [
        "Get y on its own: add 1 to both sides.",
        "In y = mx + c, m is the number in front of x, sign included. Here m = 3.",
        "c is the number on its own: 1. That's where the line crosses the y-axis, at (0, 1)."
      ],
      ja: [
        "yだけにする：両辺に1を足す。",
        "y = mx + c では、m はxの前の数（符号も含む）。ここでは m = 3。",
        "c は単独の数：1。直線がy軸と交わる点 (0, 1)。"
      ]
    },
    explanation: {
      en: "Add 1 to both sides to get y on its own: y = 3x + 1. Now it's in y = mx + c form: m = 3 and c = 1.",
      ja: "両辺に1を足してyだけにします：y = 3x + 1。これで y = mx + c の形になり、m = 3、c = 1。"
    }
  },
  {
    id: "line_hard_10",
    topic: "line",
    equation: "3y = 6 - 9x",
    answer: "y = -3x + 2",
    difficulty: "hard",
    type: "isolate",
    basePoints: 30,
    line: { m: -3, c: 2, points: [] },
    steps: [
      { action: "isolate", value: "y = -3x + 2", target: "both-sides", result: "y = -3x + 2",
        wrong: ["y = -9x + 2", "y = -3x + 6", "y = 3x + 2"], wrongKinds: ["rearrangeSlip", "rearrangeSlip", "lineSign"] },
      { action: "gradient", value: "m = -3", target: "both-sides", result: "y = -3x + 2\nm = -3",
        wrong: ["m = 2", "m = 3", "m = -3x"], wrongKinds: ["swapMC", "lineSign", "generic"] },
      { action: "intercept", value: "c = 2", target: "both-sides", result: "y = -3x + 2\nm = -3, c = 2",
        wrong: ["c = -3", "c = -2", "c = 0"], wrongKinds: ["swapMC", "lineSign", "generic"] }
    ],
    hints: {
      en: [
        "Divide every term by 3: 6 ÷ 3 = 2 and -9x ÷ 3 = -3x. Then put the x term first: y = -3x + 2.",
        "In y = mx + c, m is the number in front of x, sign included. Here m = -3.",
        "c is the number on its own: 2. That's where the line crosses the y-axis, at (0, 2)."
      ],
      ja: [
        "すべての項を3で割る：6 ÷ 3 = 2、-9x ÷ 3 = -3x。そしてxの項を前に：y = -3x + 2。",
        "y = mx + c では、m はxの前の数（符号も含む）。ここでは m = -3。",
        "c は単独の数：2。直線がy軸と交わる点 (0, 2)。"
      ]
    },
    explanation: {
      en: "Divide both sides by 3, which means every term: y = 2 - 3x, or y = -3x + 2 with the x term first. So m = -3 and c = 2: the line goes down 3 for every 1 across.",
      ja: "両辺を3で割ります（すべての項を割る）：y = 2 - 3x、xの項を前にすると y = -3x + 2。よって m = -3、c = 2。右に1進むと下に3進む直線です。"
    }
  }
];

// Topic → difficulty → levels (e.g. LEVELS_BY_TOPIC_AND_DIFFICULTY.inequality.medium).
// Drives the level select screen and level order in index.html.
const LEVELS_BY_TOPIC_AND_DIFFICULTY = LEVELS.reduce((acc, lvl) => {
  acc[lvl.topic] = acc[lvl.topic] || {};
  (acc[lvl.topic][lvl.difficulty] = acc[lvl.topic][lvl.difficulty] || []).push(lvl);
  return acc;
}, {});

// ---------- Tier tips ----------
// One-time tips from Chalky, shown the first time a player opens a level in a tier
// that introduces a new move. Keyed by `${topic}_${difficulty}`.
// Tiers without a tip are left out on purpose: Easy tiers and Equations Medium use moves
// the player already knows, and Inequalities Medium (the flip) and Quadratics Medium
// (factorising) are covered by the topic tutorials.
// `picture` (optional) names a small diagram drawn above the demo (TIP_PICTURES in index.html).
// `text` is per-language ({ en, ja }), like hints. `demo` is shown in the tip overlay as
// from → move → to; `from` may be two lines ("\n") for systems, and `move` is per-language.
const TIER_TIPS = {
  equation_hard: {
    text: {
      en: "x on both sides? Subtract one of the x terms from both sides first, so x is only on one side. Then it's a two-step equation.",
      ja: "両辺にxがある？まず片方のxの項を両辺から引いて、xを片側だけにしよう。あとはいつもの2ステップだよ。"
    },
    demo: {
      from: "3x + 4 = x + 12",
      move: { en: "Subtract x from both sides", ja: "両辺からxを引く" },
      to: "2x + 4 = 12"
    }
  },
  inequality_hard: {
    text: {
      en: "x on both sides works the same way here. Just watch the last step: if the x term ends up negative, flip the sign!",
      ja: "両辺にxがあっても解き方は同じ。最後のステップに注意：xの項が負になったら、不等号の向きを逆に！"
    },
    demo: {
      from: "-2x ≥ -10",
      move: { en: "Divide both sides by -2, and flip the sign", ja: "両辺を-2で割って、不等号を逆にする" },
      to: "x ≤ 5"
    }
  },
  brackets_medium: {
    text: {
      en: "Careful with the minus! It goes with the number when you multiply: 3 × (-2) = -6.",
      ja: "マイナスに注意！かけるときは、マイナスも数字と一緒にかけるよ：3 × (-2) = -6。"
    },
    demo: {
      from: "3(x - 2) = 12",
      move: { en: "Expand: 3 × x and 3 × (-2)", ja: "展開：3 × x と 3 × (-2)" },
      to: "3x - 6 = 12"
    }
  },
  brackets_hard: {
    text: {
      en: "A negative outside the brackets changes the sign of every term inside: -2 × (-3) = +6.",
      ja: "かっこの外が負の数なら、中のすべての項の符号が変わるよ：-2 × (-3) = +6。"
    },
    demo: {
      from: "-2(x - 3) = 14",
      move: { en: "Expand: -2 × x and -2 × (-3)", ja: "展開：-2 × x と -2 × (-3)" },
      to: "-2x + 6 = 14"
    }
  },
  quadratic_hard: {
    text: {
      en: "Make one side 0 before you factorise. Never divide by x, or you'll lose the answer x = 0!",
      ja: "因数分解の前に、片側を0にしよう。xで割るのはダメ — x = 0 の解がなくなるよ！"
    },
    demo: {
      from: "x² = 4x",
      move: { en: "Subtract 4x from both sides", ja: "両辺から4xを引く" },
      to: "x² - 4x = 0"
    }
  },
  system_medium: {
    text: {
      en: "Same sign? Subtract (top minus bottom). Opposite signs? Add.",
      ja: "符号が同じなら引く（上の式から下の式を引く）。符号が反対なら足す！"
    },
    demo: {
      from: "3x + y = 14\nx + y = 6",
      move: { en: "+y and +y: same sign, so subtract", ja: "+y と +y は同じ符号なので引く" },
      to: "2x = 8"
    }
  },
  system_hard: {
    text: {
      en: "No letter matches? Multiply one equation first: every term, including the number.",
      ja: "そろう文字がない？まず片方の式を何倍かしよう。数字も含めて、すべての項にかけるよ。"
    },
    demo: {
      from: "x + 3y = 7",
      move: { en: "Multiply every term by 2", ja: "すべての項を2倍する" },
      to: "2x + 6y = 14"
    }
  },
  fraction_medium: {
    text: {
      en: "Two fractions? Multiply both sides by the LCD — the smallest number both bottoms go into. Every fraction disappears at once.",
      ja: "分数が2つ？両辺に分母の最小公倍数（どちらの分母でも割り切れる一番小さい数）をかけよう。分数が一度に全部消えるよ。"
    },
    demo: {
      from: "x/2 + x/3 = 5",
      move: { en: "Multiply both sides by 6", ja: "両辺に6をかける" },
      to: "3x + 2x = 30"
    }
  },
  fraction_hard: {
    text: {
      en: "Multiply EVERY term by the LCD — plain numbers too. If a top is a bracket, keep the brackets and expand after.",
      ja: "最小公倍数はすべての項にかけよう — ただの数にもね。分子がかっこなら、かっこのまま残して、あとで展開するよ。"
    },
    demo: {
      from: "(x + 1)/2 = (x - 2)/3",
      move: { en: "Multiply both sides by 6", ja: "両辺に6をかける" },
      to: "3(x + 1) = 2(x - 2)"
    }
  },
  subject_medium: {
    text: {
      en: "Now the moves use letters. They work just like numbers: if t is multiplied by a, divide both sides by a.",
      ja: "ここからは文字で操作するよ。数と同じで、tにaがかけられていたら、両辺をaで割ろう。"
    },
    demo: {
      from: "v - u = at",
      move: { en: "Divide both sides by a", ja: "両辺をaで割る" },
      to: "t = (v - u)/a"
    }
  },
  subject_hard: {
    text: {
      en: "Brackets or fractions? Work from the outside in: undo any + or − on the end, then the number in front or underneath. What's inside comes last.",
      ja: "かっこや分数があるときは外側から：まず最後の＋や−、次に前や下の数を打ち消そう。かっこの中は最後だよ。"
    },
    demo: {
      from: "y = 2(x - 3)",
      move: { en: "Divide both sides by 2", ja: "両辺を2で割る" },
      to: "y/2 = x - 3"
    }
  },
  expression_medium: {
    text: {
      en: "Different letters, or x² and x, are different kinds of term — they never join. Collect each kind on its own.",
      ja: "違う文字や、x²とxは種類が違う項 — まとめられないよ。種類ごとにまとめよう。"
    },
    demo: {
      from: "x² + 3x + 2x² - x",
      move: { en: "Collect the x² terms", ja: "x²の項をまとめる" },
      to: "3x² + 3x - x"
    }
  },
  expression_hard: {
    text: {
      en: "Expand the brackets first, then collect. A minus or a letter in front multiplies every term inside: -2(x - 3) = -2x + 6, and x(x + 3) = x² + 3x.",
      ja: "まずかっこを展開してから、まとめよう。前にあるマイナスや文字は中のすべての項にかかるよ：-2(x - 3) = -2x + 6、x(x + 3) = x² + 3x。"
    },
    demo: {
      from: "5x - 2(x - 3)",
      move: { en: "Expand: -2 × x and -2 × (-3)", ja: "展開：-2 × x と -2 × (-3)" },
      to: "5x - 2x + 6"
    }
  },
  indices_medium: {
    text: {
      en: "Numbers in front and powers follow different rules: multiply the numbers, add the powers. With two letters, work out each letter's powers on their own.",
      ja: "前の数と指数はルールが違うよ：数はかけ算、指数は足し算。文字が2つあるときは、文字ごとに指数を計算しよう。"
    },
    demo: {
      from: "3x^2 × 4x^5",
      move: { en: "Numbers: 3 × 4. Powers: 2 + 5", ja: "数：3 × 4、指数：2 + 5" },
      to: "12x^7"
    }
  },
  indices_hard: {
    text: {
      en: "Two new rules: anything to the power 0 is 1, and a negative power means one over: x^-3 = 1/x^3. A bracket's power reaches the number inside too.",
      ja: "新しいルールが2つ：0乗はいつも1、そして負の指数は「1分の」：x^-3 = 1/x^3。かっこの外の指数は、中の数にもかかるよ。"
    },
    demo: {
      from: "x^-3",
      move: { en: "Write with a positive power", ja: "正の指数で書く" },
      to: "1/x^3"
    }
  },
  roots_medium: {
    text: {
      en: "Want to √ both sides like in Easy? Make the left side a square first. Every (x + n)² is x² + 2n·x + n², so x² + 6x is (x + 3)² missing its 9. Halve 6 → 3, square it → 9, then add 9 to both sides.",
      ja: "やさしいレベルのように両辺の平方根をとりたい？まず左辺を2乗の形にしよう。(x + n)² はいつも x² + 2n·x + n² だから、x² + 6x は (x + 3)² から9が欠けた形。6を半分にして3、2乗して9。両辺に9を足そう！"
    },
    // `picture` draws a small diagram above the demo (TIP_PICTURES in index.html): here, the x² + 6x tiles
    picture: "squareTiles",
    demo: {
      from: "x² + 6x = 16",
      move: { en: "Half of 6 is 3, and 3² = 9: add 9 to both sides", ja: "6の半分は3、3² = 9：両辺に9を足す" },
      to: "x² + 6x + 9 = 16 + 9"
    }
  },
  roots_hard: {
    text: {
      en: "Meet the quadratic formula: x = (-b ± √(b² - 4ac))/2a. First read off a, b and c: a is the number in front of x², b the number in front of x, c the number on its own, signs included. The formula under the card fills them in for you. Then work out b² - 4ac, and the rest follows. It works on every quadratic!",
      ja: "解の公式の登場！x = (-b ± √(b² - 4ac))/2a。まず a、b、c を読み取ろう：aはx²の前の数、bはxの前の数、cは単独の数（符号も含めて）。カードの下の公式に自動で入るよ。次に b² - 4ac を計算すれば、あとは順番に。どんな二次方程式でも解けるよ！"
    },
    demo: {
      from: "x = (-b ± √(b² - 4ac))/2a",
      move: { en: "x² + 5x - 24 = 0: a = 1, b = 5, c = -24", ja: "x² + 5x - 24 = 0：a = 1、b = 5、c = -24" },
      to: "x = (-5 ± √121)/2"
    }
  },
  line_medium: {
    text: {
      en: "Two points? Call them point 1 and point 2. The gradient is the change in y divided by the change in x: y's on top, x's on the bottom, both taken in the same order. Watch out: minus a negative is a plus!",
      ja: "2つの点を点1、点2としよう。傾きは「yの増加量 ÷ xの増加量」：上はyの差、下はxの差で、どちらも同じ順番で引く。マイナスのマイナスはプラスに注意！"
    },
    demo: {
      from: "(1, 2), (3, 6)\nm = {y_2 - y_1}/{x_2 - x_1}",
      move: { en: "Put the points into the formula", ja: "点を公式に代入する" },
      to: "m = {6 - 2}/{3 - 1} = 2"
    }
  },
  line_hard: {
    text: {
      en: "Now find the whole line. Work out m from the two points first, then put one point into y = mx + c to find c. If y isn't on its own, get it alone first, dividing every term.",
      ja: "今度は直線の式を丸ごと求めよう。まず2つの点から m を出して、次に1つの点を y = mx + c に代入して c を求める。yだけになっていない式は、まずすべての項を割ってyだけにしよう。"
    },
    demo: {
      from: "(-1, 1), (1, 5)",
      move: { en: "m = 2, then 1 = 2 × (-1) + c", ja: "m = 2、次に 1 = 2 × (-1) + c" },
      to: "y = 2x + 3"
    }
  }
};

// ---------- Achievements ----------
// name/desc are per-language objects, matching the levels.js convention above.
// `group` decides the section in the achievements panel: "general", "review", or a topic key.

// Topic display names for the generated per-topic achievements
// (keep in sync with the topic labels in strings.js).
const TOPIC_NAMES = {
  equation:   { en: "Equations",    ja: "方程式" },
  inequality: { en: "Inequalities", ja: "不等式" },
  brackets:   { en: "Brackets",     ja: "かっこ" },
  quadratic:  { en: "Quadratics",   ja: "二次方程式" },
  system:     { en: "Systems",      ja: "連立方程式" },
  fraction:   { en: "Fractions",    ja: "分数" },
  subject:    { en: "Formulas",     ja: "等式の変形" },
  expression: { en: "Expressions",  ja: "式の計算" },
  indices:    { en: "Indices",      ja: "指数法則" },
  roots:      { en: "Completing the square", ja: "平方完成" },
  line:       { en: "Straight lines", ja: "直線のグラフ" }
};

// One template per per-topic achievement type. {topic} = topic name, {n} = level or star count.
//   warmup  — every Easy level in the topic cleared
//   master  — every level in the topic cleared
//   perfect — every star in the topic earned (3 per level)
const TOPIC_ACHIEVEMENT_TYPES = [
  {
    kind: "warmup",
    name: { en: "{topic} Warm-up", ja: "{topic}ウォームアップ" },
    desc: { en: "Clear every Easy level in {topic}", ja: "{topic}の「やさしい」をすべてクリア" }
  },
  {
    kind: "master",
    name: { en: "{topic} Master", ja: "{topic}マスター" },
    desc: { en: "Clear all {n} {topic} levels", ja: "{topic}の{n}レベルをすべてクリア" }
  },
  {
    kind: "perfect",
    name: { en: "{topic} Perfect", ja: "{topic}パーフェクト" },
    desc: { en: "Earn all {n} ★ in {topic}", ja: "{topic}で★{n}個をすべて獲得" }
  }
];

function fillTemplate(template, topicName, n) {
  return template.split("{topic}").join(topicName).split("{n}").join(n);
}

// 3 achievements per topic, in topic order (e.g. "equation_warmup", "equation_master", "equation_perfect").
// Counts come from LEVELS, so the text stays right if a topic gains levels.
const TOPIC_ACHIEVEMENTS = Object.keys(LEVELS_BY_TOPIC_AND_DIFFICULTY).flatMap(topic => {
  const levelCount = LEVELS.filter(l => l.topic === topic).length;
  return TOPIC_ACHIEVEMENT_TYPES.map(type => {
    const n = type.kind === "perfect" ? levelCount * 3 : levelCount;
    const localise = field => Object.fromEntries(
      Object.entries(type[field]).map(([lang, tpl]) =>
        [lang, fillTemplate(tpl, (TOPIC_NAMES[topic] || {})[lang] || topic, n)])
    );
    return {
      id: `${topic}_${type.kind}`,
      group: topic,
      topic,
      kind: type.kind,
      name: localise("name"),
      desc: localise("desc")
    };
  });
});

const ACHIEVEMENTS = [
  // ---- General ----
  {
    id: "first_steps",
    group: "general",
    name: { en: "First Steps", ja: "はじめの一歩" },
    desc: { en: "Solve your first problem", ja: "最初の問題を解く" }
  },
  {
    id: "on_a_roll",
    group: "general",
    name: { en: "On a Roll", ja: "絶好調" },
    desc: { en: "Hit a 3-streak", ja: "3連続正解を達成" }
  },
  {
    id: "blazing",
    group: "general",
    name: { en: "Blazing", ja: "大絶好調" },
    desc: { en: "Hit a 6-streak", ja: "6連続正解を達成" }
  },
  {
    id: "tier_cleared",
    group: "general",
    name: { en: "Tier Cleared", ja: "難易度クリア" },
    desc: { en: "Complete a full difficulty tier", ja: "ひとつの難易度を完了" }
  },
  {
    id: "dedicated",
    group: "general",
    name: { en: "Dedicated", ja: "継続は力なり" },
    desc: { en: "Complete 3 full tier loops", ja: "3周分の難易度を完了" }
  },
  {
    id: "level_up",
    group: "general",
    name: { en: "Level Up", ja: "レベルアップ" },
    desc: { en: "Solve a Hard-tier problem", ja: "むずかしい問題を解く" }
  },

  // ---- Mixed Review ----
  {
    id: "review_first",
    group: "review",
    name: { en: "Mixed Bag", ja: "ミックス初挑戦" },
    desc: { en: "Finish a Mixed Review session", ja: "ミックス復習を1回完了" }
  },
  {
    id: "review_clean",
    group: "review",
    name: { en: "Clean Sweep", ja: "完璧な復習" },
    desc: { en: "Go 10 / 10 flawless in Mixed Review", ja: "ミックス復習でノーミス10/10を達成" }
  },

  // ---- Per topic (generated above) ----
  ...TOPIC_ACHIEVEMENTS
];

export { LEVELS, LEVELS_BY_TOPIC_AND_DIFFICULTY, ACHIEVEMENTS, TIER_TIPS };