/**
 * テスト設定ファイル
 * PlaywrightとLighthouse CIで共通のURLを管理
 */

/**
 * テスト対象のページURLリスト
 * 新しいページを追加した場合はここに追加してください
 */
export const TEST_PAGES = [
	{
		name: 'トップページ',
		path: '/',
	},
	{
		name: '概要ページ',
		path: '/about/',
	},
	{
		name: 'サンプルページ',
		path: '/sample/',
	},
];

/**
 * 開発サーバーのベースURL
 */
export const DEV_BASE_URL = 'http://localhost:3000';

/**
 * プレビューサーバーのベースURL
 */
export const PREVIEW_BASE_URL = 'http://localhost:4321';

/**
 * Lighthouse用の静的ファイルディレクトリ
 */
export const STATIC_DIST_DIR = './htdocs';
