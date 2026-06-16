# 02 — 技術設計 & ロードマップ / Technical Design

> Claude Code 向けハンドオフ (2/4)。製品文脈は `01_PRODUCT.md`、自己監査は `03_FEEDBACK_LOOP.md`、外部赤チームは `04_RED_TEAM_AUDIT.md`。
> 原則：**複数 vendor のソースから"読む"→ vendor 中立 IR に束ねる → desktop cockpit で描く（mobile は companion）→ agent に"投入"する。** 難所は dispatch（unattended 実行）と privacy 境界であり、jsonl 読取りではない（04 で訂正）。堀は「open cross-vendor IR ＋ model 中立 ＋ 統合 view ＋ craft」。

---

## 1. アーキテクチャ（パイプライン）

```
[Desktop Cockpit (主 surface)]        [Host Agent (開発機/Codespace)]
  cross-vendor IR 描画  <── 暗号relay ──   cross-vendor 状態リーダー群:
  feature コンポーザ(構造化form)             ├─ Claude Code リーダー (~/.claude/projects/*.jsonl)
        │                                     ├─ Codex リーダー (Codex ログ形式)
[Mobile Companion]                            ├─ Gemini CLI リーダー (将来)
  glance / approve   <── 暗号relay ──        ├─ git リーダー (branch 食い違い / feature)
        │  "feature intent"(構造化)           └─ deploy リーダー (Vercel/EAS/Netlify API)
        └──────────── 投入 ─────────►         │
                                         [vendor 中立 Build State IR (JSON)] ← 唯一の正典・堀のIP
                                              │  + host-liveness/staleness ← away 時の鮮度を明示
                                         agent SDK / headless (dispatch + approve + recover)
```

- **relay**：QR ペア＋E2E 暗号。**= Anthropic Remote Control / Codex と同型（commodity・堀でない・売りにしない）。** 04 で first-party 化を確認。
- **唯一の正典＝vendor 中立 Build State IR**。複数 vendor を 1 モデルに束ねる事が堀。
- **dispatch は監視つき（attended）を default**。unattended 完走は agent が最も失敗する所（04/R5）→ approve/recover を一級設計に。
- **privacy 境界**：relay には **派生済の数値/状態のみ**を流す。message 本文・secret・コードは host に留める（04/R4・data-minimization）。

---

## 2. 中核設計判断（フォーク + 推し + 理由）

| # | 判断 | フォーク | 推し | 理由 |
|---|---|---|---|---|
| **A1** | 状態の入手 | 自前 runtime / 既存ソースを読む | **既存を複数 vendor 読む** | jsonl・Codex ログ・git・deploy API にある。再発明しない |
| **A2** | データモデル | ソース別場当たり / **vendor 中立 IR** | **vendor 中立 Build State IR** | cross-vendor を 1 モデルに束ねる事自体が堀（model 中立） |
| **A3** | 接続 & capture | pure local / **open-core + hosted tier** | **local OSS reader ＋ hosted fleet/team relay** | local は creds 安全だが capture を foreclose（04/IA3）。hosted team tier で metering（→ §10 resolved） |
| **A4** | 機能の渡し方 | D&D / **構造化 form intent** | **構造化 feature intent（form/prompt）** | D&D は commodity + mobile anti-pattern（04/D5）。中核は構造化 intent、D&D は任意 |
| **A5** | dispatch 安全性 | fire-and-forget / **attended + recover** | **attended dispatch（approve/recover 一級）** | unattended 完走は失敗源（04/R5）。away は approve queue で |
| **A6** | privacy | whole-file relay / **数値のみ relay** | **派生数値/状態のみ host 外へ** | jsonl は本文/secret を含む（04/R4）。最小化必須 |

---

## 3. vendor 中立 Build State IR（具体スキーマ + 実例）

cockpit/mobile が描く唯一のモデル。host が各 vendor リーダーから組み立てる。

```json
{
  "project": { "id": "buildhud", "name": "BuildHUD", "root": "/abs/path" },
  "host": {
    "online": true,                 // host 常駐の生死（away 時の鮮度判定）
    "lastSeen": "2026-06-15T08:51:10Z",
    "dataStaleSince": null          // host 不在なら staleness を一級表示（04/IA1）
  },
  "sessions": [
    { "id": "s1", "vendor": "claude-code", "branch": "feat/payments",
      "status": "active", "model": "claude-opus-4-8", "modelWindow": 1000000,  // 窓は host config（jsonl に無い・04/IA2）
      "aiHealth": {
        "contextFillPct": 53,       // ★最新リクエスト input 側 ÷ 窓（累積ではない・04 訂正）
        "cacheHitRate": 0.62,       // cache_read ÷ (cache_read + cache_creation) ＝唯一数学的に堅い指標
        "tokenBurnPerMin": 14200,
        "warnings": ["context_window_pressure"]
      } },
    { "id": "s2", "vendor": "codex", "branch": "main", "status": "idle", "model": "gpt-...", "aiHealth": { "contextFillPct": 22, "cacheHitRate": null } }
  ],
  "branches": [
    { "name": "main",         "ahead": 0, "behind": 0,  "isCurrent": false },
    { "name": "feat/payments","ahead": 7, "behind": 3, "isCurrent": true }
  ],
  "deploys": [
    { "target": "vercel-prod", "status": "deployed",    "commit": "a1b2c3", "at": "...Z" },
    { "target": "vercel-prev", "status": "out_of_date", "commit": "main@9f", "at": "...Z" }
  ],
  "features": [
    { "id": "f1", "name": "Auth",     "status": "implemented", "branch": "main" },
    { "id": "f2", "name": "Payments", "status": "in_progress",  "branch": "feat/payments" }
  ]
}
```

- `host` ＋ `dataStaleSince` ＝ **away 時の staleness を一級に**（04/IA1。旧 schema には無かった穴）。
- `sessions[].vendor` ＝ **cross-vendor 統合の核（P1）**。`modelWindow` は host config（jsonl に窓も `[1m]` suffix も無い・04/IA2）。
- `aiHealth` ＝ **副指標**（鈎でない）。`branches`/`deploys`/`features` ＝ P2 統合。
- `feature intent`（A4 出力）の例：
```json
{ "type": "add_feature", "label": "Push notifications",
  "targetVendor": "claude-code", "targetBranch": "feat/payments", "notes": "expo-notifications, opt-in" }
```
host が構造化タスクに翻訳し **attended dispatch**（approve gate つき）で投入。

---

## 4. 健康導出ロジック（jsonl → 指標）★04 で式修正

各 vendor のセッションログ（Claude Code＝`~/.claude/projects/*.jsonl`、Codex＝Codex 形式）を読み集計：

- **contextFillPct（修正版）** = **最新リクエストの input 側**（`input_tokens + cache_read_input_tokens + cache_creation_input_tokens`）÷ **モデル窓**。
  - ⚠️ **旧式「累積トークン ÷ 窓」は誤り**（04 実機検証：446%–252,616%、569 中 80% が >100%）。cache_read を毎ターン再カウント + auto-compact(~83.5%) で累積は無限増。
  - ⚠️ **窓サイズは jsonl に無く、`[1m]` suffix も保存されない**（model＝`claude-opus-4-8`）→ **窓は host 側 config** で持ち、不明時は `% 不明` を表示（偽の % を出さない）。
- **cacheHitRate** = `cache_read` ÷ (`cache_read` + `cache_creation`)。**唯一数学的に堅い指標**（cache フィールドは streaming bug の影響を受けない）。
- **tokenBurnPerMin** = 直近 N ターンの input+output / 経過分（streaming bug で input/output は過小になり得る・注意）。
- **warnings**：`contextFillPct > 閾値` → `context_window_pressure`、`cacheHitRate` 急落 → `cache_thrash`。
- 既存 OSS（ccusage 4.8k★ 他）が **token 帰属/コスト**を読めるのは実証。**ただし「live context fill」は別物**（ccusage は live monitor を撤去）。健康導出は **commodity**（`/context` が既に正しくやる）＝ 堀でない。堀は統合 IR + model 中立。

---

## 5. コンポーネント（部品システム）

| 部品 | 役割 | 正しい挙動 |
|---|---|---|
| **Cross-Vendor Session View** | 全 vendor の active session を 1 view | vendor badge + branch + status。**P1 の核** |
| **Feature Inventory** | 実装済/進行中 | branch 別、git/解析から |
| **Deploy Indicator** | デプロイ状態 | target 別 deployed/out_of_date/failed |
| **Branch Divergence** | branch 食い違い | ahead/behind、衝突予兆 |
| **Health Cell（副）** | context/cache を glance | 修正式の fill% + cacheHit。warning 時に色。**鈎でなく副 cell** |
| **Staleness Banner** | host 鮮度 | host offline 時「データは HH:MM 時点」を一級表示 |
| **Feature Composer** | 機能を足す | **構造化 form**（label/vendor/branch）→ intent → **attended dispatch**。D&D は任意 affordance |
| **Approve Queue** | away 承認 | dispatch の permission/plan/conflict を mobile で承認・redirect |

---

## 6. デザインシステム / 配信 / 計測

- **desktop-first cockpit**：横断 view を密に。mobile は **glance/approve companion**（情報を絞る）。
- **配信**：cockpit＝Electron/Tauri or web。mobile＝Expo（OTA）。OSS リポ公開。**Apple 2.5.2 risk**（vibe-coding app 排除中）を mobile 配布前に確認。
- **計測**：cross-vendor session を束ねた数、away approve 成功率、staleness 露出時間、warning 的中率、（R1）health を見て取った行動。

---

## 7. スタック提案 + リポ構成

- **cockpit**：TS（Tauri/Electron or web）。IR renderer、cross-vendor view。
- **mobile**：React Native / Expo（glance/approve）。
- **host agent**：Node/TS。vendor 別リーダー、IR 組み立て、relay endpoint、attended dispatch。
- **relay**：QR ペア＋E2E（commodity）。
- **shared**：**open IR schema（標準化を狙う公開パッケージ）**。

```
/cockpit    … desktop (cross-vendor IR renderer, composer)
/mobile     … Expo (glance, approve queue)
/host       … node agent
  /readers  … claudeCode.ts, codex.ts, gemini.ts, git.ts, deploy.ts
  /ir       … buildState.ts (schema + assembler + staleness)
  /dispatch … attended.ts (feature intent → headless + approve/recover)
  /relay    … pair.ts, channel.ts (数値のみ・data-minimization)
/ir-schema  … open build-state IR (公開・ecosystem 採用狙い)
```

---

## 8. MVP スコープ（ハッカソン）

1. **2 vendor**（Claude Code + Codex）を host が読み、**1 つの cross-vendor IR** に束ねる。
2. desktop cockpit：**Cross-Vendor Session View ＋ Branch Divergence ＋ Deploy Indicator**、Health は **副 cell**（修正式）。
3. **構造化 form で feature 追加 → attended dispatch**（approve gate つき）。
4. **mobile companion**：glance + approve queue。
5. **staleness banner**（host offline 時）。
6. デモ＝「全 vendor を 1 view → away approve」。

**やらない（MVP）**：D&D 中核 UI、context-health を鈎扱い、unattended 完走、マルチ project 網羅、Gemini。
**着手前に潰す（コード前）**：① §4 式修正の実機確認 ② privacy 境界（relay に本文を載せない設計）③ R1 行動テスト ④ fleet operator TAM 計測。

---

## 9. ロードマップ

- **Phase 0（ハッカソン）**：§8。鈎＝cross-vendor 1 view。
- **Phase 1（early/OSS）**：vendor 追加（Gemini）、IR 安定化、**open IR schema 公開 + ecosystem 採用**、health 精度。
- **Phase 2（capture）**：**hosted fleet/team tier**（複数 operator/machine 集約 relay、team handoff、cross-builder 可視性 = network effect）、アラート、深い dispatch。

---

## 10. 未決の技術フォーク（04 で一部 resolved）

- ✅ **host ランタイム**：**desktop cockpit 常駐 + relay**（away は staleness 明示）。Codespace は hosted tier の選択肢。
- ✅ **model 非依存**：保険でなく **核**（cross-vendor が P1）。ただし保守面 2 倍化を許容（04/R7・format 税）。
- **feature インベントリ導出**：git/PR ベース / 静的解析 / agent 要約（未決）。
- **format 追従**：jsonl/Codex ログは無 schema・private・≈毎週 breaking（04/R7）→ reader を version 耐性設計に、壊れたら graceful degrade。
- **ToS**：他 vendor ログ読取り + headless 駆動の商用化が ToS 抵触しないか要確認（04/R7）。
- **privacy 実装**：E2E の鍵管理・紛失端末 revoke・at-rest 暗号（04/R4）。
