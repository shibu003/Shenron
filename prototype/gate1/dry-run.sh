#!/usr/bin/env bash
# dry-run.sh — solo, end-to-end dry-run of the GATE-1 review-branch loop, BEFORE you recruit a friend.
# Proves the A→B A2A round-trip with a real reviewer (codex|claude). De-risks the mechanism so the only
# remaining variable is the human. Isolated: uses its own port + a temp config — your prototype/config.json
# is NOT touched. Approve gate is auto-bypassed here (autoApprove) since it's a solo automated run.
#
#   prototype/gate1/dry-run.sh [codex|claude|stub] [branch]
#
# For the CROSS-MACHINE proof (NAT traversal), expose the B host yourself and point send.mjs at the URL:
#   node prototype/reviewer-server.mjs &                 # in one terminal (uses prototype/config.json)
#   ngrok http 8787                             # → https://xxxx.ngrok-free.app  (YOUR action; outward-facing)
#   B_URL=https://xxxx.ngrok-free.app A2A_SHARED_TOKEN=$A2A_SHARED_TOKEN node prototype/send.mjs <branch>
set -euo pipefail

REVIEWER="${1:-stub}"
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT"
BRANCH="${2:-$(git rev-parse --abbrev-ref HEAD)}"
PORT=8798

: "${A2A_SHARED_TOKEN:=$(openssl rand -hex 16)}"
export A2A_SHARED_TOKEN

CFG="$(mktemp -t gate1-dry.XXXXXX)"
AUDIT="$(mktemp -t gate1-dry-audit.XXXXXX)"
# empty allowlist = accept any repo (dry-run convenience; real runs allowlist exactly one repo).
# auditLog → temp file so a dry-run never contaminates the real prototype/handoff.log evidence (Codex).
cat > "$CFG" <<JSON
{ "port": $PORT, "publicUrl": "http://localhost:$PORT", "repoAllowlist": [], "reviewer": "$REVIEWER", "autoApprove": true, "auditLog": "$AUDIT" }
JSON

echo "▶ dry-run: reviewer=$REVIEWER  branch=$BRANCH  port=$PORT  (isolated — config.json untouched)"
node prototype/reviewer-server.mjs --config "$CFG" >/tmp/gate1-dry-b.log 2>&1 &
BPID=$!
trap 'kill "$BPID" 2>/dev/null || true; rm -f "$CFG" "$AUDIT"' EXIT

curl -sf --retry 30 --retry-connrefused --retry-delay 1 \
  -H "authorization: Bearer $A2A_SHARED_TOKEN" \
  "http://localhost:$PORT/.well-known/agent-card.json" >/dev/null && echo "✓ B host up"

set +e
B_URL="http://localhost:$PORT" node prototype/send.mjs "$BRANCH"; RC=$?
set -e
echo "— send exit=$RC (0=COMPLETED) —"
echo "— B host log —"; cat /tmp/gate1-dry-b.log
exit "$RC"
