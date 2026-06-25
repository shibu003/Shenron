# 神龍 Canvas 完全リファレンス（ui2.html 操作の正典）

> このドキュメントは **canvas 作業場 `prototype/hub/ui2.html` が扱う記号・ノード・コンポーネント・ポート・線・関係性・状態・操作を一切省略せず**カタログ化したもの。
> これを読めば、memory が無くても canvas を 100% 操作・改修できる。各項目に ui2.html の関数/行を脚注で添える（実装が正・改修時はここを追従する）。
> 表記規約：日本語・**絵文字ゼロ・SVG のみ**・配色は Netdive Blue（`--blue`）系。行番号は目安（改修でずれ得るので関数名を主とする）。

関連：視覚語彙の取り込み計画は `docs/ROADMAP.md` §Wave Canvas-n8n（S1〜S5）。本書はその「正典」。

---

## §0 クイックスタート（最短でフローを作って動かす）

1. **開く**：hub 起動（`node prototype/hub/hub.mjs`）→ ブラウザで `/ui2`。
2. **入口を置く**：topbar「＋追加」→ コンポーネント →（カードを選び inspector で）kind=`Chat Input`。
3. **処理を足す**：「＋追加」→ コンポーネント → kind=`Prompt`（`template` に `{input}` を含める）→ さらに `Chat Output`。
4. **配線する**：ノード**右辺の丸 dot（OUT）**から、次ノード**左辺の矩形タブ（IN）**へドラッグ。線は**左→右＋矢印**で向きが出る（型が合わないと赤＝`#wireTip` が理由を表示）。
5. **設定する**：ノードをクリック→右パネルで各フィールドを編集（§3）。
6. **実行する**：topbar「▶ 実行」。実行中は handoff 線が色＋アニメで進む（§6）。`Chat Output` のカードに結果が出る。
7. **保存/共有**：「保存」→（必要なら）「共有」。`⌘Z`/`⇧⌘Z` で undo/redo、`Del` で選択削除、`/` で検索、`⊞` で自動整列。

> 自動実行にするなら：「＋追加」→ トリガー（§8 のイベントを選択）→ その OUT を最初の処理ノードへ配線。

---

## §1 全体像・レイアウト・座標系

| 領域 | 要素 | 役割 |
|---|---|---|
| topbar（高さ48px） | brand「神龍」/ flowName / 各種ボタン群（§9） | フロー名・保存・実行・追加・遷移 |
| 本体 | `#main-wrap` = `#canvas`（full-bleed）＋ `#resizer`（6px・col-resize）＋ `#panel`（右・Zed-style 可変幅） | キャンバスと「選択中1件の設定」パネル |
| 世界 | `#world`（6000×4200px・ドットグリッド背景）に `transform` で pan/zoom | ノード/線の配置面 |
| 線レイヤー | `svg.links`（`#staticlinks` g ＋ `#tempwire` ＋ `<marker id="arrow">`） | 静的 edge・実行 handoff・配線中プレビュー |
| 空状態 | `#hint`（ノード0件で中央表示） | 「＋追加」への誘導 |
| その他 | `#zoomctl`（右下）/ `#nodeSearch`（上中央）/ `#ctxMenu` / `#toast` / `#modal` / `#cmdk`（⌘K ページ移動）/ `#artifactPanel`（成果物 UI ビューア） | — |

- 座標変換：`canvasPt(e)`（screen→world・pan/zoom 逆算）／`center(id)`・`nodeRect(id)`（world 座標の矩形）。
- ビュー状態：`ZOOM`・`PANX`・`PANY`（`applyView`/`saveView`・localStorage 永続）。
- 描画の起点：`render()` = `placeNodes()`→`renderNodes()`→`applySkipped()`→`drawLinks()`→`renderInspector()`。

---

## §2 ノード基盤4種（`renderNodes`・追加メニュー）

canvas のノードは「基盤4種（agent/trigger/mcp/note）」＋「コンポーネント `comp` の10種（§3）」。基盤4種は別々の配列で保持し、`renderNodes` の各ループで描画。

| 種別 | クラス | 枠色 | アイコン(NIC) | 役割 | 入力(IN) | 出力(OUT) | 追加 | inspector 設定 |
|---|---|---|---|---|:--:|:--:|---|---|
| agent | `.node.agent` | 中立(青系) | `NIC.agent`（人） | エージェント identity（名前・会社・skill・presence・online dot） | ●(`accepts`) | ●(`emits`) | `openAgentPicker`（一覧から配置） | 会社/skill/presence（読取専用）・削除 |
| trigger | `.node.trigger` | amber | `NIC.trigger`（稲妻） | 自動実行の起点（build_state イベント発火） | — | ● | `addTrigger` | event（10種・§8）＋ result（green/red/changes_requested）・削除 |
| mcp | `.node.mcp` | green | `NIC.mcp`（差込） | 外部アクション（MCP server＋tool 呼び出し） | ●(`accepts`) | ●(`emits`) | `addMcpNode` | server→tool カスケード・`auto`（承認自動化）・args(JSON)・削除 |
| note | `.node.note` | 4色 | `NIC.note`（付箋） | 注釈（markdown・**実行されない**・ポート無し） | — | — | `addNote` | text(markdown)・color・削除 |

補足：
- agent カードは **identity のみ**（trust passport / policy / caps は ui2 では非表示）。`online` で `.dot.on`（緑パルス）。pending handoff 数は `.badge`。
- agent の `accepts`/`emits` は backend `publicAgents()` が既定 `['*']` で必ず供給（`hub.mjs:128`）。ゆえに通常 IN+OUT 両方。
- trigger は**入力を持たない**（開始シグナル）。実行時は DAG から除去される（§6.5）。
- mcp は server 未選択/tool 未バインドだと「未設定」表示（`NODE_UNSET`）。`auto:true` で承認フェンスを自動通過。
- note の色：`NOTE_COLORS` = amber / blue / green / grey（各 bg+border）。ダブルクリックでインライン編集。

脚注：`renderNodes`（各 `for` ループ）・追加メニュー `#addMenu`・`addTrigger`/`addMcpNode`/`addNote`/`openAgentPicker`。

---

## §3 コンポーネント `comp` 10種＋unset（`COMP` 定義・`.node.comp`）

> ⚠ 統合計画（§12 / ROADMAP R1）：`prompt`/`languagemodel`/`structured`/`consensus` は実行同一ゆえ **1つの `model` ノード（mode param）に集約**、`input`/`output` は **廃止**予定。下表は現状。

`comp` ノードは1つの器で、`kind` を inspector のセレクタ（`setCompKind`）で切り替える。`kind` ごとに `accepts`/`emits`（ポート型）とフィールド（in-card 設定）が変わる。`emits:[]`=終端・`accepts:[]`=入口。

| # | kind | label | accepts | emits | IN | OUT | フィールド（型・既定） | 説明 |
|---|---|---|---|---|:--:|:--:|---|---|
| 1 | `input` | Chat Input | `[]` | `[text,*]` | — | ● | `text`(textarea・空→Run入力) | フローの入力テキスト |
| 2 | `prompt` | Prompt | `[*]` | `[text,*]` | ● | ● | `template`(textarea・`{input}`=前段) | テンプレートで文面を組む |
| 3 | `consensus` | Consensus | `[*]` | `[consensus,*]` | ● | ● | `vendors`(claude,codex,gemini)・`prompt`(textarea) | 複数 vendor の合意（medoid 投票） |
| 4 | `output` | Chat Output | `[*]` | `[]` | ● | — | （なし・実行後 `lastOutput` 表示） | 最終結果を表示（終端 sink） |
| 5 | `languagemodel` | Language Model | `[*]` | `[text,*]` | ● | ● | `model`(select: claude/codex/gemini/stub)・`system`(textarea) | LLM 呼び出し（system+入力・in-process） |
| 6 | `structured` | Structured Output | `[*]` | `[json,*]` | ● | ● | `schema`(カンマ区切)・`instructions`(textarea) | LLM に JSON 構造で出力させる |
| 7 | `parser` | Parser | `[*]` | `[text,*]` | ● | ● | `pattern`(textarea・`{input}`) | 文字列整形（**LLM 不使用**の純変換） |
| 8 | `router` | Router | `[*]` | `[*]` | ● | ●(1ポート/2レーン) | `predicate`(redacted/clean/contains/always)・`value`(contains 用) | 条件で **then/else に分岐**。OUT は1ポートだが各出力 edge が `then`/`else` を持ち（`e.branch`・edge inspector で切替）、S1 は右辺の上(then)/下(else)レーンに描き分け。採用されない枝は実行時 skip（§6.5） |
| 9 | `workflow` | Sub-flow | `[*]` | `[*]` | ● | ● | `ref`(保存済みフロー選択) | 保存済みフローを1ノードとして**ネスト実行** |
| 10 | `langflow` | Langflow | `[*]` | `[*]` | ● | ● | （取込時に決定・`_lfType`保持） | Langflow 由来コンポ（`/v1/run` で実行・fenced） |
| — | `unset` | （未設定の空ノード） | `[*]` | `[*]` | ● | ● | inspector で kind を選ぶまで未確定 | `addComp('')` で生成・kind 選択待ち |

補足：
- kind 変更時は `setCompKind` が `accepts`/`emits` とフィールドを差し替え、`revalidateEdges` で型不一致になった edge を自動切断（toast 通知）。人間がつけた `name`/`desc` は引き継ぐ。
- カード表示名は `config.name` →無ければ label →未設定なら「未設定」。`output` は実行後に `lastOutput` のプレビューを `.co` に表示。
- `tier`（cheap/strong）が付くと `.tier-badge` 表示（Wave G・per-node model routing）。

脚注：`COMP`（定義）・`addComp`・`setCompKind`・`revalidateEdges`・`inlineField`（in-card フィールド描画）。

---

## §4 アイコン体系（SVG・枠色連動）

- ジェネレータ `NI(pathStr, size=15)` … `viewBox="0 0 24 24" fill="none" stroke="currentColor"`（=枠/文字色に連動）で SVG を組む。
- 基盤アイコン辞書 `NIC`（path 文字列）：`agent`（人）/`trigger`（稲妻）/`mcp`（差込プラグ）/`note`（付箋）/`wire`（鎖：配線 inspector）/`skill`（書類）/`del`（ゴミ箱）。
- コンポーネントは各 `COMP[kind].svg`（`NI(...)` 済み）：input/output（吹き出し）・prompt（書類）・consensus（二重チェック）・languagemodel（チップ）・structured（波括弧）・parser（行＋矢印）・router（分岐矢印）・workflow（立方体）・langflow（鎖）。
- サイズ規約：カード内 14px・inspector ヘッダ 15px（`inspHead`）。**絵文字は使わない**（全て inline SVG）。

脚注：`NI`・`NIC`・`COMP[k].svg`。

---

## §5 ポート/ハンドル（IN/OUT・型契約）

**S1（n8n化）で固定 I/O ポートを描画**（旧 C1「floating」設計＝相手の辺へ浮動、を逆転）：
- **出力ポート `.port.out`**：ノード**右辺**中央の**丸 dot**（n8n の出力 dot）。`emits.length>0` のノードに出る。**配線の起点**（pointerdown→`startWire`）。
- **入力ポート `.port.in`**：ノード**左辺**中央の**角丸矩形タブ**（n8n の入力矩形）。`accepts.length>0`（trigger 除く）に出る。**drop 専用**（起点にならない）。
- `.portlabel`：型名ラベル枠（S1 未使用・S5 の AI ◆ ポートで型名表示に使う予定）。

ポート有無の判定（`renderNodes` 各ループ・`hasPort(arr)=(arr||['*']).length>0`・`portHTML(hasIn,hasOut)`）：
| ノード | IN | OUT |
|---|---|---|
| agent | `hasPort(a.accepts)` | `hasPort(a.emits)` |
| trigger | なし | 常に有（開始点） |
| mcp | `hasPort(mn.accepts)` | `hasPort(mn.emits)` |
| comp | `hasPort(c.accepts)` | `hasPort(c.emits)`（input→OUT のみ・output→IN のみが自動） |
| note | なし | なし |

**型契約（接続可否）**：
- `canConnect(src,tgt)`：`tgt` が trigger/note なら不可、自己ループ不可、`emits ∩ accepts`（`*` はワイルドカード）が空でなければ可。
- `matchType(src,tgt)`：edge に保存する型を決定（共通の具体型→ `*` 側→ `*`）。線色（`typeColor`）とラベルに反映。
- 配線中は `#wireTip`（ok=緑/bad=赤/中立=青）で可否と理由を表示（`wireMessage`）。

脚注：CSS `.port`/`.port.in`/`.port.out`/`.portlabel`・`portHTML`/`hasPort`・`canConnect`/`matchType`/`wireMessage`。

---

## §6 線（edge）の視覚語彙

`drawLinks` が `#staticlinks` に SVG を流し込む。線は5系統：

| 線種 | 見た目 | 意味 | 由来 |
|---|---|---|---|
| データ edge | 実線 bezier（`fpath`）＋**矢印 ▶（marker-end）**＋source 端の小丸＋型ラベル箱・色=`typeColor(type)` | source→target のデータ供給 | `EDGES` |
| fenced edge | amber・**破線 `6 3`**（＋strip 件数ラベル） | data-firewall/passport が掛かる配線 | `e.share` / dry-run preview |
| router 分岐 | then=青 / else=灰・`then: / else:` ラベル | 条件分岐の枝 | `e.branch` |
| handoff（実行中） | `STC` 色・active は流れる破線アニメ（`.flow`）・Q/T 曲線 | live run の各 hop 状態 | `state.handoffs`（直近50） |
| tempwire（配線中） | green(可)/red(不可)/blue(中立)・`.tw` 破線（`6 5`） | ドラッグ中のプレビュー | `updateTemp` |

- **方向の明示（S1）**：データ edge は source 右 → target 左へ走り、target 端に**矢印**（`<marker id="arrow" fill="context-stroke">`＝線色追従）。
- **typeColor パレット**：型文字列をハッシュして8色（`TYPE_PALETTE`）に割当・`*`/未知 = 灰 `#9ca3af`。
- **handoff ステータス色 `STC`**：submitted=灰／awaiting_approval=amber／approved・running=青／completed=緑／failed・rejected=赤。`FLOW` 集合（submitted/awaiting_approval/approved/running）が「進行中」。
- edge クリック領域は不可視の太線 `.hit`（`stroke-width:15`）→ クリックで edge inspector（§9）。

脚注：`drawLinks`・`fpath`・`typeColor`/`TYPE_PALETTE`・`STC`/`FLOW`・`updateTemp`・marker `#arrow`。

---

## §6.5 ノード間の「関係性」の扱い（接続・依存・実行順・分岐・合流・信頼境界）

edge は単なる線でなく **DAG の依存辺**。編集時（canvas）と実行時（runner=`hub.mjs`）で関係性がどう扱われるか：

- **方向と意味**：edge = `source.emits → target.accepts`（データ供給）。型は `matchType` で確定し `edge.type` に保存→線色に反映。`canConnect` が不正接続（型不一致・自己ループ・trigger/note への流入）を**編集時に拒否**。
- **実行順＝トポロジカル**：edges から入次数(indeg)を数え、入次数0から発火（`hub.mjs` の indeg/queue）。**entry** = trigger 以外で入辺の無いノード。**sink** = 出辺の無い出力ノード。
- **発火条件（依存解決）**：あるノードは**全入辺が settled（出力済 / dead / skipped）かつ少なくとも1本 live** になった時に発火（`tryFire`）。
- **合流（merge・多→1）**：複数入辺の上流出力を `\n\n` で連結して渡す（`liveIn.map(fenceEdge).join('\n\n')`）。`{input}` はこの連結テキストに置換（`parseFmt` / prompt template）。
- **fan-out（1→多）**：1つの OUT から複数 edge を引ける＝同じ出力を複数下流へ。S1 の固定 OUT dot から複数線で表現。
- **分岐（router）**：`predicate` が then/else を決定。採用されない枝の edge は **dead**、その先のノードは **skipped**（`markDead`/`markSkipped`）。UI は `applySkipped` で skipped ノードを灰（`.skipped`）表示。枝の別は `e.branch`（then/else・S1 では右辺の上下レーンに振り分けて描画）。
- **信頼境界の関係性**：cross-company edge は通過時に **data firewall（`redact`）＋ capability passport（external_send mode・pass allowlist）＋承認フェンス**が掛かる（`fenceEdge`/`sendMode`）。該当 edge は fenced（amber 破線）。dry-run で strip 件数を edge ラベルに出す。
- **入れ子（sub-flow）**：`workflow` ノードは保存済みフローを1ノードとして**ネスト実行**＝フロー間の関係性。
- **trigger の関係性**：trigger は実行前に DAG から除去され、データ辺でなく「開始シグナル」。配線上は automation の起点として agent/comp の IN へ繋ぐ。
- **二層の edge**：静的 edge（`EDGES`・設計）と実行時 edge（`state.handoffs`・hop 状態）は別レイヤーで重ねて描画。

```
entry ──type──▶ prompt ──┐
                          ├─(merge: 複数入力を \n\n 連結)─▶ output (sink)
router ─then─▶ A ─────────┘
       └else─▶ B    ← predicate が else を採らなければ B は skipped(灰)・辺は dead
```

脚注：`hub.mjs` の `advanceFrom`/`tryFire`/`fireNode`/`markDead`/`markSkipped`/`fenceEdge`/`sendMode`、ui2 の `canConnect`/`matchType`/`applySkipped`。

---

## §7 ノード/接続の状態クラス（見た目で状態が分かる）

| クラス | 見た目 | 状態 |
|---|---|---|
| `.selected` | 青枠＋グロー | 選択中（inspector 表示） |
| `.busy` | 青パルスアニメ | 実行中（running/approved の handoff あり） |
| `.multi` | amber リング | shift+クリックの複数選択（sub-flow 化用） |
| `.collapsed` | 本体（`.nbody`）折畳・ヘッダのみ | 個別折りたたみ（B1） |
| `.skipped` | 灰＋グレースケール・不透明度↓ | router が採らなかった枝（§6.5） |
| `.wtarget` / `.wbad` | 緑/赤アウトライン | 配線 drop 先の可否ハイライト |
| `.search-hl` | amber グロー | ノード検索ヒット |
| `.dot.on` | 緑パルス | agent online |

脚注：CSS `.node.*` 各クラス・`render()` 内のトグル・`applySkipped`。

---

## §8 トリガー語彙（build_state イベント DSL）

trigger は backend の build-state IR を購読。inspector で **event** と（あれば）**result/status** を選ぶ。

- **イベント `EV_LABEL`（10種）**：`pr_opened`（PRが開かれた）/ `pr_merged`（マージ）/ `review_completed`（レビュー完了）/ `ci_passed`（CI通過）/ `test_red`（テスト失敗）/ `rc_built`（RC生成）/ `deploy_green`（デプロイ成功）/ `deploy_failed`（デプロイ失敗）/ `issue_filed`（Issue登録）/ `release_tagged`（リリースタグ）。
- **結果 `RESULT_LABEL`**：`green`（OK）/ `red`（NG）/ `changes_requested`（変更依頼）。
- **match DSL**：`BUILDSTATE.events`/`BUILDSTATE.operators`（no-eval・安全演算子）。`triggerSummary(match)` が人間語の要約をカードに出す。
- カスタムイベント（一覧に無い event）も入力可（`trig_custom`）。

脚注：`EV_LABEL`/`RESULT_LABEL`/`BUILDSTATE`/`triggerSummary`・inspector の trigger 分岐（`inspNode`）。

---

## §9 操作（インタラクション）一覧

**ノード**
- 本体ドラッグ＝移動（`nodeDrag`）。
- **OUT dot からドラッグ＝配線**（S1 の主経路・`startWire`）。rim（縁：上7px・他辺13px `nearRim`）ドラッグも配線（後方互換 fallback）。
- クリック＝選択（右パネルに設定）。**shift+クリック＝複数選択**（`toggleMulti`）。
- note のみ**ダブルクリックでインライン編集**。
- 右クリック＝コンテキストメニュー（`#ctxMenu`：複製 / 設定を開く / 削除）。

**配線（edge）**
- OUT→（相手ノードのどこでも＝ノード全体が drop zone）。可否は `#wireTip` と `.wtarget/.wbad`。
- edge クリック（`.hit`）＝ edge inspector（接続表示・router なら then/else・削除）。

**キャンバス**
- 空ドラッグ／トラックパッド2本指＝pan。⌘/Ctrl+wheel＝カーソル中心 zoom。
- `#zoomctl`：`−` 縮小 / `100%`（クリックでリセット）/ `＋` 拡大 / `⤢` 全体表示(`fitView`) / `⊞` 自動整列(`autoLayout`)。

**キーボード**（`keydown`）
- `/` または `⌘/Ctrl+F`＝ノード検索（`showNodeSearch`）。
- `Esc`＝配線取消／選択解除／検索・メニュー閉じ。
- `⌘/Ctrl+Z`＝undo、`⇧⌘/Ctrl+Z`＝redo。
- `Delete`/`Backspace`＝選択ノード/edge を削除（入力中は無効）。
- `⌘/Ctrl+K`＝ページ移動パレット（`#cmdk`）。

**topbar / メニュー**
- フローを開く（`showFlows`）／神龍で作る（`/shenron`）／保存（`saveFlow`）／共有（`toggleShare`）／▶実行（`runFlow`）／■停止（`stopRun`・実行中のみ表示）／承認待ちバッジ（`#ckptBadge`→`openApprovals`）／↩↪ undo/redo。
- **＋追加**（`#addMenu`）：エージェント… / トリガー / MCPツール / コンポーネント / メモ / JSON を取り込む（`importJSON`）。
- 成果物（`openArtifact`：sandbox iframe で JSX レンダリング）／成果物一覧（`/artifacts`）／設定（`/settings`）／玄関（`/`）。

**右パネル inspector**（`renderInspector`/`inspNode`/`inspEdge`）
- ノード種別ごとの編集フォーム（§2/§3 のフィールド）。
- edge エディタ：接続（source→target 表示）・router 分岐（then/else・`#edBranch`）・削除（`#edDel`）。

脚注：`attachNode`/`startWire`/`toggleMulti`、`keydown` ハンドラ、`#zoomctl`、`#addMenu`、`renderInspector`/`inspNode`/`inspEdge`/`bindEdge`。

---

## §10 データモデル & 永続化

> ⚠ 本節の**5配列断片化は frontend だけ**の事情で、保存 JSON・backend は既に単一 `nodes[]`。統一（`NODES[]`）計画は §12 / `docs/ROADMAP.md` R0。

- **状態配列**：`state.agents`（backend 由来）/ `TRIGGERS` / `MCP_NODES` / `COMPONENTS` / `NOTES` / `EDGES`（＋`HIDDEN`・`POS`位置・`COLLAPSED`）。
- **edge 形**：`{ id, source, target, type, branch?, share? }`（`tryConnect` で生成・`matchType` で type 決定）。
- **スナップショット**：`canvasSnap()` が上記を JSON 化。`undoSnap`/`undo`/`redo`（`UNDO_STACK`/`REDO_STACK`・最大50）。
- **保存/読込**：`saveFlow`→`/api/workflows`、`loadFlow(w)`（ノード/エッジ復元・`edgeSpecOf` で直列化）。
- **取込**：`importJSON`（神龍 flow JSON / Langflow flow JSON `importLangflowFlow` を判別）。
- **共有**：`toggleShare`（保存後に庫へ可視性変更）。
- backend 不変：runner（`advanceFrom` 系）は EDGES の意味（source→target データ供給）だけを見る。**ポートの形/線種/アイコンは描画のみ**で実行意味に影響しない。

脚注：`canvasSnap`/`undoSnap`/`undo`/`redo`・`saveFlow`/`loadFlow`/`edgeSpecOf`・`importJSON`/`importLangflowFlow`。

---

## §11 n8n 視覚語彙との対応（取り込みの地図）

n8n の「分かりやすさ」の正体＝**接続種別を色でなく形で表す**（公式裏取り済み）。神龍 canvas への対応：

| n8n の語彙 | 形 | 神龍での実現 |
|---|---|---|
| 出力ポート（右） | グレー丸 dot / 未接続なら Add node(+) | `.port.out`（S1）／+ボタン（S4） |
| 入力ポート（左） | グレー矩形 | `.port.in` 矩形タブ（S1） |
| 接続 | 実線＋矢印（左→右） | データ edge＋`marker-end`（S1） |
| ノード形 | trigger=左丸D字+稲妻 / 通常=角丸四角 / AI sub-node=円 | trigger 形＋稲妻（S3）／AI 円（S5） |
| AI 接続（cluster） | 破線・ダイヤ◆・型ラベル・root にぶら下げ | 破線（S2）＋◆底接続（S5） |
| フロー制御 | IF=2出力(true/false)・Switch=N出力・Merge=多入力1出力・Loop=done/loop | router=then/else 2レーン（S1〜S3）・merge は多入力連結（§6.5） |

**n8n cluster の9接続型**（`NodeConnectionType`）と神龍 kind の対応（拡張余地の地図）：

| n8n 接続型 | 役割 | 神龍の現状 |
|---|---|---|
| `ai_languageModel` | LLM 本体 | `languagemodel`（カバー済） |
| `ai_outputParser` | 出力整形 | `parser` / `structured`（カバー済） |
| `ai_memory` | 会話記憶 | 未（将来：◆ラベル語彙拡張で対応） |
| `ai_tool` | エージェントの道具 | 部分（mcp ノードが近い） |
| `ai_embedding` / `ai_vectorStore` / `ai_document` / `ai_textSplitter` / `ai_retriever` | RAG 系 | 未（拡張余地） |

> 取り込みは色でなく形（dot/矩形/◆・実線+矢印/破線・3ノード形）が核心。既存データ（`accepts`/`emits`/`kind`/`branch`）から導出して描けば足り、backend/データモデルは不変。詳細手順は `docs/ROADMAP.md` §Wave Canvas-n8n（S1 済／**W1〜W4**＝旧 S2〜S5）。**ただし視覚を「追加」する前に、まず大統合リファクタ（§12）で土台を整える**のが確定方針。

---

## §12 大統合リファクタの方向（現状 → 目標・**未実装**／正本＝`docs/ROADMAP.md` R0〜W4）

> 本書 §1〜§11 は**現状**の正典。本節だけは**目標（これから作る姿）**を記す。n8n を精読すると神龍 canvas は**捨てる/統合すべき要素**を抱える＝視覚言語を「追加」して併存させるより、**少数の大きな部品へ refactor し、細粒度は inspector＋AI サブノードに逃がす**方が良い、というのが結論。

**🔑 決定的発見**：**backend と保存形式は既に統一済み**＝runner `fireNode` はフラットな `node.kind` 1本でディスパッチ、保存 JSON も単一 `nodes[]`（§10・hub.mjs L526-544/L340-349）。**二重タクソノミーの混乱は frontend（ui2.html）だけ**＝5配列・5レンダー・5分岐 inspector に断片化（§10）。さらに `prompt`/`languagemodel`/`structured`/`consensus` は**実行が同一**（全部 `firePromptNode`）、`input`/`output` は実行時ほぼ no-op。→ **frontend 統一は挙動・保存形式不変でできる（低リスク）**。

### 12.1 frontend モデル：5配列 → 単一 `NODES[]`（R0・behavior-preserving）
| 現状（§10） | 目標（R0） |
|---|---|
| `TRIGGERS`/`MCP_NODES`/`COMPONENTS`/`NOTES` の4配列＋`state.agents` | 単一 `NODES[]`＋agent は `state.agents` の **projection**（`allNodes()`）で合流 |
| `renderNodes` の5ループ（§2/§3） | 1ループ `renderNode(n)`＋`CARD[kind]` テーブル（出力 HTML は不変） |
| `inspNode` の5分岐 if（§9） | `INSPECT[kind]` ディスパッチテーブル |
| `canvasSnap`/`undoApply` が5配列を個別に（§10） | `{NODES,EDGES,HIDDEN,POS}` 一括 |
| ID counter `tidc/cidc/mnidc/noidc` | 単一 `nextId(kind)` |
| `nodeSpecOf`/`loadFlow` の kind 別分岐 | `SPEC[kind]` テーブル（**保存 JSON は byte 不変**） |

### 12.2 kind 統合：10種 → 約6種（R1・大きな部品化）
| 現状 kind（§3） | 目標 | 備考 |
|---|---|---|
| `prompt` / `languagemodel` / `structured` / `consensus` | **`model`（1ノード）** ＋ `mode`＝`plain`/`system`/`structured`/`consensus` | 実行は元々同一。mode＋`vendor/model/tier` は inspector パラメータ＝**細粒度は NDV に逃がす** |
| `input` / `output` | **廃止** | 実行時 no-op。trigger=入口・末端ノード出力=結果（n8n 式）。runner は pass-through 後方互換 |
| `parser` | 維持 | 唯一の非LLM文字整形 |
| `router` / `mcp` / `workflow` / `langflow` | 維持 | 制御/外部副作用/サブフロー/外部由来 |
| 基盤 `agent` / `trigger` / `note` | 維持 | **agent＝遠隔/durable/承認/passport の重い identity**、`model`＝in-process LLM＝二極に整理 |

- **後方互換**：旧 workflows.json は **load 時 alias** で開く＝`KIND_ALIAS={languagemodel:['model',{mode:'system'}],structured:['model',{mode:'structured'}],consensus:['model',{mode:'consensus'}],prompt:['model',{mode:'plain'}]}`。runner も旧 kind を alias 実行（R2）。

### 12.3 細粒度の置き場（n8n NDV モデル）
canvas は**大きい部品で簡潔**に、n8n 並みの細かさは **inspector の深いパラメータ**（Model の mode/vendor/model/tier/schema 等）＋ **AI サブノード◆クラスタ**（W4）に担保。

### 12.4 backend 整理（R2・frontend の後）
handoff `h.kind` 統一・`fireXNode` template＋`fireNode` dispatch table・`steps[]` 撤去・trigger-filter/vendor-resolve/trust dedup・HTTP route table。**MCP-first 公開・trust 層の意味・保存 JSON は不変**。**精密な実装 Wave は `docs/ROADMAP.md` の `### R2-B 共通アンカー＋検証`＋`B1〜B8`**（触る関数・行・差分・`--vendor stub` headless 検証・依存順）。

### 12.5 不変条件（refactor 全体）
MCP-FIRST（`agentTools`/`mcpDispatch`/`/api/shenron/skill`）・trust 層（firewall/passport/承認/cross-company）・保存 JSON 後方互換・`test_nodes.mjs` green・絵文字ゼロ・SVG のみ・Netdive Blue。

> 実装順序・各 Phase の触る関数/行/コード差分/検証は `docs/ROADMAP.md` の **R0 → R1 → R2 → W1〜W4 → QW** を正本とする。本節が実装されたら §2/§3/§5/§10 を統一モデル・`model` ノードで追従更新する。

---

### 改修時のチェックリスト
- ノード種別を足したら：§2/§3 の表・`COMP`（または基盤配列）・`test_nodes.mjs` の分類・本書を同時更新。
- 線種/状態を足したら：§6/§7・`drawLinks`/CSS・本書を更新。
- 関係性（実行意味）を変えたら：§6.5・`hub.mjs` の runner・本書を更新（backend 不変が原則・描画のみで足りるか先に確認）。
