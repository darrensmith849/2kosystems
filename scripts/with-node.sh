#!/bin/sh
# Run a script on a Node that can actually strip TypeScript.
#
# Herd puts its own Node 20 first on PATH in every new shell, so `npm run`
# picks that up and the .ts scripts fail to parse — regardless of .nvmrc or
# the engines field, neither of which npm enforces. This finds a Node >= 22
# and gets out of the way.
set -e

ok() { [ -x "$1" ] && [ "$("$1" -p 'process.versions.node.split(".")[0]' 2>/dev/null)" -ge 22 ] 2>/dev/null; }

if ok "$(command -v node 2>/dev/null)"; then
  exec node "$@"
fi

# Newest nvm install first, so this keeps working across upgrades.
for bin in $(ls -d "$HOME"/.nvm/versions/node/*/bin/node 2>/dev/null | sort -rV); do
  if ok "$bin"; then exec "$bin" "$@"; fi
done

echo "No Node >= 22 found. This repo needs $(cat .nvmrc 2>/dev/null || echo '22+') to run .ts scripts directly." >&2
exit 1
