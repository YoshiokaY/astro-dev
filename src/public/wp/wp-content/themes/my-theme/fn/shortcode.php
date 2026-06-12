<?php
// *** ショートコード ***

// [url]・・・トップページのディレクトリ
function shortcode_url() {
  return get_bloginfo('url');
}
add_shortcode('url', 'shortcode_url');

// [temp]・・・テーマディレクトリ
function shortcode_templateurl() {
  return get_bloginfo('template_url');
}
add_shortcode('temp', 'shortcode_templateurl');

// [install]・・・インストールディレクトリ
function shortcode_installurl() {
  return site_url();
}
add_shortcode('install', 'shortcode_installurl');

// phpファイルの呼び出し
// [php file="xxxx"]     （xxxxのところに拡張子無しのphpファイル名を入力「/include/list.php」なら[php file="list"]）
function phpInclude($params = array()) {
  extract(shortcode_atts(array(
    'file' => 'default'
  ), $params));
  ob_start();
  include(get_theme_root() . '/' . get_template() . "/include/$file.php");
  return ob_get_clean();
}
add_shortcode('php', 'phpInclude');


//----------------------------------------------------------ケース記事一覧
// function getCaseArticles($atts) {
//   extract(shortcode_atts(array(
//       "num" => '3',     // 表示件数（デフォルト3件）
//       "term" => ''      // タームスラッグ（指定しない場合は全件）
//   ), $atts));

//   global $post;
//   $oldpost = $post;

//   // クエリ引数
//   $args = array(
//     'posts_per_page' => $num,
//     'orderby' => 'post_date',
//     'order' => 'DESC',
//     'post_type' => 'case',
//     'post_status' => 'publish',
//   );

//   // ターム指定がある場合
//   if (!empty($term)) {
//     $args['tax_query'] = array(
//       array(
//         'taxonomy' => 'case-category',
//         'field' => 'slug',
//         'terms' => $term,
//       ),
//     );
//   }

//   $the_query = new WP_Query($args);
//   $retHtml = '';

//   if($the_query->have_posts()) {
//     $retHtml .= '<div class="service_case">';
//     $retHtml .= '<h3 class="c_ttl_middle">';
//     $retHtml .= '<span class="c_ttl_middle-en scroll -clip">CASESTUDY</span>';
//     $retHtml .= '<span class="c_ttl_middle-jp scrollIn -up">事例紹介</span>';
//     $retHtml .= '</h3>';
//     $retHtml .= '<div class="grid md:grid-cols-3 md:gap-16 gap-17">';

//     while($the_query->have_posts()) {
//       $the_query->the_post();

//       $article_args = array(
//         'ttl' => array(
//           'tag' => 'h4',
//           'ttl' => esc_html(get_the_title()),
//         )
//       );

//       // articles.phpの内容を取得
//       ob_start();
//       get_template_part('include/articles', null, $article_args);
//       $retHtml .= ob_get_clean();
//     }

//     $retHtml .= '</div>';
//     $retHtml .= '</div><!-- /case -->';
//   }

//   $post = $oldpost;
//   wp_reset_postdata();
//   return $retHtml;
// }
// add_shortcode("case_articles", "getCaseArticles");

?>
