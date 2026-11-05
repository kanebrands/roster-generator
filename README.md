# Roster

Roster is a Joomla site module for an editable, sectioned member roster, plus a small companion component that lets a roster be selected as a menu item type. It is designed for Joomla 5 and Joomla 6. The public page places a prominent title above ordered section headings, displays names in a clean four-column grid that adapts to smaller screens, and ends with a legend explaining special markings. The administrator editor follows Joomla's light or dark color scheme and uses its native controls.

![Synthetic roster page preview with sections, names, flags, and legend](docs/roster-preview.png)

The preview uses invented names and sample sections and flags.

## Requirements

- Joomla 5.x or 6.x
- PHP 8.1 or newer for Joomla 5; PHP 8.3 or newer for Joomla 6
- Joomla administrator access to install and edit site modules

## Install

1. Download the latest **`pkg_roster-X.Y.Z.zip`** from the [releases page](https://github.com/kanebrands/roster-generator/releases). This package installs both the Roster module and its menu item component. If you previously installed only the module, installing the package upgrades it and adds the menu item type. The standalone `mod_roster-X.Y.Z.zip` remains available for module-only installs.
2. In Joomla administrator, go to **System > Install > Extensions** and upload the ZIP.
3. Go to **Content > Site Modules > New > Roster**, or open an existing Roster module. Enter the content on the **Module** tab and save it.
4. Set **Status** to **Published** and **Show Title** to **Hide**. The **Page title** setting supplies the public heading. Under **Menu Assignment**, choose **On all pages**; this allows Joomla to load the roster from its ID on the public page. A template position is not needed when using either dedicated-page method below.

### Publish directly as a Roster menu item

1. In **Content > Site Modules**, note the roster's numeric **ID** (the module instance ID, not the extension ID under System > Manage > Extensions). Create one module for each separate roster.
2. Go to **Menus**, open the menu that should contain the page, and select **New**.
3. Enter the menu title. For **Menu Item Type**, select **Roster > Roster**.
4. In **Roster module**, select the roster module you want this page to display. Save and publish the menu item.
5. Open the menu item on the public site. If the page reports that the roster is unavailable, check that the selected module is published and its **Menu Assignment** includes this menu item (or is **On all pages**).

### Publish through an article

1. In **Content > Site Modules**, note the published roster's numeric **ID**.
2. Make sure Joomla's **Content - Load Modules** plugin is enabled under **System > Manage > Plugins**.
3. Create a Joomla article containing `{loadmoduleid MODULE_ID}`, replacing `MODULE_ID` with the roster module's ID. Publish the article.
4. Under **Menus**, create a menu item of type **Articles > Single Article** and select the article. Publish the menu item.

You may also assign the module to a template position and menu items to display it within an existing page layout. Choose the publishing route that fits the site's navigation.

## Edit the roster

- **Page title:** Heading shown above the roster.
- **Sections:** Add, rename, remove, and reorder headings. An empty section still displays its heading.
- **Members:** Add, edit, remove, and reorder people. Enter one or more *existing section headings*, one per line, in **Assigned sections**. A member assigned to two sections appears in both. Section names must match exactly, including capitalization. If you rename a section, update its member assignments too.
- **Marking:** Enter a symbol such as `*` or `**` on a member row.
- **Legend:** Add each marking and its meaning, such as `*` = `Section Leader`.
- **Import roster:** Paste or upload a `.txt` file with a plain heading or `**Heading**` on its own line, one name per line, and a blank line between sections. In this format, trailing `*`, `**`, `†`, `‡`, or `§` become flags; define their meanings on final lines such as `*Principal`. CSV must start with `Name,Section,Flags`; use one row per assignment and quote fields containing commas. CSV flags may contain any text. Matching names and section headings are merged case-insensitively; imported flags replace existing flags for matching members. The editor shows an error when the file is unreadable or malformed. Review the rows and save to persist the import.
- **Preview roster:** Click **Preview roster** to render the current editor values before saving or publishing. The preview is visible only in the administrator editor.
- **Display options:** Choose editor order or alphabetical order by last name within each section. The preview follows this setting.

Create additional rosters with **Content > Site Modules > New > Roster**. Each module instance has separate content, publication status, and menu assignment. Select each instance in its own Roster menu item, or use its module ID in a different article.

Member order in the editor controls order within every assigned section. Public output uses four columns on wide screens, two on medium screens, and one on phones. Text is escaped before it reaches the page.

Module settings are stored by Joomla with the module record. No separate database tables or external services are used.

## Updates and releases

The package registers `updates/pkg_roster.xml` as its Joomla update feed; the standalone module registers `updates/mod_roster.xml`. Each release must update all manifest and feed versions and their ZIP URLs. Push the feed changes to `main`, then push a matching `vX.Y.Z` tag. The [release workflow](.github/workflows/release.yml) uploads `pkg_roster-X.Y.Z.zip`, `mod_roster-X.Y.Z.zip`, and `com_roster-X.Y.Z.zip` to the GitHub release. Install or update with the package to keep the module and menu item component together.

To build locally:

```sh
python3 scripts/build.py
```

The generated ZIPs are placed in `dist/`. For removal, use **System > Manage > Extensions** and uninstall **Roster Package**. Copy any roster data you need first; uninstalling removes the roster module instances and their settings.

## Development checks

```sh
find services src tmpl com_roster -name '*.php' -print0 | xargs -0 -n1 php -l
python3 scripts/check.py
node --check media/js/admin-import.js
node scripts/test-import.js
node scripts/test-editor.js
php -d zend.assertions=1 scripts/test-render.php
php -d zend.assertions=1 scripts/test-assets.php
python3 scripts/build.py
```

Syntax and package checks do not replace installation checks in disposable Joomla 5 and Joomla 6 sites. Verify the module editor, add/edit/delete flows, multi-section assignments, output, and update discovery there before using a live site.
