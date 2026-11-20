# LLL Algebra

Developed by LLL Inc.'s dev team — visit us at https://www.live-laugh-love.world

A free, gamified algebra game. Solve each problem one step at a time by picking the
right move, with instant feedback from Chalky, your chalk-stick companion. No account
required — progress is saved locally in your browser.

**Live:** https://lll-algebra.pages.dev/ · **Trailer:** https://youtu.be/KKyUqd1WhtI

Part of the LLL Series OSS — open-source tools built from scratch.

## Topics

13 topics, 400 levels in total. Each topic has Easy, Medium and Hard tiers of 10 levels
(Inequalities has 15 Medium and 15 Hard levels).

| Topic | What you practise |
|---|---|
| Equations | Find the value of x |
| Inequalities | Find the range of x, flipping the sign when you × or ÷ by a negative |
| Brackets | Expand, then solve for x |
| Quadratics | Factorise, then find both answers |
| Systems | Two equations: eliminate a letter, then find x and y |
| Fractions | Clear the fractions, then solve for x |
| Formulas | Make a different letter the subject |
| Expressions | Collect like terms to simplify |
| Expand & factorise | Multiply out brackets, then put them back |
| Indices | Use the laws of indices to simplify powers |
| Completing the square | Square roots, completing the square and the quadratic formula |
| Straight lines | Gradient, intercept and the equation of a line, with graphs |
| Sequences | Find the common difference, the nth term, and any term |

## Features

- **Step-by-step solving**: choose the correct move from four options. Wrong options are
  real mistakes students make (sign slips, wrong order, missed terms), not random numbers
- **Chalky**: a pixel-art companion who reacts to your moves and explains what went wrong
- **Hints and explanations**: progressive hints for each step, plus a worked explanation
  when a level is solved
- **Stars and unlocking**: up to 3 stars per level (fewer for wrong moves or hints);
  solving a level unlocks the next one in its tier
- **Tricky spots**: tracks the kinds of mistakes you make most and lets you practise
  them directly
- **Mixed Review**: a short scored set of questions drawn from levels you've already cleared,
  across all topics (unlocks after clearing a few levels)
- **Daily challenge**: one new problem each day, with a day-streak counter
- **Achievements**: 47 achievements, with toast notifications and a browsable panel
- **Formula sheet**: the key formulas for each topic, one tap away
- **Graphs**: number lines for inequalities and coordinate graphs for straight lines
- **Settings**: sound on/off, language, theme, and reset progress
- **Light/dark theme** and **English/Japanese** language support
- **Mobile-friendly**: designed to work on screens as narrow as 344px

## Run locally

It's a static site with no build step. Any static file server works, for example:

```bash
npm install
npm run dev
```

This serves the folder with [`serve`](https://www.npmjs.com/package/serve). Open the URL
it prints (usually http://localhost:3000). Opening `index.html` directly from the file
system won't work, because the scripts are ES modules.

To check the level data for mistakes (duplicate ids, missing hints, wrong options that
match the answer, buttons too long for narrow phones), run:

```bash
npm run check
```

## Project structure

```
index.html      App markup and main game logic
levels.js       All level data, tier tips and achievements
choices.js      Builds the four answer options for each step
strings.js      UI text in English and Japanese
formulas.js     Formula sheet entries per topic
chalky.js       Chalky's pixel sprites, animations and lines
mathtext.js     Formats maths text (superscripts, subscripts, minus signs)
graph.js        Number-line and coordinate graph drawing
effects.js      Confetti and other visual effects
sound.js        Sound effects (Web Audio API) and the sound setting
core/           Shared LLL utilities: theme, i18n, brand styling, logo, fonts
docs/           Developer notes
scripts/        Developer scripts (check-levels.mjs, run by `npm run check`)
```

To add levels or a new topic, see [docs/adding-content.md](docs/adding-content.md).

## Deployment

Merges to `main` deploy automatically to Cloudflare Pages via
`.github/workflows/deploy.yml`. It can also be run by hand from the Actions tab
(Deploy to Cloudflare Pages → Run workflow). It needs two repository secrets:
`CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`.

Other workflows:

| Workflow | File | What it does |
|---|---|---|
| Check levels | `check-levels.yml` | Runs `npm run check` on every pull request into `main` (or by hand); a failure means a level data error to fix before merging |
| PR Drift Check | `pr-drift-check.yml` | Sends each pull request to LLL's internal review gateway, which posts an automated review comment; comment `/drift` or `/qc` on the PR to send feedback. Non-blocking; needs the `PR_REVIEW_SECRET` secret |
| CodeQL | none (GitHub default setup) | Code scanning for security issues, managed in Settings → Code security |
| Dependabot Updates | none (GitHub-managed) | Opens pull requests for dependency updates, managed in Settings → Code security |

## Tech

- Plain HTML, CSS and JavaScript (ES modules), no framework or build step
- Shared `core/` utilities (theme, i18n, brand styling) consistent with other LLL tools
- Progress stored in `localStorage`; nothing is sent to a server
- Fonts are self-hosted in `core/vendor/fonts/` (no Google Fonts or CDN calls)
- English and Japanese only for now. Other LLL tools also support 简体中文, 繁體中文,
  한국어 and Bahasa Melayu. Adding a language means adding it to `LANGS` in
  `core/i18n.js`, adding its UI text in `strings.js`, and translating every level's
  `hints` and `explanation` in `levels.js`

## Contributing

- Branch from `main` as `feature/YYMMDD_description` (e.g. `feature/261120_readme_handover_docs`)
- Open a pull request into `main` with a Summary / Why / Changes / Testing description
- The Check levels workflow must pass before merging; run `npm run check` locally first
- Merging to `main` deploys to the live site, so test locally before asking for review

## License

MIT