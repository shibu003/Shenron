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

## 設計のみ（📋・実装は方針決定後）
| Wave | 内容 | 詳細 |
|---|---|---|
| **F サービス化/デプロイ** | compute 売らず control plane を売る／お財布適応 3 tier／常駐箱(Pi5・Mac mini・claude -p≫Ollama)／配布先 OpenClaw(MCP client ~380k★)／「hub も使える」=managed hub(BYO-key・browser-control 不可) | §16 |
| **U-2 MCP 完全統一（見送り）** | 完全統一（stdio attended dry-run 撤去・server pure proxy 化）＋ run_handoff の a2a を hub 移植。「限界価値小×リスク大」で**意図的見送り**（U-1 で主目的達成・hub は agent URL を持たない in-process モデル）。再開時の安価スライス=`fire_event`(=/api/fire 既存)・`run_automation`(find→runFlow) を remote 露出のみ。 | 本 doc |
| **Wave UI — 成果物UI（操作面）** | 神龍が足りない道具を自作する性質上、**操作必須の UI 付き生成物が頻発**する。ui2.html 内で特定 flow の成果物 UI を見て操作 → その操作で自動化フローが進む（人在ループのリッチ checkpoint）。スマホ+PC 両対応。神龍は **plan 段階で UI 要否を判断**（承認だけ→通知で十分=UI無し／操作+可視化が要る時だけ生成）。sandbox iframe(JSX+Babel)で描画・**鍵は箱に残す fetch-shim**・操作→bridge→hub が advance。Lovable(bespoke アプリ生成/別ホスト deploy)ではなく control-plane 内で「成果物に顔を付ける」。 | 下記メモ |
| **大規模 Wave（R-2/R-3・Goals・Login・Ambient）** | 「生成の*後*の世界」4群。**R-1 は出荷済**（上表）。R-2(repair)/R-3(drift)・Goals(ゴール記憶)・Login(クレデンシャル生命管理)・Ambient(観察→提案) は↓「大規模 Wave 計画」セクションに設計。実装順 `R→Login→Goals→Ambient`。 | 下記 |

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
1. **Fly.io `hub.shibubu.ai` 反映**（`fly deploy`）— U-1 の remote 44 tool / ui2 / settings / 神龍パネル がまだ本番未デプロイ（コードは origin/main）。
2. 大規模 Wave: **Goals-1**（Login-1・Ambient-1 は出荷済・R-1 は出荷済・↓大規模 Wave 計画）。
3. 小バックログ: **N-3** `shenron doctor` / **U-2 安価スライス**（fire_event・run_automation を remote 露出のみ・任意）。N-2/O-3 は出荷済。
4. **UI への認証フォーム**（登録/ログイン画面・Wave L backend は出荷済）。
5. ~~**Wave R-1 の Learn by Doing**（`evalExpect`）~~ — **✅完了 `99aa25b`**: assert（決定論・contains/!contains/equals/regex/json:path=val）+ judge（cheap LLM yes/no・送信前 redact() で egress firewall・fail-closed）を実装。R-1 完全動作。残＝R-2(repair)/R-3(drift) は大規模計画。
6. ~~**Wave UI S1〜S5**（成果物UI ビューア → plan UI 要否判断）~~ — **✅完了**: S1=ビューア `598b8c0` / S2=approve/advance bridge `9de279d` / S3=flow↔UI紐付け `fbb5274` / S4=gen_artifact_ui `829457c` / S5=ui_hint `a6d53b2`。**Wave UI S 完走**。

7. ~~**Wave Remix-1**（`clone_workflow`・フロー fork→改造→部品化）~~ — **✅完了 `76979ba`（push 済）**: `cloneWorkflow`(deep-copy→新id一意化→`saveWorkflow`) + MCP両surface + `POST /api/workflows/:id/clone` + 🗂 Flows「⧉複製」ボタン。HTTP e2e 7 assert + surface guard green。詳細↓「## Wave Remix」。Remix-2/3 は意図的 skip（理由+いつやるか 記載済）。

### B. user 判断（方針）
8. **beachhead ジャンル選定**（家計・EC監視・コンテンツ制作・開発者自動化・リサーチ自動化から1つ）→ 縦串デモ実装。
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
- **R-3（肉付け）**：drift 検出 — 連続 fail / 出力構造の急変を「壊れ始め」として早期通知。

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
- **Goals-1（最小）**：CRUD + **手動 checkin** で進捗表示。metric 自動計測はしない（最小は人が値を入れる）。`set_goal/get_goal/list_goals/goal_checkin`。**これを Mom Test の台にする**（本当にゴールを神龍に預けたい人がいるか）。
- **Goals-2（肉付け）**：tick 相乗りで deadline 接近 / 停滞を `emitRunNotify` 通知。bound automation の run 成功を checkin に自動反映。
- **Goals-3（肉付け）**：停滞時に `planFlow` を内部呼び → 「次の手」提案（能動 concierge）。

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

## 🔖 最新ステータス（2026-06-23）

> 次にやることは ↑「次にやる（TODO 集約・正本）」に一本化。ここは直近出荷の要約のみ。

- **✅ origin/main 同期済（push 完了・未push なし）**。直近スタック: `76979ba` Remix-1 / `552431c` R-2 repair / `824e3a2` N-2・O-3（+ docs）。
- **✅ 直近（local）** = `76979ba` Wave Remix-1 clone_workflow（フロー fork→改造→部品化・🗂「⧉複製」・HTTP e2e 7 assert green）。
- **✅ その前** = `552431c` Wave R-2 repair loop（onFail:repair で生成コンポーネント自動再生成）。
- **✅ その前** = `824e3a2` Wave N-2・O-3（セッション永続化 + ハブ死活監視）。
- **✅ その前** = `a6d53b2` Wave UI S5 ui_hint（plan 段階の UI 要否判断・Wave UI S 完走）。
- **✅ その前** = `fbb5274` Wave UI S3 flow↔UI 紐付け（set_flow_ui/get_flow_ui）。
- **✅ その前** = `9de279d` Wave UI S2 approve/advance bridge（postMessage ホワイトリスト）。
- **✅ その前** = `598b8c0` Wave UI S1 成果物 UI ビューア（sandbox iframe + fetch-shim + `/api/artifact-llm` proxy）。
- **✅ その前** = `5187618` Ambient-1 観察→提案（`detectSuggestions`・tickScheduler 相乗り・MCP 両surface 65/53 tool）。
- **✅ 大規模 Wave 4 本完走**: R-1 → Login-1 → Goals-1 → Ambient-1 すべて main 反映済み。
- **意図的見送り** = U-2 MCP 完全統一（→「設計のみ」表）。
