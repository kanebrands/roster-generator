<?php
namespace KaneBrands\Component\Roster\Site\View\Roster;

defined('_JEXEC') or die;

use Joomla\CMS\Factory;
use Joomla\CMS\Helper\ModuleHelper;
use Joomla\CMS\Language\Text;
use Joomla\CMS\MVC\View\HtmlView as BaseHtmlView;

final class HtmlView extends BaseHtmlView
{
    public string $rosterHtml = '';

    public function display($tpl = null): void
    {
        $id = Factory::getApplication()->getInput()->getInt('id');
        $module = $id > 0 ? ModuleHelper::getModuleById((string) $id) : null;

        if (!$module || (int) ($module->id ?? 0) !== $id || ($module->module ?? '') !== 'mod_roster') {
            throw new \RuntimeException(Text::_('COM_ROSTER_UNAVAILABLE'), 404);
        }

        $this->rosterHtml = ModuleHelper::renderModule($module, ['style' => 'none']);
        parent::display($tpl);
    }
}
