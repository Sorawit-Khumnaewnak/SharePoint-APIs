#!/usr/bin/env bash
set -euo pipefail

# ===============================
# Generate an RS256 client assertion JWT using a private key and certificate thumbprint.
# Outputs the JWT on stdout.
#
# Usage:
#   bash ./generate-jwt.sh
# ===============================

# Defaults are hardcoded per your tenant/app. Change if needed.
KEY_PATH="mock.key" # Mock private key path
EXP_SECS=31536000 # Mock expiration (1 year)
TENANT_ID="00000000-0000-0000-0000-000000000000" # Mock tenant ID
CLIENT_ID="11111111-1111-1111-1111-111111111111" # Mock client ID
THUMBPRINT_HEX="AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA" # Mock certificate thumbprint

aud="https://login.microsoftonline.com/${TENANT_ID}/oauth2/v2.0/token"
b64url(){ openssl base64 -A | tr '+/' '-_' | tr -d '='; }
x5t=$(echo -n "$THUMBPRINT_HEX" | xxd -r -p | b64url)
now=$(date +%s); iat=$now; nbf=$now; exp=$((now+EXP_SECS))
jti=$(command -v uuidgen >/dev/null 2>&1 && uuidgen | tr '[:upper:]' '[:lower:]' || openssl rand -hex 16)
header=$(printf '{"alg":"RS256","typ":"JWT","x5t":"%s"}' "$x5t")
payload=$(printf '{"iss":"%s","sub":"%s","aud":"%s","jti":"%s","nbf":%s,"iat":%s,"exp":%s}' "$CLIENT_ID" "$CLIENT_ID" "$aud" "$jti" "$nbf" "$iat" "$exp")
header_b64=$(printf '%s' "$header" | b64url); payload_b64=$(printf '%s' "$payload" | b64url)
unsigned="${header_b64}.${payload_b64}"; sig=$(printf '%s' "$unsigned" | openssl dgst -sha256 -sign "$KEY_PATH" | b64url)
printf '%s.%s\n' "$unsigned" "$sig"


