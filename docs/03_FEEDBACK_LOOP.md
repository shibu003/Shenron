# 03 — 判断の監査 / Feedback Loop（赤チーム）

> Claude Code 向けハンドオフ (3/4)。これは**自己正当化でなく赤チーム**。
> **2026-06-15 更新**：外部赤チーム `04_RED_TEAM_AUDIT.md`（30 agents・web 接地・実機検証）で、本書の旧自己採点が**自分に甘かった**ことが判明。旧 🟡 の多くは接地後 🔴、hero metric は数式破綻。本書は **04 で確定した判定・方向転換・残 risk** を反映した版。詳細根拠と出典は 04 を参照。

---

## 監査する判断（pivot 後）

- **D1** 製品＝vendor 中立 cross-agent build-state IR（desktop cockpit + mobile companion）
- **D2** ウェッジ＝cross-vendor 統合 ＋ model 中立（旧「状態健康 vs 監視」は dissolve）
- **D3** context 健康＝**副指標**（旧「フレッシュ鈎」から降格）
- **D4** 堀＝open IR 標準 ＋ model 中立 ＋ 統合 view ＋ craft
- **D5** feature 追加＝構造化 intent（D&D は任意。中核から降格）
- **D6** アーキ＝cross-vendor 読取り＋relay＋attended dispatch

---

## 判定サマリ（自己採点 → 04 接地後）

| ID | 04 接地後 | 一行 |
|---|---|---|
| D1 | 🟡 | pivot 後は「cross-vendor IR」に集約。company bet は TAM/R1 次第 |
| D2 | 🟡 | 「健康 vs 監視」framing は死。**cross-vendor 統合 + model 中立**として再生（D4 に統合） |
| D3 | 🔴→副指標 | keystone 反証・式破綻・action なし。鈎から降格で risk 緩和 |
| D4 | 🟡 | craft 単独は 🔴。open IR 標準 + model 中立を堀の核に据え直して 🟡 |
| D5 | 🔴→降格 | commodity + mobile anti-pattern。構造化 intent(A4) で価値は確保、D&D 中核を撤回 |
| D6 | 🟡 | 作れるが堀でない。§4 式修正・staleness 欄・attended dispatch で再構成 |

> 旧版の生死を分ける一文「ビルダーは context 健康に金を払うか」は **04 で反証寄り**。新しい生死の一文 → §結論。

---

## 危険な仮説ランク（04 準拠・致命的順）

| | 仮説 | 反証 | 最速検証 |
|---|---|---|---|
| **R1 🔴** | context 健康は painkiller か vitamin か | 悪い出力時、人は数字を見ず `/clear` 再試行 + runtime が auto-compact | **5-8 builder 行動質問**「悪い出力→数字を見る or `/clear`?」（½日・コード0） |
| **R2 🔴** | cross-vendor 統合 IR に**需要があるか**（fleet operator は実在 ICP か） | 単一 vendor で足りる/median は混在しない | 同 builder に「複数 vendor を 1 view で見たいか・切替で足りるか」 |
| **R3 🔴** | fleet operator **TAM** は事業足りるか（IA4） | n=1 創業者の outlier 使用を市場と誤認 | **jsonl mtime 実測 + 5-10 builder で並列 session/vendor/machine 数 sizing** |
| **R4 🔴** | privacy/exfiltration（IA4 監査も見落とし） | "creds は host に留める" は misdirection。派生元 jsonl が本文/secret/コードを含む | relay payload を数値のみに絞れるか設計検証 |
| **R5 🔴** | dispatch（unattended 完走）が真の難所 | "実装に難所なし" は誤り。agent は permission/conflict で失敗 | attended 前提なら巨人の監視面と差が出るか確認 |
| **R6 🔴** | goal–model 整合（IA3） | 旧 pure-OSS は capture を foreclose | open-core + hosted team tier で fundable か（決定済・要価格検証） |
| **R7 🟡** | format 税 / ToS / Apple 2.5.2 | 無 schema private 形式が ≈毎週 breaking、2 vendor で 2 倍 | version 耐性 reader + ToS 確認 + Apple 配布前審査 |
| **R8 🟡** | demo→product gap | cached + ライブ投入1 は壊れる所を隠す | demo で隠す failure mode を raise で売らない |

---

## 空白創出（§counter-positioning・04 の合成）

競合 🔴 で撤退する前に 3 レバーを回した結果（捏造禁止・耐久テスト合格のみ採用）：

- 🟢 **value-axis: model 中立** — 巨人は自社内で競合の inference 状態を昇格できない（lock-in 放棄）。
- 🟢 **direction: fleet operator** — 巨人は 4M median 最適化を強制される（innovator's dilemma）。TAM 薄い恐れ（R3）。
- 🟢 **mechanism: open IR 標準** — 巨人は portable schema を公開できない（interoperability lock-in 放棄）。
- 🔴 一時差（採用せず）：local-trust、CI gate、push alert（OSS or 巨人が容易に吸収）。

**合成＝「mixed-agent fleet 向けの vendor 中立 open build-state 標準」**。単一巨人が追随するには (a) 競合状態を自社昇格 (b) median を deprioritize (c) portable schema 公開 の 3 重 anti-monetization 自傷が同時に要る ＝ 構造空白。
**正直な留保**：① この堀は**巨人に対してだけ**。OSS（AgentsRoom は複数 agent 既読）には craft/標準化速度の薄い勝負。② 事業性は未検証 TAM（R3）に依存。

---

## kill-criteria（撤退/pivot 基準・04 で追加）

backlog に積まず、その場で判定する：
- **R1 が vitamin と出たら** → context-health UI を最小化し IR 統合に全振り（既に副指標化済）。
- **R2 が "単一 vendor で足りる" と出たら** → cross-vendor の前提が崩れる。製品の核を再考（pivot）。
- **R3 で fleet operator が希少（並列 < 5 / 単一 vendor 中心）と出たら** → ICP/TAM 再定義、または acquihire 路線に切替。
- **R4 privacy を host 内最小化で解けないなら** → 出荷不可。設計やり直し。
- **R5 dispatch が attended でしか動かないなら** → 「監視面」になる事実を受け入れ、cross-vendor 統合の差で勝負（D&D・自律実行を盛らない）。

---

## 結論（04 反映）

- **強い土台**：cross-vendor 統合の空白は実在（3 review 確認・巨人は構造上来られない）／ アーキは作れる（深い難所は dispatch と privacy）／ 北極星の型一致（dev OSS picks&shovels）。
- **賭けの中心（新）**：
  1. **「cross-vendor のビルド状態を 1 view で見る」は反復 job か**（R2）— 単一 vendor で足りるなら核が崩れる。
  2. **solo が、2 競合の private で毎週変わり crown jewels を漏らすログの上の薄い統合層を、安全に出荷し durable に守れるか**（R4 + R5 + R7）。
- **生死を分ける一文**：**「fleet operator は実在する母集団で、cross-vendor 統合 IR に切替/課金するのか。それとも各 vendor の純正ツールで足りるのか。」**
- **推奨**：着手前に **R1/R2/R3 を行動テスト + 実測**（½〜1日・コード0）→ §4 式修正と privacy 境界を実装前に固定 → MVP は cross-vendor 1 view（context は副）。**会社化は R2/R3 が 🟢 になってから**。
- **正直に**：旧版より賭けは難しくなった。context 健康は鈎にならず、差別化の各単機能は巨人/OSS に吸収中。**唯一の構造空白は model 中立 × fleet × open 標準**で、これは巨人にだけ効き OSS には craft 勝負、事業性は TAM 次第。**構造的死ではないが、勝つには標準化と統合 craft を solo で先に出し切る必要がある。**
