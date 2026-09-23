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
//
// Authoring rules:
//   - add/subtract/add_x/subtract_x values are always POSITIVE
//     ("x - 3 > 5" is { action: "add", value: 3 }, never subtract -3).
//     Only multiply/divide may carry a negative value.
//   - Inequality steps that multiply/divide by a negative set `flip: true`
//     (the inequality sign reverses on that step).
//
// `topic` is "equation" or "inequality". `target` is always "both-sides"
// for v1 (no single-side operations yet — keeps the button set small and
// the rule simple: "whatever you do, do it to both sides").
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
  }
];

// Handy lookup by difficulty tier, mirroring how lll-admin/lll-chem
// filter their level banks by difficulty.
// NOTE: equations only for now — inequalities stay hidden from the existing
// Easy/Medium/Hard tabs until the Topic selector is wired up.
const LEVELS_BY_DIFFICULTY = LEVELS
  .filter(lvl => lvl.topic === "equation")
  .reduce((acc, lvl) => {
    (acc[lvl.difficulty] = acc[lvl.difficulty] || []).push(lvl);
    return acc;
  }, {});

// Topic → difficulty → levels. Ready for the Topic selector
// (e.g. LEVELS_BY_TOPIC_AND_DIFFICULTY.inequality.medium); not used by
// index.html yet.
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
    desc: { en: "Solve your first equation", ja: "最初の方程式を解く" }
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
    desc: { en: "Solve a Hard-tier equation", ja: "むずかしいの方程式を解く" }
  }
];

export { LEVELS, LEVELS_BY_DIFFICULTY, LEVELS_BY_TOPIC_AND_DIFFICULTY, ACHIEVEMENTS };