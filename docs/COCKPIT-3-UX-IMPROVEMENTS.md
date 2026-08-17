# Cockpit-3 UX 改善リスト — デザイン性 × 機能性の磨き

> **方針**: 色は既存で維持。間隔・入力欄・スクロールバー・タイポ・線画・アニメーション・遷移を改善し、操作感を向上させる。
> 
> **実装**: 1 commit で ui2.html / shenron.html / settings.html の CSS を統一・磨き化。HTML・機能は不変。
> 
> **Wave**: Cockpit-3（UX 磨き）の中核・Wave Cockpit-0/1/2 の後続。

---

## 1. Spacing — 間隔の統一化・バランス調整

| 要素 | 現在 | 改善後 | 理由 |
|------|------|--------|------|
| topbar `padding` | 0 14px | 0 16px | 横幅に余裕・呼吸感 |
| button `.tb` | 7px 13px | 6px 12px | より tight・クリック感 |
| input `.nf` | 4px 7px | 4px 8px | 左右バランス |
| label `.nflabel` | 6px 10px 2px | 6px 10px 4px | 上下余白統一 |
| panel `#panel` | padding: 14px | padding: 12px | 詰まり感削除 |
| gap (flex/grid) | 12px → 8px | 統一 8px | 視覚的リズム・コンパクト |

**実装**:
```css
#topbar { padding: 0 16px; }
.tb { padding: 6px 12px; }
.nf { padding: 4px 8px; }
.nflabel { padding: 6px 10px 4px; }
#panel { padding: 12px; }
.tb-actions, .nbody { gap: 8px; }
```

---

## 2. Input — 背景透明化 & 線画ベース

**現在**: 背景 `#0a121b`（薄い白）+ border

**改善**: 背景透明 + `border-bottom` 線画のみ（focus 時に色づく）

```css
/* input field */
#flowName {
  background: transparent;
  border: none;
  border-bottom: 2px solid var(--line);
  border-radius: 0;
  padding-bottom: 4px;
  transition: border-color 0.2s ease;
}

#flowName:focus {
  outline: none;
  border-bottom-color: var(--blue);
}

/* form inputs */
.nf {
  background: transparent;
  border: none;
  border-bottom: 1px solid var(--dim);
  border-radius: 0;
  transition: border-color 0.2s ease;
}

.nf:focus {
  outline: none;
  border-bottom-color: var(--blue);
  color: var(--txt);
}

textarea.nf {
  border: 1px solid var(--dim);
  border-radius: 4px;
}

textarea.nf:focus {
  border-color: var(--blue);
  box-shadow: 0 0 0 2px rgba(91, 155, 209, 0.15);
}
```

---

## 3. Scrollbar — カスタマイズ（webkit + Firefox）

**見た目**: 細い（8px）、dim（`--line` 色）、hover で blue に光る

```css
/* webkit (Chrome/Safari) */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: var(--line);
  border-radius: 4px;
  transition: background 0.2s ease;
}

::-webkit-scrollbar-thumb:hover {
  background: var(--blue);
}

/* Firefox */
* {
  scrollbar-color: var(--line) transparent;
  scrollbar-width: thin;
}
```

---

## 4. Typography — フォント サイズ・weight 微調整

```css
/* ラベル: より subtle */
.nflabel {
  font-size: 10px;  /* 11px → 10px */
  text-transform: uppercase;
  letter-spacing: 0.05em;  /* 0.04em → 0.05em */
  font-weight: 500;
}

/* monospace は明確に */
.nf {
  font-family: ui-monospace, Menlo, monospace;
  font-size: 12px;
}

/* button: weight 上げて視認性 */
.tb {
  font-weight: 500;
  font-size: 13px;
}

/* body: line-height 調整 */
body {
  line-height: 1.5;  /* 1.45 → 1.5 */
}
```

---

## 5. Line Art — 線で視覚的階層を作る

```css
/* panel border: より主張 */
#panel {
  border-left: 2px solid var(--line);  /* 1px → 2px */
}

/* resizer: 可視化 */
#resizer::after {
  background: var(--dim);
  opacity: 0.3;
}

#resizer:hover::after,
#resizer.drag::after {
  background: var(--blue);
  opacity: 0.8;
}

/* node border: 太さ統一 */
.node {
  border: 1.5px solid var(--line);  /* 1px → 1.5px */
}

.node.selected {
  border: 1.5px solid var(--blue);
  box-shadow: 0 0 0 2px var(--blue);
}

/* topbar border: より定義 */
#topbar {
  border-bottom: 1.5px solid var(--line);
}
```

---

## 6. Animation — 状態遷移・ローディング・エラー

### 6.1 既存アニメーション（改善版）

```css
/* flow 線: 速度改善 */
svg .flow {
  stroke-dasharray: 7 6;
  animation: dash 0.5s linear infinite;  /* 0.7s → 0.5s */
}

@keyframes dash {
  to { stroke-dashoffset: -13; }
}

/* node 実行中: より目立つ */
.node.busy {
  border-color: var(--blue);
  animation: busy 0.9s ease-in-out infinite;  /* 1.1s → 0.9s */
}

@keyframes busy {
  0% { box-shadow: 0 0 0 0 rgba(91, 155, 209, 0.4); }
  50% { box-shadow: 0 0 18px 2px rgba(91, 155, 209, 0.8), 0 0 0 1px var(--blue) inset; }
  100% { box-shadow: 0 0 0 0 rgba(91, 155, 209, 0.4); }
}

/* success dot pulse: 穏やか */
.dot.on {
  background: var(--green);
  animation: pulse 2s ease-in-out infinite;  /* 1.8s → 2s */
}

@keyframes pulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(63, 185, 80, 0.6); }
  50% { box-shadow: 0 0 0 6px rgba(63, 185, 80, 0); }
}
```

### 6.2 新規: 待機状態

```css
/* saving state (topbar button) */
.tb.saving {
  animation: saving 1.2s ease-in-out infinite;
  border-color: var(--amber);
  color: var(--amber);
}

@keyframes saving {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}

/* approval badge pulse */
#ckptBadge {
  animation: ckptPulse 2s ease-in-out infinite;
}

@keyframes ckptPulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(199, 147, 56, 0.5); }
  50% { box-shadow: 0 0 0 4px rgba(199, 147, 56, 0); }
}

/* loading spinner (node 加載中) */
.node.loading::before {
  content: '';
  position: absolute;
  top: 8px; right: 8px;
  width: 14px; height: 14px;
  border: 1.5px solid var(--dim);
  border-top-color: var(--blue);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
```

### 6.3 エラー状態

```css
/* error shake */
.node.error {
  animation: shake 0.4s ease-in-out;
  border-color: var(--red);
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-3px); }
  75% { transform: translateX(3px); }
}
```

---

## 7. Transition — Hover & Focus の smooth化

```css
/* button hover: snappy */
.tb {
  transition: all 0.15s cubic-bezier(0.2, 0.8, 0.2, 1);
}

.tb:hover {
  border-color: var(--blue);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px -4px rgba(91, 155, 209, 0.3);
}

/* node hover: lift */
.node {
  transition: all 0.15s ease-out;
}

.node:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 30px -12px rgba(0, 0, 0, 0.8);
}

/* panel slide-in */
#panel {
  animation: panelSlide 0.3s cubic-bezier(0.2, 0.8, 0.2, 1);
}

@keyframes panelSlide {
  from {
    opacity: 0;
    transform: translateX(20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* menu popup: scale + fade */
.menu-pop.open {
  animation: popIn 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
  transform-origin: top right;
}

@keyframes popIn {
  from {
    opacity: 0;
    transform: scale(0.95) translateY(-4px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}
```

---

## 8. Micro-interactions

### Input focus indicator（下線が伸びる）

```css
.nf::after {
  content: '';
  position: absolute;
  bottom: -2px; left: 0;
  width: 0; height: 2px;
  background: var(--blue);
  transition: width 0.3s ease;
}

.nf:focus::after {
  width: 100%;
}
```

### Disabled state

```css
.tb:disabled, button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  transition: opacity 0.2s ease;
}
```

---

## 9. Performance: GPU Acceleration

```css
/* will-change for animations */
.node.busy, .dot.on, svg .flow {
  will-change: transform, box-shadow;
}

.tb:hover {
  will-change: transform, box-shadow;
}
```

---

## 実装チェックリスト

- [ ] ui2.html: spacing / input / scrollbar / animation / transition
- [ ] shenron.html: spacing / input / scrollbar / transition
- [ ] settings.html: spacing / input / scrollbar / typography
- [ ] 色は変更なし（既存 CSS variables 維持）
- [ ] HTML 構造不変（CSS のみ）
- [ ] 全ブラウザで scrollbar 動作確認（webkit + Firefox）
- [ ] animation smoothness 確認（60fps・will-change 有効）

---

## コミット メッセージ案

```
refactor(cockpit-3): UX 磨き — spacing/input/animation/transition 統一化

- spacing: padding/gap を統一・バランス調整
- input: 背景透明化、border-bottom 線画ベース
- scrollbar: webkit/Firefox カスタマイズ
- typography: font-size/weight 微調整
- line-art: border 太さ・層構造を強調
- animation: dash/busy/pulse 改善 + saving/error/loading 新規
- transition: hover/focus smooth化（cubic-bezier 統一）
- micro-interaction: focus indicator / menu popIn

色・HTML・機能は不変。デザイン性 × 機能性で操作感向上。
```

---

## 参考：タイミング関数の統一

- **snappy** (hover/click): `cubic-bezier(0.2, 0.8, 0.2, 1)` — 快速・弾むような
- **smooth** (transition): `ease-out` / `ease-in-out` — 穏やか
- **alert** (error): `ease-in-out` — 衝撃的

