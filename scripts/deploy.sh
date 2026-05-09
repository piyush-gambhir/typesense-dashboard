#!/usr/bin/env bash
# Local Vercel deploy. Run as `bash scripts/deploy.sh [production|development]`.
#
# Reads credentials from .env.deploy.<env> (gitignored).
# See .env.deploy.example for the full list.

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

ENV="${1:-production}"
DEPLOY_ENV_FILE=".env.deploy.${ENV}"

if [[ ! -f "$DEPLOY_ENV_FILE" ]]; then
  echo "error: ${DEPLOY_ENV_FILE} not found in $(pwd)" >&2
  echo "       copy .env.deploy.example to ${DEPLOY_ENV_FILE} and fill in your values." >&2
  exit 1
fi

# Load deploy creds (and don't echo them)
set -a
# shellcheck disable=SC1090
source "$DEPLOY_ENV_FILE"
set +a

: "${VERCEL_TOKEN:?set VERCEL_TOKEN in ${DEPLOY_ENV_FILE}}"
: "${VERCEL_SCOPE:?set VERCEL_SCOPE in ${DEPLOY_ENV_FILE}}"

VERCEL_FLAGS=(
  --token "$VERCEL_TOKEN"
  --scope "$VERCEL_SCOPE"
  --yes
)

if [[ "$ENV" == "production" ]]; then
  echo "==> Deploying to production via Vercel ($VERCEL_SCOPE)"
  npx --yes vercel@latest deploy --prod "${VERCEL_FLAGS[@]}"
else
  echo "==> Deploying preview to Vercel ($VERCEL_SCOPE)"
  npx --yes vercel@latest deploy "${VERCEL_FLAGS[@]}"
fi
