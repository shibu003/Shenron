---
name: shenron
description: Connect your OpenClaw agent to 神龍 (Shenron) — say a goal in plain language and it researches, plans, generates any missing tool, and runs an automation for you. Use when the user wants to "automate X", "watch a price", "summarize daily", "build a workflow", or asks for a tool that doesn't exist yet. Runs on your own Claude subscription ($0 by default).
---

# 神龍 (Shenron) — wish → flow

神龍 turns a plain-language wish into a runnable automation. It **discovers** the right services, **plans** the steps, **generates the tools it's missing**, runs with a per-edge approval fence, and can schedule it. It runs on *your* AI (your Claude subscription via `claude -p`, or your own API key) — **$0 by default**, paid tools only when you opt in.

This skill teaches you to drive 神龍 through its MCP tools. First connect the 神龍 MCP server (below), then use the core loop.

## 1. Connect the 神龍 MCP server

神龍 ships a zero-dependency stdio MCP server **and** a remote HTTP endpoint. Pick one:

**A — Self-host, local (full power: browser-control, local logins, $0 via your subscription)**
Clone https://github.com/<owner>/GioGio, then add the stdio server to OpenClaw. In `~/.openclaw/openclaw.json`:
```json
{ "mcp": { "servers": {
  "giogio": { "command": "node", "args": ["/abs/path/GioGio/prototype/mcp/server.mjs"], "transport": "stdio" }
} } }
```
(or `openclaw mcp add giogio --command node --arg /abs/path/GioGio/prototype/mcp/server.mjs` — exact flags: `openclaw mcp add --help`.)

**B — Remote / managed hub (no clone; runs 24/7; no browser-control)**
Point OpenClaw at a running 神龍 hub's `/mcp` endpoint:
```json
{ "mcp": { "servers": {
  "giogio": { "url": "https://<your-hub>/mcp", "transport": "streamable-http", "auth": "oauth" }
} } }
```
Managed hub needs your own `ANTHROPIC_API_KEY` (you pay your LLM, the host only runs compute). Login-based flows need path A.

## 2. Core loop

1. **Plan from a wish** — call `plan_flow` with the user's goal in natural language. 神龍 researches it and returns either a step plan, or `clarify` questions (e.g. "X / Instagram / TikTok?"), or `blockers` (e.g. ToS / paid-only). Answer clarifications by calling `plan_flow` again with the choices.
2. **Or start from a template** — call `list_templates`, then `install_template` with an id to save it as an editable workflow. Bundled, runnable-as-is: `price-watch`, `daily-summary`, `github-pr-notify` (also in `templates/` here).
3. **Run** — call `run_workflow` (saved flow) or `run_automation` (scheduled), with `confirm: true` to actually execute. Without `confirm` you get a dry-run plan.

### Example — price watch in three calls
```
install_template { id: "price-watch" }          → { workflowId: "wf_…" }
run_workflow     { id: "wf_…", input: "<product page text>; threshold 3000円", confirm: true }
→ "🟢 買い時" / "🔴 待ち"
```

## 3. Cost (budget-adaptive)

Default is **free / $0-marginal**: your Claude subscription via `claude -p`, free-tier APIs only, cheap steps optionally on local Ollama. Set `paid_ok` (via `set_config` or `plan_flow {cost:"paid_ok"}`) to allow paid tools — 神龍 always discloses cost first. Nothing is marked up; you bring your own AI.

## Prerequisite
The 神龍 MCP server must be connected (step 1) so `plan_flow` / `list_templates` / `install_template` / `run_workflow` / `run_automation` are available.
