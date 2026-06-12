<?php
// *** フォーム ***
// --------------------------------------------------------------
// Contact Form 7で自動挿入されるPタグ、brタグを削除
// --------------------------------------------------------------
// add_filter('wpcf7_autop_or_not', 'wpcf7_autop_return_false');
// function wpcf7_autop_return_false() {
//   return false;
// }

// --------------------------------------------------------------
// Contact Form 7を不要なページで読み込ませない
// --------------------------------------------------------------
// function my_wpcf7_enqueue_scripts() {
// 	global $post;

// 	$has_cf7_posts = [8, 14]; // フォームを設置したページのIDを配列にする

// 	if ( is_singular() && false !== array_search( $post->ID, $has_cf7_posts ) ) {
// 		return;
// 	}

// 	wp_dequeue_style( 'contact-form-7' );
// 	wp_deregister_script( 'contact-form-7' );
// 	wp_deregister_script( 'google-recaptcha' );

// }
// add_action( 'wp_enqueue_scripts', 'my_wpcf7_enqueue_scripts', 100 );
?>
