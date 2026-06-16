# 05 — 着手前検証 / Pre-Build Validation

> ハンドオフ (4 補)。`04_RED_TEAM_AUDIT.md` が「着手前に潰せ」とした最優先 risk（R1/R2/R3）を、**コード 0〜半日**で行動テスト + 実測する playbook。
> 原則：aspirational な質問（「context 健康を見たい?」）でなく **behavioral・forced-choice**（「悪い出力時、最初に何をした?」）で聞く。願望でなく行動を測る。
> 計測: `scripts/measure-fleet.mjs`（read-only・no network・builder に共有可）。

着手判断：**R2/R3 が 🟢 になるまで会社化・本実装に進まない**（kill-criteria は `03` §kill-criteria）。

---

## 0. n=1 baseline（本機・2026-06-15 実測）

`node scripts/measure-fleet.mjs --days=14` の結果。**創業者自身のデータ**ゆえ市場でなく baseline:

| 指標 | 値 | 解釈 |
|---|---|---|
| Claude Code session (14d) | 405 / 634 | 極めて高頻度 |
| distinct project roots | 37 | IA4 の「n=1 outlier（1-in-1000）」を**裏付け** |
| peak concurrent session | **34** | orchestrator 化は本物（だが本人だけ） |
| vendors (this machine) | claude-code(634) / codex(**1, 0 recent**) / gemini(6, **2 recent**) | ⚠️ ほぼ Claude Code 単一。**ただし予算制約による交絡**（下記）＝ cross-vendor 反証として無効 |
| 旧式 contextFillPct | 137%–2753% | **04 の式破綻を実機で再現** |
| 修正式 @200k / @1M | 21–91% / 4–18% | 正常値。式修正の正しさを確認 |

> ⚠️ **n=1 single-vendor は交絡で「情報量ゼロ」（逆風ではない）**：本機は codex 0 recent・gemini 2 recent ＝ ほぼ Claude Code 単一。**だがこれは予算制約による交絡**（複数 vendor の有料 tier を払えないと 1 つに集中する）。よって cross-vendor 需要への**反証として無効**。ただし「金があれば mixed になる」は自分の将来行動の**反実仮想 ＝ 🔴 仮説**で、n=1 を*中立化*するだけ（追い風には変えない）。**R2 は外部 builder で測る**（結論不変）。
> 💡 **交絡が unlock する仮説（要検証）**：Codex は全 plan(無料含む)、Gemini CLI は無料枠、Claude も無料枠。→ **mixed-vendor は「金欠 indie が無料枠を跨いで rate limit を躱す」行動でもある**（Claude 無料が詰まる→ChatGPT 無料→Gemini と渡り歩く）。これなら ICP が「裕福な fleet operator」→「**rate-limit を躱す free-tier juggler**」に下方シフトし、TAM 拡大・**founder 自身が ICP 内**（dogfood 可）・痛みが鋭い。これも 🔴 仮説、同じ R2/R3 にかける。
> ✅ **追い風シグナル**：peak 34 並列 / 37 project = 「多 session を束ねたい」痛みは（少なくとも power user に）実在。論点は ① cross-vendor か ② 母集団（rich operator か free-tier juggler か）。
> 注: vendor 検出はディレクトリ内ファイル数の粗い proxy（config/temp を含み得る）。"recent" のみ実利用に近い。

---

## 1. 計測スクリプトの使い方

```bash
node scripts/measure-fleet.mjs            # 直近14日
node scripts/measure-fleet.mjs --days=30  # 窓を変える
node scripts/measure-fleet.mjs --json     # 機械可読 summary も出す
```

出す物：① R3 sizing（active session / project 数 / **peak concurrent** / 並列ヒストグラム / 検出 vendor）② R2 式チェック（修正式 vs 旧式を**自分のデータで**対比）。
- machine 横断は 1 host から測れない → **各 machine で実行して合算**（self-report 欄あり）。
- builder に渡す時：「read-only・ネットに何も送らない・出た数字だけ教えて」と添える（privacy 配慮で adoption も上がる）。

---

## 2. 行動テスト（recruited builder 5–10 人）

対象＝**Claude Code / Codex を日常運用する solo/indie**。1 人 ~15 分。順番固定（誘導を避けるため context 質問を後ろに）。

### Q-fleet（R3・最初に聞く・誘導なし）
> 「いま AI coding agent を**いくつ並行**で、**何 vendor**（Claude Code / Codex / Gemini…）、**何台の machine**で回してる? 直近よく使った週で。」
- 任意：「`measure-fleet.mjs` を回して peak concurrent と vendor 数だけ教えて」。

### Q-vendor（R2・cross-vendor 需要の核）
> 「複数 vendor を混在で使ってる人だけ：**今、複数 vendor の走行状態を確認する時どうしてる?** (a) vendor ごとに別アプリ/タブを行き来 (b) 1 つに寄せてる (c) そもそも混在してない・1 vendor だけ」
> 続けて：「もし **全 vendor を 1 view** で見れたら、(a) それのために今のツールから乗り換える (b) あれば便利だが乗り換えない (c) 要らない」

### Q-juggle（R2 別仮説・free-tier juggler）
> 「**お金の理由**で vendor を使い分けてる? 例：Claude 無料が rate limit で詰まったら ChatGPT/Codex 無料へ、それも詰まったら Gemini へ、と渡り歩く。(a) まさにそれ (b) 1 つ課金して済ます (c) 1 つの無料だけで足りる」
> 「もし **どの vendor がいま空いてる/詰まってる**かを 1 view で見れて、空いてる方に投げられたら使う?（rate-limit 横断ダッシュ）」
> ※ ここが厚ければ ICP を free-tier juggler に下方シフト（TAM 大・founder-fit・痛み鋭い）。

### Q-context（R1・vitamin か painkiller か・behavioral）
> 「直近、agent の出力が**明らかに悪くなった**時、最初にしたのは? (a) context/token の**数字を見た** (b) `/clear` か `/compact` して**再投入** (c) prompt を直した (d) その他」
> 続けて：「context-fill % を**専用アプリ**で見るために、入れる/払う? (はい/いいえ/どちらでも)」

### Q-away（P3/IA5・mobile companion の根拠）
> 「agent が走ってる間に desk を離れる時、phone で? (a) 戻るまで放置 (b) glance/approve したい (c) phone から build-forward したい」

---

## 3. DM テンプレ（そのまま貼れる）

**Discord / Slack（短）**
> AI コーディング agent の使い方を 15 分で聞かせてくれる人いますか? 売り込みゼロ、調査だけ。Claude Code / Codex を**複数並行**で回してる人優先。お礼は[コーヒー/Amazon ギフト等]。DM ください 🙏

**X / Twitter（公開募集）**
> Claude Code・Codex を**複数並行 × 複数 vendor**で回してる indie hacker を探してます。15 分の使い方インタビュー（売り込み無し）。1 つだけ先に：*agent の出力が悪くなった時、最初にするのは「数字を見る」？「/clear して再投入」？* 返信 or DM で 👇

**メール / 1:1（丁寧）**
> 件名: 15 分・AI agent の使い方ヒアリング（売り込み無し）
> ◯◯さん、AI coding agent を日常運用されてると伺いました。新ツールの前提検証のため使い方を 15 分ほど伺えませんか。製品の宣伝はしません、行動を知りたいだけです。よければ read-only の計測スクリプト（ネット送信なし）も同梱します。候補日: [2-3 案]。

**募集先**：r/ClaudeAI / r/ChatGPTCoding、Anthropic・OpenAI Codex の Discord、Indie Hackers、X の #buildinpublic、知人の indie dev。

---

## 4. 採点 → kill-criteria（`03` と連動）

| テスト | 🟢 進む | 🔴 止める/pivot |
|---|---|---|
| **R3 TAM** | **(rich)** ≥半数が ≥3 並列 × ≥2 vendor × ≥2 machine、**または (juggle)** ≥半数が無料枠 rate-limit で vendor を渡り歩く | どちらも薄い（1 vendor・1 machine 中心、課金単一で済む）→ ICP 希少。TAM 再定義 or acquihire 路線 |
| **R2 cross-vendor** | ≥半数が「1 view のために**乗り換える**」（Q-vendor or Q-juggle のどちらかで） | 「別アプリ往復で足りる」「混在してない」多数 → **pivot の核が崩れる**。製品再考 |
| **R1 context** | ≥半数が「**数字を見る**」＋払う | ≥半数が「`/clear` 再投入」「払わない」 → context は vitamin（既に副指標化済・UI 最小化） |
| **away** | (b)/(c) 多数 | (a) 放置多数 → mobile companion の優先度↓ |

**判定ルール**：R2 が 🔴 = 最重要（pivot 前提が死ぬ）。R3 が 🔴 = 事業性が死ぬ。**両方 🟢 で初めて本実装**。R1 は既に副指標化で de-risk 済だが、行動を確認して context UI の投資量を決める。

---

## 5. 進め方（1 週間）

1. **Day 0**：`measure-fleet.mjs` を自分の全 machine で実行 → baseline 合算。DM を 3 チャネルに投下（目標 8–10 人）。
2. **Day 1–4**：15 分インタビュー ×5–10。Q-fleet → Q-vendor → Q-context → Q-away の順、逐語メモ。任意で script を回してもらう。
3. **Day 5**：採点表に集計 → kill-criteria 判定 → `03` の判定サマリを更新。
4. **分岐**：R2/R3 🟢 → 02 §8 の MVP 着手（式修正・privacy 境界を先に）。🔴 → `03` §kill-criteria に従い ICP/核を再定義（acquihire 路線含む）。

> コスト：コード 0、謝礼数千円、1 週間。**この 1 週間が、数週間の誤った本実装を先食いする**（04 の主旨）。
