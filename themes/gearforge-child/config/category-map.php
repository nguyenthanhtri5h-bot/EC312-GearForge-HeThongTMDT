<?php
/**
 * Single Source of Truth Category Mapping between Role 1 CSV Catalog & Role 3 Storefront Filters.
 */

if (!defined('ABSPATH')) {
    exit;
}

return [
    'aliases' => [
        'laptop'           => ['laptop', 'laptop-gaming', 'laptop-van-phong', 'laptop-do-hoa', 'laptop-sinh-vien'],
        'gaming'           => ['laptop-gaming'],
        'laptop-gaming'    => ['laptop-gaming'],
        'ultrabook'        => ['laptop-van-phong', 'laptop-do-hoa', 'laptop-sinh-vien'],
        'laptop-ultrabook' => ['laptop-van-phong', 'laptop-do-hoa', 'laptop-sinh-vien'],
        'laptop-van-phong' => ['laptop-van-phong', 'laptop-sinh-vien'],
        'laptop-sinh-vien' => ['laptop-sinh-vien'],
        'dev'              => ['laptop-van-phong', 'laptop-do-hoa', 'laptop-sinh-vien'],
        'creator'          => ['laptop-do-hoa'],
        'laptop-do-hoa'    => ['laptop-do-hoa'],
        'workstation'      => ['pc', 'pc-nguyen-bo', 'pc-gaming', 'pc-do-hoa', 'pc-van-phong', 'pc-van-phong-do-hoa'],
        'pc-workstation'   => ['pc', 'pc-nguyen-bo', 'pc-gaming', 'pc-do-hoa', 'pc-van-phong', 'pc-van-phong-do-hoa'],
        'pc-nguyen-bo'     => ['pc', 'pc-nguyen-bo', 'pc-gaming', 'pc-do-hoa', 'pc-van-phong', 'pc-van-phong-do-hoa'],
        'pc'               => ['pc', 'pc-nguyen-bo', 'pc-gaming', 'pc-do-hoa', 'pc-van-phong', 'pc-van-phong-do-hoa'],
        'pc-gaming'        => ['pc-gaming'],
        'pc-do-hoa'        => ['pc-do-hoa'],
        'pc-van-phong'     => ['pc-van-phong', 'pc-van-phong-do-hoa'],
        'linh-kien'        => ['linh-kien', 'cpu', 'ram', 'vga', 'ram-ssd'],
        'cpu'              => ['cpu'],
        'ram'              => ['ram', 'ram-ssd'],
        'vga'              => ['vga'],
        'gear'             => ['gear', 'phu-kien', 'ban-phim', 'chuot', 'lot-chuot', 'balo-de-tan-nhiet', 'ban-phim-co', 'chuot-gaming', 'ram-ssd', 'tai-nghe'],
        'phu-kien'         => ['gear', 'phu-kien', 'ban-phim', 'chuot', 'lot-chuot', 'balo-de-tan-nhiet', 'ban-phim-co', 'chuot-gaming', 'ram-ssd', 'tai-nghe'],
        'accessories'      => ['gear', 'phu-kien', 'ban-phim', 'chuot', 'lot-chuot', 'balo-de-tan-nhiet', 'ban-phim-co', 'chuot-gaming', 'ram-ssd', 'tai-nghe'],
    ],
];
