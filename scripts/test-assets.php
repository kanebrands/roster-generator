<?php
namespace Joomla\CMS\Form {
    class FormField {}
}

namespace Joomla\CMS\Language {
    class Text
    {
        public static function _($key): string { return $key; }
    }
}

namespace Joomla\CMS {
    class AssetCapture
    {
        public static array $assets = [];

        public function registerAndUseScript($name, $uri, ...$arguments): self
        {
            self::$assets[] = ['script', $uri];
            return $this;
        }

        public function registerAndUseStyle($name, $uri, ...$arguments): self
        {
            self::$assets[] = ['style', $uri];
            return $this;
        }
    }

    class Factory
    {
        public static function getApplication(): self { return new self(); }
        public function getDocument(): self { return $this; }
        public function getWebAssetManager(): AssetCapture { return new AssetCapture(); }
    }
}

namespace {
    define('_JEXEC', 1);
    require __DIR__ . '/../src/Field/IntroField.php';
    require __DIR__ . '/../src/Field/RosterimportField.php';

    foreach ([
        \KaneBrands\Module\Roster\Site\Field\IntroField::class,
        \KaneBrands\Module\Roster\Site\Field\RosterimportField::class,
    ] as $fieldClass) {
        $reflection = new \ReflectionClass($fieldClass);
        $output = $reflection->getMethod('getInput')->invoke($reflection->newInstanceWithoutConstructor());
        assert($output !== '');
    }

    assert(str_contains($output, 'disabled'));
    assert(str_contains($output, 'MOD_ROSTER_IMPORT_LOADING'));

    $roster = ['title' => '', 'sections' => [], 'legend' => []];
    ob_start();
    require __DIR__ . '/../tmpl/default.php';
    ob_end_clean();

    $expected = [
        ['style', 'mod_roster/admin.css'],
        ['script', 'mod_roster/admin-import.js'],
        ['style', 'mod_roster/site.css'],
    ];
    assert(\Joomla\CMS\AssetCapture::$assets === $expected);

    foreach ($expected as [$type, $uri]) {
        $filename = basename($uri);
        $folder = $type === 'script' ? 'js' : 'css';
        assert(is_file(__DIR__ . '/../media/' . $folder . '/' . $filename));
    }

    echo "Joomla asset registration paths OK\n";
}
