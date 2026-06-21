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

---

## 9. 現状アップデート（2026-06・神龍 + 登録だけで動く）

§2 の素の tools に加え、神龍（wish→flow）と self-extension の tool が `prototype/mcp/server.mjs` に載っている:
- `plan_flow {goal, save?, gap?}` — 願い→plan IR。`gap='off'|'ask'|'auto'`（既定 ask）で「足りない道具を作る枝」を選ぶ。
- `gen_component {what}` / `list_components` / `approve_component {id}` — 足りない道具を生成→検証→承認で integration 化（ladder rejoin）。
- `get_permissions` / `set_permission {tool, domain?}` — browser-control の allow/ask/deny（「常に許可」の書込）。
- `make_skill {id}` — 保存済み workflow → Claude Code SKILL.md。
- computer-use の3段階承認は `approve_handoff`/`decline_handoff`（checkpoint も同 route）・`get_handoff` で checkpoint(label/screenshot) を確認。

**登録だけで動く（実装済）**: MCP server 起動時に local hub を自動起動（detached・既存は再利用）。hub は browser-control handoff が来たら worker をオンデマンド spawn。＝ユーザーは **MCP を登録するだけ**・`node hub.mjs`/`browser-worker.mjs` を手で起動不要。computer-use のログインは永続 profile(`~/.giogio/browser-profile`)で持続。**LLM は各ユーザーの `claude -p`（本人の Claude サブスク・従量 API なし）**＝原価0で各自のプランに乗る（クラウド他人ホスト時のみ Anthropic API へ差し替え）。

---

## 10. Wave: MCP self-contained（cockpit 無しで使い切る）

**Context**: 今は plan 確認 / フロー俯瞰 / 3段階承認に web cockpit を開く前提が残る。MCP client（Claude Code / claude.ai）**だけ**で完結させる＝買い手が cockpit 無しで「願い→plan 確認→実行→送信承認」を回せる。全部サブスク（`claude -p`）で動き原価0のまま。

- **② フロー図を返す（着手点）**: `plan_flow` の返りに **Mermaid + ASCII のフロー図**を足す（nodes/edges から生成）。CLI/Claude がそのまま描画＝構成が一目。返り例 `{..., diagram_mermaid, diagram_ascii}`。
- **① 読みやすい plan 確認**: 返りに人間可読の plain 要約（step・解決先/gap・図）を含め、client が「これで実行？」と確認してから `run_workflow`。`plan_flow` は design-only（実行しない）を維持＝確認の自然な間。
- **③ 3段階承認を CLI で**: computer-use の checkpoint を MCP で完結。client は `list_handoffs {status:'awaiting_approval'}` → `get_handoff` で label/screenshot を提示 → 人に確認 → `approve_handoff`/`decline_handoff`。「常に許可」は `set_permission`。cockpit を開かない。

**検証**: MCP 経由で wish→`plan_flow`(図付き)→確認→`run_workflow`→(browser なら)`get_handoff` で checkpoint を見て `approve_handoff`、を cockpit を開かずに通す。

**着手順**: ② フロー図 → ① 確認整形 → ③ checkpoint CLI 導線。

---

## 11. 技術設計 & ロードマップ（living・claude.ai 実評価 driven）

> 2026-06、claude.ai で実 MCP テスト → 設計ミスマッチが判明。以後 wave をここに追記していく。各 wave = 問題 → 設計 → 触る → 検証。

### 設計の前提（architecture principles・コード接地）
1. **ツールの出どころ = 3つ**: giogio の `integrations.json` ＋ 生成(`gen_component`) ＋ **computer-use(browser-control)**。**クライアント接続(claude.ai の Gmail 等)は MCP 仕様上 giogio から見えない**（hub.mjs の plan は `readIntegrations()` のみ参照）。Gmail を使わせたい→ giogio に登録 or ブラウザ操作 or 道具生成。
2. **データはノード間で流れている**: `run.outputs[node]` → `fenceEdge`(per-edge redact) → 下流 `fireNode` 入力（hub.mjs `advanceFrom`/`fenceEdge`/`advanceRun`）。「直 Claude 感」はツール未解決でフローが汎用ノードに退化しただけ＝配管は健全。
3. **LLM = 各ユーザーの `claude -p`**（本人の Claude サブスク・従量 API 0）。クラウドで他人をホストする時のみ Anthropic API（`runner.mjs` 差し替え・host/BYO key）。
4. **2つの MCP 面**: `server.mjs`(stdio・`/api` 委譲・real plan) と **hub 内蔵 remote MCP**(`mcpDispatch`＋`/mcp/sse`＋OAuth＋bearer)。claude.ai は後者に接続し、その `plan_flow` は `available`(在庫) のみ返す＝前者の real plan と挙動差 → 統一が要る（Wave B）。

### Wave B — tool-awareness（最優先・最小で効く）
- **問題**: `available.tools` に登録外の MCP(Gmail 等)が出ない → 「直 Claude」感。
- **設計**: ① `add_integration {id,label,kind,command|url,tools}` MCP tool（既存 `POST /api/integrations`＝`saveIntegration` の薄ラッパ）で自分の MCP を giogio に登録。② `available` に **browser-control(API 無し＝computer-use)** と **生成済み道具** を明示。③ hub 内蔵 remote-MCP の `plan_flow` を `server.mjs` と同じ real plan に統一。④ 返り/doc に「client 接続は見えない・登録 or browser で解決」を正直に明記。
- **触る**: `server.mjs`(add_integration tool・list 拡張)／`hub.mjs`(plan_flow 統一・available 拡張)。
- **検証**: `add_integration` → `plan_flow` の available に出る → flow が gap でなく実 mcp node に解決。

### Wave A — MCP self-contained（§10）
② `plan_flow` 返りに **Mermaid+ASCII 図** → ① 人間可読の plan 要約で確認 → ③ checkpoint を `list_handoffs{status:awaiting_approval}`→`get_handoff`→`approve_handoff`/`decline_handoff` で CLI 承認。cockpit 不要。

### Wave C — HTTP/クラウド到達性（cloud/sell・Docker は remote-mcp branch で着手中・§15）
- **問題**: Artifact/CLI から `run_workflow` を叩けない（localhost 不達・応答 CORS 無し）。
- **設計**: ① `json()` 応答に CORS ヘッダ（今は OPTIONS preflight のみ）。② `/api/runflow` 等 act route にトークン認証（今 open）。③ Docker でクラウド公開 → 公開 URL → 別 origin の fetch から実行可。④ クラウド時のみ LLM を Anthropic API に差し替え。
- **触る**: `hub.mjs`(CORS＋auth)／`Dockerfile`／`runner.mjs`(cloud API path)。
- **検証**: 公開 URL の `/api/runflow` を別 origin の fetch から叩き、保存済み workflow をボタン一発実行。

### Wave D — 管理 polish（低）
- `list_workflows`/`search_workflows` 返りに **summary + 最終実行時刻**（`state.runs` を `flowId` で scan＝workflow→run の逆引きは未実装）。data-piping は Wave B でツール解決後に顕在化する旨も明記。
- **触る**: `server.mjs`(返りに lastRun)／`hub.mjs`(lastRun 導出 helper)。

### Wave E — discover-first + scheduler（claude.ai mobile 実機 red-team driven・出荷済）
- **discover-first（3d3b799）**: 願い→plan 前に必ず研究→曖昧/地雷なら `clarify` を返し user に確認→`context.choices` で再 plan。検索は BYO AI 任せ（M1・従量0）。地雷(API無/ToS/許可/法/scheduling)も surface。[[shenron-northstar]] の「発見」本体。
- **gen_component 修正（1db92d2）**: remote-MCP の vendor 既定 'stub'→'claude'（claude.ai 経由で必ず crash していた）+ vendor 不在 fail-fast。
- **in-hub scheduler（663e9d1）+ robustness（本 Wave）**: cron(`cronMatch`)で schedule automation を発火。**catch-up**（`lastDue`+`schedule-state.json` 永続・downtime の取りこぼしを次 boot で追い発火・first-sight は baseline）。`POST /api/tick`（無料外部 cron seam）。`add_automation` MCP tool。⚠️ honest limit: hub 起動中のみ→`SHENRON_NO_SCHEDULER=1` で off・saveAutomation/state/planner が「スマホ常駐無しは不可→Apps Script/常駐箱」と正直に出す。設計詳細(常駐箱/pmset+launchd/外部trigger)は docs/15。

### Wave F — サービス化 / デプロイ設計（接地済み・実装は方針決定後）= **docs/16**
神龍を「サービス」として出す設計を web 検索で接地。核心: **compute は売らない、control plane を売る**（hub をホストすると 従量0＋ローカル・クレデンシャルの堀が死ぬ）。
- **デプロイ**: 安い常駐箱（Pi5=hub最安/Mac mini M4=hub+ローカルLLM 唯一実用）。LLM は claude -p ≫ Ollama（Ollama は planner 不可・cheap sub-step のみ・"local 検索"も実はクラウド）。
- **配布先**: OpenClaw（MIT・ローカル・BYO-key・MCP client・~380k★）に神龍を MCP server として挿す。Claude Code/claude.ai/Cursor も同様。
- **マネタイズ**: BYOK flat-fee / open-core control-plane / governance-marketplace（神龍の trust receipt/passport/audit が governance に効く）。
- **cost 設定（出荷済み）**: `plan_flow {cost:'free'|'paid_ok'}` を discover が honor。
- 未確定（user 判断）: マネタイズ軸 / OpenClaw 統合深度 / 常駐箱 one-click 化 / Ollama tiering。

### 着手順
**B(tool-awareness) → A②(図) → C(クラウド到達) → D(polish) → E(discover+scheduler) → F(service/deploy 設計=docs/16)**。E/F は claude.ai 実機評価で実需が判明して追加。F は設計のみ＝実装は user の方針決定後。
