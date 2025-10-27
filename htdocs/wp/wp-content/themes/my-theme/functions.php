<?php
/**
 * テーマ機能とフック
 *
 * @package MyTheme
 */

// 直接アクセスを防ぐ
if (!defined('ABSPATH')) {
    exit;
}

/**
 * テーマのセットアップ
 */
function my_theme_setup() {
    // テーマの翻訳機能を有効化
    load_theme_textdomain('my-theme', get_template_directory() . '/languages');

    // HTMLタイトルタグの自動生成
    add_theme_support('title-tag');

    // 投稿とページでアイキャッチ画像を有効化
    add_theme_support('post-thumbnails');

    // RSSフィードのリンクを自動追加
    add_theme_support('automatic-feed-links');

    // HTML5マークアップサポート
    add_theme_support('html5', array(
        'search-form',
        'gallery',
        'caption',
        'style',
        'script',
    ));

    // カスタムロゴサポート
    add_theme_support('custom-logo', array(
        'height'      => 100,
        'width'       => 400,
        'flex-width'  => true,
        'flex-height' => true,
    ));

    // メニューの登録
    register_nav_menus(array(
        'primary' => 'プライマリメニュー',
        'footer'  => 'フッターメニュー',
    ));

    // エディタスタイルの有効化
    add_theme_support('editor-styles');
    add_editor_style('style.css');

    // レスポンシブ埋め込みサポート
    add_theme_support('responsive-embeds');
}
add_action('after_setup_theme', 'my_theme_setup');

/**
 * スタイルとスクリプトの読み込み
 */
function my_theme_scripts() {
    // WordPressテーマヘッダー用スタイル（必須）
    wp_enqueue_style(
        'my-theme-style',
        get_stylesheet_uri(),
        array(),
        wp_get_theme()->get('Version')
    );

    // メインスタイル
    wp_enqueue_style(
        'my-theme-main',
        get_template_directory_uri() . '/_assets/css/style.css',
        array('my-theme-style'),
        wp_get_theme()->get('Version')
    );

    // メインJavaScript
    wp_enqueue_script(
        'my-theme-main-js',
        get_template_directory_uri() . '/_assets/js/app.js',
        array(), // 依存関係（jQueryなど必要に応じて追加）
        wp_get_theme()->get('Version'),
        true // フッターで読み込み
    );
}
add_action('wp_enqueue_scripts', 'my_theme_scripts');

/**
 * ウィジェットエリアの登録
 */
function my_theme_widgets_init() {

    register_sidebar(array(
        'name'          => 'フッターエリア',
        'id'            => 'footer-1',
        'description'   => 'フッターに表示されるウィジェット',
        'before_widget' => '<div id="%1$s" class="widget %2$s">',
        'after_widget'  => '</div>',
        'before_title'  => '<h3 class="widget-title">',
        'after_title'   => '</h3>',
    ));
}
add_action('widgets_init', 'my_theme_widgets_init');

/**
 * 抜粋の長さを調整
 */
function my_theme_excerpt_length($length) {
    return 40;
}
add_filter('excerpt_length', 'my_theme_excerpt_length');

/**
 * 抜粋の終端文字を変更
 */
function my_theme_excerpt_more($more) {
    return '...';
}
add_filter('excerpt_more', 'my_theme_excerpt_more');

/**
 * 画像サイズの追加
 */
function my_theme_image_sizes() {
    add_image_size('featured-large', 1200, 600, true);
    add_image_size('featured-medium', 800, 400, true);
}
add_action('after_setup_theme', 'my_theme_image_sizes');

/**
 * body_classにカスタムクラスを追加
 */
function my_theme_body_classes($classes) {
    // ページスラッグをbodyクラスに追加
    if (is_page()) {
        global $post;
        $classes[] = 'page-' . $post->post_name;
    }

    return $classes;
}
add_filter('body_class', 'my_theme_body_classes');

/**
 * REST APIセキュリティ設定
 */
function my_theme_rest_api_security() {
    // REST APIからユーザー名を隠す
    remove_action('rest_api_init', 'wp_oembed_register_route');
    add_filter('rest_endpoints', 'my_theme_disable_user_endpoints');
    add_filter('rest_prepare_user', 'my_theme_hide_user_data', 10, 3);
}
add_action('init', 'my_theme_rest_api_security');

/**
 * ユーザー関連のREST APIエンドポイントを無効化
 */
function my_theme_disable_user_endpoints($endpoints) {
    // /wp/v2/users エンドポイントを無効化
    if (isset($endpoints['/wp/v2/users'])) {
        unset($endpoints['/wp/v2/users']);
    }

    // /wp/v2/users/(?P<id>[\d]+) エンドポイントを無効化
    if (isset($endpoints['/wp/v2/users/(?P<id>[\d]+)'])) {
        unset($endpoints['/wp/v2/users/(?P<id>[\d]+)']);
    }

    return $endpoints;
}

/**
 * REST APIのユーザーデータからセンシティブ情報を削除
 */
function my_theme_hide_user_data($response, $user, $request) {
    // 管理者でない場合はユーザー情報を隠す
    if (!current_user_can('manage_options')) {
        $response->data = array();
    }

    return $response;
}

/**
 * 投稿からauthor情報を削除（必要に応じて）
 */
function my_theme_hide_post_author($response, $post, $request) {
    // 投稿のauthor情報を数値IDのみに制限
    if (isset($response->data['author'])) {
        // author名前などの詳細情報を削除し、IDのみ保持
        $response->data['author'] = (int) $response->data['author'];
    }

    return $response;
}
// 必要に応じて有効化
// add_filter('rest_prepare_post', 'my_theme_hide_post_author', 10, 3);

/**
 * 管理画面のダッシュボードをシンプルにする
 */
function my_theme_clean_admin_dashboard() {
    // ダッシュボードウィジェットを削除
    remove_meta_box('dashboard_incoming_links', 'dashboard', 'normal');     // 被リンク
    remove_meta_box('dashboard_plugins', 'dashboard', 'normal');            // プラグイン
    remove_meta_box('dashboard_primary', 'dashboard', 'side');              // WordPressブログ
    remove_meta_box('dashboard_secondary', 'dashboard', 'side');            // WordPressニュース
    remove_meta_box('dashboard_quick_press', 'dashboard', 'side');          // クイック投稿
    remove_meta_box('dashboard_recent_drafts', 'dashboard', 'side');        // 最近の下書き
    remove_meta_box('dashboard_recent_comments', 'dashboard', 'normal');    // 最近のコメント
    remove_meta_box('dashboard_right_now', 'dashboard', 'normal');          // 現在の状況
    remove_meta_box('dashboard_activity', 'dashboard', 'normal');           // アクティビティ
    // remove_meta_box('dashboard_site_health', 'dashboard', 'normal');     // サイトヘルス（使用するため残す）

    // WordPress 5.8以降のウィジェット
    remove_meta_box('dashboard_welcome_panel', 'dashboard', 'normal');      // ようこそパネル

    // プラグイン関連のウィジェット（一般的なもの）
    remove_meta_box('wpe_dify_news_feed', 'dashboard', 'normal');           // WP Engine
    remove_meta_box('yith_dashboard_products_news', 'dashboard', 'normal'); // YITH
}
add_action('wp_dashboard_setup', 'my_theme_clean_admin_dashboard');

/**
 * 管理画面のフッタークレジットを変更
 */
function my_theme_admin_footer_text() {
    return 'WordPress サイト管理画面';
}
add_filter('admin_footer_text', 'my_theme_admin_footer_text');

/**
 * WordPressバージョン情報を非表示
 */
function my_theme_remove_wp_version() {
    return '';
}
add_filter('update_footer', 'my_theme_remove_wp_version', 11);

/**
 * ヘルプタブを削除
 */
function my_theme_remove_help_tabs() {
    $screen = get_current_screen();
    $screen->remove_help_tabs();
}
add_action('admin_head', 'my_theme_remove_help_tabs');

/**
 * 管理バーから不要な項目を削除
 */
function my_theme_clean_admin_bar() {
    global $wp_admin_bar;

    // WordPress.orgへのリンクを削除
    $wp_admin_bar->remove_menu('wp-logo');

    // コメント通知を削除（コメント機能を使わない場合）
    $wp_admin_bar->remove_menu('comments');

    // カスタマイザーリンクを削除（必要に応じて）
    // $wp_admin_bar->remove_menu('customize');

    // 新規追加メニューから不要な項目を削除
    // $wp_admin_bar->remove_menu('new-user'); // 新規ユーザー追加（使用するため残す）
}
add_action('wp_before_admin_bar_render', 'my_theme_clean_admin_bar');

/**
 * 管理画面の通知を非表示
 */
function my_theme_hide_admin_notices() {
    // 更新通知を非管理者から隠す
    if (!current_user_can('update_core')) {
        remove_action('admin_notices', 'update_nag', 3);
        remove_action('network_admin_notices', 'update_nag', 3);
        remove_action('admin_notices', 'maintenance_nag');
        remove_action('network_admin_notices', 'maintenance_nag');
    }
}
add_action('admin_head', 'my_theme_hide_admin_notices', 1);

/**
 * プラグインやテーマエディタを無効化（セキュリティ向上）
 */
function my_theme_disable_file_edit() {
    // テーマエディタを無効化
    if (!defined('DISALLOW_FILE_EDIT')) {
        define('DISALLOW_FILE_EDIT', true);
    }
}
add_action('init', 'my_theme_disable_file_edit');

/**
 * WordPressの自動更新設定
 */
function my_theme_auto_update_settings() {
    // コア自動更新はマイナーアップデートのみ
    add_filter('allow_minor_auto_core_updates', '__return_true');
    add_filter('allow_major_auto_core_updates', '__return_false');

    // プラグイン自動更新を有効化（必要に応じて）
    // add_filter('auto_update_plugin', '__return_true');

    // テーマ自動更新を無効化
    add_filter('auto_update_theme', '__return_false');
}
add_action('init', 'my_theme_auto_update_settings');

/**
 * 管理画面メニューの整理（必要に応じてコメントアウト解除）
 */
function my_theme_clean_admin_menu() {
    // コメント機能を使わない場合
    remove_menu_page('edit-comments.php');

    // 外観メニューから不要な項目を削除
    // remove_submenu_page('themes.php', 'theme-editor.php'); // テーマエディタ

    // プラグインメニューから不要な項目を削除
    // remove_submenu_page('plugins.php', 'plugin-editor.php'); // プラグインエディタ
}
add_action('admin_menu', 'my_theme_clean_admin_menu');


/**
 * コメント関連のRSSフィードを無効化
 */
function my_theme_disable_comment_feeds() {
    return '';
}
add_filter('feed_links_show_comments_feed', '__return_false');
add_filter('comment_feed_links', '__return_false');


/**
 * コメント投稿を無効化
 */
function my_theme_disable_comment_posting() {
    wp_die('コメント機能は無効化されています。');
}
add_action('comment_post', 'my_theme_disable_comment_posting');

/**
 * 既存コメントの表示を無効化
 */
function my_theme_disable_comment_display() {
    return array();
}
add_filter('comments_array', 'my_theme_disable_comment_display');

/**
 * pingback/trackbackを無効化
 */
function my_theme_disable_pingbacks() {
    // pingback機能を無効化
    add_filter('xmlrpc_enabled', '__return_false');
    add_filter('wp_headers', function($headers) {
        unset($headers['X-Pingback']);
        return $headers;
    });

    // trackback/pingbackのURLを削除
    remove_action('wp_head', 'rsd_link');
    remove_action('wp_head', 'wlwmanifest_link');
}
add_action('init', 'my_theme_disable_pingbacks');

/**
 * Gutenbergエディターを無効化
 */
function my_theme_disable_gutenberg() {
    // 投稿タイプでGutenbergを無効化
    add_filter('use_block_editor_for_post', '__return_false');
    add_filter('use_block_editor_for_post_type', '__return_false');

    // ウィジェットでのブロックエディターを無効化（WordPress 5.8以降）
    add_filter('use_widgets_block_editor', '__return_false');

    // Gutenberg関連のCSSを削除
    wp_dequeue_style('wp-block-library');
    wp_dequeue_style('wp-block-library-theme');
    wp_dequeue_style('wc-blocks-style'); // WooCommerce blocks
    wp_dequeue_style('global-styles'); // WordPress 5.9以降のGlobal Styles

    // フロントエンドからGutenberg関連のCSSを削除
    remove_action('wp_enqueue_scripts', 'wp_common_block_scripts_and_styles');

    // Gutenberg関連のJavaScriptを削除
    wp_dequeue_script('wp-block-library');

    // Classic Editorプラグインが有効でない場合の対応
    if (!is_plugin_active('classic-editor/classic-editor.php')) {
        // クラシックエディターのスタイルを読み込み
        add_action('admin_enqueue_scripts', 'my_theme_enqueue_classic_editor_styles');
    }
}
add_action('init', 'my_theme_disable_gutenberg');

/**
 * フロントエンドからGutenberg CSSを削除
 */
function my_theme_remove_gutenberg_css() {
    // ブロックライブラリのスタイルを削除
    wp_dequeue_style('wp-block-library');
    wp_dequeue_style('wp-block-library-theme');
    wp_dequeue_style('wc-blocks-style');
    wp_dequeue_style('global-styles');

    // Gutenberg関連のインラインスタイルも削除
    wp_dequeue_style('classic-theme-styles');
}
add_action('wp_enqueue_scripts', 'my_theme_remove_gutenberg_css', 100);

/**
 * 管理画面からもGutenberg CSSを削除
 */
function my_theme_remove_gutenberg_admin_css() {
    wp_dequeue_style('wp-block-library');
    wp_dequeue_style('wp-block-library-theme');
}
add_action('admin_enqueue_scripts', 'my_theme_remove_gutenberg_admin_css', 100);

/**
 * クラシックエディターのスタイルを追加（必要に応じて）
 */
function my_theme_enqueue_classic_editor_styles() {
    // TinyMCEエディターのスタイルを確実に読み込み
    wp_enqueue_style('editor-buttons');
    wp_enqueue_script('editor');
    wp_enqueue_script('quicktags');
}

/**
 * Gutenberg機能を簡単に復活させる場合のコメントアウトされた設定
 */
/*
function my_theme_enable_gutenberg() {
    // Gutenbergを有効にする場合は、上記の無効化関数をコメントアウトし、
    // この関数のコメントアウトを解除してください

    // 特定の投稿タイプでのみGutenbergを有効化
    add_filter('use_block_editor_for_post_type', function($enabled, $post_type) {
        if ($post_type === 'page') {
            return false; // 固定ページはクラシックエディター
        }
        return $enabled; // 投稿はGutenberg
    }, 10, 2);

    // ブロックエディターのテーマサポートを追加
    add_theme_support('editor-styles');
    add_theme_support('editor-color-palette');
    add_theme_support('align-wide');
}
// add_action('after_setup_theme', 'my_theme_enable_gutenberg');
*/
