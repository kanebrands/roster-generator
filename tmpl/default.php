<?php
defined('_JEXEC') or die;

use Joomla\CMS\Factory;
use Joomla\CMS\Language\Text;

Factory::getApplication()->getDocument()->getWebAssetManager()
    ->registerAndUseStyle('mod_roster.site', 'mod_roster/site.css', ['version' => '0.0.6']);

$escape = static fn ($value): string => htmlspecialchars((string) $value, ENT_QUOTES, 'UTF-8');
?>
<div class="roster-page">
    <?php if ($roster['title'] !== '') : ?>
        <h1 class="roster-page-title"><?php echo $escape($roster['title']); ?></h1>
    <?php endif; ?>

    <?php foreach ($roster['sections'] as $section) : ?>
        <section class="roster-section">
            <h2 class="roster-section-title"><?php echo $escape($section['heading']); ?></h2>
            <?php if ($section['members'] !== []) : ?>
                <ul class="roster-members">
                    <?php foreach ($section['members'] as $member) : ?>
                        <li>
                            <?php if ($member['mark'] !== '') : ?><span class="roster-mark"><?php echo $escape($member['mark']); ?></span> <?php endif; ?>
                            <span><?php echo $escape($member['name']); ?></span>
                        </li>
                    <?php endforeach; ?>
                </ul>
            <?php endif; ?>
        </section>
    <?php endforeach; ?>

    <?php if ($roster['legend'] !== []) : ?>
        <div class="roster-legend" aria-label="<?php echo $escape(Text::_('MOD_ROSTER_LEGEND')); ?>">
            <?php foreach ($roster['legend'] as $entry) : ?>
                <div><span class="roster-mark"><?php echo $escape($entry['mark']); ?></span> <?php echo $escape($entry['meaning']); ?></div>
            <?php endforeach; ?>
        </div>
    <?php endif; ?>
</div>
