# Plan: Shenron — Claude.ai (mobile) から MCP で発動

## Context

モバイルから Mac なし・AI API キーなしで神龍を使いたい。

**解決策**: Claude.ai が AI、Shenron が純粋な実行エンジン。Claude.ai の Remote MCP 機能で Shenron に繋ぐ。

```
[旧案] claude -p CLI → Shenron hub (LLM内蔵) → 実行
[新案] Claude.ai mobile → Remote MCP → Shenron hub (実行専用) → DAG/MCP/Browser
```

- AI = Claude.ai（ユーザーが既に使っているもの、コスト込み）
- Shenron = 実行エンジン（フロー保存・DAG実行・MCP生成・browser-control）
- API キー不要、LLM コスト不要、BYOAI 維持

## アーキテクチャ

```
[Mobile Claude.ai]
  ↓ Remote MCP (HTTPS/SSE)
[Shenron Hub — 軽量 Node.js サーバー]
  ├── plan_flow(goal)       → Claude が plan IR を解釈・提案
  ├── build_flow(plan)      → DAG JSON 生成
  ├── run_workflow(id)      → DAG 実行
  ├── gen_component(what)   → Python MCP サーバー生成・sandbox verify
  └── browser_checkpoint()  → human approval gate (Wave 11b)
       ↓
  [Generated MCP servers / External APIs / Playwright browser]
```

hub 内の LLM 呼び出し（`runner.mjs` / `EXEC_VENDOR`）は**不要になる**。  
Claude.ai がプランニングを担い、hub は tool の結果を返すだけ。

## Wave C1 — Remote MCP (HTTP/SSE) エンドポイント追加

**ファイル**: `prototype/hub/hub.mjs`

Claude.ai の Remote MCP は `GET /sse` + `POST /messages` の HTTP トランスポートを要求する。

```js
// MCP SSE transport — Claude.ai が接続するエンドポイント
// GET /mcp/sse  → SSE ストリーム（server→client notifications）
// POST /mcp/messages → tool call ディスパッチ

// 既存の MCP tool 定義（plan_flow, run_workflow 等）を
// JSON-RPC 2.0 over HTTP に包むだけ
```

既存の `/api/shenron/*` エンドポイントは維持。SSE レイヤーを薄く被せる。

**追加する MCP ツール定義**（hub.mjs に inline）:

| tool | input | 説明 |
|------|-------|------|
| `plan_flow` | `{goal: string}` | 目標 → plan IR（Claude が解釈） |
| `build_flow` | `{plan: object}` | plan IR → DAG JSON |
| `run_workflow` | `{id: string, confirm?: boolean}` | 保存済みフロー実行 |
| `gen_component` | `{what: string}` | 不足ツール生成 → Python MCP サーバー |
| `list_workflows` | `{}` | 保存済みフロー一覧 |
| `get_checkpoint` | `{}` | browser-control の承認待ちステップ取得 |
| `resolve_checkpoint` | `{id, allow: boolean}` | モバイルから承認/拒否 |

## Wave C2 — Dockerfile（LLM なし軽量版）

```dockerfile
FROM node:20-bookworm-slim
RUN apt-get update && apt-get install -y python3 \
    && npm install -g @playwright/mcp@latest \
    && npx playwright install chromium --with-deps
WORKDIR /app
COPY prototype/ ./prototype/
VOLUME /data
ENV STATE_DIR=/data PORT=8795
CMD ["node", "prototype/hub/hub.mjs"]
```

- `@anthropic-ai/sdk` 不要（API キーなし）
- Python は generated MCP server 実行用のみ
- `STATE_DIR` env で JSON 状態ファイルのパスを上書き（hub.mjs 5箇所）

## Wave C3 — デプロイ + Claude.ai 接続

```bash
# Railway / Fly.io
railway up   # or: fly deploy
# → https://shenron-xxxx.up.railway.app
```

Claude.ai Settings → Integrations → Add MCP Server:
```
URL: https://shenron-xxxx.up.railway.app/mcp/sse
```

モバイルで「毎週月曜に Slack レポートを投稿したい」と言うと Claude が `plan_flow` を呼ぶ。

## 変更ファイル

| ファイル | 変更内容 |
|---------|---------|
| `prototype/hub/hub.mjs` | `/mcp/sse` + `/mcp/messages` エンドポイント追加、STATE_DIR 対応（5箇所） |
| `prototype/hub/Dockerfile` | 新規作成（LLM なし軽量版） |
| `prototype/hub/.env.example` | 新規作成（PORT, STATE_DIR のみ） |

`prototype/runner.mjs` は**変更不要**（ローカル開発では引き続き `claude -p` を使える）。

## 保留（YAGNI）

- 認証: 自分用なら Railway の private URL で十分、公開するなら Bearer token 1行で済む
- DB 移行: volume JSON で十分、同時書き込みが問題になったら
- Wave 11b commit: C1 着手前に先に commit する

## 検証

1. `node prototype/hub/hub.mjs --port 8795` でローカル起動
2. `curl http://localhost:8795/mcp/sse` → SSE ストリーム確認
3. `curl -X POST http://localhost:8795/mcp/messages -d '{"method":"tools/list"}'` → ツール一覧返答
4. Claude.ai desktop で `http://localhost:8795/mcp/sse` を MCP 登録 → `plan_flow` 呼び出し確認
5. Docker build → Railway deploy → モバイル Claude.ai から同じ操作
