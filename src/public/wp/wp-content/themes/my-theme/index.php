<?php
/**
 * メインテンプレートファイル
 * 
 * @package MyTheme
 */

get_header(); ?>

<div class="container">
    <main id="main" class="site-main">
        
        <?php if (have_posts()) : ?>
            
            <?php while (have_posts()) : ?>
                <?php the_post(); ?>
                
                <article id="post-<?php the_ID(); ?>" <?php post_class(); ?>>
                    <header class="entry-header">
                        <h1 class="entry-title">
                            <a href="<?php the_permalink(); ?>" rel="bookmark">
                                <?php the_title(); ?>
                            </a>
                        </h1>
                        
                        <?php if (!is_page()) : ?>
                            <div class="entry-meta">
                                <time class="entry-date" datetime="<?php echo esc_attr(get_the_date('c')); ?>">
                                    <?php echo get_the_date(); ?>
                                </time>
                                <span class="byline">
                                    by <?php the_author(); ?>
                                </span>
                            </div>
                        <?php endif; ?>
                    </header>

                    <div class="entry-content">
                        <?php
                        if (is_singular()) {
                            the_content();
                        } else {
                            the_excerpt();
                        }
                        ?>
                    </div>

                    <?php if (!is_singular()) : ?>
                        <footer class="entry-footer">
                            <a href="<?php the_permalink(); ?>" class="read-more">
                                続きを読む
                            </a>
                        </footer>
                    <?php endif; ?>
                </article>
                
            <?php endwhile; ?>

            <?php
            // ページネーション
            the_posts_pagination(array(
                'prev_text' => '前のページ',
                'next_text' => '次のページ',
            ));
            ?>

        <?php else : ?>

            <article class="no-results">
                <header class="page-header">
                    <h1 class="page-title">記事が見つかりませんでした</h1>
                </header>

                <div class="page-content">
                    <p>お探しの記事は見つかりませんでした。検索をお試しください。</p>
                    <?php get_search_form(); ?>
                </div>
            </article>

        <?php endif; ?>

    </main>
</div>

<?php get_footer(); ?>