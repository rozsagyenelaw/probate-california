#!/bin/bash
# Moves myprobateca.com to MyProbateCA's own Stripe account. Run ONLY after Rozsa approves the switch-over
# (and after the card-fee choice in APPROVAL-7). Dry run by default; add --apply to change Netlify.
#   scripts/stripe-account/cutover.sh test   # sets up the new account in TEST mode and prints what it created
#   scripts/stripe-account/cutover.sh live            # dry run: sets up live objects, shows the Netlify changes it would make
#   scripts/stripe-account/cutover.sh live --apply    # also writes the Netlify env vars and redeploys
# Keys come from Google Secret Manager (saved by Rozsa with ~/mpca-build/set-new-stripe-key.sh) straight into this
# process's environment. Nothing secret is printed, logged, written to a file or put on a command line.
# The old shared account is not touched (its webhook to this site can be disabled afterwards, separately).
# Rollback: restore the previous Netlify values (kept in Secret Manager as MPCA_NETLIFY_ROLLBACK_* by --apply) and redeploy.
set -euo pipefail
set +x
umask 077
MODE="${1:-}"; APPLY="${2:-}"
case "$MODE" in test|live) ;; *) echo "Usage: cutover.sh test|live [--apply]"; exit 1;; esac
GCLOUD="$HOME/Downloads/google-cloud-sdk/bin/gcloud"; PROJECT=probate-california
SITE_ID=38afa509-d975-4a69-a0a5-c2eaebf7e130; ACCOUNT_SLUG=rozsagyenelaw
HERE="$(cd "$(dirname "$0")" && pwd)"
U=$(echo "$MODE" | tr a-z A-Z)

export STRIPE_TARGET_KEY="$("$GCLOUD" secrets versions access latest --secret "STRIPE_MPCA_${U}_KEY" --project "$PROJECT")"
WH_FLAGS=(--webhook-url https://myprobateca.com/.netlify/functions/stripe-webhook --secret-sink "gsm:STRIPE_MPCA_${U}_WEBHOOK_SECRET")
[ "$MODE" = test ] && WH_FLAGS+=(--disable-webhook)   # test events are proven locally with stripe listen
REPORT="$(node "$HERE/setup-account.cjs" "${WH_FLAGS[@]}")"
echo "$REPORT"
unset STRIPE_TARGET_KEY
[ "$MODE" = test ] && { echo "Test mode set up. Prove it with the W2-payments e2e scripts (OVERRIDE_PRICES from the report)."; exit 0; }

echo "Netlify variables that the switch-over sets on site california-probate (values not shown):"
echo "$REPORT" | python3 -c 'import json,sys; [print("  " + p["env"] + " = ..." + p["price"][-4:]) for p in json.load(sys.stdin)["products"]]'
echo "  STRIPE_SECRET_KEY = (new account live key, from Secret Manager)"
echo "  STRIPE_WEBHOOK_SECRET = (new endpoint signing secret, from Secret Manager)"
[ "$APPLY" = "--apply" ] || { echo "Dry run: nothing changed on Netlify. Add --apply after Rozsa approves."; exit 0; }

# Write the variables through the Netlify API (token read from the Netlify CLI config; values via stdin only)
NEW_KEY="$("$GCLOUD" secrets versions access latest --secret STRIPE_MPCA_LIVE_KEY --project "$PROJECT")"
NEW_WH="$("$GCLOUD" secrets versions access latest --secret STRIPE_MPCA_LIVE_WEBHOOK_SECRET --project "$PROJECT")"
printf '%s\n%s\n%s' "$NEW_KEY" "$NEW_WH" "$REPORT" | SITE_ID="$SITE_ID" ACCOUNT_SLUG="$ACCOUNT_SLUG" python3 -c '
import json, os, sys, urllib.request, pathlib
key, wh, report = sys.stdin.read().split("\n", 2)
cfg = json.loads((pathlib.Path.home() / "Library/Preferences/netlify/config.json").read_text())
token = next(u["auth"]["token"] for u in cfg["users"].values() if u.get("auth", {}).get("token"))
site, acct = os.environ["SITE_ID"], os.environ["ACCOUNT_SLUG"]
def api(method, path, body=None):
    r = urllib.request.Request("https://api.netlify.com/api/v1" + path, method=method, data=json.dumps(body).encode() if body is not None else None, headers={"Authorization": "Bearer " + token, "Content-Type": "application/json"})
    with urllib.request.urlopen(r) as resp: return json.loads(resp.read() or b"null")
values = {"STRIPE_SECRET_KEY": key, "STRIPE_WEBHOOK_SECRET": wh}
for p in json.loads(report)["products"]: values[p["env"]] = p["price"]
current = {v["key"]: v["values"][0]["value"] for v in api("GET", f"/accounts/{acct}/env?site_id={site}") if v["key"] in values}
# keep the previous values for rollback, in Secret Manager only
import subprocess
for k, v in current.items():
    name = "MPCA_NETLIFY_ROLLBACK_" + k
    ok = subprocess.run([os.path.expanduser("~/Downloads/google-cloud-sdk/bin/gcloud"), "secrets", "describe", name, "--project", "probate-california"], capture_output=True).returncode == 0
    subprocess.run([os.path.expanduser("~/Downloads/google-cloud-sdk/bin/gcloud"), "secrets"] + (["versions", "add", name] if ok else ["create", name, "--replication-policy=automatic"]) + ["--project", "probate-california", "--data-file=-"], input=v.encode(), capture_output=True, check=True)
for k, v in values.items():
    api("PATCH", f"/accounts/{acct}/env/{k}?site_id={site}", {"context": "all", "value": v})
    print("set", k)
api("POST", f"/sites/{site}/builds", {})
print("Redeploy started.")
'
unset NEW_KEY NEW_WH
