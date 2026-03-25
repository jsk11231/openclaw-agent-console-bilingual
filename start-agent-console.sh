#!/bin/zsh
set -euo pipefail
cd [workspace-root]
export HOST=0.0.0.0
export PORT=8787
exec /opt/homebrew/bin/node [workspace-root]/agent-console-server.js