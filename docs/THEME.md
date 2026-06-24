# 神龍 UI テーマ — Netdive Blue（確定）

> 攻殻機動隊（Ghost in the Shell）モチーフの **フラット青** テーマ。2026-06-24 確定。
> これが配色・アイコン・用語の**正本**。プレビュー: `docs/theme-candidates.html`（本命＝最上段）/ フルモック: `docs/cyberbrain-netdive.html`。
> 実適用は Wave Cockpit。入口は `docs/EMOJI_INVENTORY.md` 区分 A（ui2/shenron/settings/index.html）。

## 原則

1. **フラット（発色なし）** — glow / neon（`box-shadow` の光彩・`text-shadow`）は使わない。攻殻感は色ではなく**構造モチーフ**（等幅フォント・`›` プロンプト・照準レティクル・「攻性防壁」等の用語）で出す。
2. **アイコンは SVG ラインアイコン**（絵文字・ラスター画像は使わない）。24×24・`stroke="currentColor"`・stroke-width 1.7・round cap/join。色は CSS の `color` 1つで決まる。
3. **アイコンの構成 = ベース形（カテゴリ）＋ 中身（差分）**。例: チャット入出力は同じ吹き出しベースで、中身（プロンプト vs テキスト行）だけ変える。
4. **状態は意味色を保つ** — 🟢🔴🟡 → 色付きドット＋テキストラベル。ok/warn/danger の色は青テーマでも変えない。
5. **アクセントは青1色＋意味色のみ**。色数を増やさない。

## カラートークン

```css
:root{
  /* 面（背景）— 奥から手前へ */
  --bg-0:#0a0c10;   /* アプリ地 */
  --bg-1:#0a121b;   /* パネル */
  --bg-2:#0c1822;   /* カード */
  --bg-3:#0f1f2c;   /* カードヘッダ / 一段持ち上げ */

  /* 枠線 */
  --border:#213e56;
  --border-soft:#182d3e;

  /* アクセント（青・フラット） */
  --accent:#5b9bd1;        /* アイコン・ポート・active */
  --accent-strong:#7eb6d9; /* 見出し */
  --accent-brand:#aacbe4;  /* ブランド「神龍」 */
  --btn-primary-bg:#1a3a55;
  --btn-primary-bd:#3b6f97;
  --btn-primary-tx:#dceaf5;

  /* テキスト */
  --text:#c2d6e6;       /* 主 */
  --text-dim:#6d8aa0;   /* 副・説明 */
  --text-faint:#5e84a0; /* ポートラベル・prompt 等 */

  /* 状態（意味色・テーマ非依存） */
  --ok:#3fae7a;
  --warn:#c79338;
  --danger:#c2554f;

  /* 形 */
  --radius-card:8px;
  --radius-btn:6px;
  --radius-chip:4px;

  /* フォント */
  --font-mono:ui-monospace, SFMono-Regular, Menlo, monospace;
  --font-sans:ui-sans-serif, system-ui, sans-serif;
}
```

**フォント運用**: ラベル・ノード名・ボタン・状態は **mono**（電脳/ターミナル感）。本文/説明は sans。

## アイコンセット

ラッパ: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">{path}</svg>`

| キー | 用途（現絵文字） | path |
|---|---|---|
| `input` | チャット入力（💬） | `M4 5h16a1.5 1.5 0 0 1 1.5 1.5v8A1.5 1.5 0 0 1 20 16h-8l-4 3.5V16H4a1.5 1.5 0 0 1-1.5-1.5v-8A1.5 1.5 0 0 1 4 5z` ＋ `M7.5 8.8l2.2 2.2-2.2 2.2` ＋ `M12.2 13.2h4.6`（吹き出し＋`›_`） |
| `output` | チャット出力（📤） | 吹き出し（input と同）＋ `M7 9.3h10` ＋ `M7 12.4h6`（テキスト2行） |
| `llm` | 言語モデル（🧠） | `M8 8h8v8H8z`（内）＋ `M3.5 3.5h17v17h-17z`（外・rx2.5）＋ ピン `M10 3.5V1 M14 3.5V1 M10 23v-2.5 M14 23v-2.5 M3.5 10H1 M3.5 14H1 M23 10h-2.5 M23 14h-2.5` |
| `router` | 分岐ルーター（🔀） | `M7 4v5a3 3 0 0 0 3 3h7` ＋ `M14 9l3 3-3 3` ＋ `M7 14v6` ＋ `circle 7,4 r1.4` |
| `firewall` | 攻性防壁（🔒） | `M12 3l8 3v5c0 5-3.4 8.2-8 10-4.6-1.8-8-5-8-10V6z` ＋ `M9.5 12l1.8 1.8L15 10`（盾＋✓） |
| `save` | 保存（💾） | `M5 4h11l3 3v13H5z` ＋ `M8 4v5h7V4` ＋ `M8 14h8v6H8z` |
| `trigger` | トリガー / 実行（⚡） | `M13 2L4 14h7l-1 8 9-12h-7z` |
| `mcp` | MCP ツール / 連携（🔌） | `M9 8V3 M15 8V3` ＋ `M7 8h10v3a5 5 0 0 1-10 0z` ＋ `M12 16v5` |
| `note` | メモ（📝） | `M5 3h10l4 4v14H5z` ＋ `M15 3v4h4` ＋ `M8 12h7 M8 16h5` |
| `agent` | エージェント（👤） | `circle 12,8 r3.4` ＋ `M5 21c0-3.9 3.1-7 7-7s7 3.1 7 7` |
| `reticle` | ブランド脇の照準（攻殻モチーフ） | `circle 12,12 r8` ＋ `M12 2v3 M12 19v3 M2 12h3 M19 12h3` ＋ `circle 12,12 r1.6 fill` |

> 標準アイコンの大半は Lucide / Tabler 等から流用可（同じ 24×24 stroke 規格）。攻殻固有（reticle・攻性防壁の盾・吹き出し入出力）だけ自作。

## 状態マーカー（🟢🔴🟡 の置換）

色付きドット（8px 円・グローなし）＋ mono テキストラベル。

| 旧 | 置換 | 色 | 意味 |
|---|---|---|---|
| 🟢 | `● online` | `--ok` #3fae7a | 正常・接続・確度高 |
| 🟡 | `● 注意` | `--warn` #c79338 | 警告・確度中 |
| 🔴 | `● blocked` | `--danger` #c2554f | 失敗・遮断・確度低 |
| ✅ | `✓`（ラインアイコン） or `● 完了` | `--ok` | 出荷済・成功 |
| ❌ | `✕` or `● 失敗` | `--danger` | 非該当・失敗 |

## ブランド

`🐉` → mono で `神龍` ＋ 脇に `reticle`（照準）アイコン。完全な絵文字置換が要る箇所のみ reticle 単体をマークとして使う。

## 用語マッピング（攻殻寄り・任意・ユーザー可視テキスト）

実装時に i18n ラベルを攻殻寄りに寄せる候補（過剰にしない・機能の分かりやすさ優先）:

| 機能 | 攻殻寄りラベル候補 |
|---|---|
| data firewall / per-edge fence | **攻性防壁** |
| 外部発見（discover） | **ネットダイブ** |
| 生成された道具 / component | **タチコマ**（自律小型 AI のメタファ） |
| MCP control plane | **公安9課**（統制面） |
| co-pilot「一緒に操作」 | **電脳同期** |
| audit / tamper-evident log | **電脳ログ** |

> ⚠️ 用語の攻殻化は**機能の分かりやすさを壊さない範囲**で。primary は機能名、攻殻語は副題/トーンに留めるのが安全（[[feedback_human_labels_not_jargon]] と整合）。

## やらないこと

- glow / neon / 強い text-shadow（フラット原則）。
- アイコンのイラスト化（多色・写実）。線画の記号に留める。
- 青以外の装飾アクセント追加（意味色 ok/warn/danger を除く）。
- 絵文字の温存（記号として意味を担う状態マーカーは上記の色ドットに置換）。
