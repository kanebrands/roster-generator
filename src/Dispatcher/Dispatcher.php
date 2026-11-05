<?php
namespace KaneBrands\Module\Roster\Site\Dispatcher;

defined('_JEXEC') or die;

use Joomla\CMS\Dispatcher\AbstractModuleDispatcher;
use KaneBrands\Module\Roster\Site\Helper\RosterHelper;

final class Dispatcher extends AbstractModuleDispatcher
{
    protected function getLayoutData()
    {
        $data = parent::getLayoutData();
        $data['roster'] = RosterHelper::prepare($data['params']);

        return $data;
    }
}
