# 01 — プロダクト概要 / Product Overview

> Claude Code 向けハンドオフ (1/4)。技術は `02_TECHNICAL_DESIGN.md`、自己監査は `03_FEEDBACK_LOOP.md`、外部赤チームは `04_RED_TEAM_AUDIT.md`。
> 作業名：**BuildHUD**（仮）。
> **2026-06-15 方向転換（04 監査に基づく）**: spear を「AI context 健康の可視化」から **「vendor 中立な cross-agent build-state IR」** へ pivot。主 surface を mobile-first → **desktop cockpit + mobile companion** に変更。capture = **open-core + hosted fleet/team tier**。

---

## 0. これは何か（一行）

**複数の AI coding agent（Claude Code / Codex / Gemini CLI）を跨いで走る「ビルドの全状態」を、vendor 中立な 1 つの build-state IR に束ねる管制塔。** 各 vendor は自社 session しか見せない。BuildHUD はその上に立ち、context / deploy / branch / feature を 1 モデルに統合し、desktop cockpit で一望、mobile で glance/approve する。

- カテゴリ（自称）：**Vendor-neutral mission control for mixed-agent fleets**（= "AI build-state の OpenTelemetry"）
- 主 surface：**desktop 横断 cockpit**。mobile は glance/approve の **companion**（mobile-first は撤回 → IA4）。
- 目的：ハッカソン提出 ＋ 投資家へのビジョン提示（→ 調達）。capture を伴うので「→調達」を維持可能。
- 型：dev 向け picks & shovels。**OSS（reader + open IR schema）+ hosted fleet/team tier で課金**（IA3）。
- ステータス：方向転換済（本書 §付録）。実装は未着手。

---

## 1. 解く痛み（列挙）

**マクロ（なぜ今か）**
AI agent で作るのが普通になり、1 人が **複数 vendor × 複数 session × 複数 branch × 複数 machine** を回す「orchestrator」化が起きた。生産性は上がったが、**各 vendor のツールは自社 session しか見せない**ため、横断状態が原理的に分断された（端末タブ / tmux はローカルは解くが、vendor またぎ・machine またぎの可視性を解かない）。

> ⚠️ **04 で訂正された前提**：旧版の「本番失敗の多くは context 窓の圧迫やドリフト」は **反証された**。context rot（セッション内の出力劣化）は実在する（Chroma / Lost-in-the-middle / Anthropic）が、builder の top pain は **almost-right 出力(66%) / hallucination(64%) / debugging(45%)**（Sonar *State of Code 2026* / Stack Overflow 2025）。「lack of context」は 4 位 38% かつ逆向き（窓の詰まりでなく "正しい context を渡せてない"）。よって **context 健康は鈎でなく副指標**に降格。

**構造（レイヤー別）**

| # | 痛み | 誰が感じる | なぜ出血するか |
|---|---|---|---|
| **P1** | **【最フレッシュ・差別化の核】cross-vendor 分断** | mixed-vendor fleet operator | Codex は Codex、Claude は Claude しか見せない。複数 vendor の build 状態を束ねる view が **どこにも存在しない**（独立 3 review で確認）。**唯一の構造空白**（§4 耐久テスト合格） |
| **P2** | **プロダクト状態が散在** | 同上 | 実装済 / デプロイ済 / branch 食い違いが git/CI/deploy/log にバラバラ。vendor またぎでさらに分断 |
| **P3** | **見たい時に desk に縛られる**（副次） | 同上 | 走る作業を away から glance/approve したい。**mobile companion で解く**（mobile-first ではない。building は desk 中心の活動） |
| **P4** | **context 状態が mobile で見えない**（副次） | 同上 | desktop CLI には `/context`/status line があるが **mobile/web に無い**（Anthropic #35483/#37568/#46897 が closed-not-planned = 実需要 + 巨人が status 行 1 本で塞げる証拠の両刃） |

**現場の声に翻訳**（※ n=1 創業者の実体験。IA4 の TAM 検証は未了 → §5）
- 「Codex を 5 つ、Claude Code を 3 つ別 machine で回したら、vendor ごとに別アプリで、横断で何がどこで走ってるか分からない」（cross-vendor 分断）
- 「どの branch が最新か、どこにデプロイ済かが vendor とは別の場所に散ってる」（状態散在）

---

## 2. どう解くか

**プロダクト**：上記を **1 つの vendor 中立 build-state IR** に束ね、desktop cockpit で一望、mobile で glance/approve する。

| 痛み | BuildHUD の解 |
|---|---|
| P1 cross-vendor 分断 | **Claude Code + Codex + Gemini CLI のログを 1 IR に融合**（どの巨人の上にも立つ） |
| P2 状態散在 | feature インベントリ ＋ deploy 状態 ＋ branch 食い違いを 1 IR に統合 |
| P3 desk 拘束 | mobile companion で glance/approve（QR ペア + 暗号 relay、ただし relay は commodity・差別化でない） |
| P4 context mobile 不可視 | context 健康を **IR の副 cell** として mobile に出す（鈎でなく secondary） |

**ICP の境界条件**：効くのは「**複数 vendor の session を複数 machine で跨ぐ fleet operator**」。median な単一 vendor ユーザー（Codex 1 本）でも、enterprise LLM-ops でも、汎用アプリビルダーでもない。

---

## 3. 競合（省略なし。2026-06 接地で訂正済）

重要度順。**この空間は混雑 ＋ 巨人がいる**。旧版の「session 監視 vs 状態健康」の框組みは薄かった（04/D2）。**生き残る差は cross-vendor 統合 ＋ model 中立 ＋ open IR 標準**であり、各単機能（context-%・deploy・branch・D&D）はすべて巨人 or OSS が所有/吸収中。

### C1. スマホからの agent 操作（巨人・最大の脅威）
**例**：OpenAI Codex（2026/5 ChatGPT app、全 plan、diff review/approve/dispatch/model 切替、4M+ weekly devs）、Anthropic Claude Code（claude.ai/code web + **Remote Control** Feb 2026）。
- 強み：巨人・無料・モデル純正・大規模配布。
- **訂正（04）**：Codex は **Sites(deploy 状態, Jun 2026)・mobile branch/worktree(Jun 9)・desktop context-%** を piecemeal に accrete 中。「session 専用・状態を束ねない」は **mobile かつ mid-2026 snapshot に限り** true で、急速に陳腐化。
- 我々との差：**自社 vendor しか見せない**。BuildHUD は **cross-vendor 統合 ＋ model 中立**で上に立つ（巨人は構造上ここに来られない → §4）。

### C2. AgentsRoom（OSS・最も近い）
**例**：Claude/Codex/Gemini 等を pilot、token/cache 追跡、branch 表示、mobile companion、E2E、kanban。
- **訂正（04）**：token meter は **desktop 専用**、**context-fill% は無**（raw token + 赤 badge のみ）。**Kanban drag-to-spawn を持つ**（= D&D は差別化でない）。**既に複数 agent を読む**（= model 中立だけでは OSS に勝てない）。OSS 性は曖昧（license 未確認）。
- 弧との差：**統合 deploy+branch-divergence+feature IR が無い**（ここは AgentsRoom にも空白）。vs OSS の防御は **craft + standard 化の速度**（薄い賭け、04/D4）。

### C3. CodeAgent Mobile / 類似
QR ペア、Codespace 供給、diff 承認、async 監督。状態統合・context 健康なし。

### C4. エージェント・ダッシュボード（desktop/browser）
Marc Nuri 型（session カード：project/branch/model/context 使用）。**session カード単位**、cross-vendor 統合・deploy/feature を束ねない。

### C5. LLM 観測性（enterprise/web）
Helicone（**Mar 2026 Mintlify 買収で maintenance mode**）、Arize Phoenix、LangSmith/Langfuse。context 圧迫/cache を捕捉するが **backend/web 型**（enterprise 限定でなく solo も対象だが mobile build-health でない）。

### C6. git/CI/デプロイ・ダッシュボード
GitHub mobile、Vercel mobile（**Vercel は CC 端末内に deploy statusline を既に注入**）。AI build 状態の統合・cross-vendor なし。

### C7. AI アプリビルダー / visual edits
Lovable（**Visual Edits は click-to-style、desktop、web 専用**。drag-to-add ではない）、FlutterFlow、Rork、Replit Mobile。**作る**ためのツール。状態統合でない。

### C★. 配管 commodity（差別化でない・正直に明記）
- **relay は first-party 化**：Anthropic Remote Control（QR ペア E2E, Feb 2026）= 02 §1 と同型。Codex も QR+relay。**relay は売りにしない**。
- **D&D dispatch は OSS staple**：DanWahlin/ai-agent-board(MIT) 他 + mobile D&D は NN/G anti-pattern + Apple 2.5.2 排除中。**D&D を中核にしない**。
- **category 墓場**：Vibe Kanban/Bloop（Apr 2026 死）、Terragon（Jan 2026 OSS 化して shutdown）、Omnara（Feb 2026 archive）。standalone monitor 事業は維持困難 → capture 設計必須。

### C◆. 反テーゼ（信念の脅威）
- 「ダッシュボード要らない、各 vendor の出力で十分」→ **cross-vendor を跨ぐと各 vendor アプリが分断**するのが反証。だが median 単一 vendor ユーザーには効かない（ICP を fleet operator に絞る理由）。
- 「巨人が mobile agent 面を所有」→ 実在。**だから自社 vendor に閉じる巨人と直交する『model 中立』で逃げる**（§4）。

---

## 4. どこを目指すか（ポジショニング ＆ 堀）

- **ポジショニング**：*The vendor-neutral mission control for mixed-agent fleets — one build-state above Claude Code, Codex, and Gemini, that no single giant can build.*
- **差別化（04 接地後）**：
  - vs Codex/Claude（自社 vendor 専用）→ **cross-vendor 統合 ＋ model 中立**（巨人は構造上来られない）。
  - vs AgentsRoom（複数 agent 既読）→ **統合 deploy+branch+feature IR ＋ open IR 標準化の速度**（craft 勝負）。
  - vs 観測性 → solo・作業中・cross-vendor。
- **コピー候補**：
  - 推し：**"One build-state above every agent. The fleet view no single vendor will build."**
  - 鈎：**"Codex shows Codex. Claude shows Claude. Who shows your whole fleet?"**
- **堀（durable assets・04 で再定義）**：
  1. **open cross-vendor build-state IR（標準化）** — 巨人は portable schema を公開できない（interoperability = lock-in 放棄）。
  2. **model 中立** — 巨人は自社内で競合の状態を昇格できない（anti-monetization）。
  3. **統合 deploy + branch-divergence + feature view**（どこにも無い）。
  4. **craft**（vs OSS の唯一の差、薄いと自覚）。
- **堀でない（pitch から外す）**：context 健康 gauge の novelty（反証・式破綻・action なし）／ D&D build-forward（commodity + anti-pattern）／ relay（巨人所有）。context-% は IR の副 cell に留める。
- **避ける**：単一 vendor session 監視の正面（巨人）／ enterprise LLM-ops ／ 汎用アプリビルダー ／ mobile-first build-forward。

---

## 5. ICP / 買い手 / GTM

- **ICP（`06` で cross-person に格上げ。痛み順）**：
  - **A 溺れる OSS maintainer** — 見知らぬ contributor の PR review 過負荷（既に AI review bot 導入＝需要証拠）。痛み最強・trust 最難。
  - **B 2-pizza スタートアップ班** — A の API → B の frontend 配線の handoff が Slack＋手再 prompt で lossy。TAM 最大・trust 楽（同一チーム）。
  - **C build-in-public の 2 人組** — 時差で互いの agent に夜間 handoff。demo/配布最強・founder 自身が dogfood 可・niche。
  - 入口の土台層＝**fleet operator / free-tier juggler**（複数 vendor を跨ぐ層。cross-person の前段）。
- **ピッチ構成**：痛み＝A、live demo＝C、TAM＝B（`06` §5.5）。
- **買い手＝使い手**（PLG）。評価軸＝「他人/他 vendor の agent を自分の workflow に権限つきで組める／cross-vendor 状態を 1 view」。
- **GTM**：OSS（reader + open IR schema）＋ dev-viral（GitHub）。標準化を狙い ecosystem に IR を採用させる。
- **capture（IA3 で決定）**：**open-core**。reader / IR schema は無料 OSS、課金は **hosted fleet/team tier**（複数 operator・複数 machine の集約 relay、team handoff、cross-builder 可視性）。これが「→調達」を fundable にする。単機 local 設計（A3/§10）は metering 方向に re-fork（→ 02）。
- **TAM（未検証・最優先 risk）**：fleet operator の population は未測定（IA4）。**着手前に jsonl mtime 実測 + 5-10 builder で並列 session 数を sizing**。
- **未決**：OSS 範囲の線引き、hosted tier の価格、正式名。

---

## 6. 証明（デモ）

- **wow 一文**：「Codex 5 本 + Claude 3 本が別 machine で走ってる → BuildHUD を開く → **全 vendor の build 状態が 1 view**（branch 食い違い・deploy・feature・context 副指標）→ away から approve。各 vendor アプリでは絶対に見えない景色。」
- **デモが必ず見せる差別化**：① cross-vendor を 1 view に統合 ② どの単一 vendor アプリにも無い ③ desktop cockpit + mobile glance ④ model 中立。
- **demo の正直さ（04 で要注意）**：旧構成「cached 状態 + ライブ投入 1」は壊れる所（host 常駐・unattended dispatch・staleness）を隠す。demo で隠した failure mode を raise で売らない。**context-% を出すなら式修正後**（旧式は >100% で即死 → 02 §4）。

---

## 付録：確定 / 提案中 / 未決

- **確定（2026-06-15 更新）**：製品＝vendor 中立 cross-agent build-state IR ／ spear＝cross-vendor 統合（context 健康でない）／ surface＝desktop cockpit + mobile companion（mobile-first 撤回）／ capture＝open-core + hosted fleet/team tier ／ ICP＝mixed-vendor fleet operator ／ 型＝dev OSS picks&shovels。
- **降格（旧確定から）**：context 健康＝鈎 → 副指標 ／ D&D build-forward＝中核 → optional 入力 ／ relay＝売り → commodity 明記。
- **提案中**：堀＝open IR 標準 + model 中立 + 統合 view + craft ／ MVP スライス（→ 02 §8）。
- **未決（最優先で潰す）**：① fleet operator TAM（IA4・着手前計測）② R1 行動テスト（context は painkiller か vitamin か）③ hosted tier の価格 ④ 正式名 ⑤ privacy 境界（→ 02 §8）⑥ ToS/Apple 配布 risk（→ 03）。
