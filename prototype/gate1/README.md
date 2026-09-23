# GATE-1 — close it this week (recruit → run → score)

> GATE-1 (`docs/06 §4`, `docs/07 §6`) is **the one thing AI cannot do for you**: get **one real other person** to run a **repeating cross-agent handoff** with you, and have **both of you say "I'd use this again."** The mechanism is already built and verified — this is now a *recruiting + evidence* task, not a build task.

## Where we are (honest)

| GATE-1 criterion (`docs/07 §6`) | status |
|---|---|
| A real A2A round-trip happened | ✅ **done** — real Codex review returned over A2A (`prototype/handoff.log`) |
| `handoff.log` records the trace | ✅ **done** |
| friend + repo + **repeating task** named (a real *2nd person*) | ❌ **open** — every trace so far is `from: <you>` on both sides = solo |
| **both** say "again" (painkiller signal) | ❌ **open** — needs the 2nd person |

→ The only blockers are the two that require a human. Everything technical is ready. **Prove the pipe with the lowest-friction task first** (push→diff review); your real long-term recurring task is a config swap later (`prototype/config.json` `reviewer` + the skill prompt).

## The one input only you can give

Name three things (this *is* GATE-1):
1. **Friend** — one real person who runs Codex or Claude Code.
2. **Repo** — one small repo to allowlist (their agent only reviews this one).
3. **Repeating task** — the thing you two *actually* want to repeat. Default v1 = "I push a branch → your agent reviews the diff → I get it back." Swap later.

Then send the invite below. That's the whole human step.

---

## Run it — founder side (A = you, e.g. Claude Code)

```bash
cd ~/GioGio
# 1) make ONE shared secret with your friend (send it over a private channel, never commit it)
export A2A_SHARED_TOKEN=$(openssl rand -hex 16)        # paste the SAME value on both machines

# 2) in the repo you want reviewed, hand off the branch to your friend's agent:
B_URL=https://<friend-tunnel> A2A_SHARED_TOKEN=$A2A_SHARED_TOKEN node prototype/send.mjs <branch>
# → prints "REVIEW FROM FRIEND'S AGENT (COMPLETED)" + the review. Auto-fire on push: install prototype/hooks/pre-push.sample
```

## Run it — friend side (B = them, Codex or Claude)

Give your friend these 5 lines (they need Node ≥18 + the `codex` **or** `claude` CLI, already authed):

```bash
git clone <your-repo-or-this-rig> && cd <dir>
cp prototype/config.example.json prototype/config.json
#   edit config.json: "reviewer":"codex" (or "claude"), "repoAllowlist":["<owner/repo>"]
export A2A_SHARED_TOKEN=<the-shared-secret-you-sent-them>
node prototype/reviewer-server.mjs                              # prints the local URL, waits for handoffs
ngrok http 8787                                        # → https://xxxx.ngrok-free.app  (cloudflared also fine)
#   put that public URL in config.json "publicUrl", restart reviewer-server.mjs, send the URL back to you
```

When a handoff arrives, **their terminal prompts `Approve? [y/N]`** — they type `y`, their agent reviews your diff (read-only), the review comes back to you. Nothing is written or merged. The audit line in `prototype/handoff.log` is **path/summary only — never the diff body** (`docs/07 §8`).

> Reachability: this machine has **ngrok** (not cloudflared) — `ngrok http 8787` works. The tunnel URL changes each restart (free tier) → update `publicUrl` and restart, or use a named/static tunnel.

## Fence — do NOT cross (`docs/07 §5`)

real auth (OBO/DPoP) · multi-tenant · billing · arbitrary connections · unattended chains · auto-merge · multiple skills. The reviewer **returns a review (or `REJECTED`) — never writes**. One repo, one known friend, attended every time.

---

## Then: score it

Fill in **`SCORECARD.md`** the moment the round-trip happens. GATE-1 is *closed* when both humans say "again" and the trace is logged. If they shrug, it's a vitamin → see the kill-criteria there before building more.

---

## 📨 Invite — copy, fill the 〈blanks〉, send

**JP (casual, to a builder friend):**
> 〈name〉、15 分だけ実験に付き合ってくれない? 売り込みじゃなくて検証なんだけど——
> **俺が branch を push したら、君の Codex(or Claude) がその diff を review して俺に返す**、っていう「人をまたいだ agent の受け渡し」を 1 回だけ動かしたい。
> 君がやるのは: Node と codex/claude CLI が入った状態で `node prototype/reviewer-server.mjs` を起動 → ngrok で公開 URL を俺に渡すだけ。レビュー要求が来たら端末に `Approve? [y/N]` が出るので `y` を押す。**コードは read-only、書き込み/merge は一切しない、diff 本文もログに残さない**(残すのは path だけ)。
> 終わったら一言だけ欲しい: **「これ、また使いたい?」** 〈date〉どう?

**EN (casual):**
> Hey 〈name〉 — got 15 min for an experiment? Not a pitch, just validation.
> I want to run **one** cross-person agent handoff: **I push a branch → your Codex (or Claude) reviews the diff → it comes back to me.**
> Your part: with Node + the codex/claude CLI installed, run `node prototype/reviewer-server.mjs`, expose it with ngrok, send me the URL. When a review request lands you'll see `Approve? [y/N]` — hit `y`. It's **read-only, never writes/merges, and the diff body is never logged** (path only).
> Afterward I just need one thing: **"would you use this again?"** Free 〈date〉?

> Tip: pick a friend whose review you'd *genuinely* want on a repo you're *actually* pushing to this week — real recurrence is the whole point. Reframe the task line if you two repeat something else (nightly WIP test, PR triage, …).
