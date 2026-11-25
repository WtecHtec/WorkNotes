#!/usr/bin/env bash
set -euo pipefail
echo "== Auth health =="
curl -fsS http://localhost:3002/health
echo
echo "== MCP health =="
curl -fsS http://localhost:3001/health
echo
echo "== Protected resource metadata =="
curl -fsS http://localhost:3001/.well-known/oauth-protected-resource
echo
echo "== Authorization server metadata =="
curl -fsS http://localhost:3002/.well-known/oauth-authorization-server
echo
echo "== Unauthenticated MCP request (expect HTTP 401) =="
curl -i http://localhost:3001/mcp || true
