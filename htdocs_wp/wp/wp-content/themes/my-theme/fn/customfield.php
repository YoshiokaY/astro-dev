<?php
/**
 * カスタムフィールド設定
 *
 * @package MyTheme
 */

/**
 * 管理画面の検索でACFカスタムフィールドの値も対象にする
 *
 * 3つのフィルターで構成:
 * 1. posts_join:     wp_postmetaテーブルをLEFT JOINして検索対象に含める
 * 2. posts_where:    WHERE句にmeta_valueへのLIKE検索を追加する
 * 3. posts_distinct:  JOINによる重複行をDISTINCTで除去する
 */
function my_theme_search_join_meta($join) {
    global $wpdb;
    if (is_search() && is_admin()) {
        $join .= " LEFT JOIN {$wpdb->postmeta} ON {$wpdb->posts}.ID = {$wpdb->postmeta}.post_id ";
    }
    return $join;
}
add_filter('posts_join', 'my_theme_search_join_meta');

function my_theme_search_where_meta($where, $wp_query) {
    global $wpdb;
    if (is_search() && is_admin()) {
        $search_term = $wpdb->esc_like($wp_query->get('s'));
        $search_term = esc_sql($search_term);
        $where .= " OR ({$wpdb->postmeta}.meta_value LIKE '%{$search_term}%' AND {$wpdb->posts}.post_type NOT IN ('revision')) ";
    }
    return $where;
}
add_filter('posts_where', 'my_theme_search_where_meta', 10, 2);

function my_theme_search_distinct($distinct) {
    if (is_search() && is_admin()) {
        return "DISTINCT";
    }
    return $distinct;
}
add_filter('posts_distinct', 'my_theme_search_distinct');

/**
 * ACF画像フィールドのREST APIレスポンスをIDからオブジェクトに変換
 * {url, width, height, alt} を返す
 */
add_filter('acf/rest/format_value_for_rest', function ($value, $post_id, $field) {
    if ($field['type'] !== 'image' || empty($value)) {
        return $value;
    }

    $id = is_array($value) ? ($value['ID'] ?? $value['id'] ?? 0) : intval($value);
    if (!$id) return $value;

    $src = wp_get_attachment_image_src($id, 'full');
    if (!$src) return $value;

    return [
        'url'    => $src[0],
        'width'  => $src[1],
        'height' => $src[2],
        'alt'    => get_post_meta($id, '_wp_attachment_image_alt', true),
    ];
}, 10, 3);

/**
 * ACF Free版 Group連番パターンのアイテムを配列として取得
 *
 * @param string $prefix     フィールド名プレフィックス（例: 'works_item'）
 * @param int    $max        最大件数
 * @param string $count_key  件数フィールド名（例: 'works_item_count'）
 * @return array アイテム配列
 */
function my_theme_get_serial_groups($prefix, $max, $count_key = '') {
    if (!$count_key) {
        $count_key = $prefix . '_count';
    }
    $count = intval(get_field($count_key));
    if ($count <= 0) return [];

    $items = [];
    $limit = min($count, $max);
    for ($i = 1; $i <= $limit; $i++) {
        $item = get_field($prefix . '_' . $i);
        if (!empty($item)) {
            $items[] = $item;
        }
    }
    return $items;
}

/**
 * Group内のネストされた連番グループを配列として取得
 *
 * @param array  $parent     親グループの値
 * @param string $prefix     サブフィールド名プレフィックス
 * @param int    $max        最大件数
 * @return array
 */
function my_theme_get_nested_groups($parent, $prefix, $max) {
    $count_key = $prefix . '_count';
    $count = isset($parent[$count_key]) ? intval($parent[$count_key]) : 0;
    if ($count <= 0) return [];

    $items = [];
    $limit = min($count, $max);
    for ($i = 1; $i <= $limit; $i++) {
        $key = $prefix . '_' . $i;
        if (!empty($parent[$key])) {
            $items[] = $parent[$key];
        }
    }
    return $items;
}

/**
 * textarea（改行区切り）を配列に変換
 *
 * @param string $text
 * @return array
 */
function my_theme_textarea_to_array($text) {
    if (empty($text)) return [];
    $text = preg_replace('/<br\s*\/?>/i', "\n", $text);
    return array_values(array_filter(array_map('trim', explode("\n", $text))));
}

/**
 * ACF管理画面: カウントフィールドの値に連動して連番グループの表示/非表示を切り替え
 *
 * 命名規則: {prefix}_count → {prefix}_1, {prefix}_2, ... を制御
 * 例: qa_items_count=3 → qa_item_1〜3を表示、4以降を非表示
 */
add_action('acf/input/admin_footer', function () {
?>
<script>
(function() {
    if (typeof acf === 'undefined') return;

    /**
     * _count フィールドを検出し、対応する連番フィールドの表示を制御
     * フィールド名パターン: {prefix}_count → {prefix}_1, {prefix}_2, ...
     *                     または {prefix}s_count → {prefix}_1, {prefix}_2, ...
     */
    function toggleSerialFields(countField) {
        var fieldName = countField.data.name;
        if (!fieldName || !fieldName.endsWith('_count')) return;

        var count = parseInt(countField.val()) || 0;

        // {xxx}_count → {xxx}_ をプレフィックスとして連番フィールドを検索
        // 例: qa_items_count → qa_item_, videos_items_count → videos_item_
        var base = fieldName.replace(/_count$/, '');
        var prefixes = [base + '_'];

        // {xxx}s_count → {xxx}_ もカバー（items_count → item_）
        if (base.endsWith('s')) {
            prefixes.push(base.slice(0, -1) + '_');
        }

        acf.getFields().forEach(function(field) {
            var name = field.data.name;
            if (!name) return;

            prefixes.forEach(function(prefix) {
                var match = name.match(new RegExp('^' + prefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '(\\d+)$'));
                if (match) {
                    var index = parseInt(match[1]);
                    var el = field.$el.closest('.acf-field-group, .acf-field');
                    if (el.length) {
                        if (index <= count) {
                            el.show();
                        } else {
                            el.hide();
                        }
                    }
                }
            });
        });
    }

    // カウントフィールドの変更を監視
    acf.addAction('ready_field/type=number', function(field) {
        if (field.data.name && field.data.name.endsWith('_count')) {
            toggleSerialFields(field);
        }
    });
    acf.addAction('change', function(field) {
        if (field && field.data && field.data.name && field.data.name.endsWith('_count')) {
            toggleSerialFields(field);
        }
    });
})();
</script>
<?php
});
