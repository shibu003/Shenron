# 11 — Cockpit Roadmap / visual flow-builder（Langflow・n8n を流用）

> 起点：3 参照（Langflow 194k / n8n 100k / Cal.com 32k）= **D&D 視覚ビルダー × open-core × self-host**。
> 方針：cockpit（`prototype/hub/ui.html`）を **「agent を線で配線して保存して走る」builder** に育て、いま別々の **agents・workflows・automations・MCP** を **1 つの視覚面に統合**（docs/08 §1.5 **G2** の実体）。
> 原則：**パターン流用・コード非複製**（philosophy #1）。**zero-dep 維持** → React Flow は概念だけ借り、本体は本番 upgrade 時。
> 更新: 2026-06-16

---

## 0. 参照解析（build に効く要点）

| 参照 | 借りる核 | 出典 |
|---|---|---|
| **Langflow** | flow=`{nodes[],edges[]}` JSON。node に **template(inputs)/outputs**、**typed handle**（`output_types` ∩ `inputTypes` ≠ ∅ で接続可）。実行=**DAG topological sort → vertex 順次 build → 結果を edge で下流へ**。入口=Chat Input、終端=Chat Output。**export-as-API**=`POST /api/v1/run/{id}` ＋ **`tweaks`**（node ごとの field 上書き）。**MCP**=flow を tool 化、input schema を入口 field から導出。**LFX**=JSON 1 枚をステートレス実行 | [import/export](https://docs.langflow.org/concepts-flows-import)・[data-types](https://docs.langflow.org/data-types)・[publish](https://docs.langflow.org/concepts-publish)・[mcp-server](https://docs.langflow.org/mcp-server)・[exec engine](https://deepwiki.com/langflow-ai/langflow/4.4-flow-execution-engine) |
| **n8n** | workflow=`nodes[]`＋`connections`（out→in、JSON 伝播）。**trigger ノード**（Schedule/Webhook）が入口。self-host・per-zap 課金なし | [schedule trigger](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.scheduletrigger/)・[anatomy](https://medium.com/@Quaxel/the-anatomy-of-an-n8n-workflow-3ade4a335266) |
| **Cal.com** | routing forms・team workflows・**open-core（機能を paywall に隠さず source ごと）** | — |
| **React Flow** | `<Handle type=source/target position id>`、`nodeTypes`、`onConnect`/`isValidConnection`。**build 必須＝zero-dep 不可** → 概念のみ流用、vanilla SVG で自前実装 | [custom nodes](https://reactflow.dev/learn/customization/custom-nodes) |

## 1. 採用する最小 flow schema（Langflow を圧縮）

固定 1-in/1-out ポートで handle 文字列を不要化。flow = workflow（trigger 無し）/ automation（trigger ノードあり）。

```json
{
  "id": "sales-to-marketing",
  "name": "...", "summary": "...", "tags": ["..."],
  "nodes": [
    { "id": "trigger", "kind": "trigger", "x": 40,  "y": 80, "trigger": { "type": "manual|schedule|build_state", "when?": "0 2 * * *", "match?": {} }, "out": { "emits": ["*"] } },
    { "id": "sales",   "kind": "agent",   "x": 280, "y": 80, "agent": "linkedin-sales-agent",   "skill": "find-prospects", "in": { "accepts": ["*"] },             "out": { "emits": ["prospects"] } },
    { "id": "mkt",     "kind": "agent",   "x": 520, "y": 80, "agent": "marketing-outreach-agent","skill": "draft-outreach", "in": { "accepts": ["prospects","*"] }, "out": { "emits": ["outreach"] } }
  ],
  "edges": [ { "id": "e1", "source": "trigger", "target": "sales" }, { "id": "e2", "source": "sales", "target": "mkt" } ]
}
```

- **接続可否** = `intersect(source.out.emits, target.in.accepts) ≠ ∅`（`"*"`=ワイルドカード）＝ React Flow の `isValidConnection`。
- **実行** = topo-sort → 各 agent node を hub 経由で run、出力を edge 先の input に渡す（既存 `run_workflow` を線形→DAG に拡張）。trigger node が入口。
- **保存先**：trigger 無し → `workflows.json`（既存）に nodes/edges を併記、trigger あり → `automations.json`。互換のため既存の `steps[]` も導出して残す。

## 2. Wave 計画（A→E。各 Wave＝1〜複数 commit、revertable、verify 付き）

### Wave A — 配線キャンバス（typed ports + edges）✅ DONE
- agent ノードに **in(左)/out(右) ポート**、**port→port ドラッグでエッジ**を引く（node-on-node ドラッグから昇格）。`isValidConnection`= type 交差。エッジは status 色 bezier（既存流用）。
- canvas 上に flow draft（nodes+edges）を保持。
- files: `ui.html`（ports/edges/接続判定）。hub 変更は最小（node 位置の保存任意）。
- **done**: sales→marketing を実エッジで配線、型不一致は弾く、複数ノード連鎖が描ける。
- **実装メモ**: pointer-events で port→port 配線（live rubber-band＋valid 緑/invalid 赤 highlight・elementFromPoint で touch 対応＋edge ラベル＝交差型＋click-to-delete）。**node 移動も実装**（本体ドラッグ=ライブ移動・pointer events・エッジ追従）。HTML5 DnD は撤去し pointer events に統一：他ノード上で離す=**送信**（source は元位置へ snap-back＝旧 drag-to-send UX 維持）、空きで離す=**移動**。配線（port）と policy pill は除外。port 型は **agent の契約**として `prototype/agents/*.json` の `skill.accepts/emits` に置き hub preseed→`/api/state` 露出（既定 `*`）。§1 schema 例の `accepts:["*"]` でなく **具体型**（sales `accepts:[brief] emits:[prospects]`／marketing `accepts:[prospects] emits:[outreach]`）にした＝2 agent だけで「型不一致を弾く」を実証するため（marketing→sales=∅）。flow draft の永続化は Wave B。検証: 接続/拒否ロジックを live `/api/state` で全 ✅（sales→marketing valid・型 "prospects"／marketing→sales 拒否／self 拒否／sales→marketing→reviewer 連鎖 valid）。

### Wave B — flow 保存 + DAG 実行（Langflow export + topo run）
- 「**save as workflow**」→ 配線 DAG を `workflows.json` に保存（hub/MCP 経由）。
- hub/MCP が **flow を topological 順に実行**（`run_workflow` を steps→DAG 拡張、出力→入力を edge で受け渡し）。「**Run**」ボタン→ hub 実行→結果を canvas に可視化（既存 animate/timeline）。
- 各保存 flow を MCP `run_workflow` で露出（入口 node から input 導出）。`tweaks` 風の per-node 上書きも受ける。
- files: `hub.mjs`（保存・topo-run）、`mcp/server.mjs`（flow 実行/ツール化）、`ui.html`（save/run）。
- **done**: UI で組んだ flow を保存→Run→completed、MCP からも同 flow を実行。

### Wave C — trigger ノード → automation（n8n）
- **trigger ノード**（manual/schedule/build_state）を入口に配置・配線。「**save as automation**」→ `automations.json`（trigger＋wired workflow）。manual/`fire_event`/schedule(Trigger.dev seam) で発火。
- files: `ui.html`（trigger palette/node）、`hub.mjs`＋automation 保存、`fire_event` 流用。
- **done**: build_state trigger→chain を UI で組み、event で自動実行。

### Wave D — agent palette + MCP export（Langflow）
- **サイドバー palette**（`search_agents`/MCP）から agent/skill を canvas にドラッグ追加。per-node「**copy MCP call**」、per-flow「**export as MCP tool**」（登録片を表示）。
- files: `ui.html`（palette/export）、`mcp/server.mjs`（search proxy）。
- **done**: palette からノード追加、ノードの MCP 呼び出しをコピーできる。

### Wave E — open-core「kills X」ピッチ（n8n/Cal.com）
- UI でなく **docs/06**：「**BuildHUD kills 手配線 cross-agent glue**」open-core/self-host/no-per-seat ナラティブ。
- files: `docs/06_VISION.md`。
- **done**: pitch 1 枚に反映。

## 3. 既存資産マッピング
- canvas/edges → `prototype/hub/ui.html`（cockpit）
- flow 実行/保存 → `prototype/hub/hub.mjs`（durable inbox＋将来 topo-run）
- flow=workflow/automation → `prototype/mcp/workflows.json` / `automations.json`（nodes/edges を併記、`steps[]` 互換維持）
- MCP 露出 → `prototype/mcp/server.mjs`（`run_workflow`/inbox tools・計 18）
- schedule trigger → `prototype/mcp/trigger/`（Trigger.dev seam・既存）

## 4. 非目標（この roadmap では作らない）
- React Flow 本体導入（build 必要＝zero-dep 破壊。本番 surface 時に）。
- Langflow の per-field template（我々は固定 1-in/1-out で十分）。
- 本物の cross-party 認可（GATE-2・別軸）。
