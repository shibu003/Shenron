# 10 — MCP Control Plane / AI が BuildHUD を操作する面

> ハンドオフ。**MCP-first**（feature は MCP tool/resource として先に出す）。BuildHUD 自体を **MCP server** として公開し、AI（Claude/Codex 等）が **agent / workflow を発見・配線・実行**できるようにする。
> 肝は **clean-mcp 流の token-light index**：全 workflow/agent を context に流し込まず、`search_*` が小さな ref を返し、`get_*` で必要な 1 件だけ load。= 本環境の deferred-tool / ToolSearch と同型。
> これ自体が capture 点（`06 §6.6/§6.7`）。実装は `prototype/mcp/`。

---

## 1. なぜ MCP-first・なぜ index

- **MCP-first**（user 方針）：REST/UI より先に MCP tool/resource で全機能を出す。AI が一級の操作者。
- **token 問題**：fleet が育つと agent/workflow が数百になる。全部を tool schema や resource で context に流すと**トークンが燃える**。clean-mcp の解＝**索引して検索、必要な物だけ展開**。
  - `search_agents("linkedin sales")` → 小さな ref 配列（id/name/company/skill/tags）だけ。
  - `get_agent(id)` → その 1 件の full Agent Card を on-demand。
  - workflow も同様（`search_workflows` → ref、`get_workflow` → 定義）。
- 効果：AI は「索引を検索 → 1 件 load → 実行」で、数百 agent でも**定数トークン**で操作。

---

## 2. Tools（MCP・read と act を分離）

| tool | 種別 | 入力 | 返り（token-light） |
|---|---|---|---|
| `search_agents` | read | `{query, limit?}` | `[{id,name,company,skillId,skill,tags}]` 小 ref |
| `get_agent` | read | `{id}` | full Agent Card（on-demand） |
| `search_workflows` | read | `{query, limit?}` | `[{id,name,summary,steps,tags}]` 小 ref |
| `get_workflow` | read | `{id}` | full 定義（steps/nodes/edges） |
| `search_automations` | read | `{query, limit?}` | `[{id,name,summary,trigger,workflow,enabled,tags}]` 小 ref |
| `get_automation` | read | `{id}` | full 定義（trigger / bound workflow / default input） |
| `build_state` | read | `{}` | IR の**要約**（counts / ids / attended-unattended）。全文でなく summary |
| `run_handoff` | **act** | `{toAgentId, skill, input, confirm?}` | 1 handoff 実行結果（A2A message/send） |
| `run_workflow` | **act** | `{id, input, confirm?}` | workflow 連鎖実行＋trace |
| `run_automation` | **act** | `{id, input?, confirm?}` | automation の bound workflow を fire＋trace |
| `fire_event` | **act** | `{event, input?, confirm?}` | build-state event に match した enabled automation を返す＋fire（**build-state を引き金に走らせる**核） |

- **read/act 分離**：act tool（`run_*`/`fire_event`）は trust gate を通す（cross-company は attended・M5）。read は自由。
- **二段 fence**：(1) 既定 attended（`confirm:true` or `--unattended` まで dry-run）、(2) 実行は `A2A_SHARED_TOKEN` 必須（無ければ network に出ず refuse）。
- **automation = trigger（`schedule`/`build_state`）に bind した workflow**。workflow が run-on-demand なのに対し、automation は event/schedule 起点。同じ token-light 索引・同じ generic searcher に載る。
  - `build_state` の `trigger.match` は **deep subset 一致**（nested object は再帰・array は位置・primitive は ===、no eval）。event が match を包含すれば fire（Claude #9 / Codex #3）。
- 返りは常に **ref 優先**（full は `get_*` のみ）＝ token-light の徹底。

## 3. Resources（読み取り）

- `buildhud://agents` — agent 索引（ref 一覧）
- `buildhud://workflows` — workflow 索引（ref 一覧）
- `buildhud://automations` — automation 索引（ref 一覧）
- `buildhud://state` — Build State IR 要約
（full は resource でなく `get_*` tool で取る＝索引と本体を分離）

## 4. Index の作り方

- source：`prototype/agents/*.json`（agent 定義）＋ `prototype/mcp/workflows.json`（named workflow）＋ `prototype/mcp/automations.json`（trigger-bound run）。将来は live registry（G4 agentgateway）も source に。
- 3 索引は **1 つの generic `searchIndex(items, toText, toRef, query, limit)`** を共有（per-index に重複コードを持たない＝「大きな部品」）。
- 索引フィールド：`name + company + skill.description + tags`（automation は `+ trigger.type + workflow`）を keyword 化（MVP は keyword スコア、後で embedding）。
- **本体は索引に入れない**：検索ヒット → id → `get_*` で本体 load。これが token 節約の核。

## 5. Transport / 規約

- stdio・**newline-delimited JSON-RPC 2.0**（MCP stdio）。stdout は JSON-RPC のみ（log は stderr）。
- handshake：`initialize` → `notifications/initialized` → `tools/list` / `tools/call` / `resources/*`。
- ⚠️ MCP の正確な version 文字列・schema は SDK / 仕様で要確認（本実装は最小・概形）。本番は `@modelcontextprotocol/sdk` 採用も可。

## 6. Fence / 安全

- act tool は **read-only でない**＝ 必ず trust gate（MVP: token+allowlist+attended、`07`/`09 M5`）。
- AI が勝手に cross-company dispatch しないよう、act は既定 **attended**（承認必須）。autonomous は明示 opt-in（`--unattended` / `BUILDHUD_UNATTENDED=1`）だが **automation 限定**：`run_automation`/`fire_event` の `enabled` automation のみ無人 fire、**ad-hoc な `run_handoff`/`run_workflow` は `--unattended` でも attended のまま**（恣意的 dispatch を無人化しない）。CI hook・cron 用の口。
- `A2A_SHARED_TOKEN` は **server→agent の到達 credential**（client 認可ではない）。無ければ network に出ず refuse、`enabled:false` は fire しない。本物の cross-party 認可（OBO/DPoP・M5）は未実装ゆえ `--unattended` は **信頼 client からのみ**。
- 索引・検索は token を燃やさない設計が目的。**full dump tool を作らない**（`get_*` で 1 件ずつ）。

## 7. 使い方（実装 `prototype/mcp/server.mjs`）

```jsonc
// .mcp.json / Claude Code 等の MCP 設定に：
{ "mcpServers": { "buildhud": {
    "command": "node",
    "args": ["prototype/mcp/server.mjs"],
    "env": { "A2A_SHARED_TOKEN": "..." } } } }
```
AI 側の典型フロー：`search_workflows("sales")` → `get_workflow("sales-to-marketing")` → `run_workflow("sales-to-marketing", "<brief>")`。索引検索で定数トークン、実行は A2A handoff。

---

## 8. capture との関係（`06 §6.6`）

relay/metering は gateway 勢が商品化済 → **この MCP control plane（索引＋オーケストレーション＋trust）が課金面の候補**。AI が BuildHUD 経由で fleet を操作する体験そのものを seat/per-workflow で売る。
