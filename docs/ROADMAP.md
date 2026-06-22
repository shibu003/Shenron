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

## 設計のみ（📋・実装は方針決定後）
| Wave | 内容 | 詳細 |
|---|---|---|
| **F サービス化/デプロイ** | compute 売らず control plane を売る／お財布適応 3 tier／常駐箱(Pi5・Mac mini・claude -p≫Ollama)／配布先 OpenClaw(MCP client ~380k★)／「hub も使える」=managed hub(BYO-key・browser-control 不可) | §16 |
| **G multi-AI / model routing** | 下記「②」参照 | 本 doc |

## 次にやる（優先順）
1. ~~🔬 discover-first 実機検証~~ **✅完了**（2026-06-21・ローカルで実体検証・上表 discover-first 行参照）。残=ngrok+claude.ai の e2e transport 確認（任意・MCP 標準なので他 connector で実証済）＋ rough edge（claude -p の非決定 X-API事実）を実運用で観測。
2. ~~Wave G 残: discover の自動 routing 提案~~ **✅完了**（`f643b75`）= **Wave G フルクローズ**。
3. ~~Wave H/I/J/K~~ **✅完了**（`59a2cdb`）= Push通知・Credential Vault・Skill共有・First-run。
4. ~~Wave L: Auth~~ **✅完了**（`9063235`）= 登録・ログイン・メール認証・セッション管理。
5. **UI への認証フォーム追加**（登録/ログイン画面 → 他 Claude 担当 UI 完成後に連携）。
6. **マネタイズ軸の決定**（user・BYOK flat / control-plane / governance-marketplace）→ §16 §5。
7. **beachhead ジャンル選定**（家計・EC監視・コンテンツ制作・開発者自動化・リサーチ自動化から1つに絞る）→ Wave M: 縦串デモ実装。
6. §16 未確定: OpenClaw 統合深度 / 常駐箱 one-click(MCPB) / managed hub を立てるか。

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
