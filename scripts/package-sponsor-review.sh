#!/bin/sh
set -eu

if [ "$#" -ne 1 ]; then
  printf 'Usage: %s OUTPUT.zip\n' "$0" >&2
  exit 2
fi

repository_root=$(CDPATH='' cd -- "$(dirname -- "$0")/.." && pwd)
git -C "$repository_root" archive --format=zip HEAD \
  .nojekyll revue BUUURT_Bibliotheque_Visuelle_20_Ecrans_Menu_NL.html > "$1"
