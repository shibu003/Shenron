# 11 — Cockpit Roadmap / visual flow-builder（Langflow・n8n を流用）

> 起点：3 参照（Langflow **~146k**〔DataStax→**IBM/watsonx** 傘下〕 / n8n ~100k / Cal.com ~32k）= **D&D 視覚ビルダー × open-core × self-host**。
> 方針：cockpit（`prototype/hub/ui.html`）を **「agent を線で配線して保存して走る」builder** に育て、いま別々の **agents・workflows・automations・MCP** を **1 つの視覚面に統合**（docs/08 §1.5 **G2** の実体）。
> 原則：**パターン流用・コード非複製**（philosophy #1）。**zero-dep 維持** → React Flow は概念だけ借り、本体は本番 upgrade 時。
> 更新: 2026-06-16（**Wave G 完了＝mcp ノード実呼び出し**。Phase 1 は F✅→G✅→K→L、次=K）

---

## 0. 参照解析（build に効く要点）

| 参照 | 借りる核 | 出典 |
|---|---|---|
| **Langflow** | flow=`{nodes[],edges[]}` JSON。node に **template(inputs)/outputs**、**typed handle**（`output_types` ∩ `inputTypes` ≠ ∅・**色で型可視**、不一致は Type Convert）。実行=**DAG topological sort → vertex 順次 build → edge で下流へ**。入口=Chat Input/終端=Chat Output。**export-as-API**=`POST /api/v1/run/{id}` ＋ **`tweaks`**。**MCP=双方向**（flow を MCP server 公開＋MCP tool 消費・v1.8）。**grouping→custom component**（sub-flow）。**per-field typed inputs**（IntInput/DataInput/MessageTextInput…）。⚠️**現況 2026-06**: DataStax→**IBM/watsonx 傘下・~146k★**。**v1.9/1.10「Langflow Assistant」＝NL から component も完全な flow も生成**（＝**Wave L Ghost Writer は既出**）・IDE/coding-agent 向け MCP。 | [components](https://docs.langflow.org/concepts-components)・[mcp-server](https://docs.langflow.org/mcp-server)・[Assistant](https://docs.langflow.org/langflow-assistant)・[1.9](https://www.langflow.org/blog/langflow-1-9)・[DataStax→IBM](https://www.datastax.com/blog/datastax-acquires-langflow-to-accelerate-generative-ai-app-development) |
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

## 2. Wave 計画（A→E 完了 ＋ 拡張 F–L。各 Wave＝1〜複数 commit、revertable、verify 付き。拡張性＋差別化戦略は §2.5、ユースケースは docs/06）

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

### Wave C — trigger ノード → automation（n8n）✅ DONE
- **trigger ノード**（`kind:"trigger"`・build_state、out ポートのみ・amber・click で match 編集）を canvas に「**＋ trigger**」で追加し agent chain へ配線。
- 「**📋 auto**（save as automation）」→ hub `POST /api/automations`：canvas を分割し **trigger config ＋ agent chain（trigger strip 済）を workflow 化して ref**、`automations.json` に upsert（既存 shape＝`{trigger, workflow:<id>, input, enabled}` 準拠）。
- 「**⚡ fire**」→ hub `POST /api/fire {event}`：`triggerMatches`（`deepMatch`・server.mjs と同semantics）で enabled automation を選び、各々の workflow を **B2 `runFlow` で実行**（cockpit のhandoff アニメで可視化）。`runFlow` は trigger ノードを strip して下流を入口化。manual=▶run、schedule=Trigger.dev seam（既存）。
- files: `hub.mjs`（saveAutomation/fireEvent/triggerMatches/deepMatch＋routes・runFlow の trigger strip）、`ui.html`（trigger node＋＋trigger/📋auto/⚡fire＋buildFlow に trigger 同梱）。
- **done（達成）**: UI で trigger→sales→marketing を組み「📋 auto」で automation 保存、「⚡ fire」 or `/api/fire` の build_state event で **マッチした automation が chain を自動実行**（green→completed 2/2、非マッチ→fire なしを検証）。

### Wave D — agent palette + MCP export（Langflow）✅ DONE
- **「☰ palette」**＝ agent/skill カタログ（**hub の共有 agent index ＝ `/api/state`** をクライアント検索）。canvas は「カタログ × 表示集合」モデル：node の **✕** で canvas から外し（index には残る）、palette の **＋** で戻す＝Langflow の「palette からノード追加」を実現。検索 box でフィルタ。
- **per-node「⧉ copy MCP call」**（node・palette 両方）＝ `send_handoff` の tool 呼び出し片を clipboard へ。**per-flow「⇪ export」**＝配線を workflow 保存し `run_workflow` の MCP tool 呼び出し片を表示＋copy。
- files: `ui.html`（palette/✕/＋/⧉/⇪・HIDDEN 集合・nodeOf 流用）。**`mcp/server.mjs` の search proxy は不要に**＝cockpit は hub state（＝同一 index）を直接検索（redundant part を作らない・philosophy #2）。MCP `search_agents` は AI 向け surface として別途存続。
- **done（達成）**: palette からノード追加（✕→＋ サイクル）、node/palette の MCP 呼び出しを copy、flow を MCP tool として export（`run_workflow` 片）。

### Wave E — open-core「kills X」ピッチ（n8n/Cal.com）✅ DONE
- UI でなく **docs/06 §6.8**：「**BuildHUD kills 手配線 cross-agent glue**」open-core/self-host/no-per-seat ナラティブ。先例（n8n/Cal.com/Langflow）対応表・各 Wave が消す glue の種類・capture（seat/zap でなく trust/orchestration/marketplace）・正直な fence（🔴 GATE-1 不変・🟡 narrative≠moat・🟢 builder は実在）。
- files: `docs/06_VISION.md`（§6.8 追加・更新日 bump）。
- **done（達成）**: pitch を `docs/06 §6.8` に 1 枚反映。

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

### e) trust controls（⚙設定で on/off ＋ データ境界）— autorun=Wave F / data firewall=Wave H

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
- → この **data firewall ＋ capability passport ＋ audit** を **Wave H「Agent Trust Boundary」**に統合（下記 f）。

### f) 差別化を Wave 化（competitive moat → roadmap）

> 競合（**n8n / Langflow / Zapier**）に「より良い flow-builder」では勝てない（統合数・成熟・LLM 特化で負ける）。勝つのは **彼らが全員前提にする『単一オーナー』を捨てた 1 軸＝オーナー境界をまたぐ agent の trust/handoff** だけで戦い、**統合は MCP/A2A に乗る**（再実装しない）時のみ。判定＝耐久テスト「**競合がコピーするのに何を捨てる必要があるか**」（docs/06 §4・§6.8、S0/S1/S2 ユースケースは docs/06 のシミュレーション節）。

**背骨＝1 機構を信頼距離 S0→S1→S2 で使い回す**：**Agent Trust Boundary** = `capability passport`（各 agent に read/write/外部送信/data-scope を宣言、hub が毎ホップ強制）＋ `data firewall`（§e-2 の share pass/never）＋ `audit`（改ざん不能 trail）。
| 距離 | fence 対象 | 競合が追随できない理由 |
|---|---|---|
| **S0** ソロ | 買った 3rd-party agent の vendor | vendor-native は自分を fence しない／fleet 系に trust 層が無い |
| **S1** 社内 | 別 agent（least-privilege） | iPaaS は step を信頼前提＝agent-trust-native でない |
| **S2** 他社 | 会社境界（OBO/DPoP） | 巨人は単一アカウント lock-in を捨てないと不可 |

> ⚠️ **Langflow reality check（2026-06 調査）**：Langflow は **MCP 双方向＋flow を MCP server 公開（v1.8）**・**「Langflow Assistant」＝NL から完全な flow を生成（v1.9/1.10）**・per-field typed component・grouping→custom component を**既に持つ**（~146k★・IBM/watsonx 資金）。→ **Wave D（MCP export）/ K（parity）/ L（Ghost Writer）は差別化でなく catch-up＝「土俵に立つ入場料」**。ここで本家に正面から勝とうとした瞬間に負ける。**唯一の堀は Langflow が構造的に持たない cross-owner trust＝Wave H**。**K/L/D は最小限で持ち、勝負は H に全振り。**

**新 Wave（B の後・優先順）**:
- **Wave F — integrations & settings ✅ DONE**：**F.1**（autorun on/off＝hub 代理実行を global＋per-agent で gate・`/api/autorun`・⚙settings＋inspector トグル・検証済）＋**F.2**（`integrations.json` 登録・⚙settings で MCP server 接続/on-off/追加・enabled tool を palette に表示→`kind:"mcp"` ノードを canvas に配置・配線可。実呼び出しは **stub＝Wave G**）。done: Gmail/Slack を繋いで on/off、enabled tool が palette に、autorun off で hub 代理実行が止まる。commit `62674db`/`6013eda`。
- **Wave G — MCP tool ノード＋実 side-effect ✅ DONE**：`kind:"mcp"` ノードを **executor が実呼び出し**。新規 zero-dep **`mcp-client.mjs`**（JSON-RPC 2.0／stdio=改行区切り initialize→initialized→tools/call ＋ HTTP streamable は best-effort）で接続済み MCP server の tool を実行（auth は各 server に乗る＝philosophy #1）。hub の `fireMcpNode`/`runMcp` が **durable inbox の handoff を再利用**＝cockpit 可視化・history・**agent と同じ approval フェンス**（外部副作用は既定 approval、node.auto で opt-in、global autorun master が kill switch）。上流出力は `input` 引数で渡し、node.config を merge。crash 時 sweep は **running の外部副作用を自動再送しない**（approved のみ resume）。検証用 zero-dep **`echo-mcp-server.mjs`**（`.echo-outbox.log` に追記＝観測可能な実副作用、外部 creds 不要）＋ `integrations.json` の `echo`（enabled）。**done（達成）**: marketing-outreach-agent→echo.send_email を配線→Run→agent 完了→mcp が awaiting_approval（副作用ゼロ）→approve→**実送信**（outbox 追記・run completed 2/2）／auto opt-in＝承認なし実行／global off＝auto でも待機（kill switch）／disabled server＝クリーンに failed／crash 再起動＝running 非再送・approved resume を全 ✅。実 Gmail/Slack は **bring-your-own**（自前 MCP server＋OAuth）。
- **Wave H — Agent Trust Boundary（★wedge・最重要差別化）**：`capability passport`（per-agent 宣言＋hub 毎ホップ強制）＋ `data firewall`（share pass/never・cross は deny-by-default・secret/PII 既定 never）＋ `audit`（grant/redact/approve を改ざん不能 trail に）。S0/S1/S2 で距離違いに使い回す。**done**: 「Claude→（env/PII 除去）→他 vendor の Codex agent、file paths のみ可視、全 call audit、外部送信は approval、相手 offline でも durable」＝**n8n/Langflow/Zapier に書けない flow** を 1 本実演。
- **Wave I — cross-vendor consensus node（vs vendor-native）**：同 task を Claude＋Codex＋Gemini に fan-out → hub が diff/投票 → 合意出力。**単一 vendor は構造的に不可能**＝「なぜ Claude native でなく BuildHUD?」への構造回答。**done**: consensus ノードで 3 vendor 並列→多数決/合議結果が下流へ。
- **Wave J — build-state IR（vs iPaaS）**：trigger 語彙を第一級化（`pr_merged`/`rc_built`/`deploy_green`/`test_red`/`review_completed`…）＋ match DSL。n8n の generic webhook と差を付ける（「IR 深いほど堀」§4）。**done**: 名前付き build-state event で automation 発火、IR スキーマを doc 化。
- **Wave K — Langflow parity（entry ticket・本家に勝てはしない）**：Langflow ができる事に**並ぶ**（**§4 の「per-field template は非目標」を撤回**）。対象＝per-field component template（node に typed 入力 field）／multi typed port（固定 1-in/1-out を一般化）／component library（input・output・prompt・model・agent・tool・data）／sub-flow（grouping→custom component）／Chat I/O／playground／`tweaks`。**⚠️ これは差別化でなく入場料**（Langflow が本家・~146k★）→ **最小限に絞り深追いしない**。**done**: 代表 flow（RAG / agent）を BuildHUD で同等に組める。
- **Wave L — Ghost Writer（cross-owner / fenced agent を著述する meta-agent）**：⚠️ **Langflow Assistant（v1.9/1.10）が既に NL→完全 flow を生成** → 「flow を書く copilot」単体では差別化ゼロ。BuildHUD の L は **(a) cross-owner（他人/他社）の agent を含めて組む ＋ (b) Wave H の capability passport を自動付与した fenced agent を著述** に振って初めて意味（Sierra 流「agent を作る agent」＋trust）。**MCP control plane（docs/10）の頂点**＝「AI が BuildHUD を操作して組む」を copilot 化。
  - cockpit に Ghost Writer chat：「PR マージ→レビュー→lint 修正→Slack 通知」と書く → `search_agents` で既存 agent 発見 → **nodes/edges 生成＋typed port 配線＋trigger/mcp ノード配置** → canvas に materialize。適合 agent が無ければ **新規 agent config を draft**（name/skill/systemPrompt/accepts/emits）＝「agent を作る agent」。
  - 反復：「marketing も足して」「prod に触らせないで」→ 差分編集（後者は **Wave H の capability passport を自動付与**＝fenced agent を著述）。
  - 実装：hub が `runVendorAsync` に **agent index＋flow schema(§1)＋接続 MCP tools** を context で渡し flow JSON 生成 → schema/typed-port で**検証** → canvas/`workflows.json`。**生成≠実行**：human が Run 前にレビュー、Run は approval フェンス維持。vendor 中立（Claude でも Codex でも著述）。
  - **done**: NL 一文 → canvas に動く flow が出来て Run できる／適合無しなら新規 agent も draft。
  - 🟡 **fence**：生成品質は不確実 → typed port 検証＋human レビュー＋approval 必須。flashy だが GATE-1 は埋めない。**「flow 生成」だけなら Langflow Assistant に劣後** → 差別化は上の **(a) cross-owner ＋ (b) fenced（passport 付き）著述**のみ。最小版は今でも実装可（control plane＋schema＋runner が既存）だが、**H が無い L は本家の劣化版**＝H とセットで初めて価値。

### g) 3 フェーズ実行順（`docs/06 §6.9`・WORK 市場に飛びつかない）
> 「巨人 marketplace を **AI-native＋easy＋中立＋安全** で kill」を、出荷可能→moat→economy の順で。vision 膨張＝出荷ゼロ（docs/06 §2）への規律。
- **Phase 1（出荷優先・AI-native easy 中立 builder）**＝ **F ✅ → G ✅ → K → L**。＝kill の「AI-native＋easy＋中立」surface＝**入場料（単体では moat でない）**。done: 非巨人が複数 vendor の agent を AI-native・中立・self-serve で配線→Run。**次=K（Langflow parity 最小）**。
- **Phase 2（moat）**＝ **H ★** ＋ 隣接 **I・J**。done: 「他社 agent を機微データに env/PII fence＋全 call audit で使う」＝**巨人 walled/Langflow に書けない flow**を実演。
- **Phase 3（North Star・economy）**＝ **WORK 市場**＝cross-owner agent 労働市場（discovery・**reputation graph＝通貨**・marketplace・**AP2 settlement**・emergent チェーン）。**gate＝Phase 2 完了＋GATE-1 実証後に本格化**（先回りしない）。

## 3. 既存資産マッピング
- canvas/edges → `prototype/hub/ui.html`（cockpit）
- flow 実行/保存 → `prototype/hub/hub.mjs`（durable inbox＋将来 topo-run）
- flow=workflow/automation → `prototype/mcp/workflows.json` / `automations.json`（nodes/edges を併記、`steps[]` 互換維持）
- MCP 露出 → `prototype/mcp/server.mjs`（`run_workflow`/inbox tools・計 18）
- schedule trigger → `prototype/mcp/trigger/`（Trigger.dev seam・既存）
- integrations（接続 MCP・on/off）→ `prototype/mcp/integrations.json`（**新規**・§2.5 Wave F）
- mcp tool ノード実行（side-effect）→ `prototype/hub/hub.mjs`（`fireMcpNode`/`runMcp`・approval フェンス）＋ **`prototype/mcp/mcp-client.mjs`**（zero-dep MCP client・stdio/HTTP）。検証＝`prototype/mcp/echo-mcp-server.mjs`（§2.5 Wave G ✅）
- trust boundary（passport/firewall/audit）→ `prototype/hub/hub.mjs`（強制点）＋ agent 設定（passport 宣言）＋`integrations.json`（§2.5 Wave H）

## 4. 非目標（この roadmap では作らない）
- React Flow 本体導入（build 必要＝zero-dep 破壊。本番 surface 時に。**Wave K の per-field/multi-port もまずは vanilla SVG で**）。
- 本物の cross-party 認可（OBO/DPoP・M5＝GATE-2・別軸の North Star）。**Wave H が作るのは data firewall＝「何を渡すか」**であって「誰に＝身元/委譲」ではない（混同禁止）。
- ~~Langflow の per-field template~~ → **撤回：Wave K で完全互換を目標化**（§2.5 f）。
