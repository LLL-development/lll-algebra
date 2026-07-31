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
// `target` is always "both-sides" for v1 (no single-side operations yet —
// keeps the button set small and the rule simple: "whatever you do, do it
// to both sides").
//
// `hints` and `explanation` are per-language objects ({ en, ja }) so the
// UI can pick the active language at render time.

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
  }
];

// Handy lookup by difficulty tier, mirroring how lll-admin/lll-chem
// filter their level banks by difficulty.
const LEVELS_BY_DIFFICULTY = LEVELS.reduce((acc, lvl) => {
  (acc[lvl.difficulty] = acc[lvl.difficulty] || []).push(lvl);
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

export { LEVELS, LEVELS_BY_DIFFICULTY, ACHIEVEMENTS };