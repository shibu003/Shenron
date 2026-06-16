# 09 — 自前で作る技術設計 / Build-Ourselves（08 の裏返し）

> ハンドオフ。`08`（借りる OSS 部品）の補集合。**OSS に存在せず、自前で設計・実装する部品**を列挙。
> 方法：`02` の全コンポーネントから「`08` で OSS が覆う物」を引き、残差＝自前。さらに各々を **MOAT（堀＝防御可能な novel）** か **GLUE（必要だが commodity な接着）** に分類。
> **発見：自前リスト ≒ 堀**（`06` §4 の白地が捏造でない証拠）。ただし**最深の堀（cross-person trust）は MVP では fake**（`07`／`06` GATE-2）。
> 作成日: 2026-06-16

---

## 0. サマリ表

| ID | 自前で作る物 | なぜ OSS に無いか（gap） | 区分 | MVP? | 乗る OSS（08） |
|---|---|---|---|---|---|
| **M1** | cross-person **Handoff IR ＋ semantics** | A2A は transport（Message/Task）止まり。誰の agent→誰の agent を build-state trigger＋repo scope＋trust binding＋audit で繋ぐ「coding handoff モデル」が無い | 🟢 MOAT | ✅ 最小 | A2A(08§1) |
| **M2** | **build-state → handoff trigger engine** | build-state イベント（deploy/branch/test/compaction）を cross-person dispatch に繋ぐ物が皆無。n8n は content 非依存、A2A は transport、orchestrator は single-user 手動 | 🟢 MOAT | ✅ 最小 | readers(08§2/§3) |
| **M3** | **unified 4 次元 IR**（context健康＋deploy＋branch divergence＋feature を 1 モデル融合） | Vibe Kanban は session 正規化のみ、ccusage は token のみ。4 次元 bundle を融合する物は無し（`04` 3 review 確認） | 🟢 MOAT(需要は要検証) | △ 薄く | Vibe Kanban executor(08§3) |
| **M4** | **open cross-vendor build-state IR 標準**（"OpenTelemetry of AI build-state"） | そんな schema/spec が存在しない | 🟢 MOAT | ❌ Phase1+ | — |
| **M5** | **cross-person trust/delegation ＋ audit chain** | "誰も解いてない難問"（08§7・O'Reilly/NIST）。OBO/DPoP/SPIFFE は primitive、cross-person×cross-vendor の coding-handoff 認可＋検証可能 audit 製品は無い | 🟢 MOAT(最深) | ❌ **fake** | RFC8693/DPoP(08§7) |
| **G1** | reader→IR→trigger の orchestration glue | 各部品はあるが我々の配線は自前 | ⚪ GLUE | ✅ | ccusage/VibeKanban |
| **G2** | canvas の **「他人の agent skill」node 型**（Agent Card→node） | React Flow は素の canvas。agent-card-as-node＋cross-person edge 意味論は自前 | ⚪ GLUE | △ 任意 | React Flow(08§6) |
| **G3** | **inbound cross-person 承認 UX** | `canUseTool` は「自分の agent の tool 使用」承認。「他人 A からの inbound handoff を B が承認」は別物（誰が A か・scope・一回/記憶） | ⚪ GLUE | ✅ 最小 | canUseTool(08§5) |
| **G4** | **cross-fleet staleness/liveness routing** | 発火前に B の host が online か。per-machine seq はあるが cross-person 配送判定は自前 | ⚪ GLUE | △ | Happy seq(08§4) |
| **G5** | **hosted multi-tenant relay ＋ metering**（capture） | single-user OSS relay はあるが多テナント課金は無い（`06` IA3） | ⚪ GLUE | ❌ Phase2 | Happy/Nimbalyst(08§4) |

---

## 1. MOAT builds（堀＝自前 novel・詳細）

### M1. cross-person Handoff IR ＋ semantics
- **gap**：A2A は「agent が message/task を送る」線。**「A君の agent が、B君の公開した skill に、build-state を引き金に、repo scope と trust 束縛つきで仕事を渡し、attended 承認を経て結果を返す」**という *coding handoff の意味論* は誰も持たない。
- **作る**：`02 §3.2` の handoff schema（from/to=person+vendor、trigger、payload、trust、audit、status）＋ lifecycle（`pending_approval→running→returned/declined` を A2A states `INPUT_REQUIRED→WORKING→COMPLETED/REJECTED` に対応）＋ **各人が公開する skill catalog**（自 agent の invocable 能力を Agent Card に宣言）。
- **moat 理由**：cross-person が製品の核。巨人は単一アカウントを捨てないと来られない（`06` §4）。
- **risk**：A2A の Message に我々の意味論をどう載せるか（拡張 vs metadata）。買い手未検証（`06` GATE-1）。

### M2. build-state → handoff trigger engine（build-state-native）
- **gap**：build-state イベントで cross-person dispatch を発火する物が皆無。これが「build-state ネイティブ」差別化の実体（`06` §4）。
- **作る**：① **canonical build-state event 分類**（`branch_pushed / deployed / test_passed|failed / context_pressure / compacted`）を vendor 横断で定義 ② それを heterogeneous な log/git/deploy から確実に emit する watcher ③ event→handoff の rules（"branch feat/* push → B の review-branch"）。
- **moat 理由**：汎用 automation（n8n）は build-state を知らない、追うには IR が要る。
- **risk**：イベントの信頼性（log churn・`04` R7）。rules が複雑化すると n8n 再発明 → MVP は 1 rule に fence。

### M3. unified 4 次元 IR（context健康＋deploy＋branch＋feature 融合）
- **gap**：session 正規化（Vibe Kanban）や token（ccusage）はあるが、**4 次元を 1 モデルに融合**する物は無い（`04` 3 review）。
- **作る**：`02 §3.1` の IR schema＋assembler（借用 reader を 1 モデルに merge、staleness 込み）。さらに **cross-person で mergeable**（A の IR と B の関連 slice を統合）が novel。
- **moat 理由**：bundle が無人。**但し "無人＝低需要" の可能性**（`04`）→ M3 は需要を `05` R2 で検証してから厚くする。
- **risk**：feature インベントリ導出が難（git/PR/静的解析/LLM 要約、`02 §10` 未決）。

### M4. open cross-vendor build-state IR 標準
- **gap**：そんな spec が無い。"OpenTelemetry of AI build-state"。
- **作る**：open schema spec ＋ reference readers を公開し ecosystem 採用を狙う（`08` の readers を寄贈ベースに）。
- **moat 理由**：巨人は portable schema を公開できない（interoperability=lock-in 放棄・`06` §4 mechanism）。
- **risk**：標準化は chicken-egg・採用速度勝負。**Phase1 以降**（traction 後）。MVP では作らない。

### M5. cross-person trust/delegation ＋ audit chain（最深の堀）
- **gap**：「誰も解いてない難問」（`08` §7）。primitive（OBO/DPoP/SPIFFE）はあるが、**cross-person×cross-vendor の coding-handoff 認可＋検証可能な cross-party audit** 製品は無い。
- **作る（段階・`08` §7）**：MVP=共有secret+allowlist+attended+audit ログ → per-agent identity → DPoP(`cnf.jkt`) → RFC 8693 OBO(`act` chain が audit、`may_act` が allowlist を置換)。＋「A の agent(A 代理) が B の同意で B の agent を repo X に対し起動、B 承認、結果返却」を検証可能に残す audit chain。
- **moat 理由**：最も hard＝最も防御可能。
- **risk🚨**：これは `06` GATE-2 が「資金ありチームの数年」と断じた所。**MVP では本物を作らない＝fake**（`07`）。**AI に書かせると静かに壊れる 3 footgun**（impersonation化・DPoP binding 抜け・MCP token passthrough・`08` §7）→ trust コードだけは AI 任せにしない。

---

## 2. GLUE builds（必要だが commodity・軽め）

- **G1 orchestration glue**：reader→IR→trigger の配線。借用部品を繋ぐだけ。維持コスト＝format churn 追従（`04` R7）。
- **G2 canvas node 型**：React Flow 上に「他人の Agent Card を node 化」＋cross-person edge（trigger＋trust scope を運ぶ）。canvas lib は借用、意味論は自前。MVP は config で代替可。
- **G3 inbound 承認 UX**：`canUseTool`（自分の agent 用）とは別の「**他人からの inbound handoff を承認**」gate。誰が A か・scope・一回/この人を記憶。MVP の attended の核（`07` の approve_prompt）。
- **G4 staleness/liveness routing**：発火前に B host online 判定。`host.dataStaleSince`（`02 §3.1`）＋配送可否。
- **G5 hosted relay＋metering**：単一 OSS relay（Happy/Nimbalyst pattern）を多テナント＋課金に。**capture の核（`06` IA3）だが Phase2**。

---

## 2.5 GLUE 競合調査の結論（2026-06・adopt-vs-build 確定）

調査の結果、**GLUE はほぼ全部 adopt**（自前は薄い残差のみ）。重大: G4/G5＝「中立接続層＋多テナント計量」は **agent gateway 勢が既に商品化**。

| G | adopt 先 | 自前残差 |
|---|---|---|
| G1 orchestration | **Trigger.dev**(Apache-2.0) / **Hatchet**(AI-agent durable, OSS) | build-state **event 正規化**のみ |
| G2 agent-canvas | React Flow 上に自前（A2A-card-as-node を native でやる OSS 無し。Sim.ai/Langflow は参考） | A2A card→node＋cross-company edge 意味論（薄い） |
| G3 HITL 承認 | **HumanLayer**（Slack/email/SMS 承認） | **cross-party identity/scope**（=M5 trust）は自前 |
| G4 registry/liveness/routing | **Solo.io agentgateway**(LF・A2A+MCP native・中立) / **Kong Agent Gateway** | cross-person liveness＋IR staleness（薄い） |
| G5 hosted relay+metering | **乗る**（Kong/Cloudflare/Portkey/LiteLLM/TrueFoundry が多テナント計量を標準提供） | — |

🔴 **戦略的含意**: G4/G5 と「中立 wiring 層」自体が gateway 勢（とくに agentgateway＝LF・中立・A2A native）に飲まれつつある。→ **接続では戦わない。乗る。** 自前＝堀は **M1/M2/M3/M5＋体験＋index/MCP control plane** に集約。capture は relay でなく trust/orchestration/index へ（`06 §6.6`）。

---

## 3. MVP（Persona C / `07`）が実際に要する自前部品＝最小

| 要る | 中身 | 自前度 |
|---|---|---|
| M1 最小 | skill `review-branch` 1 つの handoff schema | 設計のみ薄く |
| M2 最小 | `branch_pushed` → 発火 の 1 rule（pre-push hook で代替可） | 数十行 |
| G3 最小 | inbound 承認プロンプト（attended gate） | 数十行 |
| G2 任意 | 2-3 node canvas（demo polish。dogfood は config 先行） | 後回し可 |
| trust | **fake**（共有secret+allowlist+attended+log）＝ M5 は作らない | fence |

→ **MVP で自前に作るのは M1/M2/G3 の最小だけ。** M3/M4/M5 本物・G4/G5 は後。

---

## 4. 正直な read（おべっか無し）

- **良い兆候**：自前リストが MOAT に集中＝差別化は「再梱包」でなく**本物の proprietary 仕事を要求**する。`06` の白地は捏造でない。
- **危険な兆候**：最深の堀 **M5（cross-person trust）が、MVP では fake する所**。だから **「demo が動く（fake trust）」≠「堀ができた（M5 本物）」** を混同しない。投資家にもここは正直に（fake である事と North Star の道筋を見せる方が強い・`08` §7 の Wave）。
- **会社の本当の多年仕事 ＝ M3（融合 IR・要需要検証）＋ M4（標準）＋ M5（trust）**。MVP は M1/M2/G3 だけ。
- **point 2（AI で人件費抑制）の限界**：M1/M2/G1/G2/G3 は AI coding で速く作れる。**M5 の trust だけは AI 任せ禁止**（footgun が静かに通る）。ここは人間レビュー必須＝唯一 AI で薄められないコスト。

---

## 5. 結論（1 行）

**自前で作るべきは「cross-person handoff の意味論(M1)・build-state トリガ(M2)・融合 IR(M3)・open 標準(M4)・cross-person trust(M5)」＝ ほぼ堀そのもの。MVP はそのうち M1/M2/G3 の最小だけを作り、最深の M5 は fake、M3/M4 は traction 後。**
