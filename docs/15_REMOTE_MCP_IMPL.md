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

## 現在地

- [x] C1: Remote MCP エンドポイント
- [x] C2: STATE_DIR 対応
- [x] C3: Dockerfile
- [ ] C4: デプロイ + モバイルテスト

## 保留

- 認証 (Bearer token): 自分用なら Railway private URL で十分、後で追加
- DB 移行: volume JSON で十分
- Wave 11b (browser-worker) の commit: C1 前に先に main へ
