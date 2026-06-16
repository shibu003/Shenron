# PROJECT — BuildHUD（仮）現状サマリ

> 次セッションの **最初に読む** 1 枚。決定事項・到達点・残 gate・入口を集約。詳細は `docs/` と `prototype/`。
> 更新: 2026-06-16

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

---

## 3. 作って検証済み（動くコード）

| 物 | 場所 | 検証 |
|---|---|---|
| 1-handoff（Persona C） | `prototype/` | review-branch を**実 Codex**がレビュー、往復 COMPLETED |
| A社↔B社 cross-company | `prototype/agents/` | LinkedIn 営業(**Codex**)→マーケ(**Claude**)、**実 LLM**で連鎖 |
| **MCP control plane** | `prototype/mcp/` | **3 索引（agent/workflow/automation）token-light** + `run_workflow`/`run_automation`/`fire_event`。build-state event で automation を引く＋`--unattended` で無人 fire（二段 fence：attended＋token）。trace 検証済 |
| **schedule→Trigger.dev seam** | `prototype/mcp/trigger/` | automation の `schedule` trigger を Trigger.dev v3 declarative `schedules.task` に乗せる（自前 cron 無し、G1 adopt）。`gen-trigger.mjs`＝`automations.json`→task 生成、`run()`→`fire.mjs`→MCP。生成・wiring 検証済 |
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

1. **GATE-1 を閉じる**（最優先・唯一の人間タスク）: 実在の友人 1 人＋反復タスクを実名で確定 → **`prototype/gate1/`**（runbook + 招待文 + scorecard、mechanism は検証済）で 1 回往復 → `SCORECARD.md` を埋める。mechanism と実 Codex 往復は ✅、残るは「実在の 2 人目」と「また使いたい」の 2 criterion のみ。
2. **検証**: `docs/05` の R1/R2/R3 行動テスト（DM 文面・採点・kill-criteria あり）＋ `measure-fleet.mjs`。
3. **roadmap**: `docs/06` の North Star 7 pillar から **gate 条件つき Wave**（3-pass loop）に back-cast（未着手）。
4. （任意）投資家 1-pager / MCP を実 client(.mcp.json)に登録して AI 運用。

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
| `prototype/gate1/` | **GATE-1 close kit**（recruit→run→score。最優先入口） |
| `prototype/README.md` | 1-handoff の動かし方 |
| `prototype/agents/README.md` | A社↔B社 cross-company demo |
| `prototype/mcp/README.md` | **MCP の使い方（次セッション入口）** |

---

## 7. 運用メモ（重要）

- ⚠️ **HOME git hazard**: 親（HOME）に誤って作られた `.git` がある。**この repo は `/Users/shibuyaryouyuu/GioGio` で独立 `git init` 済**（toplevel が GioGio であることを毎回確認）。HOME repo には絶対 commit しない。
- commit は **safe-commit**（明示パス add → staged==expected 検証 → 1 行で commit）。`git add -A`/`.` 禁止。
- **private GitHub**: `shibu003/GioGio`（origin, main 同期済）。push は明示時のみ。
- `.gitignore`: `.env*`/`.dev.vars*`/secret/`.claude/`/`prototype/config.json`/`*.log` 除外。token は env(`A2A_SHARED_TOKEN`)、コミットしない。
- ⚠️ subagent 大量並列は **session limit** に当たり得る（当たった実績あり）。重い fan-out は控えめに。
- prototype は **dev は `--dev`、本番は `A2A_SHARED_TOKEN` 必須**（無いと起動拒否）。
