<?php
/**
 * デプロイフック
 *
 * 投稿・固定ページの公開/更新時に GitHub Actions のビルド＆デプロイを起動する。
 * （スターサーバーは Cloudflare のIP帯を遮断するため、ビルドは GitHub Actions で実行）
 *
 * 事前準備: wp-config.php に Fine-grained PAT（対象リポジトリの Contents: Read and write 権限）を定義する
 *   define('GITHUB_DEPLOY_TOKEN', 'github_pat_xxxxx');
 *
 * @package MyTheme
 */

// 直接アクセスを防ぐ
if (!defined('ABSPATH')) {
    exit;
}

// デプロイ対象のリポジトリ（owner/repo）
const MY_THEME_DEPLOY_REPO = '';

/**
 * 公開状態が絡む投稿・固定ページの変更で GitHub repository_dispatch を送信
 *
 * 公開・更新・非公開化・削除（publish が絡む遷移）で起動し、
 * 下書き保存やリビジョンでは起動しない。
 * 連続更新時の多重起動は GitHub Actions 側の concurrency 設定で吸収される。
 */
function my_theme_trigger_deploy($new_status, $old_status, $post) {
    if (!in_array($post->post_type, array('post', 'page'), true)) {
        return;
    }
    if ($new_status !== 'publish' && $old_status !== 'publish') {
        return;
    }
    if (!defined('GITHUB_DEPLOY_TOKEN') || GITHUB_DEPLOY_TOKEN === '') {
        error_log('[deploy-hook] GITHUB_DEPLOY_TOKEN が wp-config.php に定義されていません');
        return;
    }

    $response = wp_remote_post(
        'https://api.github.com/repos/' . MY_THEME_DEPLOY_REPO . '/dispatches',
        array(
            'timeout' => 15,
            'headers' => array(
                'Accept'               => 'application/vnd.github+json',
                'Authorization'        => 'Bearer ' . GITHUB_DEPLOY_TOKEN,
                'X-GitHub-Api-Version' => '2022-11-28',
                'Content-Type'         => 'application/json',
            ),
            // repository_dispatch は event_type 以外の余計なキーを許可しない厳密形式
            'body' => wp_json_encode(array(
                'event_type'     => 'wp-update',
                'client_payload' => array(
                    'post_type' => $post->post_type,
                    'slug'      => $post->post_name,
                ),
            )),
        )
    );

    if (is_wp_error($response)) {
        error_log('[deploy-hook] GitHub dispatch 失敗: ' . $response->get_error_message());
        return;
    }

    $code = wp_remote_retrieve_response_code($response);
    if ($code !== 204) {
        error_log('[deploy-hook] GitHub dispatch HTTP ' . $code . ': ' . wp_remote_retrieve_body($response));
    }
}
add_action('transition_post_status', 'my_theme_trigger_deploy', 10, 3);
