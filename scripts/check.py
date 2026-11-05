#!/usr/bin/env python3
"""Check manifest, update feed, and release naming before packaging."""

import argparse
from pathlib import Path
import re
import sys
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--tag", help="Expected release tag, for example v0.0.1")
    args = parser.parse_args()

    manifest = ET.parse(ROOT / "mod_roster.xml").getroot()
    feed = ET.parse(ROOT / "updates/mod_roster.xml").getroot()
    version = manifest.findtext("version")
    assert version and re.fullmatch(r"\d+\.\d+\.\d+", version), "Invalid manifest version"
    assert feed.findtext("update/version") == version, "Update feed version differs"
    assert feed.findtext("update/element") == "mod_roster", "Wrong update element"
    assert feed.findtext("update/client") == "site", "Wrong update client"
    expected_url = f"https://github.com/kanebrands/roster-generator/releases/download/v{version}/mod_roster-{version}.zip"
    assert feed.findtext("update/downloads/downloadurl") == expected_url, "Release URL differs"
    assert not args.tag or args.tag == f"v{version}", "Tag differs from manifest version"

    required = [
        "services/provider.php", "src/Dispatcher/Dispatcher.php", "src/Helper/RosterHelper.php",
        "src/Field/IntroField.php", "src/Field/RosterimportField.php",
        "tmpl/default.php", "media/css/site.css", "media/css/admin.css",
        "media/js/admin-import.js", "language/en-GB/mod_roster.ini",
        "language/en-GB/mod_roster.sys.ini",
    ]
    for filename in required:
        assert (ROOT / filename).is_file(), f"Missing {filename}"

    print(f"Release metadata OK: {version}")


if __name__ == "__main__":
    try:
        main()
    except (AssertionError, ET.ParseError) as error:
        sys.exit(str(error))
