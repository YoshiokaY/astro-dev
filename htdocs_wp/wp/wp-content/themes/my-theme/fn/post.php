<?php

 function custom_menus() {
  global $menu;
  $menu[19] = $menu[10];
  unset($menu[10]);
}
add_action('admin_menu', 'custom_menus');

/**
 * 汎用カスタム投稿タイプ作成システム
 * 設定配列を使って複数のカスタム投稿タイプを効率的に作成
 */

class CustomPostTypeManager {

    private $post_types = [];

    public function __construct() {
        add_action('init', [$this, 'register_post_types']);
        add_action('restrict_manage_posts', [$this, 'add_taxonomy_filters']);
        add_action('pre_get_posts', [$this, 'filter_posts_by_taxonomies']);
    }

    /**
     * カスタム投稿タイプの設定を追加
     */
    public function add_post_type($config) {
        $this->post_types[] = $config;
    }

    /**
     * 全てのカスタム投稿タイプとタクソノミーを登録
     */
    public function register_post_types() {
        foreach ($this->post_types as $config) {
            $this->register_single_post_type($config);
        }
    }

    /**
     * 単一のカスタム投稿タイプを登録
     */
    private function register_single_post_type($config) {
        $slug = $config['slug'];
        $label = $config['label'];

        // デフォルト設定
        $defaults = [
            'public' => true,
            'show_ui' => true,
            'show_in_menu' => true,
            'show_in_admin_bar' => true,
            'show_in_nav_menus' => true,
            'can_export' => true,
            'has_archive' => true,
            'exclude_from_search' => false,
            'publicly_queryable' => true,
            'capability_type' => 'post',
            'show_in_rest' => true,
            'menu_position' => 5,
            'supports' => ['title', 'editor', 'thumbnail', 'custom-fields', 'excerpt'],
            'rewrite' => ['slug' => $slug, 'with_front' => false],
        ];

        // ラベルの自動生成
        $labels = [
            'name' => $label,
            'singular_name' => $label,
            'menu_name' => $label,
            'all_items' => $label . '一覧',
            'add_new_item' => $label . 'を追加',
            'add_new' => '新規追加',
            'new_item' => '新しい' . $label,
            'edit_item' => $label . 'を編集',
            'update_item' => $label . 'を更新',
            'view_item' => $label . 'を表示',
            'view_items' => $label . 'を表示',
            'search_items' => $label . 'を検索',
            'not_found' => $label . 'が見つかりません',
            'not_found_in_trash' => 'ゴミ箱に' . $label . 'はありません',
            'featured_image' => 'アイキャッチ画像',
            'set_featured_image' => 'アイキャッチ画像を設定',
            'remove_featured_image' => 'アイキャッチ画像を削除',
            'use_featured_image' => 'アイキャッチ画像として使用',
            'insert_into_item' => $label . 'に挿入',
            'uploaded_to_this_item' => 'この' . $label . 'にアップロード',
            'items_list' => $label . 'リスト',
            'items_list_navigation' => $label . 'リストナビゲーション',
            'filter_items_list' => $label . 'リストをフィルター',
        ];

        // 設定をマージ
        $args = array_merge($defaults, $config['args'] ?? []);
        $args['labels'] = array_merge($labels, $config['labels'] ?? []);

        // 投稿タイプを登録
        register_post_type($slug, $args);

        // タクソノミーがある場合は登録
        if (isset($config['taxonomies'])) {
            foreach ($config['taxonomies'] as $taxonomy_config) {
                $this->register_taxonomy($taxonomy_config, $slug);
            }
        }
    }

    /**
     * タクソノミーを登録
     */
    private function register_taxonomy($config, $post_type_slug) {
        $taxonomy_slug = $config['slug'];
        $taxonomy_label = $config['label'];

        // タクソノミーラベルの自動生成
        $labels = [
            'name' => $taxonomy_label,
            'singular_name' => $taxonomy_label,
            'menu_name' => $taxonomy_label,
            'all_items' => 'すべての' . $taxonomy_label,
            'parent_item' => '親' . $taxonomy_label,
            'parent_item_colon' => '親' . $taxonomy_label . '：',
            'new_item_name' => '新しい' . $taxonomy_label . '名',
            'add_new_item' => '新しい' . $taxonomy_label . 'を追加',
            'edit_item' => $taxonomy_label . 'を編集',
            'update_item' => $taxonomy_label . 'を更新',
            'view_item' => $taxonomy_label . 'を表示',
            'separate_items_with_commas' => $taxonomy_label . 'をカンマで区切ってください',
            'add_or_remove_items' => $taxonomy_label . 'を追加または削除',
            'choose_from_most_used' => 'よく使われる' . $taxonomy_label . 'から選択',
            'popular_items' => '人気の' . $taxonomy_label,
            'search_items' => $taxonomy_label . 'を検索',
            'not_found' => $taxonomy_label . 'が見つかりません',
            'no_terms' => $taxonomy_label . 'がありません',
            'items_list' => $taxonomy_label . 'リスト',
            'items_list_navigation' => $taxonomy_label . 'リストナビゲーション',
        ];

        // デフォルト設定
        $defaults = [
            'hierarchical' => false,
            'public' => true,
            'show_ui' => true,
            'show_admin_column' => true,
            'show_in_nav_menus' => true,
            'show_tagcloud' => true,
            'show_in_rest' => true,
            'query_var' => true,
            'rewrite' => ['slug' => $taxonomy_slug],
        ];

        // 設定をマージ
        $args = array_merge($defaults, $config['args'] ?? []);
        $args['labels'] = array_merge($labels, $config['labels'] ?? []);

        // タクソノミーを登録
        register_taxonomy($taxonomy_slug, $post_type_slug, $args);
    }

    /**
     * 管理画面にタクソノミーフィルターを追加
     */
    public function add_taxonomy_filters() {
        global $post_type;

        // 現在の投稿タイプがカスタム投稿タイプかチェック
        $current_config = null;
        foreach ($this->post_types as $config) {
            if ($config['slug'] === $post_type) {
                $current_config = $config;
                break;
            }
        }

        if (!$current_config || !isset($current_config['taxonomies'])) {
            return;
        }

        // 各タクソノミーのドロップダウンを作成
        foreach ($current_config['taxonomies'] as $taxonomy_config) {
            $taxonomy_slug = $taxonomy_config['slug'];
            $taxonomy_label = $taxonomy_config['label'];

            wp_dropdown_categories([
                'show_option_all' => 'すべての' . $taxonomy_label,
                'orderby' => 'name',
                'selected' => get_query_var($taxonomy_slug),
                'hide_empty' => false,
                'name' => $taxonomy_slug,
                'taxonomy' => $taxonomy_slug,
                'value_field' => 'slug',
            ]);
        }
    }

    /**
     * タクソノミーによる投稿フィルタリング
     */
    public function filter_posts_by_taxonomies($query) {
        global $post_type, $pagenow;

        if ($pagenow !== 'edit.php' || !$query->is_main_query()) {
            return;
        }

        // 現在の投稿タイプの設定を取得
        $current_config = null;
        foreach ($this->post_types as $config) {
            if ($config['slug'] === $post_type) {
                $current_config = $config;
                break;
            }
        }

        if (!$current_config || !isset($current_config['taxonomies'])) {
            return;
        }

        $tax_queries = [];

        // 各タクソノミーの選択値をチェック
        foreach ($current_config['taxonomies'] as $taxonomy_config) {
            $taxonomy_slug = $taxonomy_config['slug'];

            if (!empty($_GET[$taxonomy_slug])) {
                $tax_queries[] = [
                    'taxonomy' => $taxonomy_slug,
                    'field' => 'slug',
                    'terms' => sanitize_text_field($_GET[$taxonomy_slug]),
                ];
            }
        }

        if (!empty($tax_queries)) {
            if (count($tax_queries) > 1) {
                $tax_queries['relation'] = 'AND';
            }
            $query->set('tax_query', $tax_queries);
        }
    }
}

// --------------------------------------------------------------
// カスタムタクソノミー用チェックボックスメタボックス
// --------------------------------------------------------------
/**
 * チェックボックス形式のメタボックス（複数選択可能）
 * クイック編集にも対応
 */
function meta_box_change_checkbox( $post, $box ) {
    $defaults = array( 'taxonomy' => 'category' );
    if ( ! isset( $box['args'] ) || ! is_array( $box['args'] ) ) {
        $args = array();
    } else {
        $args = $box['args'];
    }
    $r = wp_parse_args( $args, $defaults );
    $tax_name = esc_attr( $r['taxonomy'] );
    $taxonomy = get_taxonomy( $r['taxonomy'] );

    // post_tagなど非階層型タクソノミーはslugを使用、それ以外はterm_idを使用
    $use_slug = ( $tax_name === 'post_tag' || !$taxonomy->hierarchical );

    echo '<div id="taxonomy-'.$tax_name.'" class="categorydiv">';
    echo '<div id="'.$tax_name.'-all" class="tabs-panel">';

    $name = 'tax_input['.$tax_name.']';
    echo "<input type='hidden' name='{$name}[]' value='0' />";

    $terms = get_terms( array(
        'taxonomy' => $tax_name,
        'hide_empty' => false,
        'orderby' => 'id',
        'order' => 'ASC'
    ));

    $selected_terms = wp_get_object_terms( $post->ID, $tax_name );
    $selected_values = array();
    if( $selected_terms && !is_wp_error($selected_terms) ){
        foreach( $selected_terms as $term ) {
            // post_tagの場合はスラッグを、それ以外はterm_idを配列に追加
            $selected_values[] = $use_slug ? $term->slug : $term->term_id;
        }
    }

    echo '<ul id="'.$tax_name.'checklist" data-wp-lists="list:'.$tax_name.'" class="categorychecklist form-no-clear">';

    foreach( $terms as $term ){
        $id = $tax_name.'-'.$term->term_id;
        $value = $use_slug ? $term->slug : $term->term_id;
        $checked = in_array( $value, $selected_values ) ? 'checked="checked"' : '';

        echo '<li id="'.$id.'" class="popular-category">';
        echo '<label class="selectit">';
        echo '<input id="in-'.$id.'" type="checkbox" '.$checked.' value="'.esc_attr($value).'" name="tax_input['.$tax_name.'][]"/>';
        echo esc_html( $term->name );
        echo '</label>';
        echo '</li>';
    }

    echo '</ul>';
    echo '</div>';
    echo '</div>';
}

// インスタンスを作成
$custom_post_type_manager = new CustomPostTypeManager();

// ===== カスタム投稿タイプの設定 =====


// --------------------------------------------------------------
// デフォルトの投稿の設定
// --------------------------------------------------------------
function apply_tag_checkbox() {
    remove_meta_box('tagsdiv-post_tag', 'post', 'side');
    add_meta_box(
        'tagsdiv-post_tag',
        'タグ',
        'meta_box_change_checkbox',
        'post',
        'side',
        'default',
        array('taxonomy' => 'post_tag')
    );
}
add_action('add_meta_boxes', 'apply_tag_checkbox');



// 投稿ラベルのリネームが必要な場合は以下を有効化（$nameを変更して使用）
// function Change_menulabel() {
// 	global $menu;
// 	global $submenu;
// 	$name = 'お知らせ';
// 	$menu[5][0] = $name;
// 	$submenu['edit.php'][5][0] = $name.'一覧';
// 	$submenu['edit.php'][10][0] = '新規記事追加';
// }
// function Change_objectlabel() {
// 	global $wp_post_types;
// 	$name = 'お知らせ';
// 	$labels = &$wp_post_types['post']->labels;
// 	$labels->name = $name;
// 	$labels->singular_name = $name;
// 	$labels->add_new = _x('追加', $name);
// 	$labels->add_new_item = $name.'の新規追加';
// 	$labels->edit_item = $name.'の編集';
// 	$labels->new_item = '新規'.$name;
// 	$labels->view_item = $name.'を表示';
// 	$labels->search_items = $name.'を検索';
// 	$labels->not_found = $name.'が見つかりませんでした';
// 	$labels->not_found_in_trash = 'ゴミ箱に'.$name.'は見つかりませんでした';
// }
// add_action( 'init', 'Change_objectlabel' );
// add_action( 'admin_menu', 'Change_menulabel' );

?>
