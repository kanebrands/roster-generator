<?php
namespace KaneBrands\Module\Roster\Site\Helper;

defined('_JEXEC') or die;

use Joomla\Registry\Registry;

final class RosterHelper
{
    public static function prepare(Registry $params): array
    {
        $sections = [];

        foreach (self::rows($params->get('sections', [])) as $section) {
            $heading = trim((string) ($section['heading'] ?? ''));

            if ($heading === '') {
                continue;
            }

            $sections[] = ['heading' => $heading, 'members' => []];
        }

        foreach (self::rows($params->get('members', [])) as $member) {
            $name = trim((string) ($member['name'] ?? ''));

            if ($name === '') {
                continue;
            }

            $assigned = preg_split('/\r\n|\r|\n/', (string) ($member['sections'] ?? '')) ?: [];

            foreach ($sections as &$section) {
                if (in_array($section['heading'], array_map('trim', $assigned), true)) {
                    $section['members'][] = [
                        'mark' => trim((string) ($member['mark'] ?? '')),
                        'name' => $name,
                    ];
                }
            }

            unset($section);
        }

        if ($params->get('member_order', 'manual') === 'last_name') {
            foreach ($sections as &$section) {
                usort($section['members'], static function (array $left, array $right): int {
                    $leftParts = preg_split('/\s+/u', $left['name']) ?: [];
                    $rightParts = preg_split('/\s+/u', $right['name']) ?: [];
                    $lastNameOrder = strnatcasecmp((string) end($leftParts), (string) end($rightParts));

                    return $lastNameOrder ?: strnatcasecmp($left['name'], $right['name']);
                });
            }

            unset($section);
        }

        $legend = [];

        foreach (self::rows($params->get('legend', [])) as $entry) {
            $mark = trim((string) ($entry['mark'] ?? ''));
            $meaning = trim((string) ($entry['meaning'] ?? ''));

            if ($mark !== '' && $meaning !== '') {
                $legend[] = ['mark' => $mark, 'meaning' => $meaning];
            }
        }

        return [
            'title' => trim((string) $params->get('page_title', '')),
            'sections' => $sections,
            'legend' => $legend,
        ];
    }

    private static function rows($value): array
    {
        if ($value instanceof Registry) {
            $value = $value->toArray();
        } elseif (is_object($value)) {
            $value = (array) $value;
        }

        if (!is_array($value)) {
            return [];
        }

        $rows = [];

        foreach ($value as $row) {
            if ($row instanceof Registry) {
                $row = $row->toArray();
            } elseif (is_object($row)) {
                $row = (array) $row;
            }

            if (is_array($row)) {
                $rows[] = $row;
            }
        }

        return $rows;
    }
}
