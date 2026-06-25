# 神龍 (Shenron) — ROADMAP（wave 一覧の正本）

> wave の **一覧と状態**はここに一本化。**詳細設計**は各 doc（§=docs/13 SHENRON / 10 MCP / 15 reach / 16 service）。状態: ✅出荷 / 🔬未検証 / 📋設計のみ / ⬜未着手。

## 核心
願い(自然文)→**発見(検索で最適機構判断)**→plan→生成→承認→実行→定期化。北極星=①人生ゴール concierge ②Langflow 独立（[[shenron-northstar]]）。堀=従量0(本人サブスク)＋ローカル・クレデンシャル＋道具生成（[[whitespace-grounded-2026-06]]）。背骨=**お財布適応**（コストを強制しない・無料/BYO-key/有料の3 tier・docs/16 §0.5）。

## 出荷済み（✅・全 push origin/main）
| Wave | 内容 | 詳細 |
|---|---|---|
| 0 spikes | gate1=LLM-resolve / gate2=生成 8/8 収束 | §13 J |
| 1 | `POST /api/shenron/plan`（NL→plan IR） | §13 J/5 |
| 2 | 外部発見 discover v1（gap→search） | §13 J |
| 3 | plan→Langflow interop（描画可能 kind 限定） | §13 J |
| 4 | gen_component（生成→サンドボックス収束→修復） | §13 J |
| 5 | 対話修正（refine） | §13 J |
| 6 | 実行（native fireNode・新規コード0） | §13 J |
| 7 | flow→Claude Code SKILL.md | §13 J |
| 8 | 生成部品 登録庫（build→vet→remember→re-plan） | §13 J |
| 9 / 9.1 | 生成を standalone MCP server に転換 / BYO-credential 注入 | §13 J |
| 10 | gate UI | §13 J |
| 11a/b/c | **computer-use**（stateful browser-worker + allow/ask/deny + 人 checkpoint + agentic NL ループ） | §13 J |
| 使いやすさ | 登録だけで動く / 永続ログイン profile / 全機能 MCP / e2e | memory |
| **B** | tool-awareness（`add_integration`・`availableSummary`・planFlow 統一・正直 note）`438d0d5` | §10 §11 |
| **A** | self-contained（`renderPlan`=Mermaid+ASCII 図+人間可読 summary・checkpoint CLI）`5b16f15` | §10 §11 |
| **C** | クラウド到達（CORS・runner の API 分岐・act route を OAuth/bearer gate）`eeaf22a`/`02d7a9a`。Railway は見送り | §15 |
| gen_component 修正 | remote-MCP vendor 'stub'→'claude' + vendor 不在 fail-fast `1db92d2` | §13 J |
| **discover-first** ✅ | 願い→研究→曖昧/地雷なら `clarify` で確認→`context.choices` で再 plan（検索は BYO AI・M1） `3d3b799`。**cockpit view = wish bar `05fbef0`**。**✅実機検証済（2026-06-21・ローカル）**: 検証A behavioral＝「SNS始めたい」→clarify(X/IG/TikTok/note)+blockers、「楽天転売」→clarify+blockers(出店有料/ToS/転売禁止法/RMS API店舗限定)、nodes:0。検証B＝`claude -p` が **WebSearch 発火確認**（出力に `Sources:` + 2026 一次 URL）＝真の crux YES。残=ngrok+claude.ai の MCP transport のみ（他 connector で実証済）。**rough edge**: 同一 goal で claude -p 2回が X-API事実を微妙に違えた（「無料tier廃止」vs「月1500書込OK」）＝非決定的・両方 grounded だが要観測 | §10 §11 |
| **scheduler + robustness** | cron 発火 + **catch-up**（`lastDue`+`schedule-state.json`・downtime 後 boot で追い発火）+ `POST /api/tick`（外部 cron seam）+ `add_automation`。`SHENRON_NO_SCHEDULER` で off `663e9d1`/`1b36350` | §15 |
| **cost 設定** | `plan_flow {cost:'free'/'paid_ok'}` を discover が honor `44bae59` | §16 §4 |
| **Wave D** | `list_workflows` / `GET /api/workflows` / `search_workflows` に `summary` + `lastRun` を追加 `bc392e4` | 本 doc |
| **Wave F-2 shenron.html** | 神龍全機能を最小 UI で提供（6タブ: 🐉Wish / 📋Workflows / ⚡Runs / ✅Handoffs / 🔧Deployments / ⚙Settings）。Tailwind Play CDN + Alpine.js 単一ファイル。hub に `/shenron` ルート追加。 | §16 |
| **Wave H** | **Push通知**（`emitRunNotify`）: flow run 完了/キャンセル時に `kind:'notify'` integration へ webhook POST。`set_notify` MCP tool で Slack/LINE/Discord URL を登録。integrations.json に `slack-notify`/`webhook-notify` テンプレート追加。`59a2cdb` | 本 doc |
| **Wave I** | **Credential Vault**（`vault.mjs`）: macOS Keychain (`security` コマンド) primary + `~/.giogio/credentials.json` file fallback。`set_credential` / `get_credential` / `list_credentials` / `delete_credential` MCP tools。hub `/api/credentials` route。`59a2cdb` | 本 doc |
| **Wave J** | **Skill共有**（export/import）: `export_skill` でコンポーネントをポータブル JSON に export（credentials/ID 除去・安全に共有可）、`import_skill` で pending として import → `approve_component` で有効化。hub `/api/components/export|import` route。`59a2cdb` | 本 doc |
| **Wave K** | **First-run**（`bin/shenron.mjs`）: Node≥20 チェック → hub.mjs spawn のエントリーポイント。`package.json bin` フィールド追加 → `npx shenron-hub` または `node bin/shenron.mjs` で起動可。`59a2cdb` | 本 doc |
| **Wave L** | **Auth**（`auth.mjs`）: 登録・ログイン・メール認証・セッション管理。外部依存ゼロ（Node.js crypto のみ）。scrypt パスワードハッシュ・HMAC-SHA256 セッショントークン・timingSafeEqual・`~/.giogio/users.json`(mode 0o600)。認証リンクをターミナルに出力（メール送信不要）。`shenron_session` cookie(HttpOnly)で Web UI 保護。ユーザー0人の間はオープン（既存動作を維持）。bearerOk 拡張でセッション cookie も受け付け。`list_users` MCP tool。`9063235` | 本 doc |
| **Wave M** | **M-1**: パスワードリセット（`POST /api/auth/reset-request` → ターミナルにリンク出力・user enumeration 防止 / `POST /api/auth/reset` → token+新PW・timingSafeEqual+expiry）。`reset_password` MCP tool。**M-2**: `GET /api/runs`（直近20件）/ `GET /api/runs/:id`（フル）。`list_runs`/`get_run` MCP tool。**M-3**: `POST /api/notify/test`（enabled notify integration 全件にテスト POST）。`test_notify` MCP tool。**M-4**: `toggle_automation`（既存・hub.mjs:1103+server.mjs:237）。 | 本 doc |
| **Wave P** | **Agent Factory（作成→即MCP）**: `create_agent`（既存 `createAgent` を MCP 露出・name は `[a-z0-9-]`＝tool id 安全化）/ `delete_agent`（非破壊・新規受付のみ停止）/ `run_agent`（同期実行 `runAgentSync`）。**動的 tool 露出**: 作成した local agent が `tools/list` に **`agent_<name>`** として即出現（hub remote-MCP + stdio server.mjs 両surface・stdio は hub の live state を取得して append）。**`export_agent_mcp`**: agent を hub 非依存の standalone Python MCP server（stdlib のみ・`claude -p` で本人サブスク実行）として `prototype/mcp/generated/<name>-agent.py` に書出 → 任意 MCP client に登録可能なポータブル成果物。検証: 3 route + 動的露出 + 生成 server の MCP ハンドシェイク（initialize/tools/list）往復を実機確認。 | 本 doc |
| **Wave N-1** | **Credential injection at runtime**: vault に保存した credential をフロー実行時に注入。`runMcp` の生成 server spawn env を `{ ...safeEnv(creds), ...credentialEnv(creds) }` に（vault 値が process.env を上書き＝同名なら vault 優先）。`credentialEnv(names)` は宣言済み allowlist 名のうち vault に在るものだけ `{NAME:value}` を返す（null skip・値は log/audit に出さない）。**vault の価値を初めて実現**。検証: vault に TEST_KEY 保存 → それを宣言した生成 component を run → `os.environ` に届くこと＋input→mcp 送信が承認フェンスに留まること（egress 境界が壊れていない）を実機確認。 | 本 doc |
| **Wave O2** | **Flow テンプレートライブラリ（同梱テンプレ＋ワンクリック install＋MCP両surface）**: `prototype/templates/*.json` に runnable な同梱フローを3本同梱（`price-watch`/`daily-summary`＝組込 kind のみで install 後すぐ top-run可・`github-pr-notify`＝slack mcp ノード参照で honest gap 開示）。hub に `readTemplates()`/`templateGaps()`（requires 未設定 credential＋未登録/無効 integration を warning に集約・**値は出さず名前のみ**）+ `GET /api/templates`（token-light refs+gap警告）+ `POST /api/templates/:id/install`（`saveWorkflow` へ複製＝編集可能 workflow 化・id 上書き冪等・`trail('template-install')` は件数のみ）。MCP **両surface**: `list_templates`/`install_template`（hub.mjs `MCP_TOOLS`+`mcpDispatch`＝install は `saveWorkflow` 直呼び / server.mjs `TOOLS`+`callTool`＝hub `GET /api/templates`・`POST .../install` へ proxy）。ノード kind は実在（input/prompt/mcp/output）のみ・捏造ゼロ。 | 本 doc |
| **Wave S** | **セッション横断メモリ（グローバル注入・最小）**: `prototype/hub/memory.mjs`（vault.mjs と同型の自己完結 store・`~/.giogio/memory.json` mode 0o600・stdlib のみ・新依存ゼロ）に `addMemory`/`listMemories`/`deleteMemory`/`relevantMemories`（server.mjs の keyword/tag スコアラを流用＝embedding 無し・tag 重み2・query 未指定で新しい順 topN）。`runAgentSync` の prompt 組立に `relevantMemories(input,3)` を前置注入＝以降の local agent 実行（`run_agent`/`agent_<name>`/`POST /api/agents/:name/run` の3経路）に自動で効く（該当無しなら memBlock='' でプロンプト不変）。MCP **両surface**: `remember`/`recall`/`forget`（hub.mjs `MCP_TOOLS`+`mcpDispatch`＝`addMemory`/`relevantMemories`/`deleteMemory` 直呼び・recall は `{ memories:[...] }` で HTTP route と shape 統一 / server.mjs `TOOLS`+`callTool`＝hub `POST /api/memory {action:add|recall|delete}` へ proxy・relevantMemories は hub 単一実装を共有）。hub `POST /api/memory`（add/list/recall/delete・credentials route と同型・既存 bearerOk gate 配下）。秘密値は description で禁止明記（prompt 前置されるため）。 | 本 doc |
| **Wave O1** | **SSE 実行ストリーム（各ノード完了をライブ push）**: 長いフローが「動いているか死んでいるか」見えない問題を解消。`advanceFrom` 先頭に `emitRunEvent(run.id,{type:'node',...})` を注入し、in-memory listener レジストリ（`runListeners` Map + `emitRunEvent`/`closeRunListeners`・永続化なし）で全 SSE client に push。完了/キャンセル時に `{type:'done'}` を流して close（`stopRun` の cancelled 経路含む）。`GET /api/runs/:id/stream`（`:id` より前に分岐・既存 bearerOk gate 配下・接続時に現 outputs を node イベントで snapshot 配信→listener 登録→terminal なら done で即 end）。MCP 両surface: `stream_run`（hub.mjs `MCP_TOOLS`+`mcpDispatch` / server.mjs `TOOLS`+`callTool`）＝常駐 SSE を保持しない claude.ai/stdio 向けに「接続時 snapshot＋完了/キャンセルまで（最大 timeout 秒・既定30/上限120）待って集約 1ショット返却」セマンティクス。server.mjs は hub `POST /mcp` を直叩きして mcpDispatch を再利用。UI: shenron.html `poll()` に `liveSubscribe()` を重ね running run へ EventSource を1本張り outputs を即時 in-place パッチ（3s poll は保険）。 | 本 doc |
| **Wave U-1** | **MCP 両surface統一（共有 tool レジストリ）**: 新規 `prototype/mcp/tools.mjs`（単一 `TOOLS`＋`PROXY`＋`forStdio`/`forRemote`/`REMOTE_DENY`）を server.mjs/hub.mjs が両 import＝定義 drift 不可能。hub `mcpDispatch`＝`proxySelf` ループバック＋`list/get_handoff` in-process で **remote 23→44 tool**。`REMOTE_DENY`(秘密値/権限/認証だけ claude.ai 遮断・mcpDispatch でも dispatch 拒否)。surface 乖離ガード test 同梱。`cad8618`（origin/main 反映済） | 本 doc |
| **Wave Q** | **モバイル PWA（shenron.html をホーム画面インストール可能に）**: UI のみ。新規 `prototype/hub/manifest.json`（🐉絵文字を slate-900 背景に描いた SVG data URI アイコン＝バイナリ依存ゼロ・`start_url:/shenron`・standalone・theme `#0f172a`）+ 新規 `prototype/hub/sw.js`（最小 service worker・`CACHE='giogio-v1'`・app shell `[/shenron,/manifest.json]` を cache-first・`/api/*` `/mcp/*` `/oauth/*` `/.well-known/*` は network-only ＝承認/inbox/egress がキャッシュされない・POST は不介入＝trust 境界不変）。hub.mjs に既存静的配信と同パターンの `GET /manifest.json`（`application/manifest+json`）+ `GET /sw.js`（root 配信で scope='/'・`cache-control:no-cache`）を `/shenron` route 直後・OPTIONS より前に追加（`MANIFEST_FILE`/`SW_FILE` 定数）。shenron.html `<head>` に manifest link + apple-touch-icon(SVG data URI) + theme-color/apple-mobile-web-app メタ群、末尾に `load` 後の `navigator.serviceWorker.register('/sw.js')`（失敗は warn のみ＝非対応ブラウザでも UI 無傷）。MCP tool は不要（UI のみ）。 | 本 doc |
| **Wave G** | **multi-AI / per-step model routing（完全クローズ）**: provider adapter（Ollama/OpenAI/Gemini）＋ planner が step ごとに `tier:cheap/strong` 付与 → `tierModel` で vendor/model 解決（env で per-budget 上書き・cheap→無料ローカル/haiku）＋ auto-escalation（cheap 失敗 sentinel `→ stub]` 検出時だけ strong 再試行）＋ planner が high-stakes step に `consensus` node emit（N vendor 投票・cost 連動既定）＋ agent/prompt node の per-node vendor/model 明示 ＋ discover の auto-routing 提案（tier×cost を plan に surface・実行と一致）。`adab1b0`/`f643b75` ほか。詳細メモ↓ | 本 doc |
| **Wave Ambient-1** | **観察→提案（自分データのみ）**: `detectSuggestions()`（tickScheduler 相乗り）→ `suggestions.json`（kind:automate/fix・冪等・cap100）。`list_suggestions`/`dismiss_suggestion`/`apply_suggestion` MCP 両surface。settings.html に 💡 神龍の提案 UI。`5187618`/`f20e64f` | 本 doc |
| **Wave UI S1〜S5** | **成果物 UI ビューア→plan UI 要否判断（全スライス完走）**: S1=ui2.html に 🎨 ボタン + `<iframe sandbox="allow-scripts">` + fetch-shim→`/api/artifact-llm` proxy（鍵はブラウザ不可視）`598b8c0`。S2=approve/advance bridge（postMessage ホワイトリスト）`9de279d`。S3=flow↔UI 紐付け（`set_flow_ui`/`get_flow_ui` MCP tool + hub route）`fbb5274`。S4=`gen_artifact_ui`（bridge 規約付き JSX 生成）`829457c`。S5=plan 段階 `ui_hint:"none"|"generate"` 要否判断（PROMPT+buildPlanIR+renderPlan+tools.mjs）`a6d53b2`。 | 本 doc |
| **Wave R-1** | **成果検証→通知（Resilience 最小スライス・✅判定中核も完成）**: automation の `expect`→run 完了ブロックの `completedAt` exactly-once ガード→`checkOutcome`→`evalExpect`（shenron.mjs 純粋）→ fail で `emitRunNotify('check_failed')`＋`state.checkResults`(cap50)。MCP 両surface `set_check`/`list_check_results`。`f4be4df`（merge `5d1af31`・O1 SSE と completedAt で統合）。**判定中核 `evalExpect` 実装済 `99aa25b`**: assert=決定論($0・contains/!contains/equals/regex/json:path=val・bad regex/non-JSON は fail)、judge=cheap-LLM yes/no（**送信前 redact() で secret/PII firewall＝新 egress を塞ぐ**・stub sentinel/例外は fail-closed・reason に生 output 無し）。R-2/R-3 は↓大規模計画 | 本 doc |
| **Wave Remix-1** | **フロー fork→改造→部品化**: 既存 flow を fork して改造し別 flow に sub-flow ノードで再利用。`cloneWorkflow`(deep-copy `structuredClone`→`${id}-copy-<rand4>` 一意化→`saveWorkflow`・ui/summary/tags 引継ぎ・lastRun/automation束縛は引き継がない)。MCP 両surface `clone_workflow`(remote・mcpDispatch)＋`POST /api/workflows/:id/clone`＋shenron.html 🗂「⧉複製」。再利用(部品化)側は既存 sub-flow ノードで既に稼働＝欠けてた fork のみ追加。`76979ba`(未push)。HTTP e2e 7 assert+surface guard green | 本 doc |
| **Wave UI-Compat-1/2/3** | **backend 機能の UI 反映（settings.html 整合性監査 driven）**: UI-Compat-1=Credential Vault + Webhook 通知セクション（登録/削除/Test ボタン）`cd6cb40`。UI-Compat-2=Goals CRUD + 手動 checkin + 成果検証 set_check expect 設定（直近 check-results 表示）`454d941`。UI-Compat-3=テンプレート install（ワンクリック + gap 警告）+ 登録ユーザー一覧 `7d5cdb9`。 | 本 doc |
| **Wave N-2 / O-3** | **N-2 セッション永続化**: auth.mjs sessions を `~/.shenron/sessions.json` に永続化（起動時ロード・期限切れ自動パージ・ハブ再起動後もログイン維持）。**O-3 ハブ死活監視**: `GET /api/health`（認証不要・uptime/scheduler/version）+ `hub_health` MCP 両surface。`824e3a2` | 本 doc |
| **Wave R-2** | **repair loop**: `onFail:'repair'` 時に fail した run の generated component を `genComponent` で自動再生成 → `approved:false`（`approve_component` 待ち）。`maxRetry` でループ防止。`repair_run` MCP tool で手動トリガーも可能。stdio 71 / remote 59 tools。`552431c` | 本 doc |
| **Wave N-3** | **`shenron doctor`**: 初回で詰まる原因（Node バージョン・Playwright Chromium 未インストール・ポート競合・A2A_SHARED_TOKEN 未設定・users.json 状態）をチェックし修正コマンドを表示。`bin/shenron.mjs doctor` CLI ＋ `GET /api/doctor`（認証不要）＋ `hub_doctor` MCP 両surface（stdio 72 / remote 61 tools）。`prototype/hub/doctor.mjs` に共有チェックロジック。 | 本 doc |
| **Wave Goals-2** | **ゴール concierge 能動化（自動 checkin + 期限/停滞通知）**: tick 相乗り `checkGoals()` が active ゴールの期限接近(3日前・overdue 含む)/停滞(14日無活動)を検出→`emitGoalNotify` push（`notified` 冪等）。bound automation の成功 run を `advanceFrom` 完了ブロックで自動 checkin（`current+=1` カウント式・stalled→active 復帰）。判定核＝`shenron.goalStatus`(純粋)。通知ループを `pushNotify` に単一化。`set_goal` に `automationIds`。新 MCP tool 無し（内部 hook）。settings.html status 色分け。 | 本 doc §Goals |
| **Wave Goals-3** | **停滞ゴールの「次の手」提案（能動 concierge）**: `goalSuggest(id)`＝`planFlow(save:false・従量0)` で次の一手を提案し `suggestions.json` に kind:'goal' を冪等 push。`checkGoals` 停滞検出で `setImmediate(goalSuggest)` 自動 push ＋ `goal_suggest(id)` MCP **両surface**（stdio 74/remote 65）+ `POST /api/goals/:id/suggest`。UI＝「💡 次の手」ボタン + 🎯 提案ラベル。`applySuggestion('goal')` 再 plan は scope-drop。 | 本 doc §Goals |
| **Wave Canvas-n8n S1** | **canvas を n8n 視覚言語へ（固定 I/O ポート＋矢印）**: ui2.html のみ・backend/MCP 不変。`endpointPos` を C1「floating」(borderPoint) から**固定ポート**へ逆転＝source は右辺中央(OUT 丸 dot)・target は左辺中央(IN 矩形タブ)、router source は then=上/else=下の2レーン。`drawLinks` の可視 path に `marker-end=url(#arrow)`（svg `<defs><marker fill=context-stroke>`・線色追従）＝**左→右＋矢印 ▶** で向きが一目。`renderNodes` 各ループに `portHTML(hasIn,hasOut)`（`accepts`/`emits` 駆動＝trigger は OUT のみ・output は IN のみが自動）。配線起点を OUT ポートに（`attachNode` pointerdown で `.port.out`→`startWire`・`.port.in` は drop 専用）、rim-drag(`nearRim`)は後方互換で残置。CSS `.port.in` を矩形タブ化（既存 L112-118 の未使用足場を再利用）。新規 `docs/CANVAS_REFERENCE.md`（canvas 完全リファレンス＝記号/ノード/コンポ/ポート/線/関係性/操作の正典）も同時新設。検証：hub 起動 OK・inline JS `vm.Script` 構文 green・`test_nodes.mjs` 無回帰 green。S2〜S5 は↓§Canvas-n8n に設計正本。 | 本 doc §Canvas-n8n / docs/CANVAS_REFERENCE.md |

## 設計のみ（📋・実装は方針決定後）
| Wave | 内容 | 詳細 |
|---|---|---|
| **F サービス化/デプロイ** | compute 売らず control plane を売る／お財布適応 3 tier／常駐箱(Pi5・Mac mini・claude -p≫Ollama)／配布先 OpenClaw(MCP client ~380k★)／「hub も使える」=managed hub(BYO-key・browser-control 不可) | §16 |
| **U-2 MCP 完全統一（見送り）** | 完全統一（stdio attended dry-run 撤去・server pure proxy 化）＋ run_handoff の a2a を hub 移植。「限界価値小×リスク大」で**意図的見送り**（U-1 で主目的達成・hub は agent URL を持たない in-process モデル）。再開時の安価スライス=`fire_event`(=/api/fire 既存)・`run_automation`(find→runFlow) を remote 露出のみ。 | 本 doc |
| **Wave UI — 成果物UI（操作面）** | 神龍が足りない道具を自作する性質上、**操作必須の UI 付き生成物が頻発**する。ui2.html 内で特定 flow の成果物 UI を見て操作 → その操作で自動化フローが進む（人在ループのリッチ checkpoint）。スマホ+PC 両対応。神龍は **plan 段階で UI 要否を判断**（承認だけ→通知で十分=UI無し／操作+可視化が要る時だけ生成）。sandbox iframe(JSX+Babel)で描画・**鍵は箱に残す fetch-shim**・操作→bridge→hub が advance。Lovable(bespoke アプリ生成/別ホスト deploy)ではなく control-plane 内で「成果物に顔を付ける」。 | 下記メモ |
| **大規模 Wave（R-2/R-3・Goals・Login・Ambient）** | 「生成の*後*の世界」4群。**R-1 は出荷済**（上表）。R-2(repair)/R-3(drift)・Goals(ゴール記憶)・Login(クレデンシャル生命管理)・Ambient(観察→提案) は↓「大規模 Wave 計画」セクションに設計。実装順 `R→Login→Goals→Ambient`。 | 下記 |
| **テナンシー Wave（社内＝課金土台）** | 個人=永久無料 wedge / 社内=seat 課金の**課金"対象物"**を作る。欠けてた唯一のプリミティブ=テナンシー(owner/visibility)。`T-0` 土台 → `A` 共有エージェント庫（生成×再利用）→ `B` 共有ハブ/管理。**会社間+trust 商品化は切った**（価値薄・user 判断）。billing 機構は seam のみ（後付け）。実装順 `T-0→A1→B1→肉付け`。 | ↓「テナンシー Wave 計画」 |
| **Wave Cockpit（玄関統合 + ノード検証 + UI/UX）✅0/1/2** | 3 cockpit(ui.html旧/ui2作業場/shenron事務所)の drift を「玄関 router」で統合。**`Cockpit-0`(検証)/`1`(玄関+ui.html退役)/`2`(攻殻 UI テーマ統一+⌘Kナビ+役割分離) は完了・PR #1 `50acb65` で main マージ済**。残=`3`(UX 磨き)。B1 の前後可。 | ↓「Wave Cockpit 計画」 |

## Wave UI — 成果物UI（操作面）設計メモ

> 出発点（user 2026-06-22）: 「自動化された際に制作物によっては UI が必要。承認だけならメール/Slack/message で十分だが、制作物によっては**操作と可視化**まで要求される。神龍が足りない道具を自作する性質上このケースが**頻発**する。ui2.html の中に、自分の作った特定 flow に対する制作物 UI を見る場所が要り、そこで**操作するとフローが進む**仕組みも要る。デプロイではなく**ユーザーが新たな作成物を見れる場所**。」

**位置づけ**: Lovable / v0 とは別物。bespoke アプリ生成や別ホスト deploy ではなく、control-plane(hub)内で生成物に「**操作できる顔**」を付ける。出力カテゴリが違う（[[docs/17]] の扉3定理＝堀は「鍵を箱の外に出さない」）。

### A. 神龍の plan 判断（UI 要否・必須）
plan_flow が **UI を作るべきか**を分類する（過剰生成しない=YAGNI）:
- 出力チャネルで足りる（通知・承認のみ）→ **UI を生成しない**（メール/Slack/message へ）。
- **操作 + 可視化**が要る（一覧から選ぶ・編集する・ダッシュボード・人が途中で判断して進める）→ **成果物 UI を生成**。
- 判断は plan の各 step / 成果物の性質から（例: human-in-the-loop な編集ステップ・可視化要求）。

### B. 配置・体験
- **ui2.html 内**にビューア面。flow を選ぶ → 成果物 UI を表示・操作。
- **スマホ + PC 両対応**（レスポンシブ・スマホはフルスクリーン寄り）。

### C. レンダリング & セキュリティ（load-bearing）
- 形式 = **JSX + Babel standalone**（実物が `import {useState} from "react"` + `export default function App` 形式 → import/export を剥がし global React に束ねて描画）。
- 生成物は **untrusted コード** → **`<iframe sandbox="allow-scripts">`（same-origin 無し＝origin-null）** で隔離。親の cookie/localStorage/credential に触れない。
- iframe の `fetch` を **shim**し `api.anthropic.com` 宛を **親→hub に転送**（`/api/artifact-llm` proxy）。**鍵は箱に残り生成物は鍵を見ない**（[[docs/17]] の bearer 整合）。CORS も hub 経由で解決・既存生成物（直 fetch）も無改変で安全動作。
- bridge = postMessage **ホワイトリスト**（親が `e.source===iframe.contentWindow` を検証・許可アクションのみ）。
- ⚠️ 実物の教訓: 貼られた CSUEB_MAIL artifact は `fetch("https://api.anthropic.com/v1/messages")` を**ブラウザから直接**叩く（鍵ブラウザ露出 + CORS 失敗）→ shim が必須。gen_component の Python サンドボックスの**ブラウザ版**。

### D. 操作 → フロー前進
artifact は `run.outputs` / 承認待ち(handoff awaiting_approval)を読んで描画 → 操作（承認/編集/選択）→ bridge → hub が **advanceFrom / approve**（既存 checkpoint・handoff approval 機構の**リッチ版**として再利用）。

### E. 実装スライス（WIP=1・実装は方針決定後）
- **S1**: ui2 内 sandbox ビューア（描画 + レスポンシブ + fetch-shim → `/api/artifact-llm` proxy）。
- **S2**: 操作 → flow advance（approve/advance bridge・ホワイトリスト）。
- **S3**: 成果物 UI を flow に紐付け（`saveWorkflow` に `ui` 欄 + `/api/workflows/:id/ui` + `set_flow_ui`/`get_flow_ui` MCP tool）。
- **S4**: 神龍が成果物 UI を**生成**（gen プロンプトが bridge 規約で JSX 出力・`api.anthropic.com` 直 fetch 禁止・レスポンシブ強制）。
- **S5**: plan 段階の UI 要否判断（A）。
- MCP-FIRST: 全 step に対応 MCP tool。関連: 既存 checkpoint/handoff approval・gen_component。

## Wave UI-Compat — backend 機能の UI 反映（整合性監査 driven・2026-06-22）

> 発端（user）: 「並列 agent で機能ごとに互換性がなくなっている」「UI にも反映できていない機能がたくさんある」。Explore 3本（MCP両surface / UI / 機能間意味）で監査 → **誤判定を裏取りで除外**した正味の結論。⚠️ Explore は最近の commit を反映せず誤検知が多かった（鵜呑み禁止・[[check-before-build]]）。

### 監査の正味結論（誤判定を除いた後）
- ❌ **「MCP remote 16件欠落」は誤判定**: surface guard 緑（stdio 62/remote 50 all dispatchable）。`search_*`/`get_*`/`build_state`/`run_*`/`fire_event` は `surfaces:['stdio']`＝**意図的に remote 除外**（U-1 設計通り）。`save_workflow`/`get_checkpoint` 等 `['remote']` は mcpDispatch 実装あり。**MCP 両surface は整合**。
- ❌ **「login-state 未統合」「judge redact test 欠如」も誤判定**: どちらも実装済（Login-1 `65f8ac7`・R-1 `99aa25b`）。
- ✅ **真の問題は2つだけ**: ① UI が backend に追いついてない ② BuildHUD→神龍 リネーム漏れ（ユーザー可視）。

### 問題1: UI 未反映（出荷済 backend が cockpit で操作不可）
shenron.html / settings.html に操作 UI が無い出荷済機能:
- ✅ Credential Vault — `cd6cb40`（UI-Compat-1）
- ✅ Webhook 通知 — `cd6cb40`（UI-Compat-1）
- ✅ Goals（CRUD + checkin）— `454d941`（UI-Compat-2）
- ✅ 成果検証（set_check expect + check-results）— `454d941`（UI-Compat-2）
- ✅ Templates install — `7d5cdb9`（UI-Compat-3）
- 🟡 Auth login・register form（Wave L backend 済・UI-Compat-3 は users 閲覧のみ）/ SSE live 進捗（ui2 済・shenron 未）
- 注: ui.html（旧フル）には credential/agent-factory 等が在る可能性 → 欠落は主に shenron.html/settings.html。

### 問題2: BuildHUD→神龍 リネーム漏れ（ユーザー可視）
- 🔴 `mcp-client.mjs:11` `CLIENT_INFO.name='buildhud'`（claude.ai 接続時に MCP client 名として見える）
- 🔴 `hub.mjs:1070` UI fallback `<h1>BuildHUD hub</h1>` / 起動ログ
- 🟡 `server.mjs` ログ `[buildhud-mcp]` / `serverInfo.name` / `build_state` description（内部寄り）
- ⚠️ `buildhud://` Resource URI は**外部接続済 claude.ai との互換性破壊リスク**＝**据置**（表示名と description のみ直す）。

### Wave 分割（WIP=1・1 Wave=1 commit・各 MCP backend 変更ゼロ＝既存 route を UI から叩くだけ）
- **UI-Compat-1**：settings.html に Credential Vault + Webhook 通知セクション（登録/削除フォーム + Test ボタン）。別claude 非接触ファイル＝低リスク。
- **UI-Compat-2**：Goals 操作 UI（CRUD + checkin 入力）+ 成果検証 set_check の expect 設定 modal。配置先（shenron.html タブ or settings）は着手時判断。
- **UI-Compat-3**：Templates install modal / Auth login・register form。
- **Rename**：ユーザー可視の BuildHUD→神龍（`CLIENT_INFO.name`・hub UI fallback/起動ログ・server ログ・description）。**URI は据置**。⚠️ 別claude の OpenClaw 作業と重複しうる → 着手前に分担確認。

### 制約（並列開発・memo 教訓）
- 別claude が shenron.html / OpenClaw / リネームを並列編集中 → **UI 編集は worktree 隔離 or settings.html に寄せる**（shenron.html 直接編集は衝突地獄）。
- commit は常に明示パス add（mine-only）。Rename は分担確認まで着手しない。

## 次にやる（TODO 集約・正本）

> 全ての「次にやる」をここに一本化（旧: 各 doc/CLAUDE.md/memory に散在）。完了は出荷済み表へ。状態の正本＝この doc。

### A. 実装（コード）
1. **Fly.io `hub.shibubu.ai` 反映**（`fly deploy`）— remote 64 tool / ui2 / settings（drift 検出 UI 含む）/ 神龍パネル / UI 認証フォーム がまだ本番未デプロイ（コードは origin/main `ea4f296` まで反映済）。
2. ~~大規模 Wave: **Goals-1**~~ — **✅完了（出荷済 `802d0c8` backend / `454d941` UI）**: 確認 Wave で backend(両surface)+UI が実機動作することを実証し、欠けていた e2e test（MCP 経由 set→checkin→reached→list 4 assert）を補完。**⚠️同 Wave で P0 リグレッション発見・修正**: `6f12c04` N-3 doctor が `await runDoctor()` を非 async handler に入れ **hub.mjs が起動不能だった**（main が壊れていた・一度も動いていない）→ Promise を `.then()` で返す 1 行修正。R-1/Login-1/Goals-1/Ambient-1 全 4 本これで実 green。
3. 小バックログ: ~~**N-3** `shenron doctor`~~（✅出荷 `6f12c04`・上記の起動 bug は修正済）/ ~~**U-2 安価スライス**~~（**✅出荷 `4121f26`**: `fire_event`・`run_automation` を remote 露出＝claude.ai から即発火・mcpDispatch 実装・surface guard remote 64 緑）。N-2/O-3 は出荷済。
4. ~~**UI への認証フォーム**~~ — **✅出荷 `0078c68`**: shenron.html に三状態（接続中/ログイン/アプリ）+ ログイン/新規登録/ログアウト・同一オリジン cookie で session 維持・`x-text` で XSS firewall（Wave L backend の上の薄い view）。
5. ~~**Wave R-1 の Learn by Doing**（`evalExpect`）~~ — **✅完了 `99aa25b`**: assert（決定論・contains/!contains/equals/regex/json:path=val）+ judge（cheap LLM yes/no・送信前 redact() で egress firewall・fail-closed）を実装。R-1 完全動作。残＝R-2(repair)/R-3(drift) は大規模計画。
6. ~~**Wave UI S1〜S5**（成果物UI ビューア → plan UI 要否判断）~~ — **✅完了**: S1=ビューア `598b8c0` / S2=approve/advance bridge `9de279d` / S3=flow↔UI紐付け `fbb5274` / S4=gen_artifact_ui `829457c` / S5=ui_hint `a6d53b2`。**Wave UI S 完走**。

7. ~~**Wave Remix-1**（`clone_workflow`・フロー fork→改造→部品化）~~ — **✅完了 `76979ba`（push 済）**: `cloneWorkflow`(deep-copy→新id一意化→`saveWorkflow`) + MCP両surface + `POST /api/workflows/:id/clone` + 🗂 Flows「⧉複製」ボタン。HTTP e2e 7 assert + surface guard green。詳細↓「## Wave Remix」。Remix-2/3 は意図的 skip（理由+いつやるか 記載済）。

### B. user 判断（方針）
8. ~~**beachhead ジャンル選定**~~ — **✅ 開発者自動化に決定。縦串デモ実装済み**: `prototype/templates/` に 3 本追加（`dev-code-review` / `dev-changelog` / `dev-incident-triage`）。全て `requires:[]`＝install 直後に run 可能・`claude -p`（本人サブスク）で従量ゼロ。**dog-food シナリオ**: `fire_event {type:"ci_fail", log:"..."}` → `dev-incident-triage` automation → `set_check` assert → `drift_detected` まで全スタックが連結（Waves B+C を即使える）。
9. **マネタイズ軸の決定**（BYOK flat / control-plane / governance-marketplace）→ §16 §5。
10. **§16 未確定**: OpenClaw 統合深度 / 常駐箱 one-click(MCPB) / managed hub を立てるか / Ollama tiering。

---

## Wave Remix — フロー/部品の再利用（fork・改造・部品化）

> 発端（user 2026-06-23）: 「すでに持っている flow や生成した部品を、他の flow の際に流用したり、コピーしたものを再利用して改造して新たな flow の部品にできるように」。

**現状認識**: 「再利用（部品化）」の半分は **既に動く** — 保存済み flow は sub-flow ノード（`kind:'workflow'` + `node.ref` → `fireWorkflowNode` hub.mjs）として別 flow に nested run で組み込める。`install_template` も「clone して編集可能 workflow にする」パターンを実証済（`saveWorkflow`・同梱テンプレ限定）。**欠けていた primitive = 自分の既存 flow を fork（コピー）して改造する手段**（`saveWorkflow` は同 id 上書きでコピーを作れない）。

**Remix-1（最小縦串・✅出荷 `76979ba`・push 済）= `clone_workflow`**
- hub `cloneWorkflow(id, name)` = 保存済み flow を deep-copy → 新 id 採番 → `saveWorkflow`。元は不変、コピーを改造して sub-flow ノードで別 flow の部品に再利用。
- MCP 両surface: tools.mjs `clone_workflow`（`surfaces:['remote']`・`save_workflow` と同型）+ hub `mcpDispatch` 直呼び。
- HTTP: `POST /api/workflows/:id/clone {name?}`（UI 用・既存 bearerOk gate 配下）。
- **中核ロジック（実装済 hub.mjs `cloneWorkflow`）**: ① deep-copy（`structuredClone`・参照共有禁止＝コピー編集が元を壊さない）② 新 id 一意化（`${src.id}-copy-<rand4>`・slug 衝突で上書きを防ぐ）③ 引継ぎ/リセット（ui/summary/tags は引継ぎ・lastRun はコピー毎で非コピー・automation 束縛は引き継がない＝無束縛で始まる）。
- 検証（中核実装後）: flow を clone → 新 id で 🗂 に出る → コピーを改造 → 別 flow に sub-flow ノードで挿す → run（元 flow 無傷）。
- **UI 反映（同 commit・[[feedback_ui_sync]]）**: shenron.html 🗂 Flows に「複製」ボタン（`POST .../clone` 叩き）。

**意図的 skip（lazy・後続スライス）** ※各項目「理由 + いつやるか」を明記（[[feedback_skip_record]]）:
- **Remix-2**: `clone_component`（生成部品の fork）。**理由**: 現状 `export_skill`→`import_skill` で擬似 clone 可（pending として新規登録）＝専用 tool は重複。**いつ**: Remix-1 出荷後、beachhead デモ（次にやる B-8）で「部品をコピーして改造する」操作が実際に発生し、export/import 2 手が手間だと観測された時点。観測ゼロなら作らない。
- **Remix-3**: collapse — flow の一部（複数ノード選択）を 1 つの再利用 sub-flow に切り出す UX。**理由**: trust ブランチ ③b-2 に既存だが React Flow 寄りで重く、Remix-1 の `clone_workflow`＋既存 sub-flow ノードで「丸ごと fork して挿す」は既に賄える。**いつ**: 「## Wave UI — 成果物UI（canvas 操作面）」を本格着手する Wave に同梱（単独では作らない＝canvas 編集体験とセットで初めて元が取れる）。

**MCP-FIRST 整合**: `clone_workflow` は server.mjs/hub.mjs 共有の tools.mjs に登録＝両surface drift 不可能。

---

## 🔬 次セッション手順: discover-first 実機検証（#1・全土台・cleared でもこれを実行）

**クルックス**: `plan_flow`(MCP) → `shenron.mjs plan()` が **hub の `claude -p`** に PROMPT を投げ、その1回の LLM 呼び出しの中で "RESEARCH the goal (use web search if you have it)" を期待。検索は claude.ai 側でなく **hub 側 LLM** で走る。よって核心は「**hub の `claude -p` が実際に web 検索するか**」。`plan()` には `search` seam もある（不合格時の補強路）。

**起動**（従量0 維持＝`ANTHROPIC_API_KEY` を設定しない・`--vendor stub` も付けない＝real `claude -p`）:
```
node prototype/hub/hub.mjs            # → :8795（stub なし＝本物の claude -p で planner 実行）
ngrok http 8795                       # → HTTPS URL（docs/15 §C4）
# claude.ai → Settings → Connectors → https://<ngrok>/mcp/sse （OAuth は hub auto-approve）
```

**検証A — behavioral discover（PROMPT ロジック・web 検索非依存で効くはず）**: claude.ai から自然文 → claude が `plan_flow` を呼ぶ。
- 「SNS を始めたい」→ 期待: `mode:"clarify"` で X / Instagram / Facebook 等を聞き返す（steps を出さない）。
- 「楽天で転売したい」→ 期待: `blockers` に ToS / 古物商許可 / 購入 API 無し（＋ browser-control の線）を出して止める。
- ✅判定: clarify/blocker が出れば discover-first の構造は生きてる。steps をいきなり出したら PROMPT 不足。

**検証B — web 検索の接地（🔬 真の crux・A が通っても別問題）**: 「現在の事実」が要る goal で鮮度を見る。
- probe goal: 「X(旧Twitter) の無料 API だけで自動投稿したい」→ 現実(無料 tier は実質投稿不可・有料)を blocker で出せば**検索 or 最新知識が効いてる**。古い「無料でいける」前提なら未接地。
- isolate: 別途ターミナルで `claude -p "今日時点で X(Twitter) の無料 API は投稿できる? web で確認して"` を直接実行し、claude -p が**そもそも WebSearch する権限/設定か**を切り分け（plan_flow 内かどうかと独立に）。

**不合格時の補強（順に）**: ① PROMPT 強化（DISCOVER FIRST を更に強制・「検索してから」を明示）→ ② `claude -p` に WebSearch を許可する設定（権限/allowedTools）→ ③ **hub 側検索 integration**（`add_integration kind:'search'` → `plan({search})` seam に結果を流し込む＝LLM の web 権限に依存しない）。③が最も確実（神龍が検索結果を構造化して渡す）。

**この後**: 検証 OK なら Wave G 残「discover の自動 routing 提案」に進める（discover が capability+cost で vendor/tier を提案）。NG なら上記補強を1コミットずつ。

---

## Wave G — multi-AI（複数 AI 同時）設計メモ
**現状（既にかなり在る）**: ① `consensus` node kind（同一タスクを N vendor 並列→medoid 投票・既定 `claude,codex,gemini`・`hub.mjs` fireConsensusNode/runConsensus）② per-agent `vendor` ＋ `EXEC_VENDOR` 上書き ③ A2A マルチエージェント handoff（agent→agent）。
**足りない物**: ① `runner.mjs` が claude(/API)・codex のみ → **OpenAI/Gemini/Ollama の provider adapter 追加**（ANTHROPIC_API_KEY path と同型の fetch wrapper）。② planner が per-node vendor / consensus node を emit しない（plan_flow に vendor 選択が無い）。
**moat 整合の足し方（推奨）**: お財布適応の延長＝**per-step model routing**「cheap step(要約/分類/整形)→ローカル Ollama or Haiku、judgment/discover→本人の Claude、high-stakes→consensus で複数投票」。従量0(本人モデル) を保つ。
**off-moat（trend 追い・避ける）**: 「有料 frontier API の panel」を看板にするのは 従量0 を壊し OpenRouter 等と同質＝table-stakes。multi-AI は**手段**（安く・確実にする routing/consensus）であって差別化ではない、と正直に。
**最小スライス案**: (1) runner に Ollama provider（ローカル・無料・cheap step 用）+ 任意で OpenAI/Gemini（BYO-key・cost:paid_ok 時のみ）。(2) plan_flow/automation に `vendor`/`consensus` を任意指定可能化。(3) discover が cost+capability で自動 routing 提案。

**✅ 出荷済み（per-step model routing スライス）**: flow の **prompt ノード単位でモデル/vendor を分ける**経路が通った:
- planner が step ごとに `tier:'cheap'|'strong'` を付与（PROMPT・cheap=要約/分類/整形, strong=判断/codegen・既定 cheap で節約）。
- buildPlanIR が tier を step + prompt ノード config に持ち越し。
- 実行時 `firePromptNode`→`runPrompt` が **node の vendor/model 明示 > tier→model > 既定** で解決。`tierModel`: cheap→`SHENRON_MODEL_CHEAP`(既定 haiku) / strong→`SHENRON_MODEL_STRONG`(既定 opus)＝**env で per-budget に上書き**（free 派は cheap→ローカル/haiku）。
- runner.mjs が per-call `model` を受け、API path と `claude -p --model` 両方に適用。
- power user は flow の **prompt / agent** node に `vendor`/`model` 直指定も可（agent node: `runLocal` が per-node 明示 > `EXEC_VENDOR` > agent 既定で解決・model も runner に渡す。後方互換）。
- ✅ **Ollama provider（cheap step を完全無料に）**: runner に `ollama` vendor（`OLLAMA_HOST` 既定 localhost:11434・`/api/generate`）。**`SHENRON_CHEAP_VENDOR=ollama`（＋`ollama serve`）→ cheap step は cloud/API path でもローカル $0**。consensus の vendors に `ollama` を入れても自動で効く。Win/Linux/Mac 同じ。MINIMIZE COST 既定 cheap と合わせ「安い 80% は無料ローカル、判断だけ Claude」。
- ✅ **OpenAI/GPT provider**（`adab1b0`）+ ✅ **Gemini provider**: runner に `gemini`/`google` vendor（`generativelanguage` v1beta・`x-goog-api-key`・`GEMINI_MODEL` 既定 `gemini-2.0-flash`・BYO `GEMINI_API_KEY`）。**bonus: consensus 既定 vendors=`claude,codex,gemini` で gemini が silently stub 落ちしていた潜在バグを解消**（key 無し時は `[gemini → stub] …未設定` の labeled fallback）。`test_runner.mjs` で no-key stub 契約を検証。
- ✅ **auto-escalation（cheap 失敗時だけ strong）**: `runPrompt` が cheap step の結果に失敗 sentinel `→ stub]`（runner が必ず付ける接頭辞）を検出したら strong route で1回だけ再試行。**成功すれば安いまま・失敗時だけ課金**＝お財布適応の背骨。発火= tier=cheap かつ node が vendor 非明示かつ on（`routing.autoEscalate:false` / `SHENRON_NO_ESCALATE=1` で off）。strong も落ちたら cheap の理由を残す。`test_runner.mjs` が sentinel 契約を固定。
- ✅ **consensus を planner から emit**: planner が high-stakes step（error-sensitive/不可逆/決定論的チェック無しの判断のみ・「稀に使え N× コスト」と教示）に `kind:'consensus'` を出せる。buildPlanIR が consensus node を emit（built-in・gap でない）・renderPlan が `🗳️ consensus` 表示・実行は既存 fireConsensusNode（N vendor→medoid 投票）。**既定 vendors は cost 連動**（free=`claude,codex,ollama`=$0／paid_ok=`claude,codex,gemini`）。MCP 完全到達（plan_flow→run）。`test_shenron.mjs` 追加。
- ✅ **agent ノードの per-node vendor/model**: flow の agent node に `vendor`/`model` 明示で「この step だけ別 AI」。`runLocal` が per-node 明示 > `EXEC_VENDOR` > agent 既定で解決（後方互換: 未指定の既存 node は従来通り）。mcp node は tool 呼び出しで LLM vendor 概念なし＝対象外。
- ✅ **discover の auto-routing 提案（`f643b75`・Wave G フルクローズ）**: planner の tier(=capability) × user の cost 設定(=vendor) を合成し、各 step が「どの AI で・いくらか」を plan に surface。`shenron.mjs` 純粋 `routeFor(node,step,ctx)` + `renderPlan(ir,ctx?)` が route ラベル（cheap→your Claude/ollama ~$0 ↑strong on fail・strong→your Claude・mcp→tool call $0・🗳️ consensus→N vendors N×）+ 🧭 Routing 提案行 + 構造化 `routing` 配列を返す（ctx 無し=従来通り・後方互換）。`hub.mjs` `routingCtx()` が実行時と同じ tierRoute/defaultConsensusVendors/cost/autoEscalate から ctx を作る＝**提案 = 実行と一致（truthful）**。moat 整合: planner は vendor を押し付けず tier だけ・vendor は財布設定が決める＝従量0 維持。bonus: `server.mjs` plan_flow が cost/context を転送（discover clarify ループが stdio MCP で完結しない既存バグ解消）。e2e: 「要約→go/no-go」で step1=cheap(haiku ~$0)・step2=planner が自動 consensus(claude,codex,ollama 3×) を選び routing に出た。test_shenron 検証追加。（Sakana 等の追加 vendor は公開 OpenAI 互換 API 無し→ollama 経由ローカルが筋＝新コード不要）
- → **Wave G は完全クローズ**（providers / per-step routing / auto-escalation / consensus-from-planner / per-node vendor / auto-routing 提案 すべて出荷）。

---

# 大規模 Wave 計画（設計・2026-06-22）

> 神龍は「願い→道具生成→実行→定期化」まで閉じている。欠けているのは **生成の*後*の世界** — 作った道具が壊れた/期待外れだった/ゴールに届かない時に誰が面倒を見るか。下記 4 Wave 群はその穴を埋める。**設計の正本として一旦ここに置く**（実装着手時に詳細は §13 へ移送可）。各群とも **agile**：最小スライス(縦串1本)を先に出荷 → 肉付け。**WIP=1**（1 Wave=1 commit、終わるまで次に手を付けない）。北極星制約：**何を足しても同 commit で `server.mjs` の MCP tool 化**（cockpit-only な穴を作らない）。
>
> 既存 Wave A〜P と記号衝突を避けるためテーマ名で呼ぶ：**R=Resilience / Goals / Login / Ambient**。

## 実装順序（3-pass Pass-3 の結論）
`R-1 → Login-1 → Goals-1 → Ambient-1`（各最小スライス）→ 以降は肉付けを優先度順。
理由：**R が最も独立**（既存 run 経路 1 点に挿す）かつ堀直球（信頼性=moat killer）。Login は browser-worker 単独で**並列可**。Goals は新データ層で独立。Ambient は🔴リスク最大なので**最後＋最小縦串**から。

---

## Wave R — Resilience：成果検証 → 自己修復 ［元案A・🟢］
**✅ R-1 実装済み（`f4be4df`・main 反映済）**: automation の `expect`→完了ブロック `completedAt` exactly-once ガード→`checkOutcome`→`evalExpect`(shenron.mjs 純粋・**判定中核 assert/judge は TODO(human)＝次の Learn by Doing**)→ fail で `emitRunNotify('check_failed')`+`state.checkResults`(cap50)。MCP 両surface(`set_check`/`list_check_results`)。実機 e2e + review 4 lens 済。⚠️ 下記の接続点行番号は設計時のもの（O1 統合で実際は変動）。**R-2/R-3 未着手**。

**狙い**：定期 run のたびに「**期待した成果が出たか**」を神龍が判定し、壊れたら気づいて直す。`gen_component` の修復ループを**本番監視**に接続。巨人(Zapier)はコネクタが壊れたら人を待つだけ — **道具を生成できる神龍だけが道具を直せる**。

**アーキテクチャ（接続点）**
- **検証 hook = `hub.mjs:606`**（`run.status='completed'` の直後・全 run 経路の合流点）。同期再帰の中なので `setImmediate(() => checkOutcome(run))` で**非同期に投げる**（advanceFrom を止めない）。
- 成果＝`flowResult(run)`（`hub.mjs:321`・最終出力）を期待と突き合わせ。
- 自己修復＝`genComponent`（`shenron.mjs:367`）を再利用。run が使った generated component が壊れた時だけ再生成。
- 失敗通知＝既存 `emitRunNotify(run, status)`（`hub.mjs:647`）に `'check_failed'` を流す（新経路を作らない）。audit は `trail('outcome-check', …)`。

**データモデル**：automation / flow に `expect` を1個持たせる（`automations.json` に追記）。
```
expect: { kind: 'assert'|'judge', rule: '<JSONPath/正規表現>' | '<NL期待文>', onFail: 'notify'|'repair'|'retry', maxRetry: 1 }
```
`assert`＝決定論（出力に文字列含む/JSON フィールド一致・$0・即時）。`judge`＝cheap tier LLM judge（従量0・本人サブスク・「期待を満たすか yes/no」）。

**MCP tools**（`server.mjs` + hub route）
- `set_check(target, expect)` — flow/automation に期待を付与
- `list_check_results(limit)` — 直近の検証結果（pass/fail/理由）
- `repair_run(runId)` — 壊れた component を手動で再生成トリガ（R-2）

**Wave 分割**
- **R-1（最小・縦串）**：606 hook → `checkOutcome` → assert/judge 判定 → fail なら `emitRunNotify('check_failed')` + audit。`set_check` / `list_check_results`。**これだけで「静かに壊れて気づかない」最大リスクが消える**。
- **R-2（肉付け）**：`onFail:'repair'` → 壊れた generated component を `genComponent` で再生成 → approve gate → 差し替え。`maxRetry=1`(無限ループ防止)。`repair_run`。
- **✅ R-3 出荷済 `2dd56db`（UI `ea4f296`）**：drift 検出 — 連続 fail（3連続）/ 出力構造の急変（`structureSig`）を run 完了即時に検出 → `state.driftAlerts`(cap50) + `emitRunNotify('drift_detected')`。`list_drift_alerts` MCP **両surface** + `GET /api/drift-alerts` + settings.html「🚨 ドリフト検出」カード（読み取り専用）。冪等＝`run.driftAlert` ガード・current rec push 後に評価で二重計上なし。

**risk / scope**：judge コスト → cheap tier 既定・assert 優先。検証の非同期化を誤ると二重 advance（→ setImmediate + run terminal チェック必須）。**scope 落とし候補=R-3**。
**検証**：assert 期待を付けた flow を壊して(出力を変えて) run → `check_failed` 通知 + audit に記録されること。judge は cheap vendor で yes/no が返ること。

---

## Wave Goals — ゴール記憶 concierge ［元案B・🟡 需要要接地・最大規模］
**狙い**：「3ヶ月でフォロワー1000」のような**長期ゴール**を覚え、進捗を追い、停滞したら次の手を出す。flow の上に `goal` 上位概念を新設＝北極星①ど真ん中（協調面という新 primitive）。

**アーキテクチャ**
- `goals.json`（`automations.json` と同型・`readGoals`/`saveGoal` は `readAutomations`/`saveAutomation`(`hub.mjs:673`) を踏襲）。
- 進捗 tick は **`tickScheduler`(`hub.mjs:723`) に相乗り**（新ループを作らない）— deadline 接近 / 停滞を検出。
- 「次の手」は内部で `planFlow`(`hub.mjs:902`) を呼んで提案（既存 discover-first を再利用）。

**データモデル**
```
goal: { id, wish, metric, target, current, unit, deadline, automationIds[], checkins:[{ts,value,note}], status:'active'|'reached'|'stalled' }
```

**MCP tools**：`set_goal` / `get_goal` / `list_goals` / `goal_checkin(id, value, note)` / `goal_suggest(id)`(Goals-3)

**Wave 分割**
- **✅ Goals-1 出荷済 `802d0c8`（UI `454d941`・UI-Compat-2）**：CRUD + **手動 checkin** で進捗表示。metric 自動計測はしない（最小は人が値を入れる）。`set_goal/get_goal/list_goals/goal_checkin`（+`delete_goal`）MCP **両surface**（surfaces タグ無し＝stdio/remote 両方・surface guard 緑）。データ層＝`goals.json`/`saveGoal`/`goalCheckin`/`goalView`(pure `goalPct`)・hub `GET|POST /api/goals`(+`/checkin`・`/delete`)。検証＝test_e2e に MCP 経由 4 assert（set→checkin 250(active)→checkin 1000(reached)→list）green。**これを Mom Test の台にする**（本当にゴールを神龍に預けたい人がいるか）。
- **✅ Goals-2 出荷済（本 Wave）**：tick 相乗り（`checkGoals()`＝`detectSuggestions()` の隣）で **期限接近(3日前・overdue 含む) / 停滞(14日無活動)** を検出→`emitGoalNotify` で notify integration に push（`goalPct`/wish のみ・値なし・`notified` フラグで冪等）。**bound automation の成功 run を自動 checkin**＝`advanceFrom` 完了ブロック（`completedAt` 冪等下）で `run.fromAutomation` を束ねるゴールの `current += 1`（**カウント式**・auto checkin 記録・stalled→active 復帰）。判定中核＝`shenron.goalStatus(g,now,{stallMs,deadlineMs})`(純粋・export・test_shenron 直検証)。通知ループは `pushNotify` に単一化（run/goal 共有・原則1）。`set_goal` schema に `automationIds` を追加（binding が load-bearing 化）。検証＝goalStatus 純粋 7 assert + e2e（bound automation fire→`get_goal` current +1・auto checkin）。**新 MCP tool 無し**（内部 hook・出力は既存 list/get_goal で surface）。UI＝settings.html で status を色分け（停滞=amber/到達=green）。
- **✅ Goals-3 出荷済（本 Wave 続き）**：停滞時に `planFlow` を内部呼び → 「次の手」提案（能動 concierge）。`goalSuggest(id)`＝`planFlow({goal:<wish+現状+停滞>, save:false})`（提案のみ・**従量0=本人サブスク**）→ `suggestions.json` に kind:'goal' を**冪等 push**（同 goalId の open が無ければ・受信箱に先回り）。`checkGoals` の停滞検出が `setImmediate(goalSuggest)` で**自動 push**＋ `goal_suggest(id)` でオンデマンドも可。MCP **両surface**（tools.mjs single source・mcpDispatch + server.mjs case・stdio 74/remote 65・surface guard 緑）+ `POST /api/goals/:id/suggest`（planFlow async は `.then/.catch`）。UI＝settings.html goal 行に「💡 次の手」ボタン + 提案パネルに `🎯 ゴールの次の手` ラベル。返り値は `{...plan, goalId}`（distinct キー・plan.goal 衝突回避）。検証＝e2e（goal_suggest→plan+goalId / kind:goal 冪等 1件）。`applySuggestion('goal')` は汎用 applied マークのみ（再 plan-on-apply は意図的 scope-drop・[[feedback_skip_record]]）。

**risk / scope**：需要未接地(🟡)→ **Goals-1 で需要検証してから 2/3**。metric 自動計測は難 → 手動 checkin 既定。**scope 落とし候補=Goals-3**。
**検証**：goal を set → checkin で current が動く → list で進捗率が出る。tick で deadline 接近時に通知。

---

## Wave Login — クレデンシャル生命管理 ［元案C・🟢］
**狙い**：無人ログインの信頼性を固める。ログインが切れたら気づき、自動で再ログイン or 人にエスカレーション、2FA は人へ、トークン期限を追跡。堀(クレデンシャル×ローカル)の角を深掘り。

**アーキテクチャ**
- ログイン検出＝`browser-worker.mjs:runGoal`(`130`) の snapshot ループに heuristic（"password"/"sign in"/"ログイン"/redirect to /login）を追加。
- エスカレーション＝既存 `runOne`(`74`) の **ask checkpoint 経路を再利用**（人がログインを完了 → 続行）。
- 自動入力＝**vault**（`set_credential` 済み・Keychain）から `{site → user/pass}` を取り `browser_type`。永続 profile（`PROFILE=~/.giogio/browser-profile`・`38`）にログインが焼かれる。

**データモデル**：vault に `login:<domain>` 名前空間で `{user, pass}` を保存（値は AI context に出ない既存契約のまま）。`login-state.json` に `{domain: {lastOk, expiresHint}}`。

**MCP tools**：`set_login(domain, user, pass)`（vault ラッパ）/ `login_status(domain?)`（profile ごとの最終ログイン状態）

**Wave 分割**
- **✅ Login-1 出荷済 `65f8ac7`**：ログイン画面**検出 → ask checkpoint で人を呼ぶ** + audit + `login_status`。自動入力しない（ToS 安全）。「切れたのに気づかず延々失敗」を消す。実装＝`match.mjs looksLikeLogin`(pure・日英語彙)／`browser-worker awaitCheckpoint`(per-step ask と共有抽出)＋runGoal snapshot ループで検出→checkpoint→hub 記録（一度承認で続行）／`hub.mjs login-state.json`(STATE_DIR・`{lastDetected/lastOk/needsLogin}`・値は持たない)＋`GET /api/login-status`・`POST /api/login-detected`／`login_status` MCP **両surface**(PROXY GET・閲覧のみ)。検証＝match self-check＋実機 hub e2e(detect→needsLogin:true→resolve→false+lastOk)。
- **Login-2（肉付け・opt-in）**：vault の credential で**自動ログイン入力**。2FA は必ず checkpoint で人に渡す。opt-in フラグ必須。
- **Login-3（肉付け）**：cookie / token 期限を追跡し、切れる**前**に先回り通知。

**risk / scope**：自動ログインは多くのサイトで ToS grey(🔴)→ **既定は Login-1(検出して人を呼ぶ)**、Login-2 は明示 opt-in。2FA は構造的に人必須。**scope 落とし候補=Login-2/3（opt-in 化で逃がす）**。
**検証**：ログイン切れた profile で run → checkpoint が立ち人に出ること。Login-2：vault に login 保存 → 自動入力でログインが通り profile に焼けること（値が audit/context に漏れないこと）。

---

## Wave Ambient — 観察 → 提案（pull→push）［元案D・🔴 ToS/同意が生存条件・最後］
**狙い**：神龍から「これ自動化できます」と先回り。concierge の能動性。ただし**プライバシー/同意の線が崩れたら即死**なので、自分データのみの安全版から。

**アーキテクチャ**
- 観察源＝**自分の `state.runs` / audit**（手動 fire の反復・連続 fail）。`matchingAutomations`/`fireEvent`(`hub.mjs:691`) の trigger 機構を流用（read-only 観察）。
- 提案キュー＝`suggestions.json`（dismiss 可）。

**データモデル**：`suggestion: { id, kind:'automate'|'fix'|'goal', reason, evidence:[runId…], status:'open'|'dismissed'|'applied' }`

**MCP tools**：`list_suggestions` / `dismiss_suggestion(id)` / `apply_suggestion(id)`(→ plan_flow/set_check 等へ橋渡し)

**Wave 分割**
- **Ambient-1（最小・安全）**：**外部受信箱を読まない**。自分の run/audit から「同じ手動 fire を N 回」「特定 flow が連続 fail」を検出 → 提案。同意問題が軽い（自分のデータのみ）。
- **Ambient-2（肉付け・opt-in・要方針決定）**：integration(Gmail 等)を read-only poll → 繰り返しパターン検出。**明示 opt-in + 同意フラグ必須**。§16 のプライバシー/ToS 方針が決まってから。

**risk / scope**：🔴 受信箱観察は重い同意 → **Ambient-1 は自分データのみで安全**、Ambient-2 は opt-in gate + 方針決定待ち。**scope 落とし候補=Ambient-2（方針未決なら作らない）**。
**検証**：同じ automation を手動で複数回 fire → `list_suggestions` に「定期化しませんか」が出ること。

---

### 横断メモ
- **MCP-FIRST 監査**：上記 16 個の新 tool すべて `server.mjs` の `case` + hub route で露出。cockpit(shenron.html/ui2.html)は薄い view として後追い。
- **テスト**：各最小スライスに `test_shenron.mjs` の assert を1本（606 hook の二重発火なし / goal checkin / login 値非漏洩 / suggestion 検出）。
- **rollback 単位**：1 Wave=1 commit。R-1/Login-1/Goals-1/Ambient-1 が緑になってから肉付けへ。

---

# テナンシー Wave 計画（社内＝課金土台・設計・2026-06-23）

> **発端（user 2026-06-23）**: 「課金要素を見つけ出すか作り出したい・基本は無料でないと誰も使わないのでは」。会話で収束 → 個人=永久無料 wedge、社内(チーム)=利益源、**会社間+trust 商品化は切る**（⚠ PROJECT.md North Star V3＝cross-person/company handoff と矛盾する更新ゆえ、古い「会社間/trust を売る」枠組みに戻らないこと）。欠けてた唯一のプリミティブ=**テナンシー(owner/visibility)**。詳細計画＝`~/.claude/plans/users-shibuyaryouyuu-shenron-docs-roadm-composed-whisper.md`（承認済 `2026-06-23`）。状態=全 📋（実装は次セッションから）。

## 核（なぜ）
- **個人 = 永久無料 wedge**（BYO-key・ローカル・OSS）。WTP ほぼ0・機能 gate は fork の餌＝**ここから金は取らない**。
- **社内 = 利益源**。1人が作ったエージェントをチームで使う／共有状態を誰かがホスト／管理者が統制＝org の予算と実需。bottom-up SaaS（個人→職場持込→会社が払う）。
- **課金 = seat 境界**。個人=single-seat（全 private・今と1bit も変わらず無料）／社内=multi-seat hosted hub で sharing/roles/admin 点灯。**paywall = 2人目の seat**。
- trust.mjs は商品でなく**社内 admin の監査チェックボックス**に格下げ（[[whitespace-grounded-2026-06]] の cross-company は demand 薄＝GATE-1 未検証と整合）。

## 欠けてる唯一のプリミティブ＝テナンシー
神龍は「認証」(`auth.mjs`)は持つが、データ(`workflows.json`/`components.json`/`automations.json`/`goals.json`/vault)は**全部グローバル単一ファイルで owner 欄が無い**（`saveWorkflow` hub.mjs:302・`hub.mjs:1145` "single-owner personal use"）。上物（Agent Factory / `clone_workflow` / vault / managed hub / goals / 監査）は**ほぼ全部出荷済**。よって `T-0`(owner+visibility 2欄)だけが本当の「追加」、残りは既存を乗せる「肉付け」。

### 識別の二経路（load-bearing・接地済）
- **Web UI** → cookie セッション(`cookieSession` hub.mjs:1151 → `checkSession` auth.mjs:91) → 具体的 userId（= seat）。
- **MCP（stdio/remote）** → `A2A_SHARED_TOKEN`(`bearerOk` hub.mjs:1155) → 運用者単一 identity（= admin・全可視）。
- → owner スコープは「Web UI の複数 seat」に効く。MCP 運用者は admin として全部見える＝ハブ所有者が MCP で管理、で正しい。
- **後方互換（移行不要）**: owner 欠落=null=全員可視 / visibility 欠落=owner null なら shared 相当。**openDev(`A2A_SHARED_TOKEN` 未設定)=開放ハブ=全可視＝今の挙動を保存**。multi-seat は「ハブを閉じる(token 設定 or login 必須)」が前提。

## Wave T-0 — テナンシー土台（📋・両トラックの前提・個人に無害・投機 OK）
レコードに `owner:string|null` + `visibility:'private'|'shared'` の2欄を足すだけ。
- 純粋 save 関数（`saveWorkflow`:302 / `saveComponent`:278 / `saveAutomation`:798 / `saveGoal`:832）に optional `owner`/`visibility`。HTTP route 層が req→userId 抽出して渡す・MCP 経路は owner=null。
- ヘルパー（hub.mjs 上部）: `sessionUid(req)` = `checkSession(cookieSession(req))?.userId ?? null` / `visibleTo(rec,uid)` = `uid==null || rec.owner==null || rec.owner===uid || rec.visibility==='shared'`。既定 visibility='private'。
- read route（`GET /api/workflows`・`list_workflows` mcpDispatch:1224・`availableSummary`:1177 等）に `.filter(r => visibleTo(r, sessionUid(req)))`。⚠️`availableSummary`→`planFlow` のスコープは lazy v1 では全可視のまま（member planner 絞り込みは A1）。
- MCP 両surface: `share_workflow(id)`/`unshare_workflow(id)`（`surfaces:['remote']`・tools.mjs 単一ソース＋mcpDispatch＋server.mjs）。UI: shenron.html 🗂 に共有トグル。
- **検証**: Web UI 2ユーザー → U1 の flow が U2 cookie で**不可視** → share → 可視。MCP(shared token)は全件。owner 無し既存は全員可視。`test_shenron.mjs` に `visibleTo` 純粋 assert(4分岐) + e2e(2 cookie list 差分)。

## トラックA — 共有エージェント庫（生成×再利用＝神龍らしさ）
- **A1 庫ビュー（📋・差別化 wedge・T-0 直後）**: `list_shared` = visibility==='shared' の workflows+components を集約し enrichment（`maker`=owner→email via `listUsers`:102 / `adoptedBy`=sub-flow ref or automation 束縛数 / `lastDrift`=`state.driftAlerts` / `reliability`=`state.checkResults` pass 率）。MCP 両surface `list_shared(kind?)` + `GET /api/shared`。UI: shenron.html「📚 庫」タブ（読取専用カード・▶複製→既存 `clone_workflow`）。**信頼は「12人が使用・drift 0」の実績数字で出す（trust theater の代わり）**。
- **A2 系譜（📋・A1 後）**: `cloneWorkflow`:316 の保存に `forkedFrom:src.id` 1行追加 → 庫に親子リネージ表示。多段ツリーは YAGNI。
- **A3 publish（📋・A1 後）**: `share_workflow` に「何をするか」1行（既存 `summary` or `renderPlan` plain_summary）要求 → 庫掲載のノイズ防止。

## トラックB — 共有ハブ + 管理（予算が付きやすい）
- **B1 role（✅・A1 後）**: `auth.mjs` user に `role:'admin'|'member'`（`register`:59 で 1人目=admin）・`getRole`/`setRole`（最後の admin 降格不可ガード）・`listUsers` に role 露出。`isAdmin(req)`（openDev/MCP 運用者=admin で後方互換・hub.mjs）+ `POST /api/auth/role`（admin gate）。MCP `set_role` **stdio 専用**（`REMOTE_DENY`・PROXY entry は dead なので不追加）。settings.html に role バッジ（読取のみ）。新 `test_role.mjs`（HOME=tmpdir 隔離で本番 users.json 非汚染・assignment/gate/last-admin の3検証）。team cred set(B3)/remove(B2) の admin gate は各 Wave で。
- **B2 invite+名簿（📋）**: `invite_user(email)`(admin)=member pending 作成+set-pw トークン（既存 `resetToken`/`verifyToken`:58/:113 再利用・リンクはターミナル出力）。`list_members`=既存 `listUsers`。`remove_member`=auth.mjs 新 `removeUser`（自分は消せないガード）。UI: settings.html admin 専用「👥 メンバー」。
- **B3 team credential（📋）**: vault は「値を返さない」契約既存。lazy v1=**multi-seat では `set_credential` を admin gate**（個人=openDev=従来通り）。member の flow は `credentialEnv`(N-1)で名前参照・値不可視。
- **B4 admin 監査（📋・trust の唯一の生存場所）**: 既存 trust.mjs hash-chain(`/api/audit`+verify)を settings.html admin 専用「🔒 チーム活動」に読取表示。新 backend ゼロ。

## 課金機構（billing）— スコープ外・seam のみ（user 判断 2026-06-23）
本 Wave 群は**課金の"対象物"（sharing/roles/admin）**を作る。**billing 機構（Stripe・entitlement・seat 課金）は含めない**＝user 0人・最初のチーム未検証で意図的 skip（[[feedback_skip_record]]）。
- **seam**: paywall は「2人目の seat join」（B1/B2 境界）。`bearerOk`/`isAdmin` 隣に `seatLimit` 1関数を差すだけ＝後付け可能。
- **いつ**: 最初の実チームが「seat を増やしたい」と言った時点。それまで seat 無制限・無料で需要を測る。

## 実装順序 / 横断制約
- 順序: **`T-0`(両前提) → `A1`(庫=wedge) → `B1`(role) → 実需順で肉付け(A2/A3・B2/B3/B4)**。T-0 のみ投機 OK・A*/B* は実在の2人目 seat 後（0チームに multi-tenant UI 先行禁止）。A1 を B1 より先＝庫が職場持込の wedge、admin 単体は commodity。
- **MCP-FIRST**: 新 tool（`share_workflow`/`unshare_workflow`/`list_shared`/`set_role`/`invite_user`/`remove_member`）を `prototype/mcp/tools.mjs` 単一ソースに登録＝両surface drift 不可能。認証/権限系は `REMOTE_DENY` で stdio 専用。
- **UI 同期**（[[feedback_ui_sync]]）: 同 commit で shenron.html（庫タブ・共有トグル）/ settings.html（メンバー・監査）。⚠️別 claude が shenron.html を触る → settings.html 優先 or worktree 隔離・明示パス add（safe-commit）。
- **起動確認**（[[feedback_verify_boot]]）: 各 commit 前に `node prototype/hub/hub.mjs` 実起動確認。

---

## レビュー駆動 改善 Wave 計画（設計のみ📋・2026-06-23・**テナンシーT群 A1/B1 の後に実装**）

> 発端: `legendary-review`（コードレビュー方法論を skill 化・`~/.claude/skills/legendary-review`）で神龍全体を精読し検出した弱点4つ + 競合領地取り。**スタンス=agile**（0顧客に投機しない・最小保険のみ先行・本格移行は実需＝2人目seat後）。**ホスティング=二階建て**（技術者/個人=自己ホストOSS / 非技術チーム=managed）。**動くシステム強化=DX乗り換え導線 + 信頼性R系**。

### legendary-review 検出の弱点（光と影の「影」）
1. **hub.mjs 肥大**（1688行・flow実行器(advanceFrom)とHTTPサーバが同臓器）— 2500行で記憶頼みの崖
2. **state.json 丸ごと書込**（`save()` hub.mjs:107・マルチテナントと喧嘩）— **真のリスクは「人の同時保存」でなく「run並行の `save()` 競合(last-write-wins)」**
3. **redact 全メール消去**（trust.mjs:18・秘密と業務データ未区別）
4. **非Mac vault base64**（vault.mjs:24・managed/Flyデプロイで弱い）

### Wave 群（WIP=1・各1commit・実装は次session）
| Wave | 内容 | 弱点/領地 | 依存 |
|---|---|---|---|
| **Cliff-1**（守り土台・最優先）✅ | **実コード検証で脅威を訂正**: 単一プロセスでは「run 並行 last-write-wins」は起きない（`state` は load 1か所の共有 object・save 系は全同期 read-write）。**真の崖=クラッシュ torn-write**（`writeFileSync` truncate→write 中の死で JSON 破損→次 load で全 state 消失）。修正=**atomic write(temp+`renameSync`)** を `state.mjs` に新設し hub の whole-file JSON 書込 **13箇所全て**に適用（durable store: inbox/workflows/components/automations/goals/integrations/config/suggestions）。`state`/`save`/`load` を `createStore` で state.mjs へ抽出（永続化を1臓器に集約・将来 lock/DB の seam）。SCHED/LOGIN は transient cache で除外。`test_state.mjs`。崖の地図↓。 | 弱点1+2 | なし |
| **Host-1**（自己ホスト・n8n領地）✅ | OSS/npx 配布整備。**hub はゼロ npm 依存を確認**（全 import が node:/相対・Playwright は browser-worker が `npx` 遅延起動＝install 重さゼロ）。`package.json` publish-ready 化（version 0.1.0/files allowlist/MIT/repository/keywords）+ root `README.md` + `LICENSE`(MIT)。**`files` allowlist で secret/dev データを構造排除**（`*.mjs`/`*.html`/明示 json のみ＝inbox/pem/env は不マッチ・`.npmignore` は作らない＝.gitignore footgun 回避）。**pack-extract-boot で公開物だけの起動を実証**（53 file/316kB・health OK）。実 `npm publish` は user 操作（README に手順）。`npx shenron-hub`（publish 後）/ `git clone && node bin/shenron.mjs`（今）の2経路。 | n8n自己ホスト | Cliff-1 |
| **Vault-1**（managed 開業条件）✅ | 非Mac vault を **base64→AES-256-GCM**（認証付き＝改竄検出）。master key= `SHENRON_VAULT_KEY` env(64hex・managed/Fly で鍵をディスク外に) → 無ければ `~/.shenron/vault-master.key`(0600 生成・`auth.loadSecret` と同型)。legacy base64 は read fallback（後方互換・データ損失なし）。設定エラー(不正 hex)は loud throw・改竄/別 key は fail-closed(null) に分離。Mac Keychain path 不変・注入は `getCredential` 透過。doctor に vault backend 表示。`test_vault.mjs`。**脅威=誤commit・backup漏れ・casual を塞ぐ**（full-disk-read は対象外＝env で deploy 外出し）。 | 弱点4 | Host-1 |
| **Canvas-1**（managedの顔・Langflow領地）✅ | **専用ギャラリー `/artifacts` 新設**（非技術チームが canvas を触らず成果物 UI を操作）。UI 付きフローを一覧→pending handoff(checkpoint)をその場で操作。viewer/bridge は Wave UI S1-S5 を ui2 から移植（sandbox iframe + fetch-shim 鍵は箱 + postMessage bridge・`</script>` エスケープ厳守）。`GET /api/artifacts` 集約(ui 有り flow + pending 同定・seat filter・token-light)＋`list_artifacts` **MCP 両surface**（cockpit=薄い view・北極星）。新永続化ゼロ・新 egress ゼロ。ナビ統合(玄関カード・全 ⌘K DEST・shenron/ui2 サイドバー)。Netdive Blue・絵文字ゼロ。`test_canvas.mjs`。⏭ブラウザ実描画は Chrome 拡張未接続で未実施(data path は test 済)。 | Langflow canvas | Vault-1 |
| **DX-1**（LangGraph領地・乗換導線）✅ | **flow→SKILL.md export を「全リポジトリで使える武器」に昇格**。素材（`flowSkill`/`make_skill`/UI ボタン）は Wave 7 で実装済＝唯一のギャップは**ポータビリティ**：出力先が `<repo>/.claude/skills` 固定で Shenron repo 内でしか発火しなかった。修正=`make_skill {id, scope}` に **scope（'repo' 既定＝後方互換 / 'user'＝`~/.claude/skills`）** を追加。user scope は Claude Code が**全リポジトリ横断**で読む＝「lib を pip install して各 project に配る」をスキル1個で代替＝LangGraph 乗換の決定打。**lifecycle 完備**：`list_skills`（repo+user 両走査）/`delete_skill`（slug `[a-z0-9-]` 検証＋**機械可読マーカー `<!-- shenron-flow: <id> -->` 必須で手書き skill を誤殺しない**）を **MCP 両surface**（stdio case＋remote PROXY・U-1 guard 緑）。薄ラッパ設計は維持（実行は hub DAG executor＝per-edge fence+audit・自己完結 export は堀を失うので作らない＝北極星）。UI＝shenron Flows の Skill ボタンは user scope 既定＋「生成済みスキル」管理セクション（scope badge＋削除・絵文字ゼロ Netdive Blue）。skip（YAGNI）=LLM trigger 語磨き/skill→flow 逆同期/LangGraph→flow import。`test_shenron.mjs`（マーカー assert）＋e2e（make/list/delete/guard 4種を隔離 HOME で実機確認）。⏭ ブラウザ実描画は Chrome 拡張未接続で未実施（data path は test 済・[[feedback_skip_record]]）。 | LangGraph(DX) | — |
| **Reliable-1**（動くシステムの質）✅ | **真ギャップ=クラッシュ後のゾンビ run**: フロー run は running→completed/cancelled しか遷移せず（`'failed'` 無し）、boot の `sweep` は handoff だけ resume＝state.runs 未 reconcile。駆動 handoff も生存 child も無い running run が永久ゾンビ（Cliff-1 で durable 化＝再起動を越えて残る）。修正=`reconcileRuns()` を sweep 末尾で実行し、該当 run を `interrupted` 確定＋通知/trail/SSE close（**fixpoint で sub-flow 親まで伝播**・`awaiting_approval` 待ち run は誤殺しない）。**自動 re-run はしない**（非冪等＝re-run the flow・既存 mcp 哲学と一致）。`test_reliable.mjs`。 | LangGraph(信頼性) | — |
| **drift→auto-pause**（Reliable follow-up）✅ | R-3 drift は検知/通知だけ＝壊れた automation を scheduler が発火し続ける問題を解消。`checkDrift` の **consecutive_fail**（3連続）で `toggleAutomation(id,false,'drift')` 自己防衛停止＋`pausedReason`＋専用通知（`automation_paused`）＋可逆（toggle on でクリア）。**既定 ON＋`shenron.config.json driftAutoPause:false`/`SHENRON_NO_DRIFT_AUTOPAUSE` で escape**（schedulerOn と同型）。`structure_shift` は対象外（pass 継続中の正当変化を誤殺しない）。saveAutomation は pausedReason/disabled を持ち越し。settings.html に停止ラベル＋drift action バッジ。`test_autopause.mjs`。 | LangGraph(信頼性) | Reliable-1 |
| **Redact-1**（堀精度・実需後） | 秘密と業務データの区別（per-flow allowlist） | 弱点3 | 実需 |

### 実装順序（3-pass Pass-3）
**前提（user 訂正 2026-06-23）: テナンシー T 群（T-0 done → A1 庫 → B1 role → 肉付け）を先に完走 → その後に本改善Wave群**。理由=save競合等は A1/B1 で複数seatが実データを触ってから現実化＝agile（機能で問題を炙り出してから埋める・0顧客に土台投機しない）。
`Cliff-1`（守り土台）→ `Host-1`（自己ホスト・既存近い）→ `Vault-1`（managed前提）→ `Canvas-1`/`DX-1`/`Reliable-1`（攻め・managed立後）→ `Redact-1`（実需後）。
**agile 原則**: 0チームに multi-tenant DB を先行実装しない（[[feedback_skip_record]]）。Cliff-1 の「最小保険+地図」で崖の手前に手すりだけ置き、本格 DB 化は2人目 seat が「データ壊れた」と言った時に渡る。**state臓器分離は弱点1(hub肥大)と弱点2(save競合)を同時に解く**＝大きな部品で2つの影を1手で消す。

### Cliff-1 の崖の地図（次に渡る時／実装済の手すりの先）
atomic write で torn-write の崖には手すりを付けた。残る崖と渡るトリガ（実害が出るまで投機しない）:
- **multi-process clobber**: 2つ目の hub プロセスが同 state-dir を触ると last-writer-wins（atomic でも防げない＝別プロセスが別タイミングで full-write）。トリガ=hosted multi-instance or 2人目 seat が並行ホスト。手当て=file-lock（`flock`/lockfile）or per-key 書込 or DB。**その時に渡る**。
- **perf（全書込）**: `save()` は audit append 毎に state 全体を O(size) で書く。inbox.json が数 MB に育つと I/O 律速。トリガ=state ファイルが肥大/書込が体感で重い。手当て=append-only audit log or per-key 分割 or DB。
- **弱点1 本丸（hub 肥大）**: 今回 state 臓器は剥がしたが、`advanceFrom`(flow 実行器)と HTTP サーバが同居の本丸は未着手（hub.mjs ~1740行）。トリガ=2500行で記憶頼みの崖。別 Wave で flow-engine 分離。
- **secret store の torn-write**: `auth.mjs`/`vault.mjs`/`memory.mjs` も whole-file 書込で同じ torn リスク（mode 0o600 維持で `writeJsonAtomic` に mode 引数を足して適用）＝低リスク follow-up。

---

## Wave Cockpit 計画（玄関 router 統合 + ノード検証 + UI/UX・設計・2026-06-23）

> **発端（user 2026-06-23）**: cockpit HTML が3つ並存し drift（`/`=ui.html旧・`/ui2`=canvas作業場・`/shenron`=事務所）。`legendary-review` 結論=ui2/shenron は冗長でなく**相補的半身（作る vs 回す）**・患部は両者の動脈断絶＝**統合でなく廊下**。user 決定=`/` に「玄関(launcher)」新設し作業場/神龍を選ばせる（IDE welcome パターン・家を cockpit でなく router に）。+全ノード/component 種別の検証 +UI/UX 改善。詳細 plan＝`~/.claude/plans/wave-users-shibuyaryouyuu-shenron-docs-r-radiant-aho.md`（承認済）。**状態=Cockpit-0/1/2 ✅完了・PR #1 (`50acb65`) で main マージ済（2026-06-24）／Cockpit-3 のみ 📋**。**backend `/api/*` 不変＝UI のみ（北極星 MCP-FIRST 整合）。B1 の前後どちらでも可。**

> **実装結果メモ（2026-06-24）**: 当初計画（navigation + 一貫性）を超えて、UI テーマ **「攻殻機動隊 / Netdive Blue（フラット青）」**を全4面に適用（正本 `docs/THEME.md`）。絵文字→SVG ラインアイコン・**絵文字ゼロ**、**⌘K コマンドパレット**（Zed流・全ページ）、**役割重複の解消**（神龍=作る/canvas=編集/設定=/settings 一本化・ui2 内蔵神龍 dead code 除去）まで実施。下の Cockpit-1/2 の detail prose は当初計画（🐉 emoji リンク等）で、実装は上記の通り発展している。

### Cockpit-0 — ノード/component 種別の parity 検証（✅ `59f78bf`）
作業場(ui2)を玄関に正式接続する前に全種別が runner で動くと証明し palette↔runner drift を test で固定。runner dispatch=`hub.mjs:486-495`（input/output/prompt/consensus/router/mcp/workflow/parser/languagemodel/structured）+langflow(特殊:373・全 flow を Langflow /v1/run へ)+agent＝**全 palette kind に dispatch 有り**（消えたノード無し）。被覆不均一（languagemodel/workflow 各1で薄い・langflow は `test_langflow.mjs` 別建て）。やる＝各 kind 最小 flow→run→assert 1本（新規 `prototype/hub/test_nodes.mjs`・STATE_DIR 隔離は `test_tenancy.mjs` 流用）+component(`genComponent`→`approve_component`→mcp node 再利用)1本+**parity guard**(palette 全 kind が advanceFrom に dispatch を持つ assert＝将来追加時に drift 即落ち)。langflow は host 要→skip 記録（[[feedback_skip_record]]）。

### Cockpit-1 — 玄関(launcher)新設 + navigation + ui.html 退役（✅ `db051b3`）
新規 `prototype/hub/index.html`=薄い launcher（Alpine+Tailwind・shenron と同言語）: 最近のフロー(`GET /api/workflows`)・2部屋ボタン(🔧作業場→`/ui2`・🐉神龍→`/shenron`)・ショートカット(📚庫→`/shenron#garage`・⚡実行)・フロークリック「✏️編集(作業場) / ▶開く(神龍)」。`hub.mjs`:`GET /`→新 `INDEX_FILE`(index.html) 配信（現 ui.html 差替・`UI_FILE` パターン）・ui.html は `/ui-old` 退避（即削除せず様子見）。`shenron.html`:sidebar`:78` の旧UI🐲リンク→「🚪玄関」・Flows カードに「✏️canvas で編集」→`/ui2?flow=<id>`。`ui2.html`:topbar「🚪玄関」+load 時 `location.search` の `?flow=<id>`→既存 `loadFlow(:956)`（flow card fetch`:950` と同型）で canvas materialize。reuse=ui2 `loadFlow`・shenron tabs`:565`・`/api/workflows`。

### Cockpit-2 — 見た目・トーン一貫性 ＋ 攻殻テーマ ＋ ⌘Kナビ ＋ 役割分離（✅ `dfcfb2f`〜`5e2b028`・PR #1 merged）
当初の「共通 token で同一製品に見せる」を超えて実施: 全4面 **Netdive Blue（フラット青）** 統一・絵文字→SVG（絵文字ゼロ）・mono ブランド+レティクル・**⌘K コマンドパレット**（全ページ・Zed流）・**役割重複の解消**（神龍=作る / canvas=編集 / 設定=/settings 一本化・ui2 内蔵神龍 dead 除去 -5.7KB）。正本 `docs/THEME.md`。回帰修正=⌘K注入が ui2 を壊していた問題（実機 console error で発覚 [[feedback_verify_boot]]）。

### Cockpit-3 — UX 磨き（監査 driven・✅ ui2 共有廊下）
着手時の両 cockpit 精読で、監査 seed 4 つのうち 3 つは先行 Wave で解消済みと判明：
- **✅ wish 役割整理**（Cockpit-2 `d329c33`/`5e2b028`）: 神龍=作る/canvas=編集・ui2 内蔵神龍除去。
- **✅ 庫(A1)カード磨き・空状態導線**（T-0/A1）: shenron garage に reliability/drift カード＋空状態ガイド既存。
- **✅ モバイル PWA**（Cockpit-1）: `manifest.json` 完備・`start_url:/shenron`（会話 view＝concierge）妥当。

**✅ 実装（本 Wave）**: ui2 topbar に「共有」トグル新設＝shenron Flows の 🔗/🌐 と対の**逆方向廊下**（canvas 側からも現フローを庫へ publish）。`/api/workflows/:id/{share,unshare}`（既存・MCP `share_workflow` と同 `setVisibility`）を叩くだけ＝**backend 不変・北極星整合**。状態源は専用 `SAVED_ID`/`FLOW_VIS`（save/load/deep-link の 3 経路でセット・#flowName は name と id が混在のため別持ち）。verify=isolated STATE_DIR で share→/api/shared 掲載→unshare 除去を確認＋inline JS `node --check` OK。
**⏭ 見送り**: ui2→神龍「▶実行」の flow-specific deep-link（topbar の generic「神龍で作る」で nav は足る・shenron Flows カードに ▶実行 既存）。再開トリガ＝ユーザーが「canvas から直接そのフローを神龍で走らせたい」と要望した時。[[feedback_skip_record]]

### 横断制約
**backend 不変**（玄関/navigation/一貫性は UI のみ・新 MCP tool 不要＝北極星整合）。[[feedback_verify_boot]] 各 commit 前 `node prototype/hub/hub.mjs` 起動確認。[[feedback_ui_sync]] 該当。safe-commit=明示パス add（別 claude が html 触る前提）。実装順 `Cockpit-0→1→2→3`・B1 前後可。

---

## 別系統: trust / BuildHUD cockpit waves（branch `trust`・未merge・⚠️letter scheme が神龍と別）

> ⚠️ **重要**: `trust` branch は神龍以前の「BuildHUD（cross-owner trust cockpit）」product line で、**wave の letter が神龍 waves と衝突する別体系**（trust の `H`=Trust Boundary ≠ 神龍の `H`=Push通知）。意図的に未merge の parked line（user 判断「価値未確証ゆえ main に載せない」・memory [[trust-worktree-separation]]/[[trust-moat-whitespace-findings]]）。**詳細は `trust:docs/11_COCKPIT_ROADMAP.md` ＋ `trust:PROJECT.md`**（本 doc は index のみ）。神龍 waves と混同しないこと。

**BuildHUD cockpit waves（全 ✅ DONE・letter は BuildHUD 系）**:
| Wave | 内容 |
|---|---|
| A | 配線キャンバス（typed ports + edges・pointer-events 配線） |
| B | flow 保存 + DAG 実行（Langflow export + topo run・hub 代理実行 worker無し） |
| C | trigger ノード → automation（n8n 流） |
| D | agent palette + MCP export |
| E | open-core「kills 手配線 cross-agent glue」ピッチ（docs/06 §6.8） |
| F | integrations & settings（autorun on/off・MCP server 接続/on-off・mcp ノード） |
| G | MCP tool ノード＋実 side-effect（`mcp-client.mjs`・approval フェンス・`echo-mcp-server.mjs` 検証） |
| **H ★** | **Agent Trust Boundary（wedge・最重要差別化）**: `trust.mjs`＝data firewall(redact)＋tamper-evident audit(hash-chain)＋capability passport。hub 毎ホップ強制。＝巨人/Langflow に書けない cross-owner trust flow |
| I | cross-vendor consensus node（N vendor fan-out→medoid 投票・vs vendor-native） |
| J | build-state IR（trigger 語彙10＋no-eval match DSL 8演算子・vs iPaaS） |
| K | Langflow parity（component library・per-field typed・⚠️差別化でなく入場料） |
| L | Ghost Writer（NL→flow 著述 meta-agent・⚠️Langflow Assistant が既出→差別化は H とセット時のみ） |

**使いやすさ Wave pass（`trust:PROJECT.md §5`・cockpit を1機能ずつ guided UI 化）**: Wave 1（配線 data-firewall inspector ✅）/ Wave 2（trigger/fire event UI ✅）/ Wave 2.1（人間ラベル化 ✅）ほか。詳細は `trust:PROJECT.md`。

> 注: `wave-r-resilience` branch の ROADMAP は古いスナップショットで、内容（N-1/O-1/O-2・R-1・大規模計画）は**全て main に統合済**＝固有な未収載なし。

## Wave Canvas-n8n — n8n 視覚言語＋大統合リファクタ（正典＝docs/CANVAS_REFERENCE.md）

> **狙い**：canvas（`prototype/hub/ui2.html`）を n8n 並みに「一目で構造が分かる」配線にする。n8n の分かりやすさの正体＝**接続種別を色でなく「形」で表す**（出力=丸 dot/入力=矩形/接続=実線+矢印・ノード形3種・AI=破線+◆）。だが n8n を精読すると、神龍 canvas は**捨てる/統合すべき要素**を抱える＝視覚言語を「追加」して併存させるより、**少数の大きな部品へ refactor し、細粒度は inspector＋AI サブノードに逃がす**方が良い。
> **🔑 決定的発見（調査済み）**：**backend と保存形式は既に統一済み**（runner `fireNode` はフラットな `node.kind` 1本・保存 JSON も単一 `nodes[]`）。**二重タクソノミーの混乱は frontend（ui2.html）だけ**＝`state.agents`/`TRIGGERS`/`MCP_NODES`/`COMPONENTS`/`NOTES` の5配列・5レンダー・5分岐 inspector・個別 snapshot に断片化。さらに `prompt`/`languagemodel`/`structured`/`consensus` は**実行が同一**（全部 `firePromptNode`）、`input`/`output` は実行時ほぼ no-op。→ **frontend 統一は挙動・保存形式不変でできる（低リスク）**。
> **順序（確定）**：**R0 frontend 統一 → R1 大きな部品統合 → R2 backend 整理 → W1〜W4 n8n 粒度（旧 S2〜S5 を再ベース）→ QW 掃除**。各 revertable・WIP=1。
> **方針**：R0/W は ui2.html 中心。R1 は kind マージ（旧 kind は load 時 alias）。R2 で runner を dispatch table 化。**細粒度＝inspector パラメータ＋AI サブノード◆**（n8n NDV モデル）。
> **不変条件**：**MCP-FIRST 不変**（`agentTools`/`mcpDispatch`/`/api/shenron/skill`）・**trust 層の意味不変**（firewall/passport/承認/cross-company `fenceEdge`）・**保存 JSON 後方互換**（旧 kind は alias 吸収）・`test_nodes.mjs` green・絵文字ゼロ・SVG のみ・Netdive Blue。⚠ C1「floating」設計は S1 で意図的に逆転済み。

### S1 — 固定 I/O ポート（丸 dot）＋矢印 ✅（本 Wave で出荷）
- `endpointPos(e,end)`：`borderPoint` 浮動をやめ src=右辺中央 `{x:r.x+r.w,y:r.y+r.h/2}`・tgt=左辺中央 `{x:r.x,y:r.y+r.h/2}`。router src は `e.branch` で then→`r.h*0.28`/else→`r.h*0.72` の2レーン。`fpath`（横 bezier）不変。`borderPoint` は temp-wire プレビュー用に残置。
- 矢印：`<svg class="links">` に `<defs><marker id="arrow" orient="auto-start-reverse"><path fill="context-stroke"></marker></defs>`、`drawLinks` の**可視 path に `marker-end="url(#arrow)"`**（`.hit` には付けない）。target 端の filled 円は矢印と重複→削除、source 端の小円は残す。
- ポート：`renderNodes` 各ループ末尾に `portHTML(hasIn,hasOut)`（`hasPort(arr)=(arr||['*']).length>0`）。agent=`hasPort(a.accepts/emits)`・trigger=`(false,true)`・mcp=`hasPort(mn.accepts/emits)`・comp=`hasPort(c.accepts/emits)`（input→OUT のみ・output→IN のみ自動）・note=無し。
- CSS：`.port.out` は既存丸 dot 流用（右）。`.port.in` を矩形タブ化（`width:7px;height:16px;border-radius:3px;left:-7px;background:var(--line)`）。既存 L112-118（未使用足場）を再利用。
- 配線起点：`attachNode` pointerdown 先頭で `.port.out`→`startWire`／`.port.in`→drop 専用 return。`nearRim` 後方互換で残置。drop は「ノード全体が drop zone」維持。
- コメント L579 を「固定 I/O ポート＋矢印・rim は後方互換」に更新（stale doc 撲滅）。
- 検証：input→prompt→output が右→左＋矢印で繋がる／trigger に左ポート無し・output に右ポート無し／router で then/else が右辺上下に分岐／rim-drag がまだ動く。

### R0 — frontend ノードモデル統一（behavior-preserving・最優先の土台）✅ 実装済み（2026-06-25：ハーネス `ab6ffd3` ＋ 本体 `d5731e7`）
**目的**：`TRIGGERS`/`MCP_NODES`/`COMPONENTS`/`NOTES` の**4配列→単一 `NODES[]`**、レンダー・inspector・snapshot・add/remove/duplicate・save/load を**1経路**に。agent は server identity ゆえ `state.agents` に残し **projection** で合流。**描画出力・保存 JSON・kind 値・挙動は完全不変**（純内部リファクタ）＝R1/W1-4 を data 駆動の小変更に変える土台。
**触る関数・行（実コード確認済み）**：配列宣言 `TRIGGERS` L479・`MCP_NODES` L483・`COMPONENTS` L494・`NOTES` L496／ID counter `tidc/cidc/mnidc/noidc` L479,589,606,639／resolver `ag/trig/mcpn/comp/noteOf/nodeOf` L572-577／`renderNodes()` L668-742（5ループ）／`canvasSnap` L528・`undoApply` L530／add `addComp` L589・`addMcpNode` L606・`addTrigger` L639・`addNote` L640／remove `removeTrigger/removeMcpNode/removeComp/removeNote` L605,638,641,944／`duplicateNode` L1105-1110／`inspNode` L880-920／`nodeSpecOf` L1015-1020・`buildFlow` L1022-1024・`loadFlow` L981-996。
**実装ステップ**：
1. 統一ストア：`let NODES=[];`（4配列を置換）。`const agentNodes=()=>state.agents.filter(a=>!HIDDEN.has(a.id)).map(a=>({id:a.id,kind:'agent',_agent:a}));`／`const allNodes=()=>[...agentNodes(),...NODES];`。
2. ID helper：`let _idc=0; const nextId=(k)=>k+'-'+(++_idc);`（旧4 counter 撤去・load 時に既存最大 suffix へ seed して採番衝突回避）。
3. resolver 簡素化：`nodeOf(id)` を agent projection ｜ `NODES.find` に。旧 `comp/trig/mcpn/noteOf` は呼び出し側を置換しつつ薄い wrapper で段階廃止。
4. 1レンダー：`renderNodes()`＝`for(const n of allNodes()) renderNode(n);`。`renderNode(n)`＝共通ボイラープレート（DOM 取得/生成・`attachNode`・POS・classList・`dataset.kind`）＋`n.innerHTML=CARD[n.kind](n)+portHTML(...)`。`CARD` は kind→markup テーブル（既存5ループの innerHTML をそのまま関数化・**出力 HTML を現状と一致**）。
5. 1 inspector：`inspNode(id)`＝`(INSPECT[nodeOf(id).kind]||inspGeneric)(node)`。既存 if 連鎖を関数テーブルへ機械移植。
6. add/remove/duplicate 統一：`addNode(kind,fields)`／`removeNode(id)`（edges も filter）／`cloneNode(id)`。既存 `addComp/...` は薄いラッパに。
7. snapshot/undo 統一：`canvasSnap=JSON.stringify({NODES:NODES.map(deepClone),EDGES,HIDDEN:[...HIDDEN],POS})`／`undoApply` は NODES/EDGES/HIDDEN/POS を復元。
8. save/load 統一：`nodeSpecOf` を kind→serializer テーブル `SPEC[kind](n)`（**出力フィールドは現状と1:1＝buildFlow JSON 不変**）。`loadFlow` は4分岐 if を `agent→HIDDEN.delete / それ以外→NODES.push(deserialize)` に（`COMP[n.kind]` で accepts/emits 復元維持）。
**ノード関係性・接続時の挙動**：edge/接続意味は**完全不変**（`canConnect`/`matchType`/`tryConnect` は `nodeOf` 経由で既に統一済み＝触らない）。統一は内部表現のみ。
**検証（headless ハーネス＝本セッションで設計・実証済み）**：① hub 起動／② inline JS `vm.Script` 構文 green／③ `node --test test_nodes.mjs` 無回帰／④ **headless スナップショット一致（最重要・behavior-preserving 証明）**。手順＝(a) ui2.html の inline script（L260 の `<script>`〜L1294 の `</script>`＝`sed -n '261,1293p'`）を抽出、(b) DOM スタブ前置き（`document.getElementById` は **tracked element registry** を返し `innerHTML` を記録／`createElement`/`localStorage`/`sessionStorage`/`window`/`fetch`=pending Promise/`WebSocket`/`requestAnimationFrame` をスタブ）、(c) 代表フロー（全13 kind＋branch/share edge）を `loadFlow`→ `render()`→ 各 `n_*` の innerHTML（カード markup）＋ 各ノードの `inspNode(id)`＋ `inspEdge(e)`＋ `buildFlow()` を収集し sort-key JSON 化、(d) 末尾で `fs.writeFileSync`＋`process.exit(0)`（背景 timer で hang するため）。**R0 前後でこの JSON が一致**すれば serialization＋カード markup＋inspector が不変＝合格。スタブ済みで `render` は throw しないこと（smoke）も確認。⑤ 既存 `workflows.json` を round-trip して形保持。
**リスク・ロールバック**：render/save/load/undo に触れる中リスク。byte 一致テスト＋test_nodes で担保。1コミットゆえ revert 容易。
**✅ 実装結果（2026-06-25・`d5731e7`）**：ハーネスを `prototype/hub/test_r0_snapshot.mjs`＋golden `r0_baseline.json` として新設（vm で inline script 実行・DOM スタブ・全13 kind 代表フロー）。card markup/inspNode/inspEdge/buildFlow/undo 往復が **byte 一致 green**。`renderNodes` 5ループ→`renderNode(node)` 1関数（markup verbatim）。resolver(`trig/mcpn/comp/noteOf`) を NODES ベース化したので **`inspNode`/`nodeSpecOf` は無変更で温存**。`removeNode` 統一で二重 snapshot bug も解消。note に `kind:'note'` 付与。**ステップ5/8 の INSPECT/SPEC/CARD テーブル化は skip**（resolver 統一で不要・diff/drift を増やすだけ）→ **R1 に送り**（kind 10→6 でテーブルが小さく自然になる時）。検証⑤ workflows.json round-trip は代表フロー（全 kind）の buildFlow 一致で代替。test_nodes parity 14 kind・hub 起動 smoke も green・hub.mjs 完全不変。

### R1 — 「大きな部品」統合（agent と Model の二極へ）
**LLM系を1ノードに**：`COMP` に `model`（`label:'Model'`・`accepts:['*']`・`emits:['text','*']`）を新設。**mode フィールド**（`plain`=template／`system`=system+template＝旧 languagemodel／`structured`=JSON schema／`consensus`=多ベンダー投票）＋`vendor/model/tier` を inspector パラメータに。旧 `prompt/languagemodel/structured/consensus` は **load 時 alias** `KIND_ALIAS={languagemodel:['model',{mode:'system'}],structured:['model',{mode:'structured'}],consensus:['model',{mode:'consensus'}],prompt:['model',{mode:'plain'}]}` で `kind='model'`＋`config.mode` 補完。`parser`（唯一の非LLM文字整形）は独立維持。
**input/output 廃止**：palette（`#addMenu`）から除去。実行時は runner が pass-through 継続（後方互換）。既存フローの input/output は load 時に注記 or 透過へ寄せ、n8n 式＝trigger=入口・末端ノード出力=結果。
**agent と Model の境界**：agent＝遠隔/durable/承認/passport を持つ重い identity（base 維持）、Model＝in-process LLM。palette/inspector 文言で役割明確化（統合はしない）。Langflow import の `Agent→languagemodel` は `Agent→model(mode:system)` に更新。
**結果**：canvas の kind が 10→約6（model/parser/router/mcp/workflow/langflow＋base: agent/trigger/note）。細粒度は Model の mode＋vendor/model/tier＋AI サブノードへ。
**検証**：旧 workflows.json（languagemodel/structured/consensus/prompt/input/output 含む）が alias で開け実行一致／新規保存は `model`＋mode／test_nodes 無回帰。
**✅ 実装結果（2026-06-25）**：frontend＝COMP に `model`（fields＝mode/vendor、mode 固有は `MODEL_MODE_FIELDS` で inspNode が出し分け・mode select は `rerender`）／旧4 kind 削除／input・output に `hidden`（kindSel から除外・既存フローは表示維持）／`KIND_ALIAS` を loadFlow に適用（旧 kind→model+mode を load 時昇格・保存 JSON 後方互換）。backend＝`fireNode` に `model` dispatch（mode→firePromptNode/fireConsensusNode へ委譲・旧 if 温存＝後方互換・**B6 最小版を R1 と同時化**＝model が動かないと出荷不能ゆえ）＋PORTS に model。**INSPECT/SPEC/CARD テーブル化は不要と判明**（R0 で renderNode/inspNode/buildFlow が既に COMP 駆動＝data 駆動ゆえ COMP に1エントリ追加で全経路が自動追従）。Langflow import は**未変更**（importLangflowFlow→loadFlow 経由で alias が自動昇格＝`Agent→languagemodel→model(mode:system)` も連鎖成立・diff 削減）。同様に `shenron.mjs`（MCP/神龍 plan generator・L92-97 が旧 prompt/consensus/structured/languagemodel kind を生成）も**未変更**＝alias 昇格＋backend 旧 dispatch 温存で実行一致ゆえ実害なし。**⏭ skip 記録：plan↔canvas の語彙統一（plan も `model`＋mode を吐く）は R2 へ送り**。理由＝LLM プロンプト（shenron.mjs L45-63 の kind 語彙）＋変換ロジック＋回帰 test に波及し R1 の revertable unit を膨らませるため。トリガ＝R2 の `fireNode` dispatch table 化（B6）で backend 語彙を整理する時に plan generator も同時に model 化（expand→contract の contract 期）。検証＝`node test_nodes.mjs`（parity 11 kind＋`model(plain/consensus)` 実走＋旧 kind 後方互換実走 green）／`node test_r0_snapshot.mjs`（baseline 再生成＋HOOK の alias 昇格 assert green・byte 一致で決定論性確認）／hub 起動は test_nodes の spawn＋`/api/health` で実証。

### R2 — backend 整理（frontend の後・runner を dispatch table 化）
- **handoff `h.kind` 統一**（sweep L257-264 の `h.mcp/h.prompt/h.consensus` マーカー→単一 `h.kind`・recovery を table 化）。
- **`fireXNode` template**（firePromptNode/Consensus/Mcp L556-663 の90%重複）→`createInternalHandoff(run,node,input,from,kind,config)` factory＋executor dispatch table。
- **`fireNode` dispatch table**（11連 if L526-544）→`RUN[kind]`。旧 kind も table に残し alias 実行（R1 整合）。
- **`steps[]` 撤去** ✅（hub saveWorkflow・読取は server.mjs 3箇所もガード＝Pass2 で ROADMAP 想定外を捕捉）／**trigger-filter helper**（4箇所重複 L415,707,885）／**vendor/model/tier resolver**（L243,541,560,573 散在）／**trust dedup**（`fenceEdge`↔`trustPreview` の company/redact 重複 L705-774）／**HTTP route table**（L1541-1802 巨大 if→`{path:handler}`）／**`genId(kind)` 定数化**。
- 不変：MCP-first 公開・trust 意味・保存 JSON。
> 詳細実装は下記 **### R2-B 共通アンカー＋検証** ＋ **B1〜B8**（post-frontend・additive・各1 commit）。

### R2-B 共通アンカー＋検証（hub.mjs・実コード確認済み／post-frontend）
> **不変条件（全 B 共通）**：① **MCP-first surface 不変**＝`agentTools` L1150-1160／`REMOTE_TOOLS` L1256／`mcpDispatch` L1306-1360／`tools/list` L1554・L1630／`/api/shenron/skill` L1739-1747。② **trust 意味不変**＝`fenceEdge` L767-774（cross `!!sc&&!!tc&&sc!==tc` L770）／`sendMode` L658／`redact` L169,682／`applyPass` L685／承認フェンス。③ **保存 JSON 後方互換**（既存 `workflows.json`／`inbox.json` がそのまま動く）。④ runner グラフ不変＝`toposort` L327-335／`advanceFrom` L794-811／`tryFire` L784-793／`settled` L780／`live` L781／`markDead` L782／`markSkipped` L783。
> **検証基盤（実在・確認済み）**：`prototype/hub/test_*.mjs` 10本。**全て `--vendor stub` で headless E2E**（`STATE_DIR`=tmpdir 隔離・LLM 即時・`save()` は毎遷移で tmpdir に書く）。実行＝`node prototype/hub/test_<name>.mjs`。主オラクル：`test_nodes.mjs`＝全 kind を `/api/runflow`→poll 実行し出力 assert ＋ **palette↔dispatch parity guard**（ui2.html `const COMP` の kind を抽出し RUN/FENCED/STRIP/AGENT 分類を強制・L54-73）＝runner 系の要／`test_reliable.mjs`＝crash recovery（`inbox.json` seed→boot `sweep()`→`reconcileRuns`）＝handoff 系（B4）の要／`test_shenron.mjs`＝trust/IR 純ユニット（hub 不起動）＝trust 系（B7）の要／他＝`test_canvas/tenancy/autopause/role/vault/state/langflow`。
> **各 B の検証共通**：(a) `for f in prototype/hub/test_*.mjs; do node "$f"; done` 全 green、(b) runner 変更は **stub-vendor E2E の出力が変更前と一致**（代表フローを runflow→runs poll で比較）、(c) inline JS 変更時は `vm.Script` 構文。
> **runner kind-dispatch 現状（B5/B6 対象）**：`fireNode(run,node,input)` L526-544＝11連 if（input/output/prompt/consensus/router/mcp/workflow/parser/languagemodel/structured/＋fallthrough=agent）。内部 handoff＝`firePromptNode` L556-562／`fireConsensusNode` L610-616／`fireMcpNode` L649-663（各 `h.prompt`/`h.consensus`/`h.mcp` マーカー）。制御系＝`fireRouterNode` L639-645（`run.routerPick`）／`fireWorkflowNode` L429-434（nested `runFlow`）。

### B1 — `steps[]` 撤去（dead code・最小リスク・独立）
**目的**：`saveWorkflow` の `steps[]`（toposort 由来の旧 A2A 線形 shim）は実行に未使用＝dead。除去して「nodes/edges が唯一の正」を明確化。
**触る関数・行**：`saveWorkflow` L340-350（生成 L343・`wf` L344）。読取＝`list_workflows`（MCP）と GET `/api/workflows`（`(w.steps||[]).length` の表示のみ）。
**差分**：L343 の `const steps=...` と L344 の `wf` から `steps` を削除。読取2箇所は表示が要るなら read 時に `toposort(w.nodes,w.edges).filter(n=>n.agent&&n.skill).length` で算出（or 表示削除）。
**不変条件**：runner は元々 nodes/edges から実行（`runFlow` L408-425）＝挙動不変。
**検証**：全 test スイート green（`test_tenancy`/`test_nodes` が saveWorkflow 経由）。保存→読込 round-trip で nodes/edges 不変。
**リスク・ロールバック**：表示数値が消える/再計算になるだけ。L343-344＋読取2箇所の局所 revert。独立。
**✅ 実装結果（2026-06-25）**：hub saveWorkflow が derived `steps[]` を生成・保存しなくなった。消費側は全ガード/置換で **behavior-preserving**：list_workflows・`GET /api/workflows` の steps 表示→`nodes` 数（後者は nodes/edges 数が既存で冗長だった）。⚠ **Pass2 発見＝本節の「読取＝表示2箇所 dead」前提が server.mjs を見落とし**：`server.mjs` `searchWorkflows`(L83)/`execWorkflow`(L112)/`planOf`(L120) が `w.steps` を `|| []` 無ガードで参照＝撤去でクラッシュ寸前だった。3箇所ガード＋search は nodes 数に。`tools.mjs` get_workflow desc・shenron.html `wf.steps→nodes`・stale コメント3箇所も同 commit（lying doc 撲滅）。検証＝test_*.mjs 11本 green＋hub 実起動 round-trip（保存 JSON に steps キー不在を grep 実証）。
- **✅ B-fix 実装済み（2026-06-25・別 commit）**：`run_automation`/`fire_event`(server.mjs) が `execWorkflow`(legacy a2a) を無条件呼びし DAG フローで no-op だった非対称を解消。**Pass2 で確定＝本番（hub scheduler/remote MCP/HTTP）は元々 runFlow で正常・バグは stdio MCP surface 限定**だった。修正＝両 tool を hub proxy 化（`run_workflow` と同型）：run_automation→`hub('/api/runflow',{id,input,fromAutomation})`（R-1 checkOutcome 連動も自動）・fire_event→`hub('/api/fire',{event,input})`。付随で planOf を nodes ベースに（B1 の steps 撤去で dryRun plan が空になる副作用を回収）。execWorkflow は run_workflow の非DAG legacy フォールバックで残置（完全撤去は実行経路変更ゆえ別 Wave）。⚠ 戻り shape が execWorkflow(trace)→runFlow(runId/status) に変化＝run_workflow と統一（旧 no-op の空 trace ゆえ実害なし）。検証＝proxy 先を実機実証（/api/runflow fromAutomation→run 3/3 completed・/api/fire build_state match→automation 発火→run 3/3 completed）＋hub test 11本無回帰。stdio 経由 E2E は未実施（proxy は run_workflow 同型＋proxy 先を直接実証で代替）。

### B2 — pure-extraction helpers（trigger-filter / cross-company / genId）
**目的**：散在する同一ロジックを1関数に集約（挙動完全不変のリファクタ）＝後続 B の土台。
**触る関数・行**：
- `filterTriggers(nodes,edges,{notes})→{nodes,edges}`：`runFlow` L415-416／`trustPreview` L707-708（trigger＋note 除去）／`saveAutomation` L885（trigger のみ）。**2 種ある**ので `notes` 引数で吸収。
- `isCrossCompany(sc,tc)=!!sc&&!!tc&&sc!==tc`：`fenceEdge` L770／`trustPreview` L715。
- `genId(kind)`：`randomUUID().slice(0,N)` 16箇所（N マップ固定＝handoff/run/alert/prompt/consensus/mcp/suggestion/SSE=8、component=6、flow/integration/automation/goal/clone=4）。**桁数は現状維持**（id 衝突/長さ不変）。
**差分**：3 ヘルパ定義＋各サイト置換（出力同一）。
**不変条件**：純抽出＝バイト等価の挙動。id 桁数不変。
**検証**：全 test スイート green（純リファクタ）。
**リスク・ロールバック**：低。各サイト独立に戻せる。
**✅ 実装結果（2026-06-25）**：3 helper のうち**非自明な2つを集約**＝`filterTriggers(nodes,edges,notes)→{nodes,edges}`（runFlow/trustPreview/saveAutomation の trigger(+note) 除去・notes 引数で2種吸収・runFlow 直前に定義）＋`isCrossCompany(sc,tc)=!!sc&&!!tc&&sc!==tc`（trustPreview/fenceEdge の trust 境界判定・B7 `evaluateEdgeFence` 共有の土台）。⚠ runFlow:413 の `if(trg.size)` micro最適化は捨て常に新配列（trigger/note 無しフローで参照変化・内容等価＝読込 workflow.edges を mutate しなくなり安全側）。検証＝test 11本 green（純リファクタ出力不変）＋hub 実起動で trigger 除去実証（runflow with trigger→`entries:["i"]`・trigger は outputs 不在・3/3 completed）。
- **⏭ skip：genId（自明ゆえ見送り・ponytail）**：`randomUUID().slice(0,N)` 16箇所の集約は、対象が自明な1行で N がサイト依存（8/6/4）＝ID_LEN マップという新参照を生み16箇所で kind 指定が要る（桁ミスリスク）のに可読性利得が薄い（YAGNI）。**いつ＝id 衝突対策で桁を増やす・prefix 規約を変える等「id 生成方針を一括変更する必要」が出た時**に ID_LEN マップ化（その時こそ単一の正本が効く）。観測ゼロなら作らない。

### B3 — vendor/model/tier resolver 集約
**目的**：`node>handoff>tier>global>default` の vendor 解決が各所で再実装（L243,541,572-573,581,623…）→1 関数 `resolveVendor()` に集約（優先順位は現状維持）。
**触る関数・行**：`EXEC_VENDOR` L66／`runLocal` L243／`fireNode` L541-542／`tierRoute` L550-555／`runPrompt` L572-573・escalate L581／`runConsensus` L623。
**差分**：`resolveVendor({node,handoff,prompt,tier})→{vendor,model,tier}` を新設し各サイトが呼ぶ。**優先順位・既定値（'stub'/'claude' 等）は1ビットも変えない**。
**不変条件**：同入力→同 vendor/model。`--vendor stub` 経路不変（test 前提）。
**検証**：stub-vendor E2E（`test_nodes`）出力不変＋全スイート green。
**リスク・ロールバック**：中（解決順を誤ると vendor 変化）。サイトごと段階置換＋E2E で都度確認。

### B4 — handoff `h.kind` 統一（marker → 単一フィールド・後方互換）
**目的**：recovery が `h.mcp`/`h.prompt`/`h.consensus` の**有無**で型判定（脆い）→単一 `h.kind`（'prompt'|'consensus'|'mcp'|'agent'）に正規化。
**触る関数・行**：handoff 生成＝`firePromptNode` L558-560／`fireConsensusNode` L613-614／`fireMcpNode` L651-653／agent は `create` L170。recovery＝`sweep` L257-264／`approve` L218。
**差分**：各 handoff に `kind` を**追加**（既存 marker は**残す**＝表示/payload 互換）。`sweep`/`approve` を `h.kind` 優先・marker fallback に。**migration shim**：`sweep` 冒頭で `h.kind ||= (h.mcp?'mcp':h.prompt?'prompt':h.consensus?'consensus':'agent')`＝既存 `inbox.json` も無改修で正規化。
**不変条件**：既存の running/awaiting handoff が再起動で正しく resume（recovery 挙動不変）。marker payload 不変。
**検証**：**`test_reliable.mjs`**（crash recovery）green が主＋全スイート green。
**リスク・ロールバック**：中（recovery 誤りは実行中フローに影響）。marker fallback＋migration shim で旧データ安全。

### B5 — `fireXNode` template（`createInternalHandoff` factory）
**目的**：firePrompt/Consensus/Mcp の handoff 生成（id/from/to/skill/status/contextId/timestamps/history）が90%重複→factory に集約。
**触る関数・行**：`firePromptNode` L556-562／`fireConsensusNode` L610-616／`fireMcpNode` L649-663。
**差分**：`createInternalHandoff(run,node,input,from,{kind,to,skill,extra})→h`（共通フィールド＋`kind`〔B4〕＋kind 別 `extra`＝`{prompt}/{consensus}/{mcp}` を merge）。各 fireX は factory→`touch`→`push`→executor（`runPrompt`/`runConsensus`/`runMcp`）に短縮。**fireMcp の承認ゲート分岐（sendMode/auto/deny L657-662）は fireMcp 内に保持**（factory に入れない）。
**不変条件**：生成 handoff のフィールドが現状と1:1（B4 の `kind` 追加除く）。
**検証**：**`test_nodes.mjs`** 全 kind E2E 出力不変＋parity guard green。`test_reliable` green。
**リスク・ロールバック**：中。フィールド漏れは E2E/recovery で検出。依存：B4。

### B6 — `fireNode` dispatch table（`RUN[kind]`）＋旧 kind alias（R1 整合）
**目的**：11連 if を `RUN` テーブル化。新 `model` kind（R1）を追加し、旧 `languagemodel/structured/consensus/prompt` を alias 実行（後方互換）。
**触る関数・行**：`fireNode` L526-544。parity guard＝`test_nodes.mjs` L54-73。
**差分**：`const RUN={ input,output,prompt:firePromptNode,consensus:fireConsensusNode,router:fireRouterNode,mcp:fireMcpNode,workflow:fireWorkflowNode,parser,languagemodel,structured,model:(r,n,i,f)=>byMode(n) }`。`fireNode` 末尾＝`(RUN[node.kind]||RUN.__agent)(run,node,input,from)`。**`model` の mode 分岐**＝`plain→firePromptNode`／`system→firePromptNode(system+template)`／`structured→firePromptNode(JSON)`／`consensus→fireConsensusNode`（= R1 の KIND_ALIAS と同表）。**旧 kind は RUN に残す**＝旧 `workflows.json` も実行可。
**不変条件**：全既存 kind の実行結果が現状と一致。MCP-first/trust 不変。
**検証**：**`test_nodes.mjs` parity guard を更新**（`model` を RUN 分類に追加）＋全 kind E2E（旧 kind＋`model` 各 mode）出力一致＋全スイート green。
**リスク・ロールバック**：中。取りこぼしは parity guard が静的検出。依存：B5・R1（model/KIND_ALIAS）。

### B7 — trust dedup（`evaluateEdgeFence` 共有）
**目的**：`fenceEdge`（live）と `trustPreview`（dry-run）で never 抽出＋cross-company＋redact が重複→共有ヘルパに（**trail は live のみ**＝dry-run は read-only 維持）。
**触る関数・行**：`fenceEdge` L767-774／`trustPreview` L705-736（cross L715・L770）。`isCrossCompany`（B2）を再利用。
**差分**：`evaluateEdgeFence(edge,value,sc,tc)→{text,removed,cross}`（never 抽出＋`redact`＋cross 判定・**audit はしない**）。`fenceEdge` は結果＋`trail('redact',...)`、`trustPreview` は結果のみ使用。
**不変条件**：redact 除去結果・cross-company 強制・dry-run の read-only 性が完全保存。
**検証**：**`test_shenron.mjs`**（trust 純ユニット）green が主＋E2E で fenced edge 挙動不変。
**リスク・ロールバック**：中（安全境界）。共有関数は副作用なし＝trail 位置を呼び側に残す設計で安全。独立。

### B8 — HTTP route table（巨大 if → ディスパッチ表）
**目的**：`http.createServer` L1387〜L1850+ の約76 route が flat な `if(p===...)`/`if(p.match(...))`→表＋regex 表に整理（可読性・guard 一元化）。
**触る関数・行**：server L1387／GET 群 L1424-1510／POST 群 L1564-1757／OPTIONS・error L1789+／認証ゲート `bearerOk` L1444。
**差分**：`const ROUTES={ 'GET /api/health':h1, 'POST /api/runflow':h2, … }`＋`const RX=[[/^\/api\/runs\/([^/]+)\/stop$/,'POST',h]]`。dispatch＝完全一致→regex の順。**認証ゲート（`bearerOk`/`isAdmin`）の適用範囲・各 route の挙動を1ビットも変えない**。MCP-first route（tools/list・mcpDispatch・/api/shenron/skill）も同表に移すが挙動不変。
**不変条件**：全 route のメソッド/パス/認証/レスポンスが現状と一致。
**検証**：**全 test_*.mjs green**（大半が HTTP 経由＝widest 網羅）＋代表 GET/POST を curl 比較。
**リスク・ロールバック**：中〜高（route 漏れは API 破壊）。最後に実施・route 単位で段階移行・各段で全スイート。単独 commit。

### B 依存順・scope-drop
- 低リスク独立：**B1・B2・B3・B7・B8**（いつでも）。runner-core チェーン：**B4→B5→B6**（B6 は R1 の `model` 前提）。
- 重ければ：B8（route 表）後送り／B6 を R1 と同時化／B1 のみ先行、で段階縮小可。各 B＝1 revertable commit・WIP=1・frontend（R0/R1）後。

> **W1〜W4 共通の検証済みアンカー（ui2.html・実コード確認済み・R0 後は関数名が `renderNode`/`CARD`/`INSPECT` に変わる点に注意）**：幾何 `endpointPos(e,end)` L790-799／`borderPoint` L784-787（temp-wire 専用）／`fpath(a,b)` L800／`nodeRect` L781／`center` L849。描画 `drawLinks()` L850-869（可視 path L859・色 L857・router 判定 `br` L856・source 端小円 L860・型ラベル箱 L861）／`<marker id="arrow">` L212。ノード `renderNodes()` L668-742（agent L672-688/`.name` L685、trigger L689-697/`.name` L695、mcp L698-712/`.name` L709、comp L713-725/`className` L716・`.name` L722、note L726-740）／`portHTML(hasIn,hasOut)`・`hasPort(arr)=(arr||['*']).length>0` L666-667。定義 `COMP` L510-525／`NI(p,w=15)` L500／`NIC` L501-509／`typeColor`+`TYPE_PALETTE` L580-581。配線 `attachNode` L744-761（pointerdown L749）／`startWire(e,src)` L829／`tryConnect(src,tgt)` L827-828／`canConnect` L802／`matchType` L804-805／`nodeOf(id)`（既存・kind 参照）／`updateTemp` L806-811。メニュー `openAddMenu()` L472／`#addMenu` L189-200／`addComp(kind)` L589-593／`addMcpNode(tl)` L606／`addTrigger()` L639／`revalidateEdges` L595-597。状態 `EDGES` L479（edge 形 `{id,source,target,type,branch?,share?}`）。CSS `:root` L9-10／`.node` L62／per-kind L85-94／`.name` L73／`.co` L77／`.port` L112／`.port.in` L115／`.port.out` L113／`.portlabel` L117-118／`.tier-badge` L125-127。共通定数（S2 で1回定義・S4/S5 で再利用）：`const AI_AUX = new Set(['languagemodel','structured','parser','consensus']);`（`COMP` 直後 L526 付近）。各 Wave＝1 revertable commit・WIP=1。色のみに依存せず「形＋線種」で区別（n8n 思想・色覚配慮）。**重要：W1〜W4＝旧 S2〜S5 の実装手順は本節に完全保存（取りこぼし無し）＝現状コード（R0 前）でも上記の関数名そのままで即実装・先行出荷できる。** R0 を先に行った場合のみ、`renderNodes` 各ループ→`renderNode`/`CARD`、`inspNode` 分岐→`INSPECT` に読み替える（幾何/配線/`drawLinks`/CSS は不変）。

### W1（旧S2）— 線種で接続種別を区別（実線=データ / 破線=AI 補助）
**目的**：edge の「意味」を線の形で表す。通常のデータ供給＝実線（現状）、AI 補助系コンポに絡む edge＝破線。色覚に依存せず形で読める。
**触る関数・行**：`drawLinks()` L850-869（可視 path L859・色 L857）／`:root` L9-10（色追加）／`COMP` 直後 L526 付近（`AI_AUX` 定義）／`typeColor` 近傍 L581（`isAiEdge` 追加）。
**技術設計・データフロー**（データモデル不変・両端 kind を `nodeOf(id)?.kind` で描画時に導出）：
- 定義追加：`const AI_AUX = new Set(['languagemodel','structured','parser','consensus']);` ／ `function isAiEdge(e){ return AI_AUX.has(nodeOf(e.source)?.kind) || AI_AUX.has(nodeOf(e.target)?.kind); }`（`nodeOf` 既存）。
- `:root` に `--aiwire:#a371f7;`（comp 紫 accent と同系＝AI/補助の視覚アイデンティティ）。
- `drawLinks` の `br` 行（L856）直後に `const ai = !fenced && !br && isAiEdge(e);`。
- 色（L857）を `col=fenced?'var(--amber)':br?(br==='then'?'var(--blue)':'var(--grey)'):ai?'var(--aiwire)':typeColor(e.type)` に拡張。
- 破線（L859 の `${fenced?' stroke-dasharray="6 3"':''}`）を `${fenced?' stroke-dasharray="6 3"':ai?' stroke-dasharray="5 5"':''}` に拡張。
- **線種の優先順位（必ずこの順）**：fenced(firewall, amber, `6 3`) ＞ router 分岐(then=blue/else=grey, 実線) ＞ AI 補助(`--aiwire`, `5 5`) ＞ データ(typeColor, 実線)。dasharray は衝突回避で固定：fenced=`6 3`・AI=`5 5`・tempwire=`6 5`（既存 `.tw`）。
**ノード関係性・フロー接続時の挙動**：破線紫＝「この接続は AI 補助コンポ（LLM/構造化/パーサ/合議）に出入りする」＝補助・派生関係。実線＝データパイプライン本流。例：`languagemodel→prompt`（source=AI_AUX）→破線紫／`mcp→languagemodel`（target=AI_AUX）→破線紫／`prompt→output`→実線 typeColor／`router→languagemodel`→`br` 成立で `ai=false`＝**router 分岐の青/灰実線が優先**（分岐構造の可読性を勝たせる）。これは S5（AI を底◆サブノード化）の視覚的前段＝同じ edge を S5 で縦＋◆に昇格。
**検証**：`languagemodel→prompt` が破線紫／`mcp→mcp` が実線／fenced は amber `6 3` のまま／hub 起動／inline JS `vm.Script` 構文 green／`node --test prototype/hub/test_nodes.mjs` 無回帰。
**リスク・ロールバック**：描画のみ・データ不変ゆえ revert は L857/L859/`:root` の差分戻しだけ。dasharray 衝突は上記固定値で回避。

### W2（旧S3）— アイコン色タイル＋ノード形（種別を即認識）
**目的**：種別をアイコンの「色付きタイル」＋ノードの「形」で一目認識。trigger を左丸D字＋稲妻バッジ、router の OUT を 2-dot（then/else）本格版に。
**触る関数・行**：`renderNodes` 各ループの `.name`（agent L685・trigger L695・mcp L709・comp L722）／comp ループに `data-kind` 付与（L716-719 付近）／CSS L62-127 追記／`startWire`・`attachNode`・`tryConnect` に branch スレッド（router 2-dot 用）。
**技術設計・データフロー**：
- **アイコン拡大**：CSS 一括 `.node .name svg{width:18px;height:18px;}`（14→18・NI 呼び出しは触らない＝Haiku-safe）。
- **色タイル**：各ループの icon を `<span class="icontile">…</span>` で包む。agent L685 `${NI(NIC.agent,14)}`→`<span class="icontile">${NI(NIC.agent,18)}</span>`、trigger/mcp 同様、comp L722 `${meta.svg||''}`→`<span class="icontile">${meta.svg||''}</span>`。CSS `.icontile{display:inline-flex;align-items:center;justify-content:center;width:26px;height:26px;border-radius:7px;flex:none;}`。
- **comp の data-kind**：comp ループ（L716-719 付近、`n.classList.toggle('selected',…)` の後）に `n.dataset.kind=c.kind;`。CSS が `.node.comp[data-kind="languagemodel"] .icontile{…}` で kind 別 accent を当てられる。
- **per-kind accent マップ**（bg=rgba 薄／fg=グリフ色・明示 hex）：agent `rgba(194,214,230,.14)`/`#c2d6e6`・trigger `rgba(199,147,56,.20)`/`#e0a93a`・mcp `rgba(46,160,67,.18)`/`#3fb950`・input/output `rgba(0,179,179,.16)`/`#00c2c2`・prompt `rgba(91,155,209,.18)`/`#5b9bd1`・languagemodel `rgba(163,113,247,.18)`/`#a371f7`・structured `rgba(0,179,179,.16)`/`#22b3b3`・parser `rgba(63,174,122,.18)`/`#3fae7a`・consensus `rgba(199,147,56,.18)`/`#c79338`・router `rgba(217,119,30,.20)`/`#d9771e`・workflow `rgba(79,70,229,.20)`/`#7c7cf0`・langflow `rgba(236,72,153,.18)`/`#ec4899`。
- **trigger D字＋稲妻**：CSS `.node.trigger{border-top-left-radius:24px;border-bottom-left-radius:24px;}`。trigger ループ `.name`（L695）冒頭に `<span class="trigbolt">${NI(NIC.trigger,12)}</span>`。CSS `.trigbolt{position:absolute;left:-13px;top:50%;transform:translateY(-50%);width:22px;height:22px;border-radius:50%;background:var(--amber);color:#1b1407;display:flex;align-items:center;justify-content:center;box-shadow:0 0 0 2px var(--bg);z-index:5;}`（`.node` が position:absolute なので子の絶対配置が効く）。
- **router OUT 2-dot**：comp ループのポート出力を router 専用に。`portHTML(hasIn,hasOut)` を router のとき `portHTML(hasIn,false)+'<span class="port out then" data-port="out" data-branch="then"></span><span class="port out else" data-port="out" data-branch="else"></span>'`。CSS `.port.out.then{top:28%;} .port.out.else{top:72%;}`（`.port` の `top:50%` を上書き＝`endpointPos` の `0.28/0.72` レーンと一致）。任意で `.portlabel` で then/else 表示。
- **branch スレッド**（2-dot をクリックして枝別に配線）：`attachNode` L749 を `const op=e.target.closest('.port.out'); if(!wiring && op && !noteOf(id)) return startWire(e, id, op.dataset.branch||null);`／`startWire(e,src,branch)` L829 で `wiring={src,pt:canvasPt(e),over:null,branch:branch||null}`／`tryConnect(src,tgt,branch)` L827 で `EDGES.push({id:'fe_'+ ++eidc, source:src, target:tgt, type:matchType(src,tgt), ...(branch?{branch}:{})})`。drop ハンドラ（`grep -n "tryConnect(" ui2.html` で pointerup 呼び出しを特定）で `tryConnect(wiring.src, wiring.over, wiring.branch)` を渡す。
**ノード関係性・フロー接続時の挙動**：種別＝タイル色＋形で配線前から判別。trigger は左丸D字＋稲妻＝「自動起点」が一目。router は OUT が物理的に2つ（then 上/else 下）に分かれ、**接続時にどちらの枝へ挿すかを dot 選択で決定**（branch が wiring に乗り edge.branch に保存）＝S1 の「描き分けのみ」を実操作まで昇格。endpointPos のレーンと dot 位置が一致するので線が dot から素直に出る。
**検証**：palette 全種を配置→色タイル＋形＋アイコンで判別／trigger に D字＋稲妻／router の2 dot から then/else を別々に配線でき endpointPos レーンと一致／hub 起動・vm.Script・test_nodes 無回帰。
**リスク・ロールバック**：`data-kind` 追加は `COMP` 構造不変ゆえ test_nodes 影響なし。タイル bg はダーク背景でコントラスト確保（上記）。revert は CSS 追記＋ラップ＋branch スレッドの局所差分。

### W3（旧S4）— 線先の「+」追加ボタン（n8n の Add node）
**目的**：出力はあるが下流が無いノードの OUT 位置に `+` を出し、クリック→追加メニュー→生成ノードを source から自動配線。pipeline を左→右に1クリックで伸ばす。
**触る関数・行**：`renderNodes` 各ループ（port 描画直後）／`EDGES` 参照／`openAddMenu` L472／`addComp` L591／`addMcpNode` L606／module 変数追加（L479 付近）。
**技術設計・データフロー**：
- 変数 `let addSource=null;`（L479 付近）。ヘルパ `const hasOutEdge=(id)=>EDGES.some(e=>e.source===id);`。
- 各ループの `portHTML(...)` の後に `+ (hasOut && !hasOutEdge(id) ? '<span class="addnext" data-src="'+id+'">+</span>' : '')` を連結（hasOut は各ループの emits 判定＝agent/mcp/comp/trigger）。CSS `.addnext{position:absolute;right:-34px;top:50%;transform:translateY(-50%);width:20px;height:20px;border-radius:50%;background:var(--panel2);border:1px dashed var(--line);color:var(--dim);display:flex;align-items:center;justify-content:center;font-size:15px;line-height:1;cursor:pointer;z-index:4;} .addnext:hover{border-color:var(--blue);color:var(--blue);}`。
- クリック：`attachNode` pointerdown 先頭（L748 付近、`.port.out` 判定より前）に `const ab=e.target.closest('.addnext'); if(ab){ addSource=ab.dataset.src; openAddMenu(); return; }`。
- 自動配線：`addComp` L591 の `selectNode(id);` 直前に `if(addSource){ const sx=POS[addSource]?.x; if(sx!=null) COMPONENTS[COMPONENTS.length-1].x=sx+300; tryConnect(addSource,id); addSource=null; }`。`addMcpNode` L606 も push 後・render 前に同様（`MCP_NODES` 末尾へ）。`addTrigger` は trigger が target 不可（`canConnect` で false）なので配線せず `addSource=null` のみ。
- 型安全：`tryConnect` は `canConnect`（型一致）を通った時だけ EDGES に push。不一致なら node は残るが線は引かれない（ユーザーが手で繋ぐ）。
**ノード関係性・フロー接続時の挙動**：`+` は「この出力の次の段」を作る affordance。生成直後に `tryConnect(source,new)` で source→new を型チェック付き自動配線＝既存 `tryConnect` 再利用（新ロジック無し）。新ノードを source の右 +300px に置き「繋がった感」を出す。router の枝別 `+` は **scope-drop 可**（v1 は「out 接続が皆無のとき1個」のみ）。
**検証**：input 単体→OUT に `+`／クリック→コンポーネント追加→input→new 自動配線／既に out 接続済みなら `+` 出ない／hub 起動・vm.Script・test_nodes 無回帰。
**リスク・ロールバック**：`openAddMenu` は topbar 由来位置（v1 許容・将来 pointer 位置へポップ）。`addSource` の取りこぼしは生成時 null 化で回避。独立 commit＝単体で落とせる。

### W4（旧S5）— AI sub-node 接続（円ノード＋◆＋破線＋底接続・最大）
> **`AI_AUX` 集合は実装時期で決まる**（旧 S5 の手順は不変・どちらでも実装可）：**R1 前（現状コードで実装）＝`{languagemodel,structured,parser,consensus}`**（旧 S5 のまま）／**R1 後＝`{model,parser}`**（Model 統合後）。下記の `AI_AUX`／`comp(...).kind` 判定はこの集合を指す。
**目的**：AI 補助 kind を円ノード化し、consumer の**底辺の◆ポート**へ破線で上向き接続。1 model→複数 consumer の fan-out を扇状描画。n8n の AI cluster 形を踏襲。runner 不変（描画のみ）。
**触る関数・行**：CSS（`.node.comp.ai` 円形・`.port.ai` ◆）／comp ループ innerHTML（ai 用 compact 分岐・S3 の `data-kind` 前提）／`endpointPos` L790-799（AI 縦接続の分岐追加）／`drawLinks` L850-869（`vpath`＋◆）／新関数 `vpath`。
**技術設計・データフロー**（EDGES 意味は不変・全て kind から描画時導出）：
- **円ノード**：comp ループの `className` を `'node comp'+(AI_AUX.has(c.kind)?' ai':'')`（L716）。CSS `.node.comp.ai{width:104px;min-width:104px;max-width:104px;height:104px;border-radius:50%;padding:0;display:flex;flex-direction:column;align-items:center;justify-content:center;}` ＋ `.node.comp.ai .co{display:none;}`。ai 用 innerHTML 分岐：`if(AI_AUX.has(c.kind)) n.innerHTML='<div class="aibody"><span class="icontile">'+(meta.svg||'')+'</span><div class="ailabel">'+esc(cname)+'</div></div>'+'<span class="port out" data-port="out" style="top:0;left:50%;transform:translate(-50%,-50%)"></span>'; else <既存カード>`（円の上端中央に OUT）。
- **幾何 `endpointPos` 拡張**（既存分岐の前に挿入）：`if(end==='src' && AI_AUX.has(comp(e.source)?.kind)) return { x:r.x+r.w/2, y:r.y };`（AI サブノードの上端中央＝上向き出力）／`if(end==='tgt' && AI_AUX.has(comp(e.source)?.kind)) return { x:r.x+r.w/2, y:r.y+r.h };`（consumer の底辺中央＝◆受け）／それ以外は既存（右辺/左辺・router レーン）。
- **`vpath`**（縦 bezier・新規、`fpath` 近傍 L800）：`function vpath(a,b){ const dy=Math.max(36,Math.abs(b.y-a.y)*0.5); return 'M'+a.x+','+a.y+' C'+a.x+','+(a.y-dy)+' '+b.x+','+(b.y+dy)+' '+b.x+','+b.y; }`（a=サブノード上端→上、b=consumer 底）。
- **`drawLinks` 分岐**：`const aiv = AI_AUX.has(comp(e.source)?.kind);`。`aiv` なら `d=vpath(a,b)`、破線 `5 5`（S2）、`marker-end` を**付けない**（矢印でなく◆で接続表現）、b に◆描画 `<rect x="${b.x-5}" y="${b.y-5}" width="10" height="10" transform="rotate(45 ${b.x} ${b.y})" fill="#0a121b" stroke="var(--aiwire)" stroke-width="2"/>`。色は `--aiwire`。型ラベル箱は任意で kind ラベル（"Model"/"Parser" 等）に。非 aiv は既存（横 fpath＋矢印）。
- **consumer 底◆ポート**：renderNodes で「AI 補助 edge の target になっているノード」に `<span class="port ai"></span>`。条件 `EDGES.some(e=>e.target===id && AI_AUX.has(comp(e.source)?.kind))`。CSS `.port.ai{width:11px;height:11px;border-radius:2px;left:50%;bottom:-6px;top:auto;transform:translateX(-50%) rotate(45deg);background:#0a121b;border:2px solid var(--aiwire);}`。
- **fan-out**：1 model→N consumer ＝ N 本の edge。各々 `vpath`＋◆を独立描画（既存の複数 edge 描画でそのまま扇状）。データモデル追加なし。
- **runner 不変**：`languagemodel→prompt` は今日も通常 edge として hub.mjs runner が実行（LLM 出力→prompt 入力）。S5 は**この edge の見た目を縦＋◆＋円に変えるだけ**＝source→target 供給意味は完全保存。
**ノード関係性・フロー接続時の挙動**：AI サブノード（円）は consumer の「下に付く部品」として関係を表す＝「この prompt/agent はこの LLM/パーサを使う」を底◆で明示。1 model を複数 consumer に繋ぐと各 consumer 底へ別 vpath で扇状。型は既存 `matchType`（languagemodel emits `text`→prompt accepts `*`）で従来通り確定。runner は通常のデータ供給として実行（円/◆/破線は純粋に描画層）。**本格 interaction（底◆からドラッグして model を後付け）は scope-drop 可**＝描画だけでも価値（`.port.ai` を `startWire` 起点にし新 edge を ai 型扱いにするのは余力時）。
**将来の9接続型**：◆ラベル語彙を `ai_languageModel/ai_memory/ai_tool/ai_outputParser/ai_embedding/ai_vectorStore/ai_document/ai_textSplitter/ai_retriever` へ拡張＝kind→ラベルマップを足すだけ（現状 languagemodel/structured/parser/consensus がカバー）。
**検証**：`languagemodel`（円）→prompt 底◆に破線上向き接続／1 model→2 consumer で扇状描画／**実行して runner が従来通り処理**（LLM 出力が prompt に入る＝意味保存の確認）／hub 起動・vm.Script・test_nodes 無回帰。
**リスク・ロールバック**：円ノードは設定が inspector 側にある kind（languagemodel/structured/parser/consensus）向けゆえカード本体最小でOK。`endpointPos` の AI 分岐は router（非 AI_AUX）と排他＝衝突なし。最大の Wave につき、`drag-from-◆`＝scope-drop、`vpath`/◆/円のうち描画部分だけでも独立価値。独立 commit。

### QW — quick-win 掃除（低リスク・随時挿入可）
- dead CSS 撤去（`.portlabel` は W4 で使うので保持・他の未使用 class を grep 確認の上）。
- **STC ステータス色の二重定義を単一ソース化**（JS `STC` L537 ↔ CSS `.st.*` L144＝色変更が2箇所必要）。
- **`BUILD_EVENTS` を docs へ**（hub.mjs L868・enforcement 未使用＝装飾的）。
- ID/util helper 統一（frontend `nextId`・backend `genId(kind)`）。

### scope-drop / rollback / 依存順 / セッション状況
- **🗓 セッション状況（2026-06-25）**：**R0＋R1 実装完了**。R0＝ui2.html 4配列→`NODES[]` 統一（`ab6ffd3`＋`d5731e7`）。R1＝`model` ノード統合（旧 prompt/languagemodel/structured/consensus → 単一 `model`＋`config.mode`・kind 10→6）。frontend(ui2.html)＝COMP に `model`／旧4削除／input・output `hidden`／`KIND_ALIAS` を loadFlow 適用／`MODEL_MODE_FIELDS` で mode 別フィールド。backend(hub.mjs)＝`fireNode` に `model` dispatch（**B6 最小版を同時化**・旧 if 温存）＋PORTS。**INSPECT/SPEC/CARD テーブル化は R1 でも不要**と判明（R0 で全経路 COMP 駆動済み）。Langflow import は alias 任せで未変更。検証＝test_nodes parity 11 kind＋model(plain/consensus)＋旧 kind 後方互換 green／test_r0_snapshot baseline 再生成＋alias assert green。**次は R2**（backend dispatch table 化＝B1〜B8）か **W1〜W4**（n8n 視覚粒度・R0/R1 と独立）。
- 依存順：**R0 → R1 → R2**。**W1〜W4 は R0 と独立**＝現状コードでも R0 後でも実装可（旧 S2〜S5 手順を完全保存）。視覚 Wave を R0 より先に出荷するのも可。R2 は R1 の kind マージ／alias を整合させてから。
- 各 Phase 独立 commit・WIP=1。重ければ：R2 を後送り／W3・W4 を落とす／R1 の input-output 廃止だけ先行、等で段階縮小可。
- 各 commit 前に hub 起動＋inline JS `vm.Script` 構文＋（R0 は）**buildFlow JSON byte 一致**＋（可能なら）ブラウザ実描画で検証（chrome 拡張未接続なら data path のみ確認し ⏭ 記録）。
- push は egress ポリシーで 403 ゆえ commit 後は patch/bundle でローカル同期 → 手元の正規 push。

---

## Wave 神龍-Copilot（PC0〜PC18・相談＋plan 精度＋部品設計＋設計の天才／静かな劣化の根絶）

> **問題**：web で神龍に「Kalshi 等のスポーツべッティング期待値自動化」を頼むと `kalsh-80` が **Chat Input→Prompt→Chat Output**（Prompt に願い全文・出力 `[prompt:stub]`）＝**実行不能な偽フロー**に。相談も・必要 API も・障壁も分からない。
> **北極星精緻化**：`OVERVIEW`「願いを叶える龍」/`13_SHENRON §0`「発見→設計→一緒に操作→道具生成」/`06_VISION`「龍は下書き人が押す」/`10_MCP`「MCP-first・web 任意」を土台に — **神龍は決して静かに偽フローを返さない（honest failure）**／相談・needs・blocker・コスト・実行可否は **MCP/web/canvas で同一可視**／**plan・部品・設計の精度を一級目標**とし、primitive を正しく理解し無駄なく正確に組み自立して正しく回す＝**設計の天才として君臨**。

### 診断 — なぜ kalsh-80 が偽フローになったか（コード実証済）
- `planFlow` は計画モデルに `EXEC_VENDOR || 'claude'` を使う（`hub.mjs:1297`）。モデル無効（APIキー無し／`--vendor stub`／`claude -p` CLI 不達）だと `runVendorAsync` が **stub sentinel** を返す。
- `plan()`（`shenron.mjs:286-294`）は sentinel から JSON を取れず `catch`→**heuristic fallback** `[{action:goal,kind:'prompt'}]` を**無言で**返す（L294）→ input→prompt→output。実行も stub→`[prompt:stub]`。
- ゆえに**本来ある相談(clarify)・不足ツール(missing)・blocker は全部スキップ**（LLM 実応答時のみ発火・L288-291）。**機構は優秀で実機検証済（2026-06-21「SNS始めたい」→clarify等）＝欠如でなく、モデル不在時に失敗を偽フローに化けさせる設計が問題**。
- 追加分断：canvas(ui2) に needs/blocker/trust 表示が無い（`trustPreview` API は在るが UI 撤去・`ui2:1141`）。
- **3層**：①モデル未接続の可能性 ②失敗を黙って偽フロー化 ③相談/needs/実行可否が canvas に出ない。

### 精度の中核理論（6失敗モード・5段パイプライン・11レバー）
**「目的を達成するフロー設計の精度」**＝実行すれば真の意図を満たす、または満たせない部分を正直に示すこと。one-shot では届かない。
**6失敗モード（kalsh-80 全該当）**：F1 曖昧未解決／F2 capability hallucination（在ると仮定した API/能力が無い＝最大の殺し手）／F3 分解ミス（多段を単一promptに・fetch/schedule/error/出力欠落）／F4 制御フロー誤り（if を router にしない）／F5 実行不能を黙る（法/ToS/資金/API無）／F6 goal 充足の未検証。
**5段パイプライン（one-shot をやめる）**：**①Intent**（相談で真の意図/制約/成功条件）→**②Spec**（要件＋acceptance 確定）→**③Capability map**（各依存を実在検証＝needed/available/external/gap/**blocked**）→**④Design**（archetype＋patterns で typed-node 分解）→**⑤Verify**（symbolic dry-trace＋judge＋acceptance で goal 充足検査・候補選択）→不足なら②〜④へループ。各段で gap/blocker を正直に。
**11レバー**：L1 Intent→Spec(PC2)／L2 acceptance(PC12)／L3 capability grounding=反hallucination(PC10)／L4 archetype＋patterns(PC4)／L5 symbolic dry-trace(PC11)／L6 候補＋judge(PC7)／L7 設計への対話修正(PC2/PC6)／L8 honest infeasibility(PC0/PC3)／**L9 primitive を能力で正しく理解(PC16)**／**L10 無駄ゼロ minimality(PC17)**／**L11 自立して正しく回る(PC18)**。揃って初めて**設計の天才**。

> **共通アンカー（実コード確認済・行番号は2026-06-25 時点）**：`shenron.mjs`＝`PROMPT` L32-64／`plan()` L278-296（clarify 返却 L288-289・heuristic fallback L292-294）／`buildPlanIR` L78-111／`REFINE_PROMPT` L263-271／`discover` L194-199・`suggestionFromSearch` L178／`neededCredentials` L349-353（`SECRET_RE`＝`mcp-client.mjs:16`）／`renderPlan` L147-174／`inventoryText` L15-21・`choicesText` L274・`stepsText` L262／`genComponent` L372-409・`verifyMcpServer` L357・`extractCode` L305／`evalExpect` L430／`BUILTIN_KINDS` L69／**`isStubFail` L429**（`/(?:→ stub\]|^\[stub\])/`）。`runner.mjs` `runVendorAsync` L75-94（stub sentinel＝`[stub] (no vendor …)`／`[… → stub]`／`[… failed → stub]`）。`hub.mjs`＝`planFlow` L1286-1304／`validateFlow` L1208-1218・`layoutFlow` L1219-1225・`portsOf` L1202-1206・`portIntersect` L1207／`trustPreview` L700-736／`fireMcpNode` L649-663／`templateGaps` L99-106／`saveComponent` L316-324・`approveComponent` L325／`availableSummary` L1269-1283／`EXEC_VENDOR` L66／route `/api/shenron/plan` L1702・`/gen-component` L1714-1725・`/components/approve` L1726-1734・`/gen-artifact-ui` L1708・`/api/health` L1437・`/api/trust/preview` L1757／`readIntegrations`(L826)＝`{id,label,kind,command,url,enabled,tools:[{name,accepts,emits}],generated?,credentials?}`／`mcpDispatch` plan_flow L1308・gen_component L1329・run_workflow L1321／`listCredentials/getCredential`＝`vault.mjs`。UI＝`shenron.html` app state L560-602・`submitWish` L691-704・clarify UI L154-189・missing-tools L207-228・input L132-152／`ui2.html` `clearTrust` no-op L1092・`TRUSTPREVIEW` L481・`drawLinks`(tp) L850-854・「神龍で作る」link L179・topbar `#ckptBadge` L185・`runFlow` L1078-1087・`loadFlow` L981-996。MCP＝`tools.mjs` `plan_flow` L47-48・`gen_component` L49-50・`run_workflow` L69-70・`list_skills` L63-64・PROXY L190-227。検証基盤＝`prototype/hub/test_*.mjs`（`--vendor stub` headless・`test_shenron` 純ユニット／`test_nodes` E2E＋parity guard／`test_reliable` recovery）。**各 PC＝1 commit・WIP=1・MCP/web 両面。**

#### トラックA — 修正・相談・honest・canvas（PC0〜PC6）

##### PC0 — Honest failure（黙って偽フローを返さない・最優先・独立）
**目的**：計画モデル不在/失敗時に heuristic fallback（input→prompt→output）を返さず `mode:'unavailable'`＋理由＋直し方を返す。kalsh-80 体験の直接修正。
**触る関数・行**：`shenron.mjs` `plan()` L278-296（fallback L292-294）。**既存 `isStubFail`（shenron.mjs:429・`/(?:→ stub\]|^\[stub\])/`）を再利用**＝`runner.mjs` runVendorAsync の全 stub sentinel（`[stub] (no vendor …)`／`[… → stub]`／`[… failed → stub]`）を網羅。`hub.mjs` `planFlow` L1297／`renderPlan` L147。
**差分**：`plan()` の `if (!ir) ir = refine ? context.prev_plan : buildPlanIR(…'heuristic'…)`（L292-294）を：
```js
if (!ir) {
  if (!refine && isStubFail(out))                       // 計画モデルが応答しなかった＝偽フロー化しない
    return { goal, mode:'unavailable', reason:'planner-model', detail:String(out).slice(0,160),
      fix:['hub env に ANTHROPIC_API_KEY を設定','または hub から claude/codex CLI を使える状態に','または起動時 --vendor を指定'],
      plain_summary:goal, source:'unavailable', nodes:[],edges:[],steps:[],missing:[],blockers:[] };
  ir = refine ? context.prev_plan : buildPlanIR(goal,{plain_summary:goal,steps:[{action:goal,kind:'prompt',tool:null}]},'heuristic',gap); // LLM は動いたが JSON 壊れ＝稀
}
```
`planFlow`（L1297 直後）に `if (ir.mode==='unavailable') return { ...ir, available: availableSummary(), ...renderPlan(ir) };`（clarify と同様・**保存しない**）。`renderPlan` 冒頭の clarify 分岐条件に `|| ir.mode==='unavailable'` を足し、unavailable 時は `summary_text` に「🐉 まだ計画できません：計画モデル未接続。直し方：…(fix を列挙)」。
**検証**：`test_shenron.mjs` に `plan({goal:'x', run:async()=>'[stub] (no vendor "stub")'})` → `mode==='unavailable' && nodes.length===0`。`--vendor stub` の `POST /api/shenron/plan` が偽フローを返さない HTTP e2e。
**リスク・ロールバック**：低（fallback 条件を狭めるのみ・`isStubFail` 既存）。L292-294 の局所差分のみ。**独立・最優先**。

##### PC1 — Readiness 可視化（計画できる状態か）
**目的**：計画モデル可否＋接続 integration/credential を一目＋MCP からも。
**触る関数・行**：`hub.mjs` `EXEC_VENDOR` L66・`availableSummary` L1269-1283・`/api/health` L1437（隣に新 route）／`tools.mjs` TOOLS＋PROXY L190-227／`shenron.html` topbar・`ui2.html` topbar（`#ckptBadge` L185 隣）。
**差分**：(a) `hub.mjs`：`function plannerReadiness(){ const v=EXEC_VENDOR; const hasKey=!!process.env.ANTHROPIC_API_KEY; const cli=(c)=>{try{return require('child_process').spawnSync(c,['--version'],{timeout:3000}).status===0;}catch{return false;}}; const model = v==='stub'?false:(hasKey||(!v||v==='claude')&&cli('claude')||v==='codex'&&cli('codex')); return { model, vendor:v||'claude', hasKey, fix: model?[]:['ANTHROPIC_API_KEY 設定','または claude/codex CLI','または --vendor'], integrations: readIntegrations().filter(it=>it.enabled!==false).length, credentials: listCredentials().length }; }`。(b) route `if (req.method==='GET' && p==='/api/shenron/readiness') return json(res,200,plannerReadiness());`。(c) `tools.mjs`：`{name:'shenron_readiness',description:'神龍が計画できる状態か（モデル/接続/資格情報）',inputSchema:{type:'object',properties:{}}}`＋PROXY `shenron_readiness:()=>({method:'GET',path:'/api/shenron/readiness'})`。(d) 両 topbar に `/api/shenron/readiness` を叩くバッジ（🟢計画可／🔴モデル未接続＋fix tooltip）。
**検証**：キー無し→`model:false`・有り→true。`shenron_readiness` が stdio/remote 両 surface で返る。
**依存**：PC0 相補。

##### PC2 — 相談の多ターン化（plan-mode 相当）＋要件 brief パネル
**目的**：1往復 clarify を要件確定まで多ターン化。確定/未解決/前提/blocker を可視化。
**触る関数・行**：`shenron.mjs` `PROMPT` L32-64・`plan()` clarify 返却 L288-289・`REFINE_PROMPT` L263-271・`choicesText` L274／`shenron.html` app state L560-602・`submitWish` L691-704・clarify UI L154-189・`submitClarify`。
**差分**：(a) `context.brief`={confirmed:[],open:[],assumptions:[],blockers:[]} を `plan()` が受け、`PROMPT`/`REFINE_PROMPT` 冒頭に `これまでに確定した要件:\n${briefText(context.brief)}`（`choicesText` 風 helper を追加）を注入。(b) clarify 返却（L288-289）に `brief`（前回 brief＋今回 question を統合）を載せ、`submitClarify` は `context:{choices, brief:this.plan.brief}` を送る。(c) clarify UI（L154-189）に要件パネル（confirmed/open/assumptions/blockers 列挙）＋「もっと詰める」（空 choices でも brief を送り再 clarify）。
**検証**：`test_shenron`＝2 往復（clarify→choices→clarify→choices→plan）が brief を蓄積して回る。
**依存**：PC0。

##### PC3 — Needs/Blockers/Cost ブリーフ＋canvas 再掲
**目的**：外部API・credential・integration・blocker・cost を構造化提示し canvas にも。
**触る関数・行**：`shenron.mjs` `renderPlan` L147-174・`buildPlanIR`(missing/tools_needed) L78-111／`hub.mjs` `planFlow` L1286-1304・`trustPreview` L700-736・`/api/trust/preview` L1757／`ui2.html` `clearTrust` L1092・`TRUSTPREVIEW` L481・`drawLinks`(tp) L850-854。
**差分**：(a) `planFlow` の `out` に `brief={ needs:ir.missing, credentials:[...new Set((ir.missing||[]).flatMap(m=>m.creds||[]))], integrations:(ir.tools_needed||[]).map(t=>({id:t.name,connected:t.have})), blockers:ir.blockers||[], cost:routingCost(ir) }`（`routingCost`＝steps の tier×概算）。(b) canvas(ui2)：撤去された trust を戻す＝`clearTrust`（L1092 no-op）を `TRUSTPREVIEW=tp; drawLinks();` の実描画に戻し、`saveFlow`/`loadFlow`/edge 編集後に `POST /api/trust/preview {nodes,edges}` を叩いて annotate（`drawLinks` L850-854 が既に `TRUSTPREVIEW.wires` を読む足場あり）。`#panel` に「神龍ブリーフ」（needs/credentials/integrations/blockers/cost）。
**検証**：integration 未接続フローを開くと canvas に「これが足りない」＋trust 破線。
**依存**：PC1。

##### PC5 — 実行前ゲート（run 前に「足りない」を提示＋直す導線）
**目的**：run 押下前に「X が無いと動かない」＋connect/credential/generate 導線。
**触る関数・行**：`hub.mjs` `fireMcpNode` gap L649-662・`templateGaps` L98-106・`listCredentials`／`ui2.html` `runFlow` L1078-1087。
**差分**：(a) `hub.mjs`：`function preflight(nodes){ const w=templateGaps({nodes, requires: requiredCreds(nodes)}); if(!plannerReadiness().model && nodes.some(n=>['prompt','consensus','languagemodel','structured','agent'].includes(n.kind))) w.push('計画/実行モデル未接続'); return w; }`（`templateGaps` を nodes 直接に再利用）。route `POST /api/preflight {nodes}` → warnings。(b) `ui2.html` `runFlow`（L1078）冒頭で `const w=await api('/api/preflight',{nodes:f.nodes}); if(w.length) → 確認ダイアログ`（各 warning に「⚙設定で接続」「生成」導線・`openModal`）。
**検証**：mcp ノードの integration 未接続→run 前に止まり導線（HTTP e2e／`test_nodes`）。
**依存**：PC3。

##### PC6 — canvas↔planner 統合（canvas に「神龍に相談」）
**目的**：/shenron と canvas の分断解消。canvas 上で 願い→相談→生成→編集→実行。
**触る関数・行**：`ui2.html`「神龍で作る」link L179・`loadFlow` L981-996・`runFlow` L1078／`/api/shenron/plan` L1702。
**差分**：(a) L179 のリンクを `#panel` に開く埋め込み相談パネル（PC2 の goal/brief/clarify UI を移植）に。(b) ui2 に `submitWish` 相当を追加→`POST /api/shenron/plan`→`mode:'plan'` で `loadFlow(r)`（既存・nodes/edges 即材料化）＋PC3 ブリーフ＋PC5 preflight 同居、`mode:'clarify'/'unavailable'` はパネル内表示。MCP は既存 `plan_flow` で同一（変更不要）。
**検証**：canvas だけで「相談→フロー→実行前ゲート→実行」。
**依存**：PC2/PC3/PC5・canvas 統一(R0/R1)後が望ましい。

#### トラックB — plan 精度（5段パイプライン機構化）

##### PC4 — パターン条件付け（seed＋RAG・**参考であって強制でない**）＋退化検出/修復
**目的**：planner を CANVAS_REFERENCE＋同梱 seed パターン庫で条件付け（cold-start 無し）、退化（多段→単一prompt）を検出・修復。**型に嵌めない**。
**触る関数・行**：`shenron.mjs` `PROMPT` L32-64・`plan()` L278（`inv` 組立直後に注入）・`inventoryText` L15-21／`hub.mjs` `validateFlow` L1208・`planFlow` L1287-1289／新 `prototype/hub/patterns.seed.json`。
**差分**：(a) 同梱 `patterns.seed.json`＝`[{tags,goal_example,nodes:[{kind,branch?}],edges:[{from,to,branch?}]}]`（**構造のみ**・worked 例＝data-fetch→compute→threshold-router(if)→action→schedule／email urgent→Slack else log／fan-out→merge／browser-control＋承認）。(b) `shenron.mjs` に `retrievePatterns(goal,k=3)`＝seed（＋PC8 学習分）を goal/tags のトークン重なりで採点し上位 k（**依存ゼロのレキシカル**・BYO 埋め込み任意）。(c) `PROMPT` に `参考パターン（真似不要・goal に合わせ自由に逸脱・新規歓迎・型に嵌めない）:\n${patternsText}` を注入＋CANVAS_REFERENCE の kind 早見表1段落。(d) `validateFlow` 末尾に degenerate lint：`nodes.filter(n=>!['input','output'].includes(n.kind)).length===1 && /if|なら|otherwise|それ以外|全て|each|every/.test(goal)` → `warnings.push('degenerate')`。`planFlow` が degenerate 時 `plan(context={prev_plan,instruction:'decompose into typed nodes (mcp/router/structured/parser)'})` を1回。router の then/else 片枝欠落も lint。
**検証**：`test_shenron`＝seed 0(cold-start) でも条件 goal が multi-node／seed 有りで router 化／degenerate→warning＋再 plan。
**依存**：PC0。注：CANVAS_REFERENCE=教科書、seed=出荷時から効く few-shot。

##### PC10 — Capability grounding map（③・反 hallucination・F2 殺し）
**目的**：各依存を実在検証し needed/available/external/gap/blocked 分類＝「在る前提」を潰す（実フロー精度の最大レバー）。
**触る関数・行**：`shenron.mjs` `discover` L194-199・`suggestionFromSearch` L178・`buildPlanIR`(missing/tools_needed) L78-111／`hub.mjs` `planFlow` L1287-1296(tools/search)・`readIntegrations`・`availableSummary` L1269-1283。
**差分**：(a) `buildPlanIR` 後に `capability_map`：`step.tool` が inventory に在り action を満たす→available／在るが能力不一致→gap／`tool:null` の mcp/agent→`discover` で search 実在検証→ヒット URL→external・無→gap／実在せず ToS/資金/規制で不可→blocked。(b) `discover`（L194-199）拡張：`suggestionFromSearch` 結果に `verified:!!url` と `auth_required` 付与。(c) `capability_map` を brief(PC3) に載せ、blocked は `ir.blockers` に合流（F5 honest）。
**検証**：`test_shenron`＝「Kalshi 実金発注」→capability_map に blocked/gap（confident な mcp ノードにしない）。
**依存**：PC1/PC3。

##### PC11 — Symbolic dry-trace（⑤・意味的完全性・F3/F4/F6 殺し）
**目的**：DAG を記号実行し port を超えた完全性検査。
**触る関数・行**：`hub.mjs` `validateFlow` L1208・`portsOf` L1202-1206・`toposort`／新 `dryTrace`／`planFlow`。
**差分**：`hub.mjs` に
```js
function dryTrace(nodes, edges, { capability_map = {}, acceptance } = {}) {
  const order = toposort(nodes, edges); const gaps = [];
  for (const n of order) {
    const inc = edges.filter(e => e.target === n.id);
    if (!['input','trigger'].includes(n.kind) && !inc.length) gaps.push({ node:n.id, reason:'no input edge' });
    if (n.kind === 'mcp') { const c = capability_map[n.id]; if (c && c.status !== 'available') gaps.push({ node:n.id, reason:'external dep '+c.status }); }
    if (n.kind === 'router') { const br = edges.filter(e=>e.source===n.id).map(e=>e.branch); if (!br.includes('then')||!br.includes('else')) gaps.push({ node:n.id, reason:'router missing branch' }); }
  }
  if (!nodes.some(n => n.kind==='output' || !edges.some(e=>e.source===n.id))) gaps.push({ node:'(flow)', reason:'no terminal/output' });
  return { gaps };
}
```
（archetype 欠落＝schedule/データ源/出力 を goal と照合し gaps に追記）。`planFlow` が `dryTrace` を呼び gaps を brief に＋PC7 修復のトリガに。
**検証**：`test_shenron`＝kalsh 型で「発注の入力(オッズ)が無い」「schedule 欠落」「no terminal」検出。
**依存**：PC4/PC10/PC12。

##### PC12 — 成功条件 → acceptance（②・F6 殺し・Resilience 接続）
**目的**：「どうなれば成功か」を抽出し plan の一級成果物に＋実行後の自己検証へ。
**触る関数・行**：`shenron.mjs` `PROMPT` L32-64(JSON 契約)・`buildPlanIR`・既存 `evalExpect` L430／`hub.mjs` `planFlow`・`saveWorkflow`・Resilience `checkOutcome`（ROADMAP Wave R-1）。
**差分**：(a) `PROMPT` の出力 JSON 契約に `"acceptance":[{"check":"contains|equals|regex|json|judge","value":"…"}]`（「どうなれば成功か」を必ず1つ）を追加。(b) `buildPlanIR` が `ir.acceptance` を保持。(c) `planFlow` の `saveWorkflow` 時に automation `expect` へ変換（`evalExpect` が既に contains/equals/regex/json:path/judge を解釈）＝実行後 `checkOutcome` が goal 充足を自動判定。
**検証**：`test_shenron`＝「週次レポートを Slack に」→`acceptance:[{check:'contains',value:'posted'}]` 抽出→`expect` 化。
**依存**：PC2。

##### PC7 — 複数候補＋judge 選択＋自己批評（⑤・精度の核）
**目的**：難 goal で 2-3 候補→rubric 採点→最良選択＋不合格修復。
**触る関数・行**：`shenron.mjs` `plan()` L278-296・`REFINE_PROMPT` L263-271・`stepsText` L262／新 `critiquePlan`/`rankCandidates`。
**差分**：(a) 「難度高（capability_map に gap/blocked 多 or 機構候補複数）」時のみ N=2-3 候補を `run` 並列生成（`PROMPT` に mechanism preference を変えて＝API優先/browser優先/生成優先）。(b) `critiquePlan(goal,ir,{capability_map,dryGaps,acceptance})`＝cheap LLM 1パスで rubric〔goal/spec 充足・条件は router・機械は parser・外部は grounded mcp・退化でない・`dryTrace.gaps` 空・acceptance 到達〕→`{score,pass,issues,fix_instruction}`。(c) 最良採用＋runner-up の良案 graft、`!pass` は `plan(context={prev_plan,instruction:fix_instruction})` で 1-2回修復。単純 goal は1候補（省コスト）。`isStubFail` なら PC0 に従い skip。
**検証**：`test_shenron`＝「email urgent→Slack else log」で router 欠落候補を低評価→router 化候補を選択。
**依存**：PC0/PC4/PC10/PC11。

##### PC8 — パターン学習ループ（seed を採用フローで育てる・advisory）
**目的**：採用/成功フローで seed を成長（cold-start 後の精度上積み）。学習例も参考・強制でない。
**触る関数・行**：`hub.mjs` `saveWorkflow`・`advanceFrom`(完了)／新 `patterns.json`／`shenron.mjs` `retrievePatterns`(PC4 と共有)。
**差分**：(a) `saveWorkflow`（採用）と run 成功で `patterns.json` に `{goal:wf.name, nodes:nodes.map(n=>({kind:n.kind,branch:n.branch})), edges:edges.map(e=>({from:e.source,to:e.target,branch:e.branch})), tags}` を冪等追記（**config 値・secret 除外＝構造のみ**）。(b) `retrievePatterns` が seed＋learned を統合検索（同関数）。(c) 注入時は seed/learned とも「参考・逸脱可」。
**検証**：`test_shenron`＝学習例0でも機能／router 実績投入で router 化しやすい（型強制でないことも）。
**依存**：PC4・scope-drop 可。

##### PC9 — Plan 品質 eval ハーネス（精度を測る/回帰防止）
**目的**：代表 goal の構造特性を assert＝精度の回帰防止。
**触る関数・行**：新 `prototype/hub/test_plan_quality.mjs`（`test_*.mjs` 規約）。
**差分**：goal→期待構造表〔条件分岐→router+then/else／機械整形→parser／外部API→mcp or `missing` 非空／曖昧→`mode:clarify`／stub→`mode:unavailable`〕。実モデル時は構造 assert、`--vendor stub` 時は honest-failure(PC0)/clarify-skip を assert（CI 最小）。`plan()` 直呼びの純ユニット＋`/api/shenron/plan` HTTP の2層。
**検証**：ハーネス green・退化混入で fail。
**依存**：PC0〜PC4/PC7。

#### トラックC — 部品(component)設計の精度（「これがあったらいいな」を正しく作る）
> 既存 `genComponent`（Python MCP server 生成→spawn+handshake+run 検証→repair→approve）を「**走る**」から「**正しく・完全に・役に立つ**」へ。失敗モード CG1 役割 spec 不在／CG2 完成度不足／CG3 I/O 契約不適合＝動くが無用／CG4 capability hallucination／CG5 「走る」検証のみ／CG6 能動提案欠落。
##### PC13 — Component spec（役割由来）＋grounded codegen（CG1/CG4）
**目的**：生成前に flow 役割から精密契約を導出＋使う外部 API を実在検証してから書く。
**触る関数・行**：`shenron.mjs` `genComponent` L372-409・`extractCode` L305・`neededCredentials` L349-353（`SECRET_RE`＝`mcp-client.mjs:16`）／`hub.mjs` gen-component route L1714-1725・PC10 grounding。
**差分**：(a) `genComponent` の入力を `what`（文字列）から `spec={purpose, inputs(上流ノードの emits 由来 schema), outputs(下流 accepts 由来 schema), success_example, errors, deps, creds}` に拡張（gen-component route で flow context から spec を組む or LLM で `what`→spec を1パス導出）。(b) codegen prompt に spec＋PC10 で実在検証済の API doc URL を注入（CG4＝無い API/誤用を潰す）。(c) `neededCredentials` の結果を spec.creds に。
**検証**：`test_shenron`(gen ユニット・stub codegen)＝gap「オッズ取得」→上流/下流契約に合う in/out の spec で生成。
**依存**：PC10。

##### PC14 — 完成度ルーブリック＋適合(contract)テスト（CG2/CG3/CG5）
**目的**：sandbox 検証を「走る」から「完全＋役割適合」へ。
**触る関数・行**：`shenron.mjs` `genComponent` verify/repair ループ L372-409・`verifyMcpServer` L357／sandbox spawn。
**差分**：(a) 完成度 rubric〔入力検証・error 処理・auth/creds・rate/pagination・idempotency・出力契約〕を cheap LLM judge で採点し **repair の収束条件に追加**（現状は spawn+handshake+run が通るのみ＝CG5）。(b) **contract test**＝`spec.success_example` を入力に sandbox の `run` tool を実行し、出力が `spec.outputs` スキーマ/期待に一致するか assert（不一致は repair 継続）。(c) `genComponent` 返却に `completeness:'partial'|'complete'` を足し `saveComponent`（L316-324）に保存・approve 前に明示。
**検証**：`test_shenron`＝代表入力で期待形出力を返すまで repair／partial が surface。
**依存**：PC13。

##### PC15 — 能動提案＋部品設計アーティファクト（CG6＋透明性）
**目的**：「これがあれば更に達成できる」部品を理由付で提案＋設計書を approve 前提示。
**触る関数・行**：`hub.mjs` `planFlow` L1286-1304・`/components/approve` L1726-1734・`saveComponent` L316-324・既存 `goalSuggest`／`shenron.html` Deployments タブ。
**差分**：(a) `planFlow` の out に `opportunities:[{what, why_it_helps, est_cost}]`（gap でなく価値提案＝LLM に「あると目的達成が捗る道具」を1-2個・任意採用）。(b) `/components/approve` 応答＋`saveComponent` に design artifact `{purpose, contract:{inputs,outputs}, deps, creds, completeness, fit_test}` を添付し Deployments UI で表示。(c) 採用→PC13→PC14。
**検証**：`test_shenron`/HTTP e2e＝goal に opportunities が理由付で出る／approve 前に設計書が見える。
**依存**：PC13/PC14。

#### トラックD — 設計の天才（正しい理解・無駄ゼロ・自立して正しく回る）
##### PC16 — Primitive 能力モデル（正しい理解・L9）
**目的**：node/component/API/DB の実契約を機械可読化し、planner/judge/dryTrace/codegen が**名前でなく能力で**推論。
**触る関数・行**：`hub.mjs` `portsOf` L1202-1206・`PORTS`・`readIntegrations`(tools[].accepts/emits)・`fireNode` 実意味（merge=`\n\n` join・router branch・`fenceEdge`）／`CANVAS_REFERENCE`／`ui2.html` `COMP` L510-525。
**差分**：`hub.mjs`(or shenron.mjs) に `capabilityModel()`＝各 primitive を `{kind, consumes, produces, cost, precondition, failure, compose_rules}` に正規化：node は runtime 実意味（`PORTS`＋`fireNode` 挙動）から固定表、integration は `readIntegrations().tools[]`（accepts/emits・将来 OpenAPI 取込で op 一覧）、DB integration は schema(tables/columns)。`PROMPT`(inventory 部)・`critiquePlan`(PC7)・`dryTrace`(PC11)・`genComponent`(PC13) が `capabilityModel` を参照し、**API の実 op・DB の実 column にのみ**配線（id 一致だけで hallucinated op を作らない）。未知 integration は接続時に schema 取込で自動拡張。
**検証**：`test_shenron`＝登録 API/DB に対し存在する op/column のみ配線・hallucinated op を判定。
**依存**：PC10 相補。

##### PC17 — 設計最適化パス（無駄ゼロ・L10）
**目的**：生成 flow を最小・無駄なしに。
**触る関数・行**：`hub.mjs` `validateFlow` L1208・`planFlow` L1299（validate→layout の間に挿入）・`critiquePlan`(PC7)／新 `optimizeFlow`。
**差分**：`optimizeFlow(nodes,edges,capabilityModel)`＝(1) 決定論変換可能な prompt（template 置換のみ）を `parser`($0) に、(2) 同 tier の隣接 prompt を1つに統合、(3) 到達不能ノード/edge を除去、(4) fan-in を正しい merge（runner は `\n\n` join＝そのまま）に。`planFlow` を `validateFlow`→`optimizeFlow`→`layoutFlow` の順に。`critiquePlan` rubric に design-quality（node 数最小性・$0 比率・死に枝ゼロ）加点。**前後で goal 充足(acceptance)は不変**。
**検証**：`test_shenron`/E2E＝冗長 2 prompt→1／決定論 prompt→parser／死に枝消去／acceptance 不変。
**依存**：PC4/PC16。

##### PC18 — 自立して正しく回る（autonomous correctness・L11）
**目的**：自立して end-to-end 正しく回る保証。
**触る関数・行**：`hub.mjs` `dryTrace`(PC11)・`preflight`(PC5)・Resilience `checkOutcome`/`evalExpect`（Wave R-1）・`fireMcpNode` postResult error L649-662・`gen_component` 再生成／`shenron.mjs` `PROMPT` scheduling 分類 L43-46。
**差分**：(a) **走行ゲート**：`dryTrace.gaps` 空＋全外部依存 available＋acceptance 到達経路ありを満たすと plan を `runnable:true`（PC5 preflight と統合）。(b) **自己修復**：実行後 `checkOutcome` で acceptance 不成立、または mcp tool 破損（postResult error）時、`gen_component` 再生成 or `plan(refine)` を自動起動（ROADMAP Wave R-2/R-3 と統合）。(c) **自立性チェック**：`PROMPT` 既存の scheduling 分類（API-only→serverless-cron／browser→ユーザー機）を formal 化し、要常時稼働なら brief に surface（自立不可を正直に）。
**検証**：`test_reliable`/`test_autopause`＝tool 破損→再生成復旧／acceptance 不成立→自己修復／要常時稼働を surface。
**依存**：PC11/PC12・Resilience。

### 依存順・scope-drop（神龍-Copilot）
- 修正＋相談：**PC0（最優先・独立）→ PC1 → PC2 → PC3 → PC5 →（PC6 は canvas 統一後）**。
- plan 精度：**PC4 →（PC10・PC12）→ PC11 → PC7 → PC9**・**PC8 学習（随時）**。
- 部品精度：**PC13 →（PC10 前提）→ PC14 → PC15**。設計の天才：**PC16 → PC17 → PC18**。
- 最短で価値：**PC0＋PC1**（偽フロー撲滅）→ **PC16＋PC10＋PC11**（正理解＋実在検証＋意味検証＝設計精度の核）→ **PC7＋PC17**（候補＋無駄ゼロ）→ **PC13＋PC14**（部品を役立つ品質に）→ **PC18**（自立して正しく回る）。
- 正典＝`docs/13_SHENRON.md` §Wave 神龍-Copilot。

---

## 🔖 最新ステータス（2026-06-23）

> 次にやることは ↑「次にやる（TODO 集約・正本）」に一本化。ここは直近出荷の要約のみ。

- **🔧 直近（local・未 commit）** = Wave Canvas-n8n S1：ui2.html を固定 I/O ポート（OUT 丸 dot/IN 矩形タブ）＋矢印に（C1 floating を逆転）。`docs/CANVAS_REFERENCE.md`（canvas 完全リファレンス）新設＋ROADMAP に S1〜S5 設計正本化。検証 green（hub 起動 / inline JS vm.Script / test_nodes 無回帰）。

- **🔧 直近（local・未 commit）** = Wave Goals-1 確認 + **P0 修正**: `6f12c04` N-3 doctor が `await runDoctor()` を非 async handler に入れ **hub.mjs が起動不能**だった（main が壊れていた・全 e2e 2/12）→ `.then()` 1 行で修正（→ 14/14 green）。併せて Goals-1 の欠落 e2e（MCP 経由 set→checkin→reached→list 4 assert）を補完。
- **✅ origin/main 同期済（push 完了）= `6f12c04` まで**（↑の起動 fix が未 commit）。push 済スタック: `6f12c04` N-3 doctor / `76979ba` Remix-1 / `552431c` R-2 repair / `824e3a2` N-2・O-3。
- **✅ その前（local→push 済）** = `76979ba` Wave Remix-1 clone_workflow（フロー fork→改造→部品化・🗂「⧉複製」・HTTP e2e 7 assert green）。
- **✅ その前** = `552431c` Wave R-2 repair loop（onFail:repair で生成コンポーネント自動再生成）。
- **✅ その前** = `824e3a2` Wave N-2・O-3（セッション永続化 + ハブ死活監視）。
- **✅ その前** = `a6d53b2` Wave UI S5 ui_hint（plan 段階の UI 要否判断・Wave UI S 完走）。
- **✅ その前** = `fbb5274` Wave UI S3 flow↔UI 紐付け（set_flow_ui/get_flow_ui）。
- **✅ その前** = `9de279d` Wave UI S2 approve/advance bridge（postMessage ホワイトリスト）。
- **✅ その前** = `598b8c0` Wave UI S1 成果物 UI ビューア（sandbox iframe + fetch-shim + `/api/artifact-llm` proxy）。
- **✅ その前** = `5187618` Ambient-1 観察→提案（`detectSuggestions`・tickScheduler 相乗り・MCP 両surface 65/53 tool）。
- **✅ 大規模 Wave 4 本完走**: R-1 → Login-1 → Goals-1 → Ambient-1 すべて main 反映済み。
- **意図的見送り** = U-2 MCP 完全統一（→「設計のみ」表）。
