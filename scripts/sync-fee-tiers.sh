#!/bin/bash
# Copies the cockpit's fee module (portal functions/shared/feeTiers.mjs) next to the checkout's parity test, so
# netlify/functions/test/fee-parity.test.js proves checkout, payment pages and cockpit charge the same fee.
# Usage: scripts/sync-fee-tiers.sh <path to a myprobateca-portal checkout>
set -euo pipefail
PORTAL="${1:?path to myprobateca-portal checkout}"
HERE="$(cd "$(dirname "$0")/.." && pwd)"
cp "$PORTAL/functions/shared/feeTiers.mjs" "$HERE/netlify/functions/test/fixtures/feeTiers.cockpit.mjs"
echo "synced feeTiers.mjs"
