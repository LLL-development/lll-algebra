// LLL Algebra — formula sheet entries (📐 on level select and next to Hint)
// Only topics listed here get the 📐 button. Each entry is drawn with setMathText(), so
// powers use ^ (x^m, x^(m+n)) and roots use √ (√k, √(b² − 4ac)), as in levels.js.
//   name:    label above the formula ({ en, ja }); omitted when rule: true (shows "Rule" instead)
//   formula: string, or { en, ja } when it contains words
//   example: shown after "e.g." / "例：" (string or { en, ja })
//   note:    shown as-is, with no "e.g." (for "for ax² + bx + c = 0")

const TOPIC_FORMULAS = {
  roots: [
    {
      name: { en: "Square root both sides", ja: "両辺の平方根をとる" },
      formula: "A² = k → A = ±√k",
      example: "(x + 2)² = 9 → x + 2 = ±3",
    },
    {
      name: { en: "Perfect square", ja: "平方の展開" },
      formula: "(x ± n)² = x² ± 2n·x + n²",
      example: "(x + 3)² = x² + 6x + 9",
    },
    {
      name: { en: "Quadratic formula", ja: "解の公式" },
      formula: "x = (−b ± √(b² − 4ac)) / (2a)",
      note: { en: "for ax² + bx + c = 0", ja: "ax² + bx + c = 0 のとき" },
    },
  ],
  indices: [
    {
      name: { en: "Multiply rule", ja: "かけ算のルール" },
      formula: "x^m × x^n = x^(m+n)",
      example: "x^2 × x^3 = x^5",
    },
    {
      name: { en: "Divide rule", ja: "わり算のルール" },
      formula: "x^m ÷ x^n = x^(m−n)",
      example: "x^5 ÷ x^2 = x^3",
    },
    {
      name: { en: "Power rule", ja: "累乗のルール" },
      formula: "(x^m)^n = x^(mn)",
      example: "(x^2)^3 = x^6",
    },
    {
      name: { en: "Zero rule", ja: "0乗のルール" },
      formula: "x^0 = 1",
      example: "7^0 = 1",
    },
    {
      name: { en: "Negative powers", ja: "負の指数" },
      formula: "x^-n = 1/x^n",
      example: "x^-2 = 1/x^2",
    },
  ],
  brackets: [
    {
      name: { en: "Expand", ja: "展開" },
      formula: "a(b + c) = ab + ac",
      example: "3(x + 2) = 3x + 6",
    },
    {
      name: { en: "Minus outside", ja: "かっこの前のマイナス" },
      formula: "−(a + b) = −a − b",
      example: "−(x − 4) = −x + 4",
    },
  ],
  quadratic: [
    {
      name: { en: "Two brackets", ja: "かっこ2つの展開" },
      formula: "(x + a)(x + b) = x² + (a + b)x + ab",
      example: "(x + 2)(x + 3) = x² + 5x + 6",
    },
    {
      name: { en: "Zero product", ja: "かけて0なら" },
      formula: { en: "AB = 0 → A = 0 or B = 0", ja: "AB = 0 → A = 0 または B = 0" },
      example: "(x − 1)(x + 4) = 0 → x = −4, 1",
    },
  ],
  expression: [
    {
      name: { en: "Like terms", ja: "同類項" },
      formula: "ax + bx = (a + b)x",
      example: "3x + 2x = 5x",
    },
    {
      name: { en: "A lone letter", ja: "文字だけの項" },
      formula: "x = 1x",
      example: "x + 4x = 5x",
    },
  ],
  inequality: [
    {
      rule: true,
      formula: { en: "× or ÷ by a negative → flip the sign", ja: "負の数で × か ÷ → 不等号の向きが逆" },
      example: "−2x < 6 → x > −3",
    },
  ],
};

// Picks the active language from a string or { en, ja } value.
function formulaText(value, lang) {
  return typeof value === "string" ? value : (value[lang] ?? value.en);
}

function hasFormulas(topic) {
  return Array.isArray(TOPIC_FORMULAS[topic]) && TOPIC_FORMULAS[topic].length > 0;
}

export { TOPIC_FORMULAS, formulaText, hasFormulas };