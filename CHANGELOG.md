# Changelog

## 0.0.5 - 2026-11-04

- Added a companion Joomla component with a Roster menu item type that selects an existing roster module.
- Added a package installer and update feed for the component and module together, while preserving the standalone module ZIP.
- Documented direct menu item, article, and template-position publishing paths.

## 0.0.4 - 2026-11-04

- Reworked the administrator editor to inherit Joomla's light and dark theme colors.
- Removed the bright intro card, decorative gradient, and forced white backgrounds from roster controls.

## 0.0.3 - 2026-11-04

- Fixed Joomla asset paths so the importer script and administrator/public stylesheets load.
- Showed an importer loading message until JavaScript enables the import and preview buttons.

## 0.0.2 - 2026-11-04

- Fixed the import button's lookup of Joomla's repeatable editor fields.
- Accepted plain section headings separated by blank lines, as well as `**Heading**` text.
- Clarified the supported text and CSV formats and flag characters in the editor, with visible import errors.
- Added a display option to sort members alphabetically by last name within each section.

## 0.0.1 - 2026-11-04

- Added a Joomla 5 site module designed for Joomla 6 compatibility.
- Added administrator controls for the page title, ordered sections, editable members, multiple section assignments, special markings, and a legend.
- Added a responsive public roster layout and Volunteer Tracker-inspired administrator styling.
- Added flat-list and CSV import with duplicate-aware merge, plus an editor preview before publication.
- Supported multiple independently managed rosters through Joomla module instances.
- Added a Joomla update feed and a GitHub release packaging workflow.
