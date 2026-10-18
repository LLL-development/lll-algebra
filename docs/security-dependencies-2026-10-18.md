# Dependency security maintenance — 2026-10-18

This change refreshes supported dependency ranges and the reproducible lockfile. It adds no product behavior or UI changes. npm audit failed before the update and succeeds after a clean npm ci (Node 22.23.1).

| Package | Installed patched version(s) |
|---|---|
| brace-expansion | 1.1.21 |
| compression | 1.8.2 |
| fast-uri | 3.1.8 |

## Baseline advisories

The following open GitHub Dependabot alerts were captured before this change. Package audit counts differ from advisory counts because several advisories affect one package.

| Alert | Package | Vulnerable range | First fixed version | Advisory |
|---|---|---|---|---|
| [#11](https://github.com/LLL-development/lll-algebra/security/dependabot/11) | brace-expansion | `< 1.1.21` | 1.1.21 | [GHSA-q2hr-2g5m-vwhr](https://github.com/advisories/GHSA-q2hr-2g5m-vwhr) |
| [#10](https://github.com/LLL-development/lll-algebra/security/dependabot/10) | compression | `< 1.8.2` | 1.8.2 | [GHSA-vc2v-76pw-4v95](https://github.com/advisories/GHSA-vc2v-76pw-4v95) |
| [#9](https://github.com/LLL-development/lll-algebra/security/dependabot/9) | fast-uri | `>= 3.0.0, < 3.1.7` | 3.1.7 | [GHSA-qw65-cvwx-89v3](https://github.com/advisories/GHSA-qw65-cvwx-89v3) |
| [#8](https://github.com/LLL-development/lll-algebra/security/dependabot/8) | fast-uri | `>= 3.0.0, < 3.1.6` | 3.1.6 | [GHSA-jqff-g426-hqxp](https://github.com/advisories/GHSA-jqff-g426-hqxp) |
| [#7](https://github.com/LLL-development/lll-algebra/security/dependabot/7) | fast-uri | `>= 3.0.0, < 3.1.6` | 3.1.6 | [GHSA-f65p-4m7j-42xc](https://github.com/advisories/GHSA-f65p-4m7j-42xc) |
| [#5](https://github.com/LLL-development/lll-algebra/security/dependabot/5) | fast-uri | `>= 3.1.3, < 3.1.6` | 3.1.6 | [GHSA-5jgf-p345-68v8](https://github.com/advisories/GHSA-5jgf-p345-68v8) |
| [#4](https://github.com/LLL-development/lll-algebra/security/dependabot/4) | fast-uri | `>= 3.1.2, < 3.1.6` | 3.1.6 | [GHSA-fph4-wmhf-6fwf](https://github.com/advisories/GHSA-fph4-wmhf-6fwf) |
| [#2](https://github.com/LLL-development/lll-algebra/security/dependabot/2) | fast-uri | `>= 3.0.0, < 3.1.5` | 3.1.5 | [GHSA-7p8r-x3mc-p8w7](https://github.com/advisories/GHSA-7p8r-x3mc-p8w7) |

## Why the compression override is scoped

The npm registry metadata for the current upstream `serve@14.2.6` pins `compression` to the exact vulnerable version `1.8.1`. Its parent cannot resolve the fixed `1.8.2` through an ordinary compatible update. `overrides.serve.compression` selects only `1.8.2` (a patch release) for that parent; other dependency ranges are unchanged. [GHSA-vc2v-76pw-4v95](https://github.com/advisories/GHSA-vc2v-76pw-4v95) affects `<1.8.2`. Remove this scoped override after an upstream serve release includes a fixed compression dependency. This installs the patched code; no advisory is ignored or dismissed.

Verification: clean npm ci, npm audit=0, npm ls=0. Actual serve 14.2.6→compression 1.8.2 handles gzip GET, HEAD and a missing path returning 404. Browser: intro skip→equation→easy level 1→subtract 5 solves x+5=12 as x=7, earns 10 points and three stars. Static application has no build or test script.

Deployment: README identifies https://lll-algebra.pages.dev/; the existing Cloudflare Pages workflow deploys the repository on main push/manual dispatch. Its PR-closed trigger now checks `merged == true` so closing an unmerged PR cannot deploy it. Secrets names: CLOUDFLARE_API_TOKEN, CLOUDFLARE_ACCOUNT_ID. No production writes or deployment were performed for this PR.

## Limits and rollback

npm audit is a dependency advisory check, not a proof that all application security properties are correct. Dependabot alerts are expected to be recalculated after merge; this PR does not dismiss them. Revert this PR to restore the previous dependency tree/workflow configuration (which reintroduces the listed vulnerable versions). Production deployment and remote secret presence require separate verification after review and merge.
