# UI Redesign — Wave Plan

## 決定事項

**基本構成**
- 左端: narrow icon nav（Builder / Runs / Settings）
- 中央: canvas
- 右: sidebar 1本（コンテキスト切り替え）
- topbar: 7要素に削減

**sidebar コンテキスト切り替えルール**
- ノード未選択 → palette view（parts棚 + Add + coach）
- ノード選択   → inspector view（詳細 + policy + trust diff）

---

## Wave 1: topbar整理 ✅

**変更点**
- `btnCollapse` + Shenron 4独立ボタン + LF 2ボタン = 7要素を削除
- `🐉▾` dropdown (`#shenronMenu`) に集約: Plan / Refine / Build / Gaps / Collapse
  - Refine / Build / Gaps は plan 生成後に `disabled` 解除（`applyPlan()` で制御）
  - Collapse は multi-select 時に `disabled` 解除（`render()` で制御）
- `⚡▾` dropdown (`#autoMenu`) に LF-Import / LF-Push を追記
- `toggleMenu(e, id)` / `closeMenu()` を複数メニュー対応に更新

**残存（W3で処理）**
- btnFlows → Runs view へ
- btnTrust → inspector 内へ
- btnSettings + lang → ⚙ nav へ

**topbar after W1**
```
[flow名] [💾] [Flows] [▶] [⏹] [🔒] [⚡▾] [🐉▾] [⚙] [🌐] [●接続]
= 11要素（完了後は W3 で 7 まで削減予定）
```

---

## Wave 2: sidebar 1本化 ✅

**変更点**
- `#palette` (左) + `#inspector` (右) → `#sidebar` (右1本) に統合
- `#sidebar-pal` (parts棚) / `#sidebar-ins` (エッジ設定+dashboard) を `hidden` で切り替え
  - `selectNode()` / `selectEdge()` → `showSideIns()` 呼び出し
  - `deselect()` → `showSidePal()` 呼び出し
- resizer 2本 (`#palResizer` + `#inspResizer`) → 1本 (`#sideResizer`, `--sidew`)
- grid: `var(--palw) 1fr var(--inspw)` → `1fr var(--sidew,280px)`
- `renderInspector()` ターゲット: `#inspector` → `#sidebar-ins`
- `#main-wrap` でviewnav + #app + views をラップ

---

## Wave 3: narrow nav + Runs / Settings view ✅

**変更点**
- `<nav id="viewnav">` (42px, アイコンのみ): 🔧 Builder / 📋 Runs / ⚙ Settings / 🌐 lang
- `viewSwitch(v)` で `#app`, `#view-runs`, `#view-settings` を切り替え
- `renderRunsView()`: flows一覧 (WORKFLOWS) + run history (trustSummary/reputationPanel/auditPanel)
- `renderSettingsView()`: openSettings()内容をインライン化
- topbar削除: `btnFlows`, `btnTrust`, `btnSettings`, `lang` → 7要素に
- Trust check → 🐉▾ dropdown `miTrust` に移動

**topbar after W3**
```
[flow名] [💾] [▶] [⏹] [⚡▾] [🐉▾] [●接続]
```
