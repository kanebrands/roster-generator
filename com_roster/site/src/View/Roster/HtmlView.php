<?php
namespace KaneBrands\Component\Roster\Site\View\Roster;

defined('_JEXEC') or die;

use Joomla\CMS\Factory;
use Joomla\CMS\Helper\ModuleHelper;
use Joomla\CMS\Language\Text;
use Joomla\CMS\MVC\View\HtmlView as BaseHtmlView;
use Joomla\Database\DatabaseInterface;
use Joomla\Database\ParameterType;

final class HtmlView extends BaseHtmlView
{
    public string $rosterHtml = '';

    public function display($tpl = null): void
    {
        $app = Factory::getApplication();
        $id = $app->getInput()->getInt('id');
        $module = null;

        if ($id > 0) {
            $db = Factory::getContainer()->get(DatabaseInterface::class);
            $query = $db->getQuery(true)
                ->select($db->quoteName('m') . '.*')
                ->from($db->quoteName('#__modules', 'm'))
                ->join('INNER', $db->quoteName('#__extensions', 'e'),
                    $db->quoteName('e.element') . ' = ' . $db->quoteName('m.module')
                    . ' AND ' . $db->quoteName('e.client_id') . ' = ' . $db->quoteName('m.client_id'))
                ->where($db->quoteName('m.id') . ' = :id')
                ->where($db->quoteName('m.module') . ' = ' . $db->quote('mod_roster'))
                ->where($db->quoteName('m.client_id') . ' = 0')
                ->where($db->quoteName('m.published') . ' = 1')
                ->where($db->quoteName('e.type') . ' = ' . $db->quote('module'))
                ->where($db->quoteName('e.enabled') . ' = 1')
                ->whereIn($db->quoteName('m.access'), $app->getIdentity()->getAuthorisedViewLevels())
                ->bind(':id', $id, ParameterType::INTEGER);

            $now = Factory::getDate()->toSql();
            $query->where('(' . $db->quoteName('m.publish_up') . ' IS NULL OR ' . $db->quoteName('m.publish_up') . ' <= :nowUp)')
                ->where('(' . $db->quoteName('m.publish_down') . ' IS NULL OR ' . $db->quoteName('m.publish_down') . ' >= :nowDown)')
                ->bind(':nowUp', $now)
                ->bind(':nowDown', $now);

            if ($app->getLanguageFilter()) {
                $query->whereIn($db->quoteName('m.language'), [$app->getLanguage()->getTag(), '*'], ParameterType::STRING);
            }

            $module = $db->setQuery($query)->loadObject();
        }

        if (!$module || (int) ($module->id ?? 0) !== $id || ($module->module ?? '') !== 'mod_roster') {
            throw new \RuntimeException(Text::_('COM_ROSTER_UNAVAILABLE'), 404);
        }

        $module->name = 'roster';
        $module->style = null;
        $this->rosterHtml = ModuleHelper::renderModule($module, ['style' => 'none']);
        parent::display($tpl);
    }
}
