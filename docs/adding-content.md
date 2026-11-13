# Adding levels and topics

A guide for adding new levels to an existing topic, or adding a whole new topic, to
LLL Algebra. The app is fully data-driven: a level is a data entry in `levels.js`, and
most of the app picks it up automatically.

**Read the comment block at the top of `levels.js` first.** It's the reference for every
step action (`add`, `factor`, `diff`, …), every topic's authoring rules and every mistake
kind. This guide covers the workflow and the rules that apply everywhere.

## How a level works

Each level is a list of steps. At each step the player sees four buttons: the correct
move plus three wrong ones. The wrong options come from one of two places:

- **Generated** (`choices.js` → `makeDistractors()`): for plain + − × ÷ moves with a
  number, e.g. "subtract 5". The opposite move (+ 5) is always included as a trap.
- **Authored** (in `levels.js`): for everything else (expanding, factorising, reading off
  a gradient, …). The step carries `value` (the right answer) and `wrong` (exactly 3 wrong
  options), and the UI shows those four instead of generating any.

Authored wrong options should be **real mistakes students make** (a sign slip, d and c
swapped, x² + 9 for (x + 3)²), not random numbers. Each one is tagged in `wrongKinds`,
in the same order as `wrong`, so Chalky can say what went wrong and Tricky spots can
track it.

## A level entry

This is `seq_easy_01`, with comments added:

```js
{
  id: "seq_easy_01",             // unique; "<topic short name>_<tier>_<NN>"
  topic: "sequence",             // one of the 13 topic keys
  equation: "3, 7, 11, 15, ...", // what the card shows first
  answer: "u_n = 4n - 1",        // the final answer
  difficulty: "easy",            // "easy" | "medium" | "hard"
  type: "nth-term",              // level type (some topics use it for tips or layout)
  basePoints: 10,                // 10 / 20 / 30 for easy / medium / hard
  steps: [
    { action: "diff", value: "d = 4", target: "sequence",
      result: "3, 7, 11, 15, ...\nd = 4",          // what the card shows after this step
      wrong: ["d = -4", "d = 3", "d = 5"],
      wrongKinds: ["diffSign", "diffFirst", "generic"] },
    { action: "nth", value: "4n - 1", target: "sequence", result: "u_n = 4n - 1",
      wrong: ["4n + 3", "3n + 4", "4n + 1"],
      wrongKinds: ["zeroTerm", "swapDn", "nthSign"] }
  ],
  hints: {
    en: ["Subtract one term from the next: 7 − 3 = 4.",
         "The nth term is dn + (first term − d): 4n + (3 − 4) = 4n − 1."],
    ja: ["…", "…"]
  },
  explanation: { en: "…shown when solved…", ja: "…" }
}
```

- `result` is what the card shows after the step. Use `\n` for a second line, and keep
  anything the player still needs (the sequence, the equation) on the card.
- `hints` has one entry per step, in order. `hints` and `explanation` are always
  `{ en, ja }`.
- Some topics use extra fields (`subject`, `collect`, `law`, `abc`, `line`, `type`, …).
  See the `levels.js` header for the topic you're working on.

## Adding levels to an existing topic

1. **`levels.js`**: add the entries next to the topic's other levels, with the next `id`
   in sequence. Levels unlock in array order within each tier.
2. **New mistake kind?** If a wrong option doesn't fit any existing kind for that topic,
   add one (see [Mistake kinds](#mistake-kinds)). Otherwise reuse an existing kind, or use
   `"generic"` for plain arithmetic slips (not tracked by Tricky spots).
3. **Test** (see [Testing](#testing)).

The level count on the topic card, the per-topic achievements ("Clear all 30 levels"),
Mixed Review and the daily challenge all update automatically.

## Adding a new topic

Pick a short topic key (e.g. `sequence`), then touch these files in order:

1. **`levels.js`**
   - Add the levels (Easy, Medium and Hard, 10 each by convention).
   - Add the topic to `TOPIC_NAMES` (EN/JA). This names its 3 achievements, which are
     generated automatically.
   - Optional: `TIER_TIPS` entries keyed `<topic>_medium` / `<topic>_hard`. These show a
     one-time tip with a small demo when the player first opens that tier.
   - Document the topic's step actions, fields and mistake kinds in the header comment,
     like the existing topics.
2. **`choices.js`**: for each new authored action, add a prompt key to
   `CHOICE_PROMPT_KEYS` (e.g. `diff: "diffPrompt"`). This is the short line above the
   buttons ("Find the common difference:").
3. **`index.html`**
   - Add a topic card on the home screen (copy an existing `<button class="topic-card">`
     and change `data-topic`, `data-progress`, the sample and the i18n keys).
   - Add the topic to `TOPIC_LABEL_KEYS`, `TOPIC_SAMPLES` and `TUT_TIP_COUNT`.
   - Add each new mistake kind to `MISTAKE_KEYS`, and each new authored action to
     `AUTHORED_TIP_KEYS` (the fallback Chalky line for `"generic"` slips on that step).
4. **`strings.js`** (both `en` and `ja`)
   - `topic<Name>` and `topic<Name>Desc` (card title and description).
   - `topic<Name>TutBody` and `topic<Name>TutTip1`, `…Tip2` (the topic tutorial; the
     number of tips must match `TUT_TIP_COUNT`).
   - The prompt keys from step 2.
   - `mistake<Kind>` and `tricky<Kind>` for each new mistake kind, plus `mistakeTip<Action>`
     for each new authored action.
   - Update `introTopics` ("There are 13 topics…") to the new count.
5. **`formulas.js`** (optional): add entries under the topic key to give it a 📐 formula
   sheet. Topics without entries simply don't show the button.
6. **`mathtext.js`** (only if needed): if the topic needs new notation drawn (a new kind
   of subscript, symbol or fraction), add it here. Check that existing topics still
   render correctly afterwards.
7. **`README.md`**: add the topic to the Topics table and update the counts.

## Mistake kinds

A mistake kind is a camelCase name (e.g. `diffSign`) that ties together:

| Where | What |
|---|---|
| `levels.js` | tags a wrong option in `wrongKinds` (or `moves[].kind`) |
| `index.html` → `MISTAKE_KEYS` | maps the kind to its strings key, `diffSign: "mistakeDiffSign"` |
| `strings.js` → `mistake<Kind>` | Chalky's line when the player picks that option |
| `strings.js` → `tricky<Kind>` | the label on the Tricky spots card |

Mistake strings are written as **`"line A|line B"`**: Chalky picks one of the two at
random so he doesn't repeat himself. A single line with no `|` also works. Both lines
need a Japanese version.

Reuse a kind from another topic when the mistake really is the same (e.g. `signSlip`,
`unlikeTerms`, `undoSign`). That way Tricky spots counts it as one habit across topics.

## Rules that apply everywhere

- **Button length: 16 characters max** (18 for quadratic-formula options). Longer labels
  wrap or overflow on a narrow phone. `isLongChoice()` in `choices.js` measures labels the
  same way the UI does.
- **No Japanese on the card.** The pixel font has no Japanese characters, so card text
  (`equation`, `result`) must be maths only. Words go in prompts, hints and explanations.
- **Avoid the letters `l`, `I` and `O`** in expressions. In the pixel font they look like
  1 and 0.
- **No wrong option may secretly be right.** For example, any common multiple clears
  fractions, and for an ordered answer, an option in a different order is still correct.
  Check every option by working it through.
- **Answers are listed smallest first** when there are two (`x = -3, 2`).
- **add/subtract values are always positive.** "x - 3 = 5" is `{ action: "add", value: 3 }`,
  never subtract -3. Only multiply/divide may carry a negative value.
- **Write minus as `-` in data.** `mathtext.js` turns it into a proper − when drawing.
- **Each tier's level 1 is unlocked from the start**, by design.

## Testing

Run it locally (`npm run dev`) and check:

- [ ] Every new level solves start to finish with the correct option at each step
- [ ] Each wrong option shows the right Chalky line (try every one)
- [ ] Hints appear in order, and the explanation reads correctly
- [ ] English and Japanese, including tutorial, tier tips and formula sheet
- [ ] Narrow phone width: 344px in DevTools (cards, buttons and 2–3 line results fit)
- [ ] Light and dark theme
- [ ] For a new topic: the home card, level count, achievements panel, Mixed Review and
      Tricky spots all pick it up

**Unlocking later levels quickly:** progress lives in `localStorage` under the
`lll_algebra_progress` key. Levels unlock when the previous level has an entry in
`levelProgress`, so you can mark levels cleared from the DevTools console:

```js
const p = JSON.parse(localStorage.getItem("lll_algebra_progress"));
["seq_hard_01", "seq_hard_02", "seq_hard_03"].forEach(id => p.levelProgress[id] = { stars: 3 });
localStorage.setItem("lll_algebra_progress", JSON.stringify(p));
location.reload();
```

To start again from a clean slate, use **Settings → Reset progress**, or run
`localStorage.removeItem("lll_algebra_progress")`.

Data mistakes are easy to miss by eye. For a large batch of levels, a quick Node script
that loads `levels.js` and checks each answer, `wrong`/`wrongKinds` lengths and button
lengths is worth writing.