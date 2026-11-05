<?php
namespace KaneBrands\Module\Roster\Site\Field;

defined('_JEXEC') or die;

use Joomla\CMS\Form\FormField;
use Joomla\CMS\HTML\HTMLHelper;
use Joomla\CMS\Language\Text;

final class IntroField extends FormField
{
    protected $type = 'Intro';

    protected function getInput(): string
    {
        HTMLHelper::_('stylesheet', 'mod_roster/css/admin.css', ['version' => 'auto', 'relative' => true]);

        $title = htmlspecialchars(Text::_('MOD_ROSTER_ADMIN_TITLE'), ENT_QUOTES, 'UTF-8');
        $eyebrow = htmlspecialchars(Text::_('MOD_ROSTER_ADMIN_EYEBROW'), ENT_QUOTES, 'UTF-8');
        $help = htmlspecialchars(Text::_('MOD_ROSTER_ADMIN_HELP'), ENT_QUOTES, 'UTF-8');

        return '<div class="roster-admin-panel"><div class="roster-admin-mark" aria-hidden="true"></div>'
            . '<div><p class="roster-admin-eyebrow">' . $eyebrow . '</p><h2>' . $title . '</h2>'
            . '<p>' . $help . '</p></div></div>';
    }
}
