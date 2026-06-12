<?php
// *** エディター関連 ***

// --------------------------------------------------------------
// グーテンベルグ解除
// --------------------------------------------------------------
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
    if (!function_exists('is_plugin_active')) {
        include_once ABSPATH . 'wp-admin/includes/plugin.php';
    }
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

// --------------------------------------------------------------
// YARPP解除
// --------------------------------------------------------------
// YARPPのwidget.cssを削除
// add_action('wp_print_styles','crunchify_dequeue_header_styles');
// function crunchify_dequeue_header_styles()
// {
//   wp_dequeue_style('yarppWidgetCss');
// }

// // YARPPのrelated.cssを削除
// add_action('get_footer','crunchify_dequeue_footer_styles');
// function crunchify_dequeue_footer_styles()
// {
//   wp_dequeue_style('yarppRelatedCss');
// }

// --------------------------------------------------------------
// エディタ設定
// --------------------------------------------------------------
//エディタ用スタイルシートの読み込み
function add_block_editor_styles() {
  wp_enqueue_style( 'block-style', get_stylesheet_directory_uri() . '/editor-style.css' );
}
add_action( 'enqueue_block_editor_assets', 'add_block_editor_styles' );

// 投稿編集画面で不要な項目を非表示にする
function my_remove_post_support() {
  remove_post_type_support('post','author'); // 投稿者
  remove_post_type_support('post','excerpt'); // 抜粋
  remove_post_type_support('post','trackbacks'); // トラックバック
  remove_post_type_support('post','comments'); // ディスカッション
  // remove_post_type_support('post','revisions'); // リビジョン（プレビュー機能に影響するため無効化しない）
  // remove_post_type_support('post','thumbnail');  // アイキャッチ
  remove_post_type_support('post','editor');  // 本文（ACFセクションで代替）
  // unregister_taxonomy_for_object_type( 'category', 'post' );
	// unregister_taxonomy_for_object_type( 'post_tag', 'post' );
}
add_action('init','my_remove_post_support');

// --------------------------------------------------------------
// 固定ページで標準エディターを非表示にする
// --------------------------------------------------------------
/**
 * 全ての固定ページで標準エディター（本文）を非表示
 * カスタムフィールドのみ使用したい場合に使用
 */
// function remove_editor_for_pages() {
//     // 全ての固定ページでエディターを非表示
//     remove_post_type_support('page', 'editor');
// }
// add_action('admin_init', 'remove_editor_for_pages');

/**
 * 【旧実装】特定のページIDで標準エディターを非表示（コメントアウトで残す）
 * 特定のページのみエディターを非表示にしたい場合は、上記の関数をコメントアウトして
 * 以下の関数のコメントを解除してください
 */
/*
function remove_editor_for_specific_pages() {
    // エディターを非表示にしたいページIDを配列で指定
    $page_ids_to_remove_editor = array(
        // 2,    // 例：ページID 2
        // 10,   // 例：ページID 10
        // 25,   // 例：ページID 25
        4
    );

    if (isset($_GET['post']) || isset($_POST['post'])) {
        $post_id = isset($_GET['post']) ? $_GET['post'] : $_POST['post'];

        if (in_array($post_id, $page_ids_to_remove_editor)) {
            remove_post_type_support('page', 'editor');
        }
    }
}
add_action('admin_init', 'remove_editor_for_specific_pages');
*/
/* 【管理画面】固定ページの編集画面で不要な項目を非表示にする */
function my_remove_meta_boxes() {
  remove_meta_box('trackbacksdiv','post','normal' );    // トラックバック
}
add_action('admin_menu','my_remove_meta_boxes' );

// --------------------------------------------------------------
// 固定ページの自動整形無効化（pタグを自動で入らないようにする）
// --------------------------------------------------------------
function wpautop_filter($content) {
  global $post;
  $remove_filter = false;
  $arr_types = array('page'); // 自動整形を無効にする投稿タイプを記述
  $post_type = get_post_type( $post->ID );
  if (in_array($post_type, $arr_types)) {
    $remove_filter = true;
  }
  if ( $remove_filter ) {
    remove_filter('the_content', 'wpautop');
    remove_filter('the_excerpt', 'wpautop');
  }
  return $content;
}
add_filter('the_content', 'wpautop_filter', 9);

//term_description() でPタグがつかないように
remove_filter('term_description','wpautop');

// --------------------------------------------------------------
// ビジュアルエディタから見出し1を削除
// --------------------------------------------------------------
function custom_tiny_mce_formats( $settings ){
  $settings[ 'block_formats' ] = '段落=p;見出し3=h3;見出し4=h4;見出し5=h5;注釈=pre;';
  return $settings;
}
add_filter( 'tiny_mce_before_init', 'custom_tiny_mce_formats' );

function my_h_style() {
  echo '<style>
  button[aria-label="見出し1"],button[aria-label="見出し2"],button[aria-label="見出し6"]
  {
    display: none;
  }
  </style>'.PHP_EOL;
}
add_action('admin_print_styles', 'my_h_style');

// --------------------------------------------------------------
// 固定ページでビジュアルエディタを無効にする
// --------------------------------------------------------------

// function disable_visual_editor( $wp_rich_edit ) {
//   $posttype = get_post_type();
//   if ( $posttype === 'page' ) {
//       return false;
//   } else {
//      return $wp_rich_edit;
//   }
// }
// add_filter( 'user_can_richedit', 'disable_visual_editor' );

// --------------------------------------------------------------
// エディタのデフォルトを「テキスト」にする
// --------------------------------------------------------------
// function change_editor_default( $editor ) {
//   $editor = 'html';
//   return $editor;
// }
// add_filter( 'wp_default_editor', 'change_editor_default' );

// --------------------------------------------------------------
// 投稿一覧にサムネイルカラム追加
// --------------------------------------------------------------
function customize_manage_posts_columns($columns) {
  $columns['thumbnail'] = __('Thumbnail');
  return $columns;
}
add_filter( 'manage_posts_columns', 'customize_manage_posts_columns' );

// サムネイル画像表示
function customize_manage_posts_custom_column($column_name, $post_id) {
  if ( 'thumbnail' == $column_name) {
      $thum = get_the_post_thumbnail($post_id, 'small', array( 'style'=>'width:100px;height:auto;' ));
      if ( $thum ) {
          echo $thum;
      } else {
          echo __('None');
      }
  }
}
add_action( 'manage_posts_custom_column', 'customize_manage_posts_custom_column', 10, 2 );

// 投稿者権限にメディア管理権限を追加（管理者・編集者のみ運用のため不要）
// function author_can_manage_media() {
//     $role = get_role( 'author' );
//     $role->add_cap( 'manage_media' );
// }
// add_action( 'after_switch_theme', 'author_can_manage_media' );

// --------------------------------------------------------------
// 新規カテゴリーボタンを削除
// --------------------------------------------------------------
function my_admin_style() {
  echo '<style>
  div.wp-hidden-children a.hide-if-no-js,
  .editor-post-taxonomies__hierarchical-terms-add.is-link{
  display:none;
  }
  </style>
  '.PHP_EOL;
  }
  add_action('admin_print_styles', 'my_admin_style');
// --------------------------------------------------------------
// カテゴリー選択をラジオボタンに変更
// --------------------------------------------------------------
function meta_box_change_radio( $post, $box ) {
  $defaults = array( 'taxonomy' => 'category' );
  if ( ! isset( $box['args'] ) || ! is_array( $box['args'] ) ) {
      $args = array();
  } else {
      $args = $box['args'];
  }
  $r = wp_parse_args( $args, $defaults );
  $tax_name = esc_attr( $r['taxonomy'] );
  $taxonomy = get_taxonomy( $r['taxonomy'] );
echo '<div id="'.$tax_name.'-all" class="tabs-panel">';
$name = ( $tax_name == 'category' ) ? 'post_category' : 'tax_input['.$tax_name.']';
echo "<input type='hidden' name='{$name}[]' value='0' />";
$terms = get_terms( $tax_name, array( 'get' => 'all' , 'orderby' => 'id', 'order' => 'ASC' ) );   //並び順は自由に
$select_terms = get_the_terms($post->ID,$tax_name);
$selected_id = '';
if( $select_terms ){
  $selected_id = array_shift($select_terms)->term_id;
}

// あらかじめチェックを入れたいカテゴリーIDを指定
$pre_checked_category_id = 1; // 例：カテゴリーIDが15の場合

echo '<ul id="'.$tax_name.'checklist" data-wp-lists="list:.'.$tax_name.'" class="categorychecklist form-no-clear">';
  foreach( $terms as $term ){
  $id = "popular-$tax_name-$term->term_id";
  $selected = ''; // 初期化

  // 投稿に紐づいているカテゴリーがあればそのカテゴリーだけチェック
  if($selected_id) {
    if ($selected_id == $term->term_id) {
        $selected = 'checked="checked"';
    }
    // 投稿に紐づいているカテゴリーがない場合はあらかじめチェックを入れたいカテゴリーだけチェック
  } else {
    if($term->term_id == $pre_checked_category_id) {
      $selected = 'checked="checked"';
    }
  }
  // 上記いずれかの条件に合致した場合のみ $selected を上書きする

  echo '<li id="'.$id.'" class="popular-category">';
  echo '<label class="selectit">';
  echo '<input id="in-'.$id.'" type="radio" '.$selected.' value="'.(int) $term->term_id.'" name="tax_input['.$tax_name.'][]"/>';
  echo esc_html( apply_filters( 'the_category', $term->name, '', '' ) );
  echo '</label>';
  echo '</li>';
  }
echo '</ul>';
echo '</div>';
}
// --------------------------------------------------------------
// タグ選択をセレクトボックスに変更
// --------------------------------------------------------------
function meta_box_change_select( $post, $box ) {
  $defaults = array( 'taxonomy' => 'category' );
  if ( ! isset( $box['args'] ) || ! is_array( $box['args'] ) ) {
      $args = array();
  } else {
      $args = $box['args'];
  }
  $r = wp_parse_args( $args, $defaults );
  $tax_name = esc_attr( $r['taxonomy'] );
  $terms = get_terms( $tax_name, array( 'get' => 'all' , 'orderby' => 'id', 'order' => 'ASC' ) );    //並び順は自由に
  $select_terms = get_the_terms( $post->ID,$tax_name );

  // 選択されているタームを配列で取得
  $selected_values = array();
  if( $select_terms ){
      foreach( $select_terms as $select_term ) {
          // post_tagの場合はスラッグを、それ以外はIDを使用
          $selected_values[] = ( $tax_name === 'post_tag' ) ? $select_term->slug : $select_term->term_id;
      }
  }

  // post_tagの場合は複数選択可能に
  $multiple = ( $tax_name === 'post_tag' ) ? 'multiple' : '';
  $size = ( $tax_name === 'post_tag' ) ? 'size="10"' : '';

  echo '<select id="cat_name" name="tax_input['.$tax_name.'][]" '.$multiple.' '.$size.' style="width:100%;">';
  foreach( $terms as $term ){
      // post_tagの場合はスラッグを、それ以外はterm_idを使用
      $value = ( $tax_name === 'post_tag' ) ? $term->slug : $term->term_id;
      $selected = in_array( $value, $selected_values ) ? 'selected="selected"' : '';
      echo '<option value="'.$value.'" '.$selected.'>'.$term->name.'</option>';
  }
  echo '</select>';
}

/*-------------------------------------------*/
/* カスタムフィールドもプレビューできるようにする
/*-------------------------------------------*/
function get_preview_id($postId) {
  global $post;
  $previewId = 0;
  if ( isset($_GET['preview'])
          && ($post->ID == $postId)
              && $_GET['preview'] == true
                  &&  ($postId == url_to_postid($_SERVER['REQUEST_URI']))
      ) {
      $preview = wp_get_post_autosave($postId);
      if ($preview != false) { $previewId = $preview->ID; }
  }
  return $previewId;
}

add_filter('get_post_metadata', function($meta_value, $post_id, $meta_key, $single) {
  if ($preview_id = get_preview_id($post_id)) {
      if ($post_id != $preview_id) {
          $meta_value = get_post_meta($preview_id, $meta_key, $single);
      }
  }
  return $meta_value;
}, 10, 4);

add_action('wp_insert_post', function ($postId) {
  global $wpdb;
  if (wp_is_post_revision($postId)) {
      if (isset($_POST['fields']) && count($_POST['fields']) != 0) {
          foreach ($_POST['fields'] as $key => $value) {
              $field = get_field($key);
              if ( !isset($field['name']) || !isset($field['key']) ) continue;
              if (count(get_metadata('post', $postId, $field['name'], $value)) != 0) {
                  update_metadata('post', $postId, $field['name'], $value);
                  update_metadata('post', $postId, "_" . $field['name'], $field['key']);
              } else {
                  add_metadata('post', $postId, $field['name'], $value);
                  add_metadata('post', $postId, "_" . $field['name'], $field['key']);
              }
          }
      }
      do_action('save_preview_postmeta', $postId);
  }
});

/*-------------------------------------------*/
/* 拡張エディターにクラスを追加する
/*-------------------------------------------*/
if ( !function_exists( 'initialize_tinymce_styles' ) ){
function initialize_tinymce_styles($init_array) {
  //追加するスタイルの配列を作成
  $style_formats = array(
    array(
      'title' => 'ボタン',
      'selector' => 'a',
      'classes' => 'c_btn',
    ),
    array(
      'title' => 'PCのみ',
      'selector' => 'img',
      'classes' => 'pcOnly',
    ),
    array(
      'title' => 'SPのみ',
      'selector' => 'img',
      'classes' => 'spOnly',
    ),
    array(
      'title' => 'ボーダー',
      'selector' => 'table',
      'classes' => '-border',
    ),
  );
  //JSONに変換
  $init_array['style_formats'] = json_encode($style_formats);
  return $init_array;

}
add_filter('tiny_mce_before_init', 'initialize_tinymce_styles', 10000);
}

add_editor_style('editor-style.css');

// フォントサイズのセレクトボックスを追加
function customize_acf_wysiwyg_toolbar( $toolbars ) {
  if (($key = array_search('fontsizeselect' , $toolbars['Full'][2])) !== true) {
    array_push($toolbars['Full'][2], 'fontsizeselect');
  }
  return $toolbars;
}
add_filter('acf/fields/wysiwyg/toolbars' , 'customize_acf_wysiwyg_toolbar');

// フォントサイズの単位をpxに変更
if ( ! function_exists( 'wpex_mce_font_sizes' ) ) {
	function wpex_mce_font_sizes( $initArray ){
		$initArray['fontsize_formats'] = "10px 12px 13px 14px 16px 18px 20px 22px 24px 26px 28px 30px 32px 34px 36px 38px 40px 42px 44px 46px 48px 50px";
		return $initArray;
	}
}
add_filter( 'tiny_mce_before_init', 'wpex_mce_font_sizes' );

?>
