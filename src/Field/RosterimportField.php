<?php
namespace KaneBrands\Module\Roster\Site\Field;

defined('_JEXEC') or die;

use Joomla\CMS\Form\FormField;
use Joomla\CMS\HTML\HTMLHelper;
use Joomla\CMS\Language\Text;

final class RosterimportField extends FormField
{
    protected $type = 'Rosterimport';

    protected function getInput(): string
    {
        HTMLHelper::_('script', 'mod_roster/js/admin-import.js', ['version' => 'auto', 'relative' => true]);

        $escape = static fn ($key): string => htmlspecialchars(Text::_($key), ENT_QUOTES, 'UTF-8');

        return '<div class="roster-import-panel" id="roster-import-panel">'
            . '<p>' . $escape('MOD_ROSTER_IMPORT_HELP') . '</p>'
            . '<label for="roster-import-file">' . $escape('MOD_ROSTER_IMPORT_FILE') . '</label>'
            . '<input type="file" id="roster-import-file" accept=".txt,.csv,text/plain,text/csv">'
            . '<label for="roster-import-text">' . $escape('MOD_ROSTER_IMPORT_PASTE') . '</label>'
            . '<textarea id="roster-import-text" rows="9" class="form-control"></textarea>'
            . '<button type="button" id="roster-import-run" class="btn btn-primary">'
            . $escape('MOD_ROSTER_IMPORT_RUN') . '</button>'
            . '<p id="roster-import-status" role="status" aria-live="polite"></p>'
            . '<hr><button type="button" id="roster-preview-run" class="btn btn-secondary">'
            . $escape('MOD_ROSTER_PREVIEW_RUN') . '</button>'
            . '<p>' . $escape('MOD_ROSTER_PREVIEW_HELP') . '</p>'
            . '<div id="roster-preview" class="roster-preview" aria-live="polite"></div>'
            . '</div>';
    }
}
