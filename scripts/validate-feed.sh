#!/bin/sh
set -eu

base="${1:-http://127.0.0.1:8099}"
base="${base%/}"
channel_name="${2:-stable}"
expect_version="${3:-1.0.0}"
slug="${4:-suite-device-app}"
tmp="${TMPDIR:-.}/.validate-tmp"
rm -rf "$tmp"
mkdir -p "$tmp"
trap 'rm -rf "$tmp"' EXIT

# Cloudflare / WAF às vezes trata curl “nu” dos runners como bot.
curl_common='-sS -L --retry 4 --retry-delay 2 --retry-all-errors --connect-timeout 10 --max-time 120 -A suite-update-validate/1.0'

fail() {
  echo "erro  $1" >&2
  exit 1
}

case "$channel_name" in
  stable|beta|staging) ;;
  *) fail "canal inválido" ;;
esac
printf '%s\n' "$expect_version" | grep -Eq '^[0-9]+\.[0-9]+\.[0-9]+$' || fail "versão inválida"
printf '%s\n' "$slug" | grep -Eq '^[a-z0-9][a-z0-9-]{0,62}$' || fail "slug inválido"
channel="$base/$slug/$channel_name"

ok() {
  echo "ok  $1"
}

code() {
  # shellcheck disable=SC2086
  curl $curl_common -o "$tmp/discard" -w "%{http_code}" "$@"
}

headers() {
  # shellcheck disable=SC2086
  curl $curl_common -D - -o "$tmp/discard" "$@"
}

wait_health() {
  i=1
  while [ "$i" -le 8 ]; do
    if [ "$(code "$base/health")" = "200" ]; then
      return 0
    fi
    sleep 2
    i=$((i + 1))
  done
  return 1
}

wait_health || fail "GET /health deveria ser 200"
ok "GET /health 200"

# shellcheck disable=SC2086
curl $curl_common -f "$channel/latest.yml" -o "$tmp/latest.yml" || fail "GET latest.yml falhou"
grep -q "^version: ${expect_version}$" "$tmp/latest.yml" || fail "latest.yml sem version ${expect_version}"
ok "GET latest.yml 200"

manifest_cache=$(headers "$channel/latest.yml")
printf '%s\n' "$manifest_cache" | grep -qi 'cache-control:.*no-cache' || fail "latest.yml sem cache conservador"
ok "latest.yml com Cache-Control no-cache"

file=$(sed -n 's/^path: //p' "$tmp/latest.yml" | tr -d '\r' | head -n 1)
hash=$(sed -n 's/^sha512: //p' "$tmp/latest.yml" | tr -d '\r' | head -n 1)
[ -n "$file" ] || fail "latest.yml sem path"
[ -n "$hash" ] || fail "latest.yml sem sha512"

encoded=$(printf '%s' "$file" | sed 's/ /%20/g')
# shellcheck disable=SC2086
curl $curl_common -f "$channel/$encoded" -o "$tmp/installer" || fail "GET do instalador falhou"
ok "GET instalador 200"

actual=$(openssl dgst -sha512 -binary "$tmp/installer" | openssl base64 -A)
[ "$actual" = "$hash" ] || fail "sha512 do instalador não confere com latest.yml"
ok "sha512 do instalador confere"

installer_headers=$(headers -H "Range: bytes=0-15" "$channel/$encoded")
printf '%s\n' "$installer_headers" | grep -qE 'HTTP/.* 206( |$)' || fail "Range deveria responder 206"
printf '%s\n' "$installer_headers" | grep -qi 'content-range:' || fail "Range sem Content-Range"
# Proxies (Cloudflare) costumam omitir Accept-Ranges no 206; o importante é o Range funcionar.
if printf '%s\n' "$installer_headers" | grep -qi 'accept-ranges: bytes'; then
  ok "Accept-Ranges presente"
else
  echo "aviso  Accept-Ranges ausente (comum atrás de proxy); Range 206 ok"
fi
printf '%s\n' "$installer_headers" | grep -qi 'cache-control:.*immutable' || fail "instalador sem cache imutável"
ok "Range 206 e cache imutável do instalador"

blockmap="${file}.blockmap"
encoded_block=$(printf '%s' "$blockmap" | sed 's/ /%20/g')
# shellcheck disable=SC2086
curl $curl_common -f "$channel/$encoded_block" -o "$tmp/blockmap" || fail "GET blockmap falhou"
ok "GET blockmap 200"

[ "$(code "$channel/nao-existe.bin")" = "404" ] || fail "arquivo ausente deveria ser 404"
[ "$(code "$channel/")" = "404" ] || fail "diretório do canal não pode listar arquivos"
[ "$(code "$base/")" = "404" ] || fail "raiz não pode listar arquivos"
[ "$(code "$channel/.env")" = "403" ] || fail "arquivo oculto deveria ser 403"
[ "$(code -X POST "$channel/latest.yml")" = "403" ] || fail "POST deveria ser 403"
ok "404, sem autoindex e sem escrita"

echo "Feed conferido em $channel"
