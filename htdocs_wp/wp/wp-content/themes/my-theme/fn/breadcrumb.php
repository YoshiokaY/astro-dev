<?php
/**
 * パンくずリスト生成
 *
 * 使用方法: テンプレート内で <?php breadcrumb(); ?> を呼び出す
 * 構造化データ（Schema.org BreadcrumbList）対応
 *
 * @package MyTheme
 */

function breadcrumb() {
    global $post;
    $title = '';
    $str = '';
    $contentNo = 1;

    if (!is_front_page() && !is_admin()) {
        // TOPページ（必ず表示）
        $str .= '<nav id="breadcrumbs" aria-label="パンくずリスト">';
        $str .= '<ol class="c_bread" itemscope itemtype="https://schema.org/BreadcrumbList">';
        $str .= '<li itemscope class="c_bread_item" itemprop="itemListElement" itemtype="https://schema.org/ListItem">';
        $str .= '<a itemprop="item" href="' . home_url() . '"><span itemprop="name">ホーム</span></a>';
        $str .= '<meta itemprop="position" content="1" /></li>';
        $contentNo++;

        if (is_category()) {
            // カテゴリーアーカイブ（親カテゴリーの階層を表示）
            $cat = get_queried_object();
            if ($cat->parent != 0) {
                $ancestors = array_reverse(get_ancestors($cat->cat_ID, 'category'));
                foreach ($ancestors as $ancestor) {
                    $str .= '<li itemscope class="c_bread_item" itemprop="itemListElement" itemtype="https://schema.org/ListItem">';
                    $str .= '<a itemprop="item" href="' . get_category_link($ancestor) . '"><span itemprop="name">' . get_cat_name($ancestor) . '</span></a>';
                    $str .= '<meta itemprop="position" content="' . (string) $contentNo . '" /></li>';
                    $contentNo++;
                }
            }
            $title = single_cat_title('', false);

        } elseif (is_tag()) {
            $title = '「' . single_tag_title('', false) . '」一覧';

        } elseif (is_date()) {
            $title = get_the_time('Y年n月');

        } elseif (is_author()) {
            $title = esc_html(get_the_author_meta('last_name')) . ' ' . esc_html(get_the_author_meta('first_name')) . 'の記事一覧';

        } elseif (is_page()) {
            // 固定ページ（親ページの階層を表示）
            if ($post->post_parent != 0) {
                $ancestors = array_reverse(get_post_ancestors($post->ID));
                foreach ($ancestors as $ancestor) {
                    $str .= '<li itemscope class="c_bread_item" itemprop="itemListElement" itemtype="https://schema.org/ListItem">';
                    $str .= '<a itemprop="item" href="' . get_permalink($ancestor) . '"><span itemprop="name">' . esc_html(get_the_title($ancestor)) . '</span></a>';
                    $str .= '<meta itemprop="position" content="' . (string) $contentNo . '" /></li>';
                    $contentNo++;
                }
            }
            $title = esc_html(get_the_title());

        } elseif (is_singular()) {
            // 投稿・カスタム投稿詳細（投稿タイプのアーカイブリンクを挿入）
            $post_type = get_post_type();
            $post_type_object = get_post_type_object($post_type);
            if ($post_type_object) {
                $archive_link = get_post_type_archive_link($post_type);
                // postタイプ等でhas_archiveが無効の場合、同名スラッグの固定ページにフォールバック
                if (!$archive_link) {
                    $archive_page = get_page_by_path($post_type === 'post' ? 'news' : $post_type);
                    if ($archive_page) {
                        $archive_link = get_permalink($archive_page);
                    }
                }
                if ($archive_link) {
                    $str .= '<li itemscope class="c_bread_item" itemprop="itemListElement" itemtype="https://schema.org/ListItem">';
                    $str .= '<a itemprop="item" href="' . esc_url($archive_link) . '"><span itemprop="name">' . esc_html($post_type_object->labels->name) . '</span></a>';
                    $str .= '<meta itemprop="position" content="' . (string) $contentNo . '" /></li>';
                    $contentNo++;
                }
            }
            $title = esc_html(get_the_title());

        } elseif (is_tax()) {
            // カスタムタクソノミーアーカイブ
            $query = get_queried_object();
            $post_type = get_post_type();
            $post_type_object = get_post_type_object($post_type);
            if ($post_type_object) {
                $archive_link = get_post_type_archive_link($post_type);
                $str .= '<li itemscope class="c_bread_item" itemprop="itemListElement" itemtype="https://schema.org/ListItem">';
                $str .= '<a itemprop="item" href="' . esc_url($archive_link) . '"><span itemprop="name">' . esc_html($post_type_object->labels->name) . '</span></a>';
                $str .= '<meta itemprop="position" content="' . (string) $contentNo . '" /></li>';
                $contentNo++;
            }

            // 親タームの階層を表示
            $taxonomy_slug = $query->taxonomy;
            if ($query->parent != 0) {
                $ancestors = array_reverse(get_ancestors($query->term_id, $taxonomy_slug));
                foreach ($ancestors as $ancestor) {
                    $term_obj = get_term($ancestor, $taxonomy_slug);
                    $str .= '<li itemscope class="c_bread_item" itemprop="itemListElement" itemtype="https://schema.org/ListItem">';
                    $str .= '<a itemprop="item" href="' . get_term_link($ancestor, $taxonomy_slug) . '"><span itemprop="name">' . esc_html($term_obj->name) . '</span></a>';
                    $str .= '<meta itemprop="position" content="' . (string) $contentNo . '" /></li>';
                    $contentNo++;
                }
            }
            $title = esc_html($query->name);

        } elseif (is_post_type_archive()) {
            $title = esc_html(post_type_archive_title('', false));

        } elseif (is_404()) {
            $title = 'ページが見つかりません';

        } elseif (is_search()) {
            $title = esc_html(get_search_query()) . 'の検索結果';
        }

        // 現在のページ（リンクなし）
        $str .= '<li class="c_bread_item" itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem">';
        $str .= '<span itemprop="name">' . $title . '</span>';
        $str .= '<meta itemprop="position" content="' . (string) $contentNo . '"></li>';
        $str .= '</ol></nav>';
    }

    echo $str;
}
