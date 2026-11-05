<?php
namespace KaneBrands\Module\Roster\Site\Field;

defined('_JEXEC') or die;

use Joomla\CMS\Form\FormField;
use Joomla\CMS\Factory;
use Joomla\CMS\Language\Text;

final class RosterimportField extends FormField
{
    protected $type = 'Rosterimport';

    protected function getInput(): string
    {
        Factory::getApplication()->getDocument()->getWebAssetManager()
            ->registerAndUseScript('mod_roster.admin-import', 'mod_roster/admin-import.js', ['version' => '0.0.5'], ['defer' => true]);

        $escape = static fn ($key): string => htmlspecialchars(Text::_($key), ENT_QUOTES, 'UTF-8');
        $example = static fn ($key): string => str_replace('\\n', "\n", $escape($key));

        return '<div class="roster-import-panel" id="roster-import-panel">'
            . '<p>' . $escape('MOD_ROSTER_IMPORT_HELP') . '</p>'
            . '<div class="roster-import-formats">'
            . '<div><strong>' . $escape('MOD_ROSTER_IMPORT_TEXT_TITLE') . '</strong><p>'
            . $escape('MOD_ROSTER_IMPORT_TEXT_HELP') . '</p><pre>'
            . $example('MOD_ROSTER_IMPORT_TEXT_EXAMPLE') . '</pre></div>'
            . '<div><strong>' . $escape('MOD_ROSTER_IMPORT_CSV_TITLE') . '</strong><p>'
            . $escape('MOD_ROSTER_IMPORT_CSV_HELP') . '</p><pre>'
            . $example('MOD_ROSTER_IMPORT_CSV_EXAMPLE') . '</pre></div>'
            . '</div>'
            . '<label for="roster-import-file">' . $escape('MOD_ROSTER_IMPORT_FILE') . '</label>'
            . '<input type="file" id="roster-import-file" accept=".txt,.csv,text/plain,text/csv">'
            . '<label for="roster-import-text">' . $escape('MOD_ROSTER_IMPORT_PASTE') . '</label>'
            . '<textarea id="roster-import-text" rows="9" class="form-control"></textarea>'
            . '<button type="button" id="roster-import-run" class="btn btn-primary" disabled>'
            . $escape('MOD_ROSTER_IMPORT_RUN') . '</button>'
            . '<p id="roster-import-status" role="status" aria-live="polite">'
            . $escape('MOD_ROSTER_IMPORT_LOADING') . '</p>'
            . '<hr><button type="button" id="roster-preview-run" class="btn btn-secondary" disabled>'
            . $escape('MOD_ROSTER_PREVIEW_RUN') . '</button>'
            . '<p>' . $escape('MOD_ROSTER_PREVIEW_HELP') . '</p>'
            . '<div id="roster-preview" class="roster-preview" aria-live="polite"></div>'
            . '</div>';
    }
}
