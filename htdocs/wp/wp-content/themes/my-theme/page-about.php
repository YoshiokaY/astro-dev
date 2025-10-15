<?php get_header(); ?>

<?php
  if (have_posts()) :
    while(have_posts()): the_post();
?>

<main id="main" aria-label="本文">
  
  <div class="contentInner">
    <div class="p_about">
      <section class="about-section">
  <h2 class="section-title">コンセプト</h2>
  <p class="section-description">このサイトは<strong>Astroフレームワーク</strong>を使用したモダンなWebサイト構築のデモンストレーションです。<br>高速で効率的な静的サイト生成とコンポーネントベースの開発を実現しています。</p>
</section>
      <section class="about-section">
  <h2 class="section-title">特徴</h2>
  <ul class="feature-list">
    <li class="feature-item"><strong>Astro</strong>による高速な静的サイト生成</li><li class="feature-item"><strong>TypeScript</strong>による型安全な開発</li><li class="feature-item"><strong>SCSS</strong>による効率的なスタイル管理</li><li class="feature-item">コンポーネントベースの<em>再利用可能</em>な設計</li><li class="feature-item"><strong>WebP画像変換</strong>による最適化</li><li class="feature-item"><em>アクセシビリティ</em>を重視した実装</li>
  </ul>
</section>
      <section class="about-section">
  <h2 class="section-title">技術スタック</h2>
  <p class="section-description">最新の<strong>Web技術</strong>を組み合わせて構築されています。</p>
  <div class="tech-grid">
    <div class="tech-card">
        <h3 class="tech-name">Astro</h3>
        <p class="tech-desc"><em>静的サイトジェネレーター</em></p>
      </div><div class="tech-card">
        <h3 class="tech-name">TypeScript</h3>
        <p class="tech-desc"><strong>型安全</strong>なJavaScript</p>
      </div><div class="tech-card">
        <h3 class="tech-name">SCSS</h3>
        <p class="tech-desc">CSS<em>拡張言語</em></p>
      </div><div class="tech-card">
        <h3 class="tech-name">Tailwind CSS</h3>
        <p class="tech-desc"><strong>ユーティリティファースト</strong>CSS</p>
      </div>
  </div>
</section>
    </div>
  </div>

</main>

<?php endwhile; endif; wp_reset_postdata(); ?>

<?php get_footer(); ?>