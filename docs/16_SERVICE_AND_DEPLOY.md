# 16 — 神龍 をサービスとして出す / デプロイ設計（接地済み 2026-06-21）

> claude.ai mobile 実機評価 → 24/7・常駐箱・OpenClaw・サービス化 の議論を web 検索で接地して固めた設計。実装は Wave 単位。

## §0 核心の制約（これを破ると堀が死ぬ）
神龍の構造的白地（[[whitespace-grounded-2026-06]]）= **① 従量0（ユーザー自身の Claude サブスク）② ローカル・クレデンシャル（自分のログインで無人操作）③ 足りない道具を自前生成**。
→ **サービス化 = hub をこちらでホストしない**。compute を載せると ①（自分が API 課金）も ②（クラウドにユーザーのログインは無い）も壊れる＝巨人と同じ土俵。
→ **サービス = 「各ユーザーが自分のマシン/サブスクで動かす神龍を、配布・統制する層」**。compute/data はユーザー側、**control plane を売る**（Tailscale/Raycast/n8n の確立パターン・接地済み）。

## §0.5 お財布適応（budget-adaptive）= 設計の背骨
神龍は**コストを強制しない**。あらゆる能力に「無料パス（正直な制限付き）」と「有料パス（到達/便利さ増）」があり、ユーザーが財布に合わせて選ぶ。default は常に最安（従量0・free）、課金は user の明示 opt-in。

| tier | 入れるもの | LLM | デプロイ/到達 | 外部ツール | automation |
|---|---|---|---|---|---|
| **無料（従量0）** | 何も（自分のサブスク or ローカル） | claude -p / Ollama(sub-step) | 自分のマシン / 常駐箱 | 無料/無料枠のみ(`cost:free`) | in-hub scheduler(箱/Mac on)+catch-up |
| **BYO-key（API 入れたい）** | `ANTHROPIC_API_KEY` | 直 API(claude.ai 不在でも・Haiku で激安可) | ＋managed hub(箱無しで 24/7・API ジョブ) | free のままでも可 | ＋クラウド常駐で確実 24/7(API ジョブ) |
| **余裕あり** | ＋paid tools | 同上 | 同上 | `cost:paid_ok`=有料ツール可(コスト開示) | 同上 |

- **2 軸が独立**: ① LLM/infra（無料サブスク → BYO-key API → managed hub）② 外部ツール（`cost:free` → `paid_ok`）。混在自由（例: 無料デプロイ＋`paid_ok` ツール、BYO-key managed＋`free` ツール）。
- 神龍の役目 = discover が各 step で「無料ならこう／有料ならこう速く確実」と**正直に出して選ばせる**（cost 設定 §4 が step レベル、本表が infra レベル・同じ思想）。
- **コスト最小は受け身でなく能動 default**: planner は常に最安経路を組む — ① **LLM step を最少**（1 prompt で済むものは纏める・決定論 API/MCP/code step は ~$0 で LLM step より優先）② **既存ツール/cache 部品を再利用**（生成より優先）③ 各 step 既定 tier=cheap（本人サブスク/小モデル）で **strong/有料は outcome を変える時だけ escalate**。④ 実行は claude -p(従量0) を優先・API は key がある時だけ。→ **common case（ローカル claude -p）は元から $0**、課金が出る API/cloud path でも既定で最小。
- 実現: 今は `cost` 設定 ＋ `ANTHROPIC_API_KEY` 有無（runner.mjs 分岐）＋ デプロイ形態 の組合せ。将来は単一 `budget` 設定で cost+LLM+デプロイ推奨を束ねる UX もあり。

## §1 デプロイ形態（self-host が堀を保つ default、+ ホスト済み hub も選べる）
| 形態 | 24/7 | LLM 課金 | browser-control | 用途 |
|---|---|---|---|---|
| ノート（起きてる時） | △ | 0(claude -p) | 🟢 | 普段。catch-up で「次に起きたら走る」 |
| **安い常駐箱**（self-host） | 🟢 | 0 | 🟢 | **推奨・堀フル**（下記） |
| **ホスト済み hub も使える**（managed） | 🟢 | 🟡 BYO-key(本人払い) | 🔴 | **箱が無い人向け**。下記 |
| cloud に自分でデプロイ(BYO) | 🟢 | 🔴 API | 🔴 | 上級者の self-cloud |

### 「hub も使える」= managed hub option（箱を持てない人の入口）
箱も常駐 Mac も無い人（スマホ中心）向けに、**サービス側が hub をホストして提供**する tier も出す。設計上の正直な条件:
- **BYO-key 必須**: ユーザーが自分の `ANTHROPIC_API_KEY` を入れる → **LLM 代は本人払い・こちらは compute(hub)だけ**＝unbounded な API 原価を背負わない（[[whitespace-grounded-2026-06]] の「他人ホストは BYO-key」と整合）。
- **browser-control は効かない**（クラウド hub にユーザーのログイン profile が無い）→ **API/MCP/生成ツール系のフローと scheduler が主**。ログイン操作が要るフローは「ローカル神龍 or 常駐箱でね」と正直に出す（discover が振り分け）。
- 位置づけ: **堀（ローカル・クレデンシャル）を一部諦める代わりに摩擦ゼロで始められる入口**。self-host(箱)が default 推奨、managed は「まず触ってみる/箱を持てない」人のオンランプ。アップグレード動線 = 「ログイン操作も自動化したくなったら常駐箱へ」。
- ＝これは §3 のマネタイズ②(hosted tier)の実体。compute(hub)は提供するが LLM トークンは売らない（BYO-key）。

### 安い常駐箱（cloud より神龍向き・接地済み）
電気代は idle W×24×30÷1000×単価（日本 ¥31/kWh・US $0.16/kWh）:
| 箱 | 価格目安 | idle | 電気/月 | LLM 余力 |
|---|---|---|---|---|
| **Raspberry Pi 5** (4GB) | ~$60(2026 高騰注意) | ~3.5W | **¥78 / $0.40** | 1-3B のみ（遅い） |
| **Mac mini M4** (16-24GB) | ~$599-799 | ~4W | ¥89 / $0.46 | **7-8B ~30tok/s・14B(24GB)**＝唯一実用 |
| Intel N100/N150 (16-32GB) | ~$160-200 | ~10W | ¥223 / $1.5 | 3B 止まり（CPU only） |
| 旧ノート | 0〜 | ~15W | ¥335 / $2.2 | dGPU 無ければ弱 |
- **hub だけ**なら Pi5 が最安TCO。**hub+ローカルLLM**なら Mac mini M4 が唯一快適。
- 24/7 設定: Pi=USB-C 給電で停電後 auto-boot+NVMe+能動冷却／mini PC=BIOS "Restore on AC Power"(既定 OFF)／Mac=「電源喪失後に自動起動」+auto-login+launchd(FileVault OFF)／旧ノート=蓋スリープ無効+バッテリ常時100%劣化注意+停電後は手動。

### 箱の上の LLM: claude -p ≫ Ollama（接地済み・重要）
- **Ollama は planner/discover を担えない**: JSON 形は文法制約で全サイズ解決済だが、**判断（tool 選択・多段）は 14-32B で漸く非脆弱、最良の自前(70B)でも frontier Claude 以下**。Mac mini で 14B が脆弱な上限。N100/Pi は planner 不可。
- **「ローカル検索」は幻**: Ollama の web search も結局**クラウド API（要キー・有料枠）**。ローカルモデルは知識が訓練時点で凍結。
- **正解 = tiering**: 判断/discover = `claude -p`（サブスク・賢い・web 検索持つ）／cheap sub-step（要約/分類/整形/JSON 化）= ローカル Ollama(3-8B・文法制約で JSON 確実)。「置換」でなく「安い 80% をローカルに逃がす」。
- **有効化（出荷済み・cheap を完全無料に）**: `ollama serve` を起動 ＋ `SHENRON_CHEAP_VENDOR=ollama`（任意で `OLLAMA_MODEL`/`OLLAMA_HOST`）→ tier=cheap の step が**ローカル localhost で $0**（cloud/API path でも cheap だけ無料）。strong は `claude -p`/API のまま。
- **OS 横断（PC 含む）**: hub(Node)・Ollama は **Windows/Linux/Mac 共通**。常駐箱は N100 等の PC でも可（§1 表）。OS で違うのは「スリープから定時起動」のレシピだけ＝Mac:pmset+launchd / Win:タスクスケジューラ"スリープ解除"+BIOS RTC / Linux:systemd timer+rtcwake（docs/15）。常時起動サーバーなら wake 不要。

## §1.7 どのクライアントから繋がるか（接地済み 2026-06）＋ 設定は MCP/自然文で完結
multi-provider は**神龍（MCP サーバー）の中**で起きる（クライアントは単一 provider の受付・神龍が下流で claude/openai/ollama を tier/consensus で振る）。各クライアントは神龍 1台に繋ぐだけ:

| クライアント | カスタム MCP 追加 | 方法 | 公開 URL 要 | サブスク $0 path |
|---|---|---|---|---|
| Claude Code (CLI) | 🟢 | `claude mcp add giogio -- node prototype/mcp/server.mjs`（remote も `--transport http`） | 不要(stdio) | 🟢 Pro/Max |
| Codex (CLI) | 🟢 | `codex mcp add giogio -- node …`（or `~/.codex/config.toml`） | 不要(stdio) | 🟢 ChatGPT plan |
| Gemini CLI | 🟢 | `~/.gemini/settings.json` `mcpServers` | 不要(localhost可) | — |
| **claude.ai**（web/モバイル） | 🟢 | Customize > Connectors > Add custom（URL） | **要**（公開 HTTPS・localhost 不可） | 🟢 |
| **ChatGPT**（アプリ） | 🟢 | Settings > Connectors > **Developer Mode** ON → URL | **要**（localhost 不可） | Plus/Pro/… |
| **Manus** | 🟢 | Settings > Integrations > Custom MCP Servers（HTTP） | **要** | — |
| **OpenClaw** | 🟢 | `openclaw mcp add` / config `mcpServers`（stdio）；remote は `url`+`transport:"streamable-http"`+`auth:"oauth"` | stdio:不要 / remote:要 | 🟢 BYO-key(model 自由) |
| Gemini アプリ（消費者） | 🔴 | 不可（Google 内蔵拡張のみ） | — | — |

- **OpenClaw（接続済みにする手順）**: ローカルなら config(`~/.openclaw/openclaw.json` の `mcpServers`)に `{"giogio":{"command":"node","args":["prototype/mcp/server.mjs"]}}` を足す（標準 MCP shape・正確な CLI flag は `openclaw mcp add --help`）。remote(常駐箱/managed)なら神龍の `/mcp`(streamable-http) URL を `transport:"streamable-http"`+`auth:"oauth"` で。**神龍側は追加実装不要**（既存 stdio server.mjs / remote `/mcp` がそのまま MCP 準拠）。⚠️ 実 OpenClaw での接続テストは未実施（spec 準拠で動くはず・要実機確認）。OpenClaw 自身もローカル/BYO-key 思想なので相性◎。

→ **CLI 系 = ローカル stdio で web 不要**。**claude.ai/ChatGPT/Manus = 1 つの公開 HTTPS URL**（神龍の `/mcp/sse`＋streamable・ngrok or 常駐箱 or managed hub）に全部繋ぐ。Gemini は CLI のみ（消費者アプリ不可）。

**設定も MCP/自然文で完結（出荷）**: `get_config`/`set_config`（全設定1か所・cost/scheduler/routing/providers・live 反映・初期設定 hint）+ `add_integration`/`add_automation`（登録）。「cheap を ollama に / 有料OK / 毎週月曜に走らせ」等を自然文で言えば AI が set_config/add_* を呼ぶ＝**設定画面に行かずに完結**。API key だけは secret ゆえ env/.dev.vars（config には在否のみ）。設定 URL（cockpit ページ）は MCP の上の薄い任意 view（managed/非技術者向けにあると親切・必須でない）。

## §1.8 OpenClaw の3役（multi-provider との関係・正直な区別）
- **client（神龍に繋ぐ）**: 🟢 `openclaw mcp add` → 神龍が内部で multi-provider 実行（§1.7）。
- **tool/agent（神龍の flow が使う道具）**: 🟢 `openclaw mcp serve`(OpenClaw を MCP サーバー化) → 神龍に `add_integration` → flow ノードで OpenClaw の機能(messaging/browser 等)を呼ぶ。
- **LLM provider（claude/openai/ollama の仲間に入れる）**: 🔴 不向き。OpenClaw は LLM endpoint(prompt→text)でなく agent＝tierRoute/runVendorAsync の provider にも consensus にも入らない。神龍の「複数 provider」は LLM endpoint(claude/openai/gemini/ollama)で構成。
- 補足: OpenClaw 自身は BYO-model(Claude/GPT/Ollama)＝OpenClaw 側でも multi-model だが、それは OpenClaw の設定で神龍の provider 層とは別。

## §2 配布先: OpenClaw（接地済み）
OpenClaw = MIT・ローカル/BYO-key の個人 AI エージェント（Peter Steinberger+community・~380k★・openclaw.ai）。**MCP client（stdio/SSE/streamable-http・`openclaw mcp add <name>` or config `mcp.servers`）**＋ skills/ClawHub 文化（5,700+）。
→ **神龍を MCP server として OpenClaw に挿す**（神龍は既に stdio server.mjs + remote `/mcp/sse`/streamable を持つ＝そのまま繋がる）。380k★ = 配布チャネル。OpenClaw 同様に「ローカル・BYO-key・自己ホスト」なので思想が一致＝同じ層のユーザーに自然に届く。Claude Code / claude.ai / Cursor も同じく MCP client として対象。

## §3 マネタイズ（compute は売らない・control plane を売る・接地済みパターン）
1. **BYOK flat-fee（seat/team）**: ユーザーが自分のキー/サブスクを持つ→トークン無マークアップ→clean な月額（例 Mission Control $49/mo）。神龍の従量0 と完全整合。
2. **open-core + hosted sync/team/governance**（Tailscale/Raycast/n8n 型・最も実証済み）: compute はローカル、軽い control plane（複数デバイス sync・SSO/監査・admin）を売る。
3. **marketplace + curation +「verified/secure」flows**（MCPB/registry 型）: 無料プロトコル上で「検証済み・安全・統制」を売る。**神龍の既存資産（trust receipt / capability passport / 改竄検知 audit）が ③ の governance にそのまま効く**＝ここが他 MCP マーケットに無い差。
- 収束する教訓: **data/compute はユーザーのマシン、課金は control plane（sync/team/curation/配布/サポート）。トークンは絶対に売らない**。

## §4 cost 設定（無料 only / 有料OK・出荷済み）
`plan_flow {cost:'free'|'paid_ok'}`（既定 `free`）。discover/planner が honor:
- `free`: $0-marginal のみ（無料/無料枠 API・無料 MCP・Apps Script 無料枠・browser-control・本人サブスク・ローカルモデル）。**有料でしか出来ない step は silently 使わず clarify/blocker で opt-in 化**。
- `paid_ok`: 有料ツール可、ただし**コストを必ず開示**（blocker/summary）。
gap トグル同様、永続は client 側（localStorage）。

## §5 未確定（user 判断・[[giant-war-doctrine]] の beachhead 相当）
- どのマネタイズ軸を主にするか（1 BYOK flat / 2 control-plane / 3 governance-marketplace）。神龍の trust 資産的には 3 に寄せる手はある。
- OpenClaw 統合の深さ（単に MCP server を出す / ClawHub に skill 公開 / 専用 onboarding）。
- 常駐箱を「公式推奨デプロイ」として one-click installer 化するか（MCPB 型）。
- ローカル Ollama tiering を実装するか（cheap sub-step を runner で claude→ollama 振り分け）。

## 実装状況
- ✅ cost 設定（§4）出荷。
- ✅ 24/7/catch-up/scheduler（§1 のソフト面）= docs/15 + Wave（scheduler robustness）。
- ✅ **managed hub モード**（Wave F-1）: `SHENRON_MANAGED=1` env で browser-control 無効化（create/ensureBrowserWorker/availableSummary/get_checkpoint/resolve_checkpoint がすべて managed note を返す）。`configStatus()` に `managed` フラグ追加。
- ✅ **Fly.io deploy config**（Wave F-1）: `fly.toml`（project root）。`SHENRON_MANAGED=1` デフォルト ON・volume mount `/data`・region `nrt`。
- 📋 §2/§3/§5 = 設計のみ（実装は user の方針決定後）。常駐箱 §1 はハード/OS 設定＝doc レシピ（docs/15）。

## Fly.io デプロイ手順（Wave F-1）

### デプロイ先: hub.shibubu.ai（shibubu.ai の Fly.io app と並走する別 app）
神龍 hub は `shenron-hub`（独立 Fly app）として deploy し、`hub.shibubu.ai` サブドメインを向ける。
shibubu 本体（app=`shibubu`・lax）には手を加えない。

```bash
# 0. 前提: flyctl と shibubu への認証済み
#    GioGio ディレクトリで実行（fly.toml がここにある）
cd ~/GioGio

# 1. app 作成（初回のみ）
fly apps create shenron-hub --org personal

# 2. volume 作成（初回のみ・永続 state）
fly volumes create shenron_data --region nrt --size 1

# 3. 環境変数（BYO-key 必須: managed hub は claude -p が無い）
fly secrets set ANTHROPIC_API_KEY=sk-ant-... -a shenron-hub

# 4. deploy
fly deploy --config fly.toml

# 5. カスタムドメイン設定
fly certs create hub.shibubu.ai -a shenron-hub
# → 表示される CNAME レコードを shibubu.ai の DNS に追加:
#   hub.shibubu.ai  CNAME  shenron-hub.fly.dev

# 6. 確認
fly status -a shenron-hub
# → https://hub.shibubu.ai/mcp/sse を claude.ai Connectors に登録
```

### 必須 env vars（fly secrets set -a shenron-hub）
| var | 説明 |
|---|---|
| `ANTHROPIC_API_KEY` | BYO-key（必須: managed hub は claude -p が無い）|
| `A2A_SHARED_TOKEN` | act route の bearer（任意・外部 cron 用）|
| `SHENRON_NO_SCHEDULER` | `1` にすると in-hub scheduler off（外部 cron のみ運用時）|
