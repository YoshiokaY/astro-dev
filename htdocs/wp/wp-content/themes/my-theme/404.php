<?php
/**
 * 404エラーページテンプレート
 * 
 * @package MyTheme
 */

get_header(); ?>

<div class="container">
    <main id="main" class="site-main">
        
        <section class="error-404 not-found">
            <header class="page-header">
                <h1 class="page-title"><?php esc_html_e('Oops! That page can&rsquo;t be found.', 'my-theme'); ?></h1>
            </header>

            <div class="page-content">
                <div class="error-message">
                    <h2>404 - ページが見つかりません</h2>
                    <p><?php esc_html_e('It looks like nothing was found at this location. Maybe try one of the links below or a search?', 'my-theme'); ?></p>
                    <p>お探しのページは存在しないか、移動または削除された可能性があります。</p>
                </div>

                <!-- 検索フォーム -->
                <div class="search-section">
                    <h3>サイト内検索</h3>
                    <?php get_search_form(); ?>
                </div>

                <!-- 最新の投稿 -->
                <?php
                $recent_posts = new WP_Query(array(
                    'post_type' => 'post',
                    'posts_per_page' => 5,
                    'post_status' => 'publish',
                ));
                
                if ($recent_posts->have_posts()) : ?>
                    <div class="recent-posts">
                        <h3>最新の投稿</h3>
                        <ul>
                            <?php while ($recent_posts->have_posts()) : ?>
                                <?php $recent_posts->the_post(); ?>
                                <li>
                                    <a href="<?php the_permalink(); ?>">
                                        <?php the_title(); ?>
                                    </a>
                                    <time datetime="<?php echo esc_attr(get_the_date('c')); ?>">
                                        - <?php echo get_the_date(); ?>
                                    </time>
                                </li>
                            <?php endwhile; ?>
                        </ul>
                        <?php wp_reset_postdata(); ?>
                    </div>
                <?php endif; ?>

                <!-- カテゴリー一覧 -->
                <?php
                $categories = get_categories(array(
                    'orderby' => 'count',
                    'order'   => 'DESC',
                    'number'  => 10,
                    'hide_empty' => true,
                ));
                
                if ($categories) : ?>
                    <div class="categories-list">
                        <h3>カテゴリー</h3>
                        <ul>
                            <?php foreach ($categories as $category) : ?>
                                <li>
                                    <a href="<?php echo esc_url(get_category_link($category->term_id)); ?>">
                                        <?php echo esc_html($category->name); ?>
                                        <span class="post-count">(<?php echo $category->count; ?>)</span>
                                    </a>
                                </li>
                            <?php endforeach; ?>
                        </ul>
                    </div>
                <?php endif; ?>

                <!-- 固定ページ一覧 -->
                <?php
                $pages = get_pages(array(
                    'sort_order' => 'ASC',
                    'sort_column' => 'menu_order',
                    'number' => 10,
                ));
                
                if ($pages) : ?>
                    <div class="pages-list">
                        <h3>主要ページ</h3>
                        <ul>
                            <?php foreach ($pages as $page) : ?>
                                <li>
                                    <a href="<?php echo esc_url(get_permalink($page->ID)); ?>">
                                        <?php echo esc_html($page->post_title); ?>
                                    </a>
                                </li>
                            <?php endforeach; ?>
                        </ul>
                    </div>
                <?php endif; ?>

                <!-- アーカイブリンク -->
                <div class="archive-links">
                    <h3>アーカイブ</h3>
                    <ul>
                        <li><a href="<?php echo esc_url(home_url('/')); ?>">ホームページ</a></li>
                        <?php if (get_option('page_for_posts')) : ?>
                            <li><a href="<?php echo esc_url(get_permalink(get_option('page_for_posts'))); ?>">ブログ</a></li>
                        <?php endif; ?>
                        <li><a href="<?php echo esc_url(get_month_link(date('Y'), date('n'))); ?>">今月の投稿</a></li>
                        <li><a href="<?php echo esc_url(get_year_link(date('Y'))); ?>">今年の投稿</a></li>
                    </ul>
                </div>

                <!-- ホームに戻るボタン -->
                <div class="back-home">
                    <a href="<?php echo esc_url(home_url('/')); ?>" class="button">
                        ホームページに戻る
                    </a>
                </div>

            </div>
        </section>

    </main>
</div>

<?php get_footer(); ?>