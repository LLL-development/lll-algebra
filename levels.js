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
//
// Authoring rules:
//   - add/subtract/add_x/subtract_x values are always POSITIVE
//     ("x - 3 > 5" is { action: "add", value: 3 }, never subtract -3).
//     Only multiply/divide may carry a negative value.
//   - Inequality steps that multiply/divide by a negative set `flip: true`
//     (the inequality sign reverses on that step).
//
// `topic` is "equation", "inequality" or "brackets". `target` is "both-sides"
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