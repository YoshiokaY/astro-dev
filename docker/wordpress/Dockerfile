FROM wordpress:latest
LABEL maintainer yt

# 必要なツール郡をインストール
RUN apt-get update
RUN apt-get -y install wget unzip

# WP プラグイン (zip) ダウンロード
WORKDIR /tmp/wp-plugins
RUN wget https://downloads.wordpress.org/plugin/wp-multibyte-patch.zip
RUN wget https://downloads.wordpress.org/plugin/classic-editor.zip
RUN wget https://downloads.wordpress.org/plugin/all-in-one-wp-migration.zip

# docker/wordpress/pluginからコピー
ADD ./plugin/all-in-one-wp-migration-file-extension.zip /tmp/wp-plugins

# Zip ファイルを解凍してインストール
RUN unzip './*.zip' -d /usr/src/wordpress/wp-content/plugins

# 不要になった一時ファイルを削除
RUN apt-get clean
RUN rm -rf /tmp/*

# サーバが読めるように wp-content 以下の所有者を変更
RUN chown -R www-data:www-data /usr/src/wordpress/wp-content
