# Remote MCP 実装 — Claude.ai モバイルから神龍を発動

branch: `remote-mcp`

## 目標

Claude.ai (mobile) を AI として、Shenron を MCP ツールとして使う。  
API キー不要、Mac 不要、Claude.ai のサブスクで完結。

## Wave 構成

### Wave C1 — hub に Remote MCP エンドポイント追加

**ファイル**: `prototype/hub/hub.mjs`  
**ゴール**: Claude.ai が接続できる SSE + POST エンドポイントを追加

追加するエンドポイント:
- `GET /mcp/sse` — SSE ストリーム（Claude.ai がここに接続）
- `POST /mcp/messages` — tool call を受け取り JSON-RPC 2.0 で応答

公開する MCP ツール:

| tool | input | 動作 |
|------|-------|------|
| `plan_flow` | `{goal}` | 目標 → plan IR |
| `build_flow` | `{plan}` | plan IR → DAG JSON |
| `run_workflow` | `{id, confirm?}` | 保存済みフロー実行 |
| `list_workflows` | `{}` | フロー一覧 |
| `gen_component` | `{what}` | 不足ツール生成 |
| `get_checkpoint` | `{}` | browser承認待ち取得 |
| `resolve_checkpoint` | `{id, allow}` | モバイルから承認/拒否 |

**verify**: `curl http://localhost:8795/mcp/sse` → SSE 接続確立  
**verify**: Claude Desktop で `http://localhost:8795/mcp/sse` 登録 → tools/list 応答

---

### Wave C2 — STATE_DIR 対応

**ファイル**: `prototype/hub/hub.mjs`  
**ゴール**: JSON 状態ファイルのパスを env で上書き可能に（クラウド volume 対応）

```js
const STATE_DIR = process.env.STATE_DIR || new URL('.', import.meta.url).pathname;
// inbox.json, workflows.json, components.json, integrations.json, automations.json
// hub-key.pem の 6 ファイル分、パス構築を STATE_DIR ベースに変更
```

**verify**: `STATE_DIR=/tmp node hub.mjs` → `/tmp/inbox.json` に書き込まれる

---

### Wave C3 — Dockerfile

**ファイル**: `prototype/hub/Dockerfile`（新規）

```dockerfile
FROM node:20-bookworm-slim
RUN apt-get update && apt-get install -y python3 --no-install-recommends \
    && npm install -g @playwright/mcp@latest \
    && npx playwright install chromium --with-deps \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY . .
VOLUME /data
ENV STATE_DIR=/data PORT=8795
EXPOSE 8795
CMD ["node", "prototype/hub/hub.mjs"]
```

**verify**: `docker build -f prototype/hub/Dockerfile . -t shenron && docker run -p 8795:8795 shenron`

---

### Wave C4 — Railway デプロイ + モバイル接続テスト

**ゴール**: HTTPS URL を Claude.ai に登録してモバイルから `plan_flow` を呼ぶ

```bash
# Railway
railway init && railway up
# → https://shenron-xxxx.up.railway.app
```

Claude.ai Settings → Integrations → Add:
```
https://shenron-xxxx.up.railway.app/mcp/sse
```

**verify (mobile)**:
1. Claude.ai でツール一覧に `plan_flow` が表示される
2. 「毎週月曜に Slack レポートを投稿したい」→ Claude が `plan_flow` を呼ぶ
3. `resolve_checkpoint` でモバイルから承認できる

---

## 現在地（2026-06-21 更新・main に統合済）

- [x] C1: Remote MCP エンドポイント（`/mcp/sse` + `/mcp` + `mcpDispatch`・main 6950f9f）
- [x] C2: STATE_DIR 対応（6950f9f）
- [x] C3: Dockerfile（6950f9f）
- [x] **CORS + cloud LLM 分岐**（eeaf22a）: `json()` に `access-control-allow-origin:*`／`runner.mjs` が `ANTHROPIC_API_KEY` あれば直 API・無ければ `claude -p`
- [x] **act route 認証**（02d7a9a）: `bearerOk` = OAuth token or `A2A_SHARED_TOKEN`・`/api/*` POST をゲート・内部 caller(server/worker) は SHARED 送出
- [ ] C4: **ngrok 経路で実施中（Railway は見送り）** ＝ ローカル hub を ngrok で公開し claude.ai モバイルから。`claude -p` で**従量0**維持。

## 到達性の選択肢（従量0 優先・コスト判断の記録）

「claude.ai を AI に hub を実行エンジンに」を満たす経路は3つ。**課金が出るのは C だけ**。

| | AI | 経路 | Railway | LLM 課金 | Mac | 用途 |
|---|---|---|---|---|---|---|
| **A** | Claude Code (CLI) | stdio MCP（トンネル不要） | 不要 | **0**（`claude -p`） | on | 完全ローカル・最クリーン |
| **B** | claude.ai（モバイル可） | remote MCP + **ngrok** | 不要 | **0**（API key 入れない） | on | **C4 はこれ**・モバイル×従量0 |
| **C** | claude.ai・Mac off/24-7 | Railway/VPS + API | 要 | **従量** | off | 無人 automation 実需が出てから |

- **従量課金の正体** = クラウドに `claude -p`（個人サブスク）が無く `ANTHROPIC_API_KEY` 従量になること。**API key を設定しない限り課金は発生しない**。
- **「Mac off も従量0 も両方」は構造的に無理**（subscription `claude -p` は個人マシン前提）。Mac off したい時の妥協: `ANTHROPIC_MODEL=claude-haiku-4-5`（月 $1〜2＝ほぼ0）or ローカル LLM（品質↓）。
- **コスト試算（C を採る場合）**: Railway ~$5/月（アイドル hub）+ API（軽利用 Opus ~$8/Haiku ~$2、ブラウザ常用/ヘビーは青天井）。browser-control はクラウドでログイン資産が死ぬので hybrid 必須。
- 過去に Railway「Dragon Balls」プロジェクト（hub + MySQL）をデプロイしたが**コスト判断で teardown 方針**（ダッシュボード Delete Project + `ANTHROPIC_API_KEY` ローテート + claude.ai connector 削除 + Hobby 解約）。

### C4（ngrok 版）手順
1. ローカル hub 起動（`claude mcp add giogio` で server.mjs が auto-start、or `node prototype/hub/hub.mjs`）。`ANTHROPIC_API_KEY` は**設定しない**（= `claude -p`・従量0）。
2. `ngrok http 8795` → HTTPS URL を得る。
3. claude.ai → Settings → Connectors → `https://<ngrok>/mcp/sse`（or `/mcp`）。OAuth は hub が auto-approve。公開 URL なので act route は OAuth で自動 gate（任意で `A2A_SHARED_TOKEN` も設定可）。
4. モバイルで「〜したい」→ `plan_flow`（図付き）→ `run_workflow`。

## 保留

- DB 移行: volume JSON で十分（C を本採用する時だけ検討）
- cloud での browser-control（`@playwright/mcp` の pre-install + クラウドのログイン profile）= 別 Wave

## Wave: scheduler robustness — 24/7 常駐なしで定期実行を確実化（2026-06-21）

大原則: 「時刻 T に何かが必ず生きてる」は避けられない → **トリガー(24/7 必須)と実行(間欠OK)を分離**し、実行を取りこぼさない durable に。

### 出荷済（in-hub・従量0）
- **catch-up**: schedule automation の `lastFired` を `schedule-state.json`(STATE_DIR) に永続。tick(60s)+boot(1.5s)で `lastDue`(直近 cron 一致)>lastFired なら発火。**downtime で過ぎた due を次回 boot で1回追い発火（coalesced）**＝「Mac が次に起きたら必ず走る」。first-sight は baseline のみ（インストール前の履歴は back-fire しない）。
- **`POST /api/tick`**: 無料外部 cron が叩く seam（now due を発火）。act route ゆえ bearer 必要（外部 cron に token を持たせる）。
- **discover 振り分け**: 定期ジョブを planner が分類 — API-only → サーバーレス cron(Apps Script/Cloudflare)で常駐不要を提案／login 要 → in-hub(catch-up) or マシン wake、完全 off×スマホのみは不可と正直に。

### トリガーの無料 24/7 候補（接地済み・自分で持たず乗る）
- **Cloudflare Workers Cron**: 1分粒度・時間正確・無料・コード+fetch 可 ＝ コード走らせる最良
- **cron-job.org**: URL ping だけ・ゼロ設定・無料（`/api/tick` を叩かせる）
- GitHub Actions cron: 無料だが 15-60分遅延＝時間シビアは不可。Apps Script: Google・無料・〜15分窓・90分/日上限

### ログインジョブを「常駐なし」で確実化する2択（接地済み）
browser-control はあなたのマシンに固着（ログイン profile）。cloud 不可。
- **(a) マシンを定時起動**: `sudo pmset repeat wake MTWRF 08:59:00` でスリープから起床 → `launchd StartCalendarInterval` で hub の `/api/tick` を叩く → 再スリープ。⚠️ **AC 電源必須**（バッテリ+蓋閉じは深いスリープで不発）・スリープからのみ（完全 off は poweron=AC のみ+FileVault 解錠要）。launchd は寝てた分を次回 wake に繰延（coalesce）。
- **(b) catch-up に任せる**: 起こさず、Mac が次に起きた時に hub boot tick が追い発火。無料・AC 不要だが時間は不正確。

### 一番のおすすめ＝安い常駐箱（cloud より神龍向き）
**Mac mini / 中古ノート / ミニPC / Pi を 24/7 つけっぱ**にして hub+scheduler を回す:
- 🟢 24/7・🟢 従量0（LLM は `claude -p`=サブスク or Ollama=ローカル無料）・🟢 電気代だけ（〜数百円/月）・🟢 **browser-control のログイン資産が生きる**（自分の箱）
- vs cloud(Railway): cloud は API 従量 + browser-control 死ぬ。常駐箱はそれが無い。
- LLM 選択: サブスクあるなら `claude -p`（賢い・web 検索持つ=discover 効く）> Ollama（無料だが弱い・web 検索 native 無し）。
- 弱点: cloud 級 SLA は無い（停電/ネット断/自動再起動の設定要）。だが「ノートが寝る」より遥かにマシ。
- 動かぬ真実: **マシン完全 off で「あなたのログインを使うジョブ」は原理的に不可能**（ログインがそのマシンにしか無い）。「常駐なし」で出来るのは API ジョブのサーバーレス化のみ。
