#!/bin/sh
# Roda na VPS, depois do envio para a pasta de incoming.
# stage: confere e publica em /{slug}/staging/ (baixável para teste).
# publish: publica no canal (stable/beta) de produção.
#
# Aceita Windows (latest.yml + .exe), Mac (latest-mac.yml + .zip) e/ou Linux (latest-linux.yml + .AppImage).
# Uso: publish-remote.sh <channel> <version> <mode> <incoming> [slug]

set -eu

fail() {
  echo "erro  $1" >&2
  exit 1
}

channel="${1:-}"
version="${2:-}"
mode="${3:-}"
incoming="${4:-}"
slug="${5:-electron-test}"
volume="${SUITE_UPDATE_VOLUME_PATH:-/var/lib/docker/volumes/suite_update_storage/_data}"

case "$channel" in
  stable|beta) ;;
  *) fail "canal inválido" ;;
esac

case "$mode" in
  stage|publish) ;;
  *) fail "modo inválido" ;;
esac

printf '%s\n' "$version" | grep -Eq '^[0-9]+\.[0-9]+\.[0-9]+$' || fail "versão inválida"
printf '%s\n' "$slug" | grep -Eq '^[a-z0-9][a-z0-9-]{0,62}$' || fail "slug inválido"
[ -d "$incoming" ] || fail "pasta de incoming inexistente"

if [ "$mode" = "stage" ]; then
  public="$volume/$slug/staging"
else
  public="$volume/$slug/$channel"
fi

publish_one() {
  manifest_name="$1"
  [ -f "$incoming/$manifest_name" ] || return 1

  file=$(sed -n 's/^path: //p' "$incoming/$manifest_name" | tr -d '\r' | head -n 1)
  hash=$(sed -n 's/^sha512: //p' "$incoming/$manifest_name" | tr -d '\r' | head -n 1)
  manifest_version=$(sed -n 's/^version: //p' "$incoming/$manifest_name" | tr -d '\r' | head -n 1)

  [ -n "$file" ] || fail "$manifest_name sem path"
  [ -n "$hash" ] || fail "$manifest_name sem sha512"
  [ "$manifest_version" = "$version" ] || fail "versão do $manifest_name diferente da publicação"
  case "$file" in
    */*|*..*|'') fail "nome de arquivo inválido no $manifest_name" ;;
  esac

  [ -f "$incoming/$file" ] || fail "instalador ausente no incoming ($file)"
  # AppImage embute o blockmap; o arquivo .blockmap lateral é opcional.
  need_blockmap=1
  case "$file" in
    *.AppImage) need_blockmap=0 ;;
  esac
  if [ "$need_blockmap" -eq 1 ]; then
    [ -f "$incoming/$file.blockmap" ] || fail "blockmap ausente no incoming ($file.blockmap)"
  fi

  actual=$(openssl dgst -sha512 -binary "$incoming/$file" | openssl base64 -A)
  [ "$actual" = "$hash" ] || fail "sha512 do instalador não confere ($file)"

  echo "ok  incoming conferido para $version ($manifest_name) → $channel ($mode)"

  [ -d "$volume" ] || fail "volume inexistente em $volume"
  mkdir -p "$public"

  install -m 644 "$incoming/$file" "$public/$file.tmp"
  mv "$public/$file.tmp" "$public/$file"
  if [ -f "$incoming/$file.blockmap" ]; then
    install -m 644 "$incoming/$file.blockmap" "$public/$file.blockmap.tmp"
    mv "$public/$file.blockmap.tmp" "$public/$file.blockmap"
  fi
  install -m 644 "$incoming/$manifest_name" "$public/$manifest_name.tmp"
  mv "$public/$manifest_name.tmp" "$public/$manifest_name"

  echo "ok  $version ($manifest_name) publicada em $public"
  return 0
}

found=0
if publish_one latest.yml; then
  found=1
fi
if publish_one latest-mac.yml; then
  found=1
  # DMG opcional: instalação manual / Launchpad. O zip continua sendo o feed do updater.
  for dmg in "$incoming"/*.dmg; do
    [ -f "$dmg" ] || continue
    base=$(basename "$dmg")
    case "$base" in
      */*|*..*) continue ;;
    esac
    install -m 644 "$dmg" "$public/$base.tmp"
    mv "$public/$base.tmp" "$public/$base"
    echo "ok  DMG $base publicado em $public (download manual)"
  done
fi
if publish_one latest-linux.yml; then
  found=1
fi
[ "$found" -eq 1 ] || fail "incoming sem latest.yml, latest-mac.yml nem latest-linux.yml"

# Origem opcional para o painel (panel|github|feed).
source_name="${SUITE_UPDATE_RELEASE_SOURCE:-}"
case "$source_name" in
  panel|github|feed)
    printf '%s\n' "$source_name" > "$public/source-$version.txt"
    chmod 644 "$public/source-$version.txt"
    echo "ok  origem $source_name registrada para $version"
    ;;
esac

# Em staging, guarda o canal de destino para o botão "Promover" no painel.
if [ "$mode" = "stage" ]; then
  printf '%s\n' "$channel" > "$public/target-channel.txt"
  chmod 644 "$public/target-channel.txt"
  echo "ok  staging baixável em /$slug/staging/ (destino previsto: $channel)"
fi
