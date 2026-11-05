<?php
namespace KaneBrands\Module\Roster\Site\Field;

defined('_JEXEC') or die;

use Joomla\CMS\Form\FormField;
use Joomla\CMS\Factory;
use Joomla\CMS\Language\Text;

final class IntroField extends FormField
{
    protected $type = 'Intro';

    protected function getInput(): string
    {
        Factory::getApplication()->getDocument()->getWebAssetManager()
            ->registerAndUseStyle('mod_roster.admin', 'mod_roster/admin.css', ['version' => '0.0.6']);

        $title = htmlspecialchars(Text::_('MOD_ROSTER_ADMIN_TITLE'), ENT_QUOTES, 'UTF-8');
        $help = htmlspecialchars(Text::_('MOD_ROSTER_ADMIN_HELP'), ENT_QUOTES, 'UTF-8');

        return '<div class="roster-admin-panel"><h2>' . $title . '</h2><p>' . $help . '</p></div>';
    }
}
