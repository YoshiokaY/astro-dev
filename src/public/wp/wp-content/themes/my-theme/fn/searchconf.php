<?php
/**
 * サイト内検索設定
 *
 * @package MyTheme
 */

/**
 * フロント検索からトップページを除外
 */
function my_theme_search_filter($query) {
    if (!is_admin() && $query->is_main_query() && $query->is_search()) {
        $front_page_id = get_option('page_on_front');
        if ($front_page_id) {
            $query->set('post__not_in', array($front_page_id));
        }
    }
    return $query;
}
add_action('pre_get_posts', 'my_theme_search_filter');

/**
 * 空文字・空白のみの検索を無効化（結果0件として処理）
 */
function my_theme_search_no_results() {
    if (isset($_GET['s']) && preg_match('/^[\s\x{3000}]*$/u', $_GET['s'])) {
        global $wp_query;
        $wp_query->init();
        $wp_query->is_search = true;
    }
}
add_action('template_redirect', 'my_theme_search_no_results');

/**
 * フロント検索を拡張（タグ・カテゴリー名も検索対象にする）
 *
 * カスタムフィールド検索は customfield.php の管理画面用と重複するため、
 * フロント側でも必要な場合はコメントアウトを解除する
 */
function my_theme_custom_search($search, $wp_query) {
    global $wpdb;

    if (!$wp_query->is_search || is_admin()) {
        return $search;
    }

    if (!isset($wp_query->query_vars['s'])) {
        return $search;
    }

    $search_words = explode(' ', $wp_query->query_vars['s']);
    $search_words = array_filter($search_words);
    if (empty($search_words)) {
        return $search;
    }

    $search = '';
    foreach ($search_words as $word) {
        $like = '%' . $wpdb->esc_like($word) . '%';

        $search .= $wpdb->prepare(
            " AND (
                {$wpdb->posts}.post_title LIKE %s
                OR {$wpdb->posts}.post_content LIKE %s
                OR {$wpdb->posts}.ID IN (
                    SELECT DISTINCT r.object_id
                    FROM {$wpdb->term_relationships} AS r
                    INNER JOIN {$wpdb->term_taxonomy} AS tt ON r.term_taxonomy_id = tt.term_taxonomy_id
                    INNER JOIN {$wpdb->terms} AS t ON tt.term_id = t.term_id
                    WHERE t.name LIKE %s
                )
            ) ",
            $like, $like, $like
        );

        // カスタムフィールドも検索対象にする場合は以下を有効化
        // ※ customfield.php の管理画面用メタ検索とは独立して動作
        // $search .= $wpdb->prepare(
        //     " AND (
        //         {$wpdb->posts}.post_title LIKE %s
        //         OR {$wpdb->posts}.post_content LIKE %s
        //         OR {$wpdb->posts}.ID IN (
        //             SELECT DISTINCT r.object_id
        //             FROM {$wpdb->term_relationships} AS r
        //             INNER JOIN {$wpdb->term_taxonomy} AS tt ON r.term_taxonomy_id = tt.term_taxonomy_id
        //             INNER JOIN {$wpdb->terms} AS t ON tt.term_id = t.term_id
        //             WHERE t.name LIKE %s
        //         )
        //         OR {$wpdb->posts}.ID IN (
        //             SELECT DISTINCT post_id
        //             FROM {$wpdb->postmeta}
        //             WHERE meta_value LIKE %s
        //         )
        //     ) ",
        //     $like, $like, $like, $like
        // );
    }

    return $search;
}
add_filter('posts_search', 'my_theme_custom_search', 10, 2);
