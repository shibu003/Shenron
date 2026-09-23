// test_mcp_dispatch.mjs — T4: MCP dispatch の behavioral 番兵（U-1 surface guard=presence の「先」）。
// U-1 は「forRemote tool が dispatch 表に在る／REMOTE_DENY が advertise から外れる」を source/presence で固定する。
// 本 wave は remote（POST /mcp）で実 dispatch を呼んで shape を確認し、REMOTE_DENY が dispatch でも塞ぐ（hidden≠blocked）を
// behavior で証明する。plan_flow は mock seam で決定化し、clarify→plan→unavailable の3 mode を1 boot で踏む。
// stdio behavioral は本 wave 対象外（U-1 が presence 担保・hidden≠blocked は remote-error+hub-route で証明できる）
//   ＝scope-drop。トリガ＝「server.mjs↔hub の proxy 配線を回帰させたい必要が出たら openStdio(server.mjs) 版を足す」。
import assert from 'node:assert';
import { spawn } from 'node:child_process';
import { mkdtempSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const PORT = 8915, HUB = 'http://localhost:' + PORT;
const STATE_DIR = mkdtempSync(path.join(os.tmpdir(), 'mcpd-test-'));
const MOCK = path.join(STATE_DIR, 'mock-planner.json');
// queue: planFlow 1回ごとに 1 shift（REMOTE_DENY/hub_health/get_config は planFlow を通らない＝非消費）。
// ① clarify ② steps(→plan・#3 で mode:'plan') ③ stub-fail 文字列(→isStubFail→unavailable・#4 で tools_needed:[])
writeFileSync(MOCK, JSON.stringify([
  { clarify: [{ question: 'Q1' }] },
  { steps: [{ action: 'summarize the input', kind: 'prompt' }] },
  '[claude → stub]',
]));

const hub = spawn('node', ['prototype/hub/hub.mjs', '--port', String(PORT), '--vendor', 'mock'],
  { cwd: ROOT, stdio: 'ignore', env: { ...process.env, STATE_DIR, SHENRON_MOCK_PLANNER: MOCK, SHENRON_NO_AUTOSPAWN: '1', SHENRON_NO_SCHEDULER: '1', SHENRON_NO_ESCALATE: '1' } });
const waitUp = async () => { for (let i = 0; i < 60; i++) { try { if ((await fetch(HUB + '/api/health')).ok) return; } catch {} await new Promise((r) => setTimeout(r, 100)); } throw new Error('no boot'); };

// remote MCP: POST /mcp tools/call。openDev hub は bearerOk=true ゆえ token 不要。成功→{result:{content:[{text}]}}、throw→{error:{message}}（HTTP は 200）。
let _id = 0;
const mcp = async (name, args) => (await (await fetch(HUB + '/mcp', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ jsonrpc: '2.0', id: ++_id, method: 'tools/call', params: { name, arguments: args || {} } }) })).json());
const mcpOk = async (name, args) => { const r = await mcp(name, args); assert.ok(r.result, `${name}: result 有り（error=${JSON.stringify(r.error)}）`); return JSON.parse(r.result.content[0].text); };

let bad = false;
try {
  await waitUp();

  // ── plan_flow の3 mode（mock seam・1 boot で clarify→plan→unavailable・各回 queue を1 shift）──
  const r1 = await mcpOk('plan_flow', { goal: 'build a thing' });
  assert.equal(r1.mode, 'clarify', '① plan_flow → mode=clarify');
  assert.equal(r1.clarify[0].question, 'Q1', '① clarify[0].question=Q1');

  const r2 = await mcpOk('plan_flow', { goal: 'build a thing', save: true });
  assert.equal(r2.mode, 'plan', '② plan_flow → mode=plan（#3＝plan 経路にも明示 mode）');
  assert.ok(r2.steps.length > 0 && r2.workflowId, '② steps+workflowId（buildPlanIR→validateFlow→save の実走）');

  const r3 = await mcpOk('plan_flow', { goal: 'build a thing' });
  assert.equal(r3.mode, 'unavailable', '③ plan_flow(stub-fail) → mode=unavailable（PC0 honest failure）');
  assert.ok(Array.isArray(r3.tools_needed) && r3.tools_needed.length === 0, '③ unavailable も tools_needed:[]（#4＝clarify と対称・消費側 shape 安定）');

  // ── 非 plan tool の shape（queue 非消費）──
  const health = await mcpOk('hub_health');
  assert.ok(health.ok === true && typeof health.version === 'string', 'hub_health → {ok,version}');
  const cfg = await mcpOk('get_config');
  assert.ok(cfg && typeof cfg === 'object', 'get_config → object（secret 在否のみ）');

  // ── REMOTE_DENY: 5 tool を remote /mcp で呼ぶと dispatch で error（advertise を外すだけでなく実呼び出しも塞ぐ）──
  for (const denied of ['set_credential', 'set_permission', 'reset_password', 'list_users', 'set_role']) {
    const r = await mcp(denied, {});
    assert.ok(r.error && /not available on the remote surface/.test(r.error.message), `REMOTE_DENY "${denied}" → remote dispatch error`);
  }

  // ── hidden ≠ blocked（behavior）: list_users は remote で塞がるが能力自体は hub の通常 route で生存＝fence であって破壊ではない ──
  const lu = await (await fetch(HUB + '/api/auth/users')).json();   // openDev hub → /api/auth/users は到達
  assert.ok(Array.isArray(lu), 'list_users の能力は /api/auth/users で生存（remote 面だけ fence）');

  // ── parity: /mcp と HTTP は同一 backend（hub_health.version == /api/health.version）──
  const apiHealth = await (await fetch(HUB + '/api/health')).json();
  assert.equal(health.version, apiHealth.version, '/mcp hub_health と /api/health は同一 backend（version 一致）');

  console.log('test_mcp_dispatch: OK — remote dispatch behavior（3 mode#3#4 + REMOTE_DENY 拒否 + hidden≠blocked + parity）');
} catch (e) { bad = true; console.error('FAIL', e.message); }
finally { hub.kill(); }
process.exit(bad ? 1 : 0);
