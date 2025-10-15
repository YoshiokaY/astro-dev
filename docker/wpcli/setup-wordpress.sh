#!/bin/bash
# ===========================================
# docker/wpcli/setup-wordpress.sh - WordPress初期設定
# ===========================================

set -e  # エラー時に停止

echo "🔧 WordPress初期設定を開始..."

# 環境変数の設定
DB_NAME=${WORDPRESS_DB_NAME:-wordpress}
DB_USER=${WORDPRESS_DB_USER:-wpuser}
DB_PASS=${WORDPRESS_DB_PASSWORD:-wppassword}
DB_HOST=${WORDPRESS_DB_HOST:-db:3306}

ADMIN_USER=${WORDPRESS_ADMIN_USER:-admin}
ADMIN_PASS=${WORDPRESS_ADMIN_PASSWORD:-admin123}
ADMIN_EMAIL=${WORDPRESS_ADMIN_EMAIL:-admin@example.com}

SITE_URL=${SITE_URL:-http://localhost:8080}
SITE_TITLE=${SITE_NAME:-Astro WordPress Development}

# データベース接続を待つ
echo "⏳ データベースの準備を待っています..."
until wp db check --quiet --skip-ssl; do
    echo "データベースに接続できません。再試行します..."
    sleep 5
done
echo "✅ データベースに接続できました"

# WordPressがインストール済みかチェック
if wp core is-installed; then
    echo "✅ WordPressは既にインストール済みです"
else
    echo "📦 WordPressをインストール中..."

    # wp-config.phpが既に存在する場合はスキップ
    if [ ! -f "wp-config.php" ]; then
        echo "wp-config.phpを作成中..."
        wp config create \
            --dbname=$DB_NAME \
            --dbuser=$DB_USER \
            --dbpass=$DB_PASS \
            --dbhost=$DB_HOST \
            --force
    else
        echo "wp-config.phpは既に存在します"
    fi

    # WordPress本体インストール
    wp core install \
        --url=$SITE_URL \
        --title="$SITE_TITLE" \
        --admin_user=$ADMIN_USER \
        --admin_password=$ADMIN_PASS \
        --admin_email=$ADMIN_EMAIL \
        --skip-email

    echo "✅ WordPressのインストールが完了しました"
fi

# 開発用設定
echo "🔧 開発用設定を適用中..."

# 言語設定（日本語）
wp language core install ja
wp language core activate ja

# デバッグモード有効化
wp config set WP_DEBUG true --raw
wp config set WP_DEBUG_LOG true --raw
wp config set WP_DEBUG_DISPLAY false --raw
wp config set SCRIPT_DEBUG true --raw

# 日本語用タイムゾーン設定
wp option update timezone_string 'Asia/Tokyo'
wp option update date_format 'Y年n月j日'
wp option update time_format 'H:i'

# 検索エンジンでの表示を無効化（開発環境用）
wp option update blog_public 0
echo "🔒 検索エンジンのインデックスを無効化しました"

# サムネイルの実寸法切り抜きを無効化
wp option update thumbnail_crop 0
echo "🖼️ サムネイルの実寸法切り抜きを無効化しました"

# メディアの中サイズを無効化
wp option update medium_size_w 0
wp option update medium_size_h 0
echo "📐 メディアの中サイズを無効化しました"

# サムネイルサイズと大サイズの高さを制限なしに設定
wp option update thumbnail_size_h 0
wp option update large_size_h 0
echo "📏 サムネイルサイズと大サイズの高さ制限を無効化しました"

# コメント機能とアバター表示を無効化
wp option update default_comment_status closed
wp option update show_avatars 0
echo "💬 新しい投稿へのコメント許可とアバター表示を無効化しました"

# 不要なプラグインを削除
wp plugin delete hello akismet || echo "プラグイン削除スキップ"

# 不要なテーマを削除（デフォルトテーマを残す）
wp theme delete twentytwentyone twentytwentytwo || echo "テーマ削除スキップ"

# URL設定（サブディレクトリ構成対応）
echo "🔧 URL設定を適用中..."
wp option update siteurl "${SITE_URL}/wp"  # WordPress本体のURL
wp option update home "${SITE_URL}"        # サイトのホームURL

# パーマリンク設定
wp rewrite structure '/%category%/%postname%/'
wp rewrite flush

# サンプルコンテンツ削除
wp post delete 1 --force  # Hello World!
wp post delete 2 --force  # Sample Page

echo "✅ WordPress初期設定が完了しました"

echo ""
echo "🌐 アクセス情報:"
echo "  WordPress: $SITE_URL"
echo "  管理画面: $SITE_URL/wp-admin"
echo "  ユーザー名: $ADMIN_USER"
echo "  パスワード: $ADMIN_PASS"

# ===========================================
# docker/wpcli/install-plugins.sh - プラグインインストール
# ===========================================

#!/bin/bash
echo "🔌 おすすめプラグインをインストール中..."

# 開発に便利なプラグイン
PLUGINS=(
    "query-monitor"           # デバッグツール
    "show-current-template"   # 現在のテンプレート表示
    "duplicate-post"          # 投稿複製
    "advanced-custom-fields"  # カスタムフィールド
    "wp-multibyte-patch"      # 日本語対応強化
    "wpvivid-backuprestore"   # WPvivid バックアップ・復元
    "all-in-one-seo-pack"     # All in One SEO
    "autoptimize"             # キャッシュ
    "ewww-image-optimizer"    # 画像軽量化
    "siteguard"               # SiteGuard WP Plugin
)

# インストールのみ行うプラグイン（有効化はスキップ）
INSTALL_ONLY_PLUGINS=("autoptimize" "all-in-one-seo-pack" "ewww-image-optimizer" "siteguard")

for plugin in "${PLUGINS[@]}"; do
    if wp plugin is-installed $plugin; then
        echo "✓ $plugin は既にインストール済み"

        # インストールのみプラグインは有効化をスキップ
        if [[ " ${INSTALL_ONLY_PLUGINS[@]} " =~ " ${plugin} " ]]; then
            echo "  → $plugin は有効化をスキップします"
        else
            wp plugin activate $plugin
        fi
    else
        echo "📦 $plugin をインストール中..."

        # インストールのみプラグインは--activateなしでインストール
        if [[ " ${INSTALL_ONLY_PLUGINS[@]} " =~ " ${plugin} " ]]; then
            wp plugin install $plugin
            echo "  → $plugin はインストールのみ完了（有効化スキップ）"
        else
            wp plugin install $plugin --activate
        fi
    fi
done

echo "✅ プラグインのインストールが完了しました"

# ===========================================
# docker/wpcli/create-sample-content.sh - サンプルコンテンツ作成
# ===========================================

#!/bin/bash
echo "📝 サンプルコンテンツを作成中..."

# ホームページを固定で作成
wp post create \
    --post_type=page \
    --post_title="ホーム" \
    --post_content="" \
    --post_name="home" \
    --post_status=publish

# htdocs直下のHTMLファイルから動的にページを作成
echo "📄 $STATIC_OUTPUT_DIR直下のHTMLファイルを解析してページを作成中..."

THEME_PATH=${THEME_PATH:-wp/wp-content/themes}
STATIC_OUTPUT_DIR=${STATIC_OUTPUT_DIR:-htdocs}
HTDOCS_DIR="/var/www/html/static"
if [ -d "$HTDOCS_DIR" ]; then
    # サブディレクトリ内のindex.htmlファイルを処理
    for dir in "$HTDOCS_DIR"/*/; do
        # ディレクトリが存在する場合のみ処理
        if [ -d "$dir" ]; then
            # ディレクトリ名からslugを取得
            slug=$(basename "$dir")
            
            # 各ディレクトリのindex.htmlファイルを確認
            html_file="$dir/index.html"
            
            if [ -f "$html_file" ]; then
                # HTMLからh1タグの内容を抽出してタイトルとして使用
                title=$(grep -o '<h1[^>]*>[^<]*</h1>' "$html_file" | sed -e 's/<h1[^>]*>//' -e 's/<\/h1>//' | head -1)
                
                # h1が見つからない場合はslugをタイトルとして使用
                if [ -z "$title" ]; then
                    title="$slug"
                fi
                
                echo "📝 ページを作成中: $title (slug: $slug)"
                
                # WordPressページを作成
                wp post create \
                    --post_type=page \
                    --post_title="$title" \
                    --post_content="" \
                    --post_name="$slug" \
                    --post_status=publish
            else
                echo "⚠️ $dir/index.html が見つかりません。スキップします。"
            fi
        fi
    done
    echo "✅ $STATIC_OUTPUT_DIR配下のディレクトリからのページ作成が完了しました"
else
    echo "⚠️ $STATIC_OUTPUT_DIRディレクトリが見つかりません。手動でページを作成します。"

    # フォールバック: 手動でサンプルページを作成
    wp post create \
        --post_type=page \
        --post_title="会社概要" \
        --post_content="" \
        --post_name="about" \
        --post_status=publish

    wp post create \
        --post_type=page \
        --post_title="お問い合わせ" \
        --post_content="" \
        --post_name="contact" \
        --post_status=publish
fi

# サンプル投稿作成
wp post create \
    --post_title="最初のブログ投稿" \
    --post_content="<h1>ブログを始めました</h1><p>このブログでは開発に関する情報を発信していきます。</p>" \
    --post_status=publish \
    --post_category=1

echo "🏠 ホームページ表示設定を適用中..."

# スラッグ名で確実に検索（より正確）
HOME_PAGE_ID=$(wp post list --post_type=page --field=ID --name="home" --posts_per_page=1 2>/dev/null | head -1)

if [ ! -z "$HOME_PAGE_ID" ] && [ "$HOME_PAGE_ID" != "" ] && [ "$HOME_PAGE_ID" -gt 0 ] 2>/dev/null; then
    wp option update show_on_front page
    wp option update page_on_front "$HOME_PAGE_ID"
    echo "✅ ホームページ表示設定が完了しました（ページID: $HOME_PAGE_ID）"

    # 確認用
    CURRENT_FRONT_PAGE=$(wp option get page_on_front)
    echo "📋 現在のホームページID: $CURRENT_FRONT_PAGE"
else
    echo "⚠️ ホームページ（スラッグ: home）が見つかりませんでした"
    echo "📝 利用可能なページ一覧:"
    wp post list --post_type=page --format=table --fields=ID,post_title,post_name
fi

echo "✅ サンプルコンテンツの作成が完了しました"

# ===========================================
# docker/wpcli/activate-theme.sh - テーマ有効化
# ===========================================

#!/bin/bash
THEME_NAME="${VITE_THEME_NAME:-willient-theme}"  # 環境変数から取得（デフォルト値付き）

echo "🎨 テーマ有効化処理を開始..."

# テーマディレクトリの存在確認
if [ -d "/var/www/html/wp/wp-content/themes/$THEME_NAME" ]; then
    echo "✅ テーマディレクトリが存在します"
else
    echo "❌ テーマディレクトリが存在しません"
    echo "📝 利用可能なテーマ:"
    ls -la "/var/www/html/wp/wp-content/themes/"
    exit 1
fi

# デバッグ用ログ（問題発生時にコメントアウト解除）
# echo "📁 マウント状況の確認..."
# echo "  ホスト側のhtdocs:"
# ls -la "/var/www/html/"
# echo "  WordPressテーマディレクトリ:"
# ls -la "/var/www/html/wp/wp-content/themes/"
# echo "  テーマファイル一覧:"
# ls -la "/var/www/html/wp/wp-content/themes/$THEME_NAME/" | head -10

# style.cssの存在確認
if [ -f "/var/www/html/wp/wp-content/themes/$THEME_NAME/style.css" ]; then
    echo "✅ style.css が存在します"
else
    echo "❌ style.css が見つかりません"
    echo "🔄 テーマファイルを再同期します..."

    # ホストのファイルをコンテナ内にコピー（wpcliコンテナでは異なるマウントパス）
    if [ -d "/var/www/html/wp/wp-content/themes/$THEME_NAME" ] && [ "$(ls -A /var/www/html/wp/wp-content/themes/$THEME_NAME 2>/dev/null)" ]; then
        echo "📁 テーマファイルは既にマウントされています"

        # 再確認
        if [ -f "/var/www/html/wp/wp-content/themes/$THEME_NAME/style.css" ]; then
            echo "✅ テーマファイルのコピーが完了しました"
        else
            echo "❌ テーマファイルのコピーに失敗しました"
            echo "💡 手動で 'docker cp htdocs/wp/wp-content/themes/willient-theme/. [CONTAINER_ID]:/var/www/html/wp/wp-content/themes/willient-theme/' を実行してください"
            exit 1
        fi
    else
        echo "❌ ホスト側にもテーマファイルが見つかりません"
        echo "💡 'npm run build' を実行してテーマをビルドしてください"
        exit 1
    fi
fi

# デバッグ用ログ（問題発生時にコメントアウト解除）
# echo "📝 style.cssの内容:"
# head -3 "/var/www/html/wp/wp-content/themes/$THEME_NAME/style.css"

# テーマ有効化
if wp theme is-installed $THEME_NAME; then
    wp theme activate $THEME_NAME
    echo "✅ テーマ '$THEME_NAME' が有効化されました"
else
    echo "⚠️ テーマ '$THEME_NAME' がWordPressで認識されていません"
    echo "💡 利用可能なテーマ一覧:"
    wp theme list
    exit 1
fi

# デバッグ用ログ（問題発生時にコメントアウト解除）
# echo "🔍 WordPressでのテーマ認識状況:"
# wp theme list
# echo "📋 現在の有効テーマ確認:"
# ACTIVE_THEME=$(wp theme status | grep "Active theme" | awk '{print $3}')
# echo "📋 現在の有効テーマ: $ACTIVE_THEME"
