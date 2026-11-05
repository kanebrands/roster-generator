#!/usr/bin/env python3
"""Build a deterministic Joomla installable ZIP at dist/."""

from pathlib import Path
import xml.etree.ElementTree as ET
from zipfile import ZIP_DEFLATED, ZipFile, ZipInfo

ROOT = Path(__file__).resolve().parents[1]
VERSION = ET.parse(ROOT / "mod_roster.xml").getroot().findtext("version")
FILES = [ROOT / "mod_roster.xml"]
for folder in ("services", "src", "tmpl", "language", "media"):
    FILES.extend(path for path in (ROOT / folder).rglob("*") if path.is_file())

output = ROOT / "dist" / f"mod_roster-{VERSION}.zip"
output.parent.mkdir(exist_ok=True)

with ZipFile(output, "w", ZIP_DEFLATED) as archive:
    for path in sorted(FILES):
        info = ZipInfo(path.relative_to(ROOT).as_posix(), date_time=(2026, 1, 1, 0, 0, 0))
        info.compress_type = ZIP_DEFLATED
        info.external_attr = 0o644 << 16
        archive.writestr(info, path.read_bytes())

print(output)
