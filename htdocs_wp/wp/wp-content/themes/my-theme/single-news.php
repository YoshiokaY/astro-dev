<?php get_header(); ?>

<main id="main">  <div class="contentInner"> <article class="p_news"> <nav class="breadcrumbs" aria-label="パンくずリスト"> <ol> <li> <a href="/">ホーム</a> </li><li> <a href="/sample/">ニュース</a> </li><li> <span aria-current="page">Astroで始める高速サイト構築</span> </li> </ol> </nav> <header class="news_header"> <div class="news_meta"> <time datetime="2025-09-28">2025年9月28日</time> <span class="news_category">お知らせ</span> </div> <h1 class="news_ttl">Astroで始める高速サイト構築</h1> </header> <figure class="news_thumbnail"> <img src="<?= get_template_directory_uri() ?>/_assets/img/sample/sample_001.png" alt="Astroのロゴとコード画面" loading="eager"> </figure> <div class="news_body"><p>Astroは、高速な静的サイトを構築するための最新のWebフレームワークです。</p>
<h2>Astroの特徴</h2><p>デフォルトでJavaScriptを最小限に抑え、必要な部分にのみJavaScriptを使用することで、優れたパフォーマンスを実現します。</p>
<h2>開発体験</h2><p>コンポーネントベースの開発をサポートし、React、Vue、Svelteなど様々なフレームワークのコンポーネントを混在させることができます。</p></div> </article> </div>  </main>

<?php get_footer(); ?>
