<?php
namespace KaneBrands\Component\Roster\Site\Service;

defined('_JEXEC') or die;

use Joomla\CMS\Application\SiteApplication;
use Joomla\CMS\Component\Router\RouterView;
use Joomla\CMS\Component\Router\RouterViewConfiguration;
use Joomla\CMS\Component\Router\Rules\MenuRules;
use Joomla\CMS\Component\Router\Rules\NomenuRules;
use Joomla\CMS\Component\Router\Rules\StandardRules;
use Joomla\CMS\Menu\AbstractMenu;

final class Router extends RouterView
{
    public function __construct(SiteApplication $app, AbstractMenu $menu)
    {
        $roster = new RouterViewConfiguration('roster');
        $roster->setKey('id');
        $this->registerView($roster);

        parent::__construct($app, $menu);

        $this->attachRule(new MenuRules($this));
        $this->attachRule(new StandardRules($this));
        $this->attachRule(new NomenuRules($this));
    }

    public function getRosterSegment($id, $query): array
    {
        return [(int) $id => (string) $id];
    }

    public function getRosterId($segment, $query): int
    {
        return (int) $segment;
    }
}
