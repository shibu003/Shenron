# 神龍 (Shenron) — a ClawHub skill for OpenClaw

**Your OpenClaw agent learns to build the tool it's missing — and run it.**

Most automation tools only wire together services that already exist. 神龍 is different: when a step needs a tool nobody built, it **generates the code**, sandboxes it until it converges, and runs it behind an approval fence. You say the wish in plain language; 神龍 researches, plans, fills the gaps, and schedules it.

- **$0 by default** — runs on *your* Claude subscription (`claude -p`) or your own API key. No token markup.
- **Your machine, your logins** — self-host for browser-control and credential-backed flows, or use a remote hub for 24/7 without a box.
- **Honest about cost & ToS** — free path always offered; paid tools and platform-automation risks are surfaced, not hidden.

## Install
```
clawhub skill install shenron
```
Then connect the 神龍 MCP server and use the core loop — see `SKILL.md`.

## What's in here
- `SKILL.md` — teaches your agent to connect 神龍 and drive it (`plan_flow` → `install_template` → `run_workflow`).
- `templates/` — three runnable starter flows (`price-watch`, `daily-summary`, `github-pr-notify`). Install with `install_template`.

## Source
神龍 lives in the GioGio project. The MCP server is dependency-free (`prototype/mcp/server.mjs`, stdio) and also exposes a remote `/mcp` (streamable-http). OpenClaw, Claude Code, claude.ai, ChatGPT, Cursor all connect as MCP clients.
