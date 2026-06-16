# 07 — Dogfood セットアップ / Persona C の最小 1-handoff

> 目的：`06` GATE-1（買い手未検証）を**無料で実在 dyad に変換**する。founder＋friend 1 人で、**別 vendor・別 machine の agent を A2A で 1 つだけ繋ぐ**。trust は相互合意で fake、attended（approve gate）。これが MVP の核であり、live demo（Persona C）そのもの。
> **fence（最重要）**：任意接続・multi-tenant 認可・課金・unattended 連鎖は**作らない**（`06` §5 GATE-2）。AI agent で書くのは「fence した 1 chain」だけ。
> 更新日: 2026-06-16

---

## 0. ゴール & 前提（唯一、現実の人間が要る部分）

**1 chain を動かす**：
> A（founder, Claude Code）が branch を push → A の host が検知 → **A2A で B の agent に「この branch を review して」** → B（friend, Codex）の host が **approve 確認** → 承認後 Codex が diff を review → 結果が A2A で A に戻る。

**着手前に人間が確定する 3 つ**（これが GATE-1 の中身）：
1. **friend は誰か**（実在の 1 人）。
2. **共有する 1 repo**（テスト用の小さい repo 1 つに allowlist）。
3. **反復 handoff タスク 1 つ**（例：「push したら相方の Codex が diff review を返す」「夜に WIP を相方の agent が test する」など、2 人が*本当に*繰り返したい 1 つ）。

→ この 3 つが埋まった瞬間、persona が「実在の 2 人」になり投資家の「誰が使う?」が消える。

---

## 1. 構成図（最小）

```
[A: founder machine]                         [B: friend machine]
  Claude Code (claude -p)                       Codex (codex exec)
        │                                            ▲
   git push (feat/*)                                 │ 3) approve? [y/N] → 実行
        │                                            │
  A host (Node/TS or Py)                        B host (a2a-sdk server)
   1) 検知 → A2A client                          ├ /.well-known/agent.json (skill: review-branch)
   2) message/send ──── cloudflared tunnel ────► └ on_message_send → Codex review → 返信
        ▲                                            │
        └──────────── 5) 結果表示 ◄──── A2A 応答 ────┘
```

- 通信＝**A2A（JSON-RPC over HTTPS）**。線は標準に乗る（`06` why now）。
- 到達性＝**cloudflared / ngrok の tunnel**（NAT 越え・無料）。
- trust＝**事前共有 bearer token ＋ repo allowlist ＋ attended**（本物の認可は作らない）。

---

## 2. 役割

| | machine | vendor | 役 |
|---|---|---|---|
| **A** | founder | Claude Code（`claude -p` headless） | trigger 発火・handoff 送信・結果受信 |
| **B** | friend | Codex（`codex exec` 非対話） | A2A server・approve・review 実行・返信 |

> cross-vendor を見せるため A=Claude / B=Codex にする（逆でも可）。両者 BYOK で各自の subscription を使う＝**誰の token かが自然に分かれる**（cross-party billing を作らずに済む）。

---

## 3. trust の fake（mutual consent）

MVP では本物の cross-party 認可を作らない。代わりに：
- 2 人で **共有 secret（bearer token）を 1 つ**生成し、両 host の env に置く（`A2A_SHARED_TOKEN`）。
- B の host は **allowlist した 1 repo の review 要求だけ**受ける（他は拒否）。
- **すべて attended**：B 側で「A が branch X の review を要求。承認?」を出し、y のときだけ Codex を起動。
- 監査：受けた task・承認・実行結果を **1 ファイルに追記ログ**（`handoff.log`）。これが将来の trust 層の種。

---

## 4. セットアップ手順

### S1. 到達性（両者）
```bash
# 各自 host を :8787 で立てる前提。公開 HTTPS URL を得る：
cloudflared tunnel --url http://localhost:8787
# 出た https://xxxx.trycloudflare.com を相手に共有（B の URL を A が使う）
```

### S2. B 側：A2A server ＋ Agent Card
`/.well-known/agent.json`（skill を 1 つだけ公開）：
```json
{
  "name": "friend-codex-reviewer",
  "description": "Reviews a git branch diff with Codex. Attended.",
  "url": "https://xxxx.trycloudflare.com",
  "version": "0.1.0",
  "securitySchemes": { "shared": { "type": "http", "scheme": "bearer" } },
  "security": [{ "shared": [] }],
  "skills": [{
    "id": "review-branch",
    "name": "Review a branch",
    "description": "Given repo+branch, return a code review",
    "inputModes": ["text"], "outputModes": ["text"]
  }]
}
```
server（`a2a-sdk`, Python・擬似コード。method 名は v1.0 SDK で要確認）：
```python
# pip install a2a-sdk
class ReviewExecutor(AgentExecutor):
    async def on_message_send(self, ctx):
        require_bearer(ctx, os.environ["A2A_SHARED_TOKEN"])     # trust fake
        req = parse(ctx.message)                                 # {repo, branch, diff_url}
        assert req["repo"] in ALLOWLIST                          # repo 限定
        if not approve_prompt(f"A asks Codex to review {req['branch']} — approve?"):
            return text("declined")                              # attended
        log_handoff(req)                                         # 監査
        review = run(["codex", "exec",                           # ← 非対話 flag は要確認
                      f"Review the diff of branch {req['branch']} in {req['repo']}. "
                      f"List bugs and risks concisely."])
        return text(review)
# DefaultA2ARequestHandler(ReviewExecutor) を HTTP :8787 で serve
```

### S3. A 側：trigger（push を検知）
`.git/hooks/post-push` 相当が無いので **polling か `pre-push` hook** で：
```bash
# .git/hooks/pre-push（簡易）：push する branch 名を A host に通知
branch=$(git rev-parse --abbrev-ref HEAD)
curl -s localhost:8788/trigger -d "{\"branch\":\"$branch\"}"
```

### S4. A 側：A2A で B に handoff
```python
# pip install a2a-sdk  (client)
client = A2AClient(base_url=B_TUNNEL_URL, token=os.environ["A2A_SHARED_TOKEN"])
card = client.get_agent_card()                       # /.well-known/agent.json
task = client.message_send(skill="review-branch",
        text=json.dumps({"repo": REPO, "branch": branch, "diff_url": diff_url}))
result = client.wait(task)                            # message/send → poll/stream
print("REVIEW FROM FRIEND'S CODEX:\n", result.text)  # S5 結果表示
```
（A の review 実行を Claude でやる版なら `claude -p "<prompt>"` を同様に。今回は B=Codex が review 役。）

### S5. 結果表示
最初は端末出力で十分。次段で desktop に出す。

### S6.（demo polish・後回し）D&D canvas
2-3 node の canvas（`A の push` → `B:review-branch` → `結果`）を desktop に。dogfood 検証は **config だけで先に回す**（canvas は demo の wow 用）。

---

## 5. fence（作らない・AI agent に渡す前に固定）

- ❌ 任意の他人接続（allowlist 1 repo・既知 friend のみ）
- ❌ multi-tenant 認可 / OAuth OBO / DPoP（shared token で fake）
- ❌ 課金 / token 計量（各自 BYOK）
- ❌ unattended 連鎖 / 自動 merge（必ず attended・review を返すだけ、書き込まない）
- ❌ 複数 skill（`review-branch` 1 つ）

---

## 6. 成功基準（GATE-1 を閉じる定義）

- [ ] friend 1 人・repo 1 つ・反復タスク 1 つが**実名で**埋まっている。
- [ ] A の push → B の Codex review が A2A で**実際に往復**した（1 回でも）。
- [ ] 2 人が「これ**また使いたい**」と言う（vitamin でなく painkiller の最小シグナル）。
- [ ] `handoff.log` に往復が記録されている（将来の trust 層の証跡）。

→ 3 つ目（また使いたい）が出れば、persona C は「仮説」から「実在 dyad の習慣」に変わる。これが調達ピッチの最強の 1 枚。

---

## 7. AI agent に渡すビルド spec（point 2：人件費を AI で抑える）

Claude Code / Codex に**この §だけ**渡せば組める。fence を spec に明記して scope 膨張を防ぐ：

> 「A2A（a2a-sdk）で 2 host を繋ぐ最小デモを作れ。B host は `/.well-known/agent.json` に skill `review-branch` を 1 つ公開し、bearer token（env `A2A_SHARED_TOKEN`）を検証、allowlist した repo のみ受け、承認プロンプト y のときだけ `codex exec` で diff review を実行して返す。A host は pre-push hook で branch 名を受け、A2A client で B に `message/send`、結果を端末表示。**追加機能は作るな**（認可基盤・課金・複数 skill・自動 merge・unattended は禁止）。method 名は a2a-sdk v1.0 のドキュメントで確認せよ。」

---

## 8. 落とし穴

- **A2A method 名/型は v1.0 SDK で要確認**（`message/send` vs `task/send`、`AgentExecutor` のフック名）。本書は概形。
- **Codex/Claude の非対話 flag**：`codex exec`・`claude -p` の正確な引数を各 CLI の help で確認。
- **tunnel URL は起動毎に変わる**（trycloudflare 無料）→ Agent Card の `url` を毎回更新 or named tunnel。
- **token を repo にコミットしない**（env のみ・`.gitignore`）。`handoff.log` に diff 全文を残さない（path/要約のみ）＝ 将来の privacy 設計の練習（`04` R4）。
- **review は返すだけ・書き込まない**（attended でも自動 merge しない）。

---

Sources:
[A2A Python SDK tutorial (a2aprotocol.ai)](https://a2aprotocol.ai/docs/guide/google-a2a-python-sdk-tutorial) ·
[Multi-Agent Communication with the A2A Python SDK (TDS)](https://towardsdatascience.com/multi-agent-communication-with-the-a2a-python-sdk/) ·
[AgentCard concept (agent2agent.info)](https://agent2agent.info/docs/concepts/agentcard/) ·
[A2A protocol tutorial (IBM)](https://www.ibm.com/think/tutorials/use-a2a-protocol-for-ai-agent-communication)
