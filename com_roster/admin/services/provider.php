<?php
defined('_JEXEC') or die;

use Joomla\CMS\Dispatcher\ComponentDispatcherFactoryInterface;
use Joomla\CMS\Component\Router\RouterFactoryInterface;
use Joomla\CMS\Extension\ComponentInterface;
use Joomla\CMS\Extension\Service\Provider\ComponentDispatcherFactory;
use Joomla\CMS\Extension\Service\Provider\MVCFactory;
use Joomla\CMS\Extension\Service\Provider\RouterFactory;
use Joomla\CMS\MVC\Factory\MVCFactoryInterface;
use KaneBrands\Component\Roster\Administrator\Extension\RosterComponent;
use Joomla\DI\Container;
use Joomla\DI\ServiceProviderInterface;

return new class implements ServiceProviderInterface {
    public function register(Container $container): void
    {
        $container->registerServiceProvider(new MVCFactory('\\KaneBrands\\Component\\Roster'));
        $container->registerServiceProvider(new ComponentDispatcherFactory('\\KaneBrands\\Component\\Roster'));
        $container->registerServiceProvider(new RouterFactory('\\KaneBrands\\Component\\Roster'));
        $container->set(ComponentInterface::class, static function (Container $container): ComponentInterface {
            $component = new RosterComponent($container->get(ComponentDispatcherFactoryInterface::class));
            $component->setMVCFactory($container->get(MVCFactoryInterface::class));
            $component->setRouterFactory($container->get(RouterFactoryInterface::class));

            return $component;
        });
    }
};
