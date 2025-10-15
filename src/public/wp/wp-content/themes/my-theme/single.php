<?php
/**
 * 投稿詳細ページテンプレート
 * 
 * @package MyTheme
 */

get_header(); ?>

<div class="container">
    <main id="main" class="site-main">
        
        <?php while (have_posts()) : ?>
            <?php the_post(); ?>

            <article id="post-<?php the_ID(); ?>" <?php post_class(); ?>>
                <header class="entry-header">
                    <?php the_title('<h1 class="entry-title">', '</h1>'); ?>
                    
                    <div class="entry-meta">
                        <time class="entry-date" datetime="<?php echo esc_attr(get_the_date('c')); ?>">
                            <?php echo get_the_date(); ?>
                        </time>
                        <span class="byline">
                            by <?php the_author(); ?>
                        </span>
                        <?php if (has_category()) : ?>
                            <span class="cat-links">
                                <?php echo get_the_category_list(', '); ?>
                            </span>
                        <?php endif; ?>
                    </div>
                </header>

                <?php if (has_post_thumbnail()) : ?>
                    <div class="post-thumbnail">
                        <?php the_post_thumbnail('featured-large'); ?>
                    </div>
                <?php endif; ?>

                <div class="entry-content">
                    <?php
                    the_content();
                    
                    wp_link_pages(array(
                        'before' => '<div class="page-links">' . esc_html__('Pages:', 'my-theme'),
                        'after'  => '</div>',
                    ));
                    ?>
                </div>

                <footer class="entry-footer">
                    <?php if (has_tag()) : ?>
                        <div class="tag-links">
                            <strong><?php esc_html_e('Tags:', 'my-theme'); ?></strong>
                            <?php echo get_the_tag_list('', ', '); ?>
                        </div>
                    <?php endif; ?>
                    
                    <?php
                    edit_post_link(
                        sprintf(
                            wp_kses(
                                __('Edit <span class="screen-reader-text">%s</span>', 'my-theme'),
                                array(
                                    'span' => array(
                                        'class' => array(),
                                    ),
                                )
                            ),
                            get_the_title()
                        ),
                        '<span class="edit-link">',
                        '</span>'
                    );
                    ?>
                </footer>
            </article>

            <?php
            // 前後の投稿ナビゲーション
            the_post_navigation(array(
                'prev_text' => '<span class="nav-subtitle">' . esc_html__('Previous:', 'my-theme') . '</span> <span class="nav-title">%title</span>',
                'next_text' => '<span class="nav-subtitle">' . esc_html__('Next:', 'my-theme') . '</span> <span class="nav-title">%title</span>',
            ));
            ?>

        <?php endwhile; ?>

    </main>
</div>

<?php get_footer(); ?>