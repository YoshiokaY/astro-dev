<?php get_header(); ?>

<?php
  if (have_posts()) :
    while(have_posts()): the_post();
?>

<main id="main" aria-label="本文">
  
  <section class="p_sample_hero">
  <div class="contentInner">
    <div class="py-60">
      <h2 class="c_ttl">サンプルページ</h2>
      <div class="mt-20">
        <p>このページはAstro開発環境のサンプルページです。<br>ヘッダー、フッター、メインコンテンツのシンプルな構成で作成されています。</p><p>コンポーネント化とデータ駆動の開発手法のデモンストレーションも兼ねています。</p>
      </div>

      <div class="mt-40">
        <h2 class="text-h1 mb-16">機能紹介</h2>
        <ul class="grid gap-12">
          <li>✅ Astroによる高速な静的サイト生成</li><li>✅ TypeScriptサポート</li><li>✅ SCSS（Dart Sass）</li><li>✅ Tailwind CSSサポート</li><li>✅ WebP画像変換サポート</li><li>✅ コンポーネント化アーキテクチャ</li><li>✅ データ駆動開発</li>
        </ul>
      </div>

      <div class="mt-40">
        <h2 class="text-h1 mb-16">テキストサンプル</h2>
        <p class="text-base">
          あのイーハトーヴォのすきとおった風、夏でも底に冷たさをもつ青いそら、うつくしい森で飾られたモリーオ市、郊外のぎらぎらひかる草の波。また、その奥羽山脈の重畳たる稜線は、濃紫のなつかしい線となって、東北の空にひかえている。
        </p>
      </div>

      <div class="mt-40">
        <h2 class="text-h1 mb-16">Pictureコンポーネントデモ</h2>
        <p class="text-prime mb-24 text-base"><strong>Picture.astro</strong>コンポーネントの使用例です。<br>レスポンシブ対応と遅延読み込みに対応しています。</p>
        <div class="picture-demo-container">
          <img src="<?= get_template_directory_uri() ?>/_assets/img/top/sample.png.webp" alt="Astroサンプルサイトのデモ画像" width="800" height="600" class="picture-demo-image" loading="lazy" decoding="async">
        </div>
      </div>
    </div>
  </div>
</section>

</main>

<?php endwhile; endif; wp_reset_postdata(); ?>

<?php get_footer(); ?>