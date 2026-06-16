# 02 — 技術設計 & ロードマップ / Technical Design

> Claude Code 向けハンドオフ (2/7)。製品文脈は `01`、自己監査 `03`、外部赤チーム `04`、ビジョン `06`、dogfood `07`。
> **2026-06-16 改訂**：製品が「cross-vendor fleet ダッシュボード」から **「A2A の上の cross-person agent handoff レイヤー」** に進化（`06`）。技術設計を **2 層**で再構成する：
> - **土台層**：各自 local で build-state を読む → vendor 中立 Build State IR（= 旧設計、状態とトリガー源）。
> - **製品層**：その IR/イベントを引き金に、**A2A で他人の agent に handoff**（権限・監査・attended・D&D canvas）。
> 原則：**protocol は作らない（A2A/MCP に乗る）。難所は trust と unattended dispatch であり、ログ読取りではない**（`04`）。堀＝cross-person×cross-vendor の handoff 体験＋trust＋build-state ネイティブ。

---

## 1. アーキテクチャ（2 層）

```
                         ┌──────────── 製品層: cross-person handoff (A2A) ────────────┐
[A: founder host]                                                      [B: friend host]
  土台層(下記) ──build-state event──► Handoff Engine                      A2A server
                                       ├ trust gate (MVP=共有secret/allowlist/attended)   /.well-known/agent-card.json
                                       ├ A2A client: message/send ── HTTPS/relay ─────►   skills: review-branch ...
                                       └ D&D canvas で wire                                execute → 自 agent 実行
                                              ▲                                                  │
                                              └──────────── A2A 応答 (result) ◄────────────────┘
  ┌──────────── 土台層: build-state reader + IR (各自 local・per-person) ────────────┐
   Claude Code jsonl / Codex log / git / deploy API  →  vendor 中立 Build State IR
   (context健康=副指標, branch divergence, deploy, feature, host-liveness/staleness)
```

- **土台層**＝各自の machine 内で完結（creds/本文は host に留める・`04` R4）。IR は handoff の **トリガー源**（branch push / deploy / test 完了）と **文脈**（diff/branch）を供給。
- **製品層**＝A2A（JSON-RPC over HTTPS、Agent Card は `/.well-known/agent-card.json`）。**人をまたぐのはここだけ**。trust gate を必ず通す。
- **線は A2A（commodity・標準）、価値は trust＋handoff 体験＋build-state ネイティブ**（`06` §4）。

---

## 2. 中核設計判断（フォーク + 推し + 理由）

| # | 判断 | フォーク | 推し | 理由 |
|---|---|---|---|---|
| **A1** | 状態入手 | 自前 runtime / 既存読取り | **既存を複数 vendor 読む** | jsonl/Codex/git/deploy にある。再発明しない（土台層） |
| **A2** | データモデル | 場当たり / **vendor 中立 IR** | **Build State IR** | 状態とトリガーを 1 モデルに。handoff の文脈源 |
| **A3** | agent 間通信 | 自前 protocol / **A2A に乗る** | **A2A（+MCP）** | A2A v1.0・150+ org（`06`）。線を作らず差別化を上の層へ |
| **A4** | handoff の渡し方 | 自由 prompt / **構造化 + skill** | **A2A skill + 構造化 payload** | Agent Card の skill に型を持たせ安定 dispatch |
| **A5** | dispatch 安全性 | fire-and-forget / **attended + 返すだけ** | **attended（approve gate）・read-only 返答** | unattended 連鎖は最大の難所（`04` R5）。自動 merge しない |
| **A6** | trust | 本物の認可 / **MVP=fake → 段階** | **MVP=共有secret+allowlist+attended、本物は North Star** | cross-party 認可は数年仕事（`04` R4/`06` GATE-2）。fence |
| **A7** | privacy | whole-file relay / **最小 payload** | **diff URL/要約のみ・本文は載せない** | jsonl は secret/本文を含む（`04` R4）。data-minimization |
| **A8** | capture | pure local / **open-core + hosted relay** | **OSS 土台 + hosted trust/relay tier** | multi-tenant relay が network effect・課金点（`06` IA3） |

---

## 3. データモデル（2 つ）

### 3.1 Build State IR（土台層・各自 local）
`cockpit`/`mobile` が描き、handoff のトリガー/文脈になる正典。
```json
{
  "project": { "id": "buildhud", "root": "/abs/path" },
  "host": { "online": true, "lastSeen": "2026-06-16T01:00:00Z", "dataStaleSince": null },
  "sessions": [
    { "id": "s1", "vendor": "claude-code", "branch": "feat/payments", "status": "active",
      "model": "claude-opus-4-8", "modelWindow": 1000000,
      "aiHealth": { "contextFillPct": 53, "cacheHitRate": 0.62, "tokenBurnPerMin": 14200,
                    "warnings": ["context_window_pressure"] } }
  ],
  "branches": [ { "name": "feat/payments", "ahead": 7, "behind": 3, "isCurrent": true } ],
  "deploys":  [ { "target": "vercel-prod", "status": "deployed", "commit": "a1b2c3" } ],
  "features": [ { "id": "f2", "name": "Payments", "status": "in_progress", "branch": "feat/payments" } ]
}
```
- `host.dataStaleSince` ＝ away 時の鮮度を一級表示（`04` IA1）。
- `aiHealth` ＝ **副指標**（鈎でない）。`contextFillPct` は §4 修正式。`modelWindow` は host config（jsonl に窓が無い・`04` IA2）。

### 3.2 Handoff / A2A schema（製品層・cross-person）
build-state イベントが handoff を生み、A2A で運ぶ。
```json
{
  "handoff": {
    "id": "h_001",
    "from": { "person": "A", "vendor": "claude-code",
              "agentCard": "https://a.example/.well-known/agent-card.json" },
    "to":   { "person": "B", "vendor": "codex", "skill": "review-branch" },
    "trigger": { "type": "build_state_event", "event": "branch_pushed", "branch": "feat/payments" },
    "payload": { "repo": "org/app", "branch": "feat/payments", "diffUrl": "https://...", "notes": "" },
    "trust": { "scheme": "shared_bearer", "repoAllowlist": ["org/app"], "attended": true },
    "status": "pending_approval",   // → running → returned | declined
    "result": { "text": null, "at": null },
    "audit": [ { "ts": "...", "actor": "B", "action": "received" } ]
  }
}
```
- **A2A 配線（`08` で接地）**：Agent Card（name/description/skills/securitySchemes）を **`/.well-known/agent-card.json`**（`agent.json` は legacy）に公開、**`message/send`**（非stream）/`message/stream`（SSE）で送信、`AgentExecutor.execute(ctx, event_queue)` で自 agent を実行し event を enqueue。task states は SCREAMING_SNAKE（`SUBMITTED→WORKING→COMPLETED`、`PENDING` 無し）→ 本書の `pending_approval` は A2A の `INPUT_REQUIRED`/`AUTH_REQUIRED` に対応づける。SDK＝`a2a-sdk`/`@a2a-js/sdk`。
- `payload` は **最小**（diff URL/要約。本文を載せない・A7）。

---

## 4. 健康導出（jsonl → 指標）★`04` 修正済 / `08` で簡素化

- **💡 最善は自前計算でなく Claude Code statusline stdin の `context_window` を consume**（`08` §2 接地）：`context_window_size`（200k/1M＝**jsonl に無い窓がここに**）、`used_percentage`（公式に "input only: input + cache_creation + cache_read" と明記＝下式と同一）、`current_usage`/`rate_limits`/`cost`/`session_id` も同梱。**Codex は `payload.info.model_context_window` を in-file 保持**。jsonl 逆算は statusline が無い post-hoc の fallback。
- **contextFillPct（fallback 式）** = **最新リクエスト input 側**（`input_tokens + cache_read_input_tokens + cache_creation_input_tokens`）÷ モデル窓。
  - ⚠️ 旧「累積÷窓」は誤り（実機 137%–2753%、`04`/`05` 再現）。cache_read 再カウント + auto-compact(~83.5%) で累積は無限増。
  - ⚠️ 窓は jsonl に無く `[1m]` suffix も無い → **host config**。不明時は `% 不明`（偽の % を出さない）。
- **cacheHitRate** = `cache_read ÷ (cache_read + cache_creation)`。**唯一数学的に堅い指標**。
- **tokenBurnPerMin** = 直近 N ターンの input+output / 分（streaming bug で過小注意）。
- 検証：`scripts/measure-fleet.mjs` が修正式/旧式を実機対比（`05`）。健康導出は commodity（`/context` が既に正しくやる）＝ 堀でない。

---

## 5. コンポーネント

| 部品 | 層 | 役割 | 正しい挙動 |
|---|---|---|---|
| **State Readers** | 土台 | jsonl/Codex/git/deploy を読む | per-vendor、本文は host に留める |
| **IR Assembler** | 土台 | Build State IR を組立 | staleness/host-liveness を一級に |
| **Trigger Watcher** | 土台 | build-state イベント検知 | branch_pushed / deployed / test_done → handoff 起票 |
| **A2A Server** | 製品 | Agent Card + skill 受信 | `/.well-known/agent-card.json`、bearer 検証、allowlist |
| **Trust Gate** | 製品 | 認可（MVP=fake） | 共有secret+repo allowlist+attended、audit ログ |
| **Approve Queue** | 製品 | attended 承認 | **`canUseTool` callback / blocking MCP**（defer 可・session 再開）。**PTY scrape 禁止**（Omnara が死んだ反 pattern・`08` §5） |
| **Agent Runner** | 製品 | 自 agent を実行 | `claude -p`（`--permission-prompt-tool`）/ **`codex exec --sandbox read-only --skip-git-repo-check`**（exec は非対話＝0.137.x に `--ask-for-approval` 無し・gate は外）、**返すだけ・書込まない** |
| **A2A Client** | 製品 | handoff 送信/受信 | message/send → result |
| **D&D Canvas** | 製品 | handoff を wire | **React Flow/@xyflow v12（MIT）**・generic typed node・domain-over-graph。`A push → B:skill → 結果` を 2-3 node |
| **Cockpit / Mobile** | 両 | IR 描画 / glance・approve | desktop 主・mobile companion（`04` IA4） |

---

## 6. trust モデル（段階）

| 段階 | 方式 | 範囲 |
|---|---|---|
| **MVP（fake）** | 共有 bearer token + repo allowlist + 全 attended + `handoff.log` 監査 | 既知の 1 dyad・1 repo（`07`） |
| **Phase 1** | per-skill scope、named tunnel/relay、revoke、device 紐付け | 小チーム/既知の数人 |
| **North Star（本物）** | **OAuth On-Behalf-Of (OBO) + DPoP**、identity-based delegation、監査連鎖、NIST AI Agent Standards 準拠 | 任意の cross-org（hosted tier） |

> 「誰が・誰の権限で・何の token で・何に触れたか」を最初から `audit` に残す（将来の本物 trust の種）。これは未解決の難問＝堀候補だが scope 爆弾（`06` GATE-2/3）。**MVP では本物を作らない。**

---

## 7. スタック + リポ構成

- **host agent**：Node/TS or Python。readers / IR assembler / trigger / **A2A server+client（a2a-sdk）** / trust gate / dispatch。
- **cockpit**：TS（Tauri/Electron or web）。IR renderer + D&D canvas。
- **mobile**：Expo（glance + approve queue）。
- **shared**：**open IR schema + handoff schema**（標準化・ecosystem 採用狙い）。
- **relay/到達**：MVP=cloudflared/ngrok tunnel、後に hosted relay（capture 点）。

```
/host
  /readers   … claudeCode.ts, codex.ts, git.ts, deploy.ts
  /ir        … buildState.ts (schema + assembler + staleness)
  /trigger   … watch.ts (build-state event → handoff)
  /a2a       … server.ts (AgentCard, execute), client.ts (message/send)
  /trust     … gate.ts (bearer+allowlist+attended+audit)   ← MVP fake
  /dispatch  … run.ts (claude -p / codex exec, read-only 返答)
/cockpit     … desktop (IR renderer, D&D canvas)
/mobile      … Expo (glance, approve queue)
/schema      … build-state-ir + handoff-schema (公開)
```

---

## 8. MVP スコープ（= `07` Persona C）

1. **2 host（A=Claude / B=Codex）**、各自 土台層は最小（branch push 検知だけでも可）。
2. **A2A で 1 skill `review-branch`**：A の push → trigger → A2A `message/send` → B が attended 承認 → `codex exec` で diff review → result を A に返す。
3. **trust=fake**（共有 secret + repo allowlist + attended + `handoff.log`）。
4. **D&D canvas は demo polish**（dogfood 検証は config で先行）。
5. wow＝「他人の agent が、自分の合図で、自分の workflow の一部として動く」。

**やらない**：本物の認可 / 課金 / 任意接続 / unattended 連鎖 / 自動 merge / 複数 skill / フル canvas（`07` §5 fence）。

---

## 9. ロードマップ

- **Phase 0（hackathon）**：§8 / `07`。1 dyad・1 handoff・A2A の上。
- **Phase 1**：vendor 追加、skill 追加、IR 安定化、**open schema 公開**、per-skill scope trust、canvas 拡充。
- **Phase 2（capture）**：hosted trust/relay tier（multi-tenant・network effect）、OBO/DPoP の本物 trust、team handoff、アラート。

---

## 10. 未決フォーク + risk（`04`/`06` 連動）

- ✅ **通信**：A2A に乗る（protocol を作らない）。**接地済（`08` §1）**：card=`/.well-known/agent-card.json`、send=`message/send`、hook=`execute(ctx,event_queue)`、SDK=`a2a-sdk`/`@a2a-js/sdk`。a2a-js(v0.3) と a2a-python(1.0) の version skew に注意、wire 契約を 1 つに固定。
- ✅ **relay**：Happy/Nimbalyst pattern（phone=root of trust・QR は ephemeral 公開鍵・blind relay）。**真の forward-secrecy は自前で足す**（NaCl/AES 単体に ratchet 無し・`08` §4）。outbound-only daemon（inbound port 不要）。
- ✅ **host 常駐**：desktop 常駐 + tunnel/relay（away は staleness 明示）。
- ✅ **model 非依存**：核（cross-vendor が前提）。保守 2 倍化は許容（`04` R7）。
- **trust 本物化**：OBO/DPoP・NIST 準拠は North Star。MVP で作らない（最大 scope risk）。
- **format 追従**：jsonl/Codex ログは無 schema・≈毎週 breaking → reader を version 耐性・graceful degrade。
- **ToS**：他 vendor ログ読取り + headless 駆動 + A2A 越境の商用化が ToS 抵触しないか確認（`04` R7）。
- **配布**：mobile companion は Apple 2.5.2 risk（`04`）。
- **privacy**：payload 最小化・tunnel token 管理・紛失端末 revoke（`04` R4）。
