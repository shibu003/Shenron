# 06 — 統合ビジョン / Vision（膨張整理 + counter-positioning）

> ハンドオフ。会話で vision が 3 段膨張したので 1 枚に整理。`01`–`05` の前提を更新する上位レイヤー。
> 原則（§3.5）：競合がいても撤退しない。土俵 / 手法 / 痛みをずらして空白を**作る**。**ただし「ずらせば勝てる」で終えない** — 作った空白は耐久テスト（巨人は追随に何を捨てるか）と 7 ステップにかけ、🔴 は 🔴 と書く。
> 更新日: 2026-06-15

---

## 1. これは何か（整理後の一行）

**人をまたいで（A君の agent ⇄ B君の agent）、vendor をまたいで、AI agent の仕事を 1 つの automation workflow に D&D で繋ぐ「handoff の信頼レイヤー」。** 通信は既存標準（A2A / MCP）に乗り、その上に **cross-person の権限・監査・build-state トリガー・UX** を載せる。

- 旧称 BuildHUD（dashboard）から発展。今の核は **dashboard ではなく "cross-person agent handoff"**。
- 巨人が来られない理由：単一 vendor・単一アカウント lock-in を捨てないと cross-person×cross-vendor に来られない（§4 耐久テスト）。

---

## 2. vision はどう膨張したか（正直な journey）

| 段 | vision | 判定 | なぜ動いたか |
|---|---|---|---|
| V1 | 自分の AI **context 健康**を phone で見る | 🔴 鈎 | keystone 反証・式破綻・action なし（`04`） |
| V2 | 自分の **cross-vendor fleet** を 1 view | 🔴 混雑 | Nimbalyst/Melty/Vibe Kanban が既出（`05` 接地） |
| V3 | **cross-PERSON** で agent を繋ぎ automate（D&D） | 🟢 空白候補 | 人をまたぐ coding-agent handoff は未占（本書） |

⚠️ **パターン注意**：vision が会話 3 回で膨張＝solo で「何も出荷せず終わる」最大リスク（`04` 最警告）。膨らむほど **規律（安く検証・MVP 極小 fence）が *より* 重要**。本書は膨張を肯定するためでなく、**膨張を fence して出荷可能にする**ために書く。

---

## 3. North Star と「今やること」（レイヤー分離）

```
NORTH STAR（数年・資金前提）
  cross-person × cross-vendor agent handoff の信頼レイヤー
  ＝ 「他人の agent を、権限つきで、自分の workflow に組める」
        ▲ ここを最終的に取る
        │
  ─────┼───────────────  ← MVP はこの線の下だけ
        │
MVP（hackathon・solo・金欠で出荷可能）
  ★ 信頼できる 1 dyad の、1 つの handoff を、D&D で繋ぐデモ
    例: 自分の Claude agent が PR → 相方の Codex agent が自動レビュー
    - A2A/MCP の上に乗る（protocol は作らない）
    - trust 層は「2 人が事前合意」で fake（多テナント認可は作らない）
    - attended（approve gate つき）。unattended 連鎖は作らない
```

**鉄則**：MVP で multi-tenant 認可・課金・任意の他人接続を**作らない**。それは North Star の領域で、solo の hackathon scope では死ぬ（§5）。

---

## 4. 戦う土俵（§3.5 counter-positioning・耐久テスト済）

3 レバーで「ずらし」を生成し、各々「巨人/競合は追随に何を捨てるか」で判定：

| レバー | ずらし案 | 耐久テスト | 判定 |
|---|---|---|---|
| 痛み | **cross-person の handoff 信頼**（orchestration でなく「誰が・何を・誰の token で・監査」） | orchestrator(CrewAI/Nimbalyst)は single-owner → multi-tenant trust に作り直し要。巨人は単一アカウント放棄要 | 🟢 構造（但 §5-b 激戦） |
| 痛み | **build-state ネイティブ**（branch/deploy/context で handoff 発火） | A2A は content 非依存の transport、build-state を知らない→IR を作る要 | 🟡 IR 深いほど堀 |
| 手法 | **A2A/MCP の上に乗る**（protocol を作らず、cross-person 権限+UX レイヤー） | 標準と戦わず差別化を UX(D&D canvas)+coding 特化に。standard-native | 🟡 craft 寄り |
| 手法 | **hosted trust/relay tier で課金**（multi-tenant=network effect） | 巨人は cross-vendor×cross-person relay を host できない（lock-in 放棄） | 🟢 構造（IA3 解決） |
| 方向 | **具体 dyad に縦特化**（OSS maintainer↔contributor / reviewer↔author / client↔dev） | 巨人は median 単一ユーザ最適化を強制される | 🟢 構造（但 buyer 未検証） |
| 方向 | **handoff が既に起きる面に寄生**（GitHub PR / Linear / Slack @mention） | scope 減・既存協業面に乗る | 🟡 面は巨人所有 |

**創発合成**：cross-person trust（痛み）× hosted relay（手法・課金）× 具体 dyad（方向）を掛け、**A2A/MCP の上**に D&D canvas + build-state トリガーで載せる。
> **「他人の AI agent を、権限・監査つきで、自分の workflow に D&D で組み込めるレイヤー。線は A2A、信頼と体験は我々。」**

単一巨人が追随するには (a) cross-vendor×cross-person relay を host（lock-in 放棄）(b) 競合 agent を自社内で昇格（anti-monetization）(c) cross-org の niche を median より優先 — **三重自傷** → **巨人に対しては構造空白 🟢**。

---

## 5. 越えられない 2 つの GATE（土俵ずらしでは消えない・正直に 🔴）

§4 は「巨人に対する防御可能性」を作った。だが **防御可能 ≠ 需要**。エンジンが**作れない**もの：

**🔴 GATE-1：買い手/痛みが未検証（最重要）**
「A君+B君の agent が自動連携」は cool だが、**誰が・どの反復作業で出血するか**が空白。空白の arena は防御可能でも、買い手が居なければ空のまま。
→ 越え方（コスト 0）：**実在の 1 ペア＋反復 handoff タスクを名指しできるか。** 書けなければ pain でなく vision。

**🔴 GATE-2：scope = 防御可能な部分こそ作るのが地獄**
cross-party trust（identity / 権限 / 監査 / 課金）は「誰も解いてない難問」（O'Reilly/Airia/NIST 2026）＝ 防御可能な理由 ∧ 資金ありチームの数年仕事。**solo の hackathon では本物は作れない。**
→ 越え方：MVP は §3 通り **1 trusted dyad で trust を fake**。本物の認可は North Star に隔離。

**🟡 GATE-3：空白は「無人」でなく「激戦の governance」**
cross-party agent trust に NIST AI Agent Standards(2026/2)・CIAM/WIAM(Strata/Airia/Red Hat)・A2A consortium(150+ org) が突入中。**巨人単体には構造空白だが、標準/security 勢とは competing**。かつ trust/governance は **enterprise 重力**で solo/indie/free-tier-juggler ICP から引き離す力がある。要 watch。

---

## 5.5 Buyer Persona ＆ ピッチ構成（GATE-1 への答え）

ハッカソン/調達では buyer = (a) 売る相手の persona ＋ (b) vision を買う投資家。persona は「で、誰が本当に使うの?」に耐える必要がある。痛みの実在度で序列：

| | Persona | 反復 handoff（trust 境界） | 今の手作業＝痛みの証拠 | trust の難度 | 判定 |
|---|---|---|---|---|---|
| **A** | 溺れる OSS maintainer | 見知らぬ contributor の PR を review | CI＋手 review＋**既に AI review bot 導入** | 🔴 相手 untrusted | 痛み最強 |
| **B** | 2-pizza スタートアップ班 | A の API 完成 → B が frontend 配線 | Slack＋PR＋手で agent 再 prompt | 🟢 同一チーム | TAM 最大 |
| **C** | build-in-public の 2 人組 | 時差で互いの agent に夜間 handoff | GitHub＋Discord＋「agent に渡して」 | 🟢 相互合意 | demo/配布最強・niche |

**ピッチ構成（役割分担）**：
- **痛みで語る = A**（maintainer の review 過負荷は本物・投資家に刺さる。CodeRabbit 系の存在が需要を裏づけ）。
- **live demo = C**（founder＋友人 1 人で trust を相互合意 fake、**無料で「実在 dyad」化** = GATE-1 を evidence に変換）。
- **TAM で語る = B**（チーム handoff・trust も楽・最大母集団）。

**鉄則**：trust が最難の A を **MVP で作らない**。C/B は相互合意/同一チームで trust を fence できる → MVP は C（or B）で。A は North Star の「why this matters」として温存。

---

## 6. 競合接地（2026-06）

- **A2A（Agent2Agent）**：cross-vendor agent 協調 protocol。Google→Linux Foundation、v1.0(2026 初)、150+ org 採用。→ **transport は作らない、乗る。**
- **MCP**：capability アクセス標準（外界との接続）。A2A と相補。
- **cross-vendor coding orchestration（single-user）**：Nimbalyst / Melty / Vibe Kanban が既出 → **V2 は混雑、差別化にしない。**
- **delegation/trust**：「the delegation problem nobody has solved」（O'Reilly/Airia）。OAuth OBO + DPoP、trust 継承問題。→ cross-person handoff の**痛みは実在の議論**だが**未解決＝難所**。

---

## 7. MVP スコープ（出荷可能・fence 済）

1. **1 trusted dyad**（あなた + 実在の 1 人）。trust は事前合意で fake。
2. **1 handoff チェーン**：例「A の agent が PR/branch を push → build-state イベント → B の agent が自動レビュー/テストを 1 つ」。
3. **D&D canvas（desktop, 2-3 node）**で wire（A2A 経由）。attended（approve gate）。
4. wow＝「**他人の agent が、自分の合図で、自分の workflow の一部として動く**」。
5. **やらない**：任意接続 / multi-tenant 認可 / 課金 / unattended 連鎖 / フル canvas。

---

## 8. 検証（着手前・`05` に追加）

- **GATE-1 テスト**：実在 dyad + 反復 handoff タスクを 1 つ名指し。できなければ V3 は vision のまま。
- **R9（観測 vs orchestration）**：fleet operator/juggler は agent を*繋ぎたい*のか*見るだけ*か。
- **R10（cross-person 需要）**：「今、他人の agent に仕事を渡す/受ける場面、手作業である?」（実在の手作業 = pain の証拠）。
- 全て 🟢 で初めて MVP 着手。`03` の kill-criteria に「GATE-1 が空＝V3 凍結、V2 観測に戻る」を追加。

---

## 9. docs 整合（本書が更新するもの）

- `01` positioning：cross-vendor fleet → **cross-person agent handoff（North Star）** に格上げ。fleet 可視化は土台/前段に降格。
- `02`：IR に **handoff/trigger schema**（A2A エンドポイント参照、build-state イベント）、canvas component を追加。trust は MVP で fake と明記。
- `05`：R9/R10 + GATE-1 dyad テストを追加。
- `04` の「cross-vendor 統合が唯一の空白」は `05`/本書で **緩和**（Nimbalyst 等が既出、真の空白は cross-person trust）。

> 一行で：**膨張した vision の中で生き残るのは「cross-person × A2A の上の handoff 信頼レイヤー」。巨人には構造空白、だが買い手と scope の 2 gate は土俵ずらしでは消えない。MVP は 1 dyad に fence して、まず買い手を名指しで検証する。**

---

Sources:
[A2A (Wikipedia)](https://en.wikipedia.org/wiki/Agent2Agent) ·
[Agent interoperability protocols 2026 (Zylos)](https://zylos.ai/research/2026-03-26-agent-interoperability-protocols-mcp-a2a-acp-convergence/) ·
[MCP vs A2A (OneReach)](https://onereach.ai/blog/guide-choosing-mcp-vs-a2a-protocols/) ·
[Who Authorized That? The Delegation Problem (O'Reilly)](https://www.oreilly.com/radar/who-authorized-that-the-delegation-problem-in-multi-agent-ai/) ·
[Multi-agent governance problem (Airia)](https://airia.com/what-multi-agent-systems-mean-for-enterprise-security-the-governance-problem-nobody-has-solved/) ·
[Zero trust for AI agents (Red Hat)](https://next.redhat.com/2026/05/21/zero-trust-for-ai-agents-why-delegation-beats-impersonation/) ·
[Best multi-agent coding tools 2026 (Nimbalyst)](https://nimbalyst.com/blog/best-multi-agent-coding-tools-2026/)
