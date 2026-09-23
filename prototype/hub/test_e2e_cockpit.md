# test_e2e_cockpit — cockpit 多ターン相談の実ブラウザ回帰（手動 E2E 手順書）

**目的**: PC2「回答蒸発バグ」（多ターンで前の回答が brief から消える）の **3 層番兵の最上段＝実 UI** を回帰する。
下2層は自動化済み — `test_cockpit.mjs`(client `pairChoices` 単体・T2) と `test_planflow_http.mjs`(HTTP `mergeBrief` 蓄積・T0)。
本手順は Alpine 配線（クリック→`clarifyChoices`→`submitClarify`→再 POST→`plan.brief` 再描画）が実ブラウザで繋がっていることを人手で確認する。

**なぜ .md（自動 .mjs でない）か** — ponytail: `playwright` を devDep に入れず、MCP ブラウザツール（`/browse` skill ＝ project 方針／または `mcp__playwright__browser_*`）で駆動するので **新 dep ゼロ**。
CI 自動化は scope 外。**skip-record トリガ**＝「playwright を devDep に入れる判断が出たら本手順を `test_e2e_cockpit.mjs` 化（snapshot を assert 化）」。

**driver 不在時** — 実ブラウザ（Chromium / 接続済み MCP ブラウザ）が無いセッションでは click-through は実行せず、下記「静的 smoke」だけを回す（HTTP 層は緑＝裏骨は健全、Alpine 描画のみ未確認と faithful に記録）。

---

## 0. 決定論セットアップ（mock planner seam = T0）

実 LLM を呼ばず planner 出力を固定する。queue は planFlow 1回ごとに 1 shift（枯渇→最後を再利用）。

```bash
cat > /tmp/e2e-mock.json <<'JSON'
[
  {"clarify":[{"question":"対象は誰?","options":["社内","社外"]}]},
  {"clarify":[{"question":"頻度は?","options":["毎日","週次"]}]},
  {"clarify":[{"question":"頻度は?","options":["毎日","週次"]}]},
  {"steps":[{"action":"日報を要約して送る","kind":"prompt"}]}
]
JSON
STATE_DIR=$(mktemp -d) SHENRON_MOCK_PLANNER=/tmp/e2e-mock.json \
  node prototype/hub/hub.mjs --port 8807 --vendor mock --no-autospawn
# → http://localhost:8807/shenron を開く
```

queue 対応: ①submitWish→clarify(対象) ②「社内」+再プラン→clarify(頻度) ③「もっと詰める」→clarify(頻度・再掲) ④「毎日」+再プラン→plan(steps)

## 1. 静的 smoke（ブラウザ不要・毎回必ず緑であるべき裏骨）

```bash
curl -s -o /dev/null -w '%{http_code}\n'            http://localhost:8807/shenron           # → 200
curl -s -w ' %{content_type}\n' -o /dev/null        http://localhost:8807/cockpit-logic.mjs # → 200 application/javascript（T2 module bridge）
curl -s -X POST http://localhost:8807/api/shenron/plan \
  -H 'content-type: application/json' -d '{"goal":"日報を自動化"}' | grep -o '"mode":"clarify"'  # → 一致
```

これが緑なら「cockpit は配信され・module 橋は載り・mock seam は clarify を返す」＝Alpine 描画以外は健全。

## 2. 実ブラウザ手順（MCP ブラウザツール / `/browse` で駆動）

各ステップ＝[操作] → [期待（snapshot / テキストで確認）]。要素は `prototype/hub/shenron.html` 実体に対応。

1. **navigate** `http://localhost:8807/shenron`
   → 上部に WISH `<textarea x-model="goal">`（「実現したいこと」）と計画モデルバッジが見える。
2. **WISH に入力** `日報を自動化したい` → **「神龍に相談」ボタン**（`@click="submitWish()"`）をクリック
   → clarify パネル（`x-show="plan.mode === 'clarify'"`）が出て、質問 **「対象は誰?」** と選択肢ボタン `社内` `社外` が描画される。
3. **「社内」をクリック**（`@click="clarifyChoices[qi] = opt"` でハイライト）→ **「↩ 再プラン」**（`submitClarify()`）
   → 次の質問 **「頻度は?」** に変わり、**brief パネル**（`x-if="plan.brief.confirmed.length"`）に **「✓ 対象は誰?: 社内」** が出る。
   → **これが回帰の本丸**：1ターン目の回答が server `mergeBrief` に蓄積され UI に再描画＝蒸発しない。
4. **「もっと詰める」**（`submitClarify(true)` ＝ 空選択でも可）をクリック
   → clarify のまま（「頻度は?」再掲）で、**brief の「✓ 対象は誰?: 社内」が維持**される（deepen で確定要件を捨てない）。
5. **「毎日」をクリック** → **「↩ 再プラン」**
   → plan パネル（`x-show="plan.mode !== 'clarify'"`）に遷移＝要約テキスト（`x-text="plan.summary_text"`）と保存/実行ボタンが出る。
   → brief には **「✓ 対象は誰?: 社内」「✓ 頻度?: 毎日」の2件**が揃う（多ターンの全回答が保持）。

**合格条件**: 手順3で brief に前回答が出る・手順4で維持される・手順5で2件揃ったまま plan に遷移する。
1件でも消えたら PC2 回帰（client `pairChoices` か HTTP `mergeBrief` を疑う＝下2層テストを先に確認）。

### mode 駆動 panel（#3 と整合・確認事項）
cockpit は `plan.mode` で panel を切替える: `clarify`→質問パネル / `!=='clarify'`→plan パネル / `!=='unavailable'`→保存域。
T4 の #3 で plan 応答に `mode:'plan'` が明示で乗ったが、plan パネルは `!=='clarify'` 判定ゆえ挙動不変（undefined でも 'plan' でも同じ）＝#3 は UI を壊さない。

## 3. faithful 記録
- 本セッションで実行できたのは **§1 静的 smoke のみ（緑）**。§2 click-through は実ブラウザ未接続のため **未実施**。
- ブラウザ復帰後（`/browse` 可能時）に §2 を実走し、本節を「§2 実行済・全ステップ pass」に更新する。
