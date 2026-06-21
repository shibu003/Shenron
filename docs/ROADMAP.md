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
| **discover-first** 🔬 | 願い→研究→曖昧/地雷なら `clarify` で確認→`context.choices` で再 plan（検索は BYO AI・M1） `3d3b799`。**未検証=claude が実際に web 検索するか（SNS/楽天 実機）** | §10 §11 |
| **scheduler + robustness** | cron 発火 + **catch-up**（`lastDue`+`schedule-state.json`・downtime 後 boot で追い発火）+ `POST /api/tick`（外部 cron seam）+ `add_automation`。`SHENRON_NO_SCHEDULER` で off `663e9d1`/`1b36350` | §15 |
| **cost 設定** | `plan_flow {cost:'free'/'paid_ok'}` を discover が honor `44bae59` | §16 §4 |

## 設計のみ（📋・実装は方針決定後）
| Wave | 内容 | 詳細 |
|---|---|---|
| **F サービス化/デプロイ** | compute 売らず control plane を売る／お財布適応 3 tier／常駐箱(Pi5・Mac mini・claude -p≫Ollama)／配布先 OpenClaw(MCP client ~380k★)／「hub も使える」=managed hub(BYO-key・browser-control 不可) | §16 |
| **G multi-AI / model routing** | 下記「②」参照 | 本 doc |

## 次にやる（優先順）
1. 🔬 **discover-first 実機検証**（最優先・全土台）: ngrok 接続済 fresh hub で claude.ai に「SNS 始めたい」→X/Insta/FB を聞くか／「楽天で転売」→ToS/古物商/購入API無しを blocker で止めるか。効いてなければ即補強（プロンプト強化 or hub 側検索 integration）。
2. **Wave G: multi-AI**（下記・既存 consensus を土台に provider 拡張）。
3. **マネタイズ軸の決定**（user・BYOK flat / control-plane / governance-marketplace）→ §16 §5。
4. Wave D polish（list_workflows に summary+最終実行時刻）。
5. §16 未確定: Ollama tiering 実装 / OpenClaw 統合深度 / 常駐箱 one-click(MCPB) / managed hub を立てるか。

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
- power user は flow の node.config に `vendor`/`model` 直指定も可。
- ✅ **Ollama provider（cheap step を完全無料に）**: runner に `ollama` vendor（`OLLAMA_HOST` 既定 localhost:11434・`/api/generate`）。**`SHENRON_CHEAP_VENDOR=ollama`（＋`ollama serve`）→ cheap step は cloud/API path でもローカル $0**。consensus の vendors に `ollama` を入れても自動で効く。Win/Linux/Mac 同じ。MINIMIZE COST 既定 cheap と合わせ「安い 80% は無料ローカル、判断だけ Claude」。
- ✅ **OpenAI/GPT provider**（`adab1b0`）+ ✅ **Gemini provider**: runner に `gemini`/`google` vendor（`generativelanguage` v1beta・`x-goog-api-key`・`GEMINI_MODEL` 既定 `gemini-2.0-flash`・BYO `GEMINI_API_KEY`）。**bonus: consensus 既定 vendors=`claude,codex,gemini` で gemini が silently stub 落ちしていた潜在バグを解消**（key 無し時は `[gemini → stub] …未設定` の labeled fallback）。`test_runner.mjs` で no-key stub 契約を検証。
- ✅ **auto-escalation（cheap 失敗時だけ strong）**: `runPrompt` が cheap step の結果に失敗 sentinel `→ stub]`（runner が必ず付ける接頭辞）を検出したら strong route で1回だけ再試行。**成功すれば安いまま・失敗時だけ課金**＝お財布適応の背骨。発火= tier=cheap かつ node が vendor 非明示かつ on（`routing.autoEscalate:false` / `SHENRON_NO_ESCALATE=1` で off）。strong も落ちたら cheap の理由を残す。`test_runner.mjs` が sentinel 契約を固定。
- **残**: mcp/agent ノードの per-node vendor・consensus を planner から emit・discover の自動 routing 提案。（Sakana 等の追加 vendor は公開 OpenAI 互換 API が無く、モデルは ollama 経由でローカル実行が筋＝新コード不要）
