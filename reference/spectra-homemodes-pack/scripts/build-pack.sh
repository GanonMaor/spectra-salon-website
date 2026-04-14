#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(pwd)"
while [[ "$ROOT_DIR" != "/" && ! -f "$ROOT_DIR/CLAUDE.md" ]]; do
  ROOT_DIR="$(dirname "$ROOT_DIR")"
done

if [[ ! -f "$ROOT_DIR/CLAUDE.md" ]]; then
  echo "Could not locate repository root (CLAUDE.md not found)."
  exit 1
fi

PACK_DIR="$ROOT_DIR/reference/spectra-homemodes-pack"

mkdir -p "$PACK_DIR"/{mobile/src,docs/{architecture,product},governance/cursor-rules,meta,scripts}

cp "$ROOT_DIR/apps/mobile/App.tsx" "$PACK_DIR/mobile/" || true
cp "$ROOT_DIR/apps/mobile/package.json" "$PACK_DIR/mobile/" || true
cp -R "$ROOT_DIR/apps/mobile/src/navigation" "$PACK_DIR/mobile/src/" || true
cp -R "$ROOT_DIR/apps/mobile/src/screens" "$PACK_DIR/mobile/src/" || true
cp -R "$ROOT_DIR/apps/mobile/src/state" "$PACK_DIR/mobile/src/" || true
cp -R "$ROOT_DIR/apps/mobile/src/components" "$PACK_DIR/mobile/src/" || true
cp -R "$ROOT_DIR/apps/mobile/src/viewmodels" "$PACK_DIR/mobile/src/" || true
cp -R "$ROOT_DIR/apps/mobile/src/mocks" "$PACK_DIR/mobile/src/" || true
cp -R "$ROOT_DIR/apps/mobile/src/services" "$PACK_DIR/mobile/src/" || true

cp "$ROOT_DIR/docs/architecture/HomeModes"*.md "$PACK_DIR/docs/architecture/" || true
cp "$ROOT_DIR/docs/product/Spectra-Screen-Map.md" "$PACK_DIR/docs/product/" || true
cp "$ROOT_DIR/docs/product/Spectra-MVP-Build-Contract.md" "$PACK_DIR/docs/product/" || true
cp "$ROOT_DIR/docs/product/Spectra-System-Blueprint.md" "$PACK_DIR/docs/product/" || true

cp "$ROOT_DIR/CLAUDE.md" "$PACK_DIR/governance/" || true
cp "$ROOT_DIR/.cursor/rules/"*.mdc "$PACK_DIR/governance/cursor-rules/" 2>/dev/null || true
cp "$ROOT_DIR/.cursor/rules/"*.md "$PACK_DIR/governance/cursor-rules/" 2>/dev/null || true

git -C "$ROOT_DIR" rev-parse HEAD > "$PACK_DIR/meta/SOURCE_COMMIT.txt"
(
  cd "$PACK_DIR"
  python3 - <<'PYIN'
from pathlib import Path
import hashlib
pack = Path('.')
meta = pack / "meta"
files = sorted([x for x in pack.rglob("*") if x.is_file()])
with (meta / "FILE_LIST.txt").open("w", encoding="utf-8") as f:
    for file in files:
        f.write(str(file.relative_to(pack)) + "\n")
with (meta / "SHA256SUMS.txt").open("w", encoding="utf-8") as f:
    for file in files:
        digest = hashlib.sha256(file.read_bytes()).hexdigest()
        f.write(f"{digest}  {file.relative_to(pack)}\n")
PYIN
)

echo "Pack built at: $PACK_DIR"
