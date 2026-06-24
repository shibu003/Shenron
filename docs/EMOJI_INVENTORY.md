# 絵文字 使用箇所 台帳

> 現状で絵文字を使っている全箇所の棚卸し（2026-06-24 時点・git 管理下 80 ファイル走査・うち 62 ファイルがヒット）。
> 目的＝将来の置換作業のための地図。**今は据え置き（プレースホルダー）**、いずれ表現を差し替える。
> 走査スクリプト: 使い捨て（`$CLAUDE_JOB_DIR/tmp/scan_emoji.py`）。再走査時は git ls-files を全文 grep。

## 分類の方針（置換の優先度）

| 区分 | 性質 | 置換優先度 |
|---|---|---|
| **A. ユーザー可視 UI** | `.html` 内のボタン/見出し/ノードアイコン | **最優先**（ユーザーの目に直接入る） |
| **B. 状態マーカー** | 🟢🔴🟡✅❌⚠ — 色/成否を**記号として**担う | 中（意味を保ったまま代替表現へ。乱暴に消すと情報欠落） |
| **C. ブランド** | 🐉🐲 神龍の identity | 低（identity なので慎重に） |
| **D. コード/ログ** | `.mjs` の audit trail ラベル・console 出力 | 中 |
| **E. ドキュメント装飾** | `docs/*.md`・`PROJECT.md` の見出し装飾 | 低 |
| **F. タイポグラフィ記号（非絵文字）** | →←↓↑↔ ★ ✓✕ — 文章/図の記法 | **対象外**（絵文字ではない・残す） |

---

## A. ユーザー可視 UI（最優先・`.html`）

絵文字数の多い順: `ui.html` 321 / `ui2.html` 287 / `shenron.html` 79 / `settings.html` 41 / `index.html` 6。
※ `ui.html` は旧フル cockpit で `wave-cockpit` で退役予定（玄関 router 統合）。新規置換は `ui2`/`shenron`/`settings`/`index` を優先。

### ui2.html（作業場 cockpit）— ノードアイコン + ツールバー
| 絵文字 | 用途 | 例 |
|---|---|---|
| `🐉` | ブランド（左上） | `<div class="brand">🐉 神龍</div>` |
| `💾` | 保存ボタン | `💾 保存` |
| `🗂` | 保存済みフローを開く | ツールバー |
| `🎨` | 成果物 UI レンダリング | `🎨 成果物` |
| `⚙` | 設定リンク | `⚙ 設定` |
| `🚪` | 玄関へ戻る | `🚪 玄関` |
| `🌐` | 言語切替 | `🌐 日本語 / EN` |
| `⚡` | トリガー（自動実行の起点） | menu |
| `👤` | エージェント配置 | menu |
| `🔌` | MCP ツールノード | menu |
| `📦` | コンポーネントノード | menu |
| `📝` | メモノード | menu |
| `📂` | JSON 取込 | menu |
| `📋` | automation 保存 | menu |
| `📜` | skill 化（Claude Code） | menu |
| `🔍` | 設定を開く（ctx） | inspector |
| `🗑` | 削除 | selection |
| ノードアイコン | `💬`入力 / `📤`出力 / `🧠`LLM / `🧷`構造化出力 / `🔧`Parser / `🔀`Router / `⚖`Consensus | `kind.icon` |
| trust 系 | `🔒`firewall / `🔎`trust 確認 / `🔄`信頼の変化 / `🔗`Langflow 取込 | inspector/edge |
| 状態/policy | `🟢`online / `⚪`offline / `⚡`auto / `✋`appr / `⚠`確認/risk | label |
| その他 | `✉`handoff 送信 / `✏`修正 | |

### shenron.html（事務所 cockpit・PWA・6タブ）
| 絵文字 | 用途 |
|---|---|
| `🐉` | タイトル/ブランド |
| `🚪` | 玄関へ |
| `📋` WORKFLOWS / `⚡` RUNS / `🔧` DEPLOYMENTS / `📚` 庫 | タブ見出し（コメント） |
| `💾`保存 / `📜`skill / `✏`編集 / `❌`decline / `🔁`採用 | 操作 |
| `🌐`/`🔗` | visibility（shared/private 切替） |
| `⚙`不足ツール / `⚠`ブロッカー / `💡`初期設定 | plan 結果バッジ |
| `💰`コストポリシー / `🔑`API キー / `🦞`OpenClaw / `☁`Managed / `🧩`生成ツール / `🔌`Integrations | 設定/deploy |
| `📥`入力 / `📤`出力 / `💬`stub | run 表示 |
| `✅` | 成否（regMsg） |

### settings.html（設定・⚙ から開く）
見出しが軒並み絵文字付き: `⚡`autorun / `💰`実行コスト / `💳`paid_ok / `🧭`モデル経路 / `🎯`ゴール / `📦`テンプレート / `✅`成果検証 / `💡`提案 / `🚨`ドリフト検出 / `💡`(KIND_LABEL) / `📬`通知 / `🔌`連携 / `🔐`保管庫 / `🔑`環境キー / `👥`ユーザー / `🐉`ブランド。
状態: `☁`managed / `🖥`self-host / `⚠`scheduler OFF / `✅❌`check 結果。

### index.html（玄関 launcher・6 行のみ）
`🐉`タイトル / `🐲`(ic) / `💬`(ic) / `✏`(ic) / `⚙`(ic)。カードのアイコン。

---

## B. 状態マーカー（記号として意味を担う）

置換時は**意味を保ったまま**代替する（色テキスト/badge/SVG 等）。乱暴に削ると確度・成否の情報が消える。

| 絵文字 | 意味 | 総数 | 主な場所 |
|---|---|---|---|
| `✅` | 出荷済/成功 | 172 | ROADMAP・docs・UI・test |
| `⚠` | 警告/注意 | 107 | 全域 |
| `🟢` | 確度: 高/構造的空白 | 57 | docs・SCORECARD・templates |
| `🔴` | 確度: 低/リスク/危険 | 47 | docs・SCORECARD |
| `🟡` | 確度: 中 | 22 | docs |
| `🔵` | 補助マーカー | — | docs/12 |
| `❌` | 失敗/非該当 | 13 | test・UI |
| `🔒` | fenced/firewall 適用 | 52 | trust UI・docs |

> 関連: `prototype/gate1/SCORECARD.md`・`prototype/templates/*.json`・`clawhub/shenron/templates/*.json` も 🟢🔴 を data として持つ。

---

## C. ブランド

| 絵文字 | 総数 | 場所 |
|---|---|---|
| `🐉` 神龍 | 45 | 全 cockpit タイトル・`.claude/giogio-mcp-first.md`・docs |
| `🐲` | 2 | `index.html`・`ROADMAP.md`（龍 variant） |

---

## D. コード / ログ（`.mjs`）

audit trail ラベル・console 出力・spawn 結果表示などに混在。

| ファイル | 絵文字 | 用途 |
|---|---|---|
| `prototype/hub/hub.mjs` (167) | ⏹⚠✓📦⚙🔗⏰🗂🔑⛔↷✅🎯⚡🔌🐉🧪 | run 状態・trail・boot ログ |
| `prototype/hub/shenron.mjs` (115) | ⚠🔧🗳🔀🐉🔗📥📤🌐🤖🧷🧠💬 | plan/gen の trail・図 |
| `prototype/agents/browser-worker.mjs` (48) | ✗🔐⏹✓ | computer-use ログ |
| `prototype/test_e2e.mjs` (44) | ✅❌↳✓🔴 | テスト結果表示 |
| `bin/shenron.mjs` (6) | ❌⚠✅🐉 | first-run/doctor CLI 出力 |
| その他 test/mcp/*.mjs | →✓✗⚠ | 各種ログ |

---

## E. ドキュメント装飾（`docs/*.md`・`PROJECT.md`）

見出しや箇条書きの装飾。意味は文脈で読めるため置換優先度は低い。

| ファイル | 絵文字数 |
|---|---|
| `docs/ROADMAP.md` | 418 |
| `docs/13_SHENRON.md` | 357 |
| `PROJECT.md` | 223 |
| `docs/06_VISION.md` | 84 |
| `docs/08_OSS_PARTS.md` | 64 |
| `docs/10_MCP_INTERFACE.md` | 64 |
| `docs/16_SERVICE_AND_DEPLOY.md` | 54 |
| `docs/15` / `14` / `17` / `12` ほか | 各 ≤29 |

※ この台帳（`EMOJI_INVENTORY.md`）と `OVERVIEW.md` は装飾絵文字を使わない方針で書いている。

---

## F. タイポグラフィ記号（非絵文字・対象外）

絵文字ではなく文章/図の記法。**置換対象外・残す**。

| 記号 | 総数 | 用途 |
|---|---|---|
| `→` | 1679 | フロー/因果の矢印（圧倒的多数） |
| `↔ ← ↓ ↑ ⇄ ↻ ↳ ↷` | 計 ~80 | 双方向/方向/ループ |
| `★` | 14 | 強調マーカー（doc） |
| `✓ ✕ ✗` | 計 ~83 | チェック/バツ（UI ボタン・test） |
| `⌘ ⇧ ⇪` | 計 ~15 | キーボードショートカット表記 |

---

## 集計サマリ

- 走査: git 管理下 80 ファイル → **62 ファイルに絵文字**。
- 総数最多は `→`(1679・記法) を除けば `✅`(172) `⚠`(107) `🔗`(61) `🟢`(57) `⚡`(57) `🔒`(52)。
- **置換の入口**＝A（UI 4ファイル: ui2/shenron/settings/index）。`ui.html` は退役予定なので後回し可。
- B（状態マーカー）は**意味の保存**が条件。C（ブランド）は identity 判断が要る。
