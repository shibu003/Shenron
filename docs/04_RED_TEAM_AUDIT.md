# 04 — 外部赤チーム監査 / External Red-Team Audit

> ハンドオフ追補。`01_PRODUCT.md` / `02_TECHNICAL_DESIGN.md` の主張と、`03_FEEDBACK_LOOP.md`（自己赤チーム）を、**実在 facts に web 接地して再監査**した結果。
> 手法: 30 agents（競合・市場・技術主張の web 検証 → 各判断を 7 ステップ + 敵対的再チェック → 空白創出エンジン → 完全性批判）。一部は本機の実 jsonl で firsthand 検証済み。
> **結論の核: 03 の自己採点は自分に甘い。接地すると 🟡 のほぼ全部が 🔴 に落ち、demo の hero metric は数式として壊れている。**

監査日: 2026-06-15

---

## 0. ボトムライン（先に結論）

- この空間は **混雑 + 巨人隣接** で、03 が認める以上に **差別化の各足が commodity / 巨人所有 / 閉鎖中**。
- 「context 健康を phone で見る」という鈎は、**keystone pain が反証され、hero metric が壊れ、action loop が無い** → 🔴。
- だが **防御可能な構造空白は実在する**。それは context 健康ではなく **model 中立 × open build-state IR × fleet operator** の掛け合わせ。
- 着手前に潰すべき順序: ① R1 行動テスト（½日・コード 0）→ ② §4 式の修正（同 Wave・自明）→ ③ privacy 境界と value-capture 機構の決定（コード前）。
- 直視すべき問い: **これは company-shaped か、demo + acquihire-shaped か。** 現アーキ・現 goal のままなら後者。

---

## 1. 判断マップ（自己採点 → 接地後）

| ID | 判断 | 03 自己採点 | 接地後 | 根拠の格 |
|---|---|---|---|---|
| **D1** | 製品 = モバイル第一 統合管制塔 | 🟡 | **🔴**(company bet) | 🟡 — 4 本足の束、各足が独立に commodity/閉鎖中 |
| **D2** | ウェッジ = 状態健康 (監視でない) | 🔴寄り🟡 | **🔴** | 🔴 — "健康" は監視の下位概念。framing は防御でない |
| **D3** | フレッシュ鈎 = コンテキスト健康可視化 | 🟡 | **🔴** | 🔴 — keystone pain が**反証**された |
| **D4** | 堀 = 統合ビューの craft | 🟡 | **🔴** | 🔴 — craft は 4M-dev 巨人に最も fungible |
| **D5** | D&D build-forward を中核 | 🟡(弱) | **🔴** | 🔴 — commodity + mobile anti-pattern + Apple 2.5.2 |
| **D6** | アーキ = 既存読取り+relay+投入 | 🟢/🟡 | **🔴**(moat) | 🟡 — 作れるが堀でない。hero metric 破綻 |
| **IA1** 🆕 | "PC 不要" vs 常駐 host 必須 | *未監査* | **🔴** | 🔴 — away-from-desk = host が寝てる時。最も売る場面で壊れる |
| **IA2** 🆕 | contextFillPct 数式の正しさ | *未監査* | **🔴** | 🔴 — **実機検証で破綻** |
| **IA3** 🆕 | OSS無料 vs 調達 の goal 不整合 | *未監査* | **🔴** | 🔴 — 現アーキが capture 機構を foreclose |
| **IA4** 🆕 | desk 作業に mobile-first / TAM | *未監査* | **🔴** | 🔴 — TAM 未測定、ICP は n=1 (創業者自身) |
| **IA5** 🆕 | 健康信号に action loop が無い | *未監査* | **🔴** | 🔴 — vitamin であって painkiller でない |

🆕 = 03 の自己監査が**触れなかった暗黙前提**。一番危険な 🔴 はここに潜む。

---

## 2. 03 が「楽観」でなく「事実誤認」だった 3 点

甘い見積もりではなく、接地で**壊れた**箇所:

### 2.1 🔴 keystone pain が反証された
01 P1「本番失敗の多くはコンテキスト窓の圧迫やドリフト」。
- 本番失敗の文献は **integration / ops / security** を主因とする。Chroma "Context Rot" 著者自身が "not necessarily production failures" と注記。
- builder survey（Sonar *State of Code 2026* / Stack Overflow 2025）の top pain は「almost-right 出力 66%」「hallucination 64%」「debugging 45%」「code quality 53%」。
- 「lack of context」は **4 位 38% かつ逆向き**（窓の詰まりでなく "正しい context を渡せてない"）。
- **context rot（セッション内劣化）は実在するが、builder が最も出血している痛みではない。** → D3 の鈎の土台が抜ける。

### 2.2 🔴 demo の hero metric が数式として壊れている（実機 firsthand 検証）
02 §4 の `contextFillPct = 累積トークン ÷ 窓`。
- 本機 jsonl（**632 files / 68,464 行 / 569 sessions**）で再現 → **14,925%–252,616%、569 中 80% が >100%**。
- 原因: ① cache_read を毎ターン再カウント（同じ context を N 重計上）② Claude Code は ~83.5% で auto-compact するので累積は無限増。
- さらに **窓サイズ(200K/1M)が jsonl に無く、`[1m]` suffix も保存されない**（model は `claude-opus-4-8` と記録）→ 正しい式に直しても denominator は out-of-band config が要る。修正式でも実機 1M session で 219/311/432%。
- **02 §3 が IR 例に hardcode した "78" は、この式では原理的に出ない数。** demo 当日に画面が >100% を出して即死。
- 正しい式: `last-request(input_tokens + cache_read_input_tokens + cache_creation_input_tokens) ÷ per-model窓`（Claude Code 自身の `/context` がこれをやっている = つまり commodity）。
- 唯一数学的に正しいのは `cacheHitRate`（信頼できる cache フィールドに乗っている）。

### 2.3 🔴 "AI 状態が見えない" は desktop で偽
- Claude Code CLI: `/context` + status line %（例 `161.3k / 200.0k (81%)`）+ compaction 警告。
- Codex desktop: context-window-fill % + rate-limit meter。
- OSS 群: ccusage(4.8k★) / Claude Code Usage Monitor / ccflare が real-time で context%/cacheHit/burn。
- **未served なのは mobile/web だけ。**
- Anthropic GitHub の closed-not-planned issue 3 件（#35483 / #37568 / #46897, Mar–Apr 2026）= "mobile で context を見たい" の**日付つき実需要 + 巨人が status 行 1 本で塞げる証拠**の両刃。

---

## 3. 危険な仮説ランク（致命的順）

### R1 🔴 鈎 vitamin 説
「context 健康」は builder が払う painkiller か、glance して忘れる curiosity か。
反証: 出力が悪い時、人は数字を見ず `/clear` して再試行（survey が示唆）+ runtime が 83.5% で勝手に compact。
**最速検証（コード 0、半日）**: ICP 5-8 人に行動質問 — 「直近 agent の出力が悪かった時、最初にしたのは (a) context 数字を見る か (b) `/clear` して再投入 か?」。≥4 が (b) なら D3 keystone 🔴 確定。

### R2 🔴 hero metric 破綻
§2.2。検証は**実機で完了済み**。demo 前に同 Wave で書き換え必須。「健康導出 = 堀」も無効化する（`/context` が既に正しくやっている = commodity）。

### R3 🔴 差別化が全て巨人所有 or commodity or 閉鎖中
- relay は **first-party**（Anthropic Remote Control Feb 2026, QR-pair E2E = byte-for-byte 02 §1。Codex も QR+relay+creds-on-host）。
- D&D は OSS staple（DanWahlin/ai-agent-board MIT, AgentsRoom drag-to-spawn, agent-kanban.dev 他）+ mobile anti-pattern（NN/G）。
- context-% は desktop 所有。deploy は **Codex Sites**（Jun 2026, create/deploy/inspect）。branch は **Codex mobile**（Jun 9, branch+worktree）。
- 唯一無競合の "unified mobile IR" が**最も需要薄 + 最も吸収速い（status 行 1 本）**。
- category 墓場: Vibe Kanban/Bloop（Apr 2026 死）、Terragon（Jan 2026 shutdown 時に OSS 化）、Omnara（Feb 2026 repo archive）。standalone monitor/orchestrator 事業は実証的に維持困難。

### R4 🔴 privacy exfiltration（03 も D1-D6 監査も見落とし → critic が発掘）
"context %" を phone に出すには host が jsonl 全体を読んで relay する必要がある。その jsonl は **全 message 本文・貼った secret・顧客コード・絶対 path を含む**（本機 198MB / 634 sessions / 38 projects）。
「認証情報は host に留める」は misdirection — **派生元データ自体が crown jewels**。紛失しやすい phone へ third-party relay 経由で運ぶ = adoption killer + GDPR/NDA 露出。統合 IR が richer なほど漏れが酷くなる。data-minimization 境界が未定義（whole file を読む設計）。

### R5 🔴 投入(dispatch)こそ真の難所、「実装に難所なし」が最危険な一文
監査は D&D を interaction として潰したが A1/A4「既存読むだけ」を素通り。
**unattended で structured intent を host の Claude Code に投げて完走させる**のは permission prompt / approval / test 失敗 / conflict の塊で、agent が最も失敗する所。
競合（Codex / Remote Control / AgentsRoom）が "phone から dispatch" を全部**人間が見張る supervision 層**にしているのは偶然でない。babysit 必須なら BuildHUD は「避けると誓った巨人所有の監視面」に縮退し、P3「PC 不要」も崩れる（approve に在席要）。

### R6 🔴 goal–model 不整合
無料 OSS / BYOK / local / single-user アーキは、Vercel(Next.js) / Supabase / HashiCorp(Terraform) が使った **open-core→cloud capture 機構を自ら foreclose**（metered usage なし、data moat なし、lock-in なし）。
「→調達」は現状の形では fundable でない。最良の現実的 outcome は acquihire であって venture raise でない。capture したいなら cloud/team/cross-provider aggregation を**今**決め、A3/§10 を metering 方向に re-fork してから着手。

### R7 🟡 format 税 + platform 依存
- jsonl は無 schema の private 内部形式。直近 40 sessions に **10+ バージョン(2.1.143→2.1.177, ≈毎週 breaking)**。contextFillPct semantics は v2.1.132 で壊れた前例あり。
- model-agnostic 化は保険でなく**保守面を 2 倍化**（Claude Code + Codex 両方の形式追従）。
- Anthropic/OpenAI ToS（他社ログ読取り + headless 駆動の商用化 / session data 再配布）リスク未確認。
- Apple Guideline 2.5.2（vibe-coding companion app を実際に排除中）= phone-first 配布の単一チャネルが review で死に得る。
- いずれも execution 品質と無関係に製品を 0 にし得る。solo に対抗 leverage なし、Plan B なし。

---

## 4. 空白創出案（§3.5 counter-positioning エンジン）

競合 🔴 で撤退結論を出す前に 3 レバーを回した。**捏造はしない** — 耐久テスト（巨人は追随に何を捨てるか）を通った構造空白だけ採用:

| ずらし | 案 | 耐久テスト（巨人は何を捨てるか） | 判定 |
|---|---|---|---|
| 価値軸 | **model 中立** = Claude+Codex+Gemini ログを 1 IR に融合。「どの巨人の上にも立つ」 | 自社アプリ内で**競合の inference 状態を昇格表示** = lock-in 放棄 | **🟢 構造空白** |
| 方向 | **mixed-vendor fleet operator** に縦特化（5-10 sessions × 2 vendor × 3 machine） | 4M の median 最適化を放棄（innovator's dilemma） | 🟢 構造空白（TAM 薄い恐れ=IA4） |
| 機構 | **open IR 標準** = "AI build-state の OpenTelemetry"。reader でなく hosted fleet/team で課金 | portable schema 公開 = interoperability lock-in 放棄 | **🟢 構造空白** |
| 価値軸 | local-trust / zero-telemetry OSS | OSS 勢(AgentsRoom)が既に同等 + relay は巨人所有 | 🔴 一時差 |
| 方向 | CI/pre-merge gate（IR を merge 時に発火、action loop 付き） | 誰でも weekend で clone 可、巨人は追随不要 | 🔴 一時差 |
| 機構 | push alert + 1-tap 構造化返信 | 巨人が自社 session に既出 | 🔴 一時差 |

**創発合成**: 構造空白 3 つを掛け合わせ → **「mixed-agent fleet 向けの、vendor 中立な open build-state 標準」**。
単一巨人が追随するには (a) 競合の状態を自社内で昇格 (b) 4M median を deprioritize (c) portable schema 公開 の **3 重 anti-monetization 自傷**が同時に要る = innovator's dilemma 全開。**これは構造空白。**

**正直な留保 2 つ（甘くしない）**:
1. この堀は**巨人に対してだけ**。OSS 勢（AgentsRoom は既に複数 agent 読取り）には craft/community 速度勝負 = 03 自身が認める薄い賭け（D4/R3）。
2. fleet operator の TAM が商業的に小さい可能性（IA4）は空白では解けない。事業性は未検証 TAM に依存。

**spear から外すもの**: context 健康 gauge の novelty（D3/IA5 で 🔴）/ D&D build-forward（D5 で 🔴）/ relay（巨人所有 commodity）。context-% は IR 内の secondary cell に降格。

---

## 5. 完全性批判が発掘した「監査自体の見落とし」

D1-D6 + IA1-IA5 + 03 自己監査ですら触れなかった残り risk:

1. **privacy / exfiltration**（R4）— 何が relay を渡るか誰も定量化していない。
2. **format / ToS / platform を一時 risk でなく恒常税として**（R7）。
3. **dispatch = 真の難所**（R5）— "実装に難所なし" が最危険。
4. **founder-market projection** — 全「現場の声」が創業者自身の痛み。R1/R2 検証が**build の後**に scheduled = 反証前に engineering を pre-commit。本機 38 projects = 創業者が 1-in-1000 outlier である傍証。
5. **hackathon demo→product gap が構造的**（🟡）— §6/§8 の demo は「cached 状態 + ライブ投入 1」で**壊れる所を意図的に隠す**設計。raise はその gap を売っている。
6. **kill-criterion 未定義** — "R2 が vitamin と出たら止める" の基準が無い。
7. **常駐 relay/host の cost model なし、solo の liability/insurance posture なし。**

> 差別化(competitive)軸は十分に噛んだ。**「これを solo が安全に・durable に・出荷まで作れるか」(feasibility/liability)軸が真の未検討の崖。**

---

## 6. 賭けの中心

03 は「R1 framing 差 + R2 context 健康を見たいか」と書いた。接地後の真の中心は別の 2 つ:

1. **「ビルド状態を phone で見る」は反復する job として実在するか** — それとも巨人が無料で glance-serve 済みの desk 作業の付随か。（survey は後者を示唆 → 🔴 未検証）
2. **solo が、2 競合の private で毎週変わる、しかも crown jewels を漏らすログの上の薄い統合層を、安全に出荷し durable に守れるか。**（privacy R4 + dispatch R5 + format 税 R7 → 🔴）

**この 2 つが崩れたら全部崩れる。** 現状どちらも 🔴 / 未検証。

---

## 7. 推奨アクション（着手前の順序）

1. **(½ 日・コード 0)** R1 行動質問テスト（「悪い出力 → 数字を見る or `/clear`?」）。vitamin と出たら context-health hero を捨て、spear を **"vendor 中立 build-state IR"** に pivot。並行して jsonl mtime で並列 session 数を実測し ICP TAM を即サイズ。
2. **(同 Wave・自明)** §4 contextFillPct を `last-request input-side ÷ per-model窓`（窓は host config）に書換え + IR に **host-liveness / staleness 欄**を追加（現 schema に無い = IA1 の穴）。demo がこの修正前なら >100% で即死。
3. **(コード前)** privacy 境界（何を relay するか data-minimization）と value-capture 機構（cloud/team/fleet）を**先に決める**。現アーキは capture を foreclose し crown jewels を漏らす。
4. **捨てる framing**: 「context が詰まってるのに見えない」/ D&D build-forward / relay を売り。
5. **生き残るコア**: model 中立 + open 統合 IR + craft（巨人にだけ構造空白、OSS には craft 勝負、TAM 未検証）。
6. **直視**: company-shaped か acquihire-shaped か。現状のままなら後者。

---

## 付録 A: 検証した競合・市場 facts（出典つき）

| 主張 | 判定 | 接地 |
|---|---|---|
| Codex Mobile（2026/5, ChatGPT app, 全 plan, 4M+ weekly） | confirmed | MacRumors 2026-05-15, eWeek, OpenAI docs |
| Codex mobile = supervision 層、deploy/state 束ねず | partly_true | mobile は true だが Codex Sites(deploy)+Jun9 branch/worktree で侵食中 |
| Codex は context 健康を first-class にせず | partly_true | desktop に context-% + rate-limit meter あり（mobile は無、GitHub で regression 苦情多数） |
| Anthropic Claude Code mobile/web 実在 | confirmed | claude.ai/code 公式 + Remote Control(Feb 2026) |
| Claude Code が context 使用を可視化済み | partly_true | CLI は `/context`+status line、**mobile/web は無**（#35483/#37568/#46897 closed not-planned） |
| AgentsRoom 実在、token/cache 追跡 | confirmed | agentsroom.dev, App Store。ただし token meter は **desktop 専用**、context-fill% は**無** |
| AgentsRoom に D&D build-forward 無し | refuted | Kanban drag-to-spawn あり。drag-to-dispatch は 2026 OSS staple |
| QR-pair + E2E relay が commodity | confirmed | Anthropic Remote Control / Codex / Happy / 全部同型 |
| Helicone/Phoenix/LangSmith/Langfuse が context/cache 捕捉 | confirmed | 全実在。ただし backend/web 型（Helicone は Mar 2026 Mintlify 買収で maintenance mode） |
| 「本番失敗の主因 = context 圧迫」 | **refuted** | 本番失敗は integration/ops/security。survey で context は 4 位かつ逆向き |
| context rot（セッション内劣化）は実在 | confirmed | Chroma "Context Rot", Lost-in-the-middle (Liu 2024), Anthropic engineering |
| jsonl から token/cache 読取り可能 | confirmed | ccusage 他。cache_read/creation フィールド firsthand 確認 |
| `contextFillPct = 累積÷窓` が正しい | **refuted** | 実機 446%–252,616%。正しくは last-request input-side ÷ 窓 |
| Lovable Visual Edits = D&D add-feature の先例 | refuted | 実体は click-to-style（既存要素）、desktop。category error |
| mobile D&D で feature 追加が望ましい | refuted | NN/G が mobile primary D&D を非推奨。全競合は typing/voice |

## 付録 B: firsthand 検証（本機の実 jsonl）

- jsonl: 632 files / 68,464 行 / 569 sessions（≥5 assistant msg）/ 38 project roots / 198MB。
- `cache_read_input_tokens` / `cache_creation_input_tokens` フィールド present、欠損 0（6 session sample）。
- `累積トークン ÷ 200K` = 14,925%–252,616%、569 中 80% が >100%。
- 修正式（last-request input-side ÷ 200K）でも 3/6 が >100%（219/311/432%）→ 1M 窓 detection 必須。
- 窓サイズ・`[1m]` suffix は jsonl に**存在しない**（model = `claude-opus-4-8`）。
- 直近 40 sessions に Claude Code 10+ バージョン（≈毎週）。
- git ahead/behind 一発読取り可、deps present（claude 2.1.178, node v25.4.0, git 2.39.3）。

---

*この監査は自己正当化でなく赤チーム。🟢 証拠 / 🟡 類推 / 🔴 仮説 を区別し、競合 🔴 でも空白を探したが捏造はしていない。空白は耐久テストを通った 1 軸（model 中立）のみ 🟢、他は正直に 🔴。*
