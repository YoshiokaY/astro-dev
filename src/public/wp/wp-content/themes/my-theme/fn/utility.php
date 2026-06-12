<?php
// *** 関数 ***

// --------------------------------------------------------------
// bodyにスラッグ名クラスを追加（class="p-スラッグ名"）
// --------------------------------------------------------------
function pagename_class($classes) {
  if (is_front_page()) {
    $classes[] = 'page-top';
  }
  elseif (is_page()) { //slugを追加
    $page = get_post(get_the_ID());
    $classes[] = 'page-'.$page->post_name;
  }
  elseif (is_single()) { //slugを追加
    global $post;
    $classes[] .= 'page-single';
  }
  // elseif (is_post_type_archive()) { //slugを追加
  //   global $post;
  //   if($post->post_type){
  //     $classes[] .= 'page-'.$post->post_type;
  //   }
  // }
  elseif (is_search()) {
    $classes[] = 'page-search';
  }
  elseif (is_404()) {
    $classes[] = 'page-notfound';
  }
  if (wp_is_mobile()) {
    $classes[] .= 'mobile'; //mobileの場合classを追加
  }
  //$classes[] .= '任意のクラス名'; //その他必要なクラス名があれば追加
  return $classes;
}
add_filter('body_class','pagename_class');

// --------------------------------------------------------------
// 画像の幅&高さを取得する
// --------------------------------------------------------------
function get_image_size($image_url){
  $res = null;
  $wp_content_dir = WP_CONTENT_DIR;
  $wp_content_url = content_url();
  $image_file = str_replace($wp_content_url, $wp_content_dir, $image_url);
  // 画像サイズを取得
  $imagesize = getimagesize($image_file);
  if ($imagesize) {
    $res = array();
    $res = "width=".$imagesize[0]." height=".$imagesize[1];
    // $res['width'] = $imagesize[0];
    // $res['height'] = $imagesize[1];
    return $res;
  }
}

// --------------------------------------------------------------
// 親ページのIDを取得する
// --------------------------------------------------------------
function get_page_parent( $parent_id , $object = true , $root = true ) {
  // parent_idが0の場合何もしない
  if( $parent_id == false ) {
    return false;
  }

  if( $object == true ) { // 返り値がpostオブジェクト
    while( $parent_id ) {
      $page = get_post( $parent_id );
      $result[] = $page;
      $parent_id = $page->post_parent;
    }
  }
  else { // 返り値がpostID
    while( $parent_id ) {
      $page_id = get_post_field( 'post_parent' , $parent_id );
      $result[] = $parent_id;
      $parent_id = $page_id;
    }
  }
  // 配列を逆順に(rootを0に)
  $result = array_reverse( $result );

  // rootがtureの場合0番目(rootページのみ)をセット
  if( $root == true) {
    $result = $result[0];
  }
  return $result;
}


?>
