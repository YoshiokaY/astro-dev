<?php
/**
 * ページネーション設定
 *
 * @package MyTheme
 */

/**
 * ページネーション出力
 *
 * paginate_links() をベースに「最初/最後」リンクを追加した汎用ページネーション
 *
 * @param array $args {
 *     @type int    $mid_size   現在ページ前後に表示するページ番号数（デフォルト: 1）
 *     @type int    $end_size   先頭・末尾に常に表示するページ番号数（デフォルト: 1）
 *     @type string $prev_text  前ページリンクのテキスト
 *     @type string $next_text  次ページリンクのテキスト
 *     @type string $first_text 最初のページリンクのテキスト
 *     @type string $last_text  最後のページリンクのテキスト
 *     @type bool   $show_first_last 最初/最後リンクを表示するか（デフォルト: true）
 * }
 */
function my_theme_pagination($args = array()) {
    global $wp_query;

    $total = $wp_query->max_num_pages;
    if ($total <= 1) return;

    $paged = max(1, get_query_var('paged', 1));

    $args = wp_parse_args($args, array(
        'mid_size'         => 1,
        'end_size'         => 1,
        'prev_text'        => '<span aria-label="前のページを表示する">prev</span>',
        'next_text'        => '<span aria-label="次のページを表示する">next</span>',
        'first_text'       => '最初',
        'last_text'        => '最後',
        'show_first_last'  => true,
        'screen_reader_text' => 'ページ送り',
    ));

    $show_first_last = $args['show_first_last'];
    $first_text      = $args['first_text'];
    $last_text       = $args['last_text'];
    unset($args['show_first_last'], $args['first_text'], $args['last_text']);

    $args['type'] = 'array';
    $links = paginate_links($args);
    if (!$links) return;

    $items = '';

    // 「最初」リンク（2ページ目以降）
    if ($show_first_last && $paged > 1) {
        $items .= sprintf(
            '<li class="c_pager_list-item -first"><a href="%s" aria-label="最初のページを表示する">%s</a></li>',
            esc_url(get_pagenum_link(1)),
            esc_html($first_text)
        );
    }

    // paginate_links の各リンクにクラスを付与
    foreach ($links as $link) {
        $modifier = '';
        if (strpos($link, 'prev') !== false)         $modifier = ' -prev';
        elseif (strpos($link, 'next') !== false)      $modifier = ' -next';
        elseif (strpos($link, 'current') !== false)   $modifier = ' -current';
        elseif (strpos($link, 'dots') !== false) {
            $modifier = ' -dots';
            $link = '<span aria-hidden="true">&hellip;</span>';
        }

        $items .= '<li class="c_pager_list-item' . $modifier . '">' . $link . '</li>';
    }

    // 「最後」リンク（最終ページ以外）
    if ($show_first_last && $paged < $total) {
        $items .= sprintf(
            '<li class="c_pager_list-item -last"><a href="%s" aria-label="最後のページを表示する">%s</a></li>',
            esc_url(get_pagenum_link($total)),
            esc_html($last_text)
        );
    }

    printf(
        '<nav class="c_pager" aria-label="%s"><ol class="c_pager_list">%s</ol></nav>',
        esc_attr($args['screen_reader_text']),
        $items
    );
}

/**
 * 子カテゴリーのURL解決と、カテゴリーページ送りの404を回避
 */
function my_theme_category_link_fix($query = array()) {
    // 子カテゴリーの404を回避
    if (isset($query['category_name']) && strpos($query['category_name'], '/') === false && isset($query['name'])) {
        $parent_category = get_category_by_slug($query['category_name']);
        if ($parent_category) {
            $child_categories = get_categories('child_of=' . $parent_category->term_id);
            foreach ($child_categories as $child_category) {
                if ($query['name'] === $child_category->category_nicename) {
                    $query['category_name'] = $query['category_name'] . '/' . $query['name'];
                    unset($query['name']);
                }
            }
        }
    }

    // カテゴリーのページ送りを修正して404を回避
    if (isset($query['name']) && $query['name'] === 'page' && isset($query['page'])) {
        $paged = $query['page'];
        if (is_numeric($paged)) {
            $query['paged'] = (int) $paged;
            unset($query['name']);
            unset($query['page']);
        }
    }

    return $query;
}
add_filter('request', 'my_theme_category_link_fix');

/**
 * アーカイブの表示件数カスタマイズ（必要に応じて有効化）
 */
// function my_theme_posts_per_page($query) {
//     if (is_admin() || !$query->is_main_query()) return;
//
//     if ($query->is_search()) {
//         $query->set('posts_per_page', 12);
//     }
//     if ($query->is_category()) {
//         $query->set('posts_per_page', 10);
//     }
// }
// add_action('pre_get_posts', 'my_theme_posts_per_page');
