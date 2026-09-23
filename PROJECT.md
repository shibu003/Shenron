# PROJECT — BuildHUD（仮）現状サマリ

> 次セッションの **最初に読む** 1 枚。決定事項・到達点・残 gate・入口を集約。詳細は `docs/` と `prototype/`。
> 更新: 2026-06-17（Langflow run layer **e2e 全完**＝`cacc9e4`）

> ⚠️ **handoff（2026-06-17）**: working tree clean（PROJECT.md の更新のみ）。commit 前 `git status --short` 必須。
>
> ▶▶ **NEXT = 未定（Langflow run layer は完全クローズ）**
> - **Langflow run layer 完了サマリ** (`cacc9e4`): `langflow.mjs`（`langflowRun`/`langflowImport`/`lfRunText`/`lfRunBody`）＋ hub route `/api/langflow/run|import` ＋ 🔗 ガード ＋ ui.html `pushToLangflow()` ＋ ⚙ `lf_host`/`lf_key`。`test_langflow.mjs` green。
> - **e2e 検証済（2026-06-17）**: `uvx --python 3.12 langflow@1.10.0 run --port 7860` 起動 → `/api/langflow/import`（Basic Prompting 6-node flow）→ `flowId` 取得 ✅ → `/api/langflow/run` → 入力中の `sk-SECRETPASSWORD...` が Langflow 到達前に redact ＋ audit に `egress:true` 記録 ✅ → Langflow `/api/v1/run` まで到達 ✅ → 500（OpenAI key 未設定）は LF 側問題・routing/firewall/audit は完全 green ✅。audit hash-chain 継続 ✅。Langflow down → graceful error ✅。
> - **⚠️ uvx の注意**: Python 3.14 デフォルトだと `langflow==0.0.55`（古い）が解決される。正しいコマンド: `uvx --python 3.12 langflow@1.10.0 run --port 7860 --no-open-browser`。初回はインストール（526pkg）に約3分かかる。
> - **⚠️ 正直な限界（要把握）**: cockpit の native executor `runPrompt`(hub.mjs) は vendor グローバル（`EXEC_VENDOR`）で `config.model`/temperature を honor しない。真の model/provider/temperature 忠実度は「Langflow で実行」（登録＋🔗委譲）でのみ出る。native run は template/system/pattern/schema/instructions/input までを反映する簡易プレビュー。
> - **Langflow flow JSON 形**: node=`{id,data:{type:<Component>,display_name,node:{outputs/base_classes,template}}}`・edge=`{source,target,data:{sourceHandle:{output_types[]},targetHandle:{inputTypes[]}}}`・top-level `id`=flowId。kind map=`LF_KIND`(ui.html)。
> - **配線モデル（前提）**: in/out は左右固定でなく floating（floating 接続）。canvas は「import flow を表示＋fence＋native run する最小ビューア」方針（自前グラフ編集は深追いしない＝本家 Langflow に委譲）。

---

## 0. 一行

**どの vendor / どの会社の AI agent でも、発見し → 信頼境界つきで配線し → build-state を引き金に走らせる、A2A の上の vendor 中立な orchestration + trust + 体験レイヤー。** AI が MCP で自律操作できる control plane つき。

- 目的: ハッカソン提出＋投資家ビジョン → 調達。
- 主 surface: desktop cockpit + mobile companion（mobile-first は撤回）。
- 型: dev OSS picks&shovels（open-core）。

---

## 1. ピボット経緯（なぜ今の形か）

| 段 | vision | 判定 | 理由 |
|---|---|---|---|
| V1 | 自分の AI **context 健康**を phone で見る | 🔴 | keystone 反証・式破綻・action 無し（`docs/04`） |
| V2 | 自分の **cross-vendor fleet** を 1 view | 🔴 | Nimbalyst/Melty/Vibe Kanban 既出（混雑） |
| **V3** | **cross-person / cross-company の agent handoff**（現在地） | 🟢 | 人/会社をまたぐ coding-agent handoff は未占＝構造空白 |

構造空白の核（`docs/06 §4`）: **model 中立 × cross-person/company × open IR**。単一巨人は lock-in を捨てないと来られない。

---

## 2. 確定した決定

- **核 = cross-person/company agent handoff**（dashboard でなく）。
- **A2A に乗る**（transport は作らない。card=`/.well-known/agent-card.json`、`message/send`、executor hook=`execute()`）。
- **GLUE は adopt**（`docs/08 §1.5`/`09 §2.5`）: Trigger.dev/Hatchet(G1)・HumanLayer(G3)・Solo.io agentgateway/Kong(G4)・Portkey/LiteLLM/TrueFoundry(G5)。**接続では戦わない、乗る。**
- **自前＝堀 = M1/M2/M3/M5 + 体験 + MCP control plane**（`docs/09`）。
- **MCP-first**: BuildHUD 自体を MCP server 公開、clean-mcp 流 **token-light index**（`docs/10`）。
- **trust は MVP で fake**（共有 token+allowlist+attended）。本物(OBO/DPoP・M5)は North Star。
- **capture 再設計**（`docs/06 §6.6`）: hosted-relay-tier は gateway 勢に商品化された → capture を **gateway の上**（trust/audit・orchestration・index/MCP seat・marketplace take）へ。
- **ICP**: persona A 溺れる OSS maintainer（痛み最強）/ B 2-pizza チーム（TAM）/ C build-in-public 2 人組（demo・dogfood）＋ free-tier juggler。市場は S1(社内多 vendor)が今・S2(会社境界)が将来（`docs/06 §6.5`）。
- **parity は out-feature せず neutralize**（2026-06-16 /feedback）: Langflow builder には **trust 次元を仕込んで対抗**（Wave E＝trust-native builder）、機能数競争はしない（parity を上げるほど『無料の本家でいい』に近づく自殺点）。対 Langflow の正手＝**補完財（flow を import して fence）＝逆方向**（温存）。⚠️ Wave E は GATE-1 demo を兼ねるが **demand 証明ではない**（`docs/11 §2.7`）。

---

## 3. 作って検証済み（動くコード）

| 物 | 場所 | 検証 |
|---|---|---|
| 1-handoff（Persona C） | `prototype/` | review-branch を**実 Codex**がレビュー、往復 COMPLETED |
| A社↔B社 cross-company | `prototype/agents/` | LinkedIn 営業(**Codex**)→マーケ(**Claude**)、**実 LLM**で連鎖 |
| **MCP control plane** | `prototype/mcp/` | **3 索引（agent/workflow/automation）token-light** + `run_workflow`/`run_automation`/`fire_event`。build-state event で automation を引く＋`--unattended` で無人 fire（二段 fence：attended＋token）。trace 検証済 |
| **schedule→Trigger.dev seam** | `prototype/mcp/trigger/` | automation の `schedule` trigger を Trigger.dev v3 declarative `schedules.task` に乗せる（自前 cron 無し、G1 adopt）。`gen-trigger.mjs`＝`automations.json`→task 生成、`run()`→`fire.mjs`→MCP。**generator + `fire.mjs` は検証済**／cron→fire の end-to-end は Trigger.dev project（SDK）必要で未通電 |
| **durable inbox + Langflow 流 cockpit（Wave A–K）** | `prototype/hub/` | offline 耐性の handoff（durable inbox）＋ **`ui.html`＝Langflow 流 visual flow-builder**：左 palette・上 toolbar（Save/Run/Automate▾/⚙Settings）・中央 canvas・右 inspector・🌐JA/EN。**A** typed ports 配線・**B1** hub 代理実行（worker 無し）・**B2** 保存+DAG Run・**C** trigger→automation＋fire・**D** palette/MCP export・**E** open-core pitch・**F** ⚙settings（autorun on/off＋MCP integrations 接続/on-off＋mcp ノード）・**G** mcp ノードの**実呼び出し**（実 side-effect、approval フェンス）・**K** component library（Chat Input/Prompt/Chat Output）＋per-field typed template＋conditional ports＋playground。MCP control plane でも操作可。hub 起動: `node prototype/hub/hub.mjs --vendor stub` |
| **Agent Trust Boundary（Wave H ★wedge）** | `prototype/trust.mjs` | zero-dep **data firewall**（`redact`＝secret/PII/env＋per-agent `never`、値は残さず what だけ記録）＋ **tamper-evident audit**（hash-chain `auditAppend`/`auditVerify`）＋ **capability passport**（`external_send` 等）。hub が毎ホップ強制：handoff 作成で入力 redact／mcp 外部送信前に capability＋egress redact／redact·deny·approve·send·passport を改ざん不能 trail に。`/api/audit`(+verify)・`/api/agents/:id/passport`。cockpit に passport 編集＋🔒監査ビュー。**実機検証**: cross-boundary 秘密除去（path 保持）・external_send 剥奪で deny＋outbox 空・inbox.json 改ざん→再起動→verify=ok:false。＝巨人/Langflow に書けない trust flow |
| **MCP client + 実 side-effect（Wave G）** | `prototype/mcp/mcp-client.mjs` | zero-dep **MCP client**（JSON-RPC 2.0・stdio=改行区切り initialize→initialized→tools/call ＋ HTTP streamable best-effort）。hub `runMcp` が接続 MCP server の tool を実呼び出し（auth は各 server に乗る＝adopt）。外部副作用は既定 **approval**・`node.auto` で opt-in・**global autorun が kill switch**・crash 時 running は**非再送**。検証＝`echo-mcp-server.mjs`（`.echo-outbox.log` に実追記、creds 不要）＋ `integrations.json` の `echo`。agent→echo.send_email→Run→approve→**実送信**・auto/kill-switch/disabled/crash 全 ✅。実 Gmail/Slack は bring-your-own |
| fleet 計測 | `scripts/measure-fleet.mjs` | 並列 session 数 + contextFill 式の実機検証 |

全て **依存ゼロ・ローカル・実 LLM**。trust/承認は attended で fence。

### 検証で訂正した技術事実
- contextFillPct は「累積÷窓」が誤り → **Claude Code statusline の `context_window` を consume**（`docs/02 §4`/`08 §2`）。
- `codex exec` に **`--ask-for-approval` flag は無い**（0.137.x、非対話既定）→ `--sandbox read-only --skip-git-repo-check`。
- A2A: card=`agent-card.json`（`agent.json` は legacy）、hook=`execute()`、`task/send` は無い。

---

## 4. 残っている gate / 最大リスク（おべっか無し）

- 🔴 **GATE-1 買い手未検証**: 「実在の 1 ペア＋反復 handoff タスク」を名指しできてない。**唯一 AI で代替不可な人間タスク。** これが空だと全部 vision のまま。
- 🔴 **GATE-2 trust scope**: cross-party 認可(M5)は「誰も解いてない難問」＝資金ありチームの多年仕事。MVP は fake。
- 🔴 **capture 未確定**: relay 課金は死んだ。trust/orchestration/index/MCP のどれで稼ぐか要検証。
- 🔴 **ICP ズレ**: 金は enterprise(S1)/B2B(S2)、安く検証できるのは indie。橋＝indie の S1 小規模端から。
- 🟡 **R2/R3 需要**: cross-vendor/cross-person を「1 view で見たい/繋ぎたい」かは未検証（`docs/05`）。

---

## 5. 次にやること（優先順）

> ⚡ **Phase 1＋Phase 2（H★ Trust Boundary / I consensus / J build-state IR）完了（`docs/11`・origin 同期済 `918d26d`）。cockpit は Langflow 実機 UI 参考に整理済**。差別化の 5 束は実コードで存在（`docs/11 §2.6`）。

### ▶▶ 現在の作業モード = **使いやすさ Wave pass（機能を 1 つずつ「根本から」直す）**
> 方針（user・2026-06-16）: 各 Wave で **cockpit の 1 機能/1 画面**を取り、**「自由入力/生 JSON → 使い手が判断できる UI」**へ。型は「① その機能に何が流れ・誰が扱うかを**先に見せる** → ② **情報/選択肢ごとに**設定できる → ③ sandbox/approval/trust を**明示**して信頼度を上げる」。⚠️ **これは一例で全機能の解ではない — 問題ごとに解は別**。各 Wave＝**問題点を見つける→判断可能な状態にする→実装→検証**を閉じる（WIP=1）。⚠️ **並列セッションが同 working tree（ui.html）を触る** → commit 前に `git status --short` 必須・safe-commit。
- **✅ Wave 1（DONE・`ee87e84`）= 配線 data-firewall inspector**: 自由入力 never 単独 → **送り手/受け手 contract カード（role/会社/型）＋受け手 passport（net/fs/external_send）＋情報カテゴリ checkbox（secrets/PII は常時ON、project/customer/strategy は1クリック）＋edge から trust preset ＋Check trust**。`share.classes`(復元用)＋展開した `share.never`(既存 hub 強制経路) で保存。
- **✅ Wave 2（DONE）= trigger / fire event UI**: 生 JSON `{event,status}` が迷わせていた → **(1) fire modal を build-state IR 駆動**（「何が起きた?」= `/api/buildstate` の 10 event、選ぶと IR の fields を guided 入力＝status は enum select・他は free text、空欄は drop、生 JSON は `<details>` 詳細に格下げ）／**(2) fire 前に「何が起きるか」を自然文プレビュー**（新 read-only dry-run `POST /api/fire/preview`＝fireEvent と同じ matcher で**実行せず**、マッチする automation 名＋chain＋summary＋🔒firewall 有無を列挙、無マッチは「何も実行されません」と明示）／**(3) trigger inspector**＝status を IR-aware（status を持つ event のみ表示）・⚡ plain-language summary・raw JSON match を `<details>` 格下げ。「センス悪い即修正」: deploy_green/test_red に IR 外の status を注入していた `defaultStatusForFire` を撤去（event 名で成否を表現＝IR 準拠）、dead i18n（fire_review/pr/ci/test/deploy・f_type・m_fire_info 等）削除。実機検証: 10 event 露出・match/non-match/別 event preview・実 fire 継続・dry-run は無実行。
- **✅ Wave 2.1（DONE・`f655e03`）= 人間ラベル化（user feedback「生の id が分かりずらい」）**: IR の生 id（`review_completed`/`status=green`）を **primary に出していたのを撤回** → 人間語を primary・raw id は括弧で副表示。`EV_LABEL`/`RESULT_LABEL` map＋`evLabel()`/`resultLabel()`（ui.html）で trigger dropdown・trigger summary・fire「何が起きた?」・status select を共有。生 JSON は `{ } JSON を表示`（折りたたみ）の裏に。memory `feedback_human_labels_not_jargon` 保存済。⚠️ **未対応**: fire の field 入力（repo/pr/branch 等）はまだ生 field 名表示（任意・副項目）。

### ▶▶ cockpit canvas UX（user の連続 feedback・2026-06-16）— A/B 済・backlog ①②③④（③b-2 collapse 含む）完了
> user が rapid-fire で要望した cockpit 操作性の backlog。**ui.html のみで完結**（hub 不要）。各 Wave 独立 commit。⚠️ **interactive（drag/zoom/resize）は headless で検証不可 → 実ブラウザで目視確認が必須**。起動: `node prototype/hub/hub.mjs --vendor stub` → http://localhost:8795（ハードリロード ⌘⇧R）。
- **✅ A（`78e100f`）= port を node 外へ**: IN/OUT の circle を node の外に出っ張らせ、ラベルを node 外（`portlabel.in{right:calc(100%+7px)}` 等）に出して詳細文との被りを解消。
- **✅ B（`7415579`）= pan/zoom＋パネル可変幅**: node+links を変形レイヤー `#world` に入れ（`transform:translate(PANX,PANY) scale(ZOOM)`）→ **zoom で card がスケール**（旧: node が変形外で zoom 無効だった）。空き地ドラッグ/ホイールで pan・⌘/Ctrl+ホイールでカーソル中心 zoom・右下に −/100%/＋/⤢(fit)。`canvasPt`/`showWireTip` を pan+zoom 対応に。palette/inspector 幅は splitter ドラッグで可変（端まで→隠れる・戻す→再表示、`--palw`/`--inspw` CSS 変数）＝**却下された collapse 2 ボタンを置換＋「開いたら閉じれない」bug 修正**。view/幅は localStorage 永続。
- **✅ ①（`bec28a6`）= ⏹ 実行を停止**: hub `stopRun(id)`＝run を `cancelled` マーク＋未着手/承認待ちの handoff を `rejected`（in-process agent は abort 不可なので走り切るが `advanceFrom` が cancelled で下流発火せず完了もしない）。`sweep` も cancelled は再開しない。`POST /api/runs/:id/stop`。UI＝▶ Run 隣の ⏹（run 実行中のみ表示・全 active run 停止）。API 検証済（承認停止→stop→cancelled/rejected/approve 拒否/idempotent）。
- **✅ ②（`b3531f9`）= component に名前＋詳細**: inspector に name/desc → `config.name`/`config.desc`（buildFlow/loadFlow で既に verbatim 永続・hub は無視）→ node 本体に表示。
- **✅ ④（`b7f8d61`）= fire field の人間ラベル化**（user 追加「これも」）: fire modal の生 field 名（repo/pr/branch…）を `FIELD_LABEL`＋`fieldLabel()` で人間語 primary＋生 id 括弧（evLabel/resultLabel と同型）。`data-ff` キーは生のまま（match JSON は不変）。Wave 2.1 の「未対応」を closure。
- **✅ ③ 配置モデル刷新（user 指示で再設計）= 汎用ノードを置いて inspector で中身を選択/変更**（型不一致配線は自動 drop＋警告）:
  - **③a-component（`a9818d7`）**: palette「▦ Component」＝空ノード→ inspector の kind セレクタで Chat Input/Prompt/Consensus/Trust Router/Chat Output を選択・後から変更（`setCompKind` が id/位置/配線/name+desc を保持し再 specialize）。
  - **③a-mcp（`008d21b`）**: palette「🔌 MCP action」＝tool 未設定ノード→ inspector の tool セレクタ（enabled integrations の server.tool）で選択/変更（`setMcpTool`）。
  - **③a-agent（`bb22eff`）**: agent inspector に「この agent を変更（rebind）」セレクタ＝canvas slot の位置/配線を保ち別 registry agent に差し替え。
  - **③b sub-flow（`3f1ea1a`）**: 保存済み workflow を 1 ノードに（kind `workflow`・component kind セレクタに「📦 Sub-flow」追加・picker は `/api/workflows`）。実行＝**nested run（採用案 A）**: 親が node に来たら hub が ref を別 run で実行（**内部の approval/firewall/audit も発火**）→ 完了で終端出力を親 node 出力へ→親 advance。`runFlow({parent})`＋`fireWorkflowNode`/`flowResult`＋`advanceFrom` 親伝播＋`stopRun` 子伝播・深さ>8 で error。API 検証済（親入力→nested→結果上昇/完了・stop で親+子 cancel）。
  - 共通: 未設定ノード（unset / tool 無し mcp / ref 無し workflow＝`NODE_UNSET`）は Run/Save/Export/Automation で弾く。**interactive な配置/中身選択は実ブラウザ目視が必須**（⌘⇧R）。
- **✅ ③b-2（`3b5112d`）= 複数選択を 1 sub-flow に畳む（collapse）**: shift-click で multi-select（amber リング）→ ツールバー「📦 N個を畳む」。`collapseSelection` が選択ノード＋内部 edge を workflow 保存 → 重心に `kind:'workflow'` ノードを置き外部 in/out edge を繋ぎ替え → ③b の nested run で実行。**線形のみ**（外部 entry/exit が複数なら拒否＝option a）。buildFlow を `nodeSpecOf`/`edgeSpecOf` に factor して `buildSubflow` で再利用。ui.html のみ・shift-select/collapse は要ブラウザ目視。
- **⚠️ working tree の他者 WIP（Wave R reputation）**: `prototype/hub/hub.mjs`（import＋`/api/state` に `reputationFrom`）・`prototype/trust.mjs`・`prototype/mcp/integrations.json` は**未 commit のまま温存**。上記 ①〜③ は **mine-only staging**（`git diff --no-index <baseline> <file>` → header 修正 → `git apply --cached`）で hub.mjs を自分の hunk だけ commit 済。次セッションも巻き込まないこと。
- **Langflow テンプレ分析（2026-06-16・user 提供 `content_cascade_flow`）の借り先・進捗**: ① **field-widget 語彙**＝**✅ `bool`/`secret` 追加**（`dropdown`=既存 `select`・`3fad89b`）＝component の `fields` 型として利用可（現状 consumer なしの capability）。② **note ノード**＝**✅ `3fad89b`**（📝 メモ palette・markdown カード `mdLite`・色 amber/blue/green/grey・hub は trigger 同様 strip・非実行）。③ **multi-handle typed ports**＝**大改修（React Flow 必要）→ 温存**（docs/11 §4）。④ node morphing（`real_time_refresh`）＝中・温存。⑤ typed handle color は `typeColor()` 実装済。
- **UI 方針（user・2026-06-16「UI は真似すればいい / node の中で設定」）= Langflow 寄せ（pattern 流用・コード copy 禁止＝philosophy #1）**: **✅ (a) node カード restyle（`05bb8a5`）**＝ヘッダ帯＋区切り線＋角丸14＋カテゴリ色 tint＋幅統一。**✅ in-node 設定（`7a82f12`）**＝component カードに **kind セレクタ＋各 field を inline widget** で直接編集（`inlineField`・data-nf/data-fk・delegated input/change で live bind・`change` で kind 切替/sub-flow ref/bool）。**focus guard**＝`renderNodes` は `node.contains(document.activeElement)` の node を rebuild しない（1.5s refresh が caret を消すのを防ぐ＝vanilla JS の肝）。attachNode は widget 上で drag を開始しない。comp 幅 244。inspector は引き続き fuller editor。**残り＝palette 行/handle/アイコン chip のさらなる寄せ・mcp/agent ノードの in-node 設定**（headless Chrome `--screenshot` で検証可＝`/Applications/Google Chrome.app/...`・node のみの harness も可）。
- **Langflow GitHub 解析（2026-06-16・parallel agent 3本）= 実装の借り元**: GenericNode anatomy（header＋per-field row＋handle）／field 描画＝`CustomNodes/GenericNode/components/{RenderInputParameters,NodeInputField}` ＋ `components/core/parameterRenderComponent/index.tsx`（type→widget switch）／値 bind＝`hooks/use-handle-new-value.ts`＋`stores/flowStore.ts` の `setNode`(id 単位・React が focus 維持)／**handle-vs-widget の判定**＝`RenderInputParameters/utils.ts computeDisplayHandle`（primitive 型 & input_types 空→inline editor のみ／typed 入力→handle）／`show`/`advanced`＝`helpers/parameter-filtering.ts isCanvasVisible`（advanced は canvas 非表示・inspector のみ）／handle 色＝`utils/styleUtils.ts` datatype palette・`isValidConnection`＝型集合の交差（`utils/reactflowUtils.ts`）。**multi-handle/node morphing は引き続き温存**（React Flow 必要）。
- **元 backlog（同じ型で順次）**: MCP node args は ③a-mcp で tool 選択化済（args JSON は残）／automation 保存 UI／Ghost Writer レビュー導線／Run 入力 typed／Consensus vendors／send handoff modal。各 Wave 着手時に「迷う点」を 1 つ特定してから。

### ✅ (a) #1「Agent Trust Boundary」を**有料商品化**（最初の有料 SKU・`docs/11 §2.6` 収益化 #1）= **A/B/C 完了・実機検証済**
1-pager＝**`docs/12_TRUST_BOUNDARY_SKU.md`**（ICP・束・課金・正直 fence）。素地は Wave H（`prototype/trust.mjs`）、粒度と packaging を A/B/C で productize:
- **A. per-edge Data Firewall ✅**（commit `b45d10b`）: edge が `share.never` を持ち、hub `fenceEdge`/`advanceFrom` が**毎エッジで** redact（built-in secret/PII は常時・無効化不可）。**cross-company edge は deny-by-default**（`crossCompany` フラグ＋強制 firewall）。UI: edge クリックで 🔒 firewall editor（per-wire never＋削除）、fenced wire は amber 破線＋🔒。除去は audit に edge タグ付きで記録。検証: input→output wire で secret＋codename 除去・A社→B社 cross-company redact・verify ok。
- **B. capability 語彙拡張 ✅**（commit `d2cb0a1`）: flat `read|write|external_send` → 構造化 `net: none|read|full` / `fs: none|diff-only|repo` / `external_send: deny|approval|allow` / `secrets: deny`(固定保証)。`normalizePassport` が旧 array 形を migrate。hub が `external_send` を mcp ホップで**強制**（deny=即 fail＋audit、approval=node.auto でも fence 強制、allow=auto 許可）。net/fs は**宣言＋audit**（実 sandbox は runner 側・将来＝UI に正直表記）。`/api/capvocab`。検証: 旧 passport boot migrate・deny/approval/allow 3 経路・verify ok。
- **C. packaging ✅**（このコミット）: passport editor に **Trust preset 1-click**（untrusted-3rd-party＝net:none/fs:diff-only/send:approval ／ internal ／ trusted）。代表 flow＝cockpit「🔒 Safe Handoff 例」（Chat Input〔secret＋codename〕→上流 agent→🔒 cross-company wire→下流 agent→承認制 external send→Chat Output）。**1-pager＝`docs/12`**（課金=per-audited-run 主・seat 床）。検証: preset 適用・Safe Handoff を実 Run→secret wire 除去・send は awaiting_approval→approve で実送信・verify ok。
- **done 基準**: ✅ edge ごとに never→cross-edge で機密が落ちる／✅ capability 語彙を宣言→hub が強制＋audit／✅ untrusted preset 1-click＋代表 flow 1-click。

### ✅ Wave E（trust-native builder＝parity を自軸化・`docs/11 §2.7`）= E1 ✅ E2 ✅ E3 ✅ 完了
「配線しながら安全が見える（E1）→ 安全に分岐できる（E2）→ 走った後に証明できる（E3）」。Langflow に trust 次元で対抗（out-feature しない・§2 決定）。
- **E1 ✅**（`aa08f34`）trust-as-you-build: `POST /api/trust/preview`＝実 enforcement コードで firewall＋cap gate を **agent 非実行**で dry-run→「🔒 Check trust」で実行前に「何を弾くか」可視化。
- **E2 ✅**（`ffd1f64`）trust-router: 新 node kind `router`＝predicate（redacted/clean/contains）で **1 ブランチだけ発火**（true DAG＝If-Else parity）＋ firewall が弾いたかで分岐＝incumbent 不可。`advanceFrom` を dead-branch elimination に書き換え・skipped ノード greyed・route を audit。diamond 検証済。
- **E3 ✅**（`b80a117`）run 後の verdict（Trust Summary）＝既定 inspector に「除去数＋leak chips・send sent/held/blocked・router 分岐・skipped・verify」を最新 run で集約（新 endpoint 無し）。raw audit を「証拠」、verdict を「答え」に昇格。実機検証済。
- 🔴 **fence 不変**: Wave E は最良の GATE-1 demo を兼ねるが **demand 証明ではない**。次の本命＝GATE-1 を builder の話をせず trust の痛みで 1 件当てる（`docs/11 §2.7`・feedback 結論）。
- **code 入口**: `prototype/trust.mjs`（redact/passport/audit）・`prototype/hub/hub.mjs`（`create`/`runMcp`/`advanceFrom`/`setPassport`/`fireMcpNode`）・`prototype/hub/ui.html`（drawLinks `.hit` クリック・`inspAgent` passport editor・`bindAgent`）・`docs/11 §2.5 e`（pass/never 設計）。
- 🔴 **fence**: **GATE-1（買い手未名指し）は packaging しても不変** → 並行 interview 推奨。
- hub 起動: `node prototype/hub/hub.mjs --vendor stub` → http://localhost:8795（再開時 `lsof -tiTCP:8795` で有無確認）。

> GATE-1 は user 判断で一旦**スキップ中**（kit は `prototype/gate1/`・mechanism＋実 Codex/Claude 往復＋公開トンネル往復まで検証済、残るは人間 criterion のみ）。

1. **✅ Wave A（DONE）**: cockpit（`prototype/hub/ui.html`）に agent ノードの **in(左)/out(右) typed ポート**＋**port→port ドラッグでエッジ配線**を実装。`isValidConnection` = emits∩accepts（`*`=ワイルドカード）。型は agent 設定（`prototype/agents/*.json` の `skill.accepts/emits`）由来で hub が `/api/state` に露出（既定 `*`）。sales(emits `prospects`)→marketing(accepts `prospects`) は valid・edge ラベル "prospects"、marketing(emits `outreach`)→sales(accepts `brief`) は ∅ で弾く、`*` ノードは自由連鎖。flow draft（nodes+edges）は client 保持（永続化は Wave B）。node-on-node ドラッグ送信は残置。検証: 接続/拒否ロジックを live `/api/state` で全 ✅。
2. **✅ Wave B1（DONE）— worker 無し実行**: hub が LOCAL agent を **in-process 実行**（`runner.mjs` の `runVendorAsync`）。worker.mjs ゼロで submit→completed。REMOTE は broker-only 維持（durable inbox）。approval フェンス維持・crash 時 boot sweep 再開。検証済（stub: auto→running(hub)→completed／approval→停止→approve→completed）。**autonomy の設定 on/off は Wave F**。
3. **✅ Wave B2（DONE）— 保存 + DAG 実行**: cockpit「💾 save」→ 配線を `workflows.json` に保存（**nodes/edges 正・`steps[]` 派生＝採用案 (a)**）。「▶ run」→ hub が **reactive DAG 実行**（入口=in-degree 0 → handoff 化して B1 で走り、完了で下流発火、edge で出力→入力受け渡し）→ 既存 handoff アニメで可視化。MCP `run_workflow` は DAG flow を hub `/api/runflow` に委譲（同一エンジン）。検証済（sales→marketing topo completed・prospects 受け渡し確認・saved/draft/MCP 経路）。done 基準 `docs/11 §2 Wave B2`。
4. **✅ Wave C（DONE）— trigger ノード → automation**: 「＋ trigger」で build_state trigger ノードを置き chain へ配線→「📋 auto」で `automations.json` に保存（trigger＋agent chain を workflow 化して ref）→「⚡ fire」/`/api/fire` の build_state event で **マッチ automation が chain を自動実行**（B2 `runFlow`・cockpit 可視化）。検証済（green→completed 2/2、非マッチ→fire なし）。done 基準 `docs/11 §2 Wave C`。
5. **✅ Wave D（DONE）— palette + MCP export**: 「☰ palette」＝agent/skill カタログ（hub 共有 index を検索）。node ✕ で canvas から外し palette ＋ で戻す（add サイクル）。per-node/palette「⧉ copy MCP call」（`send_handoff` 片）、per-flow「⇪ export」（workflow 保存＋`run_workflow` MCP 片を copy）。MCP search proxy は不要化（hub state＝同一 index）。done 基準 `docs/11 §2 Wave D`。
6. **✅ Wave E（DONE）— open-core ピッチ**: 「BuildHUD kills 手配線 cross-agent glue」を `docs/06 §6.8` に1枚（n8n/Cal.com/Langflow 対応表・各 Wave が消す glue・capture・正直 fence）。**cockpit ロードマップ A–E 完了**。
7. **▶ 拡張＝3 フェーズで実行（`docs/06 §6.9`/`docs/11 §2.5 f`）**: 巨人 marketplace（Salesforce/Google/MS/AWS）を **AI-native＋easy＋中立＋安全**で kill。需要は実証済（AgentExchange ~$800M ARR・wrapper 死・**非複製資産**で勝つ）。**WORK 市場に飛びつかず順に**:
   - **Phase 1（出荷優先・AI-native easy 中立 builder）= F ✅ G ✅ K ✅ L ✅ 完了**: G(mcp 実呼び出し・`mcp-client.mjs`)／K(component library〔Chat Input/Prompt/Chat Output〕＋typed-field template＋conditional ports＋playground)／L(Ghost Writer＝NL→検証済 flow を canvas に・heuristic＋LLM・agent draft)。＝AI-native・中立 surface（**入場料・単体では moat でない**）。
   - **Phase 2（moat）= H ★ ✅ ＋ I ✅ ＋ J ✅ 完了**: **H**=Agent Trust Boundary（capability passport＋data firewall＋tamper-evident audit・`trust.mjs`）／**I**=cross-vendor consensus（token-Jaccard medoid＋agreement）／**J**=build-state IR（語彙 10＋match DSL 8 演算子・`/api/buildstate`）。＝**巨人 walled/Langflow に「書けない flow」**を実機実演。**▶ 次=製品化 (a)（§5 冒頭・`docs/11 §2.6` 収益化 #1）**。
   - **Phase 3（North Star）**: **WORK 市場**=cross-owner agent 労働市場（reputation graph＝通貨・marketplace・AP2 settlement・emergent チェーン）。**前段=監査裏付き reputation（§2.6 #3）を marketplace より先に**。**GATE-1 実証後に本格化**。
   ⚠️ **Langflow 再調査（2026-06）**: MCP 双方向・flow を MCP 公開・「Langflow Assistant」＝NL→完全 flow 生成を既出（~146k★・IBM/watsonx）→ **K/L/D は catch-up＝入場料・本家に正面では勝てない。勝負は Phase 2 の H**（`docs/11 §0`/§2.5 f）。
   ⚠️ **GATE-1 未証明**（`docs/06 §6.9 B`）: 「中立・安全層に金を払う非巨人」を 10 人 interview→**3 人 🟢 で着手 GO**。$15T は channel-shift＋Gartner 自身の 40% 中止。
8. （温存）**GATE-1**: 実在の友人 1 人＋反復タスクを `prototype/gate1/`（招待文/runbook/SCORECARD）で 1 回往復 → 埋める。
9. （任意）`docs/05` R1/R2/R3 検証 / 投資家 1-pager。

**cockpit を動かす**: `node prototype/hub/hub.mjs --vendor stub` → **http://localhost:8795**。UI は **Langflow 流の flow-builder に再設計**（左 palette・上 toolbar〔Save / Run / Automate▾〕・中央 canvas・右 inspector・**🌐 JA/EN 切替**）。操作モデル＝**ノード移動＝本体ドラッグ／配線＝port ドラッグ／設定＝ノードを click→ inspector**（旧「重ねて送信」廃止、handoff 送信は inspector の Send から）。`--vendor stub`＝local agent を即時 in-process 実行（B1・worker 不要）。REMOTE agent のみ worker: `node prototype/hub/worker.mjs --config … --vendor stub|claude|codex`。
⚠️ 再開時 `lsof -tiTCP:8795` で hub の有無を確認、無ければ起動。

---

## 6. リポジトリ入口

| path | 役割 |
|---|---|
| `PROJECT.md` | これ（最初に読む） |
| `docs/01`–`03` | 製品 / 技術設計 / 自己赤チーム |
| `docs/04` | 外部 30-agent 赤チーム監査（原典） |
| `docs/05` | 検証 playbook（R1/R2/R3 + DM + script） |
| `docs/06` | ビジョン（pivot/白地/persona/市場 S1S2/capture/MCP） |
| `docs/07` | dogfood 手順（Persona C 1-handoff） |
| `docs/08` / `09` | 借りる OSS 部品 / 自前部品（≒堀） |
| `docs/10` | MCP control plane 設計 |
| `docs/11` | **cockpit roadmap**（Langflow/n8n 流用・visual flow-builder・Wave A–L） |
| `docs/12` | **Agent Trust Boundary SKU 1-pager**（最初の有料商品・ICP/束/課金/正直 fence） |
| `prototype/hub/` | **durable inbox + D&D cockpit**（offline 配送・presence・承認/auto。`README` 参照） |
| `prototype/gate1/` | **GATE-1 close kit**（recruit→run→score。最優先入口） |
| `prototype/README.md` | 1-handoff の動かし方 |
| `prototype/agents/README.md` | A社↔B社 cross-company demo |
| `prototype/mcp/README.md` | **MCP の使い方（次セッション入口）** |

---

## 7. 運用メモ（重要）

- ⚠️ **HOME git hazard**: 親（HOME）に誤って作られた `.git` がある。**この repo は `~/GioGio` で独立 `git init` 済**（toplevel が GioGio であることを毎回確認）。HOME repo には絶対 commit しない。
- commit は **safe-commit**（明示パス add → staged==expected 検証 → 1 行で commit）。`git add -A`/`.` 禁止。
- **private GitHub**: `shibu003/GioGio`（origin, main 同期済）。push は明示時のみ。
- `.gitignore`: `.env*`/`.dev.vars*`/secret/`.claude/`/`prototype/config.json`/`*.log` 除外。token は env(`A2A_SHARED_TOKEN`)、コミットしない。
- ⚠️ subagent 大量並列は **session limit** に当たり得る（当たった実績あり）。重い fan-out は控えめに。
- prototype は **dev は `--dev`、本番は `A2A_SHARED_TOKEN` 必須**（無いと起動拒否）。
