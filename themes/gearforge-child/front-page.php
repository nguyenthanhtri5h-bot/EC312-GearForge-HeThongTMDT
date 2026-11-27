<?php
/**
 * GearForge Flagship Cosmic 3D Landing Shell (Front Page).
 * Renders the React 19 Flagship app on `/` without Blocksy header/footer bleed,
 * while preserving wp_head()/wp_footer() WordPress & WooCommerce runtime hooks.
 */

if (!defined('ABSPATH')) {
    exit;
}
?><!doctype html>
<html <?php language_attributes(); ?>>
<head>
    <meta charset="<?php bloginfo('charset'); ?>" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="icon" type="image/svg+xml" href="/wp-content/themes/gearforge-child/assets/flagship/vibe/gearforge-crest.svg" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <?php wp_head(); ?>
</head>
<body <?php body_class('gf-flagship-front'); ?>>
<?php wp_body_open(); ?>
<div id="gf-flagship-root" class="gf-flagship-shell"></div>
<?php wp_footer(); ?>
</body>
</html>
