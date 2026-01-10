#!/bin/bash
set -e

# Set authorization header with the token passed from environment
HEADERS="{\"Authorization\": \"Bearer $OPENAPI_TOKEN\"}"
export OPENAPI_MCP_HEADERS="$HEADERS"

# Use Railway's PORT or default to 8080
PORT="${PORT:-8080}"

echo "Starting openapi-mcp-server with proxy..."
echo "Using headers: $OPENAPI_MCP_HEADERS"
echo "Listening on port: $PORT"

# Install the server locally
cd /app/openapi-mcp-server && npm link

# Start the proxy in SSE server mode, passing through to the CLI tool
mcp-proxy --sse-port=$PORT --sse-host=0.0.0.0 --pass-environment -- openapi-mcp-server /app/teable-openapi.json