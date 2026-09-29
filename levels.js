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
//
// Systems: `equation` is two lines joined by "\n" (e.g. "x + y = 9\n2x - y = 3"), and
// `answer` is { x, y }. A step whose result the player must substitute into keeps that
// equation as a second line (e.g. "x = 4\nx + y = 9"), so it stays on the card.
//
// Any step with a `wrong` array is an authored-choice step: the UI shows `value` plus
// the 3 `wrong` options instead of generating distractors.
//
// Authoring rules:
//   - add/subtract/add_x/subtract_x values are always POSITIVE
//     ("x - 3 > 5" is { action: "add", value: 3 }, never subtract -3).
//     Only multiply/divide may carry a negative value.
//   - Inequality steps that multiply/divide by a negative set `flip: true`
//     (the inequality sign reverses on that step).
//
// `topic` is "equation", "inequality", "brackets", "quadratic" or "system". `target` is "both-sides"
// for every move that changes a side's value; only "expand" rewrites one side,
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
  }
];

// Topic → difficulty → levels (e.g. LEVELS_BY_TOPIC_AND_DIFFICULTY.inequality.medium).
// Drives the level select screen and level order in index.html.
const LEVELS_BY_TOPIC_AND_DIFFICULTY = LEVELS.reduce((acc, lvl) => {
  acc[lvl.topic] = acc[lvl.topic] || {};
  (acc[lvl.topic][lvl.difficulty] = acc[lvl.topic][lvl.difficulty] || []).push(lvl);
  return acc;
}, {});

// Achievement definitions — name/desc are per-language objects, matching
// the levels.js convention above.
const ACHIEVEMENTS = [
  {
    id: "first_steps",
    name: { en: "First Steps", ja: "はじめの一歩" },
    desc: { en: "Solve your first problem", ja: "最初の問題を解く" }
  },
  {
    id: "on_a_roll",
    name: { en: "On a Roll", ja: "絶好調" },
    desc: { en: "Hit a 3-streak", ja: "3連続正解を達成" }
  },
  {
    id: "blazing",
    name: { en: "Blazing", ja: "大絶好調" },
    desc: { en: "Hit a 6-streak", ja: "6連続正解を達成" }
  },
  {
    id: "tier_cleared",
    name: { en: "Tier Cleared", ja: "クリア" },
    desc: { en: "Complete a full difficulty tier", ja: "ひとつの難易度を完了" }
  },
  {
    id: "dedicated",
    name: { en: "Dedicated", ja: "継続は力なり" },
    desc: { en: "Complete 3 full tier loops", ja: "3周分の難易度を完了" }
  },
  {
    id: "level_up",
    name: { en: "Level Up", ja: "レベルアップ" },
    desc: { en: "Solve a Hard-tier problem", ja: "むずかしいの問題を解く" }
  }
];

export { LEVELS, LEVELS_BY_TOPIC_AND_DIFFICULTY, ACHIEVEMENTS };