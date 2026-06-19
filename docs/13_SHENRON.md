# 13. 神龍 (Shenron) — wish → flow

> 願いを言うと叶える龍。ユーザーが自然文でゴールを言うと、神龍が flow を考え、不足ツールの開発まで提案し、実行する。
> status: **設計確定・実装は次セッション**（2026-06-19）／実装単位＝Wave（agile・WIP=1）

---

## 0. Context（なぜ作るか）

**ユーザーの問題（核心）**: 「**何を**自動化したいか」も「**どう**自動化すればいいか」も分からない。Langflow は "組み方を知っている人" のツールで、その前段（**発見＋設計**）が丸ごと空白。

**神龍の体験**:
```
ユーザー: 「毎週月曜にチームの進捗レポートを Slack に投稿したい」
  ↓ /api/shenron/plan
神龍: こういう flow はどうですか?
      [GitHub 週次コミット収集] → [LLM 要約] → [Slack #weekly 投稿]
      必要な外部ツール: GitHub API・Slack Webhook（両方無料）
      不足ノード: GitHub コミット収集（未実装）→ コード stub を生成しました
      推定コスト: 〜$0.02/回・約 1,200 tokens
  ↓ [編集 / 対話修正] → [実行]
  ↓ /api/langflow/import → /api/langflow/run
cockpit に全ノード描画 → 実行 → Slack に投稿 → audit 記録
```

**なぜ Langflow の上に乗るか（3 理由）**:
1. **コンポーネントライブラリ（100+ ノード）を再発明しない** — プランナーは参照するだけ
2. **実行エンジンを書かない** — `langflowImport`+`langflowRun` 完成済、生成は Langflow JSON を吐くだけ
3. **GioGio の価値＝計画＋信頼レイヤー** — Langflow が持たない部分だけ作る。実行の再発明は巨人と正面戦＝自殺（→ `docs/giant-war`）

---

## 1. 決定事項（user 確認済 2026-06-19）

| 論点 | 決定 |
|------|------|
| 完結の定義 | **段階的**: v1=プラン層で完結（ハイブリッド）→ **北極星=全ノード描画パリティ**。神龍生成 flow は描画可能ノード限定で **100% 透明**、exotic は 🔗 fence のまま委譲、描画カバレッジは Wave ごとに拡大 |
| 外部発見 | **外部 search MCP 採用**（Tavily/Brave/MCP registry を integrations 登録 → 既存 `mcp-client` で呼ぶ。auth は各 server に乗る＝adopt） |
| 不足ノード | **A 通知 ＋ B コード生成 両方**・設定 `on_missing_node:["notify","generate_code"]` で切替 |
| 編集 | **ステップ編集 ＋ 対話修正 両方** |
| トークンコスト | plan 実行前の概算（user「最後に考える」＝Wave 7） |
| skill 自動発動 | 神龍を MCP tool 露出 → MCP control plane から発火（GioGio 完結） |

---

## 2. アーキテクチャ全体図

```
                          ┌─────────────────────────────────────────┐
   自然文 goal ──POST──▶  │  shenron.mjs  (新規・プランナー)          │
   /api/shenron/plan      │                                          │
                          │  ① intent parse   (LLM pass 1)           │
                          │  ② capability resolve ← 内部 index ───────┼──▶ publicAgents()
                          │       (agents / workflows / integrations)│    readIntegrations()
                          │  ③ gap detect → missing[]                │    workflows.json
                          │  ④ external search (Wave 2) ─────────────┼──▶ callMcpTool(tavily,…)
                          │  ⑤ flow synth → nodes/edges              │    validateFlow()/layoutFlow()
                          │  ⑥ missing → code stub (Wave 4)          │    runVendorAsync()
                          │  ⑦ plain summary + estimate              │
                          └───────────────┬──────────────────────────┘
                                          │ plan IR (JSON)
                          ┌───────────────▼──────────────────────────┐
   plan IR ──POST──▶      │  toLangflowFlow(planIR)  (Wave 3)         │  ← importLangflowFlow の逆
   /api/shenron/build     │  gio kind → Langflow component type       │    LF_KIND 逆引き
                          └───────────────┬──────────────────────────┘
                                          │ Langflow flow JSON
                            POST /api/langflow/import (既存・langflow.mjs)
                                          │ flowId
                          ┌───────────────▼──────────────────────────┐
                          │  cockpit (ui.html) loadFlow → 全描画       │  ← 描画可能 kind 限定 = 🔗 無し
                          │  [編集 Wave5] [実行 Wave6]                │
                          └───────────────┬──────────────────────────┘
                            POST /api/langflow/run (既存) → 出力 + audit hash-chain
```

**fence は全ホップ強制**（既存 `trust.mjs`）: 外部 search・生成 flow・実行 = `redact` + passport + `auditAppend`。

---

## 3. 既存資産マップ（再利用 — signature 付き）

| 資産 | 場所 | signature / 形 | 神龍での役割 |
|------|------|----------------|-------------|
| `llmFlow(prompt)` | `hub.mjs:621-632` | `async (string) → {nodes, edges, agentDraft}`。sys に AGENTS/TOOLS index 注入 → `runVendorAsync` → JSON parse | プランナー土台。**拡張**（plan IR 化・multi-pass） |
| `ghostwrite({prompt})` | `hub.mjs:634-642` | LLM→heuristic フォールバック→backfill skill→validate→layout | 神龍 plan の参照実装 |
| `heuristicFlow`/`matchMcpTool`/`matchTrigger` | `hub.mjs:597-620` | regex で MCP tool / trigger 推定 | LLM 不在時のフォールバック |
| `validateFlow(nodes,edges)` | `hub.mjs:560-583` | port 型検証（`source.emits ∩ target.accepts ≠ ∅`）→ `{edges, warnings}` | 生成 flow の port 検証 |
| `layoutFlow(nodes,edges)` | `hub.mjs:560-583` | 座標自動配置 | 生成 flow の配置 |
| `runVendorAsync(vendor,prompt,stub)` | `runner.mjs:8-38` | CLI spawn（claude/codex/stub）→ text。`--timeout 180000` | プランナーの LLM 呼び出し |
| `langflowImport(audit,{host,flow,key},fetch)` | `langflow.mjs:50-67` | POST `{host}/api/v1/flows/` payload `{name,description,data:{nodes,edges},endpoint_name}` → `{flowId,name}`。**JSON verbatim・型 100% 保持** | 生成 flow を Langflow 登録 |
| `langflowRun(audit,{host,flowId,input,key},fetch)` | `langflow.mjs:29-43` | input を `redact` → POST `{host}/api/v1/run/{flowId}` → `{flowId,status,output,redacted}` | 生成 flow 実行（fence 済） |
| `lfRunText(out)` / `lfRunBody(input)` | `langflow.mjs:8-25` | Langflow 応答の nested text 抽出 / `{input_value,output_type,input_type}` | 実行結果の整形 |
| `importLangflowFlow(lf)` + `LF_KIND` + `lfVal` | `ui.html:1604-1634` | Langflow JSON → cockpit nodes。`LF_KIND`={ChatInput:'input',Prompt:'prompt',…} | **逆向き**＝plan→Langflow JSON 変換の写像元 |
| `loadFlow({nodes,edges})`/`render()`/`renderNodes()`/`inlineField()` | `ui.html` | cockpit 描画 | 神龍 flow の表示・編集 |
| `callMcpTool(integ,tool,args,opts)` | `mcp/mcp-client.mjs:101` | stdio(spawn)/http。handshake `initialize→initialized→tools/call` → text | 外部 search MCP 呼び出し |
| `readIntegrations()` | `hub.mjs` / `mcp/integrations.json` | `[{id,label,kind,command?,url?,enabled,tools:[{name,accepts,emits}]}]` | search MCP 登録・列挙 |
| `searchIntegrationsRefs(q)` | `hub.mjs:476-482` | token-light keyword scorer | 内部ツール解決 |
| `publicAgents()` | `hub.mjs` | `[{id,skill,company,accepts,emits}]` | agent index 解決 |
| `redact(text)` | `trust.mjs:10-32` | `→ {text, removed[]}`。secret/PII/env + per-agent never | プランナー外部呼び出し・実行 fence |
| passport `{caps:{net,fs,external_send,secrets},share:{never,pass}}` | `trust.mjs:52-65` | capability | 外部 search の net cap 強制 |
| `auditAppend(audit,entry)`/`auditVerify` | `trust.mjs` | hash-chain tamper-evident | 全ホップ記録 |
| MCP server tools | `mcp/server.mjs` | `search_*`/`run_workflow`/`fire_event` + two-stage fence `shouldExec`+`assertToken` | 神龍を MCP tool 露出 |
| `deepMatch`/`triggerMatches` | `match.mjs:10-16` | build-state event 照合 | trigger 付き plan |

**新規ファイル**: `prototype/hub/shenron.mjs` のみ。他は既存への route 追加・関数拡張。

---

## 4. plan IR スキーマ（最終形）

```jsonc
{
  "goal": "毎週月曜にチーム進捗を Slack 投稿",
  "plain_summary": "毎週月曜 9:00、GitHub の先週コミットを集めて要約し #weekly に投稿します。",
  "trigger": { "type": "schedule", "when": "0 9 * * 1" },   // または build_state / null(手動)
  "steps": [
    { "n": 1, "action": "GitHub の先週コミットを収集", "node_kind": "mcp",
      "tool": { "server": "github", "tool": "list_commits" }, "why": "進捗の素データ",
      "inputs": ["repo"], "outputs": ["commits[]"] },
    { "n": 2, "action": "コミットを要約", "node_kind": "prompt",
      "config": { "template": "次のコミットを3行で要約: {input}" }, "outputs": ["summary"] },
    { "n": 3, "action": "Slack #weekly に投稿", "node_kind": "mcp",
      "tool": { "server": "slack", "tool": "post_message" }, "inputs": ["channel","text"] }
  ],
  "tools_needed": [
    { "name": "github.list_commits", "kind": "mcp", "have": false, "source": "external",
      "ref": "https://github.com/.../github-mcp" },
    { "name": "slack.post_message", "kind": "mcp", "have": true, "source": "integration", "ref": "slack" }
  ],
  "missing": [
    { "what": "GitHub コミット収集ノード", "kind": "langflow_component",
      "suggestion": "GitHub MCP を integrations 登録、または custom component",
      "code_stub": "<Wave 4 で Python class stub>" }
  ],
  "nodes": [ /* validateFlow/layoutFlow 通過済・描画可能 kind 限定 */ ],
  "edges": [ /* port 型整合済 */ ],
  "estimate": { "tokens": 1200, "cost_usd": 0.018, "per_run": true },   // Wave 7
  "warnings": [],
  "source": "llm"   // llm | heuristic
}
```

---

## 5. Wave ごと技術設計

> 各 Wave: **目的 / v1 最小 / 最終形（最大実装） / 使う既存 / 新規 / contract / fence / 検証**。
> ⚠️ 並列セッションが同 working tree（`ui.html`/`hub.mjs`）を触る → commit 前 `git status --short` 必須・safe-commit・mine-only staging。

### Wave 1 — 神龍 plan endpoint（MVP・最重要）

**目的**: 自然文ゴール → plan IR を返す。まだ実行しない（plan 価値を先に検証＝YAGNI）。

**v1 最小**: `shenron.mjs` に `plan({goal})`。`llmFlow` を 1-pass で流用し、出力を plan IR の `{goal, steps, plain_summary, nodes, edges}` に整形。`tools_needed`/`missing` は内部 index の有無判定のみ。

**最終形（最大実装）**: **multi-pass プランナー**。
1. **intent parse**（LLM pass 1）: goal → `{trigger?, data_sources[], transforms[], outputs[]}` の構造化 intent。few-shot 例ライブラリ付き。
2. **capability resolve**（コード）: 各 intent step を内部 index に照合 — `publicAgents()`・`searchIntegrationsRefs()`・workflows.json。have/source を確定。
3. **gap detect**: 解決不能な step → `missing[]`。
4. **flow synth**（LLM pass 2 or rule）: steps → nodes/edges。`validateFlow`+`layoutFlow`。port 不整合は warning。
5. **self-critique pass**（LLM pass 3）: 生成 plan を LLM が見直し「抜け・危険・無駄」を指摘 → 修正（user の 3-pass loop 哲学を機械化）。
6. **plain summary + estimate**: 自然文化＋token 概算（Wave 7）。
- planner memory: 過去の採用 plan を few-shot に回す（学習）。

**使う既存**: `llmFlow` の index 注入パターン・`runVendorAsync(EXEC_VENDOR||'claude', sys, '')`・`validateFlow`/`layoutFlow`・`publicAgents`/`readIntegrations`。

**新規**: `shenron.mjs`（`plan()`・intent schema・few-shot 例）。`hub.mjs` に route。

**contract**: `POST /api/shenron/plan {goal, context?}` → plan IR。**read-only・実行しない**。

**fence**: LLM 呼び出しのみ（外部 egress 無し）。goal は `redact` してから log。

**検証**: `curl POST /api/shenron/plan {goal:"毎週月曜にチーム進捗を Slack 投稿"}` → steps≥3・plain_summary・tools_needed の have 判定。`test_shenron.mjs`（intent parse・gap detect・port 整合の assert）。

---

### Wave 2 — 外部発見（search MCP）

**目的**: 内部 index に無いツールを外部から発見＝「ユーザーが知らないツール」提案。

**v1 最小**: Tavily search MCP を 1 個 `integrations.json` 登録。gap がある時だけ `callMcpTool` で query → 結果を LLM が `tools_needed[].source:'external'` に変換。

**最終形（最大実装）**: **多 backend 発見**。
- search backend 複数: Tavily（web）＋ **MCP registry**（Smithery/Glama の MCP server カタログを引いて「この機能の MCP server あります」を提案）＋ Langflow component カタログ照合。
- ranking + dedup + キャッシュ（同 query を再呼びしない＝`@lru`-相当の JSONL キャッシュ）。
- 発見した MCP server を **そのまま integrations 登録候補**として提示（ワンクリック adopt → Wave 4 と連結）。
- 「外部ツール提案」を plain_summary に自然文で織り込む。

**使う既存**: `callMcpTool(integ,'search',{query})`（mcp-client）・`readIntegrations`・`redact`・`auditAppend`。

**新規**: `shenron.mjs` に `discover(gap)`。`integrations.json` に search entry。settings `planner.search_enabled`/`search_integration`。

**contract**: plan IR に `tools_needed[].source:'external'`＋`ref`（URL/MCP server id）。`/api/planner/config` GET/POST で on/off。

**fence**: 外部呼び出し前に **passport net cap 確認**・`redact(query)`（goal の secret を外部検索に流さない）・`auditAppend('external-search',{egress:true,removed})`。

**⚠️ gap**: search MCP は user の API key 必要（bring-your-own・Tavily 無料枠あり）。key 未設定なら `search_enabled=false` に **graceful fallback**（内部 index のみ）。

**検証**: key 設定 → 「PDF を要約して Notion に保存」→ 外部に Notion/PDF ツール提案・audit に egress 記録。key 無し → 内部のみで完走（no throw）。

---

### Wave 3 — plan → Langflow flow JSON ＋ cockpit 表示

**目的**: plan を Langflow flow にして cockpit に出す。

**v1 最小**: `toLangflowFlow(planIR)` ＝ `importLangflowFlow` の逆。描画可能 kind（input/prompt/languagemodel/output/structured）限定で Langflow JSON 生成 → `/api/langflow/import` → cockpit。**🔗 が出ない＝100% 透明**（ハイブリッド方針）。

**最終形（最大実装）**: **full-fidelity 双方向変換**。
- gio kind → Langflow component type 逆引き（`input→ChatInput`, `prompt→Prompt`, `languagemodel→{OpenAIModel|AnthropicModel}`(provider 別), `output→ChatOutput`, `structured→StructuredOutput`）。
- 各 node の `data.node.template` を **完全な Langflow template 形**で組む: 全 field（`model_name`, `temperature`, `system_message`, `output_schema`…）・`outputs`・`base_classes`。
- edges を **typed handle 形**で: `data.sourceHandle.output_types`・`targetHandle.{inputTypes,fieldName}`。`isValidConnection`（型集合の交差）を満たす。
- 座標は Langflow の spacing に合わせ auto-layout（import の `S=0.55` 正規化の逆）。
- **round-trip safe**: import → 編集 → export が一致（神龍生成 → Langflow → 再 import で形が壊れない）。
- exotic ツール（外部 MCP node 等）は 🔗 として混在許容しつつ、可能な限り描画可能 kind に落とす。

**使う既存**: `LF_KIND`（逆引き表を起こす）・`langflowImport`・`loadFlow`/`render`。

**新規**: `shenron.mjs` に `toLangflowFlow()`。`hub.mjs` に `POST /api/shenron/build`。

**contract**: `POST /api/shenron/build {plan}` → `{flowId, flow}` → cockpit `loadFlow`。

**fence**: `langflowImport` は自分の Langflow への登録＝redact 不要（既存方針）。生成 flow は audit に `langflow-import` 記録。

**検証**: plan → build → cockpit に全ノード描画・🔗 ゼロ・port 線が型整合。round-trip（build→import→build）で nodes/edges 数一致。

---

### Wave 4 — 不足ノード A 通知 ＋ B コード生成

**目的**: plan が未対応ツール/ノードを要求した時の埋め方。

**v1 最小**: (A) `missing[]` を cockpit に「⚠️ 未実装」カードで表示。(B) Langflow custom component の **Python class stub を LLM 生成**して `missing[].code_stub` に載せる（**auto-install しない＝安全**）。

**最終形（最大実装）**: **発見 → 生成 → 検証 → 登録 → 組込の自動連結**。
1. (A) 通知＋(B) コード生成は設定 `on_missing_node` で順序/有無切替。
2. B のコードを Langflow `/api/v1/custom_component`（validate endpoint）に投げて **構文・型検証**。
3. 通れば **自動登録** → integrations/flow に組込（v1 では手動・v2 で自動）。
4. **テストも生成**（custom component の最小 self-check）。
5. Wave 2 の MCP registry 発見と連結: 「自作より既存 MCP server あります」を優先提案 → adopt で済むなら code 生成しない（ladder: 既存 > 自作）。

**B が生成する Langflow custom component の形**:
```python
from langflow.custom import Component
from langflow.io import MessageTextInput, Output
from langflow.schema.message import Message
class GitHubCommits(Component):
    display_name = "GitHub Commits"
    description = "List commits in a date range"
    inputs = [MessageTextInput(name="repo", display_name="Repo")]
    outputs = [Output(name="commits", display_name="Commits", method="build")]
    def build(self) -> Message: ...   # ← LLM が実装、要レビュー
```

**使う既存**: `runVendorAsync`（コード生成）・`importLangflowFlow`（生成 component を含む flow 描画）。

**新規**: `shenron.mjs` に `genComponent(missingItem)`。settings `on_missing_node`。

**contract**: plan IR `missing[].code_stub`。`/api/shenron/gen-component {what}` → `{code, test}`。

**fence**: 生成コードは **実行しない**（提示のみ）。auto-install は v2・approval gate 必須。

**⚠️ gap（最大未知）**: 有効な Langflow custom component 生成は難。v1 は **stub＋通知まで**、検証・自動登録は v2。3 日 stuck したら scope 落とし候補筆頭。

**検証**: 存在しないツールを要求する goal → A 通知カード＋B コード stub 表示。生成コードを手動で Langflow に貼って起動（手動 e2e）。

---

### Wave 5 — 対話修正 ＋ ステップ編集

**目的**: plan を人が触れる。

**v1 最小**: (a) plan steps を UI で編集（既存 inline 編集導線）。(b) 「Slack じゃなくメールに」を投げると `plan({goal, context:{prev_plan, instruction}})` で再生成。

**最終形（最大実装）**:
- **多ターン対話**: 会話履歴を保持し、差分指示を積み上げ（「やっぱり毎日に」「要約は5行で」）。
- **step DnD 編集**: ノード追加/削除/並べ替え → flow 即再 synth・port 再検証。
- **undo/redo** ＋ **plan version 管理**（過去 plan に戻れる）。
- **「なぜこの設計?」説明生成**: 各 step の理由を on-demand で LLM 説明。
- 編集は差分適用（全再生成しない＝該当ノードだけ差し替え）。

**使う既存**: ghostwrite UI 導線・`loadFlow`・`validateFlow`/`layoutFlow`。

**新規**: `shenron.mjs` の `plan()` に `context.{prev_plan,instruction}` 分岐。UI に神龍パネル（goal 入力・plan ビュー・編集・実行）。

**contract**: `POST /api/shenron/plan {goal, context:{prev_plan, instruction}}` → 差分適用 plan IR。

**fence**: 同 Wave 1。

**検証**: 「Slack→メール」修正 → 該当 mcp node だけ差し替わり他 step 維持。多ターンで段階修正が積み上がる。

---

### Wave 6 — 実行

**目的**: plan を走らせる。

**v1 最小**: 「実行」ボタン → 描画可能 flow は **native run**（hub の DAG executor）、exotic 含むなら `/api/langflow/run`（既存）。神龍 flow は Wave 3 で描画可能限定生成なので native 可。

**最終形（最大実装）**:
- **二系統実行**: native preview（速い・model fidelity 低）と Langflow 委譲（真の model/temperature fidelity）を settings で選択。
- **scheduled 実行**: 既存 Trigger.dev seam（`mcp/trigger/`）に神龍 flow を乗せ cron 定期 run。
- **batch run**: plan を N 入力で一括実行（Langflow run を並列）。
- **run history + cost tracking**: run ごと tokens/cost/latency を JSONL 蓄積 → flow カードに「今月 $X / N runs」。
- 全実行は既存 fence: per-edge firewall・passport・approval gate・audit hash-chain 継続。

**使う既存**: hub DAG executor（`advanceFrom`/`firePromptNode`/`fireMcpNode`）・`langflowRun`・approval gate・Trigger.dev seam。

**新規**: 実行導線への配線のみ（神龍 flowId → run）。

**contract**: 既存 `/api/langflow/run {host,flowId,input,key}` → `{flowId,status,output,redacted}`。

**fence**: 既存全ホップ強制。外部送信前 passport `external_send` check・redact・audit。

**検証**: plan → 実行 → 出力＋audit に `langflow-run`/redact 記録・hash-chain `auditVerify` ok。Langflow down → graceful error。

---

### Wave 7 — トークンコスト概算（deferred・user「最後に考える」）

**目的**: plan 実行前に「いくらかかるか」を出す。

**最終形**: 各 node の想定 token（template 長・想定 LLM 呼び出し回数）から概算。`estimate:{tokens,cost_usd,per_run}` を plan IR に。model 別単価表。batch なら ×N。実 run 後に実績で補正（学習）。

**使う既存**: plan IR の nodes・model 情報。

**検証**: plan に estimate が出る・実 run 実績と概算が ±30% 以内。

---

### 並行トラック（北極星＝全描画パリティ #2 への前進）

描画パリティ拡大は**連続 backlog**（Wave とは独立に毎回少しずつ）:
- 各 commit で `LF_KIND` カバレッジ＋`COMP` field widget を 1〜2 個追加（temperature・top_p・full schema・provider variant…）。
- 最終: Langflow の全 component 型を cockpit で描画・編集可能（exotic 🔗 をゼロに）。React Flow 級の handle 描画が要る領域は別途判断。
- **完全パリティは目標であり v1 ゲートではない**。神龍の価値は plan 層で先に立つ。

---

## 6. 横断設計

### MCP 露出（skill 自動発動）
`mcp/server.mjs` に tool 追加:
- `plan_flow {goal}` → plan IR（read-only）
- `build_flow {plan}` → `{flowId}`（two-stage fence: `shouldExec(confirm)` + `assertToken`）
MCP control plane（`run_workflow`/`fire_event`）から神龍を発火 → build-state event で「自動で flow を考えて実行」まで無人化可能（`--unattended`＋token の二段 fence）。＝GioGio 完結。

### settings（`state.planner`）
```jsonc
{
  "planner": {
    "knowledge": "full" | "internal",          // 外部 search 使うか
    "search_enabled": true,
    "search_integration": "tavily",
    "on_missing_node": ["notify", "generate_code"],  // 順序・有無
    "exec_mode": "native" | "langflow",          // Wave 6
    "vendor": "claude"                            // プランナー LLM
  }
}
```
`/api/planner/config` GET/POST。hub state に保存（既存 settings 機構に追従）。

### trust / fence（全 Wave 共通）
- プランナー LLM 呼び出し: goal を `redact` してから log。
- 外部 search: passport net cap・`redact(query)`・`auditAppend(egress:true)`。
- 生成 flow 登録/実行: 既存 per-edge firewall・passport・approval・hash-chain audit。
- 生成コード: 実行しない（提示のみ・auto-install は v2 approval gate）。

---

## 7. Critical files

- **新規**: `prototype/hub/shenron.mjs`（plan IR プランナー・intent/resolve/synth/critique/genComponent/toLangflowFlow）, `prototype/hub/test_shenron.mjs`
- **改修**: `prototype/hub/hub.mjs`（`/api/shenron/plan|build|gen-component`・`/api/planner/config`・`llmFlow` 拡張）, `prototype/hub/ui.html`（神龍パネル・編集・実行導線）, `prototype/mcp/integrations.json`（search MCP）, `prototype/mcp/server.mjs`（`plan_flow`/`build_flow` 露出）, `PROJECT.md`

## 8. Verification（e2e 通し）

1. `node prototype/hub/hub.mjs --vendor claude` 起動
2. Wave 1: `/api/shenron/plan` で plan IR 取得（steps/summary/tools_needed）
3. Wave 2: Tavily 登録 → 外部ツール提案・audit egress
4. Wave 3: `/api/shenron/build` → `/api/langflow/import` → cockpit 全描画・🔗 ゼロ
5. Wave 4: 未実装ツール goal → A 通知＋B コード stub
6. Wave 5: 「Slack→メール」対話修正 → 差分適用
7. Wave 6: 「実行」→ `uvx --python 3.12 langflow@1.10.0 run --port 7860` 起動済 Langflow に委譲 → 出力＋`auditVerify` ok
8. 各 Wave: `node prototype/hub/test_*.mjs` green・`git status --short` 確認後 commit

## 9. Risks / 落とし候補

- **B コード生成の有効性**が最大未知 → v1 は stub＋通知に scope 落とし（検証・自動登録は v2）
- search MCP の **API key 依存** → 無ければ graceful に内部 index のみ
- 全パリティは **巨大** → 北極星に留め漸進。React Flow 必要領域は別判断
- プランナーの **token コスト** → Wave 7 で概算、それまで plan は手動トリガー（自動連発しない）
- 並列セッション `ui.html`/`hub.mjs` 衝突 → safe-commit・mine-only staging
