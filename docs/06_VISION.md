# 06 — 統合ビジョン / Vision（膨張整理 + counter-positioning）

> ハンドオフ。会話で vision が 3 段膨張したので 1 枚に整理。`01`–`05` の前提を更新する上位レイヤー。
> 原則（§3.5）：競合がいても撤退しない。土俵 / 手法 / 痛みをずらして空白を**作る**。**ただし「ずらせば勝てる」で終えない** — 作った空白は耐久テスト（巨人は追随に何を捨てるか）と 7 ステップにかけ、🔴 は 🔴 と書く。
> 更新日: 2026-06-16（§6.9 AI-native kill 戦略＋検証済み需要＋3 フェーズ・ロードマップ追加）

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

## 6.5 市場構造 — agent を「買う」時代と S1/S2（2026-06 接地）

**前提（実在）**：agent はもう「買う」もの。Salesforce AgentExchange / Google Agentspace / Microsoft / AWS / Oracle が agent marketplace を全社投入（task $5–50〜enterprise $5k–50k/月）。interop 標準は A2A / MCP（MCP は企業採用 Gartner +1,445%）。cross-org の agent 商取引も始動（調達 agent ↔ 仕入先 sales agent、Google UCP 2026 テスト/2027 本番、Gartner: 2028 までに agent が B2B 購買 $15T を仲介）。

**🔴 だが「繋ぐ」には性質の違う 2 シナリオがあり、混同は致命的**（本書のデモ A社↔B社 はこれを曖昧にしている）：

| | **S1: 社内・複数 vendor** | **S2: 会社境界またぎ** |
|---|---|---|
| 例 | 1 社が SF agent＋他社マーケ agent＋自前を**社内で**handoff | A社 agent が **B社 agent** と境界越しに取引 |
| デモの実体 | **ほぼこれ**（営業＋マーケは普通 1 社の stack） | "2 社"と銘打つが実は S1 寄り |
| 需要 | **実在・今・大きい**（marketplace 出荷済、A2A はこのため） | 方向は実在も**主に将来/投機**（UCP 2027、$15T は 2028 予測） |
| 競合 | 🔴 巨人＋iPaaS(n8n/Workato)＋A2A ネイティブが収束。"勝者は企業調達 plumbing に紐づく者" | 🟢 白地寄り、だが trust/課金/責任が**未解決(M5)**＋UCP/決済 rails 流入 |

→ **繋ぐ需要が*今・濃い*のは S1（混雑・enterprise 重力）。*白地*は S2（hard＋将来＋trust 未解決）。防御可能な所と、難しく未検証な所が同じ** — これが正直な構造（§4/§5 と一致）。

**🔴 罠**：$15T/$3T は 2028 のアナリスト予測で「今この 2 社が払う」を意味しない。「論理的に需要が出るはず」は依然 🔴 仮説。**GATE-1 不変**。

**ICP のズレ（最重要・自分に効く）**：繋ぐ**金**があるのは enterprise(S1)/B2B 商取引(S2)。だが安く検証でき founder が中に居る ICP は indie/fleet-operator/free-tier juggler。**両者がズレている。**
→ **橋**：今は **「indie/小チームが Claude+Codex＋専門 agent を*買って/使って*社内で繋ぐ」＝ S1 の小規模端**（prototype が既に動かす領域・founder も中に居る）。**enterprise marketplace 越え/cross-org($15T) は投資家向け TAM ナラティブ**として使い、**今は作らない**。

**立ち位置**：marketplace は agent を**売る**場、A2A は**繋ぐ**標準。単一 marketplace は競合 agent を自社内で昇格しない → **vendor 中立の wiring/trust/UX 層は単一巨人に構造防御可能**。ただし **A2A 自体（中立・巨人連合）とは競合** → 白地は「**A2A の上の、marketplace 横断の orchestration＋trust＋体験**」に絞られる（transport ではない）。

**最速検証（S1 起点）**：「今、別ベンダの agent / 自動化を**手で**繋いでいる（コピペ・人手リレー）人」を 3–5 人探す＝ S1 の実在手作業＝pain の証拠。S2（他社 agent と境界越し）を*今*手でやってる人が居れば強い早期シグナル。

> 出典: Stactize（agent marketplaces）, Fastio（buy/sell agents）, MetaRouter / adwaitx（agentic commerce）, IBM Research（agent economy）。

---

## 6.6 capture 再設計（GLUE 調査の帰結・2026-06）

🔴 旧 capture「hosted relay tier で課金」（IA3）は **commodity に侵食**：Kong / Cloudflare / Portkey / LiteLLM / TrueFoundry / Solo.io agentgateway が多テナント relay＋使用量計量を標準提供。**relay/metering では稼げない。**

→ capture を **gateway の *上*** へ移す（gateway＝data plane、我々＝control/trust plane）。候補:
- **trust/audit as a service**（cross-party の承認・delegation・検証可能 audit ＝ M5。"誰も解いてない"＝価値）
- **orchestration per-seat / per-workflow**（cross-company handoff の設計・運用 UX）
- **build-state index / MCP control plane の seat**（AI が BuildHUD を操作する面・§6.7）
- **marketplace take**（仲介した handoff の成果ベース）

relay 課金は捨て、**trust＋orchestration＋index/MCP** で課金する。

## 6.7 MCP control plane（AI が BuildHUD を操作する面・MCP-first）

BuildHUD 自体を **MCP server** として公開し、AI が自律操作できるようにする（agent / workflow を発見・配線・実行）。
clean-mcp 流の **token-light index** が肝：全 workflow/agent を context に流さず、`search_*` が小さな ref を返し、`get_*` で必要な 1 件だけ load（= 本環境の deferred-tool/ToolSearch と同型）。設計は `10_MCP_INTERFACE.md`。これ自体が capture 点（§6.6）にもなる。

---

## 6.8 open-core ピッチ — 「BuildHUD kills 手配線 cross-agent glue」（n8n / Cal.com 流・Wave E）

> cockpit が visual flow-builder になった（`docs/11` Wave A–D 実装済・`prototype/hub`）ので、open-core ナラティブを 1 枚で固定。

**1 行ピッチ**：**BuildHUD kills the hand-wired glue between agents.** 別 vendor・別人の AI agent を繋ぐのに、今は bespoke script／コピペ人手リレー／使い捨て webhook を書いている（§6.5「手で繋いでいる人」＝痛みの証拠）。BuildHUD はそれを **D&D で配線し、保存して、走らせる** 1 つの面に置き換える。

**なぜ open-core / self-host / no-per-seat（先例に倣う）**：

| 先例 | 何を kill したか | BuildHUD の対応 |
|---|---|---|
| **n8n** | Zapier の per-task 課金＋closed → **self-host・per-execution 無料** | hub は zero-dep・self-host、capture は per-zap/per-seat でなく **trust/orchestration/marketplace-take**（§6.6） |
| **Cal.com** | Calendly の closed-source → **source ごと open-core**（機能を seat paywall に隠さない） | 配線・実行・automation・palette は **source 同梱**（`prototype/hub`）、上位 trust/audit/SSO を enterprise tier に |
| **Langflow** | 商用 flow-builder の lock-in → **OSS の visual agent builder** | 概念流用・zero-dep 維持、その上に **cross-person/vendor の trust** を足す（差別化） |

**「kills X」の X を具体化**（各 Wave が glue の 1 種を消す）：
- 手書き glue script（A の出力を整形して B に渡す）→ **typed port 配線**（Wave A）
- 自前 cron/webhook 配線 → **trigger ノード → automation**（Wave C）
- 「相手 agent が起動してないと止まる」→ **hub in-process executor＋durable inbox**（Wave B1）
- 「この MCP 繋いで」の手作業 → **palette ＋ ⚙settings の on/off**（Wave D／F）
- 「絶対に渡せない情報まで漏れる」→ **share 境界 pass/never**（Wave F・§2.5）

**capture（open-core の常道・§6.6 と一致）**：source は self-host 無料、**課金は seat/zap でなく** ① cross-party trust/audit（M5）② cross-company orchestration の運用 UX ③ MCP/index seat ④ 仲介 handoff の marketplace take。

**正直な fence（本書の声）**：
- 🟡 「kills X」は **positioning narrative** であって moat ではない。moat は §4（cross-person trust × hosted relay × dyad 縦特化）。
- 🔴 **GATE-1 不変**：手配線を実際に痛がり金を払う 1 ペアは未検証。open-core は配布を速めるが**買い手は作らない**。
- 🟡 open-core の monetization（どの上位機能を有料にするか）自体が別の bet。n8n/Cal.com は成立、我々は未検証。
- 🟢 ただし **builder は vapor でなく実在**（Wave A–D・`prototype/hub`）＝ピッチの裏に動くコードがある＝solo 最大リスク（出荷せず終わる）を一部解消。

---

## 6.9 AI-native で巨人 marketplace を kill — 検証済み需要 ＋ 3 フェーズ・ロードマップ（投資家 1-pager 骨子）

> §6.5–§6.8 を 1 枚に統合し、戦略の確定形＋実行順を固定。**この §6.9 単体を抜き出して投資家 1-pager として読める**。出典は末尾。

### A. 1-pager（問題 → wedge → 賭け）

**問題（今）**：AI agent が爆発し、人は**他オーナー・他 vendor の agent を使う**時代（cross-owner）へ。

**検証済み市場 🟢（予測でなく実在）**：**Salesforce AgentExchange だけで 18,500 社・~$800M ARR**（報道値 🟡）。そして **commodity model に UI を被せただけの「wrapper」は死に、勝者は専有データ/access/license/賠償＝非複製資産を持つ縦特化**（2026 M&A 総意：ZoomInfo/Harvey/Glean/Bloomberg）。

**非自明な真実（reframe）**：agent を雇う理由は **skill ではない**。skill は software＝複製・蒸留・購入可能で、レンタル市場は成立しない（だから wrapper が死ぬ）。雇うのは相手が握る**非複製資産**（①専有データ ②gated access ③license/権限 ④accountability/賠償）。**「agent 労働市場」＝cross-owner の非複製資産アクセス**。

**gap / why now**：巨人（Salesforce/Google/MS/AWS）は marketplace を**所有**するが構造的な罠 — **walled（単一 vendor lock-in）・enterprise sales 主導・legacy bolt-on・非 AI-native・非中立**。→ **「1 色」にできない multi-vendor の非巨人（indie/SMB）が締め出される。**

**kill wedge**：巨人の walled/clunky を、4 つの束で殺す —
- **AI-native**：AI が MCP control plane で発見・配線・実行（人が enterprise UI を click しない）。
- **圧倒的 easy**：self-serve・数分（sales cycle なし）。
- **中立**：Claude/Codex/Gemini/買い agent を 1 面で（vendor 横断）。
- **安全**：cross-owner の trust boundary（巨人 walled・dev marketplace・A2A が提供しない層）。

**耐久テスト 🟢（巨人が追随に捨てる物）**：(a) walled lock-in 放棄＝収益基盤喪失 (b) legacy product を AI-native に**再建** (c) enterprise sales→self-serve に GTM 転換。**三重自傷** → 構造空白。

**ICP**：≥2 vendor の agent を使い「1 色」にできない **indie/SMB**（founder が中に居り安く検証できる端）。

**capture**：marketplace-take ではない（発見は巨人所有）。**AI-native-safe-cross-owner 層**（trust/governance ＋ usability）。**marketplace/A2A/AP2 には乗る**（決済・transport・identity は巨人 rails を adopt）。

**one-liner**：
> **巨人は agent を walled に「売る」。我々は誰の agent でも、AI-native に・安全に・中立に「使わせる」。複製不能資産へのアクセスを、1 色にできない全員に。**

### B. 正直な賭け（fence）
- 🔴 **GATE-1（最重要・未証明）**：「巨人 walled でなく**中立・安全層に金を払う**非巨人」が実在するか。最安検証＝**≥2 vendor の agent を機微データに使う非巨人を 10 人 interview**（「他社 agent に自社データを触らせるのが怖くて使えてない／fence+audit する中立層に払うか」）。**3 人 🟢 で着手 GO**。
- 🟡 **$15T は our TAM でない**：Gartner「2028 に B2B 購買の 90%・$15T を agent 仲介」は**既存購買の channel-shift**で、しかも**同 Gartner が「agentic の 40%+ は 2027 末に中止」**と言う（bull と bear が同一分析会社）。
- 🟡 **usability 単体は moat でない**：kill は **AI-native × 中立 × 安全 × easy の組合せ＋巨人の構造的罠**で成立。「使いやすいだけ」なら吸収される。
- 🔴 **cold-start**：WORK 市場（Phase 3）は reputation に volume が要る両面市場。

### C. 3 フェーズ・ロードマップ（実行順＝規律。WORK 市場に飛びつかない）
> §2 の最警告（vision 膨張＝出荷ゼロ）への対処。**出荷可能なものを先に、moat を次に、economy を最後に。**

- **Phase 1 — 今 build 中を完成：AI-native で easy・中立な builder**（出荷優先）
  cockpit A–E 完了済。残＝**F**(integrations/⚙settings＋autorun)・**G**(mcp ノード＋実送信)・**K**(Langflow parity 最小)・**L**(Ghost Writer＝AI-native 著述)。これは kill の「AI-native＋easy＋中立」surface＝**入場料（単体では moat でない）**。done＝非巨人が複数 vendor の agent を AI-native・中立・self-serve で配線→Run。
- **Phase 2 — trust / audit（moat を載せる）**
  **H**(Agent Trust Boundary＝capability passport＋data firewall＋audit)。隣接 **I**(consensus)・**J**(build-state IR)。done＝「他社 agent を機微データに env/PII fence＋全 call audit で使う」＝巨人 walled/n8n/Langflow に**書けない flow**を実演。
- **Phase 3 — WORK 市場（North Star・economy）**
  cross-owner agent 労働市場：discovery/**reputation graph（通貨）**・marketplace・**AP2 settlement**・emergent チェーン。**gate＝Phase 2 完了＋GATE-1 実証後に本格化**（先回りしない）。

> 出典: Salesforce AgentExchange（~$800M ARR・report 値）/ 2026 M&A（wrapper 死・非複製で勝つ）/ Google AP2（60+社・FIDO 寄贈）/ A2A（150+ org）/ Gartner IT Symposium 2025（$15T by ~2028）＋ Gartner 公式「40%+ 中止 by 2027」。

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
