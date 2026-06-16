# GATE-1 scorecard — fill this in when the round-trip happens

> One real run, recorded. GATE-1 is **closed** only when all four boxes below are checked with a *real second person*. Until then it's vision. Don't build past this on the strength of a solo run.

## The named pair (criterion 1 — the human core)

- **Friend (real person):** 〈name / handle〉
- **Their vendor:** 〈codex | claude〉  ·  **Their machine:** 〈laptop/host〉
- **Repo (allowlisted, one):** 〈owner/repo〉
- **Repeating task (what you two actually want to repeat):** 〈e.g. push→diff review〉
- **Why it recurs (not a one-off):** 〈how often / what triggers it in real work〉
- **Date of the run:** 〈YYYY-MM-DD〉

## Evidence (check when true)

- [ ] **friend + repo + repeating task named** — all three filled above, real names (not you on both sides).
- [ ] **a real A2A round-trip happened** — your `send.mjs` printed `COMPLETED` with a review your friend's agent produced (paste below).
- [ ] **`handoff.log` has the trace** — paste the two lines (`received` → `returned`) with their `from` ≠ you.
- [ ] **both say "again"** — both of you would repeat it. Paste exact words (the painkiller signal).

### Paste — the returned review (trim to a few lines)
```
〈paste the REVIEW FROM FRIEND'S AGENT output〉
```

### Paste — the audit trace (`prototype/handoff.log`)
```
〈paste the received + returned lines — confirm "from" is your friend, not you〉
```

### Paste — the "again?" answers (verbatim)
- **You:** 〈…〉
- **Friend:** 〈…〉

## Verdict

- [ ] 🟢 **GATE-1 CLOSED** — all four checked. Persona C is now a *real dyad with a habit*, not a hypothesis. This is the strongest single slide for the raise. → update `PROJECT.md §4` (flip GATE-1 🔴→🟢) and `docs/06 §4`.
- [ ] 🟡 **Partial** — round-trip worked but "again" is lukewarm. Note the friction (setup pain? review not useful? wrong task?) and try a *different repeating task* the pair actually wants before concluding.
- [ ] 🔴 **Kill / re-scope** — they wouldn't repeat it. Cross-person handoff is a vitamin for this pair. Per `docs/03 kill-criteria` + `docs/06 §4`: try a different ICP (persona A drowning OSS maintainer / B 2-pizza team) or re-scope the core before building more. **Do not** build the real trust layer (M5 / GATE-2) on an unvalidated handoff.

## Friction log (so the next pair is easier)
- 〈anything that made setup/run annoying — tunnel, token sharing, CLI auth, approve prompt, etc. Fold fixes back into the runbook.〉
