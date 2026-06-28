#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT_DIR"

if ! command -v node >/dev/null 2>&1; then
  echo "Node.js is required. Please install Node.js 18 or newer."
  exit 1
fi

PORT="${PORT:-4288}"
HOST="${HOST:-127.0.0.1}"

echo "Starting AI Cross-border Ecommerce System..."
echo "Project: $ROOT_DIR"
echo "URL: http://$HOST:$PORT"
echo

exec env PORT="$PORT" HOST="$HOST" node server.js
