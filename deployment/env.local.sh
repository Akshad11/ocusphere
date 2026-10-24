#!/usr/bin/env bash
# Wrapper pointing to ./env.local
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
bash "${SCRIPT_DIR}/env.local" "$@"
