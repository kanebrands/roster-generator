#!/usr/bin/env python3
"""Build deterministic module, component, and package ZIPs at dist/."""

from io import BytesIO
from pathlib import Path
import xml.etree.ElementTree as ET
from zipfile import ZIP_DEFLATED, ZipFile, ZipInfo

ROOT = Path(__file__).resolve().parents[1]
VERSION = ET.parse(ROOT / "mod_roster.xml").getroot().findtext("version")
module_files = [ROOT / "mod_roster.xml"]
for folder in ("services", "src", "tmpl", "language", "media"):
    module_files.extend(path for path in (ROOT / folder).rglob("*") if path.is_file())

component_root = ROOT / "com_roster"
component_files = [path for path in component_root.rglob("*") if path.is_file()]
dist = ROOT / "dist"
dist.mkdir(exist_ok=True)


def add_file(archive: ZipFile, name: str, data: bytes) -> None:
    info = ZipInfo(name, date_time=(2026, 1, 1, 0, 0, 0))
    info.compress_type = ZIP_DEFLATED
    info.external_attr = 0o644 << 16
    archive.writestr(info, data)


def build_zip(files: list[Path], base: Path) -> bytes:
    buffer = BytesIO()
    with ZipFile(buffer, "w", ZIP_DEFLATED) as archive:
        for path in sorted(files):
            add_file(archive, path.relative_to(base).as_posix(), path.read_bytes())
    return buffer.getvalue()


module_zip = build_zip(module_files, ROOT)
component_zip = build_zip(component_files, component_root)

for name, data in (("mod_roster", module_zip), ("com_roster", component_zip)):
    output = dist / f"{name}-{VERSION}.zip"
    output.write_bytes(data)
    print(output)

package_output = dist / f"pkg_roster-{VERSION}.zip"
with ZipFile(package_output, "w", ZIP_DEFLATED) as archive:
    add_file(archive, "pkg_roster.xml", (ROOT / "pkg_roster.xml").read_bytes())
    add_file(archive, "constituents/mod_roster.zip", module_zip)
    add_file(archive, "constituents/com_roster.zip", component_zip)

print(package_output)
