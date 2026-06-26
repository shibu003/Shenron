# B8 認証マップ — HTTP route 表化の前提（source of truth）

> **目的**：`hub.mjs` の `http.createServer` ハンドラ（`L1445`〜`L1866`）を「巨大 if → dispatch 表」に書き換える **B8** の着手前に、**どの route がどの認証ゲート下か**を 1 枚に固定する。表化で一番危ないのは「**位置で効いている暗黙の認証継承**」を取りこぼすこと（→ admin/token 必須が公開化、または公開 read が 401 化）。この表が「変更前の正」＝B8 の不変条件。
>
> 行番号は B7 時点（commit `563c544`）。以後シフトしうるので **route 名で照合**すること。

## 0. 認証ゲートの定義（`L1276-1289`）

| ゲート | true になる条件 | openDev（token 未設定）|
|---|---|---|
| `bearerOk(req)` | `SHARED_TOKEN` 一致 ∨ OAuth token 有効 ∨ Web セッション cookie 有効 | **常時 true**（`openDev && !oauthTokens.size`）|
| `isAdmin(req)` | `openDev` ∨ `SHARED_TOKEN`/OAuth 一致 ∨ セッション role==admin | **常時 true** |

⚠ **auth 列の意味＝「token 認証が構成された時」**。ローカル開発（openDev）では両ゲートが no-op で全部通る。

## 1. ハンドラの構造（B8 は「2つの表」になる）

```
createServer (L1445)
├─ 【同期部】GET / OPTIONS / discovery / SSE      ← body 読込み前
│   ├─ 公開: 静的HTML, /api/health, /api/doctor, /api/auth/verify, /api/shenron/readiness …
│   ├─ ★GET 面ゲート (L1505): GET /api/* && !bearerOk → 401
│   ├─ ゲート下の GET /api/* 群（bearerOk 継承）
│   └─ OPTIONS / .well-known / /oauth/authorize / /mcp/sse
├─ if (method !== POST) → /api/ なら 405・他 404  (L1602)
└─ 【非同期部】req.on('end') → body パース → try{ (L1605-1607)
    ├─ /mcp ・ POST / (jsonrpc)               ← 自前 bearerOk (L1610)
    ├─ 公開 POST: /api/auth/{register,login,logout,reset-request,reset}
    ├─ /api/auth/role                          ← 自前 isAdmin (L1665)
    ├─ /oauth/{register,token} ・ /mcp/messages(自前 bearerOk)
    ├─ ★POST 面ゲート (L1703): POST /api/* && !bearerOk → 401
    ├─ ゲート下の POST /api/* 群（bearerOk 継承）
    └─ 404 unknown route (L1863) / catch → 400 (L1864)
```

**含意**：GET 表と POST 表は分離必須（POST はパース済み body `j` が要る）。各面ゲートは**該当 method の表の「公開例外群の直後・残り全部の直前」**に置く＝この位置を保てば継承が保存される。

## 2. GET（同期部）

### 2a. 面ゲート **上**＝公開 or 個別チェック（表化時に `auth` を**明示**せよ）

| path | auth | 行 | 注 |
|---|---|---|---|
| `/`, `/ui-old`, `/ui2`, `/settings`, `/shenron`, `/artifacts` | **open** | 1448-1471 | 静的 HTML。`/api/` 接頭辞でないのでゲート対象外 |
| `/manifest.json`, `/sw.js` | **open** | 1472-1480 | PWA。CORS/cache ヘッダ個別 |
| `/api/auth/verify` | **open** | 1482 | メール認証（公開・token は query）|
| `/api/auth/me` | **session cookie のみ** | 1486 | ⚠ bearer 不可＝「今の Web セッションは誰か」。cookie 無→401 |
| `/api/auth/users` | **bearerOk** | 1490 | ゲート上だが自前 bearerOk（実質ゲート下と同等）|
| `/api/health` | **open** | 1495 | 外部 cron/watchdog |
| `/api/doctor` | **open** | 1499 | 初回診断（問題下でも呼べる）|
| `/api/shenron/readiness` | **open** | 1502 | PC1。秘密値なし・接続前から 🔴 |

### 2b. ★GET 面ゲート `L1505` `GET /api/* && !bearerOk → 401`

### 2c. ゲート **下**＝全て **bearerOk 継承**（`L1506-1579`）

`/api/state`, `/api/check-results`, `/api/drift-alerts`, `/api/shared`, `/api/runs`, `/api/runs/:id/stream`(SSE), `/api/runs/:id`, `/api/templates`, `/api/workflows`(±`?id`), `/api/artifacts`, `/api/shenron/skills`, `/api/workflows/:id/ui`, `/api/shenron/components`(±`?id`), `/api/automations`, `/api/integrations`, `/api/integrations/search`, `/api/integrations/:id`, `/api/audit`, `/api/permissions`, `/api/login-status`, `/api/suggestions`, `/api/goals`, `/api/goals/:id`, `/api/receipt`, `/api/pubkey`, `/api/buildstate`, `/api/capvocab`, `/api/mcp`, `/api/config`

> ⚠ **`/api/pubkey`(1571)・`/api/receipt`(1569) は現状ゲート下＝bearerOk 必須**。コメントは「pin して hub 無しで receipt 検証」用途を示唆＝公開が自然にも見えるが、**今は認証下**。B8 は現状維持（公開化は別判断・勝手に変えない）。

### 2d. 面ゲートを素通りする非 /api（method 不問）

| path | auth | 行 |
|---|---|---|
| `OPTIONS *` | **open**（CORS preflight 204）| 1580 |
| `/.well-known/oauth-protected-resource`, `/.well-known/oauth-authorization-server` | **open** | 1582-1583 |
| `/oauth/authorize` | **open**（auto-approve→302）| 1584 |
| `/mcp/sse` | **自前 bearerOk**（失敗時 OAuth 401 challenge ヘッダ）| 1592 |

## 3. POST（非同期部・`req.on('end')` 内）

### 3a. 面ゲート **上**＝公開 / MCP自前 / admin

| path | auth | 行 | 注 |
|---|---|---|---|
| `/mcp` ・ `POST /`(jsonrpc:2.0) | **自前 bearerOk** | 1609-1610 | Streamable HTTP MCP。GET `/` は launcher・POST+jsonrpc は MCP（method+body で判別）|
| `/api/auth/register` | **open** | 1625 | 公開 |
| `/api/auth/login` | **open** | 1635 | 公開・set-cookie |
| `/api/auth/logout` | **open** | 1645 | cookie クリア |
| `/api/auth/reset-request` | **open** | 1651 | 公開 |
| `/api/auth/reset` | **open** | 1659 | 公開 |
| `/api/auth/role` | **isAdmin** | 1664-1665 | ⚠ **唯一の isAdmin route（403）**。bearerOk より強い。set_role(MCP)＋settings admin が叩く |
| `/oauth/register` | **open** | 1670 | DCR |
| `/oauth/token` | **open** | 1671 | PKCE 検証はするが bearer 不要 |
| `/mcp/messages` | **自前 bearerOk** | 1681-1682 | Remote MCP JSON-RPC（応答は SSE）|

### 3b. ★POST 面ゲート `L1703` `POST /api/* && !bearerOk → 401`

### 3c. ゲート **下**＝全て **bearerOk 継承**（`L1704-1862`）

`/api/handoffs`, `/api/poll`, `/api/audit`(worker が trail append), `/api/permissions`, `/api/login-detected`, `/api/artifact-llm`, `/api/suggestions/:id/dismiss`, `/api/suggestions/:id/apply`, `/api/goals`, `/api/goals/:id/checkin`, `/api/goals/:id/delete`, `/api/goals/:id/suggest`, `/api/workflows`, `/api/workflows/:id/ui`, `/api/workflows/:id/clone`, `/api/workflows/:id/(share|unshare)`, `/api/templates/:id/install`, `/api/runflow`, `/api/langflow/run`, `/api/langflow/import`, `/api/automations`, `/api/check`, `/api/fire`, `/api/tick`, `/api/notify/test`, `/api/config`, `/api/fire/preview`, `/api/autorun`, `/api/integrations`, `/api/agents`, `/api/shenron/plan`, `/api/shenron/gen-artifact-ui`, `/api/shenron/gen-component`, `/api/shenron/components/approve`, `/api/shenron/build`, `/api/shenron/skill`, `/api/shenron/skills/delete`, `/api/trust/preview`, `/api/credentials`(action分岐), `/api/memory`(action分岐), `/api/components/export`, `/api/components/import`, `/api/runs/:id/stop`, `/api/integrations/:id/toggle`, `/api/integrations/:id/delete`, `/api/automations/:id/toggle`, `/api/handoffs/:id/(approve|decline|result|checkpoint)`, `/api/agents/:id/policy`, `/api/agents/:id/autorun`, `/api/agents/:id/passport`, `/api/agents/:id/run`, `/api/agents/:id/delete`, `/api/agents/:id/export-mcp`

## 4. B8 で必ず保存する不変条件（取りこぼし＝API 破壊 or 認証穴）

1. **2つの面ゲートの位置＝認証境界**。表化で各 route の `auth` を**明示列**にする（`open` / `bearerOk` / `isAdmin` / `session`）。「ゲートより下だから authed」という暗黙継承を、**route 個別の宣言**に変換する。`L1835` のコメント（「この block は gate の後ゆえ認証済み」）がその暗黙知の唯一の言語化＝消さない。
2. **公開例外は数えるほど**（下記以外の `/api/*` は全部 bearerOk）：
   - GET open：`auth/verify`, `health`, `doctor`, `shenron/readiness`（＋`auth/me`=session のみ）
   - POST open：`auth/{register,login,logout,reset-request,reset}`
   - **isAdmin（唯一）**：POST `auth/role`
   - 一覧外の `/api/*` を誤って open にしたら**認証穴**。
3. **非 /api は面ゲートを素通り**＝MCP 系（`/mcp`, `/mcp/messages`, `/mcp/sse`, `POST /`jsonrpc）は**自前 bearerOk** を各自持つ。表化で `/api/` 接頭辞前提のゲートに巻き込むと OAuth/discovery（公開であるべき）まで 401 化する。
4. **マッチ順序（first-match-wins）**：regex route は完全一致より後・regex 同士も登録順。例 `runs/:id/stream` は `runs/:id` より先、`/api/goals/:id/checkin|delete|suggest`(prefix+suffix) は `/api/goals/:id`(GET) と衝突しない method 差。**dispatch は「完全一致 → regex を元の順」**で再現。
5. **method 別の表**：GET 表（同期・body 無）と POST 表（非同期・body パース後）は別物。`/`（GET=HTML / POST+jsonrpc=MCP）の二重定義を method で分ける。
6. **MCP-first（北極星）route も同居**：`tools/list`・`mcpDispatch`(tools/call)・`/api/shenron/skill`・`/oauth/*`・`/mcp*`。挙動 1bit も変えない。
7. **`/api/credentials`・`/api/memory` は単一 path 内で `j.action` 分岐**（set/get/list/delete 等）＝1 route エントリ・分岐は handler 内に保つ（表のキーを action 別に割らない）。

## 5. B8 検証チェックリスト（変更前後で同値を確認）

- [ ] 全 11 `test_*.mjs` green（大半が HTTP 経由＝最広網羅）
- [ ] **認証境界の明示テスト**（test が全 auth 組合せを網羅しない＝ここが検出ギャップ）：
  - [ ] `SHARED_TOKEN` 設定下で、token 無しの GET `/api/state`・POST `/api/runflow` → **401**
  - [ ] 同条件で GET `/api/health`・`/api/doctor`・`/api/shenron/readiness`・`/api/auth/verify` → **200/正常**（公開維持）
  - [ ] POST `/api/auth/role` を非 admin セッションで → **403**（admin gate 維持）
  - [ ] `/oauth/authorize`・`/.well-known/*` が token 無しで **到達**（公開維持）
  - [ ] `/mcp` を token 無しで → **401**（自前 bearerOk 維持）
- [ ] 代表 GET/POST を curl で before/after 比較（status＋body 形）
- [ ] **段階移行**：route 群を数本ずつ表へ・各段で上記スイート。big-bang 禁止
- [ ] 単独 commit（revert 容易）・最後に実施

---
*B8 着手時はこの表を「期待集合」として diff せよ。route 名で照合（行番号はシフト）。*
