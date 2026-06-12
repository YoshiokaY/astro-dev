<?php
// *** メニュー ***

// --------------------------------------------------------------
// メニューの登録
// --------------------------------------------------------------
function my_menu_init() {
  register_nav_menus( array(
    'globalNavi'  => 'ヘッダーメニュー',
    'footNavi'  => 'フッターメニュー',
  ) );
}
add_action( 'init', 'my_menu_init' );

// --------------------------------------------------------------
// メニュー設定（自動付加される不要なクラスやIDを削除）
// --------------------------------------------------------------
function my_nav_menu_id( $menu_id ){
  // liタグのidを削除
  $id = NULL;
  return $id;
}
add_filter( 'nav_menu_item_id', 'my_nav_menu_id' );

function my_nav_menu_class( $classes, $item ) {
  // 管理画面からメニューにclassを設定した場合
  if( isset($classes[0]) ) {
    // 管理画面から設定したclass以外を削除
    array_splice( $classes, 1 );
  }
  else {
    // 上記以外の場合は、すべてのclassを削除
    $classes = [];
  }
  // 現在のページのliタグの場合
  if( $item -> current == true ) {
    // classの値に-currentを付与
    $classes[] = '-current';
  }
  return $classes;
}
add_filter( 'nav_menu_css_class', 'my_nav_menu_class', 10, 2 );
?>
