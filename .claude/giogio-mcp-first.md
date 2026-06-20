🐉 神龍 (GioGio) MCP-FIRST 北極星 — 常時駐在ディレクティブ

全機能を MCP だけで完結できること（web cockpit 無しで全ライフサイクルが回る）。
- web cockpit (prototype/hub/ui.html) 専用の機能を作らない。
- 新機能を足したら必ず対応する MCP tool も同時に prototype/mcp/server.mjs に出す
  — plan / generate / approve / permission / run / skill すべて MCP client から呼べる状態を維持。
- cockpit は MCP の上の薄い view に留める（MCP が真のコントロールプレーン・Langflow 独立と整合）。
- 北極星に反する変更（cockpit-only な穴）を作りそうになったら止めて、MCP tool 化を同 commit で行う。
