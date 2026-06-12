<?php get_header(); ?>

<main id="main"> 
  <div class="bg-prime"> <div class="contentInner"> <h1 class="c_ttl_lower">ニュース</h1> </div> </div>
  <div class="contentInner"> <nav class="breadcrumbs" aria-label="パンくずリスト"> <ol> <li> <a href="/">ホーム</a> </li><li> <span aria-current="page">ニュース</span> </li> </ol> </nav> <div class="p_news_archive"> <ul class="article_list"> <li class="article_item"> <a href="/news/001/"> <article class="article_card"> <div class="card_img"> <img src="<?= get_template_directory_uri() ?>/_assets/img/sample/sample_001.png.webp" alt="Astroのロゴとコード画面" width="800" height="450" loading="lazy" decoding="async" fetchpriority="auto"> </div> <div class="card_body"> <div class="card_header"> <span class="card_category">お知らせ</span> <time datetime="2025-09-28">2025-09-28</time> </div> <h2 class="card_ttl">Astroで始める高速サイト構築</h2> <p class="card_desc"></p> </div> </article> </a> </li> </ul> <nav class="c_pager" aria-label="ページ送り"> <ol class="c_pager_list"> <li class="c_pager_list-item -current"> <span aria-current="page" aria-label="1ページ目">1</span> </li> <li class="c_pager_list-item"> <a href="/news/page/2/" aria-label="2ページ目">2</a> </li> <li class="c_pager_list-item -next"> <a href="/news/page/2/"> <span aria-label="次のページを表示する">next</span> </a> </li> <li class="c_pager_list-item -last"> <a href="/news/page/2/" aria-label="最後のページを表示する">最後</a> </li> </ol> </nav> </div> </div>
 </main>

<?php get_footer(); ?>
