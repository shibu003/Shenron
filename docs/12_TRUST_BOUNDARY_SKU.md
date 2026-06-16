# 12 — Agent Trust Boundary — the first paid SKU (1-pager)

> The productization of differentiator **#1** (`docs/11 §2.6`). Builder/cockpit = the entry ticket (Langflow/n8n
> own "convenience"); the **paid** thing is the trust boundary you put around cross-owner agent work.
> Implemented in `prototype/trust.mjs` + hub enforcement (`prototype/hub/hub.mjs`) + cockpit (`prototype/hub/ui.html`).
> Updated: 2026-06-16 (Wave A per-edge firewall + Wave B capability vocabulary + Wave C packaging — all live-verified).

---

## 1. One line

**Run AI agents you don't fully control — 3rd-party, another team's, another company's — without leaking secrets,
without un-approved external sends, and with a tamper-evident record of every hop.**

## 2. Who buys (ICP)

- **2-pizza dev team** wiring multiple-vendor agents (Claude + Codex + …) into one pipeline.
- **AI-heavy agency** running a client's agents next to its own — needs a defensible "we fenced it" story.
- **SMB using several agents** that touch a repo, a CRM, and a Slack — wants least-privilege without building it.

The wedge into all three: an agent from *outside the trust boundary* (a vendor's, a partner's, a client's) is in the loop.

## 3. What's sold — the bundle (not "a better builder")

| # | Piece | What it does | Status |
|---|---|---|---|
| 1 | **Capability passport** | Per-agent grant: `net none\|read\|full` · `fs none\|diff-only\|repo` · `external_send deny\|approval\|allow` · `secrets deny`. 1-click **Trust presets** (untrusted-3rd-party / internal / trusted). | `external_send` **hub-enforced**; `net`/`fs` **declared + audited** (sandbox = runner-side, roadmap). |
| 2 | **Data firewall (per-edge)** | Secrets / API keys / PII / `.env` stripped **by default on every wire**; each wire adds its own `never` list; **cross-company wires are deny-by-default**. Values are never stored — only *what* was stripped. | **Enforced** at handoff create + per-edge + egress-to-tool. |
| 3 | **Tamper-evident audit** | Hash-chained trail of redact / deny / approve / send / passport. Any edit to the store breaks the chain (`/api/audit` → `verify:false`). **This is what an enterprise actually wants to buy.** | **Enforced** (`auditAppend`/`auditVerify`). |

**Representative flow** (one-click in the cockpit → "🔒 Safe Handoff example"): Chat Input (secret + codename baked in)
→ upstream agent → **🔒 cross-company wire** (codename in `never`) → downstream agent → **approval-gated external send**
→ Chat Output. Run it: the secret is stripped on the wire, the send waits for a human, and the audit chain verifies.

## 4. Why a giant / Langflow can't just ship this

They all assume a **single owner** (one account, one tenant, steps are trusted). The boundary is enforced at **every
hop across owner boundaries** — to copy it, an incumbent has to give up the single-account lock-in that is its moat
(`docs/06 §4`, `docs/11 §2.5 f`). The builder is catch-up; this is the part they can't write without self-harm.

## 5. Pricing (1-pager — to be validated, not decided)

Two candidate meters; pick after GATE-1 puts a real buyer in front of it:

- **Per-seat** (simple, land-and-expand): per developer / per agent-author on the team. Easy to forecast, weak link to value.
- **Per-audited-run** (value-metered): charge per fenced cross-boundary run that produces an audit record. Tracks the
  thing they're buying (provable control), but needs the audit volume to be legible. **Recommended primary**, seat as floor.

Open-core split: firewall + passport + audit primitives are open (self-host, no per-seat tax on the builder); the paid
tier is **hosted audit retention + verification + team policy/preset management + SSO** — i.e. the *enterprise audit*
surface, not the flow-building.

## 6. Honest fences (no overclaim)

- 🔴 **GATE-1 is unchanged by packaging.** No non-giant has yet been *named* who will pay for a neutral, safe layer
  (`docs/06 §6.9 B`). Packaging makes it sellable; it does not prove demand. Interview in parallel.
- 🟡 `net`/`fs` are **declared + audited**, not sandbox-enforced yet (runner-side, future). The UI says so.
- 🟡 The `pass`-allowlist (vs `never`-blocklist) is meaningful only for structured payloads today.
- 🔵 True cross-party **authorization/identity** (OBO/DPoP · M5) is a *separate* North-Star axis (GATE-2) — the firewall
  is "**what** crosses", not "**who** you are". Do not conflate (`docs/11 §4`).

## 7. Code entry points

- `prototype/trust.mjs` — `CAP_VOCAB`, `normalizePassport`, `redact`, `auditAppend`/`auditVerify`, `sendMode`.
- `prototype/hub/hub.mjs` — `fenceEdge`/`advanceFrom` (per-edge), `fireMcpNode`/`runMcp` (`external_send`), `setPassport`, `/api/capvocab`, `/api/audit`.
- `prototype/hub/ui.html` — edge inspector (per-wire `never`), passport editor (caps dropdowns + Trust presets), `placeSafeHandoff()`.
