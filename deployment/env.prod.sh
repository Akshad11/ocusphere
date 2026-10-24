#!/usr/bin/env bash
# Wrapper pointing to ./env.prod
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
bash "${SCRIPT_DIR}/env.prod" "$@"
