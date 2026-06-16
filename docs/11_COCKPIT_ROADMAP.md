# 11 — Cockpit Roadmap / visual flow-builder（Langflow・n8n を流用）

> 起点：3 参照（Langflow 194k / n8n 100k / Cal.com 32k）= **D&D 視覚ビルダー × open-core × self-host**。
> 方針：cockpit（`prototype/hub/ui.html`）を **「agent を線で配線して保存して走る」builder** に育て、いま別々の **agents・workflows・automations・MCP** を **1 つの視覚面に統合**（docs/08 §1.5 **G2** の実体）。
> 原則：**パターン流用・コード非複製**（philosophy #1）。**zero-dep 維持** → React Flow は概念だけ借り、本体は本番 upgrade 時。
> 更新: 2026-06-16

---

## 0. 参照解析（build に効く要点）

| 参照 | 借りる核 | 出典 |
|---|---|---|
| **Langflow** | flow=`{nodes[],edges[]}` JSON。node に **template(inputs)/outputs**、**typed handle**（`output_types` ∩ `inputTypes` ≠ ∅ で接続可）。実行=**DAG topological sort → vertex 順次 build → 結果を edge で下流へ**。入口=Chat Input、終端=Chat Output。**export-as-API**=`POST /api/v1/run/{id}` ＋ **`tweaks`**（node ごとの field 上書き）。**MCP**=flow を tool 化、input schema を入口 field から導出。**LFX**=JSON 1 枚をステートレス実行 | [import/export](https://docs.langflow.org/concepts-flows-import)・[data-types](https://docs.langflow.org/data-types)・[publish](https://docs.langflow.org/concepts-publish)・[mcp-server](https://docs.langflow.org/mcp-server)・[exec engine](https://deepwiki.com/langflow-ai/langflow/4.4-flow-execution-engine) |
| **n8n** | workflow=`nodes[]`＋`connections`（out→in、JSON 伝播）。**trigger ノード**（Schedule/Webhook）が入口。self-host・per-zap 課金なし | [schedule trigger](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.scheduletrigger/)・[anatomy](https://medium.com/@Quaxel/the-anatomy-of-an-n8n-workflow-3ade4a335266) |
| **Cal.com** | routing forms・team workflows・**open-core（機能を paywall に隠さず source ごと）** | — |
| **React Flow** | `<Handle type=source/target position id>`、`nodeTypes`、`onConnect`/`isValidConnection`。**build 必須＝zero-dep 不可** → 概念のみ流用、vanilla SVG で自前実装 | [custom nodes](https://reactflow.dev/learn/customization/custom-nodes) |

## 1. 採用する最小 flow schema（Langflow を圧縮）

固定 1-in/1-out ポートで handle 文字列を不要化。flow = workflow（trigger 無し）/ automation（trigger ノードあり）。

```json
{
  "id": "sales-to-marketing",
  "name": "...", "summary": "...", "tags": ["..."],
  "nodes": [
    { "id": "trigger", "kind": "trigger", "x": 40,  "y": 80, "trigger": { "type": "manual|schedule|build_state", "when?": "0 2 * * *", "match?": {} }, "out": { "emits": ["*"] } },
    { "id": "sales",   "kind": "agent",   "x": 280, "y": 80, "agent": "linkedin-sales-agent",   "skill": "find-prospects", "in": { "accepts": ["*"] },             "out": { "emits": ["prospects"] } },
    { "id": "mkt",     "kind": "agent",   "x": 520, "y": 80, "agent": "marketing-outreach-agent","skill": "draft-outreach", "in": { "accepts": ["prospects","*"] }, "out": { "emits": ["outreach"] } }
  ],
  "edges": [ { "id": "e1", "source": "trigger", "target": "sales" }, { "id": "e2", "source": "sales", "target": "mkt" } ]
}
```

- **接続可否** = `intersect(source.out.emits, target.in.accepts) ≠ ∅`（`"*"`=ワイルドカード）＝ React Flow の `isValidConnection`。
- **実行** = topo-sort → 各 agent node を hub 経由で run、出力を edge 先の input に渡す（既存 `run_workflow` を線形→DAG に拡張）。trigger node が入口。
- **保存先**：trigger 無し → `workflows.json`（既存）に nodes/edges を併記、trigger あり → `automations.json`。互換のため既存の `steps[]` も導出して残す。
- **node.kind = `trigger | agent | mcp`**。`agent`=LLM skill（テキスト生成、現状）。`mcp`=**接続済み MCP server の tool 呼び出し＝副作用アクション**（例 `gmail.send_email` / `slack.post_message`）。mcp ノードも同じ typed port で配線。詳細・integrations・on/off は **§2.5**。

## 2. Wave 計画（A→E ＋ 拡張 F/G。各 Wave＝1〜複数 commit、revertable、verify 付き。拡張性の全体像は §2.5）

### Wave A — 配線キャンバス（typed ports + edges）✅ DONE
- agent ノードに **in(左)/out(右) ポート**、**port→port ドラッグでエッジ**を引く（node-on-node ドラッグから昇格）。`isValidConnection`= type 交差。エッジは status 色 bezier（既存流用）。
- canvas 上に flow draft（nodes+edges）を保持。
- files: `ui.html`（ports/edges/接続判定）。hub 変更は最小（node 位置の保存任意）。
- **done**: sales→marketing を実エッジで配線、型不一致は弾く、複数ノード連鎖が描ける。
- **実装メモ**: pointer-events で port→port 配線（live rubber-band＋valid 緑/invalid 赤 highlight・elementFromPoint で touch 対応＋edge ラベル＝交差型＋click-to-delete）。**node 移動も実装**（本体ドラッグ=ライブ移動・pointer events・エッジ追従）。HTML5 DnD は撤去し pointer events に統一：他ノード上で離す=**送信**（source は元位置へ snap-back＝旧 drag-to-send UX 維持）、空きで離す=**移動**。配線（port）と policy pill は除外。port 型は **agent の契約**として `prototype/agents/*.json` の `skill.accepts/emits` に置き hub preseed→`/api/state` 露出（既定 `*`）。§1 schema 例の `accepts:["*"]` でなく **具体型**（sales `accepts:[brief] emits:[prospects]`／marketing `accepts:[prospects] emits:[outreach]`）にした＝2 agent だけで「型不一致を弾く」を実証するため（marketing→sales=∅）。flow draft の永続化は Wave B。検証: 接続/拒否ロジックを live `/api/state` で全 ✅（sales→marketing valid・型 "prospects"／marketing→sales 拒否／self 拒否／sales→marketing→reviewer 連鎖 valid）。

### Wave B — flow 保存 + DAG 実行（Langflow export + topo run）
> B は2分割：**B1（実行基盤・autonomy）✅ DONE** → **B2（保存 + DAG）✅ DONE**。

**B1 — hub in-process executor（worker 無し実行）✅ DONE**
- LOCAL agent（`prototype/agents/*.json` に config あり）を **hub 自身が in-process で実行**（`runner.mjs` の `runVendorAsync`・非ブロッキング）。submit/approve で発火→結果を post。**worker.mjs 不要**で submit→completed。
- REMOTE/cross-company agent は broker-only のまま（runtime は相手所有・durable inbox が保持）。`poll()` は local agent には heartbeat のみ（二重実行防止）。**approval フェンス維持**（既定 approval＝人間承認まで走らない）。crash 時は boot sweep で再開。`--vendor stub|codex|claude` で local-exec vendor 指定。
- files: `runner.mjs`（async runner）、`hub.mjs`（executor/scheduler/sweep）。**done（達成）**: stub で auto→running(hub)→completed・worker ゼロ／approval→awaiting_approval で停止→approve→completed を検証。**設定での on/off は §2.5 f) Wave F**。

**B2 — flow 保存 + DAG 実行 ✅ DONE**
- 「**💾 save**」→ 配線 draft（EDGES＋触れる agent）を flow 化し hub `POST /api/workflows` で保存（**nodes/edges を正**・`steps[]` は topo 線形化で派生＝採用案 (a)・既存 `mcp/workflows.json` に upsert）。
- hub が **flow を reactive DAG 実行**（`POST /api/runflow`：入口 node=in-degree 0 → handoff 化して B1 executor で走り、完了で入力が揃った下流 node を発火、出力→入力を edge で受け渡し）。「**▶ run**」→ hub 実行→ **既存の handoff edge アニメ**で canvas 可視化。per-agent approval なら途中で停止→承認で続行。crash 時は boot sweep＋`advanceRun` で再開。
- MCP `run_workflow` は nodes/edges を持つ flow を **hub `/api/runflow` に委譲**（cockpit ▶ と同一エンジン・B1・agent server 不要）。steps-only の旧 flow は従来 `a2aSend` で互換実行。`run_workflow` は呼び出し毎に `workflows.json` を再読込（UI 保存分を反映）。
- files: `hub.mjs`（toposort/save/runFlow/advanceRun＋routes）、`ui.html`（save/run＋buildFlow）、`mcp/server.mjs`（DAG 委譲＋再読込）、`runner.mjs`（既存 async）。
- **done（達成）**: cockpit で配線→💾保存（`workflows.json` に nodes/edges＋steps）→▶Run→**topo 順に completed**（sales→marketing、edge で prospects を受け渡し確認）／saved id 実行／draft 実行／MCP は同 flow を hub 経由で実行（委譲を検証）。**未対応**: 分岐 DAG の MCP 線形化は steps[] で近似（true DAG は hub のみ）・1 agent=1 node（多重 instance は将来）・cycle 非対応。

### Wave C — trigger ノード → automation（n8n）
- **trigger ノード**（manual/schedule/build_state）を入口に配置・配線。「**save as automation**」→ `automations.json`（trigger＋wired workflow）。manual/`fire_event`/schedule(Trigger.dev seam) で発火。
- files: `ui.html`（trigger palette/node）、`hub.mjs`＋automation 保存、`fire_event` 流用。
- **done**: build_state trigger→chain を UI で組み、event で自動実行。

### Wave D — agent palette + MCP export（Langflow）
- **サイドバー palette**（`search_agents`/MCP）から agent/skill を canvas にドラッグ追加。per-node「**copy MCP call**」、per-flow「**export as MCP tool**」（登録片を表示）。
- files: `ui.html`（palette/export）、`mcp/server.mjs`（search proxy）。
- **done**: palette からノード追加、ノードの MCP 呼び出しをコピーできる。

### Wave E — open-core「kills X」ピッチ（n8n/Cal.com）
- UI でなく **docs/06**：「**BuildHUD kills 手配線 cross-agent glue**」open-core/self-host/no-per-seat ナラティブ。
- files: `docs/06_VISION.md`。
- **done**: pitch 1 枚に反映。

## 2.5 拡張性 — MCP tool ノード・integrations・実 side-effect（vision を固定）

> 狙い：cockpit を「agent を配線して **実際に外部へ送信する**（Gmail / Slack 等）」面にする。**MCP 追加・skill 追加・on/off を全部この中**で。今は agent skill が**テキストを生成**する所まで（worker 起動下）で、**外部アクション（送信）は未実装** → 下の Wave F/G で埋める。

### a) node kind を 3 種に（§1 schema 拡張）
- `agent` … LLM skill。テキスト生成（現状・worker.mjs が `runVendor` で実行）。
- `mcp`   … 接続済み MCP server の **tool 呼び出し＝副作用アクション**（`gmail.send_email`・`slack.post_message`…）。`{ kind:"mcp", server:"gmail", tool:"send_email", config:{…}, in:{accepts:["outreach","*"]}, out:{emits:["sent"]} }`。`config`=field 既定（Langflow template/tweaks 相当）。
- `trigger`… 入口（既存）。
- 接続判定は全 kind 共通（`emits ∩ accepts`）。agent→mcp 連鎖（draft-outreach → gmail.send_email）が描ける。

### b) integrations registry + settings（新規）
- 新 store `prototype/mcp/integrations.json`：接続 MCP server 一覧（`label` / 接続情報（command|url|auth）/ **`enabled`** / 露出 `tools[]`）。
- cockpit **⚙ settings パネル**：接続 MCP の一覧・**on/off トグル**・**新規 MCP 追加**。**enabled の server の tool だけ** palette と executor に出る。
- 認可は **adopt, not build**：各 MCP server 自身の auth に乗る（自前認可は作らない＝philosophy #1）。

### c) builder へ取り込み（Wave D palette を拡張）
- palette = agents/skills（`search_agents`）＋ **enabled MCP server の tools**。canvas にドラッグ＝ノード追加。skill も同様にドラッグで追加。

### d) 実 side-effect 実行（executor＝「submit 後に実際に動く」の本体）
- topo-run が `kind:"mcp"` ノードに来たら、上流出力を入力に **hub/worker が接続 MCP server の tool を実呼び出し** → 実際に送信される。
- **trust fence（blast radius gate 維持）**：外部副作用ノードは既定 **approval**（attended＋`A2A_SHARED_TOKEN`）。`auto` は明示 opt-in のみ。既存 `awaiting_approval` フェンスをそのまま流用。

### e) trust controls（⚙設定で on/off ＋ データ境界）— Wave F に含める

3 軸で独立に制御（混同しない）: **`policy`**（承認ゲート＝handoff 毎の人間承認）× **`autorun`**（hub 代理実行の可否＝下記1）× **`share`**（何を渡すか＝下記2）。

**1. 自律実行 on/off（「相手が起動してなくても hub が動かす」機構の制御）**
- 現状の安全弁は**既にある**：per-agent **policy=approval が既定** → 人間承認まで走らない。autonomous は policy=auto の時だけ（B1 で検証済）。
- 追加する per-agent（＋global master）**`autorun` トグル**＝「hub が in-process でこの agent を**代理実行してよいか**」。**off** にすると B1 executor を使わず、その agent 専用 worker／相手 runtime が起動した時のみ実行（旧 broker-only 挙動へ）。⚙settings と `set_policy`/MCP で on/off。
- 既定: local agent は `autorun=on`＋`policy=approval`（＝走るが人間ゲート）。global master off で「hub は一切代理実行しない」に倒せる。

**2. データ境界（絶対に渡さない情報 / 渡す情報の切り分け）**
- handoff/edge の payload に **share policy** を付与：`{ pass:[…許可フィールド/タグ], never:[…禁止フィールド/パターン] }`。
- 適用点：hub が handoff 作成時（特に **cross-company＝remote 宛**）に **never 該当を除去してから保存/転送**、pass のみ下流へ。mcp ノード（Wave G の Gmail/Slack 送信）にも同じ境界を適用＝外に出る前に必ず通す。
- 既定：**cross-company は deny-by-default**（明示 pass のみ）／local は緩め。secret/PII パターン（API key・token・`.env` 等）は **never に既定登録**（philosophy #4 secret 漏洩防止と整合）。
- UI：edge クリック or ⚙settings で per-edge/per-agent の pass/never を編集。監査のため除去した事実は history に残す（中身は残さない）。
- **MVP の範囲整理**：データ境界（**何を**渡すか＝フィルタ）は今 build 可能。一方 cross-party の**認可・身元**（**誰に**＝OBO/DPoP・M5）は GATE-2 North Star で別軸（PROJECT §4）。混同しない。

### f) 新 Wave（B の後）
- **Wave F — integrations & settings ＋ trust controls**：`integrations.json` ＋ ⚙settings（MCP 接続 / on-off / 追加・**`autorun` on/off**・**`share` pass/never 編集**）。**done**: ①Gmail/Slack の MCP を繋いで on/off でき enabled tool が palette に出る、②agent の autorun を off にすると hub が代理実行しなくなる、③handoff の never 指定フィールドが下流に**渡らない**ことを検証。
- **Wave G — MCP tool ノード＋実 side-effect**：`kind:"mcp"` ノード＋executor が enabled tool を実呼び出し（approval フェンス＋**share 境界を通してから送信**）。**done**: 「draft-outreach(agent) → gmail.send_email(mcp)」を配線→Run→**実際に下書き/送信される**（never フィールドは送信前に除去）。

## 3. 既存資産マッピング
- canvas/edges → `prototype/hub/ui.html`（cockpit）
- flow 実行/保存 → `prototype/hub/hub.mjs`（durable inbox＋将来 topo-run）
- flow=workflow/automation → `prototype/mcp/workflows.json` / `automations.json`（nodes/edges を併記、`steps[]` 互換維持）
- MCP 露出 → `prototype/mcp/server.mjs`（`run_workflow`/inbox tools・計 18）
- schedule trigger → `prototype/mcp/trigger/`（Trigger.dev seam・既存）
- integrations（接続 MCP・on/off）→ `prototype/mcp/integrations.json`（**新規**・§2.5 Wave F）
- mcp tool ノード実行（side-effect）→ `prototype/hub/worker.mjs`＋`prototype/mcp/server.mjs`（§2.5 Wave G）

## 4. 非目標（この roadmap では作らない）
- React Flow 本体導入（build 必要＝zero-dep 破壊。本番 surface 時に）。
- Langflow の per-field template（我々は固定 1-in/1-out で十分）。
- 本物の cross-party 認可（GATE-2・別軸）。
