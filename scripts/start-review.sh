#!/bin/sh
set -eu

repository_root=$(CDPATH='' cd -- "$(dirname -- "$0")/.." && pwd)
exec python3 -m http.server 3000 --bind 0.0.0.0 --directory "$repository_root"
