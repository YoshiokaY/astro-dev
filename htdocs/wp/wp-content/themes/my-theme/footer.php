<footer class="l_footer">
  <!-- メインフッターエリア -->
  <div class="footer-main">
    <div class="contentInner">
      <div class="footer-content">
        <!-- 会社情報 -->
        <div class="footer-section footer-company">
          <h2 class="footer-title">Astroサンプルサイト</h2>
          <p class="footer-description">
            モダンなWebサイト構築のためのデモンストレーションサイトです。Astroフレームワークを使用して作成されています。
          </p>
        </div>

        <!-- サイトリンク（ヘッダーと共有データ） -->
        <div class="footer-section footer-links">
          <h2 class="footer-title">サイトリンク</h2>
          <ul class="footer-list">
            <li class="footer-list-item">
                  <a href="/" class="footer-link">
                    ホーム
                  </a>
                </li><li class="footer-list-item">
                  <a href="/about/" class="footer-link">
                    概要
                  </a>
                </li><li class="footer-list-item">
                  <a href="/sample/" class="footer-link">
                    サンプル
                  </a>
                </li>
            <!-- 追加のフッター専用リンク -->
            <li class="footer-list-item">
              <a href="/privacy/" class="footer-link">プライバシーポリシー</a>
            </li>
          </ul>
        </div>

        <!-- 使用技術 -->
        <div class="footer-section footer-tech">
          <h2 class="footer-title">使用技術</h2>
          <ul class="footer-list">
            <li class="footer-list-item">
                  <span class="footer-tech-item">Astro</span>
                </li><li class="footer-list-item">
                  <span class="footer-tech-item">TypeScript</span>
                </li><li class="footer-list-item">
                  <span class="footer-tech-item">SCSS</span>
                </li><li class="footer-list-item">
                  <span class="footer-tech-item">Tailwind CSS</span>
                </li>
          </ul>
        </div>
      </div>
    </div>
  </div>

  <!-- コピーライトエリア -->
  <div class="footer-copyright">
    <div class="contentInner">
      <p class="copyright-text">
        &copy; 2025
        Sample Site. All rights reserved.
      </p>
    </div>
  </div>

  <!-- ページトップへ戻るボタン -->
  <a href="#" class="page_top" aria-label="ページトップへ戻る">
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 4L4 12L5.41 13.41L11 7.83V20H13V7.83L18.59 13.41L20 12L12 4Z" fill="currentColor"></path>
    </svg>
  </a>
</footer>
<?php wp_footer(); ?>
</body>
</html>