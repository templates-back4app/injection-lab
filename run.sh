#!/usr/bin/env bash
# A comment that is markup: stored, rendered in a real browser, then refused.
#
#   ./run.sh
#
# Needs Docker, Node 22 and Google Chrome.
set -uo pipefail
cd "$(dirname "$0")"

# Fail here rather than three minutes from now with an empty result.
docker info >/dev/null 2>&1 || {
  echo ""
  echo "  Docker is not running. Start Docker Desktop (or your daemon) and run this again."
  echo ""
  exit 1
}

ready() { for _ in $(seq 1 120); do
    c=$(curl -s -o /dev/null -w '%{http_code}' -H 'X-Parse-Application-Id: inject' \
      'http://127.0.0.1:1347/parse/classes/Comment?limit=0'); [ "$c" != 000 ] && return; sleep 0.5
  done; echo "    !! the backend never answered" >&2; exit 1; }

docker compose down -v >/dev/null 2>&1
docker compose up -d >/dev/null 2>&1
ready
node run.mjs

docker compose stop parse >/dev/null 2>&1
GUARD_INPUT=true docker compose up -d parse >/dev/null 2>&1
ready
node guarded.mjs
