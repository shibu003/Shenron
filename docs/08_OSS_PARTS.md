# 08 — OSS 設計部品カタログ / OSS Parts Catalog

> ハンドオフ。philosophy #1（OSS 流用＝パクらない・参考にする）に基づき、近い OSS を **5 並列 agent**で解析し、**pattern を抽出**して `02` のコンポーネントに対応づけたもの。**literal copy はしない**（license＋維持コスト）。各部品に license と「採る/避ける」を明記。
> 調査日: 2026-06-16。verified facts は実機 jsonl／公式ドキュメントで接地済。

---

## 0. License マップ（最重要・先に見る）

| 区分 | repo | 用途 |
|---|---|---|
| ✅ **コード借用可（permissive）** | a2a-sdk/@a2a-js/sdk (Apache), Happy (MIT), Nimbalyst (MIT), Vibe Kanban (Apache), Omnara (Apache), ccusage (MIT), React Flow/@xyflow (MIT), Langflow (MIT), ai-agent-board (MIT), claude-code-action (MIT), codex (Apache), go-dpop (MIT), holepunch blind-pairing (Apache) | 部品の土台 |
| ⚠️ **pattern のみ（copyleft/制限）** | n8n (Sustainable Use・非OSI), ComfyUI (GPL-3), saltbo/agent-kanban (FSL), langwatch/kanban-code・kandev (AGPL-3), paseo-relay (AGPL-3) | 設計だけ参照、コード持ち込み禁止 |
| 🚫 **proprietary（参照のみ）** | Conductor (closed。注: `conductor-oss/conductor` は Netflix の別物) | 公開資料からのみ |

---

## 1. A2A transport（A2A Server / Client / Handoff §3.2）

**採る**：公式 `a2a-sdk`（Python, import `a2a`）/ `@a2a-js/sdk`（npm）。bridge 実装の参考に `a2a-opencode`(MIT, coding-agent↔A2A の最も近い例)、`a2a-adapter`(Claude/Codex/LangGraph 等を A2A 化、auto AgentCard)。
**pattern**：`AgentCard(data) → AgentExecutor(自ロジック) → DefaultRequestHandler(+TaskStore) → ASGI/Express`。**event-queue decoupling**＝自 agent は HTTP を触らず `event_queue.enqueue_event(Task/Message/StatusUpdate/ArtifactUpdate)` するだけ。coding-agent ログ→A2A event の "EventPublisher" が我々の IR→A2A bridge そのもの。`contextId → session` で handoff 継続。
**maps_to_02**：A2A Server/Client §5、Handoff schema §3.2、Trust Gate §6（auth は executor の**前段 middleware**＋card の `securitySchemes`）。

### ⚠️ VERIFIED A2A API FACTS（`02`/`07` の "v1.0 要確認" を解決）
- **Agent Card path = `/.well-known/agent-card.json`**（`agent.json` は legacy 0.2 系）。← **docs 要修正**。
- **送信 method（JSON-RPC wire）= `message/send`（非stream）/ `message/stream`（SSE）**、`tasks/get`/`tasks/cancel`。**`task/send` は存在しない**（早期 draft 名）。
- **executor hook = `execute(context, event_queue)` と `cancel(...)`**。**`on_message_send` は SDK に無い**。← **docs 要修正**。
- **task states（1.0, SCREAMING_SNAKE）**：`SUBMITTED → WORKING → INPUT_REQUIRED/AUTH_REQUIRED → COMPLETED/FAILED/CANCELED/REJECTED`。**`PENDING` は無い**（入口は `SUBMITTED`）。我々の `pending_approval` は `INPUT_REQUIRED`/`AUTH_REQUIRED` に寄せる。
- **v1.0 破壊的変更**：`A2AStarletteApplication`/`A2AFastApiApplication` 廃止 → route factory（`create_jsonrpc_routes()` 等）。旧 `AgentAuthentication(schemes=['public'])` → `securitySchemes`+`security`。**tutorial の多くは旧 API**、コピペ不可。
- **client（JS）**：`await new ClientFactory().createFromUrl(url)`（card 自動取得）→ `sendMessage`（poll）/ `sendMessageStream`（SSE generator）。
- **注意**：a2a-js の README は v0.3、a2a-python は spec 1.0（0.3 compat）。**wire 契約の version を 1 つに固定**。

---

## 1.5 GLUE adopt 決定（2026-06 調査・詳細は `09 §2.5`）

GLUE は作らず乗る（philosophy #1）:
- **G1** → Trigger.dev(Apache-2.0) / Hatchet(OSS・AI-agent durable)
- **G3** → HumanLayer（Slack/email/SMS 承認。cross-party identity だけ自前）
- **G4/G5** → Solo.io **agentgateway**(LF・A2A+MCP native・中立) / Kong Agent Gateway / Portkey / LiteLLM / TrueFoundry（registry+discovery+routing+多テナント計量）
- **G2** → React Flow 上に自前（A2A-card-as-node を native でやる OSS 無し）

⚠️ **G4/G5＋中立層は gateway 勢が商品化** → 接続で戦わず乗る。capture は relay でなく trust/orchestration/index へ（`06 §6.6`）。

---

## 2. Build-state / 健康導出（State Readers / IR Assembler / §4）

**採る**：`ccusage`(MIT, 16k★) の discovery/parse/dedup、`Claude-Code-Usage-Monitor`(MIT) の poll-with-change-detection。
**💡 最大の簡素化**：context fill を**自前計算しない**。Claude Code の **statusline stdin** が `context_window` を提供：
- `context_window.context_window_size`（200000、拡張は 1000000）＝ **jsonl に無い窓がここに**。
- `context_window.used_percentage`＝ 公式に *"input tokens only: input + cache_creation + cache_read"* と明記＝**我々の式と同一**。
- 併せて `current_usage`, `rate_limits.{five_hour,seven_day}`, `cost.total_cost_usd`, `model.id`, `session_id`, `transcript_path`。
→ aiHealth は **statusline 契約を consume**、post-hoc は jsonl fallback。**Codex は `payload.info.model_context_window` を in-file 保持**（model-table 不要）。
**pattern（jsonl 読取り）**：env-var-first 多 path（`~/.config/claude/projects` → `~/.claude/projects`、`CLAUDE_CONFIG_DIR`）→ `**/*.jsonl` 逐行 parse・壊れ行 skip → **dedup = `message.id`+`requestId` の last-write-wins**（#888：streaming は最終 usage を最後に書く）。**Codex は cumulative** → 連続 `total_token_usage` を**差分**。
**⚠️ 重要**：jsonl の `input_tokens`/`output_tokens` は streaming bug で最大 100–174× 過小（ccusage #866）。**cache_read/cache_creation のみ accurate** → `cacheHitRate` が唯一堅い（`04` と一致）。
**maps_to_02**：§4 健康導出（statusline 優先・jsonl fallback）、State Readers、IR Assembler。
**caveats**：jsonl は無 schema・≈毎週 churn。ccusage は live monitor を v18 で撤去（公式 statusline/usage が出て**陳腐化**したため＝我々も自前 live を作り込まない理由）。

### VERIFIED LOG FACTS（実機確認）
- Claude jsonl: `~/.claude/projects/<encoded-cwd>/<sessionId>.jsonl`。line: `message,requestId,uuid,timestamp,cwd,sessionId,version,gitBranch...`。`message.usage`: `input_tokens, cache_creation_input_tokens, cache_read_input_tokens, output_tokens, service_tier, cache_creation{ephemeral_1h/5m}...`。model=`claude-opus-4-8`（`[1m]` 無し）。
- Codex: `~/.codex/sessions/<Y>/<M>/<D>/rollout-<ts>-<uuid>.jsonl`（`CODEX_HOME`）。line `{timestamp,type,payload}`、token は `type:"event_msg"`＋`payload.type:"token_count"`、`payload.info.{total_token_usage,last_token_usage,model_context_window}`、`payload.rate_limits`。`cached_input_tokens`＝Claude の cache_read。

---

## 3. vendor 中立 IR ＋ worktree（IR Assembler §3.1 / State Readers / §5）

**採る**：`Vibe Kanban`(Apache, 会社は 2026-04 解散だが **local worktree+executor core は community 継続**)。
**pattern（= 我々の IR の青写真）**：`StandardCodingAgentExecutor` trait（`spawn / spawn_follow_up(session_id) / spawn_review / normalize_logs(event_store)→1 event schema`）＋ enum dispatch。**DB/UI は normalized event しか見ない**（生 vendor 出力を遮断）＝ vendor 中立 IR。**Task ≠ run**：`Task`(計画) → `TaskAttempt`(worktree＋executor) → `ExecutionProcess`(実行)。再実行＝新 Attempt（retry/side-by-side が first-class、履歴保持）。**1 worktree / attempt**（workspace=論理、worktree=物理、cleanup toggle）。**status は process から derive**（保存しない＝単一真実源）。Tauri＋localhost server＋WS（SQLite change→broadcast、polling 不要）。
**maps_to_02**：§3.1 IR Assembler（executor trait＋normalize_logs）、State Readers（per-process repo-state＝ahead/behind/diff）、§5（worktree lifecycle）。
**caveats**：relay/remote crates は dead（mirror しない）。core のみ。Rust+TS は重い→**概念**を採る。

---

## 4. relay / QR / E2E（Relay §7・mobile companion・Approve Queue）

**採る**：`Happy`(MIT, 22k★) ＋ `Nimbalyst`(MIT, 今日 release) が**同じ pattern を二重に実証**。threat-model は `paseo-relay`(AGPL=pattern のみ)、handshake は holepunch `blind-pairing-core`(Apache)、rekey は `termpair`(MIT)。
**pattern（keystone・収束）**：
- **phone = root of trust**。32B master secret は mobile secure storage のみ、desktop は provision。
- **QR は ephemeral 公開鍵を運ぶ（静的 secret でない）**→ X25519 ECDH で共有鍵を作り、それで per-session DEK を輸送→ephemeral 鍵破棄（pairing FS）。crypto＝libsodium NaCl `crypto_box`/`secretbox`（Happy。marketing の "TweetNaCl" でなく**実体は libsodium**）or AES-256-GCM（Nimbalyst）。
- **blind relay**：server は ciphertext ＋ plaintext の `seq`/version のみ。**zero-round-trip 認証**（device が自分で challenge を選び署名、password なし）。
- **outbound-only daemon**（Omnara）：daemon は外向き接続のみ＝**inbound port 不要**（SSH/tunnel 不要の安全談）。
- **relay 実体の選択**：self-host blind WS relay（Happy・control/lock-in 回避）or edge Durable Objects（Nimbalyst・低 ops、Cloudflare lock-in）。
- **handshake 強化**：holepunch invite-token＋proof-of-secret＝**QR が漏れても成りすませない**（withheld pubkey に対し secret 所持を暗号証明）。
**⚠️ FS 注意**：Happy/Nimbalyst とも**真の forward-secrecy ratchet は無い**（NaCl box/secretbox 単体）。**我々が ephemeral session 鍵 or termpair の counter-triggered rekey を足す**。
**maps_to_02**：§7 relay/tunnel、QR-pair E2E、mobile companion、Approve Queue（push で起こし client 側で復号）。

---

## 5. dispatch ＋ approve（Agent Runner §5 / Approve Queue / Trust §6）

**採る**：公式 `claude-agent-sdk`（`canUseTool` callback）＋ `claude-code-action`(MIT, "review only, never auto-merge" の規範) ＋ `codex` CLI。
**pattern**：
- **Approve Queue = `canUseTool(tool, input, ctx)→PermissionResult`**（SDK 標準）。5 mode（approve / approve-with-changes＝`updatedInput` 改変 / approve-and-remember / reject-with-reason / suggest-alt）。**defer 可（process 終了→session_id から再開）＝out-of-band の人間承認**。`PermissionRequest` hook で reviewer に通知。CLI 等価は `--permission-prompt-tool <mcp_tool>`。
- **❌ 反 pattern**：PTY を regex scrape して keystroke 注入（Omnara が**これで死に**closed pivot）。**端末でなく構造化 transcript/SDK を読む**。
- review-only 姿勢（claude-code-action）：tool は allowlist 必須、Bash default deny、trigger 層で actor 検証、`execution_file` から結果取得。

### VERIFIED DISPATCH FACTS（CLI help で接地）
- **claude headless**：`claude -p "<prompt>"`。`--output-format text|json|stream-json`（stream は `--verbose` 必須）。`--json-schema` → `.structured_output`。`--permission-mode default|acceptEdits|plan|dontAsk|bypassPermissions`、`--allowedTools "Bash(git diff *)"`/`--disallowedTools`、`--permission-prompt-tool`（=headless の canUseTool）。`--resume/-r`, `--continue/-c`, `--fork-session`, `--mcp-config`, `--bare`。評価順 Hooks→Deny→Ask→Mode→Allow→canUseTool。
- **codex headless（実機 0.137.0 で確認）**：`codex exec "<prompt>"`（`-` で stdin）。**機械可読は `--json`（NDJSON）のみ**（`--output-format json` は**無い**）。`--output-last-message`/`-o`, `--output-schema`。**`codex exec` は既定で非対話＝`--ask-for-approval` flag は無い**（書込制御は `--sandbox/-s read-only|workspace-write|danger-full-access`、危険な全許可は `--dangerously-bypass-approvals-and-sandbox`）。`--skip-git-repo-check`/`--cd`/`--add-dir` あり。`-p` は **profile**（print でない）。resume: `codex exec resume [ID]`。**注**：interactive `codex`（exec でない）には approval 概念があるが、headless は sandbox で制御。
- **🔑 設計上の要点**：**Codex の approval は対話的** → 我々の attended-out-of-band では **`codex exec --ask-for-approval never --sandbox <tight>` で走らせ、gate は BuildHUD の Approve Queue 側**（review を返すだけ）。Claude は `canUseTool`/`--permission-prompt-tool` で native に defer 可。

---

## 6. D&D canvas（D&D Canvas §5 / Handoff schema / Agent Runner）

**採る**：**`@xyflow/react`（React Flow）v12（MIT, 37k★, 2026-06 active）**。参考 `Langflow`(MIT), `Flowise`(Apache, ただし `enterprise/` は商用), `ai-agent-board`(MIT, desktop drag に最も近い)。n8n/ComfyUI/saltbo/langwatch は **pattern のみ**（license）。
**pattern**：
- canvas は React Flow 一択（2-3 node に ComfyUI の GPL Canvas2D は過剰）。
- **generic typed-handle node**：component-per-type を作らず、1 個の汎用 node が agent-type registry の template を introspect して handle/入力を描く。**接続時に型検証**（出力型 ∩ 入力型）＋ ComfyUI 的 `ANY`/union。
- **drag=intent / Run button=commit**（ai-agent-board）。`repoPath` を allowlist（安全 rail）。
- **domain-model over graph（n8n の最重要 pattern）**：**我々の handoff-workflow を真実源にし、React Flow は純 render/interaction 層**（mapping module 経由）。永続/実行/undo は canvas lib 非依存。
- **handoff = `depends_on` edge＋cycle 検出**（saltbo）。**edge は trigger だけでなく上流 context を運ぶ**（kandev：subtask が parent session を resume／Flowise：`{{nodeId.output}}`＋共有 state）。
- node 状態（running/success/error＋inline diff）は **node-id keyed status map を SSE/WS で駆動**＝canvas が live HUD。Langflow の "tweaks"（per-run override）、ComfyUI の **ancestor-aware caching**（入力不変な step を再 dispatch しない）。
**maps_to_02**：D&D Canvas §5、Handoff schema §3.2（typed port で不正 handoff を描画時に弾く）、Agent Runner（node→Attempt、再実行は新 Attempt）。

---

## 7. trust North Star（Trust Gate §6・段階移行）

**採る（spec/参考）**：RFC 8693 (Token Exchange/OBO), RFC 9449 (DPoP), MCP Authorization, `go-dpop`(MIT), `microsoft/identity-spiffe`(MIT, SPIFFE/SPIRE), NIST AI Agent Identity（2026-02 draft）。
**移行 Wave（独立 revertable）**：
1. **MVP（現行）**：共有 bearer＋repo allowlist＋全 attended＋audit ログ（attended が弱 token の補償制御）。
2. **per-agent identity**：agent ごとに credential＝**real audit 帰属**。
3. **DPoP**（`cnf.jkt` sender-constraint）＝**token 盗難無効化・最高 ROI の最初の一手**。
4. **RFC 8693 OBO**：`actor_token` 保持で `act` chain＝audit 連鎖、`may_act`＋scoped audience が **repo allowlist を置換**。
**🚨 AI-codegen footgun（trust コードを AI に書かせる時の罠）**：① delegation でなく impersonation（`act` 欠落＝audit 崩壊）② DPoP 署名は検証するが `cnf.jkt`↔proof-key／`ath` binding を忘れ実質 bearer に退化 ③ MCP token passthrough（confused deputy）。**これらは AI が書くと静かに通る**＝`02` IA「AI が書くから安全」への反証（point 2 の罠）。
**maps_to_02**：§6 trust 段階。
**caveats**：SPIFFE/SPIRE は MVP に過剰。A2A は on-behalf-of payload を標準化しない→delegation 連鎖は RFC 8693 を別途。

---

## 8. 他 docs へ適用する修正（センス悪い即修正）

- **`02` §3.2 / §10・`07`**：Agent Card path `agent.json` → **`agent-card.json`**。executor hook `on_message_send` → **`execute(ctx, event_queue)`**。state `pending` → **`SUBMITTED`/`INPUT_REQUIRED`**。（適用済 → 下記コミットで）
- **`02` §4**：「jsonl から逆算」→ **「statusline `context_window` を優先 consume、jsonl は fallback」**＋ input/output unreliable・cache のみ accurate。Codex は `model_context_window` in-file。
- **`02` §5**：D&D Canvas = **React Flow/@xyflow v12**。Approve Queue = **`canUseTool`/blocking MCP（PTY scrape 禁止）**。Agent Runner = verified flags（`claude -p`/`codex exec --json --ask-for-approval never`、gate は外）。
- **`07`**：codex を `--json`＋`--ask-for-approval never --sandbox`、gate は Approve Queue 側。card path 修正。
- **`02` §7**：relay は Happy/Nimbalyst pattern＋**FS を自前で足す**（NaCl 単体に ratchet 無し）。outbound-only daemon。

---

## Sources（主要）
- A2A: github.com/a2aproject/a2a-python, /a2a-js, /a2a-samples（headless_agent_auth）, shashikanth-gs/a2a-opencode, ai-boost/awesome-a2a
- Logs/health: github.com/ryoppippi/ccusage（#866/#888/#676）, Maciek-roboblog/Claude-Code-Usage-Monitor, code.claude.com/docs/en/statusline, ryoppippi.com/blog（ccusage for codex）
- IR/worktree: github.com/BloopAI/vibe-kanban
- Relay/E2E: github.com/slopus/happy, nimbalyst/nimbalyst, zenghongtu/paseo-relay, holepunchto/blind-pairing-core, cs01/termpair
- Dispatch/approve: anthropics/claude-code-action, anthropics/claude-agent-sdk, openai/codex(+codex-action), code.claude.com/docs/en/cli-reference, developers.openai.com/codex/cli/reference
- Canvas: github.com/xyflow/xyflow（@xyflow/react v12, MIT）, langflow-ai/langflow, FlowiseAI/Flowise, DanWahlin/ai-agent-board
- Trust: RFC 8693, RFC 9449, modelcontextprotocol.io（authorization）, AxisCommunications/go-dpop, microsoft/identity-spiffe, NIST NCCoE AI Agent Identity
