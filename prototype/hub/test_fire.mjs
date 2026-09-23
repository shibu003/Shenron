// test_fire.mjs — T5: mock seam で「LLM 出力に依存する node 挙動」を決定論的に実走する（stub では出力が echo のみで届かない層）。
// test_nodes.mjs は --vendor stub で全 kind の発火/dispatch/分岐(then+else)を既にカバー済。本 wave はその「先」＝
//   ① consensus の medoid 選択（distinct な vendor 出力の中心を採る・outlier を棄却）＝「なぜ Claude 単体でなく神龍か」の構造核
//   ② router の `contains` 述語を、baked 入力でなく上流 LLM ノードの mock 出力で駆動（PC2 が router を強制する設計の実証）
// だけを mock 出力で固める。--vendor mock ＝ EXEC_VENDOR='mock' ゆえ全ノードの vendor 呼び出しが planner seam を貫通し決定論化。
import assert from 'node:assert';
import { spawn } from 'node:child_process';
import { mkdtempSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const PORT = 8916, HUB = 'http://localhost:' + PORT;
const STATE_DIR = mkdtempSync(path.join(os.tmpdir(), 'fire-test-'));
const MOCK = path.join(STATE_DIR, 'mock-planner.json');
// queue: vendor 呼び出し 1回ごとに 1 shift。フローを下記の順で走らせるので index は決定的。
//  [0-2] consensus の3 vendor（a,b が類似・c が outlier → medoid は a）  [3] router-A の上流 prompt（URGENT 含む→then）  [4] router-B の上流（URGENT 無→else）
writeFileSync(MOCK, JSON.stringify([
  'the quick brown fox jumps high',       // consensus vendor a
  'the quick brown fox runs fast',        // consensus vendor b（a と高 jaccard）
  'zzz qqq www vvv totally unrelated',     // consensus vendor c（outlier・共有トークン無）
  'URGENT: the production server is down', // router-A 上流 prompt 出力（contains URGENT → then）
  'all systems calm and nominal today',    // router-B 上流 prompt 出力（URGENT 無 → else）
]));

const hub = spawn('node', ['prototype/hub/hub.mjs', '--port', String(PORT), '--vendor', 'mock'],
  { cwd: ROOT, stdio: 'ignore', env: { ...process.env, STATE_DIR, SHENRON_MOCK_PLANNER: MOCK, SHENRON_NO_AUTOSPAWN: '1', SHENRON_NO_SCHEDULER: '1', SHENRON_NO_ESCALATE: '1' } });
const get = async (p) => (await fetch(HUB + p)).json();
const post = async (p, b) => (await fetch(HUB + p, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(b || {}) })).json();
const waitUp = async () => { for (let i = 0; i < 60; i++) { try { if ((await fetch(HUB + '/api/health')).ok) return; } catch {} await new Promise((r) => setTimeout(r, 100)); } throw new Error('no boot'); };
const runAndWait = async (nodes, edges, input) => {
  const r = await post('/api/runflow', { nodes, edges, input: input || '' });
  if (!r.runId) return r;
  for (let i = 0; i < 80; i++) { const run = await get('/api/runs/' + r.runId); if (run.status !== 'running') return run; await new Promise((res) => setTimeout(res, 100)); }
  throw new Error('run did not finish: ' + r.runId);
};

let bad = false;
try {
  await waitUp();

  // ① consensus medoid — 3 vendor が distinct な値を返し、jaccard 中心（a,b の類似ペア）を採り outlier(c) を棄却する
  let run = await runAndWait(
    [{ id: 'i', kind: 'input', config: { text: 'rank' } }, { id: 'cn', kind: 'consensus', config: { vendors: 'a,b,c', prompt: 'answer' } }, { id: 'o', kind: 'output' }],
    [{ source: 'i', target: 'cn' }, { source: 'cn', target: 'o' }]);
  assert.equal(run.status, 'completed', 'consensus(medoid) run 完了');
  assert.ok(/\[consensus a /.test(run.outputs.cn), 'consensus: medoid=a（a,b 類似ペアの中心・tie は先勝ち）を picked に');
  assert.ok(run.outputs.cn.includes('quick brown fox'), 'consensus: 採用テキストは中心(a)のもの');
  assert.ok(!run.outputs.cn.includes('zzz qqq'), 'consensus: outlier(c) のテキストは採られない（medoid が外れ値を棄却）');
  console.log('OK consensus medoid (distinct 値 → 中心採用・outlier 棄却)');

  // ②-A router `contains` — 上流 prompt の mock 出力が "URGENT" を含む → then 発火・else skip（baked でなく LLM 出力で分岐）
  run = await runAndWait(
    [{ id: 'i', kind: 'input', config: { text: 'check' } }, { id: 'p', kind: 'prompt', config: { template: 'status: {input}' } },
     { id: 'r', kind: 'router', config: { predicate: 'contains', value: 'URGENT' } }, { id: 't', kind: 'output' }, { id: 'e', kind: 'output' }],
    [{ source: 'i', target: 'p' }, { source: 'p', target: 'r' }, { source: 'r', target: 't', branch: 'then' }, { source: 'r', target: 'e', branch: 'else' }]);
  assert.equal(run.routerPick.r, 'then', 'router(contains): 上流 LLM 出力に URGENT → then');
  assert.ok('t' in run.outputs && run.skipped.includes('e'), 'router(contains/then): then 発火・else skip');
  assert.ok(run.outputs.p.includes('URGENT'), 'router(contains): 分岐は baked 入力でなく上流 mock 出力で決まる');
  console.log('OK router contains → then (動的上流出力で分岐)');

  // ②-B router `contains` — 上流出力に "URGENT" 無 → else 発火・then skip（同述語の逆ケース）
  run = await runAndWait(
    [{ id: 'i', kind: 'input', config: { text: 'check' } }, { id: 'p', kind: 'prompt', config: { template: 'status: {input}' } },
     { id: 'r', kind: 'router', config: { predicate: 'contains', value: 'URGENT' } }, { id: 't', kind: 'output' }, { id: 'e', kind: 'output' }],
    [{ source: 'i', target: 'p' }, { source: 'p', target: 'r' }, { source: 'r', target: 't', branch: 'then' }, { source: 'r', target: 'e', branch: 'else' }]);
  assert.equal(run.routerPick.r, 'else', 'router(contains): URGENT 無 → else');
  assert.ok('e' in run.outputs && run.skipped.includes('t'), 'router(contains/else): else 発火・then skip');
  console.log('OK router contains → else');

  console.log('test_fire: OK — consensus medoid + router contains（mock 出力依存の node 挙動・stub では届かない層）');
} catch (e) { bad = true; console.error('FAIL', e.stack || e.message); }
finally { hub.kill(); }
process.exit(bad ? 1 : 0);
