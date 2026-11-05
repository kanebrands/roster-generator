<?php
namespace KaneBrands\Component\Roster\Administrator\Extension;

defined('_JEXEC') or die;

use Joomla\CMS\Component\Router\RouterServiceInterface;
use Joomla\CMS\Component\Router\RouterServiceTrait;
use Joomla\CMS\Extension\MVCComponent;

final class RosterComponent extends MVCComponent implements RouterServiceInterface
{
    use RouterServiceTrait;
}
