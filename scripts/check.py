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
    component = ET.parse(ROOT / "com_roster/com_roster.xml").getroot()
    package = ET.parse(ROOT / "pkg_roster.xml").getroot()
    package_feed = ET.parse(ROOT / "updates/pkg_roster.xml").getroot()
    version = manifest.findtext("version")
    assert version and re.fullmatch(r"\d+\.\d+\.\d+", version), "Invalid manifest version"
    assert feed.findtext("update/version") == version, "Update feed version differs"
    assert feed.findtext("update/element") == "mod_roster", "Wrong update element"
    assert feed.findtext("update/client") == "site", "Wrong update client"
    expected_url = f"https://github.com/kanebrands/roster-generator/releases/download/v{version}/mod_roster-{version}.zip"
    assert feed.findtext("update/downloads/downloadurl") == expected_url, "Release URL differs"
    assert not args.tag or args.tag == f"v{version}", "Tag differs from manifest version"
    assert component.findtext("version") == version, "Component version differs"
    assert component.findtext("element") == "com_roster", "Component element differs"
    assert package.findtext("version") == version, "Package version differs"
    assert package.findtext("packagename") == "roster", "Package name differs"
    assert package_feed.findtext("update/version") == version, "Package feed version differs"
    assert package_feed.findtext("update/element") == "pkg_roster", "Package feed element differs"
    assert package_feed.findtext("update/type") == "package", "Package feed type differs"
    package_url = f"https://github.com/kanebrands/roster-generator/releases/download/v{version}/pkg_roster-{version}.zip"
    assert package_feed.findtext("update/downloads/downloadurl") == package_url, "Package release URL differs"
    package_files = package.find("files")
    assert package_files is not None and package_files.get("folder") == "constituents"
    assert {(entry.get("type"), entry.get("id"), entry.text) for entry in package_files} == {
        ("module", "mod_roster", "mod_roster.zip"),
        ("component", "com_roster", "com_roster.zip"),
    }, "Package constituents differ"

    required = [
        "services/provider.php", "src/Dispatcher/Dispatcher.php", "src/Helper/RosterHelper.php",
        "src/Field/IntroField.php", "src/Field/RosterimportField.php",
        "tmpl/default.php", "media/css/site.css", "media/css/admin.css",
        "media/js/admin-import.js", "language/en-GB/mod_roster.ini",
        "language/en-GB/mod_roster.sys.ini",
    ]
    for filename in required:
        assert (ROOT / filename).is_file(), f"Missing {filename}"
    component_required = [
        "com_roster.xml", "admin/services/provider.php", "admin/src/Extension/RosterComponent.php",
        "site/src/Controller/DisplayController.php",
        "site/src/View/Roster/HtmlView.php", "site/src/Service/Router.php", "site/tmpl/roster/default.php",
        "site/tmpl/roster/default.xml", "admin/language/en-GB/com_roster.sys.ini",
        "admin/language/en-GB/com_roster.ini", "site/language/en-GB/com_roster.ini",
    ]
    for filename in component_required:
        assert (ROOT / "com_roster" / filename).is_file(), f"Missing com_roster/{filename}"
    ET.parse(ROOT / "com_roster/site/tmpl/roster/default.xml")

    print(f"Release metadata OK: {version}")


if __name__ == "__main__":
    try:
        main()
    except (AssertionError, ET.ParseError) as error:
        sys.exit(str(error))
