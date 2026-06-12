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

// ==========================================================
// テーマ基本設定
// ==========================================================

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
    // add_theme_support('custom-logo', array(
    //     'height'      => 100,
    //     'width'       => 400,
    //     'flex-width'  => true,
    //     'flex-height' => true,
    // ));

    // メニューの登録は fn/menu.php に統合

    // エディタスタイルの有効化
    add_theme_support('editor-styles');
    add_editor_style('style.css');

    // レスポンシブ埋め込みサポート
    add_theme_support('responsive-embeds');
}
add_action('after_setup_theme', 'my_theme_setup');

/**
 * 画像サイズの追加
 */
function my_theme_image_sizes() {
    add_image_size('archive', 562, 376, true);      // アーカイブ一覧用
    add_image_size('mv_pc', 1366, 600, true);       // メインビジュアルPC用
    add_image_size('mv_sp', 375, 600, true);        // メインビジュアルSP用
}
add_action('after_setup_theme', 'my_theme_image_sizes');

// ==========================================================
// スタイル・スクリプト
// ==========================================================

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

    // Google Fonts（Noto Sans JP + JetBrains Mono）
    wp_enqueue_style(
        'my-theme-google-fonts',
        'https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&family=Noto+Sans+JP:wght@100..900&display=swap',
        array(),
        null
    );

    // メインスタイル
    wp_enqueue_style(
        'my-theme-main',
        get_template_directory_uri() . '/_assets/css/style.css',
        array('my-theme-style', 'my-theme-google-fonts'),
        wp_get_theme()->get('Version')
    );

    // Astro Fonts APIのCSS変数をCDNフォント名で上書き
    wp_add_inline_style('my-theme-main', ':root { --font-noto-sans-jp: "Noto Sans JP", sans-serif; --font-jet-mono-en: "JetBrains Mono", monospace; }');

    // メインJavaScript（全ページ共通・ESモジュール）
    wp_enqueue_script_module(
        'my-theme-main-js',
        get_template_directory_uri() . '/_assets/js/common.astro.js',
        array(),
        wp_get_theme()->get('Version'),
    );

    // 特定のページのみでJSを読み込む例
    // if (is_page('home')) {
    //     wp_enqueue_script_module(
    //         'page-index-js',
    //         get_template_directory_uri() . '/_assets/js/page-index.astro.js',
    //         array(),
    //         wp_get_theme()->get('Version')
    //     );
    // }

    // 投稿詳細ページ（single.php）の場合
    // if (is_single()) {
    //     wp_enqueue_script_module(
    //         'single-post-js',
    //         get_template_directory_uri() . '/_assets/js/single-post.js',
    //         array(),
    //         wp_get_theme()->get('Version'),
    //     );
    // }
}
add_action('wp_enqueue_scripts', 'my_theme_scripts');

// ==========================================================
// 投稿・抜粋
// ==========================================================

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

// body_classカスタマイズは fn/utility.php に統合

// ==========================================================
// セキュリティ
// ==========================================================

/**
 * 不要なwp_headタグを削除（パフォーマンス向上・セキュリティ強化）
 */
function my_theme_cleanup_wp_head() {
    // 絵文字関連のスクリプト・スタイルを削除
    remove_action('wp_head', 'print_emoji_detection_script', 7);
    remove_action('admin_print_scripts', 'print_emoji_detection_script');
    remove_action('wp_enqueue_scripts', 'print_emoji_styles');
    remove_action('admin_print_styles', 'print_emoji_styles');
    remove_action('wp_print_styles', 'print_emoji_styles', 10);

    // 不要なメタタグを削除
    remove_action('wp_head', 'wp_generator');         // WordPressバージョン情報
    remove_action('wp_head', 'rsd_link');             // Really Simple Discovery
    remove_action('wp_head', 'wp_shortlink_wp_head'); // 短縮URL
    remove_action('wp_head', 'wlwmanifest_link');     // Windows Live Writer
}
add_action('init', 'my_theme_cleanup_wp_head');

/**
 * pingback/trackbackを無効化
 */
function my_theme_disable_pingbacks() {
    add_filter('xmlrpc_enabled', '__return_false');
    add_filter('wp_headers', function($headers) {
        unset($headers['X-Pingback']);
        return $headers;
    });
}
add_action('init', 'my_theme_disable_pingbacks');

/**
 * ユーザー関連のREST APIエンドポイントを無効化
 */
function my_theme_disable_user_endpoints($endpoints) {
    if (isset($endpoints['/wp/v2/users'])) {
        unset($endpoints['/wp/v2/users']);
    }
    if (isset($endpoints['/wp/v2/users/(?P<id>[\d]+)'])) {
        unset($endpoints['/wp/v2/users/(?P<id>[\d]+)']);
    }
    return $endpoints;
}
add_filter('rest_endpoints', 'my_theme_disable_user_endpoints', 10, 1);

/**
 * /wp/v2/users/ への直接アクセスをリダイレクト
 */
function my_theme_disable_users_rest_query() {
    $request_uri = $_SERVER['REQUEST_URI'] ?? '';
    $query_string = $_SERVER['QUERY_STRING'] ?? '';

    if (preg_match('/wp\/v2\/users/i', $request_uri) ||
        preg_match('/wp\/v2\/users/i', $query_string)) {
        wp_redirect(home_url());
        exit;
    }
}
add_action('init', 'my_theme_disable_users_rest_query');

/**
 * author= パラメータでのユーザー名漏洩を防ぐ
 */
if (!is_admin()) {
    if (isset($_SERVER['QUERY_STRING']) && preg_match('/author=([0-9]*)/i', $_SERVER['QUERY_STRING'])) {
        wp_redirect(home_url());
        exit;
    }
    add_filter('redirect_canonical', 'my_theme_disable_author_enumeration', 10, 2);
}

function my_theme_disable_author_enumeration($redirect, $request) {
    if (preg_match('/\?author=([0-9]*)(\/*)/i', $request)) {
        wp_redirect(home_url());
        exit;
    }
    return $redirect;
}

/**
 * REST APIのユーザーデータからセンシティブ情報を削除
 */
function my_theme_hide_user_data($response, $user, $request) {
    if (!current_user_can('manage_options')) {
        $response->data = array();
    }
    return $response;
}

/**
 * 投稿からauthor情報を削除（必要に応じて）
 */
function my_theme_hide_post_author($response, $post, $request) {
    if (isset($response->data['author'])) {
        $response->data['author'] = (int) $response->data['author'];
    }
    return $response;
}
// add_filter('rest_prepare_post', 'my_theme_hide_post_author', 10, 3);

/**
 * REST APIの不要なエンドポイントを無効化
 * ビルド時に必要な pages, posts, categories のみ残す
 */
function my_theme_restrict_rest_endpoints($endpoints) {
    // 許可するエンドポイントのプレフィックス
    $allowed = array(
        '/wp/v2/posts',
        '/wp/v2/pages',
        '/wp/v2/categories',
        '/wp/v2/tags',
        '/wp/v2/media',
    );

    foreach ($endpoints as $route => $handler) {
        // wp/v2 配下のみ制限（他のプラグインAPIは除外）
        if (strpos($route, '/wp/v2/') !== 0) {
            continue;
        }

        $is_allowed = false;
        foreach ($allowed as $prefix) {
            if (strpos($route, $prefix) === 0) {
                $is_allowed = true;
                break;
            }
        }

        // 管理者はすべてアクセス可能
        if (!$is_allowed && !current_user_can('manage_options')) {
            unset($endpoints[$route]);
        }
    }

    return $endpoints;
}
add_filter('rest_endpoints', 'my_theme_restrict_rest_endpoints', 20, 1);

/**
 * REST APIのレスポンスからセンシティブなフィールドを除外
 */
function my_theme_filter_rest_post_fields($response, $post, $request) {
    $data = $response->get_data();

    // 非認証リクエストからはGUIDとパスワード保護状態を除外
    if (!current_user_can('edit_posts')) {
        unset($data['guid']);
        unset($data['password']);
    }

    $response->set_data($data);
    return $response;
}
add_filter('rest_prepare_post', 'my_theme_filter_rest_post_fields', 10, 3);
add_filter('rest_prepare_page', 'my_theme_filter_rest_post_fields', 10, 3);

/**
 * REST APIを認証必須にする（本番用）
 * 非認証リクエストはすべて401を返す
 * ローカル環境では無効化可能（WP_ENVIRONMENT_TYPE=local）
 */
function my_theme_require_rest_authentication($result) {
    if (wp_get_environment_type() === 'local') {
        return $result;
    }

    if (!is_user_logged_in()) {
        return new WP_Error(
            'rest_not_logged_in',
            'Authentication required.',
            array('status' => 401)
        );
    }

    return $result;
}
add_filter('rest_authentication_errors', 'my_theme_require_rest_authentication');

/**
 * REST API CORSヘッダーを制限
 * 許可するオリジンを限定する（本番デプロイ先のドメインを追加）
 */
function my_theme_rest_cors_headers($headers) {
    $allowed_origins = array(
        'http://localhost:3000',
        'http://localhost:3001',
        'http://localhost:4321',
        // 本番デプロイ時に追加: 'https://example.com',
    );

    $origin = get_http_origin();
    if ($origin && in_array($origin, $allowed_origins, true)) {
        $headers['Access-Control-Allow-Origin'] = $origin;
    } else {
        $headers['Access-Control-Allow-Origin'] = '';
    }

    return $headers;
}
add_filter('rest_pre_serve_request', function($served, $result, $request, $server) {
    $headers = my_theme_rest_cors_headers(array());
    if (!empty($headers['Access-Control-Allow-Origin'])) {
        header('Access-Control-Allow-Origin: ' . $headers['Access-Control-Allow-Origin']);
    } else {
        header_remove('Access-Control-Allow-Origin');
    }
    return $served;
}, 10, 4);

/**
 * XML-RPCエンドポイントを完全に無効化
 */
function my_theme_disable_xmlrpc_completely() {
    add_filter('xmlrpc_methods', function() {
        return array();
    });

    // XML-RPCへのアクセスをブロック
    if (defined('XMLRPC_REQUEST') && XMLRPC_REQUEST) {
        wp_die('XML-RPC is disabled.', 'Forbidden', array('response' => 403));
    }
}
add_action('init', 'my_theme_disable_xmlrpc_completely');

/**
 * プラグインやテーマエディタを無効化（セキュリティ向上）
 */
function my_theme_disable_file_edit() {
    if (!defined('DISALLOW_FILE_EDIT')) {
        define('DISALLOW_FILE_EDIT', true);
    }
}
add_action('init', 'my_theme_disable_file_edit');

/**
 * WordPressの自動更新設定
 */
function my_theme_auto_update_settings() {
    add_filter('allow_minor_auto_core_updates', '__return_true');
    add_filter('allow_major_auto_core_updates', '__return_false');
    // add_filter('auto_update_plugin', '__return_true');
    add_filter('auto_update_theme', '__return_false');
}
add_action('init', 'my_theme_auto_update_settings');

// ==========================================================
// 管理画面カスタマイズ
// ==========================================================

/**
 * 管理画面のダッシュボードをシンプルにする
 */
function my_theme_clean_admin_dashboard() {
    // ようこそパネルを削除
    remove_action('welcome_panel', 'wp_welcome_panel');

    remove_meta_box('dashboard_incoming_links', 'dashboard', 'normal');
    remove_meta_box('dashboard_plugins', 'dashboard', 'normal');
    remove_meta_box('dashboard_primary', 'dashboard', 'side');
    remove_meta_box('dashboard_secondary', 'dashboard', 'side');
    remove_meta_box('dashboard_quick_press', 'dashboard', 'side');
    remove_meta_box('dashboard_recent_drafts', 'dashboard', 'side');
    remove_meta_box('dashboard_recent_comments', 'dashboard', 'normal');
    remove_meta_box('dashboard_right_now', 'dashboard', 'normal');
    remove_meta_box('dashboard_activity', 'dashboard', 'normal');
    // remove_meta_box('dashboard_site_health', 'dashboard', 'normal');

    remove_meta_box('wpe_dify_news_feed', 'dashboard', 'normal');
    remove_meta_box('yith_dashboard_products_news', 'dashboard', 'normal');
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
    $wp_admin_bar->remove_menu('wp-logo');
    $wp_admin_bar->remove_menu('comments');
    // $wp_admin_bar->remove_menu('customize');
}
add_action('wp_before_admin_bar_render', 'my_theme_clean_admin_bar');

/**
 * 管理画面の通知を非表示
 */
function my_theme_hide_admin_notices() {
    if (!current_user_can('update_core')) {
        remove_action('admin_notices', 'update_nag', 3);
        remove_action('network_admin_notices', 'update_nag', 3);
        remove_action('admin_notices', 'maintenance_nag');
        remove_action('network_admin_notices', 'maintenance_nag');
    }
}
add_action('admin_head', 'my_theme_hide_admin_notices', 1);

/**
 * 管理画面メニューの整理
 */
function my_theme_clean_admin_menu() {
    remove_menu_page('edit-comments.php');
    // remove_submenu_page('themes.php', 'theme-editor.php');
    // remove_submenu_page('plugins.php', 'plugin-editor.php');
}
add_action('admin_menu', 'my_theme_clean_admin_menu');

// ==========================================================
// コメント無効化
// ==========================================================

/**
 * コメント関連のRSSフィードを無効化
 */
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

// Gutenbergエディター無効化は fn/editor.php に統合

// ==========================================================
// プレビュー対応
// ==========================================================

/**
 * プレビュー時にカスタムページテンプレートを正しく適用
 * オートセーブ後のプレビューではget_post_metaのキャッシュにより
 * _wp_page_templateが空になるため、DBから直接取得してバイパスする
 */
add_filter('template_include', function ($template) {
    if (!is_preview()) {
        return $template;
    }

    $post_id = get_queried_object_id();
    if (!$post_id) {
        $post_id = isset($_GET['preview_id']) ? (int) $_GET['preview_id'] : 0;
    }
    if (!$post_id) {
        $post_id = isset($_GET['p']) ? (int) $_GET['p'] : 0;
    }
    if (!$post_id || get_post_type($post_id) !== 'page') {
        return $template;
    }

    if (wp_is_post_revision($post_id)) {
        $post_id = wp_get_post_parent_id($post_id);
    }

    global $wpdb;
    $custom_template = $wpdb->get_var($wpdb->prepare(
        "SELECT meta_value FROM {$wpdb->postmeta} WHERE post_id = %d AND meta_key = '_wp_page_template'",
        $post_id
    ));

    if ($custom_template && $custom_template !== 'default') {
        $located = locate_template($custom_template);
        if ($located) {
            return $located;
        }
    }

    return $template;
}, 99);


// ==========================================================
// その他
// ==========================================================

/**
 * HTTPリクエストタイムアウトを延長
 */
add_filter('http_request_timeout', function ($timeout) {
    return 30;
}, 99);

// --------------------------------------------------------------
// 外部ファイルの読み込み（必要に応じてコメントアウト解除）
// --------------------------------------------------------------
require_once('fn/breadcrumb.php');  // パンくず設定
require_once('fn/editor.php');      // エディタ設定
require_once('fn/customfield.php'); // カスタムフィールド設定
require_once('fn/menu.php');        // メニュー設定
require_once('fn/pagenation.php');  // ページネーション設定
require_once('fn/shortcode.php');   // ショートコード
require_once('fn/utility.php');     // 関数など
// require_once('fn/post.php');        // カスタム投稿
// require_once('fn/searchconf.php');  // 検索設定
// require_once('fn/form.php');        // フォーム設定
// require_once('fn/deploy-hook.php'); // 公開時にGitHub Actionsデプロイを起動
