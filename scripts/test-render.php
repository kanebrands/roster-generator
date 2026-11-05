<?php
namespace Joomla\Registry {
    final class Registry
    {
        public function __construct(private array $data = []) {}
        public function get(string $key, $default = null) { return $this->data[$key] ?? $default; }
        public function toArray(): array { return $this->data; }
    }
}

namespace {
    define('_JEXEC', 1);
    require __DIR__ . '/../src/Helper/RosterHelper.php';

    $params = new \Joomla\Registry\Registry([
        'page_title' => '<Roster>',
        'sections' => [['heading' => 'Flutes'], ['heading' => 'Oboe']],
        'member_order' => 'last_name',
        'members' => [
            ['name' => 'Taylor Reed', 'mark' => '*', 'sections' => "Flutes\nOboe"],
            ['name' => 'Avery Chen', 'mark' => '', 'sections' => 'Flutes'],
        ],
        'legend' => [['mark' => '*', 'meaning' => 'Principal']],
    ]);
    $roster = \KaneBrands\Module\Roster\Site\Helper\RosterHelper::prepare($params);
    assert(count($roster['sections']) === 2);
    assert(count($roster['sections'][0]['members']) === 2);
    assert(count($roster['sections'][1]['members']) === 1);
    assert($roster['sections'][0]['members'][0]['name'] === 'Avery Chen');
    assert($roster['sections'][0]['members'][1]['name'] === 'Taylor Reed');
    echo "Roster multi-section and last-name order OK\n";
}
